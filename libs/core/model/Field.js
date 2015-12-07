//  ___     _
// | __|_ _| |_____ _ _
// | _/ _` | / / -_) '_|
// |_|\__,_|_\_\___|_|  v0.1
// -------------------------
/**
 * @author Juan Carlos Fernández <fconde.j@gmail.com>
 * @version 0.1
 * @class Faker.core.model.Field
 * @description Represents a model field, keeping info about its type, how to convert values to that type, and
 * ability to apply it to a field instance.
 * @param {Object} config An object containing a basic model definition, including the following properties: type,
 * name, and optionally a custom convert function.
 */
function Field(config) {
    var self = this;

    if(!config.type || types.indexOf(config.type) < 0)
        throw "TYPE_NOT_DEFINED";

    if(!config.name)
        throw "NAME_NOT_DEFINED";

    // We have a default type definition.
    self._convert = defaultConverters[config.type];
    self.type = config.type;
    self.value = null;
    self.name = config.name;

    if(config.convert && typeof(config.convert) === "function")
        self.convertFn = config.convert;
}

var methods = Field.prototype;
// Pre-defined types.
var types = ['int', 'string', 'float', 'date', 'boolean', 'auto'];

/**
 * @description Sets the value of the field in a field values object, used by models.
 * @memberof Faker.core.model.Field
 * @instance
 * @param {Object} value The new value for the field.
 * @param {Object} valueObj The values object in which it will be set.
 * @returns {boolean} True if the value could be set. False otherwise.
 */
methods.set = function(value, valueObj) {
    if(!valueObj) return false;
    var tmpValue = value;
    // First, if we have a convertFn, we must call it.
    if(this.convertFn){
        try{
            tmpValue = this.convertFn(tmpValue);
        }
        catch(Exception){}
    }

    try{
        tmpValue = this._convert(tmpValue);
        valueObj[this.name] = tmpValue;
        return true;
    }
    catch(Exception){
        valueObj[this.name] = tmpValue;
        return false;
    }
};

/**
 * @description Gets the value of the field from a field values object, used by models.
 * @memberof Faker.core.model.Field
 * @public
 * @instance
 * @param {Object} valueObj The values object from which it will be read.
 * @returns {Object} The value of this field in the field values obejct.
 */
methods.get = function(valueObj) {
    if(!valueObj) return null;
    return valueObj[this.name];
};

module.exports = Field;

// Default converter functions for pre-defined types.
var defaultConverters = {
    string: function(value) {
        if(value === undefined || value === null)
            return null;

        if(value.toString) return value.toString();

        return null;
    },

    int: function(value) {
        try {
            var n = parseInt(value);
            return isNaN(n) ? null : n;
        }

        catch(Exception) {
            return null;
        }
    },

    float: function(value) {
        try {
            var n = parseFloat(value);
            return isNaN(n) ? null : n;
        }

        catch(Exception) {
            return null;
        }
    },

    date: function(value) {
        try {
            return new Date(value);
        }

        catch(Exception) {
            return null;
        }
    },

    boolean: function(value) {
        if(value === 0 || value === undefined || value === null || value === false)
            return false;
        return true;
    },

    auto: function(value) {
        return value;
    }
};