
/**
 * Base URL of the server that offers the API.
 */
var base_url = 'https://btranslator.org';

/**
 * Extend the function http_request().
 */
var make_http_request = http_request;
var http_request = function(url, settings) {
    // If parameter settings is not given, assign a default value.
    var settings = settings || {};

    // Before sending the request display a loading icon.
    settings.beforeSend = function() {
        $.mobile.loading('show');
        return true;
    };

    // Make the request and handle some common cases.
    var request = make_http_request(base_url + url, settings);
    request.always(function(){
        // Hide the loading icon.
        $.mobile.loading('hide');
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
        console.log(errorThrown);
    });

    return request;
}
