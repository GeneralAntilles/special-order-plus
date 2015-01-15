// ==UserScript==
// @name        ts360+
// @namespace   http://www.haslams.com/
// @version     0.6
// @description Baker & Taylor usability tweaks for Haslam's Book Store, Inc.
// @author      Ryan Abel
// @downloadURL https://raw.githubusercontent.com/GeneralAntilles/special-order-plus/master/ipage-plus.js
// @include     http*://ts360.baker-taylor.com/_layouts/CommerceServer/ItemDetailsPage.aspx?*
// @run-at      document-end
// @require     https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js
// @require     https://raw.githubusercontent.com/jackmoore/colorbox/master/jquery.colorbox-min.js
// @require     https://thousandsparrows.com/js/jquery.csv-0.71.js
// @require     https://raw.githubusercontent.com/digitalBush/jquery.maskedinput/1.4.0/dist/jquery.maskedinput.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://thousandsparrows.com/js/special-order-plus.js
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       unsafeWindow
// ==/UserScript==

//////////////////////////
//      Settings        //
//////////////////////////

// Remote web server URL
var remoteServerUrl = "https://example.com/";

// Set the printer selection
$( "#printers" ).val( GM_getValue( "defaultPrinter" ) );

//////////////////////////
//      Variables       //
//////////////////////////

// Object to contain the title info
var $orderInfo = {};

// Check to see if the discount is a normal, wholesale discount and set the variable
var $discountReg = $( '#discountPercentLiteral:contains("43")' ).length > 0 ? true : false;

// Is it available in the US?
var $availableUS;

// Is it returnable?
var $returnable;

var $orderInfoIndex = [];
var $orderInfo = {};

// Wait until the window DOM is loaded, then start grabbing info
$(window).load(function() {
	// Grab a variety of info about the current title
	$orderInfo.ean13 = $.trim( $( '.col1:contains("ISBN:")' ).next().text() );
	$orderInfo.title = $( '#ctl00_BrowseBodyInner_ProductDetailsUserControl_lblTitle' ).text();
	$orderInfo.publisher = $.trim( $( '.col1:contains("Publisher:")' ).next().text() );
	$orderInfo.binding = $.trim( $( '#ctl00_BrowseBodyInner_ProductDetailsUserControl_formatLiteral' ).text() );
	$orderInfo.date = $.trim( $( '.col3:contains("Street Date")' ).next().text() );
	$orderInfo.authors = $( "#ctl00_BrowseBodyInner_ProductDetailsUserControl_authors" ).text().split( "/" );

	// If we have multiple authors, we want to put them in an array
	$.each($orderInfo.authors, function( k, v ) {
		$orderInfo.authors[ k ] = $.trim( v );
	});

	// Also set the primary author
	$orderInfo.author = $orderInfo.authors[ 0 ];
	$orderInfo.price = "$" + unsafeWindow.id_listprice.slice( 0, -2 );

	// Build the ISBN from the ISBN-13
	$orderInfo.isbn = $orderInfo.ean13.substring( 3 ).substring( 0, 9 );
	$orderInfo.isbn = $orderInfo.isbn + isbnCheckDigit( $orderInfo.isbn );

	// Set the hidden form fields with the data we just grabbed
	$orderInfoIndex = Object.keys( $orderInfo );
	for( var i = 0; i < $orderInfoIndex.length; i++ ) {
		$( "#" + $orderInfoIndex[ i ] ).val( $orderInfo[ $orderInfoIndex[ i ] ] );
	}
});

// Have to wait for the AJAX to complete before we can get the inventory info
$(window).load(function () {
	waitForKeyElements( $( '.col1:contains("Momence")' ), function( jNode ) {
		var momenceAvail = $.trim( jNode.next().text() );
		var momenceOrder = $.trim( jNode.next().next().text()) ;
		$( "#momenceAvail" ).val( momenceAvail );
		$( "#momenceOrder" ).val( momenceOrder );
	});

	waitForKeyElements( $( '.col1:contains("Commerce")' ), function( jNode ) {
		var commerceAvail = $.trim( jNode.next().text() );
		var commerceOrder = $.trim( jNode.next().next().text() );
		$( "#commerceAvail" ).val( commerceAvail );
		$( "#commerceOrder" ).val( commerceOrder );
	});
});

//////////////////////////
//      Formatting      //
//////////////////////////

