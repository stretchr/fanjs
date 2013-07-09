/*

fanjs
by Mat Ryer
v1.0

----

Copyright (c) 2013 Mat Ryer

Please consider promoting this project if you find it useful.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/*

  Usage:

    Fan.getFanPoint(angle, x, y, radius_x, radius_y)

      angle    - The angle (in degrees) around the center point.
      x, y     - The center position.
      radius_x - The distance away from (x, y) of the point to get.
      radius_y - (optional) an optionally different Y radius.

    You can also use Fan.getFanPointRadians if you prefer to work
    with radians instead.

*/

/*
  Fan is just a namespace for fanjs stuff.
*/
var Fan = Fan || {};

/*
  Fan.Point describes a 2D position.
*/
Fan.Point = function(x,y) {
  this.x = x;
  this.y = y;
};
Fan.Point.prototype.toString = function(){
  return "(" + this.x + "," + this.y + ")";
};
// point.offset(by) moves the point by the values specified
// in p.
Fan.Point.prototype.offset = function(p){
  this.x += p.x;
  this.y += p.y;
}

/*
  Fan.getFanPoint calcualtes the x, y point surrounding a
  center point, a degrees and radius_x (and optionally radius_y)
  distance from the middle.
*/
Fan.getFanPoint =  function(a, x, y, radius_x, radius_y) {
  return Fan.getFanPointRadians(a*(Math.PI/180), x, y, radius_x, radius_y)
};

/*
  Fan.getFanPoint calcualtes the x, y point surrounding a
  center point, rads radians and radius_x (and optionally radius_y)
  distance from the middle.
*/
Fan.getFanPointRadians =  function(rads, x, y, radius_x, radius_y) {

  // only radius_x is required
  if (!radius_y) radius_y = radius_x;

  with (Math)
  {
    var x_value = round(x + radius_x * cos(rads));
    var y_value = round(y + radius_y * sin(rads));
  }

  return new Fan.Point(x_value, y_value);

};

// if they're using jQuery, give them the plugin also.
if (jQuery) {

  // Fan.arc gets a function that can be passed as the angle
  // option, that will calcualte the angle based on an arc.
  Fan.arc = function(startDegrees, endDegrees) {
    var $start = startDegrees;
    var $end = endDegrees;
    return function(el, index, total){
      return $start + (($end-$start)/(total-1) * index);
    };
  };

  /*

    jQuery fan plugin

  */

  (function($){

    // merge creates a new object containing all the arguments
    // merged together.
    function merge() {
      var o = {};
      for (var argI in arguments) {
        var arg = arguments[argI];
        for (var field in arg) {
          o[field] = arg[field];
        }
      }
      return o;
    }

    // getVal gets the value in val, or if it's a function,
    // calls the function to get the value with the arguments specified
    // from the 2nd argument onwards.
    function getVal(val) {

      if (typeof val != "function") {
        return val;
      }

      // collect the args
      var args = [];
      if (arguments.length > 0) {
        for (var i = 1; i < arguments.length; i++)
          args.push(arguments[i]);
      }

      // return the return of the function
      return val.apply(arguments[1], args);
    
    }

    // call calls the function with the arguments (minus the function arg
    // itself) if it can.  Or ignores it if it cannot.
    function call(f, binding /*, arguments... */) {

      if (typeof f != "function")
        return;

      // collect the args
      var args = [];
      if (arguments.length > 0) {
        for (var i = 2; i < arguments.length; i++)
          args.push(arguments[i]);
      }

      // return the return of the function
      return f.apply(binding, args);

    }

    // getPoint gets a point from the value.  If it's a function, it is
    // called with getVal.  If the result is a single nubmer, a Fan.Point is
    // made containing that number for both values.  If a Fan.Point is returned,
    // it gets returned untouched.
    function getPoint(val) {
      var v = getVal.apply(this, arguments);
      if (typeof v == "number") {
        return new Fan.Point(v, v);
      }
      return v;
    }

    $.fn.fan = function(options) {
      
      var options = merge({

        angle: function(el, index, total, options) {
          return 360/total * index;
        },

        angleOffset: 0,

        center: function(el, index, total, options) {
          var p = el.parent();
          return new Fan.Point(p.width()/2, p.height()/2);
        },

        radius: function(el, index, total, options) {
          var p = el.parent();
          return new Fan.Point(p.width() / 2.5, p.height() / 2.5);
        },

        delay: function(el, index, total, options) {
          return index * getVal(options.itemDelay, el, index, total, options);
        },

        itemDelay: 100,

        duration: function(el, index, total, options) {
          return "";
        },

        // essentialCss contains CSS that must be applied to each
        // element being fanned.
        //
        // Advanced use only - best not to override this.
        essentialCss: {
          position: "absolute"
        }

      }, options);

      var $this = $(this);
      var totalCount = $this.size();
      var someAnimated = false;

      // EVENT: before
      call(options.before, $this, totalCount, options)

      // fan each item
      $this.each(function(i, el) {
        
        var el = $(el);

        // get the new position
        var center = getPoint(options.center, el, i, totalCount, options);
        var radius = getPoint(options.radius, el, i, totalCount, options);
        var angle = getVal(options.angle, el, i, totalCount, options);
        angle += getVal(options.angleOffset, el, i, totalCount, options);
        var newPos = Fan.getFanPoint(
          /* angle */     angle,
          /* center x */  center.x,
          /* center y */  center.y,
          /* radius x */  radius.x,
          /* radius y */  radius.y
        );

        // set essential CSS right away
        var essentialCss = getVal(options.essentialCss, el, i, totalCount, options);
        el.css(essentialCss);

        // offset the new position so we are talking about the center
        // of the element (and not the top left as usual)
        newPos.offset(new Fan.Point(0-el.width()/2, 0-el.height()/2));

        // build the new CSS object to fan this element
        var newCss = merge(getVal(options.css, el, i, totalCount, options), {
          left: newPos.x, top: newPos.y
        });

        // duration or update css
        var duration = getVal(options.duration, el, i, totalCount, options);

        // EVENT: start
        call(options.start, el, i, totalCount, options);

        if (duration) {

          // remember that at least something was animated
          someAnimated = true;

          // get the other animation properties
          easing = getVal(options.easing, el, i, totalCount, options);

          // set the delay
          var delay = getVal(options.delay, el, i, totalCount, options);

          var animationOptions = merge({
            duration: duration,
            easing: easing,
            complete: function(){
              
              // EVENT: end
              call(options.end, el, i, totalCount, options);

              // should we also call the 'after'?
              if (i == totalCount-1) {

                // EVENT: after
                call(options.after, $this, totalCount, options)
                
              }

            }
          }, getVal(options.animate, el, i, totalCount, options))

          // perform the animation
          el.delay(delay).animate(newCss, animationOptions);

        } else {
          
          el.css(newCss);

          // EVENT: end
          call(options.end, el, i, totalCount, options);

        }

      });

      if (!someAnimated) {

        // EVENT: after
        call(options.after, $this, totalCount, options)

      }

      // return this for chaining
      return this;

    };

  })(jQuery);

}