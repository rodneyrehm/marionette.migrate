define(['./backbone.marionette.migrate', 'backbone.marionette.orig'], function initializeBridge(bridgeMarionetteMigration, Marionette) {
  bridgeMarionetteMigration(Marionette);
  return Marionette;
});