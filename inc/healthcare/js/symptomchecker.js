(function () {
  'use strict';

  const methods$1 = {};
  const names = [];

  function registerMethods (name, m) {
    if (Array.isArray(name)) {
      for (const _name of name) {
        registerMethods(_name, m);
      }
      return
    }

    if (typeof name === 'object') {
      for (const _name in name) {
        registerMethods(_name, name[_name]);
      }
      return
    }

    addMethodNames(Object.getOwnPropertyNames(m));
    methods$1[name] = Object.assign(methods$1[name] || {}, m);
  }

  function getMethodsFor (name) {
    return methods$1[name] || {}
  }

  function getMethodNames () {
    return [ ...new Set(names) ]
  }

  function addMethodNames (_names) {
    names.push(..._names);
  }

  // Map function
  function map (array, block) {
    let i;
    const il = array.length;
    const result = [];

    for (i = 0; i < il; i++) {
      result.push(block(array[i]));
    }

    return result
  }

  // Filter function
  function filter (array, block) {
    let i;
    const il = array.length;
    const result = [];

    for (i = 0; i < il; i++) {
      if (block(array[i])) {
        result.push(array[i]);
      }
    }

    return result
  }

  // Degrees to radians
  function radians (d) {
    return d % 360 * Math.PI / 180
  }

  // Convert dash-separated-string to camelCase
  function camelCase (s) {
    return s.toLowerCase().replace(/-(.)/g, function (m, g) {
      return g.toUpperCase()
    })
  }

  // Convert camel cased string to dash separated
  function unCamelCase (s) {
    return s.replace(/([A-Z])/g, function (m, g) {
      return '-' + g.toLowerCase()
    })
  }

  // Capitalize first letter of a string
  function capitalize (s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  // Calculate proportional width and height values when necessary
  function proportionalSize (element, width, height, box) {
    if (width == null || height == null) {
      box = box || element.bbox();

      if (width == null) {
        width = box.width / box.height * height;
      } else if (height == null) {
        height = box.height / box.width * width;
      }
    }

    return {
      width: width,
      height: height
    }
  }

  /**
   * This function adds support for string origins.
   * It searches for an origin in o.origin o.ox and o.originX.
   * This way, origin: {x: 'center', y: 50} can be passed as well as ox: 'center', oy: 50
  **/
  function getOrigin (o, element) {
    const origin = o.origin;
    // First check if origin is in ox or originX
    let ox = o.ox != null
      ? o.ox
      : o.originX != null
        ? o.originX
        : 'center';
    let oy = o.oy != null
      ? o.oy
      : o.originY != null
        ? o.originY
        : 'center';

    // Then check if origin was used and overwrite in that case
    if (origin != null) {
      [ ox, oy ] = Array.isArray(origin)
        ? origin
        : typeof origin === 'object'
          ? [ origin.x, origin.y ]
          : [ origin, origin ];
    }

    // Make sure to only call bbox when actually needed
    const condX = typeof ox === 'string';
    const condY = typeof oy === 'string';
    if (condX || condY) {
      const { height, width, x, y } = element.bbox();

      // And only overwrite if string was passed for this specific axis
      if (condX) {
        ox = ox.includes('left')
          ? x
          : ox.includes('right')
            ? x + width
            : x + width / 2;
      }

      if (condY) {
        oy = oy.includes('top')
          ? y
          : oy.includes('bottom')
            ? y + height
            : y + height / 2;
      }
    }

    // Return the origin as it is if it wasn't a string
    return [ ox, oy ]
  }

  // Default namespaces
  const svg = 'http://www.w3.org/2000/svg';
  const html = 'http://www.w3.org/1999/xhtml';
  const xmlns = 'http://www.w3.org/2000/xmlns/';
  const xlink = 'http://www.w3.org/1999/xlink';
  const svgjs = 'http://svgjs.dev/svgjs';

  const globals = {
    window: typeof window === 'undefined' ? null : window,
    document: typeof document === 'undefined' ? null : document
  };

  class Base {
    // constructor (node/*, {extensions = []} */) {
    //   // this.tags = []
    //   //
    //   // for (let extension of extensions) {
    //   //   extension.setup.call(this, node)
    //   //   this.tags.push(extension.name)
    //   // }
    // }
  }

  const elements = {};
  const root = '___SYMBOL___ROOT___';

  // Method for element creation
  function create (name, ns = svg) {
    // create element
    return globals.document.createElementNS(ns, name)
  }

  function makeInstance (element, isHTML = false) {
    if (element instanceof Base) return element

    if (typeof element === 'object') {
      return adopter(element)
    }

    if (element == null) {
      return new elements[root]()
    }

    if (typeof element === 'string' && element.charAt(0) !== '<') {
      return adopter(globals.document.querySelector(element))
    }

    // Make sure, that HTML elements are created with the correct namespace
    const wrapper = isHTML ? globals.document.createElement('div') : create('svg');
    wrapper.innerHTML = element;

    // We can use firstChild here because we know,
    // that the first char is < and thus an element
    element = adopter(wrapper.firstChild);

    // make sure, that element doesnt have its wrapper attached
    wrapper.removeChild(wrapper.firstChild);
    return element
  }

  function nodeOrNew (name, node) {
    return node instanceof globals.window.Node ? node : create(name)
  }

  // Adopt existing svg elements
  function adopt (node) {
    // check for presence of node
    if (!node) return null

    // make sure a node isn't already adopted
    if (node.instance instanceof Base) return node.instance

    if (node.nodeName === '#document-fragment') {
      return new elements.Fragment(node)
    }

    // initialize variables
    let className = capitalize(node.nodeName || 'Dom');

    // Make sure that gradients are adopted correctly
    if (className === 'LinearGradient' || className === 'RadialGradient') {
      className = 'Gradient';

    // Fallback to Dom if element is not known
    } else if (!elements[className]) {
      className = 'Dom';
    }

    return new elements[className](node)
  }

  let adopter = adopt;

  function register (element, name = element.name, asRoot = false) {
    elements[name] = element;
    if (asRoot) elements[root] = element;

    addMethodNames(Object.getOwnPropertyNames(element.prototype));

    return element
  }

  function getClass (name) {
    return elements[name]
  }

  // Element id sequence
  let did = 1000;

  // Get next named element id
  function eid (name) {
    return 'Svgjs' + capitalize(name) + (did++)
  }

  // Deep new id assignment
  function assignNewId (node) {
    // do the same for SVG child nodes as well
    for (let i = node.children.length - 1; i >= 0; i--) {
      assignNewId(node.children[i]);
    }

    if (node.id) {
      node.id = eid(node.nodeName);
      return node
    }

    return node
  }

  // Method for extending objects
  function extend (modules, methods) {
    let key, i;

    modules = Array.isArray(modules) ? modules : [ modules ];

    for (i = modules.length - 1; i >= 0; i--) {
      for (key in methods) {
        modules[i].prototype[key] = methods[key];
      }
    }
  }

  function wrapWithAttrCheck (fn) {
    return function (...args) {
      const o = args[args.length - 1];

      if (o && o.constructor === Object && !(o instanceof Array)) {
        return fn.apply(this, args.slice(0, -1)).attr(o)
      } else {
        return fn.apply(this, args)
      }
    }
  }

  // Get all siblings, including myself
  function siblings () {
    return this.parent().children()
  }

  // Get the current position siblings
  function position () {
    return this.parent().index(this)
  }

  // Get the next element (will return null if there is none)
  function next () {
    return this.siblings()[this.position() + 1]
  }

  // Get the next element (will return null if there is none)
  function prev () {
    return this.siblings()[this.position() - 1]
  }

  // Send given element one step forward
  function forward () {
    const i = this.position();
    const p = this.parent();

    // move node one step forward
    p.add(this.remove(), i + 1);

    return this
  }

  // Send given element one step backward
  function backward () {
    const i = this.position();
    const p = this.parent();

    p.add(this.remove(), i ? i - 1 : 0);

    return this
  }

  // Send given element all the way to the front
  function front () {
    const p = this.parent();

    // Move node forward
    p.add(this.remove());

    return this
  }

  // Send given element all the way to the back
  function back () {
    const p = this.parent();

    // Move node back
    p.add(this.remove(), 0);

    return this
  }

  // Inserts a given element before the targeted element
  function before (element) {
    element = makeInstance(element);
    element.remove();

    const i = this.position();

    this.parent().add(element, i);

    return this
  }

  // Inserts a given element after the targeted element
  function after (element) {
    element = makeInstance(element);
    element.remove();

    const i = this.position();

    this.parent().add(element, i + 1);

    return this
  }

  function insertBefore (element) {
    element = makeInstance(element);
    element.before(this);
    return this
  }

  function insertAfter (element) {
    element = makeInstance(element);
    element.after(this);
    return this
  }

  registerMethods('Dom', {
    siblings,
    position,
    next,
    prev,
    forward,
    backward,
    front,
    back,
    before,
    after,
    insertBefore,
    insertAfter
  });

  // Parse unit value
  const numberAndUnit = /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i;

  // Parse hex value
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

  // Parse rgb value
  const rgb = /rgb\((\d+),(\d+),(\d+)\)/;

  // Parse reference id
  const reference = /(#[a-z_][a-z0-9\-_]*)/i;

  // splits a transformation chain
  const transforms = /\)\s*,?\s*/;

  // Whitespace
  const whitespace = /\s/g;

  // Test hex value
  const isHex = /^#[a-f0-9]{3}$|^#[a-f0-9]{6}$/i;

  // Test rgb value
  const isRgb = /^rgb\(/;

  // Test for blank string
  const isBlank = /^(\s+)?$/;

  // Test for numeric string
  const isNumber = /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

  // Test for image url
  const isImage = /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i;

  // split at whitespace and comma
  const delimiter = /[\s,]+/;

  // Test for path letter
  const isPathLetter = /[MLHVCSQTAZ]/i;

  // Return array of classes on the node
  function classes () {
    const attr = this.attr('class');
    return attr == null ? [] : attr.trim().split(delimiter)
  }

  // Return true if class exists on the node, false otherwise
  function hasClass (name) {
    return this.classes().indexOf(name) !== -1
  }

  // Add class to the node
  function addClass (name) {
    if (!this.hasClass(name)) {
      const array = this.classes();
      array.push(name);
      this.attr('class', array.join(' '));
    }

    return this
  }

  // Remove class from the node
  function removeClass (name) {
    if (this.hasClass(name)) {
      this.attr('class', this.classes().filter(function (c) {
        return c !== name
      }).join(' '));
    }

    return this
  }

  // Toggle the presence of a class on the node
  function toggleClass (name) {
    return this.hasClass(name) ? this.removeClass(name) : this.addClass(name)
  }

  registerMethods('Dom', {
    classes, hasClass, addClass, removeClass, toggleClass
  });

  // Dynamic style generator
  function css (style, val) {
    const ret = {};
    if (arguments.length === 0) {
      // get full style as object
      this.node.style.cssText.split(/\s*;\s*/)
        .filter(function (el) {
          return !!el.length
        })
        .forEach(function (el) {
          const t = el.split(/\s*:\s*/);
          ret[t[0]] = t[1];
        });
      return ret
    }

    if (arguments.length < 2) {
      // get style properties as array
      if (Array.isArray(style)) {
        for (const name of style) {
          const cased = camelCase(name);
          ret[cased] = this.node.style[cased];
        }
        return ret
      }

      // get style for property
      if (typeof style === 'string') {
        return this.node.style[camelCase(style)]
      }

      // set styles in object
      if (typeof style === 'object') {
        for (const name in style) {
          // set empty string if null/undefined/'' was given
          this.node.style[camelCase(name)]
            = (style[name] == null || isBlank.test(style[name])) ? '' : style[name];
        }
      }
    }

    // set style for property
    if (arguments.length === 2) {
      this.node.style[camelCase(style)]
        = (val == null || isBlank.test(val)) ? '' : val;
    }

    return this
  }

  // Show element
  function show () {
    return this.css('display', '')
  }

  // Hide element
  function hide () {
    return this.css('display', 'none')
  }

  // Is element visible?
  function visible () {
    return this.css('display') !== 'none'
  }

  registerMethods('Dom', {
    css, show, hide, visible
  });

  // Store data values on svg nodes
  function data (a, v, r) {
    if (a == null) {
      // get an object of attributes
      return this.data(map(filter(this.node.attributes, (el) => el.nodeName.indexOf('data-') === 0), (el) => el.nodeName.slice(5)))
    } else if (a instanceof Array) {
      const data = {};
      for (const key of a) {
        data[key] = this.data(key);
      }
      return data
    } else if (typeof a === 'object') {
      for (v in a) {
        this.data(v, a[v]);
      }
    } else if (arguments.length < 2) {
      try {
        return JSON.parse(this.attr('data-' + a))
      } catch (e) {
        return this.attr('data-' + a)
      }
    } else {
      this.attr('data-' + a,
        v === null
          ? null
          : r === true || typeof v === 'string' || typeof v === 'number'
            ? v
            : JSON.stringify(v)
      );
    }

    return this
  }

  registerMethods('Dom', { data });

  // Remember arbitrary data
  function remember (k, v) {
    // remember every item in an object individually
    if (typeof arguments[0] === 'object') {
      for (const key in k) {
        this.remember(key, k[key]);
      }
    } else if (arguments.length === 1) {
      // retrieve memory
      return this.memory()[k]
    } else {
      // store memory
      this.memory()[k] = v;
    }

    return this
  }

  // Erase a given memory
  function forget () {
    if (arguments.length === 0) {
      this._memory = {};
    } else {
      for (let i = arguments.length - 1; i >= 0; i--) {
        delete this.memory()[arguments[i]];
      }
    }
    return this
  }

  // This triggers creation of a new hidden class which is not performant
  // However, this function is not rarely used so it will not happen frequently
  // Return local memory object
  function memory () {
    return (this._memory = this._memory || {})
  }

  registerMethods('Dom', { remember, forget, memory });

  function sixDigitHex (hex) {
    return hex.length === 4
      ? [ '#',
        hex.substring(1, 2), hex.substring(1, 2),
        hex.substring(2, 3), hex.substring(2, 3),
        hex.substring(3, 4), hex.substring(3, 4)
      ].join('')
      : hex
  }

  function componentHex (component) {
    const integer = Math.round(component);
    const bounded = Math.max(0, Math.min(255, integer));
    const hex = bounded.toString(16);
    return hex.length === 1 ? '0' + hex : hex
  }

  function is (object, space) {
    for (let i = space.length; i--;) {
      if (object[space[i]] == null) {
        return false
      }
    }
    return true
  }

  function getParameters (a, b) {
    const params = is(a, 'rgb')
      ? { _a: a.r, _b: a.g, _c: a.b, _d: 0, space: 'rgb' }
      : is(a, 'xyz')
        ? { _a: a.x, _b: a.y, _c: a.z, _d: 0, space: 'xyz' }
        : is(a, 'hsl')
          ? { _a: a.h, _b: a.s, _c: a.l, _d: 0, space: 'hsl' }
          : is(a, 'lab')
            ? { _a: a.l, _b: a.a, _c: a.b, _d: 0, space: 'lab' }
            : is(a, 'lch')
              ? { _a: a.l, _b: a.c, _c: a.h, _d: 0, space: 'lch' }
              : is(a, 'cmyk')
                ? { _a: a.c, _b: a.m, _c: a.y, _d: a.k, space: 'cmyk' }
                : { _a: 0, _b: 0, _c: 0, space: 'rgb' };

    params.space = b || params.space;
    return params
  }

  function cieSpace (space) {
    if (space === 'lab' || space === 'xyz' || space === 'lch') {
      return true
    } else {
      return false
    }
  }

  function hueToRgb (p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  class Color {
    constructor (...inputs) {
      this.init(...inputs);
    }

    // Test if given value is a color
    static isColor (color) {
      return color && (
        color instanceof Color
        || this.isRgb(color)
        || this.test(color)
      )
    }

    // Test if given value is an rgb object
    static isRgb (color) {
      return color && typeof color.r === 'number'
        && typeof color.g === 'number'
        && typeof color.b === 'number'
    }

    /*
    Generating random colors
    */
    static random (mode = 'vibrant', t, u) {

      // Get the math modules
      const { random, round, sin, PI: pi } = Math;

      // Run the correct generator
      if (mode === 'vibrant') {

        const l = (81 - 57) * random() + 57;
        const c = (83 - 45) * random() + 45;
        const h = 360 * random();
        const color = new Color(l, c, h, 'lch');
        return color

      } else if (mode === 'sine') {

        t = t == null ? random() : t;
        const r = round(80 * sin(2 * pi * t / 0.5 + 0.01) + 150);
        const g = round(50 * sin(2 * pi * t / 0.5 + 4.6) + 200);
        const b = round(100 * sin(2 * pi * t / 0.5 + 2.3) + 150);
        const color = new Color(r, g, b);
        return color

      } else if (mode === 'pastel') {

        const l = (94 - 86) * random() + 86;
        const c = (26 - 9) * random() + 9;
        const h = 360 * random();
        const color = new Color(l, c, h, 'lch');
        return color

      } else if (mode === 'dark') {

        const l = 10 + 10 * random();
        const c = (125 - 75) * random() + 86;
        const h = 360 * random();
        const color = new Color(l, c, h, 'lch');
        return color

      } else if (mode === 'rgb') {

        const r = 255 * random();
        const g = 255 * random();
        const b = 255 * random();
        const color = new Color(r, g, b);
        return color

      } else if (mode === 'lab') {

        const l = 100 * random();
        const a = 256 * random() - 128;
        const b = 256 * random() - 128;
        const color = new Color(l, a, b, 'lab');
        return color

      } else if (mode === 'grey') {

        const grey = 255 * random();
        const color = new Color(grey, grey, grey);
        return color

      } else {

        throw new Error('Unsupported random color mode')

      }
    }

    // Test if given value is a color string
    static test (color) {
      return (typeof color === 'string')
        && (isHex.test(color) || isRgb.test(color))
    }

    cmyk () {

      // Get the rgb values for the current color
      const { _a, _b, _c } = this.rgb();
      const [ r, g, b ] = [ _a, _b, _c ].map(v => v / 255);

      // Get the cmyk values in an unbounded format
      const k = Math.min(1 - r, 1 - g, 1 - b);

      if (k === 1) {
        // Catch the black case
        return new Color(0, 0, 0, 1, 'cmyk')
      }

      const c = (1 - r - k) / (1 - k);
      const m = (1 - g - k) / (1 - k);
      const y = (1 - b - k) / (1 - k);

      // Construct the new color
      const color = new Color(c, m, y, k, 'cmyk');
      return color
    }

    hsl () {

      // Get the rgb values
      const { _a, _b, _c } = this.rgb();
      const [ r, g, b ] = [ _a, _b, _c ].map(v => v / 255);

      // Find the maximum and minimum values to get the lightness
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;

      // If the r, g, v values are identical then we are grey
      const isGrey = max === min;

      // Calculate the hue and saturation
      const delta = max - min;
      const s = isGrey
        ? 0
        : l > 0.5
          ? delta / (2 - max - min)
          : delta / (max + min);
      const h = isGrey
        ? 0
        : max === r
          ? ((g - b) / delta + (g < b ? 6 : 0)) / 6
          : max === g
            ? ((b - r) / delta + 2) / 6
            : max === b
              ? ((r - g) / delta + 4) / 6
              : 0;

      // Construct and return the new color
      const color = new Color(360 * h, 100 * s, 100 * l, 'hsl');
      return color
    }

    init (a = 0, b = 0, c = 0, d = 0, space = 'rgb') {
      // This catches the case when a falsy value is passed like ''
      a = !a ? 0 : a;

      // Reset all values in case the init function is rerun with new color space
      if (this.space) {
        for (const component in this.space) {
          delete this[this.space[component]];
        }
      }

      if (typeof a === 'number') {
        // Allow for the case that we don't need d...
        space = typeof d === 'string' ? d : space;
        d = typeof d === 'string' ? 0 : d;

        // Assign the values straight to the color
        Object.assign(this, { _a: a, _b: b, _c: c, _d: d, space });
      // If the user gave us an array, make the color from it
      } else if (a instanceof Array) {
        this.space = b || (typeof a[3] === 'string' ? a[3] : a[4]) || 'rgb';
        Object.assign(this, { _a: a[0], _b: a[1], _c: a[2], _d: a[3] || 0 });
      } else if (a instanceof Object) {
        // Set the object up and assign its values directly
        const values = getParameters(a, b);
        Object.assign(this, values);
      } else if (typeof a === 'string') {
        if (isRgb.test(a)) {
          const noWhitespace = a.replace(whitespace, '');
          const [ _a, _b, _c ] = rgb.exec(noWhitespace)
            .slice(1, 4).map(v => parseInt(v));
          Object.assign(this, { _a, _b, _c, _d: 0, space: 'rgb' });
        } else if (isHex.test(a)) {
          const hexParse = v => parseInt(v, 16);
          const [ , _a, _b, _c ] = hex.exec(sixDigitHex(a)).map(hexParse);
          Object.assign(this, { _a, _b, _c, _d: 0, space: 'rgb' });
        } else throw Error('Unsupported string format, can\'t construct Color')
      }

      // Now add the components as a convenience
      const { _a, _b, _c, _d } = this;
      const components = this.space === 'rgb'
        ? { r: _a, g: _b, b: _c }
        : this.space === 'xyz'
          ? { x: _a, y: _b, z: _c }
          : this.space === 'hsl'
            ? { h: _a, s: _b, l: _c }
            : this.space === 'lab'
              ? { l: _a, a: _b, b: _c }
              : this.space === 'lch'
                ? { l: _a, c: _b, h: _c }
                : this.space === 'cmyk'
                  ? { c: _a, m: _b, y: _c, k: _d }
                  : {};
      Object.assign(this, components);
    }

    lab () {
      // Get the xyz color
      const { x, y, z } = this.xyz();

      // Get the lab components
      const l = (116 * y) - 16;
      const a = 500 * (x - y);
      const b = 200 * (y - z);

      // Construct and return a new color
      const color = new Color(l, a, b, 'lab');
      return color
    }

    lch () {

      // Get the lab color directly
      const { l, a, b } = this.lab();

      // Get the chromaticity and the hue using polar coordinates
      const c = Math.sqrt(a ** 2 + b ** 2);
      let h = 180 * Math.atan2(b, a) / Math.PI;
      if (h < 0) {
        h *= -1;
        h = 360 - h;
      }

      // Make a new color and return it
      const color = new Color(l, c, h, 'lch');
      return color
    }
    /*
    Conversion Methods
    */

    rgb () {
      if (this.space === 'rgb') {
        return this
      } else if (cieSpace(this.space)) {
        // Convert to the xyz color space
        let { x, y, z } = this;
        if (this.space === 'lab' || this.space === 'lch') {
          // Get the values in the lab space
          let { l, a, b } = this;
          if (this.space === 'lch') {
            const { c, h } = this;
            const dToR = Math.PI / 180;
            a = c * Math.cos(dToR * h);
            b = c * Math.sin(dToR * h);
          }

          // Undo the nonlinear function
          const yL = (l + 16) / 116;
          const xL = a / 500 + yL;
          const zL = yL - b / 200;

          // Get the xyz values
          const ct = 16 / 116;
          const mx = 0.008856;
          const nm = 7.787;
          x = 0.95047 * ((xL ** 3 > mx) ? xL ** 3 : (xL - ct) / nm);
          y = 1.00000 * ((yL ** 3 > mx) ? yL ** 3 : (yL - ct) / nm);
          z = 1.08883 * ((zL ** 3 > mx) ? zL ** 3 : (zL - ct) / nm);
        }

        // Convert xyz to unbounded rgb values
        const rU = x * 3.2406 + y * -1.5372 + z * -0.4986;
        const gU = x * -0.9689 + y * 1.8758 + z * 0.0415;
        const bU = x * 0.0557 + y * -0.2040 + z * 1.0570;

        // Convert the values to true rgb values
        const pow = Math.pow;
        const bd = 0.0031308;
        const r = (rU > bd) ? (1.055 * pow(rU, 1 / 2.4) - 0.055) : 12.92 * rU;
        const g = (gU > bd) ? (1.055 * pow(gU, 1 / 2.4) - 0.055) : 12.92 * gU;
        const b = (bU > bd) ? (1.055 * pow(bU, 1 / 2.4) - 0.055) : 12.92 * bU;

        // Make and return the color
        const color = new Color(255 * r, 255 * g, 255 * b);
        return color
      } else if (this.space === 'hsl') {
        // https://bgrins.github.io/TinyColor/docs/tinycolor.html
        // Get the current hsl values
        let { h, s, l } = this;
        h /= 360;
        s /= 100;
        l /= 100;

        // If we are grey, then just make the color directly
        if (s === 0) {
          l *= 255;
          const color = new Color(l, l, l);
          return color
        }

        // TODO I have no idea what this does :D If you figure it out, tell me!
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        // Get the rgb values
        const r = 255 * hueToRgb(p, q, h + 1 / 3);
        const g = 255 * hueToRgb(p, q, h);
        const b = 255 * hueToRgb(p, q, h - 1 / 3);

        // Make a new color
        const color = new Color(r, g, b);
        return color
      } else if (this.space === 'cmyk') {
        // https://gist.github.com/felipesabino/5066336
        // Get the normalised cmyk values
        const { c, m, y, k } = this;

        // Get the rgb values
        const r = 255 * (1 - Math.min(1, c * (1 - k) + k));
        const g = 255 * (1 - Math.min(1, m * (1 - k) + k));
        const b = 255 * (1 - Math.min(1, y * (1 - k) + k));

        // Form the color and return it
        const color = new Color(r, g, b);
        return color
      } else {
        return this
      }
    }

    toArray () {
      const { _a, _b, _c, _d, space } = this;
      return [ _a, _b, _c, _d, space ]
    }

    toHex () {
      const [ r, g, b ] = this._clamped().map(componentHex);
      return `#${r}${g}${b}`
    }

    toRgb () {
      const [ rV, gV, bV ] = this._clamped();
      const string = `rgb(${rV},${gV},${bV})`;
      return string
    }

    toString () {
      return this.toHex()
    }

    xyz () {

      // Normalise the red, green and blue values
      const { _a: r255, _b: g255, _c: b255 } = this.rgb();
      const [ r, g, b ] = [ r255, g255, b255 ].map(v => v / 255);

      // Convert to the lab rgb space
      const rL = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      const gL = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      const bL = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

      // Convert to the xyz color space without bounding the values
      const xU = (rL * 0.4124 + gL * 0.3576 + bL * 0.1805) / 0.95047;
      const yU = (rL * 0.2126 + gL * 0.7152 + bL * 0.0722) / 1.00000;
      const zU = (rL * 0.0193 + gL * 0.1192 + bL * 0.9505) / 1.08883;

      // Get the proper xyz values by applying the bounding
      const x = (xU > 0.008856) ? Math.pow(xU, 1 / 3) : (7.787 * xU) + 16 / 116;
      const y = (yU > 0.008856) ? Math.pow(yU, 1 / 3) : (7.787 * yU) + 16 / 116;
      const z = (zU > 0.008856) ? Math.pow(zU, 1 / 3) : (7.787 * zU) + 16 / 116;

      // Make and return the color
      const color = new Color(x, y, z, 'xyz');
      return color
    }

    /*
    Input and Output methods
    */

    _clamped () {
      const { _a, _b, _c } = this.rgb();
      const { max, min, round } = Math;
      const format = v => max(0, min(round(v), 255));
      return [ _a, _b, _c ].map(format)
    }

    /*
    Constructing colors
    */

  }

  class Point {
    // Initialize
    constructor (...args) {
      this.init(...args);
    }

    // Clone point
    clone () {
      return new Point(this)
    }

    init (x, y) {
      const base = { x: 0, y: 0 };

      // ensure source as object
      const source = Array.isArray(x)
        ? { x: x[0], y: x[1] }
        : typeof x === 'object'
          ? { x: x.x, y: x.y }
          : { x: x, y: y };

      // merge source
      this.x = source.x == null ? base.x : source.x;
      this.y = source.y == null ? base.y : source.y;

      return this
    }

    toArray () {
      return [ this.x, this.y ]
    }

    transform (m) {
      return this.clone().transformO(m)
    }

    // Transform point with matrix
    transformO (m) {
      if (!Matrix.isMatrixLike(m)) {
        m = new Matrix(m);
      }

      const { x, y } = this;

      // Perform the matrix multiplication
      this.x = m.a * x + m.c * y + m.e;
      this.y = m.b * x + m.d * y + m.f;

      return this
    }

  }

  function point (x, y) {
    return new Point(x, y).transform(this.screenCTM().inverse())
  }

  function closeEnough (a, b, threshold) {
    return Math.abs(b - a) < (threshold || 1e-6)
  }

  class Matrix {
    constructor (...args) {
      this.init(...args);
    }

    static formatTransforms (o) {
      // Get all of the parameters required to form the matrix
      const flipBoth = o.flip === 'both' || o.flip === true;
      const flipX = o.flip && (flipBoth || o.flip === 'x') ? -1 : 1;
      const flipY = o.flip && (flipBoth || o.flip === 'y') ? -1 : 1;
      const skewX = o.skew && o.skew.length
        ? o.skew[0]
        : isFinite(o.skew)
          ? o.skew
          : isFinite(o.skewX)
            ? o.skewX
            : 0;
      const skewY = o.skew && o.skew.length
        ? o.skew[1]
        : isFinite(o.skew)
          ? o.skew
          : isFinite(o.skewY)
            ? o.skewY
            : 0;
      const scaleX = o.scale && o.scale.length
        ? o.scale[0] * flipX
        : isFinite(o.scale)
          ? o.scale * flipX
          : isFinite(o.scaleX)
            ? o.scaleX * flipX
            : flipX;
      const scaleY = o.scale && o.scale.length
        ? o.scale[1] * flipY
        : isFinite(o.scale)
          ? o.scale * flipY
          : isFinite(o.scaleY)
            ? o.scaleY * flipY
            : flipY;
      const shear = o.shear || 0;
      const theta = o.rotate || o.theta || 0;
      const origin = new Point(o.origin || o.around || o.ox || o.originX, o.oy || o.originY);
      const ox = origin.x;
      const oy = origin.y;
      // We need Point to be invalid if nothing was passed because we cannot default to 0 here. Thats why NaN
      const position = new Point(o.position || o.px || o.positionX || NaN, o.py || o.positionY || NaN);
      const px = position.x;
      const py = position.y;
      const translate = new Point(o.translate || o.tx || o.translateX, o.ty || o.translateY);
      const tx = translate.x;
      const ty = translate.y;
      const relative = new Point(o.relative || o.rx || o.relativeX, o.ry || o.relativeY);
      const rx = relative.x;
      const ry = relative.y;

      // Populate all of the values
      return {
        scaleX, scaleY, skewX, skewY, shear, theta, rx, ry, tx, ty, ox, oy, px, py
      }
    }

    static fromArray (a) {
      return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] }
    }

    static isMatrixLike (o) {
      return (
        o.a != null
        || o.b != null
        || o.c != null
        || o.d != null
        || o.e != null
        || o.f != null
      )
    }

    // left matrix, right matrix, target matrix which is overwritten
    static matrixMultiply (l, r, o) {
      // Work out the product directly
      const a = l.a * r.a + l.c * r.b;
      const b = l.b * r.a + l.d * r.b;
      const c = l.a * r.c + l.c * r.d;
      const d = l.b * r.c + l.d * r.d;
      const e = l.e + l.a * r.e + l.c * r.f;
      const f = l.f + l.b * r.e + l.d * r.f;

      // make sure to use local variables because l/r and o could be the same
      o.a = a;
      o.b = b;
      o.c = c;
      o.d = d;
      o.e = e;
      o.f = f;

      return o
    }

    around (cx, cy, matrix) {
      return this.clone().aroundO(cx, cy, matrix)
    }

    // Transform around a center point
    aroundO (cx, cy, matrix) {
      const dx = cx || 0;
      const dy = cy || 0;
      return this.translateO(-dx, -dy).lmultiplyO(matrix).translateO(dx, dy)
    }

    // Clones this matrix
    clone () {
      return new Matrix(this)
    }

    // Decomposes this matrix into its affine parameters
    decompose (cx = 0, cy = 0) {
      // Get the parameters from the matrix
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;
      const e = this.e;
      const f = this.f;

      // Figure out if the winding direction is clockwise or counterclockwise
      const determinant = a * d - b * c;
      const ccw = determinant > 0 ? 1 : -1;

      // Since we only shear in x, we can use the x basis to get the x scale
      // and the rotation of the resulting matrix
      const sx = ccw * Math.sqrt(a * a + b * b);
      const thetaRad = Math.atan2(ccw * b, ccw * a);
      const theta = 180 / Math.PI * thetaRad;
      const ct = Math.cos(thetaRad);
      const st = Math.sin(thetaRad);

      // We can then solve the y basis vector simultaneously to get the other
      // two affine parameters directly from these parameters
      const lam = (a * c + b * d) / determinant;
      const sy = ((c * sx) / (lam * a - b)) || ((d * sx) / (lam * b + a));

      // Use the translations
      const tx = e - cx + cx * ct * sx + cy * (lam * ct * sx - st * sy);
      const ty = f - cy + cx * st * sx + cy * (lam * st * sx + ct * sy);

      // Construct the decomposition and return it
      return {
        // Return the affine parameters
        scaleX: sx,
        scaleY: sy,
        shear: lam,
        rotate: theta,
        translateX: tx,
        translateY: ty,
        originX: cx,
        originY: cy,

        // Return the matrix parameters
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      }
    }

    // Check if two matrices are equal
    equals (other) {
      if (other === this) return true
      const comp = new Matrix(other);
      return closeEnough(this.a, comp.a) && closeEnough(this.b, comp.b)
        && closeEnough(this.c, comp.c) && closeEnough(this.d, comp.d)
        && closeEnough(this.e, comp.e) && closeEnough(this.f, comp.f)
    }

    // Flip matrix on x or y, at a given offset
    flip (axis, around) {
      return this.clone().flipO(axis, around)
    }

    flipO (axis, around) {
      return axis === 'x'
        ? this.scaleO(-1, 1, around, 0)
        : axis === 'y'
          ? this.scaleO(1, -1, 0, around)
          : this.scaleO(-1, -1, axis, around || axis) // Define an x, y flip point
    }

    // Initialize
    init (source) {
      const base = Matrix.fromArray([ 1, 0, 0, 1, 0, 0 ]);

      // ensure source as object
      source = source instanceof Element$1
        ? source.matrixify()
        : typeof source === 'string'
          ? Matrix.fromArray(source.split(delimiter).map(parseFloat))
          : Array.isArray(source)
            ? Matrix.fromArray(source)
            : (typeof source === 'object' && Matrix.isMatrixLike(source))
              ? source
              : (typeof source === 'object')
                ? new Matrix().transform(source)
                : arguments.length === 6
                  ? Matrix.fromArray([].slice.call(arguments))
                  : base;

      // Merge the source matrix with the base matrix
      this.a = source.a != null ? source.a : base.a;
      this.b = source.b != null ? source.b : base.b;
      this.c = source.c != null ? source.c : base.c;
      this.d = source.d != null ? source.d : base.d;
      this.e = source.e != null ? source.e : base.e;
      this.f = source.f != null ? source.f : base.f;

      return this
    }

    inverse () {
      return this.clone().inverseO()
    }

    // Inverses matrix
    inverseO () {
      // Get the current parameters out of the matrix
      const a = this.a;
      const b = this.b;
      const c = this.c;
      const d = this.d;
      const e = this.e;
      const f = this.f;

      // Invert the 2x2 matrix in the top left
      const det = a * d - b * c;
      if (!det) throw new Error('Cannot invert ' + this)

      // Calculate the top 2x2 matrix
      const na = d / det;
      const nb = -b / det;
      const nc = -c / det;
      const nd = a / det;

      // Apply the inverted matrix to the top right
      const ne = -(na * e + nc * f);
      const nf = -(nb * e + nd * f);

      // Construct the inverted matrix
      this.a = na;
      this.b = nb;
      this.c = nc;
      this.d = nd;
      this.e = ne;
      this.f = nf;

      return this
    }

    lmultiply (matrix) {
      return this.clone().lmultiplyO(matrix)
    }

    lmultiplyO (matrix) {
      const r = this;
      const l = matrix instanceof Matrix
        ? matrix
        : new Matrix(matrix);

      return Matrix.matrixMultiply(l, r, this)
    }

    // Left multiplies by the given matrix
    multiply (matrix) {
      return this.clone().multiplyO(matrix)
    }

    multiplyO (matrix) {
      // Get the matrices
      const l = this;
      const r = matrix instanceof Matrix
        ? matrix
        : new Matrix(matrix);

      return Matrix.matrixMultiply(l, r, this)
    }

    // Rotate matrix
    rotate (r, cx, cy) {
      return this.clone().rotateO(r, cx, cy)
    }

    rotateO (r, cx = 0, cy = 0) {
      // Convert degrees to radians
      r = radians(r);

      const cos = Math.cos(r);
      const sin = Math.sin(r);

      const { a, b, c, d, e, f } = this;

      this.a = a * cos - b * sin;
      this.b = b * cos + a * sin;
      this.c = c * cos - d * sin;
      this.d = d * cos + c * sin;
      this.e = e * cos - f * sin + cy * sin - cx * cos + cx;
      this.f = f * cos + e * sin - cx * sin - cy * cos + cy;

      return this
    }

    // Scale matrix
    scale (x, y, cx, cy) {
      return this.clone().scaleO(...arguments)
    }

    scaleO (x, y = x, cx = 0, cy = 0) {
      // Support uniform scaling
      if (arguments.length === 3) {
        cy = cx;
        cx = y;
        y = x;
      }

      const { a, b, c, d, e, f } = this;

      this.a = a * x;
      this.b = b * y;
      this.c = c * x;
      this.d = d * y;
      this.e = e * x - cx * x + cx;
      this.f = f * y - cy * y + cy;

      return this
    }

    // Shear matrix
    shear (a, cx, cy) {
      return this.clone().shearO(a, cx, cy)
    }

    shearO (lx, cx = 0, cy = 0) {
      const { a, b, c, d, e, f } = this;

      this.a = a + b * lx;
      this.c = c + d * lx;
      this.e = e + f * lx - cy * lx;

      return this
    }

    // Skew Matrix
    skew (x, y, cx, cy) {
      return this.clone().skewO(...arguments)
    }

    skewO (x, y = x, cx = 0, cy = 0) {
      // support uniformal skew
      if (arguments.length === 3) {
        cy = cx;
        cx = y;
        y = x;
      }

      // Convert degrees to radians
      x = radians(x);
      y = radians(y);

      const lx = Math.tan(x);
      const ly = Math.tan(y);

      const { a, b, c, d, e, f } = this;

      this.a = a + b * lx;
      this.b = b + a * ly;
      this.c = c + d * lx;
      this.d = d + c * ly;
      this.e = e + f * lx - cy * lx;
      this.f = f + e * ly - cx * ly;

      return this
    }

    // SkewX
    skewX (x, cx, cy) {
      return this.skew(x, 0, cx, cy)
    }

    // SkewY
    skewY (y, cx, cy) {
      return this.skew(0, y, cx, cy)
    }

    toArray () {
      return [ this.a, this.b, this.c, this.d, this.e, this.f ]
    }

    // Convert matrix to string
    toString () {
      return 'matrix(' + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ')'
    }

    // Transform a matrix into another matrix by manipulating the space
    transform (o) {
      // Check if o is a matrix and then left multiply it directly
      if (Matrix.isMatrixLike(o)) {
        const matrix = new Matrix(o);
        return matrix.multiplyO(this)
      }

      // Get the proposed transformations and the current transformations
      const t = Matrix.formatTransforms(o);
      const current = this;
      const { x: ox, y: oy } = new Point(t.ox, t.oy).transform(current);

      // Construct the resulting matrix
      const transformer = new Matrix()
        .translateO(t.rx, t.ry)
        .lmultiplyO(current)
        .translateO(-ox, -oy)
        .scaleO(t.scaleX, t.scaleY)
        .skewO(t.skewX, t.skewY)
        .shearO(t.shear)
        .rotateO(t.theta)
        .translateO(ox, oy);

      // If we want the origin at a particular place, we force it there
      if (isFinite(t.px) || isFinite(t.py)) {
        const origin = new Point(ox, oy).transform(transformer);
        // TODO: Replace t.px with isFinite(t.px)
        // Doesnt work because t.px is also 0 if it wasnt passed
        const dx = isFinite(t.px) ? t.px - origin.x : 0;
        const dy = isFinite(t.py) ? t.py - origin.y : 0;
        transformer.translateO(dx, dy);
      }

      // Translate now after positioning
      transformer.translateO(t.tx, t.ty);
      return transformer
    }

    // Translate matrix
    translate (x, y) {
      return this.clone().translateO(x, y)
    }

    translateO (x, y) {
      this.e += x || 0;
      this.f += y || 0;
      return this
    }

    valueOf () {
      return {
        a: this.a,
        b: this.b,
        c: this.c,
        d: this.d,
        e: this.e,
        f: this.f
      }
    }

  }

  function ctm () {
    return new Matrix(this.node.getCTM())
  }

  function screenCTM () {
    /* https://bugzilla.mozilla.org/show_bug.cgi?id=1344537
       This is needed because FF does not return the transformation matrix
       for the inner coordinate system when getScreenCTM() is called on nested svgs.
       However all other Browsers do that */
    if (typeof this.isRoot === 'function' && !this.isRoot()) {
      const rect = this.rect(1, 1);
      const m = rect.node.getScreenCTM();
      rect.remove();
      return new Matrix(m)
    }
    return new Matrix(this.node.getScreenCTM())
  }

  register(Matrix, 'Matrix');

  function parser () {
    // Reuse cached element if possible
    if (!parser.nodes) {
      const svg = makeInstance().size(2, 0);
      svg.node.style.cssText = [
        'opacity: 0',
        'position: absolute',
        'left: -100%',
        'top: -100%',
        'overflow: hidden'
      ].join(';');

      svg.attr('focusable', 'false');
      svg.attr('aria-hidden', 'true');

      const path = svg.path().node;

      parser.nodes = { svg, path };
    }

    if (!parser.nodes.svg.node.parentNode) {
      const b = globals.document.body || globals.document.documentElement;
      parser.nodes.svg.addTo(b);
    }

    return parser.nodes
  }

  function isNulledBox (box) {
    return !box.width && !box.height && !box.x && !box.y
  }

  function domContains (node) {
    return node === globals.document
      || (globals.document.documentElement.contains || function (node) {
        // This is IE - it does not support contains() for top-level SVGs
        while (node.parentNode) {
          node = node.parentNode;
        }
        return node === globals.document
      }).call(globals.document.documentElement, node)
  }

  class Box {
    constructor (...args) {
      this.init(...args);
    }

    addOffset () {
      // offset by window scroll position, because getBoundingClientRect changes when window is scrolled
      this.x += globals.window.pageXOffset;
      this.y += globals.window.pageYOffset;
      return new Box(this)
    }

    init (source) {
      const base = [ 0, 0, 0, 0 ];
      source = typeof source === 'string'
        ? source.split(delimiter).map(parseFloat)
        : Array.isArray(source)
          ? source
          : typeof source === 'object'
            ? [ source.left != null
              ? source.left
              : source.x, source.top != null ? source.top : source.y, source.width, source.height ]
            : arguments.length === 4
              ? [].slice.call(arguments)
              : base;

      this.x = source[0] || 0;
      this.y = source[1] || 0;
      this.width = this.w = source[2] || 0;
      this.height = this.h = source[3] || 0;

      // Add more bounding box properties
      this.x2 = this.x + this.w;
      this.y2 = this.y + this.h;
      this.cx = this.x + this.w / 2;
      this.cy = this.y + this.h / 2;

      return this
    }

    isNulled () {
      return isNulledBox(this)
    }

    // Merge rect box with another, return a new instance
    merge (box) {
      const x = Math.min(this.x, box.x);
      const y = Math.min(this.y, box.y);
      const width = Math.max(this.x + this.width, box.x + box.width) - x;
      const height = Math.max(this.y + this.height, box.y + box.height) - y;

      return new Box(x, y, width, height)
    }

    toArray () {
      return [ this.x, this.y, this.width, this.height ]
    }

    toString () {
      return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height
    }

    transform (m) {
      if (!(m instanceof Matrix)) {
        m = new Matrix(m);
      }

      let xMin = Infinity;
      let xMax = -Infinity;
      let yMin = Infinity;
      let yMax = -Infinity;

      const pts = [
        new Point(this.x, this.y),
        new Point(this.x2, this.y),
        new Point(this.x, this.y2),
        new Point(this.x2, this.y2)
      ];

      pts.forEach(function (p) {
        p = p.transform(m);
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      });

      return new Box(
        xMin, yMin,
        xMax - xMin,
        yMax - yMin
      )
    }

  }

  function getBox (el, getBBoxFn, retry) {
    let box;

    try {
      // Try to get the box with the provided function
      box = getBBoxFn(el.node);

      // If the box is worthless and not even in the dom, retry
      // by throwing an error here...
      if (isNulledBox(box) && !domContains(el.node)) {
        throw new Error('Element not in the dom')
      }
    } catch (e) {
      // ... and calling the retry handler here
      box = retry(el);
    }

    return box
  }

  function bbox () {
    // Function to get bbox is getBBox()
    const getBBox = (node) => node.getBBox();

    // Take all measures so that a stupid browser renders the element
    // so we can get the bbox from it when we try again
    const retry = (el) => {
      try {
        const clone = el.clone().addTo(parser().svg).show();
        const box = clone.node.getBBox();
        clone.remove();
        return box
      } catch (e) {
        // We give up...
        throw new Error(`Getting bbox of element "${el.node.nodeName}" is not possible: ${e.toString()}`)
      }
    };

    const box = getBox(this, getBBox, retry);
    const bbox = new Box(box);

    return bbox
  }

  function rbox (el) {
    const getRBox = (node) => node.getBoundingClientRect();
    const retry = (el) => {
      // There is no point in trying tricks here because if we insert the element into the dom ourselves
      // it obviously will be at the wrong position
      throw new Error(`Getting rbox of element "${el.node.nodeName}" is not possible`)
    };

    const box = getBox(this, getRBox, retry);
    const rbox = new Box(box);

    // If an element was passed, we want the bbox in the coordinate system of that element
    if (el) {
      return rbox.transform(el.screenCTM().inverseO())
    }

    // Else we want it in absolute screen coordinates
    // Therefore we need to add the scrollOffset
    return rbox.addOffset()
  }

  // Checks whether the given point is inside the bounding box
  function inside (x, y) {
    const box = this.bbox();

    return x > box.x
      && y > box.y
      && x < box.x + box.width
      && y < box.y + box.height
  }

  registerMethods({
    viewbox: {
      viewbox (x, y, width, height) {
        // act as getter
        if (x == null) return new Box(this.attr('viewBox'))

        // act as setter
        return this.attr('viewBox', new Box(x, y, width, height))
      },

      zoom (level, point) {
        // Its best to rely on the attributes here and here is why:
        // clientXYZ: Doesn't work on non-root svgs because they dont have a CSSBox (silly!)
        // getBoundingClientRect: Doesn't work because Chrome just ignores width and height of nested svgs completely
        //                        that means, their clientRect is always as big as the content.
        //                        Furthermore this size is incorrect if the element is further transformed by its parents
        // computedStyle: Only returns meaningful values if css was used with px. We dont go this route here!
        // getBBox: returns the bounding box of its content - that doesnt help!
        let { width, height } = this.attr([ 'width', 'height' ]);

        // Width and height is a string when a number with a unit is present which we can't use
        // So we try clientXYZ
        if ((!width && !height) || (typeof width === 'string' || typeof height === 'string')) {
          width = this.node.clientWidth;
          height = this.node.clientHeight;
        }

        // Giving up...
        if (!width || !height) {
          throw new Error('Impossible to get absolute width and height. Please provide an absolute width and height attribute on the zooming element')
        }

        const v = this.viewbox();

        const zoomX = width / v.width;
        const zoomY = height / v.height;
        const zoom = Math.min(zoomX, zoomY);

        if (level == null) {
          return zoom
        }

        let zoomAmount = zoom / level;

        // Set the zoomAmount to the highest value which is safe to process and recover from
        // The * 100 is a bit of wiggle room for the matrix transformation
        if (zoomAmount === Infinity) zoomAmount = Number.MAX_SAFE_INTEGER / 100;

        point = point || new Point(width / 2 / zoomX + v.x, height / 2 / zoomY + v.y);

        const box = new Box(v).transform(
          new Matrix({ scale: zoomAmount, origin: point })
        );

        return this.viewbox(box)
      }
    }
  });

  register(Box, 'Box');

  // import { subClassArray } from './ArrayPolyfill.js'

  class List extends Array {
    constructor (arr = [], ...args) {
      super(arr, ...args);
      if (typeof arr === 'number') return this
      this.length = 0;
      this.push(...arr);
    }
  }

  extend([ List ], {
    each (fnOrMethodName, ...args) {
      if (typeof fnOrMethodName === 'function') {
        return this.map((el, i, arr) => {
          return fnOrMethodName.call(el, el, i, arr)
        })
      } else {
        return this.map(el => {
          return el[fnOrMethodName](...args)
        })
      }
    },

    toArray () {
      return Array.prototype.concat.apply([], this)
    }
  });

  const reserved = [ 'toArray', 'constructor', 'each' ];

  List.extend = function (methods) {
    methods = methods.reduce((obj, name) => {
      // Don't overwrite own methods
      if (reserved.includes(name)) return obj

      // Don't add private methods
      if (name[0] === '_') return obj

      // Relay every call to each()
      obj[name] = function (...attrs) {
        return this.each(name, ...attrs)
      };
      return obj
    }, {});

    extend([ List ], methods);
  };

  function baseFind (query, parent) {
    return new List(map((parent || globals.document).querySelectorAll(query), function (node) {
      return adopt(node)
    }))
  }

  // Scoped find method
  function find (query) {
    return baseFind(query, this.node)
  }

  function findOne (query) {
    return adopt(this.node.querySelector(query))
  }

  let listenerId = 0;
  const windowEvents = {};

  function getEvents (instance) {
    let n = instance.getEventHolder();

    // We dont want to save events in global space
    if (n === globals.window) n = windowEvents;
    if (!n.events) n.events = {};
    return n.events
  }

  function getEventTarget (instance) {
    return instance.getEventTarget()
  }

  function clearEvents (instance) {
    let n = instance.getEventHolder();
    if (n === globals.window) n = windowEvents;
    if (n.events) n.events = {};
  }

  // Add event binder in the SVG namespace
  function on (node, events, listener, binding, options) {
    const l = listener.bind(binding || node);
    const instance = makeInstance(node);
    const bag = getEvents(instance);
    const n = getEventTarget(instance);

    // events can be an array of events or a string of events
    events = Array.isArray(events) ? events : events.split(delimiter);

    // add id to listener
    if (!listener._svgjsListenerId) {
      listener._svgjsListenerId = ++listenerId;
    }

    events.forEach(function (event) {
      const ev = event.split('.')[0];
      const ns = event.split('.')[1] || '*';

      // ensure valid object
      bag[ev] = bag[ev] || {};
      bag[ev][ns] = bag[ev][ns] || {};

      // reference listener
      bag[ev][ns][listener._svgjsListenerId] = l;

      // add listener
      n.addEventListener(ev, l, options || false);
    });
  }

  // Add event unbinder in the SVG namespace
  function off (node, events, listener, options) {
    const instance = makeInstance(node);
    const bag = getEvents(instance);
    const n = getEventTarget(instance);

    // listener can be a function or a number
    if (typeof listener === 'function') {
      listener = listener._svgjsListenerId;
      if (!listener) return
    }

    // events can be an array of events or a string or undefined
    events = Array.isArray(events) ? events : (events || '').split(delimiter);

    events.forEach(function (event) {
      const ev = event && event.split('.')[0];
      const ns = event && event.split('.')[1];
      let namespace, l;

      if (listener) {
        // remove listener reference
        if (bag[ev] && bag[ev][ns || '*']) {
          // removeListener
          n.removeEventListener(ev, bag[ev][ns || '*'][listener], options || false);

          delete bag[ev][ns || '*'][listener];
        }
      } else if (ev && ns) {
        // remove all listeners for a namespaced event
        if (bag[ev] && bag[ev][ns]) {
          for (l in bag[ev][ns]) {
            off(n, [ ev, ns ].join('.'), l);
          }

          delete bag[ev][ns];
        }
      } else if (ns) {
        // remove all listeners for a specific namespace
        for (event in bag) {
          for (namespace in bag[event]) {
            if (ns === namespace) {
              off(n, [ event, ns ].join('.'));
            }
          }
        }
      } else if (ev) {
        // remove all listeners for the event
        if (bag[ev]) {
          for (namespace in bag[ev]) {
            off(n, [ ev, namespace ].join('.'));
          }

          delete bag[ev];
        }
      } else {
        // remove all listeners on a given node
        for (event in bag) {
          off(n, event);
        }

        clearEvents(instance);
      }
    });
  }

  function dispatch (node, event, data, options) {
    const n = getEventTarget(node);

    // Dispatch event
    if (event instanceof globals.window.Event) {
      n.dispatchEvent(event);
    } else {
      event = new globals.window.CustomEvent(event, { detail: data, cancelable: true, ...options });
      n.dispatchEvent(event);
    }
    return event
  }

  class EventTarget extends Base {
    addEventListener () {}

    dispatch (event, data, options) {
      return dispatch(this, event, data, options)
    }

    dispatchEvent (event) {
      const bag = this.getEventHolder().events;
      if (!bag) return true

      const events = bag[event.type];

      for (const i in events) {
        for (const j in events[i]) {
          events[i][j](event);
        }
      }

      return !event.defaultPrevented
    }

    // Fire given event
    fire (event, data, options) {
      this.dispatch(event, data, options);
      return this
    }

    getEventHolder () {
      return this
    }

    getEventTarget () {
      return this
    }

    // Unbind event from listener
    off (event, listener) {
      off(this, event, listener);
      return this
    }

    // Bind given event to listener
    on (event, listener, binding, options) {
      on(this, event, listener, binding, options);
      return this
    }

    removeEventListener () {}
  }

  register(EventTarget, 'EventTarget');

  function noop () {}

  // Default animation values
  const timeline = {
    duration: 400,
    ease: '>',
    delay: 0
  };

  // Default attribute values
  const attrs = {

    // fill and stroke
    'fill-opacity': 1,
    'stroke-opacity': 1,
    'stroke-width': 0,
    'stroke-linejoin': 'miter',
    'stroke-linecap': 'butt',
    fill: '#000000',
    stroke: '#000000',
    opacity: 1,

    // position
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,

    // size
    width: 0,
    height: 0,

    // radius
    r: 0,
    rx: 0,
    ry: 0,

    // gradient
    offset: 0,
    'stop-opacity': 1,
    'stop-color': '#000000',

    // text
    'text-anchor': 'start'
  };

  class SVGArray extends Array {
    constructor (...args) {
      super(...args);
      this.init(...args);
    }

    clone () {
      return new this.constructor(this)
    }

    init (arr) {
      // This catches the case, that native map tries to create an array with new Array(1)
      if (typeof arr === 'number') return this
      this.length = 0;
      this.push(...this.parse(arr));
      return this
    }

    // Parse whitespace separated string
    parse (array = []) {
      // If already is an array, no need to parse it
      if (array instanceof Array) return array

      return array.trim().split(delimiter).map(parseFloat)
    }

    toArray () {
      return Array.prototype.concat.apply([], this)
    }

    toSet () {
      return new Set(this)
    }

    toString () {
      return this.join(' ')
    }

    // Flattens the array if needed
    valueOf () {
      const ret = [];
      ret.push(...this);
      return ret
    }

  }

  // Module for unit conversions
  class SVGNumber {
    // Initialize
    constructor (...args) {
      this.init(...args);
    }

    convert (unit) {
      return new SVGNumber(this.value, unit)
    }

    // Divide number
    divide (number) {
      number = new SVGNumber(number);
      return new SVGNumber(this / number, this.unit || number.unit)
    }

    init (value, unit) {
      unit = Array.isArray(value) ? value[1] : unit;
      value = Array.isArray(value) ? value[0] : value;

      // initialize defaults
      this.value = 0;
      this.unit = unit || '';

      // parse value
      if (typeof value === 'number') {
        // ensure a valid numeric value
        this.value = isNaN(value) ? 0 : !isFinite(value) ? (value < 0 ? -3.4e+38 : +3.4e+38) : value;
      } else if (typeof value === 'string') {
        unit = value.match(numberAndUnit);

        if (unit) {
          // make value numeric
          this.value = parseFloat(unit[1]);

          // normalize
          if (unit[5] === '%') {
            this.value /= 100;
          } else if (unit[5] === 's') {
            this.value *= 1000;
          }

          // store unit
          this.unit = unit[5];
        }
      } else {
        if (value instanceof SVGNumber) {
          this.value = value.valueOf();
          this.unit = value.unit;
        }
      }

      return this
    }

    // Subtract number
    minus (number) {
      number = new SVGNumber(number);
      return new SVGNumber(this - number, this.unit || number.unit)
    }

    // Add number
    plus (number) {
      number = new SVGNumber(number);
      return new SVGNumber(this + number, this.unit || number.unit)
    }

    // Multiply number
    times (number) {
      number = new SVGNumber(number);
      return new SVGNumber(this * number, this.unit || number.unit)
    }

    toArray () {
      return [ this.value, this.unit ]
    }

    toJSON () {
      return this.toString()
    }

    toString () {
      return (this.unit === '%'
        ? ~~(this.value * 1e8) / 1e6
        : this.unit === 's'
          ? this.value / 1e3
          : this.value
      ) + this.unit
    }

    valueOf () {
      return this.value
    }

  }

  const hooks = [];
  function registerAttrHook (fn) {
    hooks.push(fn);
  }

  // Set svg element attribute
  function attr (attr, val, ns) {
    // act as full getter
    if (attr == null) {
      // get an object of attributes
      attr = {};
      val = this.node.attributes;

      for (const node of val) {
        attr[node.nodeName] = isNumber.test(node.nodeValue)
          ? parseFloat(node.nodeValue)
          : node.nodeValue;
      }

      return attr
    } else if (attr instanceof Array) {
      // loop through array and get all values
      return attr.reduce((last, curr) => {
        last[curr] = this.attr(curr);
        return last
      }, {})
    } else if (typeof attr === 'object' && attr.constructor === Object) {
      // apply every attribute individually if an object is passed
      for (val in attr) this.attr(val, attr[val]);
    } else if (val === null) {
      // remove value
      this.node.removeAttribute(attr);
    } else if (val == null) {
      // act as a getter if the first and only argument is not an object
      val = this.node.getAttribute(attr);
      return val == null
        ? attrs[attr]
        : isNumber.test(val)
          ? parseFloat(val)
          : val
    } else {
      // Loop through hooks and execute them to convert value
      val = hooks.reduce((_val, hook) => {
        return hook(attr, _val, this)
      }, val);

      // ensure correct numeric values (also accepts NaN and Infinity)
      if (typeof val === 'number') {
        val = new SVGNumber(val);
      } else if (Color.isColor(val)) {
        // ensure full hex color
        val = new Color(val);
      } else if (val.constructor === Array) {
        // Check for plain arrays and parse array values
        val = new SVGArray(val);
      }

      // if the passed attribute is leading...
      if (attr === 'leading') {
        // ... call the leading method instead
        if (this.leading) {
          this.leading(val);
        }
      } else {
        // set given attribute on node
        typeof ns === 'string'
          ? this.node.setAttributeNS(ns, attr, val.toString())
          : this.node.setAttribute(attr, val.toString());
      }

      // rebuild if required
      if (this.rebuild && (attr === 'font-size' || attr === 'x')) {
        this.rebuild();
      }
    }

    return this
  }

  class Dom extends EventTarget {
    constructor (node, attrs) {
      super();
      this.node = node;
      this.type = node.nodeName;

      if (attrs && node !== attrs) {
        this.attr(attrs);
      }
    }

    // Add given element at a position
    add (element, i) {
      element = makeInstance(element);

      // If non-root svg nodes are added we have to remove their namespaces
      if (element.removeNamespace && this.node instanceof globals.window.SVGElement) {
        element.removeNamespace();
      }

      if (i == null) {
        this.node.appendChild(element.node);
      } else if (element.node !== this.node.childNodes[i]) {
        this.node.insertBefore(element.node, this.node.childNodes[i]);
      }

      return this
    }

    // Add element to given container and return self
    addTo (parent, i) {
      return makeInstance(parent).put(this, i)
    }

    // Returns all child elements
    children () {
      return new List(map(this.node.children, function (node) {
        return adopt(node)
      }))
    }

    // Remove all elements in this container
    clear () {
      // remove children
      while (this.node.hasChildNodes()) {
        this.node.removeChild(this.node.lastChild);
      }

      return this
    }

    // Clone element
    clone (deep = true) {
      // write dom data to the dom so the clone can pickup the data
      this.writeDataToDom();

      // clone element and assign new id
      return new this.constructor(assignNewId(this.node.cloneNode(deep)))
    }

    // Iterates over all children and invokes a given block
    each (block, deep) {
      const children = this.children();
      let i, il;

      for (i = 0, il = children.length; i < il; i++) {
        block.apply(children[i], [ i, children ]);

        if (deep) {
          children[i].each(block, deep);
        }
      }

      return this
    }

    element (nodeName, attrs) {
      return this.put(new Dom(create(nodeName), attrs))
    }

    // Get first child
    first () {
      return adopt(this.node.firstChild)
    }

    // Get a element at the given index
    get (i) {
      return adopt(this.node.childNodes[i])
    }

    getEventHolder () {
      return this.node
    }

    getEventTarget () {
      return this.node
    }

    // Checks if the given element is a child
    has (element) {
      return this.index(element) >= 0
    }

    html (htmlOrFn, outerHTML) {
      return this.xml(htmlOrFn, outerHTML, html)
    }

    // Get / set id
    id (id) {
      // generate new id if no id set
      if (typeof id === 'undefined' && !this.node.id) {
        this.node.id = eid(this.type);
      }

      // don't set directly with this.node.id to make `null` work correctly
      return this.attr('id', id)
    }

    // Gets index of given element
    index (element) {
      return [].slice.call(this.node.childNodes).indexOf(element.node)
    }

    // Get the last child
    last () {
      return adopt(this.node.lastChild)
    }

    // matches the element vs a css selector
    matches (selector) {
      const el = this.node;
      const matcher = el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector || null;
      return matcher && matcher.call(el, selector)
    }

    // Returns the parent element instance
    parent (type) {
      let parent = this;

      // check for parent
      if (!parent.node.parentNode) return null

      // get parent element
      parent = adopt(parent.node.parentNode);

      if (!type) return parent

      // loop trough ancestors if type is given
      do {
        if (typeof type === 'string' ? parent.matches(type) : parent instanceof type) return parent
      } while ((parent = adopt(parent.node.parentNode)))

      return parent
    }

    // Basically does the same as `add()` but returns the added element instead
    put (element, i) {
      element = makeInstance(element);
      this.add(element, i);
      return element
    }

    // Add element to given container and return container
    putIn (parent, i) {
      return makeInstance(parent).add(this, i)
    }

    // Remove element
    remove () {
      if (this.parent()) {
        this.parent().removeElement(this);
      }

      return this
    }

    // Remove a given child
    removeElement (element) {
      this.node.removeChild(element.node);

      return this
    }

    // Replace this with element
    replace (element) {
      element = makeInstance(element);

      if (this.node.parentNode) {
        this.node.parentNode.replaceChild(element.node, this.node);
      }

      return element
    }

    round (precision = 2, map = null) {
      const factor = 10 ** precision;
      const attrs = this.attr(map);

      for (const i in attrs) {
        if (typeof attrs[i] === 'number') {
          attrs[i] = Math.round(attrs[i] * factor) / factor;
        }
      }

      this.attr(attrs);
      return this
    }

    // Import / Export raw svg
    svg (svgOrFn, outerSVG) {
      return this.xml(svgOrFn, outerSVG, svg)
    }

    // Return id on string conversion
    toString () {
      return this.id()
    }

    words (text) {
      // This is faster than removing all children and adding a new one
      this.node.textContent = text;
      return this
    }

    wrap (node) {
      const parent = this.parent();

      if (!parent) {
        return this.addTo(node)
      }

      const position = parent.index(this);
      return parent.put(node, position).put(this)
    }

    // write svgjs data to the dom
    writeDataToDom () {
      // dump variables recursively
      this.each(function () {
        this.writeDataToDom();
      });

      return this
    }

    // Import / Export raw svg
    xml (xmlOrFn, outerXML, ns) {
      if (typeof xmlOrFn === 'boolean') {
        ns = outerXML;
        outerXML = xmlOrFn;
        xmlOrFn = null;
      }

      // act as getter if no svg string is given
      if (xmlOrFn == null || typeof xmlOrFn === 'function') {
        // The default for exports is, that the outerNode is included
        outerXML = outerXML == null ? true : outerXML;

        // write svgjs data to the dom
        this.writeDataToDom();
        let current = this;

        // An export modifier was passed
        if (xmlOrFn != null) {
          current = adopt(current.node.cloneNode(true));

          // If the user wants outerHTML we need to process this node, too
          if (outerXML) {
            const result = xmlOrFn(current);
            current = result || current;

            // The user does not want this node? Well, then he gets nothing
            if (result === false) return ''
          }

          // Deep loop through all children and apply modifier
          current.each(function () {
            const result = xmlOrFn(this);
            const _this = result || this;

            // If modifier returns false, discard node
            if (result === false) {
              this.remove();

              // If modifier returns new node, use it
            } else if (result && this !== _this) {
              this.replace(_this);
            }
          }, true);
        }

        // Return outer or inner content
        return outerXML
          ? current.node.outerHTML
          : current.node.innerHTML
      }

      // Act as setter if we got a string

      // The default for import is, that the current node is not replaced
      outerXML = outerXML == null ? false : outerXML;

      // Create temporary holder
      const well = create('wrapper', ns);
      const fragment = globals.document.createDocumentFragment();

      // Dump raw svg
      well.innerHTML = xmlOrFn;

      // Transplant nodes into the fragment
      for (let len = well.children.length; len--;) {
        fragment.appendChild(well.firstElementChild);
      }

      const parent = this.parent();

      // Add the whole fragment at once
      return outerXML
        ? this.replace(fragment) && parent
        : this.add(fragment)
    }
  }

  extend(Dom, { attr, find, findOne });
  register(Dom, 'Dom');

  class Element$1 extends Dom {
    constructor (node, attrs) {
      super(node, attrs);

      // initialize data object
      this.dom = {};

      // create circular reference
      this.node.instance = this;

      if (node.hasAttribute('svgjs:data')) {
        // pull svgjs data from the dom (getAttributeNS doesn't work in html5)
        this.setData(JSON.parse(node.getAttribute('svgjs:data')) || {});
      }
    }

    // Move element by its center
    center (x, y) {
      return this.cx(x).cy(y)
    }

    // Move by center over x-axis
    cx (x) {
      return x == null
        ? this.x() + this.width() / 2
        : this.x(x - this.width() / 2)
    }

    // Move by center over y-axis
    cy (y) {
      return y == null
        ? this.y() + this.height() / 2
        : this.y(y - this.height() / 2)
    }

    // Get defs
    defs () {
      const root = this.root();
      return root && root.defs()
    }

    // Relative move over x and y axes
    dmove (x, y) {
      return this.dx(x).dy(y)
    }

    // Relative move over x axis
    dx (x = 0) {
      return this.x(new SVGNumber(x).plus(this.x()))
    }

    // Relative move over y axis
    dy (y = 0) {
      return this.y(new SVGNumber(y).plus(this.y()))
    }

    getEventHolder () {
      return this
    }

    // Set height of element
    height (height) {
      return this.attr('height', height)
    }

    // Move element to given x and y values
    move (x, y) {
      return this.x(x).y(y)
    }

    // return array of all ancestors of given type up to the root svg
    parents (until = this.root()) {
      until = makeInstance(until);
      const parents = new List();
      let parent = this;

      while (
        (parent = parent.parent())
        && parent.node !== globals.document
        && parent.nodeName !== '#document-fragment') {

        parents.push(parent);

        if (parent.node === until.node) {
          break
        }
      }

      return parents
    }

    // Get referenced element form attribute value
    reference (attr) {
      attr = this.attr(attr);
      if (!attr) return null

      const m = (attr + '').match(reference);
      return m ? makeInstance(m[1]) : null
    }

    // Get parent document
    root () {
      const p = this.parent(getClass(root));
      return p && p.root()
    }

    // set given data to the elements data property
    setData (o) {
      this.dom = o;
      return this
    }

    // Set element size to given width and height
    size (width, height) {
      const p = proportionalSize(this, width, height);

      return this
        .width(new SVGNumber(p.width))
        .height(new SVGNumber(p.height))
    }

    // Set width of element
    width (width) {
      return this.attr('width', width)
    }

    // write svgjs data to the dom
    writeDataToDom () {
      // remove previously set data
      this.node.removeAttribute('svgjs:data');

      if (Object.keys(this.dom).length) {
        this.node.setAttribute('svgjs:data', JSON.stringify(this.dom)); // see #428
      }

      return super.writeDataToDom()
    }

    // Move over x-axis
    x (x) {
      return this.attr('x', x)
    }

    // Move over y-axis
    y (y) {
      return this.attr('y', y)
    }
  }

  extend(Element$1, {
    bbox, rbox, inside, point, ctm, screenCTM
  });

  register(Element$1, 'Element');

  // Define list of available attributes for stroke and fill
  const sugar = {
    stroke: [ 'color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset' ],
    fill: [ 'color', 'opacity', 'rule' ],
    prefix: function (t, a) {
      return a === 'color' ? t : t + '-' + a
    }
  }

  // Add sugar for fill and stroke
  ;[ 'fill', 'stroke' ].forEach(function (m) {
    const extension = {};
    let i;

    extension[m] = function (o) {
      if (typeof o === 'undefined') {
        return this.attr(m)
      }
      if (typeof o === 'string' || o instanceof Color || Color.isRgb(o) || (o instanceof Element$1)) {
        this.attr(m, o);
      } else {
        // set all attributes from sugar.fill and sugar.stroke list
        for (i = sugar[m].length - 1; i >= 0; i--) {
          if (o[sugar[m][i]] != null) {
            this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]]);
          }
        }
      }

      return this
    };

    registerMethods([ 'Element', 'Runner' ], extension);
  });

  registerMethods([ 'Element', 'Runner' ], {
    // Let the user set the matrix directly
    matrix: function (mat, b, c, d, e, f) {
      // Act as a getter
      if (mat == null) {
        return new Matrix(this)
      }

      // Act as a setter, the user can pass a matrix or a set of numbers
      return this.attr('transform', new Matrix(mat, b, c, d, e, f))
    },

    // Map rotation to transform
    rotate: function (angle, cx, cy) {
      return this.transform({ rotate: angle, ox: cx, oy: cy }, true)
    },

    // Map skew to transform
    skew: function (x, y, cx, cy) {
      return arguments.length === 1 || arguments.length === 3
        ? this.transform({ skew: x, ox: y, oy: cx }, true)
        : this.transform({ skew: [ x, y ], ox: cx, oy: cy }, true)
    },

    shear: function (lam, cx, cy) {
      return this.transform({ shear: lam, ox: cx, oy: cy }, true)
    },

    // Map scale to transform
    scale: function (x, y, cx, cy) {
      return arguments.length === 1 || arguments.length === 3
        ? this.transform({ scale: x, ox: y, oy: cx }, true)
        : this.transform({ scale: [ x, y ], ox: cx, oy: cy }, true)
    },

    // Map translate to transform
    translate: function (x, y) {
      return this.transform({ translate: [ x, y ] }, true)
    },

    // Map relative translations to transform
    relative: function (x, y) {
      return this.transform({ relative: [ x, y ] }, true)
    },

    // Map flip to transform
    flip: function (direction = 'both', origin = 'center') {
      if ('xybothtrue'.indexOf(direction) === -1) {
        origin = direction;
        direction = 'both';
      }

      return this.transform({ flip: direction, origin: origin }, true)
    },

    // Opacity
    opacity: function (value) {
      return this.attr('opacity', value)
    }
  });

  registerMethods('radius', {
    // Add x and y radius
    radius: function (x, y = x) {
      const type = (this._element || this).type;
      return type === 'radialGradient'
        ? this.attr('r', new SVGNumber(x))
        : this.rx(x).ry(y)
    }
  });

  registerMethods('Path', {
    // Get path length
    length: function () {
      return this.node.getTotalLength()
    },
    // Get point at length
    pointAt: function (length) {
      return new Point(this.node.getPointAtLength(length))
    }
  });

  registerMethods([ 'Element', 'Runner' ], {
    // Set font
    font: function (a, v) {
      if (typeof a === 'object') {
        for (v in a) this.font(v, a[v]);
        return this
      }

      return a === 'leading'
        ? this.leading(v)
        : a === 'anchor'
          ? this.attr('text-anchor', v)
          : a === 'size' || a === 'family' || a === 'weight' || a === 'stretch' || a === 'variant' || a === 'style'
            ? this.attr('font-' + a, v)
            : this.attr(a, v)
    }
  });

  // Add events to elements
  const methods = [ 'click',
    'dblclick',
    'mousedown',
    'mouseup',
    'mouseover',
    'mouseout',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'touchstart',
    'touchmove',
    'touchleave',
    'touchend',
    'touchcancel' ].reduce(function (last, event) {
    // add event to Element
    const fn = function (f) {
      if (f === null) {
        this.off(event);
      } else {
        this.on(event, f);
      }
      return this
    };

    last[event] = fn;
    return last
  }, {});

  registerMethods('Element', methods);

  // Reset all transformations
  function untransform () {
    return this.attr('transform', null)
  }

  // merge the whole transformation chain into one matrix and returns it
  function matrixify () {
    const matrix = (this.attr('transform') || '')
      // split transformations
      .split(transforms).slice(0, -1).map(function (str) {
        // generate key => value pairs
        const kv = str.trim().split('(');
        return [ kv[0],
          kv[1].split(delimiter)
            .map(function (str) {
              return parseFloat(str)
            })
        ]
      })
      .reverse()
      // merge every transformation into one matrix
      .reduce(function (matrix, transform) {
        if (transform[0] === 'matrix') {
          return matrix.lmultiply(Matrix.fromArray(transform[1]))
        }
        return matrix[transform[0]].apply(matrix, transform[1])
      }, new Matrix());

    return matrix
  }

  // add an element to another parent without changing the visual representation on the screen
  function toParent (parent, i) {
    if (this === parent) return this
    const ctm = this.screenCTM();
    const pCtm = parent.screenCTM().inverse();

    this.addTo(parent, i).untransform().transform(pCtm.multiply(ctm));

    return this
  }

  // same as above with parent equals root-svg
  function toRoot (i) {
    return this.toParent(this.root(), i)
  }

  // Add transformations
  function transform (o, relative) {
    // Act as a getter if no object was passed
    if (o == null || typeof o === 'string') {
      const decomposed = new Matrix(this).decompose();
      return o == null ? decomposed : decomposed[o]
    }

    if (!Matrix.isMatrixLike(o)) {
      // Set the origin according to the defined transform
      o = { ...o, origin: getOrigin(o, this) };
    }

    // The user can pass a boolean, an Element or an Matrix or nothing
    const cleanRelative = relative === true ? this : (relative || false);
    const result = new Matrix(cleanRelative).transform(o);
    return this.attr('transform', result)
  }

  registerMethods('Element', {
    untransform, matrixify, toParent, toRoot, transform
  });

  class Container extends Element$1 {
    flatten (parent = this, index) {
      this.each(function () {
        if (this instanceof Container) {
          return this.flatten().ungroup()
        }
      });

      return this
    }

    ungroup (parent = this.parent(), index = parent.index(this)) {
      // when parent != this, we want append all elements to the end
      index = index === -1 ? parent.children().length : index;

      this.each(function (i, children) {
        // reverse each
        return children[children.length - i - 1].toParent(parent, index)
      });

      return this.remove()
    }
  }

  register(Container, 'Container');

  class Defs extends Container {
    constructor (node, attrs = node) {
      super(nodeOrNew('defs', node), attrs);
    }

    flatten () {
      return this
    }

    ungroup () {
      return this
    }
  }

  register(Defs, 'Defs');

  class Shape extends Element$1 {}

  register(Shape, 'Shape');

  // Radius x value
  function rx (rx) {
    return this.attr('rx', rx)
  }

  // Radius y value
  function ry (ry) {
    return this.attr('ry', ry)
  }

  // Move over x-axis
  function x$3 (x) {
    return x == null
      ? this.cx() - this.rx()
      : this.cx(x + this.rx())
  }

  // Move over y-axis
  function y$3 (y) {
    return y == null
      ? this.cy() - this.ry()
      : this.cy(y + this.ry())
  }

  // Move by center over x-axis
  function cx$1 (x) {
    return this.attr('cx', x)
  }

  // Move by center over y-axis
  function cy$1 (y) {
    return this.attr('cy', y)
  }

  // Set width of element
  function width$2 (width) {
    return width == null
      ? this.rx() * 2
      : this.rx(new SVGNumber(width).divide(2))
  }

  // Set height of element
  function height$2 (height) {
    return height == null
      ? this.ry() * 2
      : this.ry(new SVGNumber(height).divide(2))
  }

  var circled = /*#__PURE__*/Object.freeze({
    __proto__: null,
    rx: rx,
    ry: ry,
    x: x$3,
    y: y$3,
    cx: cx$1,
    cy: cy$1,
    width: width$2,
    height: height$2
  });

  class Ellipse extends Shape {
    constructor (node, attrs = node) {
      super(nodeOrNew('ellipse', node), attrs);
    }

    size (width, height) {
      const p = proportionalSize(this, width, height);

      return this
        .rx(new SVGNumber(p.width).divide(2))
        .ry(new SVGNumber(p.height).divide(2))
    }
  }

  extend(Ellipse, circled);

  registerMethods('Container', {
    // Create an ellipse
    ellipse: wrapWithAttrCheck(function (width = 0, height = width) {
      return this.put(new Ellipse()).size(width, height).move(0, 0)
    })
  });

  register(Ellipse, 'Ellipse');

  class Fragment extends Dom {
    constructor (node = globals.document.createDocumentFragment()) {
      super(node);
    }

    // Import / Export raw xml
    xml (xmlOrFn, outerXML, ns) {
      if (typeof xmlOrFn === 'boolean') {
        ns = outerXML;
        outerXML = xmlOrFn;
        xmlOrFn = null;
      }

      // because this is a fragment we have to put all elements into a wrapper first
      // before we can get the innerXML from it
      if (xmlOrFn == null || typeof xmlOrFn === 'function') {
        const wrapper = new Dom(create('wrapper', ns));
        wrapper.add(this.node.cloneNode(true));

        return wrapper.xml(false, ns)
      }

      // Act as setter if we got a string
      return super.xml(xmlOrFn, false, ns)
    }

  }

  register(Fragment, 'Fragment');

  function from (x, y) {
    return (this._element || this).type === 'radialGradient'
      ? this.attr({ fx: new SVGNumber(x), fy: new SVGNumber(y) })
      : this.attr({ x1: new SVGNumber(x), y1: new SVGNumber(y) })
  }

  function to (x, y) {
    return (this._element || this).type === 'radialGradient'
      ? this.attr({ cx: new SVGNumber(x), cy: new SVGNumber(y) })
      : this.attr({ x2: new SVGNumber(x), y2: new SVGNumber(y) })
  }

  var gradiented = /*#__PURE__*/Object.freeze({
    __proto__: null,
    from: from,
    to: to
  });

  class Gradient extends Container {
    constructor (type, attrs) {
      super(
        nodeOrNew(type + 'Gradient', typeof type === 'string' ? null : type),
        attrs
      );
    }

    // custom attr to handle transform
    attr (a, b, c) {
      if (a === 'transform') a = 'gradientTransform';
      return super.attr(a, b, c)
    }

    bbox () {
      return new Box()
    }

    targets () {
      return baseFind('svg [fill*="' + this.id() + '"]')
    }

    // Alias string conversion to fill
    toString () {
      return this.url()
    }

    // Update gradient
    update (block) {
      // remove all stops
      this.clear();

      // invoke passed block
      if (typeof block === 'function') {
        block.call(this, this);
      }

      return this
    }

    // Return the fill id
    url () {
      return 'url("#' + this.id() + '")'
    }
  }

  extend(Gradient, gradiented);

  registerMethods({
    Container: {
      // Create gradient element in defs
      gradient (...args) {
        return this.defs().gradient(...args)
      }
    },
    // define gradient
    Defs: {
      gradient: wrapWithAttrCheck(function (type, block) {
        return this.put(new Gradient(type)).update(block)
      })
    }
  });

  register(Gradient, 'Gradient');

  class Pattern extends Container {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('pattern', node), attrs);
    }

    // custom attr to handle transform
    attr (a, b, c) {
      if (a === 'transform') a = 'patternTransform';
      return super.attr(a, b, c)
    }

    bbox () {
      return new Box()
    }

    targets () {
      return baseFind('svg [fill*="' + this.id() + '"]')
    }

    // Alias string conversion to fill
    toString () {
      return this.url()
    }

    // Update pattern by rebuilding
    update (block) {
      // remove content
      this.clear();

      // invoke passed block
      if (typeof block === 'function') {
        block.call(this, this);
      }

      return this
    }

    // Return the fill id
    url () {
      return 'url("#' + this.id() + '")'
    }

  }

  registerMethods({
    Container: {
      // Create pattern element in defs
      pattern (...args) {
        return this.defs().pattern(...args)
      }
    },
    Defs: {
      pattern: wrapWithAttrCheck(function (width, height, block) {
        return this.put(new Pattern()).update(block).attr({
          x: 0,
          y: 0,
          width: width,
          height: height,
          patternUnits: 'userSpaceOnUse'
        })
      })
    }
  });

  register(Pattern, 'Pattern');

  class Image extends Shape {
    constructor (node, attrs = node) {
      super(nodeOrNew('image', node), attrs);
    }

    // (re)load image
    load (url, callback) {
      if (!url) return this

      const img = new globals.window.Image();

      on(img, 'load', function (e) {
        const p = this.parent(Pattern);

        // ensure image size
        if (this.width() === 0 && this.height() === 0) {
          this.size(img.width, img.height);
        }

        if (p instanceof Pattern) {
          // ensure pattern size if not set
          if (p.width() === 0 && p.height() === 0) {
            p.size(this.width(), this.height());
          }
        }

        if (typeof callback === 'function') {
          callback.call(this, e);
        }
      }, this);

      on(img, 'load error', function () {
        // dont forget to unbind memory leaking events
        off(img);
      });

      return this.attr('href', (img.src = url), xlink)
    }
  }

  registerAttrHook(function (attr, val, _this) {
    // convert image fill and stroke to patterns
    if (attr === 'fill' || attr === 'stroke') {
      if (isImage.test(val)) {
        val = _this.root().defs().image(val);
      }
    }

    if (val instanceof Image) {
      val = _this.root().defs().pattern(0, 0, (pattern) => {
        pattern.add(val);
      });
    }

    return val
  });

  registerMethods({
    Container: {
      // create image element, load image and set its size
      image: wrapWithAttrCheck(function (source, callback) {
        return this.put(new Image()).size(0, 0).load(source, callback)
      })
    }
  });

  register(Image, 'Image');

  class PointArray extends SVGArray {
    // Get bounding box of points
    bbox () {
      let maxX = -Infinity;
      let maxY = -Infinity;
      let minX = Infinity;
      let minY = Infinity;
      this.forEach(function (el) {
        maxX = Math.max(el[0], maxX);
        maxY = Math.max(el[1], maxY);
        minX = Math.min(el[0], minX);
        minY = Math.min(el[1], minY);
      });
      return new Box(minX, minY, maxX - minX, maxY - minY)
    }

    // Move point string
    move (x, y) {
      const box = this.bbox();

      // get relative offset
      x -= box.x;
      y -= box.y;

      // move every point
      if (!isNaN(x) && !isNaN(y)) {
        for (let i = this.length - 1; i >= 0; i--) {
          this[i] = [ this[i][0] + x, this[i][1] + y ];
        }
      }

      return this
    }

    // Parse point string and flat array
    parse (array = [ 0, 0 ]) {
      const points = [];

      // if it is an array, we flatten it and therefore clone it to 1 depths
      if (array instanceof Array) {
        array = Array.prototype.concat.apply([], array);
      } else { // Else, it is considered as a string
        // parse points
        array = array.trim().split(delimiter).map(parseFloat);
      }

      // validate points - https://svgwg.org/svg2-draft/shapes.html#DataTypePoints
      // Odd number of coordinates is an error. In such cases, drop the last odd coordinate.
      if (array.length % 2 !== 0) array.pop();

      // wrap points in two-tuples
      for (let i = 0, len = array.length; i < len; i = i + 2) {
        points.push([ array[i], array[i + 1] ]);
      }

      return points
    }

    // Resize poly string
    size (width, height) {
      let i;
      const box = this.bbox();

      // recalculate position of all points according to new size
      for (i = this.length - 1; i >= 0; i--) {
        if (box.width) this[i][0] = ((this[i][0] - box.x) * width) / box.width + box.x;
        if (box.height) this[i][1] = ((this[i][1] - box.y) * height) / box.height + box.y;
      }

      return this
    }

    // Convert array to line object
    toLine () {
      return {
        x1: this[0][0],
        y1: this[0][1],
        x2: this[1][0],
        y2: this[1][1]
      }
    }

    // Convert array to string
    toString () {
      const array = [];
      // convert to a poly point string
      for (let i = 0, il = this.length; i < il; i++) {
        array.push(this[i].join(','));
      }

      return array.join(' ')
    }

    transform (m) {
      return this.clone().transformO(m)
    }

    // transform points with matrix (similar to Point.transform)
    transformO (m) {
      if (!Matrix.isMatrixLike(m)) {
        m = new Matrix(m);
      }

      for (let i = this.length; i--;) {
        // Perform the matrix multiplication
        const [ x, y ] = this[i];
        this[i][0] = m.a * x + m.c * y + m.e;
        this[i][1] = m.b * x + m.d * y + m.f;
      }

      return this
    }

  }

  const MorphArray = PointArray;

  // Move by left top corner over x-axis
  function x$2 (x) {
    return x == null ? this.bbox().x : this.move(x, this.bbox().y)
  }

  // Move by left top corner over y-axis
  function y$2 (y) {
    return y == null ? this.bbox().y : this.move(this.bbox().x, y)
  }

  // Set width of element
  function width$1 (width) {
    const b = this.bbox();
    return width == null ? b.width : this.size(width, b.height)
  }

  // Set height of element
  function height$1 (height) {
    const b = this.bbox();
    return height == null ? b.height : this.size(b.width, height)
  }

  var pointed = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MorphArray: MorphArray,
    x: x$2,
    y: y$2,
    width: width$1,
    height: height$1
  });

  class Line extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('line', node), attrs);
    }

    // Get array
    array () {
      return new PointArray([
        [ this.attr('x1'), this.attr('y1') ],
        [ this.attr('x2'), this.attr('y2') ]
      ])
    }

    // Move by left top corner
    move (x, y) {
      return this.attr(this.array().move(x, y).toLine())
    }

    // Overwrite native plot() method
    plot (x1, y1, x2, y2) {
      if (x1 == null) {
        return this.array()
      } else if (typeof y1 !== 'undefined') {
        x1 = { x1, y1, x2, y2 };
      } else {
        x1 = new PointArray(x1).toLine();
      }

      return this.attr(x1)
    }

    // Set element size to given width and height
    size (width, height) {
      const p = proportionalSize(this, width, height);
      return this.attr(this.array().size(p.width, p.height).toLine())
    }
  }

  extend(Line, pointed);

  registerMethods({
    Container: {
      // Create a line element
      line: wrapWithAttrCheck(function (...args) {
        // make sure plot is called as a setter
        // x1 is not necessarily a number, it can also be an array, a string and a PointArray
        return Line.prototype.plot.apply(
          this.put(new Line())
          , args[0] != null ? args : [ 0, 0, 0, 0 ]
        )
      })
    }
  });

  register(Line, 'Line');

  class Marker extends Container {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('marker', node), attrs);
    }

    // Set height of element
    height (height) {
      return this.attr('markerHeight', height)
    }

    orient (orient) {
      return this.attr('orient', orient)
    }

    // Set marker refX and refY
    ref (x, y) {
      return this.attr('refX', x).attr('refY', y)
    }

    // Return the fill id
    toString () {
      return 'url(#' + this.id() + ')'
    }

    // Update marker
    update (block) {
      // remove all content
      this.clear();

      // invoke passed block
      if (typeof block === 'function') {
        block.call(this, this);
      }

      return this
    }

    // Set width of element
    width (width) {
      return this.attr('markerWidth', width)
    }

  }

  registerMethods({
    Container: {
      marker (...args) {
        // Create marker element in defs
        return this.defs().marker(...args)
      }
    },
    Defs: {
      // Create marker
      marker: wrapWithAttrCheck(function (width, height, block) {
        // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
        return this.put(new Marker())
          .size(width, height)
          .ref(width / 2, height / 2)
          .viewbox(0, 0, width, height)
          .attr('orient', 'auto')
          .update(block)
      })
    },
    marker: {
      // Create and attach markers
      marker (marker, width, height, block) {
        let attr = [ 'marker' ];

        // Build attribute name
        if (marker !== 'all') attr.push(marker);
        attr = attr.join('-');

        // Set marker attribute
        marker = arguments[1] instanceof Marker
          ? arguments[1]
          : this.defs().marker(width, height, block);

        return this.attr(attr, marker)
      }
    }
  });

  register(Marker, 'Marker');

  /***
  Base Class
  ==========
  The base stepper class that will be
  ***/

  function makeSetterGetter (k, f) {
    return function (v) {
      if (v == null) return this[k]
      this[k] = v;
      if (f) f.call(this);
      return this
    }
  }

  const easing = {
    '-': function (pos) {
      return pos
    },
    '<>': function (pos) {
      return -Math.cos(pos * Math.PI) / 2 + 0.5
    },
    '>': function (pos) {
      return Math.sin(pos * Math.PI / 2)
    },
    '<': function (pos) {
      return -Math.cos(pos * Math.PI / 2) + 1
    },
    bezier: function (x1, y1, x2, y2) {
      // see https://www.w3.org/TR/css-easing-1/#cubic-bezier-algo
      return function (t) {
        if (t < 0) {
          if (x1 > 0) {
            return y1 / x1 * t
          } else if (x2 > 0) {
            return y2 / x2 * t
          } else {
            return 0
          }
        } else if (t > 1) {
          if (x2 < 1) {
            return (1 - y2) / (1 - x2) * t + (y2 - x2) / (1 - x2)
          } else if (x1 < 1) {
            return (1 - y1) / (1 - x1) * t + (y1 - x1) / (1 - x1)
          } else {
            return 1
          }
        } else {
          return 3 * t * (1 - t) ** 2 * y1 + 3 * t ** 2 * (1 - t) * y2 + t ** 3
        }
      }
    },
    // see https://www.w3.org/TR/css-easing-1/#step-timing-function-algo
    steps: function (steps, stepPosition = 'end') {
      // deal with "jump-" prefix
      stepPosition = stepPosition.split('-').reverse()[0];

      let jumps = steps;
      if (stepPosition === 'none') {
        --jumps;
      } else if (stepPosition === 'both') {
        ++jumps;
      }

      // The beforeFlag is essentially useless
      return (t, beforeFlag = false) => {
        // Step is called currentStep in referenced url
        let step = Math.floor(t * steps);
        const jumping = (t * step) % 1 === 0;

        if (stepPosition === 'start' || stepPosition === 'both') {
          ++step;
        }

        if (beforeFlag && jumping) {
          --step;
        }

        if (t >= 0 && step < 0) {
          step = 0;
        }

        if (t <= 1 && step > jumps) {
          step = jumps;
        }

        return step / jumps
      }
    }
  };

  class Stepper {
    done () {
      return false
    }
  }

  /***
  Easing Functions
  ================
  ***/

  class Ease extends Stepper {
    constructor (fn = timeline.ease) {
      super();
      this.ease = easing[fn] || fn;
    }

    step (from, to, pos) {
      if (typeof from !== 'number') {
        return pos < 1 ? from : to
      }
      return from + (to - from) * this.ease(pos)
    }
  }

  /***
  Controller Types
  ================
  ***/

  class Controller extends Stepper {
    constructor (fn) {
      super();
      this.stepper = fn;
    }

    done (c) {
      return c.done
    }

    step (current, target, dt, c) {
      return this.stepper(current, target, dt, c)
    }

  }

  function recalculate () {
    // Apply the default parameters
    const duration = (this._duration || 500) / 1000;
    const overshoot = this._overshoot || 0;

    // Calculate the PID natural response
    const eps = 1e-10;
    const pi = Math.PI;
    const os = Math.log(overshoot / 100 + eps);
    const zeta = -os / Math.sqrt(pi * pi + os * os);
    const wn = 3.9 / (zeta * duration);

    // Calculate the Spring values
    this.d = 2 * zeta * wn;
    this.k = wn * wn;
  }

  class Spring extends Controller {
    constructor (duration = 500, overshoot = 0) {
      super();
      this.duration(duration)
        .overshoot(overshoot);
    }

    step (current, target, dt, c) {
      if (typeof current === 'string') return current
      c.done = dt === Infinity;
      if (dt === Infinity) return target
      if (dt === 0) return current

      if (dt > 100) dt = 16;

      dt /= 1000;

      // Get the previous velocity
      const velocity = c.velocity || 0;

      // Apply the control to get the new position and store it
      const acceleration = -this.d * velocity - this.k * (current - target);
      const newPosition = current
        + velocity * dt
        + acceleration * dt * dt / 2;

      // Store the velocity
      c.velocity = velocity + acceleration * dt;

      // Figure out if we have converged, and if so, pass the value
      c.done = Math.abs(target - newPosition) + Math.abs(velocity) < 0.002;
      return c.done ? target : newPosition
    }
  }

  extend(Spring, {
    duration: makeSetterGetter('_duration', recalculate),
    overshoot: makeSetterGetter('_overshoot', recalculate)
  });

  class PID extends Controller {
    constructor (p = 0.1, i = 0.01, d = 0, windup = 1000) {
      super();
      this.p(p).i(i).d(d).windup(windup);
    }

    step (current, target, dt, c) {
      if (typeof current === 'string') return current
      c.done = dt === Infinity;

      if (dt === Infinity) return target
      if (dt === 0) return current

      const p = target - current;
      let i = (c.integral || 0) + p * dt;
      const d = (p - (c.error || 0)) / dt;
      const windup = this._windup;

      // antiwindup
      if (windup !== false) {
        i = Math.max(-windup, Math.min(i, windup));
      }

      c.error = p;
      c.integral = i;

      c.done = Math.abs(p) < 0.001;

      return c.done ? target : current + (this.P * p + this.I * i + this.D * d)
    }
  }

  extend(PID, {
    windup: makeSetterGetter('_windup'),
    p: makeSetterGetter('P'),
    i: makeSetterGetter('I'),
    d: makeSetterGetter('D')
  });

  const segmentParameters = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };

  const pathHandlers = {
    M: function (c, p, p0) {
      p.x = p0.x = c[0];
      p.y = p0.y = c[1];

      return [ 'M', p.x, p.y ]
    },
    L: function (c, p) {
      p.x = c[0];
      p.y = c[1];
      return [ 'L', c[0], c[1] ]
    },
    H: function (c, p) {
      p.x = c[0];
      return [ 'H', c[0] ]
    },
    V: function (c, p) {
      p.y = c[0];
      return [ 'V', c[0] ]
    },
    C: function (c, p) {
      p.x = c[4];
      p.y = c[5];
      return [ 'C', c[0], c[1], c[2], c[3], c[4], c[5] ]
    },
    S: function (c, p) {
      p.x = c[2];
      p.y = c[3];
      return [ 'S', c[0], c[1], c[2], c[3] ]
    },
    Q: function (c, p) {
      p.x = c[2];
      p.y = c[3];
      return [ 'Q', c[0], c[1], c[2], c[3] ]
    },
    T: function (c, p) {
      p.x = c[0];
      p.y = c[1];
      return [ 'T', c[0], c[1] ]
    },
    Z: function (c, p, p0) {
      p.x = p0.x;
      p.y = p0.y;
      return [ 'Z' ]
    },
    A: function (c, p) {
      p.x = c[5];
      p.y = c[6];
      return [ 'A', c[0], c[1], c[2], c[3], c[4], c[5], c[6] ]
    }
  };

  const mlhvqtcsaz = 'mlhvqtcsaz'.split('');

  for (let i = 0, il = mlhvqtcsaz.length; i < il; ++i) {
    pathHandlers[mlhvqtcsaz[i]] = (function (i) {
      return function (c, p, p0) {
        if (i === 'H') c[0] = c[0] + p.x;
        else if (i === 'V') c[0] = c[0] + p.y;
        else if (i === 'A') {
          c[5] = c[5] + p.x;
          c[6] = c[6] + p.y;
        } else {
          for (let j = 0, jl = c.length; j < jl; ++j) {
            c[j] = c[j] + (j % 2 ? p.y : p.x);
          }
        }

        return pathHandlers[i](c, p, p0)
      }
    })(mlhvqtcsaz[i].toUpperCase());
  }

  function makeAbsolut (parser) {
    const command = parser.segment[0];
    return pathHandlers[command](parser.segment.slice(1), parser.p, parser.p0)
  }

  function segmentComplete (parser) {
    return parser.segment.length && parser.segment.length - 1 === segmentParameters[parser.segment[0].toUpperCase()]
  }

  function startNewSegment (parser, token) {
    parser.inNumber && finalizeNumber(parser, false);
    const pathLetter = isPathLetter.test(token);

    if (pathLetter) {
      parser.segment = [ token ];
    } else {
      const lastCommand = parser.lastCommand;
      const small = lastCommand.toLowerCase();
      const isSmall = lastCommand === small;
      parser.segment = [ small === 'm' ? (isSmall ? 'l' : 'L') : lastCommand ];
    }

    parser.inSegment = true;
    parser.lastCommand = parser.segment[0];

    return pathLetter
  }

  function finalizeNumber (parser, inNumber) {
    if (!parser.inNumber) throw new Error('Parser Error')
    parser.number && parser.segment.push(parseFloat(parser.number));
    parser.inNumber = inNumber;
    parser.number = '';
    parser.pointSeen = false;
    parser.hasExponent = false;

    if (segmentComplete(parser)) {
      finalizeSegment(parser);
    }
  }

  function finalizeSegment (parser) {
    parser.inSegment = false;
    if (parser.absolute) {
      parser.segment = makeAbsolut(parser);
    }
    parser.segments.push(parser.segment);
  }

  function isArcFlag (parser) {
    if (!parser.segment.length) return false
    const isArc = parser.segment[0].toUpperCase() === 'A';
    const length = parser.segment.length;

    return isArc && (length === 4 || length === 5)
  }

  function isExponential (parser) {
    return parser.lastToken.toUpperCase() === 'E'
  }

  function pathParser (d, toAbsolute = true) {

    let index = 0;
    let token = '';
    const parser = {
      segment: [],
      inNumber: false,
      number: '',
      lastToken: '',
      inSegment: false,
      segments: [],
      pointSeen: false,
      hasExponent: false,
      absolute: toAbsolute,
      p0: new Point(),
      p: new Point()
    };

    while ((parser.lastToken = token, token = d.charAt(index++))) {
      if (!parser.inSegment) {
        if (startNewSegment(parser, token)) {
          continue
        }
      }

      if (token === '.') {
        if (parser.pointSeen || parser.hasExponent) {
          finalizeNumber(parser, false);
          --index;
          continue
        }
        parser.inNumber = true;
        parser.pointSeen = true;
        parser.number += token;
        continue
      }

      if (!isNaN(parseInt(token))) {

        if (parser.number === '0' || isArcFlag(parser)) {
          parser.inNumber = true;
          parser.number = token;
          finalizeNumber(parser, true);
          continue
        }

        parser.inNumber = true;
        parser.number += token;
        continue
      }

      if (token === ' ' || token === ',') {
        if (parser.inNumber) {
          finalizeNumber(parser, false);
        }
        continue
      }

      if (token === '-') {
        if (parser.inNumber && !isExponential(parser)) {
          finalizeNumber(parser, false);
          --index;
          continue
        }
        parser.number += token;
        parser.inNumber = true;
        continue
      }

      if (token.toUpperCase() === 'E') {
        parser.number += token;
        parser.hasExponent = true;
        continue
      }

      if (isPathLetter.test(token)) {
        if (parser.inNumber) {
          finalizeNumber(parser, false);
        } else if (!segmentComplete(parser)) {
          throw new Error('parser Error')
        } else {
          finalizeSegment(parser);
        }
        --index;
      }
    }

    if (parser.inNumber) {
      finalizeNumber(parser, false);
    }

    if (parser.inSegment && segmentComplete(parser)) {
      finalizeSegment(parser);
    }

    return parser.segments

  }

  function arrayToString (a) {
    let s = '';
    for (let i = 0, il = a.length; i < il; i++) {
      s += a[i][0];

      if (a[i][1] != null) {
        s += a[i][1];

        if (a[i][2] != null) {
          s += ' ';
          s += a[i][2];

          if (a[i][3] != null) {
            s += ' ';
            s += a[i][3];
            s += ' ';
            s += a[i][4];

            if (a[i][5] != null) {
              s += ' ';
              s += a[i][5];
              s += ' ';
              s += a[i][6];

              if (a[i][7] != null) {
                s += ' ';
                s += a[i][7];
              }
            }
          }
        }
      }
    }

    return s + ' '
  }

  class PathArray extends SVGArray {
    // Get bounding box of path
    bbox () {
      parser().path.setAttribute('d', this.toString());
      return new Box(parser.nodes.path.getBBox())
    }

    // Move path string
    move (x, y) {
      // get bounding box of current situation
      const box = this.bbox();

      // get relative offset
      x -= box.x;
      y -= box.y;

      if (!isNaN(x) && !isNaN(y)) {
        // move every point
        for (let l, i = this.length - 1; i >= 0; i--) {
          l = this[i][0];

          if (l === 'M' || l === 'L' || l === 'T') {
            this[i][1] += x;
            this[i][2] += y;
          } else if (l === 'H') {
            this[i][1] += x;
          } else if (l === 'V') {
            this[i][1] += y;
          } else if (l === 'C' || l === 'S' || l === 'Q') {
            this[i][1] += x;
            this[i][2] += y;
            this[i][3] += x;
            this[i][4] += y;

            if (l === 'C') {
              this[i][5] += x;
              this[i][6] += y;
            }
          } else if (l === 'A') {
            this[i][6] += x;
            this[i][7] += y;
          }
        }
      }

      return this
    }

    // Absolutize and parse path to array
    parse (d = 'M0 0') {
      if (Array.isArray(d)) {
        d = Array.prototype.concat.apply([], d).toString();
      }

      return pathParser(d)
    }

    // Resize path string
    size (width, height) {
      // get bounding box of current situation
      const box = this.bbox();
      let i, l;

      // If the box width or height is 0 then we ignore
      // transformations on the respective axis
      box.width = box.width === 0 ? 1 : box.width;
      box.height = box.height === 0 ? 1 : box.height;

      // recalculate position of all points according to new size
      for (i = this.length - 1; i >= 0; i--) {
        l = this[i][0];

        if (l === 'M' || l === 'L' || l === 'T') {
          this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x;
          this[i][2] = ((this[i][2] - box.y) * height) / box.height + box.y;
        } else if (l === 'H') {
          this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x;
        } else if (l === 'V') {
          this[i][1] = ((this[i][1] - box.y) * height) / box.height + box.y;
        } else if (l === 'C' || l === 'S' || l === 'Q') {
          this[i][1] = ((this[i][1] - box.x) * width) / box.width + box.x;
          this[i][2] = ((this[i][2] - box.y) * height) / box.height + box.y;
          this[i][3] = ((this[i][3] - box.x) * width) / box.width + box.x;
          this[i][4] = ((this[i][4] - box.y) * height) / box.height + box.y;

          if (l === 'C') {
            this[i][5] = ((this[i][5] - box.x) * width) / box.width + box.x;
            this[i][6] = ((this[i][6] - box.y) * height) / box.height + box.y;
          }
        } else if (l === 'A') {
          // resize radii
          this[i][1] = (this[i][1] * width) / box.width;
          this[i][2] = (this[i][2] * height) / box.height;

          // move position values
          this[i][6] = ((this[i][6] - box.x) * width) / box.width + box.x;
          this[i][7] = ((this[i][7] - box.y) * height) / box.height + box.y;
        }
      }

      return this
    }

    // Convert array to string
    toString () {
      return arrayToString(this)
    }

  }

  const getClassForType = (value) => {
    const type = typeof value;

    if (type === 'number') {
      return SVGNumber
    } else if (type === 'string') {
      if (Color.isColor(value)) {
        return Color
      } else if (delimiter.test(value)) {
        return isPathLetter.test(value)
          ? PathArray
          : SVGArray
      } else if (numberAndUnit.test(value)) {
        return SVGNumber
      } else {
        return NonMorphable
      }
    } else if (morphableTypes.indexOf(value.constructor) > -1) {
      return value.constructor
    } else if (Array.isArray(value)) {
      return SVGArray
    } else if (type === 'object') {
      return ObjectBag
    } else {
      return NonMorphable
    }
  };

  class Morphable {
    constructor (stepper) {
      this._stepper = stepper || new Ease('-');

      this._from = null;
      this._to = null;
      this._type = null;
      this._context = null;
      this._morphObj = null;
    }

    at (pos) {
      const _this = this;

      return this._morphObj.fromArray(
        this._from.map(function (i, index) {
          return _this._stepper.step(i, _this._to[index], pos, _this._context[index], _this._context)
        })
      )
    }

    done () {
      const complete = this._context
        .map(this._stepper.done)
        .reduce(function (last, curr) {
          return last && curr
        }, true);
      return complete
    }

    from (val) {
      if (val == null) {
        return this._from
      }

      this._from = this._set(val);
      return this
    }

    stepper (stepper) {
      if (stepper == null) return this._stepper
      this._stepper = stepper;
      return this
    }

    to (val) {
      if (val == null) {
        return this._to
      }

      this._to = this._set(val);
      return this
    }

    type (type) {
      // getter
      if (type == null) {
        return this._type
      }

      // setter
      this._type = type;
      return this
    }

    _set (value) {
      if (!this._type) {
        this.type(getClassForType(value));
      }

      let result = (new this._type(value));
      if (this._type === Color) {
        result = this._to
          ? result[this._to[4]]()
          : this._from
            ? result[this._from[4]]()
            : result;
      }

      if (this._type === ObjectBag) {
        result = this._to
          ? result.align(this._to)
          : this._from
            ? result.align(this._from)
            : result;
      }

      result = result.toArray();

      this._morphObj = this._morphObj || new this._type();
      this._context = this._context
        || Array.apply(null, Array(result.length))
          .map(Object)
          .map(function (o) {
            o.done = true;
            return o
          });
      return result
    }

  }

  class NonMorphable {
    constructor (...args) {
      this.init(...args);
    }

    init (val) {
      val = Array.isArray(val) ? val[0] : val;
      this.value = val;
      return this
    }

    toArray () {
      return [ this.value ]
    }

    valueOf () {
      return this.value
    }

  }

  class TransformBag {
    constructor (...args) {
      this.init(...args);
    }

    init (obj) {
      if (Array.isArray(obj)) {
        obj = {
          scaleX: obj[0],
          scaleY: obj[1],
          shear: obj[2],
          rotate: obj[3],
          translateX: obj[4],
          translateY: obj[5],
          originX: obj[6],
          originY: obj[7]
        };
      }

      Object.assign(this, TransformBag.defaults, obj);
      return this
    }

    toArray () {
      const v = this;

      return [
        v.scaleX,
        v.scaleY,
        v.shear,
        v.rotate,
        v.translateX,
        v.translateY,
        v.originX,
        v.originY
      ]
    }
  }

  TransformBag.defaults = {
    scaleX: 1,
    scaleY: 1,
    shear: 0,
    rotate: 0,
    translateX: 0,
    translateY: 0,
    originX: 0,
    originY: 0
  };

  const sortByKey = (a, b) => {
    return (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0))
  };

  class ObjectBag {
    constructor (...args) {
      this.init(...args);
    }

    align (other) {
      for (let i = 0, il = this.values.length; i < il; ++i) {
        if (this.values[i] === Color) {
          const space = other[i + 6];
          const color = new Color(this.values.splice(i + 2, 5))[space]().toArray();
          this.values.splice(i + 2, 0, ...color);
        }
      }
      return this
    }

    init (objOrArr) {
      this.values = [];

      if (Array.isArray(objOrArr)) {
        this.values = objOrArr.slice();
        return
      }

      objOrArr = objOrArr || {};
      const entries = [];

      for (const i in objOrArr) {
        const Type = getClassForType(objOrArr[i]);
        const val = new Type(objOrArr[i]).toArray();
        entries.push([ i, Type, val.length, ...val ]);
      }

      entries.sort(sortByKey);

      this.values = entries.reduce((last, curr) => last.concat(curr), []);
      return this
    }

    toArray () {
      return this.values
    }

    valueOf () {
      const obj = {};
      const arr = this.values;

      // for (var i = 0, len = arr.length; i < len; i += 2) {
      while (arr.length) {
        const key = arr.shift();
        const Type = arr.shift();
        const num = arr.shift();
        const values = arr.splice(0, num);
        obj[key] = new Type(values).valueOf();
      }

      return obj
    }

  }

  const morphableTypes = [
    NonMorphable,
    TransformBag,
    ObjectBag
  ];

  function registerMorphableType (type = []) {
    morphableTypes.push(...[].concat(type));
  }

  function makeMorphable () {
    extend(morphableTypes, {
      to (val) {
        return new Morphable()
          .type(this.constructor)
          .from(this.valueOf())
          .to(val)
      },
      fromArray (arr) {
        this.init(arr);
        return this
      }
    });
  }

  class Path extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('path', node), attrs);
    }

    // Get array
    array () {
      return this._array || (this._array = new PathArray(this.attr('d')))
    }

    // Clear array cache
    clear () {
      delete this._array;
      return this
    }

    // Set height of element
    height (height) {
      return height == null ? this.bbox().height : this.size(this.bbox().width, height)
    }

    // Move by left top corner
    move (x, y) {
      return this.attr('d', this.array().move(x, y))
    }

    // Plot new path
    plot (d) {
      return (d == null)
        ? this.array()
        : this.clear().attr('d', typeof d === 'string' ? d : (this._array = new PathArray(d)))
    }

    // Set element size to given width and height
    size (width, height) {
      const p = proportionalSize(this, width, height);
      return this.attr('d', this.array().size(p.width, p.height))
    }

    // Set width of element
    width (width) {
      return width == null ? this.bbox().width : this.size(width, this.bbox().height)
    }

    // Move by left top corner over x-axis
    x (x) {
      return x == null ? this.bbox().x : this.move(x, this.bbox().y)
    }

    // Move by left top corner over y-axis
    y (y) {
      return y == null ? this.bbox().y : this.move(this.bbox().x, y)
    }

  }

  // Define morphable array
  Path.prototype.MorphArray = PathArray;

  // Add parent method
  registerMethods({
    Container: {
      // Create a wrapped path element
      path: wrapWithAttrCheck(function (d) {
        // make sure plot is called as a setter
        return this.put(new Path()).plot(d || new PathArray())
      })
    }
  });

  register(Path, 'Path');

  // Get array
  function array () {
    return this._array || (this._array = new PointArray(this.attr('points')))
  }

  // Clear array cache
  function clear () {
    delete this._array;
    return this
  }

  // Move by left top corner
  function move$2 (x, y) {
    return this.attr('points', this.array().move(x, y))
  }

  // Plot new path
  function plot (p) {
    return (p == null)
      ? this.array()
      : this.clear().attr('points', typeof p === 'string'
        ? p
        : (this._array = new PointArray(p)))
  }

  // Set element size to given width and height
  function size$1 (width, height) {
    const p = proportionalSize(this, width, height);
    return this.attr('points', this.array().size(p.width, p.height))
  }

  var poly = /*#__PURE__*/Object.freeze({
    __proto__: null,
    array: array,
    clear: clear,
    move: move$2,
    plot: plot,
    size: size$1
  });

  class Polygon extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('polygon', node), attrs);
    }
  }

  registerMethods({
    Container: {
      // Create a wrapped polygon element
      polygon: wrapWithAttrCheck(function (p) {
        // make sure plot is called as a setter
        return this.put(new Polygon()).plot(p || new PointArray())
      })
    }
  });

  extend(Polygon, pointed);
  extend(Polygon, poly);
  register(Polygon, 'Polygon');

  class Polyline extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('polyline', node), attrs);
    }
  }

  registerMethods({
    Container: {
      // Create a wrapped polygon element
      polyline: wrapWithAttrCheck(function (p) {
        // make sure plot is called as a setter
        return this.put(new Polyline()).plot(p || new PointArray())
      })
    }
  });

  extend(Polyline, pointed);
  extend(Polyline, poly);
  register(Polyline, 'Polyline');

  class Rect extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('rect', node), attrs);
    }
  }

  extend(Rect, { rx, ry });

  registerMethods({
    Container: {
      // Create a rect element
      rect: wrapWithAttrCheck(function (width, height) {
        return this.put(new Rect()).size(width, height)
      })
    }
  });

  register(Rect, 'Rect');

  class Queue {
    constructor () {
      this._first = null;
      this._last = null;
    }

    // Shows us the first item in the list
    first () {
      return this._first && this._first.value
    }

    // Shows us the last item in the list
    last () {
      return this._last && this._last.value
    }

    push (value) {
      // An item stores an id and the provided value
      const item = typeof value.next !== 'undefined' ? value : { value: value, next: null, prev: null };

      // Deal with the queue being empty or populated
      if (this._last) {
        item.prev = this._last;
        this._last.next = item;
        this._last = item;
      } else {
        this._last = item;
        this._first = item;
      }

      // Return the current item
      return item
    }

    // Removes the item that was returned from the push
    remove (item) {
      // Relink the previous item
      if (item.prev) item.prev.next = item.next;
      if (item.next) item.next.prev = item.prev;
      if (item === this._last) this._last = item.prev;
      if (item === this._first) this._first = item.next;

      // Invalidate item
      item.prev = null;
      item.next = null;
    }

    shift () {
      // Check if we have a value
      const remove = this._first;
      if (!remove) return null

      // If we do, remove it and relink things
      this._first = remove.next;
      if (this._first) this._first.prev = null;
      this._last = this._first ? this._last : null;
      return remove.value
    }

  }

  const Animator = {
    nextDraw: null,
    frames: new Queue(),
    timeouts: new Queue(),
    immediates: new Queue(),
    timer: () => globals.window.performance || globals.window.Date,
    transforms: [],

    frame (fn) {
      // Store the node
      const node = Animator.frames.push({ run: fn });

      // Request an animation frame if we don't have one
      if (Animator.nextDraw === null) {
        Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      }

      // Return the node so we can remove it easily
      return node
    },

    timeout (fn, delay) {
      delay = delay || 0;

      // Work out when the event should fire
      const time = Animator.timer().now() + delay;

      // Add the timeout to the end of the queue
      const node = Animator.timeouts.push({ run: fn, time: time });

      // Request another animation frame if we need one
      if (Animator.nextDraw === null) {
        Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      }

      return node
    },

    immediate (fn) {
      // Add the immediate fn to the end of the queue
      const node = Animator.immediates.push(fn);
      // Request another animation frame if we need one
      if (Animator.nextDraw === null) {
        Animator.nextDraw = globals.window.requestAnimationFrame(Animator._draw);
      }

      return node
    },

    cancelFrame (node) {
      node != null && Animator.frames.remove(node);
    },

    clearTimeout (node) {
      node != null && Animator.timeouts.remove(node);
    },

    cancelImmediate (node) {
      node != null && Animator.immediates.remove(node);
    },

    _draw (now) {
      // Run all the timeouts we can run, if they are not ready yet, add them
      // to the end of the queue immediately! (bad timeouts!!! [sarcasm])
      let nextTimeout = null;
      const lastTimeout = Animator.timeouts.last();
      while ((nextTimeout = Animator.timeouts.shift())) {
        // Run the timeout if its time, or push it to the end
        if (now >= nextTimeout.time) {
          nextTimeout.run();
        } else {
          Animator.timeouts.push(nextTimeout);
        }

        // If we hit the last item, we should stop shifting out more items
        if (nextTimeout === lastTimeout) break
      }

      // Run all of the animation frames
      let nextFrame = null;
      const lastFrame = Animator.frames.last();
      while ((nextFrame !== lastFrame) && (nextFrame = Animator.frames.shift())) {
        nextFrame.run(now);
      }

      let nextImmediate = null;
      while ((nextImmediate = Animator.immediates.shift())) {
        nextImmediate();
      }

      // If we have remaining timeouts or frames, draw until we don't anymore
      Animator.nextDraw = Animator.timeouts.first() || Animator.frames.first()
        ? globals.window.requestAnimationFrame(Animator._draw)
        : null;
    }
  };

  const makeSchedule = function (runnerInfo) {
    const start = runnerInfo.start;
    const duration = runnerInfo.runner.duration();
    const end = start + duration;
    return { start: start, duration: duration, end: end, runner: runnerInfo.runner }
  };

  const defaultSource = function () {
    const w = globals.window;
    return (w.performance || w.Date).now()
  };

  class Timeline extends EventTarget {
    // Construct a new timeline on the given element
    constructor (timeSource = defaultSource) {
      super();

      this._timeSource = timeSource;

      // Store the timing variables
      this._startTime = 0;
      this._speed = 1.0;

      // Determines how long a runner is hold in memory. Can be a dt or true/false
      this._persist = 0;

      // Keep track of the running animations and their starting parameters
      this._nextFrame = null;
      this._paused = true;
      this._runners = [];
      this._runnerIds = [];
      this._lastRunnerId = -1;
      this._time = 0;
      this._lastSourceTime = 0;
      this._lastStepTime = 0;

      // Make sure that step is always called in class context
      this._step = this._stepFn.bind(this, false);
      this._stepImmediate = this._stepFn.bind(this, true);
    }

    active () {
      return !!this._nextFrame
    }

    finish () {
      // Go to end and pause
      this.time(this.getEndTimeOfTimeline() + 1);
      return this.pause()
    }

    // Calculates the end of the timeline
    getEndTime () {
      const lastRunnerInfo = this.getLastRunnerInfo();
      const lastDuration = lastRunnerInfo ? lastRunnerInfo.runner.duration() : 0;
      const lastStartTime = lastRunnerInfo ? lastRunnerInfo.start : this._time;
      return lastStartTime + lastDuration
    }

    getEndTimeOfTimeline () {
      const endTimes = this._runners.map((i) => i.start + i.runner.duration());
      return Math.max(0, ...endTimes)
    }

    getLastRunnerInfo () {
      return this.getRunnerInfoById(this._lastRunnerId)
    }

    getRunnerInfoById (id) {
      return this._runners[this._runnerIds.indexOf(id)] || null
    }

    pause () {
      this._paused = true;
      return this._continue()
    }

    persist (dtOrForever) {
      if (dtOrForever == null) return this._persist
      this._persist = dtOrForever;
      return this
    }

    play () {
      // Now make sure we are not paused and continue the animation
      this._paused = false;
      return this.updateTime()._continue()
    }

    reverse (yes) {
      const currentSpeed = this.speed();
      if (yes == null) return this.speed(-currentSpeed)

      const positive = Math.abs(currentSpeed);
      return this.speed(yes ? -positive : positive)
    }

    // schedules a runner on the timeline
    schedule (runner, delay, when) {
      if (runner == null) {
        return this._runners.map(makeSchedule)
      }

      // The start time for the next animation can either be given explicitly,
      // derived from the current timeline time or it can be relative to the
      // last start time to chain animations directly

      let absoluteStartTime = 0;
      const endTime = this.getEndTime();
      delay = delay || 0;

      // Work out when to start the animation
      if (when == null || when === 'last' || when === 'after') {
        // Take the last time and increment
        absoluteStartTime = endTime;
      } else if (when === 'absolute' || when === 'start') {
        absoluteStartTime = delay;
        delay = 0;
      } else if (when === 'now') {
        absoluteStartTime = this._time;
      } else if (when === 'relative') {
        const runnerInfo = this.getRunnerInfoById(runner.id);
        if (runnerInfo) {
          absoluteStartTime = runnerInfo.start + delay;
          delay = 0;
        }
      } else if (when === 'with-last') {
        const lastRunnerInfo = this.getLastRunnerInfo();
        const lastStartTime = lastRunnerInfo ? lastRunnerInfo.start : this._time;
        absoluteStartTime = lastStartTime;
      } else {
        throw new Error('Invalid value for the "when" parameter')
      }

      // Manage runner
      runner.unschedule();
      runner.timeline(this);

      const persist = runner.persist();
      const runnerInfo = {
        persist: persist === null ? this._persist : persist,
        start: absoluteStartTime + delay,
        runner
      };

      this._lastRunnerId = runner.id;

      this._runners.push(runnerInfo);
      this._runners.sort((a, b) => a.start - b.start);
      this._runnerIds = this._runners.map(info => info.runner.id);

      this.updateTime()._continue();
      return this
    }

    seek (dt) {
      return this.time(this._time + dt)
    }

    source (fn) {
      if (fn == null) return this._timeSource
      this._timeSource = fn;
      return this
    }

    speed (speed) {
      if (speed == null) return this._speed
      this._speed = speed;
      return this
    }

    stop () {
      // Go to start and pause
      this.time(0);
      return this.pause()
    }

    time (time) {
      if (time == null) return this._time
      this._time = time;
      return this._continue(true)
    }

    // Remove the runner from this timeline
    unschedule (runner) {
      const index = this._runnerIds.indexOf(runner.id);
      if (index < 0) return this

      this._runners.splice(index, 1);
      this._runnerIds.splice(index, 1);

      runner.timeline(null);
      return this
    }

    // Makes sure, that after pausing the time doesn't jump
    updateTime () {
      if (!this.active()) {
        this._lastSourceTime = this._timeSource();
      }
      return this
    }

    // Checks if we are running and continues the animation
    _continue (immediateStep = false) {
      Animator.cancelFrame(this._nextFrame);
      this._nextFrame = null;

      if (immediateStep) return this._stepImmediate()
      if (this._paused) return this

      this._nextFrame = Animator.frame(this._step);
      return this
    }

    _stepFn (immediateStep = false) {
      // Get the time delta from the last time and update the time
      const time = this._timeSource();
      let dtSource = time - this._lastSourceTime;

      if (immediateStep) dtSource = 0;

      const dtTime = this._speed * dtSource + (this._time - this._lastStepTime);
      this._lastSourceTime = time;

      // Only update the time if we use the timeSource.
      // Otherwise use the current time
      if (!immediateStep) {
        // Update the time
        this._time += dtTime;
        this._time = this._time < 0 ? 0 : this._time;
      }
      this._lastStepTime = this._time;
      this.fire('time', this._time);

      // This is for the case that the timeline was seeked so that the time
      // is now before the startTime of the runner. Thats why we need to set
      // the runner to position 0

      // FIXME:
      // However, reseting in insertion order leads to bugs. Considering the case,
      // where 2 runners change the same attribute but in different times,
      // reseting both of them will lead to the case where the later defined
      // runner always wins the reset even if the other runner started earlier
      // and therefore should win the attribute battle
      // this can be solved by reseting them backwards
      for (let k = this._runners.length; k--;) {
        // Get and run the current runner and ignore it if its inactive
        const runnerInfo = this._runners[k];
        const runner = runnerInfo.runner;

        // Make sure that we give the actual difference
        // between runner start time and now
        const dtToStart = this._time - runnerInfo.start;

        // Dont run runner if not started yet
        // and try to reset it
        if (dtToStart <= 0) {
          runner.reset();
        }
      }

      // Run all of the runners directly
      let runnersLeft = false;
      for (let i = 0, len = this._runners.length; i < len; i++) {
        // Get and run the current runner and ignore it if its inactive
        const runnerInfo = this._runners[i];
        const runner = runnerInfo.runner;
        let dt = dtTime;

        // Make sure that we give the actual difference
        // between runner start time and now
        const dtToStart = this._time - runnerInfo.start;

        // Dont run runner if not started yet
        if (dtToStart <= 0) {
          runnersLeft = true;
          continue
        } else if (dtToStart < dt) {
          // Adjust dt to make sure that animation is on point
          dt = dtToStart;
        }

        if (!runner.active()) continue

        // If this runner is still going, signal that we need another animation
        // frame, otherwise, remove the completed runner
        const finished = runner.step(dt).done;
        if (!finished) {
          runnersLeft = true;
          // continue
        } else if (runnerInfo.persist !== true) {
          // runner is finished. And runner might get removed
          const endTime = runner.duration() - runner.time() + this._time;

          if (endTime + runnerInfo.persist < this._time) {
            // Delete runner and correct index
            runner.unschedule();
            --i;
            --len;
          }
        }
      }

      // Basically: we continue when there are runners right from us in time
      // when -->, and when runners are left from us when <--
      if ((runnersLeft && !(this._speed < 0 && this._time === 0)) || (this._runnerIds.length && this._speed < 0 && this._time > 0)) {
        this._continue();
      } else {
        this.pause();
        this.fire('finished');
      }

      return this
    }

  }

  registerMethods({
    Element: {
      timeline: function (timeline) {
        if (timeline == null) {
          this._timeline = (this._timeline || new Timeline());
          return this._timeline
        } else {
          this._timeline = timeline;
          return this
        }
      }
    }
  });

  class Runner extends EventTarget {
    constructor (options) {
      super();

      // Store a unique id on the runner, so that we can identify it later
      this.id = Runner.id++;

      // Ensure a default value
      options = options == null
        ? timeline.duration
        : options;

      // Ensure that we get a controller
      options = typeof options === 'function'
        ? new Controller(options)
        : options;

      // Declare all of the variables
      this._element = null;
      this._timeline = null;
      this.done = false;
      this._queue = [];

      // Work out the stepper and the duration
      this._duration = typeof options === 'number' && options;
      this._isDeclarative = options instanceof Controller;
      this._stepper = this._isDeclarative ? options : new Ease();

      // We copy the current values from the timeline because they can change
      this._history = {};

      // Store the state of the runner
      this.enabled = true;
      this._time = 0;
      this._lastTime = 0;

      // At creation, the runner is in reseted state
      this._reseted = true;

      // Save transforms applied to this runner
      this.transforms = new Matrix();
      this.transformId = 1;

      // Looping variables
      this._haveReversed = false;
      this._reverse = false;
      this._loopsDone = 0;
      this._swing = false;
      this._wait = 0;
      this._times = 1;

      this._frameId = null;

      // Stores how long a runner is stored after beeing done
      this._persist = this._isDeclarative ? true : null;
    }

    static sanitise (duration, delay, when) {
      // Initialise the default parameters
      let times = 1;
      let swing = false;
      let wait = 0;
      duration = duration || timeline.duration;
      delay = delay || timeline.delay;
      when = when || 'last';

      // If we have an object, unpack the values
      if (typeof duration === 'object' && !(duration instanceof Stepper)) {
        delay = duration.delay || delay;
        when = duration.when || when;
        swing = duration.swing || swing;
        times = duration.times || times;
        wait = duration.wait || wait;
        duration = duration.duration || timeline.duration;
      }

      return {
        duration: duration,
        delay: delay,
        swing: swing,
        times: times,
        wait: wait,
        when: when
      }
    }

    active (enabled) {
      if (enabled == null) return this.enabled
      this.enabled = enabled;
      return this
    }

    /*
    Private Methods
    ===============
    Methods that shouldn't be used externally
    */
    addTransform (transform, index) {
      this.transforms.lmultiplyO(transform);
      return this
    }

    after (fn) {
      return this.on('finished', fn)
    }

    animate (duration, delay, when) {
      const o = Runner.sanitise(duration, delay, when);
      const runner = new Runner(o.duration);
      if (this._timeline) runner.timeline(this._timeline);
      if (this._element) runner.element(this._element);
      return runner.loop(o).schedule(o.delay, o.when)
    }

    clearTransform () {
      this.transforms = new Matrix();
      return this
    }

    // TODO: Keep track of all transformations so that deletion is faster
    clearTransformsFromQueue () {
      if (!this.done || !this._timeline || !this._timeline._runnerIds.includes(this.id)) {
        this._queue = this._queue.filter((item) => {
          return !item.isTransform
        });
      }
    }

    delay (delay) {
      return this.animate(0, delay)
    }

    duration () {
      return this._times * (this._wait + this._duration) - this._wait
    }

    during (fn) {
      return this.queue(null, fn)
    }

    ease (fn) {
      this._stepper = new Ease(fn);
      return this
    }
    /*
    Runner Definitions
    ==================
    These methods help us define the runtime behaviour of the Runner or they
    help us make new runners from the current runner
    */

    element (element) {
      if (element == null) return this._element
      this._element = element;
      element._prepareRunner();
      return this
    }

    finish () {
      return this.step(Infinity)
    }

    loop (times, swing, wait) {
      // Deal with the user passing in an object
      if (typeof times === 'object') {
        swing = times.swing;
        wait = times.wait;
        times = times.times;
      }

      // Sanitise the values and store them
      this._times = times || Infinity;
      this._swing = swing || false;
      this._wait = wait || 0;

      // Allow true to be passed
      if (this._times === true) { this._times = Infinity; }

      return this
    }

    loops (p) {
      const loopDuration = this._duration + this._wait;
      if (p == null) {
        const loopsDone = Math.floor(this._time / loopDuration);
        const relativeTime = (this._time - loopsDone * loopDuration);
        const position = relativeTime / this._duration;
        return Math.min(loopsDone + position, this._times)
      }
      const whole = Math.floor(p);
      const partial = p % 1;
      const time = loopDuration * whole + this._duration * partial;
      return this.time(time)
    }

    persist (dtOrForever) {
      if (dtOrForever == null) return this._persist
      this._persist = dtOrForever;
      return this
    }

    position (p) {
      // Get all of the variables we need
      const x = this._time;
      const d = this._duration;
      const w = this._wait;
      const t = this._times;
      const s = this._swing;
      const r = this._reverse;
      let position;

      if (p == null) {
        /*
        This function converts a time to a position in the range [0, 1]
        The full explanation can be found in this desmos demonstration
          https://www.desmos.com/calculator/u4fbavgche
        The logic is slightly simplified here because we can use booleans
        */

        // Figure out the value without thinking about the start or end time
        const f = function (x) {
          const swinging = s * Math.floor(x % (2 * (w + d)) / (w + d));
          const backwards = (swinging && !r) || (!swinging && r);
          const uncliped = Math.pow(-1, backwards) * (x % (w + d)) / d + backwards;
          const clipped = Math.max(Math.min(uncliped, 1), 0);
          return clipped
        };

        // Figure out the value by incorporating the start time
        const endTime = t * (w + d) - w;
        position = x <= 0
          ? Math.round(f(1e-5))
          : x < endTime
            ? f(x)
            : Math.round(f(endTime - 1e-5));
        return position
      }

      // Work out the loops done and add the position to the loops done
      const loopsDone = Math.floor(this.loops());
      const swingForward = s && (loopsDone % 2 === 0);
      const forwards = (swingForward && !r) || (r && swingForward);
      position = loopsDone + (forwards ? p : 1 - p);
      return this.loops(position)
    }

    progress (p) {
      if (p == null) {
        return Math.min(1, this._time / this.duration())
      }
      return this.time(p * this.duration())
    }

    /*
    Basic Functionality
    ===================
    These methods allow us to attach basic functions to the runner directly
    */
    queue (initFn, runFn, retargetFn, isTransform) {
      this._queue.push({
        initialiser: initFn || noop,
        runner: runFn || noop,
        retarget: retargetFn,
        isTransform: isTransform,
        initialised: false,
        finished: false
      });
      const timeline = this.timeline();
      timeline && this.timeline()._continue();
      return this
    }

    reset () {
      if (this._reseted) return this
      this.time(0);
      this._reseted = true;
      return this
    }

    reverse (reverse) {
      this._reverse = reverse == null ? !this._reverse : reverse;
      return this
    }

    schedule (timeline, delay, when) {
      // The user doesn't need to pass a timeline if we already have one
      if (!(timeline instanceof Timeline)) {
        when = delay;
        delay = timeline;
        timeline = this.timeline();
      }

      // If there is no timeline, yell at the user...
      if (!timeline) {
        throw Error('Runner cannot be scheduled without timeline')
      }

      // Schedule the runner on the timeline provided
      timeline.schedule(this, delay, when);
      return this
    }

    step (dt) {
      // If we are inactive, this stepper just gets skipped
      if (!this.enabled) return this

      // Update the time and get the new position
      dt = dt == null ? 16 : dt;
      this._time += dt;
      const position = this.position();

      // Figure out if we need to run the stepper in this frame
      const running = this._lastPosition !== position && this._time >= 0;
      this._lastPosition = position;

      // Figure out if we just started
      const duration = this.duration();
      const justStarted = this._lastTime <= 0 && this._time > 0;
      const justFinished = this._lastTime < duration && this._time >= duration;

      this._lastTime = this._time;
      if (justStarted) {
        this.fire('start', this);
      }

      // Work out if the runner is finished set the done flag here so animations
      // know, that they are running in the last step (this is good for
      // transformations which can be merged)
      const declarative = this._isDeclarative;
      this.done = !declarative && !justFinished && this._time >= duration;

      // Runner is running. So its not in reseted state anymore
      this._reseted = false;

      let converged = false;
      // Call initialise and the run function
      if (running || declarative) {
        this._initialise(running);

        // clear the transforms on this runner so they dont get added again and again
        this.transforms = new Matrix();
        converged = this._run(declarative ? dt : position);

        this.fire('step', this);
      }
      // correct the done flag here
      // declaritive animations itself know when they converged
      this.done = this.done || (converged && declarative);
      if (justFinished) {
        this.fire('finished', this);
      }
      return this
    }

    /*
    Runner animation methods
    ========================
    Control how the animation plays
    */
    time (time) {
      if (time == null) {
        return this._time
      }
      const dt = time - this._time;
      this.step(dt);
      return this
    }

    timeline (timeline) {
      // check explicitly for undefined so we can set the timeline to null
      if (typeof timeline === 'undefined') return this._timeline
      this._timeline = timeline;
      return this
    }

    unschedule () {
      const timeline = this.timeline();
      timeline && timeline.unschedule(this);
      return this
    }

    // Run each initialise function in the runner if required
    _initialise (running) {
      // If we aren't running, we shouldn't initialise when not declarative
      if (!running && !this._isDeclarative) return

      // Loop through all of the initialisers
      for (let i = 0, len = this._queue.length; i < len; ++i) {
        // Get the current initialiser
        const current = this._queue[i];

        // Determine whether we need to initialise
        const needsIt = this._isDeclarative || (!current.initialised && running);
        running = !current.finished;

        // Call the initialiser if we need to
        if (needsIt && running) {
          current.initialiser.call(this);
          current.initialised = true;
        }
      }
    }

    // Save a morpher to the morpher list so that we can retarget it later
    _rememberMorpher (method, morpher) {
      this._history[method] = {
        morpher: morpher,
        caller: this._queue[this._queue.length - 1]
      };

      // We have to resume the timeline in case a controller
      // is already done without being ever run
      // This can happen when e.g. this is done:
      //    anim = el.animate(new SVG.Spring)
      // and later
      //    anim.move(...)
      if (this._isDeclarative) {
        const timeline = this.timeline();
        timeline && timeline.play();
      }
    }

    // Try to set the target for a morpher if the morpher exists, otherwise
    // Run each run function for the position or dt given
    _run (positionOrDt) {
      // Run all of the _queue directly
      let allfinished = true;
      for (let i = 0, len = this._queue.length; i < len; ++i) {
        // Get the current function to run
        const current = this._queue[i];

        // Run the function if its not finished, we keep track of the finished
        // flag for the sake of declarative _queue
        const converged = current.runner.call(this, positionOrDt);
        current.finished = current.finished || (converged === true);
        allfinished = allfinished && current.finished;
      }

      // We report when all of the constructors are finished
      return allfinished
    }

    // do nothing and return false
    _tryRetarget (method, target, extra) {
      if (this._history[method]) {
        // if the last method wasnt even initialised, throw it away
        if (!this._history[method].caller.initialised) {
          const index = this._queue.indexOf(this._history[method].caller);
          this._queue.splice(index, 1);
          return false
        }

        // for the case of transformations, we use the special retarget function
        // which has access to the outer scope
        if (this._history[method].caller.retarget) {
          this._history[method].caller.retarget.call(this, target, extra);
          // for everything else a simple morpher change is sufficient
        } else {
          this._history[method].morpher.to(target);
        }

        this._history[method].caller.finished = false;
        const timeline = this.timeline();
        timeline && timeline.play();
        return true
      }
      return false
    }

  }

  Runner.id = 0;

  class FakeRunner {
    constructor (transforms = new Matrix(), id = -1, done = true) {
      this.transforms = transforms;
      this.id = id;
      this.done = done;
    }

    clearTransformsFromQueue () { }
  }

  extend([ Runner, FakeRunner ], {
    mergeWith (runner) {
      return new FakeRunner(
        runner.transforms.lmultiply(this.transforms),
        runner.id
      )
    }
  });

  // FakeRunner.emptyRunner = new FakeRunner()

  const lmultiply = (last, curr) => last.lmultiplyO(curr);
  const getRunnerTransform = (runner) => runner.transforms;

  function mergeTransforms () {
    // Find the matrix to apply to the element and apply it
    const runners = this._transformationRunners.runners;
    const netTransform = runners
      .map(getRunnerTransform)
      .reduce(lmultiply, new Matrix());

    this.transform(netTransform);

    this._transformationRunners.merge();

    if (this._transformationRunners.length() === 1) {
      this._frameId = null;
    }
  }

  class RunnerArray {
    constructor () {
      this.runners = [];
      this.ids = [];
    }

    add (runner) {
      if (this.runners.includes(runner)) return
      const id = runner.id + 1;

      this.runners.push(runner);
      this.ids.push(id);

      return this
    }

    clearBefore (id) {
      const deleteCnt = this.ids.indexOf(id + 1) || 1;
      this.ids.splice(0, deleteCnt, 0);
      this.runners.splice(0, deleteCnt, new FakeRunner())
        .forEach((r) => r.clearTransformsFromQueue());
      return this
    }

    edit (id, newRunner) {
      const index = this.ids.indexOf(id + 1);
      this.ids.splice(index, 1, id + 1);
      this.runners.splice(index, 1, newRunner);
      return this
    }

    getByID (id) {
      return this.runners[this.ids.indexOf(id + 1)]
    }

    length () {
      return this.ids.length
    }

    merge () {
      let lastRunner = null;
      for (let i = 0; i < this.runners.length; ++i) {
        const runner = this.runners[i];

        const condition = lastRunner
          && runner.done && lastRunner.done
          // don't merge runner when persisted on timeline
          && (!runner._timeline || !runner._timeline._runnerIds.includes(runner.id))
          && (!lastRunner._timeline || !lastRunner._timeline._runnerIds.includes(lastRunner.id));

        if (condition) {
          // the +1 happens in the function
          this.remove(runner.id);
          const newRunner = runner.mergeWith(lastRunner);
          this.edit(lastRunner.id, newRunner);
          lastRunner = newRunner;
          --i;
        } else {
          lastRunner = runner;
        }
      }

      return this
    }

    remove (id) {
      const index = this.ids.indexOf(id + 1);
      this.ids.splice(index, 1);
      this.runners.splice(index, 1);
      return this
    }

  }

  registerMethods({
    Element: {
      animate (duration, delay, when) {
        const o = Runner.sanitise(duration, delay, when);
        const timeline = this.timeline();
        return new Runner(o.duration)
          .loop(o)
          .element(this)
          .timeline(timeline.play())
          .schedule(o.delay, o.when)
      },

      delay (by, when) {
        return this.animate(0, by, when)
      },

      // this function searches for all runners on the element and deletes the ones
      // which run before the current one. This is because absolute transformations
      // overwfrite anything anyway so there is no need to waste time computing
      // other runners
      _clearTransformRunnersBefore (currentRunner) {
        this._transformationRunners.clearBefore(currentRunner.id);
      },

      _currentTransform (current) {
        return this._transformationRunners.runners
          // we need the equal sign here to make sure, that also transformations
          // on the same runner which execute before the current transformation are
          // taken into account
          .filter((runner) => runner.id <= current.id)
          .map(getRunnerTransform)
          .reduce(lmultiply, new Matrix())
      },

      _addRunner (runner) {
        this._transformationRunners.add(runner);

        // Make sure that the runner merge is executed at the very end of
        // all Animator functions. Thats why we use immediate here to execute
        // the merge right after all frames are run
        Animator.cancelImmediate(this._frameId);
        this._frameId = Animator.immediate(mergeTransforms.bind(this));
      },

      _prepareRunner () {
        if (this._frameId == null) {
          this._transformationRunners = new RunnerArray()
            .add(new FakeRunner(new Matrix(this)));
        }
      }
    }
  });

  // Will output the elements from array A that are not in the array B
  const difference = (a, b) => a.filter(x => !b.includes(x));

  extend(Runner, {
    attr (a, v) {
      return this.styleAttr('attr', a, v)
    },

    // Add animatable styles
    css (s, v) {
      return this.styleAttr('css', s, v)
    },

    styleAttr (type, nameOrAttrs, val) {
      if (typeof nameOrAttrs === 'string') {
        return this.styleAttr(type, { [nameOrAttrs]: val })
      }

      let attrs = nameOrAttrs;
      if (this._tryRetarget(type, attrs)) return this

      let morpher = new Morphable(this._stepper).to(attrs);
      let keys = Object.keys(attrs);

      this.queue(function () {
        morpher = morpher.from(this.element()[type](keys));
      }, function (pos) {
        this.element()[type](morpher.at(pos).valueOf());
        return morpher.done()
      }, function (newToAttrs) {

        // Check if any new keys were added
        const newKeys = Object.keys(newToAttrs);
        const differences = difference(newKeys, keys);

        // If their are new keys, initialize them and add them to morpher
        if (differences.length) {
          // Get the values
          const addedFromAttrs = this.element()[type](differences);

          // Get the already initialized values
          const oldFromAttrs = new ObjectBag(morpher.from()).valueOf();

          // Merge old and new
          Object.assign(oldFromAttrs, addedFromAttrs);
          morpher.from(oldFromAttrs);
        }

        // Get the object from the morpher
        const oldToAttrs = new ObjectBag(morpher.to()).valueOf();

        // Merge in new attributes
        Object.assign(oldToAttrs, newToAttrs);

        // Change morpher target
        morpher.to(oldToAttrs);

        // Make sure that we save the work we did so we don't need it to do again
        keys = newKeys;
        attrs = newToAttrs;
      });

      this._rememberMorpher(type, morpher);
      return this
    },

    zoom (level, point) {
      if (this._tryRetarget('zoom', level, point)) return this

      let morpher = new Morphable(this._stepper).to(new SVGNumber(level));

      this.queue(function () {
        morpher = morpher.from(this.element().zoom());
      }, function (pos) {
        this.element().zoom(morpher.at(pos), point);
        return morpher.done()
      }, function (newLevel, newPoint) {
        point = newPoint;
        morpher.to(newLevel);
      });

      this._rememberMorpher('zoom', morpher);
      return this
    },

    /**
     ** absolute transformations
     **/

    //
    // M v -----|-----(D M v = F v)------|----->  T v
    //
    // 1. define the final state (T) and decompose it (once)
    //    t = [tx, ty, the, lam, sy, sx]
    // 2. on every frame: pull the current state of all previous transforms
    //    (M - m can change)
    //   and then write this as m = [tx0, ty0, the0, lam0, sy0, sx0]
    // 3. Find the interpolated matrix F(pos) = m + pos * (t - m)
    //   - Note F(0) = M
    //   - Note F(1) = T
    // 4. Now you get the delta matrix as a result: D = F * inv(M)

    transform (transforms, relative, affine) {
      // If we have a declarative function, we should retarget it if possible
      relative = transforms.relative || relative;
      if (this._isDeclarative && !relative && this._tryRetarget('transform', transforms)) {
        return this
      }

      // Parse the parameters
      const isMatrix = Matrix.isMatrixLike(transforms);
      affine = transforms.affine != null
        ? transforms.affine
        : (affine != null ? affine : !isMatrix);

      // Create a morepher and set its type
      const morpher = new Morphable(this._stepper)
        .type(affine ? TransformBag : Matrix);

      let origin;
      let element;
      let current;
      let currentAngle;
      let startTransform;

      function setup () {
        // make sure element and origin is defined
        element = element || this.element();
        origin = origin || getOrigin(transforms, element);

        startTransform = new Matrix(relative ? undefined : element);

        // add the runner to the element so it can merge transformations
        element._addRunner(this);

        // Deactivate all transforms that have run so far if we are absolute
        if (!relative) {
          element._clearTransformRunnersBefore(this);
        }
      }

      function run (pos) {
        // clear all other transforms before this in case something is saved
        // on this runner. We are absolute. We dont need these!
        if (!relative) this.clearTransform();

        const { x, y } = new Point(origin).transform(element._currentTransform(this));

        let target = new Matrix({ ...transforms, origin: [ x, y ] });
        let start = this._isDeclarative && current
          ? current
          : startTransform;

        if (affine) {
          target = target.decompose(x, y);
          start = start.decompose(x, y);

          // Get the current and target angle as it was set
          const rTarget = target.rotate;
          const rCurrent = start.rotate;

          // Figure out the shortest path to rotate directly
          const possibilities = [ rTarget - 360, rTarget, rTarget + 360 ];
          const distances = possibilities.map(a => Math.abs(a - rCurrent));
          const shortest = Math.min(...distances);
          const index = distances.indexOf(shortest);
          target.rotate = possibilities[index];
        }

        if (relative) {
          // we have to be careful here not to overwrite the rotation
          // with the rotate method of Matrix
          if (!isMatrix) {
            target.rotate = transforms.rotate || 0;
          }
          if (this._isDeclarative && currentAngle) {
            start.rotate = currentAngle;
          }
        }

        morpher.from(start);
        morpher.to(target);

        const affineParameters = morpher.at(pos);
        currentAngle = affineParameters.rotate;
        current = new Matrix(affineParameters);

        this.addTransform(current);
        element._addRunner(this);
        return morpher.done()
      }

      function retarget (newTransforms) {
        // only get a new origin if it changed since the last call
        if (
          (newTransforms.origin || 'center').toString()
          !== (transforms.origin || 'center').toString()
        ) {
          origin = getOrigin(newTransforms, element);
        }

        // overwrite the old transformations with the new ones
        transforms = { ...newTransforms, origin };
      }

      this.queue(setup, run, retarget, true);
      this._isDeclarative && this._rememberMorpher('transform', morpher);
      return this
    },

    // Animatable x-axis
    x (x, relative) {
      return this._queueNumber('x', x)
    },

    // Animatable y-axis
    y (y) {
      return this._queueNumber('y', y)
    },

    dx (x = 0) {
      return this._queueNumberDelta('x', x)
    },

    dy (y = 0) {
      return this._queueNumberDelta('y', y)
    },

    dmove (x, y) {
      return this.dx(x).dy(y)
    },

    _queueNumberDelta (method, to) {
      to = new SVGNumber(to);

      // Try to change the target if we have this method already registerd
      if (this._tryRetarget(method, to)) return this

      // Make a morpher and queue the animation
      const morpher = new Morphable(this._stepper).to(to);
      let from = null;
      this.queue(function () {
        from = this.element()[method]();
        morpher.from(from);
        morpher.to(from + to);
      }, function (pos) {
        this.element()[method](morpher.at(pos));
        return morpher.done()
      }, function (newTo) {
        morpher.to(from + new SVGNumber(newTo));
      });

      // Register the morpher so that if it is changed again, we can retarget it
      this._rememberMorpher(method, morpher);
      return this
    },

    _queueObject (method, to) {
      // Try to change the target if we have this method already registerd
      if (this._tryRetarget(method, to)) return this

      // Make a morpher and queue the animation
      const morpher = new Morphable(this._stepper).to(to);
      this.queue(function () {
        morpher.from(this.element()[method]());
      }, function (pos) {
        this.element()[method](morpher.at(pos));
        return morpher.done()
      });

      // Register the morpher so that if it is changed again, we can retarget it
      this._rememberMorpher(method, morpher);
      return this
    },

    _queueNumber (method, value) {
      return this._queueObject(method, new SVGNumber(value))
    },

    // Animatable center x-axis
    cx (x) {
      return this._queueNumber('cx', x)
    },

    // Animatable center y-axis
    cy (y) {
      return this._queueNumber('cy', y)
    },

    // Add animatable move
    move (x, y) {
      return this.x(x).y(y)
    },

    // Add animatable center
    center (x, y) {
      return this.cx(x).cy(y)
    },

    // Add animatable size
    size (width, height) {
      // animate bbox based size for all other elements
      let box;

      if (!width || !height) {
        box = this._element.bbox();
      }

      if (!width) {
        width = box.width / box.height * height;
      }

      if (!height) {
        height = box.height / box.width * width;
      }

      return this
        .width(width)
        .height(height)
    },

    // Add animatable width
    width (width) {
      return this._queueNumber('width', width)
    },

    // Add animatable height
    height (height) {
      return this._queueNumber('height', height)
    },

    // Add animatable plot
    plot (a, b, c, d) {
      // Lines can be plotted with 4 arguments
      if (arguments.length === 4) {
        return this.plot([ a, b, c, d ])
      }

      if (this._tryRetarget('plot', a)) return this

      const morpher = new Morphable(this._stepper)
        .type(this._element.MorphArray).to(a);

      this.queue(function () {
        morpher.from(this._element.array());
      }, function (pos) {
        this._element.plot(morpher.at(pos));
        return morpher.done()
      });

      this._rememberMorpher('plot', morpher);
      return this
    },

    // Add leading method
    leading (value) {
      return this._queueNumber('leading', value)
    },

    // Add animatable viewbox
    viewbox (x, y, width, height) {
      return this._queueObject('viewbox', new Box(x, y, width, height))
    },

    update (o) {
      if (typeof o !== 'object') {
        return this.update({
          offset: arguments[0],
          color: arguments[1],
          opacity: arguments[2]
        })
      }

      if (o.opacity != null) this.attr('stop-opacity', o.opacity);
      if (o.color != null) this.attr('stop-color', o.color);
      if (o.offset != null) this.attr('offset', o.offset);

      return this
    }
  });

  extend(Runner, { rx, ry, from, to });
  register(Runner, 'Runner');

  class Svg extends Container {
    constructor (node, attrs = node) {
      super(nodeOrNew('svg', node), attrs);
      this.namespace();
    }

    // Creates and returns defs element
    defs () {
      if (!this.isRoot()) return this.root().defs()

      return adopt(this.node.querySelector('defs'))
        || this.put(new Defs())
    }

    isRoot () {
      return !this.node.parentNode
        || (!(this.node.parentNode instanceof globals.window.SVGElement) && this.node.parentNode.nodeName !== '#document-fragment')
    }

    // Add namespaces
    namespace () {
      if (!this.isRoot()) return this.root().namespace()
      return this
        .attr({ xmlns: svg, version: '1.1' })
        .attr('xmlns:xlink', xlink, xmlns)
        .attr('xmlns:svgjs', svgjs, xmlns)
    }

    removeNamespace () {
      return this.attr({ xmlns: null, version: null })
        .attr('xmlns:xlink', null, xmlns)
        .attr('xmlns:svgjs', null, xmlns)
    }

    // Check if this is a root svg
    // If not, call root() from this element
    root () {
      if (this.isRoot()) return this
      return super.root()
    }

  }

  registerMethods({
    Container: {
      // Create nested svg document
      nested: wrapWithAttrCheck(function () {
        return this.put(new Svg())
      })
    }
  });

  register(Svg, 'Svg', true);

  class Symbol extends Container {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('symbol', node), attrs);
    }
  }

  registerMethods({
    Container: {
      symbol: wrapWithAttrCheck(function () {
        return this.put(new Symbol())
      })
    }
  });

  register(Symbol, 'Symbol');

  // Create plain text node
  function plain (text) {
    // clear if build mode is disabled
    if (this._build === false) {
      this.clear();
    }

    // create text node
    this.node.appendChild(globals.document.createTextNode(text));

    return this
  }

  // Get length of text element
  function length () {
    return this.node.getComputedTextLength()
  }

  // Move over x-axis
  // Text is moved by its bounding box
  // text-anchor does NOT matter
  function x$1 (x, box = this.bbox()) {
    if (x == null) {
      return box.x
    }

    return this.attr('x', this.attr('x') + x - box.x)
  }

  // Move over y-axis
  function y$1 (y, box = this.bbox()) {
    if (y == null) {
      return box.y
    }

    return this.attr('y', this.attr('y') + y - box.y)
  }

  function move$1 (x, y, box = this.bbox()) {
    return this.x(x, box).y(y, box)
  }

  // Move center over x-axis
  function cx (x, box = this.bbox()) {
    if (x == null) {
      return box.cx
    }

    return this.attr('x', this.attr('x') + x - box.cx)
  }

  // Move center over y-axis
  function cy (y, box = this.bbox()) {
    if (y == null) {
      return box.cy
    }

    return this.attr('y', this.attr('y') + y - box.cy)
  }

  function center (x, y, box = this.bbox()) {
    return this.cx(x, box).cy(y, box)
  }

  function ax (x) {
    return this.attr('x', x)
  }

  function ay (y) {
    return this.attr('y', y)
  }

  function amove (x, y) {
    return this.ax(x).ay(y)
  }

  // Enable / disable build mode
  function build (build) {
    this._build = !!build;
    return this
  }

  var textable = /*#__PURE__*/Object.freeze({
    __proto__: null,
    plain: plain,
    length: length,
    x: x$1,
    y: y$1,
    move: move$1,
    cx: cx,
    cy: cy,
    center: center,
    ax: ax,
    ay: ay,
    amove: amove,
    build: build
  });

  class Text extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('text', node), attrs);

      this.dom.leading = new SVGNumber(1.3); // store leading value for rebuilding
      this._rebuild = true; // enable automatic updating of dy values
      this._build = false; // disable build mode for adding multiple lines
    }

    // Set / get leading
    leading (value) {
      // act as getter
      if (value == null) {
        return this.dom.leading
      }

      // act as setter
      this.dom.leading = new SVGNumber(value);

      return this.rebuild()
    }

    // Rebuild appearance type
    rebuild (rebuild) {
      // store new rebuild flag if given
      if (typeof rebuild === 'boolean') {
        this._rebuild = rebuild;
      }

      // define position of all lines
      if (this._rebuild) {
        const self = this;
        let blankLineOffset = 0;
        const leading = this.dom.leading;

        this.each(function (i) {
          const fontSize = globals.window.getComputedStyle(this.node)
            .getPropertyValue('font-size');

          const dy = leading * new SVGNumber(fontSize);

          if (this.dom.newLined) {
            this.attr('x', self.attr('x'));

            if (this.text() === '\n') {
              blankLineOffset += dy;
            } else {
              this.attr('dy', i ? dy + blankLineOffset : 0);
              blankLineOffset = 0;
            }
          }
        });

        this.fire('rebuild');
      }

      return this
    }

    // overwrite method from parent to set data properly
    setData (o) {
      this.dom = o;
      this.dom.leading = new SVGNumber(o.leading || 1.3);
      return this
    }

    // Set the text content
    text (text) {
      // act as getter
      if (text === undefined) {
        const children = this.node.childNodes;
        let firstLine = 0;
        text = '';

        for (let i = 0, len = children.length; i < len; ++i) {
          // skip textPaths - they are no lines
          if (children[i].nodeName === 'textPath') {
            if (i === 0) firstLine = 1;
            continue
          }

          // add newline if its not the first child and newLined is set to true
          if (i !== firstLine && children[i].nodeType !== 3 && adopt(children[i]).dom.newLined === true) {
            text += '\n';
          }

          // add content of this node
          text += children[i].textContent;
        }

        return text
      }

      // remove existing content
      this.clear().build(true);

      if (typeof text === 'function') {
        // call block
        text.call(this, this);
      } else {
        // store text and make sure text is not blank
        text = (text + '').split('\n');

        // build new lines
        for (let j = 0, jl = text.length; j < jl; j++) {
          this.newLine(text[j]);
        }
      }

      // disable build mode and rebuild lines
      return this.build(false).rebuild()
    }

  }

  extend(Text, textable);

  registerMethods({
    Container: {
      // Create text element
      text: wrapWithAttrCheck(function (text = '') {
        return this.put(new Text()).text(text)
      }),

      // Create plain text element
      plain: wrapWithAttrCheck(function (text = '') {
        return this.put(new Text()).plain(text)
      })
    }
  });

  register(Text, 'Text');

  class Tspan extends Shape {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('tspan', node), attrs);
      this._build = false; // disable build mode for adding multiple lines
    }

    // Shortcut dx
    dx (dx) {
      return this.attr('dx', dx)
    }

    // Shortcut dy
    dy (dy) {
      return this.attr('dy', dy)
    }

    // Create new line
    newLine () {
      // mark new line
      this.dom.newLined = true;

      // fetch parent
      const text = this.parent();

      // early return in case we are not in a text element
      if (!(text instanceof Text)) {
        return this
      }

      const i = text.index(this);

      const fontSize = globals.window.getComputedStyle(this.node)
        .getPropertyValue('font-size');
      const dy = text.dom.leading * new SVGNumber(fontSize);

      // apply new position
      return this.dy(i ? dy : 0).attr('x', text.x())
    }

    // Set text content
    text (text) {
      if (text == null) return this.node.textContent + (this.dom.newLined ? '\n' : '')

      if (typeof text === 'function') {
        this.clear().build(true);
        text.call(this, this);
        this.build(false);
      } else {
        this.plain(text);
      }

      return this
    }

  }

  extend(Tspan, textable);

  registerMethods({
    Tspan: {
      tspan: wrapWithAttrCheck(function (text = '') {
        const tspan = new Tspan();

        // clear if build mode is disabled
        if (!this._build) {
          this.clear();
        }

        // add new tspan
        return this.put(tspan).text(text)
      })
    },
    Text: {
      newLine: function (text = '') {
        return this.tspan(text).newLine()
      }
    }
  });

  register(Tspan, 'Tspan');

  class Circle extends Shape {
    constructor (node, attrs = node) {
      super(nodeOrNew('circle', node), attrs);
    }

    radius (r) {
      return this.attr('r', r)
    }

    // Radius x value
    rx (rx) {
      return this.attr('r', rx)
    }

    // Alias radius x value
    ry (ry) {
      return this.rx(ry)
    }

    size (size) {
      return this.radius(new SVGNumber(size).divide(2))
    }
  }

  extend(Circle, { x: x$3, y: y$3, cx: cx$1, cy: cy$1, width: width$2, height: height$2 });

  registerMethods({
    Container: {
      // Create circle element
      circle: wrapWithAttrCheck(function (size = 0) {
        return this.put(new Circle())
          .size(size)
          .move(0, 0)
      })
    }
  });

  register(Circle, 'Circle');

  class ClipPath extends Container {
    constructor (node, attrs = node) {
      super(nodeOrNew('clipPath', node), attrs);
    }

    // Unclip all clipped elements and remove itself
    remove () {
      // unclip all targets
      this.targets().forEach(function (el) {
        el.unclip();
      });

      // remove clipPath from parent
      return super.remove()
    }

    targets () {
      return baseFind('svg [clip-path*="' + this.id() + '"]')
    }
  }

  registerMethods({
    Container: {
      // Create clipping element
      clip: wrapWithAttrCheck(function () {
        return this.defs().put(new ClipPath())
      })
    },
    Element: {
      // Distribute clipPath to svg element
      clipper () {
        return this.reference('clip-path')
      },

      clipWith (element) {
        // use given clip or create a new one
        const clipper = element instanceof ClipPath
          ? element
          : this.parent().clip().add(element);

        // apply mask
        return this.attr('clip-path', 'url("#' + clipper.id() + '")')
      },

      // Unclip element
      unclip () {
        return this.attr('clip-path', null)
      }
    }
  });

  register(ClipPath, 'ClipPath');

  class ForeignObject extends Element$1 {
    constructor (node, attrs = node) {
      super(nodeOrNew('foreignObject', node), attrs);
    }
  }

  registerMethods({
    Container: {
      foreignObject: wrapWithAttrCheck(function (width, height) {
        return this.put(new ForeignObject()).size(width, height)
      })
    }
  });

  register(ForeignObject, 'ForeignObject');

  function dmove (dx, dy) {
    this.children().forEach((child, i) => {

      let bbox;

      // We have to wrap this for elements that dont have a bbox
      // e.g. title and other descriptive elements
      try {
        // Get the childs bbox
        bbox = child.bbox();
      } catch (e) {
        return
      }

      // Get childs matrix
      const m = new Matrix(child);
      // Translate childs matrix by amount and
      // transform it back into parents space
      const matrix = m.translate(dx, dy).transform(m.inverse());
      // Calculate new x and y from old box
      const p = new Point(bbox.x, bbox.y).transform(matrix);
      // Move element
      child.move(p.x, p.y);
    });

    return this
  }

  function dx (dx) {
    return this.dmove(dx, 0)
  }

  function dy (dy) {
    return this.dmove(0, dy)
  }

  function height (height, box = this.bbox()) {
    if (height == null) return box.height
    return this.size(box.width, height, box)
  }

  function move (x = 0, y = 0, box = this.bbox()) {
    const dx = x - box.x;
    const dy = y - box.y;

    return this.dmove(dx, dy)
  }

  function size (width, height, box = this.bbox()) {
    const p = proportionalSize(this, width, height, box);
    const scaleX = p.width / box.width;
    const scaleY = p.height / box.height;

    this.children().forEach((child, i) => {
      const o = new Point(box).transform(new Matrix(child).inverse());
      child.scale(scaleX, scaleY, o.x, o.y);
    });

    return this
  }

  function width (width, box = this.bbox()) {
    if (width == null) return box.width
    return this.size(width, box.height, box)
  }

  function x (x, box = this.bbox()) {
    if (x == null) return box.x
    return this.move(x, box.y, box)
  }

  function y (y, box = this.bbox()) {
    if (y == null) return box.y
    return this.move(box.x, y, box)
  }

  var containerGeometry = /*#__PURE__*/Object.freeze({
    __proto__: null,
    dmove: dmove,
    dx: dx,
    dy: dy,
    height: height,
    move: move,
    size: size,
    width: width,
    x: x,
    y: y
  });

  class G extends Container {
    constructor (node, attrs = node) {
      super(nodeOrNew('g', node), attrs);
    }
  }

  extend(G, containerGeometry);

  registerMethods({
    Container: {
      // Create a group element
      group: wrapWithAttrCheck(function () {
        return this.put(new G())
      })
    }
  });

  register(G, 'G');

  class A extends Container {
    constructor (node, attrs = node) {
      super(nodeOrNew('a', node), attrs);
    }

    // Link target attribute
    target (target) {
      return this.attr('target', target)
    }

    // Link url
    to (url) {
      return this.attr('href', url, xlink)
    }

  }

  extend(A, containerGeometry);

  registerMethods({
    Container: {
      // Create a hyperlink element
      link: wrapWithAttrCheck(function (url) {
        return this.put(new A()).to(url)
      })
    },
    Element: {
      unlink () {
        const link = this.linker();

        if (!link) return this

        const parent = link.parent();

        if (!parent) {
          return this.remove()
        }

        const index = parent.index(link);
        parent.add(this, index);

        link.remove();
        return this
      },
      linkTo (url) {
        // reuse old link if possible
        let link = this.linker();

        if (!link) {
          link = new A();
          this.wrap(link);
        }

        if (typeof url === 'function') {
          url.call(link, link);
        } else {
          link.to(url);
        }

        return this
      },
      linker () {
        const link = this.parent();
        if (link && link.node.nodeName.toLowerCase() === 'a') {
          return link
        }

        return null
      }
    }
  });

  register(A, 'A');

  class Mask extends Container {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('mask', node), attrs);
    }

    // Unmask all masked elements and remove itself
    remove () {
      // unmask all targets
      this.targets().forEach(function (el) {
        el.unmask();
      });

      // remove mask from parent
      return super.remove()
    }

    targets () {
      return baseFind('svg [mask*="' + this.id() + '"]')
    }
  }

  registerMethods({
    Container: {
      mask: wrapWithAttrCheck(function () {
        return this.defs().put(new Mask())
      })
    },
    Element: {
      // Distribute mask to svg element
      masker () {
        return this.reference('mask')
      },

      maskWith (element) {
        // use given mask or create a new one
        const masker = element instanceof Mask
          ? element
          : this.parent().mask().add(element);

        // apply mask
        return this.attr('mask', 'url("#' + masker.id() + '")')
      },

      // Unmask element
      unmask () {
        return this.attr('mask', null)
      }
    }
  });

  register(Mask, 'Mask');

  class Stop extends Element$1 {
    constructor (node, attrs = node) {
      super(nodeOrNew('stop', node), attrs);
    }

    // add color stops
    update (o) {
      if (typeof o === 'number' || o instanceof SVGNumber) {
        o = {
          offset: arguments[0],
          color: arguments[1],
          opacity: arguments[2]
        };
      }

      // set attributes
      if (o.opacity != null) this.attr('stop-opacity', o.opacity);
      if (o.color != null) this.attr('stop-color', o.color);
      if (o.offset != null) this.attr('offset', new SVGNumber(o.offset));

      return this
    }
  }

  registerMethods({
    Gradient: {
      // Add a color stop
      stop: function (offset, color, opacity) {
        return this.put(new Stop()).update(offset, color, opacity)
      }
    }
  });

  register(Stop, 'Stop');

  function cssRule (selector, rule) {
    if (!selector) return ''
    if (!rule) return selector

    let ret = selector + '{';

    for (const i in rule) {
      ret += unCamelCase(i) + ':' + rule[i] + ';';
    }

    ret += '}';

    return ret
  }

  class Style extends Element$1 {
    constructor (node, attrs = node) {
      super(nodeOrNew('style', node), attrs);
    }

    addText (w = '') {
      this.node.textContent += w;
      return this
    }

    font (name, src, params = {}) {
      return this.rule('@font-face', {
        fontFamily: name,
        src: src,
        ...params
      })
    }

    rule (selector, obj) {
      return this.addText(cssRule(selector, obj))
    }
  }

  registerMethods('Dom', {
    style (selector, obj) {
      return this.put(new Style()).rule(selector, obj)
    },
    fontface  (name, src, params) {
      return this.put(new Style()).font(name, src, params)
    }
  });

  register(Style, 'Style');

  class TextPath extends Text {
    // Initialize node
    constructor (node, attrs = node) {
      super(nodeOrNew('textPath', node), attrs);
    }

    // return the array of the path track element
    array () {
      const track = this.track();

      return track ? track.array() : null
    }

    // Plot path if any
    plot (d) {
      const track = this.track();
      let pathArray = null;

      if (track) {
        pathArray = track.plot(d);
      }

      return (d == null) ? pathArray : this
    }

    // Get the path element
    track () {
      return this.reference('href')
    }
  }

  registerMethods({
    Container: {
      textPath: wrapWithAttrCheck(function (text, path) {
        // Convert text to instance if needed
        if (!(text instanceof Text)) {
          text = this.text(text);
        }

        return text.path(path)
      })
    },
    Text: {
      // Create path for text to run on
      path: wrapWithAttrCheck(function (track, importNodes = true) {
        const textPath = new TextPath();

        // if track is a path, reuse it
        if (!(track instanceof Path)) {
          // create path element
          track = this.defs().path(track);
        }

        // link textPath to path and add content
        textPath.attr('href', '#' + track, xlink);

        // Transplant all nodes from text to textPath
        let node;
        if (importNodes) {
          while ((node = this.node.firstChild)) {
            textPath.node.appendChild(node);
          }
        }

        // add textPath element as child node and return textPath
        return this.put(textPath)
      }),

      // Get the textPath children
      textPath () {
        return this.findOne('textPath')
      }
    },
    Path: {
      // creates a textPath from this path
      text: wrapWithAttrCheck(function (text) {
        // Convert text to instance if needed
        if (!(text instanceof Text)) {
          text = new Text().addTo(this.parent()).text(text);
        }

        // Create textPath from text and path and return
        return text.path(this)
      }),

      targets () {
        return baseFind('svg textPath').filter((node) => {
          return (node.attr('href') || '').includes(this.id())
        })

        // Does not work in IE11. Use when IE support is dropped
        // return baseFind('svg textPath[*|href*="' + this.id() + '"]')
      }
    }
  });

  TextPath.prototype.MorphArray = PathArray;
  register(TextPath, 'TextPath');

  class Use extends Shape {
    constructor (node, attrs = node) {
      super(nodeOrNew('use', node), attrs);
    }

    // Use element as a reference
    use (element, file) {
      // Set lined element
      return this.attr('href', (file || '') + '#' + element, xlink)
    }
  }

  registerMethods({
    Container: {
      // Create a use element
      use: wrapWithAttrCheck(function (element, file) {
        return this.put(new Use()).use(element, file)
      })
    }
  });

  register(Use, 'Use');

  /* Optional Modules */
  const SVG = makeInstance;

  extend([
    Svg,
    Symbol,
    Image,
    Pattern,
    Marker
  ], getMethodsFor('viewbox'));

  extend([
    Line,
    Polyline,
    Polygon,
    Path
  ], getMethodsFor('marker'));

  extend(Text, getMethodsFor('Text'));
  extend(Path, getMethodsFor('Path'));

  extend(Defs, getMethodsFor('Defs'));

  extend([
    Text,
    Tspan
  ], getMethodsFor('Tspan'));

  extend([
    Rect,
    Ellipse,
    Gradient,
    Runner
  ], getMethodsFor('radius'));

  extend(EventTarget, getMethodsFor('EventTarget'));
  extend(Dom, getMethodsFor('Dom'));
  extend(Element$1, getMethodsFor('Element'));
  extend(Shape, getMethodsFor('Shape'));
  extend([ Container, Fragment ], getMethodsFor('Container'));
  extend(Gradient, getMethodsFor('Gradient'));

  extend(Runner, getMethodsFor('Runner'));

  List.extend(getMethodNames());

  registerMorphableType([
    SVGNumber,
    Color,
    Box,
    Matrix,
    SVGArray,
    PointArray,
    PathArray
  ]);

  makeMorphable();

  if (!Element.prototype.matches) {
      Element.prototype.matches = Element.prototype['msMatchesSelector'];
  }
  class ContextMenu {
      constructor(element, items, options) {
          this.element = element instanceof Array ? element : [element];
          this.items = items;
          this.options = options ? options : {};
          this.id = new Date().getTime();
          this.target = null;
          document.addEventListener('contextmenu', (e) => {
              if (this.element.indexOf(e.target) >= 0) {
                  e.preventDefault();
                  if (this.options.onShow) {
                      this.options.onShow(e, this);
                  }
                  this.show(e);
              }
          });
          this.element.map((elm) => elm.addEventListener('click', (e) => {
              if (e.which == 3)
                  e.stopPropagation();
          }));
          document.addEventListener('click', (e) => {
              this.hide();
          });
          this.create();
      }
      create() {
          this.menu = document.createElement('ul');
          this.menu.className = 'context-menu';
          this.menu.setAttribute('data-contextmenu', this.id);
          this.menu.setAttribute('tabindex', -1);
          this.menu.addEventListener('keyup', (e) => {
              switch (e.which) {
                  case 38:
                      this.moveFocus(-1);
                      break;
                  case 40:
                      this.moveFocus(1);
                      break;
                  case 27:
                      this.hide();
                      break;
              }
          });
          if (this.options) {
              if (!this.options.minimalStyling) {
                  this.menu.classList.add('context-menu--theme-default');
              }
              if (this.options.className) {
                  this.options.className.split(' ').forEach((cls) => this.menu.classList.add(cls));
              }
          }
          this.items.forEach((item, index) => {
              const li = document.createElement('li');
              if (!('name' in item)) {
                  li.className = 'context-menu-divider';
              }
              else {
                  li.className = 'context-menu-item';
                  li.textContent = item.name;
                  li.setAttribute('data-contextmenuitem', index);
                  li.setAttribute('tabindex', '0');
                  li.addEventListener('click', this.select.bind(this, li));
                  li.addEventListener('keyup', (e) => {
                      if (e.which === 13) {
                          this.select(li);
                      }
                  });
              }
              this.menu.appendChild(li);
          });
          document.body.appendChild(this.menu);
      }
      show(e) {
          if (window['disableContextMenu']) {
              return;
          }
          this.position = { x: e.pageX, y: e.pageY };
          this.menu.style.left = `${e.pageX}px`;
          this.menu.style.top = `${e.pageY}px`;
          this.menu.classList.add('is-open');
          this.target = e.target;
          this.menu.focus();
          e.preventDefault();
      }
      hide() {
          this.menu.classList.remove('is-open');
          this.target = null;
      }
      select(item) {
          const itemId = item.getAttribute('data-contextmenuitem');
          if (this.items[itemId] && this.items[itemId].callback) {
              this.items[itemId].callback(this.target, this);
          }
          this.hide();
      }
      moveFocus(direction = 1) {
          const focused = this.menu.querySelector('[data-contextmenuitem]:focus');
          let next;
          if (focused) {
              next = this.getSibling(focused, '[data-contextmenuitem]', direction);
          }
          if (!next) {
              next = direction > 0 ? this.menu.querySelector('[data-contextmenuitem]:first-child') : this.menu.querySelector('[data-contextmenuitem]:last-child');
          }
          if (next)
              next.focus();
      }
      getSibling(el, selector, direction = 1) {
          const sibling = direction > 0 ? el.nextElementSibling : el.previousElementSibling;
          if (!sibling || sibling.matches(selector)) {
              return sibling;
          }
          return this.getSibling(sibling, selector, direction);
      }
  }

  class Toolbar {
      constructor() {
          this.container = document.querySelector('.form-toolbar');
      }
      update(items) {
          if (!this.container) {
              return;
          }
          this.list = document.createElement('ul');
          items.map((item) => {
              let li = document.createElement('li');
              li['toolbarData'] = item;
              li.innerHTML = item.name;
              this.list.appendChild(li);
              li.addEventListener('click', (e) => {
                  item.callback(li['toolbarData'], e);
              });
          });
          this.container.innerHTML = '';
          this.container.appendChild(this.list);
          this.show();
      }
      show() {
          if (!this.container) {
              return;
          }
          this.container.classList.add('active');
      }
      hide() {
          if (!this.container) {
              return;
          }
          this.container.classList.remove('active');
      }
  }

  function dispatchHashchange() {
      if (typeof HashChangeEvent !== 'undefined') {
          window.dispatchEvent(new HashChangeEvent('hashchange'));
          return;
      }
      try {
          window.dispatchEvent(new Event('hashchange'));
      }
      catch (error) {
          const ieEvent = document.createEvent('Event');
          ieEvent.initEvent('hashchange', true, true);
          window.dispatchEvent(ieEvent);
      }
  }
  class Popup {
      constructor(element, name) {
          this.element = element;
          if (!element) {
              return;
          }
          let isClosable = false;
          if (!this.element.classList.contains('popup')) {
              this.element = this.wrap([this.element]);
              this.element.classList.add('popup');
              if (name)
                  this.element.classList.add(`popup-${name}`);
              isClosable = this.element.getAttribute('closable') ? true : false;
              document.body.appendChild(this.element);
          }
          let innerElements = [].map.call(this.element.children, (child) => {
              if (child && child.tagName == 'A' && child.classList.contains('close-popup')) {
                  this.handle = child;
              }
              else if (child && child.tagName == 'DIV' && child.classList.contains('content')) {
                  this.contentElement = child;
              }
              else {
                  return child;
              }
              return null;
          });
          if (!this.handle) {
              this.handle = document.createElement('a');
              this.handle.innerHTML = '&times;';
              this.handle.classList.add('close-popup');
          }
          if (!this.contentElement) {
              this.contentElement = this.wrap(innerElements);
              this.contentElement.classList.add('content');
              let wrapper = document.createElement('div');
              wrapper.classList.add('inner-content');
              wrapper.appendChild(this.contentElement);
              wrapper.appendChild(this.handle);
              this.element.appendChild(wrapper);
          }
          if (isClosable) {
              this.contentElement.addEventListener('click', this.stopPropagation);
              this.element.addEventListener('click', (e) => {
                  this.hide();
                  window.location.hash = '#!';
              });
          }
          this.handle.addEventListener('click', (e) => {
              e.preventDefault();
              window.location.hash = '#!';
              this.hide();
          });
      }
      allowPropagation() {
          this.contentElement.removeEventListener('click', this.stopPropagation);
      }
      stopPropagation(e) {
          e.stopPropagation();
      }
      hide() {
          this.element.classList.remove('active');
          let iframes = this.element.querySelectorAll('iframe');
          if (iframes.length) {
              [].forEach.call(iframes, (iframe) => {
                  let src = iframe.src;
                  iframe.src = '';
                  iframe.src = src;
              });
          }
          return this;
      }
      show() {
          this.element.classList.add('active');
          return this;
      }
      setLoading(loading) {
          if (loading)
              this.element.classList.add('loading');
          else
              this.element.classList.remove('loading');
      }
      wrap(els) {
          let wrapper = document.createElement('div');
          [].forEach.call(els, (el) => {
              wrapper.appendChild(el);
          });
          return wrapper;
      }
  }
  class PopupCollection {
      constructor(elements) {
          this.popups = {};
          this.elements = this.isString(elements) ? document.querySelectorAll(elements) : elements;
          this.overlay = document.createElement('SPAN');
          this.overlay.classList.add('popup-overlay');
          if (this.elements && this.elements.length) {
              document.body.appendChild(this.overlay);
              [].forEach.call(this.elements, (child) => {
                  let name = child.getAttribute('data-popup');
                  if (!name) {
                      console.warn('Popup must have a data-popup="_NAME_" attribute');
                      return;
                  }
                  this.popups[name] = new Popup(child, name);
                  child.removeAttribute('data-popup');
              });
          }
          window.addEventListener('hashchange', (e) => {
              if (window.location.hash.indexOf('#!') == 0) {
                  e.preventDefault();
              }
              let hash = window.location.hash ? window.location.hash.replace('#!', '').split('/') : [];
              this.hide();
              if (hash[0] == 'popup') {
                  let callback = () => {
                      if (hash[1] && hash[1] != '' && this.popups[hash[1]]) {
                          this.showOverlay();
                          return this.popups[hash[1]].show();
                      }
                  };
                  callback();
              }
              this.hideOverlay();
          }, false);
          window.addEventListener('load', (e) => {
              if (window.location.hash.indexOf('#!popup') >= 0) {
                  dispatchHashchange();
              }
          });
      }
      showOverlay() {
          if (!this.overlay) {
              return;
          }
          document.body.classList.add('popup-active');
          this.overlay.classList.add('active');
          this.overlay.style.opacity = 1;
      }
      hideOverlay() {
          if (!this.overlay) {
              return;
          }
          this.overlay.addEventListener('transitionend', (e) => {
              document.body.classList.remove('popup-active');
              this.overlay.classList.remove('active');
          }, {
              capture: false,
              once: true,
              passive: false,
          });
          this.overlay.addEventListener('click', (e) => {
              document.body.classList.remove('popup-active');
              this.overlay.classList.remove('active');
          });
          this.overlay.style.opacity = 0;
      }
      hide() {
          for (let key in this.popups) {
              if (this.popups.hasOwnProperty(key) && this.popups[key] instanceof Popup) {
                  this.popups[key].hide();
              }
          }
      }
      isString(v) {
          return typeof v === 'string' || v instanceof String;
      }
  }

  class PositionData {
      constructor(data = []) {
          this.data = [];
          this.connections = [];
          if (data) {
              this.data = data;
          }
          let btn = document.querySelector('.btn-data');
          if (btn)
              btn.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  this.printData();
              });
      }
      addDepartment(x, y, text = {}, icon = {}, link = {}) {
          let id = this.id();
          this.data.push({ type: 'department', x, y, id, text, icon, link });
          return id;
      }
      updateDepartmentText(id, text) {
          this.data = this.data.map((c) => {
              if (c.id == id) {
                  c.text = text;
              }
              return c;
          });
          return this;
      }
      updateDepartmentImage(id, image) {
          this.data = this.data.map((c) => {
              if (c.id == id) {
                  c.icon = image;
              }
              return c;
          });
          return this;
      }
      updateDepartmentLink(id, link) {
          this.data = this.data.map((c) => {
              if (c.id == id) {
                  c.link = link;
              }
              return c;
          });
          return this;
      }
      removeDepartment(id) {
          this.data = this.data.filter((item) => id != item.id);
          this.removeConnection(id);
          return this;
      }
      addCircle(x, y) {
          let id = this.id();
          this.data.push({ type: 'circle', x: x, y: y, id: id });
          return id;
      }
      updateCircle(id, x, y) {
          this.data = this.data.map((c) => {
              if (c.id == id) {
                  c.x = x;
                  c.y = y;
              }
              return c;
          });
          return this;
      }
      removeCircle(id) {
          this.data = this.data.filter((item) => id != item.id);
          this.removeConnection(id);
          return this;
      }
      getCircle(id) {
          return this.get('circle', id);
      }
      get(type, id) {
          let data = this.data.filter((item) => type == item.type && id == item.id);
          return data && data.length ? data[0] : null;
      }
      getAll(type = false) {
          if (!type) {
              return this.data;
          }
          let data = this.data.filter((item) => type == item.type);
          return data;
      }
      addLine(points) {
          let id = this.id();
          this.data.push({ type: 'line', points, id: id });
          return id;
      }
      saveLine(id, points) {
          let found = false;
          this.data = this.data.map((c) => {
              if (c.id == id) {
                  c.points = points;
                  found = true;
              }
              return c;
          });
          if (!found) {
              this.data.push({ type: 'line', points, id: id });
          }
          return this;
      }
      removeLine(id) {
          this.data = this.data.filter((item) => id != item.id);
          this.removeConnection(id);
          return this;
      }
      getLine(id) {
          return this.get('line', id);
      }
      addConnection(id, idy) {
          this.data.push({ type: 'connection', id: id, idy });
          return this;
      }
      removeConnection(idx, idy = null) {
          this.data = this.data.filter((item) => !(idx == item.idx && (idy == null || idy == item.idy)) || !(idx == item.idy && (idy == null || idy == item.idx)));
          return this;
      }
      getConnection(id) {
          return this.get('connection', id);
      }
      id() {
          var id = Math.random().toString(36).substr(2, 9);
          return id;
      }
      printData() {
          document.querySelector('#data-json').classList.toggle('active');
          document.querySelector('#data-json').innerHTML = JSON.stringify(this.data, undefined, 2);
      }
  }

  (function () {
      function svgDrag(onDrag, onStop, direction) {
          var startX = 0;
          var startY = 0;
          var el = this;
          var dragging = false;
          var fix = {};
          function move(e) {
              onDrag && onDrag(el, e.pageX, startX, e.pageY, startY, fix);
              if ('vertical' !== direction) {
                  var pageX = ('pageX' in fix) ? fix['pageX'] : e.pageX;
                  if ('startX' in fix) {
                      startX = fix['startX'];
                  }
                  if (false === ('skipX' in fix)) {
                      el.style.transform = `translate(${pageX - startX}px, ${pageY - startY}px)`;
                  }
              }
              if ('horizontal' !== direction) {
                  var pageY = ('pageY' in fix) ? fix['pageY'] : e.pageY;
                  if ('startY' in fix) {
                      startY = fix['startY'];
                  }
                  if (false === ('skipY' in fix)) {
                      el.style.transform = `translate(${pageX - startX}px, ${pageY - startY}px)`;
                  }
              }
          }
          function startDragging(e) {
              if (e.which == 3) {
                  return;
              }
              if (e.currentTarget instanceof HTMLElement || e.currentTarget instanceof SVGElement) {
                  dragging = true;
                  var left = el.style.left ? parseInt(el.style.left) : 0;
                  var top = el.style.top ? parseInt(el.style.top) : 0;
                  startX = e.pageX - left;
                  startY = e.pageY - top;
                  window.addEventListener('mousemove', move);
              }
              else {
                  throw new Error("Your target must be an html element");
              }
          }
          this.addEventListener('mousedown', startDragging);
          window.addEventListener('mouseup', function (e) {
              if (true === dragging) {
                  dragging = false;
                  window.removeEventListener('mousemove', move);
                  onStop && onStop(el, e.pageX, startX, e.pageY, startY);
              }
          });
      }
      Element.prototype['svgDrag'] = svgDrag;
  })();

  class PositionTooltip {
      constructor(data = []) {
          this.lastPosition = { x: 50, y: 50 };
          this.mousePosition = { x: 50, y: 50 };
          this.lineArray = [];
          this.events = {};
          this.addDepartment = null;
          this.editMode = true;
          this.handleMouseOver = (event) => {
              this.position = this.createTooltipBox();
              event.target.addEventListener('mousemove', this.handleMouseMove);
              event.target.addEventListener('mouseleave', this.handleMouseLeave);
          };
          this.handleMouseLeave = (event) => {
              event.target.removeEventListener('mousemove', this.handleMouseMove);
              event.target.removeEventListener('mouseleave', this.handleMouseLeave);
          };
          this.handleMouseMove = (e) => {
              this.position(e);
          };
          this.handleLine = (polyline) => {
              this.lineArray.push([this.lastPosition.x, this.lastPosition.y]);
              polyline.plot(this.lineArray);
          };
          this.container = document.querySelector('[data-tooltip-container]');
          if (!this.container) {
              this.editMode = false;
          }
          this.data = new PositionData(data);
          this.svg = SVG('.top-background');
          this.popup = new PopupCollection('.popup-department');
          this.department = document.querySelector('.popup-department');
          if (this.department) {
              this.department.querySelector('.btn-save').addEventListener('click', (e) => {
                  if (this.addDepartment) {
                      let select = this.department.querySelector('select');
                      let option = select.options[select.selectedIndex];
                      this.addDepartment(option.value, option.innerText, option.getAttribute('data-icon'), option.getAttribute('data-url'));
                  }
              });
              this.department.querySelector('select').removeAttribute('disabled');
          }
          this.toolbar = new Toolbar();
          this.data.getAll().map((elm) => {
              switch (elm.type) {
                  case 'circle':
                      this.createCircle(elm, elm.id);
                      break;
                  case 'line':
                      this.createLine(elm.points, elm.id);
                      break;
                  case 'department':
                      this.createDepartment(elm, elm.text, elm.icon, elm.link, elm.id);
                      break;
              }
          });
          this.mode = '';
          this.toolbar.hide();
          if (!this.container) {
              return;
          }
          this.container.addEventListener('mouseover', this.handleMouseOver);
          this.container['menu'] = new ContextMenu(this.container.querySelector('.top-background'), [
              {
                  name: 'Add Point',
                  callback: () => {
                      if (this.mousePosition)
                          this.createCircle(this.mousePosition);
                  },
              },
              {
                  name: 'Add Line',
                  callback: (cont) => {
                      if (this.mousePosition) {
                          let polyline = this.createLine([]);
                          if (polyline) {
                              this.on('container-click', (cont) => {
                                  this.handleLine(polyline);
                              });
                              window['disableContextMenu'] = true;
                          }
                      }
                  },
              },
              {
                  name: 'Add Department',
                  callback: (cont) => {
                      window.location.hash = '#!popup/department';
                      this.addDepartment = (id, text, icon, url) => {
                          this.createDepartment(this.mousePosition, { x: this.mousePosition.x, y: this.mousePosition.y, title: text }, { x: this.mousePosition.x + 10, y: this.mousePosition.y + 10, url: icon }, url);
                      };
                  },
              },
              {},
              { name: 'Close' },
          ], {
              onShow: (e) => {
                  this.mousePosition = Object.assign({}, this.lastPosition);
              },
          });
          let stopPropagation = (e) => {
              e.stopPropagation();
              e.stopImmediatePropagation();
          };
          this.container.addEventListener('click', (e) => {
              this.emit('container-click', this.container);
          });
          this.container.addEventListener('mousedown', stopPropagation);
          this.container.addEventListener('touchstart', stopPropagation);
          this.container.addEventListener('pointerdown', stopPropagation);
      }
      createDepartment(pos, text, icon, link, id = null) {
          let group = this.svg.link(link);
          group.x(pos.x).y(pos.y);
          let departmentId = id ? id : this.data.addDepartment(pos.x, pos.y, text, icon, link);
          let nodes = [group.node];
          if (text && text.title) {
              let svgtext = group.plain(text.title).x(text.x).y(text.y);
              svgtext.node.svgDrag(null, (el, pageX, startX, pageY, startY) => {
                  svgtext.node.style.transform = 'none';
                  var x = svgtext.x() + pageX - startX;
                  var y = svgtext.y() + pageY - startY;
                  svgtext.x(x).y(y);
                  this.data.updateDepartmentText(departmentId, { x, y, title: text.title });
              });
              nodes.push(svgtext.node);
          }
          if (icon && icon.url) {
              let image = group.image(icon.url).x(icon.x).y(icon.y);
              image.addClass('department-icon');
              image.node.svgDrag(null, (el, pageX, startX, pageY, startY) => {
                  image.node.style.transform = 'none';
                  var x = image.x() + pageX - startX;
                  var y = image.y() + pageY - startY;
                  image.x(x).y(y);
                  this.data.updateDepartmentImage(departmentId, { x, y, url: icon.url });
              });
              nodes.push(image.node);
          }
          if (this.editMode) {
              group.node.addEventListener('click', (e) => {
                  e.preventDefault();
              });
              group['menu'] = new ContextMenu(nodes, [
                  {
                      name: 'Remove',
                      callback: () => {
                          group.remove();
                          this.data.removeDepartment(departmentId);
                      },
                  },
                  {},
                  { name: 'Close' },
              ]);
          }
          this.mode = 'department';
      }
      createCircle(pos, id = null) {
          let group = this.svg.group();
          let circle = group.circle(20);
          id = id ? id : this.data.addCircle(pos.x, pos.y);
          circle.fill('#f42153c7').addClass('marker').addClass(`circle-${id}`).stroke({ color: '#ffffff9e', width: 1 }).attr('data-id', id);
          circle.cx(pos.x).cy(pos.y);
          var nCircle = circle.clone();
          nCircle.addClass('ping').fill('#f42153c7');
          group.add(nCircle);
          if (this.editMode) {
              group['menu'] = new ContextMenu([group.node, nCircle.node, circle.node], [
                  {
                      name: 'Remove',
                      callback: () => {
                          this.data.removeCircle(circle.attr('data-id'));
                          group.remove();
                      },
                  },
                  {},
                  { name: 'Close' },
              ]);
              group.node.addEventListener('click', (e) => {
                  this.emit('click-circle', e.target);
              });
              group.node.svgDrag(null, () => {
                  circle.cx(this.lastPosition.x).cy(this.lastPosition.y);
                  nCircle.cx(this.lastPosition.x).cy(this.lastPosition.y);
                  this.data.updateCircle(id, this.lastPosition.x, this.lastPosition.y);
                  group.node.style.transform = 'none';
              });
          }
          this.mode = 'circle';
      }
      createLine(lineArray = [], id = null) {
          if (this.mode != 'line') {
              this.lineArray = lineArray;
              let polyline = this.svg.polyline(this.lineArray);
              id = id ? id : this.data.id();
              polyline.stroke({ color: '#ffffff9e', width: 2 }).attr('class', 'line').addClass(`line-${id}`).attr('data-id', id);
              if (this.editMode) {
                  polyline['menu'] = new ContextMenu(polyline.node, [
                      {
                          name: 'Connect To...',
                          callback: () => {
                              this.toolbar.update([
                                  {
                                      name: 'Cancel Connection',
                                      callback: () => {
                                          this.off('click-circle');
                                          this.toolbar.hide();
                                      },
                                  },
                              ]);
                              this.on('click-circle', (el) => {
                                  let circle = this.data.getCircle(el.getAttribute('data-id'));
                                  if (circle) {
                                      this.data.addConnection(circle['id'], id);
                                  }
                                  this.toolbar.hide();
                                  this.off('click-circle');
                              });
                          },
                      },
                      {
                          name: 'Remove',
                          callback: () => {
                              this.data.removeLine(id);
                              polyline.remove();
                          },
                      },
                      {},
                      { name: 'Close' },
                  ]);
                  var handleUndo = (e) => {
                      if ((e.which === 90 && e.ctrlKey) || (e.metaKey && e.which === 91)) {
                          this.lineArray.pop();
                          polyline.plot(this.lineArray);
                      }
                  };
                  let clearEvents = () => {
                      this.mode = '';
                      this.lineArray = [];
                      window['disableContextMenu'] = false;
                      this.off('container-click');
                      document.removeEventListener('keydown', handleUndo);
                      this.toolbar.hide();
                  };
                  document.addEventListener('keydown', handleUndo);
                  this.toolbar.update([
                      {
                          name: 'Save',
                          callback: () => {
                              this.data.saveLine(id, this.lineArray);
                              clearEvents();
                          },
                      },
                      {
                          name: 'Cancel',
                          callback: () => {
                              this.data.removeLine(id);
                              polyline.remove();
                              clearEvents();
                          },
                      },
                  ]);
              }
              this.mode = 'line';
              return polyline;
          }
      }
      createTooltipBox() {
          return (e) => {
              let pos = this.recursivePosition(e, this.container);
              let percentx = ((pos.x / this.container.clientHeight) * 100).toFixed(1);
              let percenty = ((pos.y / this.container.clientWidth) * 100).toFixed(1);
              this.lastPosition = { x: pos.x, y: pos.y };
              return { x: percentx, y: percenty };
          };
      }
      recursivePosition(e, obj) {
          var m_posx = 0, m_posy = 0, e_posx = 0, e_posy = 0;
          if (!e) {
              e = window.event;
          }
          if (e.pageX || e.pageY) {
              m_posx = e.pageX;
              m_posy = e.pageY;
          }
          else if (e.clientX || e.clientY) {
              m_posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
              m_posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }
          if (obj.offsetParent) {
              do {
                  e_posx += obj.offsetLeft;
                  e_posy += obj.offsetTop;
              } while ((obj = obj.offsetParent));
          }
          return { x: m_posx - e_posx, y: m_posy - e_posy };
      }
      emit(type, el, data = {}) {
          if (this.events[type]) {
              this.events[type](el, data);
          }
      }
      on(type, fn) {
          this.events[type] = fn;
      }
      off(type) {
          this.events[type] = null;
      }
  }

  window["disableContextMenu"] = false;
  app.ready(() => {
      new PositionTooltip();
  });

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ltcHRvbWNoZWNrZXIuanMiLCJzb3VyY2VzIjpbIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy91dGlscy9tZXRob2RzLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL3V0aWxzL3V0aWxzLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvY29yZS9uYW1lc3BhY2VzLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL3V0aWxzL3dpbmRvdy5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9CYXNlLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL3V0aWxzL2Fkb3B0ZXIuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9vcHRpb25hbC9hcnJhbmdlLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvY29yZS9yZWdleC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL29wdGlvbmFsL2NsYXNzLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvb3B0aW9uYWwvY3NzLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvb3B0aW9uYWwvZGF0YS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL29wdGlvbmFsL21lbW9yeS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9Db2xvci5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9Qb2ludC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9NYXRyaXguanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9jb3JlL3BhcnNlci5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9Cb3guanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvdHlwZXMvTGlzdC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL2NvcmUvc2VsZWN0b3IuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9jb3JlL2V2ZW50LmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL3R5cGVzL0V2ZW50VGFyZ2V0LmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvY29yZS9kZWZhdWx0cy5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9TVkdBcnJheS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy90eXBlcy9TVkdOdW1iZXIuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9jb3JlL2F0dHIuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvRG9tLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL0VsZW1lbnQuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9vcHRpb25hbC9zdWdhci5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL29wdGlvbmFsL3RyYW5zZm9ybS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9Db250YWluZXIuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvRGVmcy5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9TaGFwZS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL2NvcmUvY2lyY2xlZC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9FbGxpcHNlLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL0ZyYWdtZW50LmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL21vZHVsZXMvY29yZS9ncmFkaWVudGVkLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL0dyYWRpZW50LmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL1BhdHRlcm4uanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvSW1hZ2UuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvdHlwZXMvUG9pbnRBcnJheS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL2NvcmUvcG9pbnRlZC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9MaW5lLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL01hcmtlci5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9hbmltYXRpb24vQ29udHJvbGxlci5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy91dGlscy9wYXRoUGFyc2VyLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL3R5cGVzL1BhdGhBcnJheS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9hbmltYXRpb24vTW9ycGhhYmxlLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL1BhdGguanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbW9kdWxlcy9jb3JlL3BvbHkuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvUG9seWdvbi5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9Qb2x5bGluZS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9SZWN0LmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2FuaW1hdGlvbi9RdWV1ZS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9hbmltYXRpb24vQW5pbWF0b3IuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvYW5pbWF0aW9uL1RpbWVsaW5lLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2FuaW1hdGlvbi9SdW5uZXIuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvU3ZnLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL1N5bWJvbC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL2NvcmUvdGV4dGFibGUuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvVGV4dC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9Uc3Bhbi5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9DaXJjbGUuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvQ2xpcFBhdGguanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvRm9yZWlnbk9iamVjdC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9tb2R1bGVzL2NvcmUvY29udGFpbmVyR2VvbWV0cnkuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvRy5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9BLmpzIiwiLi4vdHMvbm9kZV9tb2R1bGVzL0Bzdmdkb3Rqcy9zdmcuanMvc3JjL2VsZW1lbnRzL01hc2suanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvZWxlbWVudHMvU3RvcC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9TdHlsZS5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9UZXh0UGF0aC5qcyIsIi4uL3RzL25vZGVfbW9kdWxlcy9Ac3ZnZG90anMvc3ZnLmpzL3NyYy9lbGVtZW50cy9Vc2UuanMiLCIuLi90cy9ub2RlX21vZHVsZXMvQHN2Z2RvdGpzL3N2Zy5qcy9zcmMvbWFpbi5qcyIsIi4uL3RzL3NjcmlwdHMvc3ltcHRvbWNoZWNrZXIvY29udGV4dC1tZW51LnRzIiwiLi4vdHMvc2NyaXB0cy9zeW1wdG9tY2hlY2tlci90b29sYmFyLnRzIiwiLi4vdHMvc2NyaXB0cy9zeW1wdG9tY2hlY2tlci9wb3B1cC50cyIsIi4uL3RzL3NjcmlwdHMvc3ltcHRvbWNoZWNrZXIvcG9zaXRpb24tZGF0YS50cyIsIi4uL3RzL3NjcmlwdHMvc3ltcHRvbWNoZWNrZXIvc3ZnZHJhZy50cyIsIi4uL3RzL3NjcmlwdHMvc3ltcHRvbWNoZWNrZXIvcG9zaXRpb24tdG9vbHRpcC50cyIsIi4uL3RzL3NjcmlwdHMvc3ltcHRvbWNoZWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgbWV0aG9kcyA9IHt9XHJcbmNvbnN0IG5hbWVzID0gW11cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3Rlck1ldGhvZHMgKG5hbWUsIG0pIHtcclxuICBpZiAoQXJyYXkuaXNBcnJheShuYW1lKSkge1xyXG4gICAgZm9yIChjb25zdCBfbmFtZSBvZiBuYW1lKSB7XHJcbiAgICAgIHJlZ2lzdGVyTWV0aG9kcyhfbmFtZSwgbSlcclxuICAgIH1cclxuICAgIHJldHVyblxyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBuYW1lID09PSAnb2JqZWN0Jykge1xyXG4gICAgZm9yIChjb25zdCBfbmFtZSBpbiBuYW1lKSB7XHJcbiAgICAgIHJlZ2lzdGVyTWV0aG9kcyhfbmFtZSwgbmFtZVtfbmFtZV0pXHJcbiAgICB9XHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIGFkZE1ldGhvZE5hbWVzKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG0pKVxyXG4gIG1ldGhvZHNbbmFtZV0gPSBPYmplY3QuYXNzaWduKG1ldGhvZHNbbmFtZV0gfHwge30sIG0pXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNZXRob2RzRm9yIChuYW1lKSB7XHJcbiAgcmV0dXJuIG1ldGhvZHNbbmFtZV0gfHwge31cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGhvZE5hbWVzICgpIHtcclxuICByZXR1cm4gWyAuLi5uZXcgU2V0KG5hbWVzKSBdXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhZGRNZXRob2ROYW1lcyAoX25hbWVzKSB7XHJcbiAgbmFtZXMucHVzaCguLi5fbmFtZXMpXHJcbn1cclxuIiwiLy8gTWFwIGZ1bmN0aW9uXHJcbmV4cG9ydCBmdW5jdGlvbiBtYXAgKGFycmF5LCBibG9jaykge1xyXG4gIGxldCBpXHJcbiAgY29uc3QgaWwgPSBhcnJheS5sZW5ndGhcclxuICBjb25zdCByZXN1bHQgPSBbXVxyXG5cclxuICBmb3IgKGkgPSAwOyBpIDwgaWw7IGkrKykge1xyXG4gICAgcmVzdWx0LnB1c2goYmxvY2soYXJyYXlbaV0pKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG4vLyBGaWx0ZXIgZnVuY3Rpb25cclxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlciAoYXJyYXksIGJsb2NrKSB7XHJcbiAgbGV0IGlcclxuICBjb25zdCBpbCA9IGFycmF5Lmxlbmd0aFxyXG4gIGNvbnN0IHJlc3VsdCA9IFtdXHJcblxyXG4gIGZvciAoaSA9IDA7IGkgPCBpbDsgaSsrKSB7XHJcbiAgICBpZiAoYmxvY2soYXJyYXlbaV0pKSB7XHJcbiAgICAgIHJlc3VsdC5wdXNoKGFycmF5W2ldKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc3VsdFxyXG59XHJcblxyXG4vLyBEZWdyZWVzIHRvIHJhZGlhbnNcclxuZXhwb3J0IGZ1bmN0aW9uIHJhZGlhbnMgKGQpIHtcclxuICByZXR1cm4gZCAlIDM2MCAqIE1hdGguUEkgLyAxODBcclxufVxyXG5cclxuLy8gUmFkaWFucyB0byBkZWdyZWVzXHJcbmV4cG9ydCBmdW5jdGlvbiBkZWdyZWVzIChyKSB7XHJcbiAgcmV0dXJuIHIgKiAxODAgLyBNYXRoLlBJICUgMzYwXHJcbn1cclxuXHJcbi8vIENvbnZlcnQgZGFzaC1zZXBhcmF0ZWQtc3RyaW5nIHRvIGNhbWVsQ2FzZVxyXG5leHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlIChzKSB7XHJcbiAgcmV0dXJuIHMudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8tKC4pL2csIGZ1bmN0aW9uIChtLCBnKSB7XHJcbiAgICByZXR1cm4gZy50b1VwcGVyQ2FzZSgpXHJcbiAgfSlcclxufVxyXG5cclxuLy8gQ29udmVydCBjYW1lbCBjYXNlZCBzdHJpbmcgdG8gZGFzaCBzZXBhcmF0ZWRcclxuZXhwb3J0IGZ1bmN0aW9uIHVuQ2FtZWxDYXNlIChzKSB7XHJcbiAgcmV0dXJuIHMucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbiAobSwgZykge1xyXG4gICAgcmV0dXJuICctJyArIGcudG9Mb3dlckNhc2UoKVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vIENhcGl0YWxpemUgZmlyc3QgbGV0dGVyIG9mIGEgc3RyaW5nXHJcbmV4cG9ydCBmdW5jdGlvbiBjYXBpdGFsaXplIChzKSB7XHJcbiAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpXHJcbn1cclxuXHJcbi8vIENhbGN1bGF0ZSBwcm9wb3J0aW9uYWwgd2lkdGggYW5kIGhlaWdodCB2YWx1ZXMgd2hlbiBuZWNlc3NhcnlcclxuZXhwb3J0IGZ1bmN0aW9uIHByb3BvcnRpb25hbFNpemUgKGVsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIGJveCkge1xyXG4gIGlmICh3aWR0aCA9PSBudWxsIHx8IGhlaWdodCA9PSBudWxsKSB7XHJcbiAgICBib3ggPSBib3ggfHwgZWxlbWVudC5iYm94KClcclxuXHJcbiAgICBpZiAod2lkdGggPT0gbnVsbCkge1xyXG4gICAgICB3aWR0aCA9IGJveC53aWR0aCAvIGJveC5oZWlnaHQgKiBoZWlnaHRcclxuICAgIH0gZWxzZSBpZiAoaGVpZ2h0ID09IG51bGwpIHtcclxuICAgICAgaGVpZ2h0ID0gYm94LmhlaWdodCAvIGJveC53aWR0aCAqIHdpZHRoXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgd2lkdGg6IHdpZHRoLFxyXG4gICAgaGVpZ2h0OiBoZWlnaHRcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGlzIGZ1bmN0aW9uIGFkZHMgc3VwcG9ydCBmb3Igc3RyaW5nIG9yaWdpbnMuXHJcbiAqIEl0IHNlYXJjaGVzIGZvciBhbiBvcmlnaW4gaW4gby5vcmlnaW4gby5veCBhbmQgby5vcmlnaW5YLlxyXG4gKiBUaGlzIHdheSwgb3JpZ2luOiB7eDogJ2NlbnRlcicsIHk6IDUwfSBjYW4gYmUgcGFzc2VkIGFzIHdlbGwgYXMgb3g6ICdjZW50ZXInLCBveTogNTBcclxuKiovXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRPcmlnaW4gKG8sIGVsZW1lbnQpIHtcclxuICBjb25zdCBvcmlnaW4gPSBvLm9yaWdpblxyXG4gIC8vIEZpcnN0IGNoZWNrIGlmIG9yaWdpbiBpcyBpbiBveCBvciBvcmlnaW5YXHJcbiAgbGV0IG94ID0gby5veCAhPSBudWxsXG4gICAgPyBvLm94XHJcbiAgICA6IG8ub3JpZ2luWCAhPSBudWxsXG4gICAgICA/IG8ub3JpZ2luWFxyXG4gICAgICA6ICdjZW50ZXInXHJcbiAgbGV0IG95ID0gby5veSAhPSBudWxsXG4gICAgPyBvLm95XHJcbiAgICA6IG8ub3JpZ2luWSAhPSBudWxsXG4gICAgICA/IG8ub3JpZ2luWVxyXG4gICAgICA6ICdjZW50ZXInXHJcblxyXG4gIC8vIFRoZW4gY2hlY2sgaWYgb3JpZ2luIHdhcyB1c2VkIGFuZCBvdmVyd3JpdGUgaW4gdGhhdCBjYXNlXHJcbiAgaWYgKG9yaWdpbiAhPSBudWxsKSB7XHJcbiAgICBbIG94LCBveSBdID0gQXJyYXkuaXNBcnJheShvcmlnaW4pXG4gICAgICA/IG9yaWdpblxyXG4gICAgICA6IHR5cGVvZiBvcmlnaW4gPT09ICdvYmplY3QnXG4gICAgICAgID8gWyBvcmlnaW4ueCwgb3JpZ2luLnkgXVxyXG4gICAgICAgIDogWyBvcmlnaW4sIG9yaWdpbiBdXHJcbiAgfVxyXG5cclxuICAvLyBNYWtlIHN1cmUgdG8gb25seSBjYWxsIGJib3ggd2hlbiBhY3R1YWxseSBuZWVkZWRcclxuICBjb25zdCBjb25kWCA9IHR5cGVvZiBveCA9PT0gJ3N0cmluZydcclxuICBjb25zdCBjb25kWSA9IHR5cGVvZiBveSA9PT0gJ3N0cmluZydcclxuICBpZiAoY29uZFggfHwgY29uZFkpIHtcclxuICAgIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCwgeCwgeSB9ID0gZWxlbWVudC5iYm94KClcclxuXHJcbiAgICAvLyBBbmQgb25seSBvdmVyd3JpdGUgaWYgc3RyaW5nIHdhcyBwYXNzZWQgZm9yIHRoaXMgc3BlY2lmaWMgYXhpc1xyXG4gICAgaWYgKGNvbmRYKSB7XHJcbiAgICAgIG94ID0gb3guaW5jbHVkZXMoJ2xlZnQnKVxuICAgICAgICA/IHhcclxuICAgICAgICA6IG94LmluY2x1ZGVzKCdyaWdodCcpXG4gICAgICAgICAgPyB4ICsgd2lkdGhcclxuICAgICAgICAgIDogeCArIHdpZHRoIC8gMlxyXG4gICAgfVxyXG5cclxuICAgIGlmIChjb25kWSkge1xyXG4gICAgICBveSA9IG95LmluY2x1ZGVzKCd0b3AnKVxuICAgICAgICA/IHlcclxuICAgICAgICA6IG95LmluY2x1ZGVzKCdib3R0b20nKVxuICAgICAgICAgID8geSArIGhlaWdodFxyXG4gICAgICAgICAgOiB5ICsgaGVpZ2h0IC8gMlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBvcmlnaW4gYXMgaXQgaXMgaWYgaXQgd2Fzbid0IGEgc3RyaW5nXHJcbiAgcmV0dXJuIFsgb3gsIG95IF1cclxufVxyXG4iLCIvLyBEZWZhdWx0IG5hbWVzcGFjZXNcbmV4cG9ydCBjb25zdCBzdmcgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnXG5leHBvcnQgY29uc3QgaHRtbCA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJ1xuZXhwb3J0IGNvbnN0IHhtbG5zID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvJ1xuZXhwb3J0IGNvbnN0IHhsaW5rID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnXG5leHBvcnQgY29uc3Qgc3ZnanMgPSAnaHR0cDovL3N2Z2pzLmRldi9zdmdqcydcbiIsImV4cG9ydCBjb25zdCBnbG9iYWxzID0ge1xyXG4gIHdpbmRvdzogdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogd2luZG93LFxyXG4gIGRvY3VtZW50OiB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGRvY3VtZW50XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcldpbmRvdyAod2luID0gbnVsbCwgZG9jID0gbnVsbCkge1xyXG4gIGdsb2JhbHMud2luZG93ID0gd2luXHJcbiAgZ2xvYmFscy5kb2N1bWVudCA9IGRvY1xyXG59XHJcblxyXG5jb25zdCBzYXZlID0ge31cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzYXZlV2luZG93ICgpIHtcclxuICBzYXZlLndpbmRvdyA9IGdsb2JhbHMud2luZG93XHJcbiAgc2F2ZS5kb2N1bWVudCA9IGdsb2JhbHMuZG9jdW1lbnRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVXaW5kb3cgKCkge1xyXG4gIGdsb2JhbHMud2luZG93ID0gc2F2ZS53aW5kb3dcclxuICBnbG9iYWxzLmRvY3VtZW50ID0gc2F2ZS5kb2N1bWVudFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gd2l0aFdpbmRvdyAod2luLCBmbikge1xyXG4gIHNhdmVXaW5kb3coKVxyXG4gIHJlZ2lzdGVyV2luZG93KHdpbiwgd2luLmRvY3VtZW50KVxyXG4gIGZuKHdpbiwgd2luLmRvY3VtZW50KVxyXG4gIHJlc3RvcmVXaW5kb3coKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0V2luZG93ICgpIHtcclxuICByZXR1cm4gZ2xvYmFscy53aW5kb3dcclxufVxyXG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlIHtcclxuICAvLyBjb25zdHJ1Y3RvciAobm9kZS8qLCB7ZXh0ZW5zaW9ucyA9IFtdfSAqLykge1xyXG4gIC8vICAgLy8gdGhpcy50YWdzID0gW11cclxuICAvLyAgIC8vXHJcbiAgLy8gICAvLyBmb3IgKGxldCBleHRlbnNpb24gb2YgZXh0ZW5zaW9ucykge1xyXG4gIC8vICAgLy8gICBleHRlbnNpb24uc2V0dXAuY2FsbCh0aGlzLCBub2RlKVxyXG4gIC8vICAgLy8gICB0aGlzLnRhZ3MucHVzaChleHRlbnNpb24ubmFtZSlcclxuICAvLyAgIC8vIH1cclxuICAvLyB9XHJcbn1cclxuIiwiaW1wb3J0IHsgYWRkTWV0aG9kTmFtZXMgfSBmcm9tICcuL21ldGhvZHMuanMnXHJcbmltcG9ydCB7IGNhcGl0YWxpemUgfSBmcm9tICcuL3V0aWxzLmpzJ1xyXG5pbXBvcnQgeyBzdmcgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvbmFtZXNwYWNlcy5qcydcclxuaW1wb3J0IHsgZ2xvYmFscyB9IGZyb20gJy4uL3V0aWxzL3dpbmRvdy5qcydcclxuaW1wb3J0IEJhc2UgZnJvbSAnLi4vdHlwZXMvQmFzZS5qcydcclxuXHJcbmNvbnN0IGVsZW1lbnRzID0ge31cclxuZXhwb3J0IGNvbnN0IHJvb3QgPSAnX19fU1lNQk9MX19fUk9PVF9fXydcclxuXHJcbi8vIE1ldGhvZCBmb3IgZWxlbWVudCBjcmVhdGlvblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlIChuYW1lLCBucyA9IHN2Zykge1xyXG4gIC8vIGNyZWF0ZSBlbGVtZW50XHJcbiAgcmV0dXJuIGdsb2JhbHMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCBuYW1lKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbWFrZUluc3RhbmNlIChlbGVtZW50LCBpc0hUTUwgPSBmYWxzZSkge1xyXG4gIGlmIChlbGVtZW50IGluc3RhbmNlb2YgQmFzZSkgcmV0dXJuIGVsZW1lbnRcclxuXHJcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnb2JqZWN0Jykge1xyXG4gICAgcmV0dXJuIGFkb3B0ZXIoZWxlbWVudClcclxuICB9XHJcblxyXG4gIGlmIChlbGVtZW50ID09IG51bGwpIHtcclxuICAgIHJldHVybiBuZXcgZWxlbWVudHNbcm9vdF0oKVxyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyAmJiBlbGVtZW50LmNoYXJBdCgwKSAhPT0gJzwnKSB7XHJcbiAgICByZXR1cm4gYWRvcHRlcihnbG9iYWxzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCkpXHJcbiAgfVxyXG5cclxuICAvLyBNYWtlIHN1cmUsIHRoYXQgSFRNTCBlbGVtZW50cyBhcmUgY3JlYXRlZCB3aXRoIHRoZSBjb3JyZWN0IG5hbWVzcGFjZVxyXG4gIGNvbnN0IHdyYXBwZXIgPSBpc0hUTUwgPyBnbG9iYWxzLmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIDogY3JlYXRlKCdzdmcnKVxyXG4gIHdyYXBwZXIuaW5uZXJIVE1MID0gZWxlbWVudFxyXG5cclxuICAvLyBXZSBjYW4gdXNlIGZpcnN0Q2hpbGQgaGVyZSBiZWNhdXNlIHdlIGtub3csXHJcbiAgLy8gdGhhdCB0aGUgZmlyc3QgY2hhciBpcyA8IGFuZCB0aHVzIGFuIGVsZW1lbnRcclxuICBlbGVtZW50ID0gYWRvcHRlcih3cmFwcGVyLmZpcnN0Q2hpbGQpXHJcblxyXG4gIC8vIG1ha2Ugc3VyZSwgdGhhdCBlbGVtZW50IGRvZXNudCBoYXZlIGl0cyB3cmFwcGVyIGF0dGFjaGVkXHJcbiAgd3JhcHBlci5yZW1vdmVDaGlsZCh3cmFwcGVyLmZpcnN0Q2hpbGQpXHJcbiAgcmV0dXJuIGVsZW1lbnRcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vZGVPck5ldyAobmFtZSwgbm9kZSkge1xyXG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgZ2xvYmFscy53aW5kb3cuTm9kZSA/IG5vZGUgOiBjcmVhdGUobmFtZSlcclxufVxyXG5cclxuLy8gQWRvcHQgZXhpc3Rpbmcgc3ZnIGVsZW1lbnRzXHJcbmV4cG9ydCBmdW5jdGlvbiBhZG9wdCAobm9kZSkge1xyXG4gIC8vIGNoZWNrIGZvciBwcmVzZW5jZSBvZiBub2RlXHJcbiAgaWYgKCFub2RlKSByZXR1cm4gbnVsbFxyXG5cclxuICAvLyBtYWtlIHN1cmUgYSBub2RlIGlzbid0IGFscmVhZHkgYWRvcHRlZFxyXG4gIGlmIChub2RlLmluc3RhbmNlIGluc3RhbmNlb2YgQmFzZSkgcmV0dXJuIG5vZGUuaW5zdGFuY2VcclxuXHJcbiAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICcjZG9jdW1lbnQtZnJhZ21lbnQnKSB7XHJcbiAgICByZXR1cm4gbmV3IGVsZW1lbnRzLkZyYWdtZW50KG5vZGUpXHJcbiAgfVxyXG5cclxuICAvLyBpbml0aWFsaXplIHZhcmlhYmxlc1xyXG4gIGxldCBjbGFzc05hbWUgPSBjYXBpdGFsaXplKG5vZGUubm9kZU5hbWUgfHwgJ0RvbScpXHJcblxyXG4gIC8vIE1ha2Ugc3VyZSB0aGF0IGdyYWRpZW50cyBhcmUgYWRvcHRlZCBjb3JyZWN0bHlcclxuICBpZiAoY2xhc3NOYW1lID09PSAnTGluZWFyR3JhZGllbnQnIHx8IGNsYXNzTmFtZSA9PT0gJ1JhZGlhbEdyYWRpZW50Jykge1xyXG4gICAgY2xhc3NOYW1lID0gJ0dyYWRpZW50J1xyXG5cclxuICAvLyBGYWxsYmFjayB0byBEb20gaWYgZWxlbWVudCBpcyBub3Qga25vd25cclxuICB9IGVsc2UgaWYgKCFlbGVtZW50c1tjbGFzc05hbWVdKSB7XHJcbiAgICBjbGFzc05hbWUgPSAnRG9tJ1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIG5ldyBlbGVtZW50c1tjbGFzc05hbWVdKG5vZGUpXHJcbn1cclxuXHJcbmxldCBhZG9wdGVyID0gYWRvcHRcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb2NrQWRvcHQgKG1vY2sgPSBhZG9wdCkge1xyXG4gIGFkb3B0ZXIgPSBtb2NrXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlciAoZWxlbWVudCwgbmFtZSA9IGVsZW1lbnQubmFtZSwgYXNSb290ID0gZmFsc2UpIHtcclxuICBlbGVtZW50c1tuYW1lXSA9IGVsZW1lbnRcclxuICBpZiAoYXNSb290KSBlbGVtZW50c1tyb290XSA9IGVsZW1lbnRcclxuXHJcbiAgYWRkTWV0aG9kTmFtZXMoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZWxlbWVudC5wcm90b3R5cGUpKVxyXG5cclxuICByZXR1cm4gZWxlbWVudFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xhc3MgKG5hbWUpIHtcclxuICByZXR1cm4gZWxlbWVudHNbbmFtZV1cclxufVxyXG5cclxuLy8gRWxlbWVudCBpZCBzZXF1ZW5jZVxyXG5sZXQgZGlkID0gMTAwMFxyXG5cclxuLy8gR2V0IG5leHQgbmFtZWQgZWxlbWVudCBpZFxyXG5leHBvcnQgZnVuY3Rpb24gZWlkIChuYW1lKSB7XHJcbiAgcmV0dXJuICdTdmdqcycgKyBjYXBpdGFsaXplKG5hbWUpICsgKGRpZCsrKVxyXG59XHJcblxyXG4vLyBEZWVwIG5ldyBpZCBhc3NpZ25tZW50XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NpZ25OZXdJZCAobm9kZSkge1xyXG4gIC8vIGRvIHRoZSBzYW1lIGZvciBTVkcgY2hpbGQgbm9kZXMgYXMgd2VsbFxyXG4gIGZvciAobGV0IGkgPSBub2RlLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICBhc3NpZ25OZXdJZChub2RlLmNoaWxkcmVuW2ldKVxyXG4gIH1cclxuXHJcbiAgaWYgKG5vZGUuaWQpIHtcclxuICAgIG5vZGUuaWQgPSBlaWQobm9kZS5ub2RlTmFtZSlcclxuICAgIHJldHVybiBub2RlXHJcbiAgfVxyXG5cclxuICByZXR1cm4gbm9kZVxyXG59XHJcblxyXG4vLyBNZXRob2QgZm9yIGV4dGVuZGluZyBvYmplY3RzXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQgKG1vZHVsZXMsIG1ldGhvZHMpIHtcclxuICBsZXQga2V5LCBpXHJcblxyXG4gIG1vZHVsZXMgPSBBcnJheS5pc0FycmF5KG1vZHVsZXMpID8gbW9kdWxlcyA6IFsgbW9kdWxlcyBdXHJcblxyXG4gIGZvciAoaSA9IG1vZHVsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgIGZvciAoa2V5IGluIG1ldGhvZHMpIHtcclxuICAgICAgbW9kdWxlc1tpXS5wcm90b3R5cGVba2V5XSA9IG1ldGhvZHNba2V5XVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHdyYXBXaXRoQXR0ckNoZWNrIChmbikge1xyXG4gIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xyXG4gICAgY29uc3QgbyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXVxyXG5cclxuICAgIGlmIChvICYmIG8uY29uc3RydWN0b3IgPT09IE9iamVjdCAmJiAhKG8gaW5zdGFuY2VvZiBBcnJheSkpIHtcclxuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3Muc2xpY2UoMCwgLTEpKS5hdHRyKG8pXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncylcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgbWFrZUluc3RhbmNlIH0gZnJvbSAnLi4vLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuXHJcbi8vIEdldCBhbGwgc2libGluZ3MsIGluY2x1ZGluZyBteXNlbGZcclxuZXhwb3J0IGZ1bmN0aW9uIHNpYmxpbmdzICgpIHtcclxuICByZXR1cm4gdGhpcy5wYXJlbnQoKS5jaGlsZHJlbigpXHJcbn1cclxuXHJcbi8vIEdldCB0aGUgY3VycmVudCBwb3NpdGlvbiBzaWJsaW5nc1xyXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb24gKCkge1xyXG4gIHJldHVybiB0aGlzLnBhcmVudCgpLmluZGV4KHRoaXMpXHJcbn1cclxuXHJcbi8vIEdldCB0aGUgbmV4dCBlbGVtZW50ICh3aWxsIHJldHVybiBudWxsIGlmIHRoZXJlIGlzIG5vbmUpXHJcbmV4cG9ydCBmdW5jdGlvbiBuZXh0ICgpIHtcclxuICByZXR1cm4gdGhpcy5zaWJsaW5ncygpW3RoaXMucG9zaXRpb24oKSArIDFdXHJcbn1cclxuXHJcbi8vIEdldCB0aGUgbmV4dCBlbGVtZW50ICh3aWxsIHJldHVybiBudWxsIGlmIHRoZXJlIGlzIG5vbmUpXHJcbmV4cG9ydCBmdW5jdGlvbiBwcmV2ICgpIHtcclxuICByZXR1cm4gdGhpcy5zaWJsaW5ncygpW3RoaXMucG9zaXRpb24oKSAtIDFdXHJcbn1cclxuXHJcbi8vIFNlbmQgZ2l2ZW4gZWxlbWVudCBvbmUgc3RlcCBmb3J3YXJkXHJcbmV4cG9ydCBmdW5jdGlvbiBmb3J3YXJkICgpIHtcclxuICBjb25zdCBpID0gdGhpcy5wb3NpdGlvbigpXHJcbiAgY29uc3QgcCA9IHRoaXMucGFyZW50KClcclxuXHJcbiAgLy8gbW92ZSBub2RlIG9uZSBzdGVwIGZvcndhcmRcclxuICBwLmFkZCh0aGlzLnJlbW92ZSgpLCBpICsgMSlcclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gU2VuZCBnaXZlbiBlbGVtZW50IG9uZSBzdGVwIGJhY2t3YXJkXHJcbmV4cG9ydCBmdW5jdGlvbiBiYWNrd2FyZCAoKSB7XHJcbiAgY29uc3QgaSA9IHRoaXMucG9zaXRpb24oKVxyXG4gIGNvbnN0IHAgPSB0aGlzLnBhcmVudCgpXHJcblxyXG4gIHAuYWRkKHRoaXMucmVtb3ZlKCksIGkgPyBpIC0gMSA6IDApXHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vIFNlbmQgZ2l2ZW4gZWxlbWVudCBhbGwgdGhlIHdheSB0byB0aGUgZnJvbnRcclxuZXhwb3J0IGZ1bmN0aW9uIGZyb250ICgpIHtcclxuICBjb25zdCBwID0gdGhpcy5wYXJlbnQoKVxyXG5cclxuICAvLyBNb3ZlIG5vZGUgZm9yd2FyZFxyXG4gIHAuYWRkKHRoaXMucmVtb3ZlKCkpXHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vIFNlbmQgZ2l2ZW4gZWxlbWVudCBhbGwgdGhlIHdheSB0byB0aGUgYmFja1xyXG5leHBvcnQgZnVuY3Rpb24gYmFjayAoKSB7XHJcbiAgY29uc3QgcCA9IHRoaXMucGFyZW50KClcclxuXHJcbiAgLy8gTW92ZSBub2RlIGJhY2tcclxuICBwLmFkZCh0aGlzLnJlbW92ZSgpLCAwKVxyXG5cclxuICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG4vLyBJbnNlcnRzIGEgZ2l2ZW4gZWxlbWVudCBiZWZvcmUgdGhlIHRhcmdldGVkIGVsZW1lbnRcclxuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZSAoZWxlbWVudCkge1xyXG4gIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuICBlbGVtZW50LnJlbW92ZSgpXHJcblxyXG4gIGNvbnN0IGkgPSB0aGlzLnBvc2l0aW9uKClcclxuXHJcbiAgdGhpcy5wYXJlbnQoKS5hZGQoZWxlbWVudCwgaSlcclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gSW5zZXJ0cyBhIGdpdmVuIGVsZW1lbnQgYWZ0ZXIgdGhlIHRhcmdldGVkIGVsZW1lbnRcclxuZXhwb3J0IGZ1bmN0aW9uIGFmdGVyIChlbGVtZW50KSB7XHJcbiAgZWxlbWVudCA9IG1ha2VJbnN0YW5jZShlbGVtZW50KVxyXG4gIGVsZW1lbnQucmVtb3ZlKClcclxuXHJcbiAgY29uc3QgaSA9IHRoaXMucG9zaXRpb24oKVxyXG5cclxuICB0aGlzLnBhcmVudCgpLmFkZChlbGVtZW50LCBpICsgMSlcclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluc2VydEJlZm9yZSAoZWxlbWVudCkge1xyXG4gIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuICBlbGVtZW50LmJlZm9yZSh0aGlzKVxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRBZnRlciAoZWxlbWVudCkge1xyXG4gIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuICBlbGVtZW50LmFmdGVyKHRoaXMpXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKCdEb20nLCB7XHJcbiAgc2libGluZ3MsXHJcbiAgcG9zaXRpb24sXHJcbiAgbmV4dCxcclxuICBwcmV2LFxyXG4gIGZvcndhcmQsXHJcbiAgYmFja3dhcmQsXHJcbiAgZnJvbnQsXHJcbiAgYmFjayxcclxuICBiZWZvcmUsXHJcbiAgYWZ0ZXIsXHJcbiAgaW5zZXJ0QmVmb3JlLFxyXG4gIGluc2VydEFmdGVyXHJcbn0pXHJcbiIsIi8vIFBhcnNlIHVuaXQgdmFsdWVcclxuZXhwb3J0IGNvbnN0IG51bWJlckFuZFVuaXQgPSAvXihbKy1dPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8pKFthLXolXSopJC9pXHJcblxyXG4vLyBQYXJzZSBoZXggdmFsdWVcclxuZXhwb3J0IGNvbnN0IGhleCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2lcclxuXHJcbi8vIFBhcnNlIHJnYiB2YWx1ZVxyXG5leHBvcnQgY29uc3QgcmdiID0gL3JnYlxcKChcXGQrKSwoXFxkKyksKFxcZCspXFwpL1xyXG5cclxuLy8gUGFyc2UgcmVmZXJlbmNlIGlkXHJcbmV4cG9ydCBjb25zdCByZWZlcmVuY2UgPSAvKCNbYS16X11bYS16MC05XFwtX10qKS9pXHJcblxyXG4vLyBzcGxpdHMgYSB0cmFuc2Zvcm1hdGlvbiBjaGFpblxyXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtcyA9IC9cXClcXHMqLD9cXHMqL1xyXG5cclxuLy8gV2hpdGVzcGFjZVxyXG5leHBvcnQgY29uc3Qgd2hpdGVzcGFjZSA9IC9cXHMvZ1xyXG5cclxuLy8gVGVzdCBoZXggdmFsdWVcclxuZXhwb3J0IGNvbnN0IGlzSGV4ID0gL14jW2EtZjAtOV17M30kfF4jW2EtZjAtOV17Nn0kL2lcclxuXHJcbi8vIFRlc3QgcmdiIHZhbHVlXHJcbmV4cG9ydCBjb25zdCBpc1JnYiA9IC9ecmdiXFwoL1xyXG5cclxuLy8gVGVzdCBmb3IgYmxhbmsgc3RyaW5nXHJcbmV4cG9ydCBjb25zdCBpc0JsYW5rID0gL14oXFxzKyk/JC9cclxuXHJcbi8vIFRlc3QgZm9yIG51bWVyaWMgc3RyaW5nXHJcbmV4cG9ydCBjb25zdCBpc051bWJlciA9IC9eWystXT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pXHJcblxyXG4vLyBUZXN0IGZvciBpbWFnZSB1cmxcclxuZXhwb3J0IGNvbnN0IGlzSW1hZ2UgPSAvXFwuKGpwZ3xqcGVnfHBuZ3xnaWZ8c3ZnKShcXD9bXj1dKy4qKT8vaVxyXG5cclxuLy8gc3BsaXQgYXQgd2hpdGVzcGFjZSBhbmQgY29tbWFcclxuZXhwb3J0IGNvbnN0IGRlbGltaXRlciA9IC9bXFxzLF0rL1xyXG5cclxuLy8gVGVzdCBmb3IgcGF0aCBsZXR0ZXJcclxuZXhwb3J0IGNvbnN0IGlzUGF0aExldHRlciA9IC9bTUxIVkNTUVRBWl0vaVxyXG4iLCJpbXBvcnQgeyBkZWxpbWl0ZXIgfSBmcm9tICcuLi9jb3JlL3JlZ2V4LmpzJ1xyXG5pbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi8uLi91dGlscy9tZXRob2RzLmpzJ1xyXG5cclxuLy8gUmV0dXJuIGFycmF5IG9mIGNsYXNzZXMgb24gdGhlIG5vZGVcclxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzZXMgKCkge1xyXG4gIGNvbnN0IGF0dHIgPSB0aGlzLmF0dHIoJ2NsYXNzJylcclxuICByZXR1cm4gYXR0ciA9PSBudWxsID8gW10gOiBhdHRyLnRyaW0oKS5zcGxpdChkZWxpbWl0ZXIpXHJcbn1cclxuXHJcbi8vIFJldHVybiB0cnVlIGlmIGNsYXNzIGV4aXN0cyBvbiB0aGUgbm9kZSwgZmFsc2Ugb3RoZXJ3aXNlXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNDbGFzcyAobmFtZSkge1xyXG4gIHJldHVybiB0aGlzLmNsYXNzZXMoKS5pbmRleE9mKG5hbWUpICE9PSAtMVxyXG59XHJcblxyXG4vLyBBZGQgY2xhc3MgdG8gdGhlIG5vZGVcclxuZXhwb3J0IGZ1bmN0aW9uIGFkZENsYXNzIChuYW1lKSB7XHJcbiAgaWYgKCF0aGlzLmhhc0NsYXNzKG5hbWUpKSB7XHJcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuY2xhc3NlcygpXHJcbiAgICBhcnJheS5wdXNoKG5hbWUpXHJcbiAgICB0aGlzLmF0dHIoJ2NsYXNzJywgYXJyYXkuam9pbignICcpKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gUmVtb3ZlIGNsYXNzIGZyb20gdGhlIG5vZGVcclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUNsYXNzIChuYW1lKSB7XHJcbiAgaWYgKHRoaXMuaGFzQ2xhc3MobmFtZSkpIHtcclxuICAgIHRoaXMuYXR0cignY2xhc3MnLCB0aGlzLmNsYXNzZXMoKS5maWx0ZXIoZnVuY3Rpb24gKGMpIHtcclxuICAgICAgcmV0dXJuIGMgIT09IG5hbWVcclxuICAgIH0pLmpvaW4oJyAnKSlcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vIFRvZ2dsZSB0aGUgcHJlc2VuY2Ugb2YgYSBjbGFzcyBvbiB0aGUgbm9kZVxyXG5leHBvcnQgZnVuY3Rpb24gdG9nZ2xlQ2xhc3MgKG5hbWUpIHtcclxuICByZXR1cm4gdGhpcy5oYXNDbGFzcyhuYW1lKSA/IHRoaXMucmVtb3ZlQ2xhc3MobmFtZSkgOiB0aGlzLmFkZENsYXNzKG5hbWUpXHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcygnRG9tJywge1xyXG4gIGNsYXNzZXMsIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHRvZ2dsZUNsYXNzXHJcbn0pXHJcbiIsImltcG9ydCB7IGNhbWVsQ2FzZSB9IGZyb20gJy4uLy4uL3V0aWxzL3V0aWxzLmpzJ1xyXG5pbXBvcnQgeyBpc0JsYW5rIH0gZnJvbSAnLi4vY29yZS9yZWdleC5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuXHJcbi8vIER5bmFtaWMgc3R5bGUgZ2VuZXJhdG9yXHJcbmV4cG9ydCBmdW5jdGlvbiBjc3MgKHN0eWxlLCB2YWwpIHtcclxuICBjb25zdCByZXQgPSB7fVxyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAvLyBnZXQgZnVsbCBzdHlsZSBhcyBvYmplY3RcclxuICAgIHRoaXMubm9kZS5zdHlsZS5jc3NUZXh0LnNwbGl0KC9cXHMqO1xccyovKVxyXG4gICAgICAuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xyXG4gICAgICAgIHJldHVybiAhIWVsLmxlbmd0aFxyXG4gICAgICB9KVxyXG4gICAgICAuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICBjb25zdCB0ID0gZWwuc3BsaXQoL1xccyo6XFxzKi8pXHJcbiAgICAgICAgcmV0W3RbMF1dID0gdFsxXVxyXG4gICAgICB9KVxyXG4gICAgcmV0dXJuIHJldFxyXG4gIH1cclxuXHJcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XHJcbiAgICAvLyBnZXQgc3R5bGUgcHJvcGVydGllcyBhcyBhcnJheVxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3R5bGUpKSB7XHJcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBzdHlsZSkge1xyXG4gICAgICAgIGNvbnN0IGNhc2VkID0gY2FtZWxDYXNlKG5hbWUpXHJcbiAgICAgICAgcmV0W2Nhc2VkXSA9IHRoaXMubm9kZS5zdHlsZVtjYXNlZF1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmV0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2V0IHN0eWxlIGZvciBwcm9wZXJ0eVxyXG4gICAgaWYgKHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcmV0dXJuIHRoaXMubm9kZS5zdHlsZVtjYW1lbENhc2Uoc3R5bGUpXVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBzdHlsZXMgaW4gb2JqZWN0XHJcbiAgICBpZiAodHlwZW9mIHN0eWxlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgaW4gc3R5bGUpIHtcclxuICAgICAgICAvLyBzZXQgZW1wdHkgc3RyaW5nIGlmIG51bGwvdW5kZWZpbmVkLycnIHdhcyBnaXZlblxyXG4gICAgICAgIHRoaXMubm9kZS5zdHlsZVtjYW1lbENhc2UobmFtZSldXHJcbiAgICAgICAgICA9IChzdHlsZVtuYW1lXSA9PSBudWxsIHx8IGlzQmxhbmsudGVzdChzdHlsZVtuYW1lXSkpID8gJycgOiBzdHlsZVtuYW1lXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBzZXQgc3R5bGUgZm9yIHByb3BlcnR5XHJcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgIHRoaXMubm9kZS5zdHlsZVtjYW1lbENhc2Uoc3R5bGUpXVxyXG4gICAgICA9ICh2YWwgPT0gbnVsbCB8fCBpc0JsYW5rLnRlc3QodmFsKSkgPyAnJyA6IHZhbFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gU2hvdyBlbGVtZW50XHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93ICgpIHtcclxuICByZXR1cm4gdGhpcy5jc3MoJ2Rpc3BsYXknLCAnJylcclxufVxyXG5cclxuLy8gSGlkZSBlbGVtZW50XHJcbmV4cG9ydCBmdW5jdGlvbiBoaWRlICgpIHtcclxuICByZXR1cm4gdGhpcy5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpXHJcbn1cclxuXHJcbi8vIElzIGVsZW1lbnQgdmlzaWJsZT9cclxuZXhwb3J0IGZ1bmN0aW9uIHZpc2libGUgKCkge1xyXG4gIHJldHVybiB0aGlzLmNzcygnZGlzcGxheScpICE9PSAnbm9uZSdcclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKCdEb20nLCB7XHJcbiAgY3NzLCBzaG93LCBoaWRlLCB2aXNpYmxlXHJcbn0pXHJcbiIsImltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uLy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCB7IGZpbHRlciwgbWFwIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbHMuanMnXHJcblxyXG4vLyBTdG9yZSBkYXRhIHZhbHVlcyBvbiBzdmcgbm9kZXNcclxuZXhwb3J0IGZ1bmN0aW9uIGRhdGEgKGEsIHYsIHIpIHtcclxuICBpZiAoYSA9PSBudWxsKSB7XHJcbiAgICAvLyBnZXQgYW4gb2JqZWN0IG9mIGF0dHJpYnV0ZXNcclxuICAgIHJldHVybiB0aGlzLmRhdGEobWFwKGZpbHRlcih0aGlzLm5vZGUuYXR0cmlidXRlcywgKGVsKSA9PiBlbC5ub2RlTmFtZS5pbmRleE9mKCdkYXRhLScpID09PSAwKSwgKGVsKSA9PiBlbC5ub2RlTmFtZS5zbGljZSg1KSkpXHJcbiAgfSBlbHNlIGlmIChhIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgIGNvbnN0IGRhdGEgPSB7fVxyXG4gICAgZm9yIChjb25zdCBrZXkgb2YgYSkge1xyXG4gICAgICBkYXRhW2tleV0gPSB0aGlzLmRhdGEoa2V5KVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRhdGFcclxuICB9IGVsc2UgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0Jykge1xyXG4gICAgZm9yICh2IGluIGEpIHtcclxuICAgICAgdGhpcy5kYXRhKHYsIGFbdl0pXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xyXG4gICAgdHJ5IHtcclxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5hdHRyKCdkYXRhLScgKyBhKSlcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYXR0cignZGF0YS0nICsgYSlcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5hdHRyKCdkYXRhLScgKyBhLFxyXG4gICAgICB2ID09PSBudWxsXG4gICAgICAgID8gbnVsbFxyXG4gICAgICAgIDogciA9PT0gdHJ1ZSB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHYgPT09ICdudW1iZXInXG4gICAgICAgICAgPyB2XHJcbiAgICAgICAgICA6IEpTT04uc3RyaW5naWZ5KHYpXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpc1xyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoJ0RvbScsIHsgZGF0YSB9KVxyXG4iLCJpbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi8uLi91dGlscy9tZXRob2RzLmpzJ1xyXG5cclxuLy8gUmVtZW1iZXIgYXJiaXRyYXJ5IGRhdGFcclxuZXhwb3J0IGZ1bmN0aW9uIHJlbWVtYmVyIChrLCB2KSB7XHJcbiAgLy8gcmVtZW1iZXIgZXZlcnkgaXRlbSBpbiBhbiBvYmplY3QgaW5kaXZpZHVhbGx5XHJcbiAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT09ICdvYmplY3QnKSB7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBrKSB7XHJcbiAgICAgIHRoaXMucmVtZW1iZXIoa2V5LCBrW2tleV0pXHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAvLyByZXRyaWV2ZSBtZW1vcnlcclxuICAgIHJldHVybiB0aGlzLm1lbW9yeSgpW2tdXHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIHN0b3JlIG1lbW9yeVxyXG4gICAgdGhpcy5tZW1vcnkoKVtrXSA9IHZcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vIEVyYXNlIGEgZ2l2ZW4gbWVtb3J5XHJcbmV4cG9ydCBmdW5jdGlvbiBmb3JnZXQgKCkge1xyXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICB0aGlzLl9tZW1vcnkgPSB7fVxyXG4gIH0gZWxzZSB7XHJcbiAgICBmb3IgKGxldCBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGRlbGV0ZSB0aGlzLm1lbW9yeSgpW2FyZ3VtZW50c1tpXV1cclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gVGhpcyB0cmlnZ2VycyBjcmVhdGlvbiBvZiBhIG5ldyBoaWRkZW4gY2xhc3Mgd2hpY2ggaXMgbm90IHBlcmZvcm1hbnRcclxuLy8gSG93ZXZlciwgdGhpcyBmdW5jdGlvbiBpcyBub3QgcmFyZWx5IHVzZWQgc28gaXQgd2lsbCBub3QgaGFwcGVuIGZyZXF1ZW50bHlcclxuLy8gUmV0dXJuIGxvY2FsIG1lbW9yeSBvYmplY3RcclxuZXhwb3J0IGZ1bmN0aW9uIG1lbW9yeSAoKSB7XHJcbiAgcmV0dXJuICh0aGlzLl9tZW1vcnkgPSB0aGlzLl9tZW1vcnkgfHwge30pXHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcygnRG9tJywgeyByZW1lbWJlciwgZm9yZ2V0LCBtZW1vcnkgfSlcclxuIiwiXHJcbmltcG9ydCB7IGhleCwgaXNIZXgsIGlzUmdiLCByZ2IsIHdoaXRlc3BhY2UgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvcmVnZXguanMnXHJcblxyXG5mdW5jdGlvbiBzaXhEaWdpdEhleCAoaGV4KSB7XHJcbiAgcmV0dXJuIGhleC5sZW5ndGggPT09IDRcclxuICAgID8gWyAnIycsXHJcbiAgICAgIGhleC5zdWJzdHJpbmcoMSwgMiksIGhleC5zdWJzdHJpbmcoMSwgMiksXHJcbiAgICAgIGhleC5zdWJzdHJpbmcoMiwgMyksIGhleC5zdWJzdHJpbmcoMiwgMyksXHJcbiAgICAgIGhleC5zdWJzdHJpbmcoMywgNCksIGhleC5zdWJzdHJpbmcoMywgNClcclxuICAgIF0uam9pbignJylcclxuICAgIDogaGV4XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvbXBvbmVudEhleCAoY29tcG9uZW50KSB7XHJcbiAgY29uc3QgaW50ZWdlciA9IE1hdGgucm91bmQoY29tcG9uZW50KVxyXG4gIGNvbnN0IGJvdW5kZWQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyNTUsIGludGVnZXIpKVxyXG4gIGNvbnN0IGhleCA9IGJvdW5kZWQudG9TdHJpbmcoMTYpXHJcbiAgcmV0dXJuIGhleC5sZW5ndGggPT09IDEgPyAnMCcgKyBoZXggOiBoZXhcclxufVxyXG5cclxuZnVuY3Rpb24gaXMgKG9iamVjdCwgc3BhY2UpIHtcclxuICBmb3IgKGxldCBpID0gc3BhY2UubGVuZ3RoOyBpLS07KSB7XHJcbiAgICBpZiAob2JqZWN0W3NwYWNlW2ldXSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJzIChhLCBiKSB7XHJcbiAgY29uc3QgcGFyYW1zID0gaXMoYSwgJ3JnYicpXG4gICAgPyB7IF9hOiBhLnIsIF9iOiBhLmcsIF9jOiBhLmIsIF9kOiAwLCBzcGFjZTogJ3JnYicgfVxyXG4gICAgOiBpcyhhLCAneHl6JylcbiAgICAgID8geyBfYTogYS54LCBfYjogYS55LCBfYzogYS56LCBfZDogMCwgc3BhY2U6ICd4eXonIH1cclxuICAgICAgOiBpcyhhLCAnaHNsJylcbiAgICAgICAgPyB7IF9hOiBhLmgsIF9iOiBhLnMsIF9jOiBhLmwsIF9kOiAwLCBzcGFjZTogJ2hzbCcgfVxyXG4gICAgICAgIDogaXMoYSwgJ2xhYicpXG4gICAgICAgICAgPyB7IF9hOiBhLmwsIF9iOiBhLmEsIF9jOiBhLmIsIF9kOiAwLCBzcGFjZTogJ2xhYicgfVxyXG4gICAgICAgICAgOiBpcyhhLCAnbGNoJylcbiAgICAgICAgICAgID8geyBfYTogYS5sLCBfYjogYS5jLCBfYzogYS5oLCBfZDogMCwgc3BhY2U6ICdsY2gnIH1cclxuICAgICAgICAgICAgOiBpcyhhLCAnY215aycpXG4gICAgICAgICAgICAgID8geyBfYTogYS5jLCBfYjogYS5tLCBfYzogYS55LCBfZDogYS5rLCBzcGFjZTogJ2NteWsnIH1cclxuICAgICAgICAgICAgICA6IHsgX2E6IDAsIF9iOiAwLCBfYzogMCwgc3BhY2U6ICdyZ2InIH1cclxuXHJcbiAgcGFyYW1zLnNwYWNlID0gYiB8fCBwYXJhbXMuc3BhY2VcclxuICByZXR1cm4gcGFyYW1zXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNpZVNwYWNlIChzcGFjZSkge1xyXG4gIGlmIChzcGFjZSA9PT0gJ2xhYicgfHwgc3BhY2UgPT09ICd4eXonIHx8IHNwYWNlID09PSAnbGNoJykge1xyXG4gICAgcmV0dXJuIHRydWVcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGZhbHNlXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBodWVUb1JnYiAocCwgcSwgdCkge1xyXG4gIGlmICh0IDwgMCkgdCArPSAxXHJcbiAgaWYgKHQgPiAxKSB0IC09IDFcclxuICBpZiAodCA8IDEgLyA2KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdFxyXG4gIGlmICh0IDwgMSAvIDIpIHJldHVybiBxXHJcbiAgaWYgKHQgPCAyIC8gMykgcmV0dXJuIHAgKyAocSAtIHApICogKDIgLyAzIC0gdCkgKiA2XHJcbiAgcmV0dXJuIHBcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sb3Ige1xyXG4gIGNvbnN0cnVjdG9yICguLi5pbnB1dHMpIHtcclxuICAgIHRoaXMuaW5pdCguLi5pbnB1dHMpXHJcbiAgfVxyXG5cclxuICAvLyBUZXN0IGlmIGdpdmVuIHZhbHVlIGlzIGEgY29sb3JcbiAgc3RhdGljIGlzQ29sb3IgKGNvbG9yKSB7XHJcbiAgICByZXR1cm4gY29sb3IgJiYgKFxyXG4gICAgICBjb2xvciBpbnN0YW5jZW9mIENvbG9yXHJcbiAgICAgIHx8IHRoaXMuaXNSZ2IoY29sb3IpXHJcbiAgICAgIHx8IHRoaXMudGVzdChjb2xvcilcclxuICAgIClcclxuICB9XG5cbiAgLy8gVGVzdCBpZiBnaXZlbiB2YWx1ZSBpcyBhbiByZ2Igb2JqZWN0XG4gIHN0YXRpYyBpc1JnYiAoY29sb3IpIHtcclxuICAgIHJldHVybiBjb2xvciAmJiB0eXBlb2YgY29sb3IuciA9PT0gJ251bWJlcidcclxuICAgICAgJiYgdHlwZW9mIGNvbG9yLmcgPT09ICdudW1iZXInXHJcbiAgICAgICYmIHR5cGVvZiBjb2xvci5iID09PSAnbnVtYmVyJ1xyXG4gIH1cblxuICAvKlxyXG4gIEdlbmVyYXRpbmcgcmFuZG9tIGNvbG9yc1xyXG4gICovXG4gIHN0YXRpYyByYW5kb20gKG1vZGUgPSAndmlicmFudCcsIHQsIHUpIHtcclxuXHJcbiAgICAvLyBHZXQgdGhlIG1hdGggbW9kdWxlc1xyXG4gICAgY29uc3QgeyByYW5kb20sIHJvdW5kLCBzaW4sIFBJOiBwaSB9ID0gTWF0aFxyXG5cclxuICAgIC8vIFJ1biB0aGUgY29ycmVjdCBnZW5lcmF0b3JcclxuICAgIGlmIChtb2RlID09PSAndmlicmFudCcpIHtcclxuXHJcbiAgICAgIGNvbnN0IGwgPSAoODEgLSA1NykgKiByYW5kb20oKSArIDU3XHJcbiAgICAgIGNvbnN0IGMgPSAoODMgLSA0NSkgKiByYW5kb20oKSArIDQ1XHJcbiAgICAgIGNvbnN0IGggPSAzNjAgKiByYW5kb20oKVxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihsLCBjLCBoLCAnbGNoJylcclxuICAgICAgcmV0dXJuIGNvbG9yXHJcblxyXG4gICAgfSBlbHNlIGlmIChtb2RlID09PSAnc2luZScpIHtcclxuXHJcbiAgICAgIHQgPSB0ID09IG51bGwgPyByYW5kb20oKSA6IHRcclxuICAgICAgY29uc3QgciA9IHJvdW5kKDgwICogc2luKDIgKiBwaSAqIHQgLyAwLjUgKyAwLjAxKSArIDE1MClcclxuICAgICAgY29uc3QgZyA9IHJvdW5kKDUwICogc2luKDIgKiBwaSAqIHQgLyAwLjUgKyA0LjYpICsgMjAwKVxyXG4gICAgICBjb25zdCBiID0gcm91bmQoMTAwICogc2luKDIgKiBwaSAqIHQgLyAwLjUgKyAyLjMpICsgMTUwKVxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihyLCBnLCBiKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdwYXN0ZWwnKSB7XHJcblxyXG4gICAgICBjb25zdCBsID0gKDk0IC0gODYpICogcmFuZG9tKCkgKyA4NlxyXG4gICAgICBjb25zdCBjID0gKDI2IC0gOSkgKiByYW5kb20oKSArIDlcclxuICAgICAgY29uc3QgaCA9IDM2MCAqIHJhbmRvbSgpXHJcbiAgICAgIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKGwsIGMsIGgsICdsY2gnKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdkYXJrJykge1xyXG5cclxuICAgICAgY29uc3QgbCA9IDEwICsgMTAgKiByYW5kb20oKVxyXG4gICAgICBjb25zdCBjID0gKDEyNSAtIDc1KSAqIHJhbmRvbSgpICsgODZcclxuICAgICAgY29uc3QgaCA9IDM2MCAqIHJhbmRvbSgpXHJcbiAgICAgIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKGwsIGMsIGgsICdsY2gnKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdyZ2InKSB7XHJcblxyXG4gICAgICBjb25zdCByID0gMjU1ICogcmFuZG9tKClcclxuICAgICAgY29uc3QgZyA9IDI1NSAqIHJhbmRvbSgpXHJcbiAgICAgIGNvbnN0IGIgPSAyNTUgKiByYW5kb20oKVxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihyLCBnLCBiKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9IGVsc2UgaWYgKG1vZGUgPT09ICdsYWInKSB7XHJcblxyXG4gICAgICBjb25zdCBsID0gMTAwICogcmFuZG9tKClcclxuICAgICAgY29uc3QgYSA9IDI1NiAqIHJhbmRvbSgpIC0gMTI4XHJcbiAgICAgIGNvbnN0IGIgPSAyNTYgKiByYW5kb20oKSAtIDEyOFxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihsLCBhLCBiLCAnbGFiJylcclxuICAgICAgcmV0dXJuIGNvbG9yXHJcblxyXG4gICAgfSBlbHNlIGlmIChtb2RlID09PSAnZ3JleScpIHtcclxuXHJcbiAgICAgIGNvbnN0IGdyZXkgPSAyNTUgKiByYW5kb20oKVxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihncmV5LCBncmV5LCBncmV5KVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuXHJcbiAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCByYW5kb20gY29sb3IgbW9kZScpXHJcblxyXG4gICAgfVxyXG4gIH1cblxuICAvLyBUZXN0IGlmIGdpdmVuIHZhbHVlIGlzIGEgY29sb3Igc3RyaW5nXG4gIHN0YXRpYyB0ZXN0IChjb2xvcikge1xyXG4gICAgcmV0dXJuICh0eXBlb2YgY29sb3IgPT09ICdzdHJpbmcnKVxyXG4gICAgICAmJiAoaXNIZXgudGVzdChjb2xvcikgfHwgaXNSZ2IudGVzdChjb2xvcikpXHJcbiAgfVxuXG4gIGNteWsgKCkge1xyXG5cclxuICAgIC8vIEdldCB0aGUgcmdiIHZhbHVlcyBmb3IgdGhlIGN1cnJlbnQgY29sb3JcclxuICAgIGNvbnN0IHsgX2EsIF9iLCBfYyB9ID0gdGhpcy5yZ2IoKVxyXG4gICAgY29uc3QgWyByLCBnLCBiIF0gPSBbIF9hLCBfYiwgX2MgXS5tYXAodiA9PiB2IC8gMjU1KVxyXG5cclxuICAgIC8vIEdldCB0aGUgY215ayB2YWx1ZXMgaW4gYW4gdW5ib3VuZGVkIGZvcm1hdFxyXG4gICAgY29uc3QgayA9IE1hdGgubWluKDEgLSByLCAxIC0gZywgMSAtIGIpXHJcblxyXG4gICAgaWYgKGsgPT09IDEpIHtcclxuICAgICAgLy8gQ2F0Y2ggdGhlIGJsYWNrIGNhc2VcclxuICAgICAgcmV0dXJuIG5ldyBDb2xvcigwLCAwLCAwLCAxLCAnY215aycpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYyA9ICgxIC0gciAtIGspIC8gKDEgLSBrKVxyXG4gICAgY29uc3QgbSA9ICgxIC0gZyAtIGspIC8gKDEgLSBrKVxyXG4gICAgY29uc3QgeSA9ICgxIC0gYiAtIGspIC8gKDEgLSBrKVxyXG5cclxuICAgIC8vIENvbnN0cnVjdCB0aGUgbmV3IGNvbG9yXHJcbiAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihjLCBtLCB5LCBrLCAnY215aycpXHJcbiAgICByZXR1cm4gY29sb3JcclxuICB9XG5cbiAgaHNsICgpIHtcclxuXHJcbiAgICAvLyBHZXQgdGhlIHJnYiB2YWx1ZXNcclxuICAgIGNvbnN0IHsgX2EsIF9iLCBfYyB9ID0gdGhpcy5yZ2IoKVxyXG4gICAgY29uc3QgWyByLCBnLCBiIF0gPSBbIF9hLCBfYiwgX2MgXS5tYXAodiA9PiB2IC8gMjU1KVxyXG5cclxuICAgIC8vIEZpbmQgdGhlIG1heGltdW0gYW5kIG1pbmltdW0gdmFsdWVzIHRvIGdldCB0aGUgbGlnaHRuZXNzXHJcbiAgICBjb25zdCBtYXggPSBNYXRoLm1heChyLCBnLCBiKVxyXG4gICAgY29uc3QgbWluID0gTWF0aC5taW4ociwgZywgYilcclxuICAgIGNvbnN0IGwgPSAobWF4ICsgbWluKSAvIDJcclxuXHJcbiAgICAvLyBJZiB0aGUgciwgZywgdiB2YWx1ZXMgYXJlIGlkZW50aWNhbCB0aGVuIHdlIGFyZSBncmV5XHJcbiAgICBjb25zdCBpc0dyZXkgPSBtYXggPT09IG1pblxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgaHVlIGFuZCBzYXR1cmF0aW9uXHJcbiAgICBjb25zdCBkZWx0YSA9IG1heCAtIG1pblxyXG4gICAgY29uc3QgcyA9IGlzR3JleVxuICAgICAgPyAwXHJcbiAgICAgIDogbCA+IDAuNVxuICAgICAgICA/IGRlbHRhIC8gKDIgLSBtYXggLSBtaW4pXHJcbiAgICAgICAgOiBkZWx0YSAvIChtYXggKyBtaW4pXHJcbiAgICBjb25zdCBoID0gaXNHcmV5XG4gICAgICA/IDBcclxuICAgICAgOiBtYXggPT09IHJcbiAgICAgICAgPyAoKGcgLSBiKSAvIGRlbHRhICsgKGcgPCBiID8gNiA6IDApKSAvIDZcclxuICAgICAgICA6IG1heCA9PT0gZ1xuICAgICAgICAgID8gKChiIC0gcikgLyBkZWx0YSArIDIpIC8gNlxyXG4gICAgICAgICAgOiBtYXggPT09IGJcbiAgICAgICAgICAgID8gKChyIC0gZykgLyBkZWx0YSArIDQpIC8gNlxyXG4gICAgICAgICAgICA6IDBcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3QgYW5kIHJldHVybiB0aGUgbmV3IGNvbG9yXHJcbiAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcigzNjAgKiBoLCAxMDAgKiBzLCAxMDAgKiBsLCAnaHNsJylcclxuICAgIHJldHVybiBjb2xvclxyXG4gIH1cblxuICBpbml0IChhID0gMCwgYiA9IDAsIGMgPSAwLCBkID0gMCwgc3BhY2UgPSAncmdiJykge1xyXG4gICAgLy8gVGhpcyBjYXRjaGVzIHRoZSBjYXNlIHdoZW4gYSBmYWxzeSB2YWx1ZSBpcyBwYXNzZWQgbGlrZSAnJ1xyXG4gICAgYSA9ICFhID8gMCA6IGFcclxuXHJcbiAgICAvLyBSZXNldCBhbGwgdmFsdWVzIGluIGNhc2UgdGhlIGluaXQgZnVuY3Rpb24gaXMgcmVydW4gd2l0aCBuZXcgY29sb3Igc3BhY2VcclxuICAgIGlmICh0aGlzLnNwYWNlKSB7XHJcbiAgICAgIGZvciAoY29uc3QgY29tcG9uZW50IGluIHRoaXMuc3BhY2UpIHtcclxuICAgICAgICBkZWxldGUgdGhpc1t0aGlzLnNwYWNlW2NvbXBvbmVudF1dXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGEgPT09ICdudW1iZXInKSB7XHJcbiAgICAgIC8vIEFsbG93IGZvciB0aGUgY2FzZSB0aGF0IHdlIGRvbid0IG5lZWQgZC4uLlxyXG4gICAgICBzcGFjZSA9IHR5cGVvZiBkID09PSAnc3RyaW5nJyA/IGQgOiBzcGFjZVxyXG4gICAgICBkID0gdHlwZW9mIGQgPT09ICdzdHJpbmcnID8gMCA6IGRcclxuXHJcbiAgICAgIC8vIEFzc2lnbiB0aGUgdmFsdWVzIHN0cmFpZ2h0IHRvIHRoZSBjb2xvclxyXG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgX2E6IGEsIF9iOiBiLCBfYzogYywgX2Q6IGQsIHNwYWNlIH0pXHJcbiAgICAvLyBJZiB0aGUgdXNlciBnYXZlIHVzIGFuIGFycmF5LCBtYWtlIHRoZSBjb2xvciBmcm9tIGl0XHJcbiAgICB9IGVsc2UgaWYgKGEgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICB0aGlzLnNwYWNlID0gYiB8fCAodHlwZW9mIGFbM10gPT09ICdzdHJpbmcnID8gYVszXSA6IGFbNF0pIHx8ICdyZ2InXHJcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgeyBfYTogYVswXSwgX2I6IGFbMV0sIF9jOiBhWzJdLCBfZDogYVszXSB8fCAwIH0pXHJcbiAgICB9IGVsc2UgaWYgKGEgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgLy8gU2V0IHRoZSBvYmplY3QgdXAgYW5kIGFzc2lnbiBpdHMgdmFsdWVzIGRpcmVjdGx5XHJcbiAgICAgIGNvbnN0IHZhbHVlcyA9IGdldFBhcmFtZXRlcnMoYSwgYilcclxuICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB2YWx1ZXMpXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhID09PSAnc3RyaW5nJykge1xyXG4gICAgICBpZiAoaXNSZ2IudGVzdChhKSkge1xyXG4gICAgICAgIGNvbnN0IG5vV2hpdGVzcGFjZSA9IGEucmVwbGFjZSh3aGl0ZXNwYWNlLCAnJylcclxuICAgICAgICBjb25zdCBbIF9hLCBfYiwgX2MgXSA9IHJnYi5leGVjKG5vV2hpdGVzcGFjZSlcclxuICAgICAgICAgIC5zbGljZSgxLCA0KS5tYXAodiA9PiBwYXJzZUludCh2KSlcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHsgX2EsIF9iLCBfYywgX2Q6IDAsIHNwYWNlOiAncmdiJyB9KVxyXG4gICAgICB9IGVsc2UgaWYgKGlzSGV4LnRlc3QoYSkpIHtcclxuICAgICAgICBjb25zdCBoZXhQYXJzZSA9IHYgPT4gcGFyc2VJbnQodiwgMTYpXHJcbiAgICAgICAgY29uc3QgWyAsIF9hLCBfYiwgX2MgXSA9IGhleC5leGVjKHNpeERpZ2l0SGV4KGEpKS5tYXAoaGV4UGFyc2UpXHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7IF9hLCBfYiwgX2MsIF9kOiAwLCBzcGFjZTogJ3JnYicgfSlcclxuICAgICAgfSBlbHNlIHRocm93IEVycm9yKCdVbnN1cHBvcnRlZCBzdHJpbmcgZm9ybWF0LCBjYW5cXCd0IGNvbnN0cnVjdCBDb2xvcicpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gTm93IGFkZCB0aGUgY29tcG9uZW50cyBhcyBhIGNvbnZlbmllbmNlXHJcbiAgICBjb25zdCB7IF9hLCBfYiwgX2MsIF9kIH0gPSB0aGlzXHJcbiAgICBjb25zdCBjb21wb25lbnRzID0gdGhpcy5zcGFjZSA9PT0gJ3JnYidcbiAgICAgID8geyByOiBfYSwgZzogX2IsIGI6IF9jIH1cclxuICAgICAgOiB0aGlzLnNwYWNlID09PSAneHl6J1xuICAgICAgICA/IHsgeDogX2EsIHk6IF9iLCB6OiBfYyB9XHJcbiAgICAgICAgOiB0aGlzLnNwYWNlID09PSAnaHNsJ1xuICAgICAgICAgID8geyBoOiBfYSwgczogX2IsIGw6IF9jIH1cclxuICAgICAgICAgIDogdGhpcy5zcGFjZSA9PT0gJ2xhYidcbiAgICAgICAgICAgID8geyBsOiBfYSwgYTogX2IsIGI6IF9jIH1cclxuICAgICAgICAgICAgOiB0aGlzLnNwYWNlID09PSAnbGNoJ1xuICAgICAgICAgICAgICA/IHsgbDogX2EsIGM6IF9iLCBoOiBfYyB9XHJcbiAgICAgICAgICAgICAgOiB0aGlzLnNwYWNlID09PSAnY215aydcbiAgICAgICAgICAgICAgICA/IHsgYzogX2EsIG06IF9iLCB5OiBfYywgazogX2QgfVxyXG4gICAgICAgICAgICAgICAgOiB7fVxyXG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBjb21wb25lbnRzKVxyXG4gIH1cclxuXHJcbiAgbGFiICgpIHtcclxuICAgIC8vIEdldCB0aGUgeHl6IGNvbG9yXHJcbiAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXMueHl6KClcclxuXHJcbiAgICAvLyBHZXQgdGhlIGxhYiBjb21wb25lbnRzXHJcbiAgICBjb25zdCBsID0gKDExNiAqIHkpIC0gMTZcclxuICAgIGNvbnN0IGEgPSA1MDAgKiAoeCAtIHkpXHJcbiAgICBjb25zdCBiID0gMjAwICogKHkgLSB6KVxyXG5cclxuICAgIC8vIENvbnN0cnVjdCBhbmQgcmV0dXJuIGEgbmV3IGNvbG9yXHJcbiAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihsLCBhLCBiLCAnbGFiJylcclxuICAgIHJldHVybiBjb2xvclxyXG4gIH1cblxuICBsY2ggKCkge1xyXG5cclxuICAgIC8vIEdldCB0aGUgbGFiIGNvbG9yIGRpcmVjdGx5XHJcbiAgICBjb25zdCB7IGwsIGEsIGIgfSA9IHRoaXMubGFiKClcclxuXHJcbiAgICAvLyBHZXQgdGhlIGNocm9tYXRpY2l0eSBhbmQgdGhlIGh1ZSB1c2luZyBwb2xhciBjb29yZGluYXRlc1xyXG4gICAgY29uc3QgYyA9IE1hdGguc3FydChhICoqIDIgKyBiICoqIDIpXHJcbiAgICBsZXQgaCA9IDE4MCAqIE1hdGguYXRhbjIoYiwgYSkgLyBNYXRoLlBJXHJcbiAgICBpZiAoaCA8IDApIHtcclxuICAgICAgaCAqPSAtMVxyXG4gICAgICBoID0gMzYwIC0gaFxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1ha2UgYSBuZXcgY29sb3IgYW5kIHJldHVybiBpdFxyXG4gICAgY29uc3QgY29sb3IgPSBuZXcgQ29sb3IobCwgYywgaCwgJ2xjaCcpXHJcbiAgICByZXR1cm4gY29sb3JcclxuICB9XG4gIC8qXHJcbiAgQ29udmVyc2lvbiBNZXRob2RzXHJcbiAgKi9cclxuXHJcbiAgcmdiICgpIHtcclxuICAgIGlmICh0aGlzLnNwYWNlID09PSAncmdiJykge1xyXG4gICAgICByZXR1cm4gdGhpc1xyXG4gICAgfSBlbHNlIGlmIChjaWVTcGFjZSh0aGlzLnNwYWNlKSkge1xyXG4gICAgICAvLyBDb252ZXJ0IHRvIHRoZSB4eXogY29sb3Igc3BhY2VcclxuICAgICAgbGV0IHsgeCwgeSwgeiB9ID0gdGhpc1xyXG4gICAgICBpZiAodGhpcy5zcGFjZSA9PT0gJ2xhYicgfHwgdGhpcy5zcGFjZSA9PT0gJ2xjaCcpIHtcclxuICAgICAgICAvLyBHZXQgdGhlIHZhbHVlcyBpbiB0aGUgbGFiIHNwYWNlXHJcbiAgICAgICAgbGV0IHsgbCwgYSwgYiB9ID0gdGhpc1xyXG4gICAgICAgIGlmICh0aGlzLnNwYWNlID09PSAnbGNoJykge1xyXG4gICAgICAgICAgY29uc3QgeyBjLCBoIH0gPSB0aGlzXHJcbiAgICAgICAgICBjb25zdCBkVG9SID0gTWF0aC5QSSAvIDE4MFxyXG4gICAgICAgICAgYSA9IGMgKiBNYXRoLmNvcyhkVG9SICogaClcclxuICAgICAgICAgIGIgPSBjICogTWF0aC5zaW4oZFRvUiAqIGgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVbmRvIHRoZSBub25saW5lYXIgZnVuY3Rpb25cclxuICAgICAgICBjb25zdCB5TCA9IChsICsgMTYpIC8gMTE2XHJcbiAgICAgICAgY29uc3QgeEwgPSBhIC8gNTAwICsgeUxcclxuICAgICAgICBjb25zdCB6TCA9IHlMIC0gYiAvIDIwMFxyXG5cclxuICAgICAgICAvLyBHZXQgdGhlIHh5eiB2YWx1ZXNcclxuICAgICAgICBjb25zdCBjdCA9IDE2IC8gMTE2XHJcbiAgICAgICAgY29uc3QgbXggPSAwLjAwODg1NlxyXG4gICAgICAgIGNvbnN0IG5tID0gNy43ODdcclxuICAgICAgICB4ID0gMC45NTA0NyAqICgoeEwgKiogMyA+IG14KSA/IHhMICoqIDMgOiAoeEwgLSBjdCkgLyBubSlcclxuICAgICAgICB5ID0gMS4wMDAwMCAqICgoeUwgKiogMyA+IG14KSA/IHlMICoqIDMgOiAoeUwgLSBjdCkgLyBubSlcclxuICAgICAgICB6ID0gMS4wODg4MyAqICgoekwgKiogMyA+IG14KSA/IHpMICoqIDMgOiAoekwgLSBjdCkgLyBubSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ29udmVydCB4eXogdG8gdW5ib3VuZGVkIHJnYiB2YWx1ZXNcclxuICAgICAgY29uc3QgclUgPSB4ICogMy4yNDA2ICsgeSAqIC0xLjUzNzIgKyB6ICogLTAuNDk4NlxyXG4gICAgICBjb25zdCBnVSA9IHggKiAtMC45Njg5ICsgeSAqIDEuODc1OCArIHogKiAwLjA0MTVcclxuICAgICAgY29uc3QgYlUgPSB4ICogMC4wNTU3ICsgeSAqIC0wLjIwNDAgKyB6ICogMS4wNTcwXHJcblxyXG4gICAgICAvLyBDb252ZXJ0IHRoZSB2YWx1ZXMgdG8gdHJ1ZSByZ2IgdmFsdWVzXHJcbiAgICAgIGNvbnN0IHBvdyA9IE1hdGgucG93XHJcbiAgICAgIGNvbnN0IGJkID0gMC4wMDMxMzA4XHJcbiAgICAgIGNvbnN0IHIgPSAoclUgPiBiZCkgPyAoMS4wNTUgKiBwb3coclUsIDEgLyAyLjQpIC0gMC4wNTUpIDogMTIuOTIgKiByVVxyXG4gICAgICBjb25zdCBnID0gKGdVID4gYmQpID8gKDEuMDU1ICogcG93KGdVLCAxIC8gMi40KSAtIDAuMDU1KSA6IDEyLjkyICogZ1VcclxuICAgICAgY29uc3QgYiA9IChiVSA+IGJkKSA/ICgxLjA1NSAqIHBvdyhiVSwgMSAvIDIuNCkgLSAwLjA1NSkgOiAxMi45MiAqIGJVXHJcblxyXG4gICAgICAvLyBNYWtlIGFuZCByZXR1cm4gdGhlIGNvbG9yXHJcbiAgICAgIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKDI1NSAqIHIsIDI1NSAqIGcsIDI1NSAqIGIpXHJcbiAgICAgIHJldHVybiBjb2xvclxyXG4gICAgfSBlbHNlIGlmICh0aGlzLnNwYWNlID09PSAnaHNsJykge1xyXG4gICAgICAvLyBodHRwczovL2Jncmlucy5naXRodWIuaW8vVGlueUNvbG9yL2RvY3MvdGlueWNvbG9yLmh0bWxcclxuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IGhzbCB2YWx1ZXNcclxuICAgICAgbGV0IHsgaCwgcywgbCB9ID0gdGhpc1xyXG4gICAgICBoIC89IDM2MFxyXG4gICAgICBzIC89IDEwMFxyXG4gICAgICBsIC89IDEwMFxyXG5cclxuICAgICAgLy8gSWYgd2UgYXJlIGdyZXksIHRoZW4ganVzdCBtYWtlIHRoZSBjb2xvciBkaXJlY3RseVxyXG4gICAgICBpZiAocyA9PT0gMCkge1xyXG4gICAgICAgIGwgKj0gMjU1XHJcbiAgICAgICAgY29uc3QgY29sb3IgPSBuZXcgQ29sb3IobCwgbCwgbClcclxuICAgICAgICByZXR1cm4gY29sb3JcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gVE9ETyBJIGhhdmUgbm8gaWRlYSB3aGF0IHRoaXMgZG9lcyA6RCBJZiB5b3UgZmlndXJlIGl0IG91dCwgdGVsbCBtZSFcclxuICAgICAgY29uc3QgcSA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHNcclxuICAgICAgY29uc3QgcCA9IDIgKiBsIC0gcVxyXG5cclxuICAgICAgLy8gR2V0IHRoZSByZ2IgdmFsdWVzXHJcbiAgICAgIGNvbnN0IHIgPSAyNTUgKiBodWVUb1JnYihwLCBxLCBoICsgMSAvIDMpXHJcbiAgICAgIGNvbnN0IGcgPSAyNTUgKiBodWVUb1JnYihwLCBxLCBoKVxyXG4gICAgICBjb25zdCBiID0gMjU1ICogaHVlVG9SZ2IocCwgcSwgaCAtIDEgLyAzKVxyXG5cclxuICAgICAgLy8gTWFrZSBhIG5ldyBjb2xvclxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihyLCBnLCBiKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuICAgIH0gZWxzZSBpZiAodGhpcy5zcGFjZSA9PT0gJ2NteWsnKSB7XHJcbiAgICAgIC8vIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL2ZlbGlwZXNhYmluby81MDY2MzM2XHJcbiAgICAgIC8vIEdldCB0aGUgbm9ybWFsaXNlZCBjbXlrIHZhbHVlc1xyXG4gICAgICBjb25zdCB7IGMsIG0sIHksIGsgfSA9IHRoaXNcclxuXHJcbiAgICAgIC8vIEdldCB0aGUgcmdiIHZhbHVlc1xyXG4gICAgICBjb25zdCByID0gMjU1ICogKDEgLSBNYXRoLm1pbigxLCBjICogKDEgLSBrKSArIGspKVxyXG4gICAgICBjb25zdCBnID0gMjU1ICogKDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspKVxyXG4gICAgICBjb25zdCBiID0gMjU1ICogKDEgLSBNYXRoLm1pbigxLCB5ICogKDEgLSBrKSArIGspKVxyXG5cclxuICAgICAgLy8gRm9ybSB0aGUgY29sb3IgYW5kIHJldHVybiBpdFxyXG4gICAgICBjb25zdCBjb2xvciA9IG5ldyBDb2xvcihyLCBnLCBiKVxyXG4gICAgICByZXR1cm4gY29sb3JcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcbiAgfVxyXG5cbiAgdG9BcnJheSAoKSB7XHJcbiAgICBjb25zdCB7IF9hLCBfYiwgX2MsIF9kLCBzcGFjZSB9ID0gdGhpc1xyXG4gICAgcmV0dXJuIFsgX2EsIF9iLCBfYywgX2QsIHNwYWNlIF1cclxuICB9XG5cbiAgdG9IZXggKCkge1xyXG4gICAgY29uc3QgWyByLCBnLCBiIF0gPSB0aGlzLl9jbGFtcGVkKCkubWFwKGNvbXBvbmVudEhleClcclxuICAgIHJldHVybiBgIyR7cn0ke2d9JHtifWBcclxuICB9XG5cbiAgdG9SZ2IgKCkge1xyXG4gICAgY29uc3QgWyByViwgZ1YsIGJWIF0gPSB0aGlzLl9jbGFtcGVkKClcclxuICAgIGNvbnN0IHN0cmluZyA9IGByZ2IoJHtyVn0sJHtnVn0sJHtiVn0pYFxyXG4gICAgcmV0dXJuIHN0cmluZ1xyXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b0hleCgpXHJcbiAgfVxuXG4gIHh5eiAoKSB7XHJcblxyXG4gICAgLy8gTm9ybWFsaXNlIHRoZSByZWQsIGdyZWVuIGFuZCBibHVlIHZhbHVlc1xyXG4gICAgY29uc3QgeyBfYTogcjI1NSwgX2I6IGcyNTUsIF9jOiBiMjU1IH0gPSB0aGlzLnJnYigpXHJcbiAgICBjb25zdCBbIHIsIGcsIGIgXSA9IFsgcjI1NSwgZzI1NSwgYjI1NSBdLm1hcCh2ID0+IHYgLyAyNTUpXHJcblxyXG4gICAgLy8gQ29udmVydCB0byB0aGUgbGFiIHJnYiBzcGFjZVxyXG4gICAgY29uc3QgckwgPSAociA+IDAuMDQwNDUpID8gTWF0aC5wb3coKHIgKyAwLjA1NSkgLyAxLjA1NSwgMi40KSA6IHIgLyAxMi45MlxyXG4gICAgY29uc3QgZ0wgPSAoZyA+IDAuMDQwNDUpID8gTWF0aC5wb3coKGcgKyAwLjA1NSkgLyAxLjA1NSwgMi40KSA6IGcgLyAxMi45MlxyXG4gICAgY29uc3QgYkwgPSAoYiA+IDAuMDQwNDUpID8gTWF0aC5wb3coKGIgKyAwLjA1NSkgLyAxLjA1NSwgMi40KSA6IGIgLyAxMi45MlxyXG5cclxuICAgIC8vIENvbnZlcnQgdG8gdGhlIHh5eiBjb2xvciBzcGFjZSB3aXRob3V0IGJvdW5kaW5nIHRoZSB2YWx1ZXNcclxuICAgIGNvbnN0IHhVID0gKHJMICogMC40MTI0ICsgZ0wgKiAwLjM1NzYgKyBiTCAqIDAuMTgwNSkgLyAwLjk1MDQ3XHJcbiAgICBjb25zdCB5VSA9IChyTCAqIDAuMjEyNiArIGdMICogMC43MTUyICsgYkwgKiAwLjA3MjIpIC8gMS4wMDAwMFxyXG4gICAgY29uc3QgelUgPSAockwgKiAwLjAxOTMgKyBnTCAqIDAuMTE5MiArIGJMICogMC45NTA1KSAvIDEuMDg4ODNcclxuXHJcbiAgICAvLyBHZXQgdGhlIHByb3BlciB4eXogdmFsdWVzIGJ5IGFwcGx5aW5nIHRoZSBib3VuZGluZ1xyXG4gICAgY29uc3QgeCA9ICh4VSA+IDAuMDA4ODU2KSA/IE1hdGgucG93KHhVLCAxIC8gMykgOiAoNy43ODcgKiB4VSkgKyAxNiAvIDExNlxyXG4gICAgY29uc3QgeSA9ICh5VSA+IDAuMDA4ODU2KSA/IE1hdGgucG93KHlVLCAxIC8gMykgOiAoNy43ODcgKiB5VSkgKyAxNiAvIDExNlxyXG4gICAgY29uc3QgeiA9ICh6VSA+IDAuMDA4ODU2KSA/IE1hdGgucG93KHpVLCAxIC8gMykgOiAoNy43ODcgKiB6VSkgKyAxNiAvIDExNlxyXG5cclxuICAgIC8vIE1ha2UgYW5kIHJldHVybiB0aGUgY29sb3JcclxuICAgIGNvbnN0IGNvbG9yID0gbmV3IENvbG9yKHgsIHksIHosICd4eXonKVxyXG4gICAgcmV0dXJuIGNvbG9yXHJcbiAgfVxyXG5cbiAgLypcclxuICBJbnB1dCBhbmQgT3V0cHV0IG1ldGhvZHNcclxuICAqL1xyXG5cclxuICBfY2xhbXBlZCAoKSB7XHJcbiAgICBjb25zdCB7IF9hLCBfYiwgX2MgfSA9IHRoaXMucmdiKClcclxuICAgIGNvbnN0IHsgbWF4LCBtaW4sIHJvdW5kIH0gPSBNYXRoXHJcbiAgICBjb25zdCBmb3JtYXQgPSB2ID0+IG1heCgwLCBtaW4ocm91bmQodiksIDI1NSkpXHJcbiAgICByZXR1cm4gWyBfYSwgX2IsIF9jIF0ubWFwKGZvcm1hdClcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgQ29uc3RydWN0aW5nIGNvbG9yc1xyXG4gICovXHJcblxyXG59XHJcbiIsImltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludCB7XHJcbiAgLy8gSW5pdGlhbGl6ZVxyXG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XHJcbiAgICB0aGlzLmluaXQoLi4uYXJncylcclxuICB9XHJcblxyXG4gIC8vIENsb25lIHBvaW50XG4gIGNsb25lICgpIHtcclxuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcylcclxuICB9XG5cbiAgaW5pdCAoeCwgeSkge1xyXG4gICAgY29uc3QgYmFzZSA9IHsgeDogMCwgeTogMCB9XHJcblxyXG4gICAgLy8gZW5zdXJlIHNvdXJjZSBhcyBvYmplY3RcclxuICAgIGNvbnN0IHNvdXJjZSA9IEFycmF5LmlzQXJyYXkoeClcbiAgICAgID8geyB4OiB4WzBdLCB5OiB4WzFdIH1cclxuICAgICAgOiB0eXBlb2YgeCA9PT0gJ29iamVjdCdcbiAgICAgICAgPyB7IHg6IHgueCwgeTogeC55IH1cclxuICAgICAgICA6IHsgeDogeCwgeTogeSB9XHJcblxyXG4gICAgLy8gbWVyZ2Ugc291cmNlXHJcbiAgICB0aGlzLnggPSBzb3VyY2UueCA9PSBudWxsID8gYmFzZS54IDogc291cmNlLnhcclxuICAgIHRoaXMueSA9IHNvdXJjZS55ID09IG51bGwgPyBiYXNlLnkgOiBzb3VyY2UueVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICB0b0FycmF5ICgpIHtcclxuICAgIHJldHVybiBbIHRoaXMueCwgdGhpcy55IF1cclxuICB9XG5cbiAgdHJhbnNmb3JtIChtKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLnRyYW5zZm9ybU8obSlcclxuICB9XHJcblxyXG4gIC8vIFRyYW5zZm9ybSBwb2ludCB3aXRoIG1hdHJpeFxyXG4gIHRyYW5zZm9ybU8gKG0pIHtcclxuICAgIGlmICghTWF0cml4LmlzTWF0cml4TGlrZShtKSkge1xyXG4gICAgICBtID0gbmV3IE1hdHJpeChtKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgeCwgeSB9ID0gdGhpc1xyXG5cclxuICAgIC8vIFBlcmZvcm0gdGhlIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxyXG4gICAgdGhpcy54ID0gbS5hICogeCArIG0uYyAqIHkgKyBtLmVcclxuICAgIHRoaXMueSA9IG0uYiAqIHggKyBtLmQgKiB5ICsgbS5mXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcG9pbnQgKHgsIHkpIHtcclxuICByZXR1cm4gbmV3IFBvaW50KHgsIHkpLnRyYW5zZm9ybSh0aGlzLnNjcmVlbkNUTSgpLmludmVyc2UoKSlcclxufVxyXG4iLCJpbXBvcnQgeyBkZWxpbWl0ZXIgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvcmVnZXguanMnXHJcbmltcG9ydCB7IHJhZGlhbnMgfSBmcm9tICcuLi91dGlscy91dGlscy5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXIgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi9lbGVtZW50cy9FbGVtZW50LmpzJ1xyXG5pbXBvcnQgUG9pbnQgZnJvbSAnLi9Qb2ludC5qcydcclxuXHJcbmZ1bmN0aW9uIGNsb3NlRW5vdWdoIChhLCBiLCB0aHJlc2hvbGQpIHtcclxuICByZXR1cm4gTWF0aC5hYnMoYiAtIGEpIDwgKHRocmVzaG9sZCB8fCAxZS02KVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXRyaXgge1xyXG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XHJcbiAgICB0aGlzLmluaXQoLi4uYXJncylcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmb3JtYXRUcmFuc2Zvcm1zIChvKSB7XHJcbiAgICAvLyBHZXQgYWxsIG9mIHRoZSBwYXJhbWV0ZXJzIHJlcXVpcmVkIHRvIGZvcm0gdGhlIG1hdHJpeFxyXG4gICAgY29uc3QgZmxpcEJvdGggPSBvLmZsaXAgPT09ICdib3RoJyB8fCBvLmZsaXAgPT09IHRydWVcclxuICAgIGNvbnN0IGZsaXBYID0gby5mbGlwICYmIChmbGlwQm90aCB8fCBvLmZsaXAgPT09ICd4JykgPyAtMSA6IDFcclxuICAgIGNvbnN0IGZsaXBZID0gby5mbGlwICYmIChmbGlwQm90aCB8fCBvLmZsaXAgPT09ICd5JykgPyAtMSA6IDFcclxuICAgIGNvbnN0IHNrZXdYID0gby5za2V3ICYmIG8uc2tldy5sZW5ndGhcbiAgICAgID8gby5za2V3WzBdXHJcbiAgICAgIDogaXNGaW5pdGUoby5za2V3KVxuICAgICAgICA/IG8uc2tld1xyXG4gICAgICAgIDogaXNGaW5pdGUoby5za2V3WClcbiAgICAgICAgICA/IG8uc2tld1hcclxuICAgICAgICAgIDogMFxyXG4gICAgY29uc3Qgc2tld1kgPSBvLnNrZXcgJiYgby5za2V3Lmxlbmd0aFxuICAgICAgPyBvLnNrZXdbMV1cclxuICAgICAgOiBpc0Zpbml0ZShvLnNrZXcpXG4gICAgICAgID8gby5za2V3XHJcbiAgICAgICAgOiBpc0Zpbml0ZShvLnNrZXdZKVxuICAgICAgICAgID8gby5za2V3WVxyXG4gICAgICAgICAgOiAwXHJcbiAgICBjb25zdCBzY2FsZVggPSBvLnNjYWxlICYmIG8uc2NhbGUubGVuZ3RoXG4gICAgICA/IG8uc2NhbGVbMF0gKiBmbGlwWFxyXG4gICAgICA6IGlzRmluaXRlKG8uc2NhbGUpXG4gICAgICAgID8gby5zY2FsZSAqIGZsaXBYXHJcbiAgICAgICAgOiBpc0Zpbml0ZShvLnNjYWxlWClcbiAgICAgICAgICA/IG8uc2NhbGVYICogZmxpcFhcclxuICAgICAgICAgIDogZmxpcFhcclxuICAgIGNvbnN0IHNjYWxlWSA9IG8uc2NhbGUgJiYgby5zY2FsZS5sZW5ndGhcbiAgICAgID8gby5zY2FsZVsxXSAqIGZsaXBZXHJcbiAgICAgIDogaXNGaW5pdGUoby5zY2FsZSlcbiAgICAgICAgPyBvLnNjYWxlICogZmxpcFlcclxuICAgICAgICA6IGlzRmluaXRlKG8uc2NhbGVZKVxuICAgICAgICAgID8gby5zY2FsZVkgKiBmbGlwWVxyXG4gICAgICAgICAgOiBmbGlwWVxyXG4gICAgY29uc3Qgc2hlYXIgPSBvLnNoZWFyIHx8IDBcclxuICAgIGNvbnN0IHRoZXRhID0gby5yb3RhdGUgfHwgby50aGV0YSB8fCAwXHJcbiAgICBjb25zdCBvcmlnaW4gPSBuZXcgUG9pbnQoby5vcmlnaW4gfHwgby5hcm91bmQgfHwgby5veCB8fCBvLm9yaWdpblgsIG8ub3kgfHwgby5vcmlnaW5ZKVxyXG4gICAgY29uc3Qgb3ggPSBvcmlnaW4ueFxyXG4gICAgY29uc3Qgb3kgPSBvcmlnaW4ueVxyXG4gICAgLy8gV2UgbmVlZCBQb2ludCB0byBiZSBpbnZhbGlkIGlmIG5vdGhpbmcgd2FzIHBhc3NlZCBiZWNhdXNlIHdlIGNhbm5vdCBkZWZhdWx0IHRvIDAgaGVyZS4gVGhhdHMgd2h5IE5hTlxyXG4gICAgY29uc3QgcG9zaXRpb24gPSBuZXcgUG9pbnQoby5wb3NpdGlvbiB8fCBvLnB4IHx8IG8ucG9zaXRpb25YIHx8IE5hTiwgby5weSB8fCBvLnBvc2l0aW9uWSB8fCBOYU4pXHJcbiAgICBjb25zdCBweCA9IHBvc2l0aW9uLnhcclxuICAgIGNvbnN0IHB5ID0gcG9zaXRpb24ueVxyXG4gICAgY29uc3QgdHJhbnNsYXRlID0gbmV3IFBvaW50KG8udHJhbnNsYXRlIHx8IG8udHggfHwgby50cmFuc2xhdGVYLCBvLnR5IHx8IG8udHJhbnNsYXRlWSlcclxuICAgIGNvbnN0IHR4ID0gdHJhbnNsYXRlLnhcclxuICAgIGNvbnN0IHR5ID0gdHJhbnNsYXRlLnlcclxuICAgIGNvbnN0IHJlbGF0aXZlID0gbmV3IFBvaW50KG8ucmVsYXRpdmUgfHwgby5yeCB8fCBvLnJlbGF0aXZlWCwgby5yeSB8fCBvLnJlbGF0aXZlWSlcclxuICAgIGNvbnN0IHJ4ID0gcmVsYXRpdmUueFxyXG4gICAgY29uc3QgcnkgPSByZWxhdGl2ZS55XHJcblxyXG4gICAgLy8gUG9wdWxhdGUgYWxsIG9mIHRoZSB2YWx1ZXNcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHNjYWxlWCwgc2NhbGVZLCBza2V3WCwgc2tld1ksIHNoZWFyLCB0aGV0YSwgcngsIHJ5LCB0eCwgdHksIG94LCBveSwgcHgsIHB5XHJcbiAgICB9XHJcbiAgfVxuXG4gIHN0YXRpYyBmcm9tQXJyYXkgKGEpIHtcclxuICAgIHJldHVybiB7IGE6IGFbMF0sIGI6IGFbMV0sIGM6IGFbMl0sIGQ6IGFbM10sIGU6IGFbNF0sIGY6IGFbNV0gfVxyXG4gIH1cblxuICBzdGF0aWMgaXNNYXRyaXhMaWtlIChvKSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBvLmEgIT0gbnVsbFxyXG4gICAgICB8fCBvLmIgIT0gbnVsbFxyXG4gICAgICB8fCBvLmMgIT0gbnVsbFxyXG4gICAgICB8fCBvLmQgIT0gbnVsbFxyXG4gICAgICB8fCBvLmUgIT0gbnVsbFxyXG4gICAgICB8fCBvLmYgIT0gbnVsbFxyXG4gICAgKVxyXG4gIH1cblxuICAvLyBsZWZ0IG1hdHJpeCwgcmlnaHQgbWF0cml4LCB0YXJnZXQgbWF0cml4IHdoaWNoIGlzIG92ZXJ3cml0dGVuXG4gIHN0YXRpYyBtYXRyaXhNdWx0aXBseSAobCwgciwgbykge1xyXG4gICAgLy8gV29yayBvdXQgdGhlIHByb2R1Y3QgZGlyZWN0bHlcclxuICAgIGNvbnN0IGEgPSBsLmEgKiByLmEgKyBsLmMgKiByLmJcclxuICAgIGNvbnN0IGIgPSBsLmIgKiByLmEgKyBsLmQgKiByLmJcclxuICAgIGNvbnN0IGMgPSBsLmEgKiByLmMgKyBsLmMgKiByLmRcclxuICAgIGNvbnN0IGQgPSBsLmIgKiByLmMgKyBsLmQgKiByLmRcclxuICAgIGNvbnN0IGUgPSBsLmUgKyBsLmEgKiByLmUgKyBsLmMgKiByLmZcclxuICAgIGNvbnN0IGYgPSBsLmYgKyBsLmIgKiByLmUgKyBsLmQgKiByLmZcclxuXHJcbiAgICAvLyBtYWtlIHN1cmUgdG8gdXNlIGxvY2FsIHZhcmlhYmxlcyBiZWNhdXNlIGwvciBhbmQgbyBjb3VsZCBiZSB0aGUgc2FtZVxyXG4gICAgby5hID0gYVxyXG4gICAgby5iID0gYlxyXG4gICAgby5jID0gY1xyXG4gICAgby5kID0gZFxyXG4gICAgby5lID0gZVxyXG4gICAgby5mID0gZlxyXG5cclxuICAgIHJldHVybiBvXHJcbiAgfVxuXG4gIGFyb3VuZCAoY3gsIGN5LCBtYXRyaXgpIHtcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuYXJvdW5kTyhjeCwgY3ksIG1hdHJpeClcclxuICB9XG5cbiAgLy8gVHJhbnNmb3JtIGFyb3VuZCBhIGNlbnRlciBwb2ludFxuICBhcm91bmRPIChjeCwgY3ksIG1hdHJpeCkge1xyXG4gICAgY29uc3QgZHggPSBjeCB8fCAwXHJcbiAgICBjb25zdCBkeSA9IGN5IHx8IDBcclxuICAgIHJldHVybiB0aGlzLnRyYW5zbGF0ZU8oLWR4LCAtZHkpLmxtdWx0aXBseU8obWF0cml4KS50cmFuc2xhdGVPKGR4LCBkeSlcclxuICB9XG5cbiAgLy8gQ2xvbmVzIHRoaXMgbWF0cml4XG4gIGNsb25lICgpIHtcclxuICAgIHJldHVybiBuZXcgTWF0cml4KHRoaXMpXHJcbiAgfVxuXG4gIC8vIERlY29tcG9zZXMgdGhpcyBtYXRyaXggaW50byBpdHMgYWZmaW5lIHBhcmFtZXRlcnNcbiAgZGVjb21wb3NlIChjeCA9IDAsIGN5ID0gMCkge1xyXG4gICAgLy8gR2V0IHRoZSBwYXJhbWV0ZXJzIGZyb20gdGhlIG1hdHJpeFxyXG4gICAgY29uc3QgYSA9IHRoaXMuYVxyXG4gICAgY29uc3QgYiA9IHRoaXMuYlxyXG4gICAgY29uc3QgYyA9IHRoaXMuY1xyXG4gICAgY29uc3QgZCA9IHRoaXMuZFxyXG4gICAgY29uc3QgZSA9IHRoaXMuZVxyXG4gICAgY29uc3QgZiA9IHRoaXMuZlxyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgaWYgdGhlIHdpbmRpbmcgZGlyZWN0aW9uIGlzIGNsb2Nrd2lzZSBvciBjb3VudGVyY2xvY2t3aXNlXHJcbiAgICBjb25zdCBkZXRlcm1pbmFudCA9IGEgKiBkIC0gYiAqIGNcclxuICAgIGNvbnN0IGNjdyA9IGRldGVybWluYW50ID4gMCA/IDEgOiAtMVxyXG5cclxuICAgIC8vIFNpbmNlIHdlIG9ubHkgc2hlYXIgaW4geCwgd2UgY2FuIHVzZSB0aGUgeCBiYXNpcyB0byBnZXQgdGhlIHggc2NhbGVcclxuICAgIC8vIGFuZCB0aGUgcm90YXRpb24gb2YgdGhlIHJlc3VsdGluZyBtYXRyaXhcclxuICAgIGNvbnN0IHN4ID0gY2N3ICogTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpXHJcbiAgICBjb25zdCB0aGV0YVJhZCA9IE1hdGguYXRhbjIoY2N3ICogYiwgY2N3ICogYSlcclxuICAgIGNvbnN0IHRoZXRhID0gMTgwIC8gTWF0aC5QSSAqIHRoZXRhUmFkXHJcbiAgICBjb25zdCBjdCA9IE1hdGguY29zKHRoZXRhUmFkKVxyXG4gICAgY29uc3Qgc3QgPSBNYXRoLnNpbih0aGV0YVJhZClcclxuXHJcbiAgICAvLyBXZSBjYW4gdGhlbiBzb2x2ZSB0aGUgeSBiYXNpcyB2ZWN0b3Igc2ltdWx0YW5lb3VzbHkgdG8gZ2V0IHRoZSBvdGhlclxyXG4gICAgLy8gdHdvIGFmZmluZSBwYXJhbWV0ZXJzIGRpcmVjdGx5IGZyb20gdGhlc2UgcGFyYW1ldGVyc1xyXG4gICAgY29uc3QgbGFtID0gKGEgKiBjICsgYiAqIGQpIC8gZGV0ZXJtaW5hbnRcclxuICAgIGNvbnN0IHN5ID0gKChjICogc3gpIC8gKGxhbSAqIGEgLSBiKSkgfHwgKChkICogc3gpIC8gKGxhbSAqIGIgKyBhKSlcclxuXHJcbiAgICAvLyBVc2UgdGhlIHRyYW5zbGF0aW9uc1xyXG4gICAgY29uc3QgdHggPSBlIC0gY3ggKyBjeCAqIGN0ICogc3ggKyBjeSAqIChsYW0gKiBjdCAqIHN4IC0gc3QgKiBzeSlcclxuICAgIGNvbnN0IHR5ID0gZiAtIGN5ICsgY3ggKiBzdCAqIHN4ICsgY3kgKiAobGFtICogc3QgKiBzeCArIGN0ICogc3kpXHJcblxyXG4gICAgLy8gQ29uc3RydWN0IHRoZSBkZWNvbXBvc2l0aW9uIGFuZCByZXR1cm4gaXRcclxuICAgIHJldHVybiB7XHJcbiAgICAgIC8vIFJldHVybiB0aGUgYWZmaW5lIHBhcmFtZXRlcnNcclxuICAgICAgc2NhbGVYOiBzeCxcclxuICAgICAgc2NhbGVZOiBzeSxcclxuICAgICAgc2hlYXI6IGxhbSxcclxuICAgICAgcm90YXRlOiB0aGV0YSxcclxuICAgICAgdHJhbnNsYXRlWDogdHgsXHJcbiAgICAgIHRyYW5zbGF0ZVk6IHR5LFxyXG4gICAgICBvcmlnaW5YOiBjeCxcclxuICAgICAgb3JpZ2luWTogY3ksXHJcblxyXG4gICAgICAvLyBSZXR1cm4gdGhlIG1hdHJpeCBwYXJhbWV0ZXJzXHJcbiAgICAgIGE6IHRoaXMuYSxcclxuICAgICAgYjogdGhpcy5iLFxyXG4gICAgICBjOiB0aGlzLmMsXHJcbiAgICAgIGQ6IHRoaXMuZCxcclxuICAgICAgZTogdGhpcy5lLFxyXG4gICAgICBmOiB0aGlzLmZcclxuICAgIH1cclxuICB9XG5cbiAgLy8gQ2hlY2sgaWYgdHdvIG1hdHJpY2VzIGFyZSBlcXVhbFxuICBlcXVhbHMgKG90aGVyKSB7XHJcbiAgICBpZiAob3RoZXIgPT09IHRoaXMpIHJldHVybiB0cnVlXHJcbiAgICBjb25zdCBjb21wID0gbmV3IE1hdHJpeChvdGhlcilcclxuICAgIHJldHVybiBjbG9zZUVub3VnaCh0aGlzLmEsIGNvbXAuYSkgJiYgY2xvc2VFbm91Z2godGhpcy5iLCBjb21wLmIpXHJcbiAgICAgICYmIGNsb3NlRW5vdWdoKHRoaXMuYywgY29tcC5jKSAmJiBjbG9zZUVub3VnaCh0aGlzLmQsIGNvbXAuZClcclxuICAgICAgJiYgY2xvc2VFbm91Z2godGhpcy5lLCBjb21wLmUpICYmIGNsb3NlRW5vdWdoKHRoaXMuZiwgY29tcC5mKVxyXG4gIH1cblxuICAvLyBGbGlwIG1hdHJpeCBvbiB4IG9yIHksIGF0IGEgZ2l2ZW4gb2Zmc2V0XG4gIGZsaXAgKGF4aXMsIGFyb3VuZCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5mbGlwTyhheGlzLCBhcm91bmQpXHJcbiAgfVxuXG4gIGZsaXBPIChheGlzLCBhcm91bmQpIHtcclxuICAgIHJldHVybiBheGlzID09PSAneCdcbiAgICAgID8gdGhpcy5zY2FsZU8oLTEsIDEsIGFyb3VuZCwgMClcclxuICAgICAgOiBheGlzID09PSAneSdcbiAgICAgICAgPyB0aGlzLnNjYWxlTygxLCAtMSwgMCwgYXJvdW5kKVxyXG4gICAgICAgIDogdGhpcy5zY2FsZU8oLTEsIC0xLCBheGlzLCBhcm91bmQgfHwgYXhpcykgLy8gRGVmaW5lIGFuIHgsIHkgZmxpcCBwb2ludFxyXG4gIH1cblxuICAvLyBJbml0aWFsaXplXHJcbiAgaW5pdCAoc291cmNlKSB7XHJcbiAgICBjb25zdCBiYXNlID0gTWF0cml4LmZyb21BcnJheShbIDEsIDAsIDAsIDEsIDAsIDAgXSlcclxuXHJcbiAgICAvLyBlbnN1cmUgc291cmNlIGFzIG9iamVjdFxyXG4gICAgc291cmNlID0gc291cmNlIGluc3RhbmNlb2YgRWxlbWVudFxuICAgICAgPyBzb3VyY2UubWF0cml4aWZ5KClcclxuICAgICAgOiB0eXBlb2Ygc291cmNlID09PSAnc3RyaW5nJ1xuICAgICAgICA/IE1hdHJpeC5mcm9tQXJyYXkoc291cmNlLnNwbGl0KGRlbGltaXRlcikubWFwKHBhcnNlRmxvYXQpKVxyXG4gICAgICAgIDogQXJyYXkuaXNBcnJheShzb3VyY2UpXG4gICAgICAgICAgPyBNYXRyaXguZnJvbUFycmF5KHNvdXJjZSlcclxuICAgICAgICAgIDogKHR5cGVvZiBzb3VyY2UgPT09ICdvYmplY3QnICYmIE1hdHJpeC5pc01hdHJpeExpa2Uoc291cmNlKSlcbiAgICAgICAgICAgID8gc291cmNlXHJcbiAgICAgICAgICAgIDogKHR5cGVvZiBzb3VyY2UgPT09ICdvYmplY3QnKVxuICAgICAgICAgICAgICA/IG5ldyBNYXRyaXgoKS50cmFuc2Zvcm0oc291cmNlKVxyXG4gICAgICAgICAgICAgIDogYXJndW1lbnRzLmxlbmd0aCA9PT0gNlxuICAgICAgICAgICAgICAgID8gTWF0cml4LmZyb21BcnJheShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpXHJcbiAgICAgICAgICAgICAgICA6IGJhc2VcclxuXHJcbiAgICAvLyBNZXJnZSB0aGUgc291cmNlIG1hdHJpeCB3aXRoIHRoZSBiYXNlIG1hdHJpeFxyXG4gICAgdGhpcy5hID0gc291cmNlLmEgIT0gbnVsbCA/IHNvdXJjZS5hIDogYmFzZS5hXHJcbiAgICB0aGlzLmIgPSBzb3VyY2UuYiAhPSBudWxsID8gc291cmNlLmIgOiBiYXNlLmJcclxuICAgIHRoaXMuYyA9IHNvdXJjZS5jICE9IG51bGwgPyBzb3VyY2UuYyA6IGJhc2UuY1xyXG4gICAgdGhpcy5kID0gc291cmNlLmQgIT0gbnVsbCA/IHNvdXJjZS5kIDogYmFzZS5kXHJcbiAgICB0aGlzLmUgPSBzb3VyY2UuZSAhPSBudWxsID8gc291cmNlLmUgOiBiYXNlLmVcclxuICAgIHRoaXMuZiA9IHNvdXJjZS5mICE9IG51bGwgPyBzb3VyY2UuZiA6IGJhc2UuZlxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cbiAgaW52ZXJzZSAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLmludmVyc2VPKClcclxuICB9XG5cbiAgLy8gSW52ZXJzZXMgbWF0cml4XG4gIGludmVyc2VPICgpIHtcclxuICAgIC8vIEdldCB0aGUgY3VycmVudCBwYXJhbWV0ZXJzIG91dCBvZiB0aGUgbWF0cml4XHJcbiAgICBjb25zdCBhID0gdGhpcy5hXHJcbiAgICBjb25zdCBiID0gdGhpcy5iXHJcbiAgICBjb25zdCBjID0gdGhpcy5jXHJcbiAgICBjb25zdCBkID0gdGhpcy5kXHJcbiAgICBjb25zdCBlID0gdGhpcy5lXHJcbiAgICBjb25zdCBmID0gdGhpcy5mXHJcblxyXG4gICAgLy8gSW52ZXJ0IHRoZSAyeDIgbWF0cml4IGluIHRoZSB0b3AgbGVmdFxyXG4gICAgY29uc3QgZGV0ID0gYSAqIGQgLSBiICogY1xyXG4gICAgaWYgKCFkZXQpIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGludmVydCAnICsgdGhpcylcclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgdGhlIHRvcCAyeDIgbWF0cml4XHJcbiAgICBjb25zdCBuYSA9IGQgLyBkZXRcclxuICAgIGNvbnN0IG5iID0gLWIgLyBkZXRcclxuICAgIGNvbnN0IG5jID0gLWMgLyBkZXRcclxuICAgIGNvbnN0IG5kID0gYSAvIGRldFxyXG5cclxuICAgIC8vIEFwcGx5IHRoZSBpbnZlcnRlZCBtYXRyaXggdG8gdGhlIHRvcCByaWdodFxyXG4gICAgY29uc3QgbmUgPSAtKG5hICogZSArIG5jICogZilcclxuICAgIGNvbnN0IG5mID0gLShuYiAqIGUgKyBuZCAqIGYpXHJcblxyXG4gICAgLy8gQ29uc3RydWN0IHRoZSBpbnZlcnRlZCBtYXRyaXhcclxuICAgIHRoaXMuYSA9IG5hXHJcbiAgICB0aGlzLmIgPSBuYlxyXG4gICAgdGhpcy5jID0gbmNcclxuICAgIHRoaXMuZCA9IG5kXHJcbiAgICB0aGlzLmUgPSBuZVxyXG4gICAgdGhpcy5mID0gbmZcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cblxuICBsbXVsdGlwbHkgKG1hdHJpeCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5sbXVsdGlwbHlPKG1hdHJpeClcclxuICB9XG5cbiAgbG11bHRpcGx5TyAobWF0cml4KSB7XHJcbiAgICBjb25zdCByID0gdGhpc1xyXG4gICAgY29uc3QgbCA9IG1hdHJpeCBpbnN0YW5jZW9mIE1hdHJpeFxyXG4gICAgICA/IG1hdHJpeFxyXG4gICAgICA6IG5ldyBNYXRyaXgobWF0cml4KVxyXG5cclxuICAgIHJldHVybiBNYXRyaXgubWF0cml4TXVsdGlwbHkobCwgciwgdGhpcylcclxuICB9XG5cbiAgLy8gTGVmdCBtdWx0aXBsaWVzIGJ5IHRoZSBnaXZlbiBtYXRyaXhcbiAgbXVsdGlwbHkgKG1hdHJpeCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY2xvbmUoKS5tdWx0aXBseU8obWF0cml4KVxyXG4gIH1cblxuICBtdWx0aXBseU8gKG1hdHJpeCkge1xyXG4gICAgLy8gR2V0IHRoZSBtYXRyaWNlc1xyXG4gICAgY29uc3QgbCA9IHRoaXNcclxuICAgIGNvbnN0IHIgPSBtYXRyaXggaW5zdGFuY2VvZiBNYXRyaXhcclxuICAgICAgPyBtYXRyaXhcclxuICAgICAgOiBuZXcgTWF0cml4KG1hdHJpeClcclxuXHJcbiAgICByZXR1cm4gTWF0cml4Lm1hdHJpeE11bHRpcGx5KGwsIHIsIHRoaXMpXHJcbiAgfVxuXG4gIC8vIFJvdGF0ZSBtYXRyaXhcbiAgcm90YXRlIChyLCBjeCwgY3kpIHtcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCkucm90YXRlTyhyLCBjeCwgY3kpXHJcbiAgfVxuXG4gIHJvdGF0ZU8gKHIsIGN4ID0gMCwgY3kgPSAwKSB7XHJcbiAgICAvLyBDb252ZXJ0IGRlZ3JlZXMgdG8gcmFkaWFuc1xyXG4gICAgciA9IHJhZGlhbnMocilcclxuXHJcbiAgICBjb25zdCBjb3MgPSBNYXRoLmNvcyhyKVxyXG4gICAgY29uc3Qgc2luID0gTWF0aC5zaW4ocilcclxuXHJcbiAgICBjb25zdCB7IGEsIGIsIGMsIGQsIGUsIGYgfSA9IHRoaXNcclxuXHJcbiAgICB0aGlzLmEgPSBhICogY29zIC0gYiAqIHNpblxyXG4gICAgdGhpcy5iID0gYiAqIGNvcyArIGEgKiBzaW5cclxuICAgIHRoaXMuYyA9IGMgKiBjb3MgLSBkICogc2luXHJcbiAgICB0aGlzLmQgPSBkICogY29zICsgYyAqIHNpblxyXG4gICAgdGhpcy5lID0gZSAqIGNvcyAtIGYgKiBzaW4gKyBjeSAqIHNpbiAtIGN4ICogY29zICsgY3hcclxuICAgIHRoaXMuZiA9IGYgKiBjb3MgKyBlICogc2luIC0gY3ggKiBzaW4gLSBjeSAqIGNvcyArIGN5XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XG5cbiAgLy8gU2NhbGUgbWF0cml4XG4gIHNjYWxlICh4LCB5LCBjeCwgY3kpIHtcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuc2NhbGVPKC4uLmFyZ3VtZW50cylcclxuICB9XG5cbiAgc2NhbGVPICh4LCB5ID0geCwgY3ggPSAwLCBjeSA9IDApIHtcclxuICAgIC8vIFN1cHBvcnQgdW5pZm9ybSBzY2FsaW5nXHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMykge1xyXG4gICAgICBjeSA9IGN4XHJcbiAgICAgIGN4ID0geVxyXG4gICAgICB5ID0geFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgYSwgYiwgYywgZCwgZSwgZiB9ID0gdGhpc1xyXG5cclxuICAgIHRoaXMuYSA9IGEgKiB4XHJcbiAgICB0aGlzLmIgPSBiICogeVxyXG4gICAgdGhpcy5jID0gYyAqIHhcclxuICAgIHRoaXMuZCA9IGQgKiB5XHJcbiAgICB0aGlzLmUgPSBlICogeCAtIGN4ICogeCArIGN4XHJcbiAgICB0aGlzLmYgPSBmICogeSAtIGN5ICogeSArIGN5XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XG5cbiAgLy8gU2hlYXIgbWF0cml4XG4gIHNoZWFyIChhLCBjeCwgY3kpIHtcclxuICAgIHJldHVybiB0aGlzLmNsb25lKCkuc2hlYXJPKGEsIGN4LCBjeSlcclxuICB9XG5cbiAgc2hlYXJPIChseCwgY3ggPSAwLCBjeSA9IDApIHtcclxuICAgIGNvbnN0IHsgYSwgYiwgYywgZCwgZSwgZiB9ID0gdGhpc1xyXG5cclxuICAgIHRoaXMuYSA9IGEgKyBiICogbHhcclxuICAgIHRoaXMuYyA9IGMgKyBkICogbHhcclxuICAgIHRoaXMuZSA9IGUgKyBmICogbHggLSBjeSAqIGx4XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XG5cbiAgLy8gU2tldyBNYXRyaXhcbiAgc2tldyAoeCwgeSwgY3gsIGN5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLnNrZXdPKC4uLmFyZ3VtZW50cylcclxuICB9XG5cbiAgc2tld08gKHgsIHkgPSB4LCBjeCA9IDAsIGN5ID0gMCkge1xyXG4gICAgLy8gc3VwcG9ydCB1bmlmb3JtYWwgc2tld1xyXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcclxuICAgICAgY3kgPSBjeFxyXG4gICAgICBjeCA9IHlcclxuICAgICAgeSA9IHhcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb252ZXJ0IGRlZ3JlZXMgdG8gcmFkaWFuc1xyXG4gICAgeCA9IHJhZGlhbnMoeClcclxuICAgIHkgPSByYWRpYW5zKHkpXHJcblxyXG4gICAgY29uc3QgbHggPSBNYXRoLnRhbih4KVxyXG4gICAgY29uc3QgbHkgPSBNYXRoLnRhbih5KVxyXG5cclxuICAgIGNvbnN0IHsgYSwgYiwgYywgZCwgZSwgZiB9ID0gdGhpc1xyXG5cclxuICAgIHRoaXMuYSA9IGEgKyBiICogbHhcclxuICAgIHRoaXMuYiA9IGIgKyBhICogbHlcclxuICAgIHRoaXMuYyA9IGMgKyBkICogbHhcclxuICAgIHRoaXMuZCA9IGQgKyBjICogbHlcclxuICAgIHRoaXMuZSA9IGUgKyBmICogbHggLSBjeSAqIGx4XHJcbiAgICB0aGlzLmYgPSBmICsgZSAqIGx5IC0gY3ggKiBseVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxuXG4gIC8vIFNrZXdYXG4gIHNrZXdYICh4LCBjeCwgY3kpIHtcclxuICAgIHJldHVybiB0aGlzLnNrZXcoeCwgMCwgY3gsIGN5KVxyXG4gIH1cblxuICAvLyBTa2V3WVxuICBza2V3WSAoeSwgY3gsIGN5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5za2V3KDAsIHksIGN4LCBjeSlcclxuICB9XG5cbiAgdG9BcnJheSAoKSB7XHJcbiAgICByZXR1cm4gWyB0aGlzLmEsIHRoaXMuYiwgdGhpcy5jLCB0aGlzLmQsIHRoaXMuZSwgdGhpcy5mIF1cclxuICB9XG5cbiAgLy8gQ29udmVydCBtYXRyaXggdG8gc3RyaW5nXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAnbWF0cml4KCcgKyB0aGlzLmEgKyAnLCcgKyB0aGlzLmIgKyAnLCcgKyB0aGlzLmMgKyAnLCcgKyB0aGlzLmQgKyAnLCcgKyB0aGlzLmUgKyAnLCcgKyB0aGlzLmYgKyAnKSdcclxuICB9XG5cbiAgLy8gVHJhbnNmb3JtIGEgbWF0cml4IGludG8gYW5vdGhlciBtYXRyaXggYnkgbWFuaXB1bGF0aW5nIHRoZSBzcGFjZVxyXG4gIHRyYW5zZm9ybSAobykge1xyXG4gICAgLy8gQ2hlY2sgaWYgbyBpcyBhIG1hdHJpeCBhbmQgdGhlbiBsZWZ0IG11bHRpcGx5IGl0IGRpcmVjdGx5XHJcbiAgICBpZiAoTWF0cml4LmlzTWF0cml4TGlrZShvKSkge1xyXG4gICAgICBjb25zdCBtYXRyaXggPSBuZXcgTWF0cml4KG8pXHJcbiAgICAgIHJldHVybiBtYXRyaXgubXVsdGlwbHlPKHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gR2V0IHRoZSBwcm9wb3NlZCB0cmFuc2Zvcm1hdGlvbnMgYW5kIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgY29uc3QgdCA9IE1hdHJpeC5mb3JtYXRUcmFuc2Zvcm1zKG8pXHJcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpc1xyXG4gICAgY29uc3QgeyB4OiBveCwgeTogb3kgfSA9IG5ldyBQb2ludCh0Lm94LCB0Lm95KS50cmFuc2Zvcm0oY3VycmVudClcclxuXHJcbiAgICAvLyBDb25zdHJ1Y3QgdGhlIHJlc3VsdGluZyBtYXRyaXhcclxuICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IE1hdHJpeCgpXHJcbiAgICAgIC50cmFuc2xhdGVPKHQucngsIHQucnkpXHJcbiAgICAgIC5sbXVsdGlwbHlPKGN1cnJlbnQpXHJcbiAgICAgIC50cmFuc2xhdGVPKC1veCwgLW95KVxyXG4gICAgICAuc2NhbGVPKHQuc2NhbGVYLCB0LnNjYWxlWSlcclxuICAgICAgLnNrZXdPKHQuc2tld1gsIHQuc2tld1kpXHJcbiAgICAgIC5zaGVhck8odC5zaGVhcilcclxuICAgICAgLnJvdGF0ZU8odC50aGV0YSlcclxuICAgICAgLnRyYW5zbGF0ZU8ob3gsIG95KVxyXG5cclxuICAgIC8vIElmIHdlIHdhbnQgdGhlIG9yaWdpbiBhdCBhIHBhcnRpY3VsYXIgcGxhY2UsIHdlIGZvcmNlIGl0IHRoZXJlXHJcbiAgICBpZiAoaXNGaW5pdGUodC5weCkgfHwgaXNGaW5pdGUodC5weSkpIHtcclxuICAgICAgY29uc3Qgb3JpZ2luID0gbmV3IFBvaW50KG94LCBveSkudHJhbnNmb3JtKHRyYW5zZm9ybWVyKVxyXG4gICAgICAvLyBUT0RPOiBSZXBsYWNlIHQucHggd2l0aCBpc0Zpbml0ZSh0LnB4KVxyXG4gICAgICAvLyBEb2VzbnQgd29yayBiZWNhdXNlIHQucHggaXMgYWxzbyAwIGlmIGl0IHdhc250IHBhc3NlZFxyXG4gICAgICBjb25zdCBkeCA9IGlzRmluaXRlKHQucHgpID8gdC5weCAtIG9yaWdpbi54IDogMFxyXG4gICAgICBjb25zdCBkeSA9IGlzRmluaXRlKHQucHkpID8gdC5weSAtIG9yaWdpbi55IDogMFxyXG4gICAgICB0cmFuc2Zvcm1lci50cmFuc2xhdGVPKGR4LCBkeSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBUcmFuc2xhdGUgbm93IGFmdGVyIHBvc2l0aW9uaW5nXHJcbiAgICB0cmFuc2Zvcm1lci50cmFuc2xhdGVPKHQudHgsIHQudHkpXHJcbiAgICByZXR1cm4gdHJhbnNmb3JtZXJcclxuICB9XHJcblxuICAvLyBUcmFuc2xhdGUgbWF0cml4XHJcbiAgdHJhbnNsYXRlICh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLnRyYW5zbGF0ZU8oeCwgeSlcclxuICB9XHJcblxuICB0cmFuc2xhdGVPICh4LCB5KSB7XHJcbiAgICB0aGlzLmUgKz0geCB8fCAwXHJcbiAgICB0aGlzLmYgKz0geSB8fCAwXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXG4gIHZhbHVlT2YgKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgYTogdGhpcy5hLFxyXG4gICAgICBiOiB0aGlzLmIsXHJcbiAgICAgIGM6IHRoaXMuYyxcclxuICAgICAgZDogdGhpcy5kLFxyXG4gICAgICBlOiB0aGlzLmUsXHJcbiAgICAgIGY6IHRoaXMuZlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjdG0gKCkge1xyXG4gIHJldHVybiBuZXcgTWF0cml4KHRoaXMubm9kZS5nZXRDVE0oKSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNjcmVlbkNUTSAoKSB7XHJcbiAgLyogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM0NDUzN1xyXG4gICAgIFRoaXMgaXMgbmVlZGVkIGJlY2F1c2UgRkYgZG9lcyBub3QgcmV0dXJuIHRoZSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXhcclxuICAgICBmb3IgdGhlIGlubmVyIGNvb3JkaW5hdGUgc3lzdGVtIHdoZW4gZ2V0U2NyZWVuQ1RNKCkgaXMgY2FsbGVkIG9uIG5lc3RlZCBzdmdzLlxyXG4gICAgIEhvd2V2ZXIgYWxsIG90aGVyIEJyb3dzZXJzIGRvIHRoYXQgKi9cclxuICBpZiAodHlwZW9mIHRoaXMuaXNSb290ID09PSAnZnVuY3Rpb24nICYmICF0aGlzLmlzUm9vdCgpKSB7XHJcbiAgICBjb25zdCByZWN0ID0gdGhpcy5yZWN0KDEsIDEpXHJcbiAgICBjb25zdCBtID0gcmVjdC5ub2RlLmdldFNjcmVlbkNUTSgpXHJcbiAgICByZWN0LnJlbW92ZSgpXHJcbiAgICByZXR1cm4gbmV3IE1hdHJpeChtKVxyXG4gIH1cclxuICByZXR1cm4gbmV3IE1hdHJpeCh0aGlzLm5vZGUuZ2V0U2NyZWVuQ1RNKCkpXHJcbn1cclxuXHJcbnJlZ2lzdGVyKE1hdHJpeCwgJ01hdHJpeCcpXHJcbiIsImltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi8uLi91dGlscy93aW5kb3cuanMnXHJcbmltcG9ydCB7IG1ha2VJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZXIgKCkge1xyXG4gIC8vIFJldXNlIGNhY2hlZCBlbGVtZW50IGlmIHBvc3NpYmxlXHJcbiAgaWYgKCFwYXJzZXIubm9kZXMpIHtcclxuICAgIGNvbnN0IHN2ZyA9IG1ha2VJbnN0YW5jZSgpLnNpemUoMiwgMClcclxuICAgIHN2Zy5ub2RlLnN0eWxlLmNzc1RleHQgPSBbXHJcbiAgICAgICdvcGFjaXR5OiAwJyxcclxuICAgICAgJ3Bvc2l0aW9uOiBhYnNvbHV0ZScsXHJcbiAgICAgICdsZWZ0OiAtMTAwJScsXHJcbiAgICAgICd0b3A6IC0xMDAlJyxcclxuICAgICAgJ292ZXJmbG93OiBoaWRkZW4nXHJcbiAgICBdLmpvaW4oJzsnKVxyXG5cclxuICAgIHN2Zy5hdHRyKCdmb2N1c2FibGUnLCAnZmFsc2UnKVxyXG4gICAgc3ZnLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxyXG5cclxuICAgIGNvbnN0IHBhdGggPSBzdmcucGF0aCgpLm5vZGVcclxuXHJcbiAgICBwYXJzZXIubm9kZXMgPSB7IHN2ZywgcGF0aCB9XHJcbiAgfVxyXG5cclxuICBpZiAoIXBhcnNlci5ub2Rlcy5zdmcubm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICBjb25zdCBiID0gZ2xvYmFscy5kb2N1bWVudC5ib2R5IHx8IGdsb2JhbHMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XHJcbiAgICBwYXJzZXIubm9kZXMuc3ZnLmFkZFRvKGIpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyc2VyLm5vZGVzXHJcbn1cclxuIiwiaW1wb3J0IHsgZGVsaW1pdGVyIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3JlZ2V4LmpzJ1xyXG5pbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi4vdXRpbHMvd2luZG93LmpzJ1xyXG5pbXBvcnQgeyByZWdpc3RlciB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnXHJcbmltcG9ydCBQb2ludCBmcm9tICcuL1BvaW50LmpzJ1xyXG5pbXBvcnQgcGFyc2VyIGZyb20gJy4uL21vZHVsZXMvY29yZS9wYXJzZXIuanMnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNOdWxsZWRCb3ggKGJveCkge1xyXG4gIHJldHVybiAhYm94LndpZHRoICYmICFib3guaGVpZ2h0ICYmICFib3gueCAmJiAhYm94LnlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGRvbUNvbnRhaW5zIChub2RlKSB7XHJcbiAgcmV0dXJuIG5vZGUgPT09IGdsb2JhbHMuZG9jdW1lbnRcclxuICAgIHx8IChnbG9iYWxzLmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jb250YWlucyB8fCBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAvLyBUaGlzIGlzIElFIC0gaXQgZG9lcyBub3Qgc3VwcG9ydCBjb250YWlucygpIGZvciB0b3AtbGV2ZWwgU1ZHc1xyXG4gICAgICB3aGlsZSAobm9kZS5wYXJlbnROb2RlKSB7XHJcbiAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBub2RlID09PSBnbG9iYWxzLmRvY3VtZW50XHJcbiAgICB9KS5jYWxsKGdsb2JhbHMuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCBub2RlKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCb3gge1xyXG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XHJcbiAgICB0aGlzLmluaXQoLi4uYXJncylcclxuICB9XHJcblxyXG4gIGFkZE9mZnNldCAoKSB7XHJcbiAgICAvLyBvZmZzZXQgYnkgd2luZG93IHNjcm9sbCBwb3NpdGlvbiwgYmVjYXVzZSBnZXRCb3VuZGluZ0NsaWVudFJlY3QgY2hhbmdlcyB3aGVuIHdpbmRvdyBpcyBzY3JvbGxlZFxyXG4gICAgdGhpcy54ICs9IGdsb2JhbHMud2luZG93LnBhZ2VYT2Zmc2V0XHJcbiAgICB0aGlzLnkgKz0gZ2xvYmFscy53aW5kb3cucGFnZVlPZmZzZXRcclxuICAgIHJldHVybiBuZXcgQm94KHRoaXMpXHJcbiAgfVxyXG5cclxuICBpbml0IChzb3VyY2UpIHtcclxuICAgIGNvbnN0IGJhc2UgPSBbIDAsIDAsIDAsIDAgXVxyXG4gICAgc291cmNlID0gdHlwZW9mIHNvdXJjZSA9PT0gJ3N0cmluZydcbiAgICAgID8gc291cmNlLnNwbGl0KGRlbGltaXRlcikubWFwKHBhcnNlRmxvYXQpXHJcbiAgICAgIDogQXJyYXkuaXNBcnJheShzb3VyY2UpXG4gICAgICAgID8gc291cmNlXHJcbiAgICAgICAgOiB0eXBlb2Ygc291cmNlID09PSAnb2JqZWN0J1xuICAgICAgICAgID8gWyBzb3VyY2UubGVmdCAhPSBudWxsXG4gICAgICAgICAgICA/IHNvdXJjZS5sZWZ0XHJcbiAgICAgICAgICAgIDogc291cmNlLngsIHNvdXJjZS50b3AgIT0gbnVsbCA/IHNvdXJjZS50b3AgOiBzb3VyY2UueSwgc291cmNlLndpZHRoLCBzb3VyY2UuaGVpZ2h0IF1cclxuICAgICAgICAgIDogYXJndW1lbnRzLmxlbmd0aCA9PT0gNFxuICAgICAgICAgICAgPyBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcclxuICAgICAgICAgICAgOiBiYXNlXHJcblxyXG4gICAgdGhpcy54ID0gc291cmNlWzBdIHx8IDBcclxuICAgIHRoaXMueSA9IHNvdXJjZVsxXSB8fCAwXHJcbiAgICB0aGlzLndpZHRoID0gdGhpcy53ID0gc291cmNlWzJdIHx8IDBcclxuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5oID0gc291cmNlWzNdIHx8IDBcclxuXHJcbiAgICAvLyBBZGQgbW9yZSBib3VuZGluZyBib3ggcHJvcGVydGllc1xyXG4gICAgdGhpcy54MiA9IHRoaXMueCArIHRoaXMud1xyXG4gICAgdGhpcy55MiA9IHRoaXMueSArIHRoaXMuaFxyXG4gICAgdGhpcy5jeCA9IHRoaXMueCArIHRoaXMudyAvIDJcclxuICAgIHRoaXMuY3kgPSB0aGlzLnkgKyB0aGlzLmggLyAyXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGlzTnVsbGVkICgpIHtcclxuICAgIHJldHVybiBpc051bGxlZEJveCh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLy8gTWVyZ2UgcmVjdCBib3ggd2l0aCBhbm90aGVyLCByZXR1cm4gYSBuZXcgaW5zdGFuY2VcclxuICBtZXJnZSAoYm94KSB7XHJcbiAgICBjb25zdCB4ID0gTWF0aC5taW4odGhpcy54LCBib3gueClcclxuICAgIGNvbnN0IHkgPSBNYXRoLm1pbih0aGlzLnksIGJveC55KVxyXG4gICAgY29uc3Qgd2lkdGggPSBNYXRoLm1heCh0aGlzLnggKyB0aGlzLndpZHRoLCBib3gueCArIGJveC53aWR0aCkgLSB4XHJcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heCh0aGlzLnkgKyB0aGlzLmhlaWdodCwgYm94LnkgKyBib3guaGVpZ2h0KSAtIHlcclxuXHJcbiAgICByZXR1cm4gbmV3IEJveCh4LCB5LCB3aWR0aCwgaGVpZ2h0KVxyXG4gIH1cclxuXHJcbiAgdG9BcnJheSAoKSB7XHJcbiAgICByZXR1cm4gWyB0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgXVxyXG4gIH1cclxuXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMueCArICcgJyArIHRoaXMueSArICcgJyArIHRoaXMud2lkdGggKyAnICcgKyB0aGlzLmhlaWdodFxyXG4gIH1cclxuXHJcbiAgdHJhbnNmb3JtIChtKSB7XHJcbiAgICBpZiAoIShtIGluc3RhbmNlb2YgTWF0cml4KSkge1xyXG4gICAgICBtID0gbmV3IE1hdHJpeChtKVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB4TWluID0gSW5maW5pdHlcclxuICAgIGxldCB4TWF4ID0gLUluZmluaXR5XHJcbiAgICBsZXQgeU1pbiA9IEluZmluaXR5XHJcbiAgICBsZXQgeU1heCA9IC1JbmZpbml0eVxyXG5cclxuICAgIGNvbnN0IHB0cyA9IFtcclxuICAgICAgbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KSxcclxuICAgICAgbmV3IFBvaW50KHRoaXMueDIsIHRoaXMueSksXHJcbiAgICAgIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueTIpLFxyXG4gICAgICBuZXcgUG9pbnQodGhpcy54MiwgdGhpcy55MilcclxuICAgIF1cclxuXHJcbiAgICBwdHMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xyXG4gICAgICBwID0gcC50cmFuc2Zvcm0obSlcclxuICAgICAgeE1pbiA9IE1hdGgubWluKHhNaW4sIHAueClcclxuICAgICAgeE1heCA9IE1hdGgubWF4KHhNYXgsIHAueClcclxuICAgICAgeU1pbiA9IE1hdGgubWluKHlNaW4sIHAueSlcclxuICAgICAgeU1heCA9IE1hdGgubWF4KHlNYXgsIHAueSlcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIG5ldyBCb3goXHJcbiAgICAgIHhNaW4sIHlNaW4sXHJcbiAgICAgIHhNYXggLSB4TWluLFxyXG4gICAgICB5TWF4IC0geU1pblxyXG4gICAgKVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEJveCAoZWwsIGdldEJCb3hGbiwgcmV0cnkpIHtcclxuICBsZXQgYm94XHJcblxyXG4gIHRyeSB7XHJcbiAgICAvLyBUcnkgdG8gZ2V0IHRoZSBib3ggd2l0aCB0aGUgcHJvdmlkZWQgZnVuY3Rpb25cclxuICAgIGJveCA9IGdldEJCb3hGbihlbC5ub2RlKVxyXG5cclxuICAgIC8vIElmIHRoZSBib3ggaXMgd29ydGhsZXNzIGFuZCBub3QgZXZlbiBpbiB0aGUgZG9tLCByZXRyeVxyXG4gICAgLy8gYnkgdGhyb3dpbmcgYW4gZXJyb3IgaGVyZS4uLlxyXG4gICAgaWYgKGlzTnVsbGVkQm94KGJveCkgJiYgIWRvbUNvbnRhaW5zKGVsLm5vZGUpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCBub3QgaW4gdGhlIGRvbScpXHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgLy8gLi4uIGFuZCBjYWxsaW5nIHRoZSByZXRyeSBoYW5kbGVyIGhlcmVcclxuICAgIGJveCA9IHJldHJ5KGVsKVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGJveFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmJveCAoKSB7XHJcbiAgLy8gRnVuY3Rpb24gdG8gZ2V0IGJib3ggaXMgZ2V0QkJveCgpXHJcbiAgY29uc3QgZ2V0QkJveCA9IChub2RlKSA9PiBub2RlLmdldEJCb3goKVxyXG5cclxuICAvLyBUYWtlIGFsbCBtZWFzdXJlcyBzbyB0aGF0IGEgc3R1cGlkIGJyb3dzZXIgcmVuZGVycyB0aGUgZWxlbWVudFxyXG4gIC8vIHNvIHdlIGNhbiBnZXQgdGhlIGJib3ggZnJvbSBpdCB3aGVuIHdlIHRyeSBhZ2FpblxyXG4gIGNvbnN0IHJldHJ5ID0gKGVsKSA9PiB7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjbG9uZSA9IGVsLmNsb25lKCkuYWRkVG8ocGFyc2VyKCkuc3ZnKS5zaG93KClcclxuICAgICAgY29uc3QgYm94ID0gY2xvbmUubm9kZS5nZXRCQm94KClcclxuICAgICAgY2xvbmUucmVtb3ZlKClcclxuICAgICAgcmV0dXJuIGJveFxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAvLyBXZSBnaXZlIHVwLi4uXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgR2V0dGluZyBiYm94IG9mIGVsZW1lbnQgXCIke2VsLm5vZGUubm9kZU5hbWV9XCIgaXMgbm90IHBvc3NpYmxlOiAke2UudG9TdHJpbmcoKX1gKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29uc3QgYm94ID0gZ2V0Qm94KHRoaXMsIGdldEJCb3gsIHJldHJ5KVxyXG4gIGNvbnN0IGJib3ggPSBuZXcgQm94KGJveClcclxuXHJcbiAgcmV0dXJuIGJib3hcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJib3ggKGVsKSB7XHJcbiAgY29uc3QgZ2V0UkJveCA9IChub2RlKSA9PiBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgY29uc3QgcmV0cnkgPSAoZWwpID0+IHtcclxuICAgIC8vIFRoZXJlIGlzIG5vIHBvaW50IGluIHRyeWluZyB0cmlja3MgaGVyZSBiZWNhdXNlIGlmIHdlIGluc2VydCB0aGUgZWxlbWVudCBpbnRvIHRoZSBkb20gb3Vyc2VsdmVzXHJcbiAgICAvLyBpdCBvYnZpb3VzbHkgd2lsbCBiZSBhdCB0aGUgd3JvbmcgcG9zaXRpb25cclxuICAgIHRocm93IG5ldyBFcnJvcihgR2V0dGluZyByYm94IG9mIGVsZW1lbnQgXCIke2VsLm5vZGUubm9kZU5hbWV9XCIgaXMgbm90IHBvc3NpYmxlYClcclxuICB9XHJcblxyXG4gIGNvbnN0IGJveCA9IGdldEJveCh0aGlzLCBnZXRSQm94LCByZXRyeSlcclxuICBjb25zdCByYm94ID0gbmV3IEJveChib3gpXHJcblxyXG4gIC8vIElmIGFuIGVsZW1lbnQgd2FzIHBhc3NlZCwgd2Ugd2FudCB0aGUgYmJveCBpbiB0aGUgY29vcmRpbmF0ZSBzeXN0ZW0gb2YgdGhhdCBlbGVtZW50XHJcbiAgaWYgKGVsKSB7XHJcbiAgICByZXR1cm4gcmJveC50cmFuc2Zvcm0oZWwuc2NyZWVuQ1RNKCkuaW52ZXJzZU8oKSlcclxuICB9XHJcblxyXG4gIC8vIEVsc2Ugd2Ugd2FudCBpdCBpbiBhYnNvbHV0ZSBzY3JlZW4gY29vcmRpbmF0ZXNcclxuICAvLyBUaGVyZWZvcmUgd2UgbmVlZCB0byBhZGQgdGhlIHNjcm9sbE9mZnNldFxyXG4gIHJldHVybiByYm94LmFkZE9mZnNldCgpXHJcbn1cclxuXHJcbi8vIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBwb2ludCBpcyBpbnNpZGUgdGhlIGJvdW5kaW5nIGJveFxyXG5leHBvcnQgZnVuY3Rpb24gaW5zaWRlICh4LCB5KSB7XHJcbiAgY29uc3QgYm94ID0gdGhpcy5iYm94KClcclxuXHJcbiAgcmV0dXJuIHggPiBib3gueFxyXG4gICAgJiYgeSA+IGJveC55XHJcbiAgICAmJiB4IDwgYm94LnggKyBib3gud2lkdGhcclxuICAgICYmIHkgPCBib3gueSArIGJveC5oZWlnaHRcclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICB2aWV3Ym94OiB7XHJcbiAgICB2aWV3Ym94ICh4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgIC8vIGFjdCBhcyBnZXR0ZXJcclxuICAgICAgaWYgKHggPT0gbnVsbCkgcmV0dXJuIG5ldyBCb3godGhpcy5hdHRyKCd2aWV3Qm94JykpXHJcblxyXG4gICAgICAvLyBhY3QgYXMgc2V0dGVyXHJcbiAgICAgIHJldHVybiB0aGlzLmF0dHIoJ3ZpZXdCb3gnLCBuZXcgQm94KHgsIHksIHdpZHRoLCBoZWlnaHQpKVxyXG4gICAgfSxcclxuXHJcbiAgICB6b29tIChsZXZlbCwgcG9pbnQpIHtcclxuICAgICAgLy8gSXRzIGJlc3QgdG8gcmVseSBvbiB0aGUgYXR0cmlidXRlcyBoZXJlIGFuZCBoZXJlIGlzIHdoeTpcclxuICAgICAgLy8gY2xpZW50WFlaOiBEb2Vzbid0IHdvcmsgb24gbm9uLXJvb3Qgc3ZncyBiZWNhdXNlIHRoZXkgZG9udCBoYXZlIGEgQ1NTQm94IChzaWxseSEpXHJcbiAgICAgIC8vIGdldEJvdW5kaW5nQ2xpZW50UmVjdDogRG9lc24ndCB3b3JrIGJlY2F1c2UgQ2hyb21lIGp1c3QgaWdub3JlcyB3aWR0aCBhbmQgaGVpZ2h0IG9mIG5lc3RlZCBzdmdzIGNvbXBsZXRlbHlcclxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICB0aGF0IG1lYW5zLCB0aGVpciBjbGllbnRSZWN0IGlzIGFsd2F5cyBhcyBiaWcgYXMgdGhlIGNvbnRlbnQuXHJcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgRnVydGhlcm1vcmUgdGhpcyBzaXplIGlzIGluY29ycmVjdCBpZiB0aGUgZWxlbWVudCBpcyBmdXJ0aGVyIHRyYW5zZm9ybWVkIGJ5IGl0cyBwYXJlbnRzXHJcbiAgICAgIC8vIGNvbXB1dGVkU3R5bGU6IE9ubHkgcmV0dXJucyBtZWFuaW5nZnVsIHZhbHVlcyBpZiBjc3Mgd2FzIHVzZWQgd2l0aCBweC4gV2UgZG9udCBnbyB0aGlzIHJvdXRlIGhlcmUhXHJcbiAgICAgIC8vIGdldEJCb3g6IHJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBvZiBpdHMgY29udGVudCAtIHRoYXQgZG9lc250IGhlbHAhXHJcbiAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuYXR0cihbICd3aWR0aCcsICdoZWlnaHQnIF0pXHJcblxyXG4gICAgICAvLyBXaWR0aCBhbmQgaGVpZ2h0IGlzIGEgc3RyaW5nIHdoZW4gYSBudW1iZXIgd2l0aCBhIHVuaXQgaXMgcHJlc2VudCB3aGljaCB3ZSBjYW4ndCB1c2VcclxuICAgICAgLy8gU28gd2UgdHJ5IGNsaWVudFhZWlxyXG4gICAgICBpZiAoKCF3aWR0aCAmJiAhaGVpZ2h0KSB8fCAodHlwZW9mIHdpZHRoID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgaGVpZ2h0ID09PSAnc3RyaW5nJykpIHtcclxuICAgICAgICB3aWR0aCA9IHRoaXMubm9kZS5jbGllbnRXaWR0aFxyXG4gICAgICAgIGhlaWdodCA9IHRoaXMubm9kZS5jbGllbnRIZWlnaHRcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gR2l2aW5nIHVwLi4uXHJcbiAgICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW1wb3NzaWJsZSB0byBnZXQgYWJzb2x1dGUgd2lkdGggYW5kIGhlaWdodC4gUGxlYXNlIHByb3ZpZGUgYW4gYWJzb2x1dGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGUgb24gdGhlIHpvb21pbmcgZWxlbWVudCcpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHYgPSB0aGlzLnZpZXdib3goKVxyXG5cclxuICAgICAgY29uc3Qgem9vbVggPSB3aWR0aCAvIHYud2lkdGhcclxuICAgICAgY29uc3Qgem9vbVkgPSBoZWlnaHQgLyB2LmhlaWdodFxyXG4gICAgICBjb25zdCB6b29tID0gTWF0aC5taW4oem9vbVgsIHpvb21ZKVxyXG5cclxuICAgICAgaWYgKGxldmVsID09IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gem9vbVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgem9vbUFtb3VudCA9IHpvb20gLyBsZXZlbFxyXG5cclxuICAgICAgLy8gU2V0IHRoZSB6b29tQW1vdW50IHRvIHRoZSBoaWdoZXN0IHZhbHVlIHdoaWNoIGlzIHNhZmUgdG8gcHJvY2VzcyBhbmQgcmVjb3ZlciBmcm9tXHJcbiAgICAgIC8vIFRoZSAqIDEwMCBpcyBhIGJpdCBvZiB3aWdnbGUgcm9vbSBmb3IgdGhlIG1hdHJpeCB0cmFuc2Zvcm1hdGlvblxyXG4gICAgICBpZiAoem9vbUFtb3VudCA9PT0gSW5maW5pdHkpIHpvb21BbW91bnQgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAvIDEwMFxyXG5cclxuICAgICAgcG9pbnQgPSBwb2ludCB8fCBuZXcgUG9pbnQod2lkdGggLyAyIC8gem9vbVggKyB2LngsIGhlaWdodCAvIDIgLyB6b29tWSArIHYueSlcclxuXHJcbiAgICAgIGNvbnN0IGJveCA9IG5ldyBCb3godikudHJhbnNmb3JtKFxyXG4gICAgICAgIG5ldyBNYXRyaXgoeyBzY2FsZTogem9vbUFtb3VudCwgb3JpZ2luOiBwb2ludCB9KVxyXG4gICAgICApXHJcblxyXG4gICAgICByZXR1cm4gdGhpcy52aWV3Ym94KGJveClcclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3RlcihCb3gsICdCb3gnKVxyXG4iLCJpbXBvcnQgeyBleHRlbmQgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG4vLyBpbXBvcnQgeyBzdWJDbGFzc0FycmF5IH0gZnJvbSAnLi9BcnJheVBvbHlmaWxsLmpzJ1xyXG5cclxuY2xhc3MgTGlzdCBleHRlbmRzIEFycmF5IHtcclxuICBjb25zdHJ1Y3RvciAoYXJyID0gW10sIC4uLmFyZ3MpIHtcclxuICAgIHN1cGVyKGFyciwgLi4uYXJncylcclxuICAgIGlmICh0eXBlb2YgYXJyID09PSAnbnVtYmVyJykgcmV0dXJuIHRoaXNcclxuICAgIHRoaXMubGVuZ3RoID0gMFxyXG4gICAgdGhpcy5wdXNoKC4uLmFycilcclxuICB9XHJcbn1cclxuXHJcbi8qID0gc3ViQ2xhc3NBcnJheSgnTGlzdCcsIEFycmF5LCBmdW5jdGlvbiAoYXJyID0gW10pIHtcclxuICAvLyBUaGlzIGNhdGNoZXMgdGhlIGNhc2UsIHRoYXQgbmF0aXZlIG1hcCB0cmllcyB0byBjcmVhdGUgYW4gYXJyYXkgd2l0aCBuZXcgQXJyYXkoMSlcclxuICBpZiAodHlwZW9mIGFyciA9PT0gJ251bWJlcicpIHJldHVybiB0aGlzXHJcbiAgdGhpcy5sZW5ndGggPSAwXHJcbiAgdGhpcy5wdXNoKC4uLmFycilcclxufSkgKi9cclxuXHJcbmV4cG9ydCBkZWZhdWx0IExpc3RcclxuXHJcbmV4dGVuZChbIExpc3QgXSwge1xyXG4gIGVhY2ggKGZuT3JNZXRob2ROYW1lLCAuLi5hcmdzKSB7XHJcbiAgICBpZiAodHlwZW9mIGZuT3JNZXRob2ROYW1lID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm1hcCgoZWwsIGksIGFycikgPT4ge1xyXG4gICAgICAgIHJldHVybiBmbk9yTWV0aG9kTmFtZS5jYWxsKGVsLCBlbCwgaSwgYXJyKVxyXG4gICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMubWFwKGVsID0+IHtcclxuICAgICAgICByZXR1cm4gZWxbZm5Pck1ldGhvZE5hbWVdKC4uLmFyZ3MpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgdG9BcnJheSAoKSB7XHJcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcylcclxuICB9XHJcbn0pXHJcblxyXG5jb25zdCByZXNlcnZlZCA9IFsgJ3RvQXJyYXknLCAnY29uc3RydWN0b3InLCAnZWFjaCcgXVxyXG5cclxuTGlzdC5leHRlbmQgPSBmdW5jdGlvbiAobWV0aG9kcykge1xyXG4gIG1ldGhvZHMgPSBtZXRob2RzLnJlZHVjZSgob2JqLCBuYW1lKSA9PiB7XHJcbiAgICAvLyBEb24ndCBvdmVyd3JpdGUgb3duIG1ldGhvZHNcclxuICAgIGlmIChyZXNlcnZlZC5pbmNsdWRlcyhuYW1lKSkgcmV0dXJuIG9ialxyXG5cclxuICAgIC8vIERvbid0IGFkZCBwcml2YXRlIG1ldGhvZHNcclxuICAgIGlmIChuYW1lWzBdID09PSAnXycpIHJldHVybiBvYmpcclxuXHJcbiAgICAvLyBSZWxheSBldmVyeSBjYWxsIHRvIGVhY2goKVxyXG4gICAgb2JqW25hbWVdID0gZnVuY3Rpb24gKC4uLmF0dHJzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmVhY2gobmFtZSwgLi4uYXR0cnMpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfSwge30pXHJcblxyXG4gIGV4dGVuZChbIExpc3QgXSwgbWV0aG9kcylcclxufVxyXG4iLCJpbXBvcnQgeyBhZG9wdCB9IGZyb20gJy4uLy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi8uLi91dGlscy93aW5kb3cuanMnXHJcbmltcG9ydCB7IG1hcCB9IGZyb20gJy4uLy4uL3V0aWxzL3V0aWxzLmpzJ1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuLi8uLi90eXBlcy9MaXN0LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYmFzZUZpbmQgKHF1ZXJ5LCBwYXJlbnQpIHtcclxuICByZXR1cm4gbmV3IExpc3QobWFwKChwYXJlbnQgfHwgZ2xvYmFscy5kb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChxdWVyeSksIGZ1bmN0aW9uIChub2RlKSB7XHJcbiAgICByZXR1cm4gYWRvcHQobm9kZSlcclxuICB9KSlcclxufVxyXG5cclxuLy8gU2NvcGVkIGZpbmQgbWV0aG9kXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kIChxdWVyeSkge1xyXG4gIHJldHVybiBiYXNlRmluZChxdWVyeSwgdGhpcy5ub2RlKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZmluZE9uZSAocXVlcnkpIHtcclxuICByZXR1cm4gYWRvcHQodGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3IocXVlcnkpKVxyXG59XHJcbiIsImltcG9ydCB7IGRlbGltaXRlciB9IGZyb20gJy4vcmVnZXguanMnXHJcbmltcG9ydCB7IG1ha2VJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi8uLi91dGlscy93aW5kb3cuanMnXHJcblxyXG5sZXQgbGlzdGVuZXJJZCA9IDBcclxuZXhwb3J0IGNvbnN0IHdpbmRvd0V2ZW50cyA9IHt9XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXZlbnRzIChpbnN0YW5jZSkge1xyXG4gIGxldCBuID0gaW5zdGFuY2UuZ2V0RXZlbnRIb2xkZXIoKVxyXG5cclxuICAvLyBXZSBkb250IHdhbnQgdG8gc2F2ZSBldmVudHMgaW4gZ2xvYmFsIHNwYWNlXHJcbiAgaWYgKG4gPT09IGdsb2JhbHMud2luZG93KSBuID0gd2luZG93RXZlbnRzXHJcbiAgaWYgKCFuLmV2ZW50cykgbi5ldmVudHMgPSB7fVxyXG4gIHJldHVybiBuLmV2ZW50c1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXZlbnRUYXJnZXQgKGluc3RhbmNlKSB7XHJcbiAgcmV0dXJuIGluc3RhbmNlLmdldEV2ZW50VGFyZ2V0KClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyRXZlbnRzIChpbnN0YW5jZSkge1xyXG4gIGxldCBuID0gaW5zdGFuY2UuZ2V0RXZlbnRIb2xkZXIoKVxyXG4gIGlmIChuID09PSBnbG9iYWxzLndpbmRvdykgbiA9IHdpbmRvd0V2ZW50c1xyXG4gIGlmIChuLmV2ZW50cykgbi5ldmVudHMgPSB7fVxyXG59XHJcblxyXG4vLyBBZGQgZXZlbnQgYmluZGVyIGluIHRoZSBTVkcgbmFtZXNwYWNlXHJcbmV4cG9ydCBmdW5jdGlvbiBvbiAobm9kZSwgZXZlbnRzLCBsaXN0ZW5lciwgYmluZGluZywgb3B0aW9ucykge1xyXG4gIGNvbnN0IGwgPSBsaXN0ZW5lci5iaW5kKGJpbmRpbmcgfHwgbm9kZSlcclxuICBjb25zdCBpbnN0YW5jZSA9IG1ha2VJbnN0YW5jZShub2RlKVxyXG4gIGNvbnN0IGJhZyA9IGdldEV2ZW50cyhpbnN0YW5jZSlcclxuICBjb25zdCBuID0gZ2V0RXZlbnRUYXJnZXQoaW5zdGFuY2UpXHJcblxyXG4gIC8vIGV2ZW50cyBjYW4gYmUgYW4gYXJyYXkgb2YgZXZlbnRzIG9yIGEgc3RyaW5nIG9mIGV2ZW50c1xyXG4gIGV2ZW50cyA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IGV2ZW50cy5zcGxpdChkZWxpbWl0ZXIpXHJcblxyXG4gIC8vIGFkZCBpZCB0byBsaXN0ZW5lclxyXG4gIGlmICghbGlzdGVuZXIuX3N2Z2pzTGlzdGVuZXJJZCkge1xyXG4gICAgbGlzdGVuZXIuX3N2Z2pzTGlzdGVuZXJJZCA9ICsrbGlzdGVuZXJJZFxyXG4gIH1cclxuXHJcbiAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBjb25zdCBldiA9IGV2ZW50LnNwbGl0KCcuJylbMF1cclxuICAgIGNvbnN0IG5zID0gZXZlbnQuc3BsaXQoJy4nKVsxXSB8fCAnKidcclxuXHJcbiAgICAvLyBlbnN1cmUgdmFsaWQgb2JqZWN0XHJcbiAgICBiYWdbZXZdID0gYmFnW2V2XSB8fCB7fVxyXG4gICAgYmFnW2V2XVtuc10gPSBiYWdbZXZdW25zXSB8fCB7fVxyXG5cclxuICAgIC8vIHJlZmVyZW5jZSBsaXN0ZW5lclxyXG4gICAgYmFnW2V2XVtuc11bbGlzdGVuZXIuX3N2Z2pzTGlzdGVuZXJJZF0gPSBsXHJcblxyXG4gICAgLy8gYWRkIGxpc3RlbmVyXHJcbiAgICBuLmFkZEV2ZW50TGlzdGVuZXIoZXYsIGwsIG9wdGlvbnMgfHwgZmFsc2UpXHJcbiAgfSlcclxufVxyXG5cclxuLy8gQWRkIGV2ZW50IHVuYmluZGVyIGluIHRoZSBTVkcgbmFtZXNwYWNlXHJcbmV4cG9ydCBmdW5jdGlvbiBvZmYgKG5vZGUsIGV2ZW50cywgbGlzdGVuZXIsIG9wdGlvbnMpIHtcclxuICBjb25zdCBpbnN0YW5jZSA9IG1ha2VJbnN0YW5jZShub2RlKVxyXG4gIGNvbnN0IGJhZyA9IGdldEV2ZW50cyhpbnN0YW5jZSlcclxuICBjb25zdCBuID0gZ2V0RXZlbnRUYXJnZXQoaW5zdGFuY2UpXHJcblxyXG4gIC8vIGxpc3RlbmVyIGNhbiBiZSBhIGZ1bmN0aW9uIG9yIGEgbnVtYmVyXHJcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgbGlzdGVuZXIgPSBsaXN0ZW5lci5fc3ZnanNMaXN0ZW5lcklkXHJcbiAgICBpZiAoIWxpc3RlbmVyKSByZXR1cm5cclxuICB9XHJcblxyXG4gIC8vIGV2ZW50cyBjYW4gYmUgYW4gYXJyYXkgb2YgZXZlbnRzIG9yIGEgc3RyaW5nIG9yIHVuZGVmaW5lZFxyXG4gIGV2ZW50cyA9IEFycmF5LmlzQXJyYXkoZXZlbnRzKSA/IGV2ZW50cyA6IChldmVudHMgfHwgJycpLnNwbGl0KGRlbGltaXRlcilcclxuXHJcbiAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICBjb25zdCBldiA9IGV2ZW50ICYmIGV2ZW50LnNwbGl0KCcuJylbMF1cclxuICAgIGNvbnN0IG5zID0gZXZlbnQgJiYgZXZlbnQuc3BsaXQoJy4nKVsxXVxyXG4gICAgbGV0IG5hbWVzcGFjZSwgbFxyXG5cclxuICAgIGlmIChsaXN0ZW5lcikge1xyXG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXIgcmVmZXJlbmNlXHJcbiAgICAgIGlmIChiYWdbZXZdICYmIGJhZ1tldl1bbnMgfHwgJyonXSkge1xyXG4gICAgICAgIC8vIHJlbW92ZUxpc3RlbmVyXHJcbiAgICAgICAgbi5yZW1vdmVFdmVudExpc3RlbmVyKGV2LCBiYWdbZXZdW25zIHx8ICcqJ11bbGlzdGVuZXJdLCBvcHRpb25zIHx8IGZhbHNlKVxyXG5cclxuICAgICAgICBkZWxldGUgYmFnW2V2XVtucyB8fCAnKiddW2xpc3RlbmVyXVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGV2ICYmIG5zKSB7XHJcbiAgICAgIC8vIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvciBhIG5hbWVzcGFjZWQgZXZlbnRcclxuICAgICAgaWYgKGJhZ1tldl0gJiYgYmFnW2V2XVtuc10pIHtcclxuICAgICAgICBmb3IgKGwgaW4gYmFnW2V2XVtuc10pIHtcclxuICAgICAgICAgIG9mZihuLCBbIGV2LCBucyBdLmpvaW4oJy4nKSwgbClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRlbGV0ZSBiYWdbZXZdW25zXVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKG5zKSB7XHJcbiAgICAgIC8vIHJlbW92ZSBhbGwgbGlzdGVuZXJzIGZvciBhIHNwZWNpZmljIG5hbWVzcGFjZVxyXG4gICAgICBmb3IgKGV2ZW50IGluIGJhZykge1xyXG4gICAgICAgIGZvciAobmFtZXNwYWNlIGluIGJhZ1tldmVudF0pIHtcclxuICAgICAgICAgIGlmIChucyA9PT0gbmFtZXNwYWNlKSB7XHJcbiAgICAgICAgICAgIG9mZihuLCBbIGV2ZW50LCBucyBdLmpvaW4oJy4nKSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoZXYpIHtcclxuICAgICAgLy8gcmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudFxyXG4gICAgICBpZiAoYmFnW2V2XSkge1xyXG4gICAgICAgIGZvciAobmFtZXNwYWNlIGluIGJhZ1tldl0pIHtcclxuICAgICAgICAgIG9mZihuLCBbIGV2LCBuYW1lc3BhY2UgXS5qb2luKCcuJykpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkZWxldGUgYmFnW2V2XVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyByZW1vdmUgYWxsIGxpc3RlbmVycyBvbiBhIGdpdmVuIG5vZGVcclxuICAgICAgZm9yIChldmVudCBpbiBiYWcpIHtcclxuICAgICAgICBvZmYobiwgZXZlbnQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNsZWFyRXZlbnRzKGluc3RhbmNlKVxyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwYXRjaCAobm9kZSwgZXZlbnQsIGRhdGEsIG9wdGlvbnMpIHtcclxuICBjb25zdCBuID0gZ2V0RXZlbnRUYXJnZXQobm9kZSlcclxuXHJcbiAgLy8gRGlzcGF0Y2ggZXZlbnRcclxuICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBnbG9iYWxzLndpbmRvdy5FdmVudCkge1xyXG4gICAgbi5kaXNwYXRjaEV2ZW50KGV2ZW50KVxyXG4gIH0gZWxzZSB7XHJcbiAgICBldmVudCA9IG5ldyBnbG9iYWxzLndpbmRvdy5DdXN0b21FdmVudChldmVudCwgeyBkZXRhaWw6IGRhdGEsIGNhbmNlbGFibGU6IHRydWUsIC4uLm9wdGlvbnMgfSlcclxuICAgIG4uZGlzcGF0Y2hFdmVudChldmVudClcclxuICB9XHJcbiAgcmV0dXJuIGV2ZW50XHJcbn1cclxuIiwiaW1wb3J0IHsgZGlzcGF0Y2gsIG9mZiwgb24gfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvZXZlbnQuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IEJhc2UgZnJvbSAnLi9CYXNlLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRUYXJnZXQgZXh0ZW5kcyBCYXNlIHtcclxuICBhZGRFdmVudExpc3RlbmVyICgpIHt9XHJcblxyXG4gIGRpc3BhdGNoIChldmVudCwgZGF0YSwgb3B0aW9ucykge1xyXG4gICAgcmV0dXJuIGRpc3BhdGNoKHRoaXMsIGV2ZW50LCBkYXRhLCBvcHRpb25zKVxyXG4gIH1cclxuXHJcbiAgZGlzcGF0Y2hFdmVudCAoZXZlbnQpIHtcclxuICAgIGNvbnN0IGJhZyA9IHRoaXMuZ2V0RXZlbnRIb2xkZXIoKS5ldmVudHNcclxuICAgIGlmICghYmFnKSByZXR1cm4gdHJ1ZVxyXG5cclxuICAgIGNvbnN0IGV2ZW50cyA9IGJhZ1tldmVudC50eXBlXVxyXG5cclxuICAgIGZvciAoY29uc3QgaSBpbiBldmVudHMpIHtcclxuICAgICAgZm9yIChjb25zdCBqIGluIGV2ZW50c1tpXSkge1xyXG4gICAgICAgIGV2ZW50c1tpXVtqXShldmVudClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAhZXZlbnQuZGVmYXVsdFByZXZlbnRlZFxyXG4gIH1cclxuXHJcbiAgLy8gRmlyZSBnaXZlbiBldmVudFxyXG4gIGZpcmUgKGV2ZW50LCBkYXRhLCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLmRpc3BhdGNoKGV2ZW50LCBkYXRhLCBvcHRpb25zKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGdldEV2ZW50SG9sZGVyICgpIHtcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBnZXRFdmVudFRhcmdldCAoKSB7XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gVW5iaW5kIGV2ZW50IGZyb20gbGlzdGVuZXJcclxuICBvZmYgKGV2ZW50LCBsaXN0ZW5lcikge1xyXG4gICAgb2ZmKHRoaXMsIGV2ZW50LCBsaXN0ZW5lcilcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBCaW5kIGdpdmVuIGV2ZW50IHRvIGxpc3RlbmVyXHJcbiAgb24gKGV2ZW50LCBsaXN0ZW5lciwgYmluZGluZywgb3B0aW9ucykge1xyXG4gICAgb24odGhpcywgZXZlbnQsIGxpc3RlbmVyLCBiaW5kaW5nLCBvcHRpb25zKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHJlbW92ZUV2ZW50TGlzdGVuZXIgKCkge31cclxufVxyXG5cclxucmVnaXN0ZXIoRXZlbnRUYXJnZXQsICdFdmVudFRhcmdldCcpXHJcbiIsIlxyXG5leHBvcnQgZnVuY3Rpb24gbm9vcCAoKSB7fVxyXG5cclxuLy8gRGVmYXVsdCBhbmltYXRpb24gdmFsdWVzXHJcbmV4cG9ydCBjb25zdCB0aW1lbGluZSA9IHtcclxuICBkdXJhdGlvbjogNDAwLFxyXG4gIGVhc2U6ICc+JyxcclxuICBkZWxheTogMFxyXG59XHJcblxyXG4vLyBEZWZhdWx0IGF0dHJpYnV0ZSB2YWx1ZXNcclxuZXhwb3J0IGNvbnN0IGF0dHJzID0ge1xyXG5cclxuICAvLyBmaWxsIGFuZCBzdHJva2VcclxuICAnZmlsbC1vcGFjaXR5JzogMSxcclxuICAnc3Ryb2tlLW9wYWNpdHknOiAxLFxyXG4gICdzdHJva2Utd2lkdGgnOiAwLFxyXG4gICdzdHJva2UtbGluZWpvaW4nOiAnbWl0ZXInLFxyXG4gICdzdHJva2UtbGluZWNhcCc6ICdidXR0JyxcclxuICBmaWxsOiAnIzAwMDAwMCcsXHJcbiAgc3Ryb2tlOiAnIzAwMDAwMCcsXHJcbiAgb3BhY2l0eTogMSxcclxuXHJcbiAgLy8gcG9zaXRpb25cclxuICB4OiAwLFxyXG4gIHk6IDAsXHJcbiAgY3g6IDAsXHJcbiAgY3k6IDAsXHJcblxyXG4gIC8vIHNpemVcclxuICB3aWR0aDogMCxcclxuICBoZWlnaHQ6IDAsXHJcblxyXG4gIC8vIHJhZGl1c1xyXG4gIHI6IDAsXHJcbiAgcng6IDAsXHJcbiAgcnk6IDAsXHJcblxyXG4gIC8vIGdyYWRpZW50XHJcbiAgb2Zmc2V0OiAwLFxyXG4gICdzdG9wLW9wYWNpdHknOiAxLFxyXG4gICdzdG9wLWNvbG9yJzogJyMwMDAwMDAnLFxyXG5cclxuICAvLyB0ZXh0XHJcbiAgJ3RleHQtYW5jaG9yJzogJ3N0YXJ0J1xyXG59XHJcbiIsImltcG9ydCB7IGRlbGltaXRlciB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9yZWdleC5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNWR0FycmF5IGV4dGVuZHMgQXJyYXkge1xyXG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XHJcbiAgICBzdXBlciguLi5hcmdzKVxyXG4gICAgdGhpcy5pbml0KC4uLmFyZ3MpXHJcbiAgfVxyXG5cclxuICBjbG9uZSAoKSB7XHJcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcylcclxuICB9XG5cbiAgaW5pdCAoYXJyKSB7XHJcbiAgICAvLyBUaGlzIGNhdGNoZXMgdGhlIGNhc2UsIHRoYXQgbmF0aXZlIG1hcCB0cmllcyB0byBjcmVhdGUgYW4gYXJyYXkgd2l0aCBuZXcgQXJyYXkoMSlcclxuICAgIGlmICh0eXBlb2YgYXJyID09PSAnbnVtYmVyJykgcmV0dXJuIHRoaXNcclxuICAgIHRoaXMubGVuZ3RoID0gMFxyXG4gICAgdGhpcy5wdXNoKC4uLnRoaXMucGFyc2UoYXJyKSlcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBQYXJzZSB3aGl0ZXNwYWNlIHNlcGFyYXRlZCBzdHJpbmdcbiAgcGFyc2UgKGFycmF5ID0gW10pIHtcclxuICAgIC8vIElmIGFscmVhZHkgaXMgYW4gYXJyYXksIG5vIG5lZWQgdG8gcGFyc2UgaXRcclxuICAgIGlmIChhcnJheSBpbnN0YW5jZW9mIEFycmF5KSByZXR1cm4gYXJyYXlcclxuXHJcbiAgICByZXR1cm4gYXJyYXkudHJpbSgpLnNwbGl0KGRlbGltaXRlcikubWFwKHBhcnNlRmxvYXQpXHJcbiAgfVxuXG4gIHRvQXJyYXkgKCkge1xyXG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMpXHJcbiAgfVxyXG5cclxuICB0b1NldCAoKSB7XHJcbiAgICByZXR1cm4gbmV3IFNldCh0aGlzKVxyXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5qb2luKCcgJylcclxuICB9XHJcblxyXG4gIC8vIEZsYXR0ZW5zIHRoZSBhcnJheSBpZiBuZWVkZWRcclxuICB2YWx1ZU9mICgpIHtcclxuICAgIGNvbnN0IHJldCA9IFtdXHJcbiAgICByZXQucHVzaCguLi50aGlzKVxyXG4gICAgcmV0dXJuIHJldFxyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IHsgbnVtYmVyQW5kVW5pdCB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9yZWdleC5qcydcclxuXHJcbi8vIE1vZHVsZSBmb3IgdW5pdCBjb252ZXJzaW9uc1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTVkdOdW1iZXIge1xyXG4gIC8vIEluaXRpYWxpemVcclxuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xyXG4gICAgdGhpcy5pbml0KC4uLmFyZ3MpXHJcbiAgfVxyXG5cclxuICBjb252ZXJ0ICh1bml0KSB7XHJcbiAgICByZXR1cm4gbmV3IFNWR051bWJlcih0aGlzLnZhbHVlLCB1bml0KVxyXG4gIH1cclxuXHJcbiAgLy8gRGl2aWRlIG51bWJlclxyXG4gIGRpdmlkZSAobnVtYmVyKSB7XHJcbiAgICBudW1iZXIgPSBuZXcgU1ZHTnVtYmVyKG51bWJlcilcclxuICAgIHJldHVybiBuZXcgU1ZHTnVtYmVyKHRoaXMgLyBudW1iZXIsIHRoaXMudW5pdCB8fCBudW1iZXIudW5pdClcclxuICB9XHJcblxyXG4gIGluaXQgKHZhbHVlLCB1bml0KSB7XHJcbiAgICB1bml0ID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVsxXSA6IHVuaXRcclxuICAgIHZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZVswXSA6IHZhbHVlXHJcblxyXG4gICAgLy8gaW5pdGlhbGl6ZSBkZWZhdWx0c1xyXG4gICAgdGhpcy52YWx1ZSA9IDBcclxuICAgIHRoaXMudW5pdCA9IHVuaXQgfHwgJydcclxuXHJcbiAgICAvLyBwYXJzZSB2YWx1ZVxyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgLy8gZW5zdXJlIGEgdmFsaWQgbnVtZXJpYyB2YWx1ZVxyXG4gICAgICB0aGlzLnZhbHVlID0gaXNOYU4odmFsdWUpID8gMCA6ICFpc0Zpbml0ZSh2YWx1ZSkgPyAodmFsdWUgPCAwID8gLTMuNGUrMzggOiArMy40ZSszOCkgOiB2YWx1ZVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHVuaXQgPSB2YWx1ZS5tYXRjaChudW1iZXJBbmRVbml0KVxyXG5cclxuICAgICAgaWYgKHVuaXQpIHtcclxuICAgICAgICAvLyBtYWtlIHZhbHVlIG51bWVyaWNcclxuICAgICAgICB0aGlzLnZhbHVlID0gcGFyc2VGbG9hdCh1bml0WzFdKVxyXG5cclxuICAgICAgICAvLyBub3JtYWxpemVcclxuICAgICAgICBpZiAodW5pdFs1XSA9PT0gJyUnKSB7XHJcbiAgICAgICAgICB0aGlzLnZhbHVlIC89IDEwMFxyXG4gICAgICAgIH0gZWxzZSBpZiAodW5pdFs1XSA9PT0gJ3MnKSB7XHJcbiAgICAgICAgICB0aGlzLnZhbHVlICo9IDEwMDBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHN0b3JlIHVuaXRcclxuICAgICAgICB0aGlzLnVuaXQgPSB1bml0WzVdXHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIFNWR051bWJlcikge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS52YWx1ZU9mKClcclxuICAgICAgICB0aGlzLnVuaXQgPSB2YWx1ZS51bml0XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gU3VidHJhY3QgbnVtYmVyXHJcbiAgbWludXMgKG51bWJlcikge1xyXG4gICAgbnVtYmVyID0gbmV3IFNWR051bWJlcihudW1iZXIpXHJcbiAgICByZXR1cm4gbmV3IFNWR051bWJlcih0aGlzIC0gbnVtYmVyLCB0aGlzLnVuaXQgfHwgbnVtYmVyLnVuaXQpXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgbnVtYmVyXHJcbiAgcGx1cyAobnVtYmVyKSB7XHJcbiAgICBudW1iZXIgPSBuZXcgU1ZHTnVtYmVyKG51bWJlcilcclxuICAgIHJldHVybiBuZXcgU1ZHTnVtYmVyKHRoaXMgKyBudW1iZXIsIHRoaXMudW5pdCB8fCBudW1iZXIudW5pdClcclxuICB9XHJcblxyXG4gIC8vIE11bHRpcGx5IG51bWJlclxyXG4gIHRpbWVzIChudW1iZXIpIHtcclxuICAgIG51bWJlciA9IG5ldyBTVkdOdW1iZXIobnVtYmVyKVxyXG4gICAgcmV0dXJuIG5ldyBTVkdOdW1iZXIodGhpcyAqIG51bWJlciwgdGhpcy51bml0IHx8IG51bWJlci51bml0KVxyXG4gIH1cclxuXHJcbiAgdG9BcnJheSAoKSB7XHJcbiAgICByZXR1cm4gWyB0aGlzLnZhbHVlLCB0aGlzLnVuaXQgXVxyXG4gIH1cclxuXHJcbiAgdG9KU09OICgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKClcclxuICB9XHJcblxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAodGhpcy51bml0ID09PSAnJSdcbiAgICAgID8gfn4odGhpcy52YWx1ZSAqIDFlOCkgLyAxZTZcclxuICAgICAgOiB0aGlzLnVuaXQgPT09ICdzJ1xuICAgICAgICA/IHRoaXMudmFsdWUgLyAxZTNcclxuICAgICAgICA6IHRoaXMudmFsdWVcclxuICAgICkgKyB0aGlzLnVuaXRcclxuICB9XHJcblxyXG4gIHZhbHVlT2YgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IGF0dHJzIGFzIGRlZmF1bHRzIH0gZnJvbSAnLi9kZWZhdWx0cy5qcydcclxuaW1wb3J0IHsgaXNOdW1iZXIgfSBmcm9tICcuL3JlZ2V4LmpzJ1xyXG5pbXBvcnQgQ29sb3IgZnJvbSAnLi4vLi4vdHlwZXMvQ29sb3IuanMnXHJcbmltcG9ydCBTVkdBcnJheSBmcm9tICcuLi8uLi90eXBlcy9TVkdBcnJheS5qcydcclxuaW1wb3J0IFNWR051bWJlciBmcm9tICcuLi8uLi90eXBlcy9TVkdOdW1iZXIuanMnXHJcblxyXG5jb25zdCBob29rcyA9IFtdXHJcbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckF0dHJIb29rIChmbikge1xyXG4gIGhvb2tzLnB1c2goZm4pXHJcbn1cclxuXHJcbi8vIFNldCBzdmcgZWxlbWVudCBhdHRyaWJ1dGVcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXR0ciAoYXR0ciwgdmFsLCBucykge1xyXG4gIC8vIGFjdCBhcyBmdWxsIGdldHRlclxyXG4gIGlmIChhdHRyID09IG51bGwpIHtcclxuICAgIC8vIGdldCBhbiBvYmplY3Qgb2YgYXR0cmlidXRlc1xyXG4gICAgYXR0ciA9IHt9XHJcbiAgICB2YWwgPSB0aGlzLm5vZGUuYXR0cmlidXRlc1xyXG5cclxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB2YWwpIHtcclxuICAgICAgYXR0cltub2RlLm5vZGVOYW1lXSA9IGlzTnVtYmVyLnRlc3Qobm9kZS5ub2RlVmFsdWUpXHJcbiAgICAgICAgPyBwYXJzZUZsb2F0KG5vZGUubm9kZVZhbHVlKVxyXG4gICAgICAgIDogbm9kZS5ub2RlVmFsdWVcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYXR0clxyXG4gIH0gZWxzZSBpZiAoYXR0ciBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAvLyBsb29wIHRocm91Z2ggYXJyYXkgYW5kIGdldCBhbGwgdmFsdWVzXHJcbiAgICByZXR1cm4gYXR0ci5yZWR1Y2UoKGxhc3QsIGN1cnIpID0+IHtcclxuICAgICAgbGFzdFtjdXJyXSA9IHRoaXMuYXR0cihjdXJyKVxyXG4gICAgICByZXR1cm4gbGFzdFxyXG4gICAgfSwge30pXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgYXR0ciA9PT0gJ29iamVjdCcgJiYgYXR0ci5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XHJcbiAgICAvLyBhcHBseSBldmVyeSBhdHRyaWJ1dGUgaW5kaXZpZHVhbGx5IGlmIGFuIG9iamVjdCBpcyBwYXNzZWRcclxuICAgIGZvciAodmFsIGluIGF0dHIpIHRoaXMuYXR0cih2YWwsIGF0dHJbdmFsXSlcclxuICB9IGVsc2UgaWYgKHZhbCA9PT0gbnVsbCkge1xyXG4gICAgLy8gcmVtb3ZlIHZhbHVlXHJcbiAgICB0aGlzLm5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHIpXHJcbiAgfSBlbHNlIGlmICh2YWwgPT0gbnVsbCkge1xyXG4gICAgLy8gYWN0IGFzIGEgZ2V0dGVyIGlmIHRoZSBmaXJzdCBhbmQgb25seSBhcmd1bWVudCBpcyBub3QgYW4gb2JqZWN0XHJcbiAgICB2YWwgPSB0aGlzLm5vZGUuZ2V0QXR0cmlidXRlKGF0dHIpXHJcbiAgICByZXR1cm4gdmFsID09IG51bGxcbiAgICAgID8gZGVmYXVsdHNbYXR0cl1cclxuICAgICAgOiBpc051bWJlci50ZXN0KHZhbClcbiAgICAgICAgPyBwYXJzZUZsb2F0KHZhbClcclxuICAgICAgICA6IHZhbFxyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBMb29wIHRocm91Z2ggaG9va3MgYW5kIGV4ZWN1dGUgdGhlbSB0byBjb252ZXJ0IHZhbHVlXHJcbiAgICB2YWwgPSBob29rcy5yZWR1Y2UoKF92YWwsIGhvb2spID0+IHtcclxuICAgICAgcmV0dXJuIGhvb2soYXR0ciwgX3ZhbCwgdGhpcylcclxuICAgIH0sIHZhbClcclxuXHJcbiAgICAvLyBlbnN1cmUgY29ycmVjdCBudW1lcmljIHZhbHVlcyAoYWxzbyBhY2NlcHRzIE5hTiBhbmQgSW5maW5pdHkpXHJcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgdmFsID0gbmV3IFNWR051bWJlcih2YWwpXHJcbiAgICB9IGVsc2UgaWYgKENvbG9yLmlzQ29sb3IodmFsKSkge1xyXG4gICAgICAvLyBlbnN1cmUgZnVsbCBoZXggY29sb3JcclxuICAgICAgdmFsID0gbmV3IENvbG9yKHZhbClcclxuICAgIH0gZWxzZSBpZiAodmFsLmNvbnN0cnVjdG9yID09PSBBcnJheSkge1xyXG4gICAgICAvLyBDaGVjayBmb3IgcGxhaW4gYXJyYXlzIGFuZCBwYXJzZSBhcnJheSB2YWx1ZXNcclxuICAgICAgdmFsID0gbmV3IFNWR0FycmF5KHZhbClcclxuICAgIH1cclxuXHJcbiAgICAvLyBpZiB0aGUgcGFzc2VkIGF0dHJpYnV0ZSBpcyBsZWFkaW5nLi4uXHJcbiAgICBpZiAoYXR0ciA9PT0gJ2xlYWRpbmcnKSB7XHJcbiAgICAgIC8vIC4uLiBjYWxsIHRoZSBsZWFkaW5nIG1ldGhvZCBpbnN0ZWFkXHJcbiAgICAgIGlmICh0aGlzLmxlYWRpbmcpIHtcclxuICAgICAgICB0aGlzLmxlYWRpbmcodmFsKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBzZXQgZ2l2ZW4gYXR0cmlidXRlIG9uIG5vZGVcclxuICAgICAgdHlwZW9mIG5zID09PSAnc3RyaW5nJ1xuICAgICAgICA/IHRoaXMubm9kZS5zZXRBdHRyaWJ1dGVOUyhucywgYXR0ciwgdmFsLnRvU3RyaW5nKCkpXHJcbiAgICAgICAgOiB0aGlzLm5vZGUuc2V0QXR0cmlidXRlKGF0dHIsIHZhbC50b1N0cmluZygpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlYnVpbGQgaWYgcmVxdWlyZWRcclxuICAgIGlmICh0aGlzLnJlYnVpbGQgJiYgKGF0dHIgPT09ICdmb250LXNpemUnIHx8IGF0dHIgPT09ICd4JykpIHtcclxuICAgICAgdGhpcy5yZWJ1aWxkKClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBhZG9wdCxcclxuICBhc3NpZ25OZXdJZCxcclxuICBlaWQsXHJcbiAgZXh0ZW5kLFxyXG4gIG1ha2VJbnN0YW5jZSxcclxuICBjcmVhdGUsXHJcbiAgcmVnaXN0ZXJcclxufSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyBmaW5kLCBmaW5kT25lIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3NlbGVjdG9yLmpzJ1xyXG5pbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi4vdXRpbHMvd2luZG93LmpzJ1xyXG5pbXBvcnQgeyBtYXAgfSBmcm9tICcuLi91dGlscy91dGlscy5qcydcclxuaW1wb3J0IHsgc3ZnLCBodG1sIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL25hbWVzcGFjZXMuanMnXHJcbmltcG9ydCBFdmVudFRhcmdldCBmcm9tICcuLi90eXBlcy9FdmVudFRhcmdldC5qcydcclxuaW1wb3J0IExpc3QgZnJvbSAnLi4vdHlwZXMvTGlzdC5qcydcclxuaW1wb3J0IGF0dHIgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL2F0dHIuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEb20gZXh0ZW5kcyBFdmVudFRhcmdldCB7XHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLm5vZGUgPSBub2RlXHJcbiAgICB0aGlzLnR5cGUgPSBub2RlLm5vZGVOYW1lXHJcblxyXG4gICAgaWYgKGF0dHJzICYmIG5vZGUgIT09IGF0dHJzKSB7XHJcbiAgICAgIHRoaXMuYXR0cihhdHRycylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEFkZCBnaXZlbiBlbGVtZW50IGF0IGEgcG9zaXRpb25cclxuICBhZGQgKGVsZW1lbnQsIGkpIHtcclxuICAgIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuXHJcbiAgICAvLyBJZiBub24tcm9vdCBzdmcgbm9kZXMgYXJlIGFkZGVkIHdlIGhhdmUgdG8gcmVtb3ZlIHRoZWlyIG5hbWVzcGFjZXNcclxuICAgIGlmIChlbGVtZW50LnJlbW92ZU5hbWVzcGFjZSAmJiB0aGlzLm5vZGUgaW5zdGFuY2VvZiBnbG9iYWxzLndpbmRvdy5TVkdFbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQucmVtb3ZlTmFtZXNwYWNlKClcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaSA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMubm9kZS5hcHBlbmRDaGlsZChlbGVtZW50Lm5vZGUpXHJcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQubm9kZSAhPT0gdGhpcy5ub2RlLmNoaWxkTm9kZXNbaV0pIHtcclxuICAgICAgdGhpcy5ub2RlLmluc2VydEJlZm9yZShlbGVtZW50Lm5vZGUsIHRoaXMubm9kZS5jaGlsZE5vZGVzW2ldKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBBZGQgZWxlbWVudCB0byBnaXZlbiBjb250YWluZXIgYW5kIHJldHVybiBzZWxmXHJcbiAgYWRkVG8gKHBhcmVudCwgaSkge1xyXG4gICAgcmV0dXJuIG1ha2VJbnN0YW5jZShwYXJlbnQpLnB1dCh0aGlzLCBpKVxyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJucyBhbGwgY2hpbGQgZWxlbWVudHNcclxuICBjaGlsZHJlbiAoKSB7XHJcbiAgICByZXR1cm4gbmV3IExpc3QobWFwKHRoaXMubm9kZS5jaGlsZHJlbiwgZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgcmV0dXJuIGFkb3B0KG5vZGUpXHJcbiAgICB9KSlcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSBhbGwgZWxlbWVudHMgaW4gdGhpcyBjb250YWluZXJcclxuICBjbGVhciAoKSB7XHJcbiAgICAvLyByZW1vdmUgY2hpbGRyZW5cclxuICAgIHdoaWxlICh0aGlzLm5vZGUuaGFzQ2hpbGROb2RlcygpKSB7XHJcbiAgICAgIHRoaXMubm9kZS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUubGFzdENoaWxkKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBDbG9uZSBlbGVtZW50XHJcbiAgY2xvbmUgKGRlZXAgPSB0cnVlKSB7XHJcbiAgICAvLyB3cml0ZSBkb20gZGF0YSB0byB0aGUgZG9tIHNvIHRoZSBjbG9uZSBjYW4gcGlja3VwIHRoZSBkYXRhXHJcbiAgICB0aGlzLndyaXRlRGF0YVRvRG9tKClcclxuXHJcbiAgICAvLyBjbG9uZSBlbGVtZW50IGFuZCBhc3NpZ24gbmV3IGlkXHJcbiAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3IoYXNzaWduTmV3SWQodGhpcy5ub2RlLmNsb25lTm9kZShkZWVwKSkpXHJcbiAgfVxyXG5cclxuICAvLyBJdGVyYXRlcyBvdmVyIGFsbCBjaGlsZHJlbiBhbmQgaW52b2tlcyBhIGdpdmVuIGJsb2NrXHJcbiAgZWFjaCAoYmxvY2ssIGRlZXApIHtcclxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbigpXHJcbiAgICBsZXQgaSwgaWxcclxuXHJcbiAgICBmb3IgKGkgPSAwLCBpbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcclxuICAgICAgYmxvY2suYXBwbHkoY2hpbGRyZW5baV0sIFsgaSwgY2hpbGRyZW4gXSlcclxuXHJcbiAgICAgIGlmIChkZWVwKSB7XHJcbiAgICAgICAgY2hpbGRyZW5baV0uZWFjaChibG9jaywgZGVlcClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBlbGVtZW50IChub2RlTmFtZSwgYXR0cnMpIHtcclxuICAgIHJldHVybiB0aGlzLnB1dChuZXcgRG9tKGNyZWF0ZShub2RlTmFtZSksIGF0dHJzKSlcclxuICB9XHJcblxyXG4gIC8vIEdldCBmaXJzdCBjaGlsZFxyXG4gIGZpcnN0ICgpIHtcclxuICAgIHJldHVybiBhZG9wdCh0aGlzLm5vZGUuZmlyc3RDaGlsZClcclxuICB9XHJcblxyXG4gIC8vIEdldCBhIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGluZGV4XHJcbiAgZ2V0IChpKSB7XHJcbiAgICByZXR1cm4gYWRvcHQodGhpcy5ub2RlLmNoaWxkTm9kZXNbaV0pXHJcbiAgfVxyXG5cclxuICBnZXRFdmVudEhvbGRlciAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlXHJcbiAgfVxyXG5cclxuICBnZXRFdmVudFRhcmdldCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ub2RlXHJcbiAgfVxyXG5cclxuICAvLyBDaGVja3MgaWYgdGhlIGdpdmVuIGVsZW1lbnQgaXMgYSBjaGlsZFxyXG4gIGhhcyAoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIHRoaXMuaW5kZXgoZWxlbWVudCkgPj0gMFxyXG4gIH1cclxuXHJcbiAgaHRtbCAoaHRtbE9yRm4sIG91dGVySFRNTCkge1xyXG4gICAgcmV0dXJuIHRoaXMueG1sKGh0bWxPckZuLCBvdXRlckhUTUwsIGh0bWwpXHJcbiAgfVxyXG5cclxuICAvLyBHZXQgLyBzZXQgaWRcclxuICBpZCAoaWQpIHtcclxuICAgIC8vIGdlbmVyYXRlIG5ldyBpZCBpZiBubyBpZCBzZXRcclxuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnICYmICF0aGlzLm5vZGUuaWQpIHtcclxuICAgICAgdGhpcy5ub2RlLmlkID0gZWlkKHRoaXMudHlwZSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBkb24ndCBzZXQgZGlyZWN0bHkgd2l0aCB0aGlzLm5vZGUuaWQgdG8gbWFrZSBgbnVsbGAgd29yayBjb3JyZWN0bHlcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2lkJywgaWQpXHJcbiAgfVxyXG5cclxuICAvLyBHZXRzIGluZGV4IG9mIGdpdmVuIGVsZW1lbnRcclxuICBpbmRleCAoZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIFtdLnNsaWNlLmNhbGwodGhpcy5ub2RlLmNoaWxkTm9kZXMpLmluZGV4T2YoZWxlbWVudC5ub2RlKVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IHRoZSBsYXN0IGNoaWxkXHJcbiAgbGFzdCAoKSB7XHJcbiAgICByZXR1cm4gYWRvcHQodGhpcy5ub2RlLmxhc3RDaGlsZClcclxuICB9XHJcblxyXG4gIC8vIG1hdGNoZXMgdGhlIGVsZW1lbnQgdnMgYSBjc3Mgc2VsZWN0b3JcclxuICBtYXRjaGVzIChzZWxlY3Rvcikge1xyXG4gICAgY29uc3QgZWwgPSB0aGlzLm5vZGVcclxuICAgIGNvbnN0IG1hdGNoZXIgPSBlbC5tYXRjaGVzIHx8IGVsLm1hdGNoZXNTZWxlY3RvciB8fCBlbC5tc01hdGNoZXNTZWxlY3RvciB8fCBlbC5tb3pNYXRjaGVzU2VsZWN0b3IgfHwgZWwud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGVsLm9NYXRjaGVzU2VsZWN0b3IgfHwgbnVsbFxyXG4gICAgcmV0dXJuIG1hdGNoZXIgJiYgbWF0Y2hlci5jYWxsKGVsLCBzZWxlY3RvcilcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdGhlIHBhcmVudCBlbGVtZW50IGluc3RhbmNlXHJcbiAgcGFyZW50ICh0eXBlKSB7XHJcbiAgICBsZXQgcGFyZW50ID0gdGhpc1xyXG5cclxuICAgIC8vIGNoZWNrIGZvciBwYXJlbnRcclxuICAgIGlmICghcGFyZW50Lm5vZGUucGFyZW50Tm9kZSkgcmV0dXJuIG51bGxcclxuXHJcbiAgICAvLyBnZXQgcGFyZW50IGVsZW1lbnRcclxuICAgIHBhcmVudCA9IGFkb3B0KHBhcmVudC5ub2RlLnBhcmVudE5vZGUpXHJcblxyXG4gICAgaWYgKCF0eXBlKSByZXR1cm4gcGFyZW50XHJcblxyXG4gICAgLy8gbG9vcCB0cm91Z2ggYW5jZXN0b3JzIGlmIHR5cGUgaXMgZ2l2ZW5cclxuICAgIGRvIHtcclxuICAgICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJyA/IHBhcmVudC5tYXRjaGVzKHR5cGUpIDogcGFyZW50IGluc3RhbmNlb2YgdHlwZSkgcmV0dXJuIHBhcmVudFxyXG4gICAgfSB3aGlsZSAoKHBhcmVudCA9IGFkb3B0KHBhcmVudC5ub2RlLnBhcmVudE5vZGUpKSlcclxuXHJcbiAgICByZXR1cm4gcGFyZW50XHJcbiAgfVxyXG5cclxuICAvLyBCYXNpY2FsbHkgZG9lcyB0aGUgc2FtZSBhcyBgYWRkKClgIGJ1dCByZXR1cm5zIHRoZSBhZGRlZCBlbGVtZW50IGluc3RlYWRcclxuICBwdXQgKGVsZW1lbnQsIGkpIHtcclxuICAgIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuICAgIHRoaXMuYWRkKGVsZW1lbnQsIGkpXHJcbiAgICByZXR1cm4gZWxlbWVudFxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIGVsZW1lbnQgdG8gZ2l2ZW4gY29udGFpbmVyIGFuZCByZXR1cm4gY29udGFpbmVyXHJcbiAgcHV0SW4gKHBhcmVudCwgaSkge1xyXG4gICAgcmV0dXJuIG1ha2VJbnN0YW5jZShwYXJlbnQpLmFkZCh0aGlzLCBpKVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIGVsZW1lbnRcclxuICByZW1vdmUgKCkge1xyXG4gICAgaWYgKHRoaXMucGFyZW50KCkpIHtcclxuICAgICAgdGhpcy5wYXJlbnQoKS5yZW1vdmVFbGVtZW50KHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIFJlbW92ZSBhIGdpdmVuIGNoaWxkXHJcbiAgcmVtb3ZlRWxlbWVudCAoZWxlbWVudCkge1xyXG4gICAgdGhpcy5ub2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQubm9kZSlcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gUmVwbGFjZSB0aGlzIHdpdGggZWxlbWVudFxyXG4gIHJlcGxhY2UgKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQgPSBtYWtlSW5zdGFuY2UoZWxlbWVudClcclxuXHJcbiAgICBpZiAodGhpcy5ub2RlLnBhcmVudE5vZGUpIHtcclxuICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQubm9kZSwgdGhpcy5ub2RlKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBlbGVtZW50XHJcbiAgfVxyXG5cclxuICByb3VuZCAocHJlY2lzaW9uID0gMiwgbWFwID0gbnVsbCkge1xyXG4gICAgY29uc3QgZmFjdG9yID0gMTAgKiogcHJlY2lzaW9uXHJcbiAgICBjb25zdCBhdHRycyA9IHRoaXMuYXR0cihtYXApXHJcblxyXG4gICAgZm9yIChjb25zdCBpIGluIGF0dHJzKSB7XHJcbiAgICAgIGlmICh0eXBlb2YgYXR0cnNbaV0gPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgYXR0cnNbaV0gPSBNYXRoLnJvdW5kKGF0dHJzW2ldICogZmFjdG9yKSAvIGZhY3RvclxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5hdHRyKGF0dHJzKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIEltcG9ydCAvIEV4cG9ydCByYXcgc3ZnXHJcbiAgc3ZnIChzdmdPckZuLCBvdXRlclNWRykge1xyXG4gICAgcmV0dXJuIHRoaXMueG1sKHN2Z09yRm4sIG91dGVyU1ZHLCBzdmcpXHJcbiAgfVxyXG5cclxuICAvLyBSZXR1cm4gaWQgb24gc3RyaW5nIGNvbnZlcnNpb25cclxuICB0b1N0cmluZyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pZCgpXHJcbiAgfVxyXG5cclxuICB3b3JkcyAodGV4dCkge1xyXG4gICAgLy8gVGhpcyBpcyBmYXN0ZXIgdGhhbiByZW1vdmluZyBhbGwgY2hpbGRyZW4gYW5kIGFkZGluZyBhIG5ldyBvbmVcclxuICAgIHRoaXMubm9kZS50ZXh0Q29udGVudCA9IHRleHRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICB3cmFwIChub2RlKSB7XHJcbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnBhcmVudCgpXHJcblxyXG4gICAgaWYgKCFwYXJlbnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYWRkVG8obm9kZSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHBhcmVudC5pbmRleCh0aGlzKVxyXG4gICAgcmV0dXJuIHBhcmVudC5wdXQobm9kZSwgcG9zaXRpb24pLnB1dCh0aGlzKVxyXG4gIH1cclxuXHJcbiAgLy8gd3JpdGUgc3ZnanMgZGF0YSB0byB0aGUgZG9tXHJcbiAgd3JpdGVEYXRhVG9Eb20gKCkge1xyXG4gICAgLy8gZHVtcCB2YXJpYWJsZXMgcmVjdXJzaXZlbHlcclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHRoaXMud3JpdGVEYXRhVG9Eb20oKVxyXG4gICAgfSlcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gSW1wb3J0IC8gRXhwb3J0IHJhdyBzdmdcclxuICB4bWwgKHhtbE9yRm4sIG91dGVyWE1MLCBucykge1xyXG4gICAgaWYgKHR5cGVvZiB4bWxPckZuID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgbnMgPSBvdXRlclhNTFxyXG4gICAgICBvdXRlclhNTCA9IHhtbE9yRm5cclxuICAgICAgeG1sT3JGbiA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICAvLyBhY3QgYXMgZ2V0dGVyIGlmIG5vIHN2ZyBzdHJpbmcgaXMgZ2l2ZW5cclxuICAgIGlmICh4bWxPckZuID09IG51bGwgfHwgdHlwZW9mIHhtbE9yRm4gPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgLy8gVGhlIGRlZmF1bHQgZm9yIGV4cG9ydHMgaXMsIHRoYXQgdGhlIG91dGVyTm9kZSBpcyBpbmNsdWRlZFxyXG4gICAgICBvdXRlclhNTCA9IG91dGVyWE1MID09IG51bGwgPyB0cnVlIDogb3V0ZXJYTUxcclxuXHJcbiAgICAgIC8vIHdyaXRlIHN2Z2pzIGRhdGEgdG8gdGhlIGRvbVxyXG4gICAgICB0aGlzLndyaXRlRGF0YVRvRG9tKClcclxuICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzXHJcblxyXG4gICAgICAvLyBBbiBleHBvcnQgbW9kaWZpZXIgd2FzIHBhc3NlZFxyXG4gICAgICBpZiAoeG1sT3JGbiAhPSBudWxsKSB7XHJcbiAgICAgICAgY3VycmVudCA9IGFkb3B0KGN1cnJlbnQubm9kZS5jbG9uZU5vZGUodHJ1ZSkpXHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHdhbnRzIG91dGVySFRNTCB3ZSBuZWVkIHRvIHByb2Nlc3MgdGhpcyBub2RlLCB0b29cclxuICAgICAgICBpZiAob3V0ZXJYTUwpIHtcclxuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHhtbE9yRm4oY3VycmVudClcclxuICAgICAgICAgIGN1cnJlbnQgPSByZXN1bHQgfHwgY3VycmVudFxyXG5cclxuICAgICAgICAgIC8vIFRoZSB1c2VyIGRvZXMgbm90IHdhbnQgdGhpcyBub2RlPyBXZWxsLCB0aGVuIGhlIGdldHMgbm90aGluZ1xyXG4gICAgICAgICAgaWYgKHJlc3VsdCA9PT0gZmFsc2UpIHJldHVybiAnJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGVlcCBsb29wIHRocm91Z2ggYWxsIGNoaWxkcmVuIGFuZCBhcHBseSBtb2RpZmllclxyXG4gICAgICAgIGN1cnJlbnQuZWFjaChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSB4bWxPckZuKHRoaXMpXHJcbiAgICAgICAgICBjb25zdCBfdGhpcyA9IHJlc3VsdCB8fCB0aGlzXHJcblxyXG4gICAgICAgICAgLy8gSWYgbW9kaWZpZXIgcmV0dXJucyBmYWxzZSwgZGlzY2FyZCBub2RlXHJcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZSgpXHJcblxyXG4gICAgICAgICAgICAvLyBJZiBtb2RpZmllciByZXR1cm5zIG5ldyBub2RlLCB1c2UgaXRcclxuICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ICYmIHRoaXMgIT09IF90aGlzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZShfdGhpcylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LCB0cnVlKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXR1cm4gb3V0ZXIgb3IgaW5uZXIgY29udGVudFxyXG4gICAgICByZXR1cm4gb3V0ZXJYTUxcclxuICAgICAgICA/IGN1cnJlbnQubm9kZS5vdXRlckhUTUxcclxuICAgICAgICA6IGN1cnJlbnQubm9kZS5pbm5lckhUTUxcclxuICAgIH1cclxuXHJcbiAgICAvLyBBY3QgYXMgc2V0dGVyIGlmIHdlIGdvdCBhIHN0cmluZ1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IGZvciBpbXBvcnQgaXMsIHRoYXQgdGhlIGN1cnJlbnQgbm9kZSBpcyBub3QgcmVwbGFjZWRcclxuICAgIG91dGVyWE1MID0gb3V0ZXJYTUwgPT0gbnVsbCA/IGZhbHNlIDogb3V0ZXJYTUxcclxuXHJcbiAgICAvLyBDcmVhdGUgdGVtcG9yYXJ5IGhvbGRlclxyXG4gICAgY29uc3Qgd2VsbCA9IGNyZWF0ZSgnd3JhcHBlcicsIG5zKVxyXG4gICAgY29uc3QgZnJhZ21lbnQgPSBnbG9iYWxzLmRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxyXG5cclxuICAgIC8vIER1bXAgcmF3IHN2Z1xyXG4gICAgd2VsbC5pbm5lckhUTUwgPSB4bWxPckZuXHJcblxyXG4gICAgLy8gVHJhbnNwbGFudCBub2RlcyBpbnRvIHRoZSBmcmFnbWVudFxyXG4gICAgZm9yIChsZXQgbGVuID0gd2VsbC5jaGlsZHJlbi5sZW5ndGg7IGxlbi0tOykge1xyXG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCh3ZWxsLmZpcnN0RWxlbWVudENoaWxkKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMucGFyZW50KClcclxuXHJcbiAgICAvLyBBZGQgdGhlIHdob2xlIGZyYWdtZW50IGF0IG9uY2VcclxuICAgIHJldHVybiBvdXRlclhNTFxyXG4gICAgICA/IHRoaXMucmVwbGFjZShmcmFnbWVudCkgJiYgcGFyZW50XHJcbiAgICAgIDogdGhpcy5hZGQoZnJhZ21lbnQpXHJcbiAgfVxyXG59XHJcblxyXG5leHRlbmQoRG9tLCB7IGF0dHIsIGZpbmQsIGZpbmRPbmUgfSlcclxucmVnaXN0ZXIoRG9tLCAnRG9tJylcclxuIiwiaW1wb3J0IHsgYmJveCwgcmJveCwgaW5zaWRlIH0gZnJvbSAnLi4vdHlwZXMvQm94LmpzJ1xyXG5pbXBvcnQgeyBjdG0sIHNjcmVlbkNUTSB9IGZyb20gJy4uL3R5cGVzL01hdHJpeC5qcydcclxuaW1wb3J0IHtcclxuICBleHRlbmQsXHJcbiAgZ2V0Q2xhc3MsXHJcbiAgbWFrZUluc3RhbmNlLFxyXG4gIHJlZ2lzdGVyLFxyXG4gIHJvb3RcclxufSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi4vdXRpbHMvd2luZG93LmpzJ1xyXG5pbXBvcnQgeyBwb2ludCB9IGZyb20gJy4uL3R5cGVzL1BvaW50LmpzJ1xyXG5pbXBvcnQgeyBwcm9wb3J0aW9uYWxTaXplIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMuanMnXHJcbmltcG9ydCB7IHJlZmVyZW5jZSB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9yZWdleC5qcydcclxuaW1wb3J0IERvbSBmcm9tICcuL0RvbS5qcydcclxuaW1wb3J0IExpc3QgZnJvbSAnLi4vdHlwZXMvTGlzdC5qcydcclxuaW1wb3J0IFNWR051bWJlciBmcm9tICcuLi90eXBlcy9TVkdOdW1iZXIuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGVtZW50IGV4dGVuZHMgRG9tIHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMpIHtcclxuICAgIHN1cGVyKG5vZGUsIGF0dHJzKVxyXG5cclxuICAgIC8vIGluaXRpYWxpemUgZGF0YSBvYmplY3RcclxuICAgIHRoaXMuZG9tID0ge31cclxuXHJcbiAgICAvLyBjcmVhdGUgY2lyY3VsYXIgcmVmZXJlbmNlXHJcbiAgICB0aGlzLm5vZGUuaW5zdGFuY2UgPSB0aGlzXHJcblxyXG4gICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlKCdzdmdqczpkYXRhJykpIHtcclxuICAgICAgLy8gcHVsbCBzdmdqcyBkYXRhIGZyb20gdGhlIGRvbSAoZ2V0QXR0cmlidXRlTlMgZG9lc24ndCB3b3JrIGluIGh0bWw1KVxyXG4gICAgICB0aGlzLnNldERhdGEoSlNPTi5wYXJzZShub2RlLmdldEF0dHJpYnV0ZSgnc3ZnanM6ZGF0YScpKSB8fCB7fSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIE1vdmUgZWxlbWVudCBieSBpdHMgY2VudGVyXHJcbiAgY2VudGVyICh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jeCh4KS5jeSh5KVxyXG4gIH1cclxuXHJcbiAgLy8gTW92ZSBieSBjZW50ZXIgb3ZlciB4LWF4aXNcclxuICBjeCAoeCkge1xyXG4gICAgcmV0dXJuIHggPT0gbnVsbFxyXG4gICAgICA/IHRoaXMueCgpICsgdGhpcy53aWR0aCgpIC8gMlxyXG4gICAgICA6IHRoaXMueCh4IC0gdGhpcy53aWR0aCgpIC8gMilcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgYnkgY2VudGVyIG92ZXIgeS1heGlzXHJcbiAgY3kgKHkpIHtcclxuICAgIHJldHVybiB5ID09IG51bGxcclxuICAgICAgPyB0aGlzLnkoKSArIHRoaXMuaGVpZ2h0KCkgLyAyXHJcbiAgICAgIDogdGhpcy55KHkgLSB0aGlzLmhlaWdodCgpIC8gMilcclxuICB9XHJcblxyXG4gIC8vIEdldCBkZWZzXHJcbiAgZGVmcyAoKSB7XHJcbiAgICBjb25zdCByb290ID0gdGhpcy5yb290KClcclxuICAgIHJldHVybiByb290ICYmIHJvb3QuZGVmcygpXHJcbiAgfVxyXG5cclxuICAvLyBSZWxhdGl2ZSBtb3ZlIG92ZXIgeCBhbmQgeSBheGVzXHJcbiAgZG1vdmUgKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLmR4KHgpLmR5KHkpXHJcbiAgfVxyXG5cclxuICAvLyBSZWxhdGl2ZSBtb3ZlIG92ZXIgeCBheGlzXHJcbiAgZHggKHggPSAwKSB7XHJcbiAgICByZXR1cm4gdGhpcy54KG5ldyBTVkdOdW1iZXIoeCkucGx1cyh0aGlzLngoKSkpXHJcbiAgfVxyXG5cclxuICAvLyBSZWxhdGl2ZSBtb3ZlIG92ZXIgeSBheGlzXHJcbiAgZHkgKHkgPSAwKSB7XHJcbiAgICByZXR1cm4gdGhpcy55KG5ldyBTVkdOdW1iZXIoeSkucGx1cyh0aGlzLnkoKSkpXHJcbiAgfVxyXG5cclxuICBnZXRFdmVudEhvbGRlciAoKSB7XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cblxuICAvLyBTZXQgaGVpZ2h0IG9mIGVsZW1lbnRcbiAgaGVpZ2h0IChoZWlnaHQpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcclxuICB9XG5cbiAgLy8gTW92ZSBlbGVtZW50IHRvIGdpdmVuIHggYW5kIHkgdmFsdWVzXG4gIG1vdmUgKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLngoeCkueSh5KVxyXG4gIH1cblxuICAvLyByZXR1cm4gYXJyYXkgb2YgYWxsIGFuY2VzdG9ycyBvZiBnaXZlbiB0eXBlIHVwIHRvIHRoZSByb290IHN2Z1xuICBwYXJlbnRzICh1bnRpbCA9IHRoaXMucm9vdCgpKSB7XHJcbiAgICB1bnRpbCA9IG1ha2VJbnN0YW5jZSh1bnRpbClcclxuICAgIGNvbnN0IHBhcmVudHMgPSBuZXcgTGlzdCgpXHJcbiAgICBsZXQgcGFyZW50ID0gdGhpc1xyXG5cclxuICAgIHdoaWxlIChcclxuICAgICAgKHBhcmVudCA9IHBhcmVudC5wYXJlbnQoKSlcclxuICAgICAgJiYgcGFyZW50Lm5vZGUgIT09IGdsb2JhbHMuZG9jdW1lbnRcclxuICAgICAgJiYgcGFyZW50Lm5vZGVOYW1lICE9PSAnI2RvY3VtZW50LWZyYWdtZW50Jykge1xyXG5cclxuICAgICAgcGFyZW50cy5wdXNoKHBhcmVudClcclxuXHJcbiAgICAgIGlmIChwYXJlbnQubm9kZSA9PT0gdW50aWwubm9kZSkge1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcGFyZW50c1xyXG4gIH1cblxuICAvLyBHZXQgcmVmZXJlbmNlZCBlbGVtZW50IGZvcm0gYXR0cmlidXRlIHZhbHVlXG4gIHJlZmVyZW5jZSAoYXR0cikge1xyXG4gICAgYXR0ciA9IHRoaXMuYXR0cihhdHRyKVxyXG4gICAgaWYgKCFhdHRyKSByZXR1cm4gbnVsbFxyXG5cclxuICAgIGNvbnN0IG0gPSAoYXR0ciArICcnKS5tYXRjaChyZWZlcmVuY2UpXHJcbiAgICByZXR1cm4gbSA/IG1ha2VJbnN0YW5jZShtWzFdKSA6IG51bGxcclxuICB9XG5cbiAgLy8gR2V0IHBhcmVudCBkb2N1bWVudFxyXG4gIHJvb3QgKCkge1xyXG4gICAgY29uc3QgcCA9IHRoaXMucGFyZW50KGdldENsYXNzKHJvb3QpKVxyXG4gICAgcmV0dXJuIHAgJiYgcC5yb290KClcclxuICB9XHJcblxyXG4gIC8vIHNldCBnaXZlbiBkYXRhIHRvIHRoZSBlbGVtZW50cyBkYXRhIHByb3BlcnR5XHJcbiAgc2V0RGF0YSAobykge1xyXG4gICAgdGhpcy5kb20gPSBvXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gU2V0IGVsZW1lbnQgc2l6ZSB0byBnaXZlbiB3aWR0aCBhbmQgaGVpZ2h0XHJcbiAgc2l6ZSAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgY29uc3QgcCA9IHByb3BvcnRpb25hbFNpemUodGhpcywgd2lkdGgsIGhlaWdodClcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gICAgICAud2lkdGgobmV3IFNWR051bWJlcihwLndpZHRoKSlcclxuICAgICAgLmhlaWdodChuZXcgU1ZHTnVtYmVyKHAuaGVpZ2h0KSlcclxuICB9XHJcblxyXG4gIC8vIFNldCB3aWR0aCBvZiBlbGVtZW50XHJcbiAgd2lkdGggKHdpZHRoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCd3aWR0aCcsIHdpZHRoKVxyXG4gIH1cclxuXHJcbiAgLy8gd3JpdGUgc3ZnanMgZGF0YSB0byB0aGUgZG9tXHJcbiAgd3JpdGVEYXRhVG9Eb20gKCkge1xyXG4gICAgLy8gcmVtb3ZlIHByZXZpb3VzbHkgc2V0IGRhdGFcclxuICAgIHRoaXMubm9kZS5yZW1vdmVBdHRyaWJ1dGUoJ3N2Z2pzOmRhdGEnKVxyXG5cclxuICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmRvbSkubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMubm9kZS5zZXRBdHRyaWJ1dGUoJ3N2Z2pzOmRhdGEnLCBKU09OLnN0cmluZ2lmeSh0aGlzLmRvbSkpIC8vIHNlZSAjNDI4XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHN1cGVyLndyaXRlRGF0YVRvRG9tKClcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgb3ZlciB4LWF4aXNcclxuICB4ICh4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCd4JywgeClcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgb3ZlciB5LWF4aXNcclxuICB5ICh5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCd5JywgeSlcclxuICB9XHJcbn1cclxuXHJcbmV4dGVuZChFbGVtZW50LCB7XHJcbiAgYmJveCwgcmJveCwgaW5zaWRlLCBwb2ludCwgY3RtLCBzY3JlZW5DVE1cclxufSlcclxuXHJcbnJlZ2lzdGVyKEVsZW1lbnQsICdFbGVtZW50JylcclxuIiwiaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IENvbG9yIGZyb20gJy4uLy4uL3R5cGVzL0NvbG9yLmpzJ1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuLi8uLi9lbGVtZW50cy9FbGVtZW50LmpzJ1xyXG5pbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uL3R5cGVzL01hdHJpeC5qcydcclxuaW1wb3J0IFBvaW50IGZyb20gJy4uLy4uL3R5cGVzL1BvaW50LmpzJ1xyXG5pbXBvcnQgU1ZHTnVtYmVyIGZyb20gJy4uLy4uL3R5cGVzL1NWR051bWJlci5qcydcclxuXHJcbi8vIERlZmluZSBsaXN0IG9mIGF2YWlsYWJsZSBhdHRyaWJ1dGVzIGZvciBzdHJva2UgYW5kIGZpbGxcclxuY29uc3Qgc3VnYXIgPSB7XHJcbiAgc3Ryb2tlOiBbICdjb2xvcicsICd3aWR0aCcsICdvcGFjaXR5JywgJ2xpbmVjYXAnLCAnbGluZWpvaW4nLCAnbWl0ZXJsaW1pdCcsICdkYXNoYXJyYXknLCAnZGFzaG9mZnNldCcgXSxcclxuICBmaWxsOiBbICdjb2xvcicsICdvcGFjaXR5JywgJ3J1bGUnIF0sXHJcbiAgcHJlZml4OiBmdW5jdGlvbiAodCwgYSkge1xyXG4gICAgcmV0dXJuIGEgPT09ICdjb2xvcicgPyB0IDogdCArICctJyArIGFcclxuICB9XHJcbn1cclxuXHJcbi8vIEFkZCBzdWdhciBmb3IgZmlsbCBhbmQgc3Ryb2tlXHJcbjtbICdmaWxsJywgJ3N0cm9rZScgXS5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XHJcbiAgY29uc3QgZXh0ZW5zaW9uID0ge31cclxuICBsZXQgaVxyXG5cclxuICBleHRlbnNpb25bbV0gPSBmdW5jdGlvbiAobykge1xyXG4gICAgaWYgKHR5cGVvZiBvID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5hdHRyKG0pXHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIG8gPT09ICdzdHJpbmcnIHx8IG8gaW5zdGFuY2VvZiBDb2xvciB8fCBDb2xvci5pc1JnYihvKSB8fCAobyBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XHJcbiAgICAgIHRoaXMuYXR0cihtLCBvKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gc2V0IGFsbCBhdHRyaWJ1dGVzIGZyb20gc3VnYXIuZmlsbCBhbmQgc3VnYXIuc3Ryb2tlIGxpc3RcclxuICAgICAgZm9yIChpID0gc3VnYXJbbV0ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBpZiAob1tzdWdhclttXVtpXV0gIT0gbnVsbCkge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKHN1Z2FyLnByZWZpeChtLCBzdWdhclttXVtpXSksIG9bc3VnYXJbbV1baV1dKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICByZWdpc3Rlck1ldGhvZHMoWyAnRWxlbWVudCcsICdSdW5uZXInIF0sIGV4dGVuc2lvbilcclxufSlcclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyhbICdFbGVtZW50JywgJ1J1bm5lcicgXSwge1xyXG4gIC8vIExldCB0aGUgdXNlciBzZXQgdGhlIG1hdHJpeCBkaXJlY3RseVxyXG4gIG1hdHJpeDogZnVuY3Rpb24gKG1hdCwgYiwgYywgZCwgZSwgZikge1xyXG4gICAgLy8gQWN0IGFzIGEgZ2V0dGVyXHJcbiAgICBpZiAobWF0ID09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIG5ldyBNYXRyaXgodGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvLyBBY3QgYXMgYSBzZXR0ZXIsIHRoZSB1c2VyIGNhbiBwYXNzIGEgbWF0cml4IG9yIGEgc2V0IG9mIG51bWJlcnNcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ3RyYW5zZm9ybScsIG5ldyBNYXRyaXgobWF0LCBiLCBjLCBkLCBlLCBmKSlcclxuICB9LFxyXG5cclxuICAvLyBNYXAgcm90YXRpb24gdG8gdHJhbnNmb3JtXHJcbiAgcm90YXRlOiBmdW5jdGlvbiAoYW5nbGUsIGN4LCBjeSkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKHsgcm90YXRlOiBhbmdsZSwgb3g6IGN4LCBveTogY3kgfSwgdHJ1ZSlcclxuICB9LFxyXG5cclxuICAvLyBNYXAgc2tldyB0byB0cmFuc2Zvcm1cclxuICBza2V3OiBmdW5jdGlvbiAoeCwgeSwgY3gsIGN5KSB7XHJcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAzXHJcbiAgICAgID8gdGhpcy50cmFuc2Zvcm0oeyBza2V3OiB4LCBveDogeSwgb3k6IGN4IH0sIHRydWUpXHJcbiAgICAgIDogdGhpcy50cmFuc2Zvcm0oeyBza2V3OiBbIHgsIHkgXSwgb3g6IGN4LCBveTogY3kgfSwgdHJ1ZSlcclxuICB9LFxyXG5cclxuICBzaGVhcjogZnVuY3Rpb24gKGxhbSwgY3gsIGN5KSB7XHJcbiAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0oeyBzaGVhcjogbGFtLCBveDogY3gsIG95OiBjeSB9LCB0cnVlKVxyXG4gIH0sXHJcblxyXG4gIC8vIE1hcCBzY2FsZSB0byB0cmFuc2Zvcm1cclxuICBzY2FsZTogZnVuY3Rpb24gKHgsIHksIGN4LCBjeSkge1xyXG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gM1xyXG4gICAgICA/IHRoaXMudHJhbnNmb3JtKHsgc2NhbGU6IHgsIG94OiB5LCBveTogY3ggfSwgdHJ1ZSlcclxuICAgICAgOiB0aGlzLnRyYW5zZm9ybSh7IHNjYWxlOiBbIHgsIHkgXSwgb3g6IGN4LCBveTogY3kgfSwgdHJ1ZSlcclxuICB9LFxyXG5cclxuICAvLyBNYXAgdHJhbnNsYXRlIHRvIHRyYW5zZm9ybVxyXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24gKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybSh7IHRyYW5zbGF0ZTogWyB4LCB5IF0gfSwgdHJ1ZSlcclxuICB9LFxyXG5cclxuICAvLyBNYXAgcmVsYXRpdmUgdHJhbnNsYXRpb25zIHRvIHRyYW5zZm9ybVxyXG4gIHJlbGF0aXZlOiBmdW5jdGlvbiAoeCwgeSkge1xyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKHsgcmVsYXRpdmU6IFsgeCwgeSBdIH0sIHRydWUpXHJcbiAgfSxcclxuXHJcbiAgLy8gTWFwIGZsaXAgdG8gdHJhbnNmb3JtXHJcbiAgZmxpcDogZnVuY3Rpb24gKGRpcmVjdGlvbiA9ICdib3RoJywgb3JpZ2luID0gJ2NlbnRlcicpIHtcclxuICAgIGlmICgneHlib3RodHJ1ZScuaW5kZXhPZihkaXJlY3Rpb24pID09PSAtMSkge1xyXG4gICAgICBvcmlnaW4gPSBkaXJlY3Rpb25cclxuICAgICAgZGlyZWN0aW9uID0gJ2JvdGgnXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKHsgZmxpcDogZGlyZWN0aW9uLCBvcmlnaW46IG9yaWdpbiB9LCB0cnVlKVxyXG4gIH0sXHJcblxyXG4gIC8vIE9wYWNpdHlcclxuICBvcGFjaXR5OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ29wYWNpdHknLCB2YWx1ZSlcclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoJ3JhZGl1cycsIHtcclxuICAvLyBBZGQgeCBhbmQgeSByYWRpdXNcclxuICByYWRpdXM6IGZ1bmN0aW9uICh4LCB5ID0geCkge1xyXG4gICAgY29uc3QgdHlwZSA9ICh0aGlzLl9lbGVtZW50IHx8IHRoaXMpLnR5cGVcclxuICAgIHJldHVybiB0eXBlID09PSAncmFkaWFsR3JhZGllbnQnXHJcbiAgICAgID8gdGhpcy5hdHRyKCdyJywgbmV3IFNWR051bWJlcih4KSlcclxuICAgICAgOiB0aGlzLnJ4KHgpLnJ5KHkpXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKCdQYXRoJywge1xyXG4gIC8vIEdldCBwYXRoIGxlbmd0aFxyXG4gIGxlbmd0aDogZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubm9kZS5nZXRUb3RhbExlbmd0aCgpXHJcbiAgfSxcclxuICAvLyBHZXQgcG9pbnQgYXQgbGVuZ3RoXHJcbiAgcG9pbnRBdDogZnVuY3Rpb24gKGxlbmd0aCkge1xyXG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLm5vZGUuZ2V0UG9pbnRBdExlbmd0aChsZW5ndGgpKVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyhbICdFbGVtZW50JywgJ1J1bm5lcicgXSwge1xyXG4gIC8vIFNldCBmb250XHJcbiAgZm9udDogZnVuY3Rpb24gKGEsIHYpIHtcclxuICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgZm9yICh2IGluIGEpIHRoaXMuZm9udCh2LCBhW3ZdKVxyXG4gICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhID09PSAnbGVhZGluZydcclxuICAgICAgPyB0aGlzLmxlYWRpbmcodilcclxuICAgICAgOiBhID09PSAnYW5jaG9yJ1xyXG4gICAgICAgID8gdGhpcy5hdHRyKCd0ZXh0LWFuY2hvcicsIHYpXHJcbiAgICAgICAgOiBhID09PSAnc2l6ZScgfHwgYSA9PT0gJ2ZhbWlseScgfHwgYSA9PT0gJ3dlaWdodCcgfHwgYSA9PT0gJ3N0cmV0Y2gnIHx8IGEgPT09ICd2YXJpYW50JyB8fCBhID09PSAnc3R5bGUnXHJcbiAgICAgICAgICA/IHRoaXMuYXR0cignZm9udC0nICsgYSwgdilcclxuICAgICAgICAgIDogdGhpcy5hdHRyKGEsIHYpXHJcbiAgfVxyXG59KVxyXG5cclxuLy8gQWRkIGV2ZW50cyB0byBlbGVtZW50c1xyXG5jb25zdCBtZXRob2RzID0gWyAnY2xpY2snLFxyXG4gICdkYmxjbGljaycsXHJcbiAgJ21vdXNlZG93bicsXHJcbiAgJ21vdXNldXAnLFxyXG4gICdtb3VzZW92ZXInLFxyXG4gICdtb3VzZW91dCcsXHJcbiAgJ21vdXNlbW92ZScsXHJcbiAgJ21vdXNlZW50ZXInLFxyXG4gICdtb3VzZWxlYXZlJyxcclxuICAndG91Y2hzdGFydCcsXHJcbiAgJ3RvdWNobW92ZScsXHJcbiAgJ3RvdWNobGVhdmUnLFxyXG4gICd0b3VjaGVuZCcsXHJcbiAgJ3RvdWNoY2FuY2VsJyBdLnJlZHVjZShmdW5jdGlvbiAobGFzdCwgZXZlbnQpIHtcclxuICAvLyBhZGQgZXZlbnQgdG8gRWxlbWVudFxyXG4gIGNvbnN0IGZuID0gZnVuY3Rpb24gKGYpIHtcclxuICAgIGlmIChmID09PSBudWxsKSB7XHJcbiAgICAgIHRoaXMub2ZmKGV2ZW50KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vbihldmVudCwgZilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBsYXN0W2V2ZW50XSA9IGZuXHJcbiAgcmV0dXJuIGxhc3RcclxufSwge30pXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoJ0VsZW1lbnQnLCBtZXRob2RzKVxyXG4iLCJpbXBvcnQgeyBnZXRPcmlnaW4gfSBmcm9tICcuLi8uLi91dGlscy91dGlscy5qcydcclxuaW1wb3J0IHsgZGVsaW1pdGVyLCB0cmFuc2Zvcm1zIH0gZnJvbSAnLi4vY29yZS9yZWdleC5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IE1hdHJpeCBmcm9tICcuLi8uLi90eXBlcy9NYXRyaXguanMnXHJcblxyXG4vLyBSZXNldCBhbGwgdHJhbnNmb3JtYXRpb25zXHJcbmV4cG9ydCBmdW5jdGlvbiB1bnRyYW5zZm9ybSAoKSB7XHJcbiAgcmV0dXJuIHRoaXMuYXR0cigndHJhbnNmb3JtJywgbnVsbClcclxufVxyXG5cclxuLy8gbWVyZ2UgdGhlIHdob2xlIHRyYW5zZm9ybWF0aW9uIGNoYWluIGludG8gb25lIG1hdHJpeCBhbmQgcmV0dXJucyBpdFxyXG5leHBvcnQgZnVuY3Rpb24gbWF0cml4aWZ5ICgpIHtcclxuICBjb25zdCBtYXRyaXggPSAodGhpcy5hdHRyKCd0cmFuc2Zvcm0nKSB8fCAnJylcclxuICAgIC8vIHNwbGl0IHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgLnNwbGl0KHRyYW5zZm9ybXMpLnNsaWNlKDAsIC0xKS5tYXAoZnVuY3Rpb24gKHN0cikge1xyXG4gICAgICAvLyBnZW5lcmF0ZSBrZXkgPT4gdmFsdWUgcGFpcnNcclxuICAgICAgY29uc3Qga3YgPSBzdHIudHJpbSgpLnNwbGl0KCcoJylcclxuICAgICAgcmV0dXJuIFsga3ZbMF0sXHJcbiAgICAgICAga3ZbMV0uc3BsaXQoZGVsaW1pdGVyKVxyXG4gICAgICAgICAgLm1hcChmdW5jdGlvbiAoc3RyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0cilcclxuICAgICAgICAgIH0pXHJcbiAgICAgIF1cclxuICAgIH0pXHJcbiAgICAucmV2ZXJzZSgpXHJcbiAgICAvLyBtZXJnZSBldmVyeSB0cmFuc2Zvcm1hdGlvbiBpbnRvIG9uZSBtYXRyaXhcclxuICAgIC5yZWR1Y2UoZnVuY3Rpb24gKG1hdHJpeCwgdHJhbnNmb3JtKSB7XHJcbiAgICAgIGlmICh0cmFuc2Zvcm1bMF0gPT09ICdtYXRyaXgnKSB7XHJcbiAgICAgICAgcmV0dXJuIG1hdHJpeC5sbXVsdGlwbHkoTWF0cml4LmZyb21BcnJheSh0cmFuc2Zvcm1bMV0pKVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBtYXRyaXhbdHJhbnNmb3JtWzBdXS5hcHBseShtYXRyaXgsIHRyYW5zZm9ybVsxXSlcclxuICAgIH0sIG5ldyBNYXRyaXgoKSlcclxuXHJcbiAgcmV0dXJuIG1hdHJpeFxyXG59XHJcblxyXG4vLyBhZGQgYW4gZWxlbWVudCB0byBhbm90aGVyIHBhcmVudCB3aXRob3V0IGNoYW5naW5nIHRoZSB2aXN1YWwgcmVwcmVzZW50YXRpb24gb24gdGhlIHNjcmVlblxyXG5leHBvcnQgZnVuY3Rpb24gdG9QYXJlbnQgKHBhcmVudCwgaSkge1xyXG4gIGlmICh0aGlzID09PSBwYXJlbnQpIHJldHVybiB0aGlzXHJcbiAgY29uc3QgY3RtID0gdGhpcy5zY3JlZW5DVE0oKVxyXG4gIGNvbnN0IHBDdG0gPSBwYXJlbnQuc2NyZWVuQ1RNKCkuaW52ZXJzZSgpXHJcblxyXG4gIHRoaXMuYWRkVG8ocGFyZW50LCBpKS51bnRyYW5zZm9ybSgpLnRyYW5zZm9ybShwQ3RtLm11bHRpcGx5KGN0bSkpXHJcblxyXG4gIHJldHVybiB0aGlzXHJcbn1cclxuXHJcbi8vIHNhbWUgYXMgYWJvdmUgd2l0aCBwYXJlbnQgZXF1YWxzIHJvb3Qtc3ZnXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1Jvb3QgKGkpIHtcclxuICByZXR1cm4gdGhpcy50b1BhcmVudCh0aGlzLnJvb3QoKSwgaSlcclxufVxyXG5cclxuLy8gQWRkIHRyYW5zZm9ybWF0aW9uc1xyXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtIChvLCByZWxhdGl2ZSkge1xyXG4gIC8vIEFjdCBhcyBhIGdldHRlciBpZiBubyBvYmplY3Qgd2FzIHBhc3NlZFxyXG4gIGlmIChvID09IG51bGwgfHwgdHlwZW9mIG8gPT09ICdzdHJpbmcnKSB7XHJcbiAgICBjb25zdCBkZWNvbXBvc2VkID0gbmV3IE1hdHJpeCh0aGlzKS5kZWNvbXBvc2UoKVxyXG4gICAgcmV0dXJuIG8gPT0gbnVsbCA/IGRlY29tcG9zZWQgOiBkZWNvbXBvc2VkW29dXHJcbiAgfVxyXG5cclxuICBpZiAoIU1hdHJpeC5pc01hdHJpeExpa2UobykpIHtcclxuICAgIC8vIFNldCB0aGUgb3JpZ2luIGFjY29yZGluZyB0byB0aGUgZGVmaW5lZCB0cmFuc2Zvcm1cclxuICAgIG8gPSB7IC4uLm8sIG9yaWdpbjogZ2V0T3JpZ2luKG8sIHRoaXMpIH1cclxuICB9XHJcblxyXG4gIC8vIFRoZSB1c2VyIGNhbiBwYXNzIGEgYm9vbGVhbiwgYW4gRWxlbWVudCBvciBhbiBNYXRyaXggb3Igbm90aGluZ1xyXG4gIGNvbnN0IGNsZWFuUmVsYXRpdmUgPSByZWxhdGl2ZSA9PT0gdHJ1ZSA/IHRoaXMgOiAocmVsYXRpdmUgfHwgZmFsc2UpXHJcbiAgY29uc3QgcmVzdWx0ID0gbmV3IE1hdHJpeChjbGVhblJlbGF0aXZlKS50cmFuc2Zvcm0obylcclxuICByZXR1cm4gdGhpcy5hdHRyKCd0cmFuc2Zvcm0nLCByZXN1bHQpXHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcygnRWxlbWVudCcsIHtcclxuICB1bnRyYW5zZm9ybSwgbWF0cml4aWZ5LCB0b1BhcmVudCwgdG9Sb290LCB0cmFuc2Zvcm1cclxufSlcclxuIiwiaW1wb3J0IHsgcmVnaXN0ZXIgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgRWxlbWVudCBmcm9tICcuL0VsZW1lbnQuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb250YWluZXIgZXh0ZW5kcyBFbGVtZW50IHtcclxuICBmbGF0dGVuIChwYXJlbnQgPSB0aGlzLCBpbmRleCkge1xyXG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcclxuICAgICAgaWYgKHRoaXMgaW5zdGFuY2VvZiBDb250YWluZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5mbGF0dGVuKCkudW5ncm91cCgpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHVuZ3JvdXAgKHBhcmVudCA9IHRoaXMucGFyZW50KCksIGluZGV4ID0gcGFyZW50LmluZGV4KHRoaXMpKSB7XHJcbiAgICAvLyB3aGVuIHBhcmVudCAhPSB0aGlzLCB3ZSB3YW50IGFwcGVuZCBhbGwgZWxlbWVudHMgdG8gdGhlIGVuZFxyXG4gICAgaW5kZXggPSBpbmRleCA9PT0gLTEgPyBwYXJlbnQuY2hpbGRyZW4oKS5sZW5ndGggOiBpbmRleFxyXG5cclxuICAgIHRoaXMuZWFjaChmdW5jdGlvbiAoaSwgY2hpbGRyZW4pIHtcclxuICAgICAgLy8gcmV2ZXJzZSBlYWNoXHJcbiAgICAgIHJldHVybiBjaGlsZHJlbltjaGlsZHJlbi5sZW5ndGggLSBpIC0gMV0udG9QYXJlbnQocGFyZW50LCBpbmRleClcclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHRoaXMucmVtb3ZlKClcclxuICB9XHJcbn1cclxuXHJcbnJlZ2lzdGVyKENvbnRhaW5lciwgJ0NvbnRhaW5lcicpXHJcbiIsImltcG9ydCB7IG5vZGVPck5ldywgcmVnaXN0ZXIgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vQ29udGFpbmVyLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVmcyBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdkZWZzJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgZmxhdHRlbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdW5ncm91cCAoKSB7XHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXIoRGVmcywgJ0RlZnMnKVxyXG4iLCJpbXBvcnQgeyByZWdpc3RlciB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4vRWxlbWVudC5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIGV4dGVuZHMgRWxlbWVudCB7fVxyXG5cclxucmVnaXN0ZXIoU2hhcGUsICdTaGFwZScpXHJcbiIsImltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi4vLi4vdHlwZXMvU1ZHTnVtYmVyLmpzJ1xyXG5cclxuLy8gUmFkaXVzIHggdmFsdWVcclxuZXhwb3J0IGZ1bmN0aW9uIHJ4IChyeCkge1xyXG4gIHJldHVybiB0aGlzLmF0dHIoJ3J4JywgcngpXHJcbn1cclxuXHJcbi8vIFJhZGl1cyB5IHZhbHVlXHJcbmV4cG9ydCBmdW5jdGlvbiByeSAocnkpIHtcclxuICByZXR1cm4gdGhpcy5hdHRyKCdyeScsIHJ5KVxyXG59XHJcblxyXG4vLyBNb3ZlIG92ZXIgeC1heGlzXHJcbmV4cG9ydCBmdW5jdGlvbiB4ICh4KSB7XHJcbiAgcmV0dXJuIHggPT0gbnVsbFxyXG4gICAgPyB0aGlzLmN4KCkgLSB0aGlzLnJ4KClcclxuICAgIDogdGhpcy5jeCh4ICsgdGhpcy5yeCgpKVxyXG59XHJcblxyXG4vLyBNb3ZlIG92ZXIgeS1heGlzXHJcbmV4cG9ydCBmdW5jdGlvbiB5ICh5KSB7XHJcbiAgcmV0dXJuIHkgPT0gbnVsbFxyXG4gICAgPyB0aGlzLmN5KCkgLSB0aGlzLnJ5KClcclxuICAgIDogdGhpcy5jeSh5ICsgdGhpcy5yeSgpKVxyXG59XHJcblxyXG4vLyBNb3ZlIGJ5IGNlbnRlciBvdmVyIHgtYXhpc1xyXG5leHBvcnQgZnVuY3Rpb24gY3ggKHgpIHtcclxuICByZXR1cm4gdGhpcy5hdHRyKCdjeCcsIHgpXHJcbn1cclxuXHJcbi8vIE1vdmUgYnkgY2VudGVyIG92ZXIgeS1heGlzXHJcbmV4cG9ydCBmdW5jdGlvbiBjeSAoeSkge1xyXG4gIHJldHVybiB0aGlzLmF0dHIoJ2N5JywgeSlcclxufVxyXG5cclxuLy8gU2V0IHdpZHRoIG9mIGVsZW1lbnRcclxuZXhwb3J0IGZ1bmN0aW9uIHdpZHRoICh3aWR0aCkge1xyXG4gIHJldHVybiB3aWR0aCA9PSBudWxsXHJcbiAgICA/IHRoaXMucngoKSAqIDJcclxuICAgIDogdGhpcy5yeChuZXcgU1ZHTnVtYmVyKHdpZHRoKS5kaXZpZGUoMikpXHJcbn1cclxuXHJcbi8vIFNldCBoZWlnaHQgb2YgZWxlbWVudFxyXG5leHBvcnQgZnVuY3Rpb24gaGVpZ2h0IChoZWlnaHQpIHtcclxuICByZXR1cm4gaGVpZ2h0ID09IG51bGxcclxuICAgID8gdGhpcy5yeSgpICogMlxyXG4gICAgOiB0aGlzLnJ5KG5ldyBTVkdOdW1iZXIoaGVpZ2h0KS5kaXZpZGUoMikpXHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBleHRlbmQsXHJcbiAgbm9kZU9yTmV3LFxyXG4gIHJlZ2lzdGVyLFxyXG4gIHdyYXBXaXRoQXR0ckNoZWNrXHJcbn0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcHJvcG9ydGlvbmFsU2l6ZSB9IGZyb20gJy4uL3V0aWxzL3V0aWxzLmpzJ1xyXG5pbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9tZXRob2RzLmpzJ1xyXG5pbXBvcnQgU1ZHTnVtYmVyIGZyb20gJy4uL3R5cGVzL1NWR051bWJlci5qcydcclxuaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnXHJcbmltcG9ydCAqIGFzIGNpcmNsZWQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL2NpcmNsZWQuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbGxpcHNlIGV4dGVuZHMgU2hhcGUge1xyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygnZWxsaXBzZScsIG5vZGUpLCBhdHRycylcclxuICB9XHJcblxyXG4gIHNpemUgKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgIGNvbnN0IHAgPSBwcm9wb3J0aW9uYWxTaXplKHRoaXMsIHdpZHRoLCBoZWlnaHQpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICAgICAgLnJ4KG5ldyBTVkdOdW1iZXIocC53aWR0aCkuZGl2aWRlKDIpKVxyXG4gICAgICAucnkobmV3IFNWR051bWJlcihwLmhlaWdodCkuZGl2aWRlKDIpKVxyXG4gIH1cclxufVxyXG5cclxuZXh0ZW5kKEVsbGlwc2UsIGNpcmNsZWQpXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoJ0NvbnRhaW5lcicsIHtcclxuICAvLyBDcmVhdGUgYW4gZWxsaXBzZVxyXG4gIGVsbGlwc2U6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICh3aWR0aCA9IDAsIGhlaWdodCA9IHdpZHRoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wdXQobmV3IEVsbGlwc2UoKSkuc2l6ZSh3aWR0aCwgaGVpZ2h0KS5tb3ZlKDAsIDApXHJcbiAgfSlcclxufSlcclxuXHJcbnJlZ2lzdGVyKEVsbGlwc2UsICdFbGxpcHNlJylcclxuIiwiaW1wb3J0IERvbSBmcm9tICcuL0RvbS5qcydcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi91dGlscy93aW5kb3cuanMnXG5pbXBvcnQgeyByZWdpc3RlciwgY3JlYXRlIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcblxuY2xhc3MgRnJhZ21lbnQgZXh0ZW5kcyBEb20ge1xuICBjb25zdHJ1Y3RvciAobm9kZSA9IGdsb2JhbHMuZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpKSB7XG4gICAgc3VwZXIobm9kZSlcbiAgfVxuXG4gIC8vIEltcG9ydCAvIEV4cG9ydCByYXcgeG1sXG4gIHhtbCAoeG1sT3JGbiwgb3V0ZXJYTUwsIG5zKSB7XG4gICAgaWYgKHR5cGVvZiB4bWxPckZuID09PSAnYm9vbGVhbicpIHtcbiAgICAgIG5zID0gb3V0ZXJYTUxcbiAgICAgIG91dGVyWE1MID0geG1sT3JGblxuICAgICAgeG1sT3JGbiA9IG51bGxcbiAgICB9XG5cbiAgICAvLyBiZWNhdXNlIHRoaXMgaXMgYSBmcmFnbWVudCB3ZSBoYXZlIHRvIHB1dCBhbGwgZWxlbWVudHMgaW50byBhIHdyYXBwZXIgZmlyc3RcbiAgICAvLyBiZWZvcmUgd2UgY2FuIGdldCB0aGUgaW5uZXJYTUwgZnJvbSBpdFxuICAgIGlmICh4bWxPckZuID09IG51bGwgfHwgdHlwZW9mIHhtbE9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSBuZXcgRG9tKGNyZWF0ZSgnd3JhcHBlcicsIG5zKSlcbiAgICAgIHdyYXBwZXIuYWRkKHRoaXMubm9kZS5jbG9uZU5vZGUodHJ1ZSkpXG5cbiAgICAgIHJldHVybiB3cmFwcGVyLnhtbChmYWxzZSwgbnMpXG4gICAgfVxuXG4gICAgLy8gQWN0IGFzIHNldHRlciBpZiB3ZSBnb3QgYSBzdHJpbmdcbiAgICByZXR1cm4gc3VwZXIueG1sKHhtbE9yRm4sIGZhbHNlLCBucylcbiAgfVxuXG59XG5cbnJlZ2lzdGVyKEZyYWdtZW50LCAnRnJhZ21lbnQnKVxuXG5leHBvcnQgZGVmYXVsdCBGcmFnbWVudFxuIiwiaW1wb3J0IFNWR051bWJlciBmcm9tICcuLi8uLi90eXBlcy9TVkdOdW1iZXIuanMnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZnJvbSAoeCwgeSkge1xyXG4gIHJldHVybiAodGhpcy5fZWxlbWVudCB8fCB0aGlzKS50eXBlID09PSAncmFkaWFsR3JhZGllbnQnXHJcbiAgICA/IHRoaXMuYXR0cih7IGZ4OiBuZXcgU1ZHTnVtYmVyKHgpLCBmeTogbmV3IFNWR051bWJlcih5KSB9KVxyXG4gICAgOiB0aGlzLmF0dHIoeyB4MTogbmV3IFNWR051bWJlcih4KSwgeTE6IG5ldyBTVkdOdW1iZXIoeSkgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvICh4LCB5KSB7XHJcbiAgcmV0dXJuICh0aGlzLl9lbGVtZW50IHx8IHRoaXMpLnR5cGUgPT09ICdyYWRpYWxHcmFkaWVudCdcclxuICAgID8gdGhpcy5hdHRyKHsgY3g6IG5ldyBTVkdOdW1iZXIoeCksIGN5OiBuZXcgU1ZHTnVtYmVyKHkpIH0pXHJcbiAgICA6IHRoaXMuYXR0cih7IHgyOiBuZXcgU1ZHTnVtYmVyKHgpLCB5MjogbmV3IFNWR051bWJlcih5KSB9KVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBCb3ggZnJvbSAnLi4vdHlwZXMvQm94LmpzJ1xyXG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vQ29udGFpbmVyLmpzJ1xyXG5pbXBvcnQgYmFzZUZpbmQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3NlbGVjdG9yLmpzJ1xyXG5pbXBvcnQgKiBhcyBncmFkaWVudGVkIGZyb20gJy4uL21vZHVsZXMvY29yZS9ncmFkaWVudGVkLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR3JhZGllbnQgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yICh0eXBlLCBhdHRycykge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIG5vZGVPck5ldyh0eXBlICsgJ0dyYWRpZW50JywgdHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnID8gbnVsbCA6IHR5cGUpLFxyXG4gICAgICBhdHRyc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLy8gY3VzdG9tIGF0dHIgdG8gaGFuZGxlIHRyYW5zZm9ybVxyXG4gIGF0dHIgKGEsIGIsIGMpIHtcclxuICAgIGlmIChhID09PSAndHJhbnNmb3JtJykgYSA9ICdncmFkaWVudFRyYW5zZm9ybSdcclxuICAgIHJldHVybiBzdXBlci5hdHRyKGEsIGIsIGMpXHJcbiAgfVxyXG5cclxuICBiYm94ICgpIHtcclxuICAgIHJldHVybiBuZXcgQm94KClcclxuICB9XHJcblxyXG4gIHRhcmdldHMgKCkge1xyXG4gICAgcmV0dXJuIGJhc2VGaW5kKCdzdmcgW2ZpbGwqPVwiJyArIHRoaXMuaWQoKSArICdcIl0nKVxyXG4gIH1cclxuXHJcbiAgLy8gQWxpYXMgc3RyaW5nIGNvbnZlcnNpb24gdG8gZmlsbFxyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiB0aGlzLnVybCgpXHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGUgZ3JhZGllbnRcclxuICB1cGRhdGUgKGJsb2NrKSB7XHJcbiAgICAvLyByZW1vdmUgYWxsIHN0b3BzXHJcbiAgICB0aGlzLmNsZWFyKClcclxuXHJcbiAgICAvLyBpbnZva2UgcGFzc2VkIGJsb2NrXHJcbiAgICBpZiAodHlwZW9mIGJsb2NrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGJsb2NrLmNhbGwodGhpcywgdGhpcylcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gUmV0dXJuIHRoZSBmaWxsIGlkXHJcbiAgdXJsICgpIHtcclxuICAgIHJldHVybiAndXJsKFwiIycgKyB0aGlzLmlkKCkgKyAnXCIpJ1xyXG4gIH1cclxufVxyXG5cclxuZXh0ZW5kKEdyYWRpZW50LCBncmFkaWVudGVkKVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBDb250YWluZXI6IHtcclxuICAgIC8vIENyZWF0ZSBncmFkaWVudCBlbGVtZW50IGluIGRlZnNcclxuICAgIGdyYWRpZW50ICguLi5hcmdzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRlZnMoKS5ncmFkaWVudCguLi5hcmdzKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gZGVmaW5lIGdyYWRpZW50XHJcbiAgRGVmczoge1xyXG4gICAgZ3JhZGllbnQ6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICh0eXBlLCBibG9jaykge1xyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IEdyYWRpZW50KHR5cGUpKS51cGRhdGUoYmxvY2spXHJcbiAgICB9KVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKEdyYWRpZW50LCAnR3JhZGllbnQnKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBCb3ggZnJvbSAnLi4vdHlwZXMvQm94LmpzJ1xyXG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vQ29udGFpbmVyLmpzJ1xyXG5pbXBvcnQgYmFzZUZpbmQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3NlbGVjdG9yLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0dGVybiBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdwYXR0ZXJuJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgLy8gY3VzdG9tIGF0dHIgdG8gaGFuZGxlIHRyYW5zZm9ybVxyXG4gIGF0dHIgKGEsIGIsIGMpIHtcclxuICAgIGlmIChhID09PSAndHJhbnNmb3JtJykgYSA9ICdwYXR0ZXJuVHJhbnNmb3JtJ1xyXG4gICAgcmV0dXJuIHN1cGVyLmF0dHIoYSwgYiwgYylcclxuICB9XHJcblxyXG4gIGJib3ggKCkge1xyXG4gICAgcmV0dXJuIG5ldyBCb3goKVxyXG4gIH1cclxuXHJcbiAgdGFyZ2V0cyAoKSB7XHJcbiAgICByZXR1cm4gYmFzZUZpbmQoJ3N2ZyBbZmlsbCo9XCInICsgdGhpcy5pZCgpICsgJ1wiXScpXHJcbiAgfVxyXG5cclxuICAvLyBBbGlhcyBzdHJpbmcgY29udmVyc2lvbiB0byBmaWxsXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudXJsKClcclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZSBwYXR0ZXJuIGJ5IHJlYnVpbGRpbmdcclxuICB1cGRhdGUgKGJsb2NrKSB7XHJcbiAgICAvLyByZW1vdmUgY29udGVudFxyXG4gICAgdGhpcy5jbGVhcigpXHJcblxyXG4gICAgLy8gaW52b2tlIHBhc3NlZCBibG9ja1xyXG4gICAgaWYgKHR5cGVvZiBibG9jayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICBibG9jay5jYWxsKHRoaXMsIHRoaXMpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIFJldHVybiB0aGUgZmlsbCBpZFxyXG4gIHVybCAoKSB7XHJcbiAgICByZXR1cm4gJ3VybChcIiMnICsgdGhpcy5pZCgpICsgJ1wiKSdcclxuICB9XHJcblxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgLy8gQ3JlYXRlIHBhdHRlcm4gZWxlbWVudCBpbiBkZWZzXHJcbiAgICBwYXR0ZXJuICguLi5hcmdzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRlZnMoKS5wYXR0ZXJuKC4uLmFyZ3MpXHJcbiAgICB9XHJcbiAgfSxcclxuICBEZWZzOiB7XHJcbiAgICBwYXR0ZXJuOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAod2lkdGgsIGhlaWdodCwgYmxvY2spIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBQYXR0ZXJuKCkpLnVwZGF0ZShibG9jaykuYXR0cih7XHJcbiAgICAgICAgeDogMCxcclxuICAgICAgICB5OiAwLFxyXG4gICAgICAgIHdpZHRoOiB3aWR0aCxcclxuICAgICAgICBoZWlnaHQ6IGhlaWdodCxcclxuICAgICAgICBwYXR0ZXJuVW5pdHM6ICd1c2VyU3BhY2VPblVzZSdcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoUGF0dGVybiwgJ1BhdHRlcm4nKVxyXG4iLCJpbXBvcnQgeyBpc0ltYWdlIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3JlZ2V4LmpzJ1xyXG5pbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IG9mZiwgb24gfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvZXZlbnQuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyQXR0ckhvb2sgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvYXR0ci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IHsgeGxpbmsgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvbmFtZXNwYWNlcy5qcydcclxuaW1wb3J0IFBhdHRlcm4gZnJvbSAnLi9QYXR0ZXJuLmpzJ1xyXG5pbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcydcclxuaW1wb3J0IHsgZ2xvYmFscyB9IGZyb20gJy4uL3V0aWxzL3dpbmRvdy5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEltYWdlIGV4dGVuZHMgU2hhcGUge1xyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygnaW1hZ2UnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG5cclxuICAvLyAocmUpbG9hZCBpbWFnZVxyXG4gIGxvYWQgKHVybCwgY2FsbGJhY2spIHtcclxuICAgIGlmICghdXJsKSByZXR1cm4gdGhpc1xyXG5cclxuICAgIGNvbnN0IGltZyA9IG5ldyBnbG9iYWxzLndpbmRvdy5JbWFnZSgpXHJcblxyXG4gICAgb24oaW1nLCAnbG9hZCcsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGNvbnN0IHAgPSB0aGlzLnBhcmVudChQYXR0ZXJuKVxyXG5cclxuICAgICAgLy8gZW5zdXJlIGltYWdlIHNpemVcclxuICAgICAgaWYgKHRoaXMud2lkdGgoKSA9PT0gMCAmJiB0aGlzLmhlaWdodCgpID09PSAwKSB7XHJcbiAgICAgICAgdGhpcy5zaXplKGltZy53aWR0aCwgaW1nLmhlaWdodClcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHAgaW5zdGFuY2VvZiBQYXR0ZXJuKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIHBhdHRlcm4gc2l6ZSBpZiBub3Qgc2V0XHJcbiAgICAgICAgaWYgKHAud2lkdGgoKSA9PT0gMCAmJiBwLmhlaWdodCgpID09PSAwKSB7XHJcbiAgICAgICAgICBwLnNpemUodGhpcy53aWR0aCgpLCB0aGlzLmhlaWdodCgpKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgZSlcclxuICAgICAgfVxyXG4gICAgfSwgdGhpcylcclxuXHJcbiAgICBvbihpbWcsICdsb2FkIGVycm9yJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAvLyBkb250IGZvcmdldCB0byB1bmJpbmQgbWVtb3J5IGxlYWtpbmcgZXZlbnRzXHJcbiAgICAgIG9mZihpbWcpXHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnLCAoaW1nLnNyYyA9IHVybCksIHhsaW5rKVxyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXJBdHRySG9vayhmdW5jdGlvbiAoYXR0ciwgdmFsLCBfdGhpcykge1xyXG4gIC8vIGNvbnZlcnQgaW1hZ2UgZmlsbCBhbmQgc3Ryb2tlIHRvIHBhdHRlcm5zXHJcbiAgaWYgKGF0dHIgPT09ICdmaWxsJyB8fCBhdHRyID09PSAnc3Ryb2tlJykge1xyXG4gICAgaWYgKGlzSW1hZ2UudGVzdCh2YWwpKSB7XHJcbiAgICAgIHZhbCA9IF90aGlzLnJvb3QoKS5kZWZzKCkuaW1hZ2UodmFsKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEltYWdlKSB7XHJcbiAgICB2YWwgPSBfdGhpcy5yb290KCkuZGVmcygpLnBhdHRlcm4oMCwgMCwgKHBhdHRlcm4pID0+IHtcclxuICAgICAgcGF0dGVybi5hZGQodmFsKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHJldHVybiB2YWxcclxufSlcclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBjcmVhdGUgaW1hZ2UgZWxlbWVudCwgbG9hZCBpbWFnZSBhbmQgc2V0IGl0cyBzaXplXHJcbiAgICBpbWFnZTogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHNvdXJjZSwgY2FsbGJhY2spIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBJbWFnZSgpKS5zaXplKDAsIDApLmxvYWQoc291cmNlLCBjYWxsYmFjaylcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoSW1hZ2UsICdJbWFnZScpXHJcbiIsImltcG9ydCB7IGRlbGltaXRlciB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9yZWdleC5qcydcclxuaW1wb3J0IFNWR0FycmF5IGZyb20gJy4vU1ZHQXJyYXkuanMnXHJcbmltcG9ydCBCb3ggZnJvbSAnLi9Cb3guanMnXHJcbmltcG9ydCBNYXRyaXggZnJvbSAnLi9NYXRyaXguanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2ludEFycmF5IGV4dGVuZHMgU1ZHQXJyYXkge1xyXG4gIC8vIEdldCBib3VuZGluZyBib3ggb2YgcG9pbnRzXHJcbiAgYmJveCAoKSB7XHJcbiAgICBsZXQgbWF4WCA9IC1JbmZpbml0eVxyXG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHlcclxuICAgIGxldCBtaW5YID0gSW5maW5pdHlcclxuICAgIGxldCBtaW5ZID0gSW5maW5pdHlcclxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgbWF4WCA9IE1hdGgubWF4KGVsWzBdLCBtYXhYKVxyXG4gICAgICBtYXhZID0gTWF0aC5tYXgoZWxbMV0sIG1heFkpXHJcbiAgICAgIG1pblggPSBNYXRoLm1pbihlbFswXSwgbWluWClcclxuICAgICAgbWluWSA9IE1hdGgubWluKGVsWzFdLCBtaW5ZKVxyXG4gICAgfSlcclxuICAgIHJldHVybiBuZXcgQm94KG1pblgsIG1pblksIG1heFggLSBtaW5YLCBtYXhZIC0gbWluWSlcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgcG9pbnQgc3RyaW5nXHJcbiAgbW92ZSAoeCwgeSkge1xyXG4gICAgY29uc3QgYm94ID0gdGhpcy5iYm94KClcclxuXHJcbiAgICAvLyBnZXQgcmVsYXRpdmUgb2Zmc2V0XHJcbiAgICB4IC09IGJveC54XHJcbiAgICB5IC09IGJveC55XHJcblxyXG4gICAgLy8gbW92ZSBldmVyeSBwb2ludFxyXG4gICAgaWYgKCFpc05hTih4KSAmJiAhaXNOYU4oeSkpIHtcclxuICAgICAgZm9yIChsZXQgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICB0aGlzW2ldID0gWyB0aGlzW2ldWzBdICsgeCwgdGhpc1tpXVsxXSArIHkgXVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIFBhcnNlIHBvaW50IHN0cmluZyBhbmQgZmxhdCBhcnJheVxyXG4gIHBhcnNlIChhcnJheSA9IFsgMCwgMCBdKSB7XHJcbiAgICBjb25zdCBwb2ludHMgPSBbXVxyXG5cclxuICAgIC8vIGlmIGl0IGlzIGFuIGFycmF5LCB3ZSBmbGF0dGVuIGl0IGFuZCB0aGVyZWZvcmUgY2xvbmUgaXQgdG8gMSBkZXB0aHNcclxuICAgIGlmIChhcnJheSBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgIGFycmF5ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgYXJyYXkpXHJcbiAgICB9IGVsc2UgeyAvLyBFbHNlLCBpdCBpcyBjb25zaWRlcmVkIGFzIGEgc3RyaW5nXHJcbiAgICAgIC8vIHBhcnNlIHBvaW50c1xyXG4gICAgICBhcnJheSA9IGFycmF5LnRyaW0oKS5zcGxpdChkZWxpbWl0ZXIpLm1hcChwYXJzZUZsb2F0KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHZhbGlkYXRlIHBvaW50cyAtIGh0dHBzOi8vc3Znd2cub3JnL3N2ZzItZHJhZnQvc2hhcGVzLmh0bWwjRGF0YVR5cGVQb2ludHNcclxuICAgIC8vIE9kZCBudW1iZXIgb2YgY29vcmRpbmF0ZXMgaXMgYW4gZXJyb3IuIEluIHN1Y2ggY2FzZXMsIGRyb3AgdGhlIGxhc3Qgb2RkIGNvb3JkaW5hdGUuXHJcbiAgICBpZiAoYXJyYXkubGVuZ3RoICUgMiAhPT0gMCkgYXJyYXkucG9wKClcclxuXHJcbiAgICAvLyB3cmFwIHBvaW50cyBpbiB0d28tdHVwbGVzXHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgbGVuOyBpID0gaSArIDIpIHtcclxuICAgICAgcG9pbnRzLnB1c2goWyBhcnJheVtpXSwgYXJyYXlbaSArIDFdIF0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvaW50c1xyXG4gIH1cclxuXHJcbiAgLy8gUmVzaXplIHBvbHkgc3RyaW5nXHJcbiAgc2l6ZSAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgbGV0IGlcclxuICAgIGNvbnN0IGJveCA9IHRoaXMuYmJveCgpXHJcblxyXG4gICAgLy8gcmVjYWxjdWxhdGUgcG9zaXRpb24gb2YgYWxsIHBvaW50cyBhY2NvcmRpbmcgdG8gbmV3IHNpemVcclxuICAgIGZvciAoaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgaWYgKGJveC53aWR0aCkgdGhpc1tpXVswXSA9ICgodGhpc1tpXVswXSAtIGJveC54KSAqIHdpZHRoKSAvIGJveC53aWR0aCArIGJveC54XHJcbiAgICAgIGlmIChib3guaGVpZ2h0KSB0aGlzW2ldWzFdID0gKCh0aGlzW2ldWzFdIC0gYm94LnkpICogaGVpZ2h0KSAvIGJveC5oZWlnaHQgKyBib3gueVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBDb252ZXJ0IGFycmF5IHRvIGxpbmUgb2JqZWN0XHJcbiAgdG9MaW5lICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHgxOiB0aGlzWzBdWzBdLFxyXG4gICAgICB5MTogdGhpc1swXVsxXSxcclxuICAgICAgeDI6IHRoaXNbMV1bMF0sXHJcbiAgICAgIHkyOiB0aGlzWzFdWzFdXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBDb252ZXJ0IGFycmF5IHRvIHN0cmluZ1xyXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIGNvbnN0IGFycmF5ID0gW11cclxuICAgIC8vIGNvbnZlcnQgdG8gYSBwb2x5IHBvaW50IHN0cmluZ1xyXG4gICAgZm9yIChsZXQgaSA9IDAsIGlsID0gdGhpcy5sZW5ndGg7IGkgPCBpbDsgaSsrKSB7XHJcbiAgICAgIGFycmF5LnB1c2godGhpc1tpXS5qb2luKCcsJykpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFycmF5LmpvaW4oJyAnKVxyXG4gIH1cclxuXHJcbiAgdHJhbnNmb3JtIChtKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jbG9uZSgpLnRyYW5zZm9ybU8obSlcclxuICB9XHJcblxyXG4gIC8vIHRyYW5zZm9ybSBwb2ludHMgd2l0aCBtYXRyaXggKHNpbWlsYXIgdG8gUG9pbnQudHJhbnNmb3JtKVxyXG4gIHRyYW5zZm9ybU8gKG0pIHtcclxuICAgIGlmICghTWF0cml4LmlzTWF0cml4TGlrZShtKSkge1xyXG4gICAgICBtID0gbmV3IE1hdHJpeChtKVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSB0aGlzLmxlbmd0aDsgaS0tOykge1xyXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtYXRyaXggbXVsdGlwbGljYXRpb25cclxuICAgICAgY29uc3QgWyB4LCB5IF0gPSB0aGlzW2ldXHJcbiAgICAgIHRoaXNbaV1bMF0gPSBtLmEgKiB4ICsgbS5jICogeSArIG0uZVxyXG4gICAgICB0aGlzW2ldWzFdID0gbS5iICogeCArIG0uZCAqIHkgKyBtLmZcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbn1cclxuIiwiaW1wb3J0IFBvaW50QXJyYXkgZnJvbSAnLi4vLi4vdHlwZXMvUG9pbnRBcnJheS5qcydcclxuXHJcbmV4cG9ydCBjb25zdCBNb3JwaEFycmF5ID0gUG9pbnRBcnJheVxyXG5cclxuLy8gTW92ZSBieSBsZWZ0IHRvcCBjb3JuZXIgb3ZlciB4LWF4aXNcclxuZXhwb3J0IGZ1bmN0aW9uIHggKHgpIHtcclxuICByZXR1cm4geCA9PSBudWxsID8gdGhpcy5iYm94KCkueCA6IHRoaXMubW92ZSh4LCB0aGlzLmJib3goKS55KVxyXG59XHJcblxyXG4vLyBNb3ZlIGJ5IGxlZnQgdG9wIGNvcm5lciBvdmVyIHktYXhpc1xyXG5leHBvcnQgZnVuY3Rpb24geSAoeSkge1xyXG4gIHJldHVybiB5ID09IG51bGwgPyB0aGlzLmJib3goKS55IDogdGhpcy5tb3ZlKHRoaXMuYmJveCgpLngsIHkpXHJcbn1cclxuXHJcbi8vIFNldCB3aWR0aCBvZiBlbGVtZW50XHJcbmV4cG9ydCBmdW5jdGlvbiB3aWR0aCAod2lkdGgpIHtcclxuICBjb25zdCBiID0gdGhpcy5iYm94KClcclxuICByZXR1cm4gd2lkdGggPT0gbnVsbCA/IGIud2lkdGggOiB0aGlzLnNpemUod2lkdGgsIGIuaGVpZ2h0KVxyXG59XHJcblxyXG4vLyBTZXQgaGVpZ2h0IG9mIGVsZW1lbnRcclxuZXhwb3J0IGZ1bmN0aW9uIGhlaWdodCAoaGVpZ2h0KSB7XHJcbiAgY29uc3QgYiA9IHRoaXMuYmJveCgpXHJcbiAgcmV0dXJuIGhlaWdodCA9PSBudWxsID8gYi5oZWlnaHQgOiB0aGlzLnNpemUoYi53aWR0aCwgaGVpZ2h0KVxyXG59XHJcbiIsImltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHByb3BvcnRpb25hbFNpemUgfSBmcm9tICcuLi91dGlscy91dGlscy5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IFBvaW50QXJyYXkgZnJvbSAnLi4vdHlwZXMvUG9pbnRBcnJheS5qcydcclxuaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnXHJcbmltcG9ydCAqIGFzIHBvaW50ZWQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3BvaW50ZWQuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lIGV4dGVuZHMgU2hhcGUge1xyXG4gIC8vIEluaXRpYWxpemUgbm9kZVxyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygnbGluZScsIG5vZGUpLCBhdHRycylcclxuICB9XHJcblxyXG4gIC8vIEdldCBhcnJheVxyXG4gIGFycmF5ICgpIHtcclxuICAgIHJldHVybiBuZXcgUG9pbnRBcnJheShbXHJcbiAgICAgIFsgdGhpcy5hdHRyKCd4MScpLCB0aGlzLmF0dHIoJ3kxJykgXSxcclxuICAgICAgWyB0aGlzLmF0dHIoJ3gyJyksIHRoaXMuYXR0cigneTInKSBdXHJcbiAgICBdKVxyXG4gIH1cclxuXHJcbiAgLy8gTW92ZSBieSBsZWZ0IHRvcCBjb3JuZXJcclxuICBtb3ZlICh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKHRoaXMuYXJyYXkoKS5tb3ZlKHgsIHkpLnRvTGluZSgpKVxyXG4gIH1cclxuXHJcbiAgLy8gT3ZlcndyaXRlIG5hdGl2ZSBwbG90KCkgbWV0aG9kXHJcbiAgcGxvdCAoeDEsIHkxLCB4MiwgeTIpIHtcclxuICAgIGlmICh4MSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFycmF5KClcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHkxICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB4MSA9IHsgeDEsIHkxLCB4MiwgeTIgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgeDEgPSBuZXcgUG9pbnRBcnJheSh4MSkudG9MaW5lKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKHgxKVxyXG4gIH1cclxuXHJcbiAgLy8gU2V0IGVsZW1lbnQgc2l6ZSB0byBnaXZlbiB3aWR0aCBhbmQgaGVpZ2h0XHJcbiAgc2l6ZSAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgY29uc3QgcCA9IHByb3BvcnRpb25hbFNpemUodGhpcywgd2lkdGgsIGhlaWdodClcclxuICAgIHJldHVybiB0aGlzLmF0dHIodGhpcy5hcnJheSgpLnNpemUocC53aWR0aCwgcC5oZWlnaHQpLnRvTGluZSgpKVxyXG4gIH1cclxufVxyXG5cclxuZXh0ZW5kKExpbmUsIHBvaW50ZWQpXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgLy8gQ3JlYXRlIGEgbGluZSBlbGVtZW50XHJcbiAgICBsaW5lOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAoLi4uYXJncykge1xyXG4gICAgICAvLyBtYWtlIHN1cmUgcGxvdCBpcyBjYWxsZWQgYXMgYSBzZXR0ZXJcclxuICAgICAgLy8geDEgaXMgbm90IG5lY2Vzc2FyaWx5IGEgbnVtYmVyLCBpdCBjYW4gYWxzbyBiZSBhbiBhcnJheSwgYSBzdHJpbmcgYW5kIGEgUG9pbnRBcnJheVxyXG4gICAgICByZXR1cm4gTGluZS5wcm90b3R5cGUucGxvdC5hcHBseShcclxuICAgICAgICB0aGlzLnB1dChuZXcgTGluZSgpKVxyXG4gICAgICAgICwgYXJnc1swXSAhPSBudWxsID8gYXJncyA6IFsgMCwgMCwgMCwgMCBdXHJcbiAgICAgIClcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoTGluZSwgJ0xpbmUnKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9Db250YWluZXIuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXJrZXIgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIC8vIEluaXRpYWxpemUgbm9kZVxyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygnbWFya2VyJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgLy8gU2V0IGhlaWdodCBvZiBlbGVtZW50XG4gIGhlaWdodCAoaGVpZ2h0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdtYXJrZXJIZWlnaHQnLCBoZWlnaHQpXHJcbiAgfVxuXG4gIG9yaWVudCAob3JpZW50KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdvcmllbnQnLCBvcmllbnQpXHJcbiAgfVxuXG4gIC8vIFNldCBtYXJrZXIgcmVmWCBhbmQgcmVmWVxuICByZWYgKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ3JlZlgnLCB4KS5hdHRyKCdyZWZZJywgeSlcclxuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBmaWxsIGlkXG4gIHRvU3RyaW5nICgpIHtcclxuICAgIHJldHVybiAndXJsKCMnICsgdGhpcy5pZCgpICsgJyknXHJcbiAgfVxuXG4gIC8vIFVwZGF0ZSBtYXJrZXJcbiAgdXBkYXRlIChibG9jaykge1xyXG4gICAgLy8gcmVtb3ZlIGFsbCBjb250ZW50XHJcbiAgICB0aGlzLmNsZWFyKClcclxuXHJcbiAgICAvLyBpbnZva2UgcGFzc2VkIGJsb2NrXHJcbiAgICBpZiAodHlwZW9mIGJsb2NrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIGJsb2NrLmNhbGwodGhpcywgdGhpcylcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cblxuICAvLyBTZXQgd2lkdGggb2YgZWxlbWVudFxyXG4gIHdpZHRoICh3aWR0aCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0cignbWFya2VyV2lkdGgnLCB3aWR0aClcclxuICB9XHJcblxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgbWFya2VyICguLi5hcmdzKSB7XHJcbiAgICAgIC8vIENyZWF0ZSBtYXJrZXIgZWxlbWVudCBpbiBkZWZzXHJcbiAgICAgIHJldHVybiB0aGlzLmRlZnMoKS5tYXJrZXIoLi4uYXJncylcclxuICAgIH1cclxuICB9LFxyXG4gIERlZnM6IHtcclxuICAgIC8vIENyZWF0ZSBtYXJrZXJcclxuICAgIG1hcmtlcjogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQsIGJsb2NrKSB7XHJcbiAgICAgIC8vIFNldCBkZWZhdWx0IHZpZXdib3ggdG8gbWF0Y2ggdGhlIHdpZHRoIGFuZCBoZWlnaHQsIHNldCByZWYgdG8gY3ggYW5kIGN5IGFuZCBzZXQgb3JpZW50IHRvIGF1dG9cclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBNYXJrZXIoKSlcclxuICAgICAgICAuc2l6ZSh3aWR0aCwgaGVpZ2h0KVxyXG4gICAgICAgIC5yZWYod2lkdGggLyAyLCBoZWlnaHQgLyAyKVxyXG4gICAgICAgIC52aWV3Ym94KDAsIDAsIHdpZHRoLCBoZWlnaHQpXHJcbiAgICAgICAgLmF0dHIoJ29yaWVudCcsICdhdXRvJylcclxuICAgICAgICAudXBkYXRlKGJsb2NrKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIG1hcmtlcjoge1xyXG4gICAgLy8gQ3JlYXRlIGFuZCBhdHRhY2ggbWFya2Vyc1xyXG4gICAgbWFya2VyIChtYXJrZXIsIHdpZHRoLCBoZWlnaHQsIGJsb2NrKSB7XHJcbiAgICAgIGxldCBhdHRyID0gWyAnbWFya2VyJyBdXHJcblxyXG4gICAgICAvLyBCdWlsZCBhdHRyaWJ1dGUgbmFtZVxyXG4gICAgICBpZiAobWFya2VyICE9PSAnYWxsJykgYXR0ci5wdXNoKG1hcmtlcilcclxuICAgICAgYXR0ciA9IGF0dHIuam9pbignLScpXHJcblxyXG4gICAgICAvLyBTZXQgbWFya2VyIGF0dHJpYnV0ZVxyXG4gICAgICBtYXJrZXIgPSBhcmd1bWVudHNbMV0gaW5zdGFuY2VvZiBNYXJrZXJcclxuICAgICAgICA/IGFyZ3VtZW50c1sxXVxyXG4gICAgICAgIDogdGhpcy5kZWZzKCkubWFya2VyKHdpZHRoLCBoZWlnaHQsIGJsb2NrKVxyXG5cclxuICAgICAgcmV0dXJuIHRoaXMuYXR0cihhdHRyLCBtYXJrZXIpXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoTWFya2VyLCAnTWFya2VyJylcclxuIiwiaW1wb3J0IHsgdGltZWxpbmUgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvZGVmYXVsdHMuanMnXHJcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcblxyXG4vKioqXHJcbkJhc2UgQ2xhc3NcclxuPT09PT09PT09PVxyXG5UaGUgYmFzZSBzdGVwcGVyIGNsYXNzIHRoYXQgd2lsbCBiZVxyXG4qKiovXHJcblxyXG5mdW5jdGlvbiBtYWtlU2V0dGVyR2V0dGVyIChrLCBmKSB7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XHJcbiAgICBpZiAodiA9PSBudWxsKSByZXR1cm4gdGhpc1trXVxyXG4gICAgdGhpc1trXSA9IHZcclxuICAgIGlmIChmKSBmLmNhbGwodGhpcylcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY29uc3QgZWFzaW5nID0ge1xyXG4gICctJzogZnVuY3Rpb24gKHBvcykge1xyXG4gICAgcmV0dXJuIHBvc1xyXG4gIH0sXHJcbiAgJzw+JzogZnVuY3Rpb24gKHBvcykge1xyXG4gICAgcmV0dXJuIC1NYXRoLmNvcyhwb3MgKiBNYXRoLlBJKSAvIDIgKyAwLjVcclxuICB9LFxyXG4gICc+JzogZnVuY3Rpb24gKHBvcykge1xyXG4gICAgcmV0dXJuIE1hdGguc2luKHBvcyAqIE1hdGguUEkgLyAyKVxyXG4gIH0sXHJcbiAgJzwnOiBmdW5jdGlvbiAocG9zKSB7XHJcbiAgICByZXR1cm4gLU1hdGguY29zKHBvcyAqIE1hdGguUEkgLyAyKSArIDFcclxuICB9LFxyXG4gIGJlemllcjogZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XHJcbiAgICAvLyBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL2Nzcy1lYXNpbmctMS8jY3ViaWMtYmV6aWVyLWFsZ29cclxuICAgIHJldHVybiBmdW5jdGlvbiAodCkge1xyXG4gICAgICBpZiAodCA8IDApIHtcclxuICAgICAgICBpZiAoeDEgPiAwKSB7XHJcbiAgICAgICAgICByZXR1cm4geTEgLyB4MSAqIHRcclxuICAgICAgICB9IGVsc2UgaWYgKHgyID4gMCkge1xyXG4gICAgICAgICAgcmV0dXJuIHkyIC8geDIgKiB0XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiAwXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHQgPiAxKSB7XHJcbiAgICAgICAgaWYgKHgyIDwgMSkge1xyXG4gICAgICAgICAgcmV0dXJuICgxIC0geTIpIC8gKDEgLSB4MikgKiB0ICsgKHkyIC0geDIpIC8gKDEgLSB4MilcclxuICAgICAgICB9IGVsc2UgaWYgKHgxIDwgMSkge1xyXG4gICAgICAgICAgcmV0dXJuICgxIC0geTEpIC8gKDEgLSB4MSkgKiB0ICsgKHkxIC0geDEpIC8gKDEgLSB4MSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIDFcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIDMgKiB0ICogKDEgLSB0KSAqKiAyICogeTEgKyAzICogdCAqKiAyICogKDEgLSB0KSAqIHkyICsgdCAqKiAzXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIC8vIHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvY3NzLWVhc2luZy0xLyNzdGVwLXRpbWluZy1mdW5jdGlvbi1hbGdvXHJcbiAgc3RlcHM6IGZ1bmN0aW9uIChzdGVwcywgc3RlcFBvc2l0aW9uID0gJ2VuZCcpIHtcclxuICAgIC8vIGRlYWwgd2l0aCBcImp1bXAtXCIgcHJlZml4XHJcbiAgICBzdGVwUG9zaXRpb24gPSBzdGVwUG9zaXRpb24uc3BsaXQoJy0nKS5yZXZlcnNlKClbMF1cclxuXHJcbiAgICBsZXQganVtcHMgPSBzdGVwc1xyXG4gICAgaWYgKHN0ZXBQb3NpdGlvbiA9PT0gJ25vbmUnKSB7XHJcbiAgICAgIC0tanVtcHNcclxuICAgIH0gZWxzZSBpZiAoc3RlcFBvc2l0aW9uID09PSAnYm90aCcpIHtcclxuICAgICAgKytqdW1wc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRoZSBiZWZvcmVGbGFnIGlzIGVzc2VudGlhbGx5IHVzZWxlc3NcclxuICAgIHJldHVybiAodCwgYmVmb3JlRmxhZyA9IGZhbHNlKSA9PiB7XHJcbiAgICAgIC8vIFN0ZXAgaXMgY2FsbGVkIGN1cnJlbnRTdGVwIGluIHJlZmVyZW5jZWQgdXJsXHJcbiAgICAgIGxldCBzdGVwID0gTWF0aC5mbG9vcih0ICogc3RlcHMpXHJcbiAgICAgIGNvbnN0IGp1bXBpbmcgPSAodCAqIHN0ZXApICUgMSA9PT0gMFxyXG5cclxuICAgICAgaWYgKHN0ZXBQb3NpdGlvbiA9PT0gJ3N0YXJ0JyB8fCBzdGVwUG9zaXRpb24gPT09ICdib3RoJykge1xyXG4gICAgICAgICsrc3RlcFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYmVmb3JlRmxhZyAmJiBqdW1waW5nKSB7XHJcbiAgICAgICAgLS1zdGVwXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh0ID49IDAgJiYgc3RlcCA8IDApIHtcclxuICAgICAgICBzdGVwID0gMFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodCA8PSAxICYmIHN0ZXAgPiBqdW1wcykge1xyXG4gICAgICAgIHN0ZXAgPSBqdW1wc1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gc3RlcCAvIGp1bXBzXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU3RlcHBlciB7XHJcbiAgZG9uZSAoKSB7XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcbn1cclxuXHJcbi8qKipcclxuRWFzaW5nIEZ1bmN0aW9uc1xyXG49PT09PT09PT09PT09PT09XHJcbioqKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBFYXNlIGV4dGVuZHMgU3RlcHBlciB7XHJcbiAgY29uc3RydWN0b3IgKGZuID0gdGltZWxpbmUuZWFzZSkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5lYXNlID0gZWFzaW5nW2ZuXSB8fCBmblxyXG4gIH1cclxuXHJcbiAgc3RlcCAoZnJvbSwgdG8sIHBvcykge1xyXG4gICAgaWYgKHR5cGVvZiBmcm9tICE9PSAnbnVtYmVyJykge1xyXG4gICAgICByZXR1cm4gcG9zIDwgMSA/IGZyb20gOiB0b1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZyb20gKyAodG8gLSBmcm9tKSAqIHRoaXMuZWFzZShwb3MpXHJcbiAgfVxyXG59XHJcblxyXG4vKioqXHJcbkNvbnRyb2xsZXIgVHlwZXNcclxuPT09PT09PT09PT09PT09PVxyXG4qKiovXHJcblxyXG5leHBvcnQgY2xhc3MgQ29udHJvbGxlciBleHRlbmRzIFN0ZXBwZXIge1xyXG4gIGNvbnN0cnVjdG9yIChmbikge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5zdGVwcGVyID0gZm5cclxuICB9XHJcblxyXG4gIGRvbmUgKGMpIHtcclxuICAgIHJldHVybiBjLmRvbmVcclxuICB9XG5cbiAgc3RlcCAoY3VycmVudCwgdGFyZ2V0LCBkdCwgYykge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RlcHBlcihjdXJyZW50LCB0YXJnZXQsIGR0LCBjKVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlY2FsY3VsYXRlICgpIHtcclxuICAvLyBBcHBseSB0aGUgZGVmYXVsdCBwYXJhbWV0ZXJzXHJcbiAgY29uc3QgZHVyYXRpb24gPSAodGhpcy5fZHVyYXRpb24gfHwgNTAwKSAvIDEwMDBcclxuICBjb25zdCBvdmVyc2hvb3QgPSB0aGlzLl9vdmVyc2hvb3QgfHwgMFxyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIFBJRCBuYXR1cmFsIHJlc3BvbnNlXHJcbiAgY29uc3QgZXBzID0gMWUtMTBcclxuICBjb25zdCBwaSA9IE1hdGguUElcclxuICBjb25zdCBvcyA9IE1hdGgubG9nKG92ZXJzaG9vdCAvIDEwMCArIGVwcylcclxuICBjb25zdCB6ZXRhID0gLW9zIC8gTWF0aC5zcXJ0KHBpICogcGkgKyBvcyAqIG9zKVxyXG4gIGNvbnN0IHduID0gMy45IC8gKHpldGEgKiBkdXJhdGlvbilcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBTcHJpbmcgdmFsdWVzXHJcbiAgdGhpcy5kID0gMiAqIHpldGEgKiB3blxyXG4gIHRoaXMuayA9IHduICogd25cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNwcmluZyBleHRlbmRzIENvbnRyb2xsZXIge1xyXG4gIGNvbnN0cnVjdG9yIChkdXJhdGlvbiA9IDUwMCwgb3ZlcnNob290ID0gMCkge1xyXG4gICAgc3VwZXIoKVxyXG4gICAgdGhpcy5kdXJhdGlvbihkdXJhdGlvbilcclxuICAgICAgLm92ZXJzaG9vdChvdmVyc2hvb3QpXHJcbiAgfVxyXG5cclxuICBzdGVwIChjdXJyZW50LCB0YXJnZXQsIGR0LCBjKSB7XHJcbiAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gY3VycmVudFxyXG4gICAgYy5kb25lID0gZHQgPT09IEluZmluaXR5XHJcbiAgICBpZiAoZHQgPT09IEluZmluaXR5KSByZXR1cm4gdGFyZ2V0XHJcbiAgICBpZiAoZHQgPT09IDApIHJldHVybiBjdXJyZW50XHJcblxyXG4gICAgaWYgKGR0ID4gMTAwKSBkdCA9IDE2XHJcblxyXG4gICAgZHQgLz0gMTAwMFxyXG5cclxuICAgIC8vIEdldCB0aGUgcHJldmlvdXMgdmVsb2NpdHlcclxuICAgIGNvbnN0IHZlbG9jaXR5ID0gYy52ZWxvY2l0eSB8fCAwXHJcblxyXG4gICAgLy8gQXBwbHkgdGhlIGNvbnRyb2wgdG8gZ2V0IHRoZSBuZXcgcG9zaXRpb24gYW5kIHN0b3JlIGl0XHJcbiAgICBjb25zdCBhY2NlbGVyYXRpb24gPSAtdGhpcy5kICogdmVsb2NpdHkgLSB0aGlzLmsgKiAoY3VycmVudCAtIHRhcmdldClcclxuICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gY3VycmVudFxyXG4gICAgICArIHZlbG9jaXR5ICogZHRcclxuICAgICAgKyBhY2NlbGVyYXRpb24gKiBkdCAqIGR0IC8gMlxyXG5cclxuICAgIC8vIFN0b3JlIHRoZSB2ZWxvY2l0eVxyXG4gICAgYy52ZWxvY2l0eSA9IHZlbG9jaXR5ICsgYWNjZWxlcmF0aW9uICogZHRcclxuXHJcbiAgICAvLyBGaWd1cmUgb3V0IGlmIHdlIGhhdmUgY29udmVyZ2VkLCBhbmQgaWYgc28sIHBhc3MgdGhlIHZhbHVlXHJcbiAgICBjLmRvbmUgPSBNYXRoLmFicyh0YXJnZXQgLSBuZXdQb3NpdGlvbikgKyBNYXRoLmFicyh2ZWxvY2l0eSkgPCAwLjAwMlxyXG4gICAgcmV0dXJuIGMuZG9uZSA/IHRhcmdldCA6IG5ld1Bvc2l0aW9uXHJcbiAgfVxyXG59XHJcblxyXG5leHRlbmQoU3ByaW5nLCB7XHJcbiAgZHVyYXRpb246IG1ha2VTZXR0ZXJHZXR0ZXIoJ19kdXJhdGlvbicsIHJlY2FsY3VsYXRlKSxcclxuICBvdmVyc2hvb3Q6IG1ha2VTZXR0ZXJHZXR0ZXIoJ19vdmVyc2hvb3QnLCByZWNhbGN1bGF0ZSlcclxufSlcclxuXHJcbmV4cG9ydCBjbGFzcyBQSUQgZXh0ZW5kcyBDb250cm9sbGVyIHtcclxuICBjb25zdHJ1Y3RvciAocCA9IDAuMSwgaSA9IDAuMDEsIGQgPSAwLCB3aW5kdXAgPSAxMDAwKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLnAocCkuaShpKS5kKGQpLndpbmR1cCh3aW5kdXApXHJcbiAgfVxyXG5cclxuICBzdGVwIChjdXJyZW50LCB0YXJnZXQsIGR0LCBjKSB7XHJcbiAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09ICdzdHJpbmcnKSByZXR1cm4gY3VycmVudFxyXG4gICAgYy5kb25lID0gZHQgPT09IEluZmluaXR5XHJcblxyXG4gICAgaWYgKGR0ID09PSBJbmZpbml0eSkgcmV0dXJuIHRhcmdldFxyXG4gICAgaWYgKGR0ID09PSAwKSByZXR1cm4gY3VycmVudFxyXG5cclxuICAgIGNvbnN0IHAgPSB0YXJnZXQgLSBjdXJyZW50XHJcbiAgICBsZXQgaSA9IChjLmludGVncmFsIHx8IDApICsgcCAqIGR0XHJcbiAgICBjb25zdCBkID0gKHAgLSAoYy5lcnJvciB8fCAwKSkgLyBkdFxyXG4gICAgY29uc3Qgd2luZHVwID0gdGhpcy5fd2luZHVwXHJcblxyXG4gICAgLy8gYW50aXdpbmR1cFxyXG4gICAgaWYgKHdpbmR1cCAhPT0gZmFsc2UpIHtcclxuICAgICAgaSA9IE1hdGgubWF4KC13aW5kdXAsIE1hdGgubWluKGksIHdpbmR1cCkpXHJcbiAgICB9XHJcblxyXG4gICAgYy5lcnJvciA9IHBcclxuICAgIGMuaW50ZWdyYWwgPSBpXHJcblxyXG4gICAgYy5kb25lID0gTWF0aC5hYnMocCkgPCAwLjAwMVxyXG5cclxuICAgIHJldHVybiBjLmRvbmUgPyB0YXJnZXQgOiBjdXJyZW50ICsgKHRoaXMuUCAqIHAgKyB0aGlzLkkgKiBpICsgdGhpcy5EICogZClcclxuICB9XHJcbn1cclxuXHJcbmV4dGVuZChQSUQsIHtcclxuICB3aW5kdXA6IG1ha2VTZXR0ZXJHZXR0ZXIoJ193aW5kdXAnKSxcclxuICBwOiBtYWtlU2V0dGVyR2V0dGVyKCdQJyksXHJcbiAgaTogbWFrZVNldHRlckdldHRlcignSScpLFxyXG4gIGQ6IG1ha2VTZXR0ZXJHZXR0ZXIoJ0QnKVxyXG59KVxyXG4iLCJpbXBvcnQgeyBpc1BhdGhMZXR0ZXIgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvcmVnZXguanMnXHJcbmltcG9ydCBQb2ludCBmcm9tICcuLi90eXBlcy9Qb2ludC5qcydcclxuXHJcbmNvbnN0IHNlZ21lbnRQYXJhbWV0ZXJzID0geyBNOiAyLCBMOiAyLCBIOiAxLCBWOiAxLCBDOiA2LCBTOiA0LCBROiA0LCBUOiAyLCBBOiA3LCBaOiAwIH1cclxuXHJcbmNvbnN0IHBhdGhIYW5kbGVycyA9IHtcclxuICBNOiBmdW5jdGlvbiAoYywgcCwgcDApIHtcclxuICAgIHAueCA9IHAwLnggPSBjWzBdXHJcbiAgICBwLnkgPSBwMC55ID0gY1sxXVxyXG5cclxuICAgIHJldHVybiBbICdNJywgcC54LCBwLnkgXVxyXG4gIH0sXHJcbiAgTDogZnVuY3Rpb24gKGMsIHApIHtcclxuICAgIHAueCA9IGNbMF1cclxuICAgIHAueSA9IGNbMV1cclxuICAgIHJldHVybiBbICdMJywgY1swXSwgY1sxXSBdXHJcbiAgfSxcclxuICBIOiBmdW5jdGlvbiAoYywgcCkge1xyXG4gICAgcC54ID0gY1swXVxyXG4gICAgcmV0dXJuIFsgJ0gnLCBjWzBdIF1cclxuICB9LFxyXG4gIFY6IGZ1bmN0aW9uIChjLCBwKSB7XHJcbiAgICBwLnkgPSBjWzBdXHJcbiAgICByZXR1cm4gWyAnVicsIGNbMF0gXVxyXG4gIH0sXHJcbiAgQzogZnVuY3Rpb24gKGMsIHApIHtcclxuICAgIHAueCA9IGNbNF1cclxuICAgIHAueSA9IGNbNV1cclxuICAgIHJldHVybiBbICdDJywgY1swXSwgY1sxXSwgY1syXSwgY1szXSwgY1s0XSwgY1s1XSBdXHJcbiAgfSxcclxuICBTOiBmdW5jdGlvbiAoYywgcCkge1xyXG4gICAgcC54ID0gY1syXVxyXG4gICAgcC55ID0gY1szXVxyXG4gICAgcmV0dXJuIFsgJ1MnLCBjWzBdLCBjWzFdLCBjWzJdLCBjWzNdIF1cclxuICB9LFxyXG4gIFE6IGZ1bmN0aW9uIChjLCBwKSB7XHJcbiAgICBwLnggPSBjWzJdXHJcbiAgICBwLnkgPSBjWzNdXHJcbiAgICByZXR1cm4gWyAnUScsIGNbMF0sIGNbMV0sIGNbMl0sIGNbM10gXVxyXG4gIH0sXHJcbiAgVDogZnVuY3Rpb24gKGMsIHApIHtcclxuICAgIHAueCA9IGNbMF1cclxuICAgIHAueSA9IGNbMV1cclxuICAgIHJldHVybiBbICdUJywgY1swXSwgY1sxXSBdXHJcbiAgfSxcclxuICBaOiBmdW5jdGlvbiAoYywgcCwgcDApIHtcclxuICAgIHAueCA9IHAwLnhcclxuICAgIHAueSA9IHAwLnlcclxuICAgIHJldHVybiBbICdaJyBdXHJcbiAgfSxcclxuICBBOiBmdW5jdGlvbiAoYywgcCkge1xyXG4gICAgcC54ID0gY1s1XVxyXG4gICAgcC55ID0gY1s2XVxyXG4gICAgcmV0dXJuIFsgJ0EnLCBjWzBdLCBjWzFdLCBjWzJdLCBjWzNdLCBjWzRdLCBjWzVdLCBjWzZdIF1cclxuICB9XHJcbn1cclxuXHJcbmNvbnN0IG1saHZxdGNzYXogPSAnbWxodnF0Y3Nheicuc3BsaXQoJycpXHJcblxyXG5mb3IgKGxldCBpID0gMCwgaWwgPSBtbGh2cXRjc2F6Lmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICBwYXRoSGFuZGxlcnNbbWxodnF0Y3NheltpXV0gPSAoZnVuY3Rpb24gKGkpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAoYywgcCwgcDApIHtcclxuICAgICAgaWYgKGkgPT09ICdIJykgY1swXSA9IGNbMF0gKyBwLnhcclxuICAgICAgZWxzZSBpZiAoaSA9PT0gJ1YnKSBjWzBdID0gY1swXSArIHAueVxyXG4gICAgICBlbHNlIGlmIChpID09PSAnQScpIHtcclxuICAgICAgICBjWzVdID0gY1s1XSArIHAueFxyXG4gICAgICAgIGNbNl0gPSBjWzZdICsgcC55XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDAsIGpsID0gYy5sZW5ndGg7IGogPCBqbDsgKytqKSB7XHJcbiAgICAgICAgICBjW2pdID0gY1tqXSArIChqICUgMiA/IHAueSA6IHAueClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBwYXRoSGFuZGxlcnNbaV0oYywgcCwgcDApXHJcbiAgICB9XHJcbiAgfSkobWxodnF0Y3NheltpXS50b1VwcGVyQ2FzZSgpKVxyXG59XHJcblxyXG5mdW5jdGlvbiBtYWtlQWJzb2x1dCAocGFyc2VyKSB7XHJcbiAgY29uc3QgY29tbWFuZCA9IHBhcnNlci5zZWdtZW50WzBdXHJcbiAgcmV0dXJuIHBhdGhIYW5kbGVyc1tjb21tYW5kXShwYXJzZXIuc2VnbWVudC5zbGljZSgxKSwgcGFyc2VyLnAsIHBhcnNlci5wMClcclxufVxyXG5cclxuZnVuY3Rpb24gc2VnbWVudENvbXBsZXRlIChwYXJzZXIpIHtcclxuICByZXR1cm4gcGFyc2VyLnNlZ21lbnQubGVuZ3RoICYmIHBhcnNlci5zZWdtZW50Lmxlbmd0aCAtIDEgPT09IHNlZ21lbnRQYXJhbWV0ZXJzW3BhcnNlci5zZWdtZW50WzBdLnRvVXBwZXJDYXNlKCldXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXJ0TmV3U2VnbWVudCAocGFyc2VyLCB0b2tlbikge1xyXG4gIHBhcnNlci5pbk51bWJlciAmJiBmaW5hbGl6ZU51bWJlcihwYXJzZXIsIGZhbHNlKVxyXG4gIGNvbnN0IHBhdGhMZXR0ZXIgPSBpc1BhdGhMZXR0ZXIudGVzdCh0b2tlbilcclxuXHJcbiAgaWYgKHBhdGhMZXR0ZXIpIHtcclxuICAgIHBhcnNlci5zZWdtZW50ID0gWyB0b2tlbiBdXHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGxhc3RDb21tYW5kID0gcGFyc2VyLmxhc3RDb21tYW5kXHJcbiAgICBjb25zdCBzbWFsbCA9IGxhc3RDb21tYW5kLnRvTG93ZXJDYXNlKClcclxuICAgIGNvbnN0IGlzU21hbGwgPSBsYXN0Q29tbWFuZCA9PT0gc21hbGxcclxuICAgIHBhcnNlci5zZWdtZW50ID0gWyBzbWFsbCA9PT0gJ20nID8gKGlzU21hbGwgPyAnbCcgOiAnTCcpIDogbGFzdENvbW1hbmQgXVxyXG4gIH1cclxuXHJcbiAgcGFyc2VyLmluU2VnbWVudCA9IHRydWVcclxuICBwYXJzZXIubGFzdENvbW1hbmQgPSBwYXJzZXIuc2VnbWVudFswXVxyXG5cclxuICByZXR1cm4gcGF0aExldHRlclxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5hbGl6ZU51bWJlciAocGFyc2VyLCBpbk51bWJlcikge1xyXG4gIGlmICghcGFyc2VyLmluTnVtYmVyKSB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNlciBFcnJvcicpXHJcbiAgcGFyc2VyLm51bWJlciAmJiBwYXJzZXIuc2VnbWVudC5wdXNoKHBhcnNlRmxvYXQocGFyc2VyLm51bWJlcikpXHJcbiAgcGFyc2VyLmluTnVtYmVyID0gaW5OdW1iZXJcclxuICBwYXJzZXIubnVtYmVyID0gJydcclxuICBwYXJzZXIucG9pbnRTZWVuID0gZmFsc2VcclxuICBwYXJzZXIuaGFzRXhwb25lbnQgPSBmYWxzZVxyXG5cclxuICBpZiAoc2VnbWVudENvbXBsZXRlKHBhcnNlcikpIHtcclxuICAgIGZpbmFsaXplU2VnbWVudChwYXJzZXIpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBmaW5hbGl6ZVNlZ21lbnQgKHBhcnNlcikge1xyXG4gIHBhcnNlci5pblNlZ21lbnQgPSBmYWxzZVxyXG4gIGlmIChwYXJzZXIuYWJzb2x1dGUpIHtcclxuICAgIHBhcnNlci5zZWdtZW50ID0gbWFrZUFic29sdXQocGFyc2VyKVxyXG4gIH1cclxuICBwYXJzZXIuc2VnbWVudHMucHVzaChwYXJzZXIuc2VnbWVudClcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBcmNGbGFnIChwYXJzZXIpIHtcclxuICBpZiAoIXBhcnNlci5zZWdtZW50Lmxlbmd0aCkgcmV0dXJuIGZhbHNlXHJcbiAgY29uc3QgaXNBcmMgPSBwYXJzZXIuc2VnbWVudFswXS50b1VwcGVyQ2FzZSgpID09PSAnQSdcclxuICBjb25zdCBsZW5ndGggPSBwYXJzZXIuc2VnbWVudC5sZW5ndGhcclxuXHJcbiAgcmV0dXJuIGlzQXJjICYmIChsZW5ndGggPT09IDQgfHwgbGVuZ3RoID09PSA1KVxyXG59XHJcblxyXG5mdW5jdGlvbiBpc0V4cG9uZW50aWFsIChwYXJzZXIpIHtcclxuICByZXR1cm4gcGFyc2VyLmxhc3RUb2tlbi50b1VwcGVyQ2FzZSgpID09PSAnRSdcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhdGhQYXJzZXIgKGQsIHRvQWJzb2x1dGUgPSB0cnVlKSB7XHJcblxyXG4gIGxldCBpbmRleCA9IDBcclxuICBsZXQgdG9rZW4gPSAnJ1xyXG4gIGNvbnN0IHBhcnNlciA9IHtcclxuICAgIHNlZ21lbnQ6IFtdLFxyXG4gICAgaW5OdW1iZXI6IGZhbHNlLFxyXG4gICAgbnVtYmVyOiAnJyxcclxuICAgIGxhc3RUb2tlbjogJycsXHJcbiAgICBpblNlZ21lbnQ6IGZhbHNlLFxyXG4gICAgc2VnbWVudHM6IFtdLFxyXG4gICAgcG9pbnRTZWVuOiBmYWxzZSxcclxuICAgIGhhc0V4cG9uZW50OiBmYWxzZSxcclxuICAgIGFic29sdXRlOiB0b0Fic29sdXRlLFxyXG4gICAgcDA6IG5ldyBQb2ludCgpLFxyXG4gICAgcDogbmV3IFBvaW50KClcclxuICB9XHJcblxyXG4gIHdoaWxlICgocGFyc2VyLmxhc3RUb2tlbiA9IHRva2VuLCB0b2tlbiA9IGQuY2hhckF0KGluZGV4KyspKSkge1xyXG4gICAgaWYgKCFwYXJzZXIuaW5TZWdtZW50KSB7XHJcbiAgICAgIGlmIChzdGFydE5ld1NlZ21lbnQocGFyc2VyLCB0b2tlbikpIHtcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRva2VuID09PSAnLicpIHtcclxuICAgICAgaWYgKHBhcnNlci5wb2ludFNlZW4gfHwgcGFyc2VyLmhhc0V4cG9uZW50KSB7XHJcbiAgICAgICAgZmluYWxpemVOdW1iZXIocGFyc2VyLCBmYWxzZSlcclxuICAgICAgICAtLWluZGV4XHJcbiAgICAgICAgY29udGludWVcclxuICAgICAgfVxyXG4gICAgICBwYXJzZXIuaW5OdW1iZXIgPSB0cnVlXHJcbiAgICAgIHBhcnNlci5wb2ludFNlZW4gPSB0cnVlXHJcbiAgICAgIHBhcnNlci5udW1iZXIgKz0gdG9rZW5cclxuICAgICAgY29udGludWVcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWlzTmFOKHBhcnNlSW50KHRva2VuKSkpIHtcclxuXHJcbiAgICAgIGlmIChwYXJzZXIubnVtYmVyID09PSAnMCcgfHwgaXNBcmNGbGFnKHBhcnNlcikpIHtcclxuICAgICAgICBwYXJzZXIuaW5OdW1iZXIgPSB0cnVlXHJcbiAgICAgICAgcGFyc2VyLm51bWJlciA9IHRva2VuXHJcbiAgICAgICAgZmluYWxpemVOdW1iZXIocGFyc2VyLCB0cnVlKVxyXG4gICAgICAgIGNvbnRpbnVlXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhcnNlci5pbk51bWJlciA9IHRydWVcclxuICAgICAgcGFyc2VyLm51bWJlciArPSB0b2tlblxyXG4gICAgICBjb250aW51ZVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b2tlbiA9PT0gJyAnIHx8IHRva2VuID09PSAnLCcpIHtcclxuICAgICAgaWYgKHBhcnNlci5pbk51bWJlcikge1xyXG4gICAgICAgIGZpbmFsaXplTnVtYmVyKHBhcnNlciwgZmFsc2UpXHJcbiAgICAgIH1cclxuICAgICAgY29udGludWVcclxuICAgIH1cclxuXHJcbiAgICBpZiAodG9rZW4gPT09ICctJykge1xyXG4gICAgICBpZiAocGFyc2VyLmluTnVtYmVyICYmICFpc0V4cG9uZW50aWFsKHBhcnNlcikpIHtcclxuICAgICAgICBmaW5hbGl6ZU51bWJlcihwYXJzZXIsIGZhbHNlKVxyXG4gICAgICAgIC0taW5kZXhcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9XHJcbiAgICAgIHBhcnNlci5udW1iZXIgKz0gdG9rZW5cclxuICAgICAgcGFyc2VyLmluTnVtYmVyID0gdHJ1ZVxyXG4gICAgICBjb250aW51ZVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0b2tlbi50b1VwcGVyQ2FzZSgpID09PSAnRScpIHtcclxuICAgICAgcGFyc2VyLm51bWJlciArPSB0b2tlblxyXG4gICAgICBwYXJzZXIuaGFzRXhwb25lbnQgPSB0cnVlXHJcbiAgICAgIGNvbnRpbnVlXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzUGF0aExldHRlci50ZXN0KHRva2VuKSkge1xyXG4gICAgICBpZiAocGFyc2VyLmluTnVtYmVyKSB7XHJcbiAgICAgICAgZmluYWxpemVOdW1iZXIocGFyc2VyLCBmYWxzZSlcclxuICAgICAgfSBlbHNlIGlmICghc2VnbWVudENvbXBsZXRlKHBhcnNlcikpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3BhcnNlciBFcnJvcicpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZmluYWxpemVTZWdtZW50KHBhcnNlcilcclxuICAgICAgfVxyXG4gICAgICAtLWluZGV4XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAocGFyc2VyLmluTnVtYmVyKSB7XHJcbiAgICBmaW5hbGl6ZU51bWJlcihwYXJzZXIsIGZhbHNlKVxyXG4gIH1cclxuXHJcbiAgaWYgKHBhcnNlci5pblNlZ21lbnQgJiYgc2VnbWVudENvbXBsZXRlKHBhcnNlcikpIHtcclxuICAgIGZpbmFsaXplU2VnbWVudChwYXJzZXIpXHJcbiAgfVxyXG5cclxuICByZXR1cm4gcGFyc2VyLnNlZ21lbnRzXHJcblxyXG59XHJcbiIsImltcG9ydCBTVkdBcnJheSBmcm9tICcuL1NWR0FycmF5LmpzJ1xyXG5pbXBvcnQgcGFyc2VyIGZyb20gJy4uL21vZHVsZXMvY29yZS9wYXJzZXIuanMnXHJcbmltcG9ydCBCb3ggZnJvbSAnLi9Cb3guanMnXHJcbmltcG9ydCB7IHBhdGhQYXJzZXIgfSBmcm9tICcuLi91dGlscy9wYXRoUGFyc2VyLmpzJ1xyXG5cclxuZnVuY3Rpb24gYXJyYXlUb1N0cmluZyAoYSkge1xyXG4gIGxldCBzID0gJydcclxuICBmb3IgKGxldCBpID0gMCwgaWwgPSBhLmxlbmd0aDsgaSA8IGlsOyBpKyspIHtcclxuICAgIHMgKz0gYVtpXVswXVxyXG5cclxuICAgIGlmIChhW2ldWzFdICE9IG51bGwpIHtcclxuICAgICAgcyArPSBhW2ldWzFdXHJcblxyXG4gICAgICBpZiAoYVtpXVsyXSAhPSBudWxsKSB7XHJcbiAgICAgICAgcyArPSAnICdcclxuICAgICAgICBzICs9IGFbaV1bMl1cclxuXHJcbiAgICAgICAgaWYgKGFbaV1bM10gIT0gbnVsbCkge1xyXG4gICAgICAgICAgcyArPSAnICdcclxuICAgICAgICAgIHMgKz0gYVtpXVszXVxyXG4gICAgICAgICAgcyArPSAnICdcclxuICAgICAgICAgIHMgKz0gYVtpXVs0XVxyXG5cclxuICAgICAgICAgIGlmIChhW2ldWzVdICE9IG51bGwpIHtcclxuICAgICAgICAgICAgcyArPSAnICdcclxuICAgICAgICAgICAgcyArPSBhW2ldWzVdXHJcbiAgICAgICAgICAgIHMgKz0gJyAnXHJcbiAgICAgICAgICAgIHMgKz0gYVtpXVs2XVxyXG5cclxuICAgICAgICAgICAgaWYgKGFbaV1bN10gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgIHMgKz0gJyAnXHJcbiAgICAgICAgICAgICAgcyArPSBhW2ldWzddXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBzICsgJyAnXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhBcnJheSBleHRlbmRzIFNWR0FycmF5IHtcclxuICAvLyBHZXQgYm91bmRpbmcgYm94IG9mIHBhdGhcclxuICBiYm94ICgpIHtcclxuICAgIHBhcnNlcigpLnBhdGguc2V0QXR0cmlidXRlKCdkJywgdGhpcy50b1N0cmluZygpKVxyXG4gICAgcmV0dXJuIG5ldyBCb3gocGFyc2VyLm5vZGVzLnBhdGguZ2V0QkJveCgpKVxyXG4gIH1cclxuXHJcbiAgLy8gTW92ZSBwYXRoIHN0cmluZ1xyXG4gIG1vdmUgKHgsIHkpIHtcclxuICAgIC8vIGdldCBib3VuZGluZyBib3ggb2YgY3VycmVudCBzaXR1YXRpb25cclxuICAgIGNvbnN0IGJveCA9IHRoaXMuYmJveCgpXHJcblxyXG4gICAgLy8gZ2V0IHJlbGF0aXZlIG9mZnNldFxyXG4gICAgeCAtPSBib3gueFxyXG4gICAgeSAtPSBib3gueVxyXG5cclxuICAgIGlmICghaXNOYU4oeCkgJiYgIWlzTmFOKHkpKSB7XHJcbiAgICAgIC8vIG1vdmUgZXZlcnkgcG9pbnRcclxuICAgICAgZm9yIChsZXQgbCwgaSA9IHRoaXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICBsID0gdGhpc1tpXVswXVxyXG5cclxuICAgICAgICBpZiAobCA9PT0gJ00nIHx8IGwgPT09ICdMJyB8fCBsID09PSAnVCcpIHtcclxuICAgICAgICAgIHRoaXNbaV1bMV0gKz0geFxyXG4gICAgICAgICAgdGhpc1tpXVsyXSArPSB5XHJcbiAgICAgICAgfSBlbHNlIGlmIChsID09PSAnSCcpIHtcclxuICAgICAgICAgIHRoaXNbaV1bMV0gKz0geFxyXG4gICAgICAgIH0gZWxzZSBpZiAobCA9PT0gJ1YnKSB7XHJcbiAgICAgICAgICB0aGlzW2ldWzFdICs9IHlcclxuICAgICAgICB9IGVsc2UgaWYgKGwgPT09ICdDJyB8fCBsID09PSAnUycgfHwgbCA9PT0gJ1EnKSB7XHJcbiAgICAgICAgICB0aGlzW2ldWzFdICs9IHhcclxuICAgICAgICAgIHRoaXNbaV1bMl0gKz0geVxyXG4gICAgICAgICAgdGhpc1tpXVszXSArPSB4XHJcbiAgICAgICAgICB0aGlzW2ldWzRdICs9IHlcclxuXHJcbiAgICAgICAgICBpZiAobCA9PT0gJ0MnKSB7XHJcbiAgICAgICAgICAgIHRoaXNbaV1bNV0gKz0geFxyXG4gICAgICAgICAgICB0aGlzW2ldWzZdICs9IHlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGwgPT09ICdBJykge1xyXG4gICAgICAgICAgdGhpc1tpXVs2XSArPSB4XHJcbiAgICAgICAgICB0aGlzW2ldWzddICs9IHlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gQWJzb2x1dGl6ZSBhbmQgcGFyc2UgcGF0aCB0byBhcnJheVxyXG4gIHBhcnNlIChkID0gJ00wIDAnKSB7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkKSkge1xyXG4gICAgICBkID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgZCkudG9TdHJpbmcoKVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwYXRoUGFyc2VyKGQpXHJcbiAgfVxyXG5cclxuICAvLyBSZXNpemUgcGF0aCBzdHJpbmdcclxuICBzaXplICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAvLyBnZXQgYm91bmRpbmcgYm94IG9mIGN1cnJlbnQgc2l0dWF0aW9uXHJcbiAgICBjb25zdCBib3ggPSB0aGlzLmJib3goKVxyXG4gICAgbGV0IGksIGxcclxuXHJcbiAgICAvLyBJZiB0aGUgYm94IHdpZHRoIG9yIGhlaWdodCBpcyAwIHRoZW4gd2UgaWdub3JlXHJcbiAgICAvLyB0cmFuc2Zvcm1hdGlvbnMgb24gdGhlIHJlc3BlY3RpdmUgYXhpc1xyXG4gICAgYm94LndpZHRoID0gYm94LndpZHRoID09PSAwID8gMSA6IGJveC53aWR0aFxyXG4gICAgYm94LmhlaWdodCA9IGJveC5oZWlnaHQgPT09IDAgPyAxIDogYm94LmhlaWdodFxyXG5cclxuICAgIC8vIHJlY2FsY3VsYXRlIHBvc2l0aW9uIG9mIGFsbCBwb2ludHMgYWNjb3JkaW5nIHRvIG5ldyBzaXplXHJcbiAgICBmb3IgKGkgPSB0aGlzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgIGwgPSB0aGlzW2ldWzBdXHJcblxyXG4gICAgICBpZiAobCA9PT0gJ00nIHx8IGwgPT09ICdMJyB8fCBsID09PSAnVCcpIHtcclxuICAgICAgICB0aGlzW2ldWzFdID0gKCh0aGlzW2ldWzFdIC0gYm94LngpICogd2lkdGgpIC8gYm94LndpZHRoICsgYm94LnhcclxuICAgICAgICB0aGlzW2ldWzJdID0gKCh0aGlzW2ldWzJdIC0gYm94LnkpICogaGVpZ2h0KSAvIGJveC5oZWlnaHQgKyBib3gueVxyXG4gICAgICB9IGVsc2UgaWYgKGwgPT09ICdIJykge1xyXG4gICAgICAgIHRoaXNbaV1bMV0gPSAoKHRoaXNbaV1bMV0gLSBib3gueCkgKiB3aWR0aCkgLyBib3gud2lkdGggKyBib3gueFxyXG4gICAgICB9IGVsc2UgaWYgKGwgPT09ICdWJykge1xyXG4gICAgICAgIHRoaXNbaV1bMV0gPSAoKHRoaXNbaV1bMV0gLSBib3gueSkgKiBoZWlnaHQpIC8gYm94LmhlaWdodCArIGJveC55XHJcbiAgICAgIH0gZWxzZSBpZiAobCA9PT0gJ0MnIHx8IGwgPT09ICdTJyB8fCBsID09PSAnUScpIHtcclxuICAgICAgICB0aGlzW2ldWzFdID0gKCh0aGlzW2ldWzFdIC0gYm94LngpICogd2lkdGgpIC8gYm94LndpZHRoICsgYm94LnhcclxuICAgICAgICB0aGlzW2ldWzJdID0gKCh0aGlzW2ldWzJdIC0gYm94LnkpICogaGVpZ2h0KSAvIGJveC5oZWlnaHQgKyBib3gueVxyXG4gICAgICAgIHRoaXNbaV1bM10gPSAoKHRoaXNbaV1bM10gLSBib3gueCkgKiB3aWR0aCkgLyBib3gud2lkdGggKyBib3gueFxyXG4gICAgICAgIHRoaXNbaV1bNF0gPSAoKHRoaXNbaV1bNF0gLSBib3gueSkgKiBoZWlnaHQpIC8gYm94LmhlaWdodCArIGJveC55XHJcblxyXG4gICAgICAgIGlmIChsID09PSAnQycpIHtcclxuICAgICAgICAgIHRoaXNbaV1bNV0gPSAoKHRoaXNbaV1bNV0gLSBib3gueCkgKiB3aWR0aCkgLyBib3gud2lkdGggKyBib3gueFxyXG4gICAgICAgICAgdGhpc1tpXVs2XSA9ICgodGhpc1tpXVs2XSAtIGJveC55KSAqIGhlaWdodCkgLyBib3guaGVpZ2h0ICsgYm94LnlcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAobCA9PT0gJ0EnKSB7XHJcbiAgICAgICAgLy8gcmVzaXplIHJhZGlpXHJcbiAgICAgICAgdGhpc1tpXVsxXSA9ICh0aGlzW2ldWzFdICogd2lkdGgpIC8gYm94LndpZHRoXHJcbiAgICAgICAgdGhpc1tpXVsyXSA9ICh0aGlzW2ldWzJdICogaGVpZ2h0KSAvIGJveC5oZWlnaHRcclxuXHJcbiAgICAgICAgLy8gbW92ZSBwb3NpdGlvbiB2YWx1ZXNcclxuICAgICAgICB0aGlzW2ldWzZdID0gKCh0aGlzW2ldWzZdIC0gYm94LngpICogd2lkdGgpIC8gYm94LndpZHRoICsgYm94LnhcclxuICAgICAgICB0aGlzW2ldWzddID0gKCh0aGlzW2ldWzddIC0gYm94LnkpICogaGVpZ2h0KSAvIGJveC5oZWlnaHQgKyBib3gueVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIENvbnZlcnQgYXJyYXkgdG8gc3RyaW5nXHJcbiAgdG9TdHJpbmcgKCkge1xyXG4gICAgcmV0dXJuIGFycmF5VG9TdHJpbmcodGhpcylcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IEVhc2UgfSBmcm9tICcuL0NvbnRyb2xsZXIuanMnXHJcbmltcG9ydCB7XHJcbiAgZGVsaW1pdGVyLFxyXG4gIG51bWJlckFuZFVuaXQsXHJcbiAgaXNQYXRoTGV0dGVyXHJcbn0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3JlZ2V4LmpzJ1xyXG5pbXBvcnQgeyBleHRlbmQgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgQ29sb3IgZnJvbSAnLi4vdHlwZXMvQ29sb3IuanMnXHJcbmltcG9ydCBQYXRoQXJyYXkgZnJvbSAnLi4vdHlwZXMvUGF0aEFycmF5LmpzJ1xyXG5pbXBvcnQgU1ZHQXJyYXkgZnJvbSAnLi4vdHlwZXMvU1ZHQXJyYXkuanMnXHJcbmltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi4vdHlwZXMvU1ZHTnVtYmVyLmpzJ1xyXG5cclxuY29uc3QgZ2V0Q2xhc3NGb3JUeXBlID0gKHZhbHVlKSA9PiB7XHJcbiAgY29uc3QgdHlwZSA9IHR5cGVvZiB2YWx1ZVxyXG5cclxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcclxuICAgIHJldHVybiBTVkdOdW1iZXJcclxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICBpZiAoQ29sb3IuaXNDb2xvcih2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIENvbG9yXHJcbiAgICB9IGVsc2UgaWYgKGRlbGltaXRlci50ZXN0KHZhbHVlKSkge1xyXG4gICAgICByZXR1cm4gaXNQYXRoTGV0dGVyLnRlc3QodmFsdWUpXHJcbiAgICAgICAgPyBQYXRoQXJyYXlcclxuICAgICAgICA6IFNWR0FycmF5XHJcbiAgICB9IGVsc2UgaWYgKG51bWJlckFuZFVuaXQudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgcmV0dXJuIFNWR051bWJlclxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIE5vbk1vcnBoYWJsZVxyXG4gICAgfVxyXG4gIH0gZWxzZSBpZiAobW9ycGhhYmxlVHlwZXMuaW5kZXhPZih2YWx1ZS5jb25zdHJ1Y3RvcikgPiAtMSkge1xyXG4gICAgcmV0dXJuIHZhbHVlLmNvbnN0cnVjdG9yXHJcbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgcmV0dXJuIFNWR0FycmF5XHJcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0Jykge1xyXG4gICAgcmV0dXJuIE9iamVjdEJhZ1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gTm9uTW9ycGhhYmxlXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3JwaGFibGUge1xyXG4gIGNvbnN0cnVjdG9yIChzdGVwcGVyKSB7XHJcbiAgICB0aGlzLl9zdGVwcGVyID0gc3RlcHBlciB8fCBuZXcgRWFzZSgnLScpXHJcblxyXG4gICAgdGhpcy5fZnJvbSA9IG51bGxcclxuICAgIHRoaXMuX3RvID0gbnVsbFxyXG4gICAgdGhpcy5fdHlwZSA9IG51bGxcclxuICAgIHRoaXMuX2NvbnRleHQgPSBudWxsXHJcbiAgICB0aGlzLl9tb3JwaE9iaiA9IG51bGxcclxuICB9XHJcblxyXG4gIGF0IChwb3MpIHtcclxuICAgIGNvbnN0IF90aGlzID0gdGhpc1xyXG5cclxuICAgIHJldHVybiB0aGlzLl9tb3JwaE9iai5mcm9tQXJyYXkoXHJcbiAgICAgIHRoaXMuX2Zyb20ubWFwKGZ1bmN0aW9uIChpLCBpbmRleCkge1xyXG4gICAgICAgIHJldHVybiBfdGhpcy5fc3RlcHBlci5zdGVwKGksIF90aGlzLl90b1tpbmRleF0sIHBvcywgX3RoaXMuX2NvbnRleHRbaW5kZXhdLCBfdGhpcy5fY29udGV4dClcclxuICAgICAgfSlcclxuICAgIClcclxuICB9XHJcblxyXG4gIGRvbmUgKCkge1xyXG4gICAgY29uc3QgY29tcGxldGUgPSB0aGlzLl9jb250ZXh0XHJcbiAgICAgIC5tYXAodGhpcy5fc3RlcHBlci5kb25lKVxyXG4gICAgICAucmVkdWNlKGZ1bmN0aW9uIChsYXN0LCBjdXJyKSB7XHJcbiAgICAgICAgcmV0dXJuIGxhc3QgJiYgY3VyclxyXG4gICAgICB9LCB0cnVlKVxyXG4gICAgcmV0dXJuIGNvbXBsZXRlXHJcbiAgfVxyXG5cclxuICBmcm9tICh2YWwpIHtcclxuICAgIGlmICh2YWwgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fZnJvbVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX2Zyb20gPSB0aGlzLl9zZXQodmFsKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHN0ZXBwZXIgKHN0ZXBwZXIpIHtcclxuICAgIGlmIChzdGVwcGVyID09IG51bGwpIHJldHVybiB0aGlzLl9zdGVwcGVyXHJcbiAgICB0aGlzLl9zdGVwcGVyID0gc3RlcHBlclxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHRvICh2YWwpIHtcclxuICAgIGlmICh2YWwgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fdG9cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl90byA9IHRoaXMuX3NldCh2YWwpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdHlwZSAodHlwZSkge1xyXG4gICAgLy8gZ2V0dGVyXHJcbiAgICBpZiAodHlwZSA9PSBudWxsKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLl90eXBlXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0dGVyXHJcbiAgICB0aGlzLl90eXBlID0gdHlwZVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIF9zZXQgKHZhbHVlKSB7XHJcbiAgICBpZiAoIXRoaXMuX3R5cGUpIHtcclxuICAgICAgdGhpcy50eXBlKGdldENsYXNzRm9yVHlwZSh2YWx1ZSkpXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHJlc3VsdCA9IChuZXcgdGhpcy5fdHlwZSh2YWx1ZSkpXHJcbiAgICBpZiAodGhpcy5fdHlwZSA9PT0gQ29sb3IpIHtcclxuICAgICAgcmVzdWx0ID0gdGhpcy5fdG9cbiAgICAgICAgPyByZXN1bHRbdGhpcy5fdG9bNF1dKClcclxuICAgICAgICA6IHRoaXMuX2Zyb21cbiAgICAgICAgICA/IHJlc3VsdFt0aGlzLl9mcm9tWzRdXSgpXHJcbiAgICAgICAgICA6IHJlc3VsdFxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl90eXBlID09PSBPYmplY3RCYWcpIHtcclxuICAgICAgcmVzdWx0ID0gdGhpcy5fdG9cbiAgICAgICAgPyByZXN1bHQuYWxpZ24odGhpcy5fdG8pXHJcbiAgICAgICAgOiB0aGlzLl9mcm9tXG4gICAgICAgICAgPyByZXN1bHQuYWxpZ24odGhpcy5fZnJvbSlcclxuICAgICAgICAgIDogcmVzdWx0XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdWx0ID0gcmVzdWx0LnRvQXJyYXkoKVxyXG5cclxuICAgIHRoaXMuX21vcnBoT2JqID0gdGhpcy5fbW9ycGhPYmogfHwgbmV3IHRoaXMuX3R5cGUoKVxyXG4gICAgdGhpcy5fY29udGV4dCA9IHRoaXMuX2NvbnRleHRcclxuICAgICAgfHwgQXJyYXkuYXBwbHkobnVsbCwgQXJyYXkocmVzdWx0Lmxlbmd0aCkpXHJcbiAgICAgICAgLm1hcChPYmplY3QpXHJcbiAgICAgICAgLm1hcChmdW5jdGlvbiAobykge1xyXG4gICAgICAgICAgby5kb25lID0gdHJ1ZVxyXG4gICAgICAgICAgcmV0dXJuIG9cclxuICAgICAgICB9KVxyXG4gICAgcmV0dXJuIHJlc3VsdFxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBOb25Nb3JwaGFibGUge1xyXG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XHJcbiAgICB0aGlzLmluaXQoLi4uYXJncylcclxuICB9XHJcblxyXG4gIGluaXQgKHZhbCkge1xyXG4gICAgdmFsID0gQXJyYXkuaXNBcnJheSh2YWwpID8gdmFsWzBdIDogdmFsXHJcbiAgICB0aGlzLnZhbHVlID0gdmFsXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgdG9BcnJheSAoKSB7XHJcbiAgICByZXR1cm4gWyB0aGlzLnZhbHVlIF1cclxuICB9XHJcblxyXG4gIHZhbHVlT2YgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMudmFsdWVcclxuICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtQmFnIHtcclxuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xyXG4gICAgdGhpcy5pbml0KC4uLmFyZ3MpXHJcbiAgfVxyXG5cclxuICBpbml0IChvYmopIHtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikpIHtcclxuICAgICAgb2JqID0ge1xyXG4gICAgICAgIHNjYWxlWDogb2JqWzBdLFxyXG4gICAgICAgIHNjYWxlWTogb2JqWzFdLFxyXG4gICAgICAgIHNoZWFyOiBvYmpbMl0sXHJcbiAgICAgICAgcm90YXRlOiBvYmpbM10sXHJcbiAgICAgICAgdHJhbnNsYXRlWDogb2JqWzRdLFxyXG4gICAgICAgIHRyYW5zbGF0ZVk6IG9ials1XSxcclxuICAgICAgICBvcmlnaW5YOiBvYmpbNl0sXHJcbiAgICAgICAgb3JpZ2luWTogb2JqWzddXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIFRyYW5zZm9ybUJhZy5kZWZhdWx0cywgb2JqKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHRvQXJyYXkgKCkge1xyXG4gICAgY29uc3QgdiA9IHRoaXNcclxuXHJcbiAgICByZXR1cm4gW1xyXG4gICAgICB2LnNjYWxlWCxcclxuICAgICAgdi5zY2FsZVksXHJcbiAgICAgIHYuc2hlYXIsXHJcbiAgICAgIHYucm90YXRlLFxyXG4gICAgICB2LnRyYW5zbGF0ZVgsXHJcbiAgICAgIHYudHJhbnNsYXRlWSxcclxuICAgICAgdi5vcmlnaW5YLFxyXG4gICAgICB2Lm9yaWdpbllcclxuICAgIF1cclxuICB9XHJcbn1cclxuXHJcblRyYW5zZm9ybUJhZy5kZWZhdWx0cyA9IHtcclxuICBzY2FsZVg6IDEsXHJcbiAgc2NhbGVZOiAxLFxyXG4gIHNoZWFyOiAwLFxyXG4gIHJvdGF0ZTogMCxcclxuICB0cmFuc2xhdGVYOiAwLFxyXG4gIHRyYW5zbGF0ZVk6IDAsXHJcbiAgb3JpZ2luWDogMCxcclxuICBvcmlnaW5ZOiAwXHJcbn1cclxuXHJcbmNvbnN0IHNvcnRCeUtleSA9IChhLCBiKSA9PiB7XHJcbiAgcmV0dXJuIChhWzBdIDwgYlswXSA/IC0xIDogKGFbMF0gPiBiWzBdID8gMSA6IDApKVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT2JqZWN0QmFnIHtcclxuICBjb25zdHJ1Y3RvciAoLi4uYXJncykge1xyXG4gICAgdGhpcy5pbml0KC4uLmFyZ3MpXHJcbiAgfVxyXG5cclxuICBhbGlnbiAob3RoZXIpIHtcclxuICAgIGZvciAobGV0IGkgPSAwLCBpbCA9IHRoaXMudmFsdWVzLmxlbmd0aDsgaSA8IGlsOyArK2kpIHtcclxuICAgICAgaWYgKHRoaXMudmFsdWVzW2ldID09PSBDb2xvcikge1xyXG4gICAgICAgIGNvbnN0IHNwYWNlID0gb3RoZXJbaSArIDZdXHJcbiAgICAgICAgY29uc3QgY29sb3IgPSBuZXcgQ29sb3IodGhpcy52YWx1ZXMuc3BsaWNlKGkgKyAyLCA1KSlbc3BhY2VdKCkudG9BcnJheSgpXHJcbiAgICAgICAgdGhpcy52YWx1ZXMuc3BsaWNlKGkgKyAyLCAwLCAuLi5jb2xvcilcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGluaXQgKG9iak9yQXJyKSB7XHJcbiAgICB0aGlzLnZhbHVlcyA9IFtdXHJcblxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqT3JBcnIpKSB7XHJcbiAgICAgIHRoaXMudmFsdWVzID0gb2JqT3JBcnIuc2xpY2UoKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBvYmpPckFyciA9IG9iak9yQXJyIHx8IHt9XHJcbiAgICBjb25zdCBlbnRyaWVzID0gW11cclxuXHJcbiAgICBmb3IgKGNvbnN0IGkgaW4gb2JqT3JBcnIpIHtcclxuICAgICAgY29uc3QgVHlwZSA9IGdldENsYXNzRm9yVHlwZShvYmpPckFycltpXSlcclxuICAgICAgY29uc3QgdmFsID0gbmV3IFR5cGUob2JqT3JBcnJbaV0pLnRvQXJyYXkoKVxyXG4gICAgICBlbnRyaWVzLnB1c2goWyBpLCBUeXBlLCB2YWwubGVuZ3RoLCAuLi52YWwgXSlcclxuICAgIH1cclxuXHJcbiAgICBlbnRyaWVzLnNvcnQoc29ydEJ5S2V5KVxyXG5cclxuICAgIHRoaXMudmFsdWVzID0gZW50cmllcy5yZWR1Y2UoKGxhc3QsIGN1cnIpID0+IGxhc3QuY29uY2F0KGN1cnIpLCBbXSlcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICB0b0FycmF5ICgpIHtcclxuICAgIHJldHVybiB0aGlzLnZhbHVlc1xyXG4gIH1cclxuXHJcbiAgdmFsdWVPZiAoKSB7XHJcbiAgICBjb25zdCBvYmogPSB7fVxyXG4gICAgY29uc3QgYXJyID0gdGhpcy52YWx1ZXNcclxuXHJcbiAgICAvLyBmb3IgKHZhciBpID0gMCwgbGVuID0gYXJyLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAyKSB7XHJcbiAgICB3aGlsZSAoYXJyLmxlbmd0aCkge1xyXG4gICAgICBjb25zdCBrZXkgPSBhcnIuc2hpZnQoKVxyXG4gICAgICBjb25zdCBUeXBlID0gYXJyLnNoaWZ0KClcclxuICAgICAgY29uc3QgbnVtID0gYXJyLnNoaWZ0KClcclxuICAgICAgY29uc3QgdmFsdWVzID0gYXJyLnNwbGljZSgwLCBudW0pXHJcbiAgICAgIG9ialtrZXldID0gbmV3IFR5cGUodmFsdWVzKS52YWx1ZU9mKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb2JqXHJcbiAgfVxyXG5cclxufVxyXG5cclxuY29uc3QgbW9ycGhhYmxlVHlwZXMgPSBbXHJcbiAgTm9uTW9ycGhhYmxlLFxyXG4gIFRyYW5zZm9ybUJhZyxcclxuICBPYmplY3RCYWdcclxuXVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyTW9ycGhhYmxlVHlwZSAodHlwZSA9IFtdKSB7XHJcbiAgbW9ycGhhYmxlVHlwZXMucHVzaCguLi5bXS5jb25jYXQodHlwZSkpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtYWtlTW9ycGhhYmxlICgpIHtcclxuICBleHRlbmQobW9ycGhhYmxlVHlwZXMsIHtcclxuICAgIHRvICh2YWwpIHtcclxuICAgICAgcmV0dXJuIG5ldyBNb3JwaGFibGUoKVxyXG4gICAgICAgIC50eXBlKHRoaXMuY29uc3RydWN0b3IpXHJcbiAgICAgICAgLmZyb20odGhpcy52YWx1ZU9mKCkpXHJcbiAgICAgICAgLnRvKHZhbClcclxuICAgIH0sXHJcbiAgICBmcm9tQXJyYXkgKGFycikge1xyXG4gICAgICB0aGlzLmluaXQoYXJyKVxyXG4gICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG4gIH0pXHJcbn1cclxuIiwiaW1wb3J0IHsgbm9kZU9yTmV3LCByZWdpc3Rlciwgd3JhcFdpdGhBdHRyQ2hlY2sgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyBwcm9wb3J0aW9uYWxTaXplIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBQYXRoQXJyYXkgZnJvbSAnLi4vdHlwZXMvUGF0aEFycmF5LmpzJ1xyXG5pbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGggZXh0ZW5kcyBTaGFwZSB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdwYXRoJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgLy8gR2V0IGFycmF5XHJcbiAgYXJyYXkgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2FycmF5IHx8ICh0aGlzLl9hcnJheSA9IG5ldyBQYXRoQXJyYXkodGhpcy5hdHRyKCdkJykpKVxyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXIgYXJyYXkgY2FjaGVcclxuICBjbGVhciAoKSB7XHJcbiAgICBkZWxldGUgdGhpcy5fYXJyYXlcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvLyBTZXQgaGVpZ2h0IG9mIGVsZW1lbnRcclxuICBoZWlnaHQgKGhlaWdodCkge1xyXG4gICAgcmV0dXJuIGhlaWdodCA9PSBudWxsID8gdGhpcy5iYm94KCkuaGVpZ2h0IDogdGhpcy5zaXplKHRoaXMuYmJveCgpLndpZHRoLCBoZWlnaHQpXHJcbiAgfVxyXG5cclxuICAvLyBNb3ZlIGJ5IGxlZnQgdG9wIGNvcm5lclxyXG4gIG1vdmUgKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2QnLCB0aGlzLmFycmF5KCkubW92ZSh4LCB5KSlcclxuICB9XHJcblxyXG4gIC8vIFBsb3QgbmV3IHBhdGhcclxuICBwbG90IChkKSB7XHJcbiAgICByZXR1cm4gKGQgPT0gbnVsbClcbiAgICAgID8gdGhpcy5hcnJheSgpXHJcbiAgICAgIDogdGhpcy5jbGVhcigpLmF0dHIoJ2QnLCB0eXBlb2YgZCA9PT0gJ3N0cmluZycgPyBkIDogKHRoaXMuX2FycmF5ID0gbmV3IFBhdGhBcnJheShkKSkpXHJcbiAgfVxyXG5cclxuICAvLyBTZXQgZWxlbWVudCBzaXplIHRvIGdpdmVuIHdpZHRoIGFuZCBoZWlnaHRcclxuICBzaXplICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICBjb25zdCBwID0gcHJvcG9ydGlvbmFsU2l6ZSh0aGlzLCB3aWR0aCwgaGVpZ2h0KVxyXG4gICAgcmV0dXJuIHRoaXMuYXR0cignZCcsIHRoaXMuYXJyYXkoKS5zaXplKHAud2lkdGgsIHAuaGVpZ2h0KSlcclxuICB9XHJcblxyXG4gIC8vIFNldCB3aWR0aCBvZiBlbGVtZW50XHJcbiAgd2lkdGggKHdpZHRoKSB7XHJcbiAgICByZXR1cm4gd2lkdGggPT0gbnVsbCA/IHRoaXMuYmJveCgpLndpZHRoIDogdGhpcy5zaXplKHdpZHRoLCB0aGlzLmJib3goKS5oZWlnaHQpXHJcbiAgfVxyXG5cclxuICAvLyBNb3ZlIGJ5IGxlZnQgdG9wIGNvcm5lciBvdmVyIHgtYXhpc1xyXG4gIHggKHgpIHtcclxuICAgIHJldHVybiB4ID09IG51bGwgPyB0aGlzLmJib3goKS54IDogdGhpcy5tb3ZlKHgsIHRoaXMuYmJveCgpLnkpXHJcbiAgfVxyXG5cclxuICAvLyBNb3ZlIGJ5IGxlZnQgdG9wIGNvcm5lciBvdmVyIHktYXhpc1xyXG4gIHkgKHkpIHtcclxuICAgIHJldHVybiB5ID09IG51bGwgPyB0aGlzLmJib3goKS55IDogdGhpcy5tb3ZlKHRoaXMuYmJveCgpLngsIHkpXHJcbiAgfVxyXG5cclxufVxyXG5cclxuLy8gRGVmaW5lIG1vcnBoYWJsZSBhcnJheVxyXG5QYXRoLnByb3RvdHlwZS5Nb3JwaEFycmF5ID0gUGF0aEFycmF5XHJcblxyXG4vLyBBZGQgcGFyZW50IG1ldGhvZFxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgLy8gQ3JlYXRlIGEgd3JhcHBlZCBwYXRoIGVsZW1lbnRcclxuICAgIHBhdGg6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uIChkKSB7XHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBwbG90IGlzIGNhbGxlZCBhcyBhIHNldHRlclxyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IFBhdGgoKSkucGxvdChkIHx8IG5ldyBQYXRoQXJyYXkoKSlcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoUGF0aCwgJ1BhdGgnKVxyXG4iLCJpbXBvcnQgeyBwcm9wb3J0aW9uYWxTaXplIH0gZnJvbSAnLi4vLi4vdXRpbHMvdXRpbHMuanMnXHJcbmltcG9ydCBQb2ludEFycmF5IGZyb20gJy4uLy4uL3R5cGVzL1BvaW50QXJyYXkuanMnXHJcblxyXG4vLyBHZXQgYXJyYXlcclxuZXhwb3J0IGZ1bmN0aW9uIGFycmF5ICgpIHtcclxuICByZXR1cm4gdGhpcy5fYXJyYXkgfHwgKHRoaXMuX2FycmF5ID0gbmV3IFBvaW50QXJyYXkodGhpcy5hdHRyKCdwb2ludHMnKSkpXHJcbn1cclxuXHJcbi8vIENsZWFyIGFycmF5IGNhY2hlXHJcbmV4cG9ydCBmdW5jdGlvbiBjbGVhciAoKSB7XHJcbiAgZGVsZXRlIHRoaXMuX2FycmF5XHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gTW92ZSBieSBsZWZ0IHRvcCBjb3JuZXJcclxuZXhwb3J0IGZ1bmN0aW9uIG1vdmUgKHgsIHkpIHtcclxuICByZXR1cm4gdGhpcy5hdHRyKCdwb2ludHMnLCB0aGlzLmFycmF5KCkubW92ZSh4LCB5KSlcclxufVxyXG5cclxuLy8gUGxvdCBuZXcgcGF0aFxyXG5leHBvcnQgZnVuY3Rpb24gcGxvdCAocCkge1xyXG4gIHJldHVybiAocCA9PSBudWxsKVxuICAgID8gdGhpcy5hcnJheSgpXHJcbiAgICA6IHRoaXMuY2xlYXIoKS5hdHRyKCdwb2ludHMnLCB0eXBlb2YgcCA9PT0gJ3N0cmluZydcbiAgICAgID8gcFxyXG4gICAgICA6ICh0aGlzLl9hcnJheSA9IG5ldyBQb2ludEFycmF5KHApKSlcclxufVxyXG5cclxuLy8gU2V0IGVsZW1lbnQgc2l6ZSB0byBnaXZlbiB3aWR0aCBhbmQgaGVpZ2h0XHJcbmV4cG9ydCBmdW5jdGlvbiBzaXplICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgY29uc3QgcCA9IHByb3BvcnRpb25hbFNpemUodGhpcywgd2lkdGgsIGhlaWdodClcclxuICByZXR1cm4gdGhpcy5hdHRyKCdwb2ludHMnLCB0aGlzLmFycmF5KCkuc2l6ZShwLndpZHRoLCBwLmhlaWdodCkpXHJcbn1cclxuIiwiaW1wb3J0IHtcclxuICBleHRlbmQsXHJcbiAgbm9kZU9yTmV3LFxyXG4gIHJlZ2lzdGVyLFxyXG4gIHdyYXBXaXRoQXR0ckNoZWNrXHJcbn0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IFBvaW50QXJyYXkgZnJvbSAnLi4vdHlwZXMvUG9pbnRBcnJheS5qcydcclxuaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnXHJcbmltcG9ydCAqIGFzIHBvaW50ZWQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3BvaW50ZWQuanMnXHJcbmltcG9ydCAqIGFzIHBvbHkgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3BvbHkuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb2x5Z29uIGV4dGVuZHMgU2hhcGUge1xyXG4gIC8vIEluaXRpYWxpemUgbm9kZVxyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygncG9seWdvbicsIG5vZGUpLCBhdHRycylcclxuICB9XHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgYSB3cmFwcGVkIHBvbHlnb24gZWxlbWVudFxyXG4gICAgcG9seWdvbjogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHApIHtcclxuICAgICAgLy8gbWFrZSBzdXJlIHBsb3QgaXMgY2FsbGVkIGFzIGEgc2V0dGVyXHJcbiAgICAgIHJldHVybiB0aGlzLnB1dChuZXcgUG9seWdvbigpKS5wbG90KHAgfHwgbmV3IFBvaW50QXJyYXkoKSlcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxuZXh0ZW5kKFBvbHlnb24sIHBvaW50ZWQpXHJcbmV4dGVuZChQb2x5Z29uLCBwb2x5KVxyXG5yZWdpc3RlcihQb2x5Z29uLCAnUG9seWdvbicpXHJcbiIsImltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBQb2ludEFycmF5IGZyb20gJy4uL3R5cGVzL1BvaW50QXJyYXkuanMnXHJcbmltcG9ydCBTaGFwZSBmcm9tICcuL1NoYXBlLmpzJ1xyXG5pbXBvcnQgKiBhcyBwb2ludGVkIGZyb20gJy4uL21vZHVsZXMvY29yZS9wb2ludGVkLmpzJ1xyXG5pbXBvcnQgKiBhcyBwb2x5IGZyb20gJy4uL21vZHVsZXMvY29yZS9wb2x5LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9seWxpbmUgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdwb2x5bGluZScsIG5vZGUpLCBhdHRycylcclxuICB9XHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgYSB3cmFwcGVkIHBvbHlnb24gZWxlbWVudFxyXG4gICAgcG9seWxpbmU6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uIChwKSB7XHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBwbG90IGlzIGNhbGxlZCBhcyBhIHNldHRlclxyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IFBvbHlsaW5lKCkpLnBsb3QocCB8fCBuZXcgUG9pbnRBcnJheSgpKVxyXG4gICAgfSlcclxuICB9XHJcbn0pXHJcblxyXG5leHRlbmQoUG9seWxpbmUsIHBvaW50ZWQpXHJcbmV4dGVuZChQb2x5bGluZSwgcG9seSlcclxucmVnaXN0ZXIoUG9seWxpbmUsICdQb2x5bGluZScpXHJcbiIsImltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCB7IHJ4LCByeSB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9jaXJjbGVkLmpzJ1xyXG5pbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3QgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdyZWN0Jywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxufVxyXG5cclxuZXh0ZW5kKFJlY3QsIHsgcngsIHJ5IH0pXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgLy8gQ3JlYXRlIGEgcmVjdCBlbGVtZW50XHJcbiAgICByZWN0OiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IFJlY3QoKSkuc2l6ZSh3aWR0aCwgaGVpZ2h0KVxyXG4gICAgfSlcclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3RlcihSZWN0LCAnUmVjdCcpXHJcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXVlIHtcclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLl9maXJzdCA9IG51bGxcclxuICAgIHRoaXMuX2xhc3QgPSBudWxsXHJcbiAgfVxyXG5cclxuICAvLyBTaG93cyB1cyB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbGlzdFxuICBmaXJzdCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fZmlyc3QgJiYgdGhpcy5fZmlyc3QudmFsdWVcclxuICB9XG5cbiAgLy8gU2hvd3MgdXMgdGhlIGxhc3QgaXRlbSBpbiB0aGUgbGlzdFxuICBsYXN0ICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9sYXN0ICYmIHRoaXMuX2xhc3QudmFsdWVcclxuICB9XG5cbiAgcHVzaCAodmFsdWUpIHtcclxuICAgIC8vIEFuIGl0ZW0gc3RvcmVzIGFuIGlkIGFuZCB0aGUgcHJvdmlkZWQgdmFsdWVcclxuICAgIGNvbnN0IGl0ZW0gPSB0eXBlb2YgdmFsdWUubmV4dCAhPT0gJ3VuZGVmaW5lZCcgPyB2YWx1ZSA6IHsgdmFsdWU6IHZhbHVlLCBuZXh0OiBudWxsLCBwcmV2OiBudWxsIH1cclxuXHJcbiAgICAvLyBEZWFsIHdpdGggdGhlIHF1ZXVlIGJlaW5nIGVtcHR5IG9yIHBvcHVsYXRlZFxyXG4gICAgaWYgKHRoaXMuX2xhc3QpIHtcclxuICAgICAgaXRlbS5wcmV2ID0gdGhpcy5fbGFzdFxyXG4gICAgICB0aGlzLl9sYXN0Lm5leHQgPSBpdGVtXHJcbiAgICAgIHRoaXMuX2xhc3QgPSBpdGVtXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLl9sYXN0ID0gaXRlbVxyXG4gICAgICB0aGlzLl9maXJzdCA9IGl0ZW1cclxuICAgIH1cclxuXHJcbiAgICAvLyBSZXR1cm4gdGhlIGN1cnJlbnQgaXRlbVxyXG4gICAgcmV0dXJuIGl0ZW1cclxuICB9XHJcblxuICAvLyBSZW1vdmVzIHRoZSBpdGVtIHRoYXQgd2FzIHJldHVybmVkIGZyb20gdGhlIHB1c2hcbiAgcmVtb3ZlIChpdGVtKSB7XHJcbiAgICAvLyBSZWxpbmsgdGhlIHByZXZpb3VzIGl0ZW1cclxuICAgIGlmIChpdGVtLnByZXYpIGl0ZW0ucHJldi5uZXh0ID0gaXRlbS5uZXh0XHJcbiAgICBpZiAoaXRlbS5uZXh0KSBpdGVtLm5leHQucHJldiA9IGl0ZW0ucHJldlxyXG4gICAgaWYgKGl0ZW0gPT09IHRoaXMuX2xhc3QpIHRoaXMuX2xhc3QgPSBpdGVtLnByZXZcclxuICAgIGlmIChpdGVtID09PSB0aGlzLl9maXJzdCkgdGhpcy5fZmlyc3QgPSBpdGVtLm5leHRcclxuXHJcbiAgICAvLyBJbnZhbGlkYXRlIGl0ZW1cclxuICAgIGl0ZW0ucHJldiA9IG51bGxcclxuICAgIGl0ZW0ubmV4dCA9IG51bGxcclxuICB9XG5cbiAgc2hpZnQgKCkge1xyXG4gICAgLy8gQ2hlY2sgaWYgd2UgaGF2ZSBhIHZhbHVlXHJcbiAgICBjb25zdCByZW1vdmUgPSB0aGlzLl9maXJzdFxyXG4gICAgaWYgKCFyZW1vdmUpIHJldHVybiBudWxsXHJcblxyXG4gICAgLy8gSWYgd2UgZG8sIHJlbW92ZSBpdCBhbmQgcmVsaW5rIHRoaW5nc1xyXG4gICAgdGhpcy5fZmlyc3QgPSByZW1vdmUubmV4dFxyXG4gICAgaWYgKHRoaXMuX2ZpcnN0KSB0aGlzLl9maXJzdC5wcmV2ID0gbnVsbFxyXG4gICAgdGhpcy5fbGFzdCA9IHRoaXMuX2ZpcnN0ID8gdGhpcy5fbGFzdCA6IG51bGxcclxuICAgIHJldHVybiByZW1vdmUudmFsdWVcclxuICB9XHJcblxyXG59XHJcbiIsImltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi91dGlscy93aW5kb3cuanMnXHJcbmltcG9ydCBRdWV1ZSBmcm9tICcuL1F1ZXVlLmpzJ1xyXG5cclxuY29uc3QgQW5pbWF0b3IgPSB7XHJcbiAgbmV4dERyYXc6IG51bGwsXHJcbiAgZnJhbWVzOiBuZXcgUXVldWUoKSxcclxuICB0aW1lb3V0czogbmV3IFF1ZXVlKCksXHJcbiAgaW1tZWRpYXRlczogbmV3IFF1ZXVlKCksXHJcbiAgdGltZXI6ICgpID0+IGdsb2JhbHMud2luZG93LnBlcmZvcm1hbmNlIHx8IGdsb2JhbHMud2luZG93LkRhdGUsXHJcbiAgdHJhbnNmb3JtczogW10sXHJcblxyXG4gIGZyYW1lIChmbikge1xyXG4gICAgLy8gU3RvcmUgdGhlIG5vZGVcclxuICAgIGNvbnN0IG5vZGUgPSBBbmltYXRvci5mcmFtZXMucHVzaCh7IHJ1bjogZm4gfSlcclxuXHJcbiAgICAvLyBSZXF1ZXN0IGFuIGFuaW1hdGlvbiBmcmFtZSBpZiB3ZSBkb24ndCBoYXZlIG9uZVxyXG4gICAgaWYgKEFuaW1hdG9yLm5leHREcmF3ID09PSBudWxsKSB7XHJcbiAgICAgIEFuaW1hdG9yLm5leHREcmF3ID0gZ2xvYmFscy53aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKEFuaW1hdG9yLl9kcmF3KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJldHVybiB0aGUgbm9kZSBzbyB3ZSBjYW4gcmVtb3ZlIGl0IGVhc2lseVxyXG4gICAgcmV0dXJuIG5vZGVcclxuICB9LFxyXG5cclxuICB0aW1lb3V0IChmbiwgZGVsYXkpIHtcclxuICAgIGRlbGF5ID0gZGVsYXkgfHwgMFxyXG5cclxuICAgIC8vIFdvcmsgb3V0IHdoZW4gdGhlIGV2ZW50IHNob3VsZCBmaXJlXHJcbiAgICBjb25zdCB0aW1lID0gQW5pbWF0b3IudGltZXIoKS5ub3coKSArIGRlbGF5XHJcblxyXG4gICAgLy8gQWRkIHRoZSB0aW1lb3V0IHRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlXHJcbiAgICBjb25zdCBub2RlID0gQW5pbWF0b3IudGltZW91dHMucHVzaCh7IHJ1bjogZm4sIHRpbWU6IHRpbWUgfSlcclxuXHJcbiAgICAvLyBSZXF1ZXN0IGFub3RoZXIgYW5pbWF0aW9uIGZyYW1lIGlmIHdlIG5lZWQgb25lXHJcbiAgICBpZiAoQW5pbWF0b3IubmV4dERyYXcgPT09IG51bGwpIHtcclxuICAgICAgQW5pbWF0b3IubmV4dERyYXcgPSBnbG9iYWxzLndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoQW5pbWF0b3IuX2RyYXcpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5vZGVcclxuICB9LFxyXG5cclxuICBpbW1lZGlhdGUgKGZuKSB7XHJcbiAgICAvLyBBZGQgdGhlIGltbWVkaWF0ZSBmbiB0byB0aGUgZW5kIG9mIHRoZSBxdWV1ZVxyXG4gICAgY29uc3Qgbm9kZSA9IEFuaW1hdG9yLmltbWVkaWF0ZXMucHVzaChmbilcclxuICAgIC8vIFJlcXVlc3QgYW5vdGhlciBhbmltYXRpb24gZnJhbWUgaWYgd2UgbmVlZCBvbmVcclxuICAgIGlmIChBbmltYXRvci5uZXh0RHJhdyA9PT0gbnVsbCkge1xyXG4gICAgICBBbmltYXRvci5uZXh0RHJhdyA9IGdsb2JhbHMud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShBbmltYXRvci5fZHJhdylcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gbm9kZVxyXG4gIH0sXHJcblxyXG4gIGNhbmNlbEZyYW1lIChub2RlKSB7XHJcbiAgICBub2RlICE9IG51bGwgJiYgQW5pbWF0b3IuZnJhbWVzLnJlbW92ZShub2RlKVxyXG4gIH0sXHJcblxyXG4gIGNsZWFyVGltZW91dCAobm9kZSkge1xyXG4gICAgbm9kZSAhPSBudWxsICYmIEFuaW1hdG9yLnRpbWVvdXRzLnJlbW92ZShub2RlKVxyXG4gIH0sXHJcblxyXG4gIGNhbmNlbEltbWVkaWF0ZSAobm9kZSkge1xyXG4gICAgbm9kZSAhPSBudWxsICYmIEFuaW1hdG9yLmltbWVkaWF0ZXMucmVtb3ZlKG5vZGUpXHJcbiAgfSxcclxuXHJcbiAgX2RyYXcgKG5vdykge1xyXG4gICAgLy8gUnVuIGFsbCB0aGUgdGltZW91dHMgd2UgY2FuIHJ1biwgaWYgdGhleSBhcmUgbm90IHJlYWR5IHlldCwgYWRkIHRoZW1cclxuICAgIC8vIHRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlIGltbWVkaWF0ZWx5ISAoYmFkIHRpbWVvdXRzISEhIFtzYXJjYXNtXSlcclxuICAgIGxldCBuZXh0VGltZW91dCA9IG51bGxcclxuICAgIGNvbnN0IGxhc3RUaW1lb3V0ID0gQW5pbWF0b3IudGltZW91dHMubGFzdCgpXHJcbiAgICB3aGlsZSAoKG5leHRUaW1lb3V0ID0gQW5pbWF0b3IudGltZW91dHMuc2hpZnQoKSkpIHtcclxuICAgICAgLy8gUnVuIHRoZSB0aW1lb3V0IGlmIGl0cyB0aW1lLCBvciBwdXNoIGl0IHRvIHRoZSBlbmRcclxuICAgICAgaWYgKG5vdyA+PSBuZXh0VGltZW91dC50aW1lKSB7XHJcbiAgICAgICAgbmV4dFRpbWVvdXQucnVuKClcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBBbmltYXRvci50aW1lb3V0cy5wdXNoKG5leHRUaW1lb3V0KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB3ZSBoaXQgdGhlIGxhc3QgaXRlbSwgd2Ugc2hvdWxkIHN0b3Agc2hpZnRpbmcgb3V0IG1vcmUgaXRlbXNcclxuICAgICAgaWYgKG5leHRUaW1lb3V0ID09PSBsYXN0VGltZW91dCkgYnJlYWtcclxuICAgIH1cclxuXHJcbiAgICAvLyBSdW4gYWxsIG9mIHRoZSBhbmltYXRpb24gZnJhbWVzXHJcbiAgICBsZXQgbmV4dEZyYW1lID0gbnVsbFxyXG4gICAgY29uc3QgbGFzdEZyYW1lID0gQW5pbWF0b3IuZnJhbWVzLmxhc3QoKVxyXG4gICAgd2hpbGUgKChuZXh0RnJhbWUgIT09IGxhc3RGcmFtZSkgJiYgKG5leHRGcmFtZSA9IEFuaW1hdG9yLmZyYW1lcy5zaGlmdCgpKSkge1xyXG4gICAgICBuZXh0RnJhbWUucnVuKG5vdylcclxuICAgIH1cclxuXHJcbiAgICBsZXQgbmV4dEltbWVkaWF0ZSA9IG51bGxcclxuICAgIHdoaWxlICgobmV4dEltbWVkaWF0ZSA9IEFuaW1hdG9yLmltbWVkaWF0ZXMuc2hpZnQoKSkpIHtcclxuICAgICAgbmV4dEltbWVkaWF0ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSWYgd2UgaGF2ZSByZW1haW5pbmcgdGltZW91dHMgb3IgZnJhbWVzLCBkcmF3IHVudGlsIHdlIGRvbid0IGFueW1vcmVcclxuICAgIEFuaW1hdG9yLm5leHREcmF3ID0gQW5pbWF0b3IudGltZW91dHMuZmlyc3QoKSB8fCBBbmltYXRvci5mcmFtZXMuZmlyc3QoKVxyXG4gICAgICA/IGdsb2JhbHMud2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShBbmltYXRvci5fZHJhdylcclxuICAgICAgOiBudWxsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBBbmltYXRvclxyXG4iLCJpbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi4vdXRpbHMvd2luZG93LmpzJ1xyXG5pbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9tZXRob2RzLmpzJ1xyXG5pbXBvcnQgQW5pbWF0b3IgZnJvbSAnLi9BbmltYXRvci5qcydcclxuaW1wb3J0IEV2ZW50VGFyZ2V0IGZyb20gJy4uL3R5cGVzL0V2ZW50VGFyZ2V0LmpzJ1xyXG5cclxuY29uc3QgbWFrZVNjaGVkdWxlID0gZnVuY3Rpb24gKHJ1bm5lckluZm8pIHtcclxuICBjb25zdCBzdGFydCA9IHJ1bm5lckluZm8uc3RhcnRcclxuICBjb25zdCBkdXJhdGlvbiA9IHJ1bm5lckluZm8ucnVubmVyLmR1cmF0aW9uKClcclxuICBjb25zdCBlbmQgPSBzdGFydCArIGR1cmF0aW9uXHJcbiAgcmV0dXJuIHsgc3RhcnQ6IHN0YXJ0LCBkdXJhdGlvbjogZHVyYXRpb24sIGVuZDogZW5kLCBydW5uZXI6IHJ1bm5lckluZm8ucnVubmVyIH1cclxufVxyXG5cclxuY29uc3QgZGVmYXVsdFNvdXJjZSA9IGZ1bmN0aW9uICgpIHtcclxuICBjb25zdCB3ID0gZ2xvYmFscy53aW5kb3dcclxuICByZXR1cm4gKHcucGVyZm9ybWFuY2UgfHwgdy5EYXRlKS5ub3coKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lbGluZSBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcclxuICAvLyBDb25zdHJ1Y3QgYSBuZXcgdGltZWxpbmUgb24gdGhlIGdpdmVuIGVsZW1lbnRcclxuICBjb25zdHJ1Y3RvciAodGltZVNvdXJjZSA9IGRlZmF1bHRTb3VyY2UpIHtcclxuICAgIHN1cGVyKClcclxuXHJcbiAgICB0aGlzLl90aW1lU291cmNlID0gdGltZVNvdXJjZVxyXG5cclxuICAgIC8vIFN0b3JlIHRoZSB0aW1pbmcgdmFyaWFibGVzXHJcbiAgICB0aGlzLl9zdGFydFRpbWUgPSAwXHJcbiAgICB0aGlzLl9zcGVlZCA9IDEuMFxyXG5cclxuICAgIC8vIERldGVybWluZXMgaG93IGxvbmcgYSBydW5uZXIgaXMgaG9sZCBpbiBtZW1vcnkuIENhbiBiZSBhIGR0IG9yIHRydWUvZmFsc2VcclxuICAgIHRoaXMuX3BlcnNpc3QgPSAwXHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgcnVubmluZyBhbmltYXRpb25zIGFuZCB0aGVpciBzdGFydGluZyBwYXJhbWV0ZXJzXHJcbiAgICB0aGlzLl9uZXh0RnJhbWUgPSBudWxsXHJcbiAgICB0aGlzLl9wYXVzZWQgPSB0cnVlXHJcbiAgICB0aGlzLl9ydW5uZXJzID0gW11cclxuICAgIHRoaXMuX3J1bm5lcklkcyA9IFtdXHJcbiAgICB0aGlzLl9sYXN0UnVubmVySWQgPSAtMVxyXG4gICAgdGhpcy5fdGltZSA9IDBcclxuICAgIHRoaXMuX2xhc3RTb3VyY2VUaW1lID0gMFxyXG4gICAgdGhpcy5fbGFzdFN0ZXBUaW1lID0gMFxyXG5cclxuICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHN0ZXAgaXMgYWx3YXlzIGNhbGxlZCBpbiBjbGFzcyBjb250ZXh0XHJcbiAgICB0aGlzLl9zdGVwID0gdGhpcy5fc3RlcEZuLmJpbmQodGhpcywgZmFsc2UpXHJcbiAgICB0aGlzLl9zdGVwSW1tZWRpYXRlID0gdGhpcy5fc3RlcEZuLmJpbmQodGhpcywgdHJ1ZSlcclxuICB9XHJcblxyXG4gIGFjdGl2ZSAoKSB7XHJcbiAgICByZXR1cm4gISF0aGlzLl9uZXh0RnJhbWVcclxuICB9XHJcblxyXG4gIGZpbmlzaCAoKSB7XHJcbiAgICAvLyBHbyB0byBlbmQgYW5kIHBhdXNlXHJcbiAgICB0aGlzLnRpbWUodGhpcy5nZXRFbmRUaW1lT2ZUaW1lbGluZSgpICsgMSlcclxuICAgIHJldHVybiB0aGlzLnBhdXNlKClcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZXMgdGhlIGVuZCBvZiB0aGUgdGltZWxpbmVcclxuICBnZXRFbmRUaW1lICgpIHtcclxuICAgIGNvbnN0IGxhc3RSdW5uZXJJbmZvID0gdGhpcy5nZXRMYXN0UnVubmVySW5mbygpXHJcbiAgICBjb25zdCBsYXN0RHVyYXRpb24gPSBsYXN0UnVubmVySW5mbyA/IGxhc3RSdW5uZXJJbmZvLnJ1bm5lci5kdXJhdGlvbigpIDogMFxyXG4gICAgY29uc3QgbGFzdFN0YXJ0VGltZSA9IGxhc3RSdW5uZXJJbmZvID8gbGFzdFJ1bm5lckluZm8uc3RhcnQgOiB0aGlzLl90aW1lXHJcbiAgICByZXR1cm4gbGFzdFN0YXJ0VGltZSArIGxhc3REdXJhdGlvblxyXG4gIH1cclxuXHJcbiAgZ2V0RW5kVGltZU9mVGltZWxpbmUgKCkge1xyXG4gICAgY29uc3QgZW5kVGltZXMgPSB0aGlzLl9ydW5uZXJzLm1hcCgoaSkgPT4gaS5zdGFydCArIGkucnVubmVyLmR1cmF0aW9uKCkpXHJcbiAgICByZXR1cm4gTWF0aC5tYXgoMCwgLi4uZW5kVGltZXMpXHJcbiAgfVxyXG5cclxuICBnZXRMYXN0UnVubmVySW5mbyAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5nZXRSdW5uZXJJbmZvQnlJZCh0aGlzLl9sYXN0UnVubmVySWQpXHJcbiAgfVxyXG5cclxuICBnZXRSdW5uZXJJbmZvQnlJZCAoaWQpIHtcclxuICAgIHJldHVybiB0aGlzLl9ydW5uZXJzW3RoaXMuX3J1bm5lcklkcy5pbmRleE9mKGlkKV0gfHwgbnVsbFxyXG4gIH1cclxuXHJcbiAgcGF1c2UgKCkge1xyXG4gICAgdGhpcy5fcGF1c2VkID0gdHJ1ZVxyXG4gICAgcmV0dXJuIHRoaXMuX2NvbnRpbnVlKClcclxuICB9XHJcblxyXG4gIHBlcnNpc3QgKGR0T3JGb3JldmVyKSB7XHJcbiAgICBpZiAoZHRPckZvcmV2ZXIgPT0gbnVsbCkgcmV0dXJuIHRoaXMuX3BlcnNpc3RcclxuICAgIHRoaXMuX3BlcnNpc3QgPSBkdE9yRm9yZXZlclxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHBsYXkgKCkge1xyXG4gICAgLy8gTm93IG1ha2Ugc3VyZSB3ZSBhcmUgbm90IHBhdXNlZCBhbmQgY29udGludWUgdGhlIGFuaW1hdGlvblxyXG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2VcclxuICAgIHJldHVybiB0aGlzLnVwZGF0ZVRpbWUoKS5fY29udGludWUoKVxyXG4gIH1cclxuXHJcbiAgcmV2ZXJzZSAoeWVzKSB7XHJcbiAgICBjb25zdCBjdXJyZW50U3BlZWQgPSB0aGlzLnNwZWVkKClcclxuICAgIGlmICh5ZXMgPT0gbnVsbCkgcmV0dXJuIHRoaXMuc3BlZWQoLWN1cnJlbnRTcGVlZClcclxuXHJcbiAgICBjb25zdCBwb3NpdGl2ZSA9IE1hdGguYWJzKGN1cnJlbnRTcGVlZClcclxuICAgIHJldHVybiB0aGlzLnNwZWVkKHllcyA/IC1wb3NpdGl2ZSA6IHBvc2l0aXZlKVxyXG4gIH1cclxuXHJcbiAgLy8gc2NoZWR1bGVzIGEgcnVubmVyIG9uIHRoZSB0aW1lbGluZVxyXG4gIHNjaGVkdWxlIChydW5uZXIsIGRlbGF5LCB3aGVuKSB7XHJcbiAgICBpZiAocnVubmVyID09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3J1bm5lcnMubWFwKG1ha2VTY2hlZHVsZSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBUaGUgc3RhcnQgdGltZSBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIGNhbiBlaXRoZXIgYmUgZ2l2ZW4gZXhwbGljaXRseSxcclxuICAgIC8vIGRlcml2ZWQgZnJvbSB0aGUgY3VycmVudCB0aW1lbGluZSB0aW1lIG9yIGl0IGNhbiBiZSByZWxhdGl2ZSB0byB0aGVcclxuICAgIC8vIGxhc3Qgc3RhcnQgdGltZSB0byBjaGFpbiBhbmltYXRpb25zIGRpcmVjdGx5XHJcblxyXG4gICAgbGV0IGFic29sdXRlU3RhcnRUaW1lID0gMFxyXG4gICAgY29uc3QgZW5kVGltZSA9IHRoaXMuZ2V0RW5kVGltZSgpXHJcbiAgICBkZWxheSA9IGRlbGF5IHx8IDBcclxuXHJcbiAgICAvLyBXb3JrIG91dCB3aGVuIHRvIHN0YXJ0IHRoZSBhbmltYXRpb25cclxuICAgIGlmICh3aGVuID09IG51bGwgfHwgd2hlbiA9PT0gJ2xhc3QnIHx8IHdoZW4gPT09ICdhZnRlcicpIHtcclxuICAgICAgLy8gVGFrZSB0aGUgbGFzdCB0aW1lIGFuZCBpbmNyZW1lbnRcclxuICAgICAgYWJzb2x1dGVTdGFydFRpbWUgPSBlbmRUaW1lXHJcbiAgICB9IGVsc2UgaWYgKHdoZW4gPT09ICdhYnNvbHV0ZScgfHwgd2hlbiA9PT0gJ3N0YXJ0Jykge1xyXG4gICAgICBhYnNvbHV0ZVN0YXJ0VGltZSA9IGRlbGF5XHJcbiAgICAgIGRlbGF5ID0gMFxyXG4gICAgfSBlbHNlIGlmICh3aGVuID09PSAnbm93Jykge1xyXG4gICAgICBhYnNvbHV0ZVN0YXJ0VGltZSA9IHRoaXMuX3RpbWVcclxuICAgIH0gZWxzZSBpZiAod2hlbiA9PT0gJ3JlbGF0aXZlJykge1xyXG4gICAgICBjb25zdCBydW5uZXJJbmZvID0gdGhpcy5nZXRSdW5uZXJJbmZvQnlJZChydW5uZXIuaWQpXHJcbiAgICAgIGlmIChydW5uZXJJbmZvKSB7XHJcbiAgICAgICAgYWJzb2x1dGVTdGFydFRpbWUgPSBydW5uZXJJbmZvLnN0YXJ0ICsgZGVsYXlcclxuICAgICAgICBkZWxheSA9IDBcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh3aGVuID09PSAnd2l0aC1sYXN0Jykge1xyXG4gICAgICBjb25zdCBsYXN0UnVubmVySW5mbyA9IHRoaXMuZ2V0TGFzdFJ1bm5lckluZm8oKVxyXG4gICAgICBjb25zdCBsYXN0U3RhcnRUaW1lID0gbGFzdFJ1bm5lckluZm8gPyBsYXN0UnVubmVySW5mby5zdGFydCA6IHRoaXMuX3RpbWVcclxuICAgICAgYWJzb2x1dGVTdGFydFRpbWUgPSBsYXN0U3RhcnRUaW1lXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmFsdWUgZm9yIHRoZSBcIndoZW5cIiBwYXJhbWV0ZXInKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE1hbmFnZSBydW5uZXJcclxuICAgIHJ1bm5lci51bnNjaGVkdWxlKClcclxuICAgIHJ1bm5lci50aW1lbGluZSh0aGlzKVxyXG5cclxuICAgIGNvbnN0IHBlcnNpc3QgPSBydW5uZXIucGVyc2lzdCgpXHJcbiAgICBjb25zdCBydW5uZXJJbmZvID0ge1xyXG4gICAgICBwZXJzaXN0OiBwZXJzaXN0ID09PSBudWxsID8gdGhpcy5fcGVyc2lzdCA6IHBlcnNpc3QsXHJcbiAgICAgIHN0YXJ0OiBhYnNvbHV0ZVN0YXJ0VGltZSArIGRlbGF5LFxyXG4gICAgICBydW5uZXJcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl9sYXN0UnVubmVySWQgPSBydW5uZXIuaWRcclxuXHJcbiAgICB0aGlzLl9ydW5uZXJzLnB1c2gocnVubmVySW5mbylcclxuICAgIHRoaXMuX3J1bm5lcnMuc29ydCgoYSwgYikgPT4gYS5zdGFydCAtIGIuc3RhcnQpXHJcbiAgICB0aGlzLl9ydW5uZXJJZHMgPSB0aGlzLl9ydW5uZXJzLm1hcChpbmZvID0+IGluZm8ucnVubmVyLmlkKVxyXG5cclxuICAgIHRoaXMudXBkYXRlVGltZSgpLl9jb250aW51ZSgpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgc2VlayAoZHQpIHtcclxuICAgIHJldHVybiB0aGlzLnRpbWUodGhpcy5fdGltZSArIGR0KVxyXG4gIH1cclxuXHJcbiAgc291cmNlIChmbikge1xyXG4gICAgaWYgKGZuID09IG51bGwpIHJldHVybiB0aGlzLl90aW1lU291cmNlXHJcbiAgICB0aGlzLl90aW1lU291cmNlID0gZm5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBzcGVlZCAoc3BlZWQpIHtcclxuICAgIGlmIChzcGVlZCA9PSBudWxsKSByZXR1cm4gdGhpcy5fc3BlZWRcclxuICAgIHRoaXMuX3NwZWVkID0gc3BlZWRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBzdG9wICgpIHtcclxuICAgIC8vIEdvIHRvIHN0YXJ0IGFuZCBwYXVzZVxyXG4gICAgdGhpcy50aW1lKDApXHJcbiAgICByZXR1cm4gdGhpcy5wYXVzZSgpXHJcbiAgfVxyXG5cclxuICB0aW1lICh0aW1lKSB7XHJcbiAgICBpZiAodGltZSA9PSBudWxsKSByZXR1cm4gdGhpcy5fdGltZVxyXG4gICAgdGhpcy5fdGltZSA9IHRpbWVcclxuICAgIHJldHVybiB0aGlzLl9jb250aW51ZSh0cnVlKVxyXG4gIH1cclxuXHJcbiAgLy8gUmVtb3ZlIHRoZSBydW5uZXIgZnJvbSB0aGlzIHRpbWVsaW5lXHJcbiAgdW5zY2hlZHVsZSAocnVubmVyKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuX3J1bm5lcklkcy5pbmRleE9mKHJ1bm5lci5pZClcclxuICAgIGlmIChpbmRleCA8IDApIHJldHVybiB0aGlzXHJcblxyXG4gICAgdGhpcy5fcnVubmVycy5zcGxpY2UoaW5kZXgsIDEpXHJcbiAgICB0aGlzLl9ydW5uZXJJZHMuc3BsaWNlKGluZGV4LCAxKVxyXG5cclxuICAgIHJ1bm5lci50aW1lbGluZShudWxsKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIE1ha2VzIHN1cmUsIHRoYXQgYWZ0ZXIgcGF1c2luZyB0aGUgdGltZSBkb2Vzbid0IGp1bXBcclxuICB1cGRhdGVUaW1lICgpIHtcclxuICAgIGlmICghdGhpcy5hY3RpdmUoKSkge1xyXG4gICAgICB0aGlzLl9sYXN0U291cmNlVGltZSA9IHRoaXMuX3RpbWVTb3VyY2UoKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8vIENoZWNrcyBpZiB3ZSBhcmUgcnVubmluZyBhbmQgY29udGludWVzIHRoZSBhbmltYXRpb25cclxuICBfY29udGludWUgKGltbWVkaWF0ZVN0ZXAgPSBmYWxzZSkge1xyXG4gICAgQW5pbWF0b3IuY2FuY2VsRnJhbWUodGhpcy5fbmV4dEZyYW1lKVxyXG4gICAgdGhpcy5fbmV4dEZyYW1lID0gbnVsbFxyXG5cclxuICAgIGlmIChpbW1lZGlhdGVTdGVwKSByZXR1cm4gdGhpcy5fc3RlcEltbWVkaWF0ZSgpXHJcbiAgICBpZiAodGhpcy5fcGF1c2VkKSByZXR1cm4gdGhpc1xyXG5cclxuICAgIHRoaXMuX25leHRGcmFtZSA9IEFuaW1hdG9yLmZyYW1lKHRoaXMuX3N0ZXApXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgX3N0ZXBGbiAoaW1tZWRpYXRlU3RlcCA9IGZhbHNlKSB7XHJcbiAgICAvLyBHZXQgdGhlIHRpbWUgZGVsdGEgZnJvbSB0aGUgbGFzdCB0aW1lIGFuZCB1cGRhdGUgdGhlIHRpbWVcclxuICAgIGNvbnN0IHRpbWUgPSB0aGlzLl90aW1lU291cmNlKClcclxuICAgIGxldCBkdFNvdXJjZSA9IHRpbWUgLSB0aGlzLl9sYXN0U291cmNlVGltZVxyXG5cclxuICAgIGlmIChpbW1lZGlhdGVTdGVwKSBkdFNvdXJjZSA9IDBcclxuXHJcbiAgICBjb25zdCBkdFRpbWUgPSB0aGlzLl9zcGVlZCAqIGR0U291cmNlICsgKHRoaXMuX3RpbWUgLSB0aGlzLl9sYXN0U3RlcFRpbWUpXHJcbiAgICB0aGlzLl9sYXN0U291cmNlVGltZSA9IHRpbWVcclxuXHJcbiAgICAvLyBPbmx5IHVwZGF0ZSB0aGUgdGltZSBpZiB3ZSB1c2UgdGhlIHRpbWVTb3VyY2UuXHJcbiAgICAvLyBPdGhlcndpc2UgdXNlIHRoZSBjdXJyZW50IHRpbWVcclxuICAgIGlmICghaW1tZWRpYXRlU3RlcCkge1xyXG4gICAgICAvLyBVcGRhdGUgdGhlIHRpbWVcclxuICAgICAgdGhpcy5fdGltZSArPSBkdFRpbWVcclxuICAgICAgdGhpcy5fdGltZSA9IHRoaXMuX3RpbWUgPCAwID8gMCA6IHRoaXMuX3RpbWVcclxuICAgIH1cclxuICAgIHRoaXMuX2xhc3RTdGVwVGltZSA9IHRoaXMuX3RpbWVcclxuICAgIHRoaXMuZmlyZSgndGltZScsIHRoaXMuX3RpbWUpXHJcblxyXG4gICAgLy8gVGhpcyBpcyBmb3IgdGhlIGNhc2UgdGhhdCB0aGUgdGltZWxpbmUgd2FzIHNlZWtlZCBzbyB0aGF0IHRoZSB0aW1lXHJcbiAgICAvLyBpcyBub3cgYmVmb3JlIHRoZSBzdGFydFRpbWUgb2YgdGhlIHJ1bm5lci4gVGhhdHMgd2h5IHdlIG5lZWQgdG8gc2V0XHJcbiAgICAvLyB0aGUgcnVubmVyIHRvIHBvc2l0aW9uIDBcclxuXHJcbiAgICAvLyBGSVhNRTpcclxuICAgIC8vIEhvd2V2ZXIsIHJlc2V0aW5nIGluIGluc2VydGlvbiBvcmRlciBsZWFkcyB0byBidWdzLiBDb25zaWRlcmluZyB0aGUgY2FzZSxcclxuICAgIC8vIHdoZXJlIDIgcnVubmVycyBjaGFuZ2UgdGhlIHNhbWUgYXR0cmlidXRlIGJ1dCBpbiBkaWZmZXJlbnQgdGltZXMsXHJcbiAgICAvLyByZXNldGluZyBib3RoIG9mIHRoZW0gd2lsbCBsZWFkIHRvIHRoZSBjYXNlIHdoZXJlIHRoZSBsYXRlciBkZWZpbmVkXHJcbiAgICAvLyBydW5uZXIgYWx3YXlzIHdpbnMgdGhlIHJlc2V0IGV2ZW4gaWYgdGhlIG90aGVyIHJ1bm5lciBzdGFydGVkIGVhcmxpZXJcclxuICAgIC8vIGFuZCB0aGVyZWZvcmUgc2hvdWxkIHdpbiB0aGUgYXR0cmlidXRlIGJhdHRsZVxyXG4gICAgLy8gdGhpcyBjYW4gYmUgc29sdmVkIGJ5IHJlc2V0aW5nIHRoZW0gYmFja3dhcmRzXHJcbiAgICBmb3IgKGxldCBrID0gdGhpcy5fcnVubmVycy5sZW5ndGg7IGstLTspIHtcclxuICAgICAgLy8gR2V0IGFuZCBydW4gdGhlIGN1cnJlbnQgcnVubmVyIGFuZCBpZ25vcmUgaXQgaWYgaXRzIGluYWN0aXZlXHJcbiAgICAgIGNvbnN0IHJ1bm5lckluZm8gPSB0aGlzLl9ydW5uZXJzW2tdXHJcbiAgICAgIGNvbnN0IHJ1bm5lciA9IHJ1bm5lckluZm8ucnVubmVyXHJcblxyXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCB3ZSBnaXZlIHRoZSBhY3R1YWwgZGlmZmVyZW5jZVxyXG4gICAgICAvLyBiZXR3ZWVuIHJ1bm5lciBzdGFydCB0aW1lIGFuZCBub3dcclxuICAgICAgY29uc3QgZHRUb1N0YXJ0ID0gdGhpcy5fdGltZSAtIHJ1bm5lckluZm8uc3RhcnRcclxuXHJcbiAgICAgIC8vIERvbnQgcnVuIHJ1bm5lciBpZiBub3Qgc3RhcnRlZCB5ZXRcclxuICAgICAgLy8gYW5kIHRyeSB0byByZXNldCBpdFxyXG4gICAgICBpZiAoZHRUb1N0YXJ0IDw9IDApIHtcclxuICAgICAgICBydW5uZXIucmVzZXQoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUnVuIGFsbCBvZiB0aGUgcnVubmVycyBkaXJlY3RseVxyXG4gICAgbGV0IHJ1bm5lcnNMZWZ0ID0gZmFsc2VcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLl9ydW5uZXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgIC8vIEdldCBhbmQgcnVuIHRoZSBjdXJyZW50IHJ1bm5lciBhbmQgaWdub3JlIGl0IGlmIGl0cyBpbmFjdGl2ZVxyXG4gICAgICBjb25zdCBydW5uZXJJbmZvID0gdGhpcy5fcnVubmVyc1tpXVxyXG4gICAgICBjb25zdCBydW5uZXIgPSBydW5uZXJJbmZvLnJ1bm5lclxyXG4gICAgICBsZXQgZHQgPSBkdFRpbWVcclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHdlIGdpdmUgdGhlIGFjdHVhbCBkaWZmZXJlbmNlXHJcbiAgICAgIC8vIGJldHdlZW4gcnVubmVyIHN0YXJ0IHRpbWUgYW5kIG5vd1xyXG4gICAgICBjb25zdCBkdFRvU3RhcnQgPSB0aGlzLl90aW1lIC0gcnVubmVySW5mby5zdGFydFxyXG5cclxuICAgICAgLy8gRG9udCBydW4gcnVubmVyIGlmIG5vdCBzdGFydGVkIHlldFxyXG4gICAgICBpZiAoZHRUb1N0YXJ0IDw9IDApIHtcclxuICAgICAgICBydW5uZXJzTGVmdCA9IHRydWVcclxuICAgICAgICBjb250aW51ZVxyXG4gICAgICB9IGVsc2UgaWYgKGR0VG9TdGFydCA8IGR0KSB7XHJcbiAgICAgICAgLy8gQWRqdXN0IGR0IHRvIG1ha2Ugc3VyZSB0aGF0IGFuaW1hdGlvbiBpcyBvbiBwb2ludFxyXG4gICAgICAgIGR0ID0gZHRUb1N0YXJ0XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghcnVubmVyLmFjdGl2ZSgpKSBjb250aW51ZVxyXG5cclxuICAgICAgLy8gSWYgdGhpcyBydW5uZXIgaXMgc3RpbGwgZ29pbmcsIHNpZ25hbCB0aGF0IHdlIG5lZWQgYW5vdGhlciBhbmltYXRpb25cclxuICAgICAgLy8gZnJhbWUsIG90aGVyd2lzZSwgcmVtb3ZlIHRoZSBjb21wbGV0ZWQgcnVubmVyXHJcbiAgICAgIGNvbnN0IGZpbmlzaGVkID0gcnVubmVyLnN0ZXAoZHQpLmRvbmVcclxuICAgICAgaWYgKCFmaW5pc2hlZCkge1xyXG4gICAgICAgIHJ1bm5lcnNMZWZ0ID0gdHJ1ZVxyXG4gICAgICAgIC8vIGNvbnRpbnVlXHJcbiAgICAgIH0gZWxzZSBpZiAocnVubmVySW5mby5wZXJzaXN0ICE9PSB0cnVlKSB7XHJcbiAgICAgICAgLy8gcnVubmVyIGlzIGZpbmlzaGVkLiBBbmQgcnVubmVyIG1pZ2h0IGdldCByZW1vdmVkXHJcbiAgICAgICAgY29uc3QgZW5kVGltZSA9IHJ1bm5lci5kdXJhdGlvbigpIC0gcnVubmVyLnRpbWUoKSArIHRoaXMuX3RpbWVcclxuXHJcbiAgICAgICAgaWYgKGVuZFRpbWUgKyBydW5uZXJJbmZvLnBlcnNpc3QgPCB0aGlzLl90aW1lKSB7XHJcbiAgICAgICAgICAvLyBEZWxldGUgcnVubmVyIGFuZCBjb3JyZWN0IGluZGV4XHJcbiAgICAgICAgICBydW5uZXIudW5zY2hlZHVsZSgpXHJcbiAgICAgICAgICAtLWlcclxuICAgICAgICAgIC0tbGVuXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQmFzaWNhbGx5OiB3ZSBjb250aW51ZSB3aGVuIHRoZXJlIGFyZSBydW5uZXJzIHJpZ2h0IGZyb20gdXMgaW4gdGltZVxyXG4gICAgLy8gd2hlbiAtLT4sIGFuZCB3aGVuIHJ1bm5lcnMgYXJlIGxlZnQgZnJvbSB1cyB3aGVuIDwtLVxyXG4gICAgaWYgKChydW5uZXJzTGVmdCAmJiAhKHRoaXMuX3NwZWVkIDwgMCAmJiB0aGlzLl90aW1lID09PSAwKSkgfHwgKHRoaXMuX3J1bm5lcklkcy5sZW5ndGggJiYgdGhpcy5fc3BlZWQgPCAwICYmIHRoaXMuX3RpbWUgPiAwKSkge1xyXG4gICAgICB0aGlzLl9jb250aW51ZSgpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBhdXNlKClcclxuICAgICAgdGhpcy5maXJlKCdmaW5pc2hlZCcpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIEVsZW1lbnQ6IHtcclxuICAgIHRpbWVsaW5lOiBmdW5jdGlvbiAodGltZWxpbmUpIHtcclxuICAgICAgaWYgKHRpbWVsaW5lID09IG51bGwpIHtcclxuICAgICAgICB0aGlzLl90aW1lbGluZSA9ICh0aGlzLl90aW1lbGluZSB8fCBuZXcgVGltZWxpbmUoKSlcclxuICAgICAgICByZXR1cm4gdGhpcy5fdGltZWxpbmVcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl90aW1lbGluZSA9IHRpbWVsaW5lXHJcbiAgICAgICAgcmV0dXJuIHRoaXNcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIiwiaW1wb3J0IHsgQ29udHJvbGxlciwgRWFzZSwgU3RlcHBlciB9IGZyb20gJy4vQ29udHJvbGxlci5qcydcclxuaW1wb3J0IHsgZXh0ZW5kLCByZWdpc3RlciB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IGZyb20sIHRvIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL2dyYWRpZW50ZWQuanMnXHJcbmltcG9ydCB7IGdldE9yaWdpbiB9IGZyb20gJy4uL3V0aWxzL3V0aWxzLmpzJ1xyXG5pbXBvcnQgeyBub29wLCB0aW1lbGluZSB9IGZyb20gJy4uL21vZHVsZXMvY29yZS9kZWZhdWx0cy5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IHsgcngsIHJ5IH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL2NpcmNsZWQuanMnXHJcbmltcG9ydCBBbmltYXRvciBmcm9tICcuL0FuaW1hdG9yLmpzJ1xyXG5pbXBvcnQgQm94IGZyb20gJy4uL3R5cGVzL0JveC5qcydcclxuaW1wb3J0IEV2ZW50VGFyZ2V0IGZyb20gJy4uL3R5cGVzL0V2ZW50VGFyZ2V0LmpzJ1xyXG5pbXBvcnQgTWF0cml4IGZyb20gJy4uL3R5cGVzL01hdHJpeC5qcydcclxuaW1wb3J0IE1vcnBoYWJsZSwgeyBUcmFuc2Zvcm1CYWcsIE9iamVjdEJhZyB9IGZyb20gJy4vTW9ycGhhYmxlLmpzJ1xyXG5pbXBvcnQgUG9pbnQgZnJvbSAnLi4vdHlwZXMvUG9pbnQuanMnXHJcbmltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi4vdHlwZXMvU1ZHTnVtYmVyLmpzJ1xyXG5pbXBvcnQgVGltZWxpbmUgZnJvbSAnLi9UaW1lbGluZS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJ1bm5lciBleHRlbmRzIEV2ZW50VGFyZ2V0IHtcclxuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xyXG4gICAgc3VwZXIoKVxyXG5cclxuICAgIC8vIFN0b3JlIGEgdW5pcXVlIGlkIG9uIHRoZSBydW5uZXIsIHNvIHRoYXQgd2UgY2FuIGlkZW50aWZ5IGl0IGxhdGVyXHJcbiAgICB0aGlzLmlkID0gUnVubmVyLmlkKytcclxuXHJcbiAgICAvLyBFbnN1cmUgYSBkZWZhdWx0IHZhbHVlXHJcbiAgICBvcHRpb25zID0gb3B0aW9ucyA9PSBudWxsXHJcbiAgICAgID8gdGltZWxpbmUuZHVyYXRpb25cclxuICAgICAgOiBvcHRpb25zXHJcblxyXG4gICAgLy8gRW5zdXJlIHRoYXQgd2UgZ2V0IGEgY29udHJvbGxlclxyXG4gICAgb3B0aW9ucyA9IHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nXHJcbiAgICAgID8gbmV3IENvbnRyb2xsZXIob3B0aW9ucylcclxuICAgICAgOiBvcHRpb25zXHJcblxyXG4gICAgLy8gRGVjbGFyZSBhbGwgb2YgdGhlIHZhcmlhYmxlc1xyXG4gICAgdGhpcy5fZWxlbWVudCA9IG51bGxcclxuICAgIHRoaXMuX3RpbWVsaW5lID0gbnVsbFxyXG4gICAgdGhpcy5kb25lID0gZmFsc2VcclxuICAgIHRoaXMuX3F1ZXVlID0gW11cclxuXHJcbiAgICAvLyBXb3JrIG91dCB0aGUgc3RlcHBlciBhbmQgdGhlIGR1cmF0aW9uXHJcbiAgICB0aGlzLl9kdXJhdGlvbiA9IHR5cGVvZiBvcHRpb25zID09PSAnbnVtYmVyJyAmJiBvcHRpb25zXHJcbiAgICB0aGlzLl9pc0RlY2xhcmF0aXZlID0gb3B0aW9ucyBpbnN0YW5jZW9mIENvbnRyb2xsZXJcclxuICAgIHRoaXMuX3N0ZXBwZXIgPSB0aGlzLl9pc0RlY2xhcmF0aXZlID8gb3B0aW9ucyA6IG5ldyBFYXNlKClcclxuXHJcbiAgICAvLyBXZSBjb3B5IHRoZSBjdXJyZW50IHZhbHVlcyBmcm9tIHRoZSB0aW1lbGluZSBiZWNhdXNlIHRoZXkgY2FuIGNoYW5nZVxyXG4gICAgdGhpcy5faGlzdG9yeSA9IHt9XHJcblxyXG4gICAgLy8gU3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBydW5uZXJcclxuICAgIHRoaXMuZW5hYmxlZCA9IHRydWVcclxuICAgIHRoaXMuX3RpbWUgPSAwXHJcbiAgICB0aGlzLl9sYXN0VGltZSA9IDBcclxuXHJcbiAgICAvLyBBdCBjcmVhdGlvbiwgdGhlIHJ1bm5lciBpcyBpbiByZXNldGVkIHN0YXRlXHJcbiAgICB0aGlzLl9yZXNldGVkID0gdHJ1ZVxyXG5cclxuICAgIC8vIFNhdmUgdHJhbnNmb3JtcyBhcHBsaWVkIHRvIHRoaXMgcnVubmVyXHJcbiAgICB0aGlzLnRyYW5zZm9ybXMgPSBuZXcgTWF0cml4KClcclxuICAgIHRoaXMudHJhbnNmb3JtSWQgPSAxXHJcblxyXG4gICAgLy8gTG9vcGluZyB2YXJpYWJsZXNcclxuICAgIHRoaXMuX2hhdmVSZXZlcnNlZCA9IGZhbHNlXHJcbiAgICB0aGlzLl9yZXZlcnNlID0gZmFsc2VcclxuICAgIHRoaXMuX2xvb3BzRG9uZSA9IDBcclxuICAgIHRoaXMuX3N3aW5nID0gZmFsc2VcclxuICAgIHRoaXMuX3dhaXQgPSAwXHJcbiAgICB0aGlzLl90aW1lcyA9IDFcclxuXHJcbiAgICB0aGlzLl9mcmFtZUlkID0gbnVsbFxyXG5cclxuICAgIC8vIFN0b3JlcyBob3cgbG9uZyBhIHJ1bm5lciBpcyBzdG9yZWQgYWZ0ZXIgYmVlaW5nIGRvbmVcclxuICAgIHRoaXMuX3BlcnNpc3QgPSB0aGlzLl9pc0RlY2xhcmF0aXZlID8gdHJ1ZSA6IG51bGxcclxuICB9XHJcblxyXG4gIHN0YXRpYyBzYW5pdGlzZSAoZHVyYXRpb24sIGRlbGF5LCB3aGVuKSB7XHJcbiAgICAvLyBJbml0aWFsaXNlIHRoZSBkZWZhdWx0IHBhcmFtZXRlcnNcclxuICAgIGxldCB0aW1lcyA9IDFcclxuICAgIGxldCBzd2luZyA9IGZhbHNlXHJcbiAgICBsZXQgd2FpdCA9IDBcclxuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gfHwgdGltZWxpbmUuZHVyYXRpb25cclxuICAgIGRlbGF5ID0gZGVsYXkgfHwgdGltZWxpbmUuZGVsYXlcclxuICAgIHdoZW4gPSB3aGVuIHx8ICdsYXN0J1xyXG5cclxuICAgIC8vIElmIHdlIGhhdmUgYW4gb2JqZWN0LCB1bnBhY2sgdGhlIHZhbHVlc1xyXG4gICAgaWYgKHR5cGVvZiBkdXJhdGlvbiA9PT0gJ29iamVjdCcgJiYgIShkdXJhdGlvbiBpbnN0YW5jZW9mIFN0ZXBwZXIpKSB7XHJcbiAgICAgIGRlbGF5ID0gZHVyYXRpb24uZGVsYXkgfHwgZGVsYXlcclxuICAgICAgd2hlbiA9IGR1cmF0aW9uLndoZW4gfHwgd2hlblxyXG4gICAgICBzd2luZyA9IGR1cmF0aW9uLnN3aW5nIHx8IHN3aW5nXHJcbiAgICAgIHRpbWVzID0gZHVyYXRpb24udGltZXMgfHwgdGltZXNcclxuICAgICAgd2FpdCA9IGR1cmF0aW9uLndhaXQgfHwgd2FpdFxyXG4gICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uLmR1cmF0aW9uIHx8IHRpbWVsaW5lLmR1cmF0aW9uXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxyXG4gICAgICBkZWxheTogZGVsYXksXHJcbiAgICAgIHN3aW5nOiBzd2luZyxcclxuICAgICAgdGltZXM6IHRpbWVzLFxyXG4gICAgICB3YWl0OiB3YWl0LFxyXG4gICAgICB3aGVuOiB3aGVuXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhY3RpdmUgKGVuYWJsZWQpIHtcclxuICAgIGlmIChlbmFibGVkID09IG51bGwpIHJldHVybiB0aGlzLmVuYWJsZWRcclxuICAgIHRoaXMuZW5hYmxlZCA9IGVuYWJsZWRcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICAvKlxyXG4gIFByaXZhdGUgTWV0aG9kc1xyXG4gID09PT09PT09PT09PT09PVxyXG4gIE1ldGhvZHMgdGhhdCBzaG91bGRuJ3QgYmUgdXNlZCBleHRlcm5hbGx5XHJcbiAgKi9cclxuICBhZGRUcmFuc2Zvcm0gKHRyYW5zZm9ybSwgaW5kZXgpIHtcclxuICAgIHRoaXMudHJhbnNmb3Jtcy5sbXVsdGlwbHlPKHRyYW5zZm9ybSlcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICBhZnRlciAoZm4pIHtcclxuICAgIHJldHVybiB0aGlzLm9uKCdmaW5pc2hlZCcsIGZuKVxyXG4gIH1cclxuXHJcbiAgYW5pbWF0ZSAoZHVyYXRpb24sIGRlbGF5LCB3aGVuKSB7XHJcbiAgICBjb25zdCBvID0gUnVubmVyLnNhbml0aXNlKGR1cmF0aW9uLCBkZWxheSwgd2hlbilcclxuICAgIGNvbnN0IHJ1bm5lciA9IG5ldyBSdW5uZXIoby5kdXJhdGlvbilcclxuICAgIGlmICh0aGlzLl90aW1lbGluZSkgcnVubmVyLnRpbWVsaW5lKHRoaXMuX3RpbWVsaW5lKVxyXG4gICAgaWYgKHRoaXMuX2VsZW1lbnQpIHJ1bm5lci5lbGVtZW50KHRoaXMuX2VsZW1lbnQpXHJcbiAgICByZXR1cm4gcnVubmVyLmxvb3Aobykuc2NoZWR1bGUoby5kZWxheSwgby53aGVuKVxyXG4gIH1cclxuXHJcbiAgY2xlYXJUcmFuc2Zvcm0gKCkge1xyXG4gICAgdGhpcy50cmFuc2Zvcm1zID0gbmV3IE1hdHJpeCgpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogS2VlcCB0cmFjayBvZiBhbGwgdHJhbnNmb3JtYXRpb25zIHNvIHRoYXQgZGVsZXRpb24gaXMgZmFzdGVyXHJcbiAgY2xlYXJUcmFuc2Zvcm1zRnJvbVF1ZXVlICgpIHtcclxuICAgIGlmICghdGhpcy5kb25lIHx8ICF0aGlzLl90aW1lbGluZSB8fCAhdGhpcy5fdGltZWxpbmUuX3J1bm5lcklkcy5pbmNsdWRlcyh0aGlzLmlkKSkge1xyXG4gICAgICB0aGlzLl9xdWV1ZSA9IHRoaXMuX3F1ZXVlLmZpbHRlcigoaXRlbSkgPT4ge1xyXG4gICAgICAgIHJldHVybiAhaXRlbS5pc1RyYW5zZm9ybVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZGVsYXkgKGRlbGF5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hbmltYXRlKDAsIGRlbGF5KVxyXG4gIH1cclxuXHJcbiAgZHVyYXRpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3RpbWVzICogKHRoaXMuX3dhaXQgKyB0aGlzLl9kdXJhdGlvbikgLSB0aGlzLl93YWl0XHJcbiAgfVxyXG5cclxuICBkdXJpbmcgKGZuKSB7XHJcbiAgICByZXR1cm4gdGhpcy5xdWV1ZShudWxsLCBmbilcclxuICB9XHJcblxyXG4gIGVhc2UgKGZuKSB7XHJcbiAgICB0aGlzLl9zdGVwcGVyID0gbmV3IEVhc2UoZm4pXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuICAvKlxyXG4gIFJ1bm5lciBEZWZpbml0aW9uc1xyXG4gID09PT09PT09PT09PT09PT09PVxyXG4gIFRoZXNlIG1ldGhvZHMgaGVscCB1cyBkZWZpbmUgdGhlIHJ1bnRpbWUgYmVoYXZpb3VyIG9mIHRoZSBSdW5uZXIgb3IgdGhleVxyXG4gIGhlbHAgdXMgbWFrZSBuZXcgcnVubmVycyBmcm9tIHRoZSBjdXJyZW50IHJ1bm5lclxyXG4gICovXHJcblxyXG4gIGVsZW1lbnQgKGVsZW1lbnQpIHtcclxuICAgIGlmIChlbGVtZW50ID09IG51bGwpIHJldHVybiB0aGlzLl9lbGVtZW50XHJcbiAgICB0aGlzLl9lbGVtZW50ID0gZWxlbWVudFxyXG4gICAgZWxlbWVudC5fcHJlcGFyZVJ1bm5lcigpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgZmluaXNoICgpIHtcclxuICAgIHJldHVybiB0aGlzLnN0ZXAoSW5maW5pdHkpXHJcbiAgfVxyXG5cclxuICBsb29wICh0aW1lcywgc3dpbmcsIHdhaXQpIHtcclxuICAgIC8vIERlYWwgd2l0aCB0aGUgdXNlciBwYXNzaW5nIGluIGFuIG9iamVjdFxyXG4gICAgaWYgKHR5cGVvZiB0aW1lcyA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgc3dpbmcgPSB0aW1lcy5zd2luZ1xyXG4gICAgICB3YWl0ID0gdGltZXMud2FpdFxyXG4gICAgICB0aW1lcyA9IHRpbWVzLnRpbWVzXHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2FuaXRpc2UgdGhlIHZhbHVlcyBhbmQgc3RvcmUgdGhlbVxyXG4gICAgdGhpcy5fdGltZXMgPSB0aW1lcyB8fCBJbmZpbml0eVxyXG4gICAgdGhpcy5fc3dpbmcgPSBzd2luZyB8fCBmYWxzZVxyXG4gICAgdGhpcy5fd2FpdCA9IHdhaXQgfHwgMFxyXG5cclxuICAgIC8vIEFsbG93IHRydWUgdG8gYmUgcGFzc2VkXHJcbiAgICBpZiAodGhpcy5fdGltZXMgPT09IHRydWUpIHsgdGhpcy5fdGltZXMgPSBJbmZpbml0eSB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGxvb3BzIChwKSB7XHJcbiAgICBjb25zdCBsb29wRHVyYXRpb24gPSB0aGlzLl9kdXJhdGlvbiArIHRoaXMuX3dhaXRcclxuICAgIGlmIChwID09IG51bGwpIHtcclxuICAgICAgY29uc3QgbG9vcHNEb25lID0gTWF0aC5mbG9vcih0aGlzLl90aW1lIC8gbG9vcER1cmF0aW9uKVxyXG4gICAgICBjb25zdCByZWxhdGl2ZVRpbWUgPSAodGhpcy5fdGltZSAtIGxvb3BzRG9uZSAqIGxvb3BEdXJhdGlvbilcclxuICAgICAgY29uc3QgcG9zaXRpb24gPSByZWxhdGl2ZVRpbWUgLyB0aGlzLl9kdXJhdGlvblxyXG4gICAgICByZXR1cm4gTWF0aC5taW4obG9vcHNEb25lICsgcG9zaXRpb24sIHRoaXMuX3RpbWVzKVxyXG4gICAgfVxyXG4gICAgY29uc3Qgd2hvbGUgPSBNYXRoLmZsb29yKHApXHJcbiAgICBjb25zdCBwYXJ0aWFsID0gcCAlIDFcclxuICAgIGNvbnN0IHRpbWUgPSBsb29wRHVyYXRpb24gKiB3aG9sZSArIHRoaXMuX2R1cmF0aW9uICogcGFydGlhbFxyXG4gICAgcmV0dXJuIHRoaXMudGltZSh0aW1lKVxyXG4gIH1cclxuXHJcbiAgcGVyc2lzdCAoZHRPckZvcmV2ZXIpIHtcclxuICAgIGlmIChkdE9yRm9yZXZlciA9PSBudWxsKSByZXR1cm4gdGhpcy5fcGVyc2lzdFxyXG4gICAgdGhpcy5fcGVyc2lzdCA9IGR0T3JGb3JldmVyXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgcG9zaXRpb24gKHApIHtcclxuICAgIC8vIEdldCBhbGwgb2YgdGhlIHZhcmlhYmxlcyB3ZSBuZWVkXHJcbiAgICBjb25zdCB4ID0gdGhpcy5fdGltZVxyXG4gICAgY29uc3QgZCA9IHRoaXMuX2R1cmF0aW9uXHJcbiAgICBjb25zdCB3ID0gdGhpcy5fd2FpdFxyXG4gICAgY29uc3QgdCA9IHRoaXMuX3RpbWVzXHJcbiAgICBjb25zdCBzID0gdGhpcy5fc3dpbmdcclxuICAgIGNvbnN0IHIgPSB0aGlzLl9yZXZlcnNlXHJcbiAgICBsZXQgcG9zaXRpb25cclxuXHJcbiAgICBpZiAocCA9PSBudWxsKSB7XHJcbiAgICAgIC8qXHJcbiAgICAgIFRoaXMgZnVuY3Rpb24gY29udmVydHMgYSB0aW1lIHRvIGEgcG9zaXRpb24gaW4gdGhlIHJhbmdlIFswLCAxXVxyXG4gICAgICBUaGUgZnVsbCBleHBsYW5hdGlvbiBjYW4gYmUgZm91bmQgaW4gdGhpcyBkZXNtb3MgZGVtb25zdHJhdGlvblxyXG4gICAgICAgIGh0dHBzOi8vd3d3LmRlc21vcy5jb20vY2FsY3VsYXRvci91NGZiYXZnY2hlXHJcbiAgICAgIFRoZSBsb2dpYyBpcyBzbGlnaHRseSBzaW1wbGlmaWVkIGhlcmUgYmVjYXVzZSB3ZSBjYW4gdXNlIGJvb2xlYW5zXHJcbiAgICAgICovXHJcblxyXG4gICAgICAvLyBGaWd1cmUgb3V0IHRoZSB2YWx1ZSB3aXRob3V0IHRoaW5raW5nIGFib3V0IHRoZSBzdGFydCBvciBlbmQgdGltZVxyXG4gICAgICBjb25zdCBmID0gZnVuY3Rpb24gKHgpIHtcclxuICAgICAgICBjb25zdCBzd2luZ2luZyA9IHMgKiBNYXRoLmZsb29yKHggJSAoMiAqICh3ICsgZCkpIC8gKHcgKyBkKSlcclxuICAgICAgICBjb25zdCBiYWNrd2FyZHMgPSAoc3dpbmdpbmcgJiYgIXIpIHx8ICghc3dpbmdpbmcgJiYgcilcclxuICAgICAgICBjb25zdCB1bmNsaXBlZCA9IE1hdGgucG93KC0xLCBiYWNrd2FyZHMpICogKHggJSAodyArIGQpKSAvIGQgKyBiYWNrd2FyZHNcclxuICAgICAgICBjb25zdCBjbGlwcGVkID0gTWF0aC5tYXgoTWF0aC5taW4odW5jbGlwZWQsIDEpLCAwKVxyXG4gICAgICAgIHJldHVybiBjbGlwcGVkXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZpZ3VyZSBvdXQgdGhlIHZhbHVlIGJ5IGluY29ycG9yYXRpbmcgdGhlIHN0YXJ0IHRpbWVcclxuICAgICAgY29uc3QgZW5kVGltZSA9IHQgKiAodyArIGQpIC0gd1xyXG4gICAgICBwb3NpdGlvbiA9IHggPD0gMFxyXG4gICAgICAgID8gTWF0aC5yb3VuZChmKDFlLTUpKVxyXG4gICAgICAgIDogeCA8IGVuZFRpbWVcclxuICAgICAgICAgID8gZih4KVxyXG4gICAgICAgICAgOiBNYXRoLnJvdW5kKGYoZW5kVGltZSAtIDFlLTUpKVxyXG4gICAgICByZXR1cm4gcG9zaXRpb25cclxuICAgIH1cclxuXHJcbiAgICAvLyBXb3JrIG91dCB0aGUgbG9vcHMgZG9uZSBhbmQgYWRkIHRoZSBwb3NpdGlvbiB0byB0aGUgbG9vcHMgZG9uZVxyXG4gICAgY29uc3QgbG9vcHNEb25lID0gTWF0aC5mbG9vcih0aGlzLmxvb3BzKCkpXHJcbiAgICBjb25zdCBzd2luZ0ZvcndhcmQgPSBzICYmIChsb29wc0RvbmUgJSAyID09PSAwKVxyXG4gICAgY29uc3QgZm9yd2FyZHMgPSAoc3dpbmdGb3J3YXJkICYmICFyKSB8fCAociAmJiBzd2luZ0ZvcndhcmQpXHJcbiAgICBwb3NpdGlvbiA9IGxvb3BzRG9uZSArIChmb3J3YXJkcyA/IHAgOiAxIC0gcClcclxuICAgIHJldHVybiB0aGlzLmxvb3BzKHBvc2l0aW9uKVxyXG4gIH1cclxuXHJcbiAgcHJvZ3Jlc3MgKHApIHtcclxuICAgIGlmIChwID09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIE1hdGgubWluKDEsIHRoaXMuX3RpbWUgLyB0aGlzLmR1cmF0aW9uKCkpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy50aW1lKHAgKiB0aGlzLmR1cmF0aW9uKCkpXHJcbiAgfVxyXG5cclxuICAvKlxyXG4gIEJhc2ljIEZ1bmN0aW9uYWxpdHlcclxuICA9PT09PT09PT09PT09PT09PT09XHJcbiAgVGhlc2UgbWV0aG9kcyBhbGxvdyB1cyB0byBhdHRhY2ggYmFzaWMgZnVuY3Rpb25zIHRvIHRoZSBydW5uZXIgZGlyZWN0bHlcclxuICAqL1xyXG4gIHF1ZXVlIChpbml0Rm4sIHJ1bkZuLCByZXRhcmdldEZuLCBpc1RyYW5zZm9ybSkge1xyXG4gICAgdGhpcy5fcXVldWUucHVzaCh7XHJcbiAgICAgIGluaXRpYWxpc2VyOiBpbml0Rm4gfHwgbm9vcCxcclxuICAgICAgcnVubmVyOiBydW5GbiB8fCBub29wLFxyXG4gICAgICByZXRhcmdldDogcmV0YXJnZXRGbixcclxuICAgICAgaXNUcmFuc2Zvcm06IGlzVHJhbnNmb3JtLFxyXG4gICAgICBpbml0aWFsaXNlZDogZmFsc2UsXHJcbiAgICAgIGZpbmlzaGVkOiBmYWxzZVxyXG4gICAgfSlcclxuICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy50aW1lbGluZSgpXHJcbiAgICB0aW1lbGluZSAmJiB0aGlzLnRpbWVsaW5lKCkuX2NvbnRpbnVlKClcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICByZXNldCAoKSB7XHJcbiAgICBpZiAodGhpcy5fcmVzZXRlZCkgcmV0dXJuIHRoaXNcclxuICAgIHRoaXMudGltZSgwKVxyXG4gICAgdGhpcy5fcmVzZXRlZCA9IHRydWVcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICByZXZlcnNlIChyZXZlcnNlKSB7XHJcbiAgICB0aGlzLl9yZXZlcnNlID0gcmV2ZXJzZSA9PSBudWxsID8gIXRoaXMuX3JldmVyc2UgOiByZXZlcnNlXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgc2NoZWR1bGUgKHRpbWVsaW5lLCBkZWxheSwgd2hlbikge1xyXG4gICAgLy8gVGhlIHVzZXIgZG9lc24ndCBuZWVkIHRvIHBhc3MgYSB0aW1lbGluZSBpZiB3ZSBhbHJlYWR5IGhhdmUgb25lXHJcbiAgICBpZiAoISh0aW1lbGluZSBpbnN0YW5jZW9mIFRpbWVsaW5lKSkge1xyXG4gICAgICB3aGVuID0gZGVsYXlcclxuICAgICAgZGVsYXkgPSB0aW1lbGluZVxyXG4gICAgICB0aW1lbGluZSA9IHRoaXMudGltZWxpbmUoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRoZXJlIGlzIG5vIHRpbWVsaW5lLCB5ZWxsIGF0IHRoZSB1c2VyLi4uXHJcbiAgICBpZiAoIXRpbWVsaW5lKSB7XHJcbiAgICAgIHRocm93IEVycm9yKCdSdW5uZXIgY2Fubm90IGJlIHNjaGVkdWxlZCB3aXRob3V0IHRpbWVsaW5lJylcclxuICAgIH1cclxuXHJcbiAgICAvLyBTY2hlZHVsZSB0aGUgcnVubmVyIG9uIHRoZSB0aW1lbGluZSBwcm92aWRlZFxyXG4gICAgdGltZWxpbmUuc2NoZWR1bGUodGhpcywgZGVsYXksIHdoZW4pXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgc3RlcCAoZHQpIHtcclxuICAgIC8vIElmIHdlIGFyZSBpbmFjdGl2ZSwgdGhpcyBzdGVwcGVyIGp1c3QgZ2V0cyBza2lwcGVkXHJcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuIHRoaXNcclxuXHJcbiAgICAvLyBVcGRhdGUgdGhlIHRpbWUgYW5kIGdldCB0aGUgbmV3IHBvc2l0aW9uXHJcbiAgICBkdCA9IGR0ID09IG51bGwgPyAxNiA6IGR0XHJcbiAgICB0aGlzLl90aW1lICs9IGR0XHJcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucG9zaXRpb24oKVxyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgaWYgd2UgbmVlZCB0byBydW4gdGhlIHN0ZXBwZXIgaW4gdGhpcyBmcmFtZVxyXG4gICAgY29uc3QgcnVubmluZyA9IHRoaXMuX2xhc3RQb3NpdGlvbiAhPT0gcG9zaXRpb24gJiYgdGhpcy5fdGltZSA+PSAwXHJcbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBwb3NpdGlvblxyXG5cclxuICAgIC8vIEZpZ3VyZSBvdXQgaWYgd2UganVzdCBzdGFydGVkXHJcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMuZHVyYXRpb24oKVxyXG4gICAgY29uc3QganVzdFN0YXJ0ZWQgPSB0aGlzLl9sYXN0VGltZSA8PSAwICYmIHRoaXMuX3RpbWUgPiAwXHJcbiAgICBjb25zdCBqdXN0RmluaXNoZWQgPSB0aGlzLl9sYXN0VGltZSA8IGR1cmF0aW9uICYmIHRoaXMuX3RpbWUgPj0gZHVyYXRpb25cclxuXHJcbiAgICB0aGlzLl9sYXN0VGltZSA9IHRoaXMuX3RpbWVcclxuICAgIGlmIChqdXN0U3RhcnRlZCkge1xyXG4gICAgICB0aGlzLmZpcmUoJ3N0YXJ0JywgdGhpcylcclxuICAgIH1cclxuXHJcbiAgICAvLyBXb3JrIG91dCBpZiB0aGUgcnVubmVyIGlzIGZpbmlzaGVkIHNldCB0aGUgZG9uZSBmbGFnIGhlcmUgc28gYW5pbWF0aW9uc1xyXG4gICAgLy8ga25vdywgdGhhdCB0aGV5IGFyZSBydW5uaW5nIGluIHRoZSBsYXN0IHN0ZXAgKHRoaXMgaXMgZ29vZCBmb3JcclxuICAgIC8vIHRyYW5zZm9ybWF0aW9ucyB3aGljaCBjYW4gYmUgbWVyZ2VkKVxyXG4gICAgY29uc3QgZGVjbGFyYXRpdmUgPSB0aGlzLl9pc0RlY2xhcmF0aXZlXHJcbiAgICB0aGlzLmRvbmUgPSAhZGVjbGFyYXRpdmUgJiYgIWp1c3RGaW5pc2hlZCAmJiB0aGlzLl90aW1lID49IGR1cmF0aW9uXHJcblxyXG4gICAgLy8gUnVubmVyIGlzIHJ1bm5pbmcuIFNvIGl0cyBub3QgaW4gcmVzZXRlZCBzdGF0ZSBhbnltb3JlXHJcbiAgICB0aGlzLl9yZXNldGVkID0gZmFsc2VcclxuXHJcbiAgICBsZXQgY29udmVyZ2VkID0gZmFsc2VcclxuICAgIC8vIENhbGwgaW5pdGlhbGlzZSBhbmQgdGhlIHJ1biBmdW5jdGlvblxyXG4gICAgaWYgKHJ1bm5pbmcgfHwgZGVjbGFyYXRpdmUpIHtcclxuICAgICAgdGhpcy5faW5pdGlhbGlzZShydW5uaW5nKVxyXG5cclxuICAgICAgLy8gY2xlYXIgdGhlIHRyYW5zZm9ybXMgb24gdGhpcyBydW5uZXIgc28gdGhleSBkb250IGdldCBhZGRlZCBhZ2FpbiBhbmQgYWdhaW5cclxuICAgICAgdGhpcy50cmFuc2Zvcm1zID0gbmV3IE1hdHJpeCgpXHJcbiAgICAgIGNvbnZlcmdlZCA9IHRoaXMuX3J1bihkZWNsYXJhdGl2ZSA/IGR0IDogcG9zaXRpb24pXHJcblxyXG4gICAgICB0aGlzLmZpcmUoJ3N0ZXAnLCB0aGlzKVxyXG4gICAgfVxyXG4gICAgLy8gY29ycmVjdCB0aGUgZG9uZSBmbGFnIGhlcmVcclxuICAgIC8vIGRlY2xhcml0aXZlIGFuaW1hdGlvbnMgaXRzZWxmIGtub3cgd2hlbiB0aGV5IGNvbnZlcmdlZFxyXG4gICAgdGhpcy5kb25lID0gdGhpcy5kb25lIHx8IChjb252ZXJnZWQgJiYgZGVjbGFyYXRpdmUpXHJcbiAgICBpZiAoanVzdEZpbmlzaGVkKSB7XHJcbiAgICAgIHRoaXMuZmlyZSgnZmluaXNoZWQnLCB0aGlzKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIC8qXHJcbiAgUnVubmVyIGFuaW1hdGlvbiBtZXRob2RzXHJcbiAgPT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAgQ29udHJvbCBob3cgdGhlIGFuaW1hdGlvbiBwbGF5c1xyXG4gICovXHJcbiAgdGltZSAodGltZSkge1xyXG4gICAgaWYgKHRpbWUgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5fdGltZVxyXG4gICAgfVxyXG4gICAgY29uc3QgZHQgPSB0aW1lIC0gdGhpcy5fdGltZVxyXG4gICAgdGhpcy5zdGVwKGR0KVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIHRpbWVsaW5lICh0aW1lbGluZSkge1xyXG4gICAgLy8gY2hlY2sgZXhwbGljaXRseSBmb3IgdW5kZWZpbmVkIHNvIHdlIGNhbiBzZXQgdGhlIHRpbWVsaW5lIHRvIG51bGxcclxuICAgIGlmICh0eXBlb2YgdGltZWxpbmUgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gdGhpcy5fdGltZWxpbmVcclxuICAgIHRoaXMuX3RpbWVsaW5lID0gdGltZWxpbmVcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICB1bnNjaGVkdWxlICgpIHtcclxuICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy50aW1lbGluZSgpXHJcbiAgICB0aW1lbGluZSAmJiB0aW1lbGluZS51bnNjaGVkdWxlKHRoaXMpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gUnVuIGVhY2ggaW5pdGlhbGlzZSBmdW5jdGlvbiBpbiB0aGUgcnVubmVyIGlmIHJlcXVpcmVkXHJcbiAgX2luaXRpYWxpc2UgKHJ1bm5pbmcpIHtcclxuICAgIC8vIElmIHdlIGFyZW4ndCBydW5uaW5nLCB3ZSBzaG91bGRuJ3QgaW5pdGlhbGlzZSB3aGVuIG5vdCBkZWNsYXJhdGl2ZVxyXG4gICAgaWYgKCFydW5uaW5nICYmICF0aGlzLl9pc0RlY2xhcmF0aXZlKSByZXR1cm5cclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIG9mIHRoZSBpbml0aWFsaXNlcnNcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLl9xdWV1ZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgaW5pdGlhbGlzZXJcclxuICAgICAgY29uc3QgY3VycmVudCA9IHRoaXMuX3F1ZXVlW2ldXHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB3ZSBuZWVkIHRvIGluaXRpYWxpc2VcclxuICAgICAgY29uc3QgbmVlZHNJdCA9IHRoaXMuX2lzRGVjbGFyYXRpdmUgfHwgKCFjdXJyZW50LmluaXRpYWxpc2VkICYmIHJ1bm5pbmcpXHJcbiAgICAgIHJ1bm5pbmcgPSAhY3VycmVudC5maW5pc2hlZFxyXG5cclxuICAgICAgLy8gQ2FsbCB0aGUgaW5pdGlhbGlzZXIgaWYgd2UgbmVlZCB0b1xyXG4gICAgICBpZiAobmVlZHNJdCAmJiBydW5uaW5nKSB7XHJcbiAgICAgICAgY3VycmVudC5pbml0aWFsaXNlci5jYWxsKHRoaXMpXHJcbiAgICAgICAgY3VycmVudC5pbml0aWFsaXNlZCA9IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gU2F2ZSBhIG1vcnBoZXIgdG8gdGhlIG1vcnBoZXIgbGlzdCBzbyB0aGF0IHdlIGNhbiByZXRhcmdldCBpdCBsYXRlclxyXG4gIF9yZW1lbWJlck1vcnBoZXIgKG1ldGhvZCwgbW9ycGhlcikge1xyXG4gICAgdGhpcy5faGlzdG9yeVttZXRob2RdID0ge1xyXG4gICAgICBtb3JwaGVyOiBtb3JwaGVyLFxyXG4gICAgICBjYWxsZXI6IHRoaXMuX3F1ZXVlW3RoaXMuX3F1ZXVlLmxlbmd0aCAtIDFdXHJcbiAgICB9XHJcblxyXG4gICAgLy8gV2UgaGF2ZSB0byByZXN1bWUgdGhlIHRpbWVsaW5lIGluIGNhc2UgYSBjb250cm9sbGVyXHJcbiAgICAvLyBpcyBhbHJlYWR5IGRvbmUgd2l0aG91dCBiZWluZyBldmVyIHJ1blxyXG4gICAgLy8gVGhpcyBjYW4gaGFwcGVuIHdoZW4gZS5nLiB0aGlzIGlzIGRvbmU6XHJcbiAgICAvLyAgICBhbmltID0gZWwuYW5pbWF0ZShuZXcgU1ZHLlNwcmluZylcclxuICAgIC8vIGFuZCBsYXRlclxyXG4gICAgLy8gICAgYW5pbS5tb3ZlKC4uLilcclxuICAgIGlmICh0aGlzLl9pc0RlY2xhcmF0aXZlKSB7XHJcbiAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy50aW1lbGluZSgpXHJcbiAgICAgIHRpbWVsaW5lICYmIHRpbWVsaW5lLnBsYXkoKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVHJ5IHRvIHNldCB0aGUgdGFyZ2V0IGZvciBhIG1vcnBoZXIgaWYgdGhlIG1vcnBoZXIgZXhpc3RzLCBvdGhlcndpc2VcclxuICAvLyBSdW4gZWFjaCBydW4gZnVuY3Rpb24gZm9yIHRoZSBwb3NpdGlvbiBvciBkdCBnaXZlblxyXG4gIF9ydW4gKHBvc2l0aW9uT3JEdCkge1xyXG4gICAgLy8gUnVuIGFsbCBvZiB0aGUgX3F1ZXVlIGRpcmVjdGx5XHJcbiAgICBsZXQgYWxsZmluaXNoZWQgPSB0cnVlXHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gdGhpcy5fcXVldWUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IGZ1bmN0aW9uIHRvIHJ1blxyXG4gICAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5fcXVldWVbaV1cclxuXHJcbiAgICAgIC8vIFJ1biB0aGUgZnVuY3Rpb24gaWYgaXRzIG5vdCBmaW5pc2hlZCwgd2Uga2VlcCB0cmFjayBvZiB0aGUgZmluaXNoZWRcclxuICAgICAgLy8gZmxhZyBmb3IgdGhlIHNha2Ugb2YgZGVjbGFyYXRpdmUgX3F1ZXVlXHJcbiAgICAgIGNvbnN0IGNvbnZlcmdlZCA9IGN1cnJlbnQucnVubmVyLmNhbGwodGhpcywgcG9zaXRpb25PckR0KVxyXG4gICAgICBjdXJyZW50LmZpbmlzaGVkID0gY3VycmVudC5maW5pc2hlZCB8fCAoY29udmVyZ2VkID09PSB0cnVlKVxyXG4gICAgICBhbGxmaW5pc2hlZCA9IGFsbGZpbmlzaGVkICYmIGN1cnJlbnQuZmluaXNoZWRcclxuICAgIH1cclxuXHJcbiAgICAvLyBXZSByZXBvcnQgd2hlbiBhbGwgb2YgdGhlIGNvbnN0cnVjdG9ycyBhcmUgZmluaXNoZWRcclxuICAgIHJldHVybiBhbGxmaW5pc2hlZFxyXG4gIH1cclxuXHJcbiAgLy8gZG8gbm90aGluZyBhbmQgcmV0dXJuIGZhbHNlXHJcbiAgX3RyeVJldGFyZ2V0IChtZXRob2QsIHRhcmdldCwgZXh0cmEpIHtcclxuICAgIGlmICh0aGlzLl9oaXN0b3J5W21ldGhvZF0pIHtcclxuICAgICAgLy8gaWYgdGhlIGxhc3QgbWV0aG9kIHdhc250IGV2ZW4gaW5pdGlhbGlzZWQsIHRocm93IGl0IGF3YXlcclxuICAgICAgaWYgKCF0aGlzLl9oaXN0b3J5W21ldGhvZF0uY2FsbGVyLmluaXRpYWxpc2VkKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9xdWV1ZS5pbmRleE9mKHRoaXMuX2hpc3RvcnlbbWV0aG9kXS5jYWxsZXIpXHJcbiAgICAgICAgdGhpcy5fcXVldWUuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBmb3IgdGhlIGNhc2Ugb2YgdHJhbnNmb3JtYXRpb25zLCB3ZSB1c2UgdGhlIHNwZWNpYWwgcmV0YXJnZXQgZnVuY3Rpb25cclxuICAgICAgLy8gd2hpY2ggaGFzIGFjY2VzcyB0byB0aGUgb3V0ZXIgc2NvcGVcclxuICAgICAgaWYgKHRoaXMuX2hpc3RvcnlbbWV0aG9kXS5jYWxsZXIucmV0YXJnZXQpIHtcclxuICAgICAgICB0aGlzLl9oaXN0b3J5W21ldGhvZF0uY2FsbGVyLnJldGFyZ2V0LmNhbGwodGhpcywgdGFyZ2V0LCBleHRyYSlcclxuICAgICAgICAvLyBmb3IgZXZlcnl0aGluZyBlbHNlIGEgc2ltcGxlIG1vcnBoZXIgY2hhbmdlIGlzIHN1ZmZpY2llbnRcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9oaXN0b3J5W21ldGhvZF0ubW9ycGhlci50byh0YXJnZXQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuX2hpc3RvcnlbbWV0aG9kXS5jYWxsZXIuZmluaXNoZWQgPSBmYWxzZVxyXG4gICAgICBjb25zdCB0aW1lbGluZSA9IHRoaXMudGltZWxpbmUoKVxyXG4gICAgICB0aW1lbGluZSAmJiB0aW1lbGluZS5wbGF5KClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbn1cclxuXHJcblJ1bm5lci5pZCA9IDBcclxuXHJcbmV4cG9ydCBjbGFzcyBGYWtlUnVubmVyIHtcclxuICBjb25zdHJ1Y3RvciAodHJhbnNmb3JtcyA9IG5ldyBNYXRyaXgoKSwgaWQgPSAtMSwgZG9uZSA9IHRydWUpIHtcclxuICAgIHRoaXMudHJhbnNmb3JtcyA9IHRyYW5zZm9ybXNcclxuICAgIHRoaXMuaWQgPSBpZFxyXG4gICAgdGhpcy5kb25lID0gZG9uZVxyXG4gIH1cclxuXHJcbiAgY2xlYXJUcmFuc2Zvcm1zRnJvbVF1ZXVlICgpIHsgfVxyXG59XHJcblxyXG5leHRlbmQoWyBSdW5uZXIsIEZha2VSdW5uZXIgXSwge1xyXG4gIG1lcmdlV2l0aCAocnVubmVyKSB7XHJcbiAgICByZXR1cm4gbmV3IEZha2VSdW5uZXIoXHJcbiAgICAgIHJ1bm5lci50cmFuc2Zvcm1zLmxtdWx0aXBseSh0aGlzLnRyYW5zZm9ybXMpLFxyXG4gICAgICBydW5uZXIuaWRcclxuICAgIClcclxuICB9XHJcbn0pXHJcblxyXG4vLyBGYWtlUnVubmVyLmVtcHR5UnVubmVyID0gbmV3IEZha2VSdW5uZXIoKVxyXG5cclxuY29uc3QgbG11bHRpcGx5ID0gKGxhc3QsIGN1cnIpID0+IGxhc3QubG11bHRpcGx5TyhjdXJyKVxyXG5jb25zdCBnZXRSdW5uZXJUcmFuc2Zvcm0gPSAocnVubmVyKSA9PiBydW5uZXIudHJhbnNmb3Jtc1xyXG5cclxuZnVuY3Rpb24gbWVyZ2VUcmFuc2Zvcm1zICgpIHtcclxuICAvLyBGaW5kIHRoZSBtYXRyaXggdG8gYXBwbHkgdG8gdGhlIGVsZW1lbnQgYW5kIGFwcGx5IGl0XHJcbiAgY29uc3QgcnVubmVycyA9IHRoaXMuX3RyYW5zZm9ybWF0aW9uUnVubmVycy5ydW5uZXJzXHJcbiAgY29uc3QgbmV0VHJhbnNmb3JtID0gcnVubmVyc1xyXG4gICAgLm1hcChnZXRSdW5uZXJUcmFuc2Zvcm0pXHJcbiAgICAucmVkdWNlKGxtdWx0aXBseSwgbmV3IE1hdHJpeCgpKVxyXG5cclxuICB0aGlzLnRyYW5zZm9ybShuZXRUcmFuc2Zvcm0pXHJcblxyXG4gIHRoaXMuX3RyYW5zZm9ybWF0aW9uUnVubmVycy5tZXJnZSgpXHJcblxyXG4gIGlmICh0aGlzLl90cmFuc2Zvcm1hdGlvblJ1bm5lcnMubGVuZ3RoKCkgPT09IDEpIHtcclxuICAgIHRoaXMuX2ZyYW1lSWQgPSBudWxsXHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgUnVubmVyQXJyYXkge1xyXG4gIGNvbnN0cnVjdG9yICgpIHtcclxuICAgIHRoaXMucnVubmVycyA9IFtdXHJcbiAgICB0aGlzLmlkcyA9IFtdXHJcbiAgfVxyXG5cclxuICBhZGQgKHJ1bm5lcikge1xyXG4gICAgaWYgKHRoaXMucnVubmVycy5pbmNsdWRlcyhydW5uZXIpKSByZXR1cm5cclxuICAgIGNvbnN0IGlkID0gcnVubmVyLmlkICsgMVxyXG5cclxuICAgIHRoaXMucnVubmVycy5wdXNoKHJ1bm5lcilcclxuICAgIHRoaXMuaWRzLnB1c2goaWQpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGNsZWFyQmVmb3JlIChpZCkge1xyXG4gICAgY29uc3QgZGVsZXRlQ250ID0gdGhpcy5pZHMuaW5kZXhPZihpZCArIDEpIHx8IDFcclxuICAgIHRoaXMuaWRzLnNwbGljZSgwLCBkZWxldGVDbnQsIDApXHJcbiAgICB0aGlzLnJ1bm5lcnMuc3BsaWNlKDAsIGRlbGV0ZUNudCwgbmV3IEZha2VSdW5uZXIoKSlcclxuICAgICAgLmZvckVhY2goKHIpID0+IHIuY2xlYXJUcmFuc2Zvcm1zRnJvbVF1ZXVlKCkpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxuXHJcbiAgZWRpdCAoaWQsIG5ld1J1bm5lcikge1xyXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLmlkcy5pbmRleE9mKGlkICsgMSlcclxuICAgIHRoaXMuaWRzLnNwbGljZShpbmRleCwgMSwgaWQgKyAxKVxyXG4gICAgdGhpcy5ydW5uZXJzLnNwbGljZShpbmRleCwgMSwgbmV3UnVubmVyKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGdldEJ5SUQgKGlkKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ydW5uZXJzW3RoaXMuaWRzLmluZGV4T2YoaWQgKyAxKV1cclxuICB9XHJcblxyXG4gIGxlbmd0aCAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5pZHMubGVuZ3RoXHJcbiAgfVxyXG5cclxuICBtZXJnZSAoKSB7XHJcbiAgICBsZXQgbGFzdFJ1bm5lciA9IG51bGxcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ydW5uZXJzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgIGNvbnN0IHJ1bm5lciA9IHRoaXMucnVubmVyc1tpXVxyXG5cclxuICAgICAgY29uc3QgY29uZGl0aW9uID0gbGFzdFJ1bm5lclxyXG4gICAgICAgICYmIHJ1bm5lci5kb25lICYmIGxhc3RSdW5uZXIuZG9uZVxyXG4gICAgICAgIC8vIGRvbid0IG1lcmdlIHJ1bm5lciB3aGVuIHBlcnNpc3RlZCBvbiB0aW1lbGluZVxyXG4gICAgICAgICYmICghcnVubmVyLl90aW1lbGluZSB8fCAhcnVubmVyLl90aW1lbGluZS5fcnVubmVySWRzLmluY2x1ZGVzKHJ1bm5lci5pZCkpXHJcbiAgICAgICAgJiYgKCFsYXN0UnVubmVyLl90aW1lbGluZSB8fCAhbGFzdFJ1bm5lci5fdGltZWxpbmUuX3J1bm5lcklkcy5pbmNsdWRlcyhsYXN0UnVubmVyLmlkKSlcclxuXHJcbiAgICAgIGlmIChjb25kaXRpb24pIHtcclxuICAgICAgICAvLyB0aGUgKzEgaGFwcGVucyBpbiB0aGUgZnVuY3Rpb25cclxuICAgICAgICB0aGlzLnJlbW92ZShydW5uZXIuaWQpXHJcbiAgICAgICAgY29uc3QgbmV3UnVubmVyID0gcnVubmVyLm1lcmdlV2l0aChsYXN0UnVubmVyKVxyXG4gICAgICAgIHRoaXMuZWRpdChsYXN0UnVubmVyLmlkLCBuZXdSdW5uZXIpXHJcbiAgICAgICAgbGFzdFJ1bm5lciA9IG5ld1J1bm5lclxyXG4gICAgICAgIC0taVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxhc3RSdW5uZXIgPSBydW5uZXJcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICByZW1vdmUgKGlkKSB7XHJcbiAgICBjb25zdCBpbmRleCA9IHRoaXMuaWRzLmluZGV4T2YoaWQgKyAxKVxyXG4gICAgdGhpcy5pZHMuc3BsaWNlKGluZGV4LCAxKVxyXG4gICAgdGhpcy5ydW5uZXJzLnNwbGljZShpbmRleCwgMSlcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBFbGVtZW50OiB7XHJcbiAgICBhbmltYXRlIChkdXJhdGlvbiwgZGVsYXksIHdoZW4pIHtcclxuICAgICAgY29uc3QgbyA9IFJ1bm5lci5zYW5pdGlzZShkdXJhdGlvbiwgZGVsYXksIHdoZW4pXHJcbiAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy50aW1lbGluZSgpXHJcbiAgICAgIHJldHVybiBuZXcgUnVubmVyKG8uZHVyYXRpb24pXHJcbiAgICAgICAgLmxvb3AobylcclxuICAgICAgICAuZWxlbWVudCh0aGlzKVxyXG4gICAgICAgIC50aW1lbGluZSh0aW1lbGluZS5wbGF5KCkpXHJcbiAgICAgICAgLnNjaGVkdWxlKG8uZGVsYXksIG8ud2hlbilcclxuICAgIH0sXHJcblxyXG4gICAgZGVsYXkgKGJ5LCB3aGVuKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmFuaW1hdGUoMCwgYnksIHdoZW4pXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHRoaXMgZnVuY3Rpb24gc2VhcmNoZXMgZm9yIGFsbCBydW5uZXJzIG9uIHRoZSBlbGVtZW50IGFuZCBkZWxldGVzIHRoZSBvbmVzXHJcbiAgICAvLyB3aGljaCBydW4gYmVmb3JlIHRoZSBjdXJyZW50IG9uZS4gVGhpcyBpcyBiZWNhdXNlIGFic29sdXRlIHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgLy8gb3Zlcndmcml0ZSBhbnl0aGluZyBhbnl3YXkgc28gdGhlcmUgaXMgbm8gbmVlZCB0byB3YXN0ZSB0aW1lIGNvbXB1dGluZ1xyXG4gICAgLy8gb3RoZXIgcnVubmVyc1xyXG4gICAgX2NsZWFyVHJhbnNmb3JtUnVubmVyc0JlZm9yZSAoY3VycmVudFJ1bm5lcikge1xyXG4gICAgICB0aGlzLl90cmFuc2Zvcm1hdGlvblJ1bm5lcnMuY2xlYXJCZWZvcmUoY3VycmVudFJ1bm5lci5pZClcclxuICAgIH0sXHJcblxyXG4gICAgX2N1cnJlbnRUcmFuc2Zvcm0gKGN1cnJlbnQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuX3RyYW5zZm9ybWF0aW9uUnVubmVycy5ydW5uZXJzXHJcbiAgICAgICAgLy8gd2UgbmVlZCB0aGUgZXF1YWwgc2lnbiBoZXJlIHRvIG1ha2Ugc3VyZSwgdGhhdCBhbHNvIHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgICAgIC8vIG9uIHRoZSBzYW1lIHJ1bm5lciB3aGljaCBleGVjdXRlIGJlZm9yZSB0aGUgY3VycmVudCB0cmFuc2Zvcm1hdGlvbiBhcmVcclxuICAgICAgICAvLyB0YWtlbiBpbnRvIGFjY291bnRcclxuICAgICAgICAuZmlsdGVyKChydW5uZXIpID0+IHJ1bm5lci5pZCA8PSBjdXJyZW50LmlkKVxyXG4gICAgICAgIC5tYXAoZ2V0UnVubmVyVHJhbnNmb3JtKVxyXG4gICAgICAgIC5yZWR1Y2UobG11bHRpcGx5LCBuZXcgTWF0cml4KCkpXHJcbiAgICB9LFxyXG5cclxuICAgIF9hZGRSdW5uZXIgKHJ1bm5lcikge1xyXG4gICAgICB0aGlzLl90cmFuc2Zvcm1hdGlvblJ1bm5lcnMuYWRkKHJ1bm5lcilcclxuXHJcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBydW5uZXIgbWVyZ2UgaXMgZXhlY3V0ZWQgYXQgdGhlIHZlcnkgZW5kIG9mXHJcbiAgICAgIC8vIGFsbCBBbmltYXRvciBmdW5jdGlvbnMuIFRoYXRzIHdoeSB3ZSB1c2UgaW1tZWRpYXRlIGhlcmUgdG8gZXhlY3V0ZVxyXG4gICAgICAvLyB0aGUgbWVyZ2UgcmlnaHQgYWZ0ZXIgYWxsIGZyYW1lcyBhcmUgcnVuXHJcbiAgICAgIEFuaW1hdG9yLmNhbmNlbEltbWVkaWF0ZSh0aGlzLl9mcmFtZUlkKVxyXG4gICAgICB0aGlzLl9mcmFtZUlkID0gQW5pbWF0b3IuaW1tZWRpYXRlKG1lcmdlVHJhbnNmb3Jtcy5iaW5kKHRoaXMpKVxyXG4gICAgfSxcclxuXHJcbiAgICBfcHJlcGFyZVJ1bm5lciAoKSB7XHJcbiAgICAgIGlmICh0aGlzLl9mcmFtZUlkID09IG51bGwpIHtcclxuICAgICAgICB0aGlzLl90cmFuc2Zvcm1hdGlvblJ1bm5lcnMgPSBuZXcgUnVubmVyQXJyYXkoKVxyXG4gICAgICAgICAgLmFkZChuZXcgRmFrZVJ1bm5lcihuZXcgTWF0cml4KHRoaXMpKSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuXHJcbi8vIFdpbGwgb3V0cHV0IHRoZSBlbGVtZW50cyBmcm9tIGFycmF5IEEgdGhhdCBhcmUgbm90IGluIHRoZSBhcnJheSBCXHJcbmNvbnN0IGRpZmZlcmVuY2UgPSAoYSwgYikgPT4gYS5maWx0ZXIoeCA9PiAhYi5pbmNsdWRlcyh4KSlcclxuXHJcbmV4dGVuZChSdW5uZXIsIHtcclxuICBhdHRyIChhLCB2KSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdHlsZUF0dHIoJ2F0dHInLCBhLCB2KVxyXG4gIH0sXHJcblxyXG4gIC8vIEFkZCBhbmltYXRhYmxlIHN0eWxlc1xyXG4gIGNzcyAocywgdikge1xyXG4gICAgcmV0dXJuIHRoaXMuc3R5bGVBdHRyKCdjc3MnLCBzLCB2KVxyXG4gIH0sXHJcblxyXG4gIHN0eWxlQXR0ciAodHlwZSwgbmFtZU9yQXR0cnMsIHZhbCkge1xyXG4gICAgaWYgKHR5cGVvZiBuYW1lT3JBdHRycyA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3R5bGVBdHRyKHR5cGUsIHsgW25hbWVPckF0dHJzXTogdmFsIH0pXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGF0dHJzID0gbmFtZU9yQXR0cnNcclxuICAgIGlmICh0aGlzLl90cnlSZXRhcmdldCh0eXBlLCBhdHRycykpIHJldHVybiB0aGlzXHJcblxyXG4gICAgbGV0IG1vcnBoZXIgPSBuZXcgTW9ycGhhYmxlKHRoaXMuX3N0ZXBwZXIpLnRvKGF0dHJzKVxyXG4gICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhhdHRycylcclxuXHJcbiAgICB0aGlzLnF1ZXVlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgbW9ycGhlciA9IG1vcnBoZXIuZnJvbSh0aGlzLmVsZW1lbnQoKVt0eXBlXShrZXlzKSlcclxuICAgIH0sIGZ1bmN0aW9uIChwb3MpIHtcclxuICAgICAgdGhpcy5lbGVtZW50KClbdHlwZV0obW9ycGhlci5hdChwb3MpLnZhbHVlT2YoKSlcclxuICAgICAgcmV0dXJuIG1vcnBoZXIuZG9uZSgpXHJcbiAgICB9LCBmdW5jdGlvbiAobmV3VG9BdHRycykge1xyXG5cclxuICAgICAgLy8gQ2hlY2sgaWYgYW55IG5ldyBrZXlzIHdlcmUgYWRkZWRcclxuICAgICAgY29uc3QgbmV3S2V5cyA9IE9iamVjdC5rZXlzKG5ld1RvQXR0cnMpXHJcbiAgICAgIGNvbnN0IGRpZmZlcmVuY2VzID0gZGlmZmVyZW5jZShuZXdLZXlzLCBrZXlzKVxyXG5cclxuICAgICAgLy8gSWYgdGhlaXIgYXJlIG5ldyBrZXlzLCBpbml0aWFsaXplIHRoZW0gYW5kIGFkZCB0aGVtIHRvIG1vcnBoZXJcclxuICAgICAgaWYgKGRpZmZlcmVuY2VzLmxlbmd0aCkge1xyXG4gICAgICAgIC8vIEdldCB0aGUgdmFsdWVzXHJcbiAgICAgICAgY29uc3QgYWRkZWRGcm9tQXR0cnMgPSB0aGlzLmVsZW1lbnQoKVt0eXBlXShkaWZmZXJlbmNlcylcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBhbHJlYWR5IGluaXRpYWxpemVkIHZhbHVlc1xyXG4gICAgICAgIGNvbnN0IG9sZEZyb21BdHRycyA9IG5ldyBPYmplY3RCYWcobW9ycGhlci5mcm9tKCkpLnZhbHVlT2YoKVxyXG5cclxuICAgICAgICAvLyBNZXJnZSBvbGQgYW5kIG5ld1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24ob2xkRnJvbUF0dHJzLCBhZGRlZEZyb21BdHRycylcclxuICAgICAgICBtb3JwaGVyLmZyb20ob2xkRnJvbUF0dHJzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBHZXQgdGhlIG9iamVjdCBmcm9tIHRoZSBtb3JwaGVyXHJcbiAgICAgIGNvbnN0IG9sZFRvQXR0cnMgPSBuZXcgT2JqZWN0QmFnKG1vcnBoZXIudG8oKSkudmFsdWVPZigpXHJcblxyXG4gICAgICAvLyBNZXJnZSBpbiBuZXcgYXR0cmlidXRlc1xyXG4gICAgICBPYmplY3QuYXNzaWduKG9sZFRvQXR0cnMsIG5ld1RvQXR0cnMpXHJcblxyXG4gICAgICAvLyBDaGFuZ2UgbW9ycGhlciB0YXJnZXRcclxuICAgICAgbW9ycGhlci50byhvbGRUb0F0dHJzKVxyXG5cclxuICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgd2Ugc2F2ZSB0aGUgd29yayB3ZSBkaWQgc28gd2UgZG9uJ3QgbmVlZCBpdCB0byBkbyBhZ2FpblxyXG4gICAgICBrZXlzID0gbmV3S2V5c1xyXG4gICAgICBhdHRycyA9IG5ld1RvQXR0cnNcclxuICAgIH0pXHJcblxyXG4gICAgdGhpcy5fcmVtZW1iZXJNb3JwaGVyKHR5cGUsIG1vcnBoZXIpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH0sXHJcblxyXG4gIHpvb20gKGxldmVsLCBwb2ludCkge1xyXG4gICAgaWYgKHRoaXMuX3RyeVJldGFyZ2V0KCd6b29tJywgbGV2ZWwsIHBvaW50KSkgcmV0dXJuIHRoaXNcclxuXHJcbiAgICBsZXQgbW9ycGhlciA9IG5ldyBNb3JwaGFibGUodGhpcy5fc3RlcHBlcikudG8obmV3IFNWR051bWJlcihsZXZlbCkpXHJcblxyXG4gICAgdGhpcy5xdWV1ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIG1vcnBoZXIgPSBtb3JwaGVyLmZyb20odGhpcy5lbGVtZW50KCkuem9vbSgpKVxyXG4gICAgfSwgZnVuY3Rpb24gKHBvcykge1xyXG4gICAgICB0aGlzLmVsZW1lbnQoKS56b29tKG1vcnBoZXIuYXQocG9zKSwgcG9pbnQpXHJcbiAgICAgIHJldHVybiBtb3JwaGVyLmRvbmUoKVxyXG4gICAgfSwgZnVuY3Rpb24gKG5ld0xldmVsLCBuZXdQb2ludCkge1xyXG4gICAgICBwb2ludCA9IG5ld1BvaW50XHJcbiAgICAgIG1vcnBoZXIudG8obmV3TGV2ZWwpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuX3JlbWVtYmVyTW9ycGhlcignem9vbScsIG1vcnBoZXIpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqKiBhYnNvbHV0ZSB0cmFuc2Zvcm1hdGlvbnNcclxuICAgKiovXHJcblxyXG4gIC8vXHJcbiAgLy8gTSB2IC0tLS0tfC0tLS0tKEQgTSB2ID0gRiB2KS0tLS0tLXwtLS0tLT4gIFQgdlxyXG4gIC8vXHJcbiAgLy8gMS4gZGVmaW5lIHRoZSBmaW5hbCBzdGF0ZSAoVCkgYW5kIGRlY29tcG9zZSBpdCAob25jZSlcclxuICAvLyAgICB0ID0gW3R4LCB0eSwgdGhlLCBsYW0sIHN5LCBzeF1cclxuICAvLyAyLiBvbiBldmVyeSBmcmFtZTogcHVsbCB0aGUgY3VycmVudCBzdGF0ZSBvZiBhbGwgcHJldmlvdXMgdHJhbnNmb3Jtc1xyXG4gIC8vICAgIChNIC0gbSBjYW4gY2hhbmdlKVxyXG4gIC8vICAgYW5kIHRoZW4gd3JpdGUgdGhpcyBhcyBtID0gW3R4MCwgdHkwLCB0aGUwLCBsYW0wLCBzeTAsIHN4MF1cclxuICAvLyAzLiBGaW5kIHRoZSBpbnRlcnBvbGF0ZWQgbWF0cml4IEYocG9zKSA9IG0gKyBwb3MgKiAodCAtIG0pXHJcbiAgLy8gICAtIE5vdGUgRigwKSA9IE1cclxuICAvLyAgIC0gTm90ZSBGKDEpID0gVFxyXG4gIC8vIDQuIE5vdyB5b3UgZ2V0IHRoZSBkZWx0YSBtYXRyaXggYXMgYSByZXN1bHQ6IEQgPSBGICogaW52KE0pXHJcblxyXG4gIHRyYW5zZm9ybSAodHJhbnNmb3JtcywgcmVsYXRpdmUsIGFmZmluZSkge1xyXG4gICAgLy8gSWYgd2UgaGF2ZSBhIGRlY2xhcmF0aXZlIGZ1bmN0aW9uLCB3ZSBzaG91bGQgcmV0YXJnZXQgaXQgaWYgcG9zc2libGVcclxuICAgIHJlbGF0aXZlID0gdHJhbnNmb3Jtcy5yZWxhdGl2ZSB8fCByZWxhdGl2ZVxyXG4gICAgaWYgKHRoaXMuX2lzRGVjbGFyYXRpdmUgJiYgIXJlbGF0aXZlICYmIHRoaXMuX3RyeVJldGFyZ2V0KCd0cmFuc2Zvcm0nLCB0cmFuc2Zvcm1zKSkge1xyXG4gICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBhcnNlIHRoZSBwYXJhbWV0ZXJzXHJcbiAgICBjb25zdCBpc01hdHJpeCA9IE1hdHJpeC5pc01hdHJpeExpa2UodHJhbnNmb3JtcylcclxuICAgIGFmZmluZSA9IHRyYW5zZm9ybXMuYWZmaW5lICE9IG51bGxcclxuICAgICAgPyB0cmFuc2Zvcm1zLmFmZmluZVxyXG4gICAgICA6IChhZmZpbmUgIT0gbnVsbCA/IGFmZmluZSA6ICFpc01hdHJpeClcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBtb3JlcGhlciBhbmQgc2V0IGl0cyB0eXBlXHJcbiAgICBjb25zdCBtb3JwaGVyID0gbmV3IE1vcnBoYWJsZSh0aGlzLl9zdGVwcGVyKVxyXG4gICAgICAudHlwZShhZmZpbmUgPyBUcmFuc2Zvcm1CYWcgOiBNYXRyaXgpXHJcblxyXG4gICAgbGV0IG9yaWdpblxyXG4gICAgbGV0IGVsZW1lbnRcclxuICAgIGxldCBjdXJyZW50XHJcbiAgICBsZXQgY3VycmVudEFuZ2xlXHJcbiAgICBsZXQgc3RhcnRUcmFuc2Zvcm1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXR1cCAoKSB7XHJcbiAgICAgIC8vIG1ha2Ugc3VyZSBlbGVtZW50IGFuZCBvcmlnaW4gaXMgZGVmaW5lZFxyXG4gICAgICBlbGVtZW50ID0gZWxlbWVudCB8fCB0aGlzLmVsZW1lbnQoKVxyXG4gICAgICBvcmlnaW4gPSBvcmlnaW4gfHwgZ2V0T3JpZ2luKHRyYW5zZm9ybXMsIGVsZW1lbnQpXHJcblxyXG4gICAgICBzdGFydFRyYW5zZm9ybSA9IG5ldyBNYXRyaXgocmVsYXRpdmUgPyB1bmRlZmluZWQgOiBlbGVtZW50KVxyXG5cclxuICAgICAgLy8gYWRkIHRoZSBydW5uZXIgdG8gdGhlIGVsZW1lbnQgc28gaXQgY2FuIG1lcmdlIHRyYW5zZm9ybWF0aW9uc1xyXG4gICAgICBlbGVtZW50Ll9hZGRSdW5uZXIodGhpcylcclxuXHJcbiAgICAgIC8vIERlYWN0aXZhdGUgYWxsIHRyYW5zZm9ybXMgdGhhdCBoYXZlIHJ1biBzbyBmYXIgaWYgd2UgYXJlIGFic29sdXRlXHJcbiAgICAgIGlmICghcmVsYXRpdmUpIHtcclxuICAgICAgICBlbGVtZW50Ll9jbGVhclRyYW5zZm9ybVJ1bm5lcnNCZWZvcmUodGhpcylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJ1biAocG9zKSB7XHJcbiAgICAgIC8vIGNsZWFyIGFsbCBvdGhlciB0cmFuc2Zvcm1zIGJlZm9yZSB0aGlzIGluIGNhc2Ugc29tZXRoaW5nIGlzIHNhdmVkXHJcbiAgICAgIC8vIG9uIHRoaXMgcnVubmVyLiBXZSBhcmUgYWJzb2x1dGUuIFdlIGRvbnQgbmVlZCB0aGVzZSFcclxuICAgICAgaWYgKCFyZWxhdGl2ZSkgdGhpcy5jbGVhclRyYW5zZm9ybSgpXHJcblxyXG4gICAgICBjb25zdCB7IHgsIHkgfSA9IG5ldyBQb2ludChvcmlnaW4pLnRyYW5zZm9ybShlbGVtZW50Ll9jdXJyZW50VHJhbnNmb3JtKHRoaXMpKVxyXG5cclxuICAgICAgbGV0IHRhcmdldCA9IG5ldyBNYXRyaXgoeyAuLi50cmFuc2Zvcm1zLCBvcmlnaW46IFsgeCwgeSBdIH0pXHJcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuX2lzRGVjbGFyYXRpdmUgJiYgY3VycmVudFxyXG4gICAgICAgID8gY3VycmVudFxyXG4gICAgICAgIDogc3RhcnRUcmFuc2Zvcm1cclxuXHJcbiAgICAgIGlmIChhZmZpbmUpIHtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQuZGVjb21wb3NlKHgsIHkpXHJcbiAgICAgICAgc3RhcnQgPSBzdGFydC5kZWNvbXBvc2UoeCwgeSlcclxuXHJcbiAgICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IGFuZCB0YXJnZXQgYW5nbGUgYXMgaXQgd2FzIHNldFxyXG4gICAgICAgIGNvbnN0IHJUYXJnZXQgPSB0YXJnZXQucm90YXRlXHJcbiAgICAgICAgY29uc3QgckN1cnJlbnQgPSBzdGFydC5yb3RhdGVcclxuXHJcbiAgICAgICAgLy8gRmlndXJlIG91dCB0aGUgc2hvcnRlc3QgcGF0aCB0byByb3RhdGUgZGlyZWN0bHlcclxuICAgICAgICBjb25zdCBwb3NzaWJpbGl0aWVzID0gWyByVGFyZ2V0IC0gMzYwLCByVGFyZ2V0LCByVGFyZ2V0ICsgMzYwIF1cclxuICAgICAgICBjb25zdCBkaXN0YW5jZXMgPSBwb3NzaWJpbGl0aWVzLm1hcChhID0+IE1hdGguYWJzKGEgLSByQ3VycmVudCkpXHJcbiAgICAgICAgY29uc3Qgc2hvcnRlc3QgPSBNYXRoLm1pbiguLi5kaXN0YW5jZXMpXHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBkaXN0YW5jZXMuaW5kZXhPZihzaG9ydGVzdClcclxuICAgICAgICB0YXJnZXQucm90YXRlID0gcG9zc2liaWxpdGllc1tpbmRleF1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHJlbGF0aXZlKSB7XHJcbiAgICAgICAgLy8gd2UgaGF2ZSB0byBiZSBjYXJlZnVsIGhlcmUgbm90IHRvIG92ZXJ3cml0ZSB0aGUgcm90YXRpb25cclxuICAgICAgICAvLyB3aXRoIHRoZSByb3RhdGUgbWV0aG9kIG9mIE1hdHJpeFxyXG4gICAgICAgIGlmICghaXNNYXRyaXgpIHtcclxuICAgICAgICAgIHRhcmdldC5yb3RhdGUgPSB0cmFuc2Zvcm1zLnJvdGF0ZSB8fCAwXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9pc0RlY2xhcmF0aXZlICYmIGN1cnJlbnRBbmdsZSkge1xyXG4gICAgICAgICAgc3RhcnQucm90YXRlID0gY3VycmVudEFuZ2xlXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBtb3JwaGVyLmZyb20oc3RhcnQpXHJcbiAgICAgIG1vcnBoZXIudG8odGFyZ2V0KVxyXG5cclxuICAgICAgY29uc3QgYWZmaW5lUGFyYW1ldGVycyA9IG1vcnBoZXIuYXQocG9zKVxyXG4gICAgICBjdXJyZW50QW5nbGUgPSBhZmZpbmVQYXJhbWV0ZXJzLnJvdGF0ZVxyXG4gICAgICBjdXJyZW50ID0gbmV3IE1hdHJpeChhZmZpbmVQYXJhbWV0ZXJzKVxyXG5cclxuICAgICAgdGhpcy5hZGRUcmFuc2Zvcm0oY3VycmVudClcclxuICAgICAgZWxlbWVudC5fYWRkUnVubmVyKHRoaXMpXHJcbiAgICAgIHJldHVybiBtb3JwaGVyLmRvbmUoKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJldGFyZ2V0IChuZXdUcmFuc2Zvcm1zKSB7XHJcbiAgICAgIC8vIG9ubHkgZ2V0IGEgbmV3IG9yaWdpbiBpZiBpdCBjaGFuZ2VkIHNpbmNlIHRoZSBsYXN0IGNhbGxcclxuICAgICAgaWYgKFxyXG4gICAgICAgIChuZXdUcmFuc2Zvcm1zLm9yaWdpbiB8fCAnY2VudGVyJykudG9TdHJpbmcoKVxyXG4gICAgICAgICE9PSAodHJhbnNmb3Jtcy5vcmlnaW4gfHwgJ2NlbnRlcicpLnRvU3RyaW5nKClcclxuICAgICAgKSB7XHJcbiAgICAgICAgb3JpZ2luID0gZ2V0T3JpZ2luKG5ld1RyYW5zZm9ybXMsIGVsZW1lbnQpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIG92ZXJ3cml0ZSB0aGUgb2xkIHRyYW5zZm9ybWF0aW9ucyB3aXRoIHRoZSBuZXcgb25lc1xyXG4gICAgICB0cmFuc2Zvcm1zID0geyAuLi5uZXdUcmFuc2Zvcm1zLCBvcmlnaW4gfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucXVldWUoc2V0dXAsIHJ1biwgcmV0YXJnZXQsIHRydWUpXHJcbiAgICB0aGlzLl9pc0RlY2xhcmF0aXZlICYmIHRoaXMuX3JlbWVtYmVyTW9ycGhlcigndHJhbnNmb3JtJywgbW9ycGhlcilcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfSxcclxuXHJcbiAgLy8gQW5pbWF0YWJsZSB4LWF4aXNcclxuICB4ICh4LCByZWxhdGl2ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlTnVtYmVyKCd4JywgeClcclxuICB9LFxyXG5cclxuICAvLyBBbmltYXRhYmxlIHktYXhpc1xyXG4gIHkgKHkpIHtcclxuICAgIHJldHVybiB0aGlzLl9xdWV1ZU51bWJlcigneScsIHkpXHJcbiAgfSxcclxuXHJcbiAgZHggKHggPSAwKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcXVldWVOdW1iZXJEZWx0YSgneCcsIHgpXHJcbiAgfSxcclxuXHJcbiAgZHkgKHkgPSAwKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcXVldWVOdW1iZXJEZWx0YSgneScsIHkpXHJcbiAgfSxcclxuXHJcbiAgZG1vdmUgKHgsIHkpIHtcclxuICAgIHJldHVybiB0aGlzLmR4KHgpLmR5KHkpXHJcbiAgfSxcclxuXHJcbiAgX3F1ZXVlTnVtYmVyRGVsdGEgKG1ldGhvZCwgdG8pIHtcclxuICAgIHRvID0gbmV3IFNWR051bWJlcih0bylcclxuXHJcbiAgICAvLyBUcnkgdG8gY2hhbmdlIHRoZSB0YXJnZXQgaWYgd2UgaGF2ZSB0aGlzIG1ldGhvZCBhbHJlYWR5IHJlZ2lzdGVyZFxyXG4gICAgaWYgKHRoaXMuX3RyeVJldGFyZ2V0KG1ldGhvZCwgdG8pKSByZXR1cm4gdGhpc1xyXG5cclxuICAgIC8vIE1ha2UgYSBtb3JwaGVyIGFuZCBxdWV1ZSB0aGUgYW5pbWF0aW9uXHJcbiAgICBjb25zdCBtb3JwaGVyID0gbmV3IE1vcnBoYWJsZSh0aGlzLl9zdGVwcGVyKS50byh0bylcclxuICAgIGxldCBmcm9tID0gbnVsbFxyXG4gICAgdGhpcy5xdWV1ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIGZyb20gPSB0aGlzLmVsZW1lbnQoKVttZXRob2RdKClcclxuICAgICAgbW9ycGhlci5mcm9tKGZyb20pXHJcbiAgICAgIG1vcnBoZXIudG8oZnJvbSArIHRvKVxyXG4gICAgfSwgZnVuY3Rpb24gKHBvcykge1xyXG4gICAgICB0aGlzLmVsZW1lbnQoKVttZXRob2RdKG1vcnBoZXIuYXQocG9zKSlcclxuICAgICAgcmV0dXJuIG1vcnBoZXIuZG9uZSgpXHJcbiAgICB9LCBmdW5jdGlvbiAobmV3VG8pIHtcclxuICAgICAgbW9ycGhlci50byhmcm9tICsgbmV3IFNWR051bWJlcihuZXdUbykpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFJlZ2lzdGVyIHRoZSBtb3JwaGVyIHNvIHRoYXQgaWYgaXQgaXMgY2hhbmdlZCBhZ2Fpbiwgd2UgY2FuIHJldGFyZ2V0IGl0XHJcbiAgICB0aGlzLl9yZW1lbWJlck1vcnBoZXIobWV0aG9kLCBtb3JwaGVyKVxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9LFxyXG5cclxuICBfcXVldWVPYmplY3QgKG1ldGhvZCwgdG8pIHtcclxuICAgIC8vIFRyeSB0byBjaGFuZ2UgdGhlIHRhcmdldCBpZiB3ZSBoYXZlIHRoaXMgbWV0aG9kIGFscmVhZHkgcmVnaXN0ZXJkXHJcbiAgICBpZiAodGhpcy5fdHJ5UmV0YXJnZXQobWV0aG9kLCB0bykpIHJldHVybiB0aGlzXHJcblxyXG4gICAgLy8gTWFrZSBhIG1vcnBoZXIgYW5kIHF1ZXVlIHRoZSBhbmltYXRpb25cclxuICAgIGNvbnN0IG1vcnBoZXIgPSBuZXcgTW9ycGhhYmxlKHRoaXMuX3N0ZXBwZXIpLnRvKHRvKVxyXG4gICAgdGhpcy5xdWV1ZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgIG1vcnBoZXIuZnJvbSh0aGlzLmVsZW1lbnQoKVttZXRob2RdKCkpXHJcbiAgICB9LCBmdW5jdGlvbiAocG9zKSB7XHJcbiAgICAgIHRoaXMuZWxlbWVudCgpW21ldGhvZF0obW9ycGhlci5hdChwb3MpKVxyXG4gICAgICByZXR1cm4gbW9ycGhlci5kb25lKClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gUmVnaXN0ZXIgdGhlIG1vcnBoZXIgc28gdGhhdCBpZiBpdCBpcyBjaGFuZ2VkIGFnYWluLCB3ZSBjYW4gcmV0YXJnZXQgaXRcclxuICAgIHRoaXMuX3JlbWVtYmVyTW9ycGhlcihtZXRob2QsIG1vcnBoZXIpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH0sXHJcblxyXG4gIF9xdWV1ZU51bWJlciAobWV0aG9kLCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlT2JqZWN0KG1ldGhvZCwgbmV3IFNWR051bWJlcih2YWx1ZSkpXHJcbiAgfSxcclxuXHJcbiAgLy8gQW5pbWF0YWJsZSBjZW50ZXIgeC1heGlzXHJcbiAgY3ggKHgpIHtcclxuICAgIHJldHVybiB0aGlzLl9xdWV1ZU51bWJlcignY3gnLCB4KVxyXG4gIH0sXHJcblxyXG4gIC8vIEFuaW1hdGFibGUgY2VudGVyIHktYXhpc1xyXG4gIGN5ICh5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcXVldWVOdW1iZXIoJ2N5JywgeSlcclxuICB9LFxyXG5cclxuICAvLyBBZGQgYW5pbWF0YWJsZSBtb3ZlXHJcbiAgbW92ZSAoeCwgeSkge1xyXG4gICAgcmV0dXJuIHRoaXMueCh4KS55KHkpXHJcbiAgfSxcclxuXHJcbiAgLy8gQWRkIGFuaW1hdGFibGUgY2VudGVyXHJcbiAgY2VudGVyICh4LCB5KSB7XHJcbiAgICByZXR1cm4gdGhpcy5jeCh4KS5jeSh5KVxyXG4gIH0sXHJcblxyXG4gIC8vIEFkZCBhbmltYXRhYmxlIHNpemVcclxuICBzaXplICh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAvLyBhbmltYXRlIGJib3ggYmFzZWQgc2l6ZSBmb3IgYWxsIG90aGVyIGVsZW1lbnRzXHJcbiAgICBsZXQgYm94XHJcblxyXG4gICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0KSB7XHJcbiAgICAgIGJveCA9IHRoaXMuX2VsZW1lbnQuYmJveCgpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF3aWR0aCkge1xyXG4gICAgICB3aWR0aCA9IGJveC53aWR0aCAvIGJveC5oZWlnaHQgKiBoZWlnaHRcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWhlaWdodCkge1xyXG4gICAgICBoZWlnaHQgPSBib3guaGVpZ2h0IC8gYm94LndpZHRoICogd2lkdGhcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gICAgICAud2lkdGgod2lkdGgpXHJcbiAgICAgIC5oZWlnaHQoaGVpZ2h0KVxyXG4gIH0sXHJcblxyXG4gIC8vIEFkZCBhbmltYXRhYmxlIHdpZHRoXHJcbiAgd2lkdGggKHdpZHRoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcXVldWVOdW1iZXIoJ3dpZHRoJywgd2lkdGgpXHJcbiAgfSxcclxuXHJcbiAgLy8gQWRkIGFuaW1hdGFibGUgaGVpZ2h0XHJcbiAgaGVpZ2h0IChoZWlnaHQpIHtcclxuICAgIHJldHVybiB0aGlzLl9xdWV1ZU51bWJlcignaGVpZ2h0JywgaGVpZ2h0KVxyXG4gIH0sXHJcblxyXG4gIC8vIEFkZCBhbmltYXRhYmxlIHBsb3RcclxuICBwbG90IChhLCBiLCBjLCBkKSB7XHJcbiAgICAvLyBMaW5lcyBjYW4gYmUgcGxvdHRlZCB3aXRoIDQgYXJndW1lbnRzXHJcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wbG90KFsgYSwgYiwgYywgZCBdKVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl90cnlSZXRhcmdldCgncGxvdCcsIGEpKSByZXR1cm4gdGhpc1xyXG5cclxuICAgIGNvbnN0IG1vcnBoZXIgPSBuZXcgTW9ycGhhYmxlKHRoaXMuX3N0ZXBwZXIpXHJcbiAgICAgIC50eXBlKHRoaXMuX2VsZW1lbnQuTW9ycGhBcnJheSkudG8oYSlcclxuXHJcbiAgICB0aGlzLnF1ZXVlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgbW9ycGhlci5mcm9tKHRoaXMuX2VsZW1lbnQuYXJyYXkoKSlcclxuICAgIH0sIGZ1bmN0aW9uIChwb3MpIHtcclxuICAgICAgdGhpcy5fZWxlbWVudC5wbG90KG1vcnBoZXIuYXQocG9zKSlcclxuICAgICAgcmV0dXJuIG1vcnBoZXIuZG9uZSgpXHJcbiAgICB9KVxyXG5cclxuICAgIHRoaXMuX3JlbWVtYmVyTW9ycGhlcigncGxvdCcsIG1vcnBoZXIpXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH0sXHJcblxyXG4gIC8vIEFkZCBsZWFkaW5nIG1ldGhvZFxyXG4gIGxlYWRpbmcgKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcXVldWVOdW1iZXIoJ2xlYWRpbmcnLCB2YWx1ZSlcclxuICB9LFxyXG5cclxuICAvLyBBZGQgYW5pbWF0YWJsZSB2aWV3Ym94XHJcbiAgdmlld2JveCAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3F1ZXVlT2JqZWN0KCd2aWV3Ym94JywgbmV3IEJveCh4LCB5LCB3aWR0aCwgaGVpZ2h0KSlcclxuICB9LFxyXG5cclxuICB1cGRhdGUgKG8pIHtcclxuICAgIGlmICh0eXBlb2YgbyAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlKHtcclxuICAgICAgICBvZmZzZXQ6IGFyZ3VtZW50c1swXSxcclxuICAgICAgICBjb2xvcjogYXJndW1lbnRzWzFdLFxyXG4gICAgICAgIG9wYWNpdHk6IGFyZ3VtZW50c1syXVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChvLm9wYWNpdHkgIT0gbnVsbCkgdGhpcy5hdHRyKCdzdG9wLW9wYWNpdHknLCBvLm9wYWNpdHkpXHJcbiAgICBpZiAoby5jb2xvciAhPSBudWxsKSB0aGlzLmF0dHIoJ3N0b3AtY29sb3InLCBvLmNvbG9yKVxyXG4gICAgaWYgKG8ub2Zmc2V0ICE9IG51bGwpIHRoaXMuYXR0cignb2Zmc2V0Jywgby5vZmZzZXQpXHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcbn0pXHJcblxyXG5leHRlbmQoUnVubmVyLCB7IHJ4LCByeSwgZnJvbSwgdG8gfSlcclxucmVnaXN0ZXIoUnVubmVyLCAnUnVubmVyJylcclxuIiwiaW1wb3J0IHtcclxuICBhZG9wdCxcclxuICBub2RlT3JOZXcsXHJcbiAgcmVnaXN0ZXIsXHJcbiAgd3JhcFdpdGhBdHRyQ2hlY2tcclxufSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyBzdmcsIHN2Z2pzLCB4bGluaywgeG1sbnMgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvbmFtZXNwYWNlcy5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL0NvbnRhaW5lci5qcydcclxuaW1wb3J0IERlZnMgZnJvbSAnLi9EZWZzLmpzJ1xyXG5pbXBvcnQgeyBnbG9iYWxzIH0gZnJvbSAnLi4vdXRpbHMvd2luZG93LmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3ZnIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ3N2ZycsIG5vZGUpLCBhdHRycylcclxuICAgIHRoaXMubmFtZXNwYWNlKClcclxuICB9XHJcblxyXG4gIC8vIENyZWF0ZXMgYW5kIHJldHVybnMgZGVmcyBlbGVtZW50XHJcbiAgZGVmcyAoKSB7XHJcbiAgICBpZiAoIXRoaXMuaXNSb290KCkpIHJldHVybiB0aGlzLnJvb3QoKS5kZWZzKClcclxuXHJcbiAgICByZXR1cm4gYWRvcHQodGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3IoJ2RlZnMnKSlcclxuICAgICAgfHwgdGhpcy5wdXQobmV3IERlZnMoKSlcclxuICB9XHJcblxyXG4gIGlzUm9vdCAoKSB7XHJcbiAgICByZXR1cm4gIXRoaXMubm9kZS5wYXJlbnROb2RlXHJcbiAgICAgIHx8ICghKHRoaXMubm9kZS5wYXJlbnROb2RlIGluc3RhbmNlb2YgZ2xvYmFscy53aW5kb3cuU1ZHRWxlbWVudCkgJiYgdGhpcy5ub2RlLnBhcmVudE5vZGUubm9kZU5hbWUgIT09ICcjZG9jdW1lbnQtZnJhZ21lbnQnKVxyXG4gIH1cclxuXHJcbiAgLy8gQWRkIG5hbWVzcGFjZXNcclxuICBuYW1lc3BhY2UgKCkge1xyXG4gICAgaWYgKCF0aGlzLmlzUm9vdCgpKSByZXR1cm4gdGhpcy5yb290KCkubmFtZXNwYWNlKClcclxuICAgIHJldHVybiB0aGlzXHJcbiAgICAgIC5hdHRyKHsgeG1sbnM6IHN2ZywgdmVyc2lvbjogJzEuMScgfSlcclxuICAgICAgLmF0dHIoJ3htbG5zOnhsaW5rJywgeGxpbmssIHhtbG5zKVxyXG4gICAgICAuYXR0cigneG1sbnM6c3ZnanMnLCBzdmdqcywgeG1sbnMpXHJcbiAgfVxyXG5cclxuICByZW1vdmVOYW1lc3BhY2UgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0cih7IHhtbG5zOiBudWxsLCB2ZXJzaW9uOiBudWxsIH0pXHJcbiAgICAgIC5hdHRyKCd4bWxuczp4bGluaycsIG51bGwsIHhtbG5zKVxyXG4gICAgICAuYXR0cigneG1sbnM6c3ZnanMnLCBudWxsLCB4bWxucylcclxuICB9XHJcblxyXG4gIC8vIENoZWNrIGlmIHRoaXMgaXMgYSByb290IHN2Z1xyXG4gIC8vIElmIG5vdCwgY2FsbCByb290KCkgZnJvbSB0aGlzIGVsZW1lbnRcclxuICByb290ICgpIHtcclxuICAgIGlmICh0aGlzLmlzUm9vdCgpKSByZXR1cm4gdGhpc1xyXG4gICAgcmV0dXJuIHN1cGVyLnJvb3QoKVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgbmVzdGVkIHN2ZyBkb2N1bWVudFxyXG4gICAgbmVzdGVkOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnB1dChuZXcgU3ZnKCkpXHJcbiAgICB9KVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKFN2ZywgJ1N2ZycsIHRydWUpXHJcbiIsImltcG9ydCB7IG5vZGVPck5ldywgcmVnaXN0ZXIsIHdyYXBXaXRoQXR0ckNoZWNrIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL0NvbnRhaW5lci5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN5bWJvbCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdzeW1ib2wnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgc3ltYm9sOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnB1dChuZXcgU3ltYm9sKCkpXHJcbiAgICB9KVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKFN5bWJvbCwgJ1N5bWJvbCcpXHJcbiIsImltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi8uLi91dGlscy93aW5kb3cuanMnXHJcblxyXG4vLyBDcmVhdGUgcGxhaW4gdGV4dCBub2RlXHJcbmV4cG9ydCBmdW5jdGlvbiBwbGFpbiAodGV4dCkge1xyXG4gIC8vIGNsZWFyIGlmIGJ1aWxkIG1vZGUgaXMgZGlzYWJsZWRcclxuICBpZiAodGhpcy5fYnVpbGQgPT09IGZhbHNlKSB7XHJcbiAgICB0aGlzLmNsZWFyKClcclxuICB9XHJcblxyXG4gIC8vIGNyZWF0ZSB0ZXh0IG5vZGVcclxuICB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQoZ2xvYmFscy5kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KSlcclxuXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG5cclxuLy8gR2V0IGxlbmd0aCBvZiB0ZXh0IGVsZW1lbnRcclxuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aCAoKSB7XHJcbiAgcmV0dXJuIHRoaXMubm9kZS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKVxyXG59XHJcblxyXG4vLyBNb3ZlIG92ZXIgeC1heGlzXHJcbi8vIFRleHQgaXMgbW92ZWQgYnkgaXRzIGJvdW5kaW5nIGJveFxyXG4vLyB0ZXh0LWFuY2hvciBkb2VzIE5PVCBtYXR0ZXJcclxuZXhwb3J0IGZ1bmN0aW9uIHggKHgsIGJveCA9IHRoaXMuYmJveCgpKSB7XHJcbiAgaWYgKHggPT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIGJveC54XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcy5hdHRyKCd4JywgdGhpcy5hdHRyKCd4JykgKyB4IC0gYm94LngpXHJcbn1cclxuXHJcbi8vIE1vdmUgb3ZlciB5LWF4aXNcclxuZXhwb3J0IGZ1bmN0aW9uIHkgKHksIGJveCA9IHRoaXMuYmJveCgpKSB7XHJcbiAgaWYgKHkgPT0gbnVsbCkge1xyXG4gICAgcmV0dXJuIGJveC55XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdGhpcy5hdHRyKCd5JykgKyB5IC0gYm94LnkpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBtb3ZlICh4LCB5LCBib3ggPSB0aGlzLmJib3goKSkge1xyXG4gIHJldHVybiB0aGlzLngoeCwgYm94KS55KHksIGJveClcclxufVxyXG5cclxuLy8gTW92ZSBjZW50ZXIgb3ZlciB4LWF4aXNcclxuZXhwb3J0IGZ1bmN0aW9uIGN4ICh4LCBib3ggPSB0aGlzLmJib3goKSkge1xyXG4gIGlmICh4ID09IG51bGwpIHtcclxuICAgIHJldHVybiBib3guY3hcclxuICB9XHJcblxyXG4gIHJldHVybiB0aGlzLmF0dHIoJ3gnLCB0aGlzLmF0dHIoJ3gnKSArIHggLSBib3guY3gpXHJcbn1cclxuXHJcbi8vIE1vdmUgY2VudGVyIG92ZXIgeS1heGlzXHJcbmV4cG9ydCBmdW5jdGlvbiBjeSAoeSwgYm94ID0gdGhpcy5iYm94KCkpIHtcclxuICBpZiAoeSA9PSBudWxsKSB7XHJcbiAgICByZXR1cm4gYm94LmN5XHJcbiAgfVxyXG5cclxuICByZXR1cm4gdGhpcy5hdHRyKCd5JywgdGhpcy5hdHRyKCd5JykgKyB5IC0gYm94LmN5KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2VudGVyICh4LCB5LCBib3ggPSB0aGlzLmJib3goKSkge1xyXG4gIHJldHVybiB0aGlzLmN4KHgsIGJveCkuY3koeSwgYm94KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXggKHgpIHtcclxuICByZXR1cm4gdGhpcy5hdHRyKCd4JywgeClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGF5ICh5KSB7XHJcbiAgcmV0dXJuIHRoaXMuYXR0cigneScsIHkpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBhbW92ZSAoeCwgeSkge1xyXG4gIHJldHVybiB0aGlzLmF4KHgpLmF5KHkpXHJcbn1cclxuXHJcbi8vIEVuYWJsZSAvIGRpc2FibGUgYnVpbGQgbW9kZVxyXG5leHBvcnQgZnVuY3Rpb24gYnVpbGQgKGJ1aWxkKSB7XHJcbiAgdGhpcy5fYnVpbGQgPSAhIWJ1aWxkXHJcbiAgcmV0dXJuIHRoaXNcclxufVxyXG4iLCJpbXBvcnQge1xyXG4gIGFkb3B0LFxyXG4gIGV4dGVuZCxcclxuICBub2RlT3JOZXcsXHJcbiAgcmVnaXN0ZXIsXHJcbiAgd3JhcFdpdGhBdHRyQ2hlY2tcclxufSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9tZXRob2RzLmpzJ1xyXG5pbXBvcnQgU1ZHTnVtYmVyIGZyb20gJy4uL3R5cGVzL1NWR051bWJlci5qcydcclxuaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnXHJcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi91dGlscy93aW5kb3cuanMnXHJcbmltcG9ydCAqIGFzIHRleHRhYmxlIGZyb20gJy4uL21vZHVsZXMvY29yZS90ZXh0YWJsZS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRleHQgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBub2RlXHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCd0ZXh0Jywgbm9kZSksIGF0dHJzKVxyXG5cclxuICAgIHRoaXMuZG9tLmxlYWRpbmcgPSBuZXcgU1ZHTnVtYmVyKDEuMykgLy8gc3RvcmUgbGVhZGluZyB2YWx1ZSBmb3IgcmVidWlsZGluZ1xyXG4gICAgdGhpcy5fcmVidWlsZCA9IHRydWUgLy8gZW5hYmxlIGF1dG9tYXRpYyB1cGRhdGluZyBvZiBkeSB2YWx1ZXNcclxuICAgIHRoaXMuX2J1aWxkID0gZmFsc2UgLy8gZGlzYWJsZSBidWlsZCBtb2RlIGZvciBhZGRpbmcgbXVsdGlwbGUgbGluZXNcclxuICB9XHJcblxyXG4gIC8vIFNldCAvIGdldCBsZWFkaW5nXG4gIGxlYWRpbmcgKHZhbHVlKSB7XHJcbiAgICAvLyBhY3QgYXMgZ2V0dGVyXHJcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kb20ubGVhZGluZ1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGFjdCBhcyBzZXR0ZXJcclxuICAgIHRoaXMuZG9tLmxlYWRpbmcgPSBuZXcgU1ZHTnVtYmVyKHZhbHVlKVxyXG5cclxuICAgIHJldHVybiB0aGlzLnJlYnVpbGQoKVxyXG4gIH1cblxuICAvLyBSZWJ1aWxkIGFwcGVhcmFuY2UgdHlwZVxuICByZWJ1aWxkIChyZWJ1aWxkKSB7XHJcbiAgICAvLyBzdG9yZSBuZXcgcmVidWlsZCBmbGFnIGlmIGdpdmVuXHJcbiAgICBpZiAodHlwZW9mIHJlYnVpbGQgPT09ICdib29sZWFuJykge1xyXG4gICAgICB0aGlzLl9yZWJ1aWxkID0gcmVidWlsZFxyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlZmluZSBwb3NpdGlvbiBvZiBhbGwgbGluZXNcclxuICAgIGlmICh0aGlzLl9yZWJ1aWxkKSB7XHJcbiAgICAgIGNvbnN0IHNlbGYgPSB0aGlzXHJcbiAgICAgIGxldCBibGFua0xpbmVPZmZzZXQgPSAwXHJcbiAgICAgIGNvbnN0IGxlYWRpbmcgPSB0aGlzLmRvbS5sZWFkaW5nXHJcblxyXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24gKGkpIHtcclxuICAgICAgICBjb25zdCBmb250U2l6ZSA9IGdsb2JhbHMud2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5ub2RlKVxyXG4gICAgICAgICAgLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXHJcblxyXG4gICAgICAgIGNvbnN0IGR5ID0gbGVhZGluZyAqIG5ldyBTVkdOdW1iZXIoZm9udFNpemUpXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRvbS5uZXdMaW5lZCkge1xyXG4gICAgICAgICAgdGhpcy5hdHRyKCd4Jywgc2VsZi5hdHRyKCd4JykpXHJcblxyXG4gICAgICAgICAgaWYgKHRoaXMudGV4dCgpID09PSAnXFxuJykge1xyXG4gICAgICAgICAgICBibGFua0xpbmVPZmZzZXQgKz0gZHlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXR0cignZHknLCBpID8gZHkgKyBibGFua0xpbmVPZmZzZXQgOiAwKVxyXG4gICAgICAgICAgICBibGFua0xpbmVPZmZzZXQgPSAwXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgdGhpcy5maXJlKCdyZWJ1aWxkJylcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cblxuICAvLyBvdmVyd3JpdGUgbWV0aG9kIGZyb20gcGFyZW50IHRvIHNldCBkYXRhIHByb3Blcmx5XG4gIHNldERhdGEgKG8pIHtcclxuICAgIHRoaXMuZG9tID0gb1xyXG4gICAgdGhpcy5kb20ubGVhZGluZyA9IG5ldyBTVkdOdW1iZXIoby5sZWFkaW5nIHx8IDEuMylcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxuXG4gIC8vIFNldCB0aGUgdGV4dCBjb250ZW50XHJcbiAgdGV4dCAodGV4dCkge1xyXG4gICAgLy8gYWN0IGFzIGdldHRlclxyXG4gICAgaWYgKHRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMubm9kZS5jaGlsZE5vZGVzXHJcbiAgICAgIGxldCBmaXJzdExpbmUgPSAwXHJcbiAgICAgIHRleHQgPSAnJ1xyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgICAgLy8gc2tpcCB0ZXh0UGF0aHMgLSB0aGV5IGFyZSBubyBsaW5lc1xyXG4gICAgICAgIGlmIChjaGlsZHJlbltpXS5ub2RlTmFtZSA9PT0gJ3RleHRQYXRoJykge1xyXG4gICAgICAgICAgaWYgKGkgPT09IDApIGZpcnN0TGluZSA9IDFcclxuICAgICAgICAgIGNvbnRpbnVlXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBhZGQgbmV3bGluZSBpZiBpdHMgbm90IHRoZSBmaXJzdCBjaGlsZCBhbmQgbmV3TGluZWQgaXMgc2V0IHRvIHRydWVcclxuICAgICAgICBpZiAoaSAhPT0gZmlyc3RMaW5lICYmIGNoaWxkcmVuW2ldLm5vZGVUeXBlICE9PSAzICYmIGFkb3B0KGNoaWxkcmVuW2ldKS5kb20ubmV3TGluZWQgPT09IHRydWUpIHtcclxuICAgICAgICAgIHRleHQgKz0gJ1xcbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGFkZCBjb250ZW50IG9mIHRoaXMgbm9kZVxyXG4gICAgICAgIHRleHQgKz0gY2hpbGRyZW5baV0udGV4dENvbnRlbnRcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRleHRcclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgZXhpc3RpbmcgY29udGVudFxyXG4gICAgdGhpcy5jbGVhcigpLmJ1aWxkKHRydWUpXHJcblxyXG4gICAgaWYgKHR5cGVvZiB0ZXh0ID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgIC8vIGNhbGwgYmxvY2tcclxuICAgICAgdGV4dC5jYWxsKHRoaXMsIHRoaXMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAvLyBzdG9yZSB0ZXh0IGFuZCBtYWtlIHN1cmUgdGV4dCBpcyBub3QgYmxhbmtcclxuICAgICAgdGV4dCA9ICh0ZXh0ICsgJycpLnNwbGl0KCdcXG4nKVxyXG5cclxuICAgICAgLy8gYnVpbGQgbmV3IGxpbmVzXHJcbiAgICAgIGZvciAobGV0IGogPSAwLCBqbCA9IHRleHQubGVuZ3RoOyBqIDwgamw7IGorKykge1xyXG4gICAgICAgIHRoaXMubmV3TGluZSh0ZXh0W2pdKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGlzYWJsZSBidWlsZCBtb2RlIGFuZCByZWJ1aWxkIGxpbmVzXHJcbiAgICByZXR1cm4gdGhpcy5idWlsZChmYWxzZSkucmVidWlsZCgpXHJcbiAgfVxyXG5cclxufVxyXG5cclxuZXh0ZW5kKFRleHQsIHRleHRhYmxlKVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBDb250YWluZXI6IHtcclxuICAgIC8vIENyZWF0ZSB0ZXh0IGVsZW1lbnRcclxuICAgIHRleHQ6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICh0ZXh0ID0gJycpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBUZXh0KCkpLnRleHQodGV4dClcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIENyZWF0ZSBwbGFpbiB0ZXh0IGVsZW1lbnRcclxuICAgIHBsYWluOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAodGV4dCA9ICcnKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnB1dChuZXcgVGV4dCgpKS5wbGFpbih0ZXh0KVxyXG4gICAgfSlcclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3RlcihUZXh0LCAnVGV4dCcpXHJcbiIsImltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuLi91dGlscy93aW5kb3cuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi4vdHlwZXMvU1ZHTnVtYmVyLmpzJ1xyXG5pbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcydcclxuaW1wb3J0IFRleHQgZnJvbSAnLi9UZXh0LmpzJ1xyXG5pbXBvcnQgKiBhcyB0ZXh0YWJsZSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvdGV4dGFibGUuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUc3BhbiBleHRlbmRzIFNoYXBlIHtcclxuICAvLyBJbml0aWFsaXplIG5vZGVcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ3RzcGFuJywgbm9kZSksIGF0dHJzKVxyXG4gICAgdGhpcy5fYnVpbGQgPSBmYWxzZSAvLyBkaXNhYmxlIGJ1aWxkIG1vZGUgZm9yIGFkZGluZyBtdWx0aXBsZSBsaW5lc1xyXG4gIH1cclxuXHJcbiAgLy8gU2hvcnRjdXQgZHhcbiAgZHggKGR4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCdkeCcsIGR4KVxyXG4gIH1cblxuICAvLyBTaG9ydGN1dCBkeVxuICBkeSAoZHkpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2R5JywgZHkpXHJcbiAgfVxuXG4gIC8vIENyZWF0ZSBuZXcgbGluZVxuICBuZXdMaW5lICgpIHtcclxuICAgIC8vIG1hcmsgbmV3IGxpbmVcclxuICAgIHRoaXMuZG9tLm5ld0xpbmVkID0gdHJ1ZVxyXG5cclxuICAgIC8vIGZldGNoIHBhcmVudFxyXG4gICAgY29uc3QgdGV4dCA9IHRoaXMucGFyZW50KClcclxuXHJcbiAgICAvLyBlYXJseSByZXR1cm4gaW4gY2FzZSB3ZSBhcmUgbm90IGluIGEgdGV4dCBlbGVtZW50XHJcbiAgICBpZiAoISh0ZXh0IGluc3RhbmNlb2YgVGV4dCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXNcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpID0gdGV4dC5pbmRleCh0aGlzKVxyXG5cclxuICAgIGNvbnN0IGZvbnRTaXplID0gZ2xvYmFscy53aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5vZGUpXHJcbiAgICAgIC5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxyXG4gICAgY29uc3QgZHkgPSB0ZXh0LmRvbS5sZWFkaW5nICogbmV3IFNWR051bWJlcihmb250U2l6ZSlcclxuXHJcbiAgICAvLyBhcHBseSBuZXcgcG9zaXRpb25cclxuICAgIHJldHVybiB0aGlzLmR5KGkgPyBkeSA6IDApLmF0dHIoJ3gnLCB0ZXh0LngoKSlcclxuICB9XG5cbiAgLy8gU2V0IHRleHQgY29udGVudFxyXG4gIHRleHQgKHRleHQpIHtcclxuICAgIGlmICh0ZXh0ID09IG51bGwpIHJldHVybiB0aGlzLm5vZGUudGV4dENvbnRlbnQgKyAodGhpcy5kb20ubmV3TGluZWQgPyAnXFxuJyA6ICcnKVxyXG5cclxuICAgIGlmICh0eXBlb2YgdGV4dCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICB0aGlzLmNsZWFyKCkuYnVpbGQodHJ1ZSlcclxuICAgICAgdGV4dC5jYWxsKHRoaXMsIHRoaXMpXHJcbiAgICAgIHRoaXMuYnVpbGQoZmFsc2UpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnBsYWluKHRleHQpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG59XHJcblxyXG5leHRlbmQoVHNwYW4sIHRleHRhYmxlKVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBUc3Bhbjoge1xyXG4gICAgdHNwYW46IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICh0ZXh0ID0gJycpIHtcclxuICAgICAgY29uc3QgdHNwYW4gPSBuZXcgVHNwYW4oKVxyXG5cclxuICAgICAgLy8gY2xlYXIgaWYgYnVpbGQgbW9kZSBpcyBkaXNhYmxlZFxyXG4gICAgICBpZiAoIXRoaXMuX2J1aWxkKSB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGFkZCBuZXcgdHNwYW5cclxuICAgICAgcmV0dXJuIHRoaXMucHV0KHRzcGFuKS50ZXh0KHRleHQpXHJcbiAgICB9KVxyXG4gIH0sXHJcbiAgVGV4dDoge1xyXG4gICAgbmV3TGluZTogZnVuY3Rpb24gKHRleHQgPSAnJykge1xyXG4gICAgICByZXR1cm4gdGhpcy50c3Bhbih0ZXh0KS5uZXdMaW5lKClcclxuICAgIH1cclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3RlcihUc3BhbiwgJ1RzcGFuJylcclxuIiwiaW1wb3J0IHsgY3gsIGN5LCBoZWlnaHQsIHdpZHRoLCB4LCB5IH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL2NpcmNsZWQuanMnXHJcbmltcG9ydCB7XHJcbiAgZXh0ZW5kLFxyXG4gIG5vZGVPck5ldyxcclxuICByZWdpc3RlcixcclxuICB3cmFwV2l0aEF0dHJDaGVja1xyXG59IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi4vdHlwZXMvU1ZHTnVtYmVyLmpzJ1xyXG5pbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmNsZSBleHRlbmRzIFNoYXBlIHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ2NpcmNsZScsIG5vZGUpLCBhdHRycylcclxuICB9XHJcblxyXG4gIHJhZGl1cyAocikge1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0cigncicsIHIpXHJcbiAgfVxyXG5cclxuICAvLyBSYWRpdXMgeCB2YWx1ZVxyXG4gIHJ4IChyeCkge1xyXG4gICAgcmV0dXJuIHRoaXMuYXR0cigncicsIHJ4KVxyXG4gIH1cclxuXHJcbiAgLy8gQWxpYXMgcmFkaXVzIHggdmFsdWVcclxuICByeSAocnkpIHtcclxuICAgIHJldHVybiB0aGlzLnJ4KHJ5KVxyXG4gIH1cclxuXHJcbiAgc2l6ZSAoc2l6ZSkge1xyXG4gICAgcmV0dXJuIHRoaXMucmFkaXVzKG5ldyBTVkdOdW1iZXIoc2l6ZSkuZGl2aWRlKDIpKVxyXG4gIH1cclxufVxyXG5cclxuZXh0ZW5kKENpcmNsZSwgeyB4LCB5LCBjeCwgY3ksIHdpZHRoLCBoZWlnaHQgfSlcclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgY2lyY2xlIGVsZW1lbnRcclxuICAgIGNpcmNsZTogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHNpemUgPSAwKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnB1dChuZXcgQ2lyY2xlKCkpXHJcbiAgICAgICAgLnNpemUoc2l6ZSlcclxuICAgICAgICAubW92ZSgwLCAwKVxyXG4gICAgfSlcclxuICB9XHJcbn0pXHJcblxyXG5yZWdpc3RlcihDaXJjbGUsICdDaXJjbGUnKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9Db250YWluZXIuanMnXHJcbmltcG9ydCBiYXNlRmluZCBmcm9tICcuLi9tb2R1bGVzL2NvcmUvc2VsZWN0b3IuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGlwUGF0aCBleHRlbmRzIENvbnRhaW5lciB7XHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCdjbGlwUGF0aCcsIG5vZGUpLCBhdHRycylcclxuICB9XHJcblxyXG4gIC8vIFVuY2xpcCBhbGwgY2xpcHBlZCBlbGVtZW50cyBhbmQgcmVtb3ZlIGl0c2VsZlxyXG4gIHJlbW92ZSAoKSB7XHJcbiAgICAvLyB1bmNsaXAgYWxsIHRhcmdldHNcclxuICAgIHRoaXMudGFyZ2V0cygpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGVsLnVuY2xpcCgpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIHJlbW92ZSBjbGlwUGF0aCBmcm9tIHBhcmVudFxyXG4gICAgcmV0dXJuIHN1cGVyLnJlbW92ZSgpXHJcbiAgfVxyXG5cclxuICB0YXJnZXRzICgpIHtcclxuICAgIHJldHVybiBiYXNlRmluZCgnc3ZnIFtjbGlwLXBhdGgqPVwiJyArIHRoaXMuaWQoKSArICdcIl0nKVxyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBDb250YWluZXI6IHtcclxuICAgIC8vIENyZWF0ZSBjbGlwcGluZyBlbGVtZW50XHJcbiAgICBjbGlwOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmRlZnMoKS5wdXQobmV3IENsaXBQYXRoKCkpXHJcbiAgICB9KVxyXG4gIH0sXHJcbiAgRWxlbWVudDoge1xyXG4gICAgLy8gRGlzdHJpYnV0ZSBjbGlwUGF0aCB0byBzdmcgZWxlbWVudFxyXG4gICAgY2xpcHBlciAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJlZmVyZW5jZSgnY2xpcC1wYXRoJylcclxuICAgIH0sXHJcblxyXG4gICAgY2xpcFdpdGggKGVsZW1lbnQpIHtcclxuICAgICAgLy8gdXNlIGdpdmVuIGNsaXAgb3IgY3JlYXRlIGEgbmV3IG9uZVxyXG4gICAgICBjb25zdCBjbGlwcGVyID0gZWxlbWVudCBpbnN0YW5jZW9mIENsaXBQYXRoXHJcbiAgICAgICAgPyBlbGVtZW50XHJcbiAgICAgICAgOiB0aGlzLnBhcmVudCgpLmNsaXAoKS5hZGQoZWxlbWVudClcclxuXHJcbiAgICAgIC8vIGFwcGx5IG1hc2tcclxuICAgICAgcmV0dXJuIHRoaXMuYXR0cignY2xpcC1wYXRoJywgJ3VybChcIiMnICsgY2xpcHBlci5pZCgpICsgJ1wiKScpXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFVuY2xpcCBlbGVtZW50XHJcbiAgICB1bmNsaXAgKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5hdHRyKCdjbGlwLXBhdGgnLCBudWxsKVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKENsaXBQYXRoLCAnQ2xpcFBhdGgnKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4vRWxlbWVudC5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcmVpZ25PYmplY3QgZXh0ZW5kcyBFbGVtZW50IHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ2ZvcmVpZ25PYmplY3QnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgZm9yZWlnbk9iamVjdDogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBGb3JlaWduT2JqZWN0KCkpLnNpemUod2lkdGgsIGhlaWdodClcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoRm9yZWlnbk9iamVjdCwgJ0ZvcmVpZ25PYmplY3QnKVxyXG4iLCJpbXBvcnQgTWF0cml4IGZyb20gJy4uLy4uL3R5cGVzL01hdHJpeC5qcydcbmltcG9ydCBQb2ludCBmcm9tICcuLi8uLi90eXBlcy9Qb2ludC5qcydcbmltcG9ydCB7IHByb3BvcnRpb25hbFNpemUgfSBmcm9tICcuLi8uLi91dGlscy91dGlscy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGRtb3ZlIChkeCwgZHkpIHtcbiAgdGhpcy5jaGlsZHJlbigpLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG5cbiAgICBsZXQgYmJveFxuXG4gICAgLy8gV2UgaGF2ZSB0byB3cmFwIHRoaXMgZm9yIGVsZW1lbnRzIHRoYXQgZG9udCBoYXZlIGEgYmJveFxuICAgIC8vIGUuZy4gdGl0bGUgYW5kIG90aGVyIGRlc2NyaXB0aXZlIGVsZW1lbnRzXG4gICAgdHJ5IHtcbiAgICAgIC8vIEdldCB0aGUgY2hpbGRzIGJib3hcbiAgICAgIGJib3ggPSBjaGlsZC5iYm94KClcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBHZXQgY2hpbGRzIG1hdHJpeFxuICAgIGNvbnN0IG0gPSBuZXcgTWF0cml4KGNoaWxkKVxuICAgIC8vIFRyYW5zbGF0ZSBjaGlsZHMgbWF0cml4IGJ5IGFtb3VudCBhbmRcbiAgICAvLyB0cmFuc2Zvcm0gaXQgYmFjayBpbnRvIHBhcmVudHMgc3BhY2VcbiAgICBjb25zdCBtYXRyaXggPSBtLnRyYW5zbGF0ZShkeCwgZHkpLnRyYW5zZm9ybShtLmludmVyc2UoKSlcbiAgICAvLyBDYWxjdWxhdGUgbmV3IHggYW5kIHkgZnJvbSBvbGQgYm94XG4gICAgY29uc3QgcCA9IG5ldyBQb2ludChiYm94LngsIGJib3gueSkudHJhbnNmb3JtKG1hdHJpeClcbiAgICAvLyBNb3ZlIGVsZW1lbnRcbiAgICBjaGlsZC5tb3ZlKHAueCwgcC55KVxuICB9KVxuXG4gIHJldHVybiB0aGlzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkeCAoZHgpIHtcbiAgcmV0dXJuIHRoaXMuZG1vdmUoZHgsIDApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkeSAoZHkpIHtcbiAgcmV0dXJuIHRoaXMuZG1vdmUoMCwgZHkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoZWlnaHQgKGhlaWdodCwgYm94ID0gdGhpcy5iYm94KCkpIHtcbiAgaWYgKGhlaWdodCA9PSBudWxsKSByZXR1cm4gYm94LmhlaWdodFxuICByZXR1cm4gdGhpcy5zaXplKGJveC53aWR0aCwgaGVpZ2h0LCBib3gpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlICh4ID0gMCwgeSA9IDAsIGJveCA9IHRoaXMuYmJveCgpKSB7XG4gIGNvbnN0IGR4ID0geCAtIGJveC54XG4gIGNvbnN0IGR5ID0geSAtIGJveC55XG5cbiAgcmV0dXJuIHRoaXMuZG1vdmUoZHgsIGR5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2l6ZSAod2lkdGgsIGhlaWdodCwgYm94ID0gdGhpcy5iYm94KCkpIHtcbiAgY29uc3QgcCA9IHByb3BvcnRpb25hbFNpemUodGhpcywgd2lkdGgsIGhlaWdodCwgYm94KVxuICBjb25zdCBzY2FsZVggPSBwLndpZHRoIC8gYm94LndpZHRoXG4gIGNvbnN0IHNjYWxlWSA9IHAuaGVpZ2h0IC8gYm94LmhlaWdodFxuXG4gIHRoaXMuY2hpbGRyZW4oKS5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgIGNvbnN0IG8gPSBuZXcgUG9pbnQoYm94KS50cmFuc2Zvcm0obmV3IE1hdHJpeChjaGlsZCkuaW52ZXJzZSgpKVxuICAgIGNoaWxkLnNjYWxlKHNjYWxlWCwgc2NhbGVZLCBvLngsIG8ueSlcbiAgfSlcblxuICByZXR1cm4gdGhpc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd2lkdGggKHdpZHRoLCBib3ggPSB0aGlzLmJib3goKSkge1xuICBpZiAod2lkdGggPT0gbnVsbCkgcmV0dXJuIGJveC53aWR0aFxuICByZXR1cm4gdGhpcy5zaXplKHdpZHRoLCBib3guaGVpZ2h0LCBib3gpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4ICh4LCBib3ggPSB0aGlzLmJib3goKSkge1xuICBpZiAoeCA9PSBudWxsKSByZXR1cm4gYm94LnhcbiAgcmV0dXJuIHRoaXMubW92ZSh4LCBib3gueSwgYm94KVxufVxuXG5leHBvcnQgZnVuY3Rpb24geSAoeSwgYm94ID0gdGhpcy5iYm94KCkpIHtcbiAgaWYgKHkgPT0gbnVsbCkgcmV0dXJuIGJveC55XG4gIHJldHVybiB0aGlzLm1vdmUoYm94LngsIHksIGJveClcbn1cbiIsImltcG9ydCB7IG5vZGVPck5ldywgcmVnaXN0ZXIsIHdyYXBXaXRoQXR0ckNoZWNrLCBleHRlbmQgfSBmcm9tICcuLi91dGlscy9hZG9wdGVyLmpzJ1xyXG5pbXBvcnQgeyByZWdpc3Rlck1ldGhvZHMgfSBmcm9tICcuLi91dGlscy9tZXRob2RzLmpzJ1xyXG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vQ29udGFpbmVyLmpzJ1xyXG5pbXBvcnQgKiBhcyBjb250YWluZXJHZW9tZXRyeSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvY29udGFpbmVyR2VvbWV0cnkuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ2cnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG59XHJcblxyXG5leHRlbmQoRywgY29udGFpbmVyR2VvbWV0cnkpXHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoe1xyXG4gIENvbnRhaW5lcjoge1xyXG4gICAgLy8gQ3JlYXRlIGEgZ3JvdXAgZWxlbWVudFxyXG4gICAgZ3JvdXA6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBHKCkpXHJcbiAgICB9KVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKEcsICdHJylcclxuIiwiaW1wb3J0IHsgbm9kZU9yTmV3LCByZWdpc3Rlciwgd3JhcFdpdGhBdHRyQ2hlY2ssIGV4dGVuZCB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCB7IHhsaW5rIH0gZnJvbSAnLi4vbW9kdWxlcy9jb3JlL25hbWVzcGFjZXMuanMnXHJcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9Db250YWluZXIuanMnXHJcbmltcG9ydCAqIGFzIGNvbnRhaW5lckdlb21ldHJ5IGZyb20gJy4uL21vZHVsZXMvY29yZS9jb250YWluZXJHZW9tZXRyeS5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEEgZXh0ZW5kcyBDb250YWluZXIge1xyXG4gIGNvbnN0cnVjdG9yIChub2RlLCBhdHRycyA9IG5vZGUpIHtcclxuICAgIHN1cGVyKG5vZGVPck5ldygnYScsIG5vZGUpLCBhdHRycylcclxuICB9XHJcblxyXG4gIC8vIExpbmsgdGFyZ2V0IGF0dHJpYnV0ZVxyXG4gIHRhcmdldCAodGFyZ2V0KSB7XHJcbiAgICByZXR1cm4gdGhpcy5hdHRyKCd0YXJnZXQnLCB0YXJnZXQpXHJcbiAgfVxyXG5cclxuICAvLyBMaW5rIHVybFxyXG4gIHRvICh1cmwpIHtcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnLCB1cmwsIHhsaW5rKVxyXG4gIH1cclxuXHJcbn1cclxuXHJcbmV4dGVuZChBLCBjb250YWluZXJHZW9tZXRyeSlcclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgYSBoeXBlcmxpbmsgZWxlbWVudFxyXG4gICAgbGluazogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHVybCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IEEoKSkudG8odXJsKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIEVsZW1lbnQ6IHtcclxuICAgIHVubGluayAoKSB7XHJcbiAgICAgIGNvbnN0IGxpbmsgPSB0aGlzLmxpbmtlcigpXHJcblxyXG4gICAgICBpZiAoIWxpbmspIHJldHVybiB0aGlzXHJcblxyXG4gICAgICBjb25zdCBwYXJlbnQgPSBsaW5rLnBhcmVudCgpXHJcblxyXG4gICAgICBpZiAoIXBhcmVudCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGluZGV4ID0gcGFyZW50LmluZGV4KGxpbmspXHJcbiAgICAgIHBhcmVudC5hZGQodGhpcywgaW5kZXgpXHJcblxyXG4gICAgICBsaW5rLnJlbW92ZSgpXHJcbiAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9LFxyXG4gICAgbGlua1RvICh1cmwpIHtcclxuICAgICAgLy8gcmV1c2Ugb2xkIGxpbmsgaWYgcG9zc2libGVcclxuICAgICAgbGV0IGxpbmsgPSB0aGlzLmxpbmtlcigpXHJcblxyXG4gICAgICBpZiAoIWxpbmspIHtcclxuICAgICAgICBsaW5rID0gbmV3IEEoKVxyXG4gICAgICAgIHRoaXMud3JhcChsaW5rKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAodHlwZW9mIHVybCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHVybC5jYWxsKGxpbmssIGxpbmspXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGluay50byh1cmwpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9LFxyXG4gICAgbGlua2VyICgpIHtcclxuICAgICAgY29uc3QgbGluayA9IHRoaXMucGFyZW50KClcclxuICAgICAgaWYgKGxpbmsgJiYgbGluay5ub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhJykge1xyXG4gICAgICAgIHJldHVybiBsaW5rXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBudWxsXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoQSwgJ0EnKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyLCB3cmFwV2l0aEF0dHJDaGVjayB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBDb250YWluZXIgZnJvbSAnLi9Db250YWluZXIuanMnXHJcbmltcG9ydCBiYXNlRmluZCBmcm9tICcuLi9tb2R1bGVzL2NvcmUvc2VsZWN0b3IuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXNrIGV4dGVuZHMgQ29udGFpbmVyIHtcclxuICAvLyBJbml0aWFsaXplIG5vZGVcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ21hc2snLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG5cclxuICAvLyBVbm1hc2sgYWxsIG1hc2tlZCBlbGVtZW50cyBhbmQgcmVtb3ZlIGl0c2VsZlxyXG4gIHJlbW92ZSAoKSB7XHJcbiAgICAvLyB1bm1hc2sgYWxsIHRhcmdldHNcclxuICAgIHRoaXMudGFyZ2V0cygpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgIGVsLnVubWFzaygpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIHJlbW92ZSBtYXNrIGZyb20gcGFyZW50XHJcbiAgICByZXR1cm4gc3VwZXIucmVtb3ZlKClcclxuICB9XHJcblxyXG4gIHRhcmdldHMgKCkge1xyXG4gICAgcmV0dXJuIGJhc2VGaW5kKCdzdmcgW21hc2sqPVwiJyArIHRoaXMuaWQoKSArICdcIl0nKVxyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBDb250YWluZXI6IHtcclxuICAgIG1hc2s6IHdyYXBXaXRoQXR0ckNoZWNrKGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZGVmcygpLnB1dChuZXcgTWFzaygpKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIEVsZW1lbnQ6IHtcclxuICAgIC8vIERpc3RyaWJ1dGUgbWFzayB0byBzdmcgZWxlbWVudFxyXG4gICAgbWFza2VyICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucmVmZXJlbmNlKCdtYXNrJylcclxuICAgIH0sXHJcblxyXG4gICAgbWFza1dpdGggKGVsZW1lbnQpIHtcclxuICAgICAgLy8gdXNlIGdpdmVuIG1hc2sgb3IgY3JlYXRlIGEgbmV3IG9uZVxyXG4gICAgICBjb25zdCBtYXNrZXIgPSBlbGVtZW50IGluc3RhbmNlb2YgTWFza1xyXG4gICAgICAgID8gZWxlbWVudFxyXG4gICAgICAgIDogdGhpcy5wYXJlbnQoKS5tYXNrKCkuYWRkKGVsZW1lbnQpXHJcblxyXG4gICAgICAvLyBhcHBseSBtYXNrXHJcbiAgICAgIHJldHVybiB0aGlzLmF0dHIoJ21hc2snLCAndXJsKFwiIycgKyBtYXNrZXIuaWQoKSArICdcIiknKVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBVbm1hc2sgZWxlbWVudFxyXG4gICAgdW5tYXNrICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuYXR0cignbWFzaycsIG51bGwpXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoTWFzaywgJ01hc2snKVxyXG4iLCJpbXBvcnQgeyBub2RlT3JOZXcsIHJlZ2lzdGVyIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IEVsZW1lbnQgZnJvbSAnLi9FbGVtZW50LmpzJ1xyXG5pbXBvcnQgU1ZHTnVtYmVyIGZyb20gJy4uL3R5cGVzL1NWR051bWJlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0b3AgZXh0ZW5kcyBFbGVtZW50IHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ3N0b3AnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG5cclxuICAvLyBhZGQgY29sb3Igc3RvcHNcclxuICB1cGRhdGUgKG8pIHtcclxuICAgIGlmICh0eXBlb2YgbyA9PT0gJ251bWJlcicgfHwgbyBpbnN0YW5jZW9mIFNWR051bWJlcikge1xyXG4gICAgICBvID0ge1xyXG4gICAgICAgIG9mZnNldDogYXJndW1lbnRzWzBdLFxyXG4gICAgICAgIGNvbG9yOiBhcmd1bWVudHNbMV0sXHJcbiAgICAgICAgb3BhY2l0eTogYXJndW1lbnRzWzJdXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBzZXQgYXR0cmlidXRlc1xyXG4gICAgaWYgKG8ub3BhY2l0eSAhPSBudWxsKSB0aGlzLmF0dHIoJ3N0b3Atb3BhY2l0eScsIG8ub3BhY2l0eSlcclxuICAgIGlmIChvLmNvbG9yICE9IG51bGwpIHRoaXMuYXR0cignc3RvcC1jb2xvcicsIG8uY29sb3IpXHJcbiAgICBpZiAoby5vZmZzZXQgIT0gbnVsbCkgdGhpcy5hdHRyKCdvZmZzZXQnLCBuZXcgU1ZHTnVtYmVyKG8ub2Zmc2V0KSlcclxuXHJcbiAgICByZXR1cm4gdGhpc1xyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBHcmFkaWVudDoge1xyXG4gICAgLy8gQWRkIGEgY29sb3Igc3RvcFxyXG4gICAgc3RvcDogZnVuY3Rpb24gKG9mZnNldCwgY29sb3IsIG9wYWNpdHkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMucHV0KG5ldyBTdG9wKCkpLnVwZGF0ZShvZmZzZXQsIGNvbG9yLCBvcGFjaXR5KVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuXHJcbnJlZ2lzdGVyKFN0b3AsICdTdG9wJylcclxuIiwiaW1wb3J0IHsgbm9kZU9yTmV3LCByZWdpc3RlciB9IGZyb20gJy4uL3V0aWxzL2Fkb3B0ZXIuanMnXHJcbmltcG9ydCB7IHJlZ2lzdGVyTWV0aG9kcyB9IGZyb20gJy4uL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCB7IHVuQ2FtZWxDYXNlIH0gZnJvbSAnLi4vdXRpbHMvdXRpbHMuanMnXHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4vRWxlbWVudC5qcydcclxuXHJcbmZ1bmN0aW9uIGNzc1J1bGUgKHNlbGVjdG9yLCBydWxlKSB7XHJcbiAgaWYgKCFzZWxlY3RvcikgcmV0dXJuICcnXHJcbiAgaWYgKCFydWxlKSByZXR1cm4gc2VsZWN0b3JcclxuXHJcbiAgbGV0IHJldCA9IHNlbGVjdG9yICsgJ3snXHJcblxyXG4gIGZvciAoY29uc3QgaSBpbiBydWxlKSB7XHJcbiAgICByZXQgKz0gdW5DYW1lbENhc2UoaSkgKyAnOicgKyBydWxlW2ldICsgJzsnXHJcbiAgfVxyXG5cclxuICByZXQgKz0gJ30nXHJcblxyXG4gIHJldHVybiByZXRcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3R5bGUgZXh0ZW5kcyBFbGVtZW50IHtcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ3N0eWxlJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgYWRkVGV4dCAodyA9ICcnKSB7XHJcbiAgICB0aGlzLm5vZGUudGV4dENvbnRlbnQgKz0gd1xyXG4gICAgcmV0dXJuIHRoaXNcclxuICB9XHJcblxyXG4gIGZvbnQgKG5hbWUsIHNyYywgcGFyYW1zID0ge30pIHtcclxuICAgIHJldHVybiB0aGlzLnJ1bGUoJ0Bmb250LWZhY2UnLCB7XHJcbiAgICAgIGZvbnRGYW1pbHk6IG5hbWUsXHJcbiAgICAgIHNyYzogc3JjLFxyXG4gICAgICAuLi5wYXJhbXNcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBydWxlIChzZWxlY3Rvciwgb2JqKSB7XHJcbiAgICByZXR1cm4gdGhpcy5hZGRUZXh0KGNzc1J1bGUoc2VsZWN0b3IsIG9iaikpXHJcbiAgfVxyXG59XHJcblxyXG5yZWdpc3Rlck1ldGhvZHMoJ0RvbScsIHtcclxuICBzdHlsZSAoc2VsZWN0b3IsIG9iaikge1xyXG4gICAgcmV0dXJuIHRoaXMucHV0KG5ldyBTdHlsZSgpKS5ydWxlKHNlbGVjdG9yLCBvYmopXHJcbiAgfSxcclxuICBmb250ZmFjZSAgKG5hbWUsIHNyYywgcGFyYW1zKSB7XHJcbiAgICByZXR1cm4gdGhpcy5wdXQobmV3IFN0eWxlKCkpLmZvbnQobmFtZSwgc3JjLCBwYXJhbXMpXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoU3R5bGUsICdTdHlsZScpXHJcbiIsImltcG9ydCB7IG5vZGVPck5ldywgcmVnaXN0ZXIsIHdyYXBXaXRoQXR0ckNoZWNrIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IHsgeGxpbmsgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvbmFtZXNwYWNlcy5qcydcclxuaW1wb3J0IFBhdGggZnJvbSAnLi9QYXRoLmpzJ1xyXG5pbXBvcnQgUGF0aEFycmF5IGZyb20gJy4uL3R5cGVzL1BhdGhBcnJheS5qcydcclxuaW1wb3J0IFRleHQgZnJvbSAnLi9UZXh0LmpzJ1xyXG5pbXBvcnQgYmFzZUZpbmQgZnJvbSAnLi4vbW9kdWxlcy9jb3JlL3NlbGVjdG9yLmpzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dFBhdGggZXh0ZW5kcyBUZXh0IHtcclxuICAvLyBJbml0aWFsaXplIG5vZGVcclxuICBjb25zdHJ1Y3RvciAobm9kZSwgYXR0cnMgPSBub2RlKSB7XHJcbiAgICBzdXBlcihub2RlT3JOZXcoJ3RleHRQYXRoJywgbm9kZSksIGF0dHJzKVxyXG4gIH1cclxuXHJcbiAgLy8gcmV0dXJuIHRoZSBhcnJheSBvZiB0aGUgcGF0aCB0cmFjayBlbGVtZW50XHJcbiAgYXJyYXkgKCkge1xyXG4gICAgY29uc3QgdHJhY2sgPSB0aGlzLnRyYWNrKClcclxuXHJcbiAgICByZXR1cm4gdHJhY2sgPyB0cmFjay5hcnJheSgpIDogbnVsbFxyXG4gIH1cclxuXHJcbiAgLy8gUGxvdCBwYXRoIGlmIGFueVxyXG4gIHBsb3QgKGQpIHtcclxuICAgIGNvbnN0IHRyYWNrID0gdGhpcy50cmFjaygpXHJcbiAgICBsZXQgcGF0aEFycmF5ID0gbnVsbFxyXG5cclxuICAgIGlmICh0cmFjaykge1xyXG4gICAgICBwYXRoQXJyYXkgPSB0cmFjay5wbG90KGQpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIChkID09IG51bGwpID8gcGF0aEFycmF5IDogdGhpc1xyXG4gIH1cclxuXHJcbiAgLy8gR2V0IHRoZSBwYXRoIGVsZW1lbnRcclxuICB0cmFjayAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWZlcmVuY2UoJ2hyZWYnKVxyXG4gIH1cclxufVxyXG5cclxucmVnaXN0ZXJNZXRob2RzKHtcclxuICBDb250YWluZXI6IHtcclxuICAgIHRleHRQYXRoOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAodGV4dCwgcGF0aCkge1xyXG4gICAgICAvLyBDb252ZXJ0IHRleHQgdG8gaW5zdGFuY2UgaWYgbmVlZGVkXHJcbiAgICAgIGlmICghKHRleHQgaW5zdGFuY2VvZiBUZXh0KSkge1xyXG4gICAgICAgIHRleHQgPSB0aGlzLnRleHQodGV4dClcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRleHQucGF0aChwYXRoKVxyXG4gICAgfSlcclxuICB9LFxyXG4gIFRleHQ6IHtcclxuICAgIC8vIENyZWF0ZSBwYXRoIGZvciB0ZXh0IHRvIHJ1biBvblxyXG4gICAgcGF0aDogd3JhcFdpdGhBdHRyQ2hlY2soZnVuY3Rpb24gKHRyYWNrLCBpbXBvcnROb2RlcyA9IHRydWUpIHtcclxuICAgICAgY29uc3QgdGV4dFBhdGggPSBuZXcgVGV4dFBhdGgoKVxyXG5cclxuICAgICAgLy8gaWYgdHJhY2sgaXMgYSBwYXRoLCByZXVzZSBpdFxyXG4gICAgICBpZiAoISh0cmFjayBpbnN0YW5jZW9mIFBhdGgpKSB7XHJcbiAgICAgICAgLy8gY3JlYXRlIHBhdGggZWxlbWVudFxyXG4gICAgICAgIHRyYWNrID0gdGhpcy5kZWZzKCkucGF0aCh0cmFjaylcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gbGluayB0ZXh0UGF0aCB0byBwYXRoIGFuZCBhZGQgY29udGVudFxyXG4gICAgICB0ZXh0UGF0aC5hdHRyKCdocmVmJywgJyMnICsgdHJhY2ssIHhsaW5rKVxyXG5cclxuICAgICAgLy8gVHJhbnNwbGFudCBhbGwgbm9kZXMgZnJvbSB0ZXh0IHRvIHRleHRQYXRoXHJcbiAgICAgIGxldCBub2RlXHJcbiAgICAgIGlmIChpbXBvcnROb2Rlcykge1xyXG4gICAgICAgIHdoaWxlICgobm9kZSA9IHRoaXMubm9kZS5maXJzdENoaWxkKSkge1xyXG4gICAgICAgICAgdGV4dFBhdGgubm9kZS5hcHBlbmRDaGlsZChub2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gYWRkIHRleHRQYXRoIGVsZW1lbnQgYXMgY2hpbGQgbm9kZSBhbmQgcmV0dXJuIHRleHRQYXRoXHJcbiAgICAgIHJldHVybiB0aGlzLnB1dCh0ZXh0UGF0aClcclxuICAgIH0pLFxyXG5cclxuICAgIC8vIEdldCB0aGUgdGV4dFBhdGggY2hpbGRyZW5cclxuICAgIHRleHRQYXRoICgpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuZmluZE9uZSgndGV4dFBhdGgnKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgUGF0aDoge1xyXG4gICAgLy8gY3JlYXRlcyBhIHRleHRQYXRoIGZyb20gdGhpcyBwYXRoXHJcbiAgICB0ZXh0OiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAvLyBDb252ZXJ0IHRleHQgdG8gaW5zdGFuY2UgaWYgbmVlZGVkXHJcbiAgICAgIGlmICghKHRleHQgaW5zdGFuY2VvZiBUZXh0KSkge1xyXG4gICAgICAgIHRleHQgPSBuZXcgVGV4dCgpLmFkZFRvKHRoaXMucGFyZW50KCkpLnRleHQodGV4dClcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gQ3JlYXRlIHRleHRQYXRoIGZyb20gdGV4dCBhbmQgcGF0aCBhbmQgcmV0dXJuXHJcbiAgICAgIHJldHVybiB0ZXh0LnBhdGgodGhpcylcclxuICAgIH0pLFxyXG5cclxuICAgIHRhcmdldHMgKCkge1xyXG4gICAgICByZXR1cm4gYmFzZUZpbmQoJ3N2ZyB0ZXh0UGF0aCcpLmZpbHRlcigobm9kZSkgPT4ge1xyXG4gICAgICAgIHJldHVybiAobm9kZS5hdHRyKCdocmVmJykgfHwgJycpLmluY2x1ZGVzKHRoaXMuaWQoKSlcclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIERvZXMgbm90IHdvcmsgaW4gSUUxMS4gVXNlIHdoZW4gSUUgc3VwcG9ydCBpcyBkcm9wcGVkXHJcbiAgICAgIC8vIHJldHVybiBiYXNlRmluZCgnc3ZnIHRleHRQYXRoWyp8aHJlZio9XCInICsgdGhpcy5pZCgpICsgJ1wiXScpXHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxuVGV4dFBhdGgucHJvdG90eXBlLk1vcnBoQXJyYXkgPSBQYXRoQXJyYXlcclxucmVnaXN0ZXIoVGV4dFBhdGgsICdUZXh0UGF0aCcpXHJcbiIsImltcG9ydCB7IG5vZGVPck5ldywgcmVnaXN0ZXIsIHdyYXBXaXRoQXR0ckNoZWNrIH0gZnJvbSAnLi4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgcmVnaXN0ZXJNZXRob2RzIH0gZnJvbSAnLi4vdXRpbHMvbWV0aG9kcy5qcydcclxuaW1wb3J0IHsgeGxpbmsgfSBmcm9tICcuLi9tb2R1bGVzL2NvcmUvbmFtZXNwYWNlcy5qcydcclxuaW1wb3J0IFNoYXBlIGZyb20gJy4vU2hhcGUuanMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2UgZXh0ZW5kcyBTaGFwZSB7XHJcbiAgY29uc3RydWN0b3IgKG5vZGUsIGF0dHJzID0gbm9kZSkge1xyXG4gICAgc3VwZXIobm9kZU9yTmV3KCd1c2UnLCBub2RlKSwgYXR0cnMpXHJcbiAgfVxyXG5cclxuICAvLyBVc2UgZWxlbWVudCBhcyBhIHJlZmVyZW5jZVxyXG4gIHVzZSAoZWxlbWVudCwgZmlsZSkge1xyXG4gICAgLy8gU2V0IGxpbmVkIGVsZW1lbnRcclxuICAgIHJldHVybiB0aGlzLmF0dHIoJ2hyZWYnLCAoZmlsZSB8fCAnJykgKyAnIycgKyBlbGVtZW50LCB4bGluaylcclxuICB9XHJcbn1cclxuXHJcbnJlZ2lzdGVyTWV0aG9kcyh7XHJcbiAgQ29udGFpbmVyOiB7XHJcbiAgICAvLyBDcmVhdGUgYSB1c2UgZWxlbWVudFxyXG4gICAgdXNlOiB3cmFwV2l0aEF0dHJDaGVjayhmdW5jdGlvbiAoZWxlbWVudCwgZmlsZSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5wdXQobmV3IFVzZSgpKS51c2UoZWxlbWVudCwgZmlsZSlcclxuICAgIH0pXHJcbiAgfVxyXG59KVxyXG5cclxucmVnaXN0ZXIoVXNlLCAnVXNlJylcclxuIiwiLyogT3B0aW9uYWwgTW9kdWxlcyAqL1xyXG5pbXBvcnQgJy4vbW9kdWxlcy9vcHRpb25hbC9hcnJhbmdlLmpzJ1xyXG5pbXBvcnQgJy4vbW9kdWxlcy9vcHRpb25hbC9jbGFzcy5qcydcclxuaW1wb3J0ICcuL21vZHVsZXMvb3B0aW9uYWwvY3NzLmpzJ1xyXG5pbXBvcnQgJy4vbW9kdWxlcy9vcHRpb25hbC9kYXRhLmpzJ1xyXG5pbXBvcnQgJy4vbW9kdWxlcy9vcHRpb25hbC9tZW1vcnkuanMnXHJcbmltcG9ydCAnLi9tb2R1bGVzL29wdGlvbmFsL3N1Z2FyLmpzJ1xyXG5pbXBvcnQgJy4vbW9kdWxlcy9vcHRpb25hbC90cmFuc2Zvcm0uanMnXHJcblxyXG5pbXBvcnQgeyBleHRlbmQsIG1ha2VJbnN0YW5jZSB9IGZyb20gJy4vdXRpbHMvYWRvcHRlci5qcydcclxuaW1wb3J0IHsgZ2V0TWV0aG9kTmFtZXMsIGdldE1ldGhvZHNGb3IgfSBmcm9tICcuL3V0aWxzL21ldGhvZHMuanMnXHJcbmltcG9ydCBCb3ggZnJvbSAnLi90eXBlcy9Cb3guanMnXHJcbmltcG9ydCBDb2xvciBmcm9tICcuL3R5cGVzL0NvbG9yLmpzJ1xyXG5pbXBvcnQgQ29udGFpbmVyIGZyb20gJy4vZWxlbWVudHMvQ29udGFpbmVyLmpzJ1xyXG5pbXBvcnQgRGVmcyBmcm9tICcuL2VsZW1lbnRzL0RlZnMuanMnXHJcbmltcG9ydCBEb20gZnJvbSAnLi9lbGVtZW50cy9Eb20uanMnXHJcbmltcG9ydCBFbGVtZW50IGZyb20gJy4vZWxlbWVudHMvRWxlbWVudC5qcydcclxuaW1wb3J0IEVsbGlwc2UgZnJvbSAnLi9lbGVtZW50cy9FbGxpcHNlLmpzJ1xyXG5pbXBvcnQgRXZlbnRUYXJnZXQgZnJvbSAnLi90eXBlcy9FdmVudFRhcmdldC5qcydcclxuaW1wb3J0IEZyYWdtZW50IGZyb20gJy4vZWxlbWVudHMvRnJhZ21lbnQuanMnXHJcbmltcG9ydCBHcmFkaWVudCBmcm9tICcuL2VsZW1lbnRzL0dyYWRpZW50LmpzJ1xyXG5pbXBvcnQgSW1hZ2UgZnJvbSAnLi9lbGVtZW50cy9JbWFnZS5qcydcclxuaW1wb3J0IExpbmUgZnJvbSAnLi9lbGVtZW50cy9MaW5lLmpzJ1xyXG5pbXBvcnQgTGlzdCBmcm9tICcuL3R5cGVzL0xpc3QuanMnXHJcbmltcG9ydCBNYXJrZXIgZnJvbSAnLi9lbGVtZW50cy9NYXJrZXIuanMnXHJcbmltcG9ydCBNYXRyaXggZnJvbSAnLi90eXBlcy9NYXRyaXguanMnXHJcbmltcG9ydCBNb3JwaGFibGUsIHtcclxuICBOb25Nb3JwaGFibGUsXHJcbiAgT2JqZWN0QmFnLFxyXG4gIFRyYW5zZm9ybUJhZyxcclxuICBtYWtlTW9ycGhhYmxlLFxyXG4gIHJlZ2lzdGVyTW9ycGhhYmxlVHlwZVxyXG59IGZyb20gJy4vYW5pbWF0aW9uL01vcnBoYWJsZS5qcydcclxuaW1wb3J0IFBhdGggZnJvbSAnLi9lbGVtZW50cy9QYXRoLmpzJ1xyXG5pbXBvcnQgUGF0aEFycmF5IGZyb20gJy4vdHlwZXMvUGF0aEFycmF5LmpzJ1xyXG5pbXBvcnQgUGF0dGVybiBmcm9tICcuL2VsZW1lbnRzL1BhdHRlcm4uanMnXHJcbmltcG9ydCBQb2ludEFycmF5IGZyb20gJy4vdHlwZXMvUG9pbnRBcnJheS5qcydcclxuaW1wb3J0IFBvbHlnb24gZnJvbSAnLi9lbGVtZW50cy9Qb2x5Z29uLmpzJ1xyXG5pbXBvcnQgUG9seWxpbmUgZnJvbSAnLi9lbGVtZW50cy9Qb2x5bGluZS5qcydcclxuaW1wb3J0IFJlY3QgZnJvbSAnLi9lbGVtZW50cy9SZWN0LmpzJ1xyXG5pbXBvcnQgUnVubmVyIGZyb20gJy4vYW5pbWF0aW9uL1J1bm5lci5qcydcclxuaW1wb3J0IFNWR0FycmF5IGZyb20gJy4vdHlwZXMvU1ZHQXJyYXkuanMnXHJcbmltcG9ydCBTVkdOdW1iZXIgZnJvbSAnLi90eXBlcy9TVkdOdW1iZXIuanMnXHJcbmltcG9ydCBTaGFwZSBmcm9tICcuL2VsZW1lbnRzL1NoYXBlLmpzJ1xyXG5pbXBvcnQgU3ZnIGZyb20gJy4vZWxlbWVudHMvU3ZnLmpzJ1xyXG5pbXBvcnQgU3ltYm9sIGZyb20gJy4vZWxlbWVudHMvU3ltYm9sLmpzJ1xyXG5pbXBvcnQgVGV4dCBmcm9tICcuL2VsZW1lbnRzL1RleHQuanMnXHJcbmltcG9ydCBUc3BhbiBmcm9tICcuL2VsZW1lbnRzL1RzcGFuLmpzJ1xyXG5pbXBvcnQgKiBhcyBkZWZhdWx0cyBmcm9tICcuL21vZHVsZXMvY29yZS9kZWZhdWx0cy5qcydcclxuaW1wb3J0ICogYXMgdXRpbHMgZnJvbSAnLi91dGlscy91dGlscy5qcydcclxuaW1wb3J0ICogYXMgbmFtZXNwYWNlcyBmcm9tICcuL21vZHVsZXMvY29yZS9uYW1lc3BhY2VzLmpzJ1xyXG5pbXBvcnQgKiBhcyByZWdleCBmcm9tICcuL21vZHVsZXMvY29yZS9yZWdleC5qcydcclxuXHJcbmV4cG9ydCB7XHJcbiAgTW9ycGhhYmxlLFxyXG4gIHJlZ2lzdGVyTW9ycGhhYmxlVHlwZSxcclxuICBtYWtlTW9ycGhhYmxlLFxyXG4gIFRyYW5zZm9ybUJhZyxcclxuICBPYmplY3RCYWcsXHJcbiAgTm9uTW9ycGhhYmxlXHJcbn1cclxuXHJcbmV4cG9ydCB7IGRlZmF1bHRzLCB1dGlscywgbmFtZXNwYWNlcywgcmVnZXggfVxyXG5leHBvcnQgY29uc3QgU1ZHID0gbWFrZUluc3RhbmNlXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgcGFyc2VyIH0gZnJvbSAnLi9tb2R1bGVzL2NvcmUvcGFyc2VyLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIGZpbmQgfSBmcm9tICcuL21vZHVsZXMvY29yZS9zZWxlY3Rvci5qcydcclxuZXhwb3J0ICogZnJvbSAnLi9tb2R1bGVzL2NvcmUvZXZlbnQuanMnXHJcbmV4cG9ydCAqIGZyb20gJy4vdXRpbHMvYWRvcHRlci5qcydcclxuZXhwb3J0IHtcclxuICBnZXRXaW5kb3csXHJcbiAgcmVnaXN0ZXJXaW5kb3csXHJcbiAgcmVzdG9yZVdpbmRvdyxcclxuICBzYXZlV2luZG93LFxyXG4gIHdpdGhXaW5kb3dcclxufSBmcm9tICcuL3V0aWxzL3dpbmRvdy5qcydcclxuXHJcbi8qIEFuaW1hdGlvbiBNb2R1bGVzICovXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQW5pbWF0b3IgfSBmcm9tICcuL2FuaW1hdGlvbi9BbmltYXRvci5qcydcclxuZXhwb3J0IHsgQ29udHJvbGxlciwgRWFzZSwgUElELCBTcHJpbmcsIGVhc2luZyB9IGZyb20gJy4vYW5pbWF0aW9uL0NvbnRyb2xsZXIuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUXVldWUgfSBmcm9tICcuL2FuaW1hdGlvbi9RdWV1ZS5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBSdW5uZXIgfSBmcm9tICcuL2FuaW1hdGlvbi9SdW5uZXIuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGltZWxpbmUgfSBmcm9tICcuL2FuaW1hdGlvbi9UaW1lbGluZS5qcydcclxuXHJcbi8qIFR5cGVzICovXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXJyYXkgfSBmcm9tICcuL3R5cGVzL1NWR0FycmF5LmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEJveCB9IGZyb20gJy4vdHlwZXMvQm94LmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbG9yIH0gZnJvbSAnLi90eXBlcy9Db2xvci5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBFdmVudFRhcmdldCB9IGZyb20gJy4vdHlwZXMvRXZlbnRUYXJnZXQuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWF0cml4IH0gZnJvbSAnLi90eXBlcy9NYXRyaXguanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTnVtYmVyIH0gZnJvbSAnLi90eXBlcy9TVkdOdW1iZXIuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUGF0aEFycmF5IH0gZnJvbSAnLi90eXBlcy9QYXRoQXJyYXkuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUG9pbnQgfSBmcm9tICcuL3R5cGVzL1BvaW50LmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBvaW50QXJyYXkgfSBmcm9tICcuL3R5cGVzL1BvaW50QXJyYXkuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTGlzdCB9IGZyb20gJy4vdHlwZXMvTGlzdC5qcydcclxuXHJcbi8qIEVsZW1lbnRzICovXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ2lyY2xlIH0gZnJvbSAnLi9lbGVtZW50cy9DaXJjbGUuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgQ2xpcFBhdGggfSBmcm9tICcuL2VsZW1lbnRzL0NsaXBQYXRoLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIENvbnRhaW5lciB9IGZyb20gJy4vZWxlbWVudHMvQ29udGFpbmVyLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIERlZnMgfSBmcm9tICcuL2VsZW1lbnRzL0RlZnMuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRG9tIH0gZnJvbSAnLi9lbGVtZW50cy9Eb20uanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRWxlbWVudCB9IGZyb20gJy4vZWxlbWVudHMvRWxlbWVudC5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBFbGxpcHNlIH0gZnJvbSAnLi9lbGVtZW50cy9FbGxpcHNlLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEZvcmVpZ25PYmplY3QgfSBmcm9tICcuL2VsZW1lbnRzL0ZvcmVpZ25PYmplY3QuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgRnJhZ21lbnQgfSBmcm9tICcuL2VsZW1lbnRzL0ZyYWdtZW50LmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEdyYWRpZW50IH0gZnJvbSAnLi9lbGVtZW50cy9HcmFkaWVudC5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBHIH0gZnJvbSAnLi9lbGVtZW50cy9HLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIEEgfSBmcm9tICcuL2VsZW1lbnRzL0EuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgSW1hZ2UgfSBmcm9tICcuL2VsZW1lbnRzL0ltYWdlLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIExpbmUgfSBmcm9tICcuL2VsZW1lbnRzL0xpbmUuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWFya2VyIH0gZnJvbSAnLi9lbGVtZW50cy9NYXJrZXIuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgTWFzayB9IGZyb20gJy4vZWxlbWVudHMvTWFzay5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBQYXRoIH0gZnJvbSAnLi9lbGVtZW50cy9QYXRoLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFBhdHRlcm4gfSBmcm9tICcuL2VsZW1lbnRzL1BhdHRlcm4uanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUG9seWdvbiB9IGZyb20gJy4vZWxlbWVudHMvUG9seWdvbi5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBQb2x5bGluZSB9IGZyb20gJy4vZWxlbWVudHMvUG9seWxpbmUuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgUmVjdCB9IGZyb20gJy4vZWxlbWVudHMvUmVjdC5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBTaGFwZSB9IGZyb20gJy4vZWxlbWVudHMvU2hhcGUuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3RvcCB9IGZyb20gJy4vZWxlbWVudHMvU3RvcC5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBTdHlsZSB9IGZyb20gJy4vZWxlbWVudHMvU3R5bGUuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3ZnIH0gZnJvbSAnLi9lbGVtZW50cy9TdmcuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgU3ltYm9sIH0gZnJvbSAnLi9lbGVtZW50cy9TeW1ib2wuanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVGV4dCB9IGZyb20gJy4vZWxlbWVudHMvVGV4dC5qcydcclxuZXhwb3J0IHsgZGVmYXVsdCBhcyBUZXh0UGF0aCB9IGZyb20gJy4vZWxlbWVudHMvVGV4dFBhdGguanMnXHJcbmV4cG9ydCB7IGRlZmF1bHQgYXMgVHNwYW4gfSBmcm9tICcuL2VsZW1lbnRzL1RzcGFuLmpzJ1xyXG5leHBvcnQgeyBkZWZhdWx0IGFzIFVzZSB9IGZyb20gJy4vZWxlbWVudHMvVXNlLmpzJ1xyXG5cclxuZXh0ZW5kKFtcclxuICBTdmcsXHJcbiAgU3ltYm9sLFxyXG4gIEltYWdlLFxyXG4gIFBhdHRlcm4sXHJcbiAgTWFya2VyXHJcbl0sIGdldE1ldGhvZHNGb3IoJ3ZpZXdib3gnKSlcclxuXHJcbmV4dGVuZChbXHJcbiAgTGluZSxcclxuICBQb2x5bGluZSxcclxuICBQb2x5Z29uLFxyXG4gIFBhdGhcclxuXSwgZ2V0TWV0aG9kc0ZvcignbWFya2VyJykpXHJcblxyXG5leHRlbmQoVGV4dCwgZ2V0TWV0aG9kc0ZvcignVGV4dCcpKVxyXG5leHRlbmQoUGF0aCwgZ2V0TWV0aG9kc0ZvcignUGF0aCcpKVxyXG5cclxuZXh0ZW5kKERlZnMsIGdldE1ldGhvZHNGb3IoJ0RlZnMnKSlcclxuXHJcbmV4dGVuZChbXHJcbiAgVGV4dCxcclxuICBUc3BhblxyXG5dLCBnZXRNZXRob2RzRm9yKCdUc3BhbicpKVxyXG5cclxuZXh0ZW5kKFtcclxuICBSZWN0LFxyXG4gIEVsbGlwc2UsXHJcbiAgR3JhZGllbnQsXHJcbiAgUnVubmVyXHJcbl0sIGdldE1ldGhvZHNGb3IoJ3JhZGl1cycpKVxyXG5cclxuZXh0ZW5kKEV2ZW50VGFyZ2V0LCBnZXRNZXRob2RzRm9yKCdFdmVudFRhcmdldCcpKVxyXG5leHRlbmQoRG9tLCBnZXRNZXRob2RzRm9yKCdEb20nKSlcclxuZXh0ZW5kKEVsZW1lbnQsIGdldE1ldGhvZHNGb3IoJ0VsZW1lbnQnKSlcclxuZXh0ZW5kKFNoYXBlLCBnZXRNZXRob2RzRm9yKCdTaGFwZScpKVxyXG5leHRlbmQoWyBDb250YWluZXIsIEZyYWdtZW50IF0sIGdldE1ldGhvZHNGb3IoJ0NvbnRhaW5lcicpKVxyXG5leHRlbmQoR3JhZGllbnQsIGdldE1ldGhvZHNGb3IoJ0dyYWRpZW50JykpXHJcblxyXG5leHRlbmQoUnVubmVyLCBnZXRNZXRob2RzRm9yKCdSdW5uZXInKSlcclxuXHJcbkxpc3QuZXh0ZW5kKGdldE1ldGhvZE5hbWVzKCkpXHJcblxyXG5yZWdpc3Rlck1vcnBoYWJsZVR5cGUoW1xyXG4gIFNWR051bWJlcixcclxuICBDb2xvcixcclxuICBCb3gsXHJcbiAgTWF0cml4LFxyXG4gIFNWR0FycmF5LFxyXG4gIFBvaW50QXJyYXksXHJcbiAgUGF0aEFycmF5XHJcbl0pXHJcblxyXG5tYWtlTW9ycGhhYmxlKClcclxuIiwiaWYgKCFFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzKSB7XG4gICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9IEVsZW1lbnQucHJvdG90eXBlWydtc01hdGNoZXNTZWxlY3RvciddO1xufVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29udGV4dE1lbnUge1xuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGl0ZW1zLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQgaW5zdGFuY2VvZiBBcnJheSA/IGVsZW1lbnQgOiBbZWxlbWVudF07XG4gICAgICAgIHRoaXMuaXRlbXMgPSBpdGVtcztcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA/IG9wdGlvbnMgOiB7fTtcbiAgICAgICAgdGhpcy5pZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnQuaW5kZXhPZihlLnRhcmdldCkgPj0gMCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLm9uU2hvdykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnMub25TaG93KGUsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVsZW1lbnQubWFwKChlbG0pID0+IGVsbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAzKVxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH1cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMubWVudSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgICAgIHRoaXMubWVudS5jbGFzc05hbWUgPSAnY29udGV4dC1tZW51JztcbiAgICAgICAgdGhpcy5tZW51LnNldEF0dHJpYnV0ZSgnZGF0YS1jb250ZXh0bWVudScsIHRoaXMuaWQpO1xuICAgICAgICB0aGlzLm1lbnUuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcbiAgICAgICAgdGhpcy5tZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUZvY3VzKC0xKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlRm9jdXMoMSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMubWluaW1hbFN0eWxpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuY2xhc3NMaXN0LmFkZCgnY29udGV4dC1tZW51LS10aGVtZS1kZWZhdWx0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3B0aW9ucy5jbGFzc05hbWUuc3BsaXQoJyAnKS5mb3JFYWNoKChjbHMpID0+IHRoaXMubWVudS5jbGFzc0xpc3QuYWRkKGNscykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXRlbXMuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgIGlmICghKCduYW1lJyBpbiBpdGVtKSkge1xuICAgICAgICAgICAgICAgIGxpLmNsYXNzTmFtZSA9ICdjb250ZXh0LW1lbnUtZGl2aWRlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaS5jbGFzc05hbWUgPSAnY29udGV4dC1tZW51LWl0ZW0nO1xuICAgICAgICAgICAgICAgIGxpLnRleHRDb250ZW50ID0gaXRlbS5uYW1lO1xuICAgICAgICAgICAgICAgIGxpLnNldEF0dHJpYnV0ZSgnZGF0YS1jb250ZXh0bWVudWl0ZW0nLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgbGkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICcwJyk7XG4gICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNlbGVjdC5iaW5kKHRoaXMsIGxpKSk7XG4gICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0KGxpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tZW51LmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5tZW51KTtcbiAgICB9XG4gICAgc2hvdyhlKSB7XG4gICAgICAgIGlmICh3aW5kb3dbJ2Rpc2FibGVDb250ZXh0TWVudSddKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHsgeDogZS5wYWdlWCwgeTogZS5wYWdlWSB9O1xuICAgICAgICB0aGlzLm1lbnUuc3R5bGUubGVmdCA9IGAke2UucGFnZVh9cHhgO1xuICAgICAgICB0aGlzLm1lbnUuc3R5bGUudG9wID0gYCR7ZS5wYWdlWX1weGA7XG4gICAgICAgIHRoaXMubWVudS5jbGFzc0xpc3QuYWRkKCdpcy1vcGVuJyk7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIHRoaXMubWVudS5mb2N1cygpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMubWVudS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcbiAgICB9XG4gICAgc2VsZWN0KGl0ZW0pIHtcbiAgICAgICAgY29uc3QgaXRlbUlkID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29udGV4dG1lbnVpdGVtJyk7XG4gICAgICAgIGlmICh0aGlzLml0ZW1zW2l0ZW1JZF0gJiYgdGhpcy5pdGVtc1tpdGVtSWRdLmNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2l0ZW1JZF0uY2FsbGJhY2sodGhpcy50YXJnZXQsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cbiAgICBtb3ZlRm9jdXMoZGlyZWN0aW9uID0gMSkge1xuICAgICAgICBjb25zdCBmb2N1c2VkID0gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvbnRleHRtZW51aXRlbV06Zm9jdXMnKTtcbiAgICAgICAgbGV0IG5leHQ7XG4gICAgICAgIGlmIChmb2N1c2VkKSB7XG4gICAgICAgICAgICBuZXh0ID0gdGhpcy5nZXRTaWJsaW5nKGZvY3VzZWQsICdbZGF0YS1jb250ZXh0bWVudWl0ZW1dJywgZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIW5leHQpIHtcbiAgICAgICAgICAgIG5leHQgPSBkaXJlY3Rpb24gPiAwID8gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWNvbnRleHRtZW51aXRlbV06Zmlyc3QtY2hpbGQnKSA6IHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKCdbZGF0YS1jb250ZXh0bWVudWl0ZW1dOmxhc3QtY2hpbGQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmV4dClcbiAgICAgICAgICAgIG5leHQuZm9jdXMoKTtcbiAgICB9XG4gICAgZ2V0U2libGluZyhlbCwgc2VsZWN0b3IsIGRpcmVjdGlvbiA9IDEpIHtcbiAgICAgICAgY29uc3Qgc2libGluZyA9IGRpcmVjdGlvbiA+IDAgPyBlbC5uZXh0RWxlbWVudFNpYmxpbmcgOiBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xuICAgICAgICBpZiAoIXNpYmxpbmcgfHwgc2libGluZy5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U2libGluZyhzaWJsaW5nLCBzZWxlY3RvciwgZGlyZWN0aW9uKTtcbiAgICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBUb29sYmFyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZm9ybS10b29sYmFyJyk7XG4gICAgfVxuICAgIHVwZGF0ZShpdGVtcykge1xuICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgaXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgbGlbJ3Rvb2xiYXJEYXRhJ10gPSBpdGVtO1xuICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaXRlbS5uYW1lO1xuICAgICAgICAgICAgdGhpcy5saXN0LmFwcGVuZENoaWxkKGxpKTtcbiAgICAgICAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBpdGVtLmNhbGxiYWNrKGxpWyd0b29sYmFyRGF0YSddLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMubGlzdCk7XG4gICAgICAgIHRoaXMuc2hvdygpO1xuICAgIH1cbiAgICBzaG93KCkge1xuICAgICAgICBpZiAoIXRoaXMuY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB9XG59XG4iLCJmdW5jdGlvbiBkaXNwYXRjaEhhc2hjaGFuZ2UoKSB7XG4gICAgaWYgKHR5cGVvZiBIYXNoQ2hhbmdlRXZlbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBIYXNoQ2hhbmdlRXZlbnQoJ2hhc2hjaGFuZ2UnKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdoYXNoY2hhbmdlJykpO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgaWVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgICAgICBpZUV2ZW50LmluaXRFdmVudCgnaGFzaGNoYW5nZScsIHRydWUsIHRydWUpO1xuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChpZUV2ZW50KTtcbiAgICB9XG59XG5jbGFzcyBQb3B1cCB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgbmFtZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaXNDbG9zYWJsZSA9IGZhbHNlO1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3BvcHVwJykpIHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMud3JhcChbdGhpcy5lbGVtZW50XSk7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncG9wdXAnKTtcbiAgICAgICAgICAgIGlmIChuYW1lKVxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKGBwb3B1cC0ke25hbWV9YCk7XG4gICAgICAgICAgICBpc0Nsb3NhYmxlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xvc2FibGUnKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5uZXJFbGVtZW50cyA9IFtdLm1hcC5jYWxsKHRoaXMuZWxlbWVudC5jaGlsZHJlbiwgKGNoaWxkKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hpbGQgJiYgY2hpbGQudGFnTmFtZSA9PSAnQScgJiYgY2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjbG9zZS1wb3B1cCcpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGUgPSBjaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkICYmIGNoaWxkLnRhZ05hbWUgPT0gJ0RJVicgJiYgY2hpbGQuY2xhc3NMaXN0LmNvbnRhaW5zKCdjb250ZW50JykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRFbGVtZW50ID0gY2hpbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdGhpcy5oYW5kbGUpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGUuaW5uZXJIVE1MID0gJyZ0aW1lczsnO1xuICAgICAgICAgICAgdGhpcy5oYW5kbGUuY2xhc3NMaXN0LmFkZCgnY2xvc2UtcG9wdXAnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuY29udGVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudEVsZW1lbnQgPSB0aGlzLndyYXAoaW5uZXJFbGVtZW50cyk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2NvbnRlbnQnKTtcbiAgICAgICAgICAgIGxldCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2lubmVyLWNvbnRlbnQnKTtcbiAgICAgICAgICAgIHdyYXBwZXIuYXBwZW5kQ2hpbGQodGhpcy5jb250ZW50RWxlbWVudCk7XG4gICAgICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKHRoaXMuaGFuZGxlKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh3cmFwcGVyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNDbG9zYWJsZSkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuc3RvcFByb3BhZ2F0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIyEnO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnIyEnO1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhbGxvd1Byb3BhZ2F0aW9uKCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5zdG9wUHJvcGFnYXRpb24pO1xuICAgIH1cbiAgICBzdG9wUHJvcGFnYXRpb24oZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIGxldCBpZnJhbWVzID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lmcmFtZScpO1xuICAgICAgICBpZiAoaWZyYW1lcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChpZnJhbWVzLCAoaWZyYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHNyYyA9IGlmcmFtZS5zcmM7XG4gICAgICAgICAgICAgICAgaWZyYW1lLnNyYyA9ICcnO1xuICAgICAgICAgICAgICAgIGlmcmFtZS5zcmMgPSBzcmM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgc2V0TG9hZGluZyhsb2FkaW5nKSB7XG4gICAgICAgIGlmIChsb2FkaW5nKVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICB9XG4gICAgd3JhcChlbHMpIHtcbiAgICAgICAgbGV0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgW10uZm9yRWFjaC5jYWxsKGVscywgKGVsKSA9PiB7XG4gICAgICAgICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB3cmFwcGVyO1xuICAgIH1cbn1cbmNsYXNzIFBvcHVwQ29sbGVjdGlvbiB7XG4gICAgY29uc3RydWN0b3IoZWxlbWVudHMpIHtcbiAgICAgICAgdGhpcy5wb3B1cHMgPSB7fTtcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IHRoaXMuaXNTdHJpbmcoZWxlbWVudHMpID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChlbGVtZW50cykgOiBlbGVtZW50cztcbiAgICAgICAgdGhpcy5vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnU1BBTicpO1xuICAgICAgICB0aGlzLm92ZXJsYXkuY2xhc3NMaXN0LmFkZCgncG9wdXAtb3ZlcmxheScpO1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50cyAmJiB0aGlzLmVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXkpO1xuICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuZWxlbWVudHMsIChjaGlsZCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gY2hpbGQuZ2V0QXR0cmlidXRlKCdkYXRhLXBvcHVwJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignUG9wdXAgbXVzdCBoYXZlIGEgZGF0YS1wb3B1cD1cIl9OQU1FX1wiIGF0dHJpYnV0ZScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXBzW25hbWVdID0gbmV3IFBvcHVwKGNoaWxkLCBuYW1lKTtcbiAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtcG9wdXAnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5pbmRleE9mKCcjIScpID09IDApIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoID8gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIyEnLCAnJykuc3BsaXQoJy8nKSA6IFtdO1xuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICBpZiAoaGFzaFswXSA9PSAncG9wdXAnKSB7XG4gICAgICAgICAgICAgICAgbGV0IGNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzaFsxXSAmJiBoYXNoWzFdICE9ICcnICYmIHRoaXMucG9wdXBzW2hhc2hbMV1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dPdmVybGF5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wb3B1cHNbaGFzaFsxXV0uc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5oaWRlT3ZlcmxheSgpO1xuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaC5pbmRleE9mKCcjIXBvcHVwJykgPj0gMCkge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoSGFzaGNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgc2hvd092ZXJsYXkoKSB7XG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCdwb3B1cC1hY3RpdmUnKTtcbiAgICAgICAgdGhpcy5vdmVybGF5LmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuICAgICAgICB0aGlzLm92ZXJsYXkuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgfVxuICAgIGhpZGVPdmVybGF5KCkge1xuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3ZlcmxheS5hZGRFdmVudExpc3RlbmVyKCd0cmFuc2l0aW9uZW5kJywgKGUpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncG9wdXAtYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGNhcHR1cmU6IGZhbHNlLFxuICAgICAgICAgICAgb25jZTogdHJ1ZSxcbiAgICAgICAgICAgIHBhc3NpdmU6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5vdmVybGF5LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgncG9wdXAtYWN0aXZlJyk7XG4gICAgICAgICAgICB0aGlzLm92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm92ZXJsYXkuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuICAgIGhpZGUoKSB7XG4gICAgICAgIGZvciAobGV0IGtleSBpbiB0aGlzLnBvcHVwcykge1xuICAgICAgICAgICAgaWYgKHRoaXMucG9wdXBzLmhhc093blByb3BlcnR5KGtleSkgJiYgdGhpcy5wb3B1cHNba2V5XSBpbnN0YW5jZW9mIFBvcHVwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cHNba2V5XS5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgaXNTdHJpbmcodikge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdzdHJpbmcnIHx8IHYgaW5zdGFuY2VvZiBTdHJpbmc7XG4gICAgfVxufVxuZXhwb3J0IHsgUG9wdXBDb2xsZWN0aW9uLCBQb3B1cCB9O1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9zaXRpb25EYXRhIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhID0gW10pIHtcbiAgICAgICAgdGhpcy5kYXRhID0gW107XG4gICAgICAgIHRoaXMuY29ubmVjdGlvbnMgPSBbXTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5idG4tZGF0YScpO1xuICAgICAgICBpZiAoYnRuKVxuICAgICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByaW50RGF0YSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIGFkZERlcGFydG1lbnQoeCwgeSwgdGV4dCA9IHt9LCBpY29uID0ge30sIGxpbmsgPSB7fSkge1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkKCk7XG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKHsgdHlwZTogJ2RlcGFydG1lbnQnLCB4LCB5LCBpZCwgdGV4dCwgaWNvbiwgbGluayB9KTtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH1cbiAgICB1cGRhdGVEZXBhcnRtZW50VGV4dChpZCwgdGV4dCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEubWFwKChjKSA9PiB7XG4gICAgICAgICAgICBpZiAoYy5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgIGMudGV4dCA9IHRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB1cGRhdGVEZXBhcnRtZW50SW1hZ2UoaWQsIGltYWdlKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YS5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgIGlmIChjLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgYy5pY29uID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB1cGRhdGVEZXBhcnRtZW50TGluayhpZCwgbGluaykge1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEubWFwKChjKSA9PiB7XG4gICAgICAgICAgICBpZiAoYy5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgIGMubGluayA9IGxpbms7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZW1vdmVEZXBhcnRtZW50KGlkKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YS5maWx0ZXIoKGl0ZW0pID0+IGlkICE9IGl0ZW0uaWQpO1xuICAgICAgICB0aGlzLnJlbW92ZUNvbm5lY3Rpb24oaWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYWRkQ2lyY2xlKHgsIHkpIHtcbiAgICAgICAgbGV0IGlkID0gdGhpcy5pZCgpO1xuICAgICAgICB0aGlzLmRhdGEucHVzaCh7IHR5cGU6ICdjaXJjbGUnLCB4OiB4LCB5OiB5LCBpZDogaWQgfSk7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICB9XG4gICAgdXBkYXRlQ2lyY2xlKGlkLCB4LCB5KSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YS5tYXAoKGMpID0+IHtcbiAgICAgICAgICAgIGlmIChjLmlkID09IGlkKSB7XG4gICAgICAgICAgICAgICAgYy54ID0geDtcbiAgICAgICAgICAgICAgICBjLnkgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGM7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmVtb3ZlQ2lyY2xlKGlkKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YS5maWx0ZXIoKGl0ZW0pID0+IGlkICE9IGl0ZW0uaWQpO1xuICAgICAgICB0aGlzLnJlbW92ZUNvbm5lY3Rpb24oaWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0Q2lyY2xlKGlkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldCgnY2lyY2xlJywgaWQpO1xuICAgIH1cbiAgICBnZXQodHlwZSwgaWQpIHtcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGEuZmlsdGVyKChpdGVtKSA9PiB0eXBlID09IGl0ZW0udHlwZSAmJiBpZCA9PSBpdGVtLmlkKTtcbiAgICAgICAgcmV0dXJuIGRhdGEgJiYgZGF0YS5sZW5ndGggPyBkYXRhWzBdIDogbnVsbDtcbiAgICB9XG4gICAgZ2V0QWxsKHR5cGUgPSBmYWxzZSkge1xuICAgICAgICBpZiAoIXR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmRhdGEuZmlsdGVyKChpdGVtKSA9PiB0eXBlID09IGl0ZW0udHlwZSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBhZGRMaW5lKHBvaW50cykge1xuICAgICAgICBsZXQgaWQgPSB0aGlzLmlkKCk7XG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKHsgdHlwZTogJ2xpbmUnLCBwb2ludHMsIGlkOiBpZCB9KTtcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgIH1cbiAgICBzYXZlTGluZShpZCwgcG9pbnRzKSB7XG4gICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEubWFwKChjKSA9PiB7XG4gICAgICAgICAgICBpZiAoYy5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgIGMucG9pbnRzID0gcG9pbnRzO1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhLnB1c2goeyB0eXBlOiAnbGluZScsIHBvaW50cywgaWQ6IGlkIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZW1vdmVMaW5lKGlkKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YS5maWx0ZXIoKGl0ZW0pID0+IGlkICE9IGl0ZW0uaWQpO1xuICAgICAgICB0aGlzLnJlbW92ZUNvbm5lY3Rpb24oaWQpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZ2V0TGluZShpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQoJ2xpbmUnLCBpZCk7XG4gICAgfVxuICAgIGFkZENvbm5lY3Rpb24oaWQsIGlkeSkge1xuICAgICAgICB0aGlzLmRhdGEucHVzaCh7IHR5cGU6ICdjb25uZWN0aW9uJywgaWQ6IGlkLCBpZHkgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZW1vdmVDb25uZWN0aW9uKGlkeCwgaWR5ID0gbnVsbCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB0aGlzLmRhdGEuZmlsdGVyKChpdGVtKSA9PiAhKGlkeCA9PSBpdGVtLmlkeCAmJiAoaWR5ID09IG51bGwgfHwgaWR5ID09IGl0ZW0uaWR5KSkgfHwgIShpZHggPT0gaXRlbS5pZHkgJiYgKGlkeSA9PSBudWxsIHx8IGlkeSA9PSBpdGVtLmlkeCkpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldENvbm5lY3Rpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCdjb25uZWN0aW9uJywgaWQpO1xuICAgIH1cbiAgICBpZCgpIHtcbiAgICAgICAgdmFyIGlkID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuICAgIHByaW50RGF0YSgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2RhdGEtanNvbicpLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZGF0YS1qc29uJykuaW5uZXJIVE1MID0gSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhLCB1bmRlZmluZWQsIDIpO1xuICAgIH1cbn1cbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gc3ZnRHJhZyhvbkRyYWcsIG9uU3RvcCwgZGlyZWN0aW9uKSB7XG4gICAgICAgIHZhciBzdGFydFggPSAwO1xuICAgICAgICB2YXIgc3RhcnRZID0gMDtcbiAgICAgICAgdmFyIGVsID0gdGhpcztcbiAgICAgICAgdmFyIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciBmaXggPSB7fTtcbiAgICAgICAgZnVuY3Rpb24gbW92ZShlKSB7XG4gICAgICAgICAgICBvbkRyYWcgJiYgb25EcmFnKGVsLCBlLnBhZ2VYLCBzdGFydFgsIGUucGFnZVksIHN0YXJ0WSwgZml4KTtcbiAgICAgICAgICAgIGlmICgndmVydGljYWwnICE9PSBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFnZVggPSAoJ3BhZ2VYJyBpbiBmaXgpID8gZml4WydwYWdlWCddIDogZS5wYWdlWDtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0YXJ0WCcgaW4gZml4KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0WCA9IGZpeFsnc3RhcnRYJ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmYWxzZSA9PT0gKCdza2lwWCcgaW4gZml4KSkge1xuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGFnZVggLSBzdGFydFh9cHgsICR7cGFnZVkgLSBzdGFydFl9cHgpYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoJ2hvcml6b250YWwnICE9PSBkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFnZVkgPSAoJ3BhZ2VZJyBpbiBmaXgpID8gZml4WydwYWdlWSddIDogZS5wYWdlWTtcbiAgICAgICAgICAgICAgICBpZiAoJ3N0YXJ0WScgaW4gZml4KSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0WSA9IGZpeFsnc3RhcnRZJ107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmYWxzZSA9PT0gKCdza2lwWScgaW4gZml4KSkge1xuICAgICAgICAgICAgICAgICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7cGFnZVggLSBzdGFydFh9cHgsICR7cGFnZVkgLSBzdGFydFl9cHgpYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc3RhcnREcmFnZ2luZyhlKSB7XG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IHx8IGUuY3VycmVudFRhcmdldCBpbnN0YW5jZW9mIFNWR0VsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGxlZnQgPSBlbC5zdHlsZS5sZWZ0ID8gcGFyc2VJbnQoZWwuc3R5bGUubGVmdCkgOiAwO1xuICAgICAgICAgICAgICAgIHZhciB0b3AgPSBlbC5zdHlsZS50b3AgPyBwYXJzZUludChlbC5zdHlsZS50b3ApIDogMDtcbiAgICAgICAgICAgICAgICBzdGFydFggPSBlLnBhZ2VYIC0gbGVmdDtcbiAgICAgICAgICAgICAgICBzdGFydFkgPSBlLnBhZ2VZIC0gdG9wO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3ZlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIllvdXIgdGFyZ2V0IG11c3QgYmUgYW4gaHRtbCBlbGVtZW50XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgc3RhcnREcmFnZ2luZyk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICh0cnVlID09PSBkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdmUpO1xuICAgICAgICAgICAgICAgIG9uU3RvcCAmJiBvblN0b3AoZWwsIGUucGFnZVgsIHN0YXJ0WCwgZS5wYWdlWSwgc3RhcnRZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIEVsZW1lbnQucHJvdG90eXBlWydzdmdEcmFnJ10gPSBzdmdEcmFnO1xufSkoKTtcbiIsImltcG9ydCB7IFNWRyB9IGZyb20gJ0Bzdmdkb3Rqcy9zdmcuanMnO1xuaW1wb3J0IENvbnRleHRNZW51IGZyb20gJy4vY29udGV4dC1tZW51JztcbmltcG9ydCBUb29sYmFyIGZyb20gJy4vdG9vbGJhcic7XG5pbXBvcnQgeyBQb3B1cENvbGxlY3Rpb24gfSBmcm9tICcuL3BvcHVwJztcbmltcG9ydCBQb3NpdGlvbkRhdGEgZnJvbSAnLi9wb3NpdGlvbi1kYXRhJztcbmltcG9ydCAnLi9zdmdkcmFnJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvc2l0aW9uVG9vbHRpcCB7XG4gICAgY29uc3RydWN0b3IoZGF0YSA9IFtdKSB7XG4gICAgICAgIHRoaXMubGFzdFBvc2l0aW9uID0geyB4OiA1MCwgeTogNTAgfTtcbiAgICAgICAgdGhpcy5tb3VzZVBvc2l0aW9uID0geyB4OiA1MCwgeTogNTAgfTtcbiAgICAgICAgdGhpcy5saW5lQXJyYXkgPSBbXTtcbiAgICAgICAgdGhpcy5ldmVudHMgPSB7fTtcbiAgICAgICAgdGhpcy5hZGREZXBhcnRtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5lZGl0TW9kZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaGFuZGxlTW91c2VPdmVyID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gdGhpcy5jcmVhdGVUb29sdGlwQm94KCk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5oYW5kbGVNb3VzZU1vdmUpO1xuICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLmhhbmRsZU1vdXNlTGVhdmUpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZU1vdXNlTGVhdmUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLmhhbmRsZU1vdXNlTW92ZSk7XG4gICAgICAgICAgICBldmVudC50YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuaGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlTW91c2VNb3ZlID0gKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24oZSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlTGluZSA9IChwb2x5bGluZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5saW5lQXJyYXkucHVzaChbdGhpcy5sYXN0UG9zaXRpb24ueCwgdGhpcy5sYXN0UG9zaXRpb24ueV0pO1xuICAgICAgICAgICAgcG9seWxpbmUucGxvdCh0aGlzLmxpbmVBcnJheSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtdG9vbHRpcC1jb250YWluZXJdJyk7XG4gICAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdE1vZGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRhdGEgPSBuZXcgUG9zaXRpb25EYXRhKGRhdGEpO1xuICAgICAgICB0aGlzLnN2ZyA9IFNWRygnLnRvcC1iYWNrZ3JvdW5kJyk7XG4gICAgICAgIHRoaXMucG9wdXAgPSBuZXcgUG9wdXBDb2xsZWN0aW9uKCcucG9wdXAtZGVwYXJ0bWVudCcpO1xuICAgICAgICB0aGlzLmRlcGFydG1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucG9wdXAtZGVwYXJ0bWVudCcpO1xuICAgICAgICBpZiAodGhpcy5kZXBhcnRtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmRlcGFydG1lbnQucXVlcnlTZWxlY3RvcignLmJ0bi1zYXZlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFkZERlcGFydG1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdCA9IHRoaXMuZGVwYXJ0bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW3NlbGVjdC5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGREZXBhcnRtZW50KG9wdGlvbi52YWx1ZSwgb3B0aW9uLmlubmVyVGV4dCwgb3B0aW9uLmdldEF0dHJpYnV0ZSgnZGF0YS1pY29uJyksIG9wdGlvbi5nZXRBdHRyaWJ1dGUoJ2RhdGEtdXJsJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5kZXBhcnRtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdCcpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRvb2xiYXIgPSBuZXcgVG9vbGJhcigpO1xuICAgICAgICB0aGlzLmRhdGEuZ2V0QWxsKCkubWFwKChlbG0pID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZWxtLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShlbG0sIGVsbS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xpbmUnOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUxpbmUoZWxtLnBvaW50cywgZWxtLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVwYXJ0bWVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRGVwYXJ0bWVudChlbG0sIGVsbS50ZXh0LCBlbG0uaWNvbiwgZWxtLmxpbmssIGVsbS5pZCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5tb2RlID0gJyc7XG4gICAgICAgIHRoaXMudG9vbGJhci5oaWRlKCk7XG4gICAgICAgIGlmICghdGhpcy5jb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLmhhbmRsZU1vdXNlT3Zlcik7XG4gICAgICAgIHRoaXMuY29udGFpbmVyWydtZW51J10gPSBuZXcgQ29udGV4dE1lbnUodGhpcy5jb250YWluZXIucXVlcnlTZWxlY3RvcignLnRvcC1iYWNrZ3JvdW5kJyksIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnQWRkIFBvaW50JyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3VzZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUodGhpcy5tb3VzZVBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnQWRkIExpbmUnLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiAoY29udCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tb3VzZVBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9seWxpbmUgPSB0aGlzLmNyZWF0ZUxpbmUoW10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvbHlsaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbignY29udGFpbmVyLWNsaWNrJywgKGNvbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVMaW5lKHBvbHlsaW5lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3dbJ2Rpc2FibGVDb250ZXh0TWVudSddID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdBZGQgRGVwYXJ0bWVudCcsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IChjb250KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyMhcG9wdXAvZGVwYXJ0bWVudCc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRGVwYXJ0bWVudCA9IChpZCwgdGV4dCwgaWNvbiwgdXJsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZURlcGFydG1lbnQodGhpcy5tb3VzZVBvc2l0aW9uLCB7IHg6IHRoaXMubW91c2VQb3NpdGlvbi54LCB5OiB0aGlzLm1vdXNlUG9zaXRpb24ueSwgdGl0bGU6IHRleHQgfSwgeyB4OiB0aGlzLm1vdXNlUG9zaXRpb24ueCArIDEwLCB5OiB0aGlzLm1vdXNlUG9zaXRpb24ueSArIDEwLCB1cmw6IGljb24gfSwgdXJsKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgeyBuYW1lOiAnQ2xvc2UnIH0sXG4gICAgICAgIF0sIHtcbiAgICAgICAgICAgIG9uU2hvdzogKGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlUG9zaXRpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmxhc3RQb3NpdGlvbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IHN0b3BQcm9wYWdhdGlvbiA9IChlKSA9PiB7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbWl0KCdjb250YWluZXItY2xpY2snLCB0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBzdG9wUHJvcGFnYXRpb24pO1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgc3RvcFByb3BhZ2F0aW9uKTtcbiAgICAgICAgdGhpcy5jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCBzdG9wUHJvcGFnYXRpb24pO1xuICAgIH1cbiAgICBjcmVhdGVEZXBhcnRtZW50KHBvcywgdGV4dCwgaWNvbiwgbGluaywgaWQgPSBudWxsKSB7XG4gICAgICAgIGxldCBncm91cCA9IHRoaXMuc3ZnLmxpbmsobGluayk7XG4gICAgICAgIGdyb3VwLngocG9zLngpLnkocG9zLnkpO1xuICAgICAgICBsZXQgZGVwYXJ0bWVudElkID0gaWQgPyBpZCA6IHRoaXMuZGF0YS5hZGREZXBhcnRtZW50KHBvcy54LCBwb3MueSwgdGV4dCwgaWNvbiwgbGluayk7XG4gICAgICAgIGxldCBub2RlcyA9IFtncm91cC5ub2RlXTtcbiAgICAgICAgaWYgKHRleHQgJiYgdGV4dC50aXRsZSkge1xuICAgICAgICAgICAgbGV0IHN2Z3RleHQgPSBncm91cC5wbGFpbih0ZXh0LnRpdGxlKS54KHRleHQueCkueSh0ZXh0LnkpO1xuICAgICAgICAgICAgc3ZndGV4dC5ub2RlLnN2Z0RyYWcobnVsbCwgKGVsLCBwYWdlWCwgc3RhcnRYLCBwYWdlWSwgc3RhcnRZKSA9PiB7XG4gICAgICAgICAgICAgICAgc3ZndGV4dC5ub2RlLnN0eWxlLnRyYW5zZm9ybSA9ICdub25lJztcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHN2Z3RleHQueCgpICsgcGFnZVggLSBzdGFydFg7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBzdmd0ZXh0LnkoKSArIHBhZ2VZIC0gc3RhcnRZO1xuICAgICAgICAgICAgICAgIHN2Z3RleHQueCh4KS55KHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YS51cGRhdGVEZXBhcnRtZW50VGV4dChkZXBhcnRtZW50SWQsIHsgeCwgeSwgdGl0bGU6IHRleHQudGl0bGUgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG5vZGVzLnB1c2goc3ZndGV4dC5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWNvbiAmJiBpY29uLnVybCkge1xuICAgICAgICAgICAgbGV0IGltYWdlID0gZ3JvdXAuaW1hZ2UoaWNvbi51cmwpLngoaWNvbi54KS55KGljb24ueSk7XG4gICAgICAgICAgICBpbWFnZS5hZGRDbGFzcygnZGVwYXJ0bWVudC1pY29uJyk7XG4gICAgICAgICAgICBpbWFnZS5ub2RlLnN2Z0RyYWcobnVsbCwgKGVsLCBwYWdlWCwgc3RhcnRYLCBwYWdlWSwgc3RhcnRZKSA9PiB7XG4gICAgICAgICAgICAgICAgaW1hZ2Uubm9kZS5zdHlsZS50cmFuc2Zvcm0gPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBpbWFnZS54KCkgKyBwYWdlWCAtIHN0YXJ0WDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IGltYWdlLnkoKSArIHBhZ2VZIC0gc3RhcnRZO1xuICAgICAgICAgICAgICAgIGltYWdlLngoeCkueSh5KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEudXBkYXRlRGVwYXJ0bWVudEltYWdlKGRlcGFydG1lbnRJZCwgeyB4LCB5LCB1cmw6IGljb24udXJsIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKGltYWdlLm5vZGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmVkaXRNb2RlKSB7XG4gICAgICAgICAgICBncm91cC5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGdyb3VwWydtZW51J10gPSBuZXcgQ29udGV4dE1lbnUobm9kZXMsIFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdSZW1vdmUnLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JvdXAucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEucmVtb3ZlRGVwYXJ0bWVudChkZXBhcnRtZW50SWQpO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgeyBuYW1lOiAnQ2xvc2UnIH0sXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1vZGUgPSAnZGVwYXJ0bWVudCc7XG4gICAgfVxuICAgIGNyZWF0ZUNpcmNsZShwb3MsIGlkID0gbnVsbCkge1xuICAgICAgICBsZXQgZ3JvdXAgPSB0aGlzLnN2Zy5ncm91cCgpO1xuICAgICAgICBsZXQgY2lyY2xlID0gZ3JvdXAuY2lyY2xlKDIwKTtcbiAgICAgICAgaWQgPSBpZCA/IGlkIDogdGhpcy5kYXRhLmFkZENpcmNsZShwb3MueCwgcG9zLnkpO1xuICAgICAgICBjaXJjbGUuZmlsbCgnI2Y0MjE1M2M3JykuYWRkQ2xhc3MoJ21hcmtlcicpLmFkZENsYXNzKGBjaXJjbGUtJHtpZH1gKS5zdHJva2UoeyBjb2xvcjogJyNmZmZmZmY5ZScsIHdpZHRoOiAxIH0pLmF0dHIoJ2RhdGEtaWQnLCBpZCk7XG4gICAgICAgIGNpcmNsZS5jeChwb3MueCkuY3kocG9zLnkpO1xuICAgICAgICB2YXIgbkNpcmNsZSA9IGNpcmNsZS5jbG9uZSgpO1xuICAgICAgICBuQ2lyY2xlLmFkZENsYXNzKCdwaW5nJykuZmlsbCgnI2Y0MjE1M2M3Jyk7XG4gICAgICAgIGdyb3VwLmFkZChuQ2lyY2xlKTtcbiAgICAgICAgaWYgKHRoaXMuZWRpdE1vZGUpIHtcbiAgICAgICAgICAgIGdyb3VwWydtZW51J10gPSBuZXcgQ29udGV4dE1lbnUoW2dyb3VwLm5vZGUsIG5DaXJjbGUubm9kZSwgY2lyY2xlLm5vZGVdLCBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUmVtb3ZlJyxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVDaXJjbGUoY2lyY2xlLmF0dHIoJ2RhdGEtaWQnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogJ0Nsb3NlJyB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBncm91cC5ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoJ2NsaWNrLWNpcmNsZScsIGUudGFyZ2V0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZ3JvdXAubm9kZS5zdmdEcmFnKG51bGwsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjaXJjbGUuY3godGhpcy5sYXN0UG9zaXRpb24ueCkuY3kodGhpcy5sYXN0UG9zaXRpb24ueSk7XG4gICAgICAgICAgICAgICAgbkNpcmNsZS5jeCh0aGlzLmxhc3RQb3NpdGlvbi54KS5jeSh0aGlzLmxhc3RQb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEudXBkYXRlQ2lyY2xlKGlkLCB0aGlzLmxhc3RQb3NpdGlvbi54LCB0aGlzLmxhc3RQb3NpdGlvbi55KTtcbiAgICAgICAgICAgICAgICBncm91cC5ub2RlLnN0eWxlLnRyYW5zZm9ybSA9ICdub25lJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kZSA9ICdjaXJjbGUnO1xuICAgIH1cbiAgICBjcmVhdGVMaW5lKGxpbmVBcnJheSA9IFtdLCBpZCA9IG51bGwpIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZSAhPSAnbGluZScpIHtcbiAgICAgICAgICAgIHRoaXMubGluZUFycmF5ID0gbGluZUFycmF5O1xuICAgICAgICAgICAgbGV0IHBvbHlsaW5lID0gdGhpcy5zdmcucG9seWxpbmUodGhpcy5saW5lQXJyYXkpO1xuICAgICAgICAgICAgaWQgPSBpZCA/IGlkIDogdGhpcy5kYXRhLmlkKCk7XG4gICAgICAgICAgICBwb2x5bGluZS5zdHJva2UoeyBjb2xvcjogJyNmZmZmZmY5ZScsIHdpZHRoOiAyIH0pLmF0dHIoJ2NsYXNzJywgJ2xpbmUnKS5hZGRDbGFzcyhgbGluZS0ke2lkfWApLmF0dHIoJ2RhdGEtaWQnLCBpZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5lZGl0TW9kZSkge1xuICAgICAgICAgICAgICAgIHBvbHlsaW5lWydtZW51J10gPSBuZXcgQ29udGV4dE1lbnUocG9seWxpbmUubm9kZSwgW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ29ubmVjdCBUby4uLicsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudG9vbGJhci51cGRhdGUoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnQ2FuY2VsIENvbm5lY3Rpb24nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZignY2xpY2stY2lyY2xlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sYmFyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbignY2xpY2stY2lyY2xlJywgKGVsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaXJjbGUgPSB0aGlzLmRhdGEuZ2V0Q2lyY2xlKGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1pZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhLmFkZENvbm5lY3Rpb24oY2lyY2xlWydpZCddLCBpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sYmFyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vZmYoJ2NsaWNrLWNpcmNsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1JlbW92ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVMaW5lKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2x5bGluZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICB7IG5hbWU6ICdDbG9zZScgfSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlVW5kbyA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoZS53aGljaCA9PT0gOTAgJiYgZS5jdHJsS2V5KSB8fCAoZS5tZXRhS2V5ICYmIGUud2hpY2ggPT09IDkxKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQXJyYXkucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2x5bGluZS5wbG90KHRoaXMubGluZUFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgbGV0IGNsZWFyRXZlbnRzID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vZGUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lQXJyYXkgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93WydkaXNhYmxlQ29udGV4dE1lbnUnXSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9mZignY29udGFpbmVyLWNsaWNrJyk7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVVbmRvKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b29sYmFyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBoYW5kbGVVbmRvKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvb2xiYXIudXBkYXRlKFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1NhdmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEuc2F2ZUxpbmUoaWQsIHRoaXMubGluZUFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckV2ZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NhbmNlbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YS5yZW1vdmVMaW5lKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2x5bGluZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckV2ZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubW9kZSA9ICdsaW5lJztcbiAgICAgICAgICAgIHJldHVybiBwb2x5bGluZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjcmVhdGVUb29sdGlwQm94KCkge1xuICAgICAgICByZXR1cm4gKGUpID0+IHtcbiAgICAgICAgICAgIGxldCBwb3MgPSB0aGlzLnJlY3Vyc2l2ZVBvc2l0aW9uKGUsIHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgICAgIGxldCBwZXJjZW50eCA9ICgocG9zLnggLyB0aGlzLmNvbnRhaW5lci5jbGllbnRIZWlnaHQpICogMTAwKS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgbGV0IHBlcmNlbnR5ID0gKChwb3MueSAvIHRoaXMuY29udGFpbmVyLmNsaWVudFdpZHRoKSAqIDEwMCkudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIHRoaXMubGFzdFBvc2l0aW9uID0geyB4OiBwb3MueCwgeTogcG9zLnkgfTtcbiAgICAgICAgICAgIHJldHVybiB7IHg6IHBlcmNlbnR4LCB5OiBwZXJjZW50eSB9O1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZWN1cnNpdmVQb3NpdGlvbihlLCBvYmopIHtcbiAgICAgICAgdmFyIG1fcG9zeCA9IDAsIG1fcG9zeSA9IDAsIGVfcG9zeCA9IDAsIGVfcG9zeSA9IDA7XG4gICAgICAgIGlmICghZSkge1xuICAgICAgICAgICAgZSA9IHdpbmRvdy5ldmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS5wYWdlWCB8fCBlLnBhZ2VZKSB7XG4gICAgICAgICAgICBtX3Bvc3ggPSBlLnBhZ2VYO1xuICAgICAgICAgICAgbV9wb3N5ID0gZS5wYWdlWTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChlLmNsaWVudFggfHwgZS5jbGllbnRZKSB7XG4gICAgICAgICAgICBtX3Bvc3ggPSBlLmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIG1fcG9zeSA9IGUuY2xpZW50WSArIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wICsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2JqLm9mZnNldFBhcmVudCkge1xuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIGVfcG9zeCArPSBvYmoub2Zmc2V0TGVmdDtcbiAgICAgICAgICAgICAgICBlX3Bvc3kgKz0gb2JqLm9mZnNldFRvcDtcbiAgICAgICAgICAgIH0gd2hpbGUgKChvYmogPSBvYmoub2Zmc2V0UGFyZW50KSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgeDogbV9wb3N4IC0gZV9wb3N4LCB5OiBtX3Bvc3kgLSBlX3Bvc3kgfTtcbiAgICB9XG4gICAgZW1pdCh0eXBlLCBlbCwgZGF0YSA9IHt9KSB7XG4gICAgICAgIGlmICh0aGlzLmV2ZW50c1t0eXBlXSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHNbdHlwZV0oZWwsIGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uKHR5cGUsIGZuKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW3R5cGVdID0gZm47XG4gICAgfVxuICAgIG9mZih0eXBlKSB7XG4gICAgICAgIHRoaXMuZXZlbnRzW3R5cGVdID0gbnVsbDtcbiAgICB9XG59XG4iLCJpbXBvcnQgUG9zaXRpb25Ub29sdGlwIGZyb20gXCIuL3N5bXB0b21jaGVja2VyL3Bvc2l0aW9uLXRvb2x0aXBcIjtcbndpbmRvd1tcImRpc2FibGVDb250ZXh0TWVudVwiXSA9IGZhbHNlO1xuYXBwLnJlYWR5KCgpID0+IHtcbiAgICBuZXcgUG9zaXRpb25Ub29sdGlwKCk7XG59KTtcbiJdLCJuYW1lcyI6WyJtZXRob2RzIiwiRWxlbWVudCIsImRlZmF1bHRzIiwieCIsInkiLCJjeCIsImN5Iiwid2lkdGgiLCJoZWlnaHQiLCJtb3ZlIiwic2l6ZSJdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsTUFBTUEsU0FBTyxHQUFHLEdBQUU7RUFDbEIsTUFBTSxLQUFLLEdBQUcsR0FBRTtBQUNoQjtFQUNPLFNBQVMsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7RUFDMUMsRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7RUFDM0IsSUFBSSxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksRUFBRTtFQUM5QixNQUFNLGVBQWUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFDO0VBQy9CLEtBQUs7RUFDTCxJQUFJLE1BQU07RUFDVixHQUFHO0FBQ0g7RUFDQSxFQUFFLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO0VBQ2hDLElBQUksS0FBSyxNQUFNLEtBQUssSUFBSSxJQUFJLEVBQUU7RUFDOUIsTUFBTSxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBQztFQUN6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USxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtFQUMxRCxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO0VBQ3BCLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7RUFDNUQsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztFQUN0QixZQUFZLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQzlELFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7RUFDeEIsY0FBYyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtFQUNoRSxjQUFjLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDO0VBQzNCLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7RUFD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QUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUM7RUFDN0MsTUFBTSxPQUFPLEtBQUs7QUFDbEI7RUFDQSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO0FBQ2hDO0VBQ0EsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFDO0VBQ2xDLE1BQU0sTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBQztFQUM5RCxNQUFNLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUM7RUFDN0QsTUFBTSxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFDO0VBQzlELE1BQU0sTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7RUFDdEMsTUFBTSxPQUFPLEtBQUs7QUFDbEI7RUFDQSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ2xDO0VBQ0EsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksTUFBTSxFQUFFLEdBQUcsR0FBRTtFQUN6QyxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxNQUFNLEVBQUUsR0FBRyxFQUFDO0VBQ3ZDLE1BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBRTtFQUM5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QUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQzNDO0VBQ0EsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7RUFDakI7RUFDQSxNQUFNLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQztFQUMxQyxLQUFLO0FBQ0w7RUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQztFQUNuQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQztFQUNuQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQztBQUNuQztFQUNBO0VBQ0EsSUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFDO0VBQy9DLElBQUksT0FBTyxLQUFLO0VBQ2hCLEdBQUc7QUFDSDtFQUNBLEVBQUUsR0FBRyxDQUFDLEdBQUc7QUFDVDtFQUNBO0VBQ0EsSUFBSSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFFO0VBQ3JDLElBQUksTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBQztBQUN4RDtFQUNBO0VBQ0EsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0VBQ2pDLElBQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQztFQUNqQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFDO0FBQzdCO0VBQ0E7RUFDQSxJQUFJLE1BQU0sTUFBTSxHQUFHLEdBQUcsS0FBSyxJQUFHO0FBQzlCO0VBQ0E7RUFDQSxJQUFJLE1BQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFHO0VBQzNCLElBQUksTUFBTSxDQUFDLEdBQUcsTUFBTTtFQUNwQixRQUFRLENBQUM7RUFDVCxRQUFRLENBQUMsR0FBRyxHQUFHO0VBQ2YsVUFBVSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDakMsVUFBVSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBQztFQUM3QixJQUFJLE1BQU0sQ0FBQyxHQUFHLE1BQU07RUFDcEIsUUFBUSxDQUFDO0VBQ1QsUUFBUSxHQUFHLEtBQUssQ0FBQztFQUNqQixVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0VBQ2pELFVBQVUsR0FBRyxLQUFLLENBQUM7RUFDbkIsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUM7RUFDckMsWUFBWSxHQUFHLEtBQUssQ0FBQztFQUNyQixjQUFjLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQztFQUN2QyxjQUFjLEVBQUM7QUFDZjtFQUNBO0VBQ0EsSUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUM7RUFDN0QsSUFBSSxPQUFPLEtBQUs7RUFDaEIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxLQUFLLEVBQUU7RUFDbkQ7RUFDQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBQztBQUNsQjtFQUNBO0VBQ0EsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7RUFDcEIsTUFBTSxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7RUFDMUMsUUFBUSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFDO0VBQzFDLE9BQU87RUFDUCxLQUFLO0FBQ0w7RUFDQSxJQUFJLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO0VBQy9CO0VBQ0EsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsR0FBRyxNQUFLO0VBQy9DLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBQztBQUN2QztFQUNBO0VBQ0EsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUM7RUFDaEU7RUFDQSxLQUFLLE1BQU0sSUFBSSxDQUFDLFlBQVksS0FBSyxFQUFFO0VBQ25DLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFL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TUFBTSxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsT0FBTTtFQUN0RCxNQUFNLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxPQUFNO0FBQ3REO0VBQ0E7RUFDQSxNQUFNLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFHO0VBQzFCLE1BQU0sTUFBTSxFQUFFLEdBQUcsVUFBUztFQUMxQixNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxJQUFJLEtBQUssR0FBRyxHQUFFO0VBQzNFLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEtBQUssR0FBRyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEdBQUU7RUFDM0UsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssS0FBSyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsR0FBRTtBQUMzRTtFQUNBO0VBQ0EsTUFBTSxNQUFNLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBQztFQUN4RCxNQUFNLE9BQU8sS0FBSztFQUNsQixLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssRUFBRTtFQUNyQztFQUNBO0VBQ0EsTUFBTSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFJO0VBQzVCLE1BQU0sQ0FBQyxJQUFJLElBQUc7RUFDZCxNQUFNLENBQUMsSUFBSSxJQUFHO0VBQ2QsTUFBTSxDQUFDLElBQUksSUFBRztBQUNkO0VBQ0E7RUFDQSxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtFQUNuQixRQUFRLENBQUMsSUFBSSxJQUFHO0VBQ2hCLFFBQVEsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7RUFDeEMsUUFBUSxPQUFPLEtBQUs7RUFDcEIsT0FBTztBQUNQO0VBQ0E7RUFDQSxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDO0VBQ3JELE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFDO0FBQ3pCO0VBQ0E7RUFDQSxNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBQztFQUMvQyxNQUFNLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7RUFDdkMsTUFBTSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFDL0M7RUFDQTtFQUNBLE1BQU0sTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7RUFDdEMsTUFBTSxPQUFPLEtBQUs7RUFDbEIsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxNQUFNLEVBQUU7RUFDdEM7RUFDQTtFQUNBLE1BQU0sTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUk7QUFDakM7RUFDQTtFQUNBLE1BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3hELE1BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3hELE1BQU0sTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0FBQ3hEO0VBQ0E7RUFDQSxNQUFNLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDO0VBQ3RDLE1BQU0sT0FBTyxLQUFLO0VBQ2xCLEtBQUssTUFBTTtFQUNYLE1BQU0sT0FBTyxJQUFJO0VBQ2pCLEtBQUs7RUFDTCxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sQ0FBQyxHQUFHO0VBQ2IsSUFBSSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxHQUFHLEtBQUk7RUFDMUMsSUFBSSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRTtFQUNwQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLEtBQUssQ0FBQyxHQUFHO0VBQ1gsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBQztFQUN6RCxJQUFJLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDMUIsR0FBRztBQUNIO0VBQ0EsRUFBRSxLQUFLLENBQUMsR0FBRztFQUNYLElBQUksTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRTtFQUMxQyxJQUFJLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDO0VBQzNDLElBQUksT0FBTyxNQUFNO0VBQ2pCLEdBQUc7QUFDSDtFQUNBLEVBQUUsUUFBUSxDQUFDLEdBQUc7RUFDZCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRTtFQUN2QixHQUFHO0FBQ0g7RUFDQSxFQUFFLEdBQUcsQ0FBQyxHQUFHO0FBQ1Q7RUFDQTtFQUNBLElBQUksTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRTtFQUN2RCxJQUFJLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUM7QUFDOUQ7RUFDQTtFQUNBLElBQUksTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBSztFQUM3RSxJQUFJLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQUs7RUFDN0UsSUFBSSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFLO0FBQzdFO0VBQ0E7RUFDQSxJQUFJLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksUUFBTztFQUNsRSxJQUFJLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksUUFBTztFQUNsRSxJQUFJLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsTUFBTSxHQUFHLEVBQUUsR0FBRyxNQUFNLElBQUksUUFBTztBQUNsRTtFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBRztFQUM3RSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLFFBQVEsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFHO0VBQzdFLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLElBQUc7QUFDN0U7RUFDQTtFQUNBLElBQUksTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFDO0VBQzNDLElBQUksT0FBTyxLQUFLO0VBQ2hCLEdBQUc7QUFDSDtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ0EsRUFBRSxRQUFRLENBQUMsR0FBRztFQUNkLElBQUksTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRTtFQUNyQyxJQUFJLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEtBQUk7RUFDcEMsSUFBSSxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFDO0VBQ2xELElBQUksT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztFQUNyQyxHQUFHO0FBQ0g7RUFDQTtFQUNBO0VBQ0E7QUFDQTtFQUNBOztFQy9jZSxNQUFNLEtBQUssQ0FBQztFQUMzQjtFQUNBLEVBQUUsV0FBVyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUU7RUFDeEIsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxFQUFDO0VBQ3RCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxLQUFLLENBQUMsR0FBRztFQUNYLElBQUksT0FBTyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUM7RUFDMUIsR0FBRztBQUNIO0VBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0VBQ2QsSUFBSSxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFF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QUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztFQUMxQyxHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7RUFDOUI7RUFDQSxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxFQUFDO0FBQ2xCO0VBQ0EsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQztFQUMzQixJQUFJLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0FBQzNCO0VBQ0EsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxLQUFJO0FBQ3JDO0VBQ0EsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUc7RUFDOUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUc7RUFDOUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUc7RUFDOUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUc7RUFDOUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRTtFQUN6RCxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcs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QyxJQUFJLE1BQU0sT0FBTyxHQUFHLEtBQUk7RUFDeEIsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBQztBQUNyRTtFQUNBO0VBQ0EsSUFBSSxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sRUFBRTtFQUNwQyxPQUFPLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDN0IsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDO0VBQzFCLE9BQU8sVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQzNCLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztFQUNqQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUM7RUFDOUIsT0FBTyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztFQUN0QixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0VBQ3ZCLE9BQU8sVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUM7QUFDekI7RUFDQTtFQUNBLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDMUMsTUFBTSxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBQztFQUM3RDtFQUNBO0VBQ0EsTUFBTSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMs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RSxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3JDLElBQUksTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUM7RUFDckMsSUFBSSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFDO0VBQ3RFLElBQUksTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBQztBQUN6RTtFQUNBLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUM7RUFDdkMsR0FBRztBQUNIO0VBQ0EsRUFBRSxPQUFPLENBQUMsR0FBRztFQUNiLElBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7RUFDdEQsR0FBRztBQUNIO0VBQ0EsRUFBRSxRQUFRLENBQUMsR0FBRztFQUNkLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTTtFQUN2RSxHQUFHO0FBQ0g7RUFDQSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUNoQixJQUFJLElBQUksRUFBRSxDQUFDLFlBQVksTUFBTSxDQUFDLEVBQUU7RUFDaEMsTUFBTSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFD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LENBQUMsQ0FBQyxDQUFDO0VBQzNCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDVCxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUk7RUFDcEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7RUFDbkMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQ3BDLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDVCxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUk7RUFDcEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7RUFDcEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQ3JDLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRztFQUNWLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRTtFQUM1QixJQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7RUFDOUIsR0FBRztBQUNIO0VBQ0E7RUFDQSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDZixJQUFJLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzNCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0VBQ2IsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFD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LEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztFQUNsRSxHQUFHO0FBQ0g7RUFDQTtFQUNBLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ2hDLElBQUksT0FBTyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUM7RUFDM0QsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7RUFDeEQsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztFQUNoRSxHQUFHO0FBQ0g7RUFDQSxFQUFFLEtBQUssRUFBRSxVQUFVLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFO0VBQ2hDLElBQUksT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUM7RUFDL0QsR0FBRztBQUNIO0VBQ0E7RUFDQSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRTtFQUNqQyxJQUFJLE9BQU8sU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO0VBQzNELFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDO0VBQ3pE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TyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7RUFDeEMsR0FBRztBQUNIO0VBQ0EsQ0FBQztBQUNEO0VBQ0EsUUFBUSxDQUFDLFFBQVEsRUFBRSxVQUFVOztFQzlCdEIsU0FBUyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUM1QixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxJQUFJLEtBQUssZ0JBQWdCO0VBQzFELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztFQUMvRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDL0QsQ0FBQztBQUNEO0VBQ08sU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUMxQixFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRSxJQUFJLEtBQUssZ0JBQWdCO0VBQzFELE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztFQUMvRCxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDL0Q7Ozs7Ozs7O0VDQWUsTUFBTSxRQUFRLFNBQVMsU0FBUyxDQUFDO0VBQ2hELEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUM1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RyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUM7RUFDbEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFDO0VBQ2xDLEtBQUssRUFBQztFQUNOLElBQUksT0FBTyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQztFQUN4RCxHQUFHO0FBQ0g7RUFDQTtFQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUNkLElBQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRTtBQUMzQjtFQUNBO0VBQ0EsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUM7RUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBQztBQUNkO0VBQ0E7RUFDQSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDaEMsTUFBTSxLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDakQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUU7RUFDcEQsT0FBTztFQUNQLEtBQUs7QUFDTDtFQUNBLElBQUksT0FBTyxJQUFJO0VBQ2YsR0FBRztBQUNIO0VBQ0E7RUFDQSxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUMzQixJQUFJLE1BQU0sTUFBTSxHQUFHLEdBQUU7QUFDckI7RUFDQTtFQUNBLElBQUksSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO0VBQ2hDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFDO0VBQ3JELEtBQUssTUFBTTtFQUNYO0VBQ0EsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFDO0VBQzNELEtBQUs7QUFDTDtFQUNBO0VBQ0E7RUFDQSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUU7QUFDM0M7RUFDQTtFQUNBLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtFQUM1RCxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFDO0VBQzdDLEtBQUs7QUFDTDtFQUNBLElBQUksT0FBTyxNQUFNO0VBQ2pCLEdBQUc7QUFDSDtFQUNBO0VBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFO0VBQ3ZCLElBQUksSUFBSSxFQUFDO0VBQ1QsSUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFFO0FBQzNCO0VBQ0E7RUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7RUFDM0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFD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Q0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFFO0FBQ3hGO0VBQ0EsTUFBTSxZQUFZLEdBQUc7RUFDckIsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtFQUN6QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDO0VBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFDckI7RUFDQSxJQUFJLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzVCLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUNkLElBQUksT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzlCLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3hCLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQ3hCLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUNkLElBQUksT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtFQUN0RCxHQUFHO0VBQ0gsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0VBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDO0VBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQzFDLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUNkLElBQUksT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDMUMsR0FBRztFQUNILEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUNkLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDO0VBQ2QsSUFBSSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDOUIsR0FBRztFQUNILEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7RUFDekIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDO0VBQ2QsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFDO0VBQ2QsSUFBSSxPQUFPLEVBQUUsR0FBRyxFQUFFO0VBQ2xCLEdBQUc7RUFDSCxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDZCxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztFQUNkLElBQUksT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDNUQsR0FBRztFQUNILEVBQUM7QUFDRDtFQUNBLE1BQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFDO0FBQ3pDO0VBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUNyRCxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFO0VBQzlDLElBQUksT0FBTyxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0VBQy9CLE1BQU0sSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUM7RUFDdEMsV0FBVyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQztFQUMzQyxXQUFXLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtFQUMxQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUM7RUFDekIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDO0VBQ3pCLE9BQU8sTUFBTTtFQUNiLFFBQVEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUNwRCxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUM7RUFDM0Ms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QU8sVUFBVSxDQUFDLENBQUMsQ0FBQztFQUN4QixHQUFHO0FBQ0g7RUFDQTtFQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtFQUN2QjtFQUNBLElBQUksTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRTtFQUMzQixJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUM7QUFDWjtFQUNBO0VBQ0E7RUFDQSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFLO0VBQy9DLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU07QUFDbEQ7RUFDQTtFQUNBLElBQUksS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtFQUMzQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQ3BCO0VBQ0EsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO0VBQy9DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsRUFBQztFQUN2RSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUM7RUFDekUsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtFQUM1QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUM7RUFDdkUsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtFQUM1QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLEVBQUM7RUFDekUsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDdEQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxFQUFDO0VBQ3ZFLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBQztFQUN6RSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUM7RUFDdkUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFDO0FBQ3pFO0VBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7RUFDdkIsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxFQUFDO0VBQ3pFLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsRUFBQztFQUMzRSxTQUFTO0VBQ1QsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtFQUM1QjtFQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxHQUFHLENBQUMsTUFBSztFQUNyRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FB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Q0Q7RUFDTyxTQUFTSyxNQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO0VBQy9DLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztFQUNqQyxDQUFDO0FBQ0Q7RUFDQTtFQUNPLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO0VBQzFDLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO0VBQ2pCLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRTtFQUNqQixHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNwRCxDQUFDO0FBQ0Q7RUFDQTtFQUNPLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFO0VBQzFDLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFO0VBQ2pCLElBQUksT0FBTyxHQUFHLENBQUMsRUFBRTtFQUNqQixHQUFHO0FBQ0g7RUFDQSxFQUFFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztFQUNwRCxDQUFDO0FBQ0Q7RUFDTyxTQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUU7RUFDakQsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUs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RUFDM0MsWUFBWSxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDaEYsWUFBWSxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztFQUNsRixTQUFTLENBQUM7RUFDVixRQUFRLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLEtBQUs7RUFDdEMsWUFBWSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzdCLFNBQVMsQ0FBQztFQUNWLFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLFFBQVEsS0FBSztFQUN4QyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQzVFLFlBQVksUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDMUMsU0FBUyxDQUFDO0VBQ1YsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsQ0FBQztFQUM1RSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0VBQzdCLFlBQVksSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7RUFDbEMsU0FBUztFQUNULFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUMzQyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7RUFDMUMsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksZUFBZSxDQUFDLG1CQUFtQixDQUFDLENBQUM7RUFDOUQsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQztFQUN0RSxRQUFRLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtFQUM3QixZQUFZLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSztFQUN4RixnQkFBZ0IsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO0VBQ3hDLG9CQUFvQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUN6RSxvQkFBb0IsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDdEUsb0JBQW9CLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0VBQzFJLGlCQUFpQjtFQUNqQixhQUFhLENBQUMsQ0FBQztFQUNmLFlBQVksSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ2hGLFNBQVM7RUFDVCxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztFQUNyQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLO0VBQ3hDLFlBQVksUUFBUSxHQUFHLENBQUMsSUFBSTtFQUM1QixnQkFBZ0IsS0FBSyxRQUFRO0VBQzdCLG9CQUFvQixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDbkQsb0JBQW9CLE1BQU07RUFDMUIsZ0JBQWdCLEtBQUssTUFBTTtFQUMzQixvQkFBb0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUN4RCxvQkFBb0IsTUFBTTtFQUMxQixnQkFBZ0IsS0FBSyxZQUFZO0VBQ2pDLG9CQUFvQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNyRixvQkFBb0IsTUFBTTtFQUMxQixhQUFhO0VBQ2IsU0FBUyxDQUFDLENBQUM7RUFDWCxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0VBQ3ZCLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUM1QixRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0VBQzdCLFlBQVksT0FBTztFQUNuQixTQUFTO0VBQ1QsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7RUFDM0UsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7RUFDbEcsWUFBWTtFQUNaLGdCQUFnQixJQUFJLEVBQUUsV0FBVztFQUNqQyxnQkFBZ0IsUUFBUSxFQUFFLE1BQU07RUFDaEMsb0JBQW9CLElBQUksSUFBSSxDQUFDLGFBQWE7RUFDMUMsd0JBQXdCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0VBQzlELGlCQUFpQjtFQUNqQixhQUFhO0VBQ2IsWUFBWTtFQUNaLGdCQUFnQixJQUFJLEVBQUUsVUFBVTtFQUNoQyxnQkFBZ0IsUUFBUSxFQUFFLENBQUMsSUFBSSxLQUFLO0VBQ3BDLG9CQUFvQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7RUFDNUMsd0JBQXdCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDM0Qsd0JBQXdCLElBQUksUUFBUSxFQUFFO0VBQ3RDLDRCQUE0QixJQUFJLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxLQUFLO0VBQ2pFLGdDQUFnQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQzFELDZCQUE2QixDQUFDLENBQUM7RUFDL0IsNEJBQTRCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLElBQUksQ0FBQztFQUNoRSx5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLGlCQUFpQjtFQUNqQixhQUFhO0VBQ2IsWUFBWTtFQUNaLGdCQUFnQixJQUFJLEVBQUUsZ0JBQWdCO0VBQ3RDLGdCQUFnQixRQUFRLEVBQUUsQ0FBQyxJQUFJLEtBQUs7RUFDcEMsb0JBQW9CLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLG9CQUFvQixDQUFDO0VBQ2hFLG9CQUFvQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxLQUFLO0VBQ2xFLHdCQUF3QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUNyTixxQkFBcUIsQ0FBQztFQUN0QixpQkFBaUI7RUFDakIsYUFBYTtFQUNiLFlBQVksRUFBRTtFQUNkLFlBQVksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0VBQzdCLFNBQVMsRUFBRTtFQUNYLFlBQVksTUFBTSxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQzNCLGdCQUFnQixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztFQUMxRSxhQUFhO0VBQ2IsU0FBUyxDQUFDLENBQUM7RUFDWCxRQUFRLElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQyxLQUFLO0VBQ3JDLFlBQVksQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDO0VBQ2hDLFlBQVksQ0FBQyxDQUFDLHdCQUF3QixFQUFFLENBQUM7RUFDekMsU0FBUyxDQUFDO0VBQ1YsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSztFQUN4RCxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQ3pELFNBQVMsQ0FBQyxDQUFDO0VBQ1gsUUFBUSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQztFQUN0RSxRQUFRLElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0VBQ3ZFLFFBQVEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUM7RUFDeEUsS0FBSztFQUNMLElBQUksZ0JBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxJQUFJLEVBQUU7RUFDdkQsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN4QyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEMsUUFBUSxJQUFJLFlBQVksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzdGLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDakMsUUFBUSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0VBQ2hDLFlBQVksSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RFLFlBQVksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sS0FBSztFQUM3RSxnQkFBZ0IsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztFQUN0RCxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxNQUFNLENBQUM7RUFDckQsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDO0VBQ3JELGdCQUFnQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNsQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztFQUMxRixhQUFhLENBQUMsQ0FBQztFQUNmLFlBQVksS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDckMsU0FBUztFQUNULFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtFQUM5QixZQUFZLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNsRSxZQUFZLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQWlCLENBQUMsQ0FBQztFQUM5QyxZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEtBQUs7RUFDM0UsZ0JBQWdCLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7RUFDcEQsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDO0VBQ25ELGdCQUFnQixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxFQUFFLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQztFQUNuRCxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7RUFDdkYsYUFBYSxDQUFDLENBQUM7RUFDZixZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ25DLFNBQVM7RUFDVCxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtFQUMzQixZQUFZLEtBQUssQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLO0VBQ3hELGdCQUFnQixDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7RUFDbkMsYUFBYSxDQUFDLENBQUM7RUFDZixZQUFZLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLEVBQUU7RUFDbkQsZ0JBQWdCO0VBQ2hCLG9CQUFvQixJQUFJLEVBQUUsUUFBUTtFQUNsQyxvQkFBb0IsUUFBUSxFQUFFLE1BQU07RUFDcEMsd0JBQXdCLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztFQUN2Qyx3QkFBd0IsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztFQUNqRSxxQkFBcUI7RUFDckIsaUJBQWlCO0VBQ2pCLGdCQUFnQixFQUFFO0VBQ2xCLGdCQUFnQixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUU7RUFDakMsYUFBYSxDQUFDLENBQUM7RUFDZixTQUFTO0VBQ1QsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztFQUNqQyxLQUFLO0VBQ0wsSUFBSSxZQUFZLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxJQUFJLEVBQUU7RUFDakMsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ3JDLFFBQVEsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUN0QyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3pELFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7RUFDMUksUUFBUSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25DLFFBQVEsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ3JDLFFBQVEsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDbkQsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzNCLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0VBQzNCLFlBQVksS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtFQUNyRixnQkFBZ0I7RUFDaEIsb0JBQW9CLElBQUksRUFBRSxRQUFRO0VBQ2xDLG9CQUFvQixRQUFRLEVBQUUsTUFBTTtFQUNwQyx3QkFBd0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0VBQ3ZFLHdCQUF3QixLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDdkMscUJBQXFCO0VBQ3JCLGlCQUFpQjtFQUNqQixnQkFBZ0IsRUFBRTtFQUNsQixnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0VBQ2pDLGFBQWEsQ0FBQyxDQUFDO0VBQ2YsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSztFQUN4RCxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3BELGFBQWEsQ0FBQyxDQUFDO0VBQ2YsWUFBWSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTTtFQUMzQyxnQkFBZ0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3ZFLGdCQUFnQixPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDeEUsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JGLGdCQUFnQixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO0VBQ3BELGFBQWEsQ0FBQyxDQUFDO0VBQ2YsU0FBUztFQUNULFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7RUFDN0IsS0FBSztFQUNMLElBQUksVUFBVSxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRTtFQUMxQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7RUFDakMsWUFBWSxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztFQUN2QyxZQUFZLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUM3RCxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDMUMsWUFBWSxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztFQUMvSCxZQUFZLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtFQUMvQixnQkFBZ0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUU7RUFDbEUsb0JBQW9CO0VBQ3BCLHdCQUF3QixJQUFJLEVBQUUsZUFBZTtFQUM3Qyx3QkFBd0IsUUFBUSxFQUFFLE1BQU07RUFDeEMsNEJBQTRCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0VBQ2hELGdDQUFnQztFQUNoQyxvQ0FBb0MsSUFBSSxFQUFFLG1CQUFtQjtFQUM3RCxvQ0FBb0MsUUFBUSxFQUFFLE1BQU07RUFDcEQsd0NBQXdDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7RUFDakUsd0NBQXdDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDNUQscUNBQXFDO0VBQ3JDLGlDQUFpQztFQUNqQyw2QkFBNkIsQ0FBQyxDQUFDO0VBQy9CLDRCQUE0QixJQUFJLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsS0FBSztFQUM1RCxnQ0FBZ0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0VBQzdGLGdDQUFnQyxJQUFJLE1BQU0sRUFBRTtFQUM1QyxvQ0FBb0MsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQzlFLGlDQUFpQztFQUNqQyxnQ0FBZ0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNwRCxnQ0FBZ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztFQUN6RCw2QkFBNkIsQ0FBQyxDQUFDO0VBQy9CLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsb0JBQW9CO0VBQ3BCLHdCQUF3QixJQUFJLEVBQUUsUUFBUTtFQUN0Qyx3QkFBd0IsUUFBUSxFQUFFLE1BQU07RUFDeEMsNEJBQTRCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3JELDRCQUE0QixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUMseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixvQkFBb0IsRUFBRTtFQUN0QixvQkFBb0IsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO0VBQ3JDLGlCQUFpQixDQUFDLENBQUM7RUFDbkIsZ0JBQWdCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLO0VBQ3hDLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLEVBQUU7RUFDeEYsd0JBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDN0Msd0JBQXdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQ3RELHFCQUFxQjtFQUNyQixpQkFBaUIsQ0FBQztFQUNsQixnQkFBZ0IsSUFBSSxXQUFXLEdBQUcsTUFBTTtFQUN4QyxvQkFBb0IsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7RUFDbkMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0VBQ3hDLG9CQUFvQixNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxLQUFLLENBQUM7RUFDekQsb0JBQW9CLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztFQUNoRCxvQkFBb0IsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUN4RSxvQkFBb0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUN4QyxpQkFBaUIsQ0FBQztFQUNsQixnQkFBZ0IsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUNqRSxnQkFBZ0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7RUFDcEMsb0JBQW9CO0VBQ3BCLHdCQUF3QixJQUFJLEVBQUUsTUFBTTtFQUNwQyx3QkFBd0IsUUFBUSxFQUFFLE1BQU07RUFDeEMsNEJBQTRCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDbkUsNEJBQTRCLFdBQVcsRUFBRSxDQUFDO0VBQzFDLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsb0JBQW9CO0VBQ3BCLHdCQUF3QixJQUFJLEVBQUUsUUFBUTtFQUN0Qyx3QkFBd0IsUUFBUSxFQUFFLE1BQU07RUFDeEMsNEJBQTRCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3JELDRCQUE0QixRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7RUFDOUMsNEJBQTRCLFdBQVcsRUFBRSxDQUFDO0VBQzFDLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsaUJBQWlCLENBQUMsQ0FBQztFQUNuQixhQUFhO0VBQ2IsWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztFQUMvQixZQUFZLE9BQU8sUUFBUSxDQUFDO0VBQzVCLFNBQVM7RUFDVCxLQUFLO0VBQ0wsSUFBSSxnQkFBZ0IsR0FBRztFQUN2QixRQUFRLE9BQU8sQ0FBQyxDQUFDLEtBQUs7RUFDdEIsWUFBWSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUNoRSxZQUFZLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxJQUFJLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEYsWUFBWSxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsSUFBSSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ25GLFlBQVksSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDdkQsWUFBWSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLENBQUM7RUFDaEQsU0FBUyxDQUFDO0VBQ1YsS0FBSztFQUNMLElBQUksaUJBQWlCLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRTtFQUM5QixRQUFRLElBQUksTUFBTSxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQztFQUMzRCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUU7RUFDaEIsWUFBWSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztFQUM3QixTQUFTO0VBQ1QsUUFBUSxJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtFQUNoQyxZQUFZLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0VBQzdCLFlBQVksTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7RUFDN0IsU0FBUztFQUNULGFBQWEsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7RUFDekMsWUFBWSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQztFQUNoRyxZQUFZLE1BQU0sR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO0VBQzlGLFNBQVM7RUFDVCxRQUFRLElBQUksR0FBRyxDQUFDLFlBQVksRUFBRTtFQUM5QixZQUFZLEdBQUc7RUFDZixnQkFBZ0IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUM7RUFDekMsZ0JBQWdCLE1BQU0sSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDO0VBQ3hDLGFBQWEsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksR0FBRztFQUMvQyxTQUFTO0VBQ1QsUUFBUSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQztFQUMxRCxLQUFLO0VBQ0wsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFO0VBQzlCLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0VBQy9CLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDeEMsU0FBUztFQUNULEtBQUs7RUFDTCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFO0VBQ2pCLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDL0IsS0FBSztFQUNMLElBQUksR0FBRyxDQUFDLElBQUksRUFBRTtFQUNkLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7RUFDakMsS0FBSztFQUNMOztFQ3pUQSxNQUFNLENBQUMsb0JBQW9CLENBQUMsR0FBRyxLQUFLLENBQUM7RUFDckMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNO0VBQ2hCLElBQUksSUFBSSxlQUFlLEVBQUUsQ0FBQztFQUMxQixDQUFDLENBQUM7Ozs7OzsifQ==
