/**
 * Flowchart system for K-State Engineering Advising system
 * 
 * @author Russell Feldhausen russfeld@ksu.edu
 * @license none specified; uses Snap.svg.js which is licensed under the Apache License V 2.0
 */

var flowchart = {
    s: {},                  //global snap.svg.js element
    debug: function(text){  //global debugging function
        //comment out the next line to disable debugs, or remove this function def entirely
        console.log("flowchart.js: " + text);
    },            
    
    settings: {             //application drawing settings
        chart: {                  //size settings for drawing flowcharts
            boxHeight: 50,          //flowchart box height
            boxWidth: 100,          //flowchart box width
            horizSpacing: 20,       //horizontal spacing between boxes
            vertSpacing: 20,        //vertical spacing between boxes
            dropBoxOffset: 5,       //how much larger in each direction the drop boxes are
            dropBoxRadius: 5,       //radius of the corners on the drop boxes
            toolboxLeft: 0,         //size of the toolbox at left (calculated at init)
            menuTop: 0,             //size of the menu at the top (calculated at init)
            animationSpeed: 250     //speed of the drop animations
        },
        toolbox: {              //size settings for the toolbox
            toolHeight: 50,         //height of each tool object
            toolWidth: 100,         //width of each tool object
            vertSpacing: 20,        //vertical spacing between tools
            toolRightGutter: 20     //gutter between the toolbox and the flowchart
        },
        viewBoxWidth: 1200,     //height of the resulting SVG image
        viewBoxHeight: 900      //width of the resulting SVG image
    },

    config: {               //user-changeable configuration settings with default values
        drawToolbox: false,     //enable or disable drawing the toolbox (overrides draggable)
        draggable: false,       //enable or disable draggable flowchart boxes   
        gridRows: 8,            //number of rows in the flowchart
        gridCols: 8             //number of columns in the flowchart
    },
    
    data: {                 //essential flowchart data
        boxes: [],              //array of flowchart boxes
        drops: [],              //array of flowchart drop zones
        tools: {                //toolbox tools
            boxTool: {},            //toolbox box tool (for dragging/dropping)
            arrowTool: {}           //toolbox arrow tool (for drawing arrows)
        }
    },
    
    runtime: {              //data stored at runtime only with default values
        scale: 1,               //current scale of the SVG within the frame
        boxSelected: -1,        //array index of current box selected
        dropZoneX: -1,          //x grid coordinate of the current drop zone
        dropZoneY: -1,          //y grid coordinate of the current drop zone
        dragInitialX: -1,       //initial x coordinate of the box being dragged
        dragInitialY: -1,       //initial y coordinate of the box being dragged
        boundingBox: {}         //variable to store the flowchart's bounding box for drag checks
    },
    
    /**
     * Function to initialize the Flowchart application
     * 
     * @param {string} element - A CSS ID representing the SVG DOM element to be used
     * @param {object} overrideConfig - an object containing properties to be overridden at runtime 
     * (see flowchart.config above for settings that can be overridden this way)
     */
    init: function(element, overrideConfig){
        //create a new SVG element and set attributes
        var svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElem.setAttribute("id", "svg");
        //svgElem.setAttribute("height", "100%");
        svgElem.setAttribute("width", "100%");

        //get the parent container
        var parent = document.getElementById(element);

        //append the new SVG element within that element
        parent.appendChild(svgElem);

        //Initialize snap.svg.js
        flowchart.s = Snap("#svg");

        //Add the global flowchart CSS class to the new SVG element
        flowchart.s.addClass("flowchart");

        //override default configuration with provided configuration
        if(overrideConfig !== undefined){
            for(var property in overrideConfig){
                //check to see if property is not inherited
                if(overrideConfig.hasOwnProperty(property)){
                    flowchart.config[property] = overrideConfig[property];
                }
            }
        }

        //draw toolbox if needed
        if(flowchart.config.drawToolbox){
            flowchart.ops.drawToolbox();
        }

        //draw the drop zones
        flowchart.ops.drawDropZones();

        //draw the flowchart boxes
        flowchart.ops.drawFlowchartBoxes();

        //update the viewBox now that the SVG has been drawn
        flowchart.utils.updateViewBox();

        //calculate the new scaling value
        flowchart.utils.updateScale();

        //register an event handler on window resize to update the scale value accordingly
        flowchart.utils.addEvent(window, "resize", flowchart.utils.updateScale);
    },

    //Class Definitions
    classes: {
        /**
         * Class for representing boxes (classes) on the flowchart
         */
        flowchartBox: function(){
            this.flowX = -1;            //x coordinate of the box on the grid (not pixels)
            this.flowY = -1;            //y coordinate of the box on the grid (not pixels)
            this.flowID = -1;           //position of the object in the data array
            this.svgElem = {};          //svg element of the box within the image
        }
    },

    //Event handlers
    handlers: {
        /**
         * Function for selecting the box tool. It will enable drag/drop for the boxes on the flowchart
         * and highlight that box.
         */
        boxToolSelected: function(){
            flowchart.debug("boxTool selected");

            //unlink any previous click or drag events and enable dragging
            flowchart.data.boxes.forEach(function(element){
                element.svgElem.unclick();
                element.svgElem.undrag();
                element.svgElem.drag(
                    flowchart.handlers.boxToolDragMove,         //move action handler
                    flowchart.handlers.boxToolDragStart,        //start drag action handler
                    flowchart.handlers.boxToolDragEnd,          //end drag action handler (release)
                    element,                                    //move action context
                    element,                                    //start action context
                    element);                                   //end action context
            });

            //remove the selected class from all items on the flowchart
            flowchart.utils.removeClassFromAll("selected");

            //add the selected class to the boxTool
            flowchart.data.tools.boxTool.addClass("selected");
        },

        /**
         * Function to move flowchart boxes as the mouse moves
         *
         * @param {int} dx - how far the object has moved in the x direction
         * @param {int} dy - how far the object has moved in the y direction
         * @param {int} x - current x position of the object being moved
         * @param {int} y - current y position of the object being moved
         */
        boxToolDragMove: function(dx, dy, x, y){
            flowchart.debug("boxTool dragging box " + dx + "," + dy + " to " + x + "," + y);

            //calculate the new X position bounded by the toolbox and the edge
            var newX = flowchart.utils.bound(
                +flowchart.runtime.dragInitialX + (dx / flowchart.runtime.scale), 
                flowchart.settings.chart.toolboxLeft, 
                flowchart.runtime.boundingBox.width);

            //calculate the new Y position bounded by the menu and the edge
            var newY = flowchart.utils.bound(
                +flowchart.runtime.dragInitialY + (dy / flowchart.runtime.scale), 
                flowchart.settings.chart.menuTop,
                flowchart.runtime.boundingBox.height);

            //move the object to the current mouse position
            this.svgElem.attr({ 
                x: newX, 
                y: newY
            });

            //highlight the appropriate drop zone
            flowchart.utils.highlightDrop(x, y);
        },

        /**
         * Function to start dragging a flowchart box
         * 
         * @param {int} x - the x position of the item when first clicked
         * @param {int} y - the y position of the item when first clicked
         */
        boxToolDragStart: function(x, y){
            flowchart.debug("boxTool start dragging box at " + x + "," + y);

            //store the initial position in runtime variables
            flowchart.runtime.dragInitialX = this.svgElem.attr("x");
            flowchart.runtime.dragInitialY = this.svgElem.attr("y");

            flowchart.utils.highlightDrop(x, y);
        },

        /**
         * Function called when a dragged box is released. It will settle the box on the current drop zone
         */
        boxToolDragEnd: function(){
            flowchart.debug("boxTool end dragging");

            //drop the current object on the drop zone
            flowchart.utils.animateToDropZone(this);
            
            //clear the highlighted drop zone
            flowchart.utils.highlightDropClear();
        },

        /**
         * Function for selecting the arrow tool. It will enable users to click successive boxes
         * and create flowchart arrows between them
         */
        arrowToolSelected: function(){
            flowchart.debug("arrowTool selected");

            //unlink any previous click or drag events and enable clicking
            flowchart.data.boxes.forEach(function(element){
                element.svgElem.unclick();
                element.svgElem.undrag();
                element.svgElem.click(flowchart.handlers.arrowToolClick);
            });

            //remove the selected class from all items on the flowchart
            flowchart.utils.removeClassFromAll("selected");

            //add the selected class to the boxTool
            flowchart.data.tools.arrowTool.addClass("selected");

            //clear selected box variable
            flowchart.runtime.boxSelected = -1;
        },

        /**
         * This function is called when a user clicks a box while the arrow tool is selected.
         * The first box clicked will be highlighted, the second box clicked will cause
         * an arrow to be created between the boxes
         */
        arrowToolClick: function(){
            var fromBox;
            //If a box is already selected, draw an arrow between the two boxes
            if(boxSelected > 0){
                fromBox = flowchart.data.boxes[boxSelected];
                flowchart.debug("drawing arrow from box at " + fromBox.flow_x + "," + fromBox.flow_y + 
                    " to box at " + this.flow_x + "," + this.flow_y);
            //if no box is selected, select the current one
            }else{
                flowchart.debug("arrowTool selecting box at " + this.flow_x + "," + this.flow_y);
                boxSelected = this.flow_id;
            }
        }


    },
    
    //main operations and functions
    ops: {                  
        /**
         * Function to draw the toolbox used for creating the flowcharts on the left side of the flowchart window
         */
        drawToolbox: function(){
            //Alias for the flowchart settings area for code readability
            var fst = flowchart.settings.toolbox;

            //Box tool
            flowchart.data.tools.boxTool = flowchart.s.rect(
                0, 0, 
                fst.toolWidth, fst.toolHeight);
            flowchart.data.tools.boxTool.addClass("boxTool");

            //Arrow Tool
            flowchart.data.tools.arrowTool = flowchart.s.rect(
                0, fst.toolHeight + fst.vertSpacing, 
                fst.toolWidth, fst.toolHeight);
            flowchart.data.tools.arrowTool.addClass("arrowTool");

            //Arrow Tool Line
            flowchart.s.polyline(
                0, fst.toolHeight + fst.vertSpacing, 
                fst.toolWidth, fst.toolHeight + fst.vertSpacing + fst.toolHeight)
                .addClass("arrowToolLine");

            //Bind click handlers
            flowchart.data.tools.boxTool.click(flowchart.handlers.boxToolSelected);
            flowchart.data.tools.arrowTool.click(flowchart.handlers.arrowToolSelected);

            //update size settings
            flowchart.settings.chart.toolboxLeft = fst.toolWidth + fst.toolRightGutter;
        },

        /**
         * Function to draw the drop zone boxes on the flowchart
         */
         drawDropZones: function(){
            //Alias for the flowchart settings for code readability
            var fsc = flowchart.settings.chart;

            //iterator variables
            var i, j;

            for(i = 0; i < flowchart.config.gridRows; i++){
                //initialize each row of the drops array
                flowchart.data.drops[i] = [];

                for(j = 0; j < flowchart.config.gridCols; j++){
                    flowchart.data.drops[i][j] = flowchart.s.rect(
                        fsc.toolboxLeft + (i * (fsc.boxWidth + fsc.horizSpacing)), fsc.menuTop + (j * (fsc.boxHeight + fsc.vertSpacing)), 
                        fsc.boxWidth, fsc.boxHeight, 
                        fsc.dropBoxRadius, fsc.dropBoxRadius);
                    flowchart.data.drops[i][j].addClass("dropZone");
                }
            }
        },

        /**
         * Function to draw the flowchart boxes on the flowchart
         */
         drawFlowchartBoxes: function(){
            //Alias for the flowchart settings for code readability
            var fsc = flowchart.settings.chart;

            //iterator variables
            var i;

            //for now, draw 4 boxes for testing
            for(i = 0; i < 4; i++){
                flowchart.data.boxes[i] = new flowchart.classes.flowchartBox();
                flowchart.data.boxes[i].svgElem = flowchart.s.rect(
                    fsc.toolboxLeft + fsc.dropBoxOffset, fsc.menuTop + fsc.dropBoxOffset + (i * 2 * (fsc.boxHeight + fsc.horizSpacing)), 
                    fsc.boxWidth - fsc.dropBoxOffset - fsc.dropBoxOffset, fsc.boxHeight - fsc.dropBoxOffset - fsc.dropBoxOffset);
                flowchart.data.boxes[i].svgElem.addClass("box");

                //update variables for the location of the box in the grid, and its ID
                flowchart.data.boxes[i].flowX = 0;
                flowchart.data.boxes[i].flowY = 2 * i;
                flowchart.data.boxes[i].flowID = i;

                //add a variable to the SVG element attributes to help with tracking it in click handlers
                flowchart.data.boxes[i].svgElem.flowID = i;
            }
         }
    },

    //utility functions
    utils: {
        /**
         * This function will remove the given CSS class from ALL objects in the flowchart
         */
         removeClassFromAll: function(classCSS){
            //remove the given class from any flowchart elements
            flowchart.s.selectAll("." + classCSS).forEach(function(element) {
                element.removeClass(classCSS);
            });
        },

        /**
         * Highlights drop zones as we hover over them
         * 
         * @param {int} x - the x position of our hover object
         * @param {int} y - the y position of our hover object
         */
         highlightDrop: function(x, y){
            //Alias for the flowchart settings & runtime for code readability
            var fsc = flowchart.settings.chart;
            var fr = flowchart.runtime;

            //calculate the row and column of the drop zone
            var row = Math.floor(((x / fr.scale) - fsc.toolboxLeft) / (fsc.boxWidth + fsc.horizSpacing));
            var col = Math.floor(((y / fr.scale) - fsc.menuTop) / (fsc.boxHeight + fsc.vertSpacing));

            //check to see if we need to change, if not, don't update DOM (for speed)
            if(row != fr.dropZoneX || col != fr.dropZoneY){
                //remove hover class from previous drop zone if it is valid
                flowchart.utils.highlightDropClear();

                //make sure drop zone is valid
                if(row >= 0 && row <= flowchart.config.gridRows && col >= 0 && col <= flowchart.config.gridCols){
                    //update to new drop zone
                    fr.dropZoneX = row;
                    fr.dropZoneY = col;

                    //add hover class to new drop zone
                    flowchart.data.drops[fr.dropZoneX][fr.dropZoneY].addClass("hover");
                }else{
                    //clear drop done to invalid values
                    fr.dropZoneX = -1;
                    fr.dropZoneY = -1;
                }
            }
        },

        /**
         * Clears the currently highlighted drop zone
         */
        highlightDropClear: function(){
            //Alias for the flowchart runtime for code readability
            var fr = flowchart.runtime;
            if(fr.dropZoneX >= 0 && fr.dropZoneY >= 0){
                flowchart.data.drops[fr.dropZoneX][fr.dropZoneY].removeClass("hover");
            }
        },

        /**
         * Gets the real x & y pixel coordinates of the current drop zone
         * 
         * @param {flowchartBox Object} element - the element to be animated
         */
        animateToDropZone: function(element){
            //Alias for the flowchart settings & runtime for code readability
            var fsc = flowchart.settings.chart;
            var fr = flowchart.runtime;

            //check to see if new drop zone coordinates are valid
            if(fr.dropZoneX >= 0 && fr.dropZoneY >= 0){

                //Calcuate x and y coordinates of the drop zone
                var x = fsc.toolboxLeft + fsc.dropBoxOffset + (fr.dropZoneX * (fsc.boxWidth + fsc.vertSpacing));
                var y = fsc.menuTop + fsc.dropBoxOffset + (fr.dropZoneY * (fsc.boxHeight + fsc.horizSpacing));

                //animate the element to those coordinates
                element.svgElem.animate({x: x, y: y}, fsc.animationSpeed);

                            //update the position of the current element
                element.flowX = flowchart.runtime.dropZoneX;
                element.flowY = flowchart.runtime.dropZoneY;
            }else{
                //Calcuate x and y coordinates of the drop zone
                var x = fsc.toolboxLeft + fsc.dropBoxOffset + (element.flowX * (fsc.boxWidth + fsc.vertSpacing));
                var y = fsc.menuTop + fsc.dropBoxOffset + (element.flowY * (fsc.boxHeight + fsc.horizSpacing));

                //animate the element to those coordinates
                element.svgElem.animate({x: x, y: y}, fsc.animationSpeed);
            }
        },

         /**
          * This function updates the scale variable as the flowchart SVG element is resized
          */
        updateScale: function(){
            //get the value of the SVG element's viewbox
            var viewBox = document.getElementById("svg").getAttribute("viewBox").split(" ");

            var height = document.getElementById("svg").parentNode.clientHeight;
            var width = document.getElementById("svg").parentNode.clientHeight;
            
            flowchart.runtime.scale = Math.max((width / viewBox[2]), (height / viewBox[3]));
            flowchart.debug("scale updated to " + flowchart.runtime.scale + " based on dimensions " + width + "x" + height);
        },

        /**
         * This function updates the SVG viewbox to match the bounding box of the SVG itself
         */
        updateViewBox: function(){
            flowchart.runtime.boundingBox = flowchart.s.getBBox();
            document.getElementById("svg").setAttribute("viewBox", "0 0 " + flowchart.runtime.boundingBox.width + " "  + flowchart.runtime.boundingBox.height);
        },

        /**
         * This function attaches an event handler safely (based on how JQuery does it)
         * @see http://stackoverflow.com/questions/641857/javascript-window-resize-event
         * 
         * @param {DOM Element} elem - the element to attach to
         * @param {string} type - the type of event to attach to
         * @param {function} eventHandle - the event handler function to be called
         */
        addEvent: function(elem, type, eventHandle) {
            if (elem === null || typeof(elem) == 'undefined'){
                return;
            }
            if ( elem.addEventListener ) {
                elem.addEventListener( type, eventHandle, false );
            } else if ( elem.attachEvent ) {
                elem.attachEvent( "on" + type, eventHandle );
            } else {
                elem["on"+type]=eventHandle;
            }
        },

        /**
         * This function bounds a value by a minimum and maximum value
         */
        bound: function(value, min, max){
            if(value < min) return min;
            if(value > max) return max;
            return value;
        }
    }
};

window.onload = function() {
    flowchart.init("svgcont", {
        drawToolbox: true
    });
};
