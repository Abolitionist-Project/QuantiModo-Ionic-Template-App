angular.module('starter').controller('ChartsPageCtrl', ["$scope", "$q", "$state", "$timeout", "$rootScope",
    "$ionicLoading", "$ionicActionSheet", "$stateParams", "qmService", "clipboard",
    function($scope, $q, $state, $timeout, $rootScope, $ionicLoading, $ionicActionSheet, $stateParams, qmService, clipboard){
        $scope.controller_name = "ChartsPageCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            title: "Charts",
        };
        $scope.$on('$ionicView.enter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.debug('Entering state ' + $state.current.name);
            qm.urlHelper.addUrlParamsToObject($scope.state);
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            $scope.variableName = getVariableName();
            $scope.state.title = qmService.getTruncatedVariableName(getVariableName());
            if(getScopedVariableObject()){
                qmService.rootScope.setShowActionSheetMenu(function setActionSheet(){
                    return qmService.actionSheets.showVariableObjectActionSheet(getVariableName(), getScopedVariableObject());
                });
            }
            initializeCharts();
            if(!clipboard.supported){
                console.log('Sorry, copy to clipboard is not supported');
                $scope.hideClipboardButton = true;
            }
        });
        function hideLoader(){
            qmService.hideLoader();
            $scope.$broadcast('scroll.refreshComplete');
        }
        function getVariableName(){
            if($scope.variableName){
                return $scope.variableName;
            }
            if(qm.urlHelper.getParam('variableName')){
                return qm.urlHelper.getParam('variableName');
            }
            if($stateParams.variableName){
                return $stateParams.variableName;
            }
            if($stateParams.variableObject){
                return $stateParams.variableObject.name;
            }
            if($scope.state.variableObject){
                return $scope.state.variableObject.name;
            }
            $scope.goBack();
        }
        function getScopedVariableObject(){
            if($scope.state.variableObject && $scope.state.variableObject.name === getVariableName()){
                return $scope.state.variableObject;
            }
            if($stateParams.variableObject){
                return $scope.state.variableObject = $stateParams.variableObject;
            }
            return $scope.state.variableObject;
        }
        function initializeCharts(){
            if(!getScopedVariableObject() || !getScopedVariableObject().charts){
                getCharts();
            }else if($stateParams.refresh){
                $scope.refreshCharts();
            }else{
                hideLoader();
            }
        }
        function removeHiddenCharts(variableObject){
            var clonedVariable = JSON.parse(JSON.stringify(variableObject));
            var charts = clonedVariable.charts;
            for(var property in charts){
                if(charts.hasOwnProperty(property)){
                    var chart = charts[property];
                    var hideParamName = 'hide' + qm.stringHelper.capitalizeFirstLetter(property);
                    var shouldHide = qmService.stateHelper.getValueFromScopeStateParamsOrUrl(hideParamName, $scope, $stateParams);
                    if(shouldHide){
                        delete charts[property];
                    }
                }
            }
            return clonedVariable;
        }
        function getCharts(refresh){
            qm.userVariables.findWithCharts(getVariableName(), refresh)
                .then(function(uv){
                    qmLog.info("Got variable " + uv.name);
                    if(!uv.charts){
                        qmLog.error("No charts!");
                        if(!$scope.state.variableObject || !$scope.state.variableObject.charts){
                            qmService.goToDefaultState();
                            return;
                        }
                    }
                    $scope.state.variableObject = removeHiddenCharts(uv);
                    if(uv){
                        qmLog.info("Setting action sheet with variable " + uv.name);
                        qmService.rootScope.setShowActionSheetMenu(function setActionSheet(){
                            return qmService.actionSheets.showVariableObjectActionSheet(getVariableName(), uv);
                        });
                    }else{
                        qmLog.error("No variable for action sheet!");
                    }
                    hideLoader();
                });
        }
        $scope.refreshCharts = function(){
            getCharts(true);
        };
        $scope.addNewReminderButtonClick = function(){
            qmLog.debug('addNewReminderButtonClick', null);
            qmService.goToState('app.reminderAdd', {
                variableObject: $scope.state.variableObject,
            });
        };
        $scope.compareButtonClick = function(){
            qmLog.debug('compareButtonClick');
            qmService.goToStudyCreationForVariable($scope.state.variableObject);
        };
        $scope.recordMeasurementButtonClick = function(){
            qmLog.info("Going to record measurement for " + JSON.stringify($scope.state.variableObject));
            qmService.goToState(qm.staticData.stateNames.measurementAdd, {
                variableObject: $scope.state.variableObject,
            });
        };
        $scope.editSettingsButtonClick = function(){
            qmService.goToVariableSettingsByObject($scope.state.variableObject);
        };
        $scope.shareCharts = function(variable, sharingUrl, ev){
            if(!variable.shareUserMeasurements){
                qmService.showShareVariableConfirmation(variable, sharingUrl, ev);
            }else{
                qmService.openSharingUrl(sharingUrl);
            }
        };
    }]);
