/*
  # Backbone.Marionette Migration Plugin

  This plugin can be used to detect and restore APIs or features that have been changed in Backbone.Marionette as of version 2.0.

  Things this Plugin does not handle:
    * Regions need to have an element when they're showing a view. Previously you could show a view in a region and if the region didn't have an element on the page at the time, nothing would happen. Now Marionette throws an error so you know immediately that you need to fix something.
*/

define(['underscore', 'backbone', 'log', './backbone.marionette.migrate.mapping'], function(_, Backbone, log, mapping) {
  'use strict';

  function proxyProperty(proxy) {
    // TODO: check mapping's first character for "!", if so, it's a hint to the docs

    var _message = proxy.message || '_' + proxy.name + '_: the property [c="color:red"]' + proxy.target + '[c] was renamed to [c="color:blue"]' + proxy.source + '[c]';
    Object.defineProperty(proxy.object, proxy.target, {
      enumerable: true,
      configurable: true,
      get: function() {
        log(_message);
        return proxy.get ? proxy.get.call(this) : this[proxy.source];
      },
      set: function(value) {
        log(_message + ' - both have been updated, this is the last message for this property of this object');
        Object.defineProperty(this, proxy.target, {
          enumerable: true,
          writable: true,
          value: value
        });
        this[proxy.source] = this[proxy.target];
      }
    });
  }

  return function bridgeMarionetteMigration(Marionette) {

    // Marionette.$ was dropped
    proxyProperty({
      object: Marionette,
      target: '$',
      get: function() { return Backbone.$; },
      message: 'API change: Removed the Marionette.$ proxy. We are now using Backbone.$ instead.',
    });

    // Marionette.Layout -> Marionette.LayoutView
    proxyProperty({
      object: Marionette,
      name: 'Marionette',
      target: 'Layout',
      source: 'LayoutView'
    });

    // map methods
    Object.keys(mapping).forEach(function(objectName) {
      var methods = mapping[objectName].method;
      var object = Marionette[objectName].prototype;
      Object.keys(methods).forEach(function(targetName) {
        var sourceName = methods[targetName];
        proxyProperty({
          object: object,
          name: 'Marionette.' + objectName,
          target: targetName,
          source: sourceName
        });
      })
    });


    // TODO: map to new signature Module.initialize(options, moduleName, app) mapped from old Module.initialize(moduleName, app, options)

    return Marionette;
  };

});