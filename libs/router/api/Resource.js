//  ___     _
// | __|_ _| |_____ _ _
// | _/ _` | / / -_) '_|
// |_|\__,_|_\_\___|_|  v0.1
// -------------------------
/**
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.router.api.Resource
 * @description The module in charge of dynamically processing requests which involve querying, reading, updating,
 * deleting, creating, etc. of Resources.
 */
var Resource = function(){};

// Require dependencies
var Store = require('../../core/store/Store');
var ModelFormatter = require('../../util/ModelFormatter');

/**
 * @description Given a request, parsed by the UriParser module, executes the required logic (loading models / stores,
 * modifying items and persisting changes) and returns an object which will later be converted to JSON and sent in the
 * response.
 * @memberof Faker.router.api.Resource
 * @public
 * @static
 * @returns {Object} The resulting object for the request (ready for JSON conversion).
 */
var process = function(apiRequest){
	//GLOBAL.logDebug(apiRequest.method);
	var store = Store.loadFromFile(apiRequest.resourcePath),
		requestMethod = apiRequest.method.toUpperCase();

	// Check if the action is allowed for this model/store.
	if(store.model.allowedActions.indexOf(requestMethod) < 0){
		// The action is not allowed.
		GLOBAL.logError('The action ' + requestMethod + ' is not allowed for this resource.');
		return null;
	}else{
		var responseObj;
		switch(requestMethod){
			case 'GET':			// Read
				responseObj = processGet(apiRequest, store);
				break;
			case 'POST': 		// Create
				responseObj = processPost(apiRequest, store);
				break;
			case 'PUT':   		// Update
				responseObj = processPut(apiRequest, store);
				break;
			case 'DELETE': 		// Delete
				responseObj = processDelete(apiRequest, store);
				break;
		}

		return responseObj;
	}
};

/**
 * @description Performs the necessary logic for processing GET requests.
 * @memberof Faker.router.api.Resource
 * @private
 * @static
 * @returns {Object} The resulting object for the request (ready for JSON conversion).
 */
var processGet = function(apiRequest, store){
	var dataObj, info, model, queryCount, query;
	// ID access
	if(apiRequest.id){
		if(!store.model.idParam){
			info = 'Trying to read model by ID, but not possible.';
			GLOBAL.logError(info);
			return store.model.template.export(null, false, 0, info);
		}else{
			// The model uses an id param, that is OK.
			model = store.find(apiRequest.id);
			if(model){
				dataObj = ModelFormatter.formatModel(model);
				GLOBAL.logSuccess('OK. Returned 1 model.')
				return store.model.template.export(dataObj, true, 1, null);
			}else{
				info = 'Trying to read model by ID, but value not found.';
				GLOBAL.logError(info);
				return store.model.template.export(null, false, 0, info);
			}

		}
	}else{
		// Every register must be processed.
		query = store.loadQuery(apiRequest);
		dataObj = ModelFormatter.formatAll(query.data);
		GLOBAL.logSuccess('OK. Returned '+ dataObj.length +' model/s.')
		return store.model.template.export(dataObj, true, query.count, null);
	}
};

/**
 * @description Performs the necessary logic for processing POST requests.
 * @memberof Faker.router.api.Resource
 * @private
 * @static
 * @returns {Object} The resulting object for the request (ready for JSON conversion).
 */
var processPost = function(apiRequest, store){
    var body = apiRequest.body,
        newModel,
		resultObj,
		info;

    newModel = store.add(body);

    if(newModel){
        store.sync();
        resultObj = ModelFormatter.formatModel(newModel);
		GLOBAL.logSuccess("OK. Returned 1 model.")
		return store.model.template.export(resultObj, true, 1, null);
    }else{
		info = 'Could not parse POST params for this model correctly.';
		GLOBAL.logError(info);
		GLOBAL.logSuccess("OK. Returned 0 models.")
		return store.model.template.export(null, false, 0, info);
    }
};

/**
 * @description Performs the necessary logic for processing PUT requests.
 * @memberof Faker.router.api.Resource
 * @private
 * @static
 * @returns {Object} The resulting object for the request (ready for JSON conversion).
 */
var processPut = function(apiRequest, store){
	var body = apiRequest.body,
		model = store.find(apiRequest.id),
		resultObj,
		info;

		if(model){
			model.update(apiRequest.body);
			store.sync();
			resultObj = ModelFormatter.formatModel(model);
			GLOBAL.logSuccess("OK. Returned 1 model.")
			return store.model.template.export(resultObj, true, 1, null);
		}

	info = 'Trying to read model by ID for updating failed.';
	GLOBAL.logError(info);
	return store.model.template.export(null, false, 0, info);
};

/**
 * @description Performs the necessary logic for processing DELETE requests.
 * @memberof Faker.router.api.Resource
 * @private
 * @static
 * @returns {Object} The resulting object for the request (ready for JSON conversion).
 */
var processDelete = function(apiRequest, store){
	var resultObj,
		info;

    if(apiRequest.id){
        var index = store.indexOfId(apiRequest.id);
        if(index >= 0 && store.remove(index)){
            store.sync();
			GLOBAL.logSuccess("OK. Returned 0 models.")
			return store.model.template.export({}, true, 0, null);
        }else{
			info = 'Trying to read model by ID for deleting failed.';
			GLOBAL.logError(info);
			return store.model.template.export(null, false, 0, info);
		}
    }else{
        info = 'Trying to DELETE a model without an ID.';
		GLOBAL.logError(info);
		return store.model.template.export(null, false, 0, info);
    }
};

module.exports = {
	process: process
};