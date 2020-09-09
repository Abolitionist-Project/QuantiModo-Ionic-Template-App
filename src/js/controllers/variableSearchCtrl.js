angular.module('starter').controller('VariableSearchCtrl', ["$scope", "$state", "$rootScope", "$stateParams", "$timeout",
    "$filter", "qmService", "qmLogService", function($scope, $state, $rootScope, $stateParams, $timeout, $filter,
                                                     qmService, qmLogService){
        $scope.controller_name = "VariableSearchCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.$on('$ionicView.beforeEnter', function(e){
            qmLog.info($state.current.name + ' beforeEnter...');
            qmService.navBar.showNavigationMenuIfHideUrlParamNotSet();
            //qm.objectHelper.copyPropertiesFromOneObjectToAnother($stateParams, $scope.state, true);
            $scope.state = JSON.parse(JSON.stringify($stateParams)); // Overwrites cached results.  Necessary if in a different state
            $scope.state.searching = true;
            $scope.state.variableSearchResults = [];
            if(!$scope.state.variableSearchParameters){$scope.state.variableSearchParameters = {};}
            $scope.state.variableSearchQuery = {name: ''};
            if(!$scope.state.noVariablesFoundCard){
                $scope.state.noVariablesFoundCard = {
                    show: false,
                    title: 'No Variables Found',
                    body: "You don't have any data, yet.  Start tracking!"
                };
            }
            if(!$scope.state.title){$scope.state.title = "Select Variable";}
            if(!$scope.state.variableSearchPlaceholderText){$scope.state.variableSearchPlaceholderText = "Search for a variable here...";}
            $scope.state.variableSearchParameters.variableCategoryName = getVariableCategoryName();
            //$scope.showBarcodeScanner = $rootScope.platform.isMobile && (qm.arrayHelper.inArray($scope.state.variableSearchParameters.variableCategoryName, ['Anything', 'Foods', 'Treatments']));
            if(getVariableCategoryName()){
                $scope.state.variableSearchPlaceholderText = "Search for a " + getPluralVariableCategoryName().toLowerCase() + " here...";
                $scope.state.title = "Select " + getPluralVariableCategoryName();
                $scope.state.noVariablesFoundCard.title = 'No ' + getVariableCategoryName() + ' Found';
            }
            setHelpText();
        });
        $scope.$on('$ionicView.enter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.info($state.current.name + ' enter...');
            // We always need to repopulate in case variable was updated in local storage and the search view was cached
            qm.userVariables.refreshIfNumberOfRemindersGreaterThanUserVariables(function(userVariables){
                populateSearchResults();
            }, function(){
                populateSearchResults();
            });
            setHelpText();
            qmService.hideLoader();
            var upcTest = false;
            if(upcTest){
                $scope.state.variableSearchQuery.barcode = $scope.state.variableSearchQuery.name = "028400064057";
                $scope.onVariableSearch(function(){
                });
            }
            if(qm.urlHelper.getParam('upc')){
                qmService.barcodeScanner.scanSuccessHandler({text: qm.urlHelper.getParam('upc')},
                    {}, function(variables){
                    console.log(variables)
                }, function(error){
                    console.error(error);
                })
            }
        });
        $scope.selectVariable = function(variableObject){
            variableObject = qmService.barcodeScanner.addUpcToVariableObject(variableObject);
            qmLog.info($state.current.name + ': ' + '$scope.selectVariable: ' + JSON.stringify(variableObject).substring(0, 140) + '...', null);
            qm.variablesHelper.setLastSelectedAtAndSave(variableObject);
            $scope.state.variableSearchQuery.name = '';
            var userTagData;
            if($state.current.name === 'app.favoriteSearch'){
                qmService.addToFavoritesUsingVariableObject(variableObject);
            }else if(window.location.href.indexOf('reminder-search') !== -1){
                var options = {
                    skipReminderSettingsIfPossible: $scope.state.skipReminderSettingsIfPossible,
                    doneState: $scope.state.doneState
                };
                qmService.reminders.addToRemindersUsingVariableObject(variableObject, options);
            }else if($scope.state.nextState.indexOf('predictor') !== -1){
                qmService.goToState($scope.state.nextState, {effectVariableName: variableObject.name});
            }else if($scope.state.nextState.indexOf('outcome') !== -1){
                qmService.goToState($scope.state.nextState, {causeVariableName: variableObject.name});
            }else if($scope.state.userTaggedVariableObject){
                if($scope.state.userTaggedVariableObject.unitAbbreviatedName !== '/5'){
                    qmService.goToState($scope.state.nextState, {
                        userTaggedVariableObject: $scope.state.userTaggedVariableObject,
                        fromState: $scope.state.fromState,
                        fromStateParams: {variableObject: $scope.state.userTaggedVariableObject},
                        userTagVariableObject: variableObject
                    });
                }else{
                    userTagData = {
                        userTagVariableId: variableObject.variableId,
                        userTaggedVariableId: $scope.state.userTaggedVariableObject.variableId,
                        conversionFactor: 1
                    };
                    qmService.showBlackRingLoader();
                    qmService.postUserTagDeferred(userTagData).then(function(){
                        qmService.hideLoader();
                        if($scope.state.fromState){
                            qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTaggedVariableObject.name});
                        }else{
                            qmService.goToDefaultState();
                        }
                    });
                }
            }else if($scope.state.userTagVariableObject){
                if($scope.state.userTagVariableObject.unitAbbreviatedName !== '/5'){
                    qmService.goToState($scope.state.nextState, {
                        userTaggedVariableObject: variableObject,
                        fromState: $scope.state.fromState,
                        fromStateParams: {variableObject: $scope.state.userTagVariableObject},
                        userTagVariableObject: $scope.state.userTagVariableObject
                    });
                }else{
                    userTagData = {
                        userTagVariableId: $scope.state.userTagVariableObject.variableId,
                        userTaggedVariableId: variableObject.variableId,
                        conversionFactor: 1
                    };
                    qmService.showBlackRingLoader();
                    qmService.postUserTagDeferred(userTagData).then(function(){
                        qmService.hideLoader();
                        if($scope.state.fromState){
                            qmService.goToState($scope.state.fromState, {variableName: $scope.state.userTagVariableObject.name});
                        }else{
                            qmService.goToDefaultState();
                        }
                    });
                }
            }else{
                $scope.state.variableName = variableObject.name;
                $scope.state.variableObject = variableObject;
                qmService.goToState($scope.state.nextState, $scope.state);
            }
        };
        $scope.goToStateFromVariableSearch = function(stateName, params){
            if(!params){params = $stateParams;}
            qmService.goToState(stateName, params);
        };
        // when a query is searched in the search box
        function showAddVariableButtonIfNecessary(variables){
            if($scope.state.variableSearchQuery.barcode &&
                $scope.state.variableSearchQuery.barcode === $scope.state.variableSearchQuery.name){
                $scope.state.showAddVariableButton = false;
                return;
            }
            if($scope.state.doNotShowAddVariableButton){
                $scope.state.showAddVariableButton = false;
                return;
            }
            var resultIndex = 0;
            var found = false;
            while(!found && resultIndex < $scope.state.variableSearchResults.length){
                if($scope.state.variableSearchResults[resultIndex].name.toLowerCase() ===
                    $scope.state.variableSearchQuery.name.toLowerCase()){
                    found = true;
                }else{
                    resultIndex++;
                }
            }
            // If no results or no exact match, show "+ Add [variable]" button for query
            if((variables.length < 1 || !found)){
                $scope.showSearchLoader = false;
                qmLog.info($state.current.name + ': ' + '$scope.onVariableSearch: Set showAddVariableButton to true', null);
                $scope.state.showAddVariableButton = true;
                if($scope.state.nextState === "app.reminderAdd"){
                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' reminder';
                }else if($scope.state.nextState === "app.measurementAdd"){
                    $scope.state.addNewVariableButtonText = '+ Add ' + $scope.state.variableSearchQuery.name + ' measurement';
                }else{
                    $scope.state.addNewVariableButtonText = '+ ' + $scope.state.variableSearchQuery.name;
                }
            }
        }
        function showNoVariablesFoundCardIfNecessary(errorHandler){
            if($scope.state.variableSearchResults.length || !$scope.state.doNotShowAddVariableButton){
                $scope.state.noVariablesFoundCard.show = false;
                return;
            }
            $scope.state.noVariablesFoundCard.title = $scope.state.variableSearchQuery.name + ' Not Found';
            if($scope.state.noVariablesFoundCard && $scope.state.noVariablesFoundCard.body){
                $scope.state.noVariablesFoundCard.body = $scope.state.noVariablesFoundCard.body.replace('__VARIABLE_NAME__', $scope.state.variableSearchQuery.name.toUpperCase());
            }else{
                $scope.state.noVariablesFoundCard.body = "You don't have any data for " + $scope.state.variableSearchQuery.name.toUpperCase() + ", yet.  Start tracking!";
            }
            if(errorHandler){
                errorHandler();
            }
            $scope.state.noVariablesFoundCard.show = true;
        }
        function variableSearchSuccessHandler(variables, successHandler, errorHandler){
            if(successHandler && variables && variables.length){
                successHandler();
            }
            if(errorHandler && (!variables || !variables.length)){
                errorHandler();
            }
            addVariablesToScope(variables);
            if(!errorHandler){
                showAddVariableButtonIfNecessary(variables);
            }
            showNoVariablesFoundCardIfNecessary(errorHandler);
        }
        function addVariablesToScope(variables){
            variables = qm.arrayHelper.removeArrayElementsWithDuplicateIds(variables, 'variable');
            $scope.safeApply(function(){
                $scope.state.noVariablesFoundCard.show = false;
                $scope.state.showAddVariableButton = false;
                $scope.state.variableSearchResults = variables;
                var count = (variables) ? variables.length : 0;
                qmLog.info(count + ' variable search results from ' + $scope.state.variableSearchQuery.name + " search");
                $scope.state.searching = false;
            });
        }
        function getVariableSearchParameters(){
            var scope = $scope.state.variableSearchParameters;
            // $stateParams.variableSearchParameters.searchPhrase is getting populated somehow and is not being updated
            if($scope.state.variableSearchQuery.name){
                delete $stateParams.variableSearchParameters.searchPhrase;
            }
            var state = $stateParams.variableSearchParameters;
            return qm.objectHelper.copyPropertiesFromOneObjectToAnother(scope, state, false);
        }
        $scope.onVariableSearch = function(successHandler, errorHandler){
            $scope.state.noVariablesFoundCard.show = false;
            $scope.state.showAddVariableButton = false;
            var params = getVariableSearchParameters();
            var q = $scope.state.variableSearchQuery.name;
            qmLog.info($state.current.name + ': ' + 'Search term: ' + q + " with params: \n" +
                JSON.stringify(params, null, 2));
            if(q.length > 2){
                $scope.state.searching = true;
                qmService.searchVariablesDeferred(q, params).then(function(variables){
                    variableSearchSuccessHandler(variables, successHandler, errorHandler);
                });
            }else{
                populateSearchResults();
            }
        };
        var populateSearchResults = function(){
            if($scope.state.variableSearchQuery.name.length > 2){
                return;
            }
            $scope.state.showAddVariableButton = false;
            var previous = $scope.state.variableSearchResults;
            if(!previous || previous.length < 1){$scope.state.searching = true;}
            var params = getVariableSearchParameters();
            qm.variablesHelper.getFromLocalStorageOrApi(params, function(variables){
                if(variables && variables.length > 0){
                    if($scope.state.variableSearchQuery.name.length < 3){
                        if(previous){variables = previous.concat(variables);}
                        addVariablesToScope(variables);
                    }
                }else{
                    $scope.state.noVariablesFoundCard.show = true;
                    $scope.state.searching = false;
                }
            });
        };
        $scope.addNewVariable = function(){
            var variableObject = {};
            variableObject = qmService.barcodeScanner.addUpcToVariableObject(variableObject);
            variableObject.name = $scope.state.variableSearchQuery.name;
            if(getVariableCategoryName()){
                variableObject.variableCategoryName = getVariableCategoryName();
            }
            qmLog.info($state.current.name + ': ' + '$scope.addNewVariable: ' + JSON.stringify(variableObject));
            if($scope.state.nextState){
                $scope.state.variableObject = variableObject;
                qmService.goToState($scope.state.nextState, $scope.state);
            }
        };
        function setHelpText(){
            if($scope.state.userTaggedVariableObject){
                $scope.state.helpText = "Search for a variable like an ingredient, category, or duplicate variable " +
                    "that you'd like to tag " + $scope.state.userTaggedVariableObject.name.toUpperCase() + " with.  Then " +
                    "when your tag variable is analyzed, measurements from " +
                    $scope.state.userTaggedVariableObject.name.toUpperCase() + " will be included.";
                $scope.state.helpText = " <br><br> Search for a variable " +
                    "that you'd like to tag with " + $scope.state.userTaggedVariableObject.name.toUpperCase() + ".  Then " +
                    "when " + $scope.state.userTaggedVariableObject.name.toUpperCase() +
                    " is analyzed, measurements from your selected tagged variable will be included. <br><br> For instance, if " +
                    "your currently selected variable were Inflammatory Pain, you could search for and select Back Pain " +
                    "to be tagged with Inflammatory Pain since Inflammatory Pain includes Back Pain.  Then Back Pain " +
                    "measurements would be included when Inflammatory Pain is analyzed";
            }
            if($scope.state.userTagVariableObject){
                $scope.state.helpText = "Search for a child variable " +
                    "that you'd like to tag with " + $scope.state.userTagVariableObject.name.toUpperCase() + ".  Then " +
                    "when " + $scope.state.userTagVariableObject.name.toUpperCase() +
                    " is analyzed, measurements from your selected tagged variable will be included.";
                $scope.state.helpText = $scope.state.helpText + " <br><br> For instance, if " +
                    "your currently selected variable were Sugar, you could search for Coke and tag it with 37 grams of " +
                    "sugar per serving. Then coke measurements would be included when analyzing to see how sugar affects you.  <br><br>" +
                    "If your current parent tag variable were Inflammatory Pain, you could search for Back Pain and then your " +
                    "Inflammatory Pain analysis would include Back Pain measurements as well.";
            }
            var singularCategoryName = getSingularVariableCategoryName();
            if(!$scope.state.helpText && singularCategoryName){
                $scope.state.helpText = 'Enter a ' + singularCategoryName.toLowerCase() + ' in the search box or select one from the list below.';
            }
            if(!$scope.state.helpText){
                $scope.state.helpText = 'Enter a variable in the search box or select one from the list below.';
            }
        }
        function getSingularVariableCategoryName(){
            var variableCategory = getVariableCategory();
            if(variableCategory && variableCategory.variableCategoryNameSingular){
                return variableCategory.variableCategoryNameSingular;
            }
            return null;
        }
        function getVariableCategory(){
            var name = getVariableCategoryName();
            if(name){return qm.variableCategoryHelper.getByNameOrId(name);}
            return null;
        }
        function getVariableCategoryName(){
            var fromUrl = qm.variableCategoryHelper.getVariableCategoryNameFromStateParamsOrUrl();
            if(fromUrl){return fromUrl;}
            var params = getVariableSearchParameters();
            if(params.variableCategoryName){
                return params.variableCategoryName;
            }
            return qm.variableCategoryHelper.getVariableCategoryNameFromStateParamsOrUrl($stateParams);
        }
        function getPluralVariableCategoryName(){
            return $filter('wordAliases')(pluralize(getVariableCategoryName(), 1));
        }
        var checkNameExists = function(item){
            if(!item.name){
                var message = "variable doesn't have a name! variable: " + JSON.stringify(item);
                qmLogService.error(message);
                qmLogService.error(message);
                return false;
            }
            return true;
        };
        $scope.matchEveryWord = function(){
            return function(item){
                if($scope.state.variableSearchQuery.barcode){
                    return true;
                } // Name's not going to match the number
                if(!checkNameExists(item)){
                    return false;
                }
                if(item.variableCategoryName){
                    if($scope.state.variableSearchParameters.manualTracking && $scope.state.variableSearchQuery.name.length < 5){
                        if(item.variableCategoryName.indexOf('Location') !== -1 ||
                            item.variableCategoryName.indexOf('Software') !== -1 ||
                            item.variableCategoryName.indexOf('Environment') !== -1){
                            return false;
                        }
                    }
                }
                if($scope.state.excludeDuplicateBloodPressure){
                    if(item.name.toLowerCase().indexOf('diastolic') !== -1 || item.name.toLowerCase().indexOf('systolic') !== -1){
                        return false;
                    }
                }
                if($scope.state.excludeSingularBloodPressure && item.name.toLowerCase() === 'blood pressure'){
                    return false;
                }
                var variableObjectAsString = JSON.stringify(item).toLowerCase();
                var lowercaseVariableSearchQuery = $scope.state.variableSearchQuery.name.toLowerCase();
                var filterBy = lowercaseVariableSearchQuery.split(/\s+/);
                if(lowercaseVariableSearchQuery){
                    if(!filterBy.length){
                        return true;
                    }
                }else{
                    return true;
                }
                return filterBy.every(function(word){
                    var exists = variableObjectAsString.indexOf(word);
                    if(exists !== -1){
                        return true;
                    }
                });
            };
        };
        // https://open.fda.gov/api/reference/ API Key https://open.fda.gov/api/reference/
        $scope.scanBarcode = function(){
            var params = getVariableSearchParameters();
            qmService.barcodeScanner.scanBarcode(params, variableSearchSuccessHandler, function(error){
                qmLog.error(error);
            });
        }
    }]);
