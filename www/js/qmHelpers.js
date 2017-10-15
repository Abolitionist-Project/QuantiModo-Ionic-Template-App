/***
****	EVENT HANDLERS
***/
String.prototype.toCamel = function(){return this.replace(/(\_[a-z])/g, function($1){return $1.toUpperCase().replace('_','');});};
function getUrlParameter(parameterName, url, shouldDecode) {
    if(!url){url = window.location.href;}
    if(parameterName.toLowerCase().indexOf('name') !== -1){shouldDecode = true;}
    if(url.split('?').length > 1){
        var queryString = url.split('?')[1];
        var parameterKeyValuePairs = queryString.split('&');
        for (var i = 0; i < parameterKeyValuePairs.length; i++) {
            var currentParameterKeyValuePair = parameterKeyValuePairs[i].split('=');
            if (currentParameterKeyValuePair[0].toCamel().toLowerCase() === parameterName.toCamel().toLowerCase()) {
                if(typeof shouldDecode !== "undefined")  {
                    return decodeURIComponent(currentParameterKeyValuePair[1]);
                } else {
                    return currentParameterKeyValuePair[1];
                }
            }
        }
    }
    return null;
}
var appSettings;
function isChromeExtension(){return (typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && typeof chrome.runtime.onInstalled !== "undefined");}
function getChromeManifest() {if(isChromeExtension()){return manifest = chrome.runtime.getManifest();}}
function getAppName() {
    if(getChromeManifest()){return getChromeManifest().name;}
    return getUrlParameter('appName');
}
function getClientId() {
    if(appSettings){return appSettings.clientId;}
    return getUrlParameter('clientId');
}
function getAppVersion() {
    if(getChromeManifest()){return getChromeManifest().version;}
    if(appSettings){return appSettings.versionNumber;}
    return getUrlParameter('appVersion');
}
function getAccessToken() {
    if(localStorage.accessToken){return localStorage.accessToken;}
    return getUrlParameter('accessToken');
}
var v = null;
var vid = null;
function multiplyScreenHeight(factor) {return parseInt(factor * screen.height);}
function multiplyScreenWidth(factor) {return parseInt(factor * screen.height);}
var introWindowParams = { url: "index.html#/app/intro", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var facesRatingPopupWindowParams = { url: "templates/chrome/faces_popup.html", type: 'panel', top: screen.height - 150, left: screen.width - 380, width: 390, height: 110};
var loginPopupWindowParams = { url: "index.html#/app/login", type: 'panel', top: multiplyScreenHeight(0.2), left: multiplyScreenWidth(0.4), width: 450, height: 750};
var reminderInboxPopupWindowParams = { url: "index.html", type: 'panel', top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
var compactInboxPopupWindowParams = { url: "index.html#/app/reminders-inbox-compact", type: 'panel', top: screen.height - 360 - 30, left: screen.width - 350, width: 350, height: 360};
var inboxNotificationParams = { type: "basic", title: "How are you?", message: "Click to open reminder inbox", iconUrl: "img/icons/icon_700.png", priority: 2};
var signInNotificationParams = { type: "basic", title: "How are you?", message: "Click to sign in and record a measurement", iconUrl: "img/icons/icon_700.png", priority: 2};
if (!localStorage.introSeen) {
    window.localStorage.setItem('introSeen', true);
    var focusWindow = true;
    openOrFocusPopupWindow(introWindowParams, focusWindow);
}
function getQueryParameterString() {
    if (getAccessToken()) {
        var queryParameterString = '?access_token=' + getAccessToken();
        if(getAppName()){queryParameterString += "&appName=" + encodeURIComponent(getAppName());}
        if(getAppVersion()){queryParameterString += "&appVersion=" + encodeURIComponent(getAppVersion());}
        if(getClientId()){queryParameterString += "&clientId=" + encodeURIComponent(getClientId());}
        return queryParameterString;
    }
    showSignInNotification();
}
function loadAppSettings() {  // I think adding appSettings to the chrome manifest breaks installation
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'configs/default.config.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4) {
            var json = xobj.responseText;
            console.log("AppSettings:" + json);
            appSettings = JSON.parse(json);
        }
    };
    xobj.send(null);
}
if(!getUrlParameter('clientId')){loadAppSettings();}
function getAppHostName() {
    if(appSettings && appSettings.apiUrl){return "https://" + appSettings.apiUrl;}
    return "https://app.quantimo.do";
}
if(isChromeExtension()) {
    /*
    **	Called when the extension is installed
    */
    chrome.runtime.onInstalled.addListener(function () {
        var notificationInterval = parseInt(localStorage.notificationInterval || "60");
        if (notificationInterval === -1) {
            chrome.alarms.clear("moodReportAlarm");
            console.debug("Alarm cancelled");
        } else {
            var alarmInfo = {periodInMinutes: notificationInterval};
            chrome.alarms.create("moodReportAlarm", alarmInfo);
            console.debug("Alarm set, every " + notificationInterval + " minutes");
        }
    });
    /*
    **	Called when an alarm goes off (we only have one)
    */
    chrome.alarms.onAlarm.addListener(function (alarm) {
        console.debug('onAlarm Listener heard this alarm ', alarm);
        if (localStorage.useSmallInbox && localStorage.useSmallInbox === "true") {
            openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
        } else {
            checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
        }
    });
}
function openOrFocusPopupWindow(windowParams, focusWindow) {
    if(isChromeExtension()){
        console.log("Can't open popup because chrome is undefined");
        return;
    }
    windowParams.focused = true;
    console.log('openOrFocusPopupWindow', windowParams );
    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
                // Commenting existing window focus so we don't irritate users
				if(focusWindow){ chrome.windows.update(vid, {focused: true}); }
                return;
            }
            chrome.windows.create(
                windowParams,
                function (chromeWindow) {
                    vid = chromeWindow.id;
                    chrome.windows.update(vid, { focused: false });
                }
            );
        });
    } else {
        chrome.windows.create(
            windowParams,
            function (chromeWindow) {
                vid = chromeWindow.id;
                chrome.windows.update(vid, { focused: false });
            }
        );
    }
}
function openPopup(notificationId, focusWindow) {
    if(isChromeExtension()){
        console.log("Can't open popup because chrome is undefined");
        return;
    }
	if(!notificationId){notificationId = null;}
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);
	if(notificationId === "moodReportNotification") {
        openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
	} else if (notificationId === "signin") {
        openOrFocusPopupWindow(loginPopupWindowParams, focusWindow);
	} else if (notificationId && IsJsonString(notificationId)) {
        var windowParams = reminderInboxPopupWindowParams;
		windowParams.url = "index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
        openOrFocusPopupWindow(windowParams, focusWindow);
	} else {
        openOrFocusPopupWindow(reminderInboxPopupWindowParams, focusWindow);
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}
	//chrome.windows.create(windowParams);
	if(notificationId){chrome.notifications.clear(notificationId);}
}
if(isChromeExtension()){
    /*
     **	Called when the notification is clicked
     */
    chrome.notifications.onClicked.addListener(function(notificationId) {
        console.debug('onClicked: notificationId:', notificationId);
        var focusWindow = true;
        openPopup(notificationId, focusWindow);
    });
    /*
    **	Handles extension-specific requests that come in, such as a
    ** 	request to upload a new measurement
    */
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        console.debug("Received request: " + request.message);
        if(request.message === "uploadMeasurements") {pushMeasurements(request.payload, null);}
    });
}

