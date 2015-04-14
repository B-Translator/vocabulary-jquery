
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
            var data = {
		translations: [],
		'New translation': _('New translation'),
	    };
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

            // Attach a custom keyboard to the field of new translations.
            _translations.attach_keyboard();

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

    /** Attach a custom keyboard to the field of new translations. */
    attach_keyboard: function() {
        if (!$config.custom_keyboard)  return;
        if (! _options[$config.lng].keyboard)  return;
        var kbd = _options[$config.lng].keyboard;

        var options = {
            keyBinding : 'mousedown touchstart',
            stayOpen : true,
            position : {
                of : null,
                my : 'left top',
                at : 'left top',
                at2: 'left bottom',
                collision: 'fit',
            }
        };
        if (kbd.customLayout) {
            options.layout = 'custom';
            options.customLayout = kbd.customLayout;
        }
        else if (kbd.layout) {
            options.layout = kbd.layout;
        };

        var theme = {
            // keyboard wrapper theme
            container    : { theme:'a' },
            // theme added to all regular buttons
            buttonMarkup : { theme:'b', shadow:'false', corners:'true' },
            // theme added to all buttons when they are being hovered
            buttonHover  : { theme:'b' },
            // theme added to action buttons (e.g. tab, shift, accept, cancel);
            // parameters here will override the settings in the buttonMarkup
            buttonAction : { theme:'b' },
            // theme added to button when it is active (e.g. shift is down)
            // All extra parameters will be ignored
            buttonActive : { theme:'a' }
        };

        $('#new-translation').keyboard(options).addMobile(theme);
    },
};
