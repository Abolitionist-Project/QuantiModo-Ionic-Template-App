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
    root.Quantimodo.StudyVotes = factory(root.Quantimodo.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The StudyVotes model module.
   * @module model/StudyVotes
   * @version 5.8.112511
   */

  /**
   * Constructs a new <code>StudyVotes</code>.
   * @alias module:model/StudyVotes
   * @class
   * @param averageVote {Number} Average of all user votes with 1 representing an up-vote and 0 representing a down-vote. Ex: 0.9855
   * @param userVote {Number} 1 if the current user has up-voted the study and 0 if they down-voted it. Null means no vote. Ex: 1 or 0 or null
   */
  var exports = function(averageVote, userVote) {
    var _this = this;

    _this['averageVote'] = averageVote;
    _this['userVote'] = userVote;
  };

  /**
   * Constructs a <code>StudyVotes</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/StudyVotes} obj Optional instance to populate.
   * @return {module:model/StudyVotes} The populated <code>StudyVotes</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('averageVote')) {
        obj['averageVote'] = ApiClient.convertToType(data['averageVote'], 'Number');
      }
      if (data.hasOwnProperty('userVote')) {
        obj['userVote'] = ApiClient.convertToType(data['userVote'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Average of all user votes with 1 representing an up-vote and 0 representing a down-vote. Ex: 0.9855
   * @member {Number} averageVote
   */
  exports.prototype['averageVote'] = undefined;
  /**
   * 1 if the current user has up-voted the study and 0 if they down-voted it. Null means no vote. Ex: 1 or 0 or null
   * @member {Number} userVote
   */
  exports.prototype['userVote'] = undefined;



  return exports;
}));


