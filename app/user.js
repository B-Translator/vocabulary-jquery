
/**
 * Create an object that will manage the user and its state.
 */
var User = function () {
    var that = this;

    /** The username of the currently signed-in user. */
    this.name = null;

    /**
     * Get a username and password and pass them
     * to the given callback function.
     */
    var _getPassword = function (callback) {
        // Wait 1 sec so that any other popups are closed.
        setTimeout(function () {
            // Display the login template.
            var popup_html = $('#tmpl-login').html();
            $(popup_html)
                .appendTo($.mobile.activePage)
                .toolbar();
            $("#popup-login")
                .popup()           // init popup
                .popup('open');    // open popup

            // When the form is submitted, pass the username
            // and password to the callback function.
            $('#form-login').on('submit', function (event) {
                var username = $('#username')[0].value;
                var password = $('#password')[0].value;
                that.name = username;
                callback(username, password);
                $('#popup-login').popup('close');
                //return false;
            });
        }, 1000);
    };

    this.token = new OAuth2.Token($oauth2_settings);
    this.token.getPassword(_getPassword);
    //$this.token.erase();  //test
    //$this.token.expire();  //test

    /** Return true if the cuurrent user is signed-in. */
    this.isLoged = function () {
        return this.name;
    };

    this.login = function () {
        if (this.isLoged())  return;
        this.token.get().done(function ()  {
            location.reload();
        });
    };

    this.logout = function () {
        this.name = null;
        this.token.erase();
        setTimeout(function () {
            location.reload();
        }, 100);
    };

    // Check that the current token is still valid and update the user name.
    this.check = function () {
        var access_token = that.token.access_token();
        if (!access_token) {
            that.name = null;
            return;
        }
        // Verify the current access_token.
        $.ajax($base_url + '/oauth2/tokens/' + access_token)
            .done(function (response) {
                that.name = response.user_id;
            })
            .fail(function () {
                that.name = null;
            });
    };
    
    // Check that the user is still logged-in every few minutes. 
    this.check();
    setInterval(this.check, 10*1000);

};
var $user = new User();
