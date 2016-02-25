/**
 * @constructor
 */
Melown.MapTree = function(map_, divisionNode_, freeLayer_) {
    this.map_ = map_;
    this.camera_ = map_.camera_;
    this.rootId_ = divisionNode_.id_;
    this.divisionNode_ = divisionNode_;
    this.freeLayer_ = freeLayer_;
    this.metaBinaryOrder_ = this.map_.referenceFrame_.params_.metaBinaryOrder_;
    this.initialized_ = false;

    this.surfaceTree_ = new Melown.MapTile(this.map_, null, this.rootId_);
    this.metastorageTree_ = new Melown.MapMetastorage(this.map_, null, this.rootId_);

    this.surfaceTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceTile.bind(this), this.traceChildSequenceBasic.bind(this));

    //this.renderTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceRenderTile.bind(this));

    if (freeLayer_ != true) {
        this.heightTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceTileHeight.bind(this), this.traceHeightChild.bind(this));
        this.heightTracerNodeOnly_ = new Melown.MapMetanodeTracer(this, null, this.traceTileHeightNodeOnly.bind(this), this.traceHeightChild.bind(this));
    }

    this.config_ = this.map_.config_;
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = 1.0;
    this.counter_ = 0;
};

Melown.MapTree.prototype.kill = function() {
    this.surfaceTree_ = null;
    this.metastorageTree_ = null;
    this.surfaceTracer_ = null;
    this.heightTracer_ = null;
};

Melown.MapTree.prototype.init = function() {
    var url_ = this.map_.makeUrl(surface.metaUrl_, {lod_:result_[0], ix_:result_[1], iy_:result_[2] });
    map_.loader_.load(url_, metatile_.load_.bind(metatile_, url_));

    this.metatileTree_.load();
    this.surfaceTree_.metatile_ = 1;

    this.initialized_ = true;
};

Melown.MapTree.prototype.draw = function() {
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = this.map_.ndcToScreenPixel_;

    var divisionNode_ = this.divisionNode_;
    var periodicity_ = divisionNode_.srs_.periodicity_;

    if (periodicity_ != null) {
        this.drawSurface([0,0,0]);
        this.renderSurface([0,0,0]);

        if (periodicity_.type_ == "X") {
            this.drawSurface([periodicity_.period_,0,0]);
            this.drawSurface([-periodicity_.period_,0,0]);
        }

    } else {
        this.drawSurface([0,0,0]);
        this.renderSurface([0,0,0]);
    }
};

Melown.MapTree.prototype.drawSurface = function(shift_) {
    this.counter_++;
    this.surfaceTracer_.trace(this.rootId_);
};

Melown.MapTree.prototype.renderSurface = function(shift_) {
    //this.renderTracer_.trace(this.rootId_);
};

Melown.MapTree.prototype.traceChildSequenceBasic = function(tile_, params_, res_) {
    return [0,1,2,3];
};

