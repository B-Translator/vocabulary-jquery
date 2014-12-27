
/**
 * This function is called when a term from the autocomplete list is
 * selected (clicked).
 */
var select_term = function (e) {
    // Set the selected term to the search input.
    var term = $(this).html();
    $('#autocomplete-input')[0].value = term;

    // Delete the autocomplete list.
    var $ul = $("#autocomplete");
    $ul.html('');
    $ul.listview("refresh");
    $ul.trigger("updatelayout");
}

$(document).on("pagecreate", "#vocabulary", function() {

    $("#autocomplete").on("filterablebeforefilter", function (e, data) {
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
    });


});
