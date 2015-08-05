
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

    // When the button 'Next' is clicked, get and display a random term.
    $('#next').on('click', function (event) {
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