Melown.MapTree.prototype.traceTile = function(tile_, params_, preventRedener_, preventLoad_) {
    if (tile_ == null || tile_.metanode_ == null) {
        return [false, preventRedener_, preventLoad_];
    }

    var node_ = tile_.metanode_;
    var cameraPos_ = this.map_.cameraPosition_;

    var log2_ = false; //this.map_.drawBBoxes_;        

    if (log2_) {
        console.log("--------------------------------------------");
        console.log("draw-tile: id: " + JSON.stringify(node_.id_));
        console.log("surafce: id: " + tile_.surface_.id_);
        
        var vs = tile_.virtualSurfaces_;
        var s = "";
        for (var i = 0, li = vs.length; i < li; i++) {
            s += vs[i].id_ + "|";
        }
        
        console.log("bbox: " + JSON.stringify(node_.bbox_));
        console.log("tcount: " + node_.internalTextureCount_);
        console.log("glue: " + tile_.surface_.glue_);
        console.log("geometry: " + node_.hasGeometry());
        console.log("children: " + node_.hasChildren());
        console.log("tsize: " + node_.pixelSize_);
        console.log("virtual: " + tile_.virtual_ + " " + s);
    }
    
    //Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    var log_ = false;        

    if (log_) {
        console.log("--------------------------------------------");
        console.log("draw-tile: id: " + JSON.stringify(node_.id_));
        console.log("surafce: id: " + tile_.surface_.id_);
        console.log("bbox: " + JSON.stringify(node_.bbox_));
        console.log("flags: " + JSON.stringify(node_.flags_));
        console.log("tcount: " + node_.internalTextureCount_);
        console.log("tsize: " + node_.pixelSize_);
    }

    //if (node_.id_[0] == 13) {
      //  this.map_.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
    //}

    if (this.bboxVisible(node_.bbox_, cameraPos_) != true) {
        return [false, preventRedener_, preventLoad_];
        //return true;
    }

    if (log2_) { console.log("visible"); }

    if (log_) { console.log("draw-tile: visible"); }

    var pixelSize_;

    if (node_.hasGeometry()) {
        var screenPixelSize_ = Number.POSITIVE_INFINITY;

        if (node_.usedTexelSize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * node_.pixelSize_;
        } else if (node_.usedDisplaySize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / node_.displaySize_);
        }

        if (this.camera_.ortho_ == true) {
            var height_ = this.camera_.getViewHeight();
            pixelSize_ = [(screenPixelSize_*2.0) / height_, height_];
        } else {
            pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, true);
        }
    } else {
        pixelSize_ = [Number.POSITIVE_INFINITY, 99999];
    }

    if (log_) {
        console.log("draw-tile: children=="  + node_.hasChildren());
        console.log("draw-tile: psize=="  + pixelSize_[0]);
    }

    //if (node_.id_[0] == 14) {
        //debugger;
    //}

    //if (log2_ && node_.id_[0] == 11) { 
        //debugger;
    //}


    if (node_.hasChildren() == false || pixelSize_[0] < this.config_.mapTexelSizeFit_) {

        if (log2_) { console.log("drawn"); }
        if (log_) { console.log("draw-tile: drawn"); }

          
        if (this.config_.mapAllowHires_ && this.canDrawDetailedLod(tile_)) {
            this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, true, preventLoad_);
            return [true, preventRedener_, true];
        } else {
            this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, preventRedener_, preventLoad_);
        }

        return [false, preventRedener_, preventLoad_];
        
    } else if (this.config_.mapAllowLowres_ && node_.hasGeometry() && pixelSize_[0] < this.config_.mapTexelSizeTolerance_) {
        //return [true, preventRedener_];
        
        //if children are not ready then draw coarser lod
        if (this.canDrawCoarserLod(tile_, node_, cameraPos_)) {
            //draw coarsed load and continue tracing children but do not draw them
            this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, preventRedener_, preventLoad_);            
            return [true, true, preventLoad_];
        }
    }

    //continue to more detailed lods
    return [true, preventRedener_, preventLoad_];
};

Melown.MapTree.prototype.canDrawDetailedLod = function(tile_) {
    if (tile_.lastRenderState_) {
        //debugger;
    }
    return !(tile_.drawCommands_.length > 0  && this.map_.areDrawCommandsReady(tile_.drawCommands_)) && !tile_.lastRenderState_;
};

Melown.MapTree.prototype.canDrawCoarserLod = function(tile_, node_, cameraPos_) {
    if (!node_.hasGeometry() || !(tile_.drawCommands_.length > 0  && this.map_.areDrawCommandsReady(tile_.drawCommands_))) {
        return false;
    }  

    var ret_ = false;

    for (var i = 0; i < 4; i++) {
        if (tile_.children_[i]) {
            var childTile_ = tile_.children_[i];
            
            if (!childTile_.metanode_) {
                ret_ = true;
                continue;
            }

            if (childTile_.metanode_.hasGeometry() &&
                this.bboxVisible(childTile_.metanode_.bbox_, cameraPos_)) {

                if (!(childTile_.drawCommands_.length > 0  && this.map_.areDrawCommandsReady(childTile_.drawCommands_))) {
                    //load data for child tile
                    this.map_.drawSurfaceTile(childTile_, childTile_.metanode_, cameraPos_, 1, true, false);            
                    ret_ = true;
                    continue;
                }
            }
        }
    }

    return ret_;
};

Melown.MapTree.prototype.bboxVisible = function(bbox_, cameraPos_) {
    return this.camera_.bboxVisible(bbox_, cameraPos_);
    //childTile_.metanode_.bbox_
};

