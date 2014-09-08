(function(root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone', 'backbone.marionette'], function(_, Backbone, Marionette) {
      return (root.Marionette = factory(root, _, Backbone, Marionette));
    });
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    var Backbone = require('backbone');
    var Marionette = require('backbone.marionette');
    module.exports = factory(root, _, Backbone, Marionette);
  } else {
    root.Marionette = factory(root, root._, root.Backbone, root.Marionette);
  }

}(this, function(root, _, Backbone, Marionette) {
  'use strict';
  
  /*
    Things this Plugin does not handle:
      * Regions need to have an element when they're showing a view. Previously you could show a view in a region and if the region didn't have an element on the page at the time, nothing would happen. Now Marionette throws an error so you know immediately that you need to fix something.
  */

  proxyProperty(
    'API change: Removed the Marionette.$ proxy. We are now using Backbone.$ instead.',
    Marionette, '$', function() { return Backbone.$; }
  );

  // TODO: check mapping's first character for "!", if so, it's a hint to the docs
  // TODO: run a function signature comparison of all the mappings

  // TODO: map to new signature Module.initialize(options, moduleName, app) mapped from old Module.initialize(moduleName, app, options)


  function proxyProperty(message, object, propertyName, callback) {
    Object.defineProperty(object, propertyName, {
      get: function() {
        console.warn(message);
        return callback.call(this);
      }
    });
  }
  
  
  return Marionette;
}));