/**
 * Library for Special Order Plus
 *
 * Copyright (c) 2014 Haslam's Book Store, Inc.
 * Licensed under The MIT License (MIT)
 */

/**
 * Check whether string ends with a supplied suffix
 * @param  {string}  str    String to be examined
 * @param  {string}  suffix Suffix to search for in str
 * @return {boolean} 
 */
function endsWith( str, suffix ) {
	return str.indexOf( suffix, str.length - suffix.length ) !== -1;
}

/**
 * Get the length of an object
 * @param  {object} obj Object to be sized
 * @return {int}        Length of the object
 */
Object.size = function( obj ) {
	var size = 0, key;

	for ( key in obj ) {
		if ( obj.hasOwnProperty( key ) ) size++;
	}

	return size;
};

/**
 * Calculate ISBN-10 check digit
 * @param  {string} 9 digits of ISBN-10 to be checkedsumed
 * @return {string} ISBN-10 check digit (X if 10)
 */
function isbnCheckDigit ( isbn ) {
	var isbnArr = isbn.split( "" );
	var sum = 0;

	// Get the sum of each number mulitplie by its position number (beginning with 10)
	for( var i = 0, s = 10; i < 9; i++, s-- ) {
		sum += ( isbnArr[ i ] * ( s ) );
	}

	var chk = ( 11 - ( sum % 11 ) );

	// X shoudl be returned in place of 10
	if ( chk === 10 ) { 
		return "X";
	} else {
		return chk;
	}
}

/**
 * Store the form data to local storage
 */
function archiveLocalStorage() {
	// Clear the previously stored values
	localStorage.clear();

	// Get the values from the form and store them
	$( ".stored" ).each(function () {
		// Only if the form field is non-empty
		if ( $(this).val() !== "" ) {
			localStorage[ $(this).attr( "name" ) ] = $(this).val();
		}
	});
}

/**
 * Toggle the disabled attribute on an HTML element
 */
(function($) {
	$.fn.toggleDisabled = function(){
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};
})(jQuery);

//////////////////////////
//      Settings        //
//////////////////////////

/**
 * Check the remote server URL
 * @param  {string} settingName Remote server URL setting name
 * @return {string}
 */
function setRemoteServerUrl( remoteServerUrl ) {
	if ( !endsWith( remoteServerUrl, "/" ) ) {
		GM_setValue( "remoteServerUrl", remoteServerUrl + "/" );
		remoteServerUrl = GM_getValue( "remoteServerUrl" );
	}

	if ( !remoteServerUrl.match( /^https:\/\// ) ) {
		GM_setValue( "remoteServerUrl", "https://" + remoteServerUrl );
		remoteServerUrl = GM_getValue( "remoteServerUrl" );
	}
	
	GM_setValue( "remoteServerUrl", remoteServerUrl );
	
	return remoteServerUrl;
}
