var express = require('express');
var chalk = require('chalk');
var bodyParser = require('body-parser');
var cors = require('cors');
 //  ___     _
 // | __|_ _| |_____ _ _
 // | _/ _` | / / -_) '_|
 // |_|\__,_|_\_\___|_|  v0.1
 // -------------------------
 /**
  * Fake REST dev server
  * @author Juan Carlos Fernández <fconde.j@gmail.com>
  * @version 0.1
  * @fileOverview This is the entry point and main file for the initialization of
  * the faker server. It launches the boot process and sets up the underlying
  * express server.
  * @augments express server
  */
var faker = express();

/**
 * @memberof faker
 * @description Logs a message in yellow using the <strong>chalk</strong> Node.js module.
 * @param {String} msg the message to be printed.
 */
var pLog = function(msg){
    console.log(chalk.white(msg));
}

 /**
  * @description Initialization function, main for running the faker/expres server.
  * @memberof faker
  */
faker.init = function(){
    // Read configuration files and set up all the necessary stuff.
    pLog("----------------------------------------------------------------");
    pLog("FAKER");
    pLog("----------------------------------------------------------------");
    pLog("Boot routines starting...");
    var boot = require('./libs/boot/Boot');
    // Inspect the boot result.
    pLog("Boot routines finished. Status: " + (boot ? chalk.green("OK") : chalk.red("ERROR")));
    pLog("Version: " + chalk.cyan(GLOBAL.getVersion()));
    pLog("----------------------------------------------------------------");
    faker.use(cors());
    faker.use(bodyParser.json());           // to support JSON-encoded bodies
    faker.use(bodyParser.urlencoded({       // to support URL-encoded bodies
        extended: true
    }));

    // Bind the API router to our express server.
    faker.bindApiRouter();
    // Serve the configured static files.
    faker.serveStaticFiles();
    // Finally, start listening on the pre-configured port.
    faker.listen(GLOBAL.config.port);
    // Logging
    pLog("Faker:          " + chalk.cyan(GLOBAL.appUrl));
    pLog("API:            " + chalk.cyan(GLOBAL.apiUrl));
    pLog("Web frontend:   " + chalk.cyan(GLOBAL.staticUrl));
    pLog("----------------------------------------------------------------");
};

 /**
  * @description Build an API router and then set it up to handle requests under the API mount point
  * defined in <strong>mountpoint.API</strong> in <strong>config.json</strong>.
  */
faker.bindApiRouter = function(){
    var self = this;
    // Require the API router.
    var apiRouter = require('./libs/router/Api');
    // Use this router to handle API requests.
    self.use(GLOBAL.config.mountpoint.API, apiRouter);
};

 /**
  * @description Set up static files served under the mount point defined in <strong>mountpoint.static</strong> in
  * <strong>config.json</strong>.
  */
faker.serveStaticFiles = function(){
    var self = this;
    self.use(GLOBAL.config.mountpoint.static, express.static (GLOBAL.config.path.static));
};

// Here we go!
faker.init();