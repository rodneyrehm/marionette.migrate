define(function defineBackboneMarionetteMigrateMapping(){
  'use strict';

  // this file came to be by
  //  * looking at https://github.com/marionettejs/Marionette.Upgrade
  //  * running a runtime-present-API-diff between version 1.0.x and 2.0.1
  //  * manually comparing function signatures

  return {
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
        "closeRegions": "emptyRegions",
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
        "item:before:render": "!obsolete event item:before:render",
        "item:rendered": "!obsolete event item:rendered",
        "item:before:close": "!obsolete event item:before:close",
        "item:closed": "!obsolete event item:closed",
      }
    },

    "CollectionView": {
      "parent": "View",
      "attribute": {
        "itemViewEventPrefix": "childViewEventPrefix",
        "itemViewOptions": "childViewOptions",
        "itemEvents": "childEvents",
      },
      "method": {
        "addChildView": "_onCollectionAdd",
        "addChildViewEventForwarding": "proxyChildEvents",
        "addItemView": "addChild",
        "appendBuffer": "attachBuffer",
        "appendHtml": "attachHtml",
        "buildItemView": "buildChildView",
        "closeChildren": "destroyChildren",
        "closeEmptyView": "destroyEmptyView",
        "getItemEvents": "!obsolete method getItemEvents(), see http://marionettejs.com/docs/marionette.collectionview.html#collectionviews-childevents",
        "getItemView": "getChildView",
        "removeItemView": "_onCollectionRemove",
        "renderItemView": "renderChildView",
        "triggerBeforeRender": "!obsolete method triggerBeforeRender(), use triggerMethod() instead",
        "triggerRendered": "!obsolete method triggerRendered(), use triggerMethod() instead",
        // inherited:
        // "close": "destroy"
      },
      "event": {
        "after:item:added": "add:child",
        "before:item:added": "before:add:child",
        "collection:before:close": "before:destroy:collection",
        "collection:closed": "destroy:collection",
        "collection:before:render": "before:render:collection",
        "collection:rendered": "render:collection",
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
        "itemView": "childView",
      },
      "method": {
        "getItemView": "getChildView",
        "getItemViewContainer": "getChildViewContainer",
        "renderModel": "_renderRoot",
        "appendBuffer": "attachBuffer",
        "resetItemViewContainer": "resetChildViewContainer",
      },
      "event": {
        "composite:collection:before:render": "before:render:collection",
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
        "closeRegions": "emptyRegions",
      },
      "event": {
        "initialize:before": "before:start",
        // removed
        "initialize:after": "!obsolete event initialize:after",
        // added
        // "": "before:add:region"
        // "": "add:region"
        // "": "before:remove:region"
        // "": "remove:region"
      }
    }
  };

});
