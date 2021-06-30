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
import { Button } from './button';
import { Card } from './card';
import { ConnectInstructions } from './connectInstructions';


export interface DataSource { 
    /**
     * Ex: true
     */
    affiliate: boolean;
    /**
     * Background color HEX code that matches the icon
     */
    backgroundColor?: string;
    buttons?: Array<Button>;
    /**
     * Card containing instructions, image, text, link and relevant import buttons
     */
    card?: Card;
    /**
     * Your QuantiModo client id can be obtained by creating an app at https://builder.quantimo.do
     */
    clientId?: string;
    /**
     * True if the authenticated user has this connector enabled
     */
    connected?: boolean;
    /**
     * Ex: Your token is expired. Please re-connect
     */
    connectError?: string;
    /**
     * URL and parameters used when connecting to a service
     */
    connectInstructions?: ConnectInstructions;
    /**
     * Ex: 8
     */
    connectorId?: number;
    /**
     * Ex: CONNECTED
     */
    connectStatus?: string;
    /**
     * Number of measurements from this source or number of users who have measurements from this source
     */
    count?: number;
    /**
     * Ex: 2000-01-01 00:00:00 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    createdAt?: string;
    /**
     * Ex: ba7d0c12432650e23b3ce924ae2d21e2ff59e7e4e28650759633700af7ed0a30
     */
    connectorClientId: string;
    /**
     * Ex: Foods
     */
    defaultVariableCategoryName: string;
    /**
     * Ex: QuantiModo
     */
    displayName: string;
    /**
     * Ex: 0
     */
    enabled: number;
    /**
     * Ex: https://quantimo.do
     */
    getItUrl: string;
    /**
     * Ex: 72
     */
    id: number;
    /**
     * Ex: https://web.quantimo.do/img/logos/quantimodo-logo-qm-rainbow-200-200.png
     */
    image: string;
    /**
     * Ex: <a href=\"https://quantimo.do\"><img id=\"quantimodo_image\" title=\"QuantiModo\" src=\"https://web.quantimo.do/img/logos/quantimodo-logo-qm-rainbow-200-200.png\" alt=\"QuantiModo\"></a>
     */
    imageHtml: string;
    /**
     * Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    lastSuccessfulUpdatedAt?: string;
    /**
     * Epoch timestamp of last sync
     */
    lastUpdate?: number;
    /**
     * Ex: <a href=\"https://quantimo.do\">QuantiModo</a>
     */
    linkedDisplayNameHtml: string;
    /**
     * Ex: QuantiModo is a Chrome extension, Android app, iOS app, and web app that allows you to easily track mood, symptoms, or any outcome you want to optimize in a fraction of a second.  You can also import your data from over 30 other apps and devices like Fitbit, Rescuetime, Jawbone Up, Withings, Facebook, Github, Google Calendar, Runkeeper, MoodPanda, Slice, Google Fit, and more.  QuantiModo then analyzes your data to identify which hidden factors are most likely to be influencing your mood or symptoms and their optimal daily values.
     */
    longDescription: string;
    /**
     * Ex: Got 412 new measurements on 2017-07-31 10:10:34
     */
    message?: string;
    /**
     * Mobile connect method: webview, cordova, google, spreadsheet, or ip
     */
    mobileConnectMethod?: string;
    /**
     * Ex: quantimodo
     */
    name: string;
    /**
     * Platforms (chrome, android, ios, web) that you can connect on.
     */
    platforms?: Array<string>;
    /**
     * True if connection requires upgrade
     */
    premium?: boolean;
    /**
     * Required connector scopes
     */
    scopes?: Array<string>;
    /**
     * Ex: Tracks anything
     */
    shortDescription: string;
    /**
     * URL to POST a spreadsheet to (if available for this data source)
     */
    spreadsheetUploadLink?: string;
    /**
     * Number of measurements obtained during latest update
     */
    totalMeasurementsInLastUpdate?: number;
    /**
     * Ex: 2017-07-31 10:10:34 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    updatedAt?: string;
    /**
     * Ex: 2017-07-18 05:16:31 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    updateRequestedAt?: string;
    /**
     * Ex: UPDATED
     */
    updateStatus?: string;
    /**
     * Ex: 230
     */
    userId?: number;
}
