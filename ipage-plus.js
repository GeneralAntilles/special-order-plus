// ==UserScript==
// @name        ipage+
// @namespace   http://www.haslams.com/
// @version     0.5
// @description Ingram ipage usability tweaks for Haslam's Book Store, Inc.
// @author      Ryan Abel
// @downloadURL https://raw.githubusercontent.com/GeneralAntilles/special-order-plus/master/ipage-plus.js
// @include     http*://ipage.ingramcontent.com/ipage/servlet/ibg.common.titledetail.*
// @run-at      document-end
// @require     https://code.jquery.com/jquery-latest.js
// @require     https://raw.githubusercontent.com/jackmoore/colorbox/master/jquery.colorbox-min.js
// @require     https://thousandsparrows.com/js/jquery.csv-0.71.js
// @require     https://raw.githubusercontent.com/digitalBush/jquery.maskedinput/1.4.0/dist/jquery.maskedinput.min.js
// @resource    https://thousandsparrows.com/js/colorbox/colorbox.css
// @resource    https://thousandsparrows.com/jquery.form.min.js
// @resource    https://raw.githubusercontent.com/GeneralAntilles/special-order-plus/master/form.css
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       unsafeWindow
// ==/UserScript==

//////////////////////////
//      Functions       //
//////////////////////////

// Check whether string ends with a supplied suffix
function endsWith( str, suffix ) {
	return str.indexOf( suffix, str.length - suffix.length ) !== -1;
}

// Store the form data to local storage
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

// Focus the first text field on the special order form when the form is activated
$(document).ready(function() { 
	// Do this when the special order link is activated
	$( "#soFormButton" ).bind("click",function() {
		setTimeout(function() {
			// Need to delay about 400 ms for the form to finish fading in
			$( "#firstName" ).focus(); }, 400 ); 
	});
});

// Toggle the disabled attribute on an HTML element
(function($) {
	$.fn.toggleDisabled = function(){
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};
})(jQuery);

//////////////////////////
//      Variables       //
//////////////////////////

// Check to see if the discount is a normal, wholesale discount and set the variable.
$discountReg = $( 'div:contains("REG")' ).length > 0 || $( 'div:contains("45%")' ).length > 0 ? true : false;

// Check to see if it's available
$availableUS = $( 'p:contains("Available in some countries but not the United States.")' ).length > 0 || $( 'p:contains("Restricted:  Not available to all customers.")' ).length > 0 ? false : true;

// Check to see if it's returnable
$returnable = $( 'p:contains("This item is Not Returnable")' ).length > 0 ? false : true;

// Grab the ISBN from the table
var $isbn = $( ".productDetailElements" ).first().contents().filter(function() {
	return this.nodeType == 3;
}).text().substring( 1,11 );

// Grab Ingram's ttlid for the entry from the HTML
var $ttlid = $( "[name='ttlid']" ).attr( "value" );

// Get the binding information
var binding = $.trim( $( ".productDetailElements:contains('Binding')" ).contents().filter(function() {
	return this.nodeType == 3;
}).text());

// Index for the CSV we're getting from Ingram
var $orderInfoIndex = [ "isbn", "ean13", "title", "author", "middleInitial", "publisher", "date", "price" ];
var $orderInfo = {};

// We have to scrape the binding
$orderInfo[ binding ] = binding;

$(document).ready(function() {
	$( "#binding" ).val( $orderInfo[ binding ] );
});

// Get the availability info from the page
var $tnAvail = $( ".scLightRow" ).first().text();
var $tnOrder = $( ".scLightRow" ).eq(1).text();
var $paAvail = $( ".scDarkRow" ).first().text();
var $paOrder = $( ".scDarkRow" ).eq(1).text();

$(document).ready(function() {
	$( "#tnAvail" ).val( $tnAvail );
	$( "#tnOrder" ).val( $tnOrder );
	$( "#paAvail" ).val( $paAvail );
	$( "#paOrder" ).val( $paOrder );
});

//////////////////////////
//      Formatting      //
//////////////////////////

// Apply class for reformating primary title information table
$( 'table[cellspacing="2"]' ).addClass( "tableWidth100" );

