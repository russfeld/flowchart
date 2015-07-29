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
            animationSpeed: 100     //speed of the drop animations
        },
        toolbox: {              //size settings for the toolbox
            toolHeight: 50,         //height of each tool object
            toolWidth: 100,         //width of each tool object
            vertSpacing: 20,        //vertical spacing between tools
            toolRightGutter: 20     //gutter between the toolbox and the flowchart
        },
        forces: {               //constants used in the force-directed line spacing algorithm
            c1: 1,                  //scale of the force magnitude between lines
            c2: 20,                 //numerator of the force division between lines (distance must be less than this this to trigger a force), recommend using horizSpacing from above
            c3: 0.1,                //scale of the overall force applied as movement
            c4: 0.01,               //scale of the force applied based on direction of attached lines
            c5: 900,                //numerator of the force division based on attached lines (distance must be less than this to trigger a force)
            c6: 0.5,                //scale of the force applied based on the channels                 
            c7: 15,                 //numerator of the force division based on attached lines (distance must be less than this to trigger a force)
            t: 1                    //the maximum force must be at least this high to trigger another iteration
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
        lines: [],              //array of flowchart lines
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

        //draw any needed prereq lines
        flowchart.ops.drawFlowchartLines();

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
            this.lines = [];            //array of lines connecting to this object
        },

        /**
         * Class for representing lines (prerequisite arrows) on the flowchart
         */
        flowchartLine: function(){
            this.startBoxID = -1;       //the ID of the flowchart box at the start of the line
            this.endBoxID = -1;         //the ID of the flowchart box at the end of the line
            this.firstX = -1;           //the X coorindate of the side of the first box
            this.startX = -1;           //the X coordinate of the starting point
            this.startY = -1;           //the Y coordinate of the starting point
            this.mainY = -1;            //the Y coordinate of the main line
            this.endX = -1;             //the X coordinate of the ending point
            this.endY = -1;             //the Y coordinate of the ending point
            this.lastX = -1;            //the X coordinate of the side of the last box
            this.flowID = -1;           //the position of this line within the data array
            this.svgElem = {};          //svg element of this line within the image
            this.mainForce = 0;         //force acting on the main line for force directed drawing
            this.startForce = 0;        //force acting on the starting line for force directed drawing
            this.endForce = 0;          //force acting on the ending line for force directed drawing
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
            for(i = 0; i < 8; i++){
                flowchart.data.boxes[i] = new flowchart.classes.flowchartBox();
                flowchart.data.boxes[i].svgElem = flowchart.s.rect(
                    fsc.toolboxLeft + fsc.dropBoxOffset + (i * (fsc.boxWidth + fsc.horizSpacing)), fsc.menuTop + fsc.dropBoxOffset + (2 * (fsc.boxHeight + fsc.horizSpacing)), 
                    fsc.boxWidth - fsc.dropBoxOffset - fsc.dropBoxOffset, fsc.boxHeight - fsc.dropBoxOffset - fsc.dropBoxOffset);
                flowchart.data.boxes[i].svgElem.addClass("box");

                //update variables for the location of the box in the grid, and its ID
                flowchart.data.boxes[i].flowX = 0;
                flowchart.data.boxes[i].flowY = 2 * i;
                flowchart.data.boxes[i].flowID = i;

                //add a variable to the SVG element attributes to help with tracking it in click handlers
                flowchart.data.boxes[i].svgElem.flowID = i;
            }
        },

        /**
         * This function will update a line to connect with its flowchart boxes after being created or moved
         *
         * @param line (flowchartLine object) - the line to be updated
         */
        updateLine: function(line){
            //get bounding boxes for each box
            var bbox1 = flowchart.data.boxes[line.startBoxID].svgElem.getBBox();
            var bbox2 = flowchart.data.boxes[line.endBoxID].svgElem.getBBox();

            //alias
            var fsc = flowchart.settings.chart;

            //set line points
            line.firstX = bbox1.x2;
            line.startX = bbox1.x2 + fsc.dropBoxOffset + (fsc.horizSpacing / 3);
            line.startY = bbox1.cy;
            line.endX = bbox2.x - fsc.dropBoxOffset - (fsc.horizSpacing / 3);
            line.endY = bbox2.cy;
            line.lastX = bbox2.x;

            //determine initial direction of line
            if(line.startY < line.endY){ //if the starting box is above the ending box, go below
                line.mainY = bbox1.y2 + fsc.dropBoxOffset + (fsc.vertSpacing / 2);
            }else{ //if not, go above
                line.mainY = bbox1.y - fsc.dropBoxOffset - (fsc.vertSpacing / 2);
            }

            flowchart.ops.setLineAttrs(line);
        },

        /**
         * This function will update the attributes of the current line to match the coordinates given
         *
         * @param line {flowchartLine object} - the line to be updated
         */
        setLineAttrs: function(line){
            line.svgElem.attr({points: [
                line.firstX, line.startY, 
                line.startX, line.startY, 
                line.startX, line.mainY, 
                line.endX, line.mainY, 
                line.endX, line.endY, 
                line.lastX, line.endY
                ]});
        },

        /**
         * Function to create a line between the boxes given on the flowchart
         * 
         * @param box1 {flowchartBox object} - the source flowchart box
         * @param box2 {flowchartBox object} - the destination flowchart box
         */
        createLine: function(box1, box2){
            //variables
            var line = new flowchart.classes.flowchartLine();
            
            //set IDs of each box in the line object
            line.startBoxID = box1.flowID;
            line.endBoxID = box2.flowID;
            line.svgElem = flowchart.s.polyline();
            line.svgElem.addClass("line");

            flowchart.ops.updateLine(line);

            //add line to data storage areas
            line.flowID = flowchart.data.lines.length;
            box1.lines.push(line);
            box2.lines.push(line);
            flowchart.data.lines.push(line);

            return line;
        },

        /**
         * Function to create flowchart prerequisite lines
         *
         */
        drawFlowchartLines: function(){
            var i;

            //for now, draw lines between varying flowchart boxes as a test
            flowchart.ops.createLine(flowchart.data.boxes[7], flowchart.data.boxes[0]);
            flowchart.ops.createLine(flowchart.data.boxes[0], flowchart.data.boxes[6]);
            flowchart.ops.createLine(flowchart.data.boxes[6], flowchart.data.boxes[1]);
            flowchart.ops.createLine(flowchart.data.boxes[1], flowchart.data.boxes[5]);
            flowchart.ops.createLine(flowchart.data.boxes[5], flowchart.data.boxes[2]);
            flowchart.ops.createLine(flowchart.data.boxes[2], flowchart.data.boxes[4]);
            flowchart.ops.createLine(flowchart.data.boxes[4], flowchart.data.boxes[3]);

            flowchart.ops.flowchartLineSpacing();
        },

        /**
         * Function to automatically space the flowchart lines to prevent run-ins
         */
        flowchartLineSpacing: function(){
            var i, j, k, distance, force, chanTop, chanBot;
            var maxForce = 0;
            var fdl = flowchart.data.lines;
            var fsf = flowchart.settings.forces;

            //number of iterations to attempt to reach equilibrium
            for(k = 0; k < 50; k++){
                maxForce = 0;

                for(i = 0; i < fdl.length; i++){

                    //add minor forces for overall direction of arrow to main line if possible
                    if(fdl[i].startY > fdl[i].mainY){
                        distance = fdl[i].startY - fdl[i].mainY;
                        force = Math.max(fsf.c4 * Math.log(fsf.c5 / distance), 0);
                        fdl[i].mainForce += force;
                    }else{
                        distance = fdl[i].mainY - fdl[i].startY;
                        force = Math.max(fsf.c4 * Math.log(fsf.c5 / distance), 0);
                        fdl[i].mainForce -= force;
                    }
                    if(fdl[i].endY > fdl[i].mainY){
                        distance = fdl[i].endY - fdl[i].mainY;
                        force = Math.max(fsf.c4 * Math.log(fsf.c5 / distance), 0);
                        fdl[i].mainForce += force;
                    }else{
                        distance = fdl[i].mainY - fdl[i].endY;
                        force = Math.max(fsf.c4 * Math.log(fsf.c5 / distance), 0);
                        fdl[i].mainForce -= force;
                    }

                    //deal with channel forces by finding the channels for the y direction
                    chanTop = flowchart.settings.chart.menuTop + flowchart.settings.chart.boxHeight;
                    chanBot = flowchart.settings.chart.menuTop + flowchart.settings.chart.boxHeight + flowchart.settings.chart.vertSpacing;

                    while(!(fdl[i].mainY >= chanTop - (flowchart.settings.chart.boxHeight / 2) && fdl[i].mainY <= chanBot + (flowchart.settings.chart.boxHeight / 2))){
                       chanTop += flowchart.settings.chart.boxHeight + flowchart.settings.chart.vertSpacing;
                       chanBot += flowchart.settings.chart.boxHeight + flowchart.settings.chart.vertSpacing;
                    }

                    //top of the channel
                    distance = fdl[i].mainY - chanTop + 1;
                    //line jumped the channel, needs to move up a channel
                    if(distance <= 0){
                        fdl[i].mainY -= flowchart.settings.chart.boxHeight;
                        flowchart.debug("Iteration " + k + ": jumped line " + i + " up a channel to " + fdl[i].mainY);
                        fdl[i].mainForce = 0;
                        continue;
                    }
                    force = Math.max(fsf.c6 * Math.log(fsf.c7 / distance), 0);
                    fdl[i].mainForce += force;

                    //bottom of the channel
                    distance = chanBot - fdl[i].mainY  + 1;
                    //line jumped the channel, needs to move down a channel
                    if(distance <= 0){
                        fdl[i].mainY += flowchart.settings.chart.boxHeight;
                        flowchart.debug("Iteration " + k + ": jumped line " + i + " down a channel to " + fdl[i].mainY);
                        fdl[i].mainForce = 0;
                        continue;
                    }
                    force = Math.max(fsf.c6 * Math.log(fsf.c7 / distance), 0);
                    fdl[i].mainForce -= force;

                    //TODO: channel forces for starting & ending lines

                    //compare to each additional arrow
                    for(j = i+1; j < fdl.length; j++){

                        //mainY lines
                        if(flowchart.utils.linesOverlap(fdl[i].startX, fdl[i].endX, fdl[j].startX, fdl[j].endX)){
                            force = flowchart.ops.compareLines(fdl[i], fdl[j], "mainY", "mainY", "mainForce", "mainForce");
                            maxForce = force > maxForce ? force : maxForce;
                        }

                        //startX and startX
                        if(flowchart.utils.linesOverlap(fdl[i].startY, fdl[i].mainY, fdl[j].startY, fdl[j].mainY)){
                            force = flowchart.ops.compareLines(fdl[i], fdl[j], "startX", "startX", "startForce", "startForce");
                            maxForce = force > maxForce ? force : maxForce;
                        }

                        //startX and endX
                        if(flowchart.utils.linesOverlap(fdl[i].startY, fdl[i].mainY, fdl[j].endY, fdl[j].mainY)){
                            force = flowchart.ops.compareLines(fdl[i], fdl[j], "startX", "endX", "startForce", "endForce");
                            maxForce = force > maxForce ? force : maxForce;
                        }

                        //endX and startX
                        if(flowchart.utils.linesOverlap(fdl[i].endY, fdl[i].mainY, fdl[j].startY, fdl[j].mainY)){
                            force = flowchart.ops.compareLines(fdl[i], fdl[j], "endX", "startX", "endForce", "startForce");
                            maxForce = force > maxForce ? force : maxForce;
                        }

                        //endX and endX
                        if(flowchart.utils.linesOverlap(fdl[i].endY, fdl[i].mainY, fdl[j].endY, fdl[j].mainY)){
                            force = flowchart.ops.compareLines(fdl[i], fdl[j], "endX", "endX", "endForce", "endForce");
                            maxForce = force > maxForce ? force : maxForce;
                        }

                    }

                    //update the coordinates based on the force applied
                    fdl[i].mainY = +fdl[i].mainY + (+fsf.c3 * fdl[i].mainForce);
                    fdl[i].startX = +fdl[i].startX + (+fsf.c3 * fdl[i].startForce);
                    fdl[i].endX = +fdl[i].endX + (+fsf.c3 * fdl[i].endForce);
                    flowchart.ops.setLineAttrs(fdl[i]);
                    flowchart.debug("Iteration " + k + ": moved line " + i + " to " + fdl[i].startX + "," + fdl[i].mainY + "," + fdl[i].endX);
                    fdl[i].mainForce = 0;
                    fdl[i].startForce = 0;
                    fdl[i].endForce = 0;
                }

                //if none of the forces were larger than the threshhold, stop trying and lock them in place
                if(maxForce < fsf.t){
                    break;
                }
            }
        },

        /**
         * Function to compare lines for force directed drawing. This helps minimize 
         * the code in the flowchartLineSpacing function above 
         *
         * @param line1 {flowchartLine object} - the first line to compare
         * @param line2 {flowchartLine object} - the second line to compare
         * @param prop1 {flowchartLine property name as a string} - the property of the first line to use
         * @param prop2 {flowchartLine property name as a string} - the property of the second line to use
         * @param force1 {flowchartLine property name as a string} - the property of the first line to update
         * @param force2 {flowchartLine property name as a string} - the property of the second line to update
         * @return {float} - the calculated force value
         */
        compareLines: function(line1, line2, prop1, prop2, force1, force2){
            var force, distance;
            var fsf = flowchart.settings.forces;
            //check to see if they are close enough to matter
            if(Math.abs(line1[prop1] - line2[prop2]) <= fsf.c2){

                //if so, figure out which one is greatest
                if(line1[prop1] > line2[prop2]){
                    distance = line1[prop1] - line2[prop2] + 0.1;
                    force = Math.max(fsf.c1 * Math.log(fsf.c2 / distance), 0);
                    line1[force1] += force;
                    line2[force2] -= force;
                }else{
                    distance = line2[prop2] - line1[prop1] + 0.1;
                    force = Math.max(fsf.c1 * Math.log(fsf.c2 / distance), 0);
                    line1[force1] -= force;
                    line2[force2] += force;
                }
                return force
            }

            return 0;
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
         * Determine if lines overlap
         *
         * @param x1 {float} - the first point of the first line
         * @param y1 {float} - the second point of the first line
         * @param x2 {float} - the first point of the second line
         * @param y2 {float} - the second point of the second line
         * @return {boolean} - if the lines overlap
         */
        linesOverlap: function(x1, y1, x2, y2){
            var start1, end1, start2, end2;
            if(x1 < y1){
                start1 = x1;
                end1 = y1;
            }else{
                start1 = y1;
                end1 = x1;
            }
            if(x2 < y2){
                start2 = x2;
                end2 = y2;
            }else{
                start2 = y2;
                end2 = x2;
            }
            if(start1 <= start2 && end1 + flowchart.settings.forces.c2 >= start2){
                return true;
            }
            if(start2 <= start1 && end2 + flowchart.settings.forces.c2 >= start1){
                return true;
            }
            return false;
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
                if(row >= 0 && row < flowchart.config.gridRows && col >= 0 && col < flowchart.config.gridCols){
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

            //clear variables
            fr.dropZoneX = -1;
            fr.dropZoneY = -1;
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
                element.svgElem.animate({x: x, y: y}, fsc.animationSpeed, mina.linear, function(){
                    flowchart.utils.updateLines(element);
                });

                //update the position of the current element
                element.flowX = flowchart.runtime.dropZoneX;
                element.flowY = flowchart.runtime.dropZoneY;
            }else{
                //Calcuate x and y coordinates of the drop zone
                var x = fsc.toolboxLeft + fsc.dropBoxOffset + (element.flowX * (fsc.boxWidth + fsc.vertSpacing));
                var y = fsc.menuTop + fsc.dropBoxOffset + (element.flowY * (fsc.boxHeight + fsc.horizSpacing));

                //animate the element to those coordinates
                element.svgElem.animate({x: x, y: y}, fsc.animationSpeed, mina.linear, function(){
                    flowchart.utils.updateLines(element);
                });
            }
        },

        /**
         * Helper function to update lines attached to a box after it has been animated into place
         *
         * @param box {flowchatBox object} - the box attached to the lines to be animated
         */
        updateLines: function(box){
            flowchart.debug("Updating lines after move");
            
            //update any lines attached to the box
            flowchart.data.lines.forEach(function(element){
                flowchart.ops.updateLine(element);
            });

            //use force directed spacing to arrange the lines
            flowchart.ops.flowchartLineSpacing();
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
//# sourceMappingURL=flowchart.js.map