
var _settings = {
    save: function () {
        localStorage.setItem('vocabulary.lng', $config.lng);
        localStorage.setItem('vocabulary.vocabulary', $config.vocabulary);
        localStorage.setItem('vocabulary.custom_keyboard', $config.custom_keyboard ? 'true' : 'false');
        _settings.set_title();
        _settings.update_panel();
        _menu.update();
        var term = $('#search-term')[0].value;
        term ? _term.display(term) : _term.get_random();
    },

    /** Load language and vocabulary from the local storage */
    load: function () {
        // Load lng.
        var lng = localStorage.getItem('vocabulary.lng');
        if (lng && lng != 'undefined') {
            $config.lng = lng;
        }

        // Load vocabulary.
        var vocabulary = localStorage.getItem('vocabulary.vocabulary');
        if (vocabulary && vocabulary != 'undefined') {
            $config.vocabulary = vocabulary;
        }

        // Load custom_keyboard
        var kbd = localStorage.getItem('vocabulary.custom_keyboard');
        if (kbd && kbd != 'undefined') {
            $config.custom_keyboard = (kbd == 'true' ? true : false);
        }

        // Update.
        this.set_title();
        this.update_panel();
    },

    set_title: function () {
        var title = _options[$config.lng].vocabularies[$config.vocabulary];
        document.title = title;
        $('h1').html(title);
    },

    update_panel: function () {
        // Fill the list of languages.
        var data = { languages: [] };
        $.each(_options, function (lng, obj) {
            data.languages.push({
                lng: lng,
                language: obj.name,
                selected: (lng==$config.lng ? 'checked="checked"' : ''),
            });
        });
        var tmpl = $('#tmpl-languages').html();
        $('#languages').html(Mustache.render(tmpl, data)).trigger('create');

        // Fill the list of vocabularies.
        var data = { vocabularies: [] };
        $.each(_options[$config.lng].vocabularies, function (id, name) {
            data.vocabularies.push({
                id: id,
                name: name,
                selected: (id==$config.vocabulary ? 'checked="checked"' : ''),
            });
        });
        var tmpl = $('#tmpl-vocabularies').html();
        $('#vocabularies').html(Mustache.render(tmpl, data)).trigger('create');

        // Update layout of the panel.
        $('#settings').trigger( "updatelayout" );

        // Set the value of the keyboard checkbox.
        $('#custom-keyboard').attr('checked', $config.custom_keyboard);
        $('#custom-keyboard').flipswitch("refresh");

        // Update config and settings when a vocabulary is selected.
        $('.vocabulary').on('click', function () {
            $config.vocabulary = this.value;
            _settings.save();
        });

        // Update config and settings when a language is selected.
        $('.lng').on('click', function () {
            $config.lng = this.value;
            for (var v in _options[$config.lng].vocabularies) break;
            $config.vocabulary = v;
            _settings.save();
        });

        // Update custom_keyboard when the switch is flipped.
        $('#custom-keyboard').change(function () {
            $config.custom_keyboard = $(this).is(':checked');
            localStorage.setItem('vocabulary.custom_keyboard', $config.custom_keyboard ? 'true' : 'false');
            var term = $('#search-term')[0].value;
            _term.display(term);
        });
    },
};
