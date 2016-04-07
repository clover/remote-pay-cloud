function CookiePersistance(configurationName) {
    this.configurationName = "_DEFAULT";
    if(configurationName) {
        this.configurationName = configurationName;
    }

    this.load = function() {
        return CookiePersistance.load(this.configurationName);
    };

    this.persist = function(configuration) {
        return CookiePersistance.persist(this.configurationName, configuration, true);
    }
}

CookiePersistance.persist = function (configurationName, configuration, saveURL) {
    var cvalue = JSON.stringify(configuration);
    var jsonValue = JSON.parse(cvalue);
    if (!saveURL) {
        delete jsonValue.deviceURL;
    }
    cvalue = JSON.stringify(jsonValue);

    var exdays = 2;
    CookiePersistance.setCookie(configurationName, cvalue, exdays);
    return jsonValue;
};

CookiePersistance.load = function (configurationName) {
    // We have no configuration at all.  Try to get it from a cookie
    var configuration = null;
    var cvalue = CookiePersistance.getCookie(configurationName);
    if (cvalue) {
        configuration = JSON.parse(cvalue);
    }
    return configuration;
};

CookiePersistance.setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

CookiePersistance.getCookie = function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
};


//
// Expose the module.
//
if ('undefined' !== typeof module) {
    module.exports = CookiePersistance;
}

