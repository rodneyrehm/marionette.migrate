# Upgrading to Marionette 2.x



```
library         in use      most current
jQuery          1.9.1       2.1.0
Underscore.js   1.4.4       1.6.0
Backbone.js     1.0.0       1.1.2
Marionette      1.0.2       2.0.1
```

Marionette is a real problem because so much has changed, see [Marionette.Upgrade](https://github.com/marionettejs/Marionette.Upgrade) to get a feeling. The simple text based (context-free) search and replace offered by Marionette.Upgrade did not help much in our case. I tried walking our codebase and gave up after about 3 hours. The tool was a pain to use (not much context to go on, no change history, …). Also Marionette.Upgrade failed to catch *many* issues ([#11](https://github.com/marionettejs/Marionette.Upgrade/issues/11), [#13](https://github.com/marionettejs/Marionette.Upgrade/issues/13), …) and caused new problems with [Regions](https://github.com/marionettejs/Marionette.Upgrade/issues/8). 

Without context a simple regular expression based approach will simply not be able to distinguish between the old `View.prototype.close` now being `View.prototype.destroy` and `Region.prototype.close` now being `Region.prototype.empty`

The [Marionette.Migrate](https://github.com/ccamarat/Marionette.Migrate) plugin reverts some of the deprecations and prints warnings to the browser's console. It hasn't been updated in 5 months, no issues have been reported, and it completely lacks events.


```
View

  close -> destroy

  
Region

  close -> empty


CollectionView, CompositeView

  itemView -> childView


```
