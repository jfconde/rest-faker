var Template = require('../template/Template');
/**
 * Faker - libs/core/model/Model.js
 *
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.core.model.Model
 * @description Represents a model class, keeping all the class information. It can also instantiate objects (models)
 * from that class, which will inherit this information.
 * @param {Object} config An object containing a basic model definition.
 */
function Model(config){
    var self = this,
        allowedActions = ["GET", "POST", "PUT", "DELETE"];

    if(config.instantiate && config.fields){
        self.fields = config.fields;
        return true;
    }

    // In self.fields we will store the field definition for this model. These
    // will be reused by all model instances.
    self.fields = {};
    // In self.fieldValues we will store the field values for this model. Unlike
    // self.fields, this attribute is instance-specific.
    self.fieldValues = {};

    // We need a fields array.
    if(!config.fields)
        throw "FIELDS_NOT_DEFINED";

    // With at least 1 element.
    if(!config.fields.length)
        throw "FIELDS_ERROR";

    var Field = require('./Field');

    config.fields.forEach(function(fieldInfo){
        if(fieldInfo.type && fieldInfo.name){
            var field = new Field(fieldInfo);
            self.fields[fieldInfo.name] = field;
            self.fieldValues[fieldInfo.name] = null;
        }else{
            // type and name must always be present in a field definition.
            throw "BAD_FIELD_DEFINITION";
        }
    });

    // The allowed actions for which this model is available.
    if(config.actions){
        allowedActions = [];
        config.actions.forEach(function(action){
            if(typeof(action) !== "string")
                return;

            allowedActions.push(action.toUpperCase());
        });
    }

    if(config.idParam){
        self.idParam = config.idParam;
    }

    if(config.template){
        try{
            self.template = Template.loadFromFile([GLOBAL.config.path.templates, config.template + ".json"].join("/"));
        }
        catch(ex){
            console.log("y");
            self.template = new Template();
        }
    }else{
        console.log("z");
        self.template = new Template();
    }

    self.limitParam     = config.limitParam    || GLOBAL.config.defaults.params.limit;
    self.startParam     = config.startParam    || GLOBAL.config.defaults.params.start;
    self.pageParam      = config.pageParam     || GLOBAL.config.defaults.params.page;
    self.sortersParam   = config.sortersParam  || GLOBAL.config.defaults.params.sorters;
    self.allowedActions = allowedActions;
};

var methods = Model.prototype;

/**
 * @description Opens up the file in filePath for reading and parsing as JSON, then creates a model instance with
 * that JSON object used as configuration.
 * @memberof Faker.core.model.Model
 * @param {String} filePath The path to the JSON file containing the model properties.
 * @public
 * @returns {Faker.core.model.Model} A model using the provided configuration.
 */
Model.loadFromFile = function(filePath) {
    var fs = require('fs-extra'),
        resourceFile,
        resourceJSON;

    try{
        resourceFile = fs.readFileSync(filePath);
        resourceJSON = JSON.parse(resourceFile);
        return new Model(resourceJSON);
    }
    catch(Ex){
        console.log(Ex);
        return null;
    }
};

/**
 * @description Set function, proxy to the field's set function.
 * @memberof Faker.core.model.Model
 * @instance
 * @param {String} field The name of the field.
 * @param {Object} value The new value for this field.
 * @returns {Boolean} True if the field was modified. False otherwise.
 */
methods.set = function(field, value) {
    var self = this;
    if(!self.fields[field])
        return false;

    return self.fields[field].set(value, self.fieldValues);
};

/**
 * @description Updates all the fields with the values in fieldValues.
 * @memberof Faker.core.model.Model
 * @instance
 * @param {Object} fieldValues A hash-table (object) with the values for the fields.
 * @returns {Boolean} True if at least one field was modified.
 */
methods.update = function(fieldValues){
    var self = this,
        modified = false;

    for(var field in self.fields){
        if(fieldValues.hasOwnProperty(field)){
            if(self.set(field, fieldValues[field]))
                modified = true;
        }
    }
    return modified;
}

/**
 * @description Get the value of a field.
 * @memberof Faker.core.model.Model
 * @instance
 * @param {String} field The name of the field.
 * @returns {Object} The value of the field.
 */
methods.get = function(field) {
    var self = this;
    if(!self.fields[field])
        return null;

    return self.fields[field].get(self.fieldValues);
};

/**
 * @description Instantiates a model of this same class, keeping a reference to this model's fields, but using
 * its own field values.
 * @param {Object} data The initial data for the fields.
 * @returns {Faker.core.model.Model}
 */
methods.instantiate = function(data) {
    var self = this,
        modelInstance = new Model({fields: self.fields, instantiate: true});

    modelInstance.fieldValues = {};

    for(var property in data){
        if(modelInstance.fields[property]){
            modelInstance.fields[property].set(data[property], modelInstance.fieldValues);
        }
    }

    return modelInstance;
};

module.exports = Model;