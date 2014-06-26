define(function defineStructure(require) {
  var _ = require('underscore');

  var ignoreName =  /^(\$|VERSION|Deferred)$/;

  function extractEvents(object, buffer) {
    String(object).replace(/\.triggerMethod\((['"])(.+?)\1/g, function(match, quotes, name){
      buffer.push(name);
    });
  }

  function extractConstructorAttributes(func, buffer) {
    String(func).replace(/this.([^\s\r\n\t=]+?)\s*=/g, function(match, name){
      buffer.push(name);
    });
  }

  function uniqueSortedArray(source) {
    // make sure attributes are unique (possibly set in prototype and constructor)
    var buffer = [];
    source.forEach(function(key) {
      if (!buffer.length || key !== buffer[buffer.length -1]) {
        buffer.push(key);
      }
    });

    return buffer;
  }

  function extractStructure(from) {
    var structure = {};
    Object.keys(from).forEach(function(name) {
      if (name.match(ignoreName)) {
        return;
      }

      var object = from[name];
      if (!_.isFunction(object) || name[0].toLowerCase() === name[0]) {
        structure[name] = null;
        return;
      }

      var prototype = object.prototype;
      var struct = structure[name] = {
        // static
        'property': [],
        'function': [],
        // prototype
        'attribute': [],
        'method': [],
        'events': []
      };

      extractConstructorAttributes(object, struct.attribute);

      Object.keys(object).forEach(function(key) {
        var type = _.isFunction(object[key]) ? 'function' : 'property';
        struct[type].push(key);
        extractEvents(object[key], struct.events);
      });

      Object.keys(prototype).forEach(function(key) {
        var type = _.isFunction(prototype[key]) ? 'method' : 'attribute';
        struct[type].push(key);
        extractEvents(prototype[key], struct.events);
      });

      Object.keys(struct).forEach(function(key) {
        struct[key].sort();
        struct[key] = uniqueSortedArray(struct[key]);
      });
    });

    return structure;
  }

  return extractStructure;
});