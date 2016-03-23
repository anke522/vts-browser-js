/**
 * @constructor
 */
Melown.MapInterface = function(map_) {
    this.map_ = map_;
    this.config_ = map_.config_;
};

Melown.MapInterface.prototype.setPosition = function(position_) {
    this.map_.setPosition(position_);
    return this;    
};

Melown.MapInterface.prototype.getPosition = function(type_) {
    return this.map_.getPosition().pos_;
};

Melown.MapInterface.prototype.setView = function(view_) {
    this.map_.setView(view_);
    return this;    
};

Melown.MapInterface.prototype.getView = function() {
    return this.map_.getView();
};

Melown.MapInterface.prototype.getCredits = function() {
    return this.map_.getCredits();
};

Melown.MapInterface.prototype.getCurrentCredits = function() {
    return this.map_.getVisibleCredits();
};

Melown.MapInterface.prototype.getCreditInfo = function(creditId_) {
    var credit_ = this.map_.getCreditById(creditId_);
    return credit_ ? credit_.getInfo() : {};
};

Melown.MapInterface.prototype.getViews = function() {
    return this.map_.getNamedViews();
};

Melown.MapInterface.prototype.getViewInfo = function(viewId_) {
    var view_ = this.map_.getNamedView(viewId_);
    return view_ ? view_.getInfo() : {};
};

Melown.MapInterface.prototype.getBoundLayers = function() {
    return this.map_.getBoundLayers();
};

Melown.MapInterface.prototype.getBoundLayerInfo = function(layerId_) {
    return this.map_.getBoundLayerInfo(layerId_);
};

Melown.MapInterface.prototype.getFreeLayers = function() {
    return this.map_.getFreeLayers();
};

Melown.MapInterface.prototype.getFreeLayerInfo = function(layerId_) {
    return this.map_.getFreeLayers(layerId_);
};

Melown.MapInterface.prototype.getSurfaces = function() {
    return this.map_.getSurfaces();
};

Melown.MapInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    return this.map_.getSurfacesInfo(srsId_);
};

Melown.MapInterface.prototype.getSrses = function() {
    return this.map_.getSrses(surfaceId_);
};

Melown.MapInterface.prototype.getSrsInfo = function(srsId_) {
    var srs_ = this.map_.getSrs(srsId_);
    return srs_ ? srs_.getInfo() : {};
};

Melown.MapInterface.prototype.getReferenceFrame = function() {
    return this.map_.referenceFrame_.getInfo();
};

Melown.MapInterface.prototype.convertPositionViewMode = function(position_, mode_) {
    var pos_ = (new Melown.MapPosition(this.map_, position_)).convertViewMode(mode_);
    return (pos_ != null) ? pos_.pos_ : pos_;
};

Melown.MapInterface.prototype.convertPositionHeightMode = function(position_, mode_, noPrecisionCheck_) {
    var pos_ = (new Melown.MapPosition(this.map_, position_)).convertHeightMode(mode_, noPrecisionCheck_);
    return (pos_ != null) ? pos_.pos_ : pos_;
};

Melown.MapInterface.prototype.convertCoords = function(sourceSrs_, destinationSrs_, coords_) {
    var srs_ = this.map_.getSrs(sourceSrs_);
    var srs2_ = this.map_.getSrs(destinationSrs_);
    if (!srs_ || !srs2_) {
        return null;
    }

    return srs2_.convertCoordsFrom(coords_, srs_);
};

Melown.MapInterface.prototype.convertCoordsFromNavToCanvas = function(pos_, mode_, lod_) {
    var p_ = ["obj", pos_[0], pos_[1], mode_, pos_[2], 0, 0, 0, 10, 90 ];
    return (new Melown.MapPosition(this.map_, p_)).getCanvasCoords(lod_);
};

Melown.MapInterface.prototype.clonePosition = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).pos_;
};

Melown.MapInterface.prototype.arePositionsSame = function(position_, position2_) {
    p1_ = new Melown.MapPosition(this.map_, position_);
    p2_ = new Melown.MapPosition(this.map_, position2_);
    return !(p1_.isDifferent(p2_));
};

