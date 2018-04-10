(function($) {
    function getBgPosAxis(elem, axis) {
        var posArray = $(elem).css('backgroundPosition').split(' ');
        return posArray[(axis == 'x') ? 0 : 1];
    };
    function valueInPx(value) {
        return (_.isNumber(value) ? value + 'px' : value);
    };
    var test_elem = $('<div></div');
    var b_position = {
        'x': '100px',
        'y': '200px'
    }
    test_elem.css('backgroundPositionX', b_position.x);


    if (test_elem.css('backgroundPositionX') == undefined) {
        $.cssHooks['backgroundPositionX'] = {
            'get': function(elem, computed, extra) {
                return getBgPosAxis(elem, 'x');
            },
            'set': function(elem, value) {
                elem.style.backgroundPosition = valueInPx(value) + ' ' + getBgPosAxis(elem, 'y');
            }
        };
        $.cssHooks['backgroundPositionY'] = {
            'get': function(elem, computed, extra) {
                return getBgPosAxis(elem, 'y');
            },
            'set': function(elem, value) {
                elem.style.backgroundPosition = getBgPosAxis(elem, 'x') + ' ' + valueInPx(value);
            }
        };
    }
})(jQuery);
