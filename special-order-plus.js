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
function archiveToLocalStorage( that ) {
	// Clear the previously stored values
	localStorage.clear();

	// Get the values from the form and store them
	$( ".stored" ).each(function () {
		// Only if the form field is non-empty
		if ( that.val() !== "" ) {
			localStorage[ that.attr( "name" ) ] = that.val();
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

/**
 * Fill the form from localStorage
 */
function fillFromLocalStorage( that ) {
	if ( that.val() == "=" ) {
		for ( var i = 0; i < localStorage.length; i++ ) {
			$( "[name='" + localStorage.key( i ) + "']").val( localStorage.getItem( localStorage.key( i ) ) );
		}

		if ( localStorage.getItem( "orderInfo[shipFirstName]" ) ) {
			$( ".ship" ).toggleClass( "no-ship" );
			$( "[name*='orderInfo[ship']" ).toggleDisabled();
			$( "#shipCheck" ).prop( "checked", true );
		}
	}
}

/**
 * Submit the special order form to the server
 * @param {string} remoteServerUrl URL of the remote server to send the AJAX call
 * @param {event}  event           Event notifier
 */
function ajaxSpecialOrder( remoteServerUrl, event, that ) {
	event.preventDefault();
	
	// Set the printer default based on the last selection
	GM_setValue( "defaultPrinter", $( "#printer" ).val() );

	// Process the form data so we can POST it
	var formData = $.param( that.serializeArray() );

	// Make sure we want to submit the form
	if ( ( confirm( "Submit the special order?" ) ) ) {
		// Send the HTTP POST with the form data
		GM_xmlhttpRequest({
			method      : "POST",
			url         : remoteServerUrl + "/special-order.php",
			data        : formData,
			headers     : { "Content-Type": "application/x-www-form-urlencoded" },
			dataType    : "json",
			encode      : true,
			onprogress  : function() { $( "#specialOrder" )
							.html( "<h1 class='ajaxStatus'>Sending...</h1>" ); },
			onload      : function(response) { $( "#specialOrder" )
							.html( "<h1 class='ajaxStatus'>Success!</h1>" );
							$.colorbox.close(); },
			onerror     : function(response) { console.log( response.responseText ); }
		})
	}
}

/**
 * Submit the order-for-stock form to the server
 * @param {string} remoteServerUrl
 * @param {event}  event
 */
function ajaxOrderForStock( remoteServerUrl, event ) {
	event.preventDefault();
	
	// Set the printer default based on the last selection
	GM_setValue( "defaultPrinter", $( "#printer" ).val() );

	// Process the form data so we can POST it
	var formData = $.param( $( "#specialOrderForm" ).serializeArray() );

	// Send the HTTP POST with the form data
	GM_xmlhttpRequest({
		method      : "POST",
		url         : remoteServerUrl + "/order-for-stock.php",
		data        : formData,
		headers		: { "Content-Type": "application/x-www-form-urlencoded" },
		dataType    : "json",
		encode      : true,
		onprogress	: function() { $( "#specialOrder" )
						.html( "<h1 class='ajaxStatus'>Sending...</h1>" ); },
		onload		: function( response ) { $( "#specialOrder" )
						.html( "<h1 class='ajaxStatus'>Success!</h1>" );
						$.colorbox.close(); },
		onerror		: function( response ) { console.log( response.responseText ); }
	})
}

/**
 * Get the printer list from a server
 * @param  {string} remoteServerUrl hostname of server to POST to
 */
function getPrinterList( remoteServerUrl ) {
	GM_xmlhttpRequest({
		url         : remoteServerUrl + "/printers.php",
		dataType    : "json",
		method      : "post",
		headers     : { "Content-Type": "application/x-www-form-urlencoded" },
		encode      : true,
		onload      : function( response, textStatus, jQxhr ){
						// Feed the JSON response into an array
						var printers = JSON.parse( response.responseText );

						// Insert the printer options
						for ( var i = 0; i < 3; i++ ) {
							$( "#printers" ).append( "<option value='" + printers[ i ] + "'>" + printers[ i ] + "</option>" );
						}

						// Set the printer selection
						$( "#printers" ).val( GM_getValue( "defaultPrinter" ) );
					  },
		onerror     : function( jqXhr, textStatus, errorThrown ){
						console.log( "Printer list request error" );
						console.log( errorThrown );
					  }
	})
}

/**
 * Get the title info CSV from Ingram ipage
 * @param {string} ttlid TTLID from Ingram for the ipage title entry
 * @param {object} obj   Object that holds the title data we want to add to
 */
function getIngramTitleInfo( ttlid, obj ) {
	$.ajax({
		url         : "/ipage/servlet/ibg.common.titledetail.Download",
		dataType    : "text",
		method      : "post",
		contentType : "application/x-www-form-urlencoded",
		// This it the POST string for the CSV, ttlid is scraped then inserted here
		data        : "select6=ASCD&ttlid=" + ttlid + "&download.x=40&download.y=9&download=Download" ,
		success     : function( data, textStatus, jQxhr ){
						var $csvIndex = [ "isbn", "ean13", "title", "author", "middleInitial", "publisher", "date", "price" ];

						// Feed the CSV into an array
						var $ttlidCSV = $.csv.toArray( data );

						// Add a dollar sign to the price
						$ttlidCSV[ 7 ] =  "$" + $.trim( $ttlidCSV[ 7 ] );

						// Feed the array into an associative array
						for ( var i = 0; i < 8; i++ ) {
							$orderInfo[ $csvIndex[ i ] ] = $ttlidCSV[ i ]; 
							$( "#" + $csvIndex[ i ] ).val( $orderInfo[ $csvIndex[ i ] ] );
						}
						
						// Insert the hidden form fields
						for ( var i = 0; i < Object.size( $orderInfo ); i++ ) {
							var orderInfoIndex = Object.keys( $orderInfo );
							$( "#hiddenInfo" ).append( "<input type='hidden' id='" + orderInfoIndex[ i ] + "' name='orderInfo[" + orderInfoIndex[ i ] + "]' value=''>" );
						}

						// Fill the values of the hidden form fields
						for ( var i = 0; i < Object.size( $orderInfo ); i++ ) {
							var orderInfoIndex = Object.keys( $orderInfo );
							$( "#" + orderInfoIndex[ i ] ).val( $orderInfo[ orderInfoIndex[ i ] ] );
						}
					  },
		error       : function( jqXhr, textStatus, errorThrown ){
						console.log( "CSV request error" );
						console.log( errorThrown );
					  }
	});
}

//////////////////////////
//      Settings        //
//////////////////////////

/**
 * Check the remote server URL
 * @param  {string} remoteServerUrl Remote server URL
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