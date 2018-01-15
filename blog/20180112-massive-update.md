Before giving you an update on what has changed, I owe you an apology. [CSS Minifier](https://cssminifier.com) has not
been very well recently due to a huge number of invalid minifications being sent to us. Those minifications were making
the node process race (to 100% CPU) and stayed there making the server unresponsive.

It's my job to keep CSS Minifier running as best I can for you. Yes, I know it's a free service, but it's my
responsibility to keep your expectations high and I haven't been doing that. I wish that we can keep serving you as
quickly, as consistently, and as small (minified) as possible.

Here's some background on what has been happening...

Over the past three years or so, we've noticed that not only are we increasing how many minification requests we see,
but also a huge increase on the number of invalid minifications received. Sometimes the CSS is invalid and we should be
able to deal with that, but sometimes we see either HTML or JavaScript being sent to us! Sometimes this causes the
`clean-css` program to fail (which is natural) but in other cases cause it to spin up to 100% CPU and stay there,
rendering the server pretty unresponsive.

Over the years I've tried doing things like `nice`ing the process or killing it after 15 seconds (since all
minifications should really be finished in that time). However, these haven't worked out as expected and haven't help
stabilise things. Other things I fixed early on were things like the server running out of disk space having kept all
of the uploaded and minified files.

So whilst various measures have made the service better here and there, none have fixed it completely. I'm loathe to
tell you I've fixed it all now but it is looking a lot more stable than it has for quite a while.

So let's look at some of the recent improvements for the minifier itself:

* hash the input (file) and use that as a key for caching prior results
* if a hashed input clashes with an ongoing minification, it is denied
* if a hashed input is know to cause the minifier to fail, it is immediately relayed to the user
* if a hashed input is known to have already been performed recently (in the past 12 hours), the cached minified output is returned

Other things recently improved (amongst others):

* migrate from Jade templates to Pug
* upgrade all npm packages we depend on including express, body-parser, and clean-css

Some upcoming improvements we're making this year are as follows:

* ban IP addresses (for a short time) who hit the server more necessary - it's a free service and everyone should be
  able to use it
* upgrade to a bigger server
* switch to Bootstrap v4 (the API will stay the same)
* switch back to using Nginx for the front-end `https` proxy, mainly for LetsEncrypt/CertBot stability

As you can see, we're still imrpoving CSS Minifier and as a result many of these improvements will also trickle across
to our other services such as [JavaScript Minifier](https://javascript-minifier.com/),
[PNG Crush](http://pngcrush.com), [JPG Optimiser](http://jpgoptimiser.com/), [Image Resize](http://img-resize.com/),
and [HTML Minifier](http://html-minifier.com/).

And finally, I'd like to ask you a favour. CSS Minifier has 100,000 page views per month and performs anywhere between
a few thousand and ten thousand minifications per day. On it's busiest day there were 24,590 minifications, whether
invalid, valid, empty, small, medium, or large. It's a free service and has been this way since 2010.

My question is, what do you think I should do to support it best from a financial point of view. I'd love to be able to
get at least something back for my expenses, but also for my time and effort involved in running it. Would you support
it by doing any or all of the following, or something else altogether:

1. sponsoring the site to help it improve
2. sponsoring me (e.g. Patreon) to produce more sites like it and the others mentioned above
3. paying for a premium service and get acccess to all of these online tools

Please tweet at me [@andychilton](https://twitter.com/andychilton) or email me at andychilton at gmail dot com.

Many thanks, and thanks for your understanding, patience, input, and help.

(Ends)
