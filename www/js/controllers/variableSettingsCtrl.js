angular.module('starter').controller('VariableSettingsCtrl', function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading,
                 $stateParams, $ionicHistory, $ionicActionSheet, quantimodoService) {
    $scope.controller_name = "VariableSettingsCtrl";
    $rootScope.showFilterBarSearchIcon = false;
    $scope.$on('$ionicView.beforeEnter', function(e) { console.debug("Entering state " + $state.current.name);
        $rootScope.hideNavigationMenu = false;
        console.debug($state.current.name + ' initializing...');
        if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
        if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        $scope.loading = true;
        if($stateParams.variableObject){
            $scope.setupVariableByVariableObject($stateParams.variableObject);
            refreshUserVariable($stateParams.variableObject.name);
        } else if ($stateParams.variableName) {
            $rootScope.variableName = $stateParams.variableName;
            $scope.getUserVariableByName($rootScope.variableName);
            refreshUserVariable($rootScope.variableName);
        } else if ($rootScope.variableObject) {
            $scope.setupVariableByVariableObject($rootScope.variableObject);
            refreshUserVariable($rootScope.variableObject.name);
        } else {
            console.error("Variable name not provided to variable settings controller!");
            $state.go(config.appSettings.appDesign.defaultState);
            //$ionicHistory.goBack();  Plain goBack can cause infinite loop if we came from a tagAdd controller
        }
    });
    function getTruncatedVariableName(variableName) {
        if(variableName.length > 18){return variableName.substring(0, 18) + '...';} else { return variableName;}
    }
    function refreshUserVariable(variableName) {
        quantimodoService.refreshUserVariableByNameDeferred(variableName).then(function(userVariable){$rootScope.variableObject = userVariable;});
    }
    $rootScope.showActionSheetMenu = function() {
        console.debug("variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $rootScope.variableObject: ", $rootScope.variableObject);
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                quantimodoService.actionSheetButtons.recordMeasurement,
                quantimodoService.actionSheetButtons.addReminder,
                quantimodoService.actionSheetButtons.charts,
                quantimodoService.actionSheetButtons.history,
                { text: '<i class="icon ion-pricetag"></i>Tag ' + getTruncatedVariableName($rootScope.variableObject.name)},
                { text: '<i class="icon ion-pricetag"></i>Tag Another Variable '}

            ],
            destructiveText: '<i class="icon ion-trash-a"></i>Delete All',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() { console.debug('CANCELLED'); },
            buttonClicked: function(index) {
                if(index === 0){$state.go('app.measurementAddVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 1){$state.go('app.reminderAdd', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 2) {$state.go('app.charts', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 3) {$state.go('app.historyAllVariable', {variableObject: $rootScope.variableObject, variableName: $rootScope.variableObject.name});}
                if(index === 4) {$state.go('app.tagSearch',  {fromState: $state.current.name, userTaggedVariableObject: $rootScope.variableObject}); }
                if(index === 5) {$scope.tagAnotherVariable($rootScope.variableObject);}
                return true;
            },
            destructiveButtonClicked: function() {quantimodoService.showDeleteAllMeasurementsForVariablePopup($rootScope.variableObject); return true;}
        });
        console.debug('Setting hideSheet timeout');
        $timeout(function() { hideSheet(); }, 20000);
    };
    $scope.openTagVariableSearchDialog = function($event) {
        $mdDialog.show({
            controller: TagVariableSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose:true
        });
    };
    var TagVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log) {
        var self = this;
        self.variables        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.variableObject = $rootScope.variableObject;
        self.title = "Add a Tag";
        self.helpText = "Search for a variable like an ingredient or category " +
            "that you'd like to tag " + $rootScope.variableObject.name.toUpperCase() + " with.  Then " +
            "when your tag variable is analyzed, measurements from " +
            $rootScope.variableObject.name.toUpperCase() + " will be included.";
        self.placeholder = "Search for a tag...";
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var userTagData;
            if($rootScope.variableObject.userVariableDefaultUnitAbbreviatedName !== '/5'){
                $state.go('app.tagAdd', {
                    userTaggedVariableObject: $rootScope.variableObject,
                    fromState: $state.current.name,
                    fromStateParams: {variableObject: $rootScope.variableObject},
                    userTagVariableObject: self.selectedItem.variable
                });
            } else {
                userTagData = {userTagVariableId: self.selectedItem.variable.id, userTaggedVariableId: $rootScope.variableObject.id, conversionFactor: 1};
                quantimodoService.showBlackRingLoader();
                quantimodoService.postUserTagDeferred(userTagData).then(function (response) {
                    $rootScope.variableObject = response.data.userTaggedVariable;
                    quantimodoService.hideLoader();
                });
            }
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            var requestParams = {defaultUnitCategoryName:  $rootScope.variableObject.defaultUnitCategoryName};
            if($rootScope.variableObject.defaultUnitCategoryName !== "Rating"){requestParams.defaultUnitCategoryName = "(ne)Rating";}
            quantimodoService.searchUserVariablesDeferred(query, requestParams).then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info('Text changed to ' + text); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Tag Variable";
            quantimodoService.addVariableToLocalStorage(item.variable);
            $log.info('Item changed to ' + JSON.stringify(item));
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){ variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables')); }
            if(variables && $rootScope.variableObject.defaultUnitAbbreviatedName === '/5'){ variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId)); }
            if(variables){ variables = variables.filter(excludeParentVariable()); }
            return variables.map( function (variable) {
                return {value: variable.name.toLowerCase(), name: variable.name, variable: variable};
            });
        }
        /**
         * Create filter function for a query string
         */
        function filterByProperty(filterPropertyName, allowedFilterValue) {
            return function filterFn(item) { return (item[filterPropertyName] === allowedFilterValue); };
        }
        /**
         * Create filter function for a query string
         */
        function excludeParentVariable() {
            return function filterFn(item) { return (item.id !== $rootScope.variableObject.id); };
        }
    };
    $scope.openJoinVariableSearchDialog = function($event) {
        $mdDialog.show({
            controller: JoinVariableSearchCtrl,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose:true
        });
    };
    var JoinVariableSearchCtrl = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log) {
        var self = this;
        self.variables        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.variableObject = $rootScope.variableObject;
        self.title = "Join a Variable";
        self.helpText = "Search for a duplicated or synonymous variable that you'd like to join to " +
            self.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
            self.variableObject.name + ".  You can only join variables that have the same unit " +
            self.variableObject.userVariableDefaultUnitAbbreviatedName + ".";
        self.placeholder = "What variable would you like to join?";
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event) {
            var variableData = {
                parentVariableId: $rootScope.variableObject.id,
                joinedVariableId: self.selectedItem.variable.id,
                conversionFactor: 1
            };
            quantimodoService.showBlackRingLoader();
            quantimodoService.postVariableJoinDeferred(variableData).then(function (response) {
                quantimodoService.hideLoader();
                $rootScope.variableObject = response.data.parentVariable;
            }, function (error) {
                quantimodoService.hideLoader();
                console.error(error);
            });
            $mdDialog.hide();
        };
        function querySearch (query) {
            self.notFoundText = "No variables matching " + query + " were found.";
            var deferred = $q.defer();
            quantimodoService.searchUserVariablesDeferred(query, {tagVariableId: $rootScope.variableObject.defaultUnitId})
                .then(function(results){ deferred.resolve(loadAll(results)); });
            return deferred.promise;
        }
        function searchTextChange(text) { $log.info('Text changed to ' + text); }
        function selectedItemChange(item) {
            self.selectedItem = item;
            self.buttonText = "Join Variable";
            quantimodoService.addVariableToLocalStorage(item.variable);
            $log.info('Item changed to ' + JSON.stringify(item));
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(variables) {
            if(!variables){variables = JSON.parse(quantimodoService.getLocalStorageItemAsString('userVariables')); }
            if(variables){ variables = variables.filter(filterByProperty('defaultUnitId', $rootScope.variableObject.defaultUnitId)); }
            if(variables){ variables = variables.filter(excludeParentVariable()); }
            return variables.map( function (variable) {
                return {
                    value: variable.name.toLowerCase(),
                    name: variable.name,
                    variable: variable
                };
            });
        }
        /**
         * Create filter function for a query string
         */
        function filterByProperty(filterPropertyName, allowedFilterValue) {
            return function filterFn(item) { return (item[filterPropertyName] === allowedFilterValue); };
        }
        /**
         * Create filter function for a query string
         */
        function excludeParentVariable() {
            return function filterFn(item) { return (item.id !== $rootScope.variableObject.id); };
        }
    };
    var SelectWikpdediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, quantimodoService, $q, $log, dataToPass) {
        var self = this;
        // list of `state` value/display objects
        self.items        = loadAll();
        self.querySearch   = querySearch;
        self.selectedItemChange = selectedItemChange;
        self.searchTextChange   = searchTextChange;
        self.title = dataToPass.title;
        self.helpText = dataToPass.helpText;
        self.placeholder = dataToPass.placeholder;
        self.cancel = function($event) { $mdDialog.cancel(); };
        self.finish = function($event, variableName) { $mdDialog.hide($scope.variable); };
        function querySearch (query) {
            self.notFoundText = "No articles matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
            var deferred = $q.defer();
            if(!query || !query.length){ query = dataToPass.variableName; }
            wikipediaFactory.searchArticles({
                term: query, // Searchterm
                //lang: '<LANGUAGE>', // (optional) default: 'en'
                //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                pithumbsize: '200', // (optional) default: 400
                //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
            }).then(function (repsonse) {
                if(repsonse.data.query) {
                    deferred.resolve(loadAll(repsonse.data.query.pages));
                    $scope.causeWikiEntry = repsonse.data.query.pages[0].extract;
                    //$rootScope.correlationObject.studyBackground = $rootScope.correlationObject.studyBackground + '<br>' + $scope.causeWikiEntry;
                    if(repsonse.data.query.pages[0].thumbnail){$scope.causeWikiImage = repsonse.data.query.pages[0].thumbnail.source;}
                } else {
                    var error = 'Wiki not found for ' + query;
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, error, {}, "error"); }
                    console.error(error);
                }
            }).catch(function (error) {console.error(error);});
            return deferred.promise;
        }
        function searchTextChange(text) { console.debug('Text changed to ' + text); }
        function selectedItemChange(item) {
            $rootScope.variableObject.wikipediaPage = item.page;
            $rootScope.variableObject.wikipediaExtract = item.page.extract;
            self.selectedItem = item;
            self.buttonText = dataToPass.buttonText;
        }
        /**
         * Build `variables` list of key/value pairs
         */
        function loadAll(pages) {
            if(!pages){ return []; }
            return pages.map( function (page) {
                return {
                    value: page.title,
                    display: page.title,
                    page: page,
                };
            });
        }
    };
    $scope.searchWikipediaArticle = function (ev) {
        $mdDialog.show({
            controller: SelectWikpdediaArticleController,
            controllerAs: 'ctrl',
            templateUrl: 'templates/fragments/variable-search-dialog-fragment.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: false,
            locals: {
                dataToPass: {
                    title: "Select Wikipedia Article",
                    helpText: "Change the search query until you see a relevant article in the search results.  This article will be included in studies involving this variable.",
                    placeholder: "Search for a Wikipedia article...",
                    buttonText: "Select Article",
                    variableName: $rootScope.variableObject.name
                }
            },
        }).then(function(page) {
            $rootScope.variableObject.wikipediaPage = page;
        }, function() {
            console.debug('User cancelled selection');
        });
    };

    $scope.resetVariableToDefaultSettings = function(variableObject) {
        // Populate fields with original settings for variable
        quantimodoService.showBlackRingLoader();
        quantimodoService.resetUserVariableDeferred(variableObject.id).then(function(userVariable) {
            $rootScope.variableObject = userVariable;
            //quantimodoService.addWikipediaExtractAndThumbnail($rootScope.variableObject);
        });
    };

    $scope.saveVariableSettings = function(variableObject){
        quantimodoService.showBlackRingLoader();
        var body = {
            variableId: variableObject.id,
            durationOfAction: variableObject.durationOfActionInHours*60*60,
            fillingValue: variableObject.fillingValue,
            //joinWith
            maximumAllowedValue: variableObject.maximumAllowedValue,
            minimumAllowedValue: variableObject.minimumAllowedValue,
            onsetDelay: variableObject.onsetDelayInHours*60*60,
            combinationOperation: variableObject.combinationOperation,
            shareUserMeasurements: variableObject.shareUserMeasurements,
            defaultUnitId: variableObject.userVariableDefaultUnitId,
            userVariableVariableCategoryName: variableObject.userVariableVariableCategoryName,
            //userVariableAlias: $scope.state.userVariableAlias
            experimentStartTimeString: (variableObject.experimentStartTimeString) ? variableObject.experimentStartTimeString.toString() : null,
            experimentEndTimeString: (variableObject.experimentEndTimeString) ? variableObject.experimentEndTimeString.toString() : null,
        };
        quantimodoService.postUserVariableDeferred(body).then(function(userVariable) {
            quantimodoService.hideLoader();
            $scope.showInfoToast('Saved ' + variableObject.name + ' settings');
            $scope.goBack({variableObject: userVariable});  // Temporary workaround to make tests pass
        }, function(error) {
            quantimodoService.hideLoader();
            console.error(error);
        });
    };
});
