/**
 * Faker - libs/router/Api.js
 */

// Require Node modules
var express = require('express');
// Require dependencies
var uriParser = require('./api/UriParser');
var resource = require('./api/Resource');

/**
 * @class Faker.router.api
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @description Returns a generic router that will handle API requests, parsing their URI and then
 * applying the specific logic according to the necessary JSON configuration file.
 * @returns {express.Router} a router used for handling API requests.
 */
var router = express.Router();

// This function will try to handle all API requests to resources.
var processRequest = function(req, res){
    var apiRequest = uriParser.parseUri(req);
    if(apiRequest){
        // The request seems valid, and now it's time to process this resource.
        var responseObj = resource.process(apiRequest);
        res.send(JSON.stringify(responseObj));
        res.end();
    }else{
        // The request is not valid.
        GLOBAL.logError('Unable to handle request to ' + req.originalUrl);
        res.send('Error: Unable to handle request.');
        res.status(404);
        res.end();
    }
}

// Specify a middleware for this router. This is useful for executing actions every time an API request is received,
// and before it is processed.
router.use(function timeLog(req, res, next) {
    // Log in a
  	GLOBAL.logInfo('API request from <' + req.hostname + '> @ '+ req.originalUrl);
  	next();
});

// Logic for handling requests to the root (/api/) API uri.
router.get('/', function(req, res) {
  	res.send('Faker API');
});

// Generic, dynamic logic to execute for all API requests.
router.all('/:serverName/*', processRequest);

module.exports = router;