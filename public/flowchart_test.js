var debug = true;

var box_height = 50;
var box_width = 100;
var top_margin = 10;
var bot_margin = 10;
var left_margin = 130;
var right_margin = 10;
var horiz_spacing = 20;
var vert_spacing = 20;
var corner_radius = 5;
var tool_left_margin = 10;
var tool_right_margin = 10;
var tool_top_margin = 10;
var tool_bot_margin = 10;

var inner_offset = 5;

var boxes = [];
var drops = [];
var boxtool;
var arrowtool;

var scale = 1;

window.onload=function(){
    var s = Snap("#svg");
    
    var i,j;
    
    boxtool = s.rect(tool_left_margin, tool_top_margin, box_width, box_height);
    boxtool.attr({
        fill: "#DEFABC",
        stroke: "000",
        strokeWidth: 2
    });
    
    boxtool.click(boxToolSelected);
    
    arrowtoolbox = s.rect(tool_left_margin, tool_top_margin + box_height + vert_spacing, box_width, box_height);
    arrowtoolbox.attr({
        fill: "#FEDBCA",
        stroke: "000",
        strokeWidth: 2
    });
    
    arrowtool = s.polyline(tool_left_margin, tool_top_margin + box_height + vert_spacing, tool_left_margin + box_width, tool_top_margin + box_height + vert_spacing + box_height);
    arrowtool.attr({
        strokeWidth: 1,
        stroke: "red"
    });
    
    arrowtoolbox.click(arrowToolSelected);

    for(i = 0; i < 8; i++){
        drops[i] = [];
        for(j = 0; j < 8; j++){
            drops[i][j] = s.rect(left_margin + (i * (box_width + horiz_spacing)), top_margin + (j * (box_height + vert_spacing)), box_width, box_height, corner_radius, corner_radius);
            drops[i][j].attr({
                fill: "#FEFEFE",
                stroke: "#EEEFFF",
                strokeWidth: 2
            });
        }
    }
    for(i = 0; i < 4; i++){
        boxes[i] = s.rect(left_margin + inner_offset, top_margin + inner_offset + (i * 2 * (box_height + horiz_spacing)), box_width - inner_offset - inner_offset, box_height - inner_offset - inner_offset);
        boxes[i].attr({
            fill: "#512888",
            stroke: "#000",
            strokeWidth: 2
        });
        //boxes[i].drag(moveDrag, startDrag, endDrag);
    }
    
    var bbox = s.getBBox();
    document.getElementById("svg").setAttribute("viewBox", "0 0 " + (bbox.width + left_margin + right_margin) + " "  + (bbox.height + top_margin + bot_margin));
    
    updateScale();
    
    addEvent(window, "resize", updateScale);
};

var dragX, dragY, dropX, dropY;

var startDrag = function(x, y){
    if(debug) console.log("Start Drag: " + event + " at " + x + " " + y);
    dragX = this.attr("x");
    dragY = this.attr("y");
    dropX = Math.floor(((x / scale) - left_margin) / (box_width + horiz_spacing));
    dropY = Math.floor(((y / scale) - top_margin) / (box_height + vert_spacing));
    drops[dropX][dropY].attr({
            fill: "#ABCDEF"
    });
};

var endDrag = function(){
    var x = left_margin + inner_offset + (dropX * (box_width + vert_spacing));
    var y = top_margin + inner_offset + (dropY * (box_height + horiz_spacing));
    if(debug) console.log("End drag: " + event + " " + x + " " + y);
    this.animate({x: x, y: y}, 250);
    drops[dropX][dropY].attr({
        fill: "#FEFEFE",
    });
};

var moveDrag = function(dx, dy, x, y){
    if(debug) console.log("Drag: " + dx + " " + dy + " " + x + " " + y);
    this.attr({ 
        x: +dragX + (dx / scale), 
        y: +dragY + (dy / scale)
    });
    var row = Math.floor(((x / scale) - left_margin) / (box_width + horiz_spacing));
    var col = Math.floor(((y / scale) - top_margin) / (box_height + vert_spacing));
    if(row != dropX || col != dropY){
        drops[dropX][dropY].attr({
            fill: "#FEFEFE",
        });
        dropX = row;
        dropY = col;
        drops[dropX][dropY].attr({
            fill: "#ABCDEF"
        });
    }
};

var updateScale = function(){
    var viewBox = document.getElementById("svg").getAttribute("viewBox").split(" ");
    //var height = document.getElementById("svg").height.animVal.value;
    //var width = document.getElementById("svg").width.animVal.value;

    var height = document.getElementById("svg").parentNode.clientHeight;
    var width = document.getElementById("svg").parentNode.clientHeight;
    
    scale = Math.max((width / viewBox[2]), (height / viewBox[3]));
    if(debug) console.log("Scale: " + scale + " " + height + " " + width);
};

var boxToolSelected = function(){
    if(debug) console.log("Box tool selected");
    boxes.forEach(function(element){
        element.drag(moveDrag, startDrag, endDrag);
    });
    boxtool.attr({
        stroke: "#FF0000"
    });
    arrowtoolbox.attr({
        stroke: "000"
    });
};

var arrowToolSelected = function(){
    if(debug) console.log("Arrow tool selected");
    boxes.forEach(function(element){
        element.undrag();
    });
    boxtool.attr({
        stroke: "000"
    });
    arrowtoolbox.attr({
        stroke: "#FF0000"
    });
};

//http://stackoverflow.com/questions/641857/javascript-window-resize-event
var addEvent = function(elem, type, eventHandle) {
    if (elem == null || typeof(elem) == 'undefined') return;
    if ( elem.addEventListener ) {
        elem.addEventListener( type, eventHandle, false );
    } else if ( elem.attachEvent ) {
        elem.attachEvent( "on" + type, eventHandle );
    } else {
        elem["on"+type]=eventHandle;
    }
};
