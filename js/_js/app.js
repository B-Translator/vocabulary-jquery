
var $app = (function () {

    {% include _app/disqus.js %}

    $(document).ready(function () {
        $( "body>[data-role='panel']" ).panel();
    });

    /**
     * When the page with id 'vocabulary' is created,
     * do the things that are listed in the function.
     */
    $(document).on('pagecreate', '#vocabulary', function() {
        // Attach the function 'display_suggestions_list' to the event
        // 'filterablebeforefilter' from the list of suggestions.
        $('#suggestions').on('filterablebeforefilter', display_suggestions_list);

        // When the button 'Next' is clicked, get and display a random term.
        $('#next').on('click', function (event) {
            get_random_term();
        });

        // Setup menu items.
        menu_setup();

        // Add a new term when the button is clicked.
        $('#add-new-term').on('click', add_new_term);

        // Remove a dynamic-popup after it has been closed.
        $(document).on('popupafterclose', '.dynamic-popup', function() {
            $(this).remove();
        });

        // Display the term that is given after #, or any random term.
        var term = window.location.hash.slice(1);
        term ? display_term(term) : get_random_term(true);

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

    var add_new_term = function () {
        var term = $('#search-term')[0].value;
        if (!term)  return false;

        // Get the access_token.
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(add_new_term);
            return false;
        }

        // Add the new term.
        http_request('/btr/project/add_string', {
            type: 'POST',
            data: {
                origin: 'vocabulary',
                project: 'ICT_sq',
                string: term,
                context: 'vocabulary',
                notify: true,
            },
            headers: {
                'Authorization': 'Bearer ' + access_token,
            }
        })
            .done(function (result) {
                display_translations(result.sguid);
                message('New term added.');
            });
    };

    /**
     * Get and display a random term from the vocabulary.
     */
    var get_random_term = function (check) {
        var check = check || false;
        http_request('/public/btr/translations/get_random_sguid', {
            type: 'POST',
            data: {
                target: 'next',
                scope: 'vocabulary/ICT_sq',
            },
        })
            .then(function (result) {
                //console.log(check); console.log(result);  //debug

                // Check that the search box is empty.
                if (check &&  $('#search-term')[0].value != '')  { return; }

                // Get and display the translations of the string.
                display_translations(result.sguid);
            });
    }

    /**
     * This function is called when the user starts to type a term on the
     * search-term input. It retrieves from the server a list of
     * autocomplete suggestions and displays them under the search box.
     */
    var display_suggestions_list = function (event, data) {
        // Get the search term typed so far.
        var search_term = $(data.input).val();
        if (!search_term) { return; }
        if (search_term.length < 2) { return; }

        // Retrieve a suggestions list from the server and display them.
        var path = '/translations/autocomplete/string/vocabulary/ICT_sq/';
        http_request(path + search_term)
            .then(display_suggestions);
    }

    /**
     * Build and display a list of the terms suggested from the server.
     * When a term is clicked it should be selected.
     */
    var display_suggestions = function(term_list) {
        // Get the numbers of terms
        var count = Object.keys(term_list).length;

        // If the list is empty, add the current term as a new term.
        if (count == 0) {
            hide_suggestions();
            hide_translations();
            $('#add-new-term').show();
            return;
        }

        // If there is only one term in the list
        // just display it, don't build the suggestion list.
        if (count == 1) {
            for (var term in term_list) {
                display_term(term);
                return;
            };
        }

        // Hide translations and the add button.
        hide_translations();
        $('#add-new-term').hide();

        // Get the data for the list of suggestions.
        var data = { terms: [] };
        $.each(term_list, function (id, term) {
            data.terms.push(term);
        });

        // Render and display the template of suggestions.
        var tmpl = $('#tmpl-suggestions').html();
        $('#suggestions').html(Mustache.render(tmpl, data))
            .listview('refresh').trigger('updatelayout');

        // When a term from the list is clicked, select that term.
        $('.term').on('click', function () {
            // Display the selected term.
            var term = $(this).html();
            display_term(term);
        });
    }

    /** Hide the list of suggestions. */
    var hide_suggestions = function () {
        $('#suggestions')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');
    };

    /** Hide the list of translations. */
    var hide_translations = function () {
        $('#translations')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');
    };
    
    /**
     * Retrive and display the translations for the given term.
     */
    var display_term = function (term) {
        // Update the search input box.
        $('#search-term')[0].value = term;

        // Get and display the list of translations.
        var sguid = Sha1.hash(term + 'vocabulary');
        display_translations(sguid);
    }

    /**
     * Get the translations of the given sguid and display them.
     */
    var display_translations = function (sguid) {
        // Hide the list of suggestions and the button that adds a new term.
        hide_suggestions();
        $('#add-new-term').hide();

        var url = '/public/btr/translations/' + sguid + '?lng=sq';
        http_request(url).then(function (result) {
            //console.log(result.string);  return;  //debug

            // Set the selected term on the search box.
            var term = result.string.string;
            $('#search-term')[0].value = term;

            // Set the link for the details.
            var url = 'https://l10n.org.al/vocabulary/ICT_sq/' + term;
            $('#details').attr('href', url);

            // Get the data for the list of translations.
            var data = { translations: [] };
            $.each(result.string.translations, function (i, trans) {
                data.translations.push({
                    id : trans.tguid,
                    translation: trans.translation,
                    author: trans.author,
                    time: $.timeago(trans.time),
                    vote_nr: trans.count,
                    voted: trans.votes.hasOwnProperty($user.name) ? ' voted' : '',
                });
            });

            // Render and display the template of translations.
            var tmpl = $('#tmpl-translations').html();
            $('#translations').html(Mustache.render(tmpl, data))
                .listview('refresh').trigger('create').trigger('updatelayout');

            // Store the string id (we need it when submitting
            //a new translation).
            $('#new-translation').data('sguid', result.string.sguid);

            // Store the votes for each translation.
            $.each(result.string.translations, function (i, trans) {
                var $li = $('li#' + trans.tguid);
                $li.data('tguid', trans.tguid);
                $li.data('translation', trans.translation);
                $li.data('votes', trans.votes);
            });

            // When a translation from the list is clicked,
            // display a popup with its details.
            $('.translation').on('click', display_translation_popup);

            // Sending a new translation to the server.
            $('#new-translation-form').on('submit', send_new_translation);
            $('#send-new-translation').on('click', send_new_translation);

            // Get the disqus comments for this term.
            _disqus.reload(sguid, term);
        });
    };
    
    /**
     * When a translation from the list is clicked, display
     * a popup with the details of this translation.
     */
    var display_translation_popup = function (event) {
        // Get the data for the list of voters.
        var data = {
            translation: $(this).data('translation'),
            is_admin: ($.inArray('btranslator-admin', $user.permissions) > -1),
            nr : 0,
            voters: [],
        };
        var votes = $(this).data('votes');
        $.each(votes, function (user, vote) {
            if (!vote.name) return;
            data.nr += 1;
            var voter_name = vote.name;
            if (voter_name == $user.name) {
                voter_name = '<span class="user">' + voter_name + '</span>';
            }
            data.voters.push({
                name: voter_name,
                time: $.timeago(vote.time),
            });
        });

        // Render and display the template of translation details.
        var tmpl = $('#tmpl-translation-details').html();
        var popup_html = Mustache.render(tmpl, data);
        $(popup_html)
            .appendTo($.mobile.activePage)
            .toolbar();
        $("#translation-details")
            .popup()           // init popup
            .popup('open');    // open popup

        // Get the id of the translation.
        var tguid = $(this).data('tguid');

        // When the 'Vote' button is clicked,
        // send a vote for this translation.
        $('#vote').on('click', function () {
            $("#translation-details").popup('close');
            vote_translation(tguid);
        });

        // When the 'Delete' button is clicked,
        // delete this translation.
        $('#delete').on('click', function (event) {
            $("#translation-details").popup('close');
            delete_translation(tguid);
        });
    }

    /**
     * Send a vote for the translation with the given id.
     */
    var vote_translation = function (tguid) {
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                vote_translation(tguid);
            });
            return;
        }

        http_request('/btr/translations/vote', {
            type: 'POST',
            data: { tguid: tguid },
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
            .done(function (result) {
                if (result.messages.length) {
                    display_service_messages(result.messages);
                }
                else {
                    message('Vote saved.');
                }

                // Refresh the list of translations.
                var term = $('#search-term')[0].value;
                display_term(term);
            });
    };

    /**
     * Delete the translation with the given id.
     */
    var delete_translation = function (tguid) {
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                delete_translation(tguid);
            });
            return;
        }

        http_request('/btr/project/del_string', {
            type: 'POST',
            data: { tguid: tguid },
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
            .done(function (result) {
                // Refresh the list of translations.
                var term = $('#search-term')[0].value;
                display_term(term);
            });
    };

    /**
     * Send a new translation to the server.
     * Return 'false' so that the form submission fails.
     */
    var send_new_translation = function () {
        var new_translation = $('#new-translation')[0].value;
        if (!new_translation)  return false;

        // Get the access_token.
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(send_new_translation);
            return false;
        }

        // Submit the translation.
        http_request('/btr/translations/add', {
            type: 'POST',
            data: {
                sguid: $('#new-translation').data('sguid'),
                lng: 'sq',
                translation: new_translation,
            },
            headers: {
                'Authorization': 'Bearer ' + access_token,
            }
        })
            .done(function (result) {
                if (result.messages.length) {
                    display_service_messages(result.messages);
                }
                else {
                    message('Translation saved.');
                }

                // Refresh the list of translations.
                var term = $('#search-term')[0].value;
                display_term(term);
            });

        // Clear the input box.
        $('#new-translation')[0].value = '';

        // Return 'false' so that form submission fails.
        return false;
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
