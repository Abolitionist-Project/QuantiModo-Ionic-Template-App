/**
 * quantimodo
 * We make it easy to retrieve and analyze normalized user data from a wide array of devices and applications. Check out our [docs and sdk's](https://github.com/QuantiModo/docs) or [contact us](https://help.quantimo.do).
 *
 * OpenAPI spec version: 5.8.112511
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */

import * as models from './models';

export interface TrackingReminder {
    "actionArray"?: Array<models.TrackingReminderNotificationAction>;
    "availableUnits"?: Array<models.Unit>;
    /**
     * Link to study comparing variable with strongest relationship for user or population
     */
    "bestStudyLink"?: string;
    /**
     * Description of relationship with variable with strongest relationship for user or population
     */
    "bestStudyCard"?: models.Card;
    /**
     * Link to study comparing variable with strongest relationship for user
     */
    "bestUserStudyLink"?: string;
    /**
     * Description of relationship with variable with strongest relationship for user
     */
    "bestUserStudyCard"?: models.Card;
    /**
     * Link to study comparing variable with strongest relationship for population
     */
    "bestPopulationStudyLink"?: string;
    /**
     * Description of relationship with variable with strongest relationship for population
     */
    "bestPopulationStudyCard"?: models.Card;
    /**
     * Description of relationship with variable with strongest relationship for user or population
     */
    "optimalValueMessage"?: string;
    /**
     * Description of relationship with variable with strongest relationship for population
     */
    "commonOptimalValueMessage"?: string;
    /**
     * Description of relationship with variable with strongest relationship for user
     */
    "userOptimalValueMessage"?: string;
    /**
     * Card containing instructions, image, text, link and relevant import buttons
     */
    "card"?: models.Card;
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    "clientId"?: string;
    /**
     * Options: MEAN, SUM
     */
    "combinationOperation"?: string;
    /**
     * Ex: 2016-05-18 02:24:08 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    "createdAt"?: string;
    /**
     * Ex: Trader Joe's Bedtime Tea
     */
    "displayName"?: string;
    /**
     * Ex: /5
     */
    "unitAbbreviatedName": string;
    /**
     * Ex: 5
     */
    "unitCategoryId"?: number;
    /**
     * Ex: Rating
     */
    "unitCategoryName"?: string;
    /**
     * Ex: 10
     */
    "unitId"?: number;
    /**
     * Ex: 1 to 5 Rating
     */
    "unitName"?: string;
    /**
     * Default value to use for the measurement when tracking. Unit: User-specified or common.
     */
    "defaultValue"?: number;
    /**
     * If a tracking reminder is enabled, tracking reminder notifications will be generated for this variable.
     */
    "enabled"?: boolean;
    /**
     * True if the reminders should be delivered via email
     */
    "email"?: boolean;
    /**
     * Ex: reminderStartTimeLocal is less than $user->earliestReminderTime or greater than  $user->latestReminderTime
     */
    "errorMessage"?: string;
    /**
     * Ex: 0. Unit: User-specified or common.
     */
    "fillingValue"?: number;
    /**
     * Ex: 02:45:20 in UTC timezone
     */
    "firstDailyReminderTime"?: string;
    /**
     * Ex: Daily
     */
    "frequencyTextDescription"?: string;
    /**
     * Ex: Daily at 09:45 PM
     */
    "frequencyTextDescriptionWithTime"?: string;
    /**
     * id
     */
    "id"?: number;
    /**
     * Ex: saddestFaceIsFive
     */
    "inputType"?: string;
    /**
     * Ex: I am an instruction!
     */
    "instructions"?: string;
    /**
     * Ex: ion-sad-outline
     */
    "ionIcon"?: string;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss timestamp for the last time a measurement was received for this user and variable
     */
    "lastTracked"?: string;
    /**
     * Ex: 2
     */
    "lastValue"?: number;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss  timestamp for the reminder time of the latest tracking reminder notification that has been pre-emptively generated in the database
     */
    "latestTrackingReminderNotificationReminderTime"?: string;
    "localDailyReminderNotificationTimes"?: Array<string>;
    "localDailyReminderNotificationTimesForAllReminders"?: Array<string>;
    /**
     * Ex: 1
     */
    "manualTracking"?: boolean;
    /**
     * Ex: 5. Unit: User-specified or common.
     */
    "maximumAllowedValue"?: number;
    /**
     * Ex: 1. Unit: User-specified or common.
     */
    "minimumAllowedValue"?: number;
    /**
     * Ex: 1501555520
     */
    "nextReminderTimeEpochSeconds"?: number;
    /**
     * True if the reminders should appear in the notification bar
     */
    "notificationBar"?: boolean;
    /**
     * Ex: 445
     */
    "numberOfRawMeasurements"?: number;
    /**
     * Ex: 1
     */
    "numberOfUniqueValues"?: number;
    /**
     * Indicates whether or not the variable is usually an outcome of interest such as a symptom or emotion
     */
    "outcome"?: boolean;
    /**
     * Ex: img/variable_categories/symptoms.png
     */
    "pngPath"?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/symptoms.png
     */
    "pngUrl"?: string;
    /**
     * Link to associated product for purchase
     */
    "productUrl"?: string;
    /**
     * True if the reminders should appear as a popup notification
     */
    "popUp"?: boolean;
    /**
     * Ex: How is your overall mood?
     */
    "question"?: string;
    /**
     * Ex: How is your overall mood on a scale of 1 to 5??
     */
    "longQuestion"?: string;
    /**
     * Latest time of day at which reminders should appear in UTC HH:MM:SS format
     */
    "reminderEndTime"?: string;
    /**
     * Number of seconds between one reminder and the next
     */
    "reminderFrequency": number;
    /**
     * String identifier for the sound to accompany the reminder
     */
    "reminderSound"?: string;
    /**
     * Ex: 1469760320
     */
    "reminderStartEpochSeconds"?: number;
    /**
     * Earliest time of day at which reminders should appear in UTC HH:MM:SS format
     */
    "reminderStartTime"?: string;
    /**
     * Ex: 21:45:20
     */
    "reminderStartTimeLocal"?: string;
    /**
     * Ex: 09:45 PM
     */
    "reminderStartTimeLocalHumanFormatted"?: string;
    /**
     * Ex: true
     */
    "repeating"?: boolean;
    /**
     * Ex: 01:00:00
     */
    "secondDailyReminderTime"?: string;
    /**
     * Ex: 1. Unit: User-specified or common.
     */
    "secondToLastValue"?: number;
    /**
     * True if the reminders should be delivered via SMS
     */
    "sms"?: boolean;
    /**
     * Earliest date on which the user should be reminded to track in YYYY-MM-DD format
     */
    "startTrackingDate"?: string;
    /**
     * Latest date on which the user should be reminded to track in YYYY-MM-DD format
     */
    "stopTrackingDate"?: string;
    /**
     * Ex: https://web.quantimo.do/img/variable_categories/symptoms.svg
     */
    "svgUrl"?: string;
    /**
     * Ex: 20:00:00
     */
    "thirdDailyReminderTime"?: string;
    /**
     * Ex: 3
     */
    "thirdToLastValue"?: number;
    /**
     * Ex: 11841
     */
    "trackingReminderId"?: number;
    /**
     * Ex: Not Found
     */
    "trackingReminderImageUrl"?: string;
    /**
     * UPC or other barcode scan result
     */
    "upc"?: string;
    /**
     * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     */
    "updatedAt"?: string;
    /**
     * ID of User
     */
    "userId"?: number;
    /**
     * Ex: /5
     */
    "userVariableUnitAbbreviatedName"?: string;
    /**
     * Ex: 5
     */
    "userVariableUnitCategoryId"?: number;
    /**
     * Ex: Rating
     */
    "userVariableUnitCategoryName"?: string;
    /**
     * Ex: 10
     */
    "userVariableUnitId"?: number;
    /**
     * Ex: 1 to 5 Rating
     */
    "userVariableUnitName"?: string;
    /**
     * Ex: 10
     */
    "userVariableVariableCategoryId"?: number;
    /**
     * Ex: Symptoms
     */
    "userVariableVariableCategoryName"?: string;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    "valence"?: string;
    /**
     * Ex: Rate daily
     */
    "valueAndFrequencyTextDescription"?: string;
    /**
     * Ex: Rate daily at 09:45 PM
     */
    "valueAndFrequencyTextDescriptionWithTime"?: string;
    /**
     * Ex: 10
     */
    "variableCategoryId"?: number;
    /**
     * Ex: https://maxcdn.icons8.com/Color/PNG/96/Messaging/sad-96.png
     */
    "variableCategoryImageUrl"?: string;
    /**
     * Options: Activity, Books, Causes of Illness, Cognitive Performance, Conditions, Emotions, Environment, Foods, Goals, Locations, Miscellaneous, Movies and TV, Music, Nutrients, Payments, Physical Activities, Physique, Sleep, Social Interactions, Software, Symptoms, Treatments, Vital Signs
     */
    "variableCategoryName": string;
    /**
     * Valence indicates what type of buttons should be used when recording measurements for this variable. positive - Face buttons with the happiest face equating to a 5/5 rating where higher is better like Overall Mood. negative - Face buttons with happiest face equating to a 1/5 rating where lower is better like Headache Severity. numeric - Just 1 to 5 numeric buttons for neutral variables. 
     */
    "variableDescription"?: string;
    /**
     * Id for the variable to be tracked
     */
    "variableId"?: number;
    /**
     * Name of the variable to be used when sending measurements
     */
    "variableName": string;
}

