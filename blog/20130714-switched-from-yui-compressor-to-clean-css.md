Today I have just released a new version of [cssminifier.com](/) which uses a different minifier in the backend.

Prior to today I was using the JavaScript version of the [YUI compressor](https://github.com/yui/yuicompressor/) but I
realised that the JavaScript version was no longer in the repository. I guess it is no longer supported. In the past, I
had to update the code for this manually since it wasn't in [npm](https://npmjs.org/) and whilst it was okay, it was
slightly painful.

To ease this manual procedure I decided to use something straight out of the box from npm. After installing a few
different packages and trying them out, I settled on using [clean-css](https://npmjs.org/package/clean-css) by
[GoalSmashers](https://github.com/GoalSmashers/). It's a very well written library and it has lots of tests. But the
most important thing is that it's a library that is supported and frequently updated - which is great news! Thanks to
the GoalSmashers team for producing such an awesome library and an important part of the npm and node.js ecosystem.

Another improvement is that *clean-css* also supports media queries so that's great news in today's mobile first world.

The difference between the old and new minifiers isn't much and whilst there might be a few bytes difference in the
size, hopefully there won't be any major incompatibilites. *clean-css* tries to be faster but I didn't test it against
the JS version of YUI Compressor.

Have fun and happy CSS'ing!
