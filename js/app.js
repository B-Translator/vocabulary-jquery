
var $app = (function () {

    {% include _app/disqus.js %}
    {% include _app/term.js %}
    {% include _app/suggestions.js %}
    {% include _app/translations.js %}
    {% include _app/translation.js %}

    $(document).ready(function () {
        $( "body>[data-role='panel']" ).panel();
    });

    /**
     * When the page with id 'vocabulary' is created,
     * do the things that are listed in the function.
     */
    $(document).on('pagecreate', '#vocabulary', function() {
        // Attach the function '_suggestions.list' to the event
        // 'filterablebeforefilter' from the list of suggestions.
        $('#suggestions').on('filterablebeforefilter', _suggestions.list);

        // When the button 'Next' is clicked, get and display a random term.
        $('#next').on('click', function (event) {
            _term.get_random();
        });

        // Setup menu items.
        menu_setup();

        // Add a new term when the button is clicked.
        $('#add-new-term').on('click', _term.add);

        // Remove a dynamic-popup after it has been closed.
        $(document).on('popupafterclose', '.dynamic-popup', function() {
            $(this).remove();
        });

        // Display the term that is given after #, or any random term.
        var term = window.location.hash.slice(1);
        term ? _term.display(term) : _term.get_random(true);

        // Initialize Disqus.
        _disqus.init($disqus_shortname);
    });

    /**
     * Setup menu items.
     */
    var menu_setup = function () {
        // Close the menu when an item is clicked.
        $('#popupMenu li').on('click', function() {
            $('#popupMenu').popup('close');
        });

        $('#menuButton').on('click', function() {
            if ($user.isLoged()) {
                $('#login').hide();
                $('#logout').show();
            }
            else {
                $('#login').show();
                $('#logout').hide();
            }
        });

        $('#login').on('click', function () {
            $user.login();
        });

        $('#logout').on('click', function () {
            $user.logout();
        });
    };

    /**
     * Display the messages that are returned from the service.
     * 
     * @param arr_messages {array}
     *     Array of notification messages; each notification message
     *     is an array of a message and a type, where type can be one of
     *     'status', 'warning', 'error'.
     */
    var display_service_messages = function (arr_messages) {
        if (!arr_messages.length)  return;
        for (var i in arr_messages) {
            var message = messages[i]
            var msg = message[0];
            var type = message[1];
            message(msg, type);
        }
    };

    /**
     * Display status and error messages.
     * 
     * @param msg {string}
     *   The message to be displayed.
     * @param type {string}
     *     The type of the message: status|error|warning
     * @params time {number}
     *     The time in seconds to display the message.
     */
    var message = function (msg, type, time) {
        // Set some default values, if params are missing.
        type = type || 'status';
        time = time || 5;

        // Create and add the message element.
        var $el = $('<p class="message ' + type + ' ui-mini">' + msg + '</p>');
        $('#messages').append($el).hide().slideToggle('slow');

        // After some seconds remove this message.
        setTimeout(function () {
            $el.slideToggle('slow', function () {
                $(this).remove();
            });
        }, time * 1000);

        // If the message is clicked, remove it.
        $('.message').on('click', function (event) {
            $(this).slideToggle('fast', function () {
                $(this).remove();
            });
        });
    };

    /**
     * Extend the function http_request().
     */
    var http_request = function(url, settings) {
        // If parameter settings is not given, assign a default value.
        var settings = settings || {};

        // Set some parameters of the ajax request.
        settings.url = $base_url + url;
        settings.dataType = 'json';
        // Before sending the request display a loading icon.
        settings.beforeSend = function() {
            $.mobile.loading('show');
            return true;
        };

        // Make the request and handle some common cases.
        var request = $.ajax(settings);
        request.always(function(){
            // Hide the loading icon.
            $.mobile.loading('hide');
        });
        request.fail(function(jqXHR, errorThrown, textStatus) {
            //console.log(jqXHR);  //debug
            //console.log(textStatus);  //debug
            //console.log(errorThrown);  //debug
            if (jqXHR.responseJSON) {
                if (jqXHR.responseJSON.error) {
                    message(jqXHR.responseJSON.error + ': ' + jqXHR.responseJSON.error_description, 'error');
                }
                else {
                    message(jqXHR.responseJSON[0], 'error');
                }
            }
            else {
                message(textStatus, 'error');
            }
        });

        return request;
    }

})();
