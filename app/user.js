
/**
 * Create an object that will manage the user and its state.
 */
var User = function () {
    var that = this;

    /** The username of the currently signed-in user. */
    this.name = null;

    /** Set the name of the user and display it on the status. */
    var _setName = function (name) {
        if (name) {
            that.name = name;
            $('#status').html(name).show();
        }
        else {
            that.name = null;
            $('#status').html('').hide();
        }
    };

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
                _setName(username);
                callback(username, password);
                $('#popup-login').popup('close');
            });
        }, 1000);
    };

    this.token = new OAuth2.Token($oauth2_settings);
    this.token.getPassword(_getPassword);
    //this.token.erase();  //test
    //this.token.expire();  //test

    /** Return true if the cuurrent user is signed-in. */
    this.isLoged = function () {
        return this.name;
    };

    /** Function to login. */
    this.login = function () {
        if (this.isLoged())  return;
        this.token.get().done(function ()  {
            location.reload();
        });
    };

    /** Function to logout. */
    this.logout = function () {
        _setName(null);
        this.token.erase();
        setTimeout(function () {
            location.reload();
        }, 100);
    };

    // Check the current token and update the user name.
    var _update = function () {
        var access_token = that.token.access_token();
        if (!access_token) {
            _setName(null);
            return;
        }
        // Verify the current access_token.
        $.ajax($base_url + '/oauth2/tokens/' + access_token)
            .done(function (response) {
                _setName(response.user_id);
            })
            .fail(function () {
                _setName(null);
            });
    };
    
    $(document).on('pagecreate', '#vocabulary', function() {
        // Check the current token and update the status every few minutes. 
        _update();  setInterval(_update, 2*60*1000);  // check every 2 minutes
    });
};
var $user = new User();
