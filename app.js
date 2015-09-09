
var $app = (function () {

    
// The languages and vocabularies available.
var _options = {
    sq: {
        name: 'Shqip',
        webapp: 'https://l10n.org.al',
        vocabularies: {
            ICT_sq: 'Fjalori ICT',
            huazime_sq: 'Fjalë të Huaja',
        },
        disqus: 'l10n-sq',   // disqus shortname
        translate_in_context_url: 'https://l10n.org.al/btr/project/dashohoxha/v.btranslator.org/',
        keyboard: {
            layout: 'custom',
            customLayout: {
                'normal' : [
                    "q w e r t y u i o p",
                    "a s d f g h j k l :",
                    "z x c v b n m ' \" !",
                    "\u00eb \u00e7 {bksp} {enter} {accept} {cancel}",
                    "{shift} {alt} . {space}",
                ],
                'shift' : [
                    "Q W E R T Y U I O P",
                    "A S D F G H J K L ;",
                    "Z X C V B N M ` \u00a6 ?",
                    "\u00cb \u00c7 {tab} {enter} {accept} {cancel}",
                    "{shift} {alt} , {space}",
                ],
                'alt' : [
                    "0 1 2 3 4 5 6 7 8 9",
                    "\u00a7 \u20ac $ # % _ - + = *",
                    "( ) [ ] { } < > / \\",
                    "& | ~ ^ {enter} {accept} {cancel}",
                    "{shift} {alt} @ {space}",
                ],
                /*
                'alt-shift' : [
                    "0 1 2 3 4 5 6 7 8 9",
                    "\u00a7 \u20ac $ # % _ - + = *",
                    "( ) [ ] { } < > / \\",
                    "& | ~ ^ {enter} {accept} {cancel}",
                    "{shift} {alt} @ {space}",
                ],
                */
            },
        },

        /*
        //keyboard: { layout: 'albanian-qwerty' },
        keyboard: {
            layout: 'custom',
            customLayout: {
                'normal' : [
                    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "{tab} q w e r t y u i o p \u00eb '",
                    "a s d f g h j k l ; \u00e7 # {enter}",
                    "{shift} \\ z x c v b n m , . / {shift}",
                    "{accept} {alt} {space} {alt} {cancel}"],
                'shift' : [
                    '\u00ac ! " \u00a7 $ % ^ & * ( ) _ + {bksp}',
                    "{tab} Q W E R T Y U I O P \u00cb @",
                    "A S D F G H J K L : \u00c7 ~ {enter}",
                    "{shift} \u00a6 Z X C V B N M < > ? {shift}",
                    "{accept} {alt} {space} {alt} {cancel}"
                ],
                'alt' : [
                    "| 1 2 3 4 5 6 { } [ ] - = {bksp}",
                    "{tab} q w \u20ac r t y u i o p \u00f7 \u00d7",
                    "a s d f g h j k l ; \u00e7 # {enter}",
                    "{shift} \\ z x c v b n m , . / {shift}",
                    "{accept} {alt} {space} {alt} {cancel}"
                ],
                'alt-shift' : [
                    '| ! " \u00a7 $ % ^ & * ( ) _ + {bksp}',
                    "{tab} Q W \u20AC R T Y U I O P \u00cb @",
                    "A S D F G H J K L : \u00c7 ~ {enter}",
                    "{shift} \u00a6 Z X C V B N M < > ? {shift}",
                    "{accept} {alt} {space} {alt} {cancel}"
                ]           },
        },
        */
    },
};

    
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
            if ($config.update_app_language) {
                _l10n.set_language($config.lng);
            }
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

        // Set the value of the keyboard checkbox.
        $('#custom-keyboard').attr('checked', $config.custom_keyboard);

        // Update layout of the panel.
        $('#settings').trigger('updatelayout');

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
            if ($config.update_app_language) {
                _l10n.set_language($config.lng);
            }
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

    
/**
 * Implement "translation in context".
 *
 * It works like this: when the user makes a Ctrl+Click on a
 * string/translation anywhere on the UI, a browser tab/window is
 * opened automatically with the correct url in the translation server
 * (web application), where he can give a translation or a new
 * suggestion for the selected string. (Of course, for a normal Click
 * the UI works as normally it should.)
 *
 * Hopefully this can help to improve the quality of translations,
 * since the user knows the context where the string is being used. It
 * can also facilitate giving feedback and suggestions to the
 * translator(s) of a program.
 */

var _translate_in_context = {
    /**
     * Return a "decorated" translation (which can handle Ctrl+Click
     * properly). The ID of the string is included as an attribute.
     */
    decorate: function (text) {
        var sguid = Sha1.hash(text);
        var decorated_translation = 
            '<span class="gettext" sguid="' + sguid + '">'
            + _t(text)
            + '</span>';
        return decorated_translation;
    },
    
    /**
     * Return the URL of the selected string on the translation
     * server.
     */
    get_url: function (el) {
        var url = 'https://btranslator.org/translations/';
        if (_options[$config.lng].translate_in_context_url) {
            url = _options[$config.lng].translate_in_context_url;
        }
        var sguid = $(el).attr('sguid');
        return url + $config.lng + '/' + sguid;
    },

    /**
     * Handle the Ctrl+Click event by opening a browser tab with the
     * correct URL. Return 'false' so that the click event fails.
     */
    handle_ctrl_click: function(event) {
        if (event.ctrlKey) {
            var url = _translate_in_context.get_url(this);
            try {
                var w = window.open(url, 'translate');
                w.href= url;
            } catch (e) {}
            finally {
                return false;
            }
        }
    },

    /**
     * Assign the event handler function to the elements with class
     * 'gettext'.
     */
    enable: function () {
        if ($config.translate_in_context) {
            $('.gettext').off('click', _translate_in_context.handle_ctrl_click);
            $('.gettext').on('click', _translate_in_context.handle_ctrl_click); 
        }
    },
};

window._t = window._;
if ($config.translate_in_context) {
    // Override the gettext function "_()", so that instead of the
    // translation it returns a "decorated" translation (which can
    // handle Ctrl+Click properly).
    window._ = _translate_in_context.decorate;

    // Assign the event handler function to the elements with class
    // 'gettext'.
    $(document).ready(function() {
        _translate_in_context.enable();
    });
}

    // Google Analytics
if ($config.ga_id) {
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
}
else {
    window.ga = function(){};
}

ga('create', $config.ga_id, 'auto');
ga('send', 'pageview');

$(document).ready(function () {
    $('.ui-btn').on('click', function() {
        var label = $(this)[0].textContent;
        ga('send', 'event', 'button', 'click', label);
    });
});

    
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
            }
            else {
                $('#login').show();
                $('#register').show();
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
            external_links: $config.external_links,
            'User': _('User'),
            'Sign in': _('Sign in'),
            'Sign out': _('Sign out'),
            'Sign up': _('Sign up'),
            'Profile': _('Profile'),
            'Settings': _('Settings'),
            'Contact': _('Contact'),
            'Links': _('Links'),
            'Term': _('Term'),
            'Delete': _('Delete'),
            'Details': _('Details'),
            'List': _('List'),
            'Download': _('Download'),
        };
        $("#popupMenu")
            .html(Mustache.render(menu_tmpl, data))
            .enhanceWithin().popup();

        _translate_in_context.enable();

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

    
var _l10n = {
    /** Translate the application interface. */
    translate: function () {
        // Translate seetings.
        $('#lang').html(_('Language'));
        $('#vocab').html(_('Vocabulary'));
        $('label[for="custom-keyboard"]').html(_('Use Custom Keyboard:'));
        $('#done').html(_('Done'));

        // Translate search.
        $('#search-term').attr('placeholder', _t('Search for a word...'));
        $('#add-new-term').html( _('Add New Term'));

        // Translate menu.
        _menu.update();
    },

    /** Load the translations for the given language. */
    set_language: function (lng) {
        $.getScript('l10n/po/' + lng + '.js')
            .done(_l10n.translate)
            .fail(function () {
                if (lng=='en') return;
                _l10n.set_language('en');
            });
    },
}

    
/**
 * When the page with id 'vocabulary' is created,
 * do the things that are listed in the function.
 */
$(document).on('pagecreate', '#vocabulary', function() {
    // Load language and vocabulary from the local storage.
    _settings.load();

    // Translate the app interface.
    _l10n.translate();

    // Setup menu items.
    _menu.init();

    // Attach the function '_suggestions.list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $('#suggestions').on('filterablebeforefilter', _suggestions.list);

    // When the button 'Random' is clicked, get and display a random term.
    $('#random').on('click', function (event) {
        _term.get_random();
    });

    // When the search button is clicked, go and fetch the translations
    // of the term that is entered on the search textbox.
    $('#search-button').on('click', function (event) {
        var term = $('#search-term')[0].value;
        _term.display(term);
    });

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
    _options[$config.lng].disqus ?
        _disqus.init(_options[$config.lng].disqus) :
        $('#disqus').hide();
});

    
var _social_share = {
    /** Update the social share buttons. */
    update: function(term, translations) {
        var title = $('h1').html() + ': ' + term;
        var summary = term + ' <==> ' + translations.join(' / ');
        var mobile_url = $config.app_url 
            + '/?lng=' + $config.lng + '&proj=' + $config.vocabulary
            + '#' + term;
        var url = $config.api_url
            + '/vocabulary/' + $config.vocabulary + '/' + term
            + '/?url=' + encodeURIComponent(mobile_url);

        $('#share-facebook').off().on('click', function() {
            window.open('https://www.facebook.com/sharer/sharer.php'
                        + '?u=' + encodeURIComponent(url));
        });

        $('#share-googleplus').off().on('click', function() {
            window.open('https://plus.google.com/share'
                        + '?url=' + encodeURIComponent(url)
                        + '&hl=' + $config.lng);
        });

        $('#share-twitter').off().on('click', function() {
            window.open("https://twitter.com/intent/tweet"
                        + '?text=' + encodeURIComponent(summary)
                        + '&url=' + encodeURIComponent(mobile_url)
                        + '&hashtags=' + $config.vocabulary);
        });

        $('#share-linkedin').off().on('click', function() {
            window.open("https://www.linkedin.com/shareArticle?mini=true"
                        + '&url=' + encodeURIComponent(mobile_url)
                        + '&title=' + encodeURIComponent(title)
                        + '&summary=' + encodeURIComponent(summary)
                        + '&source=' + encodeURIComponent($('h1').html()));
        });
    },
};

    
var _disqus = {
    //  Initialize Disqus.
    init: function (shortname) {
        if (typeof(DISQUS) == 'undefined'){
            (function() {
                var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                dsq.src = 'http://' + shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
        }
    },

    // Reload disqus data.
    reload: function (sguid, term) {
        if ($('.disqus-wrap').length == 1) {
            $('.disqus-inactive').addClass('disqus-active').removeClass('disqus-inactive').attr('id','disqus_thread');
        }
        if (typeof(DISQUS) !== 'undefined'){
            DISQUS.reset({
                reload: true,
                config: function () {
                    this.page.identifier = 'translations/' + $config.lng + '/' + sguid;
                    this.page.title = term;
                    if ($config.webapp_url) {
                        this.page.url = $config.webapp_url + '/vocabulary/' + $config.vocabulary + '/' + term;
                    }
                    else {
                        this.page.url = 'https://l10n.org.al/vocabulary/' + $config.vocabulary + '/' + term;
                    }
                }
            });
        }
    },
};

    
var _term = {
    /** Display the given term. */
    display: function (term) {
        // If there is an suggestion autoselect timeout, clear it.
        if (_suggestions.autoselect) {
            clearTimeout(_suggestions.autoselect);
            _suggestions.autoselect = null;
        }

        // Update the search input box.
        $('#search-term')[0].value = term;

        // Get and display the list of translations.
        var sguid = Sha1.hash(term + $config.vocabulary);
        _translations.display(sguid);

        // Track with Google Analytics.
        ga('set', 'page', term);
        ga('send', 'pageview');
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
        http_request('/api/translations/get_random_sguid', {
            type: 'POST',
            data: {
                target: 'random',
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
        http_request('/api/project/add_string', {
            type: 'POST',
            data: {
                origin: 'vocabulary',
                project: $config.vocabulary,
                string: term,
                context: $config.vocabulary,
                notify: true,
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
                    _translations.display(result.sguid);
                    message('New term added.');
                }
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

        http_request('/api/project/del_string', {
            type: 'POST',
            data: {
                sguid: sguid,
                project: $config.vocabulary,
            },
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

    
var _suggestions = {
    /**
     * This function is called when the user starts to type a term on the
     * search-term input. It retrieves from the server a list of
     * autocomplete suggestions and displays them under the search box.
     */
    list: function (event, data) {
        // Hide the rest of the page, except search.
        _translations.hide();
        $('#add-new-term').hide();
        $('#social-share-buttons').hide();
        $('#disqus').hide();

        // Get the search term typed so far.
        var search_term = $(data.input).val();
        if (!search_term) { return; }
        if (search_term.length < 2) { return; }

        // Retrieve a suggestions list from the server and display them.
        var url = '/auto/string/vocabulary'
            + '/' + $config.vocabulary + '/' + search_term;
        http_request(url).then(_suggestions.display);
    },

    /**
     * Build and display a list of the terms suggested from the server.
     * When a term is clicked it should be selected.
     */
    display: function(term_list) {

        // If there is an autoselect timeout, clear it.
        if (_suggestions.autoselect) {
            clearTimeout(_suggestions.autoselect);
            _suggestions.autoselect = null;
        }

        // Get the numbers of terms
        var count = Object.keys(term_list).length;

        // If the list is empty, add the current term as a new term.
        if (count == 0) {
            _suggestions.hide();
            $('#add-new-term').show();
            return;
        }

        // If there is only one term in the list,
        // autoselect it (after 2 seconds of inactivity).
        if (count == 1) {
            for (var term in term_list)  break;
            _suggestions.autoselect = setTimeout(function () {
                _term.display(term);
            }, 2*1000);
        }

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
            _term.display(term);
        });
    },

    /** Hide the list of suggestions. */
    hide: function () {
        $('#suggestions')
            .html('')
            .listview('refresh')
            .trigger('updatelayout');
    },
};

    
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

        var url = '/api/translations/' + sguid + '?lng=' + $config.lng;
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
                'New translation': _t('New translation'),
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

            // Update the social share buttons.
            var term = result.string.string;
            var translations = [];
            $.each(result.string.translations, function (i, trans) {
                translations.push(trans.translation);
            });
            _social_share.update(term, translations);
            $('#social-share-buttons').show();

            // Get the disqus comments for this term.
            if (_options[$config.lng].disqus) {
               _disqus.reload(sguid, term);
               $('#disqus').show();
           }
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

    
var _translation = {
    /**
     * When a translation from the list is clicked, display
     * a popup with the details of this translation.
     */
    display_popup: function (event) {
        // Get the data for the list of voters.
        var data = {
            translation: $(this).data('translation'),
            delete: ($user.is_moderator || $user.is_admin),
            nr : 0,
            voters: [],
            'Vote': _('Vote'),
            'Delete': _('Delete'),
            'Voters': _('Voters'),
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
        _translate_in_context.enable();

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

        http_request('/api/translations/vote', {
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

        http_request('/api/translations/del', {
            type: 'POST',
            data: { tguid: tguid },
            headers: { 'Authorization': 'Bearer ' + access_token }
        })
            .done(function (result) {
                if (result.messages.length) {
                    display_service_messages(result.messages);
                }
                else {
                    message('Translation deleted.');
                }

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
        http_request('/api/translations/add', {
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
        var msg = arr_messages[i][0];
        var type = arr_messages[i][1];
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
 * Extend the function $.ajax().
 */
var http_request = function(url, settings) {
    // If parameter settings is not given, assign a default value.
    var settings = settings || {};

    // Set some parameters of the ajax request.
    settings.url = $config.api_url + url;
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
};

    
})();
