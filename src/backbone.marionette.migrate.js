/*
  # Backbone.Marionette Migration Plugin

  This plugin can be used to detect and restore APIs or features that have been changed in Backbone.Marionette as of version 2.0.

  Things this Plugin does not handle:
    * Regions need to have an element when they're showing a view. Previously you could show a view in a region and if the region didn't have an element on the page at the time, nothing would happen. Now Marionette throws an error so you know immediately that you need to fix something.
*/

define(['underscore', 'backbone', 'log', './backbone.marionette.migrate.mapping'], function(_, Backbone, log, mapping) {
  'use strict';

  // TODO: walk .event objects and extend() .event of _parent into the list

  function proxyProperty(proxy) {
    var _message = proxy.message;
    var _dropped = proxy.source && proxy.source.slice(0, 1) === '!';
    if (!_message) {
      if (_dropped) {
        _message = proxy.source.slice(1);
      } else {
        _message = '_' + proxy.name + '_: the ' + (proxy.type || 'property') + ' [c="color:red"]' + proxy.target + '[c] was renamed to [c="color:blue"]' + proxy.source + '[c]';
      }
    }

    Object.defineProperty(proxy.object, proxy.target, {
      enumerable: true,
      configurable: true,
      get: function() {
        log(_message);
        return proxy.get ? proxy.get.call(this) : this[proxy.source];
      },
      set: function(value) {
        log(_message + ' - both have been updated');
        if (!_dropped) {
          this[proxy.source] = this[proxy.target];
        }
      }
    });
  }

  function eventToCallback(event) {
    // this function contains parts of Marionette.triggerMethod()

    // split the event name on the ":"
    var splitter = /(^|:)(\w)/gi;

    // take the event section ("section1:section2:section3")
    // and turn it in to uppercase name
    function getEventName(match, prefix, eventName) {
      return eventName.toUpperCase();
    }

    return 'on' + event.replace(splitter, getEventName);
  }

  function proxyBackboneEvents(object, mapping, logName) {
    'on once off trigger'.split(' ').forEach(function(methodName) {
      var original = object.prototype[methodName];
      if (!original) {
        return;
      }

      object.prototype[methodName] = function(name) {
        if (typeof name !== 'string' || name.indexOf(' ') !== -1) {
          // arguments have to be processed by Backbone's eventsApi() first
          return original.apply(this, arguments);
        }

        var args = [].slice.call(arguments, 0);
        if (mapping[name]) {
          var _message = _message = '_' + logName + '.' + methodName + '()_: the event [c="color:red"]' + name + '[c] was renamed to [c="color:blue"]' + mapping[name] + '[c]';
          log(_message);
          args[0] = mapping[name];
        }

        return original.apply(this, args);
      }
    });
  };

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

    // map methods, duckpunch extend
    Object.keys(mapping).forEach(function(objectName) {
      var object = Marionette[objectName];
      var logName = 'Marionette.' + objectName;

      // alias old attribute name to new attribute name
      var attributes = mapping[objectName].attribute;
      Object.keys(attributes || {}).forEach(function(targetName) {
        var sourceName = attributes[targetName];
        proxyProperty({
          object: object.prototype,
          name: logName,
          type: 'attribute',
          target: targetName,
          source: sourceName
        });
      });

      // alias old event callback names to new event callback names (onEventName event-handle-callbacks)
      // FIXME: this does currently not handle the CollectionView childViewEventPrefix augmented events
      // FIXME: CollectionView: onAfterItemAdded, onItemviewSomething
      var events = mapping[objectName].event;
      Object.keys(events || {}).forEach(function(targetEventName) {
        var targetCallbackName = eventToCallback(targetEventName);
        var sourceEventName = events[targetEventName];
        var sourceCallbackName = eventToCallback(sourceEventName);
        proxyProperty({
          object: object.prototype,
          name: logName,
          type: 'event-callback',
          target: targetCallbackName,
          source: sourceCallbackName
        });
      });

      // duckpunch Backbone.Events so names can be converted on the fly
      proxyBackboneEvents(object, events || {}, logName);

      // alias old method name to new method name
      var methods = mapping[objectName].method;
      Object.keys(methods || {}).forEach(function(targetName) {
        var sourceName = methods[targetName];
        proxyProperty({
          object: object.prototype,
          name: logName,
          type: 'method',
          target: targetName,
          source: sourceName
        });
      });
    });

    // TODO: map to new signature Module.initialize(options, moduleName, app) mapped from old Module.initialize(moduleName, app, options)
    // problem: the only way to infer argument order is by looking at the parameter names - and they don't have to be "moduleName", "app" and "options"

    return Marionette;
  };

});