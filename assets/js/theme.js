(function () {
  'use strict';

  /**
   * Returns the owner document of a given element.
   * 
   * @param node the element
   */
  function ownerDocument(node) {
    return node && node.ownerDocument || document;
  }

  /**
   * Returns the owner window of a given element.
   * 
   * @param node the element
   */

  function ownerWindow(node) {
    var doc = ownerDocument(node);
    return doc && doc.defaultView || window;
  }

  /**
   * Returns one or all computed style properties of an element.
   * 
   * @param node the element
   * @param psuedoElement the style property
   */

  function getComputedStyle(node, psuedoElement) {
    return ownerWindow(node).getComputedStyle(node, psuedoElement);
  }

  var rUpper = /([A-Z])/g;
  function hyphenate(string) {
    return string.replace(rUpper, '-$1').toLowerCase();
  }

  /**
   * Copyright 2013-2014, Facebook, Inc.
   * All rights reserved.
   * https://github.com/facebook/react/blob/2aeb8a2a6beb00617a4217f7f8284924fa2ad819/src/vendor/core/hyphenateStyleName.js
   */
  var msPattern = /^ms-/;
  function hyphenateStyleName(string) {
    return hyphenate(string).replace(msPattern, '-ms-');
  }

  var supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i;
  function isTransform(value) {
    return !!(value && supportedTransforms.test(value));
  }

  function style(node, property) {
    var css = '';
    var transforms = '';

    if (typeof property === 'string') {
      return node.style.getPropertyValue(hyphenateStyleName(property)) || getComputedStyle(node).getPropertyValue(hyphenateStyleName(property));
    }

    Object.keys(property).forEach(function (key) {
      var value = property[key];

      if (!value && value !== 0) {
        node.style.removeProperty(hyphenateStyleName(key));
      } else if (isTransform(key)) {
        transforms += key + "(" + value + ") ";
      } else {
        css += hyphenateStyleName(key) + ": " + value + ";";
      }
    });

    if (transforms) {
      css += "transform: " + transforms + ";";
    }

    node.style.cssText += ";" + css;
  }

  var matchesImpl;
  /**
   * Checks if a given element matches a selector.
   * 
   * @param node the element
   * @param selector the selector
   */

  function matches(node, selector) {
    if (!matchesImpl) {
      var body = document.body;
      var nativeMatch = body.matches || body.matchesSelector || body.webkitMatchesSelector || body.mozMatchesSelector || body.msMatchesSelector;

      matchesImpl = function matchesImpl(n, s) {
        return nativeMatch.call(n, s);
      };
    }

    return matchesImpl(node, selector);
  }

  /**
   * Returns the closest parent element that matches a given selector.
   * 
   * @param node the reference element
   * @param selector the selector to match
   * @param stopAt stop traversing when this element is found
   */

  function closest(node, selector, stopAt) {
    if (node.closest && !stopAt) node.closest(selector);
    var nextNode = node;

    do {
      if (matches(nextNode, selector)) return nextNode;
      nextNode = nextNode.parentElement;
    } while (nextNode && nextNode !== stopAt && nextNode.nodeType === document.ELEMENT_NODE);

    return null;
  }

  /* eslint-disable no-bitwise, no-cond-assign */

  /**
   * Checks if an element contains another given element.
   * 
   * @param context the context element
   * @param node the element to check
   */
  function contains(context, node) {
    // HTML DOM and SVG DOM may have different support levels,
    // so we need to check on context instead of a document root element.
    if (context.contains) return context.contains(node);
    if (context.compareDocumentPosition) return context === node || !!(context.compareDocumentPosition(node) & 16);
  }

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  var __assign = function() {
      __assign = Object.assign || function __assign(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  function __spreadArray(to, from, pack) {
      if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
              if (!ar) ar = Array.prototype.slice.call(from, 0, i);
              ar[i] = from[i];
          }
      }
      return to.concat(ar || from);
  }

  var warning = function () { };
  var invariant = function () { };
  {
      warning = function (check, message) {
          if (!check && typeof console !== 'undefined') {
              console.warn(message);
          }
      };
      invariant = function (check, message) {
          if (!check) {
              throw new Error(message);
          }
      };
  }

  var clamp$1 = function (min, max, v) {
      return Math.min(Math.max(v, min), max);
  };

  var safeMin = 0.001;
  var minDuration = 0.01;
  var maxDuration = 10.0;
  var minDamping = 0.05;
  var maxDamping = 1;
  function findSpring(_a) {
      var _b = _a.duration, duration = _b === void 0 ? 800 : _b, _c = _a.bounce, bounce = _c === void 0 ? 0.25 : _c, _d = _a.velocity, velocity = _d === void 0 ? 0 : _d, _e = _a.mass, mass = _e === void 0 ? 1 : _e;
      var envelope;
      var derivative;
      warning(duration <= maxDuration * 1000, "Spring duration must be 10 seconds or less");
      var dampingRatio = 1 - bounce;
      dampingRatio = clamp$1(minDamping, maxDamping, dampingRatio);
      duration = clamp$1(minDuration, maxDuration, duration / 1000);
      if (dampingRatio < 1) {
          envelope = function (undampedFreq) {
              var exponentialDecay = undampedFreq * dampingRatio;
              var delta = exponentialDecay * duration;
              var a = exponentialDecay - velocity;
              var b = calcAngularFreq(undampedFreq, dampingRatio);
              var c = Math.exp(-delta);
              return safeMin - (a / b) * c;
          };
          derivative = function (undampedFreq) {
              var exponentialDecay = undampedFreq * dampingRatio;
              var delta = exponentialDecay * duration;
              var d = delta * velocity + velocity;
              var e = Math.pow(dampingRatio, 2) * Math.pow(undampedFreq, 2) * duration;
              var f = Math.exp(-delta);
              var g = calcAngularFreq(Math.pow(undampedFreq, 2), dampingRatio);
              var factor = -envelope(undampedFreq) + safeMin > 0 ? -1 : 1;
              return (factor * ((d - e) * f)) / g;
          };
      }
      else {
          envelope = function (undampedFreq) {
              var a = Math.exp(-undampedFreq * duration);
              var b = (undampedFreq - velocity) * duration + 1;
              return -safeMin + a * b;
          };
          derivative = function (undampedFreq) {
              var a = Math.exp(-undampedFreq * duration);
              var b = (velocity - undampedFreq) * (duration * duration);
              return a * b;
          };
      }
      var initialGuess = 5 / duration;
      var undampedFreq = approximateRoot(envelope, derivative, initialGuess);
      duration = duration * 1000;
      if (isNaN(undampedFreq)) {
          return {
              stiffness: 100,
              damping: 10,
              duration: duration,
          };
      }
      else {
          var stiffness = Math.pow(undampedFreq, 2) * mass;
          return {
              stiffness: stiffness,
              damping: dampingRatio * 2 * Math.sqrt(mass * stiffness),
              duration: duration,
          };
      }
  }
  var rootIterations = 12;
  function approximateRoot(envelope, derivative, initialGuess) {
      var result = initialGuess;
      for (var i = 1; i < rootIterations; i++) {
          result = result - envelope(result) / derivative(result);
      }
      return result;
  }
  function calcAngularFreq(undampedFreq, dampingRatio) {
      return undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
  }

  var durationKeys = ["duration", "bounce"];
  var physicsKeys = ["stiffness", "damping", "mass"];
  function isSpringType(options, keys) {
      return keys.some(function (key) { return options[key] !== undefined; });
  }
  function getSpringOptions(options) {
      var springOptions = __assign({ velocity: 0.0, stiffness: 100, damping: 10, mass: 1.0, isResolvedFromDuration: false }, options);
      if (!isSpringType(options, physicsKeys) &&
          isSpringType(options, durationKeys)) {
          var derived = findSpring(options);
          springOptions = __assign(__assign(__assign({}, springOptions), derived), { velocity: 0.0, mass: 1.0 });
          springOptions.isResolvedFromDuration = true;
      }
      return springOptions;
  }
  function spring(_a) {
      var _b = _a.from, from = _b === void 0 ? 0.0 : _b, _c = _a.to, to = _c === void 0 ? 1.0 : _c, _d = _a.restSpeed, restSpeed = _d === void 0 ? 2 : _d, restDelta = _a.restDelta, options = __rest(_a, ["from", "to", "restSpeed", "restDelta"]);
      var state = { done: false, value: from };
      var _e = getSpringOptions(options), stiffness = _e.stiffness, damping = _e.damping, mass = _e.mass, velocity = _e.velocity, duration = _e.duration, isResolvedFromDuration = _e.isResolvedFromDuration;
      var resolveSpring = zero;
      var resolveVelocity = zero;
      function createSpring() {
          var initialVelocity = velocity ? -(velocity / 1000) : 0.0;
          var initialDelta = to - from;
          var dampingRatio = damping / (2 * Math.sqrt(stiffness * mass));
          var undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
          restDelta !== null && restDelta !== void 0 ? restDelta : (restDelta = Math.abs(to - from) <= 1 ? 0.01 : 0.4);
          if (dampingRatio < 1) {
              var angularFreq_1 = calcAngularFreq(undampedAngularFreq, dampingRatio);
              resolveSpring = function (t) {
                  var envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                  return (to -
                      envelope *
                          (((initialVelocity +
                              dampingRatio * undampedAngularFreq * initialDelta) /
                              angularFreq_1) *
                              Math.sin(angularFreq_1 * t) +
                              initialDelta * Math.cos(angularFreq_1 * t)));
              };
              resolveVelocity = function (t) {
                  var envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                  return (dampingRatio *
                      undampedAngularFreq *
                      envelope *
                      ((Math.sin(angularFreq_1 * t) *
                          (initialVelocity +
                              dampingRatio *
                                  undampedAngularFreq *
                                  initialDelta)) /
                          angularFreq_1 +
                          initialDelta * Math.cos(angularFreq_1 * t)) -
                      envelope *
                          (Math.cos(angularFreq_1 * t) *
                              (initialVelocity +
                                  dampingRatio *
                                      undampedAngularFreq *
                                      initialDelta) -
                              angularFreq_1 *
                                  initialDelta *
                                  Math.sin(angularFreq_1 * t)));
              };
          }
          else if (dampingRatio === 1) {
              resolveSpring = function (t) {
                  return to -
                      Math.exp(-undampedAngularFreq * t) *
                          (initialDelta +
                              (initialVelocity + undampedAngularFreq * initialDelta) *
                                  t);
              };
          }
          else {
              var dampedAngularFreq_1 = undampedAngularFreq * Math.sqrt(dampingRatio * dampingRatio - 1);
              resolveSpring = function (t) {
                  var envelope = Math.exp(-dampingRatio * undampedAngularFreq * t);
                  var freqForT = Math.min(dampedAngularFreq_1 * t, 300);
                  return (to -
                      (envelope *
                          ((initialVelocity +
                              dampingRatio * undampedAngularFreq * initialDelta) *
                              Math.sinh(freqForT) +
                              dampedAngularFreq_1 *
                                  initialDelta *
                                  Math.cosh(freqForT))) /
                          dampedAngularFreq_1);
              };
          }
      }
      createSpring();
      return {
          next: function (t) {
              var current = resolveSpring(t);
              if (!isResolvedFromDuration) {
                  var currentVelocity = resolveVelocity(t) * 1000;
                  var isBelowVelocityThreshold = Math.abs(currentVelocity) <= restSpeed;
                  var isBelowDisplacementThreshold = Math.abs(to - current) <= restDelta;
                  state.done =
                      isBelowVelocityThreshold && isBelowDisplacementThreshold;
              }
              else {
                  state.done = t >= duration;
              }
              state.value = state.done ? to : current;
              return state;
          },
          flipTarget: function () {
              var _a;
              velocity = -velocity;
              _a = [to, from], from = _a[0], to = _a[1];
              createSpring();
          },
      };
  }
  spring.needsInterpolation = function (a, b) {
      return typeof a === "string" || typeof b === "string";
  };
  var zero = function (_t) { return 0; };

  var progress = function (from, to, value) {
      var toFromDifference = to - from;
      return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
  };

  var mix = function (from, to, progress) {
      return -progress * from + progress * to + from;
  };

  var clamp = function (min, max) { return function (v) {
      return Math.max(Math.min(v, max), min);
  }; };
  var sanitize = function (v) { return (v % 1 ? Number(v.toFixed(5)) : v); };
  var floatRegex = /(-)?([\d]*\.?[\d])+/g;
  var colorRegex = /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))/gi;
  var singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i;
  function isString(v) {
      return typeof v === 'string';
  }

  var number = {
      test: function (v) { return typeof v === 'number'; },
      parse: parseFloat,
      transform: function (v) { return v; },
  };
  var alpha = __assign(__assign({}, number), { transform: clamp(0, 1) });
  __assign(__assign({}, number), { default: 1 });

  var createUnitType = function (unit) { return ({
      test: function (v) {
          return isString(v) && v.endsWith(unit) && v.split(' ').length === 1;
      },
      parse: parseFloat,
      transform: function (v) { return "" + v + unit; },
  }); };
  var percent = createUnitType('%');
  __assign(__assign({}, percent), { parse: function (v) { return percent.parse(v) / 100; }, transform: function (v) { return percent.transform(v * 100); } });

  var isColorString = function (type, testProp) { return function (v) {
      return Boolean((isString(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
          (testProp && Object.prototype.hasOwnProperty.call(v, testProp)));
  }; };
  var splitColor = function (aName, bName, cName) { return function (v) {
      var _a;
      if (!isString(v))
          return v;
      var _b = v.match(floatRegex), a = _b[0], b = _b[1], c = _b[2], alpha = _b[3];
      return _a = {},
          _a[aName] = parseFloat(a),
          _a[bName] = parseFloat(b),
          _a[cName] = parseFloat(c),
          _a.alpha = alpha !== undefined ? parseFloat(alpha) : 1,
          _a;
  }; };

  var hsla = {
      test: isColorString('hsl', 'hue'),
      parse: splitColor('hue', 'saturation', 'lightness'),
      transform: function (_a) {
          var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$1 = _b === void 0 ? 1 : _b;
          return ('hsla(' +
              Math.round(hue) +
              ', ' +
              percent.transform(sanitize(saturation)) +
              ', ' +
              percent.transform(sanitize(lightness)) +
              ', ' +
              sanitize(alpha.transform(alpha$1)) +
              ')');
      },
  };

  var clampRgbUnit = clamp(0, 255);
  var rgbUnit = __assign(__assign({}, number), { transform: function (v) { return Math.round(clampRgbUnit(v)); } });
  var rgba = {
      test: isColorString('rgb', 'red'),
      parse: splitColor('red', 'green', 'blue'),
      transform: function (_a) {
          var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$1 = _b === void 0 ? 1 : _b;
          return 'rgba(' +
              rgbUnit.transform(red) +
              ', ' +
              rgbUnit.transform(green) +
              ', ' +
              rgbUnit.transform(blue) +
              ', ' +
              sanitize(alpha.transform(alpha$1)) +
              ')';
      },
  };

  function parseHex(v) {
      var r = '';
      var g = '';
      var b = '';
      var a = '';
      if (v.length > 5) {
          r = v.substr(1, 2);
          g = v.substr(3, 2);
          b = v.substr(5, 2);
          a = v.substr(7, 2);
      }
      else {
          r = v.substr(1, 1);
          g = v.substr(2, 1);
          b = v.substr(3, 1);
          a = v.substr(4, 1);
          r += r;
          g += g;
          b += b;
          a += a;
      }
      return {
          red: parseInt(r, 16),
          green: parseInt(g, 16),
          blue: parseInt(b, 16),
          alpha: a ? parseInt(a, 16) / 255 : 1,
      };
  }
  var hex = {
      test: isColorString('#'),
      parse: parseHex,
      transform: rgba.transform,
  };

  var color = {
      test: function (v) { return rgba.test(v) || hex.test(v) || hsla.test(v); },
      parse: function (v) {
          if (rgba.test(v)) {
              return rgba.parse(v);
          }
          else if (hsla.test(v)) {
              return hsla.parse(v);
          }
          else {
              return hex.parse(v);
          }
      },
      transform: function (v) {
          return isString(v)
              ? v
              : v.hasOwnProperty('red')
                  ? rgba.transform(v)
                  : hsla.transform(v);
      },
  };

  var colorToken = '${c}';
  var numberToken = '${n}';
  function test(v) {
      var _a, _b, _c, _d;
      return (isNaN(v) &&
          isString(v) &&
          ((_b = (_a = v.match(floatRegex)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + ((_d = (_c = v.match(colorRegex)) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0);
  }
  function analyse$1(v) {
      var values = [];
      var numColors = 0;
      var colors = v.match(colorRegex);
      if (colors) {
          numColors = colors.length;
          v = v.replace(colorRegex, colorToken);
          values.push.apply(values, colors.map(color.parse));
      }
      var numbers = v.match(floatRegex);
      if (numbers) {
          v = v.replace(floatRegex, numberToken);
          values.push.apply(values, numbers.map(number.parse));
      }
      return { values: values, numColors: numColors, tokenised: v };
  }
  function parse(v) {
      return analyse$1(v).values;
  }
  function createTransformer(v) {
      var _a = analyse$1(v), values = _a.values, numColors = _a.numColors, tokenised = _a.tokenised;
      var numValues = values.length;
      return function (v) {
          var output = tokenised;
          for (var i = 0; i < numValues; i++) {
              output = output.replace(i < numColors ? colorToken : numberToken, i < numColors ? color.transform(v[i]) : sanitize(v[i]));
          }
          return output;
      };
  }
  var convertNumbersToZero = function (v) {
      return typeof v === 'number' ? 0 : v;
  };
  function getAnimatableNone(v) {
      var parsed = parse(v);
      var transformer = createTransformer(v);
      return transformer(parsed.map(convertNumbersToZero));
  }
  var complex = { test: test, parse: parse, createTransformer: createTransformer, getAnimatableNone: getAnimatableNone };

  var mixLinearColor = function (from, to, v) {
      var fromExpo = from * from;
      var toExpo = to * to;
      return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
  };
  var colorTypes = [hex, rgba, hsla];
  var getColorType = function (v) {
      return colorTypes.find(function (type) { return type.test(v); });
  };
  var notAnimatable = function (color) {
      return "'" + color + "' is not an animatable color. Use the equivalent color code instead.";
  };
  var mixColor = function (from, to) {
      var fromColorType = getColorType(from);
      var toColorType = getColorType(to);
      invariant(!!fromColorType, notAnimatable(from));
      invariant(!!toColorType, notAnimatable(to));
      invariant(fromColorType.transform === toColorType.transform, "Both colors must be hex/RGBA, OR both must be HSLA.");
      var fromColor = fromColorType.parse(from);
      var toColor = toColorType.parse(to);
      var blended = __assign({}, fromColor);
      var mixFunc = fromColorType === hsla ? mix : mixLinearColor;
      return function (v) {
          for (var key in blended) {
              if (key !== "alpha") {
                  blended[key] = mixFunc(fromColor[key], toColor[key], v);
              }
          }
          blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
          return fromColorType.transform(blended);
      };
  };

  var isNum = function (v) { return typeof v === 'number'; };

  var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
  var pipe = function () {
      var transformers = [];
      for (var _i = 0; _i < arguments.length; _i++) {
          transformers[_i] = arguments[_i];
      }
      return transformers.reduce(combineFunctions);
  };

  function getMixer(origin, target) {
      if (isNum(origin)) {
          return function (v) { return mix(origin, target, v); };
      }
      else if (color.test(origin)) {
          return mixColor(origin, target);
      }
      else {
          return mixComplex(origin, target);
      }
  }
  var mixArray = function (from, to) {
      var output = __spreadArray([], from);
      var numValues = output.length;
      var blendValue = from.map(function (fromThis, i) { return getMixer(fromThis, to[i]); });
      return function (v) {
          for (var i = 0; i < numValues; i++) {
              output[i] = blendValue[i](v);
          }
          return output;
      };
  };
  var mixObject = function (origin, target) {
      var output = __assign(__assign({}, origin), target);
      var blendValue = {};
      for (var key in output) {
          if (origin[key] !== undefined && target[key] !== undefined) {
              blendValue[key] = getMixer(origin[key], target[key]);
          }
      }
      return function (v) {
          for (var key in blendValue) {
              output[key] = blendValue[key](v);
          }
          return output;
      };
  };
  function analyse(value) {
      var parsed = complex.parse(value);
      var numValues = parsed.length;
      var numNumbers = 0;
      var numRGB = 0;
      var numHSL = 0;
      for (var i = 0; i < numValues; i++) {
          if (numNumbers || typeof parsed[i] === "number") {
              numNumbers++;
          }
          else {
              if (parsed[i].hue !== undefined) {
                  numHSL++;
              }
              else {
                  numRGB++;
              }
          }
      }
      return { parsed: parsed, numNumbers: numNumbers, numRGB: numRGB, numHSL: numHSL };
  }
  var mixComplex = function (origin, target) {
      var template = complex.createTransformer(target);
      var originStats = analyse(origin);
      var targetStats = analyse(target);
      invariant(originStats.numHSL === targetStats.numHSL &&
          originStats.numRGB === targetStats.numRGB &&
          originStats.numNumbers >= targetStats.numNumbers, "Complex values '" + origin + "' and '" + target + "' too different to mix. Ensure all colors are of the same type.");
      return pipe(mixArray(originStats.parsed, targetStats.parsed), template);
  };

  var mixNumber = function (from, to) { return function (p) { return mix(from, to, p); }; };
  function detectMixerFactory(v) {
      if (typeof v === 'number') {
          return mixNumber;
      }
      else if (typeof v === 'string') {
          if (color.test(v)) {
              return mixColor;
          }
          else {
              return mixComplex;
          }
      }
      else if (Array.isArray(v)) {
          return mixArray;
      }
      else if (typeof v === 'object') {
          return mixObject;
      }
  }
  function createMixers(output, ease, customMixer) {
      var mixers = [];
      var mixerFactory = customMixer || detectMixerFactory(output[0]);
      var numMixers = output.length - 1;
      for (var i = 0; i < numMixers; i++) {
          var mixer = mixerFactory(output[i], output[i + 1]);
          if (ease) {
              var easingFunction = Array.isArray(ease) ? ease[i] : ease;
              mixer = pipe(easingFunction, mixer);
          }
          mixers.push(mixer);
      }
      return mixers;
  }
  function fastInterpolate(_a, _b) {
      var from = _a[0], to = _a[1];
      var mixer = _b[0];
      return function (v) { return mixer(progress(from, to, v)); };
  }
  function slowInterpolate(input, mixers) {
      var inputLength = input.length;
      var lastInputIndex = inputLength - 1;
      return function (v) {
          var mixerIndex = 0;
          var foundMixerIndex = false;
          if (v <= input[0]) {
              foundMixerIndex = true;
          }
          else if (v >= input[lastInputIndex]) {
              mixerIndex = lastInputIndex - 1;
              foundMixerIndex = true;
          }
          if (!foundMixerIndex) {
              var i = 1;
              for (; i < inputLength; i++) {
                  if (input[i] > v || i === lastInputIndex) {
                      break;
                  }
              }
              mixerIndex = i - 1;
          }
          var progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
          return mixers[mixerIndex](progressInRange);
      };
  }
  function interpolate(input, output, _a) {
      var _b = _a === void 0 ? {} : _a, _c = _b.clamp, isClamp = _c === void 0 ? true : _c, ease = _b.ease, mixer = _b.mixer;
      var inputLength = input.length;
      invariant(inputLength === output.length, 'Both input and output ranges must be the same length');
      invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1, 'Array of easing functions must be of length `input.length - 1`, as it applies to the transitions **between** the defined values.');
      if (input[0] > input[inputLength - 1]) {
          input = [].concat(input);
          output = [].concat(output);
          input.reverse();
          output.reverse();
      }
      var mixers = createMixers(output, ease, mixer);
      var interpolator = inputLength === 2
          ? fastInterpolate(input, mixers)
          : slowInterpolate(input, mixers);
      return isClamp
          ? function (v) { return interpolator(clamp$1(input[0], input[inputLength - 1], v)); }
          : interpolator;
  }

  var reverseEasing = function (easing) { return function (p) { return 1 - easing(1 - p); }; };
  var mirrorEasing = function (easing) { return function (p) {
      return p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
  }; };
  var createExpoIn = function (power) { return function (p) { return Math.pow(p, power); }; };
  var createBackIn = function (power) { return function (p) {
      return p * p * ((power + 1) * p - power);
  }; };
  var createAnticipate = function (power) {
      var backEasing = createBackIn(power);
      return function (p) {
          return (p *= 2) < 1
              ? 0.5 * backEasing(p)
              : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
      };
  };

  var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
  var BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
  var BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
  var BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
  var easeIn = createExpoIn(2);
  reverseEasing(easeIn);
  var easeInOut = mirrorEasing(easeIn);
  var circIn = function (p) { return 1 - Math.sin(Math.acos(p)); };
  var circOut = reverseEasing(circIn);
  mirrorEasing(circOut);
  var backIn = createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
  var backOut = reverseEasing(backIn);
  mirrorEasing(backIn);
  createAnticipate(DEFAULT_OVERSHOOT_STRENGTH);
  var ca = 4356.0 / 361.0;
  var cb = 35442.0 / 1805.0;
  var cc = 16061.0 / 1805.0;
  var bounceOut = function (p) {
      if (p === 1 || p === 0)
          return p;
      var p2 = p * p;
      return p < BOUNCE_FIRST_THRESHOLD
          ? 7.5625 * p2
          : p < BOUNCE_SECOND_THRESHOLD
              ? 9.075 * p2 - 9.9 * p + 3.4
              : p < BOUNCE_THIRD_THRESHOLD
                  ? ca * p2 - cb * p + cc
                  : 10.8 * p * p - 20.52 * p + 10.72;
  };
  reverseEasing(bounceOut);

  function defaultEasing(values, easing) {
      return values.map(function () { return easing || easeInOut; }).splice(0, values.length - 1);
  }
  function defaultOffset(values) {
      var numValues = values.length;
      return values.map(function (_value, i) {
          return i !== 0 ? i / (numValues - 1) : 0;
      });
  }
  function convertOffsetToTimes(offset, duration) {
      return offset.map(function (o) { return o * duration; });
  }
  function keyframes(_a) {
      var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 1 : _c, ease = _a.ease, offset = _a.offset, _d = _a.duration, duration = _d === void 0 ? 300 : _d;
      var state = { done: false, value: from };
      var values = Array.isArray(to) ? to : [from, to];
      var times = convertOffsetToTimes(offset && offset.length === values.length
          ? offset
          : defaultOffset(values), duration);
      function createInterpolator() {
          return interpolate(times, values, {
              ease: Array.isArray(ease) ? ease : defaultEasing(values, ease),
          });
      }
      var interpolator = createInterpolator();
      return {
          next: function (t) {
              state.value = interpolator(t);
              state.done = t >= duration;
              return state;
          },
          flipTarget: function () {
              values.reverse();
              interpolator = createInterpolator();
          },
      };
  }

  function decay(_a) {
      var _b = _a.velocity, velocity = _b === void 0 ? 0 : _b, _c = _a.from, from = _c === void 0 ? 0 : _c, _d = _a.power, power = _d === void 0 ? 0.8 : _d, _e = _a.timeConstant, timeConstant = _e === void 0 ? 350 : _e, _f = _a.restDelta, restDelta = _f === void 0 ? 0.5 : _f, modifyTarget = _a.modifyTarget;
      var state = { done: false, value: from };
      var amplitude = power * velocity;
      var ideal = from + amplitude;
      var target = modifyTarget === undefined ? ideal : modifyTarget(ideal);
      if (target !== ideal)
          amplitude = target - from;
      return {
          next: function (t) {
              var delta = -amplitude * Math.exp(-t / timeConstant);
              state.done = !(delta > restDelta || delta < -restDelta);
              state.value = state.done ? target : target + delta;
              return state;
          },
          flipTarget: function () { },
      };
  }

  var types = { keyframes: keyframes, spring: spring, decay: decay };
  function detectAnimationFromOptions(config) {
      if (Array.isArray(config.to)) {
          return keyframes;
      }
      else if (types[config.type]) {
          return types[config.type];
      }
      var keys = new Set(Object.keys(config));
      if (keys.has("ease") ||
          (keys.has("duration") && !keys.has("dampingRatio"))) {
          return keyframes;
      }
      else if (keys.has("dampingRatio") ||
          keys.has("stiffness") ||
          keys.has("mass") ||
          keys.has("damping") ||
          keys.has("restSpeed") ||
          keys.has("restDelta")) {
          return spring;
      }
      return keyframes;
  }

  var defaultTimestep = (1 / 60) * 1000;
  var getCurrentTime = typeof performance !== "undefined"
      ? function () { return performance.now(); }
      : function () { return Date.now(); };
  var onNextFrame = typeof window !== "undefined"
      ? function (callback) {
          return window.requestAnimationFrame(callback);
      }
      : function (callback) {
          return setTimeout(function () { return callback(getCurrentTime()); }, defaultTimestep);
      };

  function createRenderStep(runNextFrame) {
      var toRun = [];
      var toRunNextFrame = [];
      var numToRun = 0;
      var isProcessing = false;
      var toKeepAlive = new WeakSet();
      var step = {
          schedule: function (callback, keepAlive, immediate) {
              if (keepAlive === void 0) { keepAlive = false; }
              if (immediate === void 0) { immediate = false; }
              var addToCurrentFrame = immediate && isProcessing;
              var buffer = addToCurrentFrame ? toRun : toRunNextFrame;
              if (keepAlive)
                  toKeepAlive.add(callback);
              if (buffer.indexOf(callback) === -1) {
                  buffer.push(callback);
                  if (addToCurrentFrame && isProcessing)
                      numToRun = toRun.length;
              }
              return callback;
          },
          cancel: function (callback) {
              var index = toRunNextFrame.indexOf(callback);
              if (index !== -1)
                  toRunNextFrame.splice(index, 1);
              toKeepAlive.delete(callback);
          },
          process: function (frameData) {
              var _a;
              isProcessing = true;
              _a = [toRunNextFrame, toRun], toRun = _a[0], toRunNextFrame = _a[1];
              toRunNextFrame.length = 0;
              numToRun = toRun.length;
              if (numToRun) {
                  for (var i = 0; i < numToRun; i++) {
                      var callback = toRun[i];
                      callback(frameData);
                      if (toKeepAlive.has(callback)) {
                          step.schedule(callback);
                          runNextFrame();
                      }
                  }
              }
              isProcessing = false;
          },
      };
      return step;
  }

  var maxElapsed = 40;
  var useDefaultElapsed = true;
  var runNextFrame = false;
  var isProcessing = false;
  var frame = {
      delta: 0,
      timestamp: 0
  };
  var stepsOrder = ["read", "update", "preRender", "render", "postRender"];
  var steps = /*#__PURE__*/stepsOrder.reduce(function (acc, key) {
      acc[key] = createRenderStep(function () {
          return runNextFrame = true;
      });
      return acc;
  }, {});
  var sync = /*#__PURE__*/stepsOrder.reduce(function (acc, key) {
      var step = steps[key];
      acc[key] = function (process, keepAlive, immediate) {
          if (keepAlive === void 0) {
              keepAlive = false;
          }
          if (immediate === void 0) {
              immediate = false;
          }
          if (!runNextFrame) startLoop();
          return step.schedule(process, keepAlive, immediate);
      };
      return acc;
  }, {});
  var cancelSync = /*#__PURE__*/stepsOrder.reduce(function (acc, key) {
      acc[key] = steps[key].cancel;
      return acc;
  }, {});
  var processStep = function (stepId) {
      return steps[stepId].process(frame);
  };
  var processFrame = function (timestamp) {
      runNextFrame = false;
      frame.delta = useDefaultElapsed ? defaultTimestep : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1);
      frame.timestamp = timestamp;
      isProcessing = true;
      stepsOrder.forEach(processStep);
      isProcessing = false;
      if (runNextFrame) {
          useDefaultElapsed = false;
          onNextFrame(processFrame);
      }
  };
  var startLoop = function () {
      runNextFrame = true;
      useDefaultElapsed = true;
      if (!isProcessing) onNextFrame(processFrame);
  };

  function loopElapsed(elapsed, duration, delay) {
      if (delay === void 0) { delay = 0; }
      return elapsed - duration - delay;
  }
  function reverseElapsed(elapsed, duration, delay, isForwardPlayback) {
      if (delay === void 0) { delay = 0; }
      if (isForwardPlayback === void 0) { isForwardPlayback = true; }
      return isForwardPlayback
          ? loopElapsed(duration + -elapsed, duration, delay)
          : duration - (elapsed - duration) + delay;
  }
  function hasRepeatDelayElapsed(elapsed, duration, delay, isForwardPlayback) {
      return isForwardPlayback ? elapsed >= duration + delay : elapsed <= -delay;
  }

  var framesync = function (update) {
      var passTimestamp = function (_a) {
          var delta = _a.delta;
          return update(delta);
      };
      return {
          start: function () { return sync.update(passTimestamp, true); },
          stop: function () { return cancelSync.update(passTimestamp); },
      };
  };
  function animate(_a) {
      var _b, _c;
      var from = _a.from, _d = _a.autoplay, autoplay = _d === void 0 ? true : _d, _e = _a.driver, driver = _e === void 0 ? framesync : _e, _f = _a.elapsed, elapsed = _f === void 0 ? 0 : _f, _g = _a.repeat, repeatMax = _g === void 0 ? 0 : _g, _h = _a.repeatType, repeatType = _h === void 0 ? "loop" : _h, _j = _a.repeatDelay, repeatDelay = _j === void 0 ? 0 : _j, onPlay = _a.onPlay, onStop = _a.onStop, onComplete = _a.onComplete, onRepeat = _a.onRepeat, onUpdate = _a.onUpdate, options = __rest(_a, ["from", "autoplay", "driver", "elapsed", "repeat", "repeatType", "repeatDelay", "onPlay", "onStop", "onComplete", "onRepeat", "onUpdate"]);
      var to = options.to;
      var driverControls;
      var repeatCount = 0;
      var computedDuration = options.duration;
      var latest;
      var isComplete = false;
      var isForwardPlayback = true;
      var interpolateFromNumber;
      var animator = detectAnimationFromOptions(options);
      if ((_c = (_b = animator).needsInterpolation) === null || _c === void 0 ? void 0 : _c.call(_b, from, to)) {
          interpolateFromNumber = interpolate([0, 100], [from, to], {
              clamp: false,
          });
          from = 0;
          to = 100;
      }
      var animation = animator(__assign(__assign({}, options), { from: from, to: to }));
      function repeat() {
          repeatCount++;
          if (repeatType === "reverse") {
              isForwardPlayback = repeatCount % 2 === 0;
              elapsed = reverseElapsed(elapsed, computedDuration, repeatDelay, isForwardPlayback);
          }
          else {
              elapsed = loopElapsed(elapsed, computedDuration, repeatDelay);
              if (repeatType === "mirror")
                  animation.flipTarget();
          }
          isComplete = false;
          onRepeat && onRepeat();
      }
      function complete() {
          driverControls.stop();
          onComplete && onComplete();
      }
      function update(delta) {
          if (!isForwardPlayback)
              delta = -delta;
          elapsed += delta;
          if (!isComplete) {
              var state = animation.next(Math.max(0, elapsed));
              latest = state.value;
              if (interpolateFromNumber)
                  latest = interpolateFromNumber(latest);
              isComplete = isForwardPlayback ? state.done : elapsed <= 0;
          }
          onUpdate === null || onUpdate === void 0 ? void 0 : onUpdate(latest);
          if (isComplete) {
              if (repeatCount === 0)
                  computedDuration !== null && computedDuration !== void 0 ? computedDuration : (computedDuration = elapsed);
              if (repeatCount < repeatMax) {
                  hasRepeatDelayElapsed(elapsed, computedDuration, repeatDelay, isForwardPlayback) && repeat();
              }
              else {
                  complete();
              }
          }
      }
      function play() {
          onPlay === null || onPlay === void 0 ? void 0 : onPlay();
          driverControls = driver(update);
          driverControls.start();
      }
      autoplay && play();
      return {
          stop: function () {
              onStop === null || onStop === void 0 ? void 0 : onStop();
              driverControls.stop();
          },
      };
  }

  (function () {
      if (window.CustomEvent)
          return false;
      function CustomEvent(event, params) {
          params = params || {
              bubbles: false,
              cancelable: false,
              detail: undefined,
          };
          var evt = document.createEvent("CustomEvent");
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
      }
      CustomEvent.prototype = window.Event.prototype;
      window["CustomEvent"] = CustomEvent;
  })();
  class Theme {
      constructor(options = {}) {
          this.mobileHandler = (section) => {
              this.scrollIfNeeded(section);
              return true;
          };
          this.desktopHandler = (section) => {
              if (this.scene) {
                  var offset = this.scene.scrollOffset();
                  var index = section.getAttribute("data-index");
                  if (index) {
                      this.scrollTo(offset * (index + 1));
                  }
                  return true;
              }
              else if (this.fullpage && this.sections) {
                  const index = [...this.sections].indexOf(section);
                  if (index >= 0)
                      this.fullpage.moveTo(index + 1);
                  else {
                      [].forEach.call(this.sections, (sec, index) => {
                          if (contains(sec, section)) {
                              this.fullpage.moveTo(index + 1);
                          }
                      });
                  }
              }
              else {
                  this.scrollIfNeeded(section);
              }
              return true;
          };
          this.scrollHandler = () => {
              var hash = location.hash;
              if (hash.replace("#!", "").trim() == "" || hash.replace("#", "").trim() == "" || hash.split("/").length > 1) {
                  return false;
              }
              var newHash = hash.replace("#!", "").replace("#", "");
              if (newHash.indexOf("section-") >= 0) {
                  let elm = document.querySelector("#" + newHash);
                  if (elm) {
                      return this.handler(elm);
                  }
                  else {
                      console.warn("#" + newHash + " was not found, did you forget to enable permalinks?");
                      return false;
                  }
              }
              else {
                  let section = document.querySelector("#section-" + newHash);
                  if (section) {
                      return this.handler(section);
                  }
                  else if (document.querySelector("#" + newHash)) {
                      return this.handler(document.querySelector("#" + newHash));
                  }
              }
              document.querySelector(".content").classList.remove("active");
              let menu_items = document.querySelector("#menu-main-menu li a");
              let menu_item = document.querySelector('#menu-main-menu li a[href^="' + this.escapeRegExp(hash) + '"]');
              if (menu_item) {
                  [].forEach.call(menu_items, (item) => {
                      if (item != menu_item)
                          item.classList.remove("active");
                  });
                  menu_item.classList.add("active");
              }
              else {
                  var item = document.querySelector('a[href^="' + this.escapeRegExp(hash) + '"]');
                  if (item && item.hasAttribute("no-hash")) {
                      location.hash = "";
                  }
              }
              return null;
          };
          this.getScrollPosition = (el) => ({
              x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
              y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop,
          });
          this.showTab = (id) => {
              var tab = document.querySelector("#" + id);
              if (tab) {
                  var tabs = closest(tab, ".na-tabs");
                  let tabContents = tabs.querySelectorAll(".tab-content");
                  [].forEach.call(tabContents, (tabContent) => {
                      tabContent.classList.remove("active");
                  });
                  let tabNavs = tabs.querySelectorAll(".tab-nav");
                  [].forEach.call(tabNavs, (tabNav) => {
                      tabNav.classList.remove("active");
                  });
                  setTimeout(function () {
                      var _a;
                      tab.classList.add("active");
                      (_a = closest(tab, "li")) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                      let nav = document.querySelector('a[href="#' + id + '"]');
                      nav === null || nav === void 0 ? void 0 : nav.classList.add("active");
                  }, 400);
              }
          };
          this.sectionObserver = () => {
              if ("IntersectionObserver" in window) {
                  const observer = new IntersectionObserver((entries) => {
                      entries.forEach((entry) => {
                          if (entry.intersectionRatio > 0) {
                              entry.target.classList.add("in-once");
                              entry.target.classList.add("in");
                              entry.target.classList.remove("out");
                          }
                          else {
                              entry.target.classList.add("out");
                              entry.target.classList.remove("in");
                          }
                      });
                  });
                  document.querySelectorAll(".section").forEach((section) => {
                      if (section.getAttribute("is-observed") != "true") {
                          section.setAttribute("is-observed", "true");
                          observer.observe(section);
                      }
                  });
              }
          };
          this.options = options;
          this.controller = null;
          this.scene = null;
          this.fullpage = null;
          this.sections = null;
          let header = document.querySelector("#masthead");
          this.headerOffset = 0;
          if (header && header.classList.contains("fixed-top")) {
              this.headerOffset = header.clientHeight;
          }
          this.load();
      }
      load() {
          var _a;
          this.innerScroll = document.querySelector("#inner-scroll");
          let count = (_a = this.innerScroll) === null || _a === void 0 ? void 0 : _a.children.length;
          if (this.options.scrolling && window.innerWidth > this.options.mobile) {
              var widthPercent = 100 / count;
              switch (parseInt(this.options.scrolling, 10)) {
                  case 2:
                      if (count > 0) {
                          [].forEach.call(this.innerScroll.children, (slide) => {
                              slide.style.width = widthPercent + "%";
                              slide.style.height = window.innerHeight + "px";
                          });
                          this.innerScroll.style.width = 100 * count + "%";
                          this.controller = new ScrollMagic.Controller({});
                          var wipeAnimation = new TimelineMax();
                          for (let i = 0; i < count; i++) {
                              wipeAnimation
                                  .to("#inner-scroll", 0.5, {
                                  z: -300,
                                  delay: 1,
                              })
                                  .to("#inner-scroll", 2, {
                                  x: "-" + widthPercent * (i + 1) + "%",
                              })
                                  .to("#inner-scroll", 0.5, {
                                  z: 0,
                              });
                          }
                          this.scene = new ScrollMagic.Scene({
                              triggerElement: ".scrolling-container--2",
                              triggerHook: "onLeave",
                              duration: "500%",
                          })
                              .setPin(".scrolling-container--2")
                              .setTween(wipeAnimation)
                              .addTo(this.controller);
                          var _current = 0;
                          var offset = 0.3;
                          this.scene.on("progress", function (event) {
                              var v = event.progress * count + offset + 1;
                              if (v > count) {
                                  v = count;
                              }
                              v = parseInt(v.toString(), 10);
                              if (v != _current) {
                                  [].forEach.call(this.innerScroll.children, function (slide) {
                                      slide.classList.remove("in");
                                  });
                                  this.innerScroll.children[v].classList.add("in");
                                  _current = v;
                              }
                          });
                      }
                      break;
                  case 3:
                      if (count > 0) {
                          [].forEach.call(this.innerScroll.children, (slide) => {
                              slide.style.height = window.innerHeight + "px";
                          });
                          this.controller = new ScrollMagic.Controller({
                              globalSceneOptions: {
                                  triggerHook: "onLeave",
                              },
                          });
                          [].forEach.call(this.innerScroll.children, (slide) => {
                              new ScrollMagic.Scene({
                                  triggerElement: slide,
                              })
                                  .setPin(slide, { pushFollowers: false })
                                  .addTo(this.controller);
                          });
                      }
                      break;
                  case 4:
                      if (count > 0) {
                          this.controller = new ScrollMagic.Controller();
                          let wipeAnimation = new TimelineMax();
                          let is_x = true;
                          let is_negative = true;
                          [].forEach.call(this.innerScroll.children, (slide, i) => {
                              if (i == 0) {
                                  wipeAnimation.fromTo(slide, 1, {
                                      x: "0%",
                                      y: 0,
                                  }, {
                                      x: "0%",
                                      y: "0%",
                                      ease: Linear.easeNone,
                                  });
                                  return;
                              }
                              var dir = {};
                              if (is_x) {
                                  if (is_negative) {
                                      dir["x"] = "-100%";
                                  }
                                  else {
                                      dir["x"] = "100%";
                                  }
                                  is_negative = !is_negative;
                              }
                              else {
                                  if (is_negative) {
                                      dir["y"] = "-100%";
                                  }
                                  else {
                                      dir["y"] = "100%";
                                  }
                                  is_negative = !is_negative;
                              }
                              is_x = !is_x;
                              if (i % 2 == 0 && i != 0) {
                                  is_x = !is_x;
                              }
                              wipeAnimation.fromTo(slides[i], 1, dir, {
                                  x: "0%",
                                  y: "0%",
                                  ease: Linear.easeNone,
                              });
                          });
                          this.scene = new ScrollMagic.Scene({
                              loglevel: 2,
                              triggerElement: "#inner-scroll",
                              triggerHook: "onLeave",
                              duration: 100 * count + "%",
                          })
                              .setPin("#inner-scroll")
                              .setTween(wipeAnimation)
                              .addTo(this.controller);
                      }
                      break;
                  case 5:
                      var slides = document.querySelectorAll(".main-inner > section.section");
                      count = slides.length;
                      if (count > 0) {
                          [].forEach.call(slides, function (slide) {
                              slide.style.minHeight = window.innerHeight + "px";
                          });
                      }
                      window.addEventListener("resize", function () {
                          [].forEach.call(slides, function (slide) {
                              slide.style.minHeight = window.innerHeight + "px";
                          });
                      });
                      break;
                  default:
                      var scroll_selector = ".page-template-page-home-section #wrapper";
                      var section_selector = ".section, .site-footer";
                      let scrollSelector = document.querySelector(scroll_selector);
                      this.sections = scrollSelector ? scrollSelector.querySelectorAll(section_selector) : null;
                      if (this.sections && this.sections.length) {
                          let sectionNav = document.createElement("div");
                          sectionNav.classList.add("section-nav");
                          let sectionInner = document.createElement("ul");
                          sectionInner.classList.add("inner");
                          sectionNav.appendChild(sectionInner);
                          document.body.appendChild(sectionNav);
                          [].forEach.call(this.sections, (section) => {
                              style(section, { height: window.innerHeight + "px" });
                          });
                          [].forEach.call(this.sections, function (index, section) {
                              let li = document.createElement("li");
                              li.setAttribute("data-index", index);
                              li.innerHTML = index;
                              li.addEventListener("click", (e) => {
                                  var _a;
                                  (_a = this.fullpage) === null || _a === void 0 ? void 0 : _a.moveTo(index + 1);
                              });
                              sectionInner.appendChild(li);
                          });
                          let sectionInnerHandler = function (index) {
                              [].forEach.call(sectionInner.children, function (item, i) {
                                  if (i == index) {
                                      item.classList.add("active");
                                  }
                                  else {
                                      item.classList.remove("active");
                                  }
                              });
                          };
                          var createFullPage = function (selector) {
                              return new fullpage(selector, {
                                  sectionSelector: section_selector,
                                  afterLoad: function (anchorLink, index) {
                                      sectionInnerHandler(index - 1);
                                      if (index > 1) {
                                          setTimeout(function () {
                                              document.body.classList.add("scrolling");
                                          }, 100);
                                      }
                                      else {
                                          document.body.classList.remove("scrolling");
                                      }
                                  },
                                  onLeave: function (index, nextIndex, direction) {
                                      let section = this.sections[index - 1];
                                      sectionInnerHandler(nextIndex - 1);
                                      if (nextIndex > 1) {
                                          document.body.classList.add("scrolling");
                                      }
                                      else {
                                          document.body.classList.remove("scrolling");
                                      }
                                      section.classList.remove("in");
                                      section = this.sections[nextIndex - 1];
                                      section === null || section === void 0 ? void 0 : section.classList.add("in");
                                  },
                              });
                          };
                          this.fullpage = createFullPage(scroll_selector);
                          break;
                      }
              }
          }
          this.handler = window.innerWidth > this.options.mobile ? this.desktopHandler : this.mobileHandler;
          if (window.innerWidth <= this.options.mobile) {
              document.body.classList.add("no-scrolling-style");
          }
          if ("onhashchange" in window) {
              window.addEventListener("hashchange", (event) => {
                  var _a;
                  if (this.scrollHandler()) {
                      event.stopPropagation();
                      event.preventDefault();
                      return;
                  }
                  if (window.location.hash == "#!search") {
                      document.body.classList.add("search-closed");
                      document.body.classList.remove("search-active");
                      setTimeout(function () {
                          document.body.classList.remove("search-closed");
                      }, 1000);
                      return;
                  }
                  let hash = (_a = window.location.hash) === null || _a === void 0 ? void 0 : _a.replace("#!", "");
                  if (hash) {
                      let section = document.querySelector(`#${hash}`);
                      if (section) {
                          this.scrollIfNeeded(section);
                          event.stopPropagation();
                          return;
                      }
                      let path = hash.split("/");
                      if (path[0] == "tabs") {
                          this.showTab(path[1]);
                      }
                  }
              });
              try {
                  window.dispatchEvent(new Event("hashchange"));
              }
              catch (e) { }
          }
          else {
              var elm = document.querySelector("#menu-main-menu li a[href^=\\/\\#]");
              if (elm) {
                  elm.addEventListener("click", function (event) {
                      if (this.scrollHandler()) {
                          event.stopPropagation();
                          event.preventDefault();
                      }
                  });
              }
          }
          var elm = document.querySelector(".btn.btn-back");
          if (elm) {
              elm.addEventListener("click", function () {
                  document.querySelector(".content").classList.remove("active");
                  location.hash = "#home";
              });
          }
          var elms = document.querySelectorAll('a[href="#search"]');
          if (elms.length) {
              [].forEach.call(elms, function (elm) {
                  elm.addEventListener("click", function (e) {
                      e.preventDefault();
                      document.body.classList.add("search-active");
                      document.body.classList.remove("search-closed");
                      return false;
                  });
              });
          }
          var elm = document.querySelector("#searchform a.search-close");
          if (elm)
              elm.addEventListener("click", function () {
                  document.body.classList.add("search-closed");
                  document.body.classList.remove("search-active");
                  setTimeout(function () {
                      document.body.classList.remove("search-closed");
                  }, 1000);
                  return false;
              });
          var menuItems = document.querySelectorAll("#navbar ul li a");
          var scrollItems = document.querySelectorAll("#wrapper > section");
          window.addEventListener("resize", () => {
              if (window.innerWidth <= this.options.mobile) {
                  if (this.controller) {
                      if (this.scene) {
                          this.scene.destroy(true);
                      }
                      this.controller.destroy(true);
                      document.body.classList.add("no-scrolling-style");
                  }
                  this.handler = this.mobileHandler;
              }
              else {
                  this.handler = this.desktopHandler;
              }
          });
          window.addEventListener("scroll", () => {
              var positon = this.getScrollPosition(window);
              var header = document.querySelector("#masthead");
              var offset = 0;
              if (header) {
                  offset = header.clientHeight;
              }
              var fromTop = positon.y + offset + 100;
              var cur = [].map.call(scrollItems, function (item) {
                  var bounds = item.getBoundingClientRect();
                  if (bounds.top < fromTop)
                      return item;
              });
              cur = cur[cur.length - 1];
              var id = cur ? cur.getAttribute("id") : "";
              [].forEach.call(menuItems, function (menuItem) {
                  menuItem.classList.remove("active");
              });
              var section = document.querySelector('#navbar ul li a[section="' + id + '"]');
              section && section.classList.add("active");
              if (positon.y > 100) {
                  document.body.classList.add("scrolling");
              }
              else {
                  document.body.classList.remove("scrolling");
              }
          });
          var elms = document.querySelectorAll(".na-posts-dropdown > a");
          if (elms.length) {
              [].forEach.call(elms, function (elm) {
                  elm.addEventListener("click", function (e) {
                      e.preventDefault();
                      elm.parentNode.classList.remove("active");
                      return false;
                  });
              });
          }
          window.addEventListener("load", function () {
              var loadingOverlay = document.querySelector(".loading-overlay");
              document.body.classList.remove("loading");
              setTimeout(function () {
                  document.body.classList.add("loaded");
                  if (loadingOverlay) {
                      loadingOverlay.parentNode.removeChild(loadingOverlay);
                  }
              }, 2000);
              var pos = window.scrollY;
              if (pos > 100) {
                  document.body.classList.add("scrolling");
              }
          });
          this.sectionObserver();
          window["naTheme"] = this;
          document.body.dispatchEvent(new CustomEvent("theme-ready", {
              bubbles: true,
              detail: this,
          }));
      }
      escapeRegExp(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
      }
      scrollIfNeeded(elm, callback = null, offset = this.headerOffset) {
          let to = elm.offsetTop;
          this.scrollTo(to, callback, offset);
      }
      scrollTo(to, callback = null, offset = this.headerOffset) {
          let scroller = document.scrollingElement || document.body;
          if (scroller) {
              animate({
                  from: scroller.scrollTop,
                  to: to - offset,
                  duration: 1000,
                  ease: backOut,
                  onUpdate: (value) => {
                      scroller.scrollTop = value;
                  },
                  onComplete: callback,
              });
          }
      }
  }
  app.ready(function () {
      new Theme(options);
      try {
          var mac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
          if (!mac)
              document.body.classList.add("custom-scrollbar");
      }
      catch (error) { }
      setTimeout(function () {
          var loadingOverlay = document.querySelector(".loading-overlay");
          document.body.classList.remove("loading");
          setTimeout(function () {
              document.body.classList.add("loaded");
              if (loadingOverlay) {
                  loadingOverlay.parentNode.removeChild(loadingOverlay);
              }
          }, 2000);
      }, 4000);
  });

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9ub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvZXNtL293bmVyRG9jdW1lbnQuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL2RvbS1oZWxwZXJzL2VzbS9vd25lcldpbmRvdy5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvZXNtL2dldENvbXB1dGVkU3R5bGUuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL2RvbS1oZWxwZXJzL2VzbS9oeXBoZW5hdGUuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL2RvbS1oZWxwZXJzL2VzbS9oeXBoZW5hdGVTdHlsZS5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvZXNtL2lzVHJhbnNmb3JtLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9kb20taGVscGVycy9lc20vY3NzLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9kb20taGVscGVycy9lc20vbWF0Y2hlcy5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvZXNtL2Nsb3Nlc3QuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL2RvbS1oZWxwZXJzL2VzbS9jb250YWlucy5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9oZXktbGlzdGVuL2Rpc3QvaGV5LWxpc3Rlbi5lcy5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvcG9wbW90aW9uL2Rpc3QvZXMvdXRpbHMvY2xhbXAuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL2FuaW1hdGlvbnMvdXRpbHMvZmluZC1zcHJpbmcuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL2FuaW1hdGlvbnMvZ2VuZXJhdG9ycy9zcHJpbmcuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL3V0aWxzL3Byb2dyZXNzLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9wb3Btb3Rpb24vZGlzdC9lcy91dGlscy9taXguanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3N0eWxlLXZhbHVlLXR5cGVzL2Rpc3QvZXMvdXRpbHMuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3N0eWxlLXZhbHVlLXR5cGVzL2Rpc3QvZXMvbnVtYmVycy9pbmRleC5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvc3R5bGUtdmFsdWUtdHlwZXMvZGlzdC9lcy9udW1iZXJzL3VuaXRzLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9zdHlsZS12YWx1ZS10eXBlcy9kaXN0L2VzL2NvbG9yL3V0aWxzLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9zdHlsZS12YWx1ZS10eXBlcy9kaXN0L2VzL2NvbG9yL2hzbGEuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3N0eWxlLXZhbHVlLXR5cGVzL2Rpc3QvZXMvY29sb3IvcmdiYS5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvc3R5bGUtdmFsdWUtdHlwZXMvZGlzdC9lcy9jb2xvci9oZXguanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3N0eWxlLXZhbHVlLXR5cGVzL2Rpc3QvZXMvY29sb3IvaW5kZXguanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3N0eWxlLXZhbHVlLXR5cGVzL2Rpc3QvZXMvY29tcGxleC9pbmRleC5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvcG9wbW90aW9uL2Rpc3QvZXMvdXRpbHMvbWl4LWNvbG9yLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9wb3Btb3Rpb24vZGlzdC9lcy91dGlscy9pbmMuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL3V0aWxzL3BpcGUuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL3V0aWxzL21peC1jb21wbGV4LmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9wb3Btb3Rpb24vZGlzdC9lcy91dGlscy9pbnRlcnBvbGF0ZS5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvcG9wbW90aW9uL2Rpc3QvZXMvZWFzaW5nL3V0aWxzLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9wb3Btb3Rpb24vZGlzdC9lcy9lYXNpbmcvaW5kZXguanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL2FuaW1hdGlvbnMvZ2VuZXJhdG9ycy9rZXlmcmFtZXMuanMiLCIuLi9zcmMvbm9kZV9tb2R1bGVzL3BvcG1vdGlvbi9kaXN0L2VzL2FuaW1hdGlvbnMvZ2VuZXJhdG9ycy9kZWNheS5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvcG9wbW90aW9uL2Rpc3QvZXMvYW5pbWF0aW9ucy91dGlscy9kZXRlY3QtYW5pbWF0aW9uLWZyb20tb3B0aW9ucy5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvZnJhbWVzeW5jL2Rpc3QvZXMvb24tbmV4dC1mcmFtZS5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvZnJhbWVzeW5jL2Rpc3QvZXMvY3JlYXRlLXJlbmRlci1zdGVwLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9mcmFtZXN5bmMvZGlzdC9lcy9pbmRleC5qcyIsIi4uL3NyYy9ub2RlX21vZHVsZXMvcG9wbW90aW9uL2Rpc3QvZXMvYW5pbWF0aW9ucy91dGlscy9lbGFwc2VkLmpzIiwiLi4vc3JjL25vZGVfbW9kdWxlcy9wb3Btb3Rpb24vZGlzdC9lcy9hbmltYXRpb25zL2luZGV4LmpzIiwiLi4vc3JjL3NjcmlwdHMvdGhlbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBSZXR1cm5zIHRoZSBvd25lciBkb2N1bWVudCBvZiBhIGdpdmVuIGVsZW1lbnQuXG4gKiBcbiAqIEBwYXJhbSBub2RlIHRoZSBlbGVtZW50XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG93bmVyRG9jdW1lbnQobm9kZSkge1xuICByZXR1cm4gbm9kZSAmJiBub2RlLm93bmVyRG9jdW1lbnQgfHwgZG9jdW1lbnQ7XG59IiwiaW1wb3J0IG93bmVyRG9jdW1lbnQgZnJvbSAnLi9vd25lckRvY3VtZW50Jztcbi8qKlxuICogUmV0dXJucyB0aGUgb3duZXIgd2luZG93IG9mIGEgZ2l2ZW4gZWxlbWVudC5cbiAqIFxuICogQHBhcmFtIG5vZGUgdGhlIGVsZW1lbnRcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvd25lcldpbmRvdyhub2RlKSB7XG4gIHZhciBkb2MgPSBvd25lckRvY3VtZW50KG5vZGUpO1xuICByZXR1cm4gZG9jICYmIGRvYy5kZWZhdWx0VmlldyB8fCB3aW5kb3c7XG59IiwiaW1wb3J0IG93bmVyV2luZG93IGZyb20gJy4vb3duZXJXaW5kb3cnO1xuLyoqXG4gKiBSZXR1cm5zIG9uZSBvciBhbGwgY29tcHV0ZWQgc3R5bGUgcHJvcGVydGllcyBvZiBhbiBlbGVtZW50LlxuICogXG4gKiBAcGFyYW0gbm9kZSB0aGUgZWxlbWVudFxuICogQHBhcmFtIHBzdWVkb0VsZW1lbnQgdGhlIHN0eWxlIHByb3BlcnR5XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBwc3VlZG9FbGVtZW50KSB7XG4gIHJldHVybiBvd25lcldpbmRvdyhub2RlKS5nZXRDb21wdXRlZFN0eWxlKG5vZGUsIHBzdWVkb0VsZW1lbnQpO1xufSIsInZhciByVXBwZXIgPSAvKFtBLVpdKS9nO1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaHlwaGVuYXRlKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoclVwcGVyLCAnLSQxJykudG9Mb3dlckNhc2UoKTtcbn0iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0L2Jsb2IvMmFlYjhhMmE2YmViMDA2MTdhNDIxN2Y3ZjgyODQ5MjRmYTJhZDgxOS9zcmMvdmVuZG9yL2NvcmUvaHlwaGVuYXRlU3R5bGVOYW1lLmpzXG4gKi9cbmltcG9ydCBoeXBoZW5hdGUgZnJvbSAnLi9oeXBoZW5hdGUnO1xudmFyIG1zUGF0dGVybiA9IC9ebXMtLztcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGh5cGhlbmF0ZVN0eWxlTmFtZShzdHJpbmcpIHtcbiAgcmV0dXJuIGh5cGhlbmF0ZShzdHJpbmcpLnJlcGxhY2UobXNQYXR0ZXJuLCAnLW1zLScpO1xufSIsInZhciBzdXBwb3J0ZWRUcmFuc2Zvcm1zID0gL14oKHRyYW5zbGF0ZXxyb3RhdGV8c2NhbGUpKFh8WXxafDNkKT98bWF0cml4KDNkKT98cGVyc3BlY3RpdmV8c2tldyhYfFkpPykkL2k7XG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc1RyYW5zZm9ybSh2YWx1ZSkge1xuICByZXR1cm4gISEodmFsdWUgJiYgc3VwcG9ydGVkVHJhbnNmb3Jtcy50ZXN0KHZhbHVlKSk7XG59IiwiaW1wb3J0IGdldENvbXB1dGVkU3R5bGUgZnJvbSAnLi9nZXRDb21wdXRlZFN0eWxlJztcbmltcG9ydCBoeXBoZW5hdGUgZnJvbSAnLi9oeXBoZW5hdGVTdHlsZSc7XG5pbXBvcnQgaXNUcmFuc2Zvcm0gZnJvbSAnLi9pc1RyYW5zZm9ybSc7XG5cbmZ1bmN0aW9uIHN0eWxlKG5vZGUsIHByb3BlcnR5KSB7XG4gIHZhciBjc3MgPSAnJztcbiAgdmFyIHRyYW5zZm9ybXMgPSAnJztcblxuICBpZiAodHlwZW9mIHByb3BlcnR5ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUoaHlwaGVuYXRlKHByb3BlcnR5KSkgfHwgZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5nZXRQcm9wZXJ0eVZhbHVlKGh5cGhlbmF0ZShwcm9wZXJ0eSkpO1xuICB9XG5cbiAgT2JqZWN0LmtleXMocHJvcGVydHkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciB2YWx1ZSA9IHByb3BlcnR5W2tleV07XG5cbiAgICBpZiAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSB7XG4gICAgICBub2RlLnN0eWxlLnJlbW92ZVByb3BlcnR5KGh5cGhlbmF0ZShrZXkpKTtcbiAgICB9IGVsc2UgaWYgKGlzVHJhbnNmb3JtKGtleSkpIHtcbiAgICAgIHRyYW5zZm9ybXMgKz0ga2V5ICsgXCIoXCIgKyB2YWx1ZSArIFwiKSBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY3NzICs9IGh5cGhlbmF0ZShrZXkpICsgXCI6IFwiICsgdmFsdWUgKyBcIjtcIjtcbiAgICB9XG4gIH0pO1xuXG4gIGlmICh0cmFuc2Zvcm1zKSB7XG4gICAgY3NzICs9IFwidHJhbnNmb3JtOiBcIiArIHRyYW5zZm9ybXMgKyBcIjtcIjtcbiAgfVxuXG4gIG5vZGUuc3R5bGUuY3NzVGV4dCArPSBcIjtcIiArIGNzcztcbn1cblxuZXhwb3J0IGRlZmF1bHQgc3R5bGU7IiwidmFyIG1hdGNoZXNJbXBsO1xuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiBlbGVtZW50IG1hdGNoZXMgYSBzZWxlY3Rvci5cbiAqIFxuICogQHBhcmFtIG5vZGUgdGhlIGVsZW1lbnRcbiAqIEBwYXJhbSBzZWxlY3RvciB0aGUgc2VsZWN0b3JcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXRjaGVzKG5vZGUsIHNlbGVjdG9yKSB7XG4gIGlmICghbWF0Y2hlc0ltcGwpIHtcbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIG5hdGl2ZU1hdGNoID0gYm9keS5tYXRjaGVzIHx8IGJvZHkubWF0Y2hlc1NlbGVjdG9yIHx8IGJvZHkud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IGJvZHkubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGJvZHkubXNNYXRjaGVzU2VsZWN0b3I7XG5cbiAgICBtYXRjaGVzSW1wbCA9IGZ1bmN0aW9uIG1hdGNoZXNJbXBsKG4sIHMpIHtcbiAgICAgIHJldHVybiBuYXRpdmVNYXRjaC5jYWxsKG4sIHMpO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlc0ltcGwobm9kZSwgc2VsZWN0b3IpO1xufSIsImltcG9ydCBtYXRjaGVzIGZyb20gJy4vbWF0Y2hlcyc7XG4vKipcbiAqIFJldHVybnMgdGhlIGNsb3Nlc3QgcGFyZW50IGVsZW1lbnQgdGhhdCBtYXRjaGVzIGEgZ2l2ZW4gc2VsZWN0b3IuXG4gKiBcbiAqIEBwYXJhbSBub2RlIHRoZSByZWZlcmVuY2UgZWxlbWVudFxuICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaFxuICogQHBhcmFtIHN0b3BBdCBzdG9wIHRyYXZlcnNpbmcgd2hlbiB0aGlzIGVsZW1lbnQgaXMgZm91bmRcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbG9zZXN0KG5vZGUsIHNlbGVjdG9yLCBzdG9wQXQpIHtcbiAgaWYgKG5vZGUuY2xvc2VzdCAmJiAhc3RvcEF0KSBub2RlLmNsb3Nlc3Qoc2VsZWN0b3IpO1xuICB2YXIgbmV4dE5vZGUgPSBub2RlO1xuXG4gIGRvIHtcbiAgICBpZiAobWF0Y2hlcyhuZXh0Tm9kZSwgc2VsZWN0b3IpKSByZXR1cm4gbmV4dE5vZGU7XG4gICAgbmV4dE5vZGUgPSBuZXh0Tm9kZS5wYXJlbnRFbGVtZW50O1xuICB9IHdoaWxlIChuZXh0Tm9kZSAmJiBuZXh0Tm9kZSAhPT0gc3RvcEF0ICYmIG5leHROb2RlLm5vZGVUeXBlID09PSBkb2N1bWVudC5FTEVNRU5UX05PREUpO1xuXG4gIHJldHVybiBudWxsO1xufSIsIi8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UsIG5vLWNvbmQtYXNzaWduICovXG5cbi8qKlxuICogQ2hlY2tzIGlmIGFuIGVsZW1lbnQgY29udGFpbnMgYW5vdGhlciBnaXZlbiBlbGVtZW50LlxuICogXG4gKiBAcGFyYW0gY29udGV4dCB0aGUgY29udGV4dCBlbGVtZW50XG4gKiBAcGFyYW0gbm9kZSB0aGUgZWxlbWVudCB0byBjaGVja1xuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb250YWlucyhjb250ZXh0LCBub2RlKSB7XG4gIC8vIEhUTUwgRE9NIGFuZCBTVkcgRE9NIG1heSBoYXZlIGRpZmZlcmVudCBzdXBwb3J0IGxldmVscyxcbiAgLy8gc28gd2UgbmVlZCB0byBjaGVjayBvbiBjb250ZXh0IGluc3RlYWQgb2YgYSBkb2N1bWVudCByb290IGVsZW1lbnQuXG4gIGlmIChjb250ZXh0LmNvbnRhaW5zKSByZXR1cm4gY29udGV4dC5jb250YWlucyhub2RlKTtcbiAgaWYgKGNvbnRleHQuY29tcGFyZURvY3VtZW50UG9zaXRpb24pIHJldHVybiBjb250ZXh0ID09PSBub2RlIHx8ICEhKGNvbnRleHQuY29tcGFyZURvY3VtZW50UG9zaXRpb24obm9kZSkgJiAxNik7XG59IiwiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcclxuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XHJcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xyXG4gICAgICAgIHdoaWxlIChfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbVtrXTsgfSB9KTtcclxufSkgOiAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBvW2syXSA9IG1ba107XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXhwb3J0U3RhcihtLCBvKSB7XHJcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmIChwICE9PSBcImRlZmF1bHRcIiAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIHApKSBfX2NyZWF0ZUJpbmRpbmcobywgbSwgcCk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3ZhbHVlcyhvKSB7XHJcbiAgICB2YXIgcyA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IsIG0gPSBzICYmIG9bc10sIGkgPSAwO1xyXG4gICAgaWYgKG0pIHJldHVybiBtLmNhbGwobyk7XHJcbiAgICBpZiAobyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHJldHVybiB7XHJcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAobyAmJiBpID49IG8ubGVuZ3RoKSBvID0gdm9pZCAwO1xyXG4gICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogbyAmJiBvW2krK10sIGRvbmU6ICFvIH07XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IocyA/IFwiT2JqZWN0IGlzIG5vdCBpdGVyYWJsZS5cIiA6IFwiU3ltYm9sLml0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVhZChvLCBuKSB7XHJcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XHJcbiAgICBpZiAoIW0pIHJldHVybiBvO1xyXG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHdoaWxlICgobiA9PT0gdm9pZCAwIHx8IG4tLSA+IDApICYmICEociA9IGkubmV4dCgpKS5kb25lKSBhci5wdXNoKHIudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XHJcbiAgICBmaW5hbGx5IHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWQoKSB7XHJcbiAgICBmb3IgKHZhciBhciA9IFtdLCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKylcclxuICAgICAgICBhciA9IGFyLmNvbmNhdChfX3JlYWQoYXJndW1lbnRzW2ldKSk7XHJcbiAgICByZXR1cm4gYXI7XHJcbn1cclxuXHJcbi8qKiBAZGVwcmVjYXRlZCAqL1xyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheXMoKSB7XHJcbiAgICBmb3IgKHZhciBzID0gMCwgaSA9IDAsIGlsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsOyBpKyspIHMgKz0gYXJndW1lbnRzW2ldLmxlbmd0aDtcclxuICAgIGZvciAodmFyIHIgPSBBcnJheShzKSwgayA9IDAsIGkgPSAwOyBpIDwgaWw7IGkrKylcclxuICAgICAgICBmb3IgKHZhciBhID0gYXJndW1lbnRzW2ldLCBqID0gMCwgamwgPSBhLmxlbmd0aDsgaiA8IGpsOyBqKyssIGsrKylcclxuICAgICAgICAgICAgcltrXSA9IGFbal07XHJcbiAgICByZXR1cm4gcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXkodG8sIGZyb20sIHBhY2spIHtcclxuICAgIGlmIChwYWNrIHx8IGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIGZvciAodmFyIGkgPSAwLCBsID0gZnJvbS5sZW5ndGgsIGFyOyBpIDwgbDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGFyIHx8ICEoaSBpbiBmcm9tKSkge1xyXG4gICAgICAgICAgICBpZiAoIWFyKSBhciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20sIDAsIGkpO1xyXG4gICAgICAgICAgICBhcltpXSA9IGZyb21baV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRvLmNvbmNhdChhciB8fCBmcm9tKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaWYgKGdbbl0pIGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHJlc3VtZShuLCB2KSB7IHRyeSB7IHN0ZXAoZ1tuXSh2KSk7IH0gY2F0Y2ggKGUpIHsgc2V0dGxlKHFbMF1bM10sIGUpOyB9IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAocikgeyByLnZhbHVlIGluc3RhbmNlb2YgX19hd2FpdCA/IFByb21pc2UucmVzb2x2ZShyLnZhbHVlLnYpLnRoZW4oZnVsZmlsbCwgcmVqZWN0KSA6IHNldHRsZShxWzBdWzJdLCByKTsgfVxyXG4gICAgZnVuY3Rpb24gZnVsZmlsbCh2YWx1ZSkgeyByZXN1bWUoXCJuZXh0XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKSB7IHJlc3VtZShcInRocm93XCIsIHZhbHVlKTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKGYsIHYpIHsgaWYgKGYodiksIHEuc2hpZnQoKSwgcS5sZW5ndGgpIHJlc3VtZShxWzBdWzBdLCBxWzBdWzFdKTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hc3luY0RlbGVnYXRvcihvKSB7XHJcbiAgICB2YXIgaSwgcDtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiwgZnVuY3Rpb24gKGUpIHsgdGhyb3cgZTsgfSksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4sIGYpIHsgaVtuXSA9IG9bbl0gPyBmdW5jdGlvbiAodikgeyByZXR1cm4gKHAgPSAhcCkgPyB7IHZhbHVlOiBfX2F3YWl0KG9bbl0odikpLCBkb25lOiBuID09PSBcInJldHVyblwiIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xyXG59XHJcbiIsInZhciB3YXJuaW5nID0gZnVuY3Rpb24gKCkgeyB9O1xyXG52YXIgaW52YXJpYW50ID0gZnVuY3Rpb24gKCkgeyB9O1xyXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG4gICAgd2FybmluZyA9IGZ1bmN0aW9uIChjaGVjaywgbWVzc2FnZSkge1xyXG4gICAgICAgIGlmICghY2hlY2sgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgaW52YXJpYW50ID0gZnVuY3Rpb24gKGNoZWNrLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKCFjaGVjaykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxuXG5leHBvcnQgeyBpbnZhcmlhbnQsIHdhcm5pbmcgfTtcbiIsInZhciBjbGFtcCA9IGZ1bmN0aW9uIChtaW4sIG1heCwgdikge1xuICAgIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2LCBtaW4pLCBtYXgpO1xufTtcblxuZXhwb3J0IHsgY2xhbXAgfTtcbiIsImltcG9ydCB7IHdhcm5pbmcgfSBmcm9tICdoZXktbGlzdGVuJztcbmltcG9ydCB7IGNsYW1wIH0gZnJvbSAnLi4vLi4vdXRpbHMvY2xhbXAuanMnO1xuXG52YXIgc2FmZU1pbiA9IDAuMDAxO1xudmFyIG1pbkR1cmF0aW9uID0gMC4wMTtcbnZhciBtYXhEdXJhdGlvbiA9IDEwLjA7XG52YXIgbWluRGFtcGluZyA9IDAuMDU7XG52YXIgbWF4RGFtcGluZyA9IDE7XG5mdW5jdGlvbiBmaW5kU3ByaW5nKF9hKSB7XG4gICAgdmFyIF9iID0gX2EuZHVyYXRpb24sIGR1cmF0aW9uID0gX2IgPT09IHZvaWQgMCA/IDgwMCA6IF9iLCBfYyA9IF9hLmJvdW5jZSwgYm91bmNlID0gX2MgPT09IHZvaWQgMCA/IDAuMjUgOiBfYywgX2QgPSBfYS52ZWxvY2l0eSwgdmVsb2NpdHkgPSBfZCA9PT0gdm9pZCAwID8gMCA6IF9kLCBfZSA9IF9hLm1hc3MsIG1hc3MgPSBfZSA9PT0gdm9pZCAwID8gMSA6IF9lO1xuICAgIHZhciBlbnZlbG9wZTtcbiAgICB2YXIgZGVyaXZhdGl2ZTtcbiAgICB3YXJuaW5nKGR1cmF0aW9uIDw9IG1heER1cmF0aW9uICogMTAwMCwgXCJTcHJpbmcgZHVyYXRpb24gbXVzdCBiZSAxMCBzZWNvbmRzIG9yIGxlc3NcIik7XG4gICAgdmFyIGRhbXBpbmdSYXRpbyA9IDEgLSBib3VuY2U7XG4gICAgZGFtcGluZ1JhdGlvID0gY2xhbXAobWluRGFtcGluZywgbWF4RGFtcGluZywgZGFtcGluZ1JhdGlvKTtcbiAgICBkdXJhdGlvbiA9IGNsYW1wKG1pbkR1cmF0aW9uLCBtYXhEdXJhdGlvbiwgZHVyYXRpb24gLyAxMDAwKTtcbiAgICBpZiAoZGFtcGluZ1JhdGlvIDwgMSkge1xuICAgICAgICBlbnZlbG9wZSA9IGZ1bmN0aW9uICh1bmRhbXBlZEZyZXEpIHtcbiAgICAgICAgICAgIHZhciBleHBvbmVudGlhbERlY2F5ID0gdW5kYW1wZWRGcmVxICogZGFtcGluZ1JhdGlvO1xuICAgICAgICAgICAgdmFyIGRlbHRhID0gZXhwb25lbnRpYWxEZWNheSAqIGR1cmF0aW9uO1xuICAgICAgICAgICAgdmFyIGEgPSBleHBvbmVudGlhbERlY2F5IC0gdmVsb2NpdHk7XG4gICAgICAgICAgICB2YXIgYiA9IGNhbGNBbmd1bGFyRnJlcSh1bmRhbXBlZEZyZXEsIGRhbXBpbmdSYXRpbyk7XG4gICAgICAgICAgICB2YXIgYyA9IE1hdGguZXhwKC1kZWx0YSk7XG4gICAgICAgICAgICByZXR1cm4gc2FmZU1pbiAtIChhIC8gYikgKiBjO1xuICAgICAgICB9O1xuICAgICAgICBkZXJpdmF0aXZlID0gZnVuY3Rpb24gKHVuZGFtcGVkRnJlcSkge1xuICAgICAgICAgICAgdmFyIGV4cG9uZW50aWFsRGVjYXkgPSB1bmRhbXBlZEZyZXEgKiBkYW1waW5nUmF0aW87XG4gICAgICAgICAgICB2YXIgZGVsdGEgPSBleHBvbmVudGlhbERlY2F5ICogZHVyYXRpb247XG4gICAgICAgICAgICB2YXIgZCA9IGRlbHRhICogdmVsb2NpdHkgKyB2ZWxvY2l0eTtcbiAgICAgICAgICAgIHZhciBlID0gTWF0aC5wb3coZGFtcGluZ1JhdGlvLCAyKSAqIE1hdGgucG93KHVuZGFtcGVkRnJlcSwgMikgKiBkdXJhdGlvbjtcbiAgICAgICAgICAgIHZhciBmID0gTWF0aC5leHAoLWRlbHRhKTtcbiAgICAgICAgICAgIHZhciBnID0gY2FsY0FuZ3VsYXJGcmVxKE1hdGgucG93KHVuZGFtcGVkRnJlcSwgMiksIGRhbXBpbmdSYXRpbyk7XG4gICAgICAgICAgICB2YXIgZmFjdG9yID0gLWVudmVsb3BlKHVuZGFtcGVkRnJlcSkgKyBzYWZlTWluID4gMCA/IC0xIDogMTtcbiAgICAgICAgICAgIHJldHVybiAoZmFjdG9yICogKChkIC0gZSkgKiBmKSkgLyBnO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZW52ZWxvcGUgPSBmdW5jdGlvbiAodW5kYW1wZWRGcmVxKSB7XG4gICAgICAgICAgICB2YXIgYSA9IE1hdGguZXhwKC11bmRhbXBlZEZyZXEgKiBkdXJhdGlvbik7XG4gICAgICAgICAgICB2YXIgYiA9ICh1bmRhbXBlZEZyZXEgLSB2ZWxvY2l0eSkgKiBkdXJhdGlvbiArIDE7XG4gICAgICAgICAgICByZXR1cm4gLXNhZmVNaW4gKyBhICogYjtcbiAgICAgICAgfTtcbiAgICAgICAgZGVyaXZhdGl2ZSA9IGZ1bmN0aW9uICh1bmRhbXBlZEZyZXEpIHtcbiAgICAgICAgICAgIHZhciBhID0gTWF0aC5leHAoLXVuZGFtcGVkRnJlcSAqIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIHZhciBiID0gKHZlbG9jaXR5IC0gdW5kYW1wZWRGcmVxKSAqIChkdXJhdGlvbiAqIGR1cmF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiBhICogYjtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWxHdWVzcyA9IDUgLyBkdXJhdGlvbjtcbiAgICB2YXIgdW5kYW1wZWRGcmVxID0gYXBwcm94aW1hdGVSb290KGVudmVsb3BlLCBkZXJpdmF0aXZlLCBpbml0aWFsR3Vlc3MpO1xuICAgIGR1cmF0aW9uID0gZHVyYXRpb24gKiAxMDAwO1xuICAgIGlmIChpc05hTih1bmRhbXBlZEZyZXEpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGlmZm5lc3M6IDEwMCxcbiAgICAgICAgICAgIGRhbXBpbmc6IDEwLFxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIHN0aWZmbmVzcyA9IE1hdGgucG93KHVuZGFtcGVkRnJlcSwgMikgKiBtYXNzO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RpZmZuZXNzOiBzdGlmZm5lc3MsXG4gICAgICAgICAgICBkYW1waW5nOiBkYW1waW5nUmF0aW8gKiAyICogTWF0aC5zcXJ0KG1hc3MgKiBzdGlmZm5lc3MpLFxuICAgICAgICAgICAgZHVyYXRpb246IGR1cmF0aW9uLFxuICAgICAgICB9O1xuICAgIH1cbn1cbnZhciByb290SXRlcmF0aW9ucyA9IDEyO1xuZnVuY3Rpb24gYXBwcm94aW1hdGVSb290KGVudmVsb3BlLCBkZXJpdmF0aXZlLCBpbml0aWFsR3Vlc3MpIHtcbiAgICB2YXIgcmVzdWx0ID0gaW5pdGlhbEd1ZXNzO1xuICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcm9vdEl0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgLSBlbnZlbG9wZShyZXN1bHQpIC8gZGVyaXZhdGl2ZShyZXN1bHQpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY2FsY0FuZ3VsYXJGcmVxKHVuZGFtcGVkRnJlcSwgZGFtcGluZ1JhdGlvKSB7XG4gICAgcmV0dXJuIHVuZGFtcGVkRnJlcSAqIE1hdGguc3FydCgxIC0gZGFtcGluZ1JhdGlvICogZGFtcGluZ1JhdGlvKTtcbn1cblxuZXhwb3J0IHsgY2FsY0FuZ3VsYXJGcmVxLCBmaW5kU3ByaW5nLCBtYXhEYW1waW5nLCBtYXhEdXJhdGlvbiwgbWluRGFtcGluZywgbWluRHVyYXRpb24gfTtcbiIsImltcG9ydCB7IF9fcmVzdCwgX19hc3NpZ24gfSBmcm9tICd0c2xpYic7XG5pbXBvcnQgeyBmaW5kU3ByaW5nLCBjYWxjQW5ndWxhckZyZXEgfSBmcm9tICcuLi91dGlscy9maW5kLXNwcmluZy5qcyc7XG5cbnZhciBkdXJhdGlvbktleXMgPSBbXCJkdXJhdGlvblwiLCBcImJvdW5jZVwiXTtcbnZhciBwaHlzaWNzS2V5cyA9IFtcInN0aWZmbmVzc1wiLCBcImRhbXBpbmdcIiwgXCJtYXNzXCJdO1xuZnVuY3Rpb24gaXNTcHJpbmdUeXBlKG9wdGlvbnMsIGtleXMpIHtcbiAgICByZXR1cm4ga2V5cy5zb21lKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIG9wdGlvbnNba2V5XSAhPT0gdW5kZWZpbmVkOyB9KTtcbn1cbmZ1bmN0aW9uIGdldFNwcmluZ09wdGlvbnMob3B0aW9ucykge1xuICAgIHZhciBzcHJpbmdPcHRpb25zID0gX19hc3NpZ24oeyB2ZWxvY2l0eTogMC4wLCBzdGlmZm5lc3M6IDEwMCwgZGFtcGluZzogMTAsIG1hc3M6IDEuMCwgaXNSZXNvbHZlZEZyb21EdXJhdGlvbjogZmFsc2UgfSwgb3B0aW9ucyk7XG4gICAgaWYgKCFpc1NwcmluZ1R5cGUob3B0aW9ucywgcGh5c2ljc0tleXMpICYmXG4gICAgICAgIGlzU3ByaW5nVHlwZShvcHRpb25zLCBkdXJhdGlvbktleXMpKSB7XG4gICAgICAgIHZhciBkZXJpdmVkID0gZmluZFNwcmluZyhvcHRpb25zKTtcbiAgICAgICAgc3ByaW5nT3B0aW9ucyA9IF9fYXNzaWduKF9fYXNzaWduKF9fYXNzaWduKHt9LCBzcHJpbmdPcHRpb25zKSwgZGVyaXZlZCksIHsgdmVsb2NpdHk6IDAuMCwgbWFzczogMS4wIH0pO1xuICAgICAgICBzcHJpbmdPcHRpb25zLmlzUmVzb2x2ZWRGcm9tRHVyYXRpb24gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gc3ByaW5nT3B0aW9ucztcbn1cbmZ1bmN0aW9uIHNwcmluZyhfYSkge1xuICAgIHZhciBfYiA9IF9hLmZyb20sIGZyb20gPSBfYiA9PT0gdm9pZCAwID8gMC4wIDogX2IsIF9jID0gX2EudG8sIHRvID0gX2MgPT09IHZvaWQgMCA/IDEuMCA6IF9jLCBfZCA9IF9hLnJlc3RTcGVlZCwgcmVzdFNwZWVkID0gX2QgPT09IHZvaWQgMCA/IDIgOiBfZCwgcmVzdERlbHRhID0gX2EucmVzdERlbHRhLCBvcHRpb25zID0gX19yZXN0KF9hLCBbXCJmcm9tXCIsIFwidG9cIiwgXCJyZXN0U3BlZWRcIiwgXCJyZXN0RGVsdGFcIl0pO1xuICAgIHZhciBzdGF0ZSA9IHsgZG9uZTogZmFsc2UsIHZhbHVlOiBmcm9tIH07XG4gICAgdmFyIF9lID0gZ2V0U3ByaW5nT3B0aW9ucyhvcHRpb25zKSwgc3RpZmZuZXNzID0gX2Uuc3RpZmZuZXNzLCBkYW1waW5nID0gX2UuZGFtcGluZywgbWFzcyA9IF9lLm1hc3MsIHZlbG9jaXR5ID0gX2UudmVsb2NpdHksIGR1cmF0aW9uID0gX2UuZHVyYXRpb24sIGlzUmVzb2x2ZWRGcm9tRHVyYXRpb24gPSBfZS5pc1Jlc29sdmVkRnJvbUR1cmF0aW9uO1xuICAgIHZhciByZXNvbHZlU3ByaW5nID0gemVybztcbiAgICB2YXIgcmVzb2x2ZVZlbG9jaXR5ID0gemVybztcbiAgICBmdW5jdGlvbiBjcmVhdGVTcHJpbmcoKSB7XG4gICAgICAgIHZhciBpbml0aWFsVmVsb2NpdHkgPSB2ZWxvY2l0eSA/IC0odmVsb2NpdHkgLyAxMDAwKSA6IDAuMDtcbiAgICAgICAgdmFyIGluaXRpYWxEZWx0YSA9IHRvIC0gZnJvbTtcbiAgICAgICAgdmFyIGRhbXBpbmdSYXRpbyA9IGRhbXBpbmcgLyAoMiAqIE1hdGguc3FydChzdGlmZm5lc3MgKiBtYXNzKSk7XG4gICAgICAgIHZhciB1bmRhbXBlZEFuZ3VsYXJGcmVxID0gTWF0aC5zcXJ0KHN0aWZmbmVzcyAvIG1hc3MpIC8gMTAwMDtcbiAgICAgICAgcmVzdERlbHRhICE9PSBudWxsICYmIHJlc3REZWx0YSAhPT0gdm9pZCAwID8gcmVzdERlbHRhIDogKHJlc3REZWx0YSA9IE1hdGguYWJzKHRvIC0gZnJvbSkgPD0gMSA/IDAuMDEgOiAwLjQpO1xuICAgICAgICBpZiAoZGFtcGluZ1JhdGlvIDwgMSkge1xuICAgICAgICAgICAgdmFyIGFuZ3VsYXJGcmVxXzEgPSBjYWxjQW5ndWxhckZyZXEodW5kYW1wZWRBbmd1bGFyRnJlcSwgZGFtcGluZ1JhdGlvKTtcbiAgICAgICAgICAgIHJlc29sdmVTcHJpbmcgPSBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHZhciBlbnZlbG9wZSA9IE1hdGguZXhwKC1kYW1waW5nUmF0aW8gKiB1bmRhbXBlZEFuZ3VsYXJGcmVxICogdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0byAtXG4gICAgICAgICAgICAgICAgICAgIGVudmVsb3BlICpcbiAgICAgICAgICAgICAgICAgICAgICAgICgoKGluaXRpYWxWZWxvY2l0eSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFtcGluZ1JhdGlvICogdW5kYW1wZWRBbmd1bGFyRnJlcSAqIGluaXRpYWxEZWx0YSkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXJGcmVxXzEpICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnNpbihhbmd1bGFyRnJlcV8xICogdCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxEZWx0YSAqIE1hdGguY29zKGFuZ3VsYXJGcmVxXzEgKiB0KSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlc29sdmVWZWxvY2l0eSA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gTWF0aC5leHAoLWRhbXBpbmdSYXRpbyAqIHVuZGFtcGVkQW5ndWxhckZyZXEgKiB0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRhbXBpbmdSYXRpbyAqXG4gICAgICAgICAgICAgICAgICAgIHVuZGFtcGVkQW5ndWxhckZyZXEgKlxuICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZSAqXG4gICAgICAgICAgICAgICAgICAgICgoTWF0aC5zaW4oYW5ndWxhckZyZXFfMSAqIHQpICpcbiAgICAgICAgICAgICAgICAgICAgICAgIChpbml0aWFsVmVsb2NpdHkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhbXBpbmdSYXRpbyAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGFtcGVkQW5ndWxhckZyZXEgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsRGVsdGEpKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyRnJlcV8xICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxEZWx0YSAqIE1hdGguY29zKGFuZ3VsYXJGcmVxXzEgKiB0KSkgLVxuICAgICAgICAgICAgICAgICAgICBlbnZlbG9wZSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAoTWF0aC5jb3MoYW5ndWxhckZyZXFfMSAqIHQpICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoaW5pdGlhbFZlbG9jaXR5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFtcGluZ1JhdGlvICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuZGFtcGVkQW5ndWxhckZyZXEgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbERlbHRhKSAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhckZyZXFfMSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxEZWx0YSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguc2luKGFuZ3VsYXJGcmVxXzEgKiB0KSkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYW1waW5nUmF0aW8gPT09IDEpIHtcbiAgICAgICAgICAgIHJlc29sdmVTcHJpbmcgPSBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0byAtXG4gICAgICAgICAgICAgICAgICAgIE1hdGguZXhwKC11bmRhbXBlZEFuZ3VsYXJGcmVxICogdCkgKlxuICAgICAgICAgICAgICAgICAgICAgICAgKGluaXRpYWxEZWx0YSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGluaXRpYWxWZWxvY2l0eSArIHVuZGFtcGVkQW5ndWxhckZyZXEgKiBpbml0aWFsRGVsdGEpICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGRhbXBlZEFuZ3VsYXJGcmVxXzEgPSB1bmRhbXBlZEFuZ3VsYXJGcmVxICogTWF0aC5zcXJ0KGRhbXBpbmdSYXRpbyAqIGRhbXBpbmdSYXRpbyAtIDEpO1xuICAgICAgICAgICAgcmVzb2x2ZVNwcmluZyA9IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVudmVsb3BlID0gTWF0aC5leHAoLWRhbXBpbmdSYXRpbyAqIHVuZGFtcGVkQW5ndWxhckZyZXEgKiB0KTtcbiAgICAgICAgICAgICAgICB2YXIgZnJlcUZvclQgPSBNYXRoLm1pbihkYW1wZWRBbmd1bGFyRnJlcV8xICogdCwgMzAwKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHRvIC1cbiAgICAgICAgICAgICAgICAgICAgKGVudmVsb3BlICpcbiAgICAgICAgICAgICAgICAgICAgICAgICgoaW5pdGlhbFZlbG9jaXR5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYW1waW5nUmF0aW8gKiB1bmRhbXBlZEFuZ3VsYXJGcmVxICogaW5pdGlhbERlbHRhKSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5zaW5oKGZyZXFGb3JUKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFtcGVkQW5ndWxhckZyZXFfMSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxEZWx0YSAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1hdGguY29zaChmcmVxRm9yVCkpKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICBkYW1wZWRBbmd1bGFyRnJlcV8xKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG4gICAgY3JlYXRlU3ByaW5nKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50ID0gcmVzb2x2ZVNwcmluZyh0KTtcbiAgICAgICAgICAgIGlmICghaXNSZXNvbHZlZEZyb21EdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50VmVsb2NpdHkgPSByZXNvbHZlVmVsb2NpdHkodCkgKiAxMDAwO1xuICAgICAgICAgICAgICAgIHZhciBpc0JlbG93VmVsb2NpdHlUaHJlc2hvbGQgPSBNYXRoLmFicyhjdXJyZW50VmVsb2NpdHkpIDw9IHJlc3RTcGVlZDtcbiAgICAgICAgICAgICAgICB2YXIgaXNCZWxvd0Rpc3BsYWNlbWVudFRocmVzaG9sZCA9IE1hdGguYWJzKHRvIC0gY3VycmVudCkgPD0gcmVzdERlbHRhO1xuICAgICAgICAgICAgICAgIHN0YXRlLmRvbmUgPVxuICAgICAgICAgICAgICAgICAgICBpc0JlbG93VmVsb2NpdHlUaHJlc2hvbGQgJiYgaXNCZWxvd0Rpc3BsYWNlbWVudFRocmVzaG9sZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXRlLmRvbmUgPSB0ID49IGR1cmF0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhdGUudmFsdWUgPSBzdGF0ZS5kb25lID8gdG8gOiBjdXJyZW50O1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICB9LFxuICAgICAgICBmbGlwVGFyZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IC12ZWxvY2l0eTtcbiAgICAgICAgICAgIF9hID0gW3RvLCBmcm9tXSwgZnJvbSA9IF9hWzBdLCB0byA9IF9hWzFdO1xuICAgICAgICAgICAgY3JlYXRlU3ByaW5nKCk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cbnNwcmluZy5uZWVkc0ludGVycG9sYXRpb24gPSBmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiB0eXBlb2YgYSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgYiA9PT0gXCJzdHJpbmdcIjtcbn07XG52YXIgemVybyA9IGZ1bmN0aW9uIChfdCkgeyByZXR1cm4gMDsgfTtcblxuZXhwb3J0IHsgc3ByaW5nIH07XG4iLCJ2YXIgcHJvZ3Jlc3MgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHZhbHVlKSB7XG4gICAgdmFyIHRvRnJvbURpZmZlcmVuY2UgPSB0byAtIGZyb207XG4gICAgcmV0dXJuIHRvRnJvbURpZmZlcmVuY2UgPT09IDAgPyAxIDogKHZhbHVlIC0gZnJvbSkgLyB0b0Zyb21EaWZmZXJlbmNlO1xufTtcblxuZXhwb3J0IHsgcHJvZ3Jlc3MgfTtcbiIsInZhciBtaXggPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHByb2dyZXNzKSB7XG4gICAgcmV0dXJuIC1wcm9ncmVzcyAqIGZyb20gKyBwcm9ncmVzcyAqIHRvICsgZnJvbTtcbn07XG5cbmV4cG9ydCB7IG1peCB9O1xuIiwidmFyIGNsYW1wID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7IHJldHVybiBmdW5jdGlvbiAodikge1xuICAgIHJldHVybiBNYXRoLm1heChNYXRoLm1pbih2LCBtYXgpLCBtaW4pO1xufTsgfTtcbnZhciBzYW5pdGl6ZSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiAodiAlIDEgPyBOdW1iZXIodi50b0ZpeGVkKDUpKSA6IHYpOyB9O1xudmFyIGZsb2F0UmVnZXggPSAvKC0pPyhbXFxkXSpcXC4/W1xcZF0pKy9nO1xudmFyIGNvbG9yUmVnZXggPSAvKCNbMC05YS1mXXs2fXwjWzAtOWEtZl17M318Iyg/OlswLTlhLWZdezJ9KXsyLDR9fChyZ2J8aHNsKWE/XFwoKC0/W1xcZFxcLl0rJT9bLFxcc10rKXsyLDN9XFxzKlxcLypcXHMqW1xcZFxcLl0rJT9cXCkpL2dpO1xudmFyIHNpbmdsZUNvbG9yUmVnZXggPSAvXigjWzAtOWEtZl17M318Iyg/OlswLTlhLWZdezJ9KXsyLDR9fChyZ2J8aHNsKWE/XFwoKC0/W1xcZFxcLl0rJT9bLFxcc10rKXsyLDN9XFxzKlxcLypcXHMqW1xcZFxcLl0rJT9cXCkpJC9pO1xuZnVuY3Rpb24gaXNTdHJpbmcodikge1xuICAgIHJldHVybiB0eXBlb2YgdiA9PT0gJ3N0cmluZyc7XG59XG5cbmV4cG9ydCB7IGNsYW1wLCBjb2xvclJlZ2V4LCBmbG9hdFJlZ2V4LCBpc1N0cmluZywgc2FuaXRpemUsIHNpbmdsZUNvbG9yUmVnZXggfTtcbiIsImltcG9ydCB7IF9fYXNzaWduIH0gZnJvbSAndHNsaWInO1xuaW1wb3J0IHsgY2xhbXAgfSBmcm9tICcuLi91dGlscy5qcyc7XG5cbnZhciBudW1iZXIgPSB7XG4gICAgdGVzdDogZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHR5cGVvZiB2ID09PSAnbnVtYmVyJzsgfSxcbiAgICBwYXJzZTogcGFyc2VGbG9hdCxcbiAgICB0cmFuc2Zvcm06IGZ1bmN0aW9uICh2KSB7IHJldHVybiB2OyB9LFxufTtcbnZhciBhbHBoYSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBudW1iZXIpLCB7IHRyYW5zZm9ybTogY2xhbXAoMCwgMSkgfSk7XG52YXIgc2NhbGUgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgbnVtYmVyKSwgeyBkZWZhdWx0OiAxIH0pO1xuXG5leHBvcnQgeyBhbHBoYSwgbnVtYmVyLCBzY2FsZSB9O1xuIiwiaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tICd0c2xpYic7XG5pbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJy4uL3V0aWxzLmpzJztcblxudmFyIGNyZWF0ZVVuaXRUeXBlID0gZnVuY3Rpb24gKHVuaXQpIHsgcmV0dXJuICh7XG4gICAgdGVzdDogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgcmV0dXJuIGlzU3RyaW5nKHYpICYmIHYuZW5kc1dpdGgodW5pdCkgJiYgdi5zcGxpdCgnICcpLmxlbmd0aCA9PT0gMTtcbiAgICB9LFxuICAgIHBhcnNlOiBwYXJzZUZsb2F0LFxuICAgIHRyYW5zZm9ybTogZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFwiXCIgKyB2ICsgdW5pdDsgfSxcbn0pOyB9O1xudmFyIGRlZ3JlZXMgPSBjcmVhdGVVbml0VHlwZSgnZGVnJyk7XG52YXIgcGVyY2VudCA9IGNyZWF0ZVVuaXRUeXBlKCclJyk7XG52YXIgcHggPSBjcmVhdGVVbml0VHlwZSgncHgnKTtcbnZhciB2aCA9IGNyZWF0ZVVuaXRUeXBlKCd2aCcpO1xudmFyIHZ3ID0gY3JlYXRlVW5pdFR5cGUoJ3Z3Jyk7XG52YXIgcHJvZ3Jlc3NQZXJjZW50YWdlID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHBlcmNlbnQpLCB7IHBhcnNlOiBmdW5jdGlvbiAodikgeyByZXR1cm4gcGVyY2VudC5wYXJzZSh2KSAvIDEwMDsgfSwgdHJhbnNmb3JtOiBmdW5jdGlvbiAodikgeyByZXR1cm4gcGVyY2VudC50cmFuc2Zvcm0odiAqIDEwMCk7IH0gfSk7XG5cbmV4cG9ydCB7IGRlZ3JlZXMsIHBlcmNlbnQsIHByb2dyZXNzUGVyY2VudGFnZSwgcHgsIHZoLCB2dyB9O1xuIiwiaW1wb3J0IHsgaXNTdHJpbmcsIHNpbmdsZUNvbG9yUmVnZXgsIGZsb2F0UmVnZXggfSBmcm9tICcuLi91dGlscy5qcyc7XG5cbnZhciBpc0NvbG9yU3RyaW5nID0gZnVuY3Rpb24gKHR5cGUsIHRlc3RQcm9wKSB7IHJldHVybiBmdW5jdGlvbiAodikge1xuICAgIHJldHVybiBCb29sZWFuKChpc1N0cmluZyh2KSAmJiBzaW5nbGVDb2xvclJlZ2V4LnRlc3QodikgJiYgdi5zdGFydHNXaXRoKHR5cGUpKSB8fFxuICAgICAgICAodGVzdFByb3AgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHYsIHRlc3RQcm9wKSkpO1xufTsgfTtcbnZhciBzcGxpdENvbG9yID0gZnVuY3Rpb24gKGFOYW1lLCBiTmFtZSwgY05hbWUpIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIF9hO1xuICAgIGlmICghaXNTdHJpbmcodikpXG4gICAgICAgIHJldHVybiB2O1xuICAgIHZhciBfYiA9IHYubWF0Y2goZmxvYXRSZWdleCksIGEgPSBfYlswXSwgYiA9IF9iWzFdLCBjID0gX2JbMl0sIGFscGhhID0gX2JbM107XG4gICAgcmV0dXJuIF9hID0ge30sXG4gICAgICAgIF9hW2FOYW1lXSA9IHBhcnNlRmxvYXQoYSksXG4gICAgICAgIF9hW2JOYW1lXSA9IHBhcnNlRmxvYXQoYiksXG4gICAgICAgIF9hW2NOYW1lXSA9IHBhcnNlRmxvYXQoYyksXG4gICAgICAgIF9hLmFscGhhID0gYWxwaGEgIT09IHVuZGVmaW5lZCA/IHBhcnNlRmxvYXQoYWxwaGEpIDogMSxcbiAgICAgICAgX2E7XG59OyB9O1xuXG5leHBvcnQgeyBpc0NvbG9yU3RyaW5nLCBzcGxpdENvbG9yIH07XG4iLCJpbXBvcnQgeyBhbHBoYSB9IGZyb20gJy4uL251bWJlcnMvaW5kZXguanMnO1xuaW1wb3J0IHsgcGVyY2VudCB9IGZyb20gJy4uL251bWJlcnMvdW5pdHMuanMnO1xuaW1wb3J0IHsgc2FuaXRpemUgfSBmcm9tICcuLi91dGlscy5qcyc7XG5pbXBvcnQgeyBpc0NvbG9yU3RyaW5nLCBzcGxpdENvbG9yIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbnZhciBoc2xhID0ge1xuICAgIHRlc3Q6IGlzQ29sb3JTdHJpbmcoJ2hzbCcsICdodWUnKSxcbiAgICBwYXJzZTogc3BsaXRDb2xvcignaHVlJywgJ3NhdHVyYXRpb24nLCAnbGlnaHRuZXNzJyksXG4gICAgdHJhbnNmb3JtOiBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgdmFyIGh1ZSA9IF9hLmh1ZSwgc2F0dXJhdGlvbiA9IF9hLnNhdHVyYXRpb24sIGxpZ2h0bmVzcyA9IF9hLmxpZ2h0bmVzcywgX2IgPSBfYS5hbHBoYSwgYWxwaGEkMSA9IF9iID09PSB2b2lkIDAgPyAxIDogX2I7XG4gICAgICAgIHJldHVybiAoJ2hzbGEoJyArXG4gICAgICAgICAgICBNYXRoLnJvdW5kKGh1ZSkgK1xuICAgICAgICAgICAgJywgJyArXG4gICAgICAgICAgICBwZXJjZW50LnRyYW5zZm9ybShzYW5pdGl6ZShzYXR1cmF0aW9uKSkgK1xuICAgICAgICAgICAgJywgJyArXG4gICAgICAgICAgICBwZXJjZW50LnRyYW5zZm9ybShzYW5pdGl6ZShsaWdodG5lc3MpKSArXG4gICAgICAgICAgICAnLCAnICtcbiAgICAgICAgICAgIHNhbml0aXplKGFscGhhLnRyYW5zZm9ybShhbHBoYSQxKSkgK1xuICAgICAgICAgICAgJyknKTtcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgaHNsYSB9O1xuIiwiaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tICd0c2xpYic7XG5pbXBvcnQgeyBudW1iZXIsIGFscGhhIH0gZnJvbSAnLi4vbnVtYmVycy9pbmRleC5qcyc7XG5pbXBvcnQgeyBzYW5pdGl6ZSwgY2xhbXAgfSBmcm9tICcuLi91dGlscy5qcyc7XG5pbXBvcnQgeyBpc0NvbG9yU3RyaW5nLCBzcGxpdENvbG9yIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbnZhciBjbGFtcFJnYlVuaXQgPSBjbGFtcCgwLCAyNTUpO1xudmFyIHJnYlVuaXQgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgbnVtYmVyKSwgeyB0cmFuc2Zvcm06IGZ1bmN0aW9uICh2KSB7IHJldHVybiBNYXRoLnJvdW5kKGNsYW1wUmdiVW5pdCh2KSk7IH0gfSk7XG52YXIgcmdiYSA9IHtcbiAgICB0ZXN0OiBpc0NvbG9yU3RyaW5nKCdyZ2InLCAncmVkJyksXG4gICAgcGFyc2U6IHNwbGl0Q29sb3IoJ3JlZCcsICdncmVlbicsICdibHVlJyksXG4gICAgdHJhbnNmb3JtOiBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgdmFyIHJlZCA9IF9hLnJlZCwgZ3JlZW4gPSBfYS5ncmVlbiwgYmx1ZSA9IF9hLmJsdWUsIF9iID0gX2EuYWxwaGEsIGFscGhhJDEgPSBfYiA9PT0gdm9pZCAwID8gMSA6IF9iO1xuICAgICAgICByZXR1cm4gJ3JnYmEoJyArXG4gICAgICAgICAgICByZ2JVbml0LnRyYW5zZm9ybShyZWQpICtcbiAgICAgICAgICAgICcsICcgK1xuICAgICAgICAgICAgcmdiVW5pdC50cmFuc2Zvcm0oZ3JlZW4pICtcbiAgICAgICAgICAgICcsICcgK1xuICAgICAgICAgICAgcmdiVW5pdC50cmFuc2Zvcm0oYmx1ZSkgK1xuICAgICAgICAgICAgJywgJyArXG4gICAgICAgICAgICBzYW5pdGl6ZShhbHBoYS50cmFuc2Zvcm0oYWxwaGEkMSkpICtcbiAgICAgICAgICAgICcpJztcbiAgICB9LFxufTtcblxuZXhwb3J0IHsgcmdiVW5pdCwgcmdiYSB9O1xuIiwiaW1wb3J0IHsgcmdiYSB9IGZyb20gJy4vcmdiYS5qcyc7XG5pbXBvcnQgeyBpc0NvbG9yU3RyaW5nIH0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmZ1bmN0aW9uIHBhcnNlSGV4KHYpIHtcbiAgICB2YXIgciA9ICcnO1xuICAgIHZhciBnID0gJyc7XG4gICAgdmFyIGIgPSAnJztcbiAgICB2YXIgYSA9ICcnO1xuICAgIGlmICh2Lmxlbmd0aCA+IDUpIHtcbiAgICAgICAgciA9IHYuc3Vic3RyKDEsIDIpO1xuICAgICAgICBnID0gdi5zdWJzdHIoMywgMik7XG4gICAgICAgIGIgPSB2LnN1YnN0cig1LCAyKTtcbiAgICAgICAgYSA9IHYuc3Vic3RyKDcsIDIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgciA9IHYuc3Vic3RyKDEsIDEpO1xuICAgICAgICBnID0gdi5zdWJzdHIoMiwgMSk7XG4gICAgICAgIGIgPSB2LnN1YnN0cigzLCAxKTtcbiAgICAgICAgYSA9IHYuc3Vic3RyKDQsIDEpO1xuICAgICAgICByICs9IHI7XG4gICAgICAgIGcgKz0gZztcbiAgICAgICAgYiArPSBiO1xuICAgICAgICBhICs9IGE7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJlZDogcGFyc2VJbnQociwgMTYpLFxuICAgICAgICBncmVlbjogcGFyc2VJbnQoZywgMTYpLFxuICAgICAgICBibHVlOiBwYXJzZUludChiLCAxNiksXG4gICAgICAgIGFscGhhOiBhID8gcGFyc2VJbnQoYSwgMTYpIC8gMjU1IDogMSxcbiAgICB9O1xufVxudmFyIGhleCA9IHtcbiAgICB0ZXN0OiBpc0NvbG9yU3RyaW5nKCcjJyksXG4gICAgcGFyc2U6IHBhcnNlSGV4LFxuICAgIHRyYW5zZm9ybTogcmdiYS50cmFuc2Zvcm0sXG59O1xuXG5leHBvcnQgeyBoZXggfTtcbiIsImltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAnLi4vdXRpbHMuanMnO1xuaW1wb3J0IHsgaGV4IH0gZnJvbSAnLi9oZXguanMnO1xuaW1wb3J0IHsgaHNsYSB9IGZyb20gJy4vaHNsYS5qcyc7XG5pbXBvcnQgeyByZ2JhIH0gZnJvbSAnLi9yZ2JhLmpzJztcblxudmFyIGNvbG9yID0ge1xuICAgIHRlc3Q6IGZ1bmN0aW9uICh2KSB7IHJldHVybiByZ2JhLnRlc3QodikgfHwgaGV4LnRlc3QodikgfHwgaHNsYS50ZXN0KHYpOyB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbiAodikge1xuICAgICAgICBpZiAocmdiYS50ZXN0KHYpKSB7XG4gICAgICAgICAgICByZXR1cm4gcmdiYS5wYXJzZSh2KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChoc2xhLnRlc3QodikpIHtcbiAgICAgICAgICAgIHJldHVybiBoc2xhLnBhcnNlKHYpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGhleC5wYXJzZSh2KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgdHJhbnNmb3JtOiBmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gaXNTdHJpbmcodilcbiAgICAgICAgICAgID8gdlxuICAgICAgICAgICAgOiB2Lmhhc093blByb3BlcnR5KCdyZWQnKVxuICAgICAgICAgICAgICAgID8gcmdiYS50cmFuc2Zvcm0odilcbiAgICAgICAgICAgICAgICA6IGhzbGEudHJhbnNmb3JtKHYpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgeyBjb2xvciB9O1xuIiwiaW1wb3J0IHsgY29sb3IgfSBmcm9tICcuLi9jb2xvci9pbmRleC5qcyc7XG5pbXBvcnQgeyBudW1iZXIgfSBmcm9tICcuLi9udW1iZXJzL2luZGV4LmpzJztcbmltcG9ydCB7IGlzU3RyaW5nLCBmbG9hdFJlZ2V4LCBjb2xvclJlZ2V4LCBzYW5pdGl6ZSB9IGZyb20gJy4uL3V0aWxzLmpzJztcblxudmFyIGNvbG9yVG9rZW4gPSAnJHtjfSc7XG52YXIgbnVtYmVyVG9rZW4gPSAnJHtufSc7XG5mdW5jdGlvbiB0ZXN0KHYpIHtcbiAgICB2YXIgX2EsIF9iLCBfYywgX2Q7XG4gICAgcmV0dXJuIChpc05hTih2KSAmJlxuICAgICAgICBpc1N0cmluZyh2KSAmJlxuICAgICAgICAoKF9iID0gKF9hID0gdi5tYXRjaChmbG9hdFJlZ2V4KSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmxlbmd0aCkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMCkgKyAoKF9kID0gKF9jID0gdi5tYXRjaChjb2xvclJlZ2V4KSkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLmxlbmd0aCkgIT09IG51bGwgJiYgX2QgIT09IHZvaWQgMCA/IF9kIDogMCkgPiAwKTtcbn1cbmZ1bmN0aW9uIGFuYWx5c2Uodikge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICB2YXIgbnVtQ29sb3JzID0gMDtcbiAgICB2YXIgY29sb3JzID0gdi5tYXRjaChjb2xvclJlZ2V4KTtcbiAgICBpZiAoY29sb3JzKSB7XG4gICAgICAgIG51bUNvbG9ycyA9IGNvbG9ycy5sZW5ndGg7XG4gICAgICAgIHYgPSB2LnJlcGxhY2UoY29sb3JSZWdleCwgY29sb3JUb2tlbik7XG4gICAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgY29sb3JzLm1hcChjb2xvci5wYXJzZSkpO1xuICAgIH1cbiAgICB2YXIgbnVtYmVycyA9IHYubWF0Y2goZmxvYXRSZWdleCk7XG4gICAgaWYgKG51bWJlcnMpIHtcbiAgICAgICAgdiA9IHYucmVwbGFjZShmbG9hdFJlZ2V4LCBudW1iZXJUb2tlbik7XG4gICAgICAgIHZhbHVlcy5wdXNoLmFwcGx5KHZhbHVlcywgbnVtYmVycy5tYXAobnVtYmVyLnBhcnNlKSk7XG4gICAgfVxuICAgIHJldHVybiB7IHZhbHVlczogdmFsdWVzLCBudW1Db2xvcnM6IG51bUNvbG9ycywgdG9rZW5pc2VkOiB2IH07XG59XG5mdW5jdGlvbiBwYXJzZSh2KSB7XG4gICAgcmV0dXJuIGFuYWx5c2UodikudmFsdWVzO1xufVxuZnVuY3Rpb24gY3JlYXRlVHJhbnNmb3JtZXIodikge1xuICAgIHZhciBfYSA9IGFuYWx5c2UodiksIHZhbHVlcyA9IF9hLnZhbHVlcywgbnVtQ29sb3JzID0gX2EubnVtQ29sb3JzLCB0b2tlbmlzZWQgPSBfYS50b2tlbmlzZWQ7XG4gICAgdmFyIG51bVZhbHVlcyA9IHZhbHVlcy5sZW5ndGg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhciBvdXRwdXQgPSB0b2tlbmlzZWQ7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5yZXBsYWNlKGkgPCBudW1Db2xvcnMgPyBjb2xvclRva2VuIDogbnVtYmVyVG9rZW4sIGkgPCBudW1Db2xvcnMgPyBjb2xvci50cmFuc2Zvcm0odltpXSkgOiBzYW5pdGl6ZSh2W2ldKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xufVxudmFyIGNvbnZlcnROdW1iZXJzVG9aZXJvID0gZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInID8gMCA6IHY7XG59O1xuZnVuY3Rpb24gZ2V0QW5pbWF0YWJsZU5vbmUodikge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZSh2KTtcbiAgICB2YXIgdHJhbnNmb3JtZXIgPSBjcmVhdGVUcmFuc2Zvcm1lcih2KTtcbiAgICByZXR1cm4gdHJhbnNmb3JtZXIocGFyc2VkLm1hcChjb252ZXJ0TnVtYmVyc1RvWmVybykpO1xufVxudmFyIGNvbXBsZXggPSB7IHRlc3Q6IHRlc3QsIHBhcnNlOiBwYXJzZSwgY3JlYXRlVHJhbnNmb3JtZXI6IGNyZWF0ZVRyYW5zZm9ybWVyLCBnZXRBbmltYXRhYmxlTm9uZTogZ2V0QW5pbWF0YWJsZU5vbmUgfTtcblxuZXhwb3J0IHsgY29tcGxleCB9O1xuIiwiaW1wb3J0IHsgX19hc3NpZ24gfSBmcm9tICd0c2xpYic7XG5pbXBvcnQgeyBtaXggfSBmcm9tICcuL21peC5qcyc7XG5pbXBvcnQgeyBoZXgsIHJnYmEsIGhzbGEgfSBmcm9tICdzdHlsZS12YWx1ZS10eXBlcyc7XG5pbXBvcnQgeyBpbnZhcmlhbnQgfSBmcm9tICdoZXktbGlzdGVuJztcblxudmFyIG1peExpbmVhckNvbG9yID0gZnVuY3Rpb24gKGZyb20sIHRvLCB2KSB7XG4gICAgdmFyIGZyb21FeHBvID0gZnJvbSAqIGZyb207XG4gICAgdmFyIHRvRXhwbyA9IHRvICogdG87XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLm1heCgwLCB2ICogKHRvRXhwbyAtIGZyb21FeHBvKSArIGZyb21FeHBvKSk7XG59O1xudmFyIGNvbG9yVHlwZXMgPSBbaGV4LCByZ2JhLCBoc2xhXTtcbnZhciBnZXRDb2xvclR5cGUgPSBmdW5jdGlvbiAodikge1xuICAgIHJldHVybiBjb2xvclR5cGVzLmZpbmQoZnVuY3Rpb24gKHR5cGUpIHsgcmV0dXJuIHR5cGUudGVzdCh2KTsgfSk7XG59O1xudmFyIG5vdEFuaW1hdGFibGUgPSBmdW5jdGlvbiAoY29sb3IpIHtcbiAgICByZXR1cm4gXCInXCIgKyBjb2xvciArIFwiJyBpcyBub3QgYW4gYW5pbWF0YWJsZSBjb2xvci4gVXNlIHRoZSBlcXVpdmFsZW50IGNvbG9yIGNvZGUgaW5zdGVhZC5cIjtcbn07XG52YXIgbWl4Q29sb3IgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICB2YXIgZnJvbUNvbG9yVHlwZSA9IGdldENvbG9yVHlwZShmcm9tKTtcbiAgICB2YXIgdG9Db2xvclR5cGUgPSBnZXRDb2xvclR5cGUodG8pO1xuICAgIGludmFyaWFudCghIWZyb21Db2xvclR5cGUsIG5vdEFuaW1hdGFibGUoZnJvbSkpO1xuICAgIGludmFyaWFudCghIXRvQ29sb3JUeXBlLCBub3RBbmltYXRhYmxlKHRvKSk7XG4gICAgaW52YXJpYW50KGZyb21Db2xvclR5cGUudHJhbnNmb3JtID09PSB0b0NvbG9yVHlwZS50cmFuc2Zvcm0sIFwiQm90aCBjb2xvcnMgbXVzdCBiZSBoZXgvUkdCQSwgT1IgYm90aCBtdXN0IGJlIEhTTEEuXCIpO1xuICAgIHZhciBmcm9tQ29sb3IgPSBmcm9tQ29sb3JUeXBlLnBhcnNlKGZyb20pO1xuICAgIHZhciB0b0NvbG9yID0gdG9Db2xvclR5cGUucGFyc2UodG8pO1xuICAgIHZhciBibGVuZGVkID0gX19hc3NpZ24oe30sIGZyb21Db2xvcik7XG4gICAgdmFyIG1peEZ1bmMgPSBmcm9tQ29sb3JUeXBlID09PSBoc2xhID8gbWl4IDogbWl4TGluZWFyQ29sb3I7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBibGVuZGVkKSB7XG4gICAgICAgICAgICBpZiAoa2V5ICE9PSBcImFscGhhXCIpIHtcbiAgICAgICAgICAgICAgICBibGVuZGVkW2tleV0gPSBtaXhGdW5jKGZyb21Db2xvcltrZXldLCB0b0NvbG9yW2tleV0sIHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJsZW5kZWQuYWxwaGEgPSBtaXgoZnJvbUNvbG9yLmFscGhhLCB0b0NvbG9yLmFscGhhLCB2KTtcbiAgICAgICAgcmV0dXJuIGZyb21Db2xvclR5cGUudHJhbnNmb3JtKGJsZW5kZWQpO1xuICAgIH07XG59O1xuXG5leHBvcnQgeyBtaXhDb2xvciwgbWl4TGluZWFyQ29sb3IgfTtcbiIsInZhciB6ZXJvUG9pbnQgPSB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHo6IDBcbn07XG52YXIgaXNOdW0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gdHlwZW9mIHYgPT09ICdudW1iZXInOyB9O1xuXG5leHBvcnQgeyBpc051bSwgemVyb1BvaW50IH07XG4iLCJ2YXIgY29tYmluZUZ1bmN0aW9ucyA9IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gYihhKHYpKTsgfTsgfTtcbnZhciBwaXBlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0cmFuc2Zvcm1lcnMgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICB0cmFuc2Zvcm1lcnNbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICB9XG4gICAgcmV0dXJuIHRyYW5zZm9ybWVycy5yZWR1Y2UoY29tYmluZUZ1bmN0aW9ucyk7XG59O1xuXG5leHBvcnQgeyBwaXBlIH07XG4iLCJpbXBvcnQgeyBfX3NwcmVhZEFycmF5LCBfX2Fzc2lnbiB9IGZyb20gJ3RzbGliJztcbmltcG9ydCB7IGNvbXBsZXgsIGNvbG9yIH0gZnJvbSAnc3R5bGUtdmFsdWUtdHlwZXMnO1xuaW1wb3J0IHsgbWl4IH0gZnJvbSAnLi9taXguanMnO1xuaW1wb3J0IHsgbWl4Q29sb3IgfSBmcm9tICcuL21peC1jb2xvci5qcyc7XG5pbXBvcnQgeyBpc051bSB9IGZyb20gJy4vaW5jLmpzJztcbmltcG9ydCB7IHBpcGUgfSBmcm9tICcuL3BpcGUuanMnO1xuaW1wb3J0IHsgaW52YXJpYW50IH0gZnJvbSAnaGV5LWxpc3Rlbic7XG5cbmZ1bmN0aW9uIGdldE1peGVyKG9yaWdpbiwgdGFyZ2V0KSB7XG4gICAgaWYgKGlzTnVtKG9yaWdpbikpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBtaXgob3JpZ2luLCB0YXJnZXQsIHYpOyB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChjb2xvci50ZXN0KG9yaWdpbikpIHtcbiAgICAgICAgcmV0dXJuIG1peENvbG9yKG9yaWdpbiwgdGFyZ2V0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBtaXhDb21wbGV4KG9yaWdpbiwgdGFyZ2V0KTtcbiAgICB9XG59XG52YXIgbWl4QXJyYXkgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICB2YXIgb3V0cHV0ID0gX19zcHJlYWRBcnJheShbXSwgZnJvbSk7XG4gICAgdmFyIG51bVZhbHVlcyA9IG91dHB1dC5sZW5ndGg7XG4gICAgdmFyIGJsZW5kVmFsdWUgPSBmcm9tLm1hcChmdW5jdGlvbiAoZnJvbVRoaXMsIGkpIHsgcmV0dXJuIGdldE1peGVyKGZyb21UaGlzLCB0b1tpXSk7IH0pO1xuICAgIHJldHVybiBmdW5jdGlvbiAodikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bVZhbHVlczsgaSsrKSB7XG4gICAgICAgICAgICBvdXRwdXRbaV0gPSBibGVuZFZhbHVlW2ldKHYpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbn07XG52YXIgbWl4T2JqZWN0ID0gZnVuY3Rpb24gKG9yaWdpbiwgdGFyZ2V0KSB7XG4gICAgdmFyIG91dHB1dCA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBvcmlnaW4pLCB0YXJnZXQpO1xuICAgIHZhciBibGVuZFZhbHVlID0ge307XG4gICAgZm9yICh2YXIga2V5IGluIG91dHB1dCkge1xuICAgICAgICBpZiAob3JpZ2luW2tleV0gIT09IHVuZGVmaW5lZCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBibGVuZFZhbHVlW2tleV0gPSBnZXRNaXhlcihvcmlnaW5ba2V5XSwgdGFyZ2V0W2tleV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAodikge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gYmxlbmRWYWx1ZSkge1xuICAgICAgICAgICAgb3V0cHV0W2tleV0gPSBibGVuZFZhbHVlW2tleV0odik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xufTtcbmZ1bmN0aW9uIGFuYWx5c2UodmFsdWUpIHtcbiAgICB2YXIgcGFyc2VkID0gY29tcGxleC5wYXJzZSh2YWx1ZSk7XG4gICAgdmFyIG51bVZhbHVlcyA9IHBhcnNlZC5sZW5ndGg7XG4gICAgdmFyIG51bU51bWJlcnMgPSAwO1xuICAgIHZhciBudW1SR0IgPSAwO1xuICAgIHZhciBudW1IU0wgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtVmFsdWVzOyBpKyspIHtcbiAgICAgICAgaWYgKG51bU51bWJlcnMgfHwgdHlwZW9mIHBhcnNlZFtpXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgbnVtTnVtYmVycysrO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHBhcnNlZFtpXS5odWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG51bUhTTCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgbnVtUkdCKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHsgcGFyc2VkOiBwYXJzZWQsIG51bU51bWJlcnM6IG51bU51bWJlcnMsIG51bVJHQjogbnVtUkdCLCBudW1IU0w6IG51bUhTTCB9O1xufVxudmFyIG1peENvbXBsZXggPSBmdW5jdGlvbiAob3JpZ2luLCB0YXJnZXQpIHtcbiAgICB2YXIgdGVtcGxhdGUgPSBjb21wbGV4LmNyZWF0ZVRyYW5zZm9ybWVyKHRhcmdldCk7XG4gICAgdmFyIG9yaWdpblN0YXRzID0gYW5hbHlzZShvcmlnaW4pO1xuICAgIHZhciB0YXJnZXRTdGF0cyA9IGFuYWx5c2UodGFyZ2V0KTtcbiAgICBpbnZhcmlhbnQob3JpZ2luU3RhdHMubnVtSFNMID09PSB0YXJnZXRTdGF0cy5udW1IU0wgJiZcbiAgICAgICAgb3JpZ2luU3RhdHMubnVtUkdCID09PSB0YXJnZXRTdGF0cy5udW1SR0IgJiZcbiAgICAgICAgb3JpZ2luU3RhdHMubnVtTnVtYmVycyA+PSB0YXJnZXRTdGF0cy5udW1OdW1iZXJzLCBcIkNvbXBsZXggdmFsdWVzICdcIiArIG9yaWdpbiArIFwiJyBhbmQgJ1wiICsgdGFyZ2V0ICsgXCInIHRvbyBkaWZmZXJlbnQgdG8gbWl4LiBFbnN1cmUgYWxsIGNvbG9ycyBhcmUgb2YgdGhlIHNhbWUgdHlwZS5cIik7XG4gICAgcmV0dXJuIHBpcGUobWl4QXJyYXkob3JpZ2luU3RhdHMucGFyc2VkLCB0YXJnZXRTdGF0cy5wYXJzZWQpLCB0ZW1wbGF0ZSk7XG59O1xuXG5leHBvcnQgeyBtaXhBcnJheSwgbWl4Q29tcGxleCwgbWl4T2JqZWN0IH07XG4iLCJpbXBvcnQgeyBwcm9ncmVzcyB9IGZyb20gJy4vcHJvZ3Jlc3MuanMnO1xuaW1wb3J0IHsgbWl4IH0gZnJvbSAnLi9taXguanMnO1xuaW1wb3J0IHsgbWl4Q29sb3IgfSBmcm9tICcuL21peC1jb2xvci5qcyc7XG5pbXBvcnQgeyBtaXhDb21wbGV4LCBtaXhBcnJheSwgbWl4T2JqZWN0IH0gZnJvbSAnLi9taXgtY29tcGxleC5qcyc7XG5pbXBvcnQgeyBjb2xvciB9IGZyb20gJ3N0eWxlLXZhbHVlLXR5cGVzJztcbmltcG9ydCB7IGNsYW1wIH0gZnJvbSAnLi9jbGFtcC5qcyc7XG5pbXBvcnQgeyBwaXBlIH0gZnJvbSAnLi9waXBlLmpzJztcbmltcG9ydCB7IGludmFyaWFudCB9IGZyb20gJ2hleS1saXN0ZW4nO1xuXG52YXIgbWl4TnVtYmVyID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7IHJldHVybiBmdW5jdGlvbiAocCkgeyByZXR1cm4gbWl4KGZyb20sIHRvLCBwKTsgfTsgfTtcbmZ1bmN0aW9uIGRldGVjdE1peGVyRmFjdG9yeSh2KSB7XG4gICAgaWYgKHR5cGVvZiB2ID09PSAnbnVtYmVyJykge1xuICAgICAgICByZXR1cm4gbWl4TnVtYmVyO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKGNvbG9yLnRlc3QodikpIHtcbiAgICAgICAgICAgIHJldHVybiBtaXhDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtaXhDb21wbGV4O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodikpIHtcbiAgICAgICAgcmV0dXJuIG1peEFycmF5O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIG1peE9iamVjdDtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVNaXhlcnMob3V0cHV0LCBlYXNlLCBjdXN0b21NaXhlcikge1xuICAgIHZhciBtaXhlcnMgPSBbXTtcbiAgICB2YXIgbWl4ZXJGYWN0b3J5ID0gY3VzdG9tTWl4ZXIgfHwgZGV0ZWN0TWl4ZXJGYWN0b3J5KG91dHB1dFswXSk7XG4gICAgdmFyIG51bU1peGVycyA9IG91dHB1dC5sZW5ndGggLSAxO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtTWl4ZXJzOyBpKyspIHtcbiAgICAgICAgdmFyIG1peGVyID0gbWl4ZXJGYWN0b3J5KG91dHB1dFtpXSwgb3V0cHV0W2kgKyAxXSk7XG4gICAgICAgIGlmIChlYXNlKSB7XG4gICAgICAgICAgICB2YXIgZWFzaW5nRnVuY3Rpb24gPSBBcnJheS5pc0FycmF5KGVhc2UpID8gZWFzZVtpXSA6IGVhc2U7XG4gICAgICAgICAgICBtaXhlciA9IHBpcGUoZWFzaW5nRnVuY3Rpb24sIG1peGVyKTtcbiAgICAgICAgfVxuICAgICAgICBtaXhlcnMucHVzaChtaXhlcik7XG4gICAgfVxuICAgIHJldHVybiBtaXhlcnM7XG59XG5mdW5jdGlvbiBmYXN0SW50ZXJwb2xhdGUoX2EsIF9iKSB7XG4gICAgdmFyIGZyb20gPSBfYVswXSwgdG8gPSBfYVsxXTtcbiAgICB2YXIgbWl4ZXIgPSBfYlswXTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG1peGVyKHByb2dyZXNzKGZyb20sIHRvLCB2KSk7IH07XG59XG5mdW5jdGlvbiBzbG93SW50ZXJwb2xhdGUoaW5wdXQsIG1peGVycykge1xuICAgIHZhciBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICB2YXIgbGFzdElucHV0SW5kZXggPSBpbnB1dExlbmd0aCAtIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHZhciBtaXhlckluZGV4ID0gMDtcbiAgICAgICAgdmFyIGZvdW5kTWl4ZXJJbmRleCA9IGZhbHNlO1xuICAgICAgICBpZiAodiA8PSBpbnB1dFswXSkge1xuICAgICAgICAgICAgZm91bmRNaXhlckluZGV4ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh2ID49IGlucHV0W2xhc3RJbnB1dEluZGV4XSkge1xuICAgICAgICAgICAgbWl4ZXJJbmRleCA9IGxhc3RJbnB1dEluZGV4IC0gMTtcbiAgICAgICAgICAgIGZvdW5kTWl4ZXJJbmRleCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3VuZE1peGVySW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBpID0gMTtcbiAgICAgICAgICAgIGZvciAoOyBpIDwgaW5wdXRMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpbnB1dFtpXSA+IHYgfHwgaSA9PT0gbGFzdElucHV0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWl4ZXJJbmRleCA9IGkgLSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm9ncmVzc0luUmFuZ2UgPSBwcm9ncmVzcyhpbnB1dFttaXhlckluZGV4XSwgaW5wdXRbbWl4ZXJJbmRleCArIDFdLCB2KTtcbiAgICAgICAgcmV0dXJuIG1peGVyc1ttaXhlckluZGV4XShwcm9ncmVzc0luUmFuZ2UpO1xuICAgIH07XG59XG5mdW5jdGlvbiBpbnRlcnBvbGF0ZShpbnB1dCwgb3V0cHV0LCBfYSkge1xuICAgIHZhciBfYiA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hLCBfYyA9IF9iLmNsYW1wLCBpc0NsYW1wID0gX2MgPT09IHZvaWQgMCA/IHRydWUgOiBfYywgZWFzZSA9IF9iLmVhc2UsIG1peGVyID0gX2IubWl4ZXI7XG4gICAgdmFyIGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuICAgIGludmFyaWFudChpbnB1dExlbmd0aCA9PT0gb3V0cHV0Lmxlbmd0aCwgJ0JvdGggaW5wdXQgYW5kIG91dHB1dCByYW5nZXMgbXVzdCBiZSB0aGUgc2FtZSBsZW5ndGgnKTtcbiAgICBpbnZhcmlhbnQoIWVhc2UgfHwgIUFycmF5LmlzQXJyYXkoZWFzZSkgfHwgZWFzZS5sZW5ndGggPT09IGlucHV0TGVuZ3RoIC0gMSwgJ0FycmF5IG9mIGVhc2luZyBmdW5jdGlvbnMgbXVzdCBiZSBvZiBsZW5ndGggYGlucHV0Lmxlbmd0aCAtIDFgLCBhcyBpdCBhcHBsaWVzIHRvIHRoZSB0cmFuc2l0aW9ucyAqKmJldHdlZW4qKiB0aGUgZGVmaW5lZCB2YWx1ZXMuJyk7XG4gICAgaWYgKGlucHV0WzBdID4gaW5wdXRbaW5wdXRMZW5ndGggLSAxXSkge1xuICAgICAgICBpbnB1dCA9IFtdLmNvbmNhdChpbnB1dCk7XG4gICAgICAgIG91dHB1dCA9IFtdLmNvbmNhdChvdXRwdXQpO1xuICAgICAgICBpbnB1dC5yZXZlcnNlKCk7XG4gICAgICAgIG91dHB1dC5yZXZlcnNlKCk7XG4gICAgfVxuICAgIHZhciBtaXhlcnMgPSBjcmVhdGVNaXhlcnMob3V0cHV0LCBlYXNlLCBtaXhlcik7XG4gICAgdmFyIGludGVycG9sYXRvciA9IGlucHV0TGVuZ3RoID09PSAyXG4gICAgICAgID8gZmFzdEludGVycG9sYXRlKGlucHV0LCBtaXhlcnMpXG4gICAgICAgIDogc2xvd0ludGVycG9sYXRlKGlucHV0LCBtaXhlcnMpO1xuICAgIHJldHVybiBpc0NsYW1wXG4gICAgICAgID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGludGVycG9sYXRvcihjbGFtcChpbnB1dFswXSwgaW5wdXRbaW5wdXRMZW5ndGggLSAxXSwgdikpOyB9XG4gICAgICAgIDogaW50ZXJwb2xhdG9yO1xufVxuXG5leHBvcnQgeyBpbnRlcnBvbGF0ZSB9O1xuIiwidmFyIHJldmVyc2VFYXNpbmcgPSBmdW5jdGlvbiAoZWFzaW5nKSB7IHJldHVybiBmdW5jdGlvbiAocCkgeyByZXR1cm4gMSAtIGVhc2luZygxIC0gcCk7IH07IH07XG52YXIgbWlycm9yRWFzaW5nID0gZnVuY3Rpb24gKGVhc2luZykgeyByZXR1cm4gZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcCA8PSAwLjUgPyBlYXNpbmcoMiAqIHApIC8gMiA6ICgyIC0gZWFzaW5nKDIgKiAoMSAtIHApKSkgLyAyO1xufTsgfTtcbnZhciBjcmVhdGVFeHBvSW4gPSBmdW5jdGlvbiAocG93ZXIpIHsgcmV0dXJuIGZ1bmN0aW9uIChwKSB7IHJldHVybiBNYXRoLnBvdyhwLCBwb3dlcik7IH07IH07XG52YXIgY3JlYXRlQmFja0luID0gZnVuY3Rpb24gKHBvd2VyKSB7IHJldHVybiBmdW5jdGlvbiAocCkge1xuICAgIHJldHVybiBwICogcCAqICgocG93ZXIgKyAxKSAqIHAgLSBwb3dlcik7XG59OyB9O1xudmFyIGNyZWF0ZUFudGljaXBhdGUgPSBmdW5jdGlvbiAocG93ZXIpIHtcbiAgICB2YXIgYmFja0Vhc2luZyA9IGNyZWF0ZUJhY2tJbihwb3dlcik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJldHVybiAocCAqPSAyKSA8IDFcbiAgICAgICAgICAgID8gMC41ICogYmFja0Vhc2luZyhwKVxuICAgICAgICAgICAgOiAwLjUgKiAoMiAtIE1hdGgucG93KDIsIC0xMCAqIChwIC0gMSkpKTtcbiAgICB9O1xufTtcblxuZXhwb3J0IHsgY3JlYXRlQW50aWNpcGF0ZSwgY3JlYXRlQmFja0luLCBjcmVhdGVFeHBvSW4sIG1pcnJvckVhc2luZywgcmV2ZXJzZUVhc2luZyB9O1xuIiwiaW1wb3J0IHsgY3JlYXRlRXhwb0luLCByZXZlcnNlRWFzaW5nLCBtaXJyb3JFYXNpbmcsIGNyZWF0ZUJhY2tJbiwgY3JlYXRlQW50aWNpcGF0ZSB9IGZyb20gJy4vdXRpbHMuanMnO1xuXG52YXIgREVGQVVMVF9PVkVSU0hPT1RfU1RSRU5HVEggPSAxLjUyNTtcbnZhciBCT1VOQ0VfRklSU1RfVEhSRVNIT0xEID0gNC4wIC8gMTEuMDtcbnZhciBCT1VOQ0VfU0VDT05EX1RIUkVTSE9MRCA9IDguMCAvIDExLjA7XG52YXIgQk9VTkNFX1RISVJEX1RIUkVTSE9MRCA9IDkuMCAvIDEwLjA7XG52YXIgbGluZWFyID0gZnVuY3Rpb24gKHApIHsgcmV0dXJuIHA7IH07XG52YXIgZWFzZUluID0gY3JlYXRlRXhwb0luKDIpO1xudmFyIGVhc2VPdXQgPSByZXZlcnNlRWFzaW5nKGVhc2VJbik7XG52YXIgZWFzZUluT3V0ID0gbWlycm9yRWFzaW5nKGVhc2VJbik7XG52YXIgY2lyY0luID0gZnVuY3Rpb24gKHApIHsgcmV0dXJuIDEgLSBNYXRoLnNpbihNYXRoLmFjb3MocCkpOyB9O1xudmFyIGNpcmNPdXQgPSByZXZlcnNlRWFzaW5nKGNpcmNJbik7XG52YXIgY2lyY0luT3V0ID0gbWlycm9yRWFzaW5nKGNpcmNPdXQpO1xudmFyIGJhY2tJbiA9IGNyZWF0ZUJhY2tJbihERUZBVUxUX09WRVJTSE9PVF9TVFJFTkdUSCk7XG52YXIgYmFja091dCA9IHJldmVyc2VFYXNpbmcoYmFja0luKTtcbnZhciBiYWNrSW5PdXQgPSBtaXJyb3JFYXNpbmcoYmFja0luKTtcbnZhciBhbnRpY2lwYXRlID0gY3JlYXRlQW50aWNpcGF0ZShERUZBVUxUX09WRVJTSE9PVF9TVFJFTkdUSCk7XG52YXIgY2EgPSA0MzU2LjAgLyAzNjEuMDtcbnZhciBjYiA9IDM1NDQyLjAgLyAxODA1LjA7XG52YXIgY2MgPSAxNjA2MS4wIC8gMTgwNS4wO1xudmFyIGJvdW5jZU91dCA9IGZ1bmN0aW9uIChwKSB7XG4gICAgaWYgKHAgPT09IDEgfHwgcCA9PT0gMClcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgdmFyIHAyID0gcCAqIHA7XG4gICAgcmV0dXJuIHAgPCBCT1VOQ0VfRklSU1RfVEhSRVNIT0xEXG4gICAgICAgID8gNy41NjI1ICogcDJcbiAgICAgICAgOiBwIDwgQk9VTkNFX1NFQ09ORF9USFJFU0hPTERcbiAgICAgICAgICAgID8gOS4wNzUgKiBwMiAtIDkuOSAqIHAgKyAzLjRcbiAgICAgICAgICAgIDogcCA8IEJPVU5DRV9USElSRF9USFJFU0hPTERcbiAgICAgICAgICAgICAgICA/IGNhICogcDIgLSBjYiAqIHAgKyBjY1xuICAgICAgICAgICAgICAgIDogMTAuOCAqIHAgKiBwIC0gMjAuNTIgKiBwICsgMTAuNzI7XG59O1xudmFyIGJvdW5jZUluID0gcmV2ZXJzZUVhc2luZyhib3VuY2VPdXQpO1xudmFyIGJvdW5jZUluT3V0ID0gZnVuY3Rpb24gKHApIHtcbiAgICByZXR1cm4gcCA8IDAuNVxuICAgICAgICA/IDAuNSAqICgxLjAgLSBib3VuY2VPdXQoMS4wIC0gcCAqIDIuMCkpXG4gICAgICAgIDogMC41ICogYm91bmNlT3V0KHAgKiAyLjAgLSAxLjApICsgMC41O1xufTtcblxuZXhwb3J0IHsgYW50aWNpcGF0ZSwgYmFja0luLCBiYWNrSW5PdXQsIGJhY2tPdXQsIGJvdW5jZUluLCBib3VuY2VJbk91dCwgYm91bmNlT3V0LCBjaXJjSW4sIGNpcmNJbk91dCwgY2lyY091dCwgZWFzZUluLCBlYXNlSW5PdXQsIGVhc2VPdXQsIGxpbmVhciB9O1xuIiwiaW1wb3J0IHsgaW50ZXJwb2xhdGUgfSBmcm9tICcuLi8uLi91dGlscy9pbnRlcnBvbGF0ZS5qcyc7XG5pbXBvcnQgeyBlYXNlSW5PdXQgfSBmcm9tICcuLi8uLi9lYXNpbmcvaW5kZXguanMnO1xuXG5mdW5jdGlvbiBkZWZhdWx0RWFzaW5nKHZhbHVlcywgZWFzaW5nKSB7XG4gICAgcmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24gKCkgeyByZXR1cm4gZWFzaW5nIHx8IGVhc2VJbk91dDsgfSkuc3BsaWNlKDAsIHZhbHVlcy5sZW5ndGggLSAxKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRPZmZzZXQodmFsdWVzKSB7XG4gICAgdmFyIG51bVZhbHVlcyA9IHZhbHVlcy5sZW5ndGg7XG4gICAgcmV0dXJuIHZhbHVlcy5tYXAoZnVuY3Rpb24gKF92YWx1ZSwgaSkge1xuICAgICAgICByZXR1cm4gaSAhPT0gMCA/IGkgLyAobnVtVmFsdWVzIC0gMSkgOiAwO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gY29udmVydE9mZnNldFRvVGltZXMob2Zmc2V0LCBkdXJhdGlvbikge1xuICAgIHJldHVybiBvZmZzZXQubWFwKGZ1bmN0aW9uIChvKSB7IHJldHVybiBvICogZHVyYXRpb247IH0pO1xufVxuZnVuY3Rpb24ga2V5ZnJhbWVzKF9hKSB7XG4gICAgdmFyIF9iID0gX2EuZnJvbSwgZnJvbSA9IF9iID09PSB2b2lkIDAgPyAwIDogX2IsIF9jID0gX2EudG8sIHRvID0gX2MgPT09IHZvaWQgMCA/IDEgOiBfYywgZWFzZSA9IF9hLmVhc2UsIG9mZnNldCA9IF9hLm9mZnNldCwgX2QgPSBfYS5kdXJhdGlvbiwgZHVyYXRpb24gPSBfZCA9PT0gdm9pZCAwID8gMzAwIDogX2Q7XG4gICAgdmFyIHN0YXRlID0geyBkb25lOiBmYWxzZSwgdmFsdWU6IGZyb20gfTtcbiAgICB2YXIgdmFsdWVzID0gQXJyYXkuaXNBcnJheSh0bykgPyB0byA6IFtmcm9tLCB0b107XG4gICAgdmFyIHRpbWVzID0gY29udmVydE9mZnNldFRvVGltZXMob2Zmc2V0ICYmIG9mZnNldC5sZW5ndGggPT09IHZhbHVlcy5sZW5ndGhcbiAgICAgICAgPyBvZmZzZXRcbiAgICAgICAgOiBkZWZhdWx0T2Zmc2V0KHZhbHVlcyksIGR1cmF0aW9uKTtcbiAgICBmdW5jdGlvbiBjcmVhdGVJbnRlcnBvbGF0b3IoKSB7XG4gICAgICAgIHJldHVybiBpbnRlcnBvbGF0ZSh0aW1lcywgdmFsdWVzLCB7XG4gICAgICAgICAgICBlYXNlOiBBcnJheS5pc0FycmF5KGVhc2UpID8gZWFzZSA6IGRlZmF1bHRFYXNpbmcodmFsdWVzLCBlYXNlKSxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBpbnRlcnBvbGF0b3IgPSBjcmVhdGVJbnRlcnBvbGF0b3IoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBuZXh0OiBmdW5jdGlvbiAodCkge1xuICAgICAgICAgICAgc3RhdGUudmFsdWUgPSBpbnRlcnBvbGF0b3IodCk7XG4gICAgICAgICAgICBzdGF0ZS5kb25lID0gdCA+PSBkdXJhdGlvbjtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZmxpcFRhcmdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFsdWVzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIGludGVycG9sYXRvciA9IGNyZWF0ZUludGVycG9sYXRvcigpO1xuICAgICAgICB9LFxuICAgIH07XG59XG5cbmV4cG9ydCB7IGNvbnZlcnRPZmZzZXRUb1RpbWVzLCBkZWZhdWx0RWFzaW5nLCBkZWZhdWx0T2Zmc2V0LCBrZXlmcmFtZXMgfTtcbiIsImZ1bmN0aW9uIGRlY2F5KF9hKSB7XG4gICAgdmFyIF9iID0gX2EudmVsb2NpdHksIHZlbG9jaXR5ID0gX2IgPT09IHZvaWQgMCA/IDAgOiBfYiwgX2MgPSBfYS5mcm9tLCBmcm9tID0gX2MgPT09IHZvaWQgMCA/IDAgOiBfYywgX2QgPSBfYS5wb3dlciwgcG93ZXIgPSBfZCA9PT0gdm9pZCAwID8gMC44IDogX2QsIF9lID0gX2EudGltZUNvbnN0YW50LCB0aW1lQ29uc3RhbnQgPSBfZSA9PT0gdm9pZCAwID8gMzUwIDogX2UsIF9mID0gX2EucmVzdERlbHRhLCByZXN0RGVsdGEgPSBfZiA9PT0gdm9pZCAwID8gMC41IDogX2YsIG1vZGlmeVRhcmdldCA9IF9hLm1vZGlmeVRhcmdldDtcbiAgICB2YXIgc3RhdGUgPSB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogZnJvbSB9O1xuICAgIHZhciBhbXBsaXR1ZGUgPSBwb3dlciAqIHZlbG9jaXR5O1xuICAgIHZhciBpZGVhbCA9IGZyb20gKyBhbXBsaXR1ZGU7XG4gICAgdmFyIHRhcmdldCA9IG1vZGlmeVRhcmdldCA9PT0gdW5kZWZpbmVkID8gaWRlYWwgOiBtb2RpZnlUYXJnZXQoaWRlYWwpO1xuICAgIGlmICh0YXJnZXQgIT09IGlkZWFsKVxuICAgICAgICBhbXBsaXR1ZGUgPSB0YXJnZXQgLSBmcm9tO1xuICAgIHJldHVybiB7XG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICAgICAgICB2YXIgZGVsdGEgPSAtYW1wbGl0dWRlICogTWF0aC5leHAoLXQgLyB0aW1lQ29uc3RhbnQpO1xuICAgICAgICAgICAgc3RhdGUuZG9uZSA9ICEoZGVsdGEgPiByZXN0RGVsdGEgfHwgZGVsdGEgPCAtcmVzdERlbHRhKTtcbiAgICAgICAgICAgIHN0YXRlLnZhbHVlID0gc3RhdGUuZG9uZSA/IHRhcmdldCA6IHRhcmdldCArIGRlbHRhO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgICB9LFxuICAgICAgICBmbGlwVGFyZ2V0OiBmdW5jdGlvbiAoKSB7IH0sXG4gICAgfTtcbn1cblxuZXhwb3J0IHsgZGVjYXkgfTtcbiIsImltcG9ydCB7IHNwcmluZyB9IGZyb20gJy4uL2dlbmVyYXRvcnMvc3ByaW5nLmpzJztcbmltcG9ydCB7IGtleWZyYW1lcyB9IGZyb20gJy4uL2dlbmVyYXRvcnMva2V5ZnJhbWVzLmpzJztcbmltcG9ydCB7IGRlY2F5IH0gZnJvbSAnLi4vZ2VuZXJhdG9ycy9kZWNheS5qcyc7XG5cbnZhciB0eXBlcyA9IHsga2V5ZnJhbWVzOiBrZXlmcmFtZXMsIHNwcmluZzogc3ByaW5nLCBkZWNheTogZGVjYXkgfTtcbmZ1bmN0aW9uIGRldGVjdEFuaW1hdGlvbkZyb21PcHRpb25zKGNvbmZpZykge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZy50bykpIHtcbiAgICAgICAgcmV0dXJuIGtleWZyYW1lcztcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZXNbY29uZmlnLnR5cGVdKSB7XG4gICAgICAgIHJldHVybiB0eXBlc1tjb25maWcudHlwZV07XG4gICAgfVxuICAgIHZhciBrZXlzID0gbmV3IFNldChPYmplY3Qua2V5cyhjb25maWcpKTtcbiAgICBpZiAoa2V5cy5oYXMoXCJlYXNlXCIpIHx8XG4gICAgICAgIChrZXlzLmhhcyhcImR1cmF0aW9uXCIpICYmICFrZXlzLmhhcyhcImRhbXBpbmdSYXRpb1wiKSkpIHtcbiAgICAgICAgcmV0dXJuIGtleWZyYW1lcztcbiAgICB9XG4gICAgZWxzZSBpZiAoa2V5cy5oYXMoXCJkYW1waW5nUmF0aW9cIikgfHxcbiAgICAgICAga2V5cy5oYXMoXCJzdGlmZm5lc3NcIikgfHxcbiAgICAgICAga2V5cy5oYXMoXCJtYXNzXCIpIHx8XG4gICAgICAgIGtleXMuaGFzKFwiZGFtcGluZ1wiKSB8fFxuICAgICAgICBrZXlzLmhhcyhcInJlc3RTcGVlZFwiKSB8fFxuICAgICAgICBrZXlzLmhhcyhcInJlc3REZWx0YVwiKSkge1xuICAgICAgICByZXR1cm4gc3ByaW5nO1xuICAgIH1cbiAgICByZXR1cm4ga2V5ZnJhbWVzO1xufVxuXG5leHBvcnQgeyBkZXRlY3RBbmltYXRpb25Gcm9tT3B0aW9ucyB9O1xuIiwidmFyIGRlZmF1bHRUaW1lc3RlcCA9ICgxIC8gNjApICogMTAwMDtcbnZhciBnZXRDdXJyZW50VGltZSA9IHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIlxuICAgID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7IH1cbiAgICA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERhdGUubm93KCk7IH07XG52YXIgb25OZXh0RnJhbWUgPSB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgPyBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spO1xuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJldHVybiBjYWxsYmFjayhnZXRDdXJyZW50VGltZSgpKTsgfSwgZGVmYXVsdFRpbWVzdGVwKTtcbiAgICB9O1xuXG5leHBvcnQgeyBkZWZhdWx0VGltZXN0ZXAsIG9uTmV4dEZyYW1lIH07XG4iLCJmdW5jdGlvbiBjcmVhdGVSZW5kZXJTdGVwKHJ1bk5leHRGcmFtZSkge1xuICAgIHZhciB0b1J1biA9IFtdO1xuICAgIHZhciB0b1J1bk5leHRGcmFtZSA9IFtdO1xuICAgIHZhciBudW1Ub1J1biA9IDA7XG4gICAgdmFyIGlzUHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIHZhciB0b0tlZXBBbGl2ZSA9IG5ldyBXZWFrU2V0KCk7XG4gICAgdmFyIHN0ZXAgPSB7XG4gICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiAoY2FsbGJhY2ssIGtlZXBBbGl2ZSwgaW1tZWRpYXRlKSB7XG4gICAgICAgICAgICBpZiAoa2VlcEFsaXZlID09PSB2b2lkIDApIHsga2VlcEFsaXZlID0gZmFsc2U7IH1cbiAgICAgICAgICAgIGlmIChpbW1lZGlhdGUgPT09IHZvaWQgMCkgeyBpbW1lZGlhdGUgPSBmYWxzZTsgfVxuICAgICAgICAgICAgdmFyIGFkZFRvQ3VycmVudEZyYW1lID0gaW1tZWRpYXRlICYmIGlzUHJvY2Vzc2luZztcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBhZGRUb0N1cnJlbnRGcmFtZSA/IHRvUnVuIDogdG9SdW5OZXh0RnJhbWU7XG4gICAgICAgICAgICBpZiAoa2VlcEFsaXZlKVxuICAgICAgICAgICAgICAgIHRvS2VlcEFsaXZlLmFkZChjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoYnVmZmVyLmluZGV4T2YoY2FsbGJhY2spID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkVG9DdXJyZW50RnJhbWUgJiYgaXNQcm9jZXNzaW5nKVxuICAgICAgICAgICAgICAgICAgICBudW1Ub1J1biA9IHRvUnVuLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaztcbiAgICAgICAgfSxcbiAgICAgICAgY2FuY2VsOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHRvUnVuTmV4dEZyYW1lLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICB0b1J1bk5leHRGcmFtZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgdG9LZWVwQWxpdmUuZGVsZXRlKGNhbGxiYWNrKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGZyYW1lRGF0YSkge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgaXNQcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIF9hID0gW3RvUnVuTmV4dEZyYW1lLCB0b1J1bl0sIHRvUnVuID0gX2FbMF0sIHRvUnVuTmV4dEZyYW1lID0gX2FbMV07XG4gICAgICAgICAgICB0b1J1bk5leHRGcmFtZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgbnVtVG9SdW4gPSB0b1J1bi5sZW5ndGg7XG4gICAgICAgICAgICBpZiAobnVtVG9SdW4pIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bVRvUnVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gdG9SdW5baV07XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGZyYW1lRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0b0tlZXBBbGl2ZS5oYXMoY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGVwLnNjaGVkdWxlKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bk5leHRGcmFtZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNQcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgfTtcbiAgICByZXR1cm4gc3RlcDtcbn1cblxuZXhwb3J0IHsgY3JlYXRlUmVuZGVyU3RlcCB9O1xuIiwiaW1wb3J0IHsgb25OZXh0RnJhbWUsIGRlZmF1bHRUaW1lc3RlcCB9IGZyb20gJy4vb24tbmV4dC1mcmFtZS5qcyc7XG5pbXBvcnQgeyBjcmVhdGVSZW5kZXJTdGVwIH0gZnJvbSAnLi9jcmVhdGUtcmVuZGVyLXN0ZXAuanMnO1xuXG52YXIgbWF4RWxhcHNlZCA9IDQwO1xudmFyIHVzZURlZmF1bHRFbGFwc2VkID0gdHJ1ZTtcbnZhciBydW5OZXh0RnJhbWUgPSBmYWxzZTtcbnZhciBpc1Byb2Nlc3NpbmcgPSBmYWxzZTtcbnZhciBmcmFtZSA9IHtcbiAgICBkZWx0YTogMCxcbiAgICB0aW1lc3RhbXA6IDBcbn07XG52YXIgc3RlcHNPcmRlciA9IFtcInJlYWRcIiwgXCJ1cGRhdGVcIiwgXCJwcmVSZW5kZXJcIiwgXCJyZW5kZXJcIiwgXCJwb3N0UmVuZGVyXCJdO1xudmFyIHN0ZXBzID0gLyojX19QVVJFX18qL3N0ZXBzT3JkZXIucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgIGFjY1trZXldID0gY3JlYXRlUmVuZGVyU3RlcChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBydW5OZXh0RnJhbWUgPSB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG59LCB7fSk7XG52YXIgc3luYyA9IC8qI19fUFVSRV9fKi9zdGVwc09yZGVyLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBrZXkpIHtcbiAgICB2YXIgc3RlcCA9IHN0ZXBzW2tleV07XG4gICAgYWNjW2tleV0gPSBmdW5jdGlvbiAocHJvY2Vzcywga2VlcEFsaXZlLCBpbW1lZGlhdGUpIHtcbiAgICAgICAgaWYgKGtlZXBBbGl2ZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBrZWVwQWxpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW1tZWRpYXRlID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgIGltbWVkaWF0ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVuTmV4dEZyYW1lKSBzdGFydExvb3AoKTtcbiAgICAgICAgcmV0dXJuIHN0ZXAuc2NoZWR1bGUocHJvY2Vzcywga2VlcEFsaXZlLCBpbW1lZGlhdGUpO1xuICAgIH07XG4gICAgcmV0dXJuIGFjYztcbn0sIHt9KTtcbnZhciBjYW5jZWxTeW5jID0gLyojX19QVVJFX18qL3N0ZXBzT3JkZXIucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGtleSkge1xuICAgIGFjY1trZXldID0gc3RlcHNba2V5XS5jYW5jZWw7XG4gICAgcmV0dXJuIGFjYztcbn0sIHt9KTtcbnZhciBmbHVzaFN5bmMgPSAvKiNfX1BVUkVfXyovc3RlcHNPcmRlci5yZWR1Y2UoZnVuY3Rpb24gKGFjYywga2V5KSB7XG4gICAgYWNjW2tleV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzdGVwc1trZXldLnByb2Nlc3MoZnJhbWUpO1xuICAgIH07XG4gICAgcmV0dXJuIGFjYztcbn0sIHt9KTtcbnZhciBwcm9jZXNzU3RlcCA9IGZ1bmN0aW9uIChzdGVwSWQpIHtcbiAgICByZXR1cm4gc3RlcHNbc3RlcElkXS5wcm9jZXNzKGZyYW1lKTtcbn07XG52YXIgcHJvY2Vzc0ZyYW1lID0gZnVuY3Rpb24gKHRpbWVzdGFtcCkge1xuICAgIHJ1bk5leHRGcmFtZSA9IGZhbHNlO1xuICAgIGZyYW1lLmRlbHRhID0gdXNlRGVmYXVsdEVsYXBzZWQgPyBkZWZhdWx0VGltZXN0ZXAgOiBNYXRoLm1heChNYXRoLm1pbih0aW1lc3RhbXAgLSBmcmFtZS50aW1lc3RhbXAsIG1heEVsYXBzZWQpLCAxKTtcbiAgICBmcmFtZS50aW1lc3RhbXAgPSB0aW1lc3RhbXA7XG4gICAgaXNQcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICBzdGVwc09yZGVyLmZvckVhY2gocHJvY2Vzc1N0ZXApO1xuICAgIGlzUHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIGlmIChydW5OZXh0RnJhbWUpIHtcbiAgICAgICAgdXNlRGVmYXVsdEVsYXBzZWQgPSBmYWxzZTtcbiAgICAgICAgb25OZXh0RnJhbWUocHJvY2Vzc0ZyYW1lKTtcbiAgICB9XG59O1xudmFyIHN0YXJ0TG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBydW5OZXh0RnJhbWUgPSB0cnVlO1xuICAgIHVzZURlZmF1bHRFbGFwc2VkID0gdHJ1ZTtcbiAgICBpZiAoIWlzUHJvY2Vzc2luZykgb25OZXh0RnJhbWUocHJvY2Vzc0ZyYW1lKTtcbn07XG52YXIgZ2V0RnJhbWVEYXRhID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmcmFtZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHN5bmM7XG5leHBvcnQgeyBjYW5jZWxTeW5jLCBmbHVzaFN5bmMsIGdldEZyYW1lRGF0YSB9O1xuIiwiZnVuY3Rpb24gbG9vcEVsYXBzZWQoZWxhcHNlZCwgZHVyYXRpb24sIGRlbGF5KSB7XG4gICAgaWYgKGRlbGF5ID09PSB2b2lkIDApIHsgZGVsYXkgPSAwOyB9XG4gICAgcmV0dXJuIGVsYXBzZWQgLSBkdXJhdGlvbiAtIGRlbGF5O1xufVxuZnVuY3Rpb24gcmV2ZXJzZUVsYXBzZWQoZWxhcHNlZCwgZHVyYXRpb24sIGRlbGF5LCBpc0ZvcndhcmRQbGF5YmFjaykge1xuICAgIGlmIChkZWxheSA9PT0gdm9pZCAwKSB7IGRlbGF5ID0gMDsgfVxuICAgIGlmIChpc0ZvcndhcmRQbGF5YmFjayA9PT0gdm9pZCAwKSB7IGlzRm9yd2FyZFBsYXliYWNrID0gdHJ1ZTsgfVxuICAgIHJldHVybiBpc0ZvcndhcmRQbGF5YmFja1xuICAgICAgICA/IGxvb3BFbGFwc2VkKGR1cmF0aW9uICsgLWVsYXBzZWQsIGR1cmF0aW9uLCBkZWxheSlcbiAgICAgICAgOiBkdXJhdGlvbiAtIChlbGFwc2VkIC0gZHVyYXRpb24pICsgZGVsYXk7XG59XG5mdW5jdGlvbiBoYXNSZXBlYXREZWxheUVsYXBzZWQoZWxhcHNlZCwgZHVyYXRpb24sIGRlbGF5LCBpc0ZvcndhcmRQbGF5YmFjaykge1xuICAgIHJldHVybiBpc0ZvcndhcmRQbGF5YmFjayA/IGVsYXBzZWQgPj0gZHVyYXRpb24gKyBkZWxheSA6IGVsYXBzZWQgPD0gLWRlbGF5O1xufVxuXG5leHBvcnQgeyBoYXNSZXBlYXREZWxheUVsYXBzZWQsIGxvb3BFbGFwc2VkLCByZXZlcnNlRWxhcHNlZCB9O1xuIiwiaW1wb3J0IHsgX19yZXN0LCBfX2Fzc2lnbiB9IGZyb20gJ3RzbGliJztcbmltcG9ydCB7IGRldGVjdEFuaW1hdGlvbkZyb21PcHRpb25zIH0gZnJvbSAnLi91dGlscy9kZXRlY3QtYW5pbWF0aW9uLWZyb20tb3B0aW9ucy5qcyc7XG5pbXBvcnQgc3luYywgeyBjYW5jZWxTeW5jIH0gZnJvbSAnZnJhbWVzeW5jJztcbmltcG9ydCB7IGludGVycG9sYXRlIH0gZnJvbSAnLi4vdXRpbHMvaW50ZXJwb2xhdGUuanMnO1xuaW1wb3J0IHsgaGFzUmVwZWF0RGVsYXlFbGFwc2VkLCByZXZlcnNlRWxhcHNlZCwgbG9vcEVsYXBzZWQgfSBmcm9tICcuL3V0aWxzL2VsYXBzZWQuanMnO1xuXG52YXIgZnJhbWVzeW5jID0gZnVuY3Rpb24gKHVwZGF0ZSkge1xuICAgIHZhciBwYXNzVGltZXN0YW1wID0gZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBkZWx0YSA9IF9hLmRlbHRhO1xuICAgICAgICByZXR1cm4gdXBkYXRlKGRlbHRhKTtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBzeW5jLnVwZGF0ZShwYXNzVGltZXN0YW1wLCB0cnVlKTsgfSxcbiAgICAgICAgc3RvcDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY2FuY2VsU3luYy51cGRhdGUocGFzc1RpbWVzdGFtcCk7IH0sXG4gICAgfTtcbn07XG5mdW5jdGlvbiBhbmltYXRlKF9hKSB7XG4gICAgdmFyIF9iLCBfYztcbiAgICB2YXIgZnJvbSA9IF9hLmZyb20sIF9kID0gX2EuYXV0b3BsYXksIGF1dG9wbGF5ID0gX2QgPT09IHZvaWQgMCA/IHRydWUgOiBfZCwgX2UgPSBfYS5kcml2ZXIsIGRyaXZlciA9IF9lID09PSB2b2lkIDAgPyBmcmFtZXN5bmMgOiBfZSwgX2YgPSBfYS5lbGFwc2VkLCBlbGFwc2VkID0gX2YgPT09IHZvaWQgMCA/IDAgOiBfZiwgX2cgPSBfYS5yZXBlYXQsIHJlcGVhdE1heCA9IF9nID09PSB2b2lkIDAgPyAwIDogX2csIF9oID0gX2EucmVwZWF0VHlwZSwgcmVwZWF0VHlwZSA9IF9oID09PSB2b2lkIDAgPyBcImxvb3BcIiA6IF9oLCBfaiA9IF9hLnJlcGVhdERlbGF5LCByZXBlYXREZWxheSA9IF9qID09PSB2b2lkIDAgPyAwIDogX2osIG9uUGxheSA9IF9hLm9uUGxheSwgb25TdG9wID0gX2Eub25TdG9wLCBvbkNvbXBsZXRlID0gX2Eub25Db21wbGV0ZSwgb25SZXBlYXQgPSBfYS5vblJlcGVhdCwgb25VcGRhdGUgPSBfYS5vblVwZGF0ZSwgb3B0aW9ucyA9IF9fcmVzdChfYSwgW1wiZnJvbVwiLCBcImF1dG9wbGF5XCIsIFwiZHJpdmVyXCIsIFwiZWxhcHNlZFwiLCBcInJlcGVhdFwiLCBcInJlcGVhdFR5cGVcIiwgXCJyZXBlYXREZWxheVwiLCBcIm9uUGxheVwiLCBcIm9uU3RvcFwiLCBcIm9uQ29tcGxldGVcIiwgXCJvblJlcGVhdFwiLCBcIm9uVXBkYXRlXCJdKTtcbiAgICB2YXIgdG8gPSBvcHRpb25zLnRvO1xuICAgIHZhciBkcml2ZXJDb250cm9scztcbiAgICB2YXIgcmVwZWF0Q291bnQgPSAwO1xuICAgIHZhciBjb21wdXRlZER1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbjtcbiAgICB2YXIgbGF0ZXN0O1xuICAgIHZhciBpc0NvbXBsZXRlID0gZmFsc2U7XG4gICAgdmFyIGlzRm9yd2FyZFBsYXliYWNrID0gdHJ1ZTtcbiAgICB2YXIgaW50ZXJwb2xhdGVGcm9tTnVtYmVyO1xuICAgIHZhciBhbmltYXRvciA9IGRldGVjdEFuaW1hdGlvbkZyb21PcHRpb25zKG9wdGlvbnMpO1xuICAgIGlmICgoX2MgPSAoX2IgPSBhbmltYXRvcikubmVlZHNJbnRlcnBvbGF0aW9uKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2MuY2FsbChfYiwgZnJvbSwgdG8pKSB7XG4gICAgICAgIGludGVycG9sYXRlRnJvbU51bWJlciA9IGludGVycG9sYXRlKFswLCAxMDBdLCBbZnJvbSwgdG9dLCB7XG4gICAgICAgICAgICBjbGFtcDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgICBmcm9tID0gMDtcbiAgICAgICAgdG8gPSAxMDA7XG4gICAgfVxuICAgIHZhciBhbmltYXRpb24gPSBhbmltYXRvcihfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHsgZnJvbTogZnJvbSwgdG86IHRvIH0pKTtcbiAgICBmdW5jdGlvbiByZXBlYXQoKSB7XG4gICAgICAgIHJlcGVhdENvdW50Kys7XG4gICAgICAgIGlmIChyZXBlYXRUeXBlID09PSBcInJldmVyc2VcIikge1xuICAgICAgICAgICAgaXNGb3J3YXJkUGxheWJhY2sgPSByZXBlYXRDb3VudCAlIDIgPT09IDA7XG4gICAgICAgICAgICBlbGFwc2VkID0gcmV2ZXJzZUVsYXBzZWQoZWxhcHNlZCwgY29tcHV0ZWREdXJhdGlvbiwgcmVwZWF0RGVsYXksIGlzRm9yd2FyZFBsYXliYWNrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGVsYXBzZWQgPSBsb29wRWxhcHNlZChlbGFwc2VkLCBjb21wdXRlZER1cmF0aW9uLCByZXBlYXREZWxheSk7XG4gICAgICAgICAgICBpZiAocmVwZWF0VHlwZSA9PT0gXCJtaXJyb3JcIilcbiAgICAgICAgICAgICAgICBhbmltYXRpb24uZmxpcFRhcmdldCgpO1xuICAgICAgICB9XG4gICAgICAgIGlzQ29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgb25SZXBlYXQgJiYgb25SZXBlYXQoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgIGRyaXZlckNvbnRyb2xzLnN0b3AoKTtcbiAgICAgICAgb25Db21wbGV0ZSAmJiBvbkNvbXBsZXRlKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVwZGF0ZShkZWx0YSkge1xuICAgICAgICBpZiAoIWlzRm9yd2FyZFBsYXliYWNrKVxuICAgICAgICAgICAgZGVsdGEgPSAtZGVsdGE7XG4gICAgICAgIGVsYXBzZWQgKz0gZGVsdGE7XG4gICAgICAgIGlmICghaXNDb21wbGV0ZSkge1xuICAgICAgICAgICAgdmFyIHN0YXRlID0gYW5pbWF0aW9uLm5leHQoTWF0aC5tYXgoMCwgZWxhcHNlZCkpO1xuICAgICAgICAgICAgbGF0ZXN0ID0gc3RhdGUudmFsdWU7XG4gICAgICAgICAgICBpZiAoaW50ZXJwb2xhdGVGcm9tTnVtYmVyKVxuICAgICAgICAgICAgICAgIGxhdGVzdCA9IGludGVycG9sYXRlRnJvbU51bWJlcihsYXRlc3QpO1xuICAgICAgICAgICAgaXNDb21wbGV0ZSA9IGlzRm9yd2FyZFBsYXliYWNrID8gc3RhdGUuZG9uZSA6IGVsYXBzZWQgPD0gMDtcbiAgICAgICAgfVxuICAgICAgICBvblVwZGF0ZSA9PT0gbnVsbCB8fCBvblVwZGF0ZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25VcGRhdGUobGF0ZXN0KTtcbiAgICAgICAgaWYgKGlzQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGlmIChyZXBlYXRDb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBjb21wdXRlZER1cmF0aW9uICE9PSBudWxsICYmIGNvbXB1dGVkRHVyYXRpb24gIT09IHZvaWQgMCA/IGNvbXB1dGVkRHVyYXRpb24gOiAoY29tcHV0ZWREdXJhdGlvbiA9IGVsYXBzZWQpO1xuICAgICAgICAgICAgaWYgKHJlcGVhdENvdW50IDwgcmVwZWF0TWF4KSB7XG4gICAgICAgICAgICAgICAgaGFzUmVwZWF0RGVsYXlFbGFwc2VkKGVsYXBzZWQsIGNvbXB1dGVkRHVyYXRpb24sIHJlcGVhdERlbGF5LCBpc0ZvcndhcmRQbGF5YmFjaykgJiYgcmVwZWF0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBsYXkoKSB7XG4gICAgICAgIG9uUGxheSA9PT0gbnVsbCB8fCBvblBsYXkgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG9uUGxheSgpO1xuICAgICAgICBkcml2ZXJDb250cm9scyA9IGRyaXZlcih1cGRhdGUpO1xuICAgICAgICBkcml2ZXJDb250cm9scy5zdGFydCgpO1xuICAgIH1cbiAgICBhdXRvcGxheSAmJiBwbGF5KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgb25TdG9wID09PSBudWxsIHx8IG9uU3RvcCA9PT0gdm9pZCAwID8gdm9pZCAwIDogb25TdG9wKCk7XG4gICAgICAgICAgICBkcml2ZXJDb250cm9scy5zdG9wKCk7XG4gICAgICAgIH0sXG4gICAgfTtcbn1cblxuZXhwb3J0IHsgYW5pbWF0ZSB9O1xuIiwiaW1wb3J0IGNzcyBmcm9tIFwiZG9tLWhlbHBlcnMvY3NzXCI7XG5pbXBvcnQgY2xvc2VzdCBmcm9tIFwiZG9tLWhlbHBlcnMvY2xvc2VzdFwiO1xuaW1wb3J0IGNvbnRhaW5zIGZyb20gXCJkb20taGVscGVycy9jb250YWluc1wiO1xuaW1wb3J0IHsgYW5pbWF0ZSwgYmFja091dCB9IGZyb20gXCJwb3Btb3Rpb25cIjtcbihmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHdpbmRvdy5DdXN0b21FdmVudClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGZ1bmN0aW9uIEN1c3RvbUV2ZW50KGV2ZW50LCBwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHtcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBkZXRhaWw6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIik7XG4gICAgICAgIGV2dC5pbml0Q3VzdG9tRXZlbnQoZXZlbnQsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSwgcGFyYW1zLmRldGFpbCk7XG4gICAgICAgIHJldHVybiBldnQ7XG4gICAgfVxuICAgIEN1c3RvbUV2ZW50LnByb3RvdHlwZSA9IHdpbmRvdy5FdmVudC5wcm90b3R5cGU7XG4gICAgd2luZG93W1wiQ3VzdG9tRXZlbnRcIl0gPSBDdXN0b21FdmVudDtcbn0pKCk7XG5jbGFzcyBUaGVtZSB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgICAgIHRoaXMubW9iaWxlSGFuZGxlciA9IChzZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbElmTmVlZGVkKHNlY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGVza3RvcEhhbmRsZXIgPSAoc2VjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gdGhpcy5zY2VuZS5zY3JvbGxPZmZzZXQoKTtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSBzZWN0aW9uLmdldEF0dHJpYnV0ZShcImRhdGEtaW5kZXhcIik7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG8ob2Zmc2V0ICogKGluZGV4ICsgMSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZnVsbHBhZ2UgJiYgdGhpcy5zZWN0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gWy4uLnRoaXMuc2VjdGlvbnNdLmluZGV4T2Yoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID49IDApXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbHBhZ2UubW92ZVRvKGluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbCh0aGlzLnNlY3Rpb25zLCAoc2VjLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5zKHNlYywgc2VjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxwYWdlLm1vdmVUbyhpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbElmTmVlZGVkKHNlY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9ICgpID0+IHtcbiAgICAgICAgICAgIHZhciBoYXNoID0gbG9jYXRpb24uaGFzaDtcbiAgICAgICAgICAgIGlmIChoYXNoLnJlcGxhY2UoXCIjIVwiLCBcIlwiKS50cmltKCkgPT0gXCJcIiB8fCBoYXNoLnJlcGxhY2UoXCIjXCIsIFwiXCIpLnRyaW0oKSA9PSBcIlwiIHx8IGhhc2guc3BsaXQoXCIvXCIpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgbmV3SGFzaCA9IGhhc2gucmVwbGFjZShcIiMhXCIsIFwiXCIpLnJlcGxhY2UoXCIjXCIsIFwiXCIpO1xuICAgICAgICAgICAgaWYgKG5ld0hhc2guaW5kZXhPZihcInNlY3Rpb24tXCIpID49IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgZWxtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0hhc2gpO1xuICAgICAgICAgICAgICAgIGlmIChlbG0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlcihlbG0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFwiI1wiICsgbmV3SGFzaCArIFwiIHdhcyBub3QgZm91bmQsIGRpZCB5b3UgZm9yZ2V0IHRvIGVuYWJsZSBwZXJtYWxpbmtzP1wiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZWN0aW9uLVwiICsgbmV3SGFzaCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlcihzZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0hhc2gpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZXIoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIG5ld0hhc2gpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGxldCBtZW51X2l0ZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LW1haW4tbWVudSBsaSBhXCIpO1xuICAgICAgICAgICAgbGV0IG1lbnVfaXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNtZW51LW1haW4tbWVudSBsaSBhW2hyZWZePVwiJyArIHRoaXMuZXNjYXBlUmVnRXhwKGhhc2gpICsgJ1wiXScpO1xuICAgICAgICAgICAgaWYgKG1lbnVfaXRlbSkge1xuICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChtZW51X2l0ZW1zLCAoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbSAhPSBtZW51X2l0ZW0pXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbWVudV9pdGVtLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZl49XCInICsgdGhpcy5lc2NhcGVSZWdFeHAoaGFzaCkgKyAnXCJdJyk7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gJiYgaXRlbS5oYXNBdHRyaWJ1dGUoXCJuby1oYXNoXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmdldFNjcm9sbFBvc2l0aW9uID0gKGVsKSA9PiAoe1xuICAgICAgICAgICAgeDogZWwucGFnZVhPZmZzZXQgIT09IHVuZGVmaW5lZCA/IGVsLnBhZ2VYT2Zmc2V0IDogZWwuc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgIHk6IGVsLnBhZ2VZT2Zmc2V0ICE9PSB1bmRlZmluZWQgPyBlbC5wYWdlWU9mZnNldCA6IGVsLnNjcm9sbFRvcCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2hvd1RhYiA9IChpZCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRhYiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBpZCk7XG4gICAgICAgICAgICBpZiAodGFiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhYnMgPSBjbG9zZXN0KHRhYiwgXCIubmEtdGFic1wiKTtcbiAgICAgICAgICAgICAgICBsZXQgdGFiQ29udGVudHMgPSB0YWJzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiLWNvbnRlbnRcIik7XG4gICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRhYkNvbnRlbnRzLCAodGFiQ29udGVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0YWJDb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbGV0IHRhYk5hdnMgPSB0YWJzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiLW5hdlwiKTtcbiAgICAgICAgICAgICAgICBbXS5mb3JFYWNoLmNhbGwodGFiTmF2cywgKHRhYk5hdikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0YWJOYXYuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgICAgICAgICB0YWIuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgKF9hID0gY2xvc2VzdCh0YWIsIFwibGlcIikpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmF2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYVtocmVmPVwiIycgKyBpZCArICdcIl0nKTtcbiAgICAgICAgICAgICAgICAgICAgbmF2ID09PSBudWxsIHx8IG5hdiA9PT0gdm9pZCAwID8gdm9pZCAwIDogbmF2LmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgfSwgNDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZWN0aW9uT2JzZXJ2ZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoXCJJbnRlcnNlY3Rpb25PYnNlcnZlclwiIGluIHdpbmRvdykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXMuZm9yRWFjaCgoZW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRyeS5pbnRlcnNlY3Rpb25SYXRpbyA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS50YXJnZXQuY2xhc3NMaXN0LmFkZChcImluLW9uY2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkudGFyZ2V0LmNsYXNzTGlzdC5hZGQoXCJpblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRyeS50YXJnZXQuY2xhc3NMaXN0LnJlbW92ZShcIm91dFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnRhcmdldC5jbGFzc0xpc3QuYWRkKFwib3V0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudHJ5LnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKFwiaW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2VjdGlvblwiKS5mb3JFYWNoKChzZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWN0aW9uLmdldEF0dHJpYnV0ZShcImlzLW9ic2VydmVkXCIpICE9IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uLnNldEF0dHJpYnV0ZShcImlzLW9ic2VydmVkXCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZnVsbHBhZ2UgPSBudWxsO1xuICAgICAgICB0aGlzLnNlY3Rpb25zID0gbnVsbDtcbiAgICAgICAgbGV0IGhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFzdGhlYWRcIik7XG4gICAgICAgIHRoaXMuaGVhZGVyT2Zmc2V0ID0gMDtcbiAgICAgICAgaWYgKGhlYWRlciAmJiBoZWFkZXIuY2xhc3NMaXN0LmNvbnRhaW5zKFwiZml4ZWQtdG9wXCIpKSB7XG4gICAgICAgICAgICB0aGlzLmhlYWRlck9mZnNldCA9IGhlYWRlci5jbGllbnRIZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuICAgIGxvYWQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdGhpcy5pbm5lclNjcm9sbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5uZXItc2Nyb2xsXCIpO1xuICAgICAgICBsZXQgY291bnQgPSAoX2EgPSB0aGlzLmlubmVyU2Nyb2xsKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNjcm9sbGluZyAmJiB3aW5kb3cuaW5uZXJXaWR0aCA+IHRoaXMub3B0aW9ucy5tb2JpbGUpIHtcbiAgICAgICAgICAgIHZhciBmbGlwID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgd2lkdGhQZXJjZW50ID0gMTAwIC8gY291bnQ7XG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnNlSW50KHRoaXMub3B0aW9ucy5zY3JvbGxpbmcsIDEwKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuaW5uZXJTY3JvbGwuY2hpbGRyZW4sIChzbGlkZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlLnN0eWxlLndpZHRoID0gd2lkdGhQZXJjZW50ICsgXCIlXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGUuc3R5bGUuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ICsgXCJweFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlubmVyU2Nyb2xsLnN0eWxlLndpZHRoID0gMTAwICogY291bnQgKyBcIiVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBTY3JvbGxNYWdpYy5Db250cm9sbGVyKHt9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB3aXBlQW5pbWF0aW9uID0gbmV3IFRpbWVsaW5lTWF4KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aXBlQW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50byhcIiNpbm5lci1zY3JvbGxcIiwgMC41LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHo6IC0zMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5OiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50byhcIiNpbm5lci1zY3JvbGxcIiwgMiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiBcIi1cIiArIHdpZHRoUGVyY2VudCAqIChpICsgMSkgKyBcIiVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG8oXCIjaW5uZXItc2Nyb2xsXCIsIDAuNSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB6OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsaXAgPSAhZmxpcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJFbGVtZW50OiBcIi5zY3JvbGxpbmctY29udGFpbmVyLS0yXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckhvb2s6IFwib25MZWF2ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBcIjUwMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldFBpbihcIi5zY3JvbGxpbmctY29udGFpbmVyLS0yXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldFR3ZWVuKHdpcGVBbmltYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZFRvKHRoaXMuY29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2N1cnJlbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9IDAuMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUub24oXCJwcm9ncmVzc1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdiA9IGV2ZW50LnByb2dyZXNzICogY291bnQgKyBvZmZzZXQgKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ID4gY291bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9IGNvdW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gcGFyc2VJbnQodi50b1N0cmluZygpLCAxMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT0gX2N1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuaW5uZXJTY3JvbGwuY2hpbGRyZW4sIGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2xpZGUuY2xhc3NMaXN0LnJlbW92ZShcImluXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbm5lclNjcm9sbC5jaGlsZHJlblt2XS5jbGFzc0xpc3QuYWRkKFwiaW5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9jdXJyZW50ID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbCh0aGlzLmlubmVyU2Nyb2xsLmNoaWxkcmVuLCAoc2xpZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzbGlkZS5zdHlsZS5oZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyBcInB4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBTY3JvbGxNYWdpYy5Db250cm9sbGVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxTY2VuZU9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckhvb2s6IFwib25MZWF2ZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbCh0aGlzLmlubmVyU2Nyb2xsLmNoaWxkcmVuLCAoc2xpZGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyRWxlbWVudDogc2xpZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldFBpbihzbGlkZSwgeyBwdXNoRm9sbG93ZXJzOiBmYWxzZSB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkVG8odGhpcy5jb250cm9sbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IFNjcm9sbE1hZ2ljLkNvbnRyb2xsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB3aXBlQW5pbWF0aW9uID0gbmV3IFRpbWVsaW5lTWF4KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNfeCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaXNfbmVnYXRpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuaW5uZXJTY3JvbGwuY2hpbGRyZW4sIChzbGlkZSwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lwZUFuaW1hdGlvbi5mcm9tVG8oc2xpZGUsIDEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IFwiMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IFwiMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IFwiMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVhc2U6IExpbmVhci5lYXNlTm9uZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpciA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc194KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc19uZWdhdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyW1wieFwiXSA9IFwiLTEwMCVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcltcInhcIl0gPSBcIjEwMCVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19uZWdhdGl2ZSA9ICFpc19uZWdhdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc19uZWdhdGl2ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyW1wieVwiXSA9IFwiLTEwMCVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcltcInlcIl0gPSBcIjEwMCVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc19uZWdhdGl2ZSA9ICFpc19uZWdhdGl2ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfeCA9ICFpc194O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpICUgMiA9PSAwICYmIGkgIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc194ID0gIWlzX3g7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpcGVBbmltYXRpb24uZnJvbVRvKHNsaWRlc1tpXSwgMSwgZGlyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHg6IFwiMCVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogXCIwJVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlYXNlOiBMaW5lYXIuZWFzZU5vbmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUgPSBuZXcgU2Nyb2xsTWFnaWMuU2NlbmUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2xldmVsOiAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJFbGVtZW50OiBcIiNpbm5lci1zY3JvbGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlnZ2VySG9vazogXCJvbkxlYXZlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCAqIGNvdW50ICsgXCIlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRQaW4oXCIjaW5uZXItc2Nyb2xsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNldFR3ZWVuKHdpcGVBbmltYXRpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmFkZFRvKHRoaXMuY29udHJvbGxlcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICAgICAgICB2YXIgc2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5tYWluLWlubmVyID4gc2VjdGlvbi5zZWN0aW9uXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IHNsaWRlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChzbGlkZXMsIGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlLnN0eWxlLm1pbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChzbGlkZXMsIGZ1bmN0aW9uIChzbGlkZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNsaWRlLnN0eWxlLm1pbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCArIFwicHhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcm9sbF9zZWxlY3RvciA9IFwiLnBhZ2UtdGVtcGxhdGUtcGFnZS1ob21lLXNlY3Rpb24gI3dyYXBwZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlY3Rpb25fc2VsZWN0b3IgPSBcIi5zZWN0aW9uLCAuc2l0ZS1mb290ZXJcIjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNjcm9sbFNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzY3JvbGxfc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlY3Rpb25zID0gc2Nyb2xsU2VsZWN0b3IgPyBzY3JvbGxTZWxlY3Rvci5xdWVyeVNlbGVjdG9yQWxsKHNlY3Rpb25fc2VsZWN0b3IpIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VjdGlvbnMgJiYgdGhpcy5zZWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWN0aW9uTmF2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25OYXYuY2xhc3NMaXN0LmFkZChcInNlY3Rpb24tbmF2XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlY3Rpb25Jbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25Jbm5lci5jbGFzc0xpc3QuYWRkKFwiaW5uZXJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uTmF2LmFwcGVuZENoaWxkKHNlY3Rpb25Jbm5lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNlY3Rpb25OYXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHRoaXMuc2VjdGlvbnMsIChzZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzKHNlY3Rpb24sIHsgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgKyBcInB4XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbCh0aGlzLnNlY3Rpb25zLCBmdW5jdGlvbiAoaW5kZXgsIHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuc2V0QXR0cmlidXRlKFwiZGF0YS1pbmRleFwiLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuaW5uZXJIVE1MID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKF9hID0gdGhpcy5mdWxscGFnZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm1vdmVUbyhpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb25Jbm5lci5hcHBlbmRDaGlsZChsaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzZWN0aW9uSW5uZXJIYW5kbGVyID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10uZm9yRWFjaC5jYWxsKHNlY3Rpb25Jbm5lci5jaGlsZHJlbiwgZnVuY3Rpb24gKGl0ZW0sIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT0gaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjcmVhdGVGdWxsUGFnZSA9IGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgZnVsbHBhZ2Uoc2VsZWN0b3IsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvblNlbGVjdG9yOiBzZWN0aW9uX3NlbGVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZnRlckxvYWQ6IGZ1bmN0aW9uIChhbmNob3JMaW5rLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbklubmVySGFuZGxlcihpbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcInNjcm9sbGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25MZWF2ZTogZnVuY3Rpb24gKGluZGV4LCBuZXh0SW5kZXgsIGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNlY3Rpb24gPSB0aGlzLnNlY3Rpb25zW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uSW5uZXJIYW5kbGVyKG5leHRJbmRleCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRJbmRleCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJpblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3Rpb24gPSB0aGlzLnNlY3Rpb25zW25leHRJbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbiA9PT0gbnVsbCB8fCBzZWN0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoXCJpblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxwYWdlID0gY3JlYXRlRnVsbFBhZ2Uoc2Nyb2xsX3NlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVyID0gd2luZG93LmlubmVyV2lkdGggPiB0aGlzLm9wdGlvbnMubW9iaWxlID8gdGhpcy5kZXNrdG9wSGFuZGxlciA6IHRoaXMubW9iaWxlSGFuZGxlcjtcbiAgICAgICAgaWYgKHdpbmRvdy5pbm5lcldpZHRoIDw9IHRoaXMub3B0aW9ucy5tb2JpbGUpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcIm5vLXNjcm9sbGluZy1zdHlsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXCJvbmhhc2hjaGFuZ2VcIiBpbiB3aW5kb3cpIHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiaGFzaGNoYW5nZVwiLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2Nyb2xsSGFuZGxlcigpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCA9PSBcIiMhc2VhcmNoXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwic2VhcmNoLWNsb3NlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKFwic2VhcmNoLWFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJzZWFyY2gtY2xvc2VkXCIpO1xuICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgaGFzaCA9IChfYSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EucmVwbGFjZShcIiMhXCIsIFwiXCIpO1xuICAgICAgICAgICAgICAgIGlmIChoYXNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aGFzaH1gKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsSWZOZWVkZWQoc2VjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGhhc2guc3BsaXQoXCIvXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGF0aFswXSA9PSBcInRhYnNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93VGFiKHBhdGhbMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImhhc2hjaGFuZ2VcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGUpIHsgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIGVsbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1tYWluLW1lbnUgbGkgYVtocmVmXj1cXFxcL1xcXFwjXVwiKTtcbiAgICAgICAgICAgIGlmIChlbG0pIHtcbiAgICAgICAgICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmJ0bi5idG4tYmFja1wiKTtcbiAgICAgICAgaWYgKGVsbSkge1xuICAgICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaGFzaCA9IFwiI2hvbWVcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYVtocmVmPVwiI3NlYXJjaFwiXScpO1xuICAgICAgICBpZiAoZWxtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChlbG1zLCBmdW5jdGlvbiAoZWxtKSB7XG4gICAgICAgICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcInNlYXJjaC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcInNlYXJjaC1jbG9zZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbG0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NlYXJjaGZvcm0gYS5zZWFyY2gtY2xvc2VcIik7XG4gICAgICAgIGlmIChlbG0pXG4gICAgICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJzZWFyY2gtY2xvc2VkXCIpO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcInNlYXJjaC1hY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcInNlYXJjaC1jbG9zZWRcIik7XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHZhciBtZW51SXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI25hdmJhciB1bCBsaSBhXCIpO1xuICAgICAgICB2YXIgc2Nyb2xsSXRlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiI3dyYXBwZXIgPiBzZWN0aW9uXCIpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICBpZiAod2luZG93LmlubmVyV2lkdGggPD0gdGhpcy5vcHRpb25zLm1vYmlsZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NlbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuZGVzdHJveSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIuZGVzdHJveSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwibm8tc2Nyb2xsaW5nLXN0eWxlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLm1vYmlsZUhhbmRsZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZXIgPSB0aGlzLmRlc2t0b3BIYW5kbGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgKCkgPT4ge1xuICAgICAgICAgICAgdmFyIHBvc2l0b24gPSB0aGlzLmdldFNjcm9sbFBvc2l0aW9uKHdpbmRvdyk7XG4gICAgICAgICAgICB2YXIgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYXN0aGVhZFwiKTtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSAwO1xuICAgICAgICAgICAgaWYgKGhlYWRlcikge1xuICAgICAgICAgICAgICAgIG9mZnNldCA9IGhlYWRlci5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZnJvbVRvcCA9IHBvc2l0b24ueSArIG9mZnNldCArIDEwMDtcbiAgICAgICAgICAgIHZhciBjdXIgPSBbXS5tYXAuY2FsbChzY3JvbGxJdGVtcywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgYm91bmRzID0gaXRlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBpZiAoYm91bmRzLnRvcCA8IGZyb21Ub3ApXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjdXIgPSBjdXJbY3VyLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgdmFyIGlkID0gY3VyID8gY3VyLmdldEF0dHJpYnV0ZShcImlkXCIpIDogXCJcIjtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChtZW51SXRlbXMsIGZ1bmN0aW9uIChtZW51SXRlbSkge1xuICAgICAgICAgICAgICAgIG1lbnVJdGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzZWN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25hdmJhciB1bCBsaSBhW3NlY3Rpb249XCInICsgaWQgKyAnXCJdJyk7XG4gICAgICAgICAgICBzZWN0aW9uICYmIHNlY3Rpb24uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIGlmIChwb3NpdG9uLnkgPiAxMDApIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoXCJzY3JvbGxpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZWxtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubmEtcG9zdHMtZHJvcGRvd24gPiBhXCIpO1xuICAgICAgICBpZiAoZWxtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFtdLmZvckVhY2guY2FsbChlbG1zLCBmdW5jdGlvbiAoZWxtKSB7XG4gICAgICAgICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGVsbS5wYXJlbnROb2RlLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGluZ092ZXJsYXkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRpbmctb3ZlcmxheVwiKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImxvYWRpbmdcIik7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoXCJsb2FkZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGxvYWRpbmdPdmVybGF5KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRpbmdPdmVybGF5LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobG9hZGluZ092ZXJsYXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDIwMDApO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICAgICAgaWYgKHBvcyA+IDEwMCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZChcInNjcm9sbGluZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2VjdGlvbk9ic2VydmVyKCk7XG4gICAgICAgIHdpbmRvd1tcIm5hVGhlbWVcIl0gPSB0aGlzO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwidGhlbWUtcmVhZHlcIiwge1xuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgICAgIGRldGFpbDogdGhpcyxcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBlc2NhcGVSZWdFeHAoc3RyKSB7XG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcLVxcW1xcXVxcL1xce1xcfVxcKFxcKVxcKlxcK1xcP1xcLlxcXFxcXF5cXCRcXHxdL2csIFwiXFxcXCQmXCIpO1xuICAgIH1cbiAgICBzY3JvbGxJZk5lZWRlZChlbG0sIGNhbGxiYWNrID0gbnVsbCwgb2Zmc2V0ID0gdGhpcy5oZWFkZXJPZmZzZXQpIHtcbiAgICAgICAgbGV0IHRvID0gZWxtLm9mZnNldFRvcDtcbiAgICAgICAgdGhpcy5zY3JvbGxUbyh0bywgY2FsbGJhY2ssIG9mZnNldCk7XG4gICAgfVxuICAgIHNjcm9sbFRvKHRvLCBjYWxsYmFjayA9IG51bGwsIG9mZnNldCA9IHRoaXMuaGVhZGVyT2Zmc2V0KSB7XG4gICAgICAgIGxldCBzY3JvbGxlciA9IGRvY3VtZW50LnNjcm9sbGluZ0VsZW1lbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgICAgICAgaWYgKHNjcm9sbGVyKSB7XG4gICAgICAgICAgICBhbmltYXRlKHtcbiAgICAgICAgICAgICAgICBmcm9tOiBzY3JvbGxlci5zY3JvbGxUb3AsXG4gICAgICAgICAgICAgICAgdG86IHRvIC0gb2Zmc2V0LFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwLFxuICAgICAgICAgICAgICAgIGVhc2U6IGJhY2tPdXQsXG4gICAgICAgICAgICAgICAgb25VcGRhdGU6ICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxlci5zY3JvbGxUb3AgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9uQ29tcGxldGU6IGNhbGxiYWNrLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5hcHAucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIG5ldyBUaGVtZShvcHRpb25zKTtcbiAgICB0cnkge1xuICAgICAgICB2YXIgbWFjID0gLyhNYWN8aVBob25lfGlQb2R8aVBhZCkvaS50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSk7XG4gICAgICAgIGlmICghbWFjKVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwiY3VzdG9tLXNjcm9sbGJhclwiKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IH1cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxvYWRpbmdPdmVybGF5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkaW5nLW92ZXJsYXlcIik7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZShcImxvYWRpbmdcIik7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKFwibG9hZGVkXCIpO1xuICAgICAgICAgICAgaWYgKGxvYWRpbmdPdmVybGF5KSB7XG4gICAgICAgICAgICAgICAgbG9hZGluZ092ZXJsYXkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChsb2FkaW5nT3ZlcmxheSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDIwMDApO1xuICAgIH0sIDQwMDApO1xufSk7XG4iXSwibmFtZXMiOlsiaHlwaGVuYXRlIiwiY2xhbXAiLCJhbmFseXNlIiwiY3NzIl0sIm1hcHBpbmdzIjoiOzs7RUFBQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ2UsU0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFO0VBQzVDLEVBQUUsT0FBTyxJQUFJLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxRQUFRLENBQUM7RUFDaEQ7O0VDTkE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtBQUNBO0VBQ2UsU0FBUyxXQUFXLENBQUMsSUFBSSxFQUFFO0VBQzFDLEVBQUUsSUFBSSxHQUFHLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0VBQ2hDLEVBQUUsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUM7RUFDMUM7O0VDVEE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0FBQ0E7RUFDZSxTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7RUFDOUQsRUFBRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7RUFD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UUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDM0IsS0FBSztFQUNMLFNBQVM7RUFDVCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMzQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMzQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDZixLQUFLO0VBQ0wsSUFBSSxPQUFPO0VBQ1gsUUFBUSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDNUIsUUFBUSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDOUIsUUFBUSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7RUFDN0IsUUFBUSxLQUFLLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7RUFDNUMsS0FBSyxDQUFDO0VBQ04sQ0FBQztFQUNELElBQUksR0FBRyxHQUFHO0VBQ1YsSUFBSSxJQUFJLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQztFQUM1QixJQUFJLEtBQUssRUFBRSxRQUFRO0VBQ25CLElBQUksU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO0VBQzdCLENBQUM7O0VDOUJELElBQUksS0FBSyxHQUFHO0VBQ1osSUFBSSxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDOUUsSUFBSSxLQUFLLEVBQUUsVUFBVSxDQUFDLEVBQUU7RUFDeEIsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7RUFDMUIsWUFBWSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDakMsU0FBUztFQUNULGFBQWEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0VBQy9CLFlBQVksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2pDLFNBQVM7RUFDVCxhQUFhO0VBQ2IsWUFBWSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDaEMsU0FBUztFQUNULEtBQUs7RUFDTCxJQUFJLFNBQVMsRUFBRSxVQUFVLENBQUMsRUFBRTtFQUM1QixRQUFRLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQztFQUMxQixjQUFjLENBQUM7RUFDZixjQUFjLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO0VBQ3JDLGtCQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztFQUNuQyxrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNwQyxLQUFLO0VBQ0wsQ0FBQzs7RUNyQkQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDO0VBQ3hCLElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQztFQUN6QixTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUU7RUFDakIsSUFBSSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztFQUN2QixJQUFJLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUNwQixRQUFRLFFBQVEsQ0FBQyxDQUFDLENBQUM7RUFDbkIsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxJQUFJLEVBQUUsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUU7RUFDM1AsQ0FBQztFQUNELFNBQVNDLFNBQU8sQ0FBQyxDQUFDLEVBQUU7RUFDcEIsSUFBSSxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7RUFDcEIsSUFBSSxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7RUFDdEIsSUFBSSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQ3JDLElBQUksSUFBSSxNQUFNLEVBQUU7RUFDaEIsUUFBUSxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNsQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztFQUM5QyxRQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0VBQzNELEtBQUs7RUFDTCxJQUFJLElB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
