define(function defineStructure(require) {
  var _ = require('underscore');

  var ignoreName =  /^(\$|VERSION|Deferred)$/;

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
        'method': []
      };

      Object.keys(object).forEach(function(key) {
        var type = _.isFunction(object[key]) ? 'function' : 'property';
        struct[type].push(key);
      });

      Object.keys(prototype).forEach(function(key) {
        var type = _.isFunction(prototype[key]) ? 'method' : 'attribute';
        struct[type].push(key);
      });

    });

    return structure;
  }

  return extractStructure;
});