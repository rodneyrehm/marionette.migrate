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
  
  proxyProperty(
    'API change: Removed the Marionette.$ proxy. We are now using Backbone.$ instead.',
    Marionette, '$', function() { return Backbone.$; }
  );
  // Object.defineProperty(Marionette, '$', {
  //   get: function() {
  //     console.warn('API change: Removed the Marionette.$ proxy. We are now using Backbone.$ instead.');
  //     return Backbone.$;
  //   }
  // });
  
  
  
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