Melown.MapInterface.prototype.setPositionCoords = function(position_, coords_) {
    return (new Melown.MapPosition(this.map_, position_)).setCoords(coords_).pos_;
};

Melown.MapInterface.prototype.getPositionCoords = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getCoords();
};

Melown.MapInterface.prototype.setPositionHeight = function(position_, height_) {
    return (new Melown.MapPosition(this.map_, position_)).setHeight(height_).pos_;
};

Melown.MapInterface.prototype.getPositionHeight = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getHeight();
};

Melown.MapInterface.prototype.setPositionOrientation = function(position_, orientation_) {
    return (new Melown.MapPosition(this.map_, position_)).setOrientation(orientation_).pos_;
};

Melown.MapInterface.prototype.getPositionOrientation = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getOrientation();
};

Melown.MapInterface.prototype.setPositionViewExtent = function(position_, extent_) {
    return (new Melown.MapPosition(this.map_, position_)).setViewExtent(extent_).pos_;
};

Melown.MapInterface.prototype.getPositionViewExtent = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getViewExtent();
};

Melown.MapInterface.prototype.setPositionFov = function(position_, fov_) {
    return (new Melown.MapPosition(this.map_, position_)).setFov(fov_);
};

Melown.MapInterface.prototype.getPositionFov = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getFov();
};

Melown.MapInterface.prototype.getPositionViewMode = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getViewMode();
};

Melown.MapInterface.prototype.getPositionHeightMode = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getHeightMode();
};

Melown.MapInterface.prototype.getPositionCanvasCoords = function(position_, lod_) {
    return (new Melown.MapPosition(this.map_, position_)).getCanvasCoords(lod_);
};

Melown.MapInterface.prototype.getPositionCameraCoords = function(position_, mode_) {
    return (new Melown.MapPosition(this.map_, position_)).getCameraCoords(mode_);
};

Melown.MapInterface.prototype.movePositionCoordsTo = function(position_, azimuth_, distance_) {
    return (new Melown.MapPosition(this.map_, position_)).moveCoordsTo(azimuth_, distance_);
};

Melown.MapInterface.prototype.getSurfaceHeight = function(coords_, precision_) {
    return this.map_.getSurfaceHeight(coords_, this.map_.getOptimalHeightLodBySampleSize(coords_, precision_));
};

Melown.MapInterface.prototype.getDistance = function(coords_, coords2_, includingHeight_) {
    return this.map_.getDistancet(coords_, coords2_, includingHeight_);
};

Melown.MapInterface.prototype.getAzimuthCorrection = function(coords_, coords2_) {
    return this.map_.getAzimuthCorrection(coords_, coords2_);
};

Melown.MapInterface.prototype.getCameraInfo = function() {
    var camera_ = this.map_.camera_;
    return {
        "projection-matrix" : camera_.projection_,
        "view-matrix" : camera_.modelview_,
        "view-projection-matrix" : camera_.mvp_,
        "position" : camera_.getPosition(),
        "vector" : [0,0,1]
    };
};

Melown.MapInterface.prototype.generateTrajectory = function(p1_, p2_, options_) {
    p1_ = new Melown.MapPosition(this.map_, p1_);
    p2_ = new Melown.MapPosition(this.map_, p2_);
    return (new Melown.MapTrajectory(this.map_, p1_, p2_, options_)).generate();
};

Melown.RendererInterface.prototype.setConfigParams = function(params_) {
    this.map_.setConfigParams(params_);
    return this;
};

Melown.MapInterface.prototype.setConfigParam = function(key_, value_) {
    this.map_.setConfigParam(key_, value_);
    return this;
};

Melown.MapInterface.prototype.getConfigParam = function(key_) {
    return this.map_.getConfigParam(key_, value_);
};

Melown.MapInterface.prototype.redraw = function() {
    this.map_.markDirty();
    return this;
};

Melown.MapInterface.prototype.addRenderSlot = function(id_, callback_, enabled_) {
    this.map_.addRenderSlot(id_, callback_, enabled_);
    return this;    
};

