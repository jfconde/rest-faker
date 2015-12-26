// Require dependencies
var Model = require('../model/Model');
var ModelFormatter = require('../../util/ModelFormatter');
/**
 * Faker - libs/core/store/Store.js
 *
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.core.store.Store
 * @description Represents a Store, a collection of models well defined by a resource file (the resource definition
 * in JSON in the servers folder).
 * @param {Object} config An object containing a basic store definition, with these properties: resourceModel,
 * resourcePath and data.
 */
function Store(config){
	var self = this;
	self.model = config.resourceModel;
	self.resourcePath = config.resourcePath;
	self.data = [];

	self.limitParam = self.model.limitParam || GLOBAL.config.defaults.params.limit;
	self.startParam = self.model.startParam || GLOBAL.config.defaults.params.start;
	self.pageParam  = self.model.pageParam  || GLOBAL.config.defaults.params.page;
	self.sortersParam  = self.model.sortersParam  || GLOBAL.config.defaults.params.sorters;

	self.loadData(config.data);
};

var methods = Store.prototype;

/**
 * @description Instantiate a store reading its data from the resource JSON loaded from filePath.
 * @memberof {Faker.core.store.Store}
 * @param {String} filePath The path to the file containing the Resource (model/store) definition.
 * @returns {Faker.core.store.Store} The new store.
 */
Store.loadFromFile = function(filePath) {
	// First, we need to try to load the model.
    var fs = require('fs-extra'),
        resourceFile,
        resourceJSON,
        resourceModel;

    try{
        resourceFile = fs.readFileSync(filePath);
        resourceJSON = JSON.parse(resourceFile);
		resourceModel = new Model(resourceJSON);
		var store = new Store({
			resourcePath: filePath,
			resourceModel: resourceModel,
			data: resourceJSON.data
		});
		return store;
    }
    catch(Ex){
        console.log(Ex);
        return null;
    }
}

/**
 * @description Gets the number of items in the store.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @returns {Int} The number of items in the store.
 */
methods.getCount = function(){
	return this.data.length;
};

/**
 * @description Gets the element of the store at the specified index.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @param {Int} index The index of the element in the store.
 * @returns {Model} The model corresponding to the item at the specified index.
 */
methods.getAt = function(index){
	return this.data[index];
};

/**
 * @description Search for an element whose Id equals the specified.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @param {Object} value The value of the needed Id field.
 * @returns {Model} Such element, as a model, if it exists.
 */
methods.find = function(value){
    var self = this,
        idParam = self.model.idParam,
        result = null;

    if(!idParam)
        return null;

    this.data.forEach(function(modelInstance){
        if(!result && modelInstance.get(idParam).toString() === value.toString())
            result = modelInstance;
    });

    return result;
};

/**
 * @description Gets the index of an item with an Id equal to the value specified.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @param {Object} value The value of the needed Id field.
 * @returns {Int} The index of the element in the store, or null if not present.
 */
methods.indexOfId = function(value){
	var self = this,
		idParam = self.model.idParam,
		resultIndex = null;

	if(!idParam)
		return null;

	this.data.forEach(function(modelInstance, index){
		if(!resultIndex && modelInstance.get(idParam) === value)
			resultIndex = index;
	});

	return resultIndex;
};

/**
 * @description Remove the element at the posicion specified by index in the store.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @param {Int} The index of the element in the store to be removed.
 * @returns {Boolean} True if the element was removed. False otherwise.
 */
methods.remove = function(index){
	var self = this;

	if(index >= 0 && index < self.data.length){
		self.data.splice(index, 1);
		return true;
	}else{
		return false;
	}
};

/**
 * @description Remove all the elements from the store.
 * @memberof {Faker.core.store.Store}
 * @instance
 */
methods.removeAll = function(){
	var self = this;
	self.data = [];
}

/**
 * @description Retrieves the index of the element in the store whose Id is the same as the id of lookupModelInstance.
 * @memberof {Faker.core.store.Store}
 * @instance
 * @param {Faker.core.model.Model} lookupModelInstance The model for which we are finding its Id.
 * @returns {Int} The index of the model in the store, if found. Null otherwise.
 */
