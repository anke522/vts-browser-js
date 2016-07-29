//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processLineStringPass = function(lineString_, lod_, style_, zIndex_, eventInfo_) {
    var points_ = lineString_["points"] || [];

    if (points_.length == 0) {
        return;
    }

    var line_ = getStylePropertyValue(style_, "line", lineString_, lod_);

    if (line_ == false) {
        return;
    }

    var hoverEvent_ = getStylePropertyValue(style_, "hover-event", lineString_, lod_);
    var clickEvent_ = getStylePropertyValue(style_, "click-event", lineString_, lod_);
    var drawEvent_ = getStylePropertyValue(style_, "draw-event", lineString_, lod_);
    var enterEvent_ = getStylePropertyValue(style_, "enter-event", lineString_, lod_);
    var leaveEvent_ = getStylePropertyValue(style_, "leave-event", lineString_, lod_);

    var zbufferOffset_ = getStylePropertyValue(style_, "zbuffer-offset", lineString_, lod_);

    var lineFlat_ = getStylePropertyValue(style_, "line-flat", lineString_, lod_);
    var lineColor_ = getStylePropertyValue(style_, "line-color", lineString_, lod_);
    var lineWidth_ = 0.5 * getStylePropertyValue(style_, "line-width", lineString_, lod_);

    var lineStyle_ = getStylePropertyValue(style_, "line-style", lineString_, lod_);
    var lineStyleTexture_ = getStylePropertyValue(style_, "line-style-texture", lineString_, lod_);
    var lineStyleBackground_ = getStylePropertyValue(style_, "line-style-background", lineString_, lod_);

    var lineLabel_ = getStylePropertyValue(style_, "line-label", lineString_, lod_);
    var lineLabelSize_ = getStylePropertyValue(style_, "line-label-size", lineString_, lod_);

    if (lineLabel_ == true) {
        var lineLabelPoints_ = new Array(points_.length);
        var lineLabelPoints2_ = new Array(points_.length);
    }

    //console.log("lineflat: "+lineFlat_);
    //var lineWidth_ = Math.pow(2, 23 - lod_) / 32;

    var index_ = 0;
    var index2_ = 0;

    //console.log("lod: " + lod_ + "  width: " + lineWidth_);

    var circleBuffer_ = [];
    var circleBuffer2_ = [];
    var circleSides_ = 8;//Math.max(8, (14 - lod_) * 8);

    var angle_ = 0, step_ = (2.0*Math.PI) / circleSides_;

    for (var i = 0; i < circleSides_; i++) {
        circleBuffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
        circleBuffer2_[i] = angle_;
        angle_ += step_;
    }

    circleBuffer_[circleSides_] = [0, 1.0];
    circleBuffer2_[circleSides_] = 0;


    var p = points_[0];
    var p1 = [p[0], p[1], p[2]];

    if (forceOrigin_ == true) {
        p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
    }

    if (forceScale_ != null) {
        p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
    }

    var texturedLine_ = (lineStyle_ != "solid");

    //allocate buffers
    var lineVertices_ = (texturedLine_ || !lineFlat_ ? 4 : 3) * 3 * 2;
    var joinVertices_ = circleSides_ * (texturedLine_ || !lineFlat_? 4 : 3) * 3;
    var vertexBuffer_ = new Array(points_.length * lineVertices_ + points_.length * joinVertices_);

    if (lineFlat_ == false || texturedLine_ == true) {
        var lineNormals_ = 3 * 4 * 2;
        var joinNormals_ = circleSides_ * 3 * 4;
        var normalBuffer_ = new Array(points_.length * lineNormals_ + points_.length * joinNormals_);
    }

    if (texturedLine_ == true) {
        var joinParams_ = Array(points_.length);
    }

    var dlines_ = false;
    var distance_ = 0.001;
    var distance2_ = 0.001;

    //add lines
    for (var i = 0, li = points_.length - 1; i < li; i++) {

        if (dlines_ == true) {
            var p2 = points_[i+1];
            p2 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];

            if (forceOrigin_ == true) {
                p2 = [p2[0] - tileX_, p2[1] - tileY_, p2[2]];
            }

            if (forceScale_ != null) {
                p2 = [p2[0] * forceScale_[0], p2[1] * forceScale_[1], p2[2] * forceScale_[2]];
            }

        } else {
            p1 = points_[i];
            var p2 = points_[i+1];

            if (forceOrigin_ == true) {
                p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
                p2 = [p2[0] - tileX_, p2[1] - tileY_, p2[2]];
            }

            if (forceScale_ != null) {
                p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
                p2 = [p2[0] * forceScale_[0], p2[1] * forceScale_[1], p2[2] * forceScale_[2]];
            }
        }


        if (lineFlat_ == true && !texturedLine_) {

            //direction vector
            var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

            //get line length
            var l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
            distance2_ += l;

            //normalize vector to line width and rotate 90 degrees
            l = (l != 0) ? (lineWidth_ / l) : 0;
            var n = [-v[1]*l, v[0]*l,0];

            //add polygon
            vertexBuffer_[index_] = p1[0] + n[0];
            vertexBuffer_[index_+1] = p1[1] + n[1];
            vertexBuffer_[index_+2] = p1[2];

            vertexBuffer_[index_+3] = p1[0] - n[0];
            vertexBuffer_[index_+4] = p1[1] - n[1];
            vertexBuffer_[index_+5] = p1[2];

            vertexBuffer_[index_+6] = p2[0] + n[0];
            vertexBuffer_[index_+7] = p2[1] + n[1];
            vertexBuffer_[index_+8] = p2[2];

            //add polygon
            vertexBuffer_[index_+9] = p1[0] - n[0];
            vertexBuffer_[index_+10] = p1[1] - n[1];
            vertexBuffer_[index_+11] = p1[2];

            vertexBuffer_[index_+12] = p2[0] - n[0];
            vertexBuffer_[index_+13] = p2[1] - n[1];
            vertexBuffer_[index_+14] = p2[2];

            vertexBuffer_[index_+15] = p2[0] + n[0];
            vertexBuffer_[index_+16] = p2[1] + n[1];
            vertexBuffer_[index_+17] = p2[2];

            index_ += 18;

        } else {

            //direction vector
            var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

            //get line length
            var l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
            distance2_ += l;

            //console.log("distance("+i+"): " + distance_ + " " + distance2_);

            if (lineFlat_ == true) {

                //normalize vector to line width and rotate 90 degrees
                l = (l != 0) ? (lineWidth_ / l) : 0;
                var n = [-v[1]*l, v[0]*l,0];

                if (joinParams_ != null) {
                    joinParams_[i] = (l != 0) ? Math.atan2(v[0], v[1]) + Math.PI *0.5 : 0;
                }

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = n[0];
                normalBuffer_[index2_+1] = n[1];
                normalBuffer_[index2_+2] = 0;
                normalBuffer_[index2_+3] = lineWidth_;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = -distance_;
                normalBuffer_[index2_+4] = -n[0];
                normalBuffer_[index2_+5] = -n[1];
                normalBuffer_[index2_+6] = 0;
                normalBuffer_[index2_+7] = -lineWidth_;

                vertexBuffer_[index_+8] = p2[0];
                vertexBuffer_[index_+9] = p2[1];
                vertexBuffer_[index_+10] = p2[2];
                vertexBuffer_[index_+11] = distance2_;
                normalBuffer_[index2_+8] = n[0];
                normalBuffer_[index2_+9] = n[1];
                normalBuffer_[index2_+10] = 0;
                normalBuffer_[index2_+11] = lineWidth_;

                //add polygon
                vertexBuffer_[index_+12] = p1[0];
                vertexBuffer_[index_+13] = p1[1];
                vertexBuffer_[index_+14] = p1[2];
                vertexBuffer_[index_+15] = -distance_;
                normalBuffer_[index2_+12] = -n[0];
                normalBuffer_[index2_+13] = -n[1];
                normalBuffer_[index2_+14] = 0;
                normalBuffer_[index2_+15] = -lineWidth_;

                vertexBuffer_[index_+16] = p2[0];
                vertexBuffer_[index_+17] = p2[1];
                vertexBuffer_[index_+18] = p2[2];
                vertexBuffer_[index_+19] = -distance2_;
                normalBuffer_[index2_+16] = -n[0];
                normalBuffer_[index2_+17] = -n[1];
                normalBuffer_[index2_+18] = 0;
                normalBuffer_[index2_+19] = -lineWidth_;

                vertexBuffer_[index_+20] = p2[0];
                vertexBuffer_[index_+21] = p2[1];
                vertexBuffer_[index_+22] = p2[2];
                vertexBuffer_[index_+23] = distance2_;
                normalBuffer_[index2_+20] = n[0];
                normalBuffer_[index2_+21] = n[1];
                normalBuffer_[index2_+22] = 0;
                normalBuffer_[index2_+23] = lineWidth_;

                index_ += 24;
                index2_ += 24;

            } else {

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = p2[0];
                normalBuffer_[index2_+1] = p2[1];
                normalBuffer_[index2_+2] = p2[2];
                normalBuffer_[index2_+3] = lineWidth_;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = -distance_;
                normalBuffer_[index2_+4] = p2[0];
                normalBuffer_[index2_+5] = p2[1];
                normalBuffer_[index2_+6] = p2[2];
                normalBuffer_[index2_+7] = -lineWidth_;

                vertexBuffer_[index_+8] = p2[0];
                vertexBuffer_[index_+9] = p2[1];
                vertexBuffer_[index_+10] = p2[2];
                vertexBuffer_[index_+11] = -distance2_;
                normalBuffer_[index2_+8] = p1[0];
                normalBuffer_[index2_+9] = p1[1];
                normalBuffer_[index2_+10] = p1[2];
                normalBuffer_[index2_+11] = lineWidth_;

                //add polygon
                vertexBuffer_[index_+12] = p1[0];
                vertexBuffer_[index_+13] = p1[1];
                vertexBuffer_[index_+14] = p1[2];
                vertexBuffer_[index_+15] = distance_;
                normalBuffer_[index2_+12] = p2[0];
                normalBuffer_[index2_+13] = p2[1];
                normalBuffer_[index2_+14] = p2[2];
                normalBuffer_[index2_+15] = lineWidth_;

                vertexBuffer_[index_+16] = p2[0];
                vertexBuffer_[index_+17] = p2[1];
                vertexBuffer_[index_+18] = p2[2];
                vertexBuffer_[index_+19] = -distance2_;
                normalBuffer_[index2_+16] = p1[0];
                normalBuffer_[index2_+17] = p1[1];
                normalBuffer_[index2_+18] = p1[2];
                normalBuffer_[index2_+19] = lineWidth_;

                vertexBuffer_[index_+20] = p2[0];
                vertexBuffer_[index_+21] = p2[1];
                vertexBuffer_[index_+22] = p2[2];
                vertexBuffer_[index_+23] = distance2_;
                normalBuffer_[index2_+20] = p1[0];
                normalBuffer_[index2_+21] = p1[1];
                normalBuffer_[index2_+22] = p1[2];
                normalBuffer_[index2_+23] = -lineWidth_;

                index_ += 24;
                index2_ += 24;
            }
        }

        distance_ = distance2_;
        p1 = p2; //only for dlines
    }

    var p1 = [p[0], p[1], p[2]];
    var center_ = [0,0,0];

    var lindex_ = index_; //debug only
    var lindex2_ = index2_; //debug only

    //add joins
    for (var i = 0, li = points_.length; i < li; i++) {

        if (forceOrigin_ == true) {
            p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
        }

        if (forceScale_ != null) {
            p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
        }

        center_[0] += p1[0];
        center_[1] += p1[1];
        center_[2] += p1[2];

        var angleShift_ = (joinParams_ != null) ? joinParams_[i] : 0;

        for (var j = 0; j < circleSides_; j++) {

            if (lineFlat_ == true && !texturedLine_) {

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];

                vertexBuffer_[index_+3] = p1[0] + circleBuffer_[j][0] * lineWidth_;
                vertexBuffer_[index_+4] = p1[1] + circleBuffer_[j][1] * lineWidth_;
                vertexBuffer_[index_+5] = p1[2];

                vertexBuffer_[index_+6] = p1[0] + circleBuffer_[j+1][0] * lineWidth_;
                vertexBuffer_[index_+7] = p1[1] + circleBuffer_[j+1][1] * lineWidth_;
                vertexBuffer_[index_+8] = p1[2];

                index_ += 9;

            } else {

                //distance_ = vertexBuffer_[(i >> 1) * lineVertices_ + ((i & 1) ? 11 : 3)];
                if (i != (li-1)) {
                    distance_ = vertexBuffer_[i * lineVertices_ + 3];
                } else {
                    distance_ = vertexBuffer_[(i - 1) * lineVertices_ + 11];
                }
                //distance_ = vertexBuffer_[((i == li) ? i - 1 : i) * lineVertices_ + 3];

                //if (distance_ == null) {
                  //  debugger
                //}

                //console.log("distance-dot("+i+"): " + distance_);

                //add polygon
                vertexBuffer_[index_] = p1[0];
                vertexBuffer_[index_+1] = p1[1];
                vertexBuffer_[index_+2] = p1[2];
                vertexBuffer_[index_+3] = distance_;
                normalBuffer_[index2_] = 0;
                normalBuffer_[index2_+1] = 0;
                normalBuffer_[index2_+2] = 0;
                normalBuffer_[index2_+3] = 0;

                vertexBuffer_[index_+4] = p1[0];
                vertexBuffer_[index_+5] = p1[1];
                vertexBuffer_[index_+6] = p1[2];
                vertexBuffer_[index_+7] = distance_;
                normalBuffer_[index2_+4] = circleBuffer_[j][0] * lineWidth_;
                normalBuffer_[index2_+5] = circleBuffer_[j][1] * lineWidth_;
                normalBuffer_[index2_+6] = circleBuffer2_[j] + angleShift_;
                normalBuffer_[index2_+7] = 0;

                vertexBuffer_[index_+8] = p1[0];
                vertexBuffer_[index_+9] = p1[1];
                vertexBuffer_[index_+10] = p1[2];
                vertexBuffer_[index_+11] = distance_;
                normalBuffer_[index2_+8] = circleBuffer_[j+1][0] * lineWidth_;
                normalBuffer_[index2_+9] = circleBuffer_[j+1][1] * lineWidth_;
                normalBuffer_[index2_+10] = circleBuffer2_[j+1] + angleShift_;
                normalBuffer_[index2_+11] = 0;

                index_ += 12;
                index2_ += 12;
            }

        }

        if (lineLabel_ == true) {
            var p = [p1[0], p1[1], p1[2] + lineLabelSize_*0.1];
            lineLabelPoints_[i] = p;
            lineLabelPoints2_[li - i - 1] = p;
        }

        if (dlines_ == true) {
            var p2 = points_[i+1];
            p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
        } else {
            p1 = points_[i+1];
        }
    }

    if (li > 0) {
        center_[0] /= li;
        center_[1] /= li;
        center_[2] /= li;
    }

    center_[0] += groupOrigin_[0];
    center_[1] += groupOrigin_[1];
    center_[2] += groupOrigin_[2];

    //debug only
    //if (vertexBuffer_ != null) { vertexBuffer_ = vertexBuffer_.slice(lindex_); }
    //if (normalBuffer_ != null) { normalBuffer_ = normalBuffer_.slice(lindex2_); }

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    var messageData_ = {"command":"addRenderJob", "vertexBuffer": vertexBuffer_,
                        "color":lineColor_, "z-index":zIndex_, "center": center_, "normalBuffer": normalBuffer_,
                        "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                        "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                        "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                        "line-width":lineWidth_*2, "lod":(autoLod_ ? null : tileLod_) };

    if (lineFlat_ == true) {
        messageData_["type"] = (texturedLine_ == true) ? "flat-tline" : "flat-line";
    } else {
        messageData_["type"] = (texturedLine_ == true) ? "pixel-tline" : "pixel-line";
    }

    if (texturedLine_ == true) {
        if (lineStyleTexture_ != null) {
            messageData_["texture"] = [stylesheetBitmaps_[lineStyleTexture_[0]], lineStyleTexture_[1], lineStyleTexture_[2]];
            messageData_["background"] = lineStyleBackground_;
        }
    }

    postMessage(messageData_);

    //debugger
    var lineLabel_ = getStylePropertyValue(style_, "line-label", lineString_, lod_);

    if (lineLabel_ == true) {
        processLineLabel(lineLabelPoints_, lineLabelPoints2_, lineString_, center_, lod_, style_, zIndex_, eventInfo_);
    }

};

