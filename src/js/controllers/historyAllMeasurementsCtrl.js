
angular.module('starter').controller('historyAllMeasurementsCtrl', ["$scope", "$state", "$stateParams", "$rootScope",
    "$timeout", "$ionicActionSheet", "qmService", function($scope, $state, $stateParams, $rootScope, $timeout,
                                                                           $ionicActionSheet, qmService){
        $scope.controller_name = "historyAllMeasurementsCtrl";
        $scope.state = {
            helpCardTitle: "Past Measurements",
            history: [],
            limit: 50,
            loadingText: "Fetching measurements...",
            moreDataCanBeLoaded: true,
            noHistory: false,
            showLocationToggle: false,
            sort: "-startAt",
            title: "History",
            units: [],
            setNote:function (m, note){
                m.note = note;
                qm.measurements.saveMeasurement(m)
            }
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if(!$scope.helpCard || $scope.helpCard.title !== "Past Measurements"){
                $scope.helpCard = {
                    title: "Past Measurements",
                    bodyText: "Edit or add notes by tapping on any measurement below. Drag down to refresh and get your most recent measurements.",
                    icon: "ion-calendar"
                };
            }
        });
        $scope.$on('$ionicView.enter', function(e){
            setupMeasurements($stateParams, $scope, setHistory, getRequestParams);
            // Need to use rootScope here for some reason
            qmService.rootScope.setProperty('hideHistoryPageInstructionsCard', qm.storage.getItem('hideHistoryPageInstructionsCard'));
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            setupCategory();
            setupVariable();
            setupConnector();
            updateNavigationMenuButton();
            if(!$scope.state.history || !$scope.state.history.length){ // Otherwise it keeps add more measurements whenever we edit one
                $scope.getHistory();
            }
            //qm.urlHelper.addParamsToCurrentUrl($stateParams)
        });
        function setTitle(title){document.title = $scope.state.title = title;}
        function setupVariable() {
            getScopedVariableObject();
            if (getVariableName()) {
                setTitle(getVariableName() + ' History');
            }
        }
        function setupConnector() {
            var c = getConnector()
            if (c) {
                setTitle(c.displayName + " History")
            }
        }
        function setupCategory() {
            var cat = getVariableCategoryName();
            if (cat && cat !== 'Anything') {
                setTitle(cat + ' History');
                $scope.state.showLocationToggle = cat === "Location";
            }
            if (cat) {
                setupVariableCategoryActionSheet();
            }
        }
        function setupMeasurements() {
            var measurements = $stateParams.updatedMeasurementHistory;
            if (measurements && measurements.length) {
                measurements = qm.measurements.processMeasurements(measurements)
                var sorted = qm.arrayHelper.sortByProperty(measurements, $scope.state.sort)
                setHistory(sorted.slice(0, $scope.state.limit));
            } else {
                var params = getRequestParams();
                qm.measurements.getLocalMeasurements(params).then(function (combined) {
                    setHistory(combined)
                })
            }
            $scope.state.moreDataCanBeLoaded = true;
        }
        function updateNavigationMenuButton(){
            $timeout(function(){
                qmService.rootScope.setShowActionSheetMenu(function(){
                    // Show the action sheet
                    var allButtons = qmService.actionSheets.actionSheetButtons;
                    var hideSheet = $ionicActionSheet.show({
                        buttons: [
                            allButtons.refresh,
                            allButtons.settings,
                            allButtons.sortDescendingValue,
                            allButtons.sortAscendingValue,
                            allButtons.sortDescendingTime,
                            allButtons.sortAscendingTime
                        ],
                        cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                        cancel: function(){
                            qmLog.debug('CANCELLED', null);
                        },
                        buttonClicked: function(index, button){
                            if(index === 0){
                                $scope.refreshHistory();
                            }
                            if(index === 1){
                                qmService.goToState(qm.staticData.stateNames.settings);
                            }
                            if(button.text === allButtons.sortDescendingValue.text){
                                changeSortAndGetHistory('-value');
                            }
                            if(button.text === allButtons.sortAscendingValue.text){
                                changeSortAndGetHistory('value');
                            }
                            if(button.text === allButtons.sortDescendingTime.text){
                                changeSortAndGetHistory('-startAt');
                            }
                            if(button.text === allButtons.sortAscendingTime.text){
                                changeSortAndGetHistory('startAt');
                            }
                            return true;
                        }
                    });
                });
            }, 1);
        }
        function changeSortAndGetHistory(sort){
            $scope.state.sort = sort;
            setHistory($scope.state.history);
            $scope.getHistory();
        }
        function setHistory(measurements){
            var sorted = qm.arrayHelper.sortByProperty(measurements, $scope.state.sort)
            $scope.safeApply(function () {
                //debugger
                $scope.state.history = sorted;
            })
        }
        function hideLoader(){
            //Stop the ion-refresher from spinning
            $scope.$broadcast('scroll.refreshComplete');
            $scope.state.loading = false;
            qmService.hideLoader();
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        function getScopedVariableObject(){
            if($scope.state.variableObject && $scope.state.variableObject.name === getVariableName()){
                return $scope.state.variableObject;
            }
            if($stateParams.variableObject){
                return $scope.state.variableObject = $stateParams.variableObject;
            }
            return null;
        }
        function getVariableName(){
            if($stateParams.variableName){
                return $stateParams.variableName;
            }
            if($stateParams.variableObject){
                return $stateParams.variableObject.name;
            }
            if(qm.urlHelper.getParam('variableName')){
                return qm.urlHelper.getParam('variableName');
            }
            qmLog.debug("Could not get variableName")
            return null;
        }
        function getVariableCategoryName(){
            return qm.variableCategoryHelper.getNameFromStateParamsOrUrl($stateParams);
        }
        function getConnectorName(){
            if($stateParams.connectorName){
                return $stateParams.connectorName;
            }
            if(qm.urlHelper.getParam('connectorName')){
                return qm.urlHelper.getParam('connectorName');
            }
            if(getConnectorId()){
                var connectorId = getConnectorId();
                var connector = qm.connectorHelper.getConnectorById(connectorId);
                if(!connector){
                    qmLog.error(
                        "Cannot filter by connector id because we could not find a matching connector locally");
                    return null;
                }
                return connector.name;
            }
            qmLog.debug("Could not get connectorName")
        }
        function getConnector(){
            if(getConnectorId()){
                return qm.connectorHelper.getConnectorById(getConnectorId())
            }
            if(getConnectorName()){
                return qm.connectorHelper.getConnectorById(getConnectorId())
            }
            return null;
        }
        function getConnectorId(){
            if($stateParams.connectorId){
                return $stateParams.connectorId;
            }
            if(qm.urlHelper.getParam('connector_id')){
                return qm.urlHelper.getParam('connector_id');
            }
            qmLog.debug("Could not get connector_id")
        }
        $scope.editMeasurement = function(measurement){
            //measurement.hide = true;  // Hiding when we go to edit so we don't see the old value when we come back
            qmService.goToState('app.measurementAdd', {
                measurement: measurement,
            });
        };
        $scope.refreshHistory = function(){
            $scope.state.moreDataCanBeLoaded = true;
            setHistory([])
            $scope.getHistory();
        };
        function getRequestParams(params){
            params = params || {};
            if(getVariableName()){
                params.variableName = getVariableName();
            }
            if(getConnector()){
                params.connectorId = getConnector().id;
            }
            if(getVariableCategoryName()){
                params.variableCategoryName = getVariableCategoryName();
            }
            params.sort = $scope.state.sort;
            return params;
        }
        $scope.getHistory = function(){
            if($scope.state.loading){
                return qmLog.info("Already getting measurements!");
            }
            if(!$scope.state.moreDataCanBeLoaded){
                hideLoader();
                return qmLog.info("No more measurements!");
            }
            $scope.state.loading = true;
            if(!$scope.state.history){
                setHistory([])
            }
            var params = {
                offset: $scope.state.history.length,
                limit: $scope.state.limit,
                sort: $scope.state.sort,
                doNotProcess: true
            };
            params = getRequestParams(params);
            if(getVariableName()){
                if(!$scope.state.variableObject){
                    qm.userVariables.getFromLocalStorageOrApi({variableName: getVariableName()})
                        .then(function(variables){
                            $scope.safeApply(function(){
                                $scope.state.variableObject = variables[0];
                            })
                    }, function(error){
                        qmLog.error(error);
                    });
                }
            }
            function successHandler(measurements){
                if(!measurements || measurements.length < (params.limit -1)){ // For some reason we're returning 49 instead of 50 sometimes
                    $scope.state.moreDataCanBeLoaded = false;
                }
                if(measurements.length < $scope.state.limit){
                    $scope.state.noHistory = measurements.length === 0;
                }
                qm.measurements.addLocalMeasurements(measurements, getRequestParams(),function (combined) {
                    setHistory(combined)
                    hideLoader();
                })
            }
            function errorHandler(error){
                qmLog.error("History update error: ", error);
                $scope.state.noHistory = true;
                hideLoader();
            }
            var c = getConnector();
            if(c){
                qm.measurements.getMeasurementsFromApi(params).then(function (measurements) {
                    successHandler(measurements)
                    qm.connectorHelper.update(c.name, function (r){
                        debugger
                        if(r.measurements){
                            setHistory(r.measurements);
                        } else {
                            qm.measurements.getMeasurementsFromApi(params).then(successHandler, errorHandler);
                        }
                    })
                }, errorHandler);
            } else {
                //qmService.showBasicLoader();
                qm.measurements.getMeasurementsFromApi(params).then(successHandler, errorHandler);
            }
        };
        // noinspection DuplicatedCode
        function setupVariableCategoryActionSheet(){
            qmService.rootScope.setShowActionSheetMenu(function(){
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        //{ text: '<i class="icon ion-ios-star"></i>Add to Favorites'},
                        {text: '<i class="icon ion-happy-outline"></i>Emotions'},
                        {text: '<i class="icon ion-ios-nutrition-outline"></i>Foods'},
                        {text: '<i class="icon ion-sad-outline"></i>Symptoms'},
                        {text: '<i class="icon ion-ios-medkit-outline"></i>Treatments'},
                        {text: '<i class="icon ion-ios-body-outline"></i>Physical Activity'},
                        {text: '<i class="icon ion-ios-pulse"></i>Vital Signs'},
                        {text: '<i class="icon ion-ios-location-outline"></i>Locations'}
                    ],
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED', null);
                    },
                    buttonClicked: function(index, button){
                        if(index === 0){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Emotions'});
                        }
                        if(index === 1){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Foods'});
                        }
                        if(index === 2){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Symptoms'});
                        }
                        if(index === 3){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Treatments'});
                        }
                        if(index === 4){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Physical Activity'});
                        }
                        if(index === 5){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Vital Signs'});
                        }
                        if(index === 6){
                            qmService.goToState('app.historyAll', {variableCategoryName: 'Locations'});
                        }
                        return true;
                    },
                    destructiveButtonClicked: function(){
                    }
                });
                $timeout(function(){
                    hideSheet();
                }, 20000);
            });
        }
        $scope.deleteMeasurement = function(m){
            m.hide = true;
            qm.measurements.deleteMeasurement(m);
        };
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.showActionSheetForMeasurement = function(m){
            $scope.state.measurement = m;
            var variableObject = JSON.parse(JSON.stringify(m));
            variableObject.variableId = m.variableId;
            variableObject.name = m.variableName;
            var allButtons = qmService.actionSheets.actionSheetButtons;
            var buttons = [
                {text: '<i class="icon ion-edit"></i>Edit Measurement'},
                allButtons.reminderAdd,
                allButtons.charts,
                allButtons.historyAllVariable,
                allButtons.variableSettings,
                allButtons.relationships
            ];
            if(m.url){
                buttons.push(allButtons.openUrl);
            }
            var hideSheet = $ionicActionSheet.show({
                buttons: buttons,
                destructiveText: '<i class="icon ion-trash-a"></i>Delete Measurement',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function(){
                    qmLog.debug(null, $state.current.name + ': ' + 'CANCELLED', null);
                },
                buttonClicked: function(index, button){
                    qmLog.debug(null, $state.current.name + ': ' + 'BUTTON CLICKED', null, index);
                    if(index === 0){
                        $scope.editMeasurement($scope.state.measurement);
                    }
                    if(index === 1){
                        qmService.goToState('app.reminderAdd', {variableObject: variableObject});
                    }
                    if(index === 2){
                        qmService.goToState('app.charts', {variableObject: variableObject});
                    }
                    if(index === 3){
                        qmService.goToState('app.historyAllVariable', {variableObject: variableObject});
                    }
                    if(index === 4){
                        qmService.goToVariableSettingsByName($scope.state.measurement.variableName);
                    }
                    if(index === 5){
                        qmService.showBlackRingLoader();
                        qmService.goToCorrelationsListForVariable($scope.state.measurement.variableName);
                    }
                    if(index === 6){
                        qm.urlHelper.openUrlInNewTab(m.url);
                    }
                    return true;
                },
                destructiveButtonClicked: function(){
                    $scope.deleteMeasurement(m);
                    return true;
                }
            });
            $timeout(function(){
                hideSheet();
            }, 20000);
        };
    }]);
