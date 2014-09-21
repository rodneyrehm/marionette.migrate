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

  // API change: Removed the Marionette.$ proxy. We are now using Backbone.$ instead.
  console.log(Marionette.$('body'));

  var Conti = Marionette.Controller.extend({
    // Marionette.Controller: the method close was renamed to destroy - both have been updated
    close: function() {},
    // Marionette.Controller: the event-callback onClose was renamed to onDestroy - both have been updated
    onClose: function() {}
  });
  var conti = new Conti();
  // Marionette.Controller: the method close was renamed to destroy
  conti.close

  var View = Marionette.View.extend({
    // FIXME: this should translate to onDestroy()
    onClose: function() {
      console.log('  onClose() event-callback called ');
    }
  });
  var view = new View();
  // Marionette.View: the method close was renamed to destroy
  view.close
  // no warning because this is correct
  view.on('destroy', function() {
    console.log('  destroy event triggered');
  });
  // Marionette.View.trigger(): the event close was renamed to destroy
  //   onClose() event-callback called
  //   destroy event triggered
  view.triggerMethod('destroy');
  // Marionette.View.trigger(): the event close was renamed to destroy
  //   destroy event triggered
  view.trigger('close');

  var CollectionView = Marionette.CollectionView.extend({
    // Marionette.CollectionView: the attribute itemViewEventPrefix was renamed to childViewEventPrefix - both have been updated
    itemViewEventPrefix: 'item',
    // Marionette.CollectionView: the event-callback onAfterItemAdded was renamed to onAddChild - both have been updated 
    onAfterItemAdded: function() {},
    // FIXME: this should trigger a warning!
    onItemviewCustom: function() {},
  });

});