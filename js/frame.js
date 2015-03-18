
$(document).ready(function(){

    // If the screen is too wide, reload page inside a frame.
    if ($('body').width() > 500) {
        var tmpl = $('#tmpl-frame').html();
        var data = {
            href: window.location.href,
        };
        $('body').html(Mustache.render(tmpl, data));
    }

});
