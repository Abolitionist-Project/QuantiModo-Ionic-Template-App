angular.module('starter')
	// Returns time in HH:MM format
	.filter('fromUnixTimestampToLocalTimeOfDay', function(){
	    return function(value){
	    	if (value){
	    		return moment(value*1000).format('h:mm A');
	    	} else {
				return "";
            }
        };
	});