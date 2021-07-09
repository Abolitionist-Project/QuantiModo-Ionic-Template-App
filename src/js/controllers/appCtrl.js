angular.module('starter')// Parent Controller - This controller runs before every one else
    .controller('AppCtrl', ["$scope", "$timeout", "$ionicPopover", "$ionicLoading", "$state", "$ionicHistory", "$rootScope",
        "$ionicPopup", "$ionicSideMenuDelegate", "$ionicPlatform", "$injector", "qmService",
        "$cordovaOauth", "clipboard", "$ionicActionSheet", //"Analytics",
        "$locale", "$mdDialog", "$mdToast", "$sce",
        "wikipediaFactory", "appSettingsResponse", "$stateParams",
        function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                 $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform, $injector, qmService,
                 $cordovaOauth, clipboard, $ionicActionSheet,
                 //Analytics, //$ionicDeploy, // Analytics + uBlock origin extension breaks app
                 $locale, $mdDialog, $mdToast, $sce, wikipediaFactory, appSettingsResponse, $stateParams){
            $scope.controller_name = "AppCtrl";
            qmService.initializeApplication(appSettingsResponse);
            $scope.$on('$ionicView.enter', function(e){
                qmLog.debug('appCtrl enter in state ' + $state.current.name + ' and url is ' + window.location.href);
            });
            $scope.$on('$ionicView.afterEnter', function(e){
                qmLog.debug($scope.controller_name + ".afterEnter so posting queued notifications if any");
                qm.notifications.syncIfQueued();
                qmService.refreshUserUsingAccessTokenInUrlIfNecessary();
                $rootScope.setMicAndSpeechEnabled(qm.mic.getMicEnabled());
                qm.chatButton.setZohoChatButtonZIndex();
                if(qmService.statesToShowDriftButton.indexOf($state.current.name) !== -1){
                    qm.chatButton.showDriftButton();
                } else {
                    qm.chatButton.hideDriftButton();
                }
                if(typeof drift !== "undefined"){drift.page();}
                qm.storage.setItem(qm.items.lastUrl, window.location.href);
            });
            $scope.$on('$ionicView.beforeLeave', function(e){
                qmService.setLastStateAndUrl($state.current)
            });
            $scope.closeMenu = function(){
                $ionicSideMenuDelegate.toggleLeft(false);
            };
            $scope.showVariableActionSheet = function(v, extraButtons, state){
                qmService.actionSheets.showVariableObjectActionSheet(v.name, v, extraButtons, state);
            }
            $scope.generalButtonClickHandler = qmService.buttonClickHandlers.generalButtonClickHandler;
            $scope.$watch(function(){
                return $ionicSideMenuDelegate.getOpenRatio();
            }, function(ratio){
                if(ratio == 1){
                    $scope.showCloseMenuButton = true;
                    $scope.hideMenuButton = true;
                }
                if(ratio == 0){
                    $scope.showCloseMenuButton = false;
                    $scope.hideMenuButton = false;
                }
            });
            $scope.goToVariableSettingsForCauseVariable = function(study){
                /** @namespace correlationObject.causeVariable */
                if(study.causeVariable){
                    qmService.goToState('app.variableSettingsVariableName', {
                        variableObject: study.causeVariable,
                        variableName: study.causeVariableName
                    });
                }else{
                    qmService.goToState('app.variableSettingsVariableName', {variableName: study.causeVariableName});
                }
            };
            $scope.goToVariableSettingsForEffectVariable = function(study){
                /** @namespace correlationObject.effectVariable */
                if(study.effectVariable){
                    qmService.goToState('app.variableSettingsVariableName', {
                        variableObject: study.effectVariable,
                        variableName: study.effectVariableName
                    });
                }else{
                    qmService.goToState('app.variableSettingsVariableName', {variableName: study.effectVariableName});
                }
            };
            $scope.openUrl = function(url, showLocationBar, windowTarget){
                showLocationBar = showLocationBar || "no";
                windowTarget = windowTarget || '_blank';
                if(typeof cordova !== "undefined"){
                    cordova.InAppBrowser.open(url, windowTarget, 'location=' + showLocationBar + ',toolbar=yes,clearcache=no,clearsessioncache=no');
                }else{
                    if($rootScope.platform.isWeb){
                        window.open(url, windowTarget);  // Otherwise it opens weird popup instead of new tab
                    }else{
                        window.open(url, windowTarget, 'location=' + showLocationBar + ',toolbar=yes,clearcache=yes,clearsessioncache=yes');
                    }
                }
            };
            $scope.toggleStudyShare = function(study, ev){
                if(study.studySharing.shareUserMeasurements){
                    qmService.studyHelper.showShareStudyConfirmation(study, ev);
                }else{
                    qmService.studyHelper.showUnShareStudyConfirmation(study, ev);
                }
            };
            $scope.shareStudy = function(study, shareType, ev){
                if(!study){
                    qmLog.error("No study provided to shareStudy!");
                    return;
                }
                var sharingUrl = qm.objectHelper.getValueOfPropertyOrSubPropertyWithNameLike(shareType, study);
                if(!sharingUrl){
                    qmLog.error("No sharing url for this study: ", {study: study});
                }
                if(sharingUrl.indexOf('userId') !== -1 && !study.studySharing.shareUserMeasurements){
                    qmService.studyHelper.showShareStudyConfirmation(study, sharingUrl, ev);
                    return;
                }
                qmService.studyHelper.shareStudyNativelyOrViaWeb(study, sharingUrl);
            };
            $scope.openSharingUrl = function(sharingUrl){
                qmService.openSharingUrl(sharingUrl);
            };
            $scope.openStudyLinkFacebook = function(causeVariableName, effectVariableName, study){
                qmService.openSharingUrl(qmService.getStudyLinks(causeVariableName, effectVariableName, study).studyLinkFacebook);
            };
            $scope.openStudyLinkTwitter = function(causeVariableName, effectVariableName, study){
                qmService.openSharingUrl(qmService.getStudyLinks(causeVariableName, effectVariableName, study).studyLinkTwitter);
            };
            $scope.openStudyLinkGoogle = function(causeVariableName, effectVariableName, study){
                qmService.openSharingUrl(qmService.getStudyLinks(causeVariableName, effectVariableName, study).studyLinkGoogle);
            };
            $scope.openStudyLinkEmail = function(causeVariableName, effectVariableName, study){
                qmService.openSharingUrl(qmService.getStudyLinks(causeVariableName, effectVariableName, study).studyLinkEmail);
            };
            $scope.toggleVariableShare = function(variable, ev){
                if(variable.shareUserMeasurements){
                    qmService.showShareVariableConfirmation(variable, ev);
                }else{
                    qmService.showUnShareVariableConfirmation(variable, ev);
                }
            };
            $rootScope.setLocalStorageFlagTrue = function(flagName){
                qmLog.debug('Set ' + flagName + ' to true', null);
                qmService.rootScope.setProperty(flagName, true);
                qm.storage.setItem(flagName, true);
            };
            $scope.showHelpInfoPopup = function(explanationId, ev, modelName){
                qmService.help.showExplanationsPopup(explanationId, ev, modelName);
            };
            $scope.closeMenuIfNeeded = function(menuItem){
                menuItem.showSubMenu = !menuItem.showSubMenu;
                if(menuItem.click){
                    $scope[menuItem.click] && $scope[menuItem.click]();
                }else if(!menuItem.subMenu){
                    $scope.closeMenu();
                }
            };
            $scope.positiveRatingOptions = qmService.getPositiveRatingOptions();
            $scope.negativeRatingOptions = qmService.getNegativeRatingOptions();
            $scope.numericRatingOptions = qmService.getNumericRatingOptions();
            $scope.downVote = function(study, $index, ev){
                var correlationObject = study.statistics;
                var causeVariableName = qm.studyHelper.getCauseVariableName(study);
                var effectVariableName = qm.studyHelper.getEffectVariableName(study);
                if(correlationObject.correlationCoefficient > 0){
                    $scope.increasesDecreases = "increases";
                }else{
                    $scope.increasesDecreases = "decreases";
                }
                var title, textContent, yesCallback, noCallback;
                if(study.studyVotes.userVote !== 0){
                    //title = 'Implausible relationship?';
                    title = 'Flawed?';
                    //textContent = 'Do you think is is IMPOSSIBLE that ' + causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + effectVariableName + '?';
                    textContent = 'Do you feel this study is invalid in some way or useless?';
                    yesCallback = function(){
                        study.studyVotes.userVote = 0;
                        qmService.postVoteToApi(study, function(response){
                            qmLog.debug('Down voted!', null);
                        }, function(){
                            qmLog.error('Down vote failed!');
                        });
                    };
                    noCallback = function(){
                    };
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                }else{
                    title = 'Delete Down-Vote';
                    textContent = 'You previously voted that it is IMPOSSIBLE that ' + causeVariableName +
                        ' ' + $scope.increasesDecreases + ' your ' + effectVariableName + '. Do you want to delete this down vote?';
                    yesCallback = function(){
                        deleteVote(study);
                    };
                    noCallback = function(){
                    };
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                }
            };
            $scope.upVote = function(study, $index, ev){
                var correlationObject = study.statistics || study;
                var causeVariableName = qm.studyHelper.getCauseVariableName(study);
                var effectVariableName = qm.studyHelper.getEffectVariableName(study);
                if(correlationObject.correlationCoefficient > 0){
                    $scope.increasesDecreases = "increases";
                }else{
                    $scope.increasesDecreases = "decreases";
                }
                var title, textContent, yesCallback, noCallback;
                if(study.studyVotes.userVote !== 1){
                    title = 'Seems Valid?';
                    textContent = 'Do you think it is POSSIBLE that ' + causeVariableName + ' ' +
                        //$scope.increasesDecreases +
                        ' is related to ' +
                        ' your ' + effectVariableName + '?';
                    yesCallback = function(){
                        study.studyVotes.userVote = 1;
                        qmService.postVoteToApi(study, function(){
                            qmLog.debug('upVote', null);
                        }, function(){
                            qmLog.error('upVote failed!');
                        });
                    };
                    noCallback = function(){
                    };
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                }else{
                    title = 'Delete Up-Vote';
                    textContent = 'You previously voted that it is POSSIBLE that ' + causeVariableName +
                        ' ' + $scope.increasesDecreases + ' your ' + effectVariableName + '. Do you want to delete this up vote?';
                    yesCallback = function(){
                        deleteVote(study);
                    };
                    noCallback = function(){
                    };
                    qmService.showMaterialConfirmationDialog(title, textContent, yesCallback, noCallback, ev);
                }
            };
            function deleteVote(study){
                study.studyVotes.userVote = null;
                qm.studyHelper.deleteVote(study, function(response){
                    qmLog.debug('deleteVote response', response);
                }, function(error){
                    qmLog.error("deleteVote error", error);
                });
            }
            $scope.safeApply = function(fn){
                if(!this.$root){ // Doesn't seem to cause any problems
                    qmLog.debug("this.$root is not set!");
                    if(fn && (typeof (fn) === 'function')){
                        fn();
                    }
                    return;
                }
                var phase = this.$root.$$phase;
                if(phase === '$apply' || phase === '$digest'){
                    if(fn && (typeof (fn) === 'function')){
                        fn();
                    }
                }else{
                    this.$apply(fn);
                }
            };
            $scope.onTextClick = function($event){
                qmLog.debug('Auto selecting text so the user doesn\'t have to press backspace...', null);
                $event.target.select();
            };
            $scope.favoriteValidationFailure = function(message){
                qmService.showMaterialAlert('Whoops!', message);
                qmLog.error(message);
            };
            $scope.trackFavoriteByValueField = function(trackingReminder, modifiedValue){
                if(typeof modifiedValue !== "undefined" && modifiedValue !== null){
                    trackingReminder.modifiedValue = modifiedValue;
                }
                if(trackingReminder.modifiedValue === null){
                    $scope.favoriteValidationFailure('Please specify a value for ' + trackingReminder.variableName);
                    return;
                }
                trackingReminder.displayTotal =
                    qm.stringHelper.formatValueUnitDisplayText("Recorded " + trackingReminder.modifiedValue + " " + trackingReminder.unitAbbreviatedName);
                qm.measurements.postMeasurementByReminder(trackingReminder, trackingReminder.modifiedValue)
                    .then(function(){
                        qmLog.debug('Successfully qmService.postMeasurementByReminder: ' + JSON.stringify(trackingReminder));
                    }, function(error){
                        qmLog.error('Failed to track favorite! error: ', error, trackingReminder);
                    });
            };
            // Triggered on a button click, or some other target
            $scope.showFavoriteActionSheet = function(favorite, $index, bloodPressure, state){
                var variableObject = {id: favorite.variableId, name: favorite.variableName};
                var actionMenuButtons = [
                    {text: '<i class="icon ion-gear-a"></i>Edit Reminder'},
                    {text: '<i class="icon ion-edit"></i>Other Value/Time/Note'},
                    qmService.actionSheets.actionSheetButtons.charts,
                    qmService.actionSheets.actionSheetButtons.historyAllVariable,
                    qmService.actionSheets.actionSheetButtons.variableSettings
                ];
                /** @namespace qm.getAppSettings().favoritesController */
                var appSettings = qm.getAppSettings();
                if(appSettings.favoritesController && appSettings.favoritesController.actionMenuButtons){
                    actionMenuButtons = appSettings.favoritesController.actionMenuButtons;
                }
                if(bloodPressure){
                    actionMenuButtons = [];
                }
                var hideSheet = $ionicActionSheet.show({
                    buttons: actionMenuButtons,
                    destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED', null);
                    },
                    buttonClicked: function(i, button){
                        qmLog.debug('BUTTON CLICKED', null, i);
                        if(i === 0){qmService.goToState('app.reminderAdd', {reminder: favorite});}
                        if(i === 1){qmService.goToState('app.measurementAdd', {trackingReminder: favorite});}
                        if(i === 2){qmService.goToState('app.charts', {trackingReminder: favorite,});}
                        if(i === 3){qmService.goToState('app.historyAllVariable', {variableObject: variableObject});}
                        if(i === 4){qmService.goToVariableSettingsByName(favorite.variableName);}
                        return true;
                    },
                    destructiveButtonClicked: function(){
                        state.favoritesArray = state.favoritesArray.filter(function(one){return one.id !== favorite.id;});
                        qm.reminderHelper.deleteReminder(favorite);
                        return true;
                    }
                });
                $timeout(function(){
                    hideSheet();
                }, 20000);
            };
            $scope.trackBloodPressure = function(){
                qm.measurements.postBloodPressureMeasurements($rootScope.bloodPressure);
            };
            $scope.showExplanationsPopup = function(parameterOrPropertyName, ev, modelName, title){
                qmService.help.showExplanationsPopup(parameterOrPropertyName, ev, modelName, title);
            };
            $scope.goBack = function(providedStateParams){
                qmService.stateHelper.goBack(providedStateParams);
            };
            $scope.trackLocationWithMeasurementsChange = function(event, trackLocation){
                if(trackLocation !== null && typeof trackLocation !== "undefined"){
                    $rootScope.user.trackLocation = trackLocation;
                }
                qmLog.debug('trackLocation', null, $rootScope.user.trackLocation);
                qmService.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
                if($rootScope.user && $rootScope.user.trackLocation){
                    qmLog.debug('Going to execute qmService.backgroundGeolocationStartIfEnabled if $ionicPlatform.ready');
                    qmService.showInfoToast('Location tracking enabled');
                    qmService.updateLocationVariablesAndPostMeasurementIfChanged();
                }
                if(!$rootScope.user.trackLocation){
                    qmService.showInfoToast('Location tracking disabled');
                    qmLog.debug('Do not track location');
                }
            };
            $scope.$on('$stateChangeSuccess', function(){
                qmService.navBar.setOfflineConnectionErrorShowing(false);
                qmLog.globalMetaData.context = $state.current.name;
                if(typeof analytics !== 'undefined'){
                    analytics.trackView($state.current.name);
                }
                qmService.adSense.showOrHide();
                qmService.adBanner.showOrHide($stateParams);
                //qmService.login.deleteAfterLoginStateIfItMatchesCurrentState();
                $scope.closeMenu();
            });
            $scope.showMaterialAlert = function(title, textContent, ev){
                qmService.showMaterialAlert(title, textContent, ev);
            };
            $scope.copyLinkText = 'Copy Shareable Link to Clipboard';
            $scope.copyToClipboard = function(url, name){
                name = name || url;
                $scope.copyLinkText = 'Copied!';
                clipboard.copyText(url);
                qmService.showInfoToast('Copied ' + name + ' to clipboard!');
            };
            $scope.copyDemoLink = function(){
                var url = "https://web.quantimo.do" + window.location.hash;
                url = qm.urlHelper.addUrlQueryParamsToUrlString({clientId: qm.getClientId(), accessToken: "demo"}, url);
                var name = "Demo Link to " + qm.stringHelper.camelToTitleCase($state.current.name.replace('app.', ''));
                $scope.copyToClipboard(url, name);
            };
            $scope.sendEmailAfterVerification = function(emailType){
                qmService.sendEmailAfterVerification(emailType);
            };
            $scope.updateEmailAndExecuteCallback = function(callback){
                qmService.updateEmailAndExecuteCallback(callback);
            };
            $scope.goToStudyPageViaStudy = qm.studyHelper.goToStudyPageViaStudy;
            $scope.goToJoinStudy = qm.studyHelper.goToJoinStudy;
            $scope.showGeneralVariableSearchDialog = function(ev){
                function selectVariable(variable){
                    $scope.variableObject = variable;
                    qmLog.debug('Selected variable: ' + variable.name);
                    qmService.actionSheets.showVariableObjectActionSheet(variable.name, variable);
                }
                var dialogParameters = {
                    title: 'Select Variable',
                    helpText: "Search for a variable to add a measurement, reminder, view history, or see relationships",
                    placeholder: "Search for a variable", // Don't use ellipses because we append to this sometimes
                    buttonText: "Select Variable",
                    requestParams: {includePublic: true}
                };
                qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, ev);
            };
            $scope.switchToPatientInCurrentApp = qmService.patient.switchToPatientInCurrentApp;
            $scope.trustAsHtml = function(string){
                return $sce.trustAsHtml(string);
            };
            $rootScope.setMicAndSpeechEnabled = function(value, hideRobot){
                if($rootScope.micEnabled === value && $rootScope.speechEnabled === value){
                    qmLog.debug("micEnabled and speechEnabled already set to " + value);
                    return;
                }
                qmLog.debug("$rootScope.setMicAndSpeechEnabled");
                if(value === 'toggle'){
                    value = !qm.mic.getMicEnabled();
                }
                $timeout(function(){
                    qmService.rootScope.setProperty('micEnabled', value);
                    qm.mic.setMicEnabled(value);
                    qm.speech.setSpeechEnabled(value);
                    if(value === false){
                        if(hideRobot){  // We might want to just mute without hiding sometimes and leave it there to enable later
                            qm.robot.hideRobot();
                        }
                        qm.visualizer.hideVisualizer();
                        qm.mic.onMicDisabled();
                    }
                    if(value === true){
                        qm.robot.showRobot();
                        qm.visualizer.showVisualizer();
                        qm.mic.onMicEnabled();
                    }
                }, 1);
            };
            $scope.setSpeechEnabled = function(value){
                $scope.speechEnabled = value;
                qmService.rootScope.setProperty('speechEnabled', value);
                qm.speech.setSpeechEnabled(value);
                qm.speech.defaultAction();
            };
            $scope.setVisualizationEnabled = function(value){
                $scope.visualizationEnabled = value;
                qmService.rootScope.setProperty('visualizationEnabled', value);
                qm.visualizer.setVisualizationEnabled(value);
            };
            $scope.robotClick = function(){
                if(qm.robot.onRobotClick){
                    qm.robot.onRobotClick();
                }else if($state.current.name === qm.staticData.stateNames.chat){
                    qmService.robot.toggleSpeechAndMicEnabled();
                }else{
                    qmService.goToState(qm.staticData.stateNames.chat);
                }
            };
        }]);
