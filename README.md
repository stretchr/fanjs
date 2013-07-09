
# fanjs - Rounding the square
By Mat Ryer

jQuery plugin and supporting code to allow you to calculate the position of elements in a circular pattern around a center point.  

## Demos

  * see FanJS in action: http://matryer.com/fanjs/demo/1.html

## Usage

    $("elements").fan(options);

## Overview

Fanjs calculates the positions (and sets them using jQuery) of elements, centered around a point on the page.

By default, the elements will be fanned around the center of their parent container.  For exmaple, `<li>`s will be fanned around their `<ul>` parent.

You can customise the behaviour of fanjs using the options described below.

### Options

All options can either be a literal value, or a function that
calculates and returns the value.

#### Fanning:

`angle` The angle at which the item should be fanned from center.  Default: Evenly spread items.

You can specify an arc using the Fan.arc function like this:

    {
      angle: Fan.arc(0, 180)
    }

where 0 = start angle, 180 = end angle

`angleOffset` The number of degrees to offset the angle by for each item.  This allows you to create less uniform fans.  Default: `0`

`radius` The Fan.Point containg the X and Y distance from center that the item should be fanned out at.  Default: A suitable radius for the parent container.

`center` The Fan.Point describing the center point of the fan.  Default: The center of the parent container.

#### Animation:

  * (see http://api.jquery.com/animate/)

Fanjs allows you to control how it is animated:

`duration` The jQuery animation duration option, a string or number describing how fast the animation will take to complete.

There must be a duration property in order for animation to occur at all.  Use {duration:400} for default jQuery behaviour.  Default: `""` (i.e. don't animate)

`delay` The delay before animating the element.

Default: options.itemDelay per item (e.g. itemIndex * 100)

`itemDelay` The ms to delay for each item.  Used by the default 'delay' function.  Default: `100`

`easing` The jQuery easing to use when animating.  Default: Nothing (i.e. jQuery default)

`animate` An object of options that will make up the jQuery animate options parameter. http://api.jquery.com/animate/#animate-properties-options  Default: duration, easing, complete etc.

#### Style:

`css` More jQuery CSS options to be applied to the element.  Useful for adding extra animation transitions to the elements as they are being fanned.  Default: `{}` (i.e. nothing)

### Events

`before` Called once before any items get fanned.

    before: function(total, options) {
      // 'this' = all elements
    }

`after` Called once after all items have been fanned.

    after: function(total, options) {
      // 'this' = all elements
    }

`start` Called before each item starts being fanned.

    start: function(element, index, total, options) {
      // 'this' = individual element
    }

`end` Called after each item has been fanned.

    end: function(element, index, total, options) {
      // 'this' = individual element
    }

## Advanced

The jQuery plugin is optional, and you can instead just use the underlying calculation functions directly yourself.

#### `Fan.getFanPoint(a, x, y, radius_x, radius_y)`

`getFanPoint` gets the `Fan.Point` describing the position at angle `a` degrees, `radius_x`,`radius_y` distance away from the center point at `x`,`y`.

#### `Fan.getFanPointRadians(rads, x, y, radius_x, radius_y)`

`getFanPointRadians` gets the `Fan.Point` describing the position at angle `rads` radians, `radius_x`,`radius_y` distance away from the center point at `x`,`y`.

#### `Fan.Point`

The `Fan.Point` object contains simply `x`, `y` coordinates.

    new Fan.Point(x, y)

##### `Fan.Point.offset`

The offset function adds one `Fan.Point` to another.
