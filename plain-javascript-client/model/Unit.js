/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.4.8
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ConversionStep', 'model/UnitCategory'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ConversionStep'), require('./UnitCategory'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Unit = factory(root.Quantimodo.ApiClient, root.Quantimodo.ConversionStep, root.Quantimodo.UnitCategory);
  }
}(this, function(ApiClient, ConversionStep, UnitCategory) {
  'use strict';




  /**
   * The Unit model module.
   * @module model/Unit
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>Unit</code>.
   * @alias module:model/Unit
   * @class
   * @param abbreviatedName {String} Unit abbreviation
   * @param category {module:model/Unit.CategoryEnum} Unit category
   * @param conversionSteps {Array.<module:model/ConversionStep>} Conversion steps list
   * @param maximumValue {Number} Ex: 4
   * @param name {String} Unit name
   * @param unitCategory {module:model/UnitCategory} 
   */
  var exports = function(abbreviatedName, category, conversionSteps, maximumValue, name, unitCategory) {
    var _this = this;

    _this['abbreviatedName'] = abbreviatedName;

    _this['category'] = category;


    _this['conversionSteps'] = conversionSteps;



    _this['maximumValue'] = maximumValue;


    _this['name'] = name;
    _this['unitCategory'] = unitCategory;
  };

  /**
   * Constructs a <code>Unit</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Unit} obj Optional instance to populate.
   * @return {module:model/Unit} The populated <code>Unit</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('abbreviatedName')) {
        obj['abbreviatedName'] = ApiClient.convertToType(data['abbreviatedName'], 'String');
      }
      if (data.hasOwnProperty('advanced')) {
        obj['advanced'] = ApiClient.convertToType(data['advanced'], 'Number');
      }
      if (data.hasOwnProperty('category')) {
        obj['category'] = ApiClient.convertToType(data['category'], 'String');
      }
      if (data.hasOwnProperty('categoryId')) {
        obj['categoryId'] = ApiClient.convertToType(data['categoryId'], 'Number');
      }
      if (data.hasOwnProperty('categoryName')) {
        obj['categoryName'] = ApiClient.convertToType(data['categoryName'], 'String');
      }
      if (data.hasOwnProperty('conversionSteps')) {
        obj['conversionSteps'] = ApiClient.convertToType(data['conversionSteps'], [ConversionStep]);
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('manualTracking')) {
        obj['manualTracking'] = ApiClient.convertToType(data['manualTracking'], 'Number');
      }
      if (data.hasOwnProperty('maximumAllowedValue')) {
        obj['maximumAllowedValue'] = ApiClient.convertToType(data['maximumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('maximumValue')) {
        obj['maximumValue'] = ApiClient.convertToType(data['maximumValue'], 'Number');
      }
      if (data.hasOwnProperty('minimumAllowedValue')) {
        obj['minimumAllowedValue'] = ApiClient.convertToType(data['minimumAllowedValue'], 'Number');
      }
      if (data.hasOwnProperty('minimumValue')) {
        obj['minimumValue'] = ApiClient.convertToType(data['minimumValue'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('unitCategory')) {
        obj['unitCategory'] = UnitCategory.constructFromObject(data['unitCategory']);
      }
    }
    return obj;
  }

  /**
   * Unit abbreviation
   * @member {String} abbreviatedName
   */
  exports.prototype['abbreviatedName'] = undefined;
  /**
   * Ex: 1
   * @member {Number} advanced
   */
  exports.prototype['advanced'] = undefined;
  /**
   * Unit category
   * @member {module:model/Unit.CategoryEnum} category
   */
  exports.prototype['category'] = undefined;
  /**
   * Ex: 6
   * @member {Number} categoryId
   */
  exports.prototype['categoryId'] = undefined;
  /**
   * Ex: Miscellany
   * @member {String} categoryName
   */
  exports.prototype['categoryName'] = undefined;
  /**
   * Conversion steps list
   * @member {Array.<module:model/ConversionStep>} conversionSteps
   */
  exports.prototype['conversionSteps'] = undefined;
  /**
   * Ex: 29
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * Ex: 0
   * @member {Number} manualTracking
   */
  exports.prototype['manualTracking'] = undefined;
  /**
   * The maximum allowed value for measurements. While you can record a value above this maximum, it will be excluded from the correlation analysis.
   * @member {Number} maximumAllowedValue
   */
  exports.prototype['maximumAllowedValue'] = undefined;
  /**
   * Ex: 4
   * @member {Number} maximumValue
   */
  exports.prototype['maximumValue'] = undefined;
  /**
   * The minimum allowed value for measurements. While you can record a value below this minimum, it will be excluded from the correlation analysis.
   * @member {Number} minimumAllowedValue
   */
  exports.prototype['minimumAllowedValue'] = undefined;
  /**
   * Ex: 0
   * @member {Number} minimumValue
   */
  exports.prototype['minimumValue'] = undefined;
  /**
   * Unit name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {module:model/UnitCategory} unitCategory
   */
  exports.prototype['unitCategory'] = undefined;


  /**
   * Allowed values for the <code>category</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CategoryEnum = {
    /**
     * value: "Distance"
     * @const
     */
    "Distance": "Distance",
    /**
     * value: "Duration"
     * @const
     */
    "Duration": "Duration",
    /**
     * value: "Energy"
     * @const
     */
    "Energy": "Energy",
    /**
     * value: "Frequency"
     * @const
     */
    "Frequency": "Frequency",
    /**
     * value: "Miscellany"
     * @const
     */
    "Miscellany": "Miscellany",
    /**
     * value: "Pressure"
     * @const
     */
    "Pressure": "Pressure",
    /**
     * value: "Proportion"
     * @const
     */
    "Proportion": "Proportion",
    /**
     * value: "Rating"
     * @const
     */
    "Rating": "Rating",
    /**
     * value: "Temperature"
     * @const
     */
    "Temperature": "Temperature",
    /**
     * value: "Volume"
     * @const
     */
    "Volume": "Volume",
    /**
     * value: "Weight"
     * @const
     */
    "Weight": "Weight",
    /**
     * value: "Count"
     * @const
     */
    "Count": "Count"  };


  return exports;
}));


