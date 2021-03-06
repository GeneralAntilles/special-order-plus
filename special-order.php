<?php require ( $_SERVER["DOCUMENT_ROOT"] . "/create-xfdf.php" ); ?>

<?php
header("Access-Control-Allow-Origin: *"); 

/* Settings */

// Hostname of the server with the PDF template
define( "PDF_HOSTNAME", "web.haslams" );

// Path to our pdftk executable
define( "PDFTK", "/usr/bin/pdftk" );

// Path to our barcode executable
define( "BARCODE", "/usr/local/bin/barcode" );

// Where we want to output our files. Needs a trailing slash. 
define( "RESULTS_PATH", "results/");

/* Order variables */

// Fill our array from the form POST
$orderInfo = $_POST["orderInfo"];

// Append the last name to the first name for display in the PDF
$orderInfo["name"] = $orderInfo["firstName"] . " " . $orderInfo["lastName"];

// If we have city/state info:
if ( !empty( $orderInfo["city"] ) ) {
	// Append the state abbreviation to the city for display in the PDF
	$orderInfo["cityState"] = $orderInfo["city"] . ", " . $orderInfo["state"];
}

// Set the date for the order
$orderInfo["orderDate"] = date( "F jS, Y" );

// This is our PDF form template path for the special order
if ( $orderInfo["distributor"] == "ingram" ) {
	$pdf_template_distributor = "ingram";
} else {
	$pdf_template_distributor = "bt";
}

if ( empty( $orderInfo["address"] ) ) {
	$pdf_template_type = "name-phone-";
} else {
	$pdf_template_type = "";
}

// This is the PDF form template URL
$pdfFileUrl = "https://" . PDF_HOSTNAME . "/special-order-form-ingram.pdf";
$pdfTemplatePath = "/special-order-form-ingram.pdf";

// Generate a unique filename for each order
$filename = date( "Y-m-d" ) . "-" . time();
$xfdfFile = $filename . ".xfdf";
$resultDirectory = dirname(__FILE__) . "/" . RESULTS_PATH;

// Get the counter index from a file and increment it by one
$fp = fopen("special-order-index.txt", "c+");
flock($fp, LOCK_EX);
$count = (int)fread($fp, filesize("special-order-index.txt"));
ftruncate($fp, 0);
fseek($fp, 0);
fwrite($fp, $count +1 );
flock($fp, LOCK_UN);
fclose($fp);

// Set the orderNumber from the counter index for display in the PDF
$orderInfo["orderNumber"] = file_get_contents ( "./special-order-index.txt" );

// This is where our XFDF file ends up
$xfdfFilePath = $resultDirectory . $xfdfFile;

// PDF file names
$pdfName = substr( $xfdfFilePath, 0, -4 ) . "pdf";
$pdfFileName = $filename . ".pdf";

// Generate the XFDF
$xfdf = createXFDF( $pdfFileUrl, $orderInfo );

// Write the XFDF to disk
if( $fp = fopen( $xfdfFilePath, "w" ) )
{
	fwrite( $fp, $xfdf, strlen( $xfdf ) );
}
fclose($fp);

// Fill the PDF from the XFDF, generate an EAN13 barcode, stamp the PDF with the barcode
$xfdfCmd = PDFTK . " $pdfTemplatePath fill_form $xfdfFilePath output $pdfName.pre flatten";
$barcodeCmd = BARCODE . " -e ean13 -n -b \"$orderInfo[ean13]\" -D -o " . RESULTS_PATH . "$filename-13.txt -g100x30+160+135";
$stampCmd = PDFTK . " $pdfName.pre stamp " . RESULTS_PATH . "$filename-13.pdf output $pdfName";

exec( $xfdfCmd, $outputXfdf, $retXfdf );
exec( $barcodeCmd, $outputBarcode, $retBarcode );
exec( "cat barcode_doc_front.txt " . RESULTS_PATH ."$filename-13.txt barcode_doc_back.txt > " . RESULTS_PATH . "$filename-13.pdf", $outputCat, $retCat);
exec( $stampCmd, $outputStamp, $retStamp );

if ( file_exists( "./" . RESULTS_PATH . $filename . "-13.pdf" ) ) {

	unlink( "./" . RESULTS_PATH . $filename . "-13.pdf" );
}

if ( file_exists( "./" . RESULTS_PATH . $filename . "-13.txt" ) ) {
	unlink( "./" . RESULTS_PATH . $filename . "-13.txt" );
}

if ( file_exists( "./" . RESULTS_PATH . $filename . ".pdf.pre" ) ) {
	unlink( "./" . RESULTS_PATH . $filename . ".pdf.pre" );
}

// Print the final PDF
system( "/usr/bin/lpr -o landscape -P " . $orderInfo["printer"] . " " . RESULTS_PATH . "$pdfFileName" ); 

echo json_encode($orderInfo);
?>
