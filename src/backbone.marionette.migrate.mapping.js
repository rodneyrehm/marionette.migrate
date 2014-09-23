define(function defineBackboneMarionetteMigrateMapping(){
  'use strict';

  // this file came to be by
  //  * looking at https://github.com/marionettejs/Marionette.Upgrade
  //  * running a runtime-present-API-diff between version 1.0.x and 2.0.1
  //  * manually comparing function signatures

  return {
    /*
      upgrade.py: listed but not found in source of Marionette 1.8.8
      event: {
        "before:item:rendered"
        "before:item:remove"
        "composite:before:render:collection"
      }
    */

    "Controller": {
      "method": {
        "close": "destroy",
      },
      "event": {
        // added
        // "": "before:destroy",
        "close": "destroy",
      }
    },

    "Region": {
      // show() options.preventClose -> options.preventDestroy
      "method": {
        "close": "empty",
        "ensureEl": "_ensureElement",
        "open": "attachHtml",
      },
      "event": {
        "close": "empty",
        // added
        // "": "before:empty",
        // "": "before:swap"
        // "": "swap"
      }
    },

    "RegionManager": {
      "parent": "Controller",
      "method": {
        "closeRegions": "emptyRegions", // upgrade.py says "destroyRegions" (but not found in source of 2.0.3)
        // inherited:
        // "close": "destroy"
      },
      "event": {
        "region:add": "add:region",
        "region:remove": "remove:region",
        // added
        // "": "before:add:region",
        // "": "before:remove:region",
      }
    },

    "View": {
      "attribute": {
        "isClosed": "isDestroyed",
      },
      "method": {
        "close": "destroy",
      },
      "event": {
        "before:close": "before:destroy",
        "close": "destroy",
      }
    },

    "ItemView": {
      "parent": "View",
      "method": {
        // inherited:
        // "close": "destroy"
      },
      "event": {
        // removed
        "item:before:render": "!obsolete event item:before:render", // upgrade.py says "before:render" (but that's a different event)
        "item:rendered": "!obsolete event item:rendered", // upgrade.py says "render" (but that's a different event)
        "item:before:close": "!obsolete event item:before:close", // upgrade.py says "before:destroy" (but that's a different event)
        "item:closed": "!obsolete event item:closed", // uprade.py says "destroy" (but that's a different event)
        "itemview:item:before:render": "!obsolete event itemview:item:before:render",
        "itemview:item:rendered": "!obsolete event itemview:item:rendered",
        "itemview:item:before:close": "!obsolete event itemview:item:before:close",
        "itemview:item:closed": "!obsolete event itemview:item:closed",
        "item:before:destroy": "!obsolete event itemview:item:closed",
      }
    },

    "CollectionView": {
      "parent": "View",
      "attribute": {
        "itemViewEventPrefix": "childViewEventPrefix",
        "itemViewOptions": "childViewOptions",
        "itemEvents": "childEvents",
        "itemView": "childView",
      },
      "method": {
        "addChildView": "_onCollectionAdd", // upgrade.py says "onChildAdd" (but not found in source of 2.0.3)
        "addChildViewEventForwarding": "proxyChildEvents",
        "addItemView": "addChild",
        "appendBuffer": "attachBuffer",
        "appendHtml": "attachHtml",
        "buildItemView": "buildChildView",
        "closeChildren": "destroyChildren",
        "closeEmptyView": "destroyEmptyView",
        "getItemEvents": "!obsolete method getItemEvents(), see http://marionettejs.com/docs/marionette.collectionview.html#collectionviews-childevents",
        "getItemView": "getChildView",
        "removeItemView": "_onCollectionRemove", // upgrade.py says "removeChildView" (but expects view not model)
        "renderItemView": "renderChildView",
        "triggerBeforeRender": "!obsolete method triggerBeforeRender(), use triggerMethod() instead",
        "triggerRendered": "!obsolete method triggerRendered(), use triggerMethod() instead",
        "onChildRemove": '_onCollectionRemove',
        // inherited:
        // "close": "destroy"
      },
      "event": {
        "after:item:added": "add:child",
        "before:item:added": "before:add:child",
        "collection:before:close": "before:destroy:collection", // upgrade.py sas "before:destroy" (but cannot see where that should happen)
        "collection:closed": "destroy:collection", // upgrade.py says "destroy" (but cannot see where that should happen)
        "collection:before:render": "before:render:collection",
        "collection:rendered": "render:collection", // upgrade.py says "render" (but cannot see where that should happen)
        "item:removed": "remove:child",
        // added
        // "": "before:render:empty"
        // "": "render:empty"
        // "": "before:remove:child"
      }
    },

    "CompositeView": {
      "parent": "CollectionView",
      "attribute": {
        "itemViewContainer": "childViewContainer",
      },
      "method": {
        "getItemViewContainer": "getChildViewContainer",
        "renderModel": "_renderRoot",
        "resetItemViewContainer": "resetChildViewContainer",
      },
      "event": {
        "composite:collection:before:render": "before:render:collection", // upgrade.py says "before:render:template" (but that's a different event)
        "composite:collection:rendered": "render:collection",
        "composite:model:rendered": "render:template",
        "composite:rendered": "render",
        // added
        // "": "before:render:template"
      }
    },

    "LayoutView": {
      "_name": "Layout",
      "attribute": {
        "regionType": "regionClass",
      },
      "method": {
        "close": "destroy",
      },
      "event": {
        "region:add": "add:region",
        "region:remove": "remove:region",
        // added
        // "": "before:region:add"
        // "": "before:region:remove"
      }
    },

    "Behavior": {
      "method": {
        "close": "destroy",
      }
    },

    "Behaviors": {
      "method": {
        "close": "destroy",
      }
    },

    "Application": {
      "method": {
        "closeRegions": "emptyRegions", // upgrade.py says "destroyRegions" (but not found in source of 2.0.3)
      },
      "event": {
        "initialize:before": "before:start",
        // removed
        "initialize:after": "!obsolete event initialize:after", // upgrade.py says "start" (but that's a different event)
        // added
        // "": "before:add:region"
        // "": "add:region"
        // "": "before:remove:region"
        // "": "remove:region"
      }
    }
  };

});
