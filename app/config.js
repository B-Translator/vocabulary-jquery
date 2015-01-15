/**
 * Used for the local storage, etc.
 */
var $app_id = 'vocabulary';

/**
 * Base URL of the server that offers the API.
 */
var $base_url = 'https://btranslator.org';

/**
 * Settings for oauth2 authentication.
 */
var $oauth2_settings = {
    app_id: $app_id,
    token_endpoint: '/oauth2/token',
    client_id: 'vocabulary-jquery-ict-sq',
    client_secret: 'Wadek9kAwgoovnepecOal8',
    scope: 'user_profile',
};

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
    var request = make_http_request($base_url + url, settings);
    request.always(function(){
        // Hide the loading icon.
        $.mobile.loading('hide');
    });
    request.fail(function(jqXHR, textStatus, errorThrown) {
        console.log('Error: ' + jqXHR.responseJSON.error + ': ' + jqXHR.responseJSON.error_description);
    });

    return request;
}
