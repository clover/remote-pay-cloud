
/**
 * A utility class to create Clover compatible identifiers, and guids.
 *
 * @constructor
 */

function CloverID() {
}

CloverID.ID_LENGTH = 13;

// http://www.crockford.com/wrmg/base32.html

/**
 * The legal set of characters used to generate a clover id.
 * @type {string[]}
 */
CloverID.BASE_32_DIGITS = [
    '0', '1', '2', '3', '4', '5',
    '6', '7', '8', '9', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H',
    'J', 'K', 'M', 'N', 'P', 'Q',
    'R', 'S', 'T', 'V', 'W', 'X',
    'Y', 'Z'
];

/**
 * @returns {string} a clover compatible ID.
 */
CloverID.getNewId = function() {
    var id = "";
    for (var index = 0; index < CloverID.ID_LENGTH; index++) {
        id += CloverID.BASE_32_DIGITS[Math.floor(Math.random() * CloverID.BASE_32_DIGITS.length)];
    }
    return id;
};

/**
 *
 * @param {string} id - a string id to test
 * @returns {boolean} true if the id is a clover compatible ID.
 */
CloverID.isValidBase32Id = function(id){
    if (id == null || id.length != CloverID.ID_LENGTH) {
        return false;
    }
    for (var i = 0; i < id.length; i++) {
        if (-1 == CloverID.BASE_32_DIGITS.indexOf(id.charAt(i))) {
            return false;
        }
    }
    return true;
}

/**
 *
 * @returns {string} a guid - see https://en.wikipedia.org/wiki/Globally_unique_identifier
 */
CloverID.guid = function() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CloverID;
}
