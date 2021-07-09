angular.module('starter').controller('RemindersInboxCtrl', ["$scope", "$state", "$stateParams", "$rootScope", "$filter",
    "$ionicPlatform", "$ionicActionSheet", "$timeout", "qmService",
    function($scope, $state, $stateParams, $rootScope, $filter, $ionicPlatform, $ionicActionSheet, $timeout, qmService){
        if(!$rootScope.appSettings){qmService.rootScope.setProperty('appSettings', window.qm.getAppSettings());}
        $scope.controller_name = "RemindersInboxCtrl";
        qmLog.debug('Loading ' + $scope.controller_name);
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            maximumNotificationsToDisplay: 10,  // I think more might slow it down?
            showMeasurementBox: false,
            selectedReminder: false,
            reminderDefaultValue: "",
            selected1to5Value: false,
            favoritesArray: null,
            measurementDate: new Date(),
            slots: {
                epochTime: new Date().getTime() / 1000,
                format: 12,
                step: 1,
                closeLabel: 'Cancel'
            },
            variable: {},
            isDisabled: false,
            loading: true,
            lastButtonPressTimeStamp: 0,
            lastClientX: 0,
            lastClientY: 0,
            numberOfDisplayedNotifications: 0,
            favoritesTitle: "Your Favorites",
            studiesResponse: null,
            title: "Inbox"
        };
        //createWordCloudFromNotes();
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info('RemindersInboxCtrl beforeEnter: ' + window.location.href);
            $scope.state.loading = true;
            if(qmService.login.sendToLoginIfNecessaryAndComeBack("beforeEnter in " + $state.current.name)){
                return;
            }
            $rootScope.hideBackButton = true;
            $rootScope.hideHomeButton = true;
            if($stateParams.hideNavigationMenu !== true){
                qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            }
            // setPageTitle(); // Setting title beforeEnter doesn't fix cutoff on Android
        });
        $scope.$on('$ionicView.enter', function(e){
            qmLog.info('RemindersInboxCtrl enter: ' + window.location.href);
            $scope.defaultHelpCards = qmService.setupHelpCards($rootScope.appSettings);
            readHelpCards();
            addLocalNotificationsToScope('$ionicView.enter');
            //getFavorites();  Not sure why we need to do this here?
            qmService.rootScope.setProperty('bloodPressure', {displayTotal: "Blood Pressure"});
            $scope.stateParams = $stateParams;
            qmService.actionSheet.setDefaultActionSheet(function(){
                    $scope.syncNotifications();
                }, getVariableCategoryName());
            qmService.splash.hideSplashScreen();
        });
        $scope.$on('$ionicView.afterEnter', function(){
            qmLog.info('RemindersInboxCtrl afterEnter: ' + window.location.href);
            setPageTitle(); // Setting title afterEnter doesn't fix cutoff on Android
            if(needToRefresh()){
                $scope.syncNotifications();
            }
            if($rootScope.platform.isWeb){
                qm.webNotifications.registerServiceWorker();
            }
            autoRefresh();
        });
        $scope.$on('$ionicView.beforeLeave', function(){
            qmLog.debug('RemindersInboxCtrl beforeLeave');
            qm.notifications.syncIfQueued();
        });
        $scope.$on('$ionicView.afterLeave', function(){
            qmLog.debug('RemindersInboxCtrl afterLeave');
            $rootScope.hideHomeButton = false;
            $rootScope.hideBackButton = false;
        });
        function readHelpCards(helpCard){
            if(!qm.speech.getSpeechEnabled()){
                return;
            }
            if(!$scope.defaultHelpCards || !$scope.defaultHelpCards.length){
                return;
            }
            qm.speech.talkRobot(helpCard, function(){
                //$scope.hideHelpCard($scope.defaultHelpCards[0], $scope.defaultHelpCards[0].emailType);
                //readHelpCards();
            });
        }
        function needToRefresh(){
            if(!qm.storage.getItem(qm.items.trackingReminderNotifications)){return true;}
            if(!qm.storage.getItem(qm.items.trackingReminderNotifications).length){return true;}
            if(qm.notifications.mostRecentNotificationIsOlderThanMostFrequentInterval()){return true;}
            return false;
        }
        function autoRefresh(){
            $timeout(function(){
                if($state.current.name.toLowerCase().indexOf('inbox') !== -1){
                    $scope.syncNotifications();
                    autoRefresh();
                }
            }, 30 * 60 * 1000);
        }
        var setPageTitle = function(){
            if(getVariableCategoryName() === 'Treatments'){
                $scope.state.title = 'Overdue Meds';
                $scope.state.favoritesTitle = "As-Needed Meds";
            }else if(getVariableCategoryName()){
                $scope.state.title = $filter('wordAliases')(getVariableCategoryName()) + " " + $filter('wordAliases')("Reminder Inbox");
            }else{
                $scope.state.title = 'Inbox';
            }
        };
        var lastButtonPressTimeStamp, lastClientY, lastClientX;
        var isGhostClick = function($ev){
            if(!$rootScope.platform.isMobile){return false;}
            if($ev &&
                lastButtonPressTimeStamp > $ev.timeStamp - 3000 &&
                lastClientX === $ev.clientX &&
                lastClientY === $ev.clientY){
                qmLog.debug('This event is probably a ghost click so not registering.', null, $ev);
                return true;
            }
            if(!$ev){
                qmLog.error('No event provided to isGhostClick!');
                return false;
            }
            qmLog.debug('This Track event is not a ghost click so registering.', null, $ev);
            lastButtonPressTimeStamp = $ev.timeStamp;
            lastClientX = $ev.clientX;
            lastClientY = $ev.clientY;
            return false;
        };
        function refreshIfRunningOutOfNotifications(){
            var num = getNumberOfDisplayedNotifications();
            if(num < 2){
                if(moreNotificationsInStorage()){
                    addLocalNotificationsToScope('refreshIfRunningOutOfNotifications');
                }else{
                    $scope.syncNotifications();
                }
            }
        }
        function getNumberOfNotificationsInStorage() {
            var cat = getVariableCategoryName();
            var inStorage = qm.notifications.getNumberInGlobalsOrLocalStorage(cat);
            return inStorage;
        }
        function moreNotificationsInStorage(){
            var displayed = getNumberOfDisplayedNotifications();
            var inStorage = getNumberOfNotificationsInStorage();
            return inStorage > displayed;
        }
        $scope.trackByValueField = function(n, $event){
            if(isGhostClick($event)){return;}
            if(!qm.measurements.valueIsValid(n, n.modifiedValue)){return false;}
            var lastAction = 'Recorded ' + n.modifiedValue + ' ' + n.unitAbbreviatedName;
            qm.notifications.lastAction = qm.stringHelper.formatValueUnitDisplayText(lastAction) + ' for '+n.variableName;
            qm.notifications.track(n);
            notificationAction(n, undoOne);
        };
        function getFavoritesOrReminders(){
            var cat = getVariableCategoryName();
            if(!$scope.state.favoritesArray || !$scope.state.favoritesArray.length){
                qm.reminderHelper.getFavorites(cat).then(function(favorites){
                    if(favorites && favorites.length){
                        $scope.state.favoritesArray = favorites;
                    } else {
                        qm.reminderHelper.getActiveReminders(cat).then(function(reminders){
                            if(reminders && reminders.length) {
                                $scope.state.favoritesArray = reminders;
                            }
                        });
                    }
                });
            }
        }
        $scope.trackByFavorite = function(tr, modifiedReminderValue){
            var favorites = $scope.state.favoritesArray;
            qm.reminderHelper.trackByFavorite(tr, modifiedReminderValue, function (){
                $scope.safeApply(function (){ // Update display text
                    $scope.state.favoritesArray = favorites
                })
            });
        };
        function getNumberOfDisplayedNotifications() {
            var total = 0;
            var dividers = $scope.notificationDividers;
            if(!dividers){return 0;}
            dividers.forEach(function(divider){
                var notifications = divider.trackingReminderNotifications;
                notifications.forEach(function(n){
                    if(!n.hide){total++;}
                })
            })
            return total;
        }
        function hideByVariableId(variableId) {
            var total = 0;
            var dividers = $scope.notificationDividers;
            if(!dividers){return 0;}
            dividers.forEach(function(divider){
                var notifications = divider.trackingReminderNotifications;
                notifications.forEach(function(n){
                    if(n.variableId === variableId){
                        hideNotification(n);
                    }
                })
            });
            return total;
        }
        function undoByVariableId(n) {
            var variableId = n.variableId;
            var queue = qm.notifications.getQueue()
            queue.forEach(function(one){
                if(one.variableId === variableId){
                    qm.notifications.removeNotificationFromSyncQueueAndUnhide(n)
                }
            })
            addLocalNotificationsToScope('undoByVariableId')
        }
        function getFallbackInboxContentIfNecessary(){
            var num = getNumberOfDisplayedNotifications();
            if(!num && !$scope.state.loading){
                getFavoritesOrReminders();
                getDiscoveries();
            }
        }
        var closeWindowIfNecessary = function(){
            if($state.current.name === "app.remindersInboxCompact" && !getNumberOfDisplayedNotifications()){
                $scope.syncNotifications();
                window.close();
            }
        };
        var enlargeChromePopupIfNecessary = function(){
            if($rootScope.alreadyEnlargedWindow){return;}
            var largeInboxWindowParams = {top: screen.height - 800, left: screen.width - 455, width: 450, height: 750};
            if($state.current.name === "app.remindersInboxCompact"){
                qmService.goToState("app.remindersInbox");
                chrome.windows.getCurrent({}, function(chromeWindow){
                    $rootScope.alreadyEnlargedWindow = true;
                    var vid = chromeWindow.id;
                    chrome.windows.update(vid, largeInboxWindowParams);
                });
            }
        };
        var notificationAction = function(n, undoFunction){
            qmLog.info("Clicked " + qm.notifications.lastAction + " for " + n.variableName);
            hideNotification(n)
            qmService.showToastWithButton(qm.notifications.lastAction, 'UNDO', function(){
                n.hide = false;
                if(undoFunction){undoFunction(n);}
            });
            if(!n.trackingReminderNotificationId){n.trackingReminderNotificationId = n.id;}
            closeWindowIfNecessary();
            if(!getNumberOfDisplayedNotifications()){
                addLocalNotificationsToScope('!getNumberOfDisplayedNotifications');
            }
            refreshIfRunningOutOfNotifications();
            return n;
        };
        function undoOne(n) {
            qm.notifications.removeNotificationFromSyncQueueAndUnhide(n)
            addLocalNotificationsToScope('undoOne');
        }
        $scope.track = function(n, value, $ev){ // Keep trackAll param because it's used in templates/items/notification-item.html
            if(isGhostClick($ev)){return false;}
            n.action = 'track';
            n.modifiedValue = value;
            var valueUnit = qm.stringHelper.formatValueUnitDisplayText(n.modifiedValue + ' ' + n.unitAbbreviatedName);
            var variableName = n.variableName;
            qm.notifications.lastAction = 'Recorded ' + valueUnit + ' for '+ variableName;
            if(value !== null){n.modifiedValue = value;}
            qm.notifications.track(n);
            notificationAction(n, undoOne);
            if($scope.state.showTrackAllButtons){
                qm.toast.showQuestionToast('Want to record ' + valueUnit + " for ALL remaining " + variableName + " notifications?",
                'Recorded ' + valueUnit + " for ALL remaining " + variableName + " notifications!", function () {
                    $scope.trackAll(n, value);
                })
            }
        };
        $scope.trackAll = function(n, value, $ev){
            if(isGhostClick($ev)){return false;}
            n.action = 'trackAll';
            n.modifiedValue = value;
            var valueUnit = qm.stringHelper.formatValueUnitDisplayText(n.modifiedValue + ' ' + n.unitAbbreviatedName);
            qm.notifications.lastAction = 'Recorded ' + valueUnit + ' for all '+n.variableName;
            hideByVariableId(n.variableId);
            qm.notifications.trackAll(n, value, $ev);
            notificationAction(n, undoByVariableId);
        }
        $scope.skipAll = function(n, $ev){
            if(isGhostClick($ev)){return false;}
            n.action = 'skipAll';
            qm.notifications.lastAction = 'Skipped all remaining '+n.variableName+" notifications";
            qm.ui.preventDragAfterAlert($ev);
            hideByVariableId(n.variableId);
            qm.notifications.skipAll(n);
            notificationAction(n, undoByVariableId);
            return true;
        };
        $scope.trackAllWithConfirmation = function(n, value, ev){
            qm.ui.preventDragAfterAlert(ev);
            var valueUnit = qm.stringHelper.formatValueUnitDisplayText(value + " " + n.unitAbbreviatedName);
            var title = "Record " + valueUnit + " for all?";
            var textContent = "Do you want to record " + valueUnit + " for all remaining past " + n.variableName +
                " reminder notifications?";
            function yesCallback(ev){
                $scope.trackAll(n, value, ev);
            }
            function noCallback(){
            }
            qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
        };
        $scope.skip = function(n, $event){
            if(isGhostClick($event)){return;}
            n.action = 'skip';
            qm.notifications.lastAction = 'Skipped '+n.variableName;
            qm.notifications.skip(n);
            notificationAction(n, undoOne);
        };
        $scope.snooze = function(n, $event){
            if(isGhostClick($event)){return;}
            n.action = 'snooze';
            qm.notifications.lastAction = 'Snoozed '+n.variableName;
            qm.notifications.snooze(n);
            notificationAction(n, undoOne);
        };
        function wordClicked(word){
            alert(word.text + " appears " + word.count + " times and the average " + qm.getPrimaryOutcomeVariable().name +
                " value when it is written is " + word.average + qm.getPrimaryOutcomeVariable().unitAbbreviatedName + '.');
        }
        function createWordCloudFromNotes(){
            $scope.height = window.innerHeight * 0.5;
            $scope.width = window.innerWidth; //element.find('word-cloud')[0].offsetWidth;
            $scope.wordClicked = wordClicked;
            qmService.getNotesDeferred(qm.getPrimaryOutcomeVariable().name).then(function(response){
                $scope.words = response;
            });
        }
        function logNotificationDividers(dividers) {
            if(!dividers){
                qmLog.info("No notification dividers!")
                return;
            }
            qmLog.debug('Just added ' + dividers.length +' notification dividers to $scope.notificationDividers. \n' +
                'state.numberOfDisplayedNotifications is '+getNumberOfDisplayedNotifications());
            if(typeof dividers.forEach !== "function"){
                qmLog.error("typeof dividers.forEach !== \"function\"")
                return;
            }
            dividers.forEach(function (divider) {
                qmLog.debug('Notification Divider '+divider.name);
                divider.trackingReminderNotifications.forEach(function (notification) {
                    qmLog.debug("notification title: " + notification.title+ "| id: "+notification.id+")"+
                        " | trackingReminderNotificationId: "+notification.trackingReminderNotificationId+")");
                })
            })
        }
        function getNotifications() {
            var notifications = qm.storage.getTrackingReminderNotifications(getVariableCategoryName(),
                $scope.state.maximumNotificationsToDisplay);
            qmLog.debug('Just got ' + notifications.length + ' trackingReminderNotifications from local storage');
            return notifications;
        }
        var addLocalNotificationsToScopeIfMoreInStorage = function(reason){
            if(moreNotificationsInStorage()){
                addLocalNotificationsToScope(reason);
            } else {
                qmLog.info('We already have '+getNumberOfDisplayedNotifications()+' displayed notifications and '+
                    getNumberOfNotificationsInStorage()+' so not adding despite '+reason);
            }
        }
        var addLocalNotificationsToScope = function(reason){
            //debugger
            qmLog.info("addLocalNotificationsToScope because "+reason || addLocalNotificationsToScope.caller)
            var notifications = getNotifications();
            if($state.current.name === "app.remindersInboxCompact"){
                $scope.trackingReminderNotifications = notifications;
            }else{
                var dividers = qm.notifications.groupByDate(notifications)
                $scope.safeApply(function () { // For som reason these are not visible to Ghost Inspector sometimes
                    $scope.notificationDividers = dividers;
                    $scope.state.numberOfDisplayedNotifications = notifications.length;
                    $scope.state.showTrackAllButtons = notifications.length >= $scope.state.maximumNotificationsToDisplay;
                    logNotificationDividers($scope.notificationDividers);
                })
            }
            hideInboxLoader();
            getFallbackInboxContentIfNecessary();
        };
        var hideInboxLoader = function(){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.state.loading = false;
            qmService.hideLoader();
        };
        $rootScope.$on('broadcastGetTrackingReminderNotifications', function(){
            qmLog.info('getTrackingReminderNotifications broadcast received...');
            addLocalNotificationsToScopeIfMoreInStorage('broadcastGetTrackingReminderNotifications numDisplayed < 3 && numDisplayed < numInStorage');
        });
        var showLoader = function(){
            $scope.state.loading = true;
            $timeout(function(){
                if($scope.state.loading){
                    $scope.state.loading = false;
                }
            }, 10000);
        };
        $scope.syncNotifications = function(params){
            showLoader();
            qm.notifications.syncDeferred(params).then(function(){
                addLocalNotificationsToScope('syncDeferred success');
            }, function(error){
                addLocalNotificationsToScope('syncDeferred error');
                qmLog.error('$scope.syncNotifications error: ', error);
            });
        };
        function hideNotification(n){
            n.hide = true;
            var number = getNumberOfDisplayedNotifications();
            if(number !== $scope.state.numberOfDisplayedNotifications){
                $scope.state.numberOfDisplayedNotifications = getNumberOfDisplayedNotifications();
            }
        }
        $scope.editMeasurement = function(n){
            enlargeChromePopupIfNecessary();
            hideNotification(n);
            qm.notifications.deleteById(n.id);
            qmService.goToState('app.measurementAdd', {
                reminderNotification: n,
                fromUrl: window.location.href
            });
        };
        $scope.editReminderSettingsByNotification = function(n){
            enlargeChromePopupIfNecessary();
            hideNotification(n);
            var trackingReminder = n;
            trackingReminder.id = n.trackingReminderId;
            qmLog.info("Editing "+JSON.stringify(trackingReminder));
            qmService.goToState('app.reminderAdd', {
                reminder: trackingReminder,
            });
        };
        // Triggered on a button click, or some other target
        $scope.showActionSheetForNotification = function(n, $event, dividerIndex, notificationIndex){
            if(isGhostClick($event)){return;}
            enlargeChromePopupIfNecessary();
            var variable = n;
            variable.name = n.variableName;
            var allButtons = qmService.actionSheets.actionSheetButtons;
            // Show the action sheet
            var buttons = [
                {text: 'Actions for ' + n.variableName},
                {text: '<i class="icon ion-android-notifications-none"></i>Edit Reminder'},
                allButtons.charts,
                allButtons.historyAllVariable,
                //allButtons.variableSettings
            ];
            if(n.outcome === true){
                buttons.push(allButtons.predictors);
            }else if(n.outcome === false){
                buttons.push(allButtons.outcomes);
            }else{
                qmLog.error("Why is outcome not boolean in this notification!?!?!", null, n)
            }
            for(var i = 0; i < n.trackAllActions.length; i++){
                buttons.push({
                    text: '<i class="icon ion-android-done-all"></i>' + n.trackAllActions[i].title,
                    trackAllIndex: i
                })
            }
            //buttons.push({ text: '<i class="icon ion-trash-a"></i>Skip All '});  // TODO: Why aren't we using the destructive button for this?
            var hideSheetForNotification = $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug('CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    qmLog.debug('BUTTON CLICKED', null, index);
                    if(index === 0){
                        qmLog.debug('clicked variable name');
                        return false; // Don't hide
                    }
                    if(typeof button.trackAllIndex !== "undefined"){
                        $scope.trackAll(n, n.trackAllActions[button.trackAllIndex].modifiedValue);
                        return true; // Hide sheet
                    }
                    if(button.state){
                        qmService.goToState(button.state, {
                            variableObject: variable,
                            variableName: variable.name
                        });
                        return true; // Hide sheet
                    }
                    if(button.text.indexOf("Edit Reminder") !== -1){
                        $scope.editReminderSettingsByNotification(n, dividerIndex, notificationIndex);
                        return true; // Hide sheet
                    }
                    if(button.text.indexOf("Skip All") !== -1){
                        $scope.skipAll(n);
                        return true; // Hide sheet
                    }
                    qmLog.error("How should I handle this button?", {button: button});
                    return true; // Hide sheet
                },
                destructiveButtonClicked: function(){
                    $scope.skipAll(n);
                    return true;
                }
            });
            //$timeout(function() {hideSheetForNotification();}, 20000);
        };
        $scope.hideHelpCard = function(helpCard, emailType){
            if(emailType){
                $scope.sendEmailAfterVerification(emailType);
            }
            helpCard.hide = true;
            $scope.defaultHelpCards = $scope.defaultHelpCards.filter(function(obj){
                return obj.id !== helpCard.id;
            });
            qmService.storage.deleteById('defaultHelpCards', helpCard.id);
        };
        function getDiscoveries(){
            if(!$scope.state.studiesResponse){
                qm.studyHelper.getStudiesFromApi({
                    limit: 10,
                    fallbackToAggregateCorrelations: true
                }, function(studiesResponse){
                    $scope.state.studiesResponse = studiesResponse;
                }, function(error){
                    qmLog.error(error);
                });
            }
        }
        function getVariableCategoryName(){
            return qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
        }
    }]);