// Hide the Ingram ipage logo
$( "#ipageLogo" ).css( "display", "none" );

//////////////////////////
// Inject style/js/html //
//////////////////////////

// Append various styles for the scripts
$( "<div style='display: none'> \
<div id='specialOrder' style='display: block; background-color: white; padding: 1em;'> \
<form action='' method='post' class='special-order-form' id='specialOrderForm'> \
<div class='formLeft' style='float: left;width: 50%'> \
<label><span>First name: </span><input type='text' name='orderInfo[firstName]' id='firstName' class='stored' required><br></label> \
<label><span>Last name: </span><input type='text' name='orderInfo[lastName]' class='stored'><br></label> \
<label><span>Telephone: </span><input type='tel' name='orderInfo[telephone]' class='stored'><br></label> \
<label><span>Address: </span><input type='text' name='orderInfo[address]' class='stored'><br><span></span><input type='text' name='orderInfo[address2]' class='stored'><br></label> \
<label><span>City: </span><input type='text' name='orderInfo[city]' class='stored'><br></label> \
<label><span>State: </span><input type='text' name='orderInfo[state]' class='stored'><br></label> \
<label><span>Zip code: </span><input type='text' name='orderInfo[zipCode]' class='stored'><br></label> \
<label><span>E-mail: </span><input type='email' name='orderInfo[email]' autocomplete='off' class='stored'><br></label> \
<label><span>Quantity: </span><input type='number' name='orderInfo[quantity]' min='1' value='1'><br></label> \
<input type='hidden' value='Off' name='orderInfo[paid]'> \
<label class='checkbox'><input type='checkbox' name='orderInfo[paid]' accesskey='p' value='Paid'>Paid<br></label> \
<input type='hidden' value='Off' name='orderInfo[stock]'> \
<label class='checkbox'><input type='checkbox' name='orderInfo[stock]' accesskey='i' value='Stock'>Stock<br></label> \
</div> \
<div class='formRight' style='float: right; width: 50%;'> \
<input type='hidden' value='NoShip' name='orderInfo[ship]'> \
<h1 id='shipping' class='ship no-ship' accesskey='u'>Shipping<input type='checkbox' value='Ship' name='orderInfo[ship]' style='display: none;' id='ship'></h1> \
<label class='ship no-ship'><span>First name: </span><input type='text' name='orderInfo[shipFirstName]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>Last name: </span><input type='text' name='orderInfo[shipLastName]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>Telephone: </span><input type='tel' name='orderInfo[shipTelephone]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>Address: </span><input type='text' name='orderInfo[shipAddress]' class='stored' disabled='disabled'><br><span></span><input type='text' name='orderInfo[shipAddress2]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>City: </span><input type='text' name='orderInfo[shipCity]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>State: </span><input type='text' name='orderInfo[shipState]' class='stored' disabled='disabled'><br></label> \
<label class='ship no-ship'><span>Zip code: </span><input type='text' name='orderInfo[shipZipCode]' class='stored' disabled='disabled'><br></label><br> \
<label><span>Clerk: </span><input type='text' name='orderInfo[clerk]' class='stored' required><br></label> \
<label><span>Ticket #: </span><input type='text' name='orderInfo[ticketNum]' class='stored'><br></label> \
</div> \
<input type='hidden' id='ttlid' name='orderInfo[ttlid]' value=''> \
<input type='hidden' id='isbn' name='orderInfo[isbn]' value=''> \
<input type='hidden' id='ean13' name='orderInfo[ean13]' value=''> \
<input type='hidden' id='title' name='orderInfo[title]' value=''> \
<input type='hidden' id='author' name='orderInfo[author]' value=''> \
<input type='hidden' id='middleInitial' name='orderInfo[middleInitial]' value=''> \
<input type='hidden' id='publisher' name='orderInfo[publisher]' value=''> \
<input type='hidden' id='date' name='orderInfo[date]' value=''> \
<input type='hidden' id='price' name='orderInfo[price]' value=''> \
<input type='hidden' id='binding' name='orderInfo[binding]' value=''> \
<input type='hidden' id='tnAvail' name='orderInfo[tnAvail]' value=''> \
<input type='hidden' id='tnOrder' name='orderInfo[tnOrder]' value=''> \
<input type='hidden' id='paAvail' name='orderInfo[paAvail]' value=''> \
<input type='hidden' id='paOrder' name='orderInfo[paOrder]' value=''> \
<input type='hidden' id='distributor' name='orderInfo[distributor]' value='ingram'> \
<input class='button' type='submit' id='soSubmit'> \
<input class='button' type='submit' class='specialOrder' id='stockButton' value='Order for Stock' style='margin-right: 1ex; background: gray; text-shadow: 1px 1px 1px #333;'> \
</form></div></div>" ).appendTo( 'body' );

