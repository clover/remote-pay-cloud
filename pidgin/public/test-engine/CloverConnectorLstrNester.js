// create() returns the public interface.
const create = () => {
    return {
        nestAndTest: function (testConfig) {
            if (!testConfig || Object.keys(testConfig).length === 0) {
                // try looking at the testConfig.json file.
                jQuery.ajax({
                    type: "GET",
                    url: "../testConfig.json",
                    error: (xhr, status, message) => {
                        console.log(`An error has occurred and the connection configuration could not be loaded: Details ${message}.`)
                    }
                }).done(testConfig => {
                    loadAndRunTests(testConfig);
                });
            } else {
               loadAndRunTests(testConfig);
            }
        }
    }
};

export {create}

// Private members

var loadAndRunTests = function(testConfig) {
    loadTests(testConfig).done((testDefinitionResponse) => {
        if (validateTestDefinitionResponse(testDefinitionResponse)) {
           console.log("ready to rip");
        }
    });
};

var validateTestDefinitionResponse = function(testDefinitionResponse) {
    if (!testDefinitionResponse || testDefinitionResponse.status !== "success") {
        console.log(`An error occurred retrieving the test definitions: Details: ${testDefinitionResponse.message}`);
        return false;
    }
    return true;
};

/**
 * Loads the test definitions returns a Promise.
 *
 * @returns {*}
 */
var loadTests = function (testConfig) {
    if (testConfig && testConfig.definitionEndpoint) {
        // JQuery provided globally via a webpack plugin - https://stackoverflow.com/questions/40035976/how-to-configure-and-use-jquery-with-webpack
        return jQuery.ajax({
            type: "GET",
            url: testConfig.definitionEndpoint,
            error: (xhr, status, message) => {
                console.log(`An error has occurred and the test definitions could not be loaded: Details ${message}.`)
            }
        });
    } else {
        console.log("Cannot load test definitions.  Either no test configuration exists or a definitionEndpoint is not specified on the test configuration.");
    }

};


