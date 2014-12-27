(function($) {
	$.fn.toggleDisabled = function(){
		return this.each(function(){
			this.disabled = !this.disabled;
		});
	};
})(jQuery);

$(document).ready(function() {
	$('#ship').click(function(e) {
		$('.ship').toggleClass('no-ship',this.checked);
		$("[name*='orderInfo[ship']").toggleDisabled();
		var $chkb = $(':checkbox', this)[0];
		if(e.target !== $chkb) $chkb.checked = !$chkb.checked;
	});
});

// Check a string to see what character it ends with
// This is for figuring what parts of localStorage are the backup
function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

// Move the form data to suffixed localStorage for storage
function archiveLocalStorage() {
	var len = localStorage.length;
	for (var i = 0; i < len; i++){
		var keyi;

		if ( !endsWith( localStorage.key(i), 1 ) ) {
			keyi = localStorage.key(i)+1;
			localStorage.setItem(keyi, localStorage.getItem(localStorage.key(i)));
			localStorage.removeItem(localStorage.key(i));
		}
	}
}

$(document).ready(function() {
	$('.stored').keyup(function () {
	if ( $(this).val() !== 0 ) {
		localStorage[$(this).attr('orderInfo[firstName]')] = $(this).val();
	}
});

$('#firstName').keyup(function () {
	if ( $(this).val() == "=" ) {
		for ( var i = 0; i < localStorage.length; i++ ) {
			if ( endsWith( localStorage.key(i), 1 ) ) {
				$("[name='" + localStorage.key(i).slice(0,-1) + "']").val(localStorage.getItem(localStorage.key(i)));
			}
		}

		if ( localStorage.getItem( 'orderInfo[shipFirstName]1' ) ) {
			$('.ship').toggleClass('no-ship');
			$("[name*='orderInfo[ship']").toggleDisabled();
			$("#shipCheck").prop( "checked", true );
		}
	}
	});
});

$(document).ready(function () {
	$('.stored').keyup(function () {
		localStorage[$(this).attr('name')] = $(this).val();
	});
});

