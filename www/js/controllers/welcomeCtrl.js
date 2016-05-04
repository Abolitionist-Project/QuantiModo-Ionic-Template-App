angular.module('starter')
    
    // Handlers the Welcome Page
    .controller('WelcomeCtrl', function($scope, $ionicModal, $timeout, utilsService, authService, measurementService,
                                        $state, $ionicHistory, notificationService, localStorageService, $rootScope) {
        
        $scope.controller_name = "WelcomeCtrl";
        $scope.isIOS = ionic.Platform.isIPad() || ionic.Platform.isIOS();
        $scope.isAndroid = ionic.Platform.isAndroid();
        $scope.isChrome = window.chrome ? true : false;
        $rootScope.hideMenu = true;
        $scope.reportedVariableValue = false;
        $scope.headline = config.appSettings.headline;
        $scope.features = config.appSettings.features;
        $scope.appName = config.appSettings.appName;
        $scope.allowOffline = config.getAllowOffline();
        console.log('hide menu');


        // flags
        localStorageService.getItem('primaryOutcomeVariableReportedWelcomeScreen', function (primaryOutcomeVariableReportedWelcomeScreen) {
            $scope.showPrimaryOutcomeVariableCard = primaryOutcomeVariableReportedWelcomeScreen ? false : true;

        });

        localStorageService.getItem('askForRating',function(askForRating){
            $scope.notificationInterval = askForRating || $scope.isIOS? "hour" : "hourly";
        });

        $scope.subscribeNotification = true;
        
        console.log("$scope", $scope.showIntervalCard);

        // when interval is set 
        $scope.saveInterval = function(){

            /*TODO schedule notification*/
            if($scope.subscribeNotification){

                notificationService.scheduleNotification($scope.notificationInterval);

                var intervals = {
                    "never" : 0,
                    "hourly": 60 * 60,
                    "hour": 60 * 60,
                    "three" : 03 * 60 * 60,
                    "twice" : 12 * 60 * 60,
                    "daily" : 24 * 60 * 60,
                    "day" : 24 * 60 * 60
                };

                $rootScope.reminderToSchedule = {
                    id: config.appSettings.primaryOutcomeVariableDetails.id,
                    reportedVariableValue: $scope.reportedVariableValue,
                    interval: intervals[$scope.notificationInterval], 
                    name: config.appSettings.primaryOutcomeVariableDetails.name,
                    category: config.appSettings.primaryOutcomeVariableDetails.category,
                    unit: config.appSettings.primaryOutcomeVariableDetails.unit,
                    combinationOperation : config.appSettings.primaryOutcomeVariableDetails.combinationOperation
                };

                localStorageService.setItem('askForRating', $scope.notificationInterval);
                $scope.showIntervalCard = false;
            }            
        };

        // skip interval reporting is tapped
        $scope.skipInterval = function(){
            $scope.showIntervalCard = false;
        };

        // ratingValue is reported
        $scope.reportPrimaryOutcomeVariable = function(ratingValue){

            $scope.reportedVariableValue = config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] ?
                config.appSettings.primaryOutcomeValueConversionDataSetReversed[ratingValue] : false;
            
            localStorageService.setItem('primaryOutcomeVariableReportedWelcomeScreen',true);
            localStorageService.setItem('allMeasurements', JSON.stringify([]));
            
            // update localstorage
            measurementService.updatePrimaryOutcomeVariableLocally(ratingValue).then(function () {
                // try to send the data to server
                measurementService.updatePrimaryOutcomeVariable(ratingValue);

                // calculate charts data
                measurementService.calculateAveragePrimaryOutcomeVariableValue().then(function(){
                    measurementService.calculateBothChart();
                    $scope.showPrimaryOutcomeVariableCard = false;
                });
            });
        };

        // constructor
        $scope.init = function(){
            console.log("welcome init");
            
            // for setting intervals
            $scope.timeRemaining = false;
            
        };

        $scope.init();
    });