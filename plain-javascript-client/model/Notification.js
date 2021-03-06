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
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.Quantimodo) {
      root.Quantimodo = {};
    }
    root.Quantimodo.Notification = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The Notification model module.
   * @module model/Notification
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>Notification</code>.
   * @alias module:model/Notification
   * @class
   * @param id {Number} What do you expect?
   * @param userId {Number} What do you expect?
   * @param itemId {Number} What do you expect?
   * @param secondaryItemId {Number} What do you expect?
   * @param componentName {String} What do you expect?
   * @param componentAction {String} What do you expect?
   * @param dateNotified {String} What do you expect?
   * @param isNew {Number} What do you expect?
   */
  var exports = function(id, userId, itemId, secondaryItemId, componentName, componentAction, dateNotified, isNew) {
    var _this = this;

    _this['id'] = id;
    _this['userId'] = userId;
    _this['itemId'] = itemId;
    _this['secondaryItemId'] = secondaryItemId;
    _this['componentName'] = componentName;
    _this['componentAction'] = componentAction;
    _this['dateNotified'] = dateNotified;
    _this['isNew'] = isNew;

  };

  /**
   * Constructs a <code>Notification</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Notification} obj Optional instance to populate.
   * @return {module:model/Notification} The populated <code>Notification</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('userId')) {
        obj['userId'] = ApiClient.convertToType(data['userId'], 'Number');
      }
      if (data.hasOwnProperty('itemId')) {
        obj['itemId'] = ApiClient.convertToType(data['itemId'], 'Number');
      }
      if (data.hasOwnProperty('secondaryItemId')) {
        obj['secondaryItemId'] = ApiClient.convertToType(data['secondaryItemId'], 'Number');
      }
      if (data.hasOwnProperty('componentName')) {
        obj['componentName'] = ApiClient.convertToType(data['componentName'], 'String');
      }
      if (data.hasOwnProperty('componentAction')) {
        obj['componentAction'] = ApiClient.convertToType(data['componentAction'], 'String');
      }
      if (data.hasOwnProperty('dateNotified')) {
        obj['dateNotified'] = ApiClient.convertToType(data['dateNotified'], 'String');
      }
      if (data.hasOwnProperty('isNew')) {
        obj['isNew'] = ApiClient.convertToType(data['isNew'], 'Number');
      }
      if (data.hasOwnProperty('metaDataArray')) {
        obj['metaDataArray'] = ApiClient.convertToType(data['metaDataArray'], [Object]);
      }
    }
    return obj;
  }

  /**
   * What do you expect?
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * What do you expect?
   * @member {Number} userId
   */
  exports.prototype['userId'] = undefined;
  /**
   * What do you expect?
   * @member {Number} itemId
   */
  exports.prototype['itemId'] = undefined;
  /**
   * What do you expect?
   * @member {Number} secondaryItemId
   */
  exports.prototype['secondaryItemId'] = undefined;
  /**
   * What do you expect?
   * @member {String} componentName
   */
  exports.prototype['componentName'] = undefined;
  /**
   * What do you expect?
   * @member {String} componentAction
   */
  exports.prototype['componentAction'] = undefined;
  /**
   * What do you expect?
   * @member {String} dateNotified
   */
  exports.prototype['dateNotified'] = undefined;
  /**
   * What do you expect?
   * @member {Number} isNew
   */
  exports.prototype['isNew'] = undefined;
  /**
   * Additional notification key-value data
   * @member {Array.<Object>} metaDataArray
   */
  exports.prototype['metaDataArray'] = undefined;



  return exports;
}));


