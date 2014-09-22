/*
  # Backbone.Marionette Migration Plugin

  This plugin can be used to detect and restore APIs or features that have been changed in Backbone.Marionette as of version 2.0.

  Things this Plugin does not handle:
    * Changed argument order of Module.initialize - previously (moduleName, app, options) now (options, moduleName, app)
    * Regions need to have an element when they're showing a view. Previously you could show a view in a region and if the region didn't have an element on the page at the time, nothing would happen. Now Marionette throws an error so you know immediately that you need to fix something.
    * event-callbacks added to a view after initalization, i.e. not passed to .extend()
*/

define(['underscore', 'backbone', 'log', 'stacktrace', './backbone.marionette.migrate.mapping'], function(_, Backbone, log, stacktrace, mapping) {
  'use strict';

  // container to overwrite callStack in hit()
  var _globalStack = null;
  // container to collect hits
  var _hitLog = [];

  function parseTrace(text) {
    var func = text.split('@');
    var file = func[1].split(':');
    var column = file.pop();
    var line = file.pop();
    return {
      name: func[0],
      file: file.join(':'),
      line: line,
      column: column
    };
  }

  function hiliteFileName(match, filename) {
    return '/_' + filename + '_';
  }

  function hit(message, trace) {
    log('[c="color:lightgrey"]--------------------[c]');
    log(message);
    var _trace = (_globalStack || trace).map(parseTrace);
    log('  in [c="color:blue"]' + _trace[0].name + '[c] ' + _trace[0].file.replace(/\/([^\/]+)$/i, hiliteFileName) + ' [c="color:magenta"]line ' + _trace[0].line + '[c]');

    _hitLog.push({
      message: message,
      trace: _trace
    });
  }

  function proxyProperty(proxy) {
    var _message = proxy.message;
    var _dropped = proxy.source && proxy.source.slice(0, 1) === '!';
    if (!_message) {
      if (_dropped) {
        _message = '_' + proxy.name + '_: ' + proxy.source.slice(1);
      } else {
        _message = '_' + proxy.name + '_: the ' + (proxy.type || 'property') + ' [c="color:red"]' + proxy.target + '[c] was renamed to [c="color:blue"]' + proxy.source + '[c]';
      }
    }

    Object.defineProperty(proxy.object, proxy.target, {
      enumerable: true,
      configurable: true,
      get: function() {
        hit(_message, stacktrace().slice(4));
        return proxy.get ? proxy.get.call(this) : this[proxy.source];
      },
      set: function(value) {
        hit(_message + (!_dropped ? ' - both have been updated' : ''), stacktrace().slice(9));
        if (!_dropped) {
          this[proxy.source] = value;
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

  function callbackToEvent(name) {
    // this function reverses eventToCallback()

    if (name.slice(0, 2) !== 'on') {
      return null;
    }

    // split the event name on every upper-case character
    var splitter = /[A-Z]/g;

    // take the event section ("section1Section2Section3")
    // and turn it in to lowercase, colon-delimited name
    function getEventName(match) {
      return ':' + match.toLowerCase();
    }

    return name.replace(splitter, getEventName).slice(3);
  }

  function proxyBackboneEvents(object, mapping, logName) {
    'on once off trigger'.split(' ').forEach(function(methodName) {
      var original = object.prototype[methodName];
      if (!original) {
        return;
      }

      object.prototype[methodName] = function(name) {
        var _message;

        if (typeof name !== 'string' || name.indexOf(' ') !== -1) {
          // arguments have to be processed by Backbone's eventsApi() first
          return original.apply(this, arguments);
        }

        var args = [].slice.call(arguments, 0);
        if (mapping[name]) {
          _message = _message = '_' + logName + '.' + methodName + '()_: the event [c="color:red"]' + name + '[c] was renamed to [c="color:blue"]' + mapping[name] + '[c]';
          hit(_message, stacktrace().slice(4));
          args[0] = mapping[name];
        } else {
          // itemview:foobar -> childview:foobar
          var _name = name.split(':');
          if (_name[0] === 'itemview' && this.getOption('childViewEventPrefix') !== 'itemview') {
            _name[0] = this.getOption('childViewEventPrefix');
            args[0] = _name.join(':');
            _message = _message = '_' + logName + '.' + methodName + '()_: the event [c="color:red"]' + name + '[c] was renamed to [c="color:blue"]' + args[0] + '[c] (see property "childViewEventPrefix")';
            hit(_message, stacktrace().slice(4));
          }
        }

        return original.apply(this, args);
      };
    });
  };

  // inerhit events from parent
  // (attributes and methods are stored on the prototype chain)
  Object.keys(mapping).forEach(function(objectName) {
    var _parent = mapping[objectName].parent;
    if (!_parent) {
      return;
    }

    // extend so that child still overwrites parent
    mapping[objectName].event = _.extend(
      _.clone(_parent.event || {}),
      mapping[objectName].event || {}
    );
  });

  return function bridgeMarionetteMigration(Marionette) {

    // attach hitlog to marionette itself - doesn't have to win a beauty-context...
    Marionette._migrationLog = _hitLog;

    // Marionette.$ was dropped
    proxyProperty({
      object: Marionette,
      target: '$',
      get: function() { return Backbone.$; },
      message: '_Marionette.$:_ Removed the Marionette.$ proxy. We are now using Backbone.$ directly.',
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

      // alias [static] old event callback names to new event callback names (onEventName event-handle-callbacks)
      var events = mapping[objectName].event;
      Object.keys(events || {}).forEach(function(targetEventName) {
        var targetCallbackName = eventToCallback(targetEventName);
        var sourceEventName = events[targetEventName];
        var sourceCallbackName = sourceEventName.slice(0, 1) === '!'
          ? sourceEventName
          : eventToCallback(sourceEventName);

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

    // map itemViewEventPrefix / childViewEventPrefix event-callbacks
    ['CollectionView', 'CompositeView'].forEach(function(objectName) {
      var object = Marionette[objectName];
      var logName = 'Marionette.' + objectName;

      // alias [dynamic, prefixed] old event callback names to new event callback names (e.g. onItemviewSomething)
      object.extend = (function(extend) {
        return function(protoProps, staticProps) {
          // capture stack of extend() call to overwrite call-stack of the actual set within the forEach()
          var callStack = stacktrace().slice(4);
          _globalStack = callStack;
          var result = extend.call(this, protoProps, staticProps);
          _globalStack = null;

          var prefix = result.prototype.childViewEventPrefix;
          Object.keys(protoProps).forEach(function(name) {
            var event = callbackToEvent(name);
            if (!event) {
              return;
            }

            var _name = event.split(':');
            if (_name[0] !== 'itemview' || prefix === 'itemview') {
              return;
            }

            _name[0] = prefix;
            _name = _name.join(':');
            var value = result.prototype[name];

            proxyProperty({
              object: result.prototype,
              name: logName,
              target: name,
              source: eventToCallback(_name)
            });

            // print callStack of .extend() call rather than the disconnected .extend() execution
            _globalStack = callStack;
            result.prototype[name] = value;
            _globalStack = null;
          });

          return result;
        };
      })(object.extend);
    });

    return Marionette;
  };

});