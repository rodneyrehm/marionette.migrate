require.config({
  baseUrl: 'lib',

  shim: {
    underscore: {
      exports: '_',
      deps: []
    },
    backbone: {
      exports: 'Backbone',
      deps: ['jquery', 'underscore']
    }
  }
});

require(['../../lib/structure', 'backbone.marionette'], function (extractStructure, Marionette) {
  
  var structure = extractStructure(Marionette);
  console.log(JSON.stringify(structure, null, 2));
  
});