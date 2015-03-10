
var _menu = {
    init: function () {
        _menu.update();

        $('#menuButton').on('click', function() {
            if ($user.isLoged()) {
                $('#login').hide();
                $('#logout').show();
                $('#profile').show();
                $user.is_admin ? $('#del-term').show() : $('#del-term').hide();
            }
            else {
                $('#login').show();
                $('#logout').hide();
                $('#profile').hide();
                $('#del-term').hide()
            }
        });
    },

    update: function () {
        // Render the menu template.
        var menu_tmpl = $('#tmpl-menu').html();
        var data = {
            base_url: $config.api_url,
            lng: $config.lng,
            vocabulary: $config.vocabulary,
            webapp_url: $config.webapp_url,
        };
        $("#popupMenu")
            .html(Mustache.render(menu_tmpl, data))
            .enhanceWithin().popup();


        $('#login').on('click', function () {
            $user.login();
        });

        $('#logout').on('click', function () {
            $user.logout();
        });

        // Close the menu when an item is clicked.
        $('#popupMenu li').on('click', function() {
            $('#popupMenu').popup('close');
        });
    },
};
