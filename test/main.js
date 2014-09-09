require.config({
  baseUrl: '../marionette/2.0.3/lib',

  paths: {
    log: '../../../bower_components/log/log'
  },

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

require(['../../../src/backbone.marionette.migrate', 'backbone.marionette'], function (bridgeMarionetteMigration, Marionette) {
  bridgeMarionetteMigration(Marionette);

  console.log(Marionette.$('body'));

  var Conti = Marionette.Controller.extend({});
  var conti = new Conti();
  conti.close

  var View = Marionette.View.extend({});
  var view = new View();
  view.close


});