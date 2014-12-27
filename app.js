
/**
 * This function is called when the user starts to type a term on the
 * search-term input. It retrieves from the server a list of
 * autocomplete suggestions and displays them under the search box.
 */
var display_suggestions_list = function (e, data) {
    var $ul = $(this);
    var $input = $(data.input);
    var value = $input.val();
    var html = "";
    $ul.html("");
    if (value && value.length > 1) {
        $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
        $ul.listview("refresh");
	var url = base_url
	    + '/translations/autocomplete/string/vocabulary/ICT_sq/'
	    + $input.val();
	http_request(url)
	    .then(function (response) {
                $.each(response, function (i, val) {
		    html += '<li><a href="#" class="term">' + val + '</a></li>';
                });
                $ul.html(html);
                $ul.listview("refresh");
                $ul.trigger("updatelayout");

		// When a term from the list is clicked, select that term.
		$(".term").on('click', select_term);
	    });
    }
}

/**
 * This function is called when a term from the suggestions list is
 * selected (clicked).
 */
var select_term = function (e) {
    // Set the selected term to the search input.
    var term = $(this).html();
    $('#search-term')[0].value = term;

    // Empty the list of suggestions.
    var $ul = $("#suggestions");
    $ul.html('');
    $ul.listview("refresh");
    $ul.trigger("updatelayout");
}

/**
 * When the page with id 'vocabulary' is created,
 * do the following.
 */
$(document).on("pagecreate", "#vocabulary", function() {
    // Attach the function 'display_suggestions_list' to the event
    // 'filterablebeforefilter' from the list of suggestions.
    $("#suggestions").on('filterablebeforefilter', display_suggestions_list);
});
