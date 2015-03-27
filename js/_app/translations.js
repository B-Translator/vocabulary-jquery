
var _translations = {
    /** Hide the list of translations. */
    hide: function () {
        $('#translations')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');
    },

    /** Get the translations of the given sguid and display them. */
    display: function (sguid) {
        // Hide the list of suggestions and the button that adds a new term.
        _suggestions.hide();
        $('#add-new-term').hide();

        var url = '/public/btr/translations/' + sguid + '?lng=' + $config.lng;
        http_request(url).then(function (result) {
            //console.log(result.string);  return;  //debug

            // If result.string is null, there is no such string.
            if (result.string === null) {
                _translations.hide();
                $('#add-new-term').show();
                return;
            }

            // Set the selected term on the search box.
            var term = result.string.string;
            $('#search-term')[0].value = term;

            // Set the link for the details.
            $('#details').attr('href', $config.webapp_url + 
                               '/vocabulary/' + $config.vocabulary + '/' + term);

            // Get the data for the list of translations.
            var data = { translations: [] };
            $.each(result.string.translations, function (i, trans) {
                data.translations.push({
                    id: trans.tguid,
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
            $('.translation').on('click', _translation.display_popup);

            // Sending a new translation to the server.
            $('#new-translation-form').on('submit', _translation.submit);
            $('#send-new-translation').on('click', _translation.submit);

            // Get the disqus comments for this term.
            $config.disqus.shortname ? _disqus.reload(sguid, term) : null;
        });
    },
};
