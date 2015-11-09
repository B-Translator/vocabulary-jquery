
/**
 * Create an object to manage the user and its state.
 */
var $user = new (function () {
    var that = this;

    /** The username of the currently signed-in user. */
    this.name = null;

    /** Set the name of the user and display it on the status. */
    var _setName = function (name, uid) {
        if (typeof(uid)==='undefined') uid = null;
        that.name = name;
        if (name) {
            $('#status-line').html('<strong>' + name + '</strong>').show();
            ga('create', $config.ga_id, 'auto', { 'userId': uid });
        }
        else {
            $('#status-line').hide().html('');
            $('#picture').hide().attr('src', '');
            ga('create', $config.ga_id, 'auto');
        }
    };

    /**
     * The callback function is called to open e new popup.
     * But first it makes sure that there are no other
     * open popups, because jQM cannot open more than one popup
     * at the same time.
     */
    var _openPopup = function (callback) {
        if ($(".ui-page-active .ui-popup-active").length == 0) {
            // Call the function that opens the popup.
            if ($.isFunction(callback)) {
                setTimeout(callback, 200);
            }
        }
        else {
            // Close any open popups and try again later.
            $('.ui-page-active .ui-popup-active [data-role="popup"]').popup('close');
            setTimeout(function () {
                _openPopup(callback);
            }, 100);
        }
    };

    /**
     * Get a username and password and pass them
     * to the given callback function.
     */
    var _getPassword = function (callback) {
        _openPopup(function () {
            // Display the login popup.
            var login_tmpl = $('#tmpl-login').html();
            var login_html = Mustache.render(login_tmpl, {
                base_url: $config.api_url,
                lng: $config.lng,
                vocabulary: $config.vocabulary,
                'Please sign in': _('Please sign in'),
                'Username': _('Username'),
                'Password': _('Password'),
                'Sign in': _('Sign in'),
                'Sign up': _('Sign up'),
            });
            $(login_html)
                .appendTo($.mobile.activePage)
                .toolbar();
            $("#popup-login")
                .popup()           // init popup
                .popup('open');    // open popup
            _translate_in_context.apply();

            // When the form is submitted, pass the username
            // and password to the callback function.
            $('#form-login').on('submit', function (event) {
                var username = $('#username')[0].value;
                var password = $('#password')[0].value;
                callback(username, password);
                $('#popup-login').popup('close');
            });
        });
    };

    /**
     * Open the given login_url on a new window and then call
     * the given callback function, passing to it the login_url
     * and the opened window as parameters.
     *
     * Sometimes browsers block new windows when the function
     * that is trying to open them does not originate from a
     * user event. This function checks whether the new window
     * was blocked, and if so solves the problem by asking the
     * user to request explicitly the login window.
     */
    var _openLoginWindow = function (login_url, callback, skip_checking) {
        var win = window.open(login_url);
        if (skip_checking) {
            callback(login_url, win);
            return;
        }

        try {
            win.focus();   // will through an error if window.open() is blocked
            callback(login_url, win);
        }
        catch (e) {
            _openPopup(function () {
                var login_tmpl = $('#tmpl-proxylogin').html();
                var login_html = Mustache.render(login_tmpl, {
                    base_url: $config.api_url,
                    lng: $config.lng,
                    vocabulary: $config.vocabulary,
                    'Please sign in': _('Please sign in'),
                    'Sign in': _('Sign in'),
                    'Sign up': _('Sign up'),
                });
                $(login_html)
                    .appendTo($.mobile.activePage)
                    .toolbar();
                $("#popup-proxylogin")
                    .popup()           // init popup
                    .popup('open');    // open popup
                _translate_in_context.apply();

                $('#open-proxy-login').on('click', function () {
                    $("#popup-proxylogin").popup('close');
                    _openLoginWindow(login_url, callback, true);
                });
            });
        }
    };

    this.token = new OAuth2.Token($config.oauth2);
    this.token.getPassword(_getPassword);
    this.token.openLoginWindow(_openLoginWindow);
    //this.token.erase();  //test
    //this.token.expire();  //test

    /** Return true if the cuurrent user is signed-in. */
    this.isLoged = function () {
        return this.name;
    };

    /** Reload the page. */
    var _reload = function () {
        location.href = location.href.replace(/(\?|#).*/, '');
        location.reload();
    };

    /** Function to login. */
    this.login = function () {
        if (this.isLoged())  return;
        this.token.get().done(_reload);
    };

    /** Function to logout. */
    this.logout = function () {
        _setName(null);
        this.token.erase();
        setTimeout(_reload, 1000);
    };

    this.subscribe = function (subs) {
        if (!subs)  subs = 'subscribe';

        var access_token = this.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                $user.subscribe(subs);
            });
            return;
        }

        $.ajax($config.api_url + '/api/project/' + subs, {
            type: 'POST',
            data: {
                origin: 'vocabulary',
                project: $config.vocabulary,
            },
            headers: { 'Authorization': 'Bearer ' + access_token },
        })
            .then(_reload);
    };

    // User permissions.
    this.is_subscribed = false;
    this.is_admin = false;
    this.is_moderator = false;

    // Check the current token and update the user name.
    var _update = function () {
        // Try to refresh the token using refresh_token.
        var _refresh = function () {
            _setName(null);
            that.token.get(false).done(_update)
                .fail(function () {
                    that.token.erase();
                });
        };

        // Check that the given token is valid,
        // then update the user name and user profile.
        var _check_token = function (access_token) {
            $.ajax($config.api_url + '/oauth2/tokens/' + access_token)
                .fail(_refresh)
                .done(function (response) {
                    _get_user_profile(access_token);
                });
        }

        // Get the user profile and save his permissions.
        var _get_user_profile = function (access_token) {
            $.ajax($config.api_url + '/oauth2/user/profile', {
                type: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                },
                dataType: 'json',
            })
                .done(function (response) {
                    _setName(response.name, response.uid);
                    var project = 'vocabulary/' + $config.vocabulary;
                    that.is_subscribed = ($.inArray(project, response.subscribed_projects) > -1);
                    that.is_moderator = (($.inArray(project, response.moderate_projects) > -1) || ($.inArray('btranslator-resolve', response.permissions) > -1));
                    that.is_admin = (($.inArray(project, response.admin_projects) > -1) || ($.inArray('btranslator-admin', response.permissions) > -1));
                    response.picture ?
                        $('#picture').attr('src', response.picture.url).show() :
                        $('#picture').hide();
                });
        }

        // The main code of _update() function.
        if (!that.token) {
            _setName(null);
            return;
        }
        var access_token = that.token.access_token();
        access_token ? _check_token(access_token) : _refresh();
    };
    
    $(document).on('pagecreate', '#vocabulary', function() {
        // Check the current token and update the status every few minutes. 
        _update();  setInterval(_update, 2*60*1000);  // check every 2 minutes
    });

    /**
     * Get a confirmation (true/false) from the user and pass it
     * as a parameter to the given callback function.
     */
    this.confirm = function (message, callback) {
        _openPopup(function () {
            // Display the confirm popup.
            var confirm_tmpl = $('#tmpl-confirm').html();
            var confirm_html = Mustache.render(confirm_tmpl, {
                message: message,
                'OK': _('OK'),
                'Cancel': _('Cancel'),
            });
            $(confirm_html)
                .appendTo($.mobile.activePage)
                .toolbar();
            $("#popup-confirm")
                .popup()           // init popup
                .popup('open');    // open popup
            _translate_in_context.apply();

            // When button OK is clicked call the callback
            // function and close the popup.
            $('#confirm-ok').on('click', function (event) {
                callback();
                $('#popup-confirm').popup('close');
            });
        });
    };
})();
