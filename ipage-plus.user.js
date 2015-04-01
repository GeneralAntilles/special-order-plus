// ==UserScript==
// @name        ipage+
// @namespace   http://www.haslams.com/
// @version     0.6.14
// @description Ingram ipage usability tweaks for Haslam's Book Store, Inc.
// @author      Ryan Abel
// @downloadURL https://web.haslams/js/ipage-plus.js
// @include     http*://ipage.ingramcontent.com/ipage/servlet/ibg.common.titledetail.*
// @run-at      document-end
// @require     https://web.haslams/js/jquery.min.js
// @require     https://web.haslams/js/jquery.colorbox-min.js
// @require     https://web.haslams/js/jquery.csv-0.71.js
// @require     https://web.haslams/js/jquery.maskedinput.min.js
// @require     https://web.haslams/js/special-order-plus.js
// @resource    https://web.haslams/css/colorbox.css
// @resource    https://web.haslams/css/form.css
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// ==/UserScript==

//////////////////////////
//      Settings        //
//////////////////////////

// Remote web server URL
var remoteServerUrl = "https://web.haslams/";

//////////////////////////
//      Variables       //
//////////////////////////

// Object to contain the title info
var $orderInfo = {};

// Check to see if the discount is a normal, wholesale discount and set the variable.
var $discountReg = $( 'div:contains("REG")' ).length > 0 ||
                   $( 'div:contains("45%")' ).length > 0 ||
                   $( 'div:contains("LOW")' ).length > 0 ?
                   true : false;

// Is it available in the US?
var $availableUS = $( 'p:contains("Available in some countries but not the United States.")' ).length > 0 || $( 'p:contains("Restricted:  Not available to all customers.")' ).length > 0 ? false : true;

// Is it returnable?
var $returnable = $( 'p:contains("This item is Not Returnable")' ).length > 0 ? false : true;

// Grab the ISBN from the table
$orderInfo.isbn = $( ".productDetailElements" ).first().contents().filter(function() {
	return this.nodeType == 3;
}).text().substring( 1,11 );

// Grab Ingram's ttlid for the entry from the HTML
$orderInfo.ttlid = $( "[name='ttlid']" ).attr( "value" );

// Get the binding information
$orderInfo.binding = $.trim( $( ".productDetailElements:contains('Binding')" ).contents().filter(function() {
	return this.nodeType == 3;
}).text());

// Get the BISAC categories from the page
$orderInfo.bisacCategories = $.trim( $( ".productDetailSmallElements:contains('BISAC')" ).text().replace( /BISAC.*\s*/, "" ).replace( /\s*\|\s*/g, ", " ) );

// Get the LC subject categories from the page
$orderInfo.lcSubjects = $.trim( $( "strong:contains('LC Subjects:')" ).next().next().text() ).replace( /\s*-/g, ", " ).substr( 1 );

// Get the physical attributes from the page
$orderInfo.physical = $.trim( $( '.productDetailSmallElements:contains("Physical Info")' ).text().replace( /Physical Info: /, "" ) );

// Get the carton quantity from the page
$orderInfo.cartonQuantity = $.trim( $( '.productDetailSmallElements:contains("Carton")' ).text().replace( /Carton Quantity: /, "" ) );

// Get the long description from the page
$orderInfo.longDescription = $.trim( $( "#reviewsBox" ).text() );

// Get the availability info from the page
$orderInfo.tnAvail = $( ".scLightRow" ).first().text();
$orderInfo.tnOrder = $( ".scLightRow" ).eq(1).text();
$orderInfo.paAvail = $( ".scDarkRow" ).first().text();
$orderInfo.paOrder = $( ".scDarkRow" ).eq(1).text();

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
<label><span>Printer: </span><select name='orderInfo[printer]' id='printers'> \
</select></label> \
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
<div id='hiddenInfo'> \
<input type='hidden' id='distributor' name='orderInfo[distributor]' value='ingram'> \
</div> \
<input class='button' type='submit' id='soSubmit'> \
<input class='button' type='submit' class='specialOrder' id='stockButton' value='Order for Stock'> \
</form></div></div>" ).appendTo( 'body' );

// Inject stylesheets for the special order form into the page
$( "head" ).append( "<link rel='stylesheet' type='text/css' href='https://web.haslams/css/colorbox.css'/>" );
$( "head" ).append( "<link rel='stylesheet' type='text/css' href='https://web.haslams/css/form.css'/>" );

// Add a link to this entry on Baker & Taylor
$(document).ready(function() {
	var btUrl = "http://ts360.baker-taylor.com/_layouts/CommerceServer/QuickSearch.aspx?keyword=" + $orderInfo.isbn;
	$( "<a href='" + btUrl + "' accesskey='b' target='_blank'>Check on B&T</a>" ).appendTo( "body" );
});

// The HTML for the special order form button
if ( $availableUS && $discountReg ) {
	$( ".mastHeadContainer" ).after( '<div class="soButton"><p><a class="specialOrder" id="soFormButton" href="#specialOrder" title="Special Order" accesskey="s">Special Order</a></p></div>' );
}

//////////////////////////
//       Form js        //
//////////////////////////

// Focus the first text field on the special order form when the form is activated
$(document).ready(function() { 
	// Do this when the special order link is activated
	$( "#soFormButton" ).bind("click",function() {
		setTimeout(function() {
			// Need to delay about 400 ms for the form to finish fading in
			$( "#firstName" ).focus(); }, 400 ); 
	});
});

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

// Input mask for the telephone fields
$(document).ready(function() {
	$( "input[type=tel]" ).mask( "(999) 999-9999",{ placeholder:"_" } );
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
//   Query server info  //
//////////////////////////

// Send the POST request for the printer list
$(document).ready(function(){
	getPrinterList( remoteServerUrl );
});

//////////////////////////
//    Query for CSV     //
//////////////////////////

// Send the POST request for the title listing's CSV and do processing
$(document).ready(function(){
	getIngramTitleInfo( $orderInfo.ttlid, $orderInfo );
});
