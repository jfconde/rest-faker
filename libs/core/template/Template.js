/**
 * Faker - libs/core/template/Template
 *
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.core.template.Template
 * @description Template class, used to format all API responses using an specific layout. The following keywords
 * can be used in the JSON template as property values and they will then be replaced by their values:
 * - {data} : the data returned after processing the request.
 * - {info} : in case something went wrong, a message containing information about what happened.
 * - {success} : a boolean indicating whether processing the request went fine or not.
 * - {total} : the number of items returned.
 */
function Template(templateObject) {
    var self = this;
    self.totalPath = null;
    self.dataPath = null;
    self.infoPath  = null;
    self.successPath = null;

    self.parse(templateObject);
}

var methods = Template.prototype;

/**
 * @description Instantiates a Template loading a JSON definition from a local file.
 * @memberof Faker.core.template.Template
 * @param {String} filePath the path of the file containing the template definition in JSON format.
 * @returns {Template} A Template object working with the loaded JSON object.
 */
Template.loadFromFile = function(filePath) {
    var fs = require('fs-extra'),
        templateFile,
        templateJSON;

    try{
        templateFile = fs.readFileSync(filePath);
        templateJSON = JSON.parse(templateFile);
        return new Template(templateJSON);
    }
    catch(Ex){
        console.log(Ex);
        return null;
    }
};

/**
 * @description Reads a JS object and tries to find the path to the properties which will be placeholders for
 * template values.
 * @memberof Faker.core.template.Template
 * @instance
 * @param {Object} templateObj the object representation of the template.
 */
methods.parse = function(templateObj) {
    var self = this;

    if(!templateObj)
        return;

    self.templateObject = templateObj;

    self.totalPath = Template.findPath("{count}", self.templateObject, null);
    self.dataPath = Template.findPath("{data}", self.templateObject, null);
    self.infoPath = Template.findPath("{info}", self.templateObject, null);
    self.successPath = Template.findPath("{success}", self.templateObject, null);
};

/**
 * @description Given an object, recursively examines it searching for a specific property value.
 * @memberof Faker.core.template.Template
 * @public
 * @param {String}   target The value expression we are looking for.
 * @param {Object}   curObj The current object we are examining.
 * @param {String}   curPath The path used to get to the current JS object.
 * @returns {String} Path to the found  property value.
 */
Template.findPath = function(target, curObj, curPath) {
    var resultObj = null;

    for(var property in curObj){
        if(curObj[property] === target){
            return (curPath !== null ? curPath + "." + property : property);
        }else if(typeof(curObj[property]) === "object"){
            resultObj = Template.findPath(target, curObj[property], (curPath !== null ? curPath + "." + property : property));

            if(resultObj != null){
                return resultObj;
            }
        }
    }
    return null;
};

/**
 * @description Sets the value of the property specified by path in curObject. Using for placing final values in the
 * object.
 * @public
 * @memberof Faker.core.template.Template
 * @param {Object} curObj The object in which the value will be set.
 * @param {String} path The path in object to reach the required property.
 * @param {Object} value The value to assign to such property.
 * @returns {boolean} True if the value could be set. False otherwise.
 */
Template.applyValue = function(curObj, path, value){
    if(typeof(path) === "string")
        path = path.split(".");

    try{
        for(var i = 0; i < path.length; i++){
            var curTarget = path[i];
            if(i < path.length-1){
                curObj = curObj[curTarget];
                continue;
            }else{
                curObj[curTarget] = value;
                return true;
            }
        }
    }
    catch(Ex){
        return false;
    }

    return false;
}

/**
 * Generates an object in which, if present, the data, success, count and limit properties have been correctly set.
 * @public
 * @instance
 * @memberof Faker.core.template.Template
 * @param {Object} data Value for the data property.
 * @param {Boolean} success Value for the success property.
 * @param {count} Value of the count property
 * @param {String} info Value of the info property.
 * @returns {Object} An object in which the specified properties, if present, have been set.
 */
methods.export = function(data, success, count, info){
    var self = this,
        templateInstance;

    if(!self.templateObject)
        return data;

    templateInstance = JSON.parse(JSON.stringify(self.templateObject));

    if(self.dataPath)
        Template.applyValue(templateInstance, self.dataPath, data);

    if(self.totalPath)
        Template.applyValue(templateInstance, self.totalPath, count);

    if(self.infoPath)
        Template.applyValue(templateInstance, self.infoPath, info);

    if(self.successPath)
        Template.applyValue(templateInstance, self.successPath, success);

    return templateInstance;
};

module.exports = Template;