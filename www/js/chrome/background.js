/***
****	EVENT HANDLERS
***/

var v = null;
var vid = null;

/*
**	Returns true in the result listener if the user is logged in, false if not
*/
function isUserLoggedIn(resultListener)
{
	var xhr = new XMLHttpRequest();
	var url = "https://app.quantimo.do/api/user/me";
	if(localStorage.accessToken){
		url = url + '?access_token=' + localStorage.accessToken;
	}
	xhr.open("GET", url, false);
	xhr.onreadystatechange = function()
		{
			if (xhr.readyState === 4)
			{
				var userObject = JSON.parse(xhr.responseText);
				localStorage.user = xhr.responseText;
				/*
				 * it should hide and show sign in button based upon the cookie set or not
				 */
				if(typeof userObject.displayName !== "undefined") {
					console.debug(userObject.displayName + " is logged in.  ");
				} else {
					var url = "https://app.quantimo.do/api/v2/auth/login";
					chrome.tabs.create({"url":url, "selected":true});
				}
			}
		};
	xhr.send();
}

/*
**	Called when the extension is installed
*/
chrome.runtime.onInstalled.addListener(function()
{
	var notificationInterval = parseInt(localStorage.notificationInterval || "60");

	if(notificationInterval === -1)
	{
		chrome.alarms.clear("moodReportAlarm");
		console.debug("Alarm cancelled");
	}
	else
	{
		var alarmInfo = {periodInMinutes: notificationInterval};
		chrome.alarms.create("moodReportAlarm", alarmInfo);
		console.debug("Alarm set, every " + notificationInterval + " minutes");
	}
});

/*
**	Called when an alarm goes off (we only have one)
*/
chrome.alarms.onAlarm.addListener(function(alarm)
{
	console.debug('onAlarm Listener heard this alarm ', alarm);
    checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm);
});

function openOrFocusPopupWindow(windowParams) {
    windowParams.focused = true;
    console.log('openOrFocusPopupWindow', windowParams );
    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
                // Commenting existing window focus so we don't irritate users
                //chrome.windows.update(vid, {focused: true});
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

function executeCallbackOrFocusExistingPopup(callback) {
    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
                chrome.windows.update(vid, {focused: true});
                return;
            }
            callback();
        });
    } else {
        callback();
    }
}


function openPopup(notificationId) {

	if(!notificationId){
		notificationId = null;
	}
	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);

	var windowParams = {
		url: "/www/index.html#/app/reminders-inbox",
		type: 'panel',
        top: screen.height + 755,
        left: screen.width + 455,
		width: 450,
		height: 750
	};

	if(notificationId === "moodReportNotification")
	{
		windowParams = {url: "rating_popup.html",
			type: 'panel',
			top: 0.6 * screen.height,
			left: screen.width - 371,
			width: 371,
			height: 70
		};
	} else if (notificationId === "signin") {
		windowParams = {
			url: "/www/index.html#/app/login",
			type: 'panel',
			top: 0.2 * screen.height,
			left: 0.4 * screen.width,
			width: 450,
			height: 750
		};
	} else if (notificationId && IsJsonString(notificationId)) {
		windowParams.url = "/www/index.html#/app/measurement-add/?trackingReminderObject=" + notificationId;
	} else {
		console.error('notificationId is not a json object and is not moodReportNotification. Opening Reminder Inbox', notificationId);
	}

    openOrFocusPopupWindow(windowParams);

/*
	chrome.windows.update(vid, {focused: true}, function() {
		if (chrome.runtime.lastError) {
			chrome.windows.create(
				windowParams,
				function(chromeWindow) {
					vid = chromeWindow.id;
				});
		}
	});
*/

	//chrome.windows.create(windowParams);
	if(notificationId){
		chrome.notifications.clear(notificationId);
	}
}

