# Marionette.Migrate: Migrate older Backbone.Marionette code to Marionette 2.0+

This is a **Work In Progress** (but is `alpha` stage)


## TODO: Look at backward-filling the following:

* [Region] Calling show on a region with the same view that is currently shown is now a noop. Previously the view would be re-rendered. You can force a rerender by passing forceShow: true with the region show options. `MyApp.mainRegion.show(myView, {forceShow: true});`
* [View] API change: Returning false from onBeforeClose no longer prevents the view from closing. This behavior was inconsistent with the rest of the library, and would require far too much logic to respect in all cases. Instead of returning false, you should handle your logic before calling close on the view.
* [View] API change: childEvents callbacks no longer receives the event name as the first argument, making the arguments of those callbacks consistent with standard trigger callbacks.

---

## TODO:

* convert test/main.js to proper tests (QUnit? Mocha? halp!)
* Test against Qivicon PairingWizard
* Write up Readme and blog post
  * `bridgeMarionetteMigration(Marionette)` to initialize
  * `bridgeMarionetteMigration(Marionette, function(message, stackTrace){})` to initialize with custom logging message
  * `Marionette._migrationLog` to get a list of all migration log hits

---
---

in the project I'm currently working on we're using the following versions:

```
library         in use      most current
jQuery          1.9.1       2.1.0
Underscore.js   1.4.4       1.6.0
Backbone.js     1.0.0       1.1.2
Marionette      1.0.2       2.0.1
```

---

Upgrading Marionette is a problem because so much has changed in [version 2](https://github.com/marionettejs/backbone.marionette/releases/tag/v2.0.0), see [Marionette.Upgrade](https://github.com/marionettejs/Marionette.Upgrade) to get a feeling. The simple text based (context-free) search and replace offered by Marionette.Upgrade did not help much in our case. I tried walking our codebase and gave up after about 3 hours. The tool was a pain to use (not much context to go on, no change history, …).

Without context, a simple regular expression based approach is simply not able to distinguish between the old `View.prototype.close` now being `View.prototype.destroy` and `Region.prototype.close` now being `Region.prototype.empty` - let alone figure out that virtually every other library I'm using has a `close()` method as well. That's why the provided Upgrade tool - a python-based regular expression beast - did not help *at all*.

Not believing I was the only one with this problem, I kept searching. The [Marionette.Migrate](https://github.com/ccamarat/Marionette.Migrate) plugin reverts some of the deprecations and prints warnings to the browser's console. It hasn't been updated in 5 months, no issues have been reported, and it completely lacks events. Obviously not going to help anyone either…

That's when I decided to create Marionette.Migrate (yes, ignoring that the name was already taken) inspired by [jQuery's Migrate Plugin](https://github.com/jquery/jquery-migrate/).


## bla bla bla Sound Bites bla bla bla ##

> Read Release Notes and the Change Log, but never rely on them. Only source code knows the truth.

* see https://github.com/marionettejs/backbone.marionette/releases/tag/v2.0.0 for hints

---

That leaves me with one of three conclusions:

* I'm taking this stuff way too seriously.
* Nobody is upgrading existing projects to Marionette v2.0.x.
* Nobody is using Marionette.
* I'm not only bad at Math, but also suck at computers, possibly even breathing.

---

I'm still not willing to throw out the entire team's experience of 2 years with this framework, not to mention the labor produced in those two years. So please keep your »Just use AngularJS!« or even better yet »Have you tried ReactJS?« to yourself and your short-lived or recently started projects. Thank you. If you can't deal with this heresy, go read [Ben Vinegar](https://twitter.com/bentlegen)'s excellent post [The best tool for the job, isn’t always](https://medium.com/@bentlegen/the-best-tool-for-the-job-isnt-always-6ed364f3f775).

