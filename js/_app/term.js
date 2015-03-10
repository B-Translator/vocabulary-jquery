
var _term = {
    /** Display the given term. */
    display: function (term) {
        // Update the search input box.
        $('#search-term')[0].value = term;

        // Get and display the list of translations.
        var sguid = Sha1.hash(term + 'vocabulary');
        _translations.display(sguid);
    },

    /**
     * Get and display a random term from the vocabulary.
     *
     * @param check {boolean}
     *   Default is 'false'. If 'true', display the term
     *   only if the search box is empty. 
     */
    get_random: function (check) {
        var check = check || false;
        http_request('/public/btr/translations/get_random_sguid', {
            type: 'POST',
            data: {
                target: 'next',
                scope: 'vocabulary/' + $config.vocabulary,
            },
        })
            .then(function (result) {
                // Check that the search box is empty.
                if (check &&  $('#search-term')[0].value != '')  { return; }

                // Get and display the translations of the string.
                _translations.display(result.sguid);
            });
    },

    /** Add a new term. */
    add: function () {
        var term = $('#search-term')[0].value;
        if (!term)  return false;

        // Get the access_token.
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(_term.add);
            return false;
        }

        // Add the new term.
        http_request('/btr/project/add_string', {
            type: 'POST',
            data: {
                origin: 'vocabulary',
                project: $config.vocabulary,
                string: term,
                context: 'vocabulary',
                notify: true,
            },
            headers: {
                'Authorization': 'Bearer ' + access_token,
            }
        })
            .done(function (result) {
                _translations.display(result.sguid);
                message('New term added.');
            });
    },

    /** Delete the term with the given id. */
    del: function (sguid) {
        var access_token = $user.token.access_token();
        if (!access_token) {
            $user.token.get().done(function () {
                _term.del(sguid);
            });
            return;
        }

        http_request('/btr/project/del_string', {
            type: 'POST',
            data: { sguid: sguid },
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
            .done(function (result) {
                if (result.messages.length) {
                    display_service_messages(result.messages);
                }
                else {
                    message('Term deleted.');
                    _translations.hide();
                    $('#add-new-term').show();
                }
            });
    },
};
