define(function defineBackboneMarionetteMigrateMapping(){
  'use strict';

  // this file came to be by
  //  * looking at https://github.com/marionettejs/Marionette.Upgrade
  //  * running an runtime-present API diff between version 1.0.x and 2.0.1
  //  * manually comparing function signatures

  return {
    // TODO: [event] before:close
    // TODO: [event] before:item:remove

    "Controller": {
      "method": {
        "close": "destroy"
      },
      "event": {
        "close": "destroy"
      }
    },

    "Region": {
      "method": {
        "close": "empty",
        "ensureEl": "_ensureElement",
        "open": "attachHtml"
      },
      "event": {
        "close": "empty"
      }
    },

    "RegionManager": {
      "parent": "Controller",
      "method": {
        "closeRegions": "emptyRegions",
        "close": "destroy"
      },
      "event": {
        "region:add": "add:region",
        "region:remove": "remove:region"
      }
    },

    "View": {
      "attribute": {
        "isClosed": "isDestroyed"
      },
      "method": {
        "close": "destroy"
      },
      "event": {
        "before:close": "before:destroy",
        "close": "destroy"
      }
    },

    "ItemView": {
      "parent": "View",
      "method": {
        "close": "destroy"
      },
      "event": {
        "item:before:close": "before:destroy",
        "item:before:render": "before:render",
        "item:closed": "destroy",
        "item:rendered": "render"
      }
    },

    "CollectionView": {
      "parent": "View",
      "attribute": {
        "itemViewEventPrefix": "childViewEventPrefix",
        "itemViewOptions": "childViewOptions",
        "itemEvents": "childEvents"
      },
      "method": {
        "addChildView": "_onCollectionAdd",
        "addChildViewEventForwarding": "proxyChildEvents",
        "addItemView": "addChild",
        "appendBuffer": "attachBuffer",
        "appendHtml": "attachHtml",
        "buildItemView": "buildChildView",
        "close": "destroy",
        "closeChildren": "destroyChildren",
        "closeEmptyView": "destroyEmptyView",
        "getItemEvents": "!obsolete, see http://marionettejs.com/docs/marionette.collectionview.html#collectionviews-childevents",
        "getItemView": "getChildView",
        "removeItemView": "_onCollectionRemove",
        "renderItemView": "renderChildView",
        "triggerBeforeRender": "!obsolete, use triggerMethod() instead",
        "triggerRendered": "!obsolete, use triggerMethod() instead"
      },
      "event": {
        "after:item:added": "add:child",
        "before:item:added": "before:add:child",
        "collection:before:close": "before:destroy",
        "collection:before:render": "before:render:collection",
        "collection:closed": "destroy",
        "collection:rendered": "render:collection",
        "item:removed": "remove:child",
        "itemview:*": "childview:*"
      }
    },

    "CompositeView": {
      "parent": "CollectionView",
      "attribute": {
        "itemView": "childView"
      },
      "method": {
        "getItemView": "getChildView",
        "getItemViewContainer": "getChildViewContainer",
        "renderModel": "_renderRoot",
        "appendBuffer": "attachBuffer",
        "resetItemViewContainer": "resetChildViewContainer"
      },
      "event": {
        "composite:collection:before:render": "before:render:template",
        "composite:collection:rendered": "render:collection",
        "composite:model:rendered": "render:template",
        "composite:rendered": "render"
      }
    },

    "LayoutView": {
      "_name": "Layout",
      "attribute": {
        "regionType": "regionClass"
      },
      "method": {
        "close": "destroy"
      }
    },

    "Behavior": {
      "method": {
        "close": "destroy"
      }
    },

    "Behaviors": {
      "method": {
        "behaviors": "destroy"
      }
    },

    "Application": {
      "method": {
        "closeRegions": "emptyRegions"
      },
      "event": {
        "initialize:after": "start",
        "initialize:before": "before:start"
      }
    }
  };

});
