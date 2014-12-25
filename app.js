
$(document).on("pagecreate", "#vocabulary", function() {
    $("#autocomplete").on("filterablebeforefilter", function (e, data) {
        console.log('TEST');
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
			html += "<li>" + val + "</li>";
                    });
                    $ul.html(html);
                    $ul.listview("refresh");
                    $ul.trigger("updatelayout");
		});
        }
    });
});
