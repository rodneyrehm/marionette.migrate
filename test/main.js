require.config({
  baseUrl: '../marionette/2.0.3/lib',

  paths: {
    log: '../../../bower_components/log/log',
    stacktrace: '../../../bower_components/jserror/public/js/stacktrace',
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

require(['../../../src/backbone.marionette.migrate', 'backbone.marionette'], function initializeTest(bridgeMarionetteMigration, Marionette) {
  // engage Migration helper
  bridgeMarionetteMigration(Marionette);
  // bridgeMarionetteMigration(Marionette, function(message, trace) {
  //   console.warn(message);
  //   return true;
  // });

  // Marionette.$: Removed the Marionette.$ proxy. We are now using Backbone.$ directly.
  Marionette.$('body');
  // Marionette: the property Layout was renamed to LayoutView
  Marionette.Layout;

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
    // Marionette.CollectionView: the property onItemviewCustom was renamed to onChildviewCustom - both have been updated
    onItemviewCustom: function() {},
    // Marionette.CollectionView: obsolete method getItemEvents(), see http://marionettejs.com/docs/marionette.collectionview.html#collectionviews-childevents
    getItemEvents: function(){},
  });

  var collectionView = new CollectionView();
  collectionView = new Marionette.CollectionView();
  // Marionette.CollectionView.on(): the event itemview:custom was renamed to childview:custom (see property "childViewEventPrefix")
  collectionView.on('itemview:custom', function() {
    console.log('  itemview:custom event triggered');
  });
  collectionView.on('childview:custom', function() {
    console.log('  childview:custom event triggered');
  });
  // Marionette.CollectionView.trigger(): the event itemview:custom was renamed to childview:custom (see property "childViewEventPrefix")
  //   itemview:custom event triggered
  //   childview:custom event triggered
  collectionView.trigger('itemview:custom');
  console.log('triggering childview:custom');
  //   itemview:custom event triggered
  //   childview:custom event triggered
  collectionView.trigger('childview:custom');

  var region = new Marionette.Region({
    el: document.getElementById('playground')
  });
  region.show(new Marionette.View(), {
    preventClose: true
  });
});