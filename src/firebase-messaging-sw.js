// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
getIonicAppBaseUrl = function (){
    return (self.location.origin + self.location.pathname).replace('firebase-messaging-sw.js', '');
};
var locationObj = self.location;
var window = self;
var document = {};
var libUrl = getIonicAppBaseUrl()+'lib/';
console.log("Service worker importing libraries from " + libUrl);
// Can't use QM SDK in service worker because it uses XHR instead of fetch
importScripts(libUrl+'firebase/firebase-app.js');
importScripts(libUrl+'firebase/firebase-messaging.js');
importScripts(libUrl+'localforage/dist/localforage.js');
importScripts(libUrl+'q/q.js');
//importScripts(libUrl+'bugsnag/dist/bugsnag.min.js');
importScripts(getIonicAppBaseUrl()+'js/qmLogger.js');
importScripts(getIonicAppBaseUrl()+'js/qmHelpers.js');
importScripts(getIonicAppBaseUrl()+'data/appSettings.js');
importScripts(getIonicAppBaseUrl()+'data/qmStates.js');
importScripts(getIonicAppBaseUrl()+'data/stateNames.js');
importScripts(getIonicAppBaseUrl()+'data/buildInfo.js');
importScripts(getIonicAppBaseUrl()+'data/units.js');
importScripts(getIonicAppBaseUrl()+'data/variableCategories.js');
importScripts(getIonicAppBaseUrl()+'data/commonVariables.js');
importScripts(getIonicAppBaseUrl()+'data/docs.js');
importScripts(getIonicAppBaseUrl()+'data/dialogAgent.js');
var config = {
    apiKey: "AIzaSyAro7_WyPa9ymH5znQ6RQRU2CW5K46XaTg",
    authDomain: "quantimo-do.firebaseapp.com",
    databaseURL: "https://quantimo-do.firebaseio.com",
    projectId: "quantimo-do",
    storageBucket: "quantimo-do.appspot.com",
    messagingSenderId: "1052648855194"
};
console.log("firebase.initializeApp(config)");
firebase.initializeApp(config);
var messaging = firebase.messaging();
qm.push.notificationClick = function(event){  // Have to attach to qm because it says undefined function otherwise
    console.log('[Service Worker] Notification click Received for event: ' + JSON.stringify(event), event);
    event.notification.close();
    if(event.action === ""){
        qmLog.error("No event action provided! event is: ", null, event);
    }
    if (event.action.indexOf("https://") === -1 && runFunction(event.action, event.notification.data)) {
        return;
    }
    var basePath = '/#/app/';
    var urlPathToOpen = basePath + 'reminders-inbox';
    if(event.notification && event.notification.data && event.notification.data.url && event.notification.data.url !== ""){
        urlPathToOpen = event.notification.data.url;
        console.debug("urlPathToOpen from event.notification.data.url", urlPathToOpen);
    }
    if(event.action && event.action.indexOf("https://") !== -1){
        var route = qm.stringHelper.after(event.action, basePath);
        urlPathToOpen = basePath + route;
        console.debug("basePath", basePath);
        console.debug("urlPathToOpen from basePath + route", urlPathToOpen);
    }
    // This looks to see if the current is already open and focuses if it is
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            var currentlyOpenUrl = client.url;
            console.log(currentlyOpenUrl + " is open already");
            if(currentlyOpenUrl.indexOf(urlPathToOpen) !== -1){
                if ('focus' in client) {
                    console.log("Focusing " + currentlyOpenUrl);
                    return client.focus();
                }
            }
        }
        if (clients.openWindow) {
            if(urlPathToOpen.indexOf('#') === 0){urlPathToOpen = '/' + urlPathToOpen;}
            console.log("Opening new " + urlPathToOpen + " window");
            return clients.openWindow(urlPathToOpen);
        } else {
            console.error("Can't open windows!")
        }

    }));
};
/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in the
 // messagingSenderId.
 firebase.initializeApp({
   'messagingSenderId': 'YOUR-SENDER-ID'
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/
// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message payload: ', payload);
    qm.push.logPushReceived({pushType: 'background', payload: payload});
    qm.notifications.showWebNotification(payload.data);
});
// UPDATE:  Disregard the comment below because it didn't solve the problem and broke pushes. I guess both handlers are required?  I think the background thing might just be a dev console issue
// I think addEventListener('push' isn't necessary since we use messaging.setBackgroundMessageHandler and I think duplicate handlers cause "Updated in background" notifications
self.addEventListener('push', function(event) {
    qmLog.info('[Service Worker] Non-background Push Received. event: ', event);
    qm.push.logPushReceived({pushType: 'non-background-event', event: event});
    //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
    try {
        var pushData = event.data.json();
        pushData = pushData.data;
        qmLog.info('[Service Worker] Non-background Push Received. pushData: ', pushData);
        qm.push.logPushReceived({pushType: 'non-background-push-data', pushData: pushData});
        qm.notifications.showWebNotification(pushData);
    } catch (error) {
        qmLog.error("Could not show push notification because: " + error);
    }
});
// [END background_handler]
function runFunction(name, arguments){
    var fn = qm.notifications.actions[name];
    if(typeof fn !== 'function'){
      console.log(name +" is not a function");
      return false;
    }
    console.log("executing" + name );
    fn.apply(qm.notifications.actions, [arguments]);
    return true;
}
self.addEventListener('notificationclick', qm.push.notificationClick);
