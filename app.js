
/**
 * When the page with id 'vocabulary' is created,
 * do the things that are listed in the function.
 */
$(document).on('pagecreate', '#vocabulary', function() {

    // Attach the function 'display_suggestions_list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $('#suggestions').on('filterablebeforefilter', display_suggestions_list);

});

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

    // Display a temporary loading icon.
    var loading = '<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li> ';
    $('#suggestions')
	.html(loading)
	.listview('refresh');

    // Retrieve a suggestions list from the server and display them.
    var path = '/translations/autocomplete/string/vocabulary/ICT_sq/';
    var autocomplete_url = base_url + path + search_term
    http_request(autocomplete_url)
	.then(build_suggestions_list);
}

/**
 * Build and display a list of the terms suggested from the server.
 * When a term is clicked it should be selected.
 */
var build_suggestions_list = function(term_list) {
    // Build the HTML code for the list of terms.
    var html_list = '';
    $.each(term_list, function (id, term) {
	html_list += '<li><a href="#" class="term">' + term + '</a></li>';
    });

    // Display it.
    $('#suggestions')
	.html(html_list)
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

    //$.getScript('sha1.js');
    var sguid = Sha1.hash(term + 'vocabulary');
    var url = base_url + '/public/btr/translations/' + sguid + '?lng=sq';
    http_request(url).then(function (result) {
	console.log(result.string.translations);
    });
}
