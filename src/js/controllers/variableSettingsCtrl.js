angular.module('starter').controller('VariableSettingsCtrl', ["$scope", "$state", "$rootScope", "$timeout", "$q",
    "$mdDialog", "$ionicLoading", "$stateParams", "$ionicHistory", "$ionicActionSheet", "qmService",
    function($scope, $state, $rootScope, $timeout, $q, $mdDialog, $ionicLoading, $stateParams, $ionicHistory,
             $ionicActionSheet, qmService){
        $scope.controller_name = "VariableSettingsCtrl";
        qmService.navBar.setFilterBarSearchIcon(false);
        $scope.state = {
            variableObject: null,
            saveButtonText: "Save",
            title: "Variable Settings"
        };
        $scope.$on('$ionicView.beforeEnter', function(e){
            if (document.title !== $scope.state.title) {document.title = $scope.state.title;}
            qmLog.debug('Entering state ' + $state.current.name, null);
            qmService.login.sendToLoginIfNecessaryAndComeBack("beforeEnter in " + $state.current.name);
            qmService.navBar.showNavigationMenu();
            var id = qmService.variableIdToGetOnReturnToSettings;
            if(id){
                getUserVariableWithTags(id);
                qm.userVariables.getFromLocalStorageOrApi({id: id}).then(function(variables){
                    setVariableObject(variables[0])
                });
                delete qmService.variableIdToGetOnReturnToSettings;
            }else if($stateParams.variableObject){
                setVariableObject($stateParams.variableObject);
                getUserVariableWithTags();
            }else{
                getUserVariableWithTags();
            }
        });
        $scope.$on("$ionicView.afterEnter", function(){
            qm.loaders.robots();
        });
        function getVariableParams(){
            var params = {includeTags: true};
            params = qmService.stateHelper.addVariableNameOrIdToRequestParams(params, $scope, $stateParams);
            return params;
        }
        function getUserVariableWithTags(){
            if(!$scope.state.variableObject){
                qmService.showBlackRingLoader();
            }
            var params = getVariableParams();
            if(!params){
                $scope.goBack();
                return;
            }
            $scope.state.loading = true;
            qm.userVariables.getFromApi(params).then(function(userVariables){
                if(userVariables && userVariables[0]){
                    setVariableObject(userVariables[0]);
                }
            })
        }
        function getVariableName(){
            return qmService.stateHelper.getVariableNameFromScopeStateParamsOrUrl($scope, $stateParams);
        }
        function setVariableObject(variableObject){
            $scope.state.variableObject = $scope.state.variableObject = variableObject;
            if(!$scope.variableName){
                $scope.variableName = variableObject.name;
            }
            setShowActionSheetMenu(variableObject);
            qmService.hideLoader();
            $scope.state.loading = false;
        }
        function setShowActionSheetMenu(uv){
            qmService.rootScope.setShowActionSheetMenu(function(){
                qmLog.debug('variableSettingsCtrl.showActionSheetMenu: Show the action sheet!  $scope.state.variableObject: ',
                    uv);
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        qmService.actionSheets.actionSheetButtons.measurementAddVariable,
                        qmService.actionSheets.actionSheetButtons.reminderAdd,
                        qmService.actionSheets.actionSheetButtons.chartSearch,
                        qmService.actionSheets.actionSheetButtons.historyAllVariable,
                        {text: '<i class="icon ion-pricetag"></i>Tag ' + qmService.getTruncatedVariableName(uv.name)},
                    ],
                    destructiveText: '<i class="icon ion-trash-a"></i>Reset to Default Settings',
                    cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                    cancel: function(){
                        qmLog.debug('CANCELLED');
                    },
                    buttonClicked: function(index, button){
                        if(index === 0){
                            qmService.goToState('app.measurementAddVariable', {variableObject: uv});
                        }
                        if(index === 1){
                            qmService.goToState('app.reminderAdd', {variableObject: uv});
                        }
                        if(index === 2){
                            qmService.goToState('app.charts', {variableObject: uv});
                        }
                        if(index === 3){
                            qmService.goToState('app.historyAllVariable', {variableObject: uv});
                        }
                        if(index === 4){
                            qmService.goToState('app.tagSearch', {
                                userTaggedVariableObject: uv
                            });
                        }
                        return true;
                    },
                    destructiveButtonClicked: function(){
                        $scope.resetVariableToDefaultSettings(uv)
                        return true;
                    }
                });
                qmLog.debug('Setting hideSheet timeout', null);
                $timeout(function(){
                    hideSheet();
                }, 20000);
            });
        }
        var dialogParameters = {
            buttonText: "Select Variable",
            excludeLocal: true, // Necessary because API does complex filtering
            minLength: 2
        };
        function getConversionFactor(conversionFactor){
            if($scope.state.variableObject.unitAbbreviatedName === "/5"){
                return 1;
            }
            return conversionFactor;
        }
        function openTagVariableSearchDialog($event, requestParams, dialogParameters){
            requestParams.includePublic = true;
            function selectVariable(selectedVariable){
                var userTagData;
                if(!getConversionFactor(dialogParameters.conversionFactor)){
                    goToAddTagState({
                        userTaggedVariableObject: $scope.state.variableObject,
                        userTagVariableObject: selectedVariable
                    });
                }else{
                    userTagData = {
                        userTagVariableId: selectedVariable.variableId,
                        userTaggedVariableId: $scope.state.variableObject.variableId,
                        conversionFactor: getConversionFactor(dialogParameters.conversionFactor)
                    };
                    qmService.showBlackRingLoader();
                    qmService.postUserTagDeferred(userTagData).then(function(response){
                        setVariableObject(response.data.userTaggedVariable);
                    });
                }
            }
            dialogParameters.requestParams = requestParams;
            qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
        }
        function goToAddTagState(stateParams){
            stateParams.fromState = $state.current.name;
            stateParams.fromStateParams = {
                variableObject: $scope.state.variableObject, // This gets deleted in tagAdd for some reason we need to
                                                             // get from local storage
                variableId: $scope.state.variableObject.variableId  // with variable id
            };
            qmService.variableIdToGetOnReturnToSettings = $scope.state.variableObject.variableId;
            qmService.goToState(qm.staticData.stateNames.tagAdd, stateParams);
        }
        $scope.state.openParentVariableSearchDialog = function(e){
            dialogParameters.conversionFactor = 1;
            dialogParameters.title = 'Add a parent category';
            dialogParameters.helpText = "Search for a parent category " +
                "that you'd like to tag " + $scope.state.variableObject.name.toUpperCase() + " with.  Then " +
                "when your parent category variable is analyzed, measurements from " +
                $scope.state.variableObject.name.toUpperCase() + " will be included.";
            dialogParameters.placeholder = "Search for a parent category...";
            var requestParams = {childUserTagVariableId: $scope.state.variableObject.variableId};
            openTagVariableSearchDialog(e, requestParams, dialogParameters);
        };
        $scope.state.openIngredientVariableSearchDialog = function(e){
            dialogParameters.conversionFactor = null;
            dialogParameters.title = 'Add an ingredient';
            dialogParameters.helpText = "Search for an ingredient " +
                "that you'd like to tag " + $scope.state.variableObject.name.toUpperCase() + " with.  Then " +
                "when your ingredient variable is analyzed, converted measurements from " +
                $scope.state.variableObject.name.toUpperCase() + " will be included.";
            dialogParameters.placeholder = "Search for an ingredient...";
            var requestParams = {ingredientOfUserTagVariableId: $scope.state.variableObject.variableId};
            openTagVariableSearchDialog(e, requestParams, dialogParameters);
        };
        $scope.state.openChildVariableSearchDialog = function(e){
            dialogParameters.conversionFactor = 1;
            dialogParameters.title = 'Add a child sub-type';
            dialogParameters.helpText = "Search for a child sub-class of " +
                $scope.state.variableObject.name.toUpperCase() + ".  Then " +
                "when " + $scope.state.variableObject.name.toUpperCase() + " is analyzed, measurements from " +
                "your child sub-type variable will also be included.";
            dialogParameters.placeholder = "Search for a variable to tag...";
            var requestParams = {parentUserTagVariableId: $scope.state.variableObject.variableId};
            openTageeVariableSearchDialog(e, requestParams, dialogParameters);
        };
        $scope.state.openIngredientOfVariableSearchDialog = function(e){
            dialogParameters.title = 'Add a parent';
            dialogParameters.helpText = "Search for a variable that contains " +
                $scope.state.variableObject.name.toUpperCase() + ".  Then " +
                "when " + $scope.state.variableObject.name.toUpperCase() + " is analyzed, converted measurements from " +
                "your selected variable will also be included.";
            dialogParameters.placeholder = "Search for variable containing " + $scope.state.variableObject.name;
            var requestParams = {ingredientUserTagVariableId: $scope.state.variableObject.variableId};
            openTageeVariableSearchDialog(e, requestParams, dialogParameters);
        };
        function openTageeVariableSearchDialog($event, requestParams, dialogParameters){
            requestParams.includePublic = true;
            function selectVariable(selectedVariable){
                var userTagData;
                if(!getConversionFactor(dialogParameters.conversionFactor)){
                    goToAddTagState({
                        userTagVariableObject: $scope.state.variableObject,
                        userTaggedVariableObject: selectedVariable
                    });
                }else{
                    userTagData = {
                        userTaggedVariableId: selectedVariable.variableId,
                        userTagVariableId: $scope.state.variableObject.variableId,
                        conversionFactor: getConversionFactor(dialogParameters.conversionFactor)
                    };
                    qmService.showBlackRingLoader();
                    qmService.postUserTagDeferred(userTagData).then(function(response){
                        setVariableObject(response.data.userTagVariable);
                        qmService.hideLoader();
                    });
                }
            }
            dialogParameters.requestParams = requestParams;
            qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
        }
        $scope.state.openJoinVariableSearchDialog = function($event, requestParams){
            qmLog.info("openJoinVariableSearchDialog called by this event:", $event);
            qmLog.info("openJoinVariableSearchDialog requestParams:", requestParams);
            requestParams = requestParams || {joinVariableId: $scope.state.variableObject.variableId};
            requestParams.includePublic = true;
            function selectVariable(selectedVariable){
                var variableData = {
                    parentVariableId: $scope.state.variableObject.variableId,
                    joinedVariableId: selectedVariable.variableId,
                    conversionFactor: 1
                };
                qmService.postVariableJoinDeferred(variableData).then(function(currentVariable){
                    setVariableObject(currentVariable);
                }, function(error){
                    qmService.hideLoader();
                    qmLog.error(error);
                });
                $mdDialog.hide();
            }
            var dialogParameters = {
                title: 'Join a Duplicate',
                helpText: "Search for a duplicated or synonymous variable that you'd like to join to " +
                    $scope.state.variableObject.name + ". Once joined, its measurements will be included in the analysis of " +
                    $scope.state.variableObject.name + ".  You can only join variables that have the same unit " +
                    $scope.state.variableObject.unitAbbreviatedName + ".",
                placeholder: "What variable would you like to join?",
                buttonText: "Select Variable",
                requestParams: requestParams,
                excludeLocal: true, // Necessary because API does complex filtering
                doNotCreateNewVariables: true
            };
            qmService.showVariableSearchDialog(dialogParameters, selectVariable, null, $event);
        };
        var SelectWikipediaArticleController = function($scope, $state, $rootScope, $stateParams, $filter, qmService, $q, $log, dialogParameters){
            var self = this;
            // list of `state` value/display objects
            self.items = loadAll();
            self.querySearch = querySearch;
            self.selectedItemChange = selectedItemChange;
            self.searchTextChange = searchTextChange;
            self.title = dialogParameters.title;
            self.helpText = dialogParameters.helpText;
            self.placeholder = dialogParameters.placeholder;
            self.getHelp = function(){
                if(self.helpText && !self.showHelp){
                    return self.showHelp = true;
                }
                qmService.goToState(window.qm.staticData.stateNames.help);
                $mdDialog.cancel();
            };
            self.cancel = function($event){
                $mdDialog.cancel();
            };
            self.finish = function($event, variableName){
                $mdDialog.hide($scope.variable);
            };
            function querySearch(query){
                self.notFoundText = "No articles matching " + query + " were found.  Please try another wording or contact mike@quantimo.do.";
                var deferred = $q.defer();
                if(!query || !query.length){
                    query = dialogParameters.variableName;
                }
                wikipediaFactory.searchArticles({
                    term: query, // Searchterm
                    //lang: '<LANGUAGE>', // (optional) default: 'en'
                    //gsrlimit: '<GS_LIMIT>', // (optional) default: 10. valid values: 0-500
                    pithumbsize: '200', // (optional) default: 400
                    //pilimit: '<PAGE_IMAGES_LIMIT>', // (optional) 'max': images for all articles, otherwise only for the first
                    exlimit: 'max', // (optional) 'max': extracts for all articles, otherwise only for the first
                    //exintro: '1', // (optional) '1': if we just want the intro, otherwise it shows all sections
                }).then(function(repsonse){
                    if(repsonse.data.query){
                        deferred.resolve(loadAll(repsonse.data.query.pages));
                        $scope.causeWikiEntry = repsonse.data.query.pages[0].extract;
                        if(repsonse.data.query.pages[0].thumbnail){
                            $scope.causeWikiImage = repsonse.data.query.pages[0].thumbnail.source;
                        }
                    }else{
                        var error = 'Wiki not found for ' + query;
                        qmLog.error(error);
                        qmLog.error(error);
                    }
                }).catch(function(error){
                    qmLog.error(error);
                });
                return deferred.promise;
            }
            function searchTextChange(text){
                qmLog.debug('Text changed to ' + text);
            }
            function selectedItemChange(item){
                $scope.state.variableObject.wikipediaPage = item.page;
                $scope.state.variableObject.wikipediaExtract = item.page.extract;
                self.selectedItem = item;
                self.buttonText = dialogParameters.buttonText;
            }
            /**
             * Build `variables` list of key/value pairs
             */
            function loadAll(pages){
                if(!pages){
                    return [];
                }
                return pages.map(function(page){
                    return {
                        value: page.title,
                        display: page.title,
                        page: page,
                    };
                });
            }
        };
        SelectWikipediaArticleController.$inject = ["$scope", "$state", "$rootScope", "$stateParams", "$filter", "qmService", "$q", "$log", "dialogParameters"];
        $scope.searchWikipediaArticle = function(ev){
            $mdDialog.show({
                controller: SelectWikipediaArticleController,
                controllerAs: 'ctrl',
                templateUrl: 'templates/dialogs/variable-search-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: false,
                locals: {
                    dialogParameters: {
                        title: "Select Wikipedia Article",
                        helpText: "Change the search query until you see a relevant article in the search results.  This article will be included in studies involving this variable.",
                        placeholder: "Search for a Wikipedia article...",
                        buttonText: "Select Article",
                        variableName: $scope.state.variableObject.name
                    }
                },
            }).then(function(page){
                $scope.state.variableObject.wikipediaPage = page;
            }, function(){
                qmLog.debug('User cancelled selection', null);
            });
        };
        $scope.resetVariableToDefaultSettings = function(uv){
            uv = uv || $scope.state.variableObject;
            qmService.showInfoToast('Resetting ' + uv.name +
                ' analysis settings back to global defaults (this could take a minute)', 30);
            qmService.showBlackRingLoader();
            $scope.state.variableObject = null;
            qm.userVariables.resetUserVariable(uv.variableId).then(function(userVariable){
                setVariableObject(userVariable);
                //qmService.addWikipediaExtractAndThumbnail($scope.state.variableObject);
            });
        };
        $scope.saveVariableSettings = function(uv){
            qmService.showInfoToast('Saving ' + uv.name + ' settings (this could take a minute)', 30);
            $scope.state.saveButtonText = "Saving...";
            var experimentEndTimeString, experimentStartTimeString = null;
            if(uv.experimentStartTimeString){
                try{
                    experimentStartTimeString = uv.experimentStartTimeString.toISOString();
                }catch (error){
                    qmLog.error('Could not convert experimentStartTimeString to ISO format', {
                        experimentStartTimeString: uv.experimentStartTimeString,
                        errorMessage: error
                    });
                }
            }
            if(uv.experimentEndTimeString){
                try{
                    experimentEndTimeString = uv.experimentEndTimeString.toISOString();
                }catch (error){
                    qmLog.error('Could not convert experimentEndTimeString to ISO format', {
                        experimentEndTimeString: uv.experimentEndTimeString,
                        errorMessage: error
                    });
                }
            }
            var body = {
                variableId: uv.variableId,
                durationOfAction: uv.durationOfActionInHours * 60 * 60,
                fillingValue: uv.fillingValue,
                //joinWith
                maximumAllowedValue: uv.maximumAllowedValue,
                minimumAllowedValue: uv.minimumAllowedValue,
                onsetDelay: uv.onsetDelayInHours * 60 * 60,
                combinationOperation: uv.combinationOperation,
                shareUserMeasurements: uv.shareUserMeasurements,
                defaultUnitId: uv.userUnitId,
                userVariableVariableCategoryName: uv.variableCategoryName,
                alias: uv.alias,
                experimentStartTimeString: experimentStartTimeString,
                experimentEndTimeString: experimentEndTimeString
            };
            qm.userVariables.postUserVariable(body).then(function(userVariable){
                qmService.hideLoader();
                var fromUrl = $stateParams.fromUrl || qm.urlHelper.getParam('fromUrl');
                if(fromUrl){
                    window.location.href = qm.urlHelper.addUrlQueryParamsToUrlString({
                        refresh: true,
                        recalculate: true
                    }, fromUrl);
                    return;
                }
                $scope.goBack({variableObject: userVariable, refresh: true});  // Temporary workaround to make tests pass
            }, function(error){
                qmService.hideLoader();
                qmLog.error(error);
            });
        };
        $scope.deleteTaggedVariable = function(taggedVariable){
            taggedVariable.hide = true;
            var v = $scope.state.variableObject;
            var userTagData = {
                userTagVariableId: v.variableId,
                userTaggedVariableId: taggedVariable.variableId
            };
            qmService.showInfoToast("Deleted "+v.name+" tag from "+taggedVariable.name+"!")
            qm.tags.deleteUserTag(userTagData);  // Delete doesn't return response for some reason
        };
        $scope.deleteTagVariable = function(tagVariable){
            tagVariable.hide = true;
            var userTagData = {
                userTaggedVariableId: $scope.state.variableObject.variableId,
                userTagVariableId: tagVariable.variableId
            };
            qmService.showInfoToast("Deleted "+tagVariable.name+" tag!")
            qm.tags.deleteUserTag(userTagData); // Delete doesn't return response for some reason
        };
        $scope.deleteJoinedVariable = function(tagVariable){
            tagVariable.hide = true;
            var postBody = {
                currentVariableId: $scope.state.variableObject.variableId,
                joinedUserTagVariableId: tagVariable.variableId
            };
            qmService.showInfoToast("Deleted "+tagVariable.name+" join!")
            qmService.deleteVariableJoinDeferred(postBody); // Delete doesn't return response for some reason
        };
        $scope.editTag = function(userTagVariable){
            goToAddTagState({
                tagConversionFactor: userTagVariable.tagConversionFactor,
                userTaggedVariableObject: $scope.state.variableObject,
                userTagVariableObject: userTagVariable
            });
        };
        $scope.editTagged = function(userTaggedVariable){
            goToAddTagState({
                tagConversionFactor: userTaggedVariable.tagConversionFactor,
                userTaggedVariableObject: userTaggedVariable,
                userTagVariableObject: $scope.state.variableObject
            });
        };
        $scope.refreshUserVariable = function(hideLoader){
            var refresh = true;
            var variableName = getVariableName();
            if($scope.state.variableObject && $scope.state.variableObject.name !== variableName){
                setVariableObject(null);
            }
            if(!hideLoader){
                qmService.showBlackRingLoader();
            }
            var params = {includeTags: true};
            qm.userVariables.findByName(variableName, params, refresh)
                .then(function(variableObject){
                    $scope.$broadcast('scroll.refreshComplete');  //Stop the ion-refresher from spinning
                    qmService.hideLoader();
                    setVariableObject(variableObject);
                    //qmService.addWikipediaExtractAndThumbnail($scope.state.variableObject);
                    qmService.setupVariableByVariableObject(variableObject);
                }, function(error){
                    $scope.$broadcast('scroll.refreshComplete');  //Stop the ion-refresher from spinning
                    qmService.hideLoader();
                    qmLog.error(error);
                });
        };
    }]);
