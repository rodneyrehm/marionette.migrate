require.config({
  baseUrl: '../marionette/2.0.3/lib',

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

require(['../../../src/backbone.marionette.migrate'], function (Marionette) {
  
  console.log(Marionette.$('body'));
  
});