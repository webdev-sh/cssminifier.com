$(function() {

    // set some vars for use
    var $form   = $('#input-form');
    var $input  = $('#input');
    var $output = $('#output');

    function set_states() {
        var $input = $('#input');
        if ( $input.val().length > 0 ) {
            $('#raw, #download, #minify, #clear').removeAttr('disabled');
            $output.removeAttr('disabled');
        }
        else {
            $('#raw, #download, #minify, #clear').attr('disabled', 'disabled');
            $output.attr('disabled', 'disabled');
        }
    }

    function minify() {
        var input = $input.val();
        $.post( '/raw', { input : input }, function(data) {
            if ( data ) {
                $output.val(data);
                $output.removeAttr('disabled');
            }
        });
    }

    // some setup
    set_states();

    // events on the textarea#input
    $input.keypress( set_states );
    $input.keyup( set_states );
    $input.keydown( set_states );

    // events on the buttons
    $('#minify').click(function() {
        minify();
        return false;
    });

    $('#download').click(function() {
        $form.attr('action', '/download').submit();
        minify();
        return false;
    });

    $('#raw').click(function() {
        $form.attr('action', '/raw').submit();
        return true;
    });

    $('#clear').click(function() {
        $input.val('');
        set_states();
        $input.focus();
        return false;
    });
});