//////////////////////////
// Inject style/js/html //
//////////////////////////

// Append various styles for the scripts
$( "<div class='colorboxDiv'> \
<div id='specialOrder'> \
<form action='" + remoteServerUrl + "/special-order.php' method='post' class='special-order-form' id='specialOrderForm'> \
<div class='formLeft'> \
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
<div class='formRight'> \
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
<input type='hidden' id='isbn' name='orderInfo[isbn]' value=''> \
<input type='hidden' id='ean13' name='orderInfo[ean13]' value=''> \
<input type='hidden' id='title' name='orderInfo[title]' value=''> \
<input type='hidden' id='author' name='orderInfo[author]' value=''> \
<input type='hidden' id='middleInitial' name='orderInfo[middleInitial]' value=''> \
<input type='hidden' id='publisher' name='orderInfo[publisher]' value=''> \
<input type='hidden' id='date' name='orderInfo[date]' value=''> \
<input type='hidden' id='price' name='orderInfo[price]' value=''> \
<input type='hidden' id='binding' name='orderInfo[binding]' value=''> \
<input type='hidden' id='momenceAvail' name='orderInfo[momenceAvail]' value=''> \
<input type='hidden' id='momenceOrder' name='orderInfo[momenceOrder]' value=''> \
<input type='hidden' id='commerceAvail' name='orderInfo[commerceAvail]' value=''> \
<input type='hidden' id='commerceOrder' name='orderInfo[commerceOrder]' value=''> \
<input type='hidden' id='distributor' name='orderInfo[distributor]' value='bt'> \
<input class='button' type='submit' id='soSubmit'> \
<input class='button' type='submit' class='specialOrder' id='stockButton' value='Order for Stock'> \
</form></div></div>" ).appendTo( 'body' );

// Inject stylesheets for the special order form into the page
$( "head" ).append( "<link rel='stylesheet' type='text/css' href='https://thousandsparrows.com/js/colorbox/colorbox.css'/>" );
$( "head" ).append( "<link rel='stylesheet' type='text/css' href='https://raw.githubusercontent.com/GeneralAntilles/special-order-plus/master/form.css'/>" );

// The HTML for the special order form button
if ( true ) {
	$( ".ms-sitemapdirectional" ).before( '<div class="soButton-bt"><p><a class="specialOrder" id="soFormButton" href="#specialOrder" title="Special Order" accesskey="s">Special Order</a></p></div>' );
}

//////////////////////////
//       Form js        //
//////////////////////////

// Focus the first text field on the special order form when the form is activated
$(document).ready(function() { 
	// Do this when the special order link is activated
	$( "#soFormButton" ).bind( "click",function() {
		setTimeout(function() {
			// Need to delay about 400 ms for the form to finish fading in
			$( "#firstName" ).focus(); }, 400); 
	});
});

// Show the colorbox for the special order form
$(document).ready(function() {
	$( "#soFormButton" ).colorbox( {inline:true, width:"85%"} );
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

// Input mask for the telephone fields
$(document).ready(function() {
	$( "input[type=tel]" ).mask( "(999) 999-9999",{placeholder:"_"} );
});

//////////////////////////
// Store/retrieve form  //
//////////////////////////

// Store the form data to local storage when the form is submitted 
$(document).ready(function() {
	$( "#soSubmit" ).click( archiveToLocalStorage( $(this) ) );
});

// If the first name is an '=', then retrieve local storage and fill the form
$(document).ready(function () {
	$( "#firstName" ).keyup( fillFromLocalStorage( $(this) ) );
});

//////////////////////////
//     Submit form      //
//////////////////////////

// AJAX to submit the form data
$(document).ready(function() {
	$( "#specialOrderForm" ).submit( function( event ) { ajaxSpecialOrder( remoteServerUrl, event, $(this) ); } );
});

// AJAX for Order for Stock button
$(document).ready(function() {
	$( "#stockButton" ).click( function( event ) { ajaxOrderForStock( remoteServerUrl, event, $(this) ); } );

});

//////////////////////////
//   Apply formatting   //
//////////////////////////

// Indicate on the page if the discount is not regular wholesale
if ( !$discountReg ) {
	$( "body" ).addClass( "cantBuy" );
}

//////////////////////////
//   Query server info  //
//////////////////////////

// Send the POST request for the printer list
$(document).ready(function(){
	getPrinterList( remoteServerUrl );
});
