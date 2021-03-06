/*!
 * Backbone.Marionette Migration Plugin
 *
 * Version: 0.1.0
 *
 * Author: Rodney Rehm
 * Web: https://github.com/rodneyrehm/Marionette.Migrate
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 */
define(['underscore', 'backbone', 'log', 'stacktrace', './backbone.marionette.migrate.mapping'], function(_, Backbone, log, stacktrace, mapping) {
  'use strict';

  // expression to remove log markup
  var _logMarkup = /\[c[^\]]*\]/g;
  // container to overwrite callStack in hit()
  var _globalStack = null;
  // container to collect hits
  var _hitLog = [];
  // custom log message formatting
  var _customHit = null;
  // pattern to ignore internal files (required to adjust the stack trace in proxyProperty() set handler)
  // I know, this isn't exactly the way to tackle this, but it worked for me.
  // Feel free to send a PR to fix stack frame detection
  var _traceFilterExpression = /\/((backbone\.(marionette\.)?)|jquery\.)js$/i;
  var _traceFilter = function(_trace) {
    // skip backbone.js and backbone.marionette.js internals, possibly triggered by
    // cutting off the first 9 elements in set handler of proxyProperty()
    while (_trace[0] && _trace[0].file.match(_traceFilterExpression)) {
      _trace.shift();
    }
    // proxyProperty() may have killed too much, in that case it's a stack-offset of 4 (5 adding one for hit())
    if (!_trace.length) {
      _trace = stacktrace().slice(6).map(parseTrace);
    }

    return _trace;
  };

  function parseTrace(text) {
    var func = text.split('@');
    var file = (func[1] || "").split(':');
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
    return '/[c="font-weight:bold"]' + filename + '[c]';
  }

  function hit(message, trace) {
    var _trace = (_globalStack || trace).map(parseTrace);
    _trace = _traceFilter(_trace);

    if (!_customHit || !_customHit(message, _trace)) {
      log('[c="color:lightgrey"]--------------------[c]');
      log(message);
      log('  in [c="color:blue"]' + _trace[0].name + '[c] ' + _trace[0].file.replace(/\/([^\/]+)$/i, hiliteFileName) + ' [c="color:magenta"]line ' + _trace[0].line + '[c]');
    }

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
        _message = '[c="font-weight:bold"]' + proxy.name + '[c]: ' + proxy.source.slice(1);
      } else {
        _message = '[c="font-weight:bold"]' + proxy.name + '[c]: the ' + (proxy.type || 'property') + ' [c="color:red"]' + proxy.target + '[c] was renamed to [c="color:blue"]' + proxy.source + '[c]';
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
          _message = _message = '[c="font-weight:bold"]' + logName + '.' + methodName + '()[c]: the event [c="color:red"]' + name + '[c] was renamed to [c="color:blue"]' + mapping[name] + '[c]';
          hit(_message, stacktrace().slice(4));
          args[0] = mapping[name];
        } else {
          // itemview:foobar -> childview:foobar
          var _name = name.split(':');
          if (_name[0] === 'itemview' && this.getOption('childViewEventPrefix') !== 'itemview') {
            _name[0] = this.getOption('childViewEventPrefix');
            args[0] = _name.join(':');
            _message = _message = '[c="font-weight:bold"]' + logName + '.' + methodName + '()[c]: the event [c="color:red"]' + name + '[c] was renamed to [c="color:blue"]' + args[0] + '[c] (see property "childViewEventPrefix")';
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

  return function bridgeMarionetteMigration(Marionette, options) {
    // expose custom callback for hit logging
    if (options && options.callback) {
      _customHit = options && options.callback;
    }

    // expose custom trace filter for skipping internals
    if (options && options.filter) {
      _traceFilter = options && options.filter;
    }

    // expose custom RegExp for skipping internals
    if (options && options.filterExpression) {
      _traceFilterExpression = options && options.filterExpression;
    }

    // attach hitlog to marionette itself - doesn't have to win a beauty-context...
    Marionette._migrationLog = _hitLog;
    // expose a simple data aggregator
    Marionette._aggregateMigrationLog = function(removeMarkup) {
      var data = {};
      Marionette._migrationLog.forEach(function(entry) {
        var file = entry.trace[0].file;
        var line = entry.trace[0].line;
        var name = entry.trace[0].name;

        if (!data[file]) {
          data[file] = {};
        }

        if (!data[file][line]) {
          // ES6 Set, where are you?!
          data[file][line] = {};
        }

        data[file][line][name + ':' + entry.message] = entry;
      });

      var result = [];
      // ES6 Object.values() where are you?!
      Object.keys(data).forEach(function(file) {
        var lines = [];
        Object.keys(data[file]).forEach(function(line) {
          var hits = Object.keys(data[file][line]).map(function(key) {
            var message = data[file][line][key].message;
            return removeMarkup ? message.replace(_logMarkup, '') : message;
          });
          lines.push({
            line: line,
            hits: hits,
          });
        });
        result.push({
          file: file,
          lines: lines,
        });
      });

      return result;
    };

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

    // Marionette.Region.prototype.show()'s options.preventClose -> options.preventDestroy
    Marionette.Region.prototype.show = (function(show) {
      return function marionetteMigrateShow(view, options) {
        if (options && Object.prototype.hasOwnProperty.call(options, 'preventClose')) {
          options.preventDestroy = options.preventClose;
          delete options.preventClose;
          hit('[c="font-weight:bold"]Marionette.Region.show()[c]: the option [c="color:red"]preventClose[c] was renamed to [c="color:blue"]preventDestroy[c]', stacktrace().slice(4));
        }

        return show.call(this, view, options);
      };
    })(Marionette.Region.prototype.show);

    // Marionette.Region.prototype.buildRegion()'s regionConfig.regionType -> regionConfig.regionClass
    Marionette.Region.prototype.buildRegion = (function(buildRegion) {
      return function marionetteMigrateBuildRegion(regionConfig, defaultRegionClass) {
        if (regionConfig && Object.prototype.hasOwnProperty.call(regionConfig, 'regionType')) {
          regionConfig.regionClass = regionConfig.regionType;
          delete regionConfig.regionType;
          hit('[c="font-weight:bold"]Marionette.Region.buildRegion()[c]: the option [c="color:red"]regionType[c] was renamed to [c="color:blue"]regionClass[c]', stacktrace().slice(4));
        }

        return show.call(this, regionConfig, defaultRegionClass);
      };
    })(Marionette.Region.prototype.buildRegion);

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