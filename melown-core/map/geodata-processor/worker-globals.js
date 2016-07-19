//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var layerStyles_ = {};
var layerId_ = {};
var layerBitmaps_ = {};
var forceOrigin_ = false;
var tileX_ = 0;
var tileY_ = 0;
var tileLod_ = 0;
var fonts_ = {};
var hitState_ = 0;
var groupOrigin_ = [0,0,0];
var autoLod_ = false;

var clamp = function(value_, min_, max_) {
    if (value_ < min_) {
        value_ = min_;
    }

    if (value_ > max_) {
        value_ = max_;
    }

    return value_;
};