// Inject stylesheets for the special order form into the page
var link = window.document.createElement( "link" );
link.rel = "stylesheet";
link.type = "text/css";
link.href = "https://thousandsparrows.com/js/colorbox/colorbox.css";
document.getElementsByTagName( "HEAD" )[ 0 ].appendChild( link );

var link = window.document.createElement( "link" );
link.rel = "stylesheet";
link.type = "text/css";
link.href = "https://raw.githubusercontent.com/GeneralAntilles/special-order-plus/master/form.css";
document.getElementsByTagName( "HEAD" )[ 0 ].appendChild( link );

// Add a link to this entry on Baker & Taylor
$(document).ready(function() {
	var btUrl = "http://ts360.baker-taylor.com/pages/searchresults.aspx?keyword=" + $isbn;
	$( "<a href='" + btUrl + "' accesskey='b' target='_blank'>Check on B&T</a>" ).appendTo( "body" );
});

// The HTML for the special order form button
if ( $availableUS && $discountReg ) {
	$( ".mastHeadContainer" ).after( '<div class="soButton" style="margin: 0 0 1em 1em;"><p style="font-weight: bold; margin: 0.5em 0; text-align: left;"><a class="specialOrder" id="soFormButton" href="#specialOrder" title="Special Order" accesskey="s">Special Order</a></p></div>' );
}

//////////////////////////
//       Form js        //
//////////////////////////

// Show the colorbox for the special order form
$(document).ready(function(){
	$( "#soFormButton" ).colorbox( { inline:true, width:"85%" } );
});

// Toggle the shipping fields on click
$(document).ready(function() {
	$( "#shipping" ).click(function(e) {      
		$( ".ship" ).toggleClass( "no-ship", this.checked );
		$( "[name*='orderInfo[ship']" ).toggleDisabled().val( "" );
		var $chkb = $( ":checkbox", this )[ 0 ];
		if( e.target !== $chkb ) $chkb.checked = !$chkb.checked; 
	});
});

$(document).ready(function() {
	$( "input[type=tel]" ).mask( "(999) 999-9999",{ placeholder:"_" } );
});

//////////////////////////
// Store/retrieve form  //
//////////////////////////

// Store the form data to local storage when the form is submitted 
$(document).ready(function() {
	$( "#soSubmit" ).click(function(e) {
		archiveLocalStorage();
	});
});

// If the first name is an '=', then retrieve local storage and fill the form
$(document).ready(function () {
	$( "#firstName" ).keyup(function () {
		if ( $(this).val() == "=" ) {
			for ( var i = 0; i < localStorage.length; i++ ) {
				$( "[name='" + localStorage.key( i ) + "']").val( localStorage.getItem( localStorage.key( i ) ) );
			}

			if ( localStorage.getItem( "orderInfo[shipFirstName]" ) ) {
				$( ".ship" ).toggleClass( "no-ship" );
				$( "[name*='orderInfo[ship']" ).toggleDisabled();
				$( "#shipCheck" ).prop( "checked", true );
			}
		}
	});
});

//////////////////////////
//     Submit form      //
//////////////////////////

