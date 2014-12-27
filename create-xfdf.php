<?php
function createXFDF( $file, $info, $encoding='UTF-8' )
{
    $data = '<?xml version="1.0" encoding="'.$encoding.'"?>' . "\n" .
        '<xfdf xmlns="http://ns.adobe.com/xfdf/" xml:space="preserve">' . "\n" .
        '<fields>' . "\n";
    foreach( $info as $field => $val )
    {
        $data .= '<field name="' . $field . '">' . "\n";
        if( is_array( $val ) )
        {
            foreach( $val as $opt )
                $data .= '<value>' .
                    htmlentities( $opt, ENT_COMPAT, $enc ) .
                    '</value>' . "\n";
        }
        else
        {
            $data .= '<value>' .
                htmlentities( $val, ENT_COMPAT, $enc ) .
                '</value>' . "\n";
        }
        $data .= '</field>' . "\n";
    }
    $data .= '</fields>' . "\n" .
        '<ids original="' . md5( $file ) . '" modified="' .
            time() . '" />' . "\n" .
        '<f href="' . $file . '" />' . "\n" .
        '</xfdf>' . "\n";
    return $data;
}
?>