/***
****	HELPER FUNCTIONS
***/
function pushMeasurements(measurements, onDoneListener) {
	postToQuantiModo(measurements,"v1/measurements", onDoneListener);
}
function postTrackingReminderNotification(trackingReminderNotification, onDoneListener) {
    deleteElementsOfLocalStorageItemByProperty('trackingReminderNotifications', 'trackingReminderNotificationId', trackingReminderNotification.trackingReminderNotificationId);
    postToQuantiModo(trackingReminderNotification, "v1/trackingReminderNotifications", onDoneListener);
}
function postToQuantiModo(body, path, onDoneListener) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST",  getRequestUrl(path), true);
    xhr.onreadystatechange = function() {
        // If the request is completed
        if (xhr.readyState === 4) {
            console.log("POST " + path + " response:" + xhr.responseText);
            if(onDoneListener) {onDoneListener(xhr.responseText);}
        }
    };
    xhr.send(JSON.stringify(body));
}
function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // or Object.prototype.hasOwnProperty.call(obj, prop)
            result++;
        }
    }
    return result;
}
function showSignInNotification() {
    if(isChromeExtension()){
        console.log("Can't showSignInNotification because chrome is undefined");
        return;
    }
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, signInNotificationParams, function (id) {});
}
function getRequestUrl(path) {
    var url = getAppHostName() + "/api/" + path + getQueryParameterString();
    console.log("Making API request to " + url);
    return url;
}
function updateBadgeText(string) {
    if(isChromeExtension()){
        chrome.browserAction.setBadgeText({text: string});
    }
}
function checkForNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    if(isChromeExtension()){
        console.log("Can't checkForNotificationsAndShowPopupIfSo because chrome is undefined");
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET", getRequestUrl("v1/trackingReminderNotifications/past"), false);
    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if (numberOfWaitingNotifications > 0) {
                notificationId = alarm.name;
                updateBadgeText("?");
                //chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});
                chrome.notifications.create(notificationId, inboxNotificationParams, function (id) {});
                openPopup(notificationId);
            } else {
                openOrFocusPopupWindow(facesRatingPopupWindowParams, focusWindow);
                updateBadgeText("");
            }
        }
    };
    xhr.send();
    return notificationParams;
}
function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm) {
    if(isChromeExtension()){
        console.log("Can't checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary because chrome is undefined");
        return;
    }
	console.debug('showNotificationOrPopupForAlarm alarm: ', alarm);
    var userString = localStorage.user;
    if(userString){
        var userObject = JSON.parse(userString);
        if(userObject){
            var now = new Date();
            var hours = now.getHours();
            var currentTime = hours + ':00:00';
            if(currentTime > userObject.latestReminderTime ||
                currentTime < userObject.earliestReminderTime ){
                console.debug('Not showing notification because outside allowed time range');
                return false;
            }
        }
    }
	if (IsJsonString(alarm.name)) {
        var notificationParams = inboxNotificationParams;
		console.debug('alarm.name IsJsonString', alarm);
		var trackingReminder = JSON.parse(alarm.name);
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to add measurement';
        checkForNotificationsAndShowPopupIfSo(notificationParams, alarm);
	} else {
		console.debug('alarm.name is not a json object', alarm);
        checkForNotificationsAndShowPopupIfSo(inboxNotificationParams, alarm);
	}
}
function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (exception) { if (typeof Bugsnag !== "undefined") { Bugsnag.notifyException(exception); }
        return false;
    }
    return true;
}

