
var $app = (function () {

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

        // Remove a dynamic-popup after it has been closed.
        $(document).on('popupafterclose', '.dynamic-popup', function() {
            $(this).remove();
        });

        // Get and display a random term from the vocabulary.
        get_random_term(true);
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
     * Get and display a random term from the vocabulary.
     */
    var get_random_term = function (check) {
        var check = check || false;
        http_request('/public/btr/translations/get_random_sguid', {
            method: 'POST',
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
                var sguid = result.sguid;
                http_request('/public/btr/translations/' + sguid + '?lng=sq')
                    .then(build_translations_list);
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

        // Empty the list of translations.
        $('#translations')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');

        // Retrieve a suggestions list from the server and display them.
        var path = '/translations/autocomplete/string/vocabulary/ICT_sq/';
        http_request(path + search_term)
            .then(build_suggestions_list);
    }

    /**
     * Build and display a list of the terms suggested from the server.
     * When a term is clicked it should be selected.
     */
    var build_suggestions_list = function(term_list) {
        //console.log(term_list);  //debug

        // Get the data for the list of suggestions.
        var data = { terms: [] };
        $.each(term_list, function (id, term) {
            data.terms.push(term);
        });

        // Render and display the template of suggestions.
        var tmpl = $('#tmpl-suggestions').html();
        $('#suggestions')
            .html(Mustache.render(tmpl, data))
            .listview('refresh')
            .trigger('updatelayout');

        // When a term from the list is clicked, select that term.
        $('.term').on('click', select_term);
    }

    /**
     * This function is called when a term from the suggestions list is
     * selected (clicked).
     */
    var select_term = function (event) {
        // Set the selected term to the search input.
        var term = $(this).html();
        $('#search-term')[0].value = term;

        // Empty the list of suggestions.
        $('#suggestions')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');

        // Get the string details of the selected term
        // and display the list of existing translations.
        //$.getScript('js/sha1.js');
        var sguid = Sha1.hash(term + 'vocabulary');
        http_request('/public/btr/translations/' + sguid + '?lng=sq')
            .then(build_translations_list);
    }

    /**
     * Build and display a list of the existing translations for the
     * selected term.
     */
    var build_translations_list = function (result) {
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
        $('#translations')
            .html(Mustache.render(tmpl, data))
            .listview('refresh')
            .trigger('updatelayout');

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
    }

    /**
     * When a translation from the list is clicked, display
     * a popup with the details of this translation.
     */
    var display_translation_popup = function (event) {
        // Get the data for the list of voters.
        var data = {
            translation: $(this).data('translation'),
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

        // When the 'Vote' button is clicked,
        // send a vote for this translation.
        var tguid = $(this).data('tguid');
        $('#vote').on('click', function (event) {
            $("#translation-details").popup('close');
            vote_translation(tguid);
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
            method: 'POST',
            data: { tguid: tguid },
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
            .done(function () {
                message('Vote submitted successfully.');
                refresh_translation_list();
            })
            .fail(function () {
                message('Vote submition failed.', 'error');
            });
    };

    /**
     * Refresh the list of translations.
     */
    var refresh_translation_list = function () {
        var term = $('#search-term')[0].value;
        var sguid = Sha1.hash(term + 'vocabulary');
        var url = '/public/btr/translations/' + sguid + '?lng=sq';
        http_request(url).then(build_translations_list);
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

})();
