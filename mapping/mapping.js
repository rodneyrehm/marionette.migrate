define(function defineMapping(require) {

  // Figure out what to do with these
  // source: https://github.com/marionettejs/Marionette.Upgrade/blob/master/upgrade.py

  // onBeforeClose not changed to onBeforeDestroy

  // from Marionette.Upgrade
  // subTerm("closed", "destroy")
  // subTerm("Marionette.Layout(?!View)", "Marionette.LayoutView")
  // subTerm("Marionette.Layout\.", "Marionette.LayoutView.")
  // subTerm("Marionette.Layout\(", "Marionette.LayoutView(")
  // subTerm("onItemview", "onChildview")
  // subTerm("onItemview:","onChildview:"
  // subKey('preventClose', 'preventDestroy')

});