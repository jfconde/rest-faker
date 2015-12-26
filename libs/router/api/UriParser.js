/**
 * Faker - libs/router/api/UriParser.js
 *
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.router.api.UriParser
 * @description Module used to inspect the request URI and determine which Resource must be used, its path and other
 * necessary request parameters, such as identifying which parts of the URI refer to Resource IDs.
 */
var UriParser = function(){};
var fs = require('fs-extra');

/**
 * @description Given a model, return an object exposing only the data fields necessary for JSON exporting.
 * @memberof Faker.router.api.UriParser
 * @public
 * @instance
 * @returns {Object} An object if successful, null otherwise. This return object contains the following fields:
 * resourcePath: the path to the Resource JSON file to load, id: the Resource ID to load, params: request parameters,
 * body: request body, query: query string parameters passed in the URL.
 */
var parseUri = function(request){
	var uriData = { method: request.method },
        uriParts,
        serverName = request.params['serverName'],
        basePath = [GLOBAL.config.path.appServers, serverName].join("/"),
        idNext = false,
        resourceFile;

    // Start processing the different parts that compose the Uri.
    uriParts = request.params['0'].split('/');
    if(uriParts[uriParts.length-1].length === 0)
        uriParts.splice(uriParts.length-1);

    // Process each part of the URI, originally separated with /.
    for(var i = 0; i < uriParts.length; i++) {
        var uriPart = uriParts[i];

        // If the current URI part we are processing is an id.
        if(idNext){
            if(i === uriParts.length-1) { // Last URI part?
                // In this case, this is the id to use with the loaded resource.
                uriData.resourcePath = basePath + ".json";
                uriData.id = uriPart;
                uriData.params = request.params;
                uriData.query = request.query;
                uriData.body = request.body;

                return uriData;
            }else{
                // If this is not the ID of the last resource in the URI, then we must obviate it (faker does not
                // support accessing and managing nested data yet).
                idNext = false;
                continue;
            }
        }

        try {
            // Reached this point, the current URI part should be added to the filesystem path.
            basePath += "/" + uriPart;
            // We try to read the json definition of that resource. If it fails, further check will be
            // performed in the catch block.
            resourceFile = (fs.readFileSync(basePath + ".json"));
            // We could try to instantiate a model with its fields and data, but in this case we just
            // want to read a top level attribute of the .json file.
            var resourceConfig = JSON.parse(resourceFile);

            if(i === uriParts.length-1) { // Last URI part?
                // In this case, this is the resource that must be loaded. No id will be used.
                uriData.resourcePath = basePath + ".json";
                uriData.id = null;
                uriData.params = request.params;
                uriData.body = request.body;
                uriData.query = request.query;
                return uriData;
            }

            // Given the resource definition as a JS (JSON parsed) object, check whether it uses ID parameters or not.
            idNext = (resourceConfig.useId ? true : false);
        }
        catch(Ex){
            // In this case we could not open correctly the resource definition, but if this is not the last part of
            // the URI, the current part could just be pointing to a folder.

            if(i === uriParts.length-1) { // Last URI part?
                // In this case, even if the current path was a folder, we will not have a resource definition to load
                // under that folder. Log the error.
                GLOBAL.logDebug('Parsing request to ' + request.originalUrl + ' failed. Unable to read ' + basePath);
                return null;
            }

            if(!fs.existsSync(basePath)){
                // If the folder does not exist, further parsing is impossible.
                GLOBAL.logDebug('Parsing request to ' + request.originalUrl + ' failed. Unable to read ' + basePath);
                return null;
            }
        }
    }
}

module.exports = {
    parseUri : parseUri
}