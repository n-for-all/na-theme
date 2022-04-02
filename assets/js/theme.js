(function(){"use strict";function ownerDocument(e){return e&&e.ownerDocument||document}function ownerWindow(e){var t=ownerDocument(e);return t&&t.defaultView||window}function getComputedStyle(e,t){return ownerWindow(e).getComputedStyle(e,t)}var rUpper=/([A-Z])/g;function hyphenate(e){return e.replace(rUpper,"-$1").toLowerCase()}var msPattern=/^ms-/;function hyphenateStyleName(e){return hyphenate(e).replace(msPattern,"-ms-")}var supportedTransforms=/^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,matchesImpl;function isTransform(e){return!(!e||!supportedTransforms.test(e))}function style(e,t){var n="",r="";if("string"==typeof t)return e.style.getPropertyValue(hyphenateStyleName(t))||getComputedStyle(e).getPropertyValue(hyphenateStyleName(t));Object.keys(t).forEach((function(o){var a=t[o];a||0===a?isTransform(o)?r+=o+"("+a+") ":n+=hyphenateStyleName(o)+": "+a+";":e.style.removeProperty(hyphenateStyleName(o))})),r&&(n+="transform: "+r+";"),e.style.cssText+=";"+n}function matches(e,t){if(!matchesImpl){var n=document.body,r=n.matches||n.matchesSelector||n.webkitMatchesSelector||n.mozMatchesSelector||n.msMatchesSelector;matchesImpl=function(e,t){return r.call(e,t)}}return matchesImpl(e,t)}function closest(e,t,n){e.closest&&!n&&e.closest(t);var r=e;do{if(matches(r,t))return r;r=r.parentElement}while(r&&r!==n&&r.nodeType===document.ELEMENT_NODE);return null}function contains(e,t){return e.contains?e.contains(t):e.compareDocumentPosition?e===t||!!(16&e.compareDocumentPosition(t)):void 0}
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
  ***************************************************************************** */var __assign=function(){return(__assign=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e}).apply(this,arguments)};function __rest(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var o=0;for(r=Object.getOwnPropertySymbols(e);o<r.length;o++)t.indexOf(r[o])<0&&Object.prototype.propertyIsEnumerable.call(e,r[o])&&(n[r[o]]=e[r[o]])}return n}function __spreadArray(e,t,n){if(n||2===arguments.length)for(var r,o=0,a=t.length;o<a;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||t)}var invariant=function(){},clamp$1=function(e,t,n){return Math.min(Math.max(n,e),t)},safeMin=.001,minDuration=.01,maxDuration=10,minDamping=.05,maxDamping=1;function findSpring(e){var t,n,r=e.duration,o=void 0===r?800:r,a=e.bounce,i=void 0===a?.25:a,s=e.velocity,l=void 0===s?0:s,c=e.mass,u=void 0===c?1:c,d=1-i;d=clamp$1(minDamping,maxDamping,d),o=clamp$1(minDuration,maxDuration,o/1e3),d<1?(t=function(e){var t=e*d,n=t*o,r=t-l,a=calcAngularFreq(e,d),i=Math.exp(-n);return safeMin-r/a*i},n=function(e){var n=e*d*o,r=n*l+l,a=Math.pow(d,2)*Math.pow(e,2)*o,i=Math.exp(-n),s=calcAngularFreq(Math.pow(e,2),d);return(-t(e)+safeMin>0?-1:1)*((r-a)*i)/s}):(t=function(e){return Math.exp(-e*o)*((e-l)*o+1)-safeMin},n=function(e){return Math.exp(-e*o)*(o*o*(l-e))});var m=approximateRoot(t,n,5/o);if(o*=1e3,isNaN(m))return{stiffness:100,damping:10,duration:o};var f=Math.pow(m,2)*u;return{stiffness:f,damping:2*d*Math.sqrt(u*f),duration:o}}var rootIterations=12;function approximateRoot(e,t,n){for(var r=n,o=1;o<rootIterations;o++)r-=e(r)/t(r);return r}function calcAngularFreq(e,t){return e*Math.sqrt(1-t*t)}var durationKeys=["duration","bounce"],physicsKeys=["stiffness","damping","mass"];function isSpringType(e,t){return t.some((function(t){return void 0!==e[t]}))}function getSpringOptions(e){var t=__assign({velocity:0,stiffness:100,damping:10,mass:1,isResolvedFromDuration:!1},e);if(!isSpringType(e,physicsKeys)&&isSpringType(e,durationKeys)){var n=findSpring(e);(t=__assign(__assign(__assign({},t),n),{velocity:0,mass:1})).isResolvedFromDuration=!0}return t}function spring(e){var t=e.from,n=void 0===t?0:t,r=e.to,o=void 0===r?1:r,a=e.restSpeed,i=void 0===a?2:a,s=e.restDelta,l=__rest(e,["from","to","restSpeed","restDelta"]),c={done:!1,value:n},u=getSpringOptions(l),d=u.stiffness,m=u.damping,f=u.mass,p=u.velocity,h=u.duration,v=u.isResolvedFromDuration,g=zero,y=zero;function b(){var e=p?-p/1e3:0,t=o-n,r=m/(2*Math.sqrt(d*f)),a=Math.sqrt(d/f)/1e3;if(null!=s||(s=Math.abs(o-n)<=1?.01:.4),r<1){var i=calcAngularFreq(a,r);g=function(n){var s=Math.exp(-r*a*n);return o-s*((e+r*a*t)/i*Math.sin(i*n)+t*Math.cos(i*n))},y=function(n){var o=Math.exp(-r*a*n);return r*a*o*(Math.sin(i*n)*(e+r*a*t)/i+t*Math.cos(i*n))-o*(Math.cos(i*n)*(e+r*a*t)-i*t*Math.sin(i*n))}}else if(1===r)g=function(n){return o-Math.exp(-a*n)*(t+(e+a*t)*n)};else{var l=a*Math.sqrt(r*r-1);g=function(n){var i=Math.exp(-r*a*n),s=Math.min(l*n,300);return o-i*((e+r*a*t)*Math.sinh(s)+l*t*Math.cosh(s))/l}}}return b(),{next:function(e){var t=g(e);if(v)c.done=e>=h;else{var n=1e3*y(e),r=Math.abs(n)<=i,a=Math.abs(o-t)<=s;c.done=r&&a}return c.value=c.done?o:t,c},flipTarget:function(){var e;p=-p,n=(e=[o,n])[0],o=e[1],b()}}}spring.needsInterpolation=function(e,t){return"string"==typeof e||"string"==typeof t};var zero=function(e){return 0},progress=function(e,t,n){var r=t-e;return 0===r?1:(n-e)/r},mix=function(e,t,n){return-n*e+n*t+e},clamp=function(e,t){return function(n){return Math.max(Math.min(n,t),e)}},sanitize=function(e){return e%1?Number(e.toFixed(5)):e},floatRegex=/(-)?([\d]*\.?[\d])+/g,colorRegex=/(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))/gi,singleColorRegex=/^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?[\d\.]+%?[,\s]+){2,3}\s*\/*\s*[\d\.]+%?\))$/i;function isString(e){return"string"==typeof e}var number={test:function(e){return"number"==typeof e},parse:parseFloat,transform:function(e){return e}},alpha=__assign(__assign({},number),{transform:clamp(0,1)});__assign(__assign({},number),{default:1});var createUnitType=function(e){return{test:function(t){return isString(t)&&t.endsWith(e)&&1===t.split(" ").length},parse:parseFloat,transform:function(t){return""+t+e}}},percent=createUnitType("%");__assign(__assign({},percent),{parse:function(e){return percent.parse(e)/100},transform:function(e){return percent.transform(100*e)}});var isColorString=function(e,t){return function(n){return Boolean(isString(n)&&singleColorRegex.test(n)&&n.startsWith(e)||t&&Object.prototype.hasOwnProperty.call(n,t))}},splitColor=function(e,t,n){return function(r){var o;if(!isString(r))return r;var a=r.match(floatRegex),i=a[0],s=a[1],l=a[2],c=a[3];return(o={})[e]=parseFloat(i),o[t]=parseFloat(s),o[n]=parseFloat(l),o.alpha=void 0!==c?parseFloat(c):1,o}},hsla={test:isColorString("hsl","hue"),parse:splitColor("hue","saturation","lightness"),transform:function(e){var t=e.hue,n=e.saturation,r=e.lightness,o=e.alpha,a=void 0===o?1:o;return"hsla("+Math.round(t)+", "+percent.transform(sanitize(n))+", "+percent.transform(sanitize(r))+", "+sanitize(alpha.transform(a))+")"}},clampRgbUnit=clamp(0,255),rgbUnit=__assign(__assign({},number),{transform:function(e){return Math.round(clampRgbUnit(e))}}),rgba={test:isColorString("rgb","red"),parse:splitColor("red","green","blue"),transform:function(e){var t=e.red,n=e.green,r=e.blue,o=e.alpha,a=void 0===o?1:o;return"rgba("+rgbUnit.transform(t)+", "+rgbUnit.transform(n)+", "+rgbUnit.transform(r)+", "+sanitize(alpha.transform(a))+")"}};function parseHex(e){var t="",n="",r="",o="";return e.length>5?(t=e.substr(1,2),n=e.substr(3,2),r=e.substr(5,2),o=e.substr(7,2)):(t=e.substr(1,1),n=e.substr(2,1),r=e.substr(3,1),o=e.substr(4,1),t+=t,n+=n,r+=r,o+=o),{red:parseInt(t,16),green:parseInt(n,16),blue:parseInt(r,16),alpha:o?parseInt(o,16)/255:1}}var hex={test:isColorString("#"),parse:parseHex,transform:rgba.transform},color={test:function(e){return rgba.test(e)||hex.test(e)||hsla.test(e)},parse:function(e){return rgba.test(e)?rgba.parse(e):hsla.test(e)?hsla.parse(e):hex.parse(e)},transform:function(e){return isString(e)?e:e.hasOwnProperty("red")?rgba.transform(e):hsla.transform(e)}},colorToken="${c}",numberToken="${n}";function test(e){var t,n,r,o;return isNaN(e)&&isString(e)&&(null!==(n=null===(t=e.match(floatRegex))||void 0===t?void 0:t.length)&&void 0!==n?n:0)+(null!==(o=null===(r=e.match(colorRegex))||void 0===r?void 0:r.length)&&void 0!==o?o:0)>0}function analyse$1(e){var t=[],n=0,r=e.match(colorRegex);r&&(n=r.length,e=e.replace(colorRegex,colorToken),t.push.apply(t,r.map(color.parse)));var o=e.match(floatRegex);return o&&(e=e.replace(floatRegex,numberToken),t.push.apply(t,o.map(number.parse))),{values:t,numColors:n,tokenised:e}}function parse(e){return analyse$1(e).values}function createTransformer(e){var t=analyse$1(e),n=t.values,r=t.numColors,o=t.tokenised,a=n.length;return function(e){for(var t=o,n=0;n<a;n++)t=t.replace(n<r?colorToken:numberToken,n<r?color.transform(e[n]):sanitize(e[n]));return t}}var convertNumbersToZero=function(e){return"number"==typeof e?0:e};function getAnimatableNone(e){var t=parse(e);return createTransformer(e)(t.map(convertNumbersToZero))}var complex={test:test,parse:parse,createTransformer:createTransformer,getAnimatableNone:getAnimatableNone},mixLinearColor=function(e,t,n){var r=e*e,o=t*t;return Math.sqrt(Math.max(0,n*(o-r)+r))},colorTypes=[hex,rgba,hsla],getColorType=function(e){return colorTypes.find((function(t){return t.test(e)}))},mixColor=function(e,t){var n=getColorType(e),r=getColorType(t);invariant(n.transform===r.transform);var o=n.parse(e),a=r.parse(t),i=__assign({},o),s=n===hsla?mix:mixLinearColor;return function(e){for(var t in i)"alpha"!==t&&(i[t]=s(o[t],a[t],e));return i.alpha=mix(o.alpha,a.alpha,e),n.transform(i)}},isNum=function(e){return"number"==typeof e},combineFunctions=function(e,t){return function(n){return t(e(n))}},pipe=function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];return e.reduce(combineFunctions)};function getMixer(e,t){return isNum(e)?function(n){return mix(e,t,n)}:color.test(e)?mixColor(e,t):mixComplex(e,t)}var mixArray=function(e,t){var n=__spreadArray([],e),r=n.length,o=e.map((function(e,n){return getMixer(e,t[n])}));return function(e){for(var t=0;t<r;t++)n[t]=o[t](e);return n}},mixObject=function(e,t){var n=__assign(__assign({},e),t),r={};for(var o in n)void 0!==e[o]&&void 0!==t[o]&&(r[o]=getMixer(e[o],t[o]));return function(e){for(var t in r)n[t]=r[t](e);return n}};function analyse(e){for(var t=complex.parse(e),n=t.length,r=0,o=0,a=0,i=0;i<n;i++)r||"number"==typeof t[i]?r++:void 0!==t[i].hue?a++:o++;return{parsed:t,numNumbers:r,numRGB:o,numHSL:a}}var mixComplex=function(e,t){var n=complex.createTransformer(t),r=analyse(e),o=analyse(t);return pipe(mixArray(r.parsed,o.parsed),n)},mixNumber=function(e,t){return function(n){return mix(e,t,n)}};function detectMixerFactory(e){return"number"==typeof e?mixNumber:"string"==typeof e?color.test(e)?mixColor:mixComplex:Array.isArray(e)?mixArray:"object"==typeof e?mixObject:void 0}function createMixers(e,t,n){for(var r=[],o=n||detectMixerFactory(e[0]),a=e.length-1,i=0;i<a;i++){var s=o(e[i],e[i+1]);if(t){var l=Array.isArray(t)?t[i]:t;s=pipe(l,s)}r.push(s)}return r}function fastInterpolate(e,t){var n=e[0],r=e[1],o=t[0];return function(e){return o(progress(n,r,e))}}function slowInterpolate(e,t){var n=e.length,r=n-1;return function(o){var a=0,i=!1;if(o<=e[0]?i=!0:o>=e[r]&&(a=r-1,i=!0),!i){for(var s=1;s<n&&!(e[s]>o||s===r);s++);a=s-1}var l=progress(e[a],e[a+1],o);return t[a](l)}}function interpolate(e,t,n){var r=void 0===n?{}:n,o=r.clamp,a=void 0===o||o,i=r.ease,s=r.mixer,l=e.length;invariant(l===t.length),invariant(!i||!Array.isArray(i)||i.length===l-1),e[0]>e[l-1]&&(e=[].concat(e),t=[].concat(t),e.reverse(),t.reverse());var c=createMixers(t,i,s),u=2===l?fastInterpolate(e,c):slowInterpolate(e,c);return a?function(t){return u(clamp$1(e[0],e[l-1],t))}:u}var reverseEasing=function(e){return function(t){return 1-e(1-t)}},mirrorEasing=function(e){return function(t){return t<=.5?e(2*t)/2:(2-e(2*(1-t)))/2}},createExpoIn=function(e){return function(t){return Math.pow(t,e)}},createBackIn=function(e){return function(t){return t*t*((e+1)*t-e)}},createAnticipate=function(e){var t=createBackIn(e);return function(e){return(e*=2)<1?.5*t(e):.5*(2-Math.pow(2,-10*(e-1)))}},DEFAULT_OVERSHOOT_STRENGTH=1.525,BOUNCE_FIRST_THRESHOLD=4/11,BOUNCE_SECOND_THRESHOLD=8/11,BOUNCE_THIRD_THRESHOLD=.9,easeIn=createExpoIn(2);reverseEasing(easeIn);var easeInOut=mirrorEasing(easeIn),circIn=function(e){return 1-Math.sin(Math.acos(e))},circOut=reverseEasing(circIn);mirrorEasing(circOut);var backIn=createBackIn(DEFAULT_OVERSHOOT_STRENGTH),backOut=reverseEasing(backIn);mirrorEasing(backIn),createAnticipate(DEFAULT_OVERSHOOT_STRENGTH);var ca=4356/361,cb=35442/1805,cc=16061/1805,bounceOut=function(e){if(1===e||0===e)return e;var t=e*e;return e<BOUNCE_FIRST_THRESHOLD?7.5625*t:e<BOUNCE_SECOND_THRESHOLD?9.075*t-9.9*e+3.4:e<BOUNCE_THIRD_THRESHOLD?ca*t-cb*e+cc:10.8*e*e-20.52*e+10.72};function defaultEasing(e,t){return e.map((function(){return t||easeInOut})).splice(0,e.length-1)}function defaultOffset(e){var t=e.length;return e.map((function(e,n){return 0!==n?n/(t-1):0}))}function convertOffsetToTimes(e,t){return e.map((function(e){return e*t}))}function keyframes(e){var t=e.from,n=void 0===t?0:t,r=e.to,o=void 0===r?1:r,a=e.ease,i=e.offset,s=e.duration,l=void 0===s?300:s,c={done:!1,value:n},u=Array.isArray(o)?o:[n,o],d=convertOffsetToTimes(i&&i.length===u.length?i:defaultOffset(u),l);function m(){return interpolate(d,u,{ease:Array.isArray(a)?a:defaultEasing(u,a)})}var f=m();return{next:function(e){return c.value=f(e),c.done=e>=l,c},flipTarget:function(){u.reverse(),f=m()}}}function decay(e){var t=e.velocity,n=void 0===t?0:t,r=e.from,o=void 0===r?0:r,a=e.power,i=void 0===a?.8:a,s=e.timeConstant,l=void 0===s?350:s,c=e.restDelta,u=void 0===c?.5:c,d=e.modifyTarget,m={done:!1,value:o},f=i*n,p=o+f,h=void 0===d?p:d(p);return h!==p&&(f=h-o),{next:function(e){var t=-f*Math.exp(-e/l);return m.done=!(t>u||t<-u),m.value=m.done?h:h+t,m},flipTarget:function(){}}}reverseEasing(bounceOut);var types={keyframes:keyframes,spring:spring,decay:decay};function detectAnimationFromOptions(e){if(Array.isArray(e.to))return keyframes;if(types[e.type])return types[e.type];var t=new Set(Object.keys(e));return t.has("ease")||t.has("duration")&&!t.has("dampingRatio")?keyframes:t.has("dampingRatio")||t.has("stiffness")||t.has("mass")||t.has("damping")||t.has("restSpeed")||t.has("restDelta")?spring:keyframes}var defaultTimestep=1/60*1e3,getCurrentTime="undefined"!=typeof performance?function(){return performance.now()}:function(){return Date.now()},onNextFrame="undefined"!=typeof window?function(e){return window.requestAnimationFrame(e)}:function(e){return setTimeout((function(){return e(getCurrentTime())}),defaultTimestep)};function createRenderStep(e){var t=[],n=[],r=0,o=!1,a=new WeakSet,i={schedule:function(e,i,s){void 0===i&&(i=!1),void 0===s&&(s=!1);var l=s&&o,c=l?t:n;return i&&a.add(e),-1===c.indexOf(e)&&(c.push(e),l&&o&&(r=t.length)),e},cancel:function(e){var t=n.indexOf(e);-1!==t&&n.splice(t,1),a.delete(e)},process:function(s){var l;if(o=!0,t=(l=[n,t])[0],(n=l[1]).length=0,r=t.length)for(var c=0;c<r;c++){var u=t[c];u(s),a.has(u)&&(i.schedule(u),e())}o=!1}};return i}var maxElapsed=40,useDefaultElapsed=!0,runNextFrame=!1,isProcessing=!1,frame={delta:0,timestamp:0},stepsOrder=["read","update","preRender","render","postRender"],steps=stepsOrder.reduce((function(e,t){return e[t]=createRenderStep((function(){return runNextFrame=!0})),e}),{}),sync=stepsOrder.reduce((function(e,t){var n=steps[t];return e[t]=function(e,t,r){return void 0===t&&(t=!1),void 0===r&&(r=!1),runNextFrame||startLoop(),n.schedule(e,t,r)},e}),{}),cancelSync=stepsOrder.reduce((function(e,t){return e[t]=steps[t].cancel,e}),{}),processStep=function(e){return steps[e].process(frame)},processFrame=function(e){runNextFrame=!1,frame.delta=useDefaultElapsed?defaultTimestep:Math.max(Math.min(e-frame.timestamp,maxElapsed),1),frame.timestamp=e,isProcessing=!0,stepsOrder.forEach(processStep),isProcessing=!1,runNextFrame&&(useDefaultElapsed=!1,onNextFrame(processFrame))},startLoop=function(){runNextFrame=!0,useDefaultElapsed=!0,isProcessing||onNextFrame(processFrame)};function loopElapsed(e,t,n){return void 0===n&&(n=0),e-t-n}function reverseElapsed(e,t,n,r){return void 0===n&&(n=0),void 0===r&&(r=!0),r?loopElapsed(t+-e,t,n):t-(e-t)+n}function hasRepeatDelayElapsed(e,t,n,r){return r?e>=t+n:e<=-n}var framesync=function(e){var t=function(t){var n=t.delta;return e(n)};return{start:function(){return sync.update(t,!0)},stop:function(){return cancelSync.update(t)}}};function animate(e){var t,n,r,o,a,i=e.from,s=e.autoplay,l=void 0===s||s,c=e.driver,u=void 0===c?framesync:c,d=e.elapsed,m=void 0===d?0:d,f=e.repeat,p=void 0===f?0:f,h=e.repeatType,v=void 0===h?"loop":h,g=e.repeatDelay,y=void 0===g?0:g,b=e.onPlay,w=e.onStop,S=e.onComplete,E=e.onRepeat,x=e.onUpdate,T=__rest(e,["from","autoplay","driver","elapsed","repeat","repeatType","repeatDelay","onPlay","onStop","onComplete","onRepeat","onUpdate"]),L=T.to,O=0,M=T.duration,A=!1,_=!0,q=detectAnimationFromOptions(T);(null===(n=(t=q).needsInterpolation)||void 0===n?void 0:n.call(t,i,L))&&(a=interpolate([0,100],[i,L],{clamp:!1}),i=0,L=100);var k=q(__assign(__assign({},T),{from:i,to:L}));function C(e){if(_||(e=-e),m+=e,!A){var t=k.next(Math.max(0,m));o=t.value,a&&(o=a(o)),A=_?t.done:m<=0}null==x||x(o),A&&(0===O&&(null!=M||(M=m)),O<p?hasRepeatDelayElapsed(m,M,y,_)&&(O++,"reverse"===v?m=reverseElapsed(m,M,y,_=O%2==0):(m=loopElapsed(m,M,y),"mirror"===v&&k.flipTarget()),A=!1,E&&E()):(r.stop(),S&&S()))}return l&&(null==b||b(),(r=u(C)).start()),{stop:function(){null==w||w(),r.stop()}}}class ParallaxElement{constructor(e){this.update=()=>{this.currentScroll=this.latestScroll,this.isScroll=!1;var e=this.currentScroll/4;this.element.style.transform="translate3d(0, "+e+"px, 0)"},e&&(this.element=e,this.isScroll=!1,this.latestScroll=0,this.init())}init(){window.addEventListener("scroll",(()=>{this.latestScroll=window.scrollY,this.checkScroll()}),!1)}checkScroll(){this.isScroll||window.requestAnimationFrame(this.update),this.isScroll=!0}getOffsetTop(e){var t=0;do{t+=e.offsetTop-e.scrollTop}while(e=e.offsetParent);return t}}class Parallax{constructor(){if(this.parallaxElements=[],this.elements=document.querySelectorAll(".entry-header figure.entry-image"),this.elements&&0!=this.elements.length){this.isScroll=!1,this.latestScroll=0;var e=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame;window.requestAnimationFrame=e,[].forEach.call(this.elements,(e=>{this.parallaxElements.push(new ParallaxElement(e))}))}}}const counter=(e,t)=>{let n=null;const r=o=>{n||(n=o);const a=Math.min((o-n)/e,1);t(a),a<1?window.requestAnimationFrame(r):window.cancelAnimationFrame(window.requestAnimationFrame(r))};window.requestAnimationFrame(r)};class Team{constructor(){this.last=null,document.addEventListener("keydown",(e=>{"27"==e.key&&(e.preventDefault(),window.location.hash="#!")})),window.addEventListener("hashchange",(e=>{var t=window.location.hash.replace(/^#!/,"");if(t){var n=t.split("/");"team-member"==n[0]?this.show(n[1]):"team"==n[0]&&this.filter(n[1])}}))}filter(e){let t=document.querySelector('a[href="'+window.location.hash+'"]');if(t){t.classList.add("active");let n=this.closest(t,".na-team-wrapper");if(n){let t=n.querySelectorAll("ul.na-team>li");t&&t.length&&[].forEach.call(t,(t=>{let n=t.querySelector("a[data-terms]");n&&(n.getAttribute("data-terms").split(",").indexOf(e)>=0?(t.classList.remove("hidden"),animate({from:0,to:1,duration:1e3,ease:backOut,onUpdate:e=>{t.style.opacity=e},onComplete:()=>{}})):animate({from:1,to:0,duration:100,ease:backOut,onUpdate:e=>{t.style.opacity=e},onComplete:()=>{t.classList.add("hidden")}}))}))}let r=document.querySelectorAll('a[href^="#!team/"]');r&&r.length&&[].forEach.call(r,(e=>{t!=e&&e.classList.remove("active")}))}}show(e){let t=new FormData;return t.append("action","team_member"),t.append("id",e),document.body.classList.add("na-team-active"),fetch(TeamSettings.url,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:t}).then((e=>e.json())).then((e=>{if(e&&"success"==e.status){var t=wp.template("team-member");let n=document.createElement("div");n.setAttribute("id","na-team-member-template");let r=document.createElement("a");r.setAttribute("class","close-team"),r.addEventListener("click",(e=>{e.preventDefault(),document.querySelector("#na-team-member-template").remove(),document.body.classList.remove("na-team-active"),window.location.hash="#!"})),r.href="#",n.innerHTML=t(e.post),n.appendChild(r),n.style.display="block"}else document.body.classList.remove("na-team-active")})).catch((e=>{console.error("Error:",e),window.location.hash="#!",document.body.classList.remove("na-team-active")})),!1}closest(e,t){var n,r;for(["matches","webkitMatchesSelector","mozMatchesSelector","msMatchesSelector","oMatchesSelector"].some((function(e){return"function"==typeof document.body[e]&&(n=e,!0)}));e;){if((r=e.parentElement)&&r[n](t))return r;e=r}return null}}!function(){if(window.CustomEvent)return!1;function e(e,t){t=t||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(e,t.bubbles,t.cancelable,t.detail),n}e.prototype=window.Event.prototype,window.CustomEvent=e}();class Theme{constructor(e={}){this.mobileHandler=e=>(this.scrollIfNeeded(e),!0),this.desktopHandler=e=>{if(this.scene){var t=this.scene.scrollOffset(),n=e.getAttribute("data-index");return n&&this.scrollTo(t*(n+1)),!0}if(this.fullpage&&this.sections){const t=[...this.sections].indexOf(e);t>=0?this.fullpage.moveTo(t+1):[].forEach.call(this.sections,((t,n)=>{contains(t,e)&&this.fullpage.moveTo(n+1)}))}else this.scrollIfNeeded(e);return!0},this.scrollHandler=()=>{var e,t=location.hash;if(""==t.replace("#!","").trim()||""==t.replace("#","").trim()||t.split("/").length>1)return!1;var n=t.replace("#!","").replace("#","");if(n.indexOf("section-")>=0){let e=document.querySelector("#"+n);return e?this.handler(e):(console.warn("#"+n+" was not found, did you forget to enable permalinks?"),!1)}{let e=document.querySelector("#section-"+n);if(e)return this.handler(e);if(document.querySelector("#"+n))return this.handler(document.querySelector("#"+n))}null===(e=document.querySelector(".content"))||void 0===e||e.classList.remove("active");let r=document.querySelector("#menu-main-menu li a"),o=document.querySelector('#menu-main-menu li a[href^="'+this.escapeRegExp(t)+'"]');if(o)[].forEach.call(r,(e=>{e!=o&&e.classList.remove("active")})),o.classList.add("active");else{var a=document.querySelector('a[href^="'+this.escapeRegExp(t)+'"]');a&&a.hasAttribute("no-hash")&&(location.hash="")}return null},this.trigger=(e,t,n=null)=>{let r=null;r=n?new CustomEvent(t,{detail:n}):new Event(t),e instanceof NodeList?e.forEach((e=>{e.dispatchEvent(r)})):e.dispatchEvent(r)},this.countDecimals=function(e){return Math.floor(e)===e?0:e.toString().split(".")[1].length||0},this.format=(e,t)=>String(e).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g,"$1"+t),this.getScrollPosition=e=>({x:void 0!==e.pageXOffset?e.pageXOffset:e.scrollLeft,y:void 0!==e.pageYOffset?e.pageYOffset:e.scrollTop}),this.showTab=e=>{var t=document.querySelector("#"+e);if(t){var n=closest(t,".na-tabs");let r=n.querySelectorAll(".tab-content");[].forEach.call(r,(e=>{e.classList.remove("active")}));let o=n.querySelectorAll(".tab-nav");[].forEach.call(o,(e=>{e.classList.remove("active")})),setTimeout((function(){var n;t.classList.add("active"),null===(n=closest(t,"li"))||void 0===n||n.classList.add("active");let r=document.querySelector('a[href="#'+e+'"]');null==r||r.classList.add("active")}),400)}},this.sectionObserver=()=>{if("IntersectionObserver"in window){const e=new IntersectionObserver((e=>{e.forEach((e=>{e.intersectionRatio>0?(e.target.classList.add("in-once"),e.target.classList.add("in"),e.target.classList.remove("out"),this.trigger(document.body,"section.in",{section:e.target})):(e.target.classList.add("out"),e.target.classList.remove("in"),this.trigger(document.body,"section.out",{section:e.target}))}))}));document.querySelectorAll(".section").forEach((t=>{"true"!=t.getAttribute("is-observed")&&(t.setAttribute("is-observed","true"),e.observe(t))}))}},this.options=e,this.controller=null,this.scene=null,this.fullpage=null,this.sections=null,this.Parallax=new Parallax,this.team=new Team;let t=document.querySelector("#masthead");this.headerOffset=0,t&&t.classList.contains("fixed-top")&&(this.headerOffset=t.clientHeight);let n=document.querySelectorAll("[data-toggle]");n&&[].forEach.call(n,(e=>{let t=document.querySelector(e.getAttribute("data-target"));if(t){let n=e.getAttribute("data-toggle")?e.getAttribute("data-toggle"):"active";e.getAttribute("data-toggle-close")&&e.setAttribute("data-toggle-initial",e.innerHTML),e.addEventListener("click",(r=>{r.preventDefault(),t.classList.contains(n)?(t.classList.remove(n),e.setAttribute("aria-expanded","true"),e.getAttribute("data-toggle-close")&&(e.innerHTML=e.getAttribute("data-toggle-initial"))):(t.classList.add(n),e.setAttribute("aria-expanded","false"),e.getAttribute("data-toggle-close")&&(e.innerHTML=e.getAttribute("data-toggle-close")))}))}})),this.load()}load(){var e;this.innerScroll=document.querySelector("#inner-scroll");let t=null===(e=this.innerScroll)||void 0===e?void 0:e.children.length;if(this.options.scrolling&&window.innerWidth>this.options.mobile){var n=100/t;switch(parseInt(this.options.scrolling,10)){case 2:if(t>0){[].forEach.call(this.innerScroll.children,(e=>{e.style.width=n+"%",e.style.height=window.innerHeight+"px"})),this.innerScroll.style.width=100*t+"%",this.controller=new ScrollMagic.Controller({});var r=new TimelineMax;for(let e=0;e<t;e++)r.to("#inner-scroll",.5,{z:-300,delay:1}).to("#inner-scroll",2,{x:"-"+n*(e+1)+"%"}).to("#inner-scroll",.5,{z:0});this.scene=new ScrollMagic.Scene({triggerElement:".scrolling-container--2",triggerHook:"onLeave",duration:"500%"}).setPin(".scrolling-container--2").setTween(r).addTo(this.controller);var o=0;this.scene.on("progress",(function(e){var n=e.progress*t+.3+1;n>t&&(n=t),(n=parseInt(n.toString(),10))!=o&&([].forEach.call(this.innerScroll.children,(function(e){e.classList.remove("in")})),this.innerScroll.children[n].classList.add("in"),o=n)}))}break;case 3:t>0&&([].forEach.call(this.innerScroll.children,(e=>{e.style.height=window.innerHeight+"px"})),this.controller=new ScrollMagic.Controller({globalSceneOptions:{triggerHook:"onLeave"}}),[].forEach.call(this.innerScroll.children,(e=>{new ScrollMagic.Scene({triggerElement:e}).setPin(e,{pushFollowers:!1}).addTo(this.controller)})));break;case 4:if(t>0){this.controller=new ScrollMagic.Controller;let e=new TimelineMax,n=!0,r=!0;[].forEach.call(this.innerScroll.children,((t,o)=>{if(0!=o){var i={};n?(i.x=r?"-100%":"100%",r=!r):(i.y=r?"-100%":"100%",r=!r),n=!n,o%2==0&&0!=o&&(n=!n),e.fromTo(a[o],1,i,{x:"0%",y:"0%",ease:Linear.easeNone})}else e.fromTo(t,1,{x:"0%",y:0},{x:"0%",y:"0%",ease:Linear.easeNone})})),this.scene=new ScrollMagic.Scene({loglevel:2,triggerElement:"#inner-scroll",triggerHook:"onLeave",duration:100*t+"%"}).setPin("#inner-scroll").setTween(e).addTo(this.controller)}break;case 5:var a=document.querySelectorAll(".main-inner > section.section");t=a.length,t>0&&[].forEach.call(a,(function(e){e.style.minHeight=window.innerHeight+"px"})),window.addEventListener("resize",(function(){[].forEach.call(a,(function(e){e.style.minHeight=window.innerHeight+"px"}))}));break;default:var i=".page-template-page-home-section #wrapper",s=".section, .site-footer";let e=document.querySelector(i);if(this.sections=e?e.querySelectorAll(s):null,this.sections&&this.sections.length){let e=document.createElement("div");e.classList.add("section-nav");let t=document.createElement("ul");t.classList.add("inner"),e.appendChild(t),document.body.appendChild(e),[].forEach.call(this.sections,(e=>{style(e,{height:window.innerHeight+"px"})})),[].forEach.call(this.sections,(function(e,n){let r=document.createElement("li");r.setAttribute("data-index",e),r.innerHTML=e,r.addEventListener("click",(t=>{var n;null===(n=this.fullpage)||void 0===n||n.moveTo(e+1)})),t.appendChild(r)}));let n=function(e){[].forEach.call(t.children,(function(t,n){n==e?t.classList.add("active"):t.classList.remove("active")}))};this.fullpage=new fullpage(i,{sectionSelector:s,afterLoad:function(e,t){n(t-1),t>1?setTimeout((function(){document.body.classList.add("scrolling")}),100):document.body.classList.remove("scrolling")},onLeave:function(e,t,r){let o=this.sections[e-1];n(t-1),t>1?document.body.classList.add("scrolling"):document.body.classList.remove("scrolling"),o.classList.remove("in"),o=this.sections[t-1],null==o||o.classList.add("in")}});break}}}if(this.handler=window.innerWidth>this.options.mobile?this.desktopHandler:this.mobileHandler,window.innerWidth<=this.options.mobile&&document.body.classList.add("no-scrolling-style"),"onhashchange"in window){window.addEventListener("hashchange",(e=>{var t;if(this.scrollHandler())return e.stopPropagation(),void e.preventDefault();if("#!search"==window.location.hash)return document.body.classList.add("search-closed"),document.body.classList.remove("search-active"),void setTimeout((function(){document.body.classList.remove("search-closed")}),1e3);let n=null===(t=window.location.hash)||void 0===t?void 0:t.replace("#!","").replace("#","");if(n){let t=n.split("/");if(t.length>1)return void("tabs"==t[0]&&this.showTab(t[1]));let r=document.querySelector(`#${n}`);if(r)return this.scrollIfNeeded(r),void e.stopPropagation()}}));try{window.dispatchEvent(new Event("hashchange"))}catch(e){}}else{var l;(l=document.querySelector("#menu-main-menu li a[href^=\\/\\#]"))&&l.addEventListener("click",(function(e){this.scrollHandler()&&(e.stopPropagation(),e.preventDefault())}))}(l=document.querySelector(".btn.btn-back"))&&l.addEventListener("click",(function(){document.querySelector(".content").classList.remove("active"),location.hash="#home"})),(c=document.querySelectorAll('a[href="#search"]')).length&&[].forEach.call(c,(function(e){e.addEventListener("click",(function(e){return e.preventDefault(),document.body.classList.add("search-active"),document.body.classList.remove("search-closed"),!1}))})),(l=document.querySelector("#searchform a.search-close"))&&l.addEventListener("click",(function(){return document.body.classList.add("search-closed"),document.body.classList.remove("search-active"),setTimeout((function(){document.body.classList.remove("search-closed")}),1e3),!1}));var c,u=document.querySelectorAll("#navbar ul li a"),d=document.querySelectorAll("#wrapper > section");window.addEventListener("resize",(()=>{window.innerWidth<=this.options.mobile?(this.controller&&(this.scene&&this.scene.destroy(!0),this.controller.destroy(!0),document.body.classList.add("no-scrolling-style")),this.handler=this.mobileHandler):this.handler=this.desktopHandler})),window.addEventListener("scroll",(()=>{var e=this.getScrollPosition(window),t=document.querySelector("#masthead"),n=0;t&&(n=t.clientHeight);var r=e.y+n+100,o=[].map.call(d,(function(e){if(e.getBoundingClientRect().top<r)return e})),a=(o=o[o.length-1])?o.getAttribute("id"):"";[].forEach.call(u,(function(e){e.classList.remove("active")}));var i=document.querySelector('#navbar ul li a[section="'+a+'"]');i&&i.classList.add("active"),e.y>100?document.body.classList.add("scrolling"):document.body.classList.remove("scrolling")})),(c=document.querySelectorAll(".na-posts-dropdown > a")).length&&[].forEach.call(c,(function(e){e.addEventListener("click",(function(t){return t.preventDefault(),e.parentNode.classList.remove("active"),!1}))})),(c=document.querySelectorAll(".wp-block-na-theme-blocks-accordion")).length&&[].forEach.call(c,(function(e){e.addEventListener("click",(function(t){if(t.target.classList.contains("block-title"))return t.preventDefault(),e.classList.toggle("open"),!1}))})),window.addEventListener("load",(function(){document.body.classList.remove("loading"),setTimeout((function(){var e=document.querySelector(".loading-overlay");document.body.classList.add("loaded"),e&&e.parentNode&&e.parentNode.removeChild(e)}),2e3),window.scrollY>100&&document.body.classList.add("scrolling")})),this.sectionObserver(),this.initCounters(),window.naTheme=this,document.body.dispatchEvent(new CustomEvent("theme-ready",{bubbles:!0,detail:this}))}initCounters(){document.body.addEventListener("section.in",(e=>{let{section:section}=e.detail;if(section){let cntrs=section.querySelectorAll(".counter");if(!cntrs||0==cntrs.length)return;[].forEach.call(cntrs,(cntr=>{if(cntr){let elm=cntr.querySelector(".block-title");if(!elm)return;let settings=eval("("+cntr.getAttribute("data-settings")+")"),step=parseFloat(settings.step),initVal=parseFloat(settings.start),lastVal=parseFloat(settings.end),totalDecimals=this.countDecimals(step);var formatOutput=e=>(settings.seperator&&""!=settings.seperator&&(e=this.format(e,settings.seperator)),e),update=e=>{let t=(e*(lastVal-initVal)+step).toFixed(totalDecimals);elm.innerHTML=settings.prefix+formatOutput(t)+settings.suffix,e>=1&&(elm.innerHTML=settings.prefix+formatOutput(settings.end)+settings.suffix)};counter(parseFloat(settings.duration),update)}}))}}));let counters=document.querySelectorAll(".counter .count");counters.length&&[].forEach.call(counters,(e=>{let t=e.innerHTML.match(/\d+/),n=e.innerHTML;t&&t.length&&(t.map((e=>{n=n.replace(e,'<span data-count="'+e+'" class="inner-counter inner-counter-'+e+'">'+e+"</span>")})),e.innerHTML=n)}))}escapeRegExp(e){return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}scrollIfNeeded(e,t=null,n=this.headerOffset){let r=e.offsetTop;this.scrollTo(r,t,n)}scrollTo(e,t=null,n=this.headerOffset){let r=document.scrollingElement||document.body;r&&animate({from:r.scrollTop,to:e-n,duration:1e3,ease:backOut,onUpdate:e=>{r.scrollTop=e},onComplete:t})}}app.ready((function(){new Theme(options);try{/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)||document.body.classList.add("custom-scrollbar")}catch(e){}setTimeout((function(){document.body.classList.remove("loading"),setTimeout((function(){var e=document.querySelector(".loading-overlay");document.body.classList.add("loaded"),e&&e.parentNode&&e.parentNode.removeChild(e)}),2e3)}),4e3)}))})();
