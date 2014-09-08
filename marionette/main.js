require.config({
  baseUrl: 'lib',
  paths: {
    underscore: '../2.0.1/lib/underscore',
    mapping: '../../mapping',
    text: '../bower_components/requirejs-plugins/lib/text',
    json: '../bower_components/requirejs-plugins/src/json'
  },
  shim: {
    underscore: {
      exports: '_',
      deps: []
    }
  }
});

require([
  'underscore', 
//  'json!../1.0.2/api.json',
  'json!../1.8.8/api.json',
//  'json!../2.0.1/api.json',
  'json!mapping/events.json',
  'json!mapping/methods.json',
  'json!mapping/properties.json',
  'json!mapping/objects.json'
], function (_, oldApi, newApi, mappedEvents, mappedMethods, mappedProperties, mappedObjects) {
  
  var mapping = {
    event: mappedEvents,
    method: mappedMethods,
    property: mappedProperties,
    object: mappedObjects
  };
  
  var diff = {};
  
  Object.keys(oldApi).forEach(function(name) {
    var object = oldApi[name];
    var _name = mapping.object[name] || name;
    var _diff = {};

    if (!object) {
      if (newApi[_name] === undefined) {
        diff[name] = true;
      }
      
      return;
    }
    
    if (!newApi[_name]) {
      diff[name] = true;
      return;
    }

    Object.keys(object).forEach(function(key) {
      var d = _.difference(object[key], newApi[_name][key]);
      if (d.length) {
        //_diff[key] = d;
        _diff[key] = {};
        d.forEach(function(p) {
          _diff[key][p] = "";
        });
      }
    });
    
    if (Object.keys(_diff).length) {
      diff[name] = _diff;
    }
    
    if (name !== _name) {
      _diff = name;
    }
  });
  
  console.log(JSON.stringify(diff, null, 2));

});