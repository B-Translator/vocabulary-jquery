
$(document).on("pagecreate", "#myPage", function() {
    $("#autocomplete").on("filterablebeforefilter", function (e, data) {
        console.log('TEST');
        var $ul = $(this),
        $input = $(data.input),
        value = $input.val(),
        html = "";
        $ul.html("");
        if (value && value.length > 2) {
            $ul.html("<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>");
            $ul.listview("refresh");
            $.ajax({
                url: "http://gd.geobytes.com/AutoCompleteCity",
                dataType: "jsonp",
                crossDomain: true,
                data: {
                    q: $input.val()
                }
            })
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
