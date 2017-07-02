angular.module('starter').controller('ImportCtrl', function($scope, $ionicLoading, $state, $rootScope, quantimodoService, $ionicActionSheet) {
	$scope.controller_name = "ImportCtrl";
	$rootScope.showFilterBarSearchIcon = false;
	$scope.$on('$ionicView.beforeEnter', function(e) {
		console.debug("ImportCtrl beforeEnter");
        if(typeof $rootScope.hideNavigationMenu === "undefined") {$rootScope.hideNavigationMenu = false;}
		if (typeof Bugsnag !== "undefined") { Bugsnag.context = $state.current.name; }
		if (typeof analytics !== 'undefined')  { analytics.trackView($state.current.name); }
        if(quantimodoService.sendToLoginIfNecessaryAndComeBack()){ return; }
		if($rootScope.user.stripeActive || config.appSettings.upgradeDisabled){
			loadNativeConnectorPage();
			return;
		}
		// Check if user upgrade via web since last user refresh
		quantimodoService.showBlackRingLoader();
		quantimodoService.refreshUser().then(function (user) {
			quantimodoService.hideLoader();
			if(user.stripeActive || config.appSettings.upgradeDisabled){
				loadNativeConnectorPage();
				return;
			}
			$state.go('app.upgrade', {litePlanState: config.appSettings.appDesign.defaultState});
		}, function (error) {
			quantimodoService.hideLoader();
			$state.go('app.login');
		});
	});
	$scope.hideImportHelpCard = function () {
		$scope.showImportHelpCard = false;
		window.localStorage.hideImportHelpCard = true;
	};
	var goToWebImportDataPage = function() {
		console.debug('importCtrl.init: Going to quantimodoService.getAccessTokenFromAnySource');
		$state.go(config.appSettings.appDesign.defaultState);
		quantimodoService.getAccessTokenFromAnySource().then(function(accessToken){
			quantimodoService.hideLoader();
			if(ionic.Platform.platforms[0] === "browser"){
				console.debug("Browser Detected");

				var url = quantimodoService.getQuantiModoUrl("api/v2/account/connectors", true);
				if(accessToken){
					url += "access_token=" + accessToken;
				}
				var newTab = window.open(url,'_blank');

				if(!newTab){
					alert("Please unblock popups and refresh to access the Import Data page.");
				}
				$rootScope.hideNavigationMenu = false;
				//noinspection JSCheckFunctionSignatures
				$state.go(config.appSettings.appDesign.defaultState);
			} else {
				var targetUrl = quantimodoService.getQuantiModoUrl("api/v1/connect/mobile", true);
				if(accessToken){
					targetUrl += "access_token=" + accessToken;
				}
				var ref = window.open(targetUrl,'_blank', 'location=no,toolbar=yes');
				ref.addEventListener('exit', function(){
					$rootScope.hideNavigationMenu = false;
					//noinspection JSCheckFunctionSignatures
					$state.go(config.appSettings.appDesign.defaultState);
				});
			}
		}, function(){
			quantimodoService.hideLoader();
			console.debug('importCtrl: Could not get getAccessTokenFromAnySource.  Going to login page...');
            quantimodoService.sendToLoginIfNecessaryAndComeBack();
		});
	};
	var loadNativeConnectorPage = function(){
		$scope.showImportHelpCard = (window.localStorage.hideImportHelpCard !== "true");
		console.debug('importCtrl: $rootScope.isMobile so using native connector page');
		quantimodoService.showBlackRingLoader();
		quantimodoService.getConnectorsDeferred()
			.then(function(connectors){
				$rootScope.connectors = connectors;
				if(connectors) {
					//Stop the ion-refresher from spinning
					$scope.$broadcast('scroll.refreshComplete');
					$ionicLoading.hide().then(function(){console.debug("The loading indicator is now hidden");});
				}
				$scope.refreshConnectors();
			});
	};

    $scope.showActionSheetForConnector = function(connector) {
        var buttons = [
            quantimodoService.getHistoryActionSheetButton(connector.displayName)
        ];
        var hideSheetForNotification = $ionicActionSheet.show({
            buttons: buttons,
            //destructiveText: '<i class="icon ion-trash-a"></i>Skip All ',
            cancelText: '<i class="icon ion-ios-close"></i>Cancel',
            cancel: function() {console.debug('CANCELLED');},
            buttonClicked: function(index) {
                if(index === 0){$state.go('app.historyAll', {connectorName: connector.name});}
                return true;
            },
            destructiveButtonClicked: function() {}
        });
    };
});
