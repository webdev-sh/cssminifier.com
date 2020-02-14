When we optimize a CSS file, we're not specifically talking about CSS
minification which makes the content inside the CSS file smaller, but instead
we manually optimize exactly what we put in there in the first place.

(Note: there is also an article on [CSS Minification](what-is-css-minification).)

In general the best and most effective way to optimize what gets sent to the
browser is only send what is needed. This is a two-fold strategy and relates to
**what** you're sending, and **when** you're sending it.

In some circumstances you may be doing some or all of the following and
avoiding all of these situations really helps. Sending styles that are:

1. inside certain selectors which are not used by your site
1. overridden by other styles and therefore useless
1. vendor prefixed styles which are no longer recommended
1. invalid selectors, properties, or values which are are ignored
1. sent to the browser en-masse

We'll take a look at each of these, with examples, so you can understand how to
avoid them in your own stylesheets.

## Avoid Unused CSS #

Just like an unwanted birthday present, sending the browser something it
doesn't need isn't the best idea. All the browser will do is ignore it but it
can only be ignored after it has already done the work of parsing the CSS and
then figuring out if it is required or not.

Let's take a simple example of the following HTML page (note: I'm leaving out
all other elements apart from the body):

```
<body>
  <h1>CSS Minfifier</h1>
  <p>Welcome to my site.</p>
</body>
```

If we send the following CSS, we can see that the `h1 { ... }` selector will
tell the browser to present the `<h1>` heading in blue, but because there is no
`<h2>` element present in the page, that style will be ignored.

```
h1 {
  color: blue;
}

h2 {
  color: red;
}

p {
  color: darkgrey;
}
```

Of course the `p { ... }` selector is also used since a `<p>` tag is present
but that still means around 1/3rd of the stylesheet is unused and doesn't need
to be present.

Figuring out whether any styles in your stylesheet are unused can be quite
complex, but help is at hand with some automated tools which enable you to
check this automatically. Many of them can and will output a new stylesheet for
you containing only the styles in use, which can be a time (and sanity) saver
for you, and save processing time in the browser as well.

## Avoid Overridden Styles ##

Sending unused styles to the browser as above is fairly easy to see, however we
must be careful not to send the same styles twice, or styles that have been
overridden.

There are some real use-cases for sending the same styles but we'll look at
them shortly. First though, let's take a look at what we mean.

Take an example style in one stylesheet such as the following:

```
h1, h2, h3, h4, h5, h6 {
  font-weight: bold;
}
```

And perhaps in another stylesheet or further down in the same file we have:

```
h1, h2, h3, h4, h5, h6 {
  font-weight: bolder;
}
```

As you can probably guess, the 2nd rule wins since it overrides the first
rule. (Note: it can be way way more complex than this based on something called
[specificity](https://www.w3.org/TR/CSS1/#cascading-order), however in this
case the specificity of both rules are the same, therefore the latter wins.)

In the case where we're sending two rules (using the same selector, and
therefore the same specificity) we could just make sure that the first rule is
not sent at all by being deleted completely, therefore optimising the first
file just a little bit more than as originally sent.

### Themes ###

There is at least one use-case however where sending duplicate - same
selector - styles is useful and that is theming. In most cases we send a base
stylesheet containing all styles needed to display the site correctly, with a
base set of styles to make it also look nice.

e.g. `/stylesheets/base.css`

After that we send another stylesheet based on the theme we want to
display. The theme may be based on an event such as a sporting final, a date
such as Christmas, or a user setting.

Let's take for example a user who chooses between the "Blue" or "Green"
themes. We'd send the original `/stylesheets/base.css` as normal but then also
send either the `/stylesheets/blue.css` or `/stylesheets/green.css` based on
their preference.

In this case it's hard to come up with a base stylesheet that omits all of the
themes' styles, especially when you want the base theme to also look nice, so
sending some duplicate styles in a theme-specific stylesheet is fine.

## Vendor Prefixed Properties ##

```
-webkit-transition: all 4s ease;
-moz-transition: all 4s ease;
-ms-transition: all 4s ease;
-o-transition: all 4s ease;
transition: all 4s ease;
```

Compare all of that gumph to the following, which now works across all
browsers:

```
transition: all 4s ease;
```

Yep, even before you minify your CSS, you definitely need to review and take
out the old cruft, but also be aware that some developers may still be adding
new cruft in there that is no longer needed.

## Invalid Selectors or CSS ##

It's common sense to only send valid CSS but you'd be surprised at how many
selectors or styles there are in an average website which are invalid.

Take some of the (now old school and no longer recommended) browser prefixed
styles such as `-webkit-background-size` or `-moz-background-size`. There was a
time when browser prefixed styles made sense but that practice has been
deprecated.

In general there are three things to look out for:

1. invalid selectors
1. invalid or misspelt CSS property names
1. invalid or incorrect CSS property values

Let's look firstly at an example of an invalid selector. In general,
[selectors must be of a certain format](what-is-a-css-selector) so anything
invalid will be ignored. e.g.

```
h1..headline {
  font-size: 48px;
}
```

Notice that there are two full-stops/periods in the selector, and therefore the
selector is invalid. Also note that if an invalid selector is used in a list,
then the entire list is invalid even though only one item of the list is
invalid. e.g.

```
h1..headline, h2.headline {
  color: red;
}
```

Even though `h2.headline` is valid and should color any `<h2
class="headline">...</h2>` elements, the entire selector is invalid because
`h1..headline` is invalid.

(Yes, you could just use the `.headline` selector, but let's imagine you didn't
want `h3.headline` to be colored red!)

An example of an invalid property would be `colour` since the correct spelling
is the Amerian version of `color`. Hence, the following is invalid and should
be fixed or removed.

```
p {
  colour: black;
}
```

And finally, invalid property values are also ignored. In the pre-defined
colour set that can be used as colors, `pinkypurpley` isn't defined and
therefore not allowed.

```
p {
  color: pinkypurpley;
}
```

## Code Splitting ##

Generally code splitting is used for JavaScript however it can be used for CSS
too.

In many sites, the amount of CSS can become quite large, however not all of the
rules are used at any particular time. This is most relevant at first load
where the number of styles needed to display (or render) the first page - above
the fold - might be a small percentage of the overall styles needed for the
entire site.

One way to optimise load time is to send only the styles needed for that first
part of the page and then send all of the other styles a bit later on. This can
be done either by sending a dynamic request a few seconds after page load in a
Single-Page App (SPA) or perhaps when the 2nd or subsequent page is loaded.

By deferring loading of any styles that are unneeded on the first page we can
increase the loading speed of the site perceived by the user. Once we know the
page has rendered, we can then send the rest of the styles needed for the site
in the background, so the user doesn't have to wait for them.