// AJAX to submit the form data
$(document).ready(function() {
	$( "#specialOrderForm" ).submit(function(e) {
		e.preventDefault();

		// Process the form data so we can POST it
		var formData = $.param( $(this).serializeArray() );

		// Send the HTTP POST with the form data
		GM_xmlhttpRequest({
			method      : "POST",
			url         : "/special-order.php",
			data        : formData,
			headers     : { "Content-Type": "application/x-www-form-urlencoded" },
			dataType    : "json",
			encode      : true,
			onprogress  : function() { $( "#specialOrder" ).html( "<h1 style='height: 100%; vertical-align: center; font-size: 3em; text-align: center; color: #444;'>\
							Sending...</h1>" ); },
			onload      : function(response) { $( "#specialOrder" ).html( "<h1 style='height: 100%; vertical-align: center; font-size: 3em; text-align: center; color: #444;'>\
							Success!</h1>" );
							$.colorbox.close(); },
			onerror     : function(response) { console.log( response.responseText ); }
		})
	});
});

//////////////////////////
//   Apply formatting   //
//////////////////////////

// Indicate on the page whether it's returnable or not
if ( $returnable ) {
	$( "td" ).filter(function() { return $.trim( $(this).html() ) == "&nbsp;"; } ).replaceWith( '<td colspan="2"><h3 class="returnable">Returnable</h3></td>' );
} else {
	$( "td" ).filter(function() { return $.trim( $(this).html() ) == "&nbsp;"; } ).replaceWith( '<td colspan="2"><h3 class="notReturnable">Not Returnable</h3></td>' );
}

// Indicate on the page if it isn't available in the US
if ( !$availableUS ) {
	if ( !$returnable ) {
		$( "h3.notReturnable" ).after( '<h3 class="notReturnable">Not available in the US</h3>' );
	} else {
		$( "h3.returnable" ).after( '<h3 class="notReturnable">Not available in the US</h3>' );
	}
}

// Indicate on the page if the discount is not regular wholesale
if ( !$discountReg ) {
	$( "body" ).addClass( "cantBuy" );
}

//////////////////////////
//    Query for CSV     //
//////////////////////////

// Send the POST request for the title listing's CSV and do processing
$(document).ready(function(){
	$.ajax({
		url         : "/ipage/servlet/ibg.common.titledetail.Download",
		dataType    : "text",
		method      : "post",
		contentType : "application/x-www-form-urlencoded",
		// This it the POST string for the CSV, ttlid is scraped then inserted here
		data        : "select6=ASCD&ttlid=" + $ttlid + "&download.x=40&download.y=9&download=Download" ,
		success     : function( data, textStatus, jQxhr ){
			// Feed the CSV into an array
			var $ttlidCSV = $.csv.toArray( data );

			// Add a dollar sign to the price
			$ttlidCSV[ 7 ] =  "$" + $.trim( $ttlidCSV[ 7 ] );

			// Feed the array into an associative array
			for ( var i = 0; i < 8; i++ ) {
				$orderInfo[ $orderInfoIndex[ i ] ] = $ttlidCSV[ i ]; 
				$( "#" + $orderInfoIndex[ i ] ).val( $orderInfo[ $orderInfoIndex[ i ] ] );
			}
		},
		error       : function( jqXhr, textStatus, errorThrown ){
			console.log( "CSV request error" );
			console.log( errorThrown );
		}
	});
});

//////////////////////////
//       Testing        //
//////////////////////////

// AJAX for Order for Stock button
$(document).ready(function() {
	$( "#stockButton" ).click(function( e ) {
		e.preventDefault();

		// Process the form data so we can POST it
		var formData = $.param( $( "#specialOrderForm" ).serializeArray() );

		// Send the HTTP POST with the form data
		GM_xmlhttpRequest({
			method      : "POST",
			url         : "/order-for-stock.php",
			data        : formData,
			headers		: { "Content-Type": "application/x-www-form-urlencoded" },
			dataType    : "json",
			encode      : true,
			onprogress	: function() { $( "#specialOrder" ).html( "<h1 style='height: 100%; vertical-align: center; font-size: 3em; text-align: center; color: #444;'>\
						   Sending...</h1>" ); },
			onload		: function( response ) { $( "#specialOrder" ).html( "<h1 style='height: 100%; vertical-align: center; font-size: 3em; text-align: center; color: #444;'>\
						   Success!</h1>" );
						   $.colorbox.close(); },
			onerror		: function( response ) { console.log( response.responseText ); }
		})
	});
});
