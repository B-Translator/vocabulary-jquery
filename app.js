
$(document).on("pagecreate", "#vocabulary", function() {

    $("#autocomplete").on("filterablebeforefilter", function (e, data) {
        var $ul = $(this),
        $input = $(data.input),
        value = $input.val(),
        html = "";
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

		    $(".term").click(function (event) {
			var term = $(this).html();
			$('#autocomplete-input')[0].value = term;
			$ul.html('');
			$ul.listview("refresh");
			$ul.trigger("updatelayout");
		    });

                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
		});
        }
    });


});
