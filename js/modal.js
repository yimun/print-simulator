function bbimg(o) {
    var zoom = parseInt(o.style.zoom, 10) || 100;
    zoom += event.wheelDelta / 12;
    if (zoom > 0) o.style.zoom = zoom + '%';
    return false;
}


$().ready(function() {
    $('#error-img').click(function() {}).mousedown(
        function(event) {
            console.log('down')
            var isMove = true;
            var abs_x = $(this).scrollLeft() + event.pageX;
            var abs_y = $(this).scrollTop() + event.pageY;
            console.log(event.pageX + "," + event.pageY);
            $(this).mousemove(function(event) {
                if (isMove) {
                    $(this).scrollTop(abs_y - event.pageY)
                    $(this).scrollLeft(abs_x - event.pageX)
                }
            }).mouseup(
                function() {
                    console.log("up")
                    isMove = false;
                }
            );
        }
    );
    $('img').on('dragstart', function(event) { event.preventDefault(); });
    $("#error-img").bind("mousewheel", function() {
        return false; });
});
