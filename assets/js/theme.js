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

  function getComputedStyle$1(node, psuedoElement) {
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
      return node.style.getPropertyValue(hyphenateStyleName(property)) || getComputedStyle$1(node).getPropertyValue(hyphenateStyleName(property));
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
  /* global Reflect, Promise */


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
  function isString$1(v) {
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
          return isString$1(v) && v.endsWith(unit) && v.split(' ').length === 1;
      },
      parse: parseFloat,
      transform: function (v) { return "" + v + unit; },
  }); };
  var percent = createUnitType('%');
  __assign(__assign({}, percent), { parse: function (v) { return percent.parse(v) / 100; }, transform: function (v) { return percent.transform(v * 100); } });

  var isColorString = function (type, testProp) { return function (v) {
      return Boolean((isString$1(v) && singleColorRegex.test(v) && v.startsWith(type)) ||
          (testProp && Object.prototype.hasOwnProperty.call(v, testProp)));
  }; };
  var splitColor = function (aName, bName, cName) { return function (v) {
      var _a;
      if (!isString$1(v))
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
          return isString$1(v)
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
          isString$1(v) &&
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
  var easeIn = createExpoIn(2);
  var easeInOut = mirrorEasing(easeIn);
  var backIn = createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
  var backOut = reverseEasing(backIn);
  createAnticipate(DEFAULT_OVERSHOOT_STRENGTH);

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

  class ParallaxElement {
  	
  	
  	
  	
  	constructor(element) {ParallaxElement.prototype.__init.call(this);
  		if (!element) {
  			return;
  		}

  		this.element = element;
  		this.isScroll = false;

  		this.latestScroll = 0;
  		this.init();
  	}

  	init() {
  		window.addEventListener(
  			"scroll",
  			() => {
  				this.latestScroll = window.scrollY;
  				this.checkScroll();
  			},
  			false
  		);
  	}
  	checkScroll() {
  		if (!this.isScroll) {
  			window.requestAnimationFrame(this.update);
  		}
  		this.isScroll = true;
  	}

  	__init() {this.update = () => {
  		this.currentScroll = this.latestScroll;
  		this.isScroll = false;
  		var helloScroll = this.currentScroll / 4;

  		this.element.style.transform = "translate3d(0, " + helloScroll + "px, 0)";
  	};}

  	getOffsetTop(elem) {
  		var top = 0;

  		do {
  			top += elem.offsetTop - elem.scrollTop;
  		} while ((elem = elem.offsetParent));

  		return top;
  	}
  }

  class Parallax {
  	
  	
  	
  	
  	__init2() {this.parallaxElements = [];}
  	constructor() {Parallax.prototype.__init2.call(this);
  		this.elements = document.querySelectorAll(".entry-header figure.entry-image");
  		if (!this.elements || this.elements.length == 0) {  
  			return;
  		}
  		this.isScroll = false;

  		this.latestScroll = 0;
  		var requestAnimationFrame = window.requestAnimationFrame || window["mozRequestAnimationFrame"] || window['webkitRequestAnimationFrame'] || window["msRequestAnimationFrame"];

  		window.requestAnimationFrame = requestAnimationFrame;
  		[].forEach.call(this.elements, (elm) => {
  			this.parallaxElements.push(new ParallaxElement(elm));
  		});
  	}
  }

  const counter = (duration, callback) => {
      let startTime = null;
      //get the current timestamp and assign it to the currentTime variable
      let currentTime = Date.now();

      //pass the current timestamp to the step function
      const step = () => {
          //if the start time is null, assign the current time to startTime
          if (!startTime) {
              startTime = currentTime;
          }

          //calculate the value to be used in calculating the number to be displayed
          const progress = Math.min((currentTime - startTime) / duration, 1);

          //calculate what to be displayed using the value gotten above
          callback(progress);

          //checking to make sure the counter does not exceed the last value (lastVal)
          if (progress < 1) {
              window.requestAnimationFrame(step);
          } else {
              window.cancelAnimationFrame(window.requestAnimationFrame(step));
          }
      };

      //start animating
      window.requestAnimationFrame(step);
  };

  class Team {
  	__init() {this.last = null;}
  	constructor() {Team.prototype.__init.call(this);
  		document.addEventListener("keydown", (event) => {
  			if (event.key == "27") {
  				event.preventDefault();
  				window.location.hash = "#!";
  			}
  		});
  		window.addEventListener("hashchange", (e) => {
  			var hash = window.location.hash.replace(/^#!/, "");
  			if (hash) {
  				var path = hash.split("/");
  				if (path[0] == "team-member") {
  					this.show(path[1]);
  				} else if (path[0] == "team") {
  					this.filter(path[1]);
  				}
  			}
  		});
  	}
  	filter(term_id) {
  		let current = document.querySelector('a[href="' + window.location.hash + '"]');
  		if (current) {
  			current.classList.add("active");
  			let closest = this.closest(current, ".na-team-wrapper");
  			if (closest) {
  				let listItems = closest.querySelectorAll("ul.na-team>li");

  				if (listItems && listItems.length) {
  					[].forEach.call(listItems, (listItem) => {
  						let data = listItem.querySelector("a[data-terms]");
  						if (!data) {
  							return;
  						}
  						let terms = data.getAttribute("data-terms");
  						let mterms = terms.split(",");
  						if (mterms.indexOf(term_id) >= 0) {
  							listItem.classList.remove("hidden");
  							animate({
  								from: 0,
  								to: 1,
  								duration: 1000,
  								ease: backOut,
  								onUpdate: (value) => {
  									listItem.style.opacity = value;
  								},
  								onComplete: () => {},
  							});
  						} else {
  							animate({
  								from: 1,
  								to: 0,
  								duration: 100,
  								ease: backOut,
  								onUpdate: (value) => {
  									listItem.style.opacity = value;
  								},
  								onComplete: () => {
  									listItem.classList.add("hidden");
  								},
  							});
  						}
  					});
  				}
  			}
  			let all = document.querySelectorAll('a[href^="#!team/"]');
  			if (all && all.length) {
  				[].forEach.call(all, (elm) => {
  					if (current != elm) {
  						elm.classList.remove("active");
  					}
  				});
  			}
  		}
  	}
  	show(id) {
  		let data = new FormData();
  		data.append("action", "team_member");
  		data.append("id", id);
  		document.body.classList.add("na-team-active");
  		fetch(TeamSettings.url, {
  			method: "POST", // or 'PUT'
  			headers: {
  				"Content-Type": "application/x-www-form-urlencoded",
  			},
  			body: data,
  		})
  			.then((response) => response.json())
  			.then((result) => {
  				if (result && result.status == "success") {
  					var post_template = wp.template("team-member");
  					let div = document.createElement("div");
  					div.setAttribute("id", "na-team-member-template");

  					let close = document.createElement("a");
  					close.setAttribute("class", "close-team");
  					close.addEventListener("click", (e) => {
  						e.preventDefault();
  						document.querySelector("#na-team-member-template").remove();
  						document.body.classList.remove("na-team-active");

  						window.location.hash = "#!";
  					});
  					close.href = "#";

  					div.innerHTML = post_template(result.post);
  					div.appendChild(close);
  					div.style.display = "block";
  				} else {
  					document.body.classList.remove("na-team-active");
  				}
  			})
  			.catch((error) => {
  				console.error("Error:", error);
  				window.location.hash = "#!";
  				document.body.classList.remove("na-team-active");
  			});

  		return false;
  	}
  	closest(el, selector) {
  		var matchesFn;

  		// find vendor prefix
  		["matches", "webkitMatchesSelector", "mozMatchesSelector", "msMatchesSelector", "oMatchesSelector"].some(function (fn) {
  			if (typeof document.body[fn] == "function") {
  				matchesFn = fn;
  				return true;
  			}
  			return false;
  		});

  		var parent;

  		// traverse parents
  		while (el) {
  			parent = el.parentElement;
  			if (parent && parent[matchesFn](selector)) {
  				return parent;
  			}
  			el = parent;
  		}

  		return null;
  	}
  }

  // packages/alpinejs/src/scheduler.js
  var flushPending = false;
  var flushing = false;
  var queue = [];
  function scheduler(callback) {
    queueJob(callback);
  }
  function queueJob(job) {
    if (!queue.includes(job))
      queue.push(job);
    queueFlush();
  }
  function dequeueJob(job) {
    let index = queue.indexOf(job);
    if (index !== -1)
      queue.splice(index, 1);
  }
  function queueFlush() {
    if (!flushing && !flushPending) {
      flushPending = true;
      queueMicrotask(flushJobs);
    }
  }
  function flushJobs() {
    flushPending = false;
    flushing = true;
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
    }
    queue.length = 0;
    flushing = false;
  }

  // packages/alpinejs/src/reactivity.js
  var reactive;
  var effect;
  var release;
  var raw;
  var shouldSchedule = true;
  function disableEffectScheduling(callback) {
    shouldSchedule = false;
    callback();
    shouldSchedule = true;
  }
  function setReactivityEngine(engine) {
    reactive = engine.reactive;
    release = engine.release;
    effect = (callback) => engine.effect(callback, {scheduler: (task) => {
      if (shouldSchedule) {
        scheduler(task);
      } else {
        task();
      }
    }});
    raw = engine.raw;
  }
  function overrideEffect(override) {
    effect = override;
  }
  function elementBoundEffect(el) {
    let cleanup2 = () => {
    };
    let wrappedEffect = (callback) => {
      let effectReference = effect(callback);
      if (!el._x_effects) {
        el._x_effects = new Set();
        el._x_runEffects = () => {
          el._x_effects.forEach((i) => i());
        };
      }
      el._x_effects.add(effectReference);
      cleanup2 = () => {
        if (effectReference === void 0)
          return;
        el._x_effects.delete(effectReference);
        release(effectReference);
      };
      return effectReference;
    };
    return [wrappedEffect, () => {
      cleanup2();
    }];
  }

  // packages/alpinejs/src/mutation.js
  var onAttributeAddeds = [];
  var onElRemoveds = [];
  var onElAddeds = [];
  function onElAdded(callback) {
    onElAddeds.push(callback);
  }
  function onElRemoved(el, callback) {
    if (typeof callback === "function") {
      if (!el._x_cleanups)
        el._x_cleanups = [];
      el._x_cleanups.push(callback);
    } else {
      callback = el;
      onElRemoveds.push(callback);
    }
  }
  function onAttributesAdded(callback) {
    onAttributeAddeds.push(callback);
  }
  function onAttributeRemoved(el, name, callback) {
    if (!el._x_attributeCleanups)
      el._x_attributeCleanups = {};
    if (!el._x_attributeCleanups[name])
      el._x_attributeCleanups[name] = [];
    el._x_attributeCleanups[name].push(callback);
  }
  function cleanupAttributes(el, names) {
    if (!el._x_attributeCleanups)
      return;
    Object.entries(el._x_attributeCleanups).forEach(([name, value]) => {
      if (names === void 0 || names.includes(name)) {
        value.forEach((i) => i());
        delete el._x_attributeCleanups[name];
      }
    });
  }
  var observer = new MutationObserver(onMutate);
  var currentlyObserving = false;
  function startObservingMutations() {
    observer.observe(document, {subtree: true, childList: true, attributes: true, attributeOldValue: true});
    currentlyObserving = true;
  }
  function stopObservingMutations() {
    flushObserver();
    observer.disconnect();
    currentlyObserving = false;
  }
  var recordQueue = [];
  var willProcessRecordQueue = false;
  function flushObserver() {
    recordQueue = recordQueue.concat(observer.takeRecords());
    if (recordQueue.length && !willProcessRecordQueue) {
      willProcessRecordQueue = true;
      queueMicrotask(() => {
        processRecordQueue();
        willProcessRecordQueue = false;
      });
    }
  }
  function processRecordQueue() {
    onMutate(recordQueue);
    recordQueue.length = 0;
  }
  function mutateDom(callback) {
    if (!currentlyObserving)
      return callback();
    stopObservingMutations();
    let result = callback();
    startObservingMutations();
    return result;
  }
  var isCollecting = false;
  var deferredMutations = [];
  function deferMutations() {
    isCollecting = true;
  }
  function flushAndStopDeferringMutations() {
    isCollecting = false;
    onMutate(deferredMutations);
    deferredMutations = [];
  }
  function onMutate(mutations) {
    if (isCollecting) {
      deferredMutations = deferredMutations.concat(mutations);
      return;
    }
    let addedNodes = [];
    let removedNodes = [];
    let addedAttributes = new Map();
    let removedAttributes = new Map();
    for (let i = 0; i < mutations.length; i++) {
      if (mutations[i].target._x_ignoreMutationObserver)
        continue;
      if (mutations[i].type === "childList") {
        mutations[i].addedNodes.forEach((node) => node.nodeType === 1 && addedNodes.push(node));
        mutations[i].removedNodes.forEach((node) => node.nodeType === 1 && removedNodes.push(node));
      }
      if (mutations[i].type === "attributes") {
        let el = mutations[i].target;
        let name = mutations[i].attributeName;
        let oldValue = mutations[i].oldValue;
        let add2 = () => {
          if (!addedAttributes.has(el))
            addedAttributes.set(el, []);
          addedAttributes.get(el).push({name, value: el.getAttribute(name)});
        };
        let remove = () => {
          if (!removedAttributes.has(el))
            removedAttributes.set(el, []);
          removedAttributes.get(el).push(name);
        };
        if (el.hasAttribute(name) && oldValue === null) {
          add2();
        } else if (el.hasAttribute(name)) {
          remove();
          add2();
        } else {
          remove();
        }
      }
    }
    removedAttributes.forEach((attrs, el) => {
      cleanupAttributes(el, attrs);
    });
    addedAttributes.forEach((attrs, el) => {
      onAttributeAddeds.forEach((i) => i(el, attrs));
    });
    for (let node of removedNodes) {
      if (addedNodes.includes(node))
        continue;
      onElRemoveds.forEach((i) => i(node));
      if (node._x_cleanups) {
        while (node._x_cleanups.length)
          node._x_cleanups.pop()();
      }
    }
    addedNodes.forEach((node) => {
      node._x_ignoreSelf = true;
      node._x_ignore = true;
    });
    for (let node of addedNodes) {
      if (removedNodes.includes(node))
        continue;
      if (!node.isConnected)
        continue;
      delete node._x_ignoreSelf;
      delete node._x_ignore;
      onElAddeds.forEach((i) => i(node));
      node._x_ignore = true;
      node._x_ignoreSelf = true;
    }
    addedNodes.forEach((node) => {
      delete node._x_ignoreSelf;
      delete node._x_ignore;
    });
    addedNodes = null;
    removedNodes = null;
    addedAttributes = null;
    removedAttributes = null;
  }

  // packages/alpinejs/src/scope.js
  function scope(node) {
    return mergeProxies(closestDataStack(node));
  }
  function addScopeToNode(node, data2, referenceNode) {
    node._x_dataStack = [data2, ...closestDataStack(referenceNode || node)];
    return () => {
      node._x_dataStack = node._x_dataStack.filter((i) => i !== data2);
    };
  }
  function refreshScope(element, scope2) {
    let existingScope = element._x_dataStack[0];
    Object.entries(scope2).forEach(([key, value]) => {
      existingScope[key] = value;
    });
  }
  function closestDataStack(node) {
    if (node._x_dataStack)
      return node._x_dataStack;
    if (typeof ShadowRoot === "function" && node instanceof ShadowRoot) {
      return closestDataStack(node.host);
    }
    if (!node.parentNode) {
      return [];
    }
    return closestDataStack(node.parentNode);
  }
  function mergeProxies(objects) {
    let thisProxy = new Proxy({}, {
      ownKeys: () => {
        return Array.from(new Set(objects.flatMap((i) => Object.keys(i))));
      },
      has: (target, name) => {
        return objects.some((obj) => obj.hasOwnProperty(name));
      },
      get: (target, name) => {
        return (objects.find((obj) => {
          if (obj.hasOwnProperty(name)) {
            let descriptor = Object.getOwnPropertyDescriptor(obj, name);
            if (descriptor.get && descriptor.get._x_alreadyBound || descriptor.set && descriptor.set._x_alreadyBound) {
              return true;
            }
            if ((descriptor.get || descriptor.set) && descriptor.enumerable) {
              let getter = descriptor.get;
              let setter = descriptor.set;
              let property = descriptor;
              getter = getter && getter.bind(thisProxy);
              setter = setter && setter.bind(thisProxy);
              if (getter)
                getter._x_alreadyBound = true;
              if (setter)
                setter._x_alreadyBound = true;
              Object.defineProperty(obj, name, {
                ...property,
                get: getter,
                set: setter
              });
            }
            return true;
          }
          return false;
        }) || {})[name];
      },
      set: (target, name, value) => {
        let closestObjectWithKey = objects.find((obj) => obj.hasOwnProperty(name));
        if (closestObjectWithKey) {
          closestObjectWithKey[name] = value;
        } else {
          objects[objects.length - 1][name] = value;
        }
        return true;
      }
    });
    return thisProxy;
  }

  // packages/alpinejs/src/interceptor.js
  function initInterceptors(data2) {
    let isObject2 = (val) => typeof val === "object" && !Array.isArray(val) && val !== null;
    let recurse = (obj, basePath = "") => {
      Object.entries(Object.getOwnPropertyDescriptors(obj)).forEach(([key, {value, enumerable}]) => {
        if (enumerable === false || value === void 0)
          return;
        let path = basePath === "" ? key : `${basePath}.${key}`;
        if (typeof value === "object" && value !== null && value._x_interceptor) {
          obj[key] = value.initialize(data2, path, key);
        } else {
          if (isObject2(value) && value !== obj && !(value instanceof Element)) {
            recurse(value, path);
          }
        }
      });
    };
    return recurse(data2);
  }
  function interceptor(callback, mutateObj = () => {
  }) {
    let obj = {
      initialValue: void 0,
      _x_interceptor: true,
      initialize(data2, path, key) {
        return callback(this.initialValue, () => get(data2, path), (value) => set(data2, path, value), path, key);
      }
    };
    mutateObj(obj);
    return (initialValue) => {
      if (typeof initialValue === "object" && initialValue !== null && initialValue._x_interceptor) {
        let initialize = obj.initialize.bind(obj);
        obj.initialize = (data2, path, key) => {
          let innerValue = initialValue.initialize(data2, path, key);
          obj.initialValue = innerValue;
          return initialize(data2, path, key);
        };
      } else {
        obj.initialValue = initialValue;
      }
      return obj;
    };
  }
  function get(obj, path) {
    return path.split(".").reduce((carry, segment) => carry[segment], obj);
  }
  function set(obj, path, value) {
    if (typeof path === "string")
      path = path.split(".");
    if (path.length === 1)
      obj[path[0]] = value;
    else if (path.length === 0)
      throw error;
    else {
      if (obj[path[0]])
        return set(obj[path[0]], path.slice(1), value);
      else {
        obj[path[0]] = {};
        return set(obj[path[0]], path.slice(1), value);
      }
    }
  }

  // packages/alpinejs/src/magics.js
  var magics = {};
  function magic(name, callback) {
    magics[name] = callback;
  }
  function injectMagics(obj, el) {
    Object.entries(magics).forEach(([name, callback]) => {
      Object.defineProperty(obj, `$${name}`, {
        get() {
          let [utilities, cleanup2] = getElementBoundUtilities(el);
          utilities = {interceptor, ...utilities};
          onElRemoved(el, cleanup2);
          return callback(el, utilities);
        },
        enumerable: false
      });
    });
    return obj;
  }

  // packages/alpinejs/src/utils/error.js
  function tryCatch(el, expression, callback, ...args) {
    try {
      return callback(...args);
    } catch (e) {
      handleError(e, el, expression);
    }
  }
  function handleError(error2, el, expression = void 0) {
    Object.assign(error2, {el, expression});
    console.warn(`Alpine Expression Error: ${error2.message}

${expression ? 'Expression: "' + expression + '"\n\n' : ""}`, el);
    setTimeout(() => {
      throw error2;
    }, 0);
  }

  // packages/alpinejs/src/evaluator.js
  var shouldAutoEvaluateFunctions = true;
  function dontAutoEvaluateFunctions(callback) {
    let cache = shouldAutoEvaluateFunctions;
    shouldAutoEvaluateFunctions = false;
    callback();
    shouldAutoEvaluateFunctions = cache;
  }
  function evaluate(el, expression, extras = {}) {
    let result;
    evaluateLater(el, expression)((value) => result = value, extras);
    return result;
  }
  function evaluateLater(...args) {
    return theEvaluatorFunction(...args);
  }
  var theEvaluatorFunction = normalEvaluator;
  function setEvaluator(newEvaluator) {
    theEvaluatorFunction = newEvaluator;
  }
  function normalEvaluator(el, expression) {
    let overriddenMagics = {};
    injectMagics(overriddenMagics, el);
    let dataStack = [overriddenMagics, ...closestDataStack(el)];
    if (typeof expression === "function") {
      return generateEvaluatorFromFunction(dataStack, expression);
    }
    let evaluator = generateEvaluatorFromString(dataStack, expression, el);
    return tryCatch.bind(null, el, expression, evaluator);
  }
  function generateEvaluatorFromFunction(dataStack, func) {
    return (receiver = () => {
    }, {scope: scope2 = {}, params = []} = {}) => {
      let result = func.apply(mergeProxies([scope2, ...dataStack]), params);
      runIfTypeOfFunction(receiver, result);
    };
  }
  var evaluatorMemo = {};
  function generateFunctionFromString(expression, el) {
    if (evaluatorMemo[expression]) {
      return evaluatorMemo[expression];
    }
    let AsyncFunction = Object.getPrototypeOf(async function() {
    }).constructor;
    let rightSideSafeExpression = /^[\n\s]*if.*\(.*\)/.test(expression) || /^(let|const)\s/.test(expression) ? `(() => { ${expression} })()` : expression;
    const safeAsyncFunction = () => {
      try {
        return new AsyncFunction(["__self", "scope"], `with (scope) { __self.result = ${rightSideSafeExpression} }; __self.finished = true; return __self.result;`);
      } catch (error2) {
        handleError(error2, el, expression);
        return Promise.resolve();
      }
    };
    let func = safeAsyncFunction();
    evaluatorMemo[expression] = func;
    return func;
  }
  function generateEvaluatorFromString(dataStack, expression, el) {
    let func = generateFunctionFromString(expression, el);
    return (receiver = () => {
    }, {scope: scope2 = {}, params = []} = {}) => {
      func.result = void 0;
      func.finished = false;
      let completeScope = mergeProxies([scope2, ...dataStack]);
      if (typeof func === "function") {
        let promise = func(func, completeScope).catch((error2) => handleError(error2, el, expression));
        if (func.finished) {
          runIfTypeOfFunction(receiver, func.result, completeScope, params, el);
          func.result = void 0;
        } else {
          promise.then((result) => {
            runIfTypeOfFunction(receiver, result, completeScope, params, el);
          }).catch((error2) => handleError(error2, el, expression)).finally(() => func.result = void 0);
        }
      }
    };
  }
  function runIfTypeOfFunction(receiver, value, scope2, params, el) {
    if (shouldAutoEvaluateFunctions && typeof value === "function") {
      let result = value.apply(scope2, params);
      if (result instanceof Promise) {
        result.then((i) => runIfTypeOfFunction(receiver, i, scope2, params)).catch((error2) => handleError(error2, el, value));
      } else {
        receiver(result);
      }
    } else {
      receiver(value);
    }
  }

  // packages/alpinejs/src/directives.js
  var prefixAsString = "x-";
  function prefix(subject = "") {
    return prefixAsString + subject;
  }
  function setPrefix(newPrefix) {
    prefixAsString = newPrefix;
  }
  var directiveHandlers = {};
  function directive(name, callback) {
    directiveHandlers[name] = callback;
  }
  function directives(el, attributes, originalAttributeOverride) {
    attributes = Array.from(attributes);
    if (el._x_virtualDirectives) {
      let vAttributes = Object.entries(el._x_virtualDirectives).map(([name, value]) => ({name, value}));
      let staticAttributes = attributesOnly(vAttributes);
      vAttributes = vAttributes.map((attribute) => {
        if (staticAttributes.find((attr) => attr.name === attribute.name)) {
          return {
            name: `x-bind:${attribute.name}`,
            value: `"${attribute.value}"`
          };
        }
        return attribute;
      });
      attributes = attributes.concat(vAttributes);
    }
    let transformedAttributeMap = {};
    let directives2 = attributes.map(toTransformedAttributes((newName, oldName) => transformedAttributeMap[newName] = oldName)).filter(outNonAlpineAttributes).map(toParsedDirectives(transformedAttributeMap, originalAttributeOverride)).sort(byPriority);
    return directives2.map((directive2) => {
      return getDirectiveHandler(el, directive2);
    });
  }
  function attributesOnly(attributes) {
    return Array.from(attributes).map(toTransformedAttributes()).filter((attr) => !outNonAlpineAttributes(attr));
  }
  var isDeferringHandlers = false;
  var directiveHandlerStacks = new Map();
  var currentHandlerStackKey = Symbol();
  function deferHandlingDirectives(callback) {
    isDeferringHandlers = true;
    let key = Symbol();
    currentHandlerStackKey = key;
    directiveHandlerStacks.set(key, []);
    let flushHandlers = () => {
      while (directiveHandlerStacks.get(key).length)
        directiveHandlerStacks.get(key).shift()();
      directiveHandlerStacks.delete(key);
    };
    let stopDeferring = () => {
      isDeferringHandlers = false;
      flushHandlers();
    };
    callback(flushHandlers);
    stopDeferring();
  }
  function getElementBoundUtilities(el) {
    let cleanups = [];
    let cleanup2 = (callback) => cleanups.push(callback);
    let [effect3, cleanupEffect] = elementBoundEffect(el);
    cleanups.push(cleanupEffect);
    let utilities = {
      Alpine: alpine_default,
      effect: effect3,
      cleanup: cleanup2,
      evaluateLater: evaluateLater.bind(evaluateLater, el),
      evaluate: evaluate.bind(evaluate, el)
    };
    let doCleanup = () => cleanups.forEach((i) => i());
    return [utilities, doCleanup];
  }
  function getDirectiveHandler(el, directive2) {
    let noop = () => {
    };
    let handler3 = directiveHandlers[directive2.type] || noop;
    let [utilities, cleanup2] = getElementBoundUtilities(el);
    onAttributeRemoved(el, directive2.original, cleanup2);
    let fullHandler = () => {
      if (el._x_ignore || el._x_ignoreSelf)
        return;
      handler3.inline && handler3.inline(el, directive2, utilities);
      handler3 = handler3.bind(handler3, el, directive2, utilities);
      isDeferringHandlers ? directiveHandlerStacks.get(currentHandlerStackKey).push(handler3) : handler3();
    };
    fullHandler.runCleanups = cleanup2;
    return fullHandler;
  }
  var startingWith = (subject, replacement) => ({name, value}) => {
    if (name.startsWith(subject))
      name = name.replace(subject, replacement);
    return {name, value};
  };
  var into = (i) => i;
  function toTransformedAttributes(callback = () => {
  }) {
    return ({name, value}) => {
      let {name: newName, value: newValue} = attributeTransformers.reduce((carry, transform) => {
        return transform(carry);
      }, {name, value});
      if (newName !== name)
        callback(newName, name);
      return {name: newName, value: newValue};
    };
  }
  var attributeTransformers = [];
  function mapAttributes(callback) {
    attributeTransformers.push(callback);
  }
  function outNonAlpineAttributes({name}) {
    return alpineAttributeRegex().test(name);
  }
  var alpineAttributeRegex = () => new RegExp(`^${prefixAsString}([^:^.]+)\\b`);
  function toParsedDirectives(transformedAttributeMap, originalAttributeOverride) {
    return ({name, value}) => {
      let typeMatch = name.match(alpineAttributeRegex());
      let valueMatch = name.match(/:([a-zA-Z0-9\-:]+)/);
      let modifiers = name.match(/\.[^.\]]+(?=[^\]]*$)/g) || [];
      let original = originalAttributeOverride || transformedAttributeMap[name] || name;
      return {
        type: typeMatch ? typeMatch[1] : null,
        value: valueMatch ? valueMatch[1] : null,
        modifiers: modifiers.map((i) => i.replace(".", "")),
        expression: value,
        original
      };
    };
  }
  var DEFAULT = "DEFAULT";
  var directiveOrder = [
    "ignore",
    "ref",
    "data",
    "id",
    "bind",
    "init",
    "for",
    "mask",
    "model",
    "modelable",
    "transition",
    "show",
    "if",
    DEFAULT,
    "teleport"
  ];
  function byPriority(a, b) {
    let typeA = directiveOrder.indexOf(a.type) === -1 ? DEFAULT : a.type;
    let typeB = directiveOrder.indexOf(b.type) === -1 ? DEFAULT : b.type;
    return directiveOrder.indexOf(typeA) - directiveOrder.indexOf(typeB);
  }

  // packages/alpinejs/src/utils/dispatch.js
  function dispatch(el, name, detail = {}) {
    el.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true
    }));
  }

  // packages/alpinejs/src/nextTick.js
  var tickStack = [];
  var isHolding = false;
  function nextTick(callback = () => {
  }) {
    queueMicrotask(() => {
      isHolding || setTimeout(() => {
        releaseNextTicks();
      });
    });
    return new Promise((res) => {
      tickStack.push(() => {
        callback();
        res();
      });
    });
  }
  function releaseNextTicks() {
    isHolding = false;
    while (tickStack.length)
      tickStack.shift()();
  }
  function holdNextTicks() {
    isHolding = true;
  }

  // packages/alpinejs/src/utils/walk.js
  function walk(el, callback) {
    if (typeof ShadowRoot === "function" && el instanceof ShadowRoot) {
      Array.from(el.children).forEach((el2) => walk(el2, callback));
      return;
    }
    let skip = false;
    callback(el, () => skip = true);
    if (skip)
      return;
    let node = el.firstElementChild;
    while (node) {
      walk(node, callback);
      node = node.nextElementSibling;
    }
  }

  // packages/alpinejs/src/utils/warn.js
  function warn(message, ...args) {
    console.warn(`Alpine Warning: ${message}`, ...args);
  }

  // packages/alpinejs/src/lifecycle.js
  function start() {
    if (!document.body)
      warn("Unable to initialize. Trying to load Alpine before `<body>` is available. Did you forget to add `defer` in Alpine's `<script>` tag?");
    dispatch(document, "alpine:init");
    dispatch(document, "alpine:initializing");
    startObservingMutations();
    onElAdded((el) => initTree(el, walk));
    onElRemoved((el) => destroyTree(el));
    onAttributesAdded((el, attrs) => {
      directives(el, attrs).forEach((handle) => handle());
    });
    let outNestedComponents = (el) => !closestRoot(el.parentElement, true);
    Array.from(document.querySelectorAll(allSelectors())).filter(outNestedComponents).forEach((el) => {
      initTree(el);
    });
    dispatch(document, "alpine:initialized");
  }
  var rootSelectorCallbacks = [];
  var initSelectorCallbacks = [];
  function rootSelectors() {
    return rootSelectorCallbacks.map((fn) => fn());
  }
  function allSelectors() {
    return rootSelectorCallbacks.concat(initSelectorCallbacks).map((fn) => fn());
  }
  function addRootSelector(selectorCallback) {
    rootSelectorCallbacks.push(selectorCallback);
  }
  function addInitSelector(selectorCallback) {
    initSelectorCallbacks.push(selectorCallback);
  }
  function closestRoot(el, includeInitSelectors = false) {
    return findClosest(el, (element) => {
      const selectors = includeInitSelectors ? allSelectors() : rootSelectors();
      if (selectors.some((selector) => element.matches(selector)))
        return true;
    });
  }
  function findClosest(el, callback) {
    if (!el)
      return;
    if (callback(el))
      return el;
    if (el._x_teleportBack)
      el = el._x_teleportBack;
    if (!el.parentElement)
      return;
    return findClosest(el.parentElement, callback);
  }
  function isRoot(el) {
    return rootSelectors().some((selector) => el.matches(selector));
  }
  function initTree(el, walker = walk) {
    deferHandlingDirectives(() => {
      walker(el, (el2, skip) => {
        directives(el2, el2.attributes).forEach((handle) => handle());
        el2._x_ignore && skip();
      });
    });
  }
  function destroyTree(root) {
    walk(root, (el) => cleanupAttributes(el));
  }

  // packages/alpinejs/src/utils/classes.js
  function setClasses(el, value) {
    if (Array.isArray(value)) {
      return setClassesFromString(el, value.join(" "));
    } else if (typeof value === "object" && value !== null) {
      return setClassesFromObject(el, value);
    } else if (typeof value === "function") {
      return setClasses(el, value());
    }
    return setClassesFromString(el, value);
  }
  function setClassesFromString(el, classString) {
    let missingClasses = (classString2) => classString2.split(" ").filter((i) => !el.classList.contains(i)).filter(Boolean);
    let addClassesAndReturnUndo = (classes) => {
      el.classList.add(...classes);
      return () => {
        el.classList.remove(...classes);
      };
    };
    classString = classString === true ? classString = "" : classString || "";
    return addClassesAndReturnUndo(missingClasses(classString));
  }
  function setClassesFromObject(el, classObject) {
    let split = (classString) => classString.split(" ").filter(Boolean);
    let forAdd = Object.entries(classObject).flatMap(([classString, bool]) => bool ? split(classString) : false).filter(Boolean);
    let forRemove = Object.entries(classObject).flatMap(([classString, bool]) => !bool ? split(classString) : false).filter(Boolean);
    let added = [];
    let removed = [];
    forRemove.forEach((i) => {
      if (el.classList.contains(i)) {
        el.classList.remove(i);
        removed.push(i);
      }
    });
    forAdd.forEach((i) => {
      if (!el.classList.contains(i)) {
        el.classList.add(i);
        added.push(i);
      }
    });
    return () => {
      removed.forEach((i) => el.classList.add(i));
      added.forEach((i) => el.classList.remove(i));
    };
  }

  // packages/alpinejs/src/utils/styles.js
  function setStyles(el, value) {
    if (typeof value === "object" && value !== null) {
      return setStylesFromObject(el, value);
    }
    return setStylesFromString(el, value);
  }
  function setStylesFromObject(el, value) {
    let previousStyles = {};
    Object.entries(value).forEach(([key, value2]) => {
      previousStyles[key] = el.style[key];
      if (!key.startsWith("--")) {
        key = kebabCase(key);
      }
      el.style.setProperty(key, value2);
    });
    setTimeout(() => {
      if (el.style.length === 0) {
        el.removeAttribute("style");
      }
    });
    return () => {
      setStyles(el, previousStyles);
    };
  }
  function setStylesFromString(el, value) {
    let cache = el.getAttribute("style", value);
    el.setAttribute("style", value);
    return () => {
      el.setAttribute("style", cache || "");
    };
  }
  function kebabCase(subject) {
    return subject.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  // packages/alpinejs/src/utils/once.js
  function once(callback, fallback = () => {
  }) {
    let called = false;
    return function() {
      if (!called) {
        called = true;
        callback.apply(this, arguments);
      } else {
        fallback.apply(this, arguments);
      }
    };
  }

  // packages/alpinejs/src/directives/x-transition.js
  directive("transition", (el, {value, modifiers, expression}, {evaluate: evaluate2}) => {
    if (typeof expression === "function")
      expression = evaluate2(expression);
    if (!expression) {
      registerTransitionsFromHelper(el, modifiers, value);
    } else {
      registerTransitionsFromClassString(el, expression, value);
    }
  });
  function registerTransitionsFromClassString(el, classString, stage) {
    registerTransitionObject(el, setClasses, "");
    let directiveStorageMap = {
      enter: (classes) => {
        el._x_transition.enter.during = classes;
      },
      "enter-start": (classes) => {
        el._x_transition.enter.start = classes;
      },
      "enter-end": (classes) => {
        el._x_transition.enter.end = classes;
      },
      leave: (classes) => {
        el._x_transition.leave.during = classes;
      },
      "leave-start": (classes) => {
        el._x_transition.leave.start = classes;
      },
      "leave-end": (classes) => {
        el._x_transition.leave.end = classes;
      }
    };
    directiveStorageMap[stage](classString);
  }
  function registerTransitionsFromHelper(el, modifiers, stage) {
    registerTransitionObject(el, setStyles);
    let doesntSpecify = !modifiers.includes("in") && !modifiers.includes("out") && !stage;
    let transitioningIn = doesntSpecify || modifiers.includes("in") || ["enter"].includes(stage);
    let transitioningOut = doesntSpecify || modifiers.includes("out") || ["leave"].includes(stage);
    if (modifiers.includes("in") && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index < modifiers.indexOf("out"));
    }
    if (modifiers.includes("out") && !doesntSpecify) {
      modifiers = modifiers.filter((i, index) => index > modifiers.indexOf("out"));
    }
    let wantsAll = !modifiers.includes("opacity") && !modifiers.includes("scale");
    let wantsOpacity = wantsAll || modifiers.includes("opacity");
    let wantsScale = wantsAll || modifiers.includes("scale");
    let opacityValue = wantsOpacity ? 0 : 1;
    let scaleValue = wantsScale ? modifierValue(modifiers, "scale", 95) / 100 : 1;
    let delay = modifierValue(modifiers, "delay", 0);
    let origin = modifierValue(modifiers, "origin", "center");
    let property = "opacity, transform";
    let durationIn = modifierValue(modifiers, "duration", 150) / 1e3;
    let durationOut = modifierValue(modifiers, "duration", 75) / 1e3;
    let easing = `cubic-bezier(0.4, 0.0, 0.2, 1)`;
    if (transitioningIn) {
      el._x_transition.enter.during = {
        transformOrigin: origin,
        transitionDelay: delay,
        transitionProperty: property,
        transitionDuration: `${durationIn}s`,
        transitionTimingFunction: easing
      };
      el._x_transition.enter.start = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`
      };
      el._x_transition.enter.end = {
        opacity: 1,
        transform: `scale(1)`
      };
    }
    if (transitioningOut) {
      el._x_transition.leave.during = {
        transformOrigin: origin,
        transitionDelay: delay,
        transitionProperty: property,
        transitionDuration: `${durationOut}s`,
        transitionTimingFunction: easing
      };
      el._x_transition.leave.start = {
        opacity: 1,
        transform: `scale(1)`
      };
      el._x_transition.leave.end = {
        opacity: opacityValue,
        transform: `scale(${scaleValue})`
      };
    }
  }
  function registerTransitionObject(el, setFunction, defaultValue = {}) {
    if (!el._x_transition)
      el._x_transition = {
        enter: {during: defaultValue, start: defaultValue, end: defaultValue},
        leave: {during: defaultValue, start: defaultValue, end: defaultValue},
        in(before = () => {
        }, after = () => {
        }) {
          transition(el, setFunction, {
            during: this.enter.during,
            start: this.enter.start,
            end: this.enter.end
          }, before, after);
        },
        out(before = () => {
        }, after = () => {
        }) {
          transition(el, setFunction, {
            during: this.leave.during,
            start: this.leave.start,
            end: this.leave.end
          }, before, after);
        }
      };
  }
  window.Element.prototype._x_toggleAndCascadeWithTransitions = function(el, value, show, hide) {
    const nextTick2 = document.visibilityState === "visible" ? requestAnimationFrame : setTimeout;
    let clickAwayCompatibleShow = () => nextTick2(show);
    if (value) {
      if (el._x_transition && (el._x_transition.enter || el._x_transition.leave)) {
        el._x_transition.enter && (Object.entries(el._x_transition.enter.during).length || Object.entries(el._x_transition.enter.start).length || Object.entries(el._x_transition.enter.end).length) ? el._x_transition.in(show) : clickAwayCompatibleShow();
      } else {
        el._x_transition ? el._x_transition.in(show) : clickAwayCompatibleShow();
      }
      return;
    }
    el._x_hidePromise = el._x_transition ? new Promise((resolve, reject) => {
      el._x_transition.out(() => {
      }, () => resolve(hide));
      el._x_transitioning.beforeCancel(() => reject({isFromCancelledTransition: true}));
    }) : Promise.resolve(hide);
    queueMicrotask(() => {
      let closest = closestHide(el);
      if (closest) {
        if (!closest._x_hideChildren)
          closest._x_hideChildren = [];
        closest._x_hideChildren.push(el);
      } else {
        nextTick2(() => {
          let hideAfterChildren = (el2) => {
            let carry = Promise.all([
              el2._x_hidePromise,
              ...(el2._x_hideChildren || []).map(hideAfterChildren)
            ]).then(([i]) => i());
            delete el2._x_hidePromise;
            delete el2._x_hideChildren;
            return carry;
          };
          hideAfterChildren(el).catch((e) => {
            if (!e.isFromCancelledTransition)
              throw e;
          });
        });
      }
    });
  };
  function closestHide(el) {
    let parent = el.parentNode;
    if (!parent)
      return;
    return parent._x_hidePromise ? parent : closestHide(parent);
  }
  function transition(el, setFunction, {during, start: start2, end} = {}, before = () => {
  }, after = () => {
  }) {
    if (el._x_transitioning)
      el._x_transitioning.cancel();
    if (Object.keys(during).length === 0 && Object.keys(start2).length === 0 && Object.keys(end).length === 0) {
      before();
      after();
      return;
    }
    let undoStart, undoDuring, undoEnd;
    performTransition(el, {
      start() {
        undoStart = setFunction(el, start2);
      },
      during() {
        undoDuring = setFunction(el, during);
      },
      before,
      end() {
        undoStart();
        undoEnd = setFunction(el, end);
      },
      after,
      cleanup() {
        undoDuring();
        undoEnd();
      }
    });
  }
  function performTransition(el, stages) {
    let interrupted, reachedBefore, reachedEnd;
    let finish = once(() => {
      mutateDom(() => {
        interrupted = true;
        if (!reachedBefore)
          stages.before();
        if (!reachedEnd) {
          stages.end();
          releaseNextTicks();
        }
        stages.after();
        if (el.isConnected)
          stages.cleanup();
        delete el._x_transitioning;
      });
    });
    el._x_transitioning = {
      beforeCancels: [],
      beforeCancel(callback) {
        this.beforeCancels.push(callback);
      },
      cancel: once(function() {
        while (this.beforeCancels.length) {
          this.beforeCancels.shift()();
        }
        finish();
      }),
      finish
    };
    mutateDom(() => {
      stages.start();
      stages.during();
    });
    holdNextTicks();
    requestAnimationFrame(() => {
      if (interrupted)
        return;
      let duration = Number(getComputedStyle(el).transitionDuration.replace(/,.*/, "").replace("s", "")) * 1e3;
      let delay = Number(getComputedStyle(el).transitionDelay.replace(/,.*/, "").replace("s", "")) * 1e3;
      if (duration === 0)
        duration = Number(getComputedStyle(el).animationDuration.replace("s", "")) * 1e3;
      mutateDom(() => {
        stages.before();
      });
      reachedBefore = true;
      requestAnimationFrame(() => {
        if (interrupted)
          return;
        mutateDom(() => {
          stages.end();
        });
        releaseNextTicks();
        setTimeout(el._x_transitioning.finish, duration + delay);
        reachedEnd = true;
      });
    });
  }
  function modifierValue(modifiers, key, fallback) {
    if (modifiers.indexOf(key) === -1)
      return fallback;
    const rawValue = modifiers[modifiers.indexOf(key) + 1];
    if (!rawValue)
      return fallback;
    if (key === "scale") {
      if (isNaN(rawValue))
        return fallback;
    }
    if (key === "duration") {
      let match = rawValue.match(/([0-9]+)ms/);
      if (match)
        return match[1];
    }
    if (key === "origin") {
      if (["top", "right", "left", "center", "bottom"].includes(modifiers[modifiers.indexOf(key) + 2])) {
        return [rawValue, modifiers[modifiers.indexOf(key) + 2]].join(" ");
      }
    }
    return rawValue;
  }

  // packages/alpinejs/src/clone.js
  var isCloning = false;
  function skipDuringClone(callback, fallback = () => {
  }) {
    return (...args) => isCloning ? fallback(...args) : callback(...args);
  }
  function clone(oldEl, newEl) {
    if (!newEl._x_dataStack)
      newEl._x_dataStack = oldEl._x_dataStack;
    isCloning = true;
    dontRegisterReactiveSideEffects(() => {
      cloneTree(newEl);
    });
    isCloning = false;
  }
  function cloneTree(el) {
    let hasRunThroughFirstEl = false;
    let shallowWalker = (el2, callback) => {
      walk(el2, (el3, skip) => {
        if (hasRunThroughFirstEl && isRoot(el3))
          return skip();
        hasRunThroughFirstEl = true;
        callback(el3, skip);
      });
    };
    initTree(el, shallowWalker);
  }
  function dontRegisterReactiveSideEffects(callback) {
    let cache = effect;
    overrideEffect((callback2, el) => {
      let storedEffect = cache(callback2);
      release(storedEffect);
      return () => {
      };
    });
    callback();
    overrideEffect(cache);
  }

  // packages/alpinejs/src/utils/bind.js
  function bind(el, name, value, modifiers = []) {
    if (!el._x_bindings)
      el._x_bindings = reactive({});
    el._x_bindings[name] = value;
    name = modifiers.includes("camel") ? camelCase(name) : name;
    switch (name) {
      case "value":
        bindInputValue(el, value);
        break;
      case "style":
        bindStyles(el, value);
        break;
      case "class":
        bindClasses(el, value);
        break;
      default:
        bindAttribute(el, name, value);
        break;
    }
  }
  function bindInputValue(el, value) {
    if (el.type === "radio") {
      if (el.attributes.value === void 0) {
        el.value = value;
      }
      if (window.fromModel) {
        el.checked = checkedAttrLooseCompare(el.value, value);
      }
    } else if (el.type === "checkbox") {
      if (Number.isInteger(value)) {
        el.value = value;
      } else if (!Number.isInteger(value) && !Array.isArray(value) && typeof value !== "boolean" && ![null, void 0].includes(value)) {
        el.value = String(value);
      } else {
        if (Array.isArray(value)) {
          el.checked = value.some((val) => checkedAttrLooseCompare(val, el.value));
        } else {
          el.checked = !!value;
        }
      }
    } else if (el.tagName === "SELECT") {
      updateSelect(el, value);
    } else {
      if (el.value === value)
        return;
      el.value = value;
    }
  }
  function bindClasses(el, value) {
    if (el._x_undoAddedClasses)
      el._x_undoAddedClasses();
    el._x_undoAddedClasses = setClasses(el, value);
  }
  function bindStyles(el, value) {
    if (el._x_undoAddedStyles)
      el._x_undoAddedStyles();
    el._x_undoAddedStyles = setStyles(el, value);
  }
  function bindAttribute(el, name, value) {
    if ([null, void 0, false].includes(value) && attributeShouldntBePreservedIfFalsy(name)) {
      el.removeAttribute(name);
    } else {
      if (isBooleanAttr(name))
        value = name;
      setIfChanged(el, name, value);
    }
  }
  function setIfChanged(el, attrName, value) {
    if (el.getAttribute(attrName) != value) {
      el.setAttribute(attrName, value);
    }
  }
  function updateSelect(el, value) {
    const arrayWrappedValue = [].concat(value).map((value2) => {
      return value2 + "";
    });
    Array.from(el.options).forEach((option) => {
      option.selected = arrayWrappedValue.includes(option.value);
    });
  }
  function camelCase(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function checkedAttrLooseCompare(valueA, valueB) {
    return valueA == valueB;
  }
  function isBooleanAttr(attrName) {
    const booleanAttributes = [
      "disabled",
      "checked",
      "required",
      "readonly",
      "hidden",
      "open",
      "selected",
      "autofocus",
      "itemscope",
      "multiple",
      "novalidate",
      "allowfullscreen",
      "allowpaymentrequest",
      "formnovalidate",
      "autoplay",
      "controls",
      "loop",
      "muted",
      "playsinline",
      "default",
      "ismap",
      "reversed",
      "async",
      "defer",
      "nomodule"
    ];
    return booleanAttributes.includes(attrName);
  }
  function attributeShouldntBePreservedIfFalsy(name) {
    return !["aria-pressed", "aria-checked", "aria-expanded", "aria-selected"].includes(name);
  }
  function getBinding(el, name, fallback) {
    if (el._x_bindings && el._x_bindings[name] !== void 0)
      return el._x_bindings[name];
    let attr = el.getAttribute(name);
    if (attr === null)
      return typeof fallback === "function" ? fallback() : fallback;
    if (isBooleanAttr(name)) {
      return !![name, "true"].includes(attr);
    }
    if (attr === "")
      return true;
    return attr;
  }

  // packages/alpinejs/src/utils/debounce.js
  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // packages/alpinejs/src/utils/throttle.js
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      let context = this, args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // packages/alpinejs/src/plugin.js
  function plugin(callback) {
    callback(alpine_default);
  }

  // packages/alpinejs/src/store.js
  var stores = {};
  var isReactive = false;
  function store(name, value) {
    if (!isReactive) {
      stores = reactive(stores);
      isReactive = true;
    }
    if (value === void 0) {
      return stores[name];
    }
    stores[name] = value;
    if (typeof value === "object" && value !== null && value.hasOwnProperty("init") && typeof value.init === "function") {
      stores[name].init();
    }
    initInterceptors(stores[name]);
  }
  function getStores() {
    return stores;
  }

  // packages/alpinejs/src/binds.js
  var binds = {};
  function bind2(name, bindings) {
    let getBindings = typeof bindings !== "function" ? () => bindings : bindings;
    if (name instanceof Element) {
      applyBindingsObject(name, getBindings());
    } else {
      binds[name] = getBindings;
    }
  }
  function injectBindingProviders(obj) {
    Object.entries(binds).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback(...args);
          };
        }
      });
    });
    return obj;
  }
  function applyBindingsObject(el, obj, original) {
    let cleanupRunners = [];
    while (cleanupRunners.length)
      cleanupRunners.pop()();
    let attributes = Object.entries(obj).map(([name, value]) => ({name, value}));
    let staticAttributes = attributesOnly(attributes);
    attributes = attributes.map((attribute) => {
      if (staticAttributes.find((attr) => attr.name === attribute.name)) {
        return {
          name: `x-bind:${attribute.name}`,
          value: `"${attribute.value}"`
        };
      }
      return attribute;
    });
    directives(el, attributes, original).map((handle) => {
      cleanupRunners.push(handle.runCleanups);
      handle();
    });
  }

  // packages/alpinejs/src/datas.js
  var datas = {};
  function data(name, callback) {
    datas[name] = callback;
  }
  function injectDataProviders(obj, context) {
    Object.entries(datas).forEach(([name, callback]) => {
      Object.defineProperty(obj, name, {
        get() {
          return (...args) => {
            return callback.bind(context)(...args);
          };
        },
        enumerable: false
      });
    });
    return obj;
  }

  // packages/alpinejs/src/alpine.js
  var Alpine = {
    get reactive() {
      return reactive;
    },
    get release() {
      return release;
    },
    get effect() {
      return effect;
    },
    get raw() {
      return raw;
    },
    version: "3.10.3",
    flushAndStopDeferringMutations,
    dontAutoEvaluateFunctions,
    disableEffectScheduling,
    setReactivityEngine,
    closestDataStack,
    skipDuringClone,
    addRootSelector,
    addInitSelector,
    addScopeToNode,
    deferMutations,
    mapAttributes,
    evaluateLater,
    setEvaluator,
    mergeProxies,
    findClosest,
    closestRoot,
    interceptor,
    transition,
    setStyles,
    mutateDom,
    directive,
    throttle,
    debounce,
    evaluate,
    initTree,
    nextTick,
    prefixed: prefix,
    prefix: setPrefix,
    plugin,
    magic,
    store,
    start,
    clone,
    bound: getBinding,
    $data: scope,
    data,
    bind: bind2
  };
  var alpine_default = Alpine;

  // node_modules/@vue/shared/dist/shared.esm-bundler.js
  function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(",");
    for (let i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
  }
  var EMPTY_OBJ = Object.freeze({}) ;
  var extend = Object.assign;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var hasOwn = (val, key) => hasOwnProperty.call(val, key);
  var isArray = Array.isArray;
  var isMap = (val) => toTypeString(val) === "[object Map]";
  var isString = (val) => typeof val === "string";
  var isSymbol = (val) => typeof val === "symbol";
  var isObject = (val) => val !== null && typeof val === "object";
  var objectToString = Object.prototype.toString;
  var toTypeString = (value) => objectToString.call(value);
  var toRawType = (value) => {
    return toTypeString(value).slice(8, -1);
  };
  var isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
  var cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return (str) => {
      const hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  var capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  var hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

  // node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js
  var targetMap = new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = Symbol("iterate" );
  var MAP_KEY_ITERATE_KEY = Symbol("Map key iterate" );
  function isEffect(fn) {
    return fn && fn._isEffect === true;
  }
  function effect2(fn, options = EMPTY_OBJ) {
    if (isEffect(fn)) {
      fn = fn.raw;
    }
    const effect3 = createReactiveEffect(fn, options);
    if (!options.lazy) {
      effect3();
    }
    return effect3;
  }
  function stop(effect3) {
    if (effect3.active) {
      cleanup(effect3);
      if (effect3.options.onStop) {
        effect3.options.onStop();
      }
      effect3.active = false;
    }
  }
  var uid = 0;
  function createReactiveEffect(fn, options) {
    const effect3 = function reactiveEffect() {
      if (!effect3.active) {
        return fn();
      }
      if (!effectStack.includes(effect3)) {
        cleanup(effect3);
        try {
          enableTracking();
          effectStack.push(effect3);
          activeEffect = effect3;
          return fn();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };
    effect3.id = uid++;
    effect3.allowRecurse = !!options.allowRecurse;
    effect3._isEffect = true;
    effect3.active = true;
    effect3.raw = fn;
    effect3.deps = [];
    effect3.options = options;
    return effect3;
  }
  function cleanup(effect3) {
    const {deps} = effect3;
    if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect3);
      }
      deps.length = 0;
    }
  }
  var shouldTrack = true;
  var trackStack = [];
  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === void 0 ? true : last;
  }
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === void 0) {
      return;
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Set());
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target,
          type,
          key
        });
      }
    }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
      return;
    }
    const effects = new Set();
    const add2 = (effectsToAdd) => {
      if (effectsToAdd) {
        effectsToAdd.forEach((effect3) => {
          if (effect3 !== activeEffect || effect3.allowRecurse) {
            effects.add(effect3);
          }
        });
      }
    };
    if (type === "clear") {
      depsMap.forEach(add2);
    } else if (key === "length" && isArray(target)) {
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 >= newValue) {
          add2(dep);
        }
      });
    } else {
      if (key !== void 0) {
        add2(depsMap.get(key));
      }
      switch (type) {
        case "add":
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            add2(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!isArray(target)) {
            add2(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              add2(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            add2(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
    const run = (effect3) => {
      if (effect3.options.onTrigger) {
        effect3.options.onTrigger({
          effect: effect3,
          target,
          key,
          type,
          newValue,
          oldValue,
          oldTarget
        });
      }
      if (effect3.options.scheduler) {
        effect3.options.scheduler(effect3);
      } else {
        effect3();
      }
    };
    effects.forEach(run);
  }
  var isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
  var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter(isSymbol));
  var get2 = /* @__PURE__ */ createGetter();
  var shallowGet = /* @__PURE__ */ createGetter(false, true);
  var readonlyGet = /* @__PURE__ */ createGetter(true);
  var shallowReadonlyGet = /* @__PURE__ */ createGetter(true, true);
  var arrayInstrumentations = {};
  ["includes", "indexOf", "lastIndexOf"].forEach((key) => {
    const method = Array.prototype[key];
    arrayInstrumentations[key] = function(...args) {
      const arr = toRaw(this);
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, "get", i + "");
      }
      const res = method.apply(arr, args);
      if (res === -1 || res === false) {
        return method.apply(arr, args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ["push", "pop", "shift", "unshift", "splice"].forEach((key) => {
    const method = Array.prototype[key];
    arrayInstrumentations[key] = function(...args) {
      pauseTracking();
      const res = method.apply(this, args);
      resetTracking();
      return res;
    };
  });
  function createGetter(isReadonly = false, shallow = false) {
    return function get3(target, key, receiver) {
      if (key === "__v_isReactive") {
        return !isReadonly;
      } else if (key === "__v_isReadonly") {
        return isReadonly;
      } else if (key === "__v_raw" && receiver === (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
        return target;
      }
      const targetIsArray = isArray(target);
      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }
      const res = Reflect.get(target, key, receiver);
      if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
        return res;
      }
      if (!isReadonly) {
        track(target, "get", key);
      }
      if (shallow) {
        return res;
      }
      if (isRef(res)) {
        const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }
      if (isObject(res)) {
        return isReadonly ? readonly(res) : reactive2(res);
      }
      return res;
    };
  }
  var set2 = /* @__PURE__ */ createSetter();
  var shallowSet = /* @__PURE__ */ createSetter(true);
  function createSetter(shallow = false) {
    return function set3(target, key, value, receiver) {
      let oldValue = target[key];
      if (!shallow) {
        value = toRaw(value);
        oldValue = toRaw(oldValue);
        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }
      const hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      const result = Reflect.set(target, key, value, receiver);
      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value, oldValue);
        }
      }
      return result;
    };
  }
  function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  function ownKeys(target) {
    track(target, "iterate", isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }
  var mutableHandlers = {
    get: get2,
    set: set2,
    deleteProperty,
    has,
    ownKeys
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
      {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    },
    deleteProperty(target, key) {
      {
        console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
      }
      return true;
    }
  };
  extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
  });
  extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
  });
  var toReactive = (value) => isObject(value) ? reactive2(value) : value;
  var toReadonly = (value) => isObject(value) ? readonly(value) : value;
  var toShallow = (value) => value;
  var getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
    target = target["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "get", key);
    }
    !isReadonly && track(rawTarget, "get", rawKey);
    const {has: has2} = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has2.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has2.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    } else if (target !== rawTarget) {
      target.get(key);
    }
  }
  function has$1(key, isReadonly = false) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "has", key);
    }
    !isReadonly && track(rawTarget, "has", rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
    target = target["__v_raw"];
    !isReadonly && track(toRaw(target), "iterate", ITERATE_KEY);
    return Reflect.get(target, "size", target);
  }
  function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
      target.add(value);
      trigger(target, "add", value, value);
    }
    return this;
  }
  function set$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const {has: has2, get: get3} = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3.call(target, key);
    target.set(key, value);
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }
    return this;
  }
  function deleteEntry(key) {
    const target = toRaw(this);
    const {has: has2, get: get3} = getProto(target);
    let hadKey = has2.call(target, key);
    if (!hadKey) {
      key = toRaw(key);
      hadKey = has2.call(target, key);
    } else {
      checkIdentityKeys(target, has2, key);
    }
    const oldValue = get3 ? get3.call(target, key) : void 0;
    const result = target.delete(key);
    if (hadKey) {
      trigger(target, "delete", key, void 0, oldValue);
    }
    return result;
  }
  function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = isMap(target) ? new Map(target) : new Set(target) ;
    const result = target.clear();
    if (hadItems) {
      trigger(target, "clear", void 0, void 0, oldTarget);
    }
    return result;
  }
  function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
    return function(...args) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const targetIsMap = isMap(rawTarget);
      const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
      const isKeyOnly = method === "keys" && targetIsMap;
      const innerIterator = target[method](...args);
      const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
      !isReadonly && track(rawTarget, "iterate", isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
      return {
        next() {
          const {value, done} = innerIterator.next();
          return done ? {value, done} : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    };
  }
  function createReadonlyMethod(type) {
    return function(...args) {
      {
        const key = args[0] ? `on key "${args[0]}" ` : ``;
        console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
      }
      return type === "delete" ? false : this;
    };
  }
  var mutableInstrumentations = {
    get(key) {
      return get$1(this, key);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, false)
  };
  var shallowInstrumentations = {
    get(key) {
      return get$1(this, key, false, true);
    },
    get size() {
      return size(this);
    },
    has: has$1,
    add,
    set: set$1,
    delete: deleteEntry,
    clear,
    forEach: createForEach(false, true)
  };
  var readonlyInstrumentations = {
    get(key) {
      return get$1(this, key, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, false)
  };
  var shallowReadonlyInstrumentations = {
    get(key) {
      return get$1(this, key, true, true);
    },
    get size() {
      return size(this, true);
    },
    has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"),
    set: createReadonlyMethod("set"),
    delete: createReadonlyMethod("delete"),
    clear: createReadonlyMethod("clear"),
    forEach: createForEach(true, true)
  };
  var iteratorMethods = ["keys", "values", "entries", Symbol.iterator];
  iteratorMethods.forEach((method) => {
    mutableInstrumentations[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations[method] = createIterableMethod(method, true, false);
    shallowInstrumentations[method] = createIterableMethod(method, false, true);
    shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
  });
  function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow ? isReadonly ? shallowReadonlyInstrumentations : shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
    return (target, key, receiver) => {
      if (key === "__v_isReactive") {
        return !isReadonly;
      } else if (key === "__v_isReadonly") {
        return isReadonly;
      } else if (key === "__v_raw") {
        return target;
      }
      return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }
  var mutableCollectionHandlers = {
    get: createInstrumentationGetter(false, false)
  };
  var readonlyCollectionHandlers = {
    get: createInstrumentationGetter(true, false)
  };
  function checkIdentityKeys(target, has2, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has2.call(target, rawKey)) {
      const type = toRawType(target);
      console.warn(`Reactive ${type} contains both the raw and reactive versions of the same object${type === `Map` ? ` as keys` : ``}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`);
    }
  }
  var reactiveMap = new WeakMap();
  var shallowReactiveMap = new WeakMap();
  var readonlyMap = new WeakMap();
  var shallowReadonlyMap = new WeakMap();
  function targetTypeMap(rawType) {
    switch (rawType) {
      case "Object":
      case "Array":
        return 1;
      case "Map":
      case "Set":
      case "WeakMap":
      case "WeakSet":
        return 2;
      default:
        return 0;
    }
  }
  function getTargetType(value) {
    return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
  }
  function reactive2(target) {
    if (target && target["__v_isReadonly"]) {
      return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
  }
  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
  }
  function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
      {
        console.warn(`value cannot be made reactive: ${String(target)}`);
      }
      return target;
    }
    if (target["__v_raw"] && !(isReadonly && target["__v_isReactive"])) {
      return target;
    }
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
      return existingProxy;
    }
    const targetType = getTargetType(target);
    if (targetType === 0) {
      return target;
    }
    const proxy = new Proxy(target, targetType === 2 ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }
  function toRaw(observed) {
    return observed && toRaw(observed["__v_raw"]) || observed;
  }
  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }

  // packages/alpinejs/src/magics/$nextTick.js
  magic("nextTick", () => nextTick);

  // packages/alpinejs/src/magics/$dispatch.js
  magic("dispatch", (el) => dispatch.bind(dispatch, el));

  // packages/alpinejs/src/magics/$watch.js
  magic("watch", (el, {evaluateLater: evaluateLater2, effect: effect3}) => (key, callback) => {
    let evaluate2 = evaluateLater2(key);
    let firstTime = true;
    let oldValue;
    let effectReference = effect3(() => evaluate2((value) => {
      JSON.stringify(value);
      if (!firstTime) {
        queueMicrotask(() => {
          callback(value, oldValue);
          oldValue = value;
        });
      } else {
        oldValue = value;
      }
      firstTime = false;
    }));
    el._x_effects.delete(effectReference);
  });

  // packages/alpinejs/src/magics/$store.js
  magic("store", getStores);

  // packages/alpinejs/src/magics/$data.js
  magic("data", (el) => scope(el));

  // packages/alpinejs/src/magics/$root.js
  magic("root", (el) => closestRoot(el));

  // packages/alpinejs/src/magics/$refs.js
  magic("refs", (el) => {
    if (el._x_refs_proxy)
      return el._x_refs_proxy;
    el._x_refs_proxy = mergeProxies(getArrayOfRefObject(el));
    return el._x_refs_proxy;
  });
  function getArrayOfRefObject(el) {
    let refObjects = [];
    let currentEl = el;
    while (currentEl) {
      if (currentEl._x_refs)
        refObjects.push(currentEl._x_refs);
      currentEl = currentEl.parentNode;
    }
    return refObjects;
  }

  // packages/alpinejs/src/ids.js
  var globalIdMemo = {};
  function findAndIncrementId(name) {
    if (!globalIdMemo[name])
      globalIdMemo[name] = 0;
    return ++globalIdMemo[name];
  }
  function closestIdRoot(el, name) {
    return findClosest(el, (element) => {
      if (element._x_ids && element._x_ids[name])
        return true;
    });
  }
  function setIdRoot(el, name) {
    if (!el._x_ids)
      el._x_ids = {};
    if (!el._x_ids[name])
      el._x_ids[name] = findAndIncrementId(name);
  }

  // packages/alpinejs/src/magics/$id.js
  magic("id", (el) => (name, key = null) => {
    let root = closestIdRoot(el, name);
    let id = root ? root._x_ids[name] : findAndIncrementId(name);
    return key ? `${name}-${id}-${key}` : `${name}-${id}`;
  });

  // packages/alpinejs/src/magics/$el.js
  magic("el", (el) => el);

  // packages/alpinejs/src/magics/index.js
  warnMissingPluginMagic("Focus", "focus", "focus");
  warnMissingPluginMagic("Persist", "persist", "persist");
  function warnMissingPluginMagic(name, magicName, slug) {
    magic(magicName, (el) => warn(`You can't use [$${directiveName}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
  }

  // packages/alpinejs/src/directives/x-modelable.js
  directive("modelable", (el, {expression}, {effect: effect3, evaluateLater: evaluateLater2}) => {
    let func = evaluateLater2(expression);
    let innerGet = () => {
      let result;
      func((i) => result = i);
      return result;
    };
    let evaluateInnerSet = evaluateLater2(`${expression} = __placeholder`);
    let innerSet = (val) => evaluateInnerSet(() => {
    }, {scope: {__placeholder: val}});
    let initialValue = innerGet();
    innerSet(initialValue);
    queueMicrotask(() => {
      if (!el._x_model)
        return;
      el._x_removeModelListeners["default"]();
      let outerGet = el._x_model.get;
      let outerSet = el._x_model.set;
      effect3(() => innerSet(outerGet()));
      effect3(() => outerSet(innerGet()));
    });
  });

  // packages/alpinejs/src/directives/x-teleport.js
  directive("teleport", (el, {expression}, {cleanup: cleanup2}) => {
    if (el.tagName.toLowerCase() !== "template")
      warn("x-teleport can only be used on a <template> tag", el);
    let target = document.querySelector(expression);
    if (!target)
      warn(`Cannot find x-teleport element for selector: "${expression}"`);
    let clone2 = el.content.cloneNode(true).firstElementChild;
    el._x_teleport = clone2;
    clone2._x_teleportBack = el;
    if (el._x_forwardEvents) {
      el._x_forwardEvents.forEach((eventName) => {
        clone2.addEventListener(eventName, (e) => {
          e.stopPropagation();
          el.dispatchEvent(new e.constructor(e.type, e));
        });
      });
    }
    addScopeToNode(clone2, {}, el);
    mutateDom(() => {
      target.appendChild(clone2);
      initTree(clone2);
      clone2._x_ignore = true;
    });
    cleanup2(() => clone2.remove());
  });

  // packages/alpinejs/src/directives/x-ignore.js
  var handler = () => {
  };
  handler.inline = (el, {modifiers}, {cleanup: cleanup2}) => {
    modifiers.includes("self") ? el._x_ignoreSelf = true : el._x_ignore = true;
    cleanup2(() => {
      modifiers.includes("self") ? delete el._x_ignoreSelf : delete el._x_ignore;
    });
  };
  directive("ignore", handler);

  // packages/alpinejs/src/directives/x-effect.js
  directive("effect", (el, {expression}, {effect: effect3}) => effect3(evaluateLater(el, expression)));

  // packages/alpinejs/src/utils/on.js
  function on(el, event, modifiers, callback) {
    let listenerTarget = el;
    let handler3 = (e) => callback(e);
    let options = {};
    let wrapHandler = (callback2, wrapper) => (e) => wrapper(callback2, e);
    if (modifiers.includes("dot"))
      event = dotSyntax(event);
    if (modifiers.includes("camel"))
      event = camelCase2(event);
    if (modifiers.includes("passive"))
      options.passive = true;
    if (modifiers.includes("capture"))
      options.capture = true;
    if (modifiers.includes("window"))
      listenerTarget = window;
    if (modifiers.includes("document"))
      listenerTarget = document;
    if (modifiers.includes("prevent"))
      handler3 = wrapHandler(handler3, (next, e) => {
        e.preventDefault();
        next(e);
      });
    if (modifiers.includes("stop"))
      handler3 = wrapHandler(handler3, (next, e) => {
        e.stopPropagation();
        next(e);
      });
    if (modifiers.includes("self"))
      handler3 = wrapHandler(handler3, (next, e) => {
        e.target === el && next(e);
      });
    if (modifiers.includes("away") || modifiers.includes("outside")) {
      listenerTarget = document;
      handler3 = wrapHandler(handler3, (next, e) => {
        if (el.contains(e.target))
          return;
        if (e.target.isConnected === false)
          return;
        if (el.offsetWidth < 1 && el.offsetHeight < 1)
          return;
        if (el._x_isShown === false)
          return;
        next(e);
      });
    }
    if (modifiers.includes("once")) {
      handler3 = wrapHandler(handler3, (next, e) => {
        next(e);
        listenerTarget.removeEventListener(event, handler3, options);
      });
    }
    handler3 = wrapHandler(handler3, (next, e) => {
      if (isKeyEvent(event)) {
        if (isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers)) {
          return;
        }
      }
      next(e);
    });
    if (modifiers.includes("debounce")) {
      let nextModifier = modifiers[modifiers.indexOf("debounce") + 1] || "invalid-wait";
      let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
      handler3 = debounce(handler3, wait);
    }
    if (modifiers.includes("throttle")) {
      let nextModifier = modifiers[modifiers.indexOf("throttle") + 1] || "invalid-wait";
      let wait = isNumeric(nextModifier.split("ms")[0]) ? Number(nextModifier.split("ms")[0]) : 250;
      handler3 = throttle(handler3, wait);
    }
    listenerTarget.addEventListener(event, handler3, options);
    return () => {
      listenerTarget.removeEventListener(event, handler3, options);
    };
  }
  function dotSyntax(subject) {
    return subject.replace(/-/g, ".");
  }
  function camelCase2(subject) {
    return subject.toLowerCase().replace(/-(\w)/g, (match, char) => char.toUpperCase());
  }
  function isNumeric(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }
  function kebabCase2(subject) {
    return subject.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]/, "-").toLowerCase();
  }
  function isKeyEvent(event) {
    return ["keydown", "keyup"].includes(event);
  }
  function isListeningForASpecificKeyThatHasntBeenPressed(e, modifiers) {
    let keyModifiers = modifiers.filter((i) => {
      return !["window", "document", "prevent", "stop", "once"].includes(i);
    });
    if (keyModifiers.includes("debounce")) {
      let debounceIndex = keyModifiers.indexOf("debounce");
      keyModifiers.splice(debounceIndex, isNumeric((keyModifiers[debounceIndex + 1] || "invalid-wait").split("ms")[0]) ? 2 : 1);
    }
    if (keyModifiers.length === 0)
      return false;
    if (keyModifiers.length === 1 && keyToModifiers(e.key).includes(keyModifiers[0]))
      return false;
    const systemKeyModifiers = ["ctrl", "shift", "alt", "meta", "cmd", "super"];
    const selectedSystemKeyModifiers = systemKeyModifiers.filter((modifier) => keyModifiers.includes(modifier));
    keyModifiers = keyModifiers.filter((i) => !selectedSystemKeyModifiers.includes(i));
    if (selectedSystemKeyModifiers.length > 0) {
      const activelyPressedKeyModifiers = selectedSystemKeyModifiers.filter((modifier) => {
        if (modifier === "cmd" || modifier === "super")
          modifier = "meta";
        return e[`${modifier}Key`];
      });
      if (activelyPressedKeyModifiers.length === selectedSystemKeyModifiers.length) {
        if (keyToModifiers(e.key).includes(keyModifiers[0]))
          return false;
      }
    }
    return true;
  }
  function keyToModifiers(key) {
    if (!key)
      return [];
    key = kebabCase2(key);
    let modifierToKeyMap = {
      ctrl: "control",
      slash: "/",
      space: "-",
      spacebar: "-",
      cmd: "meta",
      esc: "escape",
      up: "arrow-up",
      down: "arrow-down",
      left: "arrow-left",
      right: "arrow-right",
      period: ".",
      equal: "="
    };
    modifierToKeyMap[key] = key;
    return Object.keys(modifierToKeyMap).map((modifier) => {
      if (modifierToKeyMap[modifier] === key)
        return modifier;
    }).filter((modifier) => modifier);
  }

  // packages/alpinejs/src/directives/x-model.js
  directive("model", (el, {modifiers, expression}, {effect: effect3, cleanup: cleanup2}) => {
    let evaluate2 = evaluateLater(el, expression);
    let assignmentExpression = `${expression} = rightSideOfExpression($event, ${expression})`;
    let evaluateAssignment = evaluateLater(el, assignmentExpression);
    var event = el.tagName.toLowerCase() === "select" || ["checkbox", "radio"].includes(el.type) || modifiers.includes("lazy") ? "change" : "input";
    let assigmentFunction = generateAssignmentFunction(el, modifiers, expression);
    let removeListener = on(el, event, modifiers, (e) => {
      evaluateAssignment(() => {
      }, {scope: {
        $event: e,
        rightSideOfExpression: assigmentFunction
      }});
    });
    if (!el._x_removeModelListeners)
      el._x_removeModelListeners = {};
    el._x_removeModelListeners["default"] = removeListener;
    cleanup2(() => el._x_removeModelListeners["default"]());
    let evaluateSetModel = evaluateLater(el, `${expression} = __placeholder`);
    el._x_model = {
      get() {
        let result;
        evaluate2((value) => result = value);
        return result;
      },
      set(value) {
        evaluateSetModel(() => {
        }, {scope: {__placeholder: value}});
      }
    };
    el._x_forceModelUpdate = () => {
      evaluate2((value) => {
        if (value === void 0 && expression.match(/\./))
          value = "";
        window.fromModel = true;
        mutateDom(() => bind(el, "value", value));
        delete window.fromModel;
      });
    };
    effect3(() => {
      if (modifiers.includes("unintrusive") && document.activeElement.isSameNode(el))
        return;
      el._x_forceModelUpdate();
    });
  });
  function generateAssignmentFunction(el, modifiers, expression) {
    if (el.type === "radio") {
      mutateDom(() => {
        if (!el.hasAttribute("name"))
          el.setAttribute("name", expression);
      });
    }
    return (event, currentValue) => {
      return mutateDom(() => {
        if (event instanceof CustomEvent && event.detail !== void 0) {
          return event.detail || event.target.value;
        } else if (el.type === "checkbox") {
          if (Array.isArray(currentValue)) {
            let newValue = modifiers.includes("number") ? safeParseNumber(event.target.value) : event.target.value;
            return event.target.checked ? currentValue.concat([newValue]) : currentValue.filter((el2) => !checkedAttrLooseCompare2(el2, newValue));
          } else {
            return event.target.checked;
          }
        } else if (el.tagName.toLowerCase() === "select" && el.multiple) {
          return modifiers.includes("number") ? Array.from(event.target.selectedOptions).map((option) => {
            let rawValue = option.value || option.text;
            return safeParseNumber(rawValue);
          }) : Array.from(event.target.selectedOptions).map((option) => {
            return option.value || option.text;
          });
        } else {
          let rawValue = event.target.value;
          return modifiers.includes("number") ? safeParseNumber(rawValue) : modifiers.includes("trim") ? rawValue.trim() : rawValue;
        }
      });
    };
  }
  function safeParseNumber(rawValue) {
    let number = rawValue ? parseFloat(rawValue) : null;
    return isNumeric2(number) ? number : rawValue;
  }
  function checkedAttrLooseCompare2(valueA, valueB) {
    return valueA == valueB;
  }
  function isNumeric2(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }

  // packages/alpinejs/src/directives/x-cloak.js
  directive("cloak", (el) => queueMicrotask(() => mutateDom(() => el.removeAttribute(prefix("cloak")))));

  // packages/alpinejs/src/directives/x-init.js
  addInitSelector(() => `[${prefix("init")}]`);
  directive("init", skipDuringClone((el, {expression}, {evaluate: evaluate2}) => {
    if (typeof expression === "string") {
      return !!expression.trim() && evaluate2(expression, {}, false);
    }
    return evaluate2(expression, {}, false);
  }));

  // packages/alpinejs/src/directives/x-text.js
  directive("text", (el, {expression}, {effect: effect3, evaluateLater: evaluateLater2}) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.textContent = value;
        });
      });
    });
  });

  // packages/alpinejs/src/directives/x-html.js
  directive("html", (el, {expression}, {effect: effect3, evaluateLater: evaluateLater2}) => {
    let evaluate2 = evaluateLater2(expression);
    effect3(() => {
      evaluate2((value) => {
        mutateDom(() => {
          el.innerHTML = value;
          el._x_ignoreSelf = true;
          initTree(el);
          delete el._x_ignoreSelf;
        });
      });
    });
  });

  // packages/alpinejs/src/directives/x-bind.js
  mapAttributes(startingWith(":", into(prefix("bind:"))));
  directive("bind", (el, {value, modifiers, expression, original}, {effect: effect3}) => {
    if (!value) {
      let bindingProviders = {};
      injectBindingProviders(bindingProviders);
      let getBindings = evaluateLater(el, expression);
      getBindings((bindings) => {
        applyBindingsObject(el, bindings, original);
      }, {scope: bindingProviders});
      return;
    }
    if (value === "key")
      return storeKeyForXFor(el, expression);
    let evaluate2 = evaluateLater(el, expression);
    effect3(() => evaluate2((result) => {
      if (result === void 0 && expression.match(/\./))
        result = "";
      mutateDom(() => bind(el, value, result, modifiers));
    }));
  });
  function storeKeyForXFor(el, expression) {
    el._x_keyExpression = expression;
  }

  // packages/alpinejs/src/directives/x-data.js
  addRootSelector(() => `[${prefix("data")}]`);
  directive("data", skipDuringClone((el, {expression}, {cleanup: cleanup2}) => {
    expression = expression === "" ? "{}" : expression;
    let magicContext = {};
    injectMagics(magicContext, el);
    let dataProviderContext = {};
    injectDataProviders(dataProviderContext, magicContext);
    let data2 = evaluate(el, expression, {scope: dataProviderContext});
    if (data2 === void 0)
      data2 = {};
    injectMagics(data2, el);
    let reactiveData = reactive(data2);
    initInterceptors(reactiveData);
    let undo = addScopeToNode(el, reactiveData);
    reactiveData["init"] && evaluate(el, reactiveData["init"]);
    cleanup2(() => {
      reactiveData["destroy"] && evaluate(el, reactiveData["destroy"]);
      undo();
    });
  }));

  // packages/alpinejs/src/directives/x-show.js
  directive("show", (el, {modifiers, expression}, {effect: effect3}) => {
    let evaluate2 = evaluateLater(el, expression);
    if (!el._x_doHide)
      el._x_doHide = () => {
        mutateDom(() => {
          el.style.setProperty("display", "none", modifiers.includes("important") ? "important" : void 0);
        });
      };
    if (!el._x_doShow)
      el._x_doShow = () => {
        mutateDom(() => {
          if (el.style.length === 1 && el.style.display === "none") {
            el.removeAttribute("style");
          } else {
            el.style.removeProperty("display");
          }
        });
      };
    let hide = () => {
      el._x_doHide();
      el._x_isShown = false;
    };
    let show = () => {
      el._x_doShow();
      el._x_isShown = true;
    };
    let clickAwayCompatibleShow = () => setTimeout(show);
    let toggle = once((value) => value ? show() : hide(), (value) => {
      if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
        el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
      } else {
        value ? clickAwayCompatibleShow() : hide();
      }
    });
    let oldValue;
    let firstTime = true;
    effect3(() => evaluate2((value) => {
      if (!firstTime && value === oldValue)
        return;
      if (modifiers.includes("immediate"))
        value ? clickAwayCompatibleShow() : hide();
      toggle(value);
      oldValue = value;
      firstTime = false;
    }));
  });

  // packages/alpinejs/src/directives/x-for.js
  directive("for", (el, {expression}, {effect: effect3, cleanup: cleanup2}) => {
    let iteratorNames = parseForExpression(expression);
    let evaluateItems = evaluateLater(el, iteratorNames.items);
    let evaluateKey = evaluateLater(el, el._x_keyExpression || "index");
    el._x_prevKeys = [];
    el._x_lookup = {};
    effect3(() => loop(el, iteratorNames, evaluateItems, evaluateKey));
    cleanup2(() => {
      Object.values(el._x_lookup).forEach((el2) => el2.remove());
      delete el._x_prevKeys;
      delete el._x_lookup;
    });
  });
  function loop(el, iteratorNames, evaluateItems, evaluateKey) {
    let isObject2 = (i) => typeof i === "object" && !Array.isArray(i);
    let templateEl = el;
    evaluateItems((items) => {
      if (isNumeric3(items) && items >= 0) {
        items = Array.from(Array(items).keys(), (i) => i + 1);
      }
      if (items === void 0)
        items = [];
      let lookup = el._x_lookup;
      let prevKeys = el._x_prevKeys;
      let scopes = [];
      let keys = [];
      if (isObject2(items)) {
        items = Object.entries(items).map(([key, value]) => {
          let scope2 = getIterationScopeVariables(iteratorNames, value, key, items);
          evaluateKey((value2) => keys.push(value2), {scope: {index: key, ...scope2}});
          scopes.push(scope2);
        });
      } else {
        for (let i = 0; i < items.length; i++) {
          let scope2 = getIterationScopeVariables(iteratorNames, items[i], i, items);
          evaluateKey((value) => keys.push(value), {scope: {index: i, ...scope2}});
          scopes.push(scope2);
        }
      }
      let adds = [];
      let moves = [];
      let removes = [];
      let sames = [];
      for (let i = 0; i < prevKeys.length; i++) {
        let key = prevKeys[i];
        if (keys.indexOf(key) === -1)
          removes.push(key);
      }
      prevKeys = prevKeys.filter((key) => !removes.includes(key));
      let lastKey = "template";
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        let prevIndex = prevKeys.indexOf(key);
        if (prevIndex === -1) {
          prevKeys.splice(i, 0, key);
          adds.push([lastKey, i]);
        } else if (prevIndex !== i) {
          let keyInSpot = prevKeys.splice(i, 1)[0];
          let keyForSpot = prevKeys.splice(prevIndex - 1, 1)[0];
          prevKeys.splice(i, 0, keyForSpot);
          prevKeys.splice(prevIndex, 0, keyInSpot);
          moves.push([keyInSpot, keyForSpot]);
        } else {
          sames.push(key);
        }
        lastKey = key;
      }
      for (let i = 0; i < removes.length; i++) {
        let key = removes[i];
        if (!!lookup[key]._x_effects) {
          lookup[key]._x_effects.forEach(dequeueJob);
        }
        lookup[key].remove();
        lookup[key] = null;
        delete lookup[key];
      }
      for (let i = 0; i < moves.length; i++) {
        let [keyInSpot, keyForSpot] = moves[i];
        let elInSpot = lookup[keyInSpot];
        let elForSpot = lookup[keyForSpot];
        let marker = document.createElement("div");
        mutateDom(() => {
          elForSpot.after(marker);
          elInSpot.after(elForSpot);
          elForSpot._x_currentIfEl && elForSpot.after(elForSpot._x_currentIfEl);
          marker.before(elInSpot);
          elInSpot._x_currentIfEl && elInSpot.after(elInSpot._x_currentIfEl);
          marker.remove();
        });
        refreshScope(elForSpot, scopes[keys.indexOf(keyForSpot)]);
      }
      for (let i = 0; i < adds.length; i++) {
        let [lastKey2, index] = adds[i];
        let lastEl = lastKey2 === "template" ? templateEl : lookup[lastKey2];
        if (lastEl._x_currentIfEl)
          lastEl = lastEl._x_currentIfEl;
        let scope2 = scopes[index];
        let key = keys[index];
        let clone2 = document.importNode(templateEl.content, true).firstElementChild;
        addScopeToNode(clone2, reactive(scope2), templateEl);
        mutateDom(() => {
          lastEl.after(clone2);
          initTree(clone2);
        });
        if (typeof key === "object") {
          warn("x-for key cannot be an object, it must be a string or an integer", templateEl);
        }
        lookup[key] = clone2;
      }
      for (let i = 0; i < sames.length; i++) {
        refreshScope(lookup[sames[i]], scopes[keys.indexOf(sames[i])]);
      }
      templateEl._x_prevKeys = keys;
    });
  }
  function parseForExpression(expression) {
    let forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
    let stripParensRE = /^\s*\(|\)\s*$/g;
    let forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
    let inMatch = expression.match(forAliasRE);
    if (!inMatch)
      return;
    let res = {};
    res.items = inMatch[2].trim();
    let item = inMatch[1].replace(stripParensRE, "").trim();
    let iteratorMatch = item.match(forIteratorRE);
    if (iteratorMatch) {
      res.item = item.replace(forIteratorRE, "").trim();
      res.index = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.collection = iteratorMatch[2].trim();
      }
    } else {
      res.item = item;
    }
    return res;
  }
  function getIterationScopeVariables(iteratorNames, item, index, items) {
    let scopeVariables = {};
    if (/^\[.*\]$/.test(iteratorNames.item) && Array.isArray(item)) {
      let names = iteratorNames.item.replace("[", "").replace("]", "").split(",").map((i) => i.trim());
      names.forEach((name, i) => {
        scopeVariables[name] = item[i];
      });
    } else if (/^\{.*\}$/.test(iteratorNames.item) && !Array.isArray(item) && typeof item === "object") {
      let names = iteratorNames.item.replace("{", "").replace("}", "").split(",").map((i) => i.trim());
      names.forEach((name) => {
        scopeVariables[name] = item[name];
      });
    } else {
      scopeVariables[iteratorNames.item] = item;
    }
    if (iteratorNames.index)
      scopeVariables[iteratorNames.index] = index;
    if (iteratorNames.collection)
      scopeVariables[iteratorNames.collection] = items;
    return scopeVariables;
  }
  function isNumeric3(subject) {
    return !Array.isArray(subject) && !isNaN(subject);
  }

  // packages/alpinejs/src/directives/x-ref.js
  function handler2() {
  }
  handler2.inline = (el, {expression}, {cleanup: cleanup2}) => {
    let root = closestRoot(el);
    if (!root._x_refs)
      root._x_refs = {};
    root._x_refs[expression] = el;
    cleanup2(() => delete root._x_refs[expression]);
  };
  directive("ref", handler2);

  // packages/alpinejs/src/directives/x-if.js
  directive("if", (el, {expression}, {effect: effect3, cleanup: cleanup2}) => {
    let evaluate2 = evaluateLater(el, expression);
    let show = () => {
      if (el._x_currentIfEl)
        return el._x_currentIfEl;
      let clone2 = el.content.cloneNode(true).firstElementChild;
      addScopeToNode(clone2, {}, el);
      mutateDom(() => {
        el.after(clone2);
        initTree(clone2);
      });
      el._x_currentIfEl = clone2;
      el._x_undoIf = () => {
        walk(clone2, (node) => {
          if (!!node._x_effects) {
            node._x_effects.forEach(dequeueJob);
          }
        });
        clone2.remove();
        delete el._x_currentIfEl;
      };
      return clone2;
    };
    let hide = () => {
      if (!el._x_undoIf)
        return;
      el._x_undoIf();
      delete el._x_undoIf;
    };
    effect3(() => evaluate2((value) => {
      value ? show() : hide();
    }));
    cleanup2(() => el._x_undoIf && el._x_undoIf());
  });

  // packages/alpinejs/src/directives/x-id.js
  directive("id", (el, {expression}, {evaluate: evaluate2}) => {
    let names = evaluate2(expression);
    names.forEach((name) => setIdRoot(el, name));
  });

  // packages/alpinejs/src/directives/x-on.js
  mapAttributes(startingWith("@", into(prefix("on:"))));
  directive("on", skipDuringClone((el, {value, modifiers, expression}, {cleanup: cleanup2}) => {
    let evaluate2 = expression ? evaluateLater(el, expression) : () => {
    };
    if (el.tagName.toLowerCase() === "template") {
      if (!el._x_forwardEvents)
        el._x_forwardEvents = [];
      if (!el._x_forwardEvents.includes(value))
        el._x_forwardEvents.push(value);
    }
    let removeListener = on(el, value, modifiers, (e) => {
      evaluate2(() => {
      }, {scope: {$event: e}, params: [e]});
    });
    cleanup2(() => removeListener());
  }));

  // packages/alpinejs/src/directives/index.js
  warnMissingPluginDirective("Collapse", "collapse", "collapse");
  warnMissingPluginDirective("Intersect", "intersect", "intersect");
  warnMissingPluginDirective("Focus", "trap", "focus");
  warnMissingPluginDirective("Mask", "mask", "mask");
  function warnMissingPluginDirective(name, directiveName2, slug) {
    directive(directiveName2, (el) => warn(`You can't use [x-${directiveName2}] without first installing the "${name}" plugin here: https://alpinejs.dev/plugins/${slug}`, el));
  }

  // packages/alpinejs/src/index.js
  alpine_default.setEvaluator(normalEvaluator);
  alpine_default.setReactivityEngine({reactive: reactive2, effect: effect2, release: stop, raw: toRaw});
  var src_default = alpine_default;

  // packages/alpinejs/builds/module.js
  var module_default = src_default;

  function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


  (function () {
  	if (window.CustomEvent) return false;
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
  	//@ts-ignore
  	window["CustomEvent"] = CustomEvent;
  })();

  class Theme {
  	
  	
  	
  	
  	
  	
  	
  	
  	
  	constructor(options = {}) {Theme.prototype.__init.call(this);Theme.prototype.__init2.call(this);Theme.prototype.__init3.call(this);Theme.prototype.__init4.call(this);Theme.prototype.__init5.call(this);Theme.prototype.__init6.call(this);Theme.prototype.__init7.call(this);Theme.prototype.__init8.call(this);
  		this.options = options;
  		this.controller = null;
  		this.scene = null;
  		this.sections = null;
  		this.Parallax = new Parallax();
  		this.team = new Team();

  		let header = document.querySelector("#masthead");
  		this.headerOffset = 0;
  		if (header && header.classList.contains("fixed") && header.classList.contains("top-0")) {
  			this.headerOffset = header.clientHeight;
  		}

  		let toggles = document.querySelectorAll("[data-toggle]");
  		if (toggles) {
  			[].forEach.call(toggles, (toggle) => {
  				let elm = document.querySelector(toggle.getAttribute("data-target"));
  				if (elm) {
  					let toggleClass = toggle.getAttribute("data-toggle") ? toggle.getAttribute("data-toggle") : "active";

  					if (toggle.getAttribute("data-toggle-close")) toggle.setAttribute("data-toggle-initial", toggle.innerHTML);
  					toggle.addEventListener("click", (e) => {
  						e.preventDefault();
  						if (elm.classList.contains(toggleClass)) {
  							elm.classList.remove(toggleClass);
  							toggle.setAttribute("aria-expanded", "true");
  							if (toggle.getAttribute("data-toggle-close")) toggle.innerHTML = toggle.getAttribute("data-toggle-initial");
  						} else {
  							elm.classList.add(toggleClass);
  							toggle.setAttribute("aria-expanded", "false");
  							if (toggle.getAttribute("data-toggle-close")) toggle.innerHTML = toggle.getAttribute("data-toggle-close");
  						}
  					});
  				}
  			});
  		}

  		window.Alpine = module_default;
  		module_default.start();
  		this.load();
  	}
  	load() {
  		this.innerScroll = document.querySelector("#inner-scroll");
  		let count = _optionalChain([this, 'access', _6 => _6.innerScroll, 'optionalAccess', _7 => _7.children, 'access', _8 => _8.length]);

  		if (this.options.scrolling && window.innerWidth > this.options.mobile) {
  			var widthPercent = 100 / count;
  			// console.log(this.options.scrolling);
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
  						var offset = 0.3; //offset in percentage
  						this.scene.on("progress", (event) => {
  							var v = event.progress * count + offset + 1;
  							if (v > count) {
  								v = count;
  							}
  							v = parseInt(v.toString(), 10);
  							if (v != _current) {
  								[].forEach.call(this.innerScroll.children, function (slide) {
  									slide.classList.remove("in");
  								});

  								_optionalChain([this, 'access', _9 => _9.innerScroll, 'access', _10 => _10.children, 'access', _11 => _11[v], 'optionalAccess', _12 => _12.classList, 'access', _13 => _13.add, 'call', _14 => _14("in")]);
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
  						// define movement of panels
  						let wipeAnimation = new TimelineMax();

  						let is_x = true;
  						let is_negative = true;
  						// create scene for every slide
  						[].forEach.call(this.innerScroll.children, (slide, i) => {
  							if (i == 0) {
  								wipeAnimation.fromTo(
  									slide,
  									1,
  									{
  										x: "0%",
  										y: 0,
  									},
  									{
  										x: "0%",
  										y: "0%",
  										ease: Linear.easeNone,
  									}
  								);
  								return;
  							}
  							var dir = {};
  							if (is_x) {
  								if (is_negative) {
  									dir["x"] = "-100%";
  								} else {
  									dir["x"] = "100%";
  								}
  								is_negative = !is_negative;
  							} else {
  								if (is_negative) {
  									dir["y"] = "-100%";
  								} else {
  									dir["y"] = "100%";
  								}
  								is_negative = !is_negative;
  							}
  							is_x = !is_x;
  							if (i % 2 == 0 && i != 0) {
  								is_x = !is_x;
  							}
  							this.innerScroll.children[i] &&
  								wipeAnimation.fromTo(this.innerScroll.children[i], 1, dir, {
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
  							sectionInner.appendChild(li);
  						});

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
  				if (this.scrollHandler()) {
  					event.stopPropagation();
  					event.preventDefault();
  					return;
  				}

  				if (window.location.hash == "#!search") {
  					document.body.classList.add("search-active");
  					return;
  				} else if (document.body.classList.contains("search-active")) {
  					document.body.classList.remove("search-active");
  				}

  				let hash = _optionalChain([window, 'access', _15 => _15.location, 'access', _16 => _16.hash, 'optionalAccess', _17 => _17.replace, 'call', _18 => _18("#!", ""), 'access', _19 => _19.replace, 'call', _20 => _20("#", "")]);
  				if (hash) {
  					let handler = hash.split("/");
  					if (handler.length > 1) {
  						return;
  					}
  					let section = document.querySelector(`#${hash}`);
  					if (section) {
  						this.scrollIfNeeded(section);
  						event.stopPropagation();
  						return;
  					}
  				}
  			});
  			try {
  				window.dispatchEvent(new Event("hashchange"));
  			} catch (e) {}
  		} else {
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
  			} else {
  				this.handler = this.desktopHandler;
  			}
  		});

  		window.addEventListener("scroll", () => {
  			// Get container scroll position
  			var positon = this.getScrollPosition(window);
  			var header = document.querySelector("#masthead");
  			var offset = 0;
  			if (header) {
  				offset = header.clientHeight;
  			}
  			var fromTop = positon.y + offset + 100;

  			// Get id of current scroll item
  			var cur = [].map.call(scrollItems, function (item) {
  				var bounds = item.getBoundingClientRect();
  				if (bounds.top < fromTop) return item;
  			});
  			// Get the id of the current element
  			cur = cur[cur.length - 1];
  			var id = cur ? cur.getAttribute("id") : "";

  			[].forEach.call(menuItems, function (menuItem) {
  				menuItem.classList.remove("active");
  			});

  			var section = document.querySelector('#navbar ul li a[section="' + id + '"]');
  			section && section.classList.add("active");

  			if (positon.y > 100) {
  				document.body.classList.add("scrolling");
  			} else {
  				document.body.classList.remove("scrolling");
  			}
  		});

  		//widgets
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
  		var elms = document.querySelectorAll(".wp-block-na-theme-blocks-accordion");
  		if (elms.length) {
  			[].forEach.call(elms, function (elm) {
  				elm.addEventListener("click", function (e) {
  					if (!e.target.classList.contains("block-title")) {
  						return;
  					}
  					e.preventDefault();
  					elm.classList.toggle("open");
  					return false;
  				});
  			});
  		}

  		let doneBefore = localStorage ? localStorage.getItem("shown") : false;
  		let expiry = 0;
  		try {
  			expiry = localStorage ? parseFloat(localStorage.getItem("expiry")) : new Date().getTime();
  		} catch (e) {
  			expiry = 0;
  		}

  		if (!doneBefore || expiry <= new Date().getTime()) {
  			let delayLoading = window.delayLoading ? window.delayLoading : 1000;
  			let endLoading = () => {
  				setTimeout(function () {
  					document.body.classList.remove("loading");
  					setTimeout(() => {
  						document.body.classList.add("loaded");
  						var loadingOverlay = document.querySelector(".loading-overlay");

  						if (loadingOverlay && loadingOverlay.parentNode) {
  							loadingOverlay.parentNode.removeChild(loadingOverlay);
  						}
  					}, 2000);
  				}, delayLoading);
  				var pos = window.scrollY;
  				if (pos > 100) {
  					document.body.classList.add("scrolling");
  				}
  			};
  			app &&
  				app.ready(() => {
  					endLoading();
  					endLoading = () => {};
  				});
  			window.addEventListener("load", endLoading);

  			if (localStorage) {
  				localStorage.setItem("shown", "1");
  				localStorage.setItem("expiry", (new Date().getTime() + 1000 * 60 * 60 * 24).toString());
  			}
  		} else {
  			document.body.classList.remove("loading");
  			document.body.classList.add("loaded");
  			var pos = window.scrollY;
  			if (pos > 100) {
  				document.body.classList.add("scrolling");
  			}
  		}
  		this.sectionObserver();
  		this.initCounters();

  		window["naTheme"] = this;

  		document.body.dispatchEvent(
  			new CustomEvent("theme-ready", {
  				bubbles: true,
  				detail: this,
  			})
  		);
  	}
  	__init() {this.mobileHandler = (section) => {
  		this.scrollIfNeeded(section);
  		return true;
  	};}
  	__init2() {this.desktopHandler = (section) => {
  		if (this.scene) {
  			var offset = this.scene.scrollOffset();
  			var index = section.getAttribute("data-index");
  			if (index) {
  				this.scrollTo(offset * (index + 1));
  			}
  			return true;
  		} else {
  			this.scrollIfNeeded(section);
  		}
  		return true;
  	};}

  	__init3() {this.scrollHandler = () => {
  		var hash = location.hash;
  		if (hash.replace("#!", "").trim() == "" || hash.replace("#", "").trim() == "" || hash.split("/").length > 1) {
  			return false;
  		}
  		var newHash = hash.replace("#!", "").replace("#", "");
  		if (newHash.indexOf("section-") >= 0) {
  			let elm = document.querySelector("#" + newHash);
  			if (elm) {
  				return this.handler(elm);
  			} else {
  				console.warn("#" + newHash + " was not found, did you forget to enable permalinks?");
  				return false;
  			}
  		} else {
  			let section = document.querySelector("#section-" + newHash);
  			if (section) {
  				return this.handler(section);
  			} else if (document.querySelector("#" + newHash)) {
  				return this.handler(document.querySelector("#" + newHash));
  			}
  		}
  		_optionalChain([document, 'access', _21 => _21.querySelector, 'call', _22 => _22(".content"), 'optionalAccess', _23 => _23.classList, 'access', _24 => _24.remove, 'call', _25 => _25("active")]);

  		let menu_items = document.querySelector("#menu-main-menu li a");
  		let menu_item = document.querySelector('#menu-main-menu li a[href^="' + this.escapeRegExp(hash) + '"]');
  		if (menu_item) {
  			[].forEach.call(menu_items, (item) => {
  				if (item != menu_item) item.classList.remove("active");
  			});
  			menu_item.classList.add("active");
  		} else {
  			var item = document.querySelector('a[href^="' + this.escapeRegExp(hash) + '"]');
  			if (item && item.hasAttribute("no-hash")) {
  				location.hash = "";
  			}
  		}

  		return null;
  	};}

  	__init4() {this.trigger = (element, eventName, detail = null) => {
  		let event = null;
  		if (detail) {
  			event = new CustomEvent(eventName, { detail });
  		} else {
  			event = new Event(eventName);
  		}
  		if (element instanceof NodeList) {
  			element.forEach((elm) => {
  				elm.dispatchEvent(event);
  			});
  		} else {
  			element.dispatchEvent(event);
  		}
  	};}
  	__init5() {this.countDecimals = function (val) {
  		if (Math.floor(val) === val) return 0;
  		return val.toString().split(".")[1].length || 0;
  	};}

  	__init6() {this.format = (num, separator) => String(num).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1" + separator);}

  	initCounters() {
  		document.body.addEventListener("section.in", (e) => {
  			let { section } = e.detail;
  			if (section) {
  				let cntrs = section.querySelectorAll(".counter");
  				if (!cntrs || cntrs.length == 0) {
  					return;
  				}
  				[].forEach.call(cntrs, (cntr) => {
  					if (cntr) {
  						let elm = cntr.querySelector(".block-title");
  						if (!elm) {
  							return;
  						}
  						let settings = eval("(" + cntr.getAttribute("data-settings") + ")");
  						let step = parseFloat(settings.step);
  						let initVal = parseFloat(settings.start);
  						let lastVal = parseFloat(settings.end);
  						let totalDecimals = this.countDecimals(step);
  						var formatOutput = (output) => {
  							if (settings.seperator && settings.seperator != "") {
  								output = this.format(output, settings.seperator);
  							}
  							return output;
  						};
  						var update = (progress) => {
  							let output = (progress * (lastVal - initVal) + step).toFixed(totalDecimals);
  							elm.innerHTML = settings.prefix + formatOutput(output) + settings.suffix;
  							if (progress >= 1) {
  								elm.innerHTML = settings.prefix + formatOutput(settings.end) + settings.suffix;
  							}
  						};

  						counter(parseFloat(settings.duration), update);
  					}
  				});
  			}
  		});
  		let counters = document.querySelectorAll(".counter .count");
  		if (counters.length) {
  			[].forEach.call(counters, (elm) => {
  				let number = elm.innerHTML.match(/\d+/);
  				let html = elm.innerHTML;
  				if (number && number.length) {
  					number.map((n) => {
  						html = html.replace(n, '<span data-count="' + n + '" class="inner-counter inner-counter-' + n + '">' + n + "</span>");
  					});
  					elm.innerHTML = html;
  				}
  			});
  		}
  	}

  	__init7() {this.getScrollPosition = (el) => ({
  		x: el.pageXOffset !== undefined ? el.pageXOffset : el.scrollLeft,
  		y: el.pageYOffset !== undefined ? el.pageYOffset : el.scrollTop,
  	});}

  	escapeRegExp(str) {
  		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  	}

  	__init8() {this.sectionObserver = () => {
  		if ("IntersectionObserver" in window) {
  			const observer = new IntersectionObserver(
  				(entries) => {
  					entries.forEach((entry) => { 
  						if (entry.intersectionRatio > 0) {
  							entry.target.classList.add("in-once");
  							entry.target.classList.add("in");
  							entry.target.classList.remove("out");
  							this.trigger(document.body, "section.in", { section: entry.target });
  							// observer.unobserve(entry.target);
  						} else {
  							entry.target.classList.add("out");
  							entry.target.classList.remove("in");
  							this.trigger(document.body, "section.out", { section: entry.target });
  						}
  					});
  				},
  				{
  					threshold: [0.4],
  				}
  			);
  			let obsevables = document.querySelectorAll(".observe");
  			let sections = document.querySelectorAll(".section");
  			sections &&
  				sections.forEach((section) => {
  					if (section.getAttribute("is-observed") != "true") {
  						section.setAttribute("is-observed", "true");
  						observer.observe(section);
  					}
  				});
  			obsevables &&
  				obsevables.forEach((section) => {
  					if (section.getAttribute("is-observed") != "true") {
  						section.setAttribute("is-observed", "true");
  						setTimeout(() => observer.observe(section), 2000);
  					}
  				});
  		}
  	};}

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
  		if (!mac) document.body.classList.add("custom-scrollbar");
  	} catch (error) {}
  });

})();
