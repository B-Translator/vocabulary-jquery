
/**
 * Display the messages that are returned from the service.
 * 
 * @param arr_messages {array}
 *     Array of notification messages; each notification message
 *     is an array of a message and a type, where type can be one of
 *     'status', 'warning', 'error'.
 */
var display_service_messages = function (arr_messages) {
    if (!arr_messages.length)  return;
    for (var i in arr_messages) {
        var msg = arr_messages[i][0];
        var type = arr_messages[i][1];
        message(msg, type);
    }
};

/**
 * Display status and error messages.
 * 
 * @param msg {string}
 *   The message to be displayed.
 * @param type {string}
 *     The type of the message: status|error|warning
 * @params time {number}
 *     The time in seconds to display the message.
 */
var message = function (msg, type, time) {
    // Set some default values, if params are missing.
    type = type || 'status';
    time = time || 5;

    // Create and add the message element.
    var $el = $('<p class="message ' + type + ' ui-mini">' + msg + '</p>');
    $('#messages').append($el).hide().slideToggle('slow');

    // After some seconds remove this message.
    setTimeout(function () {
        $el.slideToggle('slow', function () {
            $(this).remove();
        });
    }, time * 1000);

    // If the message is clicked, remove it.
    $('.message').on('click', function (event) {
        $(this).slideToggle('fast', function () {
            $(this).remove();
        });
    });
};
