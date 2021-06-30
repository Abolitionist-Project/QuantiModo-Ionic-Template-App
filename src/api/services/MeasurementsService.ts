/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type {CommonResponse} from '../models/CommonResponse';
import type {Measurement} from '../models/Measurement';
import type {MeasurementSet} from '../models/MeasurementSet';
import type {MeasurementUpdate} from '../models/MeasurementUpdate';
import type {Pair} from '../models/Pair';
import type {PostMeasurementsResponse} from '../models/PostMeasurementsResponse';
import {request as __request} from '../core/request';

export class MeasurementsService {

    /**
     * Post Request for Measurements CSV
     * Use this endpoint to schedule a CSV export containing all user measurements to be emailed to the user within 24 hours.
     * @param userId User's id
     * @returns number successful operation
     * @throws ApiError
     */
    public static async measurementExportRequest(
        userId?: number,
    ): Promise<number> {
        const result = await __request({
            method: 'POST',
            path: `/v2/measurements/exportRequest`,
            query: {
                'userId': userId,
            },
        });
        return result.body;
    }

    /**
     * Get measurements for this user
     * Measurements are any value that can be recorded like daily steps, a mood rating, or apples eaten.
     * @param unitName Ex: Milligrams
     * @param variableName Name of the variable you want measurements for
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param variableCategoryName Ex: Emotions, Treatments, Symptoms...
     * @param updatedAt When the record was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param userId User's id
     * @param sourceName ID of the source you want measurements for (supports exact name match only)
     * @param connectorName Ex: facebook
     * @param value Value of measurement
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param createdAt When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format. Time zone should be UTC and not local.
     * @param id Measurement id
     * @param groupingWidth The time (in seconds) over which measurements are grouped together
     * @param groupingTimezone The time (in seconds) over which measurements are grouped together
     * @param doNotProcess Ex: true
     * @param clientId Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     * @param doNotConvert Ex: 1
     * @param minMaxFilter Ex: 1
     * @returns Measurement Successful operation
     * @throws ApiError
     */
    public static async getMeasurements(
        unitName?: '% Recommended Daily Allowance' | '-4 to 4 Rating' | '0 to 1 Rating' | '0 to 5 Rating' | '1 to 10 Rating' | '1 to 5 Rating' | 'Applications' | 'Beats per Minute' | 'Calories' | 'Capsules' | 'Centimeters' | 'Count' | 'Degrees Celsius' | 'Degrees East' | 'Degrees Fahrenheit' | 'Degrees North' | 'Dollars' | 'Drops' | 'Event' | 'Feet' | 'Grams' | 'Hours' | 'Inches' | 'Index' | 'Kilocalories' | 'Kilograms' | 'Kilometers' | 'Liters' | 'Meters' | 'Micrograms' | 'Micrograms per decilitre' | 'Miles' | 'Milligrams' | 'Milliliters' | 'Millimeters' | 'Millimeters Merc' | 'Milliseconds' | 'Minutes' | 'Pascal' | 'Percent' | 'Pieces' | 'Pills' | 'Pounds' | 'Puffs' | 'Seconds' | 'Serving' | 'Sprays' | 'Tablets' | 'Torr' | 'Units' | 'Yes/No' | 'per Minute' | 'Doses' | 'Quarts' | 'Ounces' | 'International Units' | 'Meters per Second',
        variableName?: string,
        limit: number = 100,
        offset?: number,
        variableCategoryName?: 'Activities' | 'Books' | 'Causes of Illness' | 'Cognitive Performance' | 'Conditions' | 'Emotions' | 'Environment' | 'Foods' | 'Location' | 'Miscellaneous' | 'Movies and TV' | 'Music' | 'Nutrients' | 'Payments' | 'Physical Activity' | 'Physique' | 'Sleep' | 'Social Interactions' | 'Software' | 'Symptoms' | 'Treatments' | 'Vital Signs' | 'Goals',
        updatedAt?: string,
        userId?: number,
        sourceName?: string,
        connectorName?: string,
        value?: string,
        sort?: string,
        earliestMeasurementTime?: string,
        latestMeasurementTime?: string,
        createdAt?: string,
        id?: number,
        groupingWidth?: number,
        groupingTimezone?: string,
        doNotProcess?: boolean,
        clientId?: string,
        doNotConvert?: boolean,
        minMaxFilter?: boolean,
    ): Promise<Array<Measurement>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/measurements`,
            query: {
                'unitName': unitName,
                'variableName': variableName,
                'limit': limit,
                'offset': offset,
                'variableCategoryName': variableCategoryName,
                'updatedAt': updatedAt,
                'userId': userId,
                'sourceName': sourceName,
                'connectorName': connectorName,
                'value': value,
                'sort': sort,
                'earliestMeasurementTime': earliestMeasurementTime,
                'latestMeasurementTime': latestMeasurementTime,
                'createdAt': createdAt,
                'id': id,
                'groupingWidth': groupingWidth,
                'groupingTimezone': groupingTimezone,
                'doNotProcess': doNotProcess,
                'clientId': clientId,
                'doNotConvert': doNotConvert,
                'minMaxFilter': minMaxFilter,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Delete a measurement
     * Delete a previously submitted measurement
     * @returns void
     * @throws ApiError
     */
    public static async deleteMeasurement(): Promise<void> {
        const result = await __request({
            method: 'DELETE',
            path: `/v3/measurements/delete`,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Post a new set or update existing measurements to the database
     * You can submit or update multiple measurements in a "measurements" sub-array.  If the variable these measurements correspond to does not already exist in the database, it will be automatically added.
     * @param requestBody An array of measurement sets containing measurement items you want to insert.
     * @param userId User's id
     * @returns PostMeasurementsResponse Successful operation
     * @throws ApiError
     */
    public static async postMeasurements(
        requestBody: Array<MeasurementSet>,
        userId?: number,
    ): Promise<PostMeasurementsResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/measurements/post`,
            query: {
                'userId': userId,
            },
            body: requestBody,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Update a measurement
     * Update a previously submitted measurement
     * @param requestBody The id as well as the new startTime, note, and/or value of the measurement to be updated
     * @returns CommonResponse Successful Operation
     * @throws ApiError
     */
    public static async updateMeasurement(
        requestBody: MeasurementUpdate,
    ): Promise<CommonResponse> {
        const result = await __request({
            method: 'POST',
            path: `/v3/measurements/update`,
            body: requestBody,
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

    /**
     * Get pairs of measurements for correlational analysis
     * Pairs cause measurements with effect measurements grouped over the duration of action after the onset delay.
     * @param causeUnitName Name for the unit cause measurements to be returned in
     * @param causeVariableName Deprecated: Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param causeVariableId Variable id of the hypothetical predictor variable.  Ex: 1398
     * @param effectVariableId Variable id of the outcome variable of interest.  Ex: 1398
     * @param predictorVariableName Name of the hypothetical predictor variable.  Ex: Sleep Duration
     * @param outcomeVariableName Name of the outcome variable of interest.  Ex: Overall Mood
     * @param effectUnitName Name for the unit effect measurements to be returned in
     * @param userId User's id
     * @param effectVariableName Deprecated: Name of the outcome variable of interest.  Ex: Overall Mood
     * @param onsetDelay The amount of time in seconds that elapses after the predictor/stimulus event before the outcome as perceived by a self-tracker is known as the onset delay. For example, the onset delay between the time a person takes an aspirin (predictor/stimulus event) and the time a person perceives a change in their headache severity (outcome) is approximately 30 minutes.
     * @param durationOfAction The amount of time over which a predictor/stimulus event can exert an observable influence on an outcome variable value. For instance, aspirin (stimulus/predictor) typically decreases headache severity for approximately four hours (duration of action) following the onset delay. Unit: Seconds
     * @param earliestMeasurementTime Excluded records with measurement times earlier than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param latestMeasurementTime Excluded records with measurement times later than this value. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss  datetime format. Time zone should be UTC and not local.
     * @param limit The LIMIT is used to limit the number of results returned. So if youhave 1000 results, but only want to the first 10, you would set this to 10 and offset to 0. The maximum limit is 200 records.
     * @param offset OFFSET says to skip that many rows before beginning to return rows to the client. OFFSET 0 is the same as omitting the OFFSET clause.If both OFFSET and LIMIT appear, then OFFSET rows are skipped before starting to count the LIMIT rows that are returned.
     * @param sort Sort by one of the listed field names. If the field name is prefixed with `-`, it will sort in descending order.
     * @returns Pair Successful operation
     * @throws ApiError
     */
    public static async getPairs(
        causeUnitName?: string,
        causeVariableName?: string,
        causeVariableId?: number,
        effectVariableId?: number,
        predictorVariableName?: string,
        outcomeVariableName?: string,
        effectUnitName?: string,
        userId?: number,
        effectVariableName?: string,
        onsetDelay?: string,
        durationOfAction?: string,
        earliestMeasurementTime?: string,
        latestMeasurementTime?: string,
        limit: number = 100,
        offset?: number,
        sort?: string,
    ): Promise<Array<Pair>> {
        const result = await __request({
            method: 'GET',
            path: `/v3/pairs`,
            query: {
                'causeUnitName': causeUnitName,
                'causeVariableName': causeVariableName,
                'causeVariableId': causeVariableId,
                'effectVariableId': effectVariableId,
                'predictorVariableName': predictorVariableName,
                'outcomeVariableName': outcomeVariableName,
                'effectUnitName': effectUnitName,
                'userId': userId,
                'effectVariableName': effectVariableName,
                'onsetDelay': onsetDelay,
                'durationOfAction': durationOfAction,
                'earliestMeasurementTime': earliestMeasurementTime,
                'latestMeasurementTime': latestMeasurementTime,
                'limit': limit,
                'offset': offset,
                'sort': sort,
            },
            errors: {
                401: `Not Authenticated`,
            },
        });
        return result.body;
    }

}