Melown.MapInterface.prototype.moveRenderSlotBefore = function(whichId_, whereId_) {
    this.map_.moveRenderSlotBefore(whichId_, whereId_);
    return this;    
};

Melown.MapInterface.prototype.moveRenderSlotAfter = function(whichId_, whereId_) {
    this.map_.moveRenderSlotAfter(whichId_, whereId_);
    return this;    
};

Melown.MapInterface.prototype.removeRenderSlot = function(id_) {
    this.map_.removeRenderSlot(id_);
    return this;    
};

Melown.MapInterface.prototype.setRenderSlotEnabled = function(id_, state_) {
    this.map_.setRenderSlotEnabled(id_, state_);
    return this;    
};

Melown.MapInterface.prototype.getRenderSlotEnabled = function(id_) {
    return this.map_.getRenderSlotEnabled(id_);
};

Melown.MapInterface.prototype.setLoaderSuspended = function(state_) {
    this.map_.loaderSuspended_ = state_;
    return this;
};

Melown.MapInterface.prototype.getLoaderSuspended = function() {
    return this.map_.loaderSuspended_;
};

Melown.MapInterface.prototype.getGpuCache = function() {
    return this.map_.gpuCache_;
};


Melown.MapPositionInterface = Melown.MapPosition;



Melown.MapInterface.prototype["setPosition"] = Melown.MapInterface.prototype.setPosition;
Melown.MapInterface.prototype["getPosition"] = Melown.MapInterface.prototype.getPosition;
Melown.MapInterface.prototype["setView"] = Melown.MapInterface.prototype.setView;
Melown.MapInterface.prototype["getView"] = Melown.MapInterface.prototype.getView;
Melown.MapInterface.prototype["getCredits"] = Melown.MapInterface.prototype.getCredits;
Melown.MapInterface.prototype["getCurrentCredits"] = Melown.MapInterface.prototype.getCurrentCredits;
Melown.MapInterface.prototype["getCreditInfo"] = Melown.MapInterface.prototype.getCreditInfo;
Melown.MapInterface.prototype["getViews"] = Melown.MapInterface.prototype.getViews;
Melown.MapInterface.prototype["getViewInfo"] = Melown.MapInterface.prototype.getViewInfo;
Melown.MapInterface.prototype["getBoundLayers"] = Melown.MapInterface.prototype.getBoundLayers; 
Melown.MapInterface.prototype["getBoundLayerInfo"] = Melown.MapInterface.prototype.getBoundLayerInfo; 
Melown.MapInterface.prototype["getFreeLayers"] = Melown.MapInterface.prototype.getFreeLayers;
Melown.MapInterface.prototype["getFreeLayerInfo"] = Melown.MapInterface.prototype.getFreeLayerInfo; 
Melown.MapInterface.prototype["getSurfaces"] = Melown.MapInterface.prototype.getSurfaces;
Melown.MapInterface.prototype["getSurfaceInfo"] = Melown.MapInterface.prototype.getSurfaceInfo; 
Melown.MapInterface.prototype["getSrses"] = Melown.MapInterface.prototype.getSrses; 
Melown.MapInterface.prototype["getSrsInfo"] = Melown.MapInterface.prototype.getSrsInfo; 
Melown.MapInterface.prototype["getReferenceFrame"] = Melown.MapInterface.prototype.getReferenceFrame; 
Melown.MapInterface.prototype["convertPositionViewMode"] = Melown.MapInterface.prototype.convertPositionViewMode; 
Melown.MapInterface.prototype["convertPositionHeightMode"] = Melown.MapInterface.prototype.convertPositionHeightMode; 
Melown.MapInterface.prototype["convertCoords"] = Melown.MapInterface.prototype.convertCoords;
Melown.MapInterface.prototype["convertCoordsFromNavToCanvas"] = Melown.MapInterface.prototype.convertCoordsFromNavToCanvas;
Melown.MapInterface.prototype["clonePosition"] = Melown.MapInterface.prototype.clonePosition; 
Melown.MapInterface.prototype["setPositionCoords"] = Melown.MapInterface.prototype.setPositionCoords; 
Melown.MapInterface.prototype["getPositionCoords"] = Melown.MapInterface.prototype.getPositionCoords; 
Melown.MapInterface.prototype["setPositionHeight"] = Melown.MapInterface.prototype.setPositionHeight; 
Melown.MapInterface.prototype["getPositionHeight"] = Melown.MapInterface.prototype.getPositionHeight; 
Melown.MapInterface.prototype["setPositionOrientation"] = Melown.MapInterface.prototype.setPositionOrientation; 
Melown.MapInterface.prototype["getPositionOrientation"] = Melown.MapInterface.prototype.getPositionOrientation; 
Melown.MapInterface.prototype["setPositionViewExtent"] = Melown.MapInterface.prototype.setPositionViewExtent;
Melown.MapInterface.prototype["getPositionViewExtent"] = Melown.MapInterface.prototype.getPositionViewExtent; 
Melown.MapInterface.prototype["setPositionFov"] = Melown.MapInterface.prototype.setPositionFov;
Melown.MapInterface.prototype["getPositionFov"] = Melown.MapInterface.prototype.getPositionFov; 
Melown.MapInterface.prototype["getPositionViewMode"] = Melown.MapInterface.prototype.getPositionViewMode; 
Melown.MapInterface.prototype["getPositionHeightMode"] = Melown.MapInterface.prototype.getPositionHeightMode; 
Melown.MapInterface.prototype["getPositionCanvasCoords"] = Melown.MapInterface.prototype.getPositionCanvasCoords; 
Melown.MapInterface.prototype["getPositionCameraCoords"] = Melown.MapInterface.prototype.getPositionCameraCoords; 
Melown.MapInterface.prototype["movePositionCoordsTo"] = Melown.MapInterface.prototype.movePositionCoordsTo;
Melown.MapInterface.prototype["getSurfaceHeight"] = Melown.MapInterface.prototype.getSurfaceHeight;
Melown.MapInterface.prototype["getDistance"] = Melown.MapInterface.prototype.getDistance;
Melown.MapInterface.prototype["getAzimuthCorrection"] = Melown.MapInterface.prototype.getAzimuthCorrection; 
Melown.MapInterface.prototype["getCameraInfo"] = Melown.MapInterface.prototype.getCameraInfo;
Melown.MapInterface.prototype["generateTrajectory"] = Melown.MapInterface.prototype.generateTrajectory; 
Melown.MapInterface.prototype["setConfigParam"] = Melown.MapInterface.prototype.setConfigParam;
Melown.MapInterface.prototype["getConfigParam"] = Melown.MapInterface.prototype.getConfigParam; 
Melown.MapInterface.prototype["redraw"] = Melown.MapInterface.prototype.redraw;
Melown.MapInterface.prototype["addRenderSlot"] = Melown.MapInterface.prototype.addRenderSlot; 
Melown.MapInterface.prototype["moveRenderSlotBefore"] = Melown.MapInterface.prototype.moveRenderSlotBefore; 
Melown.MapInterface.prototype["moveRenderSlotAfter"] = Melown.MapInterface.prototype.moveRenderSlotAfter;
Melown.MapInterface.prototype["removeRenderSlot"] = Melown.MapInterface.prototype.removeRenderSlot;
Melown.MapInterface.prototype["setRenderSlotEnabled"] = Melown.MapInterface.prototype.setRenderSlotEnabled; 
Melown.MapInterface.prototype["getRenderSlotEnabled"] = Melown.MapInterface.prototype.getRenderSlotEnabled; 
Melown.MapInterface.prototype["setLoaderSuspended"] = Melown.MapInterface.prototype.setLoaderSuspended;
Melown.MapInterface.prototype["getLoaderSuspended"] = Melown.MapInterface.prototype.getLoaderSuspended; 
Melown.MapInterface.prototype["getGpuCache"] = Melown.MapInterface.prototype.getGpuCache;

