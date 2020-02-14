When we talk about font loading, there are numerous font services out there you
can use. You can also host the fonts yourself, but for the purposes of this
article we're going to concentrate on a hosted service.

Specifically, [Google Fonts](https://fonts.google.com/).

Why Google Fonts, because the biggest service out there, offers a large range
of fonts, and best of all it's free.

## Choosing a Font ##

First thing is first though, let's see what they tell you to do when you select
a font. Let's choose the first font on their main page (in my case
[Roboto](https://fonts.google.com/specimen/Roboto)) and we'll click "Select
this font".

[![2020-01-04-165905-1414x924-scrot.png](https://i.postimg.cc/SRmQXTPK/2020-01-04-165905-1414x924-scrot.png)](https://postimg.cc/YGyBZ3Mc)

Then click the popup window at the bottom right so you can see their
instructions.

[![2020-01-04-165950-774x713-scrot.png](https://i.postimg.cc/rmkMbZM9/2020-01-04-165950-774x713-scrot.png)](https://postimg.cc/1gJkVHgg)

As you can see, they're telling you to use this link in your HTML `<head>` section:

```
<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
```

(And as an aside, once that file has been loaded, you can use the following CSS
property and value to set the font to Roboto: `font-family: 'Roboto', sans-serif;`.)

However, if you go and test your page speed in Google PageSpeed Insights, you
might come across the following warning:

> Your page has 1 blocking CSS resources. This causes a delay in rendering your
> page. None of the above-the-fold content on your page could be rendered
> without waiting for the following resources to load. Try to defer or
> asynchronously load blocking resources, or inline the critical portions of
> those resources directly in the HTML.

Or perhaps you'll see the following suggestion:

> Eliminate render-blocking JavaScript and CSS in above-the-fold content.

At this point, you have two options, one being slightly easier, and the other a
bit harder.

## WebFont Loader ##

The [WebFont Loader](https://developers.google.com/fonts/docs/webfont_loader)
is a joint initiative between Google and Adobe Typekit. It allows you - albeit
with a small amount of programming - to choose which fonts to load and more
importantly when they will be loaded.

This allows you to wait until your initial page render is complete before
loading in the font. Or, perhaps you have a case where you load in one font for
page load, and load other additional fonts (which aren't immediately used) for
later use.

```
<script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script>
 WebFont.load({
    google: {
      families:  ['Roboto' ]
    }
  });
</script>
```

Whilst this technique allows you to defer loading the Google Fonts CSS file
(and therefore the font files themselves) you do have to be careful not to show
the user a flash of unstyled content as the page renders it's initial view. Try
to only defer any fonts not used on the page above the fold.

One point to note here though is that it may only be worth switching from the
regular `<link>` to the CSS file to the WebFont Loader script if you're loading
a number of font file rather than just one or two. One reason for this is that
the itself weighs in at 12KB which is of a similar size to some of the font
files themselves!! Hence it's not worth switching for just one or two fonts.

## Use the Font Loading API ##

Yes, oh yes, there is a new API in browsers called the
[Font Loading API](https://www.w3.org/TR/css-font-loading/) which allows you to
define and manipulate font faces, track download progress, and override default
lazyload behavior. When I say new, it's been around for about 5 years and is
[supported in all major (and current) browsers](https://caniuse.com/#feat=font-loading).

Whilst this API can be used to load and track fonts, it's a little harder to
use with Google Fonts since we're actually loading a CSS file, not a font file!
We'll show you how to defer loading of a CSS file instead.

## Other Useful Techniques ##

There are other useful techniques you can use but these are also for more
specific circumstances or use-cases. For example, let's imagine you use one
font on your homepage, but you use an additional font on other pages on your
site.

By adding the following to your `<link>` tag, you can tell the browser when
visiting your homepage to preload the secondary font so it downloads it in the
background prior to the user loading another page. To do this you add
`rel="preload"` so your entire tag might be the following:

```
<!-- on your homepage -->
<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Rubik&display=swap" rel="stylesheet" rel="preload">

<!-- on other pages which require Rubik -->
<link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Rubik&display=swap" rel="stylesheet">
```

By the time the user goes to their second page, their browser will have
automatically loaded the "Rubik" font in the background in preparation to use
it. This doesn't help the initial (first page) load, but it will help the
secondary and subsequent loads. How good is that?
