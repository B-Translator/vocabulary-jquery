
/**
 * When the page with id 'vocabulary' is created,
 * do the things that are listed in the function.
 */
$(document).on('pagecreate', '#vocabulary', function() {
    // Attach the function '_suggestions.list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $('#suggestions').on('filterablebeforefilter', _suggestions.list);

    // When the button 'Next' is clicked, get and display a random term.
    $('#next').on('click', function (event) {
        _term.get_random();
    });

    // Setup menu items.
    menu_setup();

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
    _disqus.init($disqus_shortname);
});

/**
 * Setup menu items.
 */
var menu_setup = function () {
    // Render the menu template.
    var menu_tmpl = $('#tmpl-menu').html();
    var data = {
        base_url: $base_url,
        lng: $lng,
        vocabulary: $vocabulary,
    };
    $("#popupMenu")
        .html(Mustache.render(menu_tmpl, data))
        .enhanceWithin().popup();

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

    // Close the menu when an item is clicked.
    $('#popupMenu li').on('click', function() {
        $('#popupMenu').popup('close');
    });

};
