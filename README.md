# Special Order System

*Updated December 27th, 2014*

## Purpose

The special order system faciliates taking special orders through the [Ingram ipage](https://ipage.ingramcontent.com/) and [Baker & Taylor Title Source 360](https://ts360.baker-taylor.com/) web databases by providing a HTML form on these websites and a printing backend.

## Requirements

1. Web server capable of running PHP.
2. A userscript plugin like [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Greasemonkey](http://www.greasespot.net/) (not tested in Firefox, though).
3. The [pdftk](https://www.pdflabs.com/tools/pdftk-server/) tool for filling the PDF forms and stamping barcodes.
4. [GNU barcode](https://www.pdflabs.com/tools/gnu-barcode-plus-pdf/) patched with PDF support.

## Installation

It's not quite ready for prime-time, but eager testers will need to ensure that all of the requirements are met then:

1. Install the userscripts on your client browsers (ipage-plus.js for Ingram and ts360-plus.js for Baker & Taylor).
2. Put special-order.php on a web server.
3. Edit ipage-plus.js and ts360-plus.js to point to the appropriate URL for special-order.php (there's no setting for this yet).
4. Provide a PDF form template to be filled by special-order.php (a default template will be uploaded at some point).
5. Hit it until it works.

It's at the bailing wire and good intentions stage of development right now, so there will probably be a lot of hitting.

## Architecture

The special order system is made up of two parts:

1. A local **userscript**, which does the information scraping and inserts the special order form into the websites.
2. A remote **web server**, which collects the form data from clients, compiles it into a PDF, prints the PDF, and keeps track of an index number.

### Userscript

The local userscript is a short JavaScript program which primarily:

1. **Scrapes** the title information from the current web page in ipage and TS360.
2. **Adds a special order form** to those pages.
3. **Submits** the personal information and title information to the web server.

Information about the current title is both **scraped from the page** using jQuery selectors and, for Ingram, by submitting an HTTP POST request for the title data.

**An HTML form is added to the page** inside of a ColorBox which can be shown using either a button inserted on the page, or a keyboard shortcut.

The form data, which contains both the collected personal information from the HTML form and title information scraped from the page, is **submitted to the web server** using AJAX.

### Web server

The remote web server is a short PHP program which primarily:

1. **Collects and parses** the form data from clients.
2. **Generates** a PDF from the form data and other data.
3. **Prints** the PDF.

The **form data from the client is collected and parsed** to display appropriately in the PDF form (first name + laste name = name, etc.), and processed into an XFDF file.

An index number is generated for the special order, then **a PDF form is filled from the XFDF file**, stamped with a barcode of the EAN13 for the book, and the PDF is flattened.

The **PDF is printed** to a network printer using CUPS.

### Program flow

When a client with the appropriate userscripts installed visits a title listing on either Ingram ipage or Baker & Taylor TS360, a special order form button is displayed.

After the page is loaded, the userscript scrapes the data for the current title from the web page and sends a query for an additional data file about the title from their server. This information is then inserted into the special order form. 

When the user clicks the special order button, a form with fields for customer and order information is displayed. After the information is filled in and the form is submitted, the data is sent to the web server for processing and printing.

The web server parses and formats the form data from the client and generates an XFDF file from this data. An index number for the special order is generated from a counter file on the web server. An EAN13 barcode is created. All of this data is inserted into a PDF form. Finally, the PDF is printed.