window.deleteElementsOfLocalStorageItemByProperty = function(localStorageItemName, propertyName, propertyValue){
    var elementsToKeep = [];
    var localStorageItemArray = JSON.parse(localStorage.getItem(localStorageItemName));
    if(!localStorageItemArray){
        logError("Local storage item " + localStorageItemName + " not found");
    } else {
        for(var i = 0; i < localStorageItemArray.length; i++){
            if(localStorageItemArray[i][propertyName] !== propertyValue){elementsToKeep.push(localStorageItemArray[i]);}
        }
        localStorage.setItem(localStorageItemName, JSON.stringify(elementsToKeep));
    }
};
window.logError = function(message, additionalMetaData, stackTrace) {
    if(message && message.message){message = message.message;}
    bugsnagNotify(message, additionalMetaData, stackTrace);
    console.error(message);
};
function addQueryParameter(url, name, value){
    if(url.indexOf('?') === -1){
        return url + "?" + name + "=" + value;
    }
    return url + "&" + name + "=" + value;
}
function bugsnagNotify(message, additionalMetaData, stackTrace){
    function obfuscateSecrets(object){
        if(typeof object !== 'object'){return object;}
        try {
            object = JSON.parse(JSON.stringify(object)); // Decouple so we don't screw up original object
        } catch (error) {
            Bugsnag.notify("Could not decouple object: " + error , "object = JSON.parse(JSON.stringify(object))", object, "error");
            //qmService.logError(error, object); // Avoid infinite recursion
            return object;
        }
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var lowerCaseProperty = propertyName.toLowerCase();
                if(lowerCaseProperty.indexOf('secret') !== -1 || lowerCaseProperty.indexOf('password') !== -1 || lowerCaseProperty.indexOf('token') !== -1){
                    object[propertyName] = "HIDDEN";
                } else {
                    object[propertyName] = obfuscateSecrets(object[propertyName]);
                }
            }
        }
        return object;
    }
    if(typeof Bugsnag !== "undefined"){ console.debug("Bugsnag not defined"); return; }
    function getTestUrl() {
        function getCurrentRoute() {
            var parts = window.location.href.split("#/app");
            return parts[1];
        }
        var url = "https://local.quantimo.do/ionic/Modo/www/index.html#/app" + getCurrentRoute();
        if($rootScope.user){url +=  "?userEmail=" + encodeURIComponent($rootScope.user.email);}
        return url;
    }
    function getInstalledPluginList(){
        function localNotificationsPluginInstalled() {
            if(typeof cordova === "undefined"){return false;}
            if(typeof cordova.plugins === "undefined"){return false;}
            if(typeof cordova.plugins.notification === "undefined"){return false;}
            return true;
        }
        return {
            "Analytics": (typeof Analytics !== "undefined"),
            "backgroundGeoLocation": (typeof backgroundGeoLocation !== "undefined"),
            "cordova.plugins.notification": localNotificationsPluginInstalled(),
            "facebookConnectPlugin": (typeof facebookConnectPlugin !== "undefined"),
            "window.plugins.googleplus": (window && window.plugins && window.plugins.googleplus) ? true : false,
            "inAppPurchase": (typeof window.inAppPurchase !== "undefined"),
            "ionic": (typeof ionic !== "undefined"),
            "ionicDeploy": (typeof $ionicDeploy !== "undefined"),
            "PushNotification": (typeof PushNotification !== "undefined"),
            "SplashScreen": (typeof navigator !== "undefined" && typeof navigator.splashscreen !== "undefined"),
            "UserVoice": (typeof UserVoice !== "undefined")
        };
    }
    var name = message;
    if(window.mobileDebug){alert(message);}
    var metaData = {groupingHash: name, stackTrace: stackTrace};
    metaData.push_data = {
        "deviceTokenOnServer": localStorage.getItem('deviceTokenOnServer'),
        "deviceTokenToSync": localStorage.getItem('deviceTokenToSync')
    };
    if(typeof config !== "undefined"){
        metaData.build_server = config.appSettings.buildServer;
        metaData.build_link = config.appSettings.buildLink;
    }
    metaData.test_app_url = getTestUrl();
    if(additionalMetaData && additionalMetaData.apiResponse){
        var request = additionalMetaData.apiResponse.req;
        metaData.test_api_url = request.method + " " + request.url;
        if(request.header.Authorization){
            metaData.test_api_url = addQueryParameter(metaData.test_api_url, "access_token", request.header.Authorization.replace("Bearer ", ""));
        }
        console.error("API ERROR URL " + metaData.test_api_url);
        delete additionalMetaData.apiResponse;
    }
    //metaData.appSettings = config.appSettings;  // Request Entity Too Large
    if(additionalMetaData){metaData.additionalInfo = additionalMetaData;}
    //if($rootScope.user){metaData.user = $rootScope.user;} // Request Entity Too Large
    metaData.installed_plugins = getInstalledPluginList();
    Bugsnag.context = $state.current.name;
    Bugsnag.notify(name, message, obfuscateSecrets(metaData), "error");
}