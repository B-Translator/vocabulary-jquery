var main = function() {

    var hidden = true;

    $("#click-me").click(function() {
        if (hidden) {
            $("#hidden-message").removeClass("hide");
            hidden = false;
        } else {
            $("#hidden-message").addClass("hide");
            hidden = true;
        }
    });
};

$(document).ready(main);