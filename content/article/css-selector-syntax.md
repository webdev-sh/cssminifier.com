The syntax of a CSS selector can get quite complicated quite quickly, however
we'll walk you through a few examples so you can see how to build things
up. Once you know the basics, you should be able to extend what you know.

Please note though, since [BEM (Block, Element, and Modifier)](what-is-bem)
came to the fore, and other techniques for creating CSS (such as CSS-in-JS) it
has become good practice to keep your CSS selectors relatively simple but
knowing these rules can help you just about when you need it.

In this article we'll look at the following examples where we'll be selecting
elements:

1. using basic selectors, such as:
  1. a universal selector
  1. of a specific type
  1. with a particular class
  1. using a unique ID
  1. using an attribute, and optionally its value
1. using combinations, such as:
  1. the descendent operator
  1. using the child combinator
  1. a sibling
  1. adjacent elements
1. using pseudo elements such as:
  1. pseudo classes
  1. pseudo elements
1. using a grouping selector

Whilst we won't look at the grouping selector in-depth, just know that it can
be used with any other valid selector. For example `a, b { ... }` selects elements
using the selectors `a` and `b`, and those selectors could be as simple or as
complicated as you require.

Oftentimes in the text below you'll see examples of grouping selectors in
amongst the other examples, and we'll call it out as we see it. Essentially
it's an additive selector (it adds one set to another set or sets) rather than
specialising the selector as all of the others do.

## Basic Selectors ##

There are quite a few basic selectors which can of course be used in
combination with each other, or with pseudo selectors as well.

### The Universal Selector ###

The first and simplest rule is to select every single element on the page:

```
* {
  font-family: Arial, sans-serif;
}
```

Whilst this is simple to add, just know that in the past it was considered that
the universal selector could slow the page down since this selector would be in
effect for everything on the page. Nowadays (2019) I don't consider it a
problem since browsers have seen this pattern very many times and are more than
likely to optimise it for this very use-case.

(Note: whilst you can use something called "namespaces" with the universal
selector, it's a little-known and rarely used feature, so we won't be going
into any more depth here.)

### The Type Selector ###

The type selector applies to elements of a particular type. You may want all
paragraph text on your page to be a dark grey rather than a deep black. The
following will set this for all `<p>` tags:

```
p {
  color: #333;
}
```

You may also want all headers to be a slightly off-blue. Using a grouping
selector we can make this rule apply to all six levels:

```
h1, h2, h3, h4, h5, h6 {
  color: #3d7e9a;
}
```

### The Class Selector ###

When you wish to apply styles to certain elements but not to elements of all
the same type, you could add a class to each one `<div
class="highlight">...</div>` and select it in the CSS as follows:

```
.highlight {
  background-color: yellow;
}
```

It doesn't matter what type the element is, just that it has a class of
`highlight`.


### The ID Selector ###

In HTML, IDs are used for unique elements which only appear once on the
page. Whilst it's good to know this property exists and can be references in
CSS, it's also good to know that it's probably a selector you should
avoid. It's more useful in JavaScript than CSS, however it is valid and it can
be used wisely from time to time.

```
#lead {
  font-style: italic;
}
```

This will make the element which has the `id="lead"` ID italic.

### The Attribute Selector ###

The attribute selector appears inside square brackets, must have a property
name, and can optionally have a property value.

There are some useful attribute selectors you can use but first let's take a
look at how to use an attribute for presence rather than its value. Let's
select any element with the property `required`:

```
[required] {
  border: 1px solid grey;
}
```

But let's see if we can change that red to a green if there is something
already entered into the input:

```
[required][value=''] {
  border: 1px solid red;
}

In general you'd probably also use the Type Selector to make sure to only
select elements of type `input`:

```
input[required] {
    border: 1px solid grey;
}
```

However, you can use multiple attribute selectors so that you get even more
specific elements too. The following will select all elements of type `input`
that are required, and that also are of type `text`:


```
input[required][type="text"] {
    border: 1px solid grey;
}
```

Whilst we won't go into further details here, there are also other ways of
selecting certain elements using various special characters:

* `a[href*="example"]` - a elements which contain "example"
* `a[href$=".org"]` - a elements ending in ".org"
* `a[class~="logo"]` - a elements whose class attribute contains the word "logo"

Further information can be found on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).

## Combination Selectors ##

A combination selector means to choose one element based on it's relationship
to another.

### Adjacent Elements Combinator ###

This combinator is denoted with the plus symbol `+` and tells the browser to
match the 2nd element only if it comes immediately after the first and both
belong to the same parent.

For example, let's select any Paragraph which comes immediately after a Level 2
Heading so that more emphasis can be put on the introduction paragraph:

```css
h2 + p {
  font-size: large;
}
```

### (General) Sibling Combinator ###

Whilst the above looks for any immediate sibling after the first selector, this
combinator can select all siblings (again, after) the first selector.

```html
<p>This paragraph is not selected.</p>
<h2>A Heading</h2>
<p>Paragraph one.</p>
<pre>Not affected.</pre>
<p>The 2nd paragraph.</p>
```

```css
h2 ~ p {
  color: blue;
}
```

This selector will select all of the paragraphs below the `<h2>` but not the `<pre>`.

### The Child Combinator ###

To select direct children of another selector, use the `>` combinator to
achieve this. For example, you might want to highlight in red the items in the
top-level list, but not the next level list:

```html
<h2>Heading</h2>
<p>Not Red</p>
<div>
  <p>Red!</p>
</div>
```

```css
div > p {
  color: red;
}
```

This might not be overly useful most of the time, but is invaluable when needed
and can help keep your CSS from becoming a sprawling mess.

### The Descendent Operator ##

This combinator is very much the default since it requires no specific symbol
to be in effect, apart from separating the first and second selectors by a
space. You might want to set all paragraphs within the article to have a
sans-serif font but any paragraphs on the page not inside an article to be
serif:

```
p {
  font-family: serif;
}

article p {
  font-family: sans-serif;
}
```

There are other experimental combination selectors such as the Column
Combinator, but since they are experimental we won't go into them here.

## Pseudo Classes and Elements ##



### Pseudo Classes ###


### Pseudo Elements ###
