
/**
 * Extend the function $.ajax().
 */
var http_request = function(url, settings) {
    // If parameter settings is not given, assign a default value.
    var settings = settings || {};

    // Set some parameters of the ajax request.
    settings.url = $config.api_url + url;
    settings.dataType = 'json';
    // Before sending the request display a loading icon.
    settings.beforeSend = function() {
        $.mobile.loading('show');
        return true;
    };

    // Make the request and handle some common cases.
    var request = $.ajax(settings);
    request.always(function(){
        // Hide the loading icon.
        $.mobile.loading('hide');
    });
    request.fail(function(jqXHR, errorThrown, textStatus) {
        //console.log(jqXHR);  //debug
        //console.log(textStatus);  //debug
        //console.log(errorThrown);  //debug
        if (jqXHR.responseJSON) {
            if (jqXHR.responseJSON.error) {
                message(jqXHR.responseJSON.error + ': ' + jqXHR.responseJSON.error_description, 'error');
            }
            else {
                message(jqXHR.responseJSON[0], 'error');
            }
        }
        else {
            message(textStatus, 'error');
        }
    });

    return request;
};