/*
**	Called when the "report your mood" notification is clicked
*/
chrome.notifications.onClicked.addListener(function(notificationId)
{
    console.debug('onClicked: notificationId:', notificationId);
	openPopup(notificationId);

	// chrome.notifications.getAll(function (notifications){
	// 	console.debug('Got all notifications ', notifications);
	// 	for(var i = 0; i < notifications.length; i++){
	// 		chrome.notifications.clear(notifications[i].id);
	// 	}
	// });
});

/*
**	Handles extension-specific requests that come in, such as a
** 	request to upload a new measurement
*/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	console.debug("Received request: " + request.message);
	if(request.message === "uploadMeasurements")
	{
		pushMeasurements(request.payload, null);
	}
});



/***
****	HELPER FUNCTIONS
***/

function pushMeasurements(measurements, onDoneListener)
{
	var xhr = new XMLHttpRequest();
	var url = "https://app.quantimo.do/api/measurements/v2";
	if(localStorage.accessToken){
		url = url + '?access_token=' + localStorage.accessToken;
	}
	xhr.open("POST", url, true);
	xhr.onreadystatechange = function()
		{
			// If the request is completed
			if (xhr.readyState === 4)
			{
				console.debug("quantimodoService responds:");
				console.debug(xhr.responseText);

				if(onDoneListener !== null)
				{
					onDoneListener(xhr.responseText);
				}
			}
		};
	xhr.send(JSON.stringify(measurements));
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
    var notificationParams = {
        type: "basic",
        title: "How are you?",
        message: "Click to sign in and record a measurement",
        iconUrl: "www/img/icons/icon_700.png",
        priority: 2
    };
    var notificationId = 'signin';
    chrome.notifications.create(notificationId, notificationParams, function (id) {});
}

function checkForNotificationsAndShowPopupIfSo(notificationParams, alarm) {
    var xhr = new XMLHttpRequest();
    var url = "https://app.quantimo.do:443/api/v1/trackingReminderNotifications/past";
    if (localStorage.accessToken) {
        url = url + '?access_token=' + localStorage.accessToken;
    } else {
        showSignInNotification();
        return;
	}

    xhr.open("GET", url, false);

    xhr.onreadystatechange = function () {
        var notificationId;
        if (xhr.status === 401) {
            showSignInNotification();
        } else if (xhr.readyState === 4) {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if (numberOfWaitingNotifications > 0) {
                notificationParams = {
                    type: "basic",
                    title: "How are you?",
                    message: "Click to open reminder inbox",
                    iconUrl: "www/img/icons/icon_700.png",
                    priority: 2
                };
                notificationId = alarm.name;

                chrome.browserAction.setBadgeText({text: String(numberOfWaitingNotifications)});

                var showNotification = localStorage.showNotification === "true";
                if (showNotification) {
                    chrome.notifications.create(notificationId, notificationParams, function (id) {});
                    openPopup(notificationId);
                } else {
                    chrome.notifications.create(notificationId, notificationParams, function (id) {});
                    openPopup(notificationId);
                }
            } else {
                chrome.browserAction.setBadgeText({text: ""});
            }
        }
    };

    xhr.send();
    return notificationParams;
}

function checkTimePastNotificationsAndExistingPopupAndShowPopupIfNecessary(alarm)
{
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

	var notificationParams = {
		type: "basic",
		title: "How are you?",
		message: "Click to open reminder inbox",
		iconUrl: "www/img/icons/icon_700.png",
		priority: 2
	};

	if (IsJsonString(alarm.name)) {
		console.debug('alarm.name IsJsonString', alarm);
		var trackingReminder = JSON.parse(alarm.name);
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to add measurement';
	} else {
		console.debug('alarm.name is not a json object', alarm);
	}

    if (vid) {
        chrome.windows.get(vid, function (chromeWindow) {
            if (!chrome.runtime.lastError && chromeWindow) {
            	// Commenting window focus so we don't irritate users
                //chrome.windows.update(vid, {focused: true});
                return;
            }
            checkForNotificationsAndShowPopupIfSo(notificationParams, alarm);
        });
    } else {
        checkForNotificationsAndShowPopupIfSo(notificationParams, alarm);
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