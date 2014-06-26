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
  'json!mapping/events.json',
  'json!mapping/methods.json',
  'json!mapping/properties.json',
  'json!../1.0.2/api.json',
  'json!../2.0.1/api.json'
], function (_, mappedEvents, mappedMethods, mappedProperties, oldApi, newApi) {
  
  var mapping = {
    event: mappedEvents,
    method: mappedMethods,
    property: mappedProperties
  };
  
  console.log(mapping);
  console.log(oldApi);
  console.log(newApi);
  
});