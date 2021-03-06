
var _menu = {
    init: function () {
        _menu.update();

        $('#menuButton').on('click', function() {
            if ($user.isLoged()) {
                $('#login').hide();
                $('#register').hide();
                $('#logout').show();
                $('#profile').show();

                $user.is_admin ? $('#del-term').show() : $('#del-term').hide();

                if ($user.is_subscribed) {
                    $('#subscribe').hide();
                    $('#unsubscribe').show();
                }
                else {
                    $('#subscribe').show();
                    $('#unsubscribe').hide();
                }
            }
            else {
                $('#login').show();
                $('#register').show();
                $('#logout').hide();
                $('#profile').hide();
                $('#del-term').hide();
                $('#subscribe').hide();
                $('#unsubscribe').hide();
            }
        });
    },

    update: function () {
        // Render the menu template.
        var menu_tmpl = $('#tmpl-menu').html();
        var data = {
            base_url: $config.base_url,
            lng: $config.lng,
            vocabulary: $config.vocabulary,
            webapp_url: $config.webapp_url,
            external_links: $config.external_links,
            'User': _('User'),
            'Sign in': _('Sign in'),
            'Sign out': _('Sign out'),
            'Sign up': _('Sign up'),
            'Subscribe': _('Subscribe'),
            'Unsubscribe': _('Unsubscribe'),
            'Profile': _('Profile'),
            'Settings': _('Settings'),
            'Contact': _('Contact'),
            'Links': _('Links'),
            'Project': _('Project'),
            'Delete': _('Delete'),
            'Details': _('Details'),
            'Dashboard': _('Dashboard'),
            'List': _('List'),
            'Download': _('Download'),
        };
        $("#popupMenu")
            .html(Mustache.render(menu_tmpl, data))
            .enhanceWithin().popup();

        _translate_in_context.apply();

        $('#login').on('click', function () {
            $user.login();
        });
        $('#logout').on('click', function () {
            $user.logout();
        });

        $('#subscribe').on('click', function () {
            $user.subscribe();
        });
        $('#unsubscribe').on('click', function () {
            $user.subscribe('unsubscribe');
        });

        // Close the menu when an item is clicked.
        $('#popupMenu li').on('click', function() {
            $('#popupMenu').popup('close');
        });

        // When the button del-term is clicked.
        $('#del-term').on('click', function () {
            var term = $('#search-term')[0].value;
            var message = 'You are deleting the term "' + term + '", its translations and the votes.'
            $user.confirm(message, function () {
                var sguid = Sha1.hash(term + $config.vocabulary);
                _term.del(sguid);
            });
        });
    },
};