var processLineLabel = function(lineLabelPoints_, lineLabelPoints2_, lineString_, center_, lod_, style_, zIndex_, eventInfo_) {
    var labelColor_ = getStylePropertyValue(style_, "line-label-color", lineString_, lod_);
    var labelSource_ = getStylePropertyValue(style_, "line-label-source", lineString_, lod_);
    var labelSize_ = getStylePropertyValue(style_, "line-label-size", lineString_, lod_);
    var labelOffset_ = getStylePropertyValue(style_, "line-label-offset", lineString_, lod_);

    //console.log("label size: " + lod_ + "   " + labelSize_);

    if (labelSource_ == null || labelSource_ == "" || Math.abs(labelSize_) < 0.0001) {
        return;
    }

    var hoverEvent_ = getStylePropertyValue(style_, "hover-event", lineString_, lod_);
    var clickEvent_ = getStylePropertyValue(style_, "click-event", lineString_, lod_);
    var drawEvent_ = getStylePropertyValue(style_, "draw-event", lineString_, lod_);
    var enterEvent_ = getStylePropertyValue(style_, "enter-event", lineString_, lod_);
    var leaveEvent_ = getStylePropertyValue(style_, "leave-event", lineString_, lod_);

    var zbufferOffset_ = getStylePropertyValue(style_, "zbuffer-offset", lineString_, lod_);

    var vertexBuffer_ = [];
    var texcoordsBuffer_ = [];

    //debugger

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    addStreetTextOnPath(lineLabelPoints_, labelSource_, labelSize_, fonts_["default"], labelOffset_, vertexBuffer_, texcoordsBuffer_);
    addStreetTextOnPath(lineLabelPoints2_, labelSource_, labelSize_, fonts_["default"], labelOffset_, vertexBuffer_, texcoordsBuffer_);

    postMessage({"command":"addRenderJob", "type": "line-label", "vertexBuffer": vertexBuffer_,
                  "texcoordsBuffer": texcoordsBuffer_, "color":labelColor_, "z-index":zIndex_, "center": center_,
                  "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                  "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                  "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                  "lod":(autoLod_ ? null : tileLod_) });
};


