//  ___     _
// | __|_ _| |_____ _ _
// | _/ _` | / / -_) '_|
// |_|\__,_|_\_\___|_|  v0.1
// -------------------------

// Require Node modules
var fs = require('fs');                 // Filesystem
var dateFormat = require('dateformat'); // Date Formatting
var chalk = require('chalk');           // Console color formatting

/**
 * @class Faker.boot.boot
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @description Boot module, in charge of parsing the configuration file/s and set up
 * necessary resources (like variables or static functions) to be used by the application.
 * @returns {boolean} True if the boot process exited normally.
 */
var boot = function(){
    readConfigurationFile('./config.json');
    initGlobalConfig();
    return true;
};

/**
 * @memberof Boot.boot
 * @description Reads the specified configuration file (as JSON) and use the resulting
 * object as <strong>GLOBAL.config</strong>.
 * @param Path to the JSON file to be parsed.
 */
var readConfigurationFile = function(path){
    GLOBAL.config = JSON.parse(fs.readFileSync(path));
};

/**
 * @memberof Boot.boot
 * @description Sets up static variables and methods for latter use.
 */
var initGlobalConfig = function() {
    // Current faker version
    GLOBAL.version = { major: 0, minor: 1, build: 0};
    GLOBAL.getVersion = function() { return [GLOBAL.version.major, GLOBAL.version.minor, GLOBAL.version.build].join("."); };
    // The address in which we will listen.
    GLOBAL.appUrl = "localhost:" + GLOBAL.config.port;
    // The mount point (path) in which the app will serve static files.
    GLOBAL.staticUrl = [appUrl, GLOBAL.config.mountpoint.static].join("");
    // The mount point (path) in which the API URIs will be accessible.
    GLOBAL.apiUrl = [appUrl, GLOBAL.config.mountpoint.API].join("");

    // Used throughout the application to write out dates in a "more human" format.
    GLOBAL.dateFormat = function(date){
    	return dateFormat(date, GLOBAL.config.dateFormat);
    };

    // Logs application information.
    GLOBAL.logInfo = function(message){
    	var dateStr = GLOBAL.dateFormat(new Date()),
    		formatedMessage = '';

    	formatedMessage += chalk.blue('[i]' + ' [' + dateStr + '] ') + message;
    	console.log(formatedMessage);
    };

    // Logs a warning.
    GLOBAL.logWarning = function(message){
    	var dateStr = GLOBAL.dateFormat(new Date()),
    		formatedMessage = '';

    	formatedMessage += chalk.yellow('[!]' + ' [' + dateStr + '] ') + message;
    	console.log(formatedMessage);
    };

    // Logs an error.
    GLOBAL.logError = function(message){
    	var dateStr = GLOBAL.dateFormat(new Date()),
    		formatedMessage = '';

    	formatedMessage += chalk.red('[E]' + ' [' + dateStr + '] ') + message;
    	console.log(formatedMessage);
    };

    // Logs a successful operation.
    GLOBAL.logSuccess = function(message){
        var dateStr = GLOBAL.dateFormat(new Date()),
            formatedMessage = '';

        formatedMessage += chalk.green('[i]' + ' [' + dateStr + '] ') + message;
        console.log(formatedMessage);
    };

    // Logs messages only when the application is running in debug mode, as specified
    // in the <strong>debug</strong> property of config.json.
    GLOBAL.logDebug = function(message){
    	if(!GLOBAL.config.debug)
    		return;

    	var dateStr = GLOBAL.dateFormat(new Date()),
    		formatedMessage = '';

    	formatedMessage += chalk.white.bgBlue('[DEBUG]' + ' [' + dateStr + '] ' + message);
    	console.log(formatedMessage);
    }
};

module.exports.boot = boot();