Melown.MapTree.prototype.traceHeightChild = function(tile_, params_, res_) {
    var coords_ = params_.coords_;
    var extents_ = params_.extents_;
    var center_ = [(extents_.ll_[0] + extents_.ur_[0]) *0.5,
                   (extents_.ll_[1] + extents_.ur_[1]) *0.5];

    //ul,ur,ll,lr
    //deside in which quadrant are provided coodinates
    var right_ = (coords_[0] >= center_[0]);
    var bottom_ = (coords_[1] >= center_[1]);

    if (right_) {
        extents_.ll_[0] = center_[0];
        if (bottom_) {
            extents_.ll_[1] = center_[1];
        } else {
            extents_.ur_[1] = center_[1];
        }
    } else {
        extents_.ur_[0] = center_[0];
        if (bottom_) {
            extents_.ll_[1] = center_[1];
        } else {
            extents_.ur_[1] = center_[1];
        }
    }

    /*
    if (extents_.ll_[0] > extents_.ur_[0]) {
        right_ = !right_;
    }

    if (extents_.ll_[1] < extents_.ur_[1]) {
        bottom_ = !bottom_;
    }*/

    //trace only resulting quadrant 
    if (right_) {
        return bottom_ ? [1] : [3];
    } else {
        return bottom_ ? [0] : [2];
    }
};

Melown.MapTree.prototype.traceTileHeight = function(tile_, params_, reducedProcessing_, preventLoad_) {
    if (tile_ == null || (tile_.id_[0] > params_.desiredLod_ && params_.heightMap_)) {
        return [false, reducedProcessing_, preventLoad_];
    }

    var node_ = tile_.metanode_;

    if (node_ == null) {
        return [false, reducedProcessing_, preventLoad_];
    }

    if (node_.hasNavtile()) {
        if (tile_.heightMap_ == null) {
            if (!preventLoad_) {
                var path_ = tile_.surface_.getNavUrl(tile_.id_);
                tile_.heightMap_ = new Melown.MapTexture(this.map_, path_, true);
            }
        } else {
            if (tile_.heightMap_.isReady() == true) {
                params_.parent_ = {
                    metanode_ : params_.metanode_,
                    heightMap_ : params_.heightMap_,
                    heightMapExtents_ : params_.heightMapExtents_
                };
                
                params_.metanode_ =  node_;
                params_.heightMap_ = tile_.heightMap_;
                params_.heightMapExtents_ = {
                    ll_ : params_.extents_.ll_.slice(),
                    ur_ : params_.extents_.ur_.slice()
                };
                return [true, reducedProcessing_, preventLoad_];
            }
        }
    } else {
        params_.metanode_ =  node_;
        return [true, reducedProcessing_, preventLoad_];
    }

    return [false, reducedProcessing_, preventLoad_];
};

Melown.MapTree.prototype.traceTileHeightNodeOnly = function(tile_, params_, reducedProcessing_, preventLoad_) {
    if (tile_ == null || tile_.id_[0] > params_.desiredLod_) {
        return [false, reducedProcessing_, preventLoad_];
    }

    var node_ = tile_.metanode_;

    if (node_ == null) {
        return [false, reducedProcessing_, preventLoad_];
    }

    params_.metanode_ =  node_;
    return [true, reducedProcessing_, preventLoad_];
};


Melown.MapTree.prototype.tilePixelSize = function(bbox_, screenPixelSize_, cameraPos_, worldPos_, returnDistance_) {
    var min_ = bbox_.min_;
    var max_ = bbox_.max_;
    var tilePos_ = [min_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos2_ = [max_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos3_ = [max_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];
    var tilePos4_ = [min_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];
    var h1_ = min_[2] - cameraPos_[2];
    var h2_ = max_[2] - cameraPos_[2];

    var factor_ = 0;

    //find bbox sector
    if (0 < tilePos_[1]) { //top row
        if (0 < tilePos_[0]) { // left top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos2_[0]) { // right top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], 0], returnDistance_);
            }
        } else { //top side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], 0], returnDistance_);
            }
        }
    } else if (0 > tilePos4_[1]) { //bottom row
        if (0 < tilePos4_[0]) { // left bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], 0], returnDistance_);
            }
        } else { //bottom side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], 0], returnDistance_);
            }
        }
    } else { //middle row
        if (0 < tilePos4_[0]) { // left side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, 0], returnDistance_);
            }
        } else { //center
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, 0, 0], returnDistance_);
            }
        }
    }

    //console.log("new: " + (factor_ * screenPixelSize_) + " old:" + this.tilePixelSize2(node_) );

    if (returnDistance_ == true) {
        return [(factor_[0] * screenPixelSize_), factor_[1]];
    }

    return (factor_ * screenPixelSize_);
};
