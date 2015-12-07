//  ___     _
// | __|_ _| |_____ _ _
// | _/ _` | / / -_) '_|
// |_|\__,_|_\_\___|_|  v0.1
// -------------------------
/**
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.util.ModelFormatter
 * @description This module is used to get the necessary model attributes for exporting its data.
 */
var ModelFormatter = function(){};

/**
 * @description Given a model, return an object exposing only the data fields necessary for JSON exporting.
 * @memberof Faker.util.ModelFormatter
 * @public
 * @static
 * @returns {Object} An object exposing only the data fields of the model.
 */
var formatModel = function(modelInstance) {
    var modelObj = {};

    if(!modelInstance)
        return null;

    for(var field in modelInstance.fields){
        modelObj[field] = modelInstance.get(field) || null;
    }

    return modelObj;
}

/**
 * @description Returns the result of formatting all the models in <strong>modelInstances</strong>.
 * @memberof Faker.util.ModelFormatter
 * @param {Array} modelInstances The list of models to format.
 * @public
 * @static
 * @returns {Array} An object exposing only the data fields of the model.
 */
var formatAll = function(modelInstances){
    var modelsObj = [];
    for(var i = 0; i < modelInstances.length; i++){
        var modelInstance = modelInstances[i];

        modelsObj.push(formatModel(modelInstance));
    }

    return modelsObj;
}

module.exports = {
    formatModel: formatModel,
    formatAll: formatAll
};