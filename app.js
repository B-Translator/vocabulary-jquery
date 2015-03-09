
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
    },
    /*
    en: {
        name: 'English',
        webapp: 'https://l10n.org.al',
        vocabularies: {
            ICT_sq: 'Fjalori ICT',
        },
    },
    */
};

    
var _settings = {
    save: function () {
        localStorage.setItem('vocabulary.lng', $config.lng);
        localStorage.setItem('vocabulary.vocabulary', $config.vocabulary);
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

        // Update config and settings when a vocabulary is selected.
        $('.vocabulary').on('click', function () {
            $config.vocabulary = this.value;
            _settings.save();
            _settings.set_title();
            _menu.update();
            _term.get_random();
        });

        // Update config and settings when a language is selected.
        $('.lng').on('click', function () {
            $config.lng = this.value;
            for (var v in _options[$config.lng].vocabularies) break;
            $config.vocabulary = v;
            _settings.save();
            _settings.update_panel();
            _menu.update();
            _term.get_random();
        });
    },
};

    
var _menu = {
    init: function () {
        _menu.update();

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

    
/**
 * When the page with id 'vocabulary' is created,
 * do the things that are listed in the function.
 */
$(document).on('pagecreate', '#vocabulary', function() {
    // Load language and vocabulary from the local storage.
    _settings.load();

    // Setup menu items.
    _menu.init();

    // Attach the function '_suggestions.list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $('#suggestions').on('filterablebeforefilter', _suggestions.list);

    // When the button 'Next' is clicked, get and display a random term.
    $('#next').on('click', function (event) {
        _term.get_random();
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
    $config.disqus.shortname ?
	_disqus.init($config.disqus.shortname) :
	$('#disqus').hide();
});

    
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
};

    
var _suggestions = {
    /**
     * This function is called when the user starts to type a term on the
     * search-term input. It retrieves from the server a list of
     * autocomplete suggestions and displays them under the search box.
     */
    list: function (event, data) {
        // Get the search term typed so far.
        var search_term = $(data.input).val();
        if (!search_term) { return; }
        if (search_term.length < 2) { return; }

        // Retrieve a suggestions list from the server and display them.
        var url = '/translations/autocomplete/string/vocabulary'
            + '/' + $config.vocabulary + '/' + search_term;
        http_request(url).then(_suggestions.display);
    },

    /**
     * Build and display a list of the terms suggested from the server.
     * When a term is clicked it should be selected.
     */
    display: function(term_list) {

        // Autocomplete the given term, but not more than twice in 10 seconds.
        // Return true if term autocompleted, otherwise return false.
        var _autocomplete = function (term) {
            if (!_suggestions.autocomplete) {
                _suggestions.autocomplete = {};
            }
            if (!_suggestions.autocomplete[term]) {
                _suggestions.autocomplete[term] = 0;
                setTimeout(function () {
                    delete _suggestions.autocomplete[term];
                }, 10*1000);
            }

            if (_suggestions.autocomplete[term] >= 2) {
                return false;
            }
            else {
                _suggestions.autocomplete[term] += 1;
                _term.display(term);
                return true;
            }
        };

        // Get the numbers of terms
        var count = Object.keys(term_list).length;

        // If the list is empty, add the current term as a new term.
        if (count == 0) {
            _suggestions.hide();
            _translations.hide();
            $('#add-new-term').show();
            return;
        }

        // If there is only one term in the list
        // just display it, don't build the suggestion list.
        if (count == 1) {
            for (var term in term_list)  break;
            if (_autocomplete(term)) return;
        }

        // Hide translations and the add button.
        _translations.hide();
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

        var url = '/public/btr/translations/' + sguid + '?lng=' + $config.lng;
        http_request(url).then(function (result) {
            //console.log(result.string);  return;  //debug

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
            $('.translation').on('click', _translation.display_popup);

            // Sending a new translation to the server.
            $('#new-translation-form').on('submit', _translation.submit);
            $('#send-new-translation').on('click', _translation.submit);

            // Get the disqus comments for this term.
            $config.disqus.shortname ? _disqus.reload(sguid, term) : null;
        });
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
