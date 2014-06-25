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

require(['backbone.marionette'], function (Marionette) {
  
  console.log(Object.keys(Marionette));
  
});