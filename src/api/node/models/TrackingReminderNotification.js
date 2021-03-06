"use strict";
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingReminderNotification = void 0;
var TrackingReminderNotification;
(function (TrackingReminderNotification) {
    /**
     * The way multiple measurements are aggregated over time
     */
    var combinationOperation;
    (function (combinationOperation) {
        combinationOperation["MEAN"] = "MEAN";
        combinationOperation["SUM"] = "SUM";
    })(combinationOperation = TrackingReminderNotification.combinationOperation || (TrackingReminderNotification.combinationOperation = {}));
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
    })(variableCategoryName = TrackingReminderNotification.variableCategoryName || (TrackingReminderNotification.variableCategoryName = {}));
})(TrackingReminderNotification = exports.TrackingReminderNotification || (exports.TrackingReminderNotification = {}));
//# sourceMappingURL=TrackingReminderNotification.js.map