"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingReminder = void 0;
var TrackingReminder;
(function (TrackingReminder) {
    /**
     * The way multiple measurements are aggregated over time
     */
    var combinationOperation;
    (function (combinationOperation) {
        combinationOperation["MEAN"] = "MEAN";
        combinationOperation["SUM"] = "SUM";
    })(combinationOperation = TrackingReminder.combinationOperation || (TrackingReminder.combinationOperation = {}));
    /**
     * Ex: Emotions, Treatments, Symptoms...
     */
    var variableCategoryName;
    (function (variableCategoryName) {
        variableCategoryName["ACTIVITY"] = "Activity";
        variableCategoryName["BOOKS"] = "Books";
        variableCategoryName["CAUSES_OF_ILLNESS"] = "Causes of Illness";
        variableCategoryName["COGNITIVE_PERFORMANCE"] = "Cognitive Performance";
        variableCategoryName["CONDITIONS"] = "Conditions";
        variableCategoryName["EMOTIONS"] = "Emotions";
        variableCategoryName["ENVIRONMENT"] = "Environment";
        variableCategoryName["FOODS"] = "Foods";
        variableCategoryName["GOALS"] = "Goals";
        variableCategoryName["LOCATIONS"] = "Locations";
        variableCategoryName["MISCELLANEOUS"] = "Miscellaneous";
        variableCategoryName["MOVIES_AND_TV"] = "Movies and TV";
        variableCategoryName["MUSIC"] = "Music";
        variableCategoryName["NUTRIENTS"] = "Nutrients";
        variableCategoryName["PAYMENTS"] = "Payments";
        variableCategoryName["PHYSICAL_ACTIVITIES"] = "Physical Activities";
        variableCategoryName["PHYSIQUE"] = "Physique";
        variableCategoryName["SLEEP"] = "Sleep";
        variableCategoryName["SOCIAL_INTERACTIONS"] = "Social Interactions";
        variableCategoryName["SOFTWARE"] = "Software";
        variableCategoryName["SYMPTOMS"] = "Symptoms";
        variableCategoryName["TREATMENTS"] = "Treatments";
        variableCategoryName["VITAL_SIGNS"] = "Vital Signs";
    })(variableCategoryName = TrackingReminder.variableCategoryName || (TrackingReminder.variableCategoryName = {}));
})(TrackingReminder = exports.TrackingReminder || (exports.TrackingReminder = {}));
//# sourceMappingURL=TrackingReminder.js.map