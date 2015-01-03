
/**
 * When the page with id 'vocabulary' is created,
 * do the things that are listed in the function.
 */
$(document).on('pagecreate', '#vocabulary', function() {

    // Attach the function 'display_suggestions_list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $('#suggestions').on('filterablebeforefilter', display_suggestions_list);

    // When the button 'Next' is clicked, get and display a random term.
    $('#next').on('click', function (event) {
	get_random_term();
    });

    // Get and display a random term from the vocabulary.
    get_random_term(true);

});

/**
 * Get and display a random term from the vocabulary.
 */
var get_random_term = function (check) {
    var check = check || false;
    http_request('/public/btr/translations/get_random_sguid', {
	method: 'POST',
	data: {
	    target: 'next',
	    scope: 'vocabulary/ICT_sq',
	},
    })
	.then(function (result) {
	    //console.log(check); console.log(result);  //debug

	    // Check that the search box is empty.
	    if (check &&  $('#search-term')[0].value != '')  { return; }

	    // Get and display the translations of the string.
	    var sguid = result.sguid;
	    http_request('/public/btr/translations/' + sguid + '?lng=sq')
		.then(build_translations_list);
	});
}

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

    // Empty the list of translations.
    $('#translations')
	.html('')
	.listview('refresh')
	.trigger('updatelayout');

    // Retrieve a suggestions list from the server and display them.
    var path = '/translations/autocomplete/string/vocabulary/ICT_sq/';
    http_request(path + search_term)
	.then(build_suggestions_list);
}

/**
 * Build and display a list of the terms suggested from the server.
 * When a term is clicked it should be selected.
 */
var build_suggestions_list = function(term_list) {
    //console.log(term_list);  //debug

    // Get the data for the list of suggestions.
    var data = { terms: [] };
    $.each(term_list, function (id, term) {
	data.terms.push(term);
    });

    // Render and display the template of suggestions.
    var tmpl = $('#tmpl-suggestions').html();
    $('#suggestions')
	.html(Mustache.render(tmpl, data))
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

    // Get the string details of the selected term
    // and display the list of existing translations.
    //$.getScript('js/sha1.js');
    var sguid = Sha1.hash(term + 'vocabulary');
    http_request('/public/btr/translations/' + sguid + '?lng=sq')
	.then(build_translations_list);
}

/**
 * Build and display a list of the existing translations for the
 * selected term.
 */
var build_translations_list = function (result) {
    //console.log(result.string);  return;  //debug

    // Set the selected term on the search box.
    $('#search-term')[0].value = result.string.string;

    // Get the data for the list of translations.
    var data = { translations: [] };
    $.each(result.string.translations, function (i, trans) {
	data.translations.push({
	    translation: trans.translation,
	    author: trans.author,
	    time: $.timeago(trans.time),
	    vote_nr: trans.count,
	});
    });

    // Render and display the template of translations.
    var tmpl = $('#tmpl-translations').html();
    $('#translations')
	.html(Mustache.render(tmpl, data))
	.listview('refresh')
	.trigger('updatelayout');
}
