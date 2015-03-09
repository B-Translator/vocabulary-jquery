
var _translation = {
    /**
     * When a translation from the list is clicked, display
     * a popup with the details of this translation.
     */
    display_popup: function (event) {
        // Get the data for the list of voters.
        var data = {
            translation: $(this).data('translation'),
            is_admin: $user.is_admin,
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
            _translation.vote(tguid);
        });

        // When the 'Delete' button is clicked,
        // delete this translation.
        $('#delete').on('click', function (event) {
            $("#translation-details").popup('close');
            _translation.del(tguid);
        });
    },

    /**
     * Send a vote for the translation with the given id.
     */
    vote: function (tguid) {
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                _translation.vote(tguid);
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
                _term.display(term);
            });
    },

    /** Delete the translation with the given id. */
    del: function (tguid) {
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                _translation.del(tguid);
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
                _term.display(term);
            });
    },

    /**
     * Send a new translation to the server.
     * Return 'false' so that the form submission fails.
     */
    submit: function () {
        var new_translation = $('#new-translation')[0].value;
        if (!new_translation)  return false;

        // Get the access_token.
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(_translation.submit);
            return false;
        }

        // Submit the translation.
        http_request('/btr/translations/add', {
            type: 'POST',
            data: {
                sguid: $('#new-translation').data('sguid'),
                lng: $config.lng,
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
                _term.display(term);
            });

        // Clear the input box.
        $('#new-translation')[0].value = '';

        // Return 'false' so that form submission fails.
        return false;
    },
};