methods.indexOf = function(lookupModelInstance){
	var self = this,
		idParam = self.model.idParam,
		modelId = idParam ? lookupModelInstance.get(idParam) : null,
		resultIndex = null;

	if(!idParam || modelId)
		return null;

	this.data.forEach(function(modelInstance, index){
		if(!resultIndex && modelInstance.get(idParam) === modelId)
			resultIndex = index;
	});

	return resultIndex;
};

/**
 * @description Instantiate a model with the provided data and then add it to the store.
 * @instance
 * @memberof Faker.core.store.Store
 * @param {Object} dataObj The initial set of data for the model.
 * @returns {Faker.core.model.Model}
 */
methods.add = function(dataObj){
	var self = this,
		newModel;

	newModel = self.model.instantiate(dataObj);
	if(newModel){
		this.data.push(newModel);
		return newModel;
	}

	return null;
};

/**
 * @description Given an array with configuration for several models, instantiate each of them and add them to the
 * store.
 * @instance
 * @memberof Faker.core.store.Store
 * @param {Array} dataObj An array with data for each item to add.
 * @returns {Boolean} True if operation succeeded. False otherwise.
 */
methods.loadData = function(dataObj){
	var self = this;

	// Examine the existence and type of dataObj.
	if(!dataObj || dataObj.constructor !== Array)
		return false;

    self.data = [];

	// Now we can iterate over dataObj, knowing it is an instance of Array.
	dataObj.forEach(function(rawItem){
		var modelInstance = self.model.instantiate(rawItem);

		if(modelInstance)
			self.data.push(modelInstance);
	});

    return true;

};

/**
 * @description Persists the changes made to the elements of the store in the filesystem.
 * @instance
 * @memberof Faker.core.store.Store
 * @returns {Boolean} True if operation succeded. False otherwise.
 */
methods.sync = function(){
	var self = this,
		fs = require('fs-extra'),
		resourceFile,
		resourceJSON;

	try{
	    resourceFile = fs.readFileSync(self.resourcePath);
        resourceJSON = JSON.parse(resourceFile);
	}
	catch(Ex) {
		GLOBAL.logDebug("Could not open JSON file for syncing.");
		return false;
	}

	resourceJSON.data = ModelFormatter.formatAll(self.data);

	fs.writeJson(self.resourcePath, resourceJSON, function (err) {
		console.log(err);
	});

    return true;

};

/**
 * @description Performs a basic load operation in the store. This implies applying ranges (paging) and sorting data.
 * @instance
 * @memberof Faker.core.store.Store
 * @param {Object} apiRequest The request from which query parameters must be extracted.
 * @returns {{data: Array, count: Int}} An object containing both the resulting data from the query and the number of
 * elements that matched such query before ranging/paging.
 */
methods.loadQuery = function(apiRequest){
	var self = this,
		params = apiRequest.params,
		query = apiRequest.query,
		sorters = (query.hasOwnProperty(self.sortersParam) ? query[self.sortersParam] : GLOBAL.config.defaults.sorters),
		limit = parseInt(query.hasOwnProperty(self.limitParam) ? query[self.limitParam] : GLOBAL.config.defaults.limit),
		page = parseInt(query.hasOwnProperty(self.pageParam) ? query[self.pageParam] : 1),
		start = parseInt(query.hasOwnProperty(self.startParam) ? query[self.startParam] : 0),
		count = 0,
		filteredData = self.data;

	if(limit === 0 || limit === null || limit === undefined || !limit) {
		limit = filteredData.length;
	}

	if(sorters && sorters.length){
		// We only apply 1-field sorting.
		var firstSorter = JSON.parse(sorters)[0],
			isAsc = (firstSorter.direction.toUpperCase() === "ASC");

			filteredData.sort(function(a, b){
			var vA = a.get(firstSorter.property),
				vB = b.get(firstSorter.property);

			if(vA > vB){
				return (isAsc ? -1 : 1);
			}
			if(vA < vB){
				return (isAsc ? 1 : -1);
			}
			return 0;
		});
	}

	count = filteredData.length;
	filteredData = filteredData.splice(start, limit);

	return  {data: filteredData, count: count};
};

module.exports = Store;