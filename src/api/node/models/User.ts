/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AuthorizedClients } from './AuthorizedClients';
import type { Card } from './Card';

export type User = {
    /**
     * User access token
     */
    accessToken: string;
    /**
     * Ex: 2018-08-08 02:41:19
     */
    accessTokenExpires?: string;
    /**
     * Ex: 1533696079000
     */
    accessTokenExpiresAtMilliseconds?: number;
    /**
     * Is user administrator
     */
    administrator: boolean;
    authorizedClients?: AuthorizedClients;
    /**
     * Ex: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
     */
    avatar?: string;
    /**
     * Ex: https://lh6.googleusercontent.com/-BHr4hyUWqZU/AAAAAAAAAAI/AAAAAAAIG28/2Lv0en738II/photo.jpg?sz=50
     */
    avatarImage?: string;
    /**
     * Ex: a:1:{s:13:"administrator";b:1;}
     */
    capabilities?: string;
    card?: Card;
    /**
     * Ex: quantimodo
     */
    clientId?: string;
    /**
     * Ex: 118444693184829555362
     */
    clientUserId?: string;
    /**
     * Ex: 1
     */
    combineNotifications?: boolean;
    /**
     * When the record was first created. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
     */
    createdAt?: string;
    /**
     * Your bio will be displayed on your published studies
     */
    description?: string;
    /**
     * User display name
     */
    displayName: string;
    /**
     * Earliest time user should get notifications. Ex: 05:00:00
     */
    earliestReminderTime?: string;
    /**
     * User email
     */
    email: string;
    /**
     * Ex: Mike
     */
    firstName?: string;
    /**
     * Ex: false
     */
    getPreviewBuilds?: boolean;
    /**
     * Ex: false
     */
    hasAndroidApp?: boolean;
    /**
     * Ex: false
     */
    hasChromeExtension?: boolean;
    /**
     * Ex: false
     */
    hasIosApp?: boolean;
    /**
     * User id
     */
    id: number;
    /**
     * Ex: Date the user last logged in
     */
    lastActive?: string;
    /**
     * Ex: 2009
     */
    lastFour?: string;
    /**
     * Ex: Sinn
     */
    lastName?: string;
    /**
     * Ex: 1
     */
    lastSmsTrackingReminderNotificationId?: string;
    /**
     * Latest time user should get notifications. Ex: 23:00:00
     */
    latestReminderTime?: string;
    /**
     * User login name
     */
    loginName: string;
    /**
     * Ex: PASSWORD
     */
    password?: string;
    /**
     * Ex: 618-391-0002
     */
    phoneNumber?: string;
    /**
     * Ex: 1234
     */
    phoneVerificationCode?: string;
    /**
     * A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them. 
     */
    primaryOutcomeVariableId?: number;
    /**
     * A good primary outcome variable is something that you want to improve and that changes inexplicably. For instance, if you have anxiety, back pain or arthritis which is worse on some days than others, these would be good candidates for primary outcome variables.  Recording their severity and potential factors will help you identify hidden factors exacerbating or improving them. 
     */
    primaryOutcomeVariableName?: string;
    /**
     * Ex: 1
     */
    pushNotificationsEnabled?: boolean;
    /**
     * See https://oauth.net/2/grant-types/refresh-token/
     */
    refreshToken?: string;
    /**
     * Ex: ["admin"]
     */
    roles?: string;
    /**
     * Ex: 1
     */
    sendPredictorEmails?: boolean;
    /**
     * Ex: 1
     */
    sendReminderNotificationEmails?: boolean;
    /**
     * Share all studies, charts, and measurement data with all other users
     */
    shareAllData?: boolean;
    /**
     * Ex: false
     */
    smsNotificationsEnabled?: boolean;
    /**
     * Ex: 1
     */
    stripeActive?: boolean;
    /**
     * Ex: cus_A8CEmcvl8jwLhV
     */
    stripeId?: string;
    /**
     * Ex: monthly7
     */
    stripePlan?: string;
    /**
     * Ex: sub_ANTx3nOE7nzjQf
     */
    stripeSubscription?: string;
    /**
     * UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    subscriptionEndsAt?: string;
    /**
     * Ex: google
     */
    subscriptionProvider?: string;
    /**
     * Ex: 300
     */
    timeZoneOffset?: number;
    /**
     * Ex: 1
     */
    trackLocation?: boolean;
    /**
     * When the record in the database was last updated. Use UTC ISO 8601 YYYY-MM-DDThh:mm:ss datetime format
     */
    updatedAt?: string;
    /**
     * Ex: 2013-12-03 15:25:13 UTC ISO 8601 YYYY-MM-DDThh:mm:ss
     */
    userRegistered?: string;
    /**
     * Ex: https://plus.google.com/+MikeSinn
     */
    userUrl?: string;
}