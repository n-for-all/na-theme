!function(e,t){"use strict";function a(e){if(e&&e.__esModule)return e;var t=Object.create(null);return e&&Object.keys(e).forEach((function(a){if("default"!==a){var s=Object.getOwnPropertyDescriptor(e,a);Object.defineProperty(t,a,s.get?s:{enumerable:!0,get:function(){return e[a]}})}})),t.default=e,Object.freeze(t)}var s=a(e),r=a(t);class n{static loading(e=!0){this.loader&&(e?(this.timeout&&clearTimeout(this.timeout),this.loader.classList.add("active")):this.timeout=setTimeout((()=>{this.loader.classList.remove("active")}),1e3))}static isArray(e){return!!e&&e.constructor===Array}static abort(e){this._requests[e]&&this._requests[e].abort()}static getHeaders(){let e=new Headers;return e.set("accept","application/json"),e}static toFormData(e){if(!e)return null;let t=this.toQuery(e),a=new FormData;return t&&t.split("&").map((e=>{const[t,s]=e.split(/=(.*)/);a.append(t,decodeURIComponent(s))})),a}static toQuery(e,t=[],a=!1){const s=Object.keys(e).map(((s,r)=>{let n=e[s];if("[object Object]"===Object.prototype.toString.call(n)||this.isArray(n))return this.isArray(e)?t.push(r):t.push(s),this.toQuery(n,t,this.isArray(n));{let e=s;if(t.length>0){e=(a?t:[...t,s]).reduce(((e,t)=>""===e?t:`${e}[${t}]`),"")}return a?`${e}[]=${encodeURIComponent(n)}`:`${e}=${encodeURIComponent(n)}`}})).join("&");return t.pop(),s}static addParameterToURL(e,t){return e+=(e.split("?")[1]?"&":"?")+t}static ajaxCall(e,t,a,s){return new Promise(((r,n)=>{let l=this.getHeaders(),i=t,o=null;"GET"==e.toUpperCase()?i=this.addParameterToURL(t,this.prepareParams(a)):o=this.toFormData(a),this._requests[s]=new AbortController;const c=this._requests[s].signal;fetch(i,{method:e.toUpperCase(),mode:"cors",cache:"no-cache",credentials:"include",headers:l,redirect:"follow",referrer:"no-referrer",body:o,signal:c}).then((e=>{e.json().then((e=>{r(e)})).catch((e=>{app.showAlert({type:"error",value:"Connection to the server was lost, Please try again"}),n(e),console.error(e)}))})).catch((e=>{"AbortError"!=e.name&&20!=e.code&&(app.showAlert({type:"error",value:"Connection to the server was lost, Please try again"}),console.error(e)),n(e)}))}))}static upload(e,t,a){const s=new window.XMLHttpRequest;return a.progress&&(s.upload.addEventListener("progress",(e=>{e.lengthComputable&&a.progress(e.loaded/e.total)}),!1),s.addEventListener("progress",(e=>{e.lengthComputable&&a.progress(e.loaded/e.total)}),!1)),a.start&&s.addEventListener("loadstart",a.start),a.done&&s.addEventListener("load",(()=>{if(s.status<400)try{const e=JSON.parse(s.responseText);a.done(e,"json")}catch(e){a.done(s.responseText,"text")}else a.error(new Error("Request failed: "+s.statusText))})),a.end&&s.addEventListener("loadend",a.end),a.error&&s.addEventListener("error",a.error),a.abort&&s.addEventListener("abort",a.abort),a.timeout&&s.addEventListener("timeout",a.timeout),s.open("POST",t,!0),s.setRequestHeader("accept","application/json"),s.send(e),s}static prepareParams(e){return e?this.toQuery(e):""}}n.timeout=null,n.loader=document.getElementById("smart-loader"),n._requests={};class l extends n{static find(e,t){return this.ajaxCall("GET",e,{q:t},"livesearchFind")}}class i extends s.Component{constructor(e){super(e),this.updateState=(e,t)=>{},this.onItemClick=e=>{if(e.url)return window.location.href=e.url;this.updateState({value:e.label,values:[],searching:!0},(()=>{this.form&&this.form.submit()}))},this.onSearch=e=>{e.target.value&&e.target.value.length>0?(this.updateState({value:e.target.value,searching:!0,show:!0}),l.find(this.props.endpoint,e.target.value).then((e=>{"success"==e.status?this.updateState({values:e.data,show:!0,searching:!1}):this.updateState({values:[],show:!1,searching:!1})})).catch((e=>{this.updateState({searching:!1})}))):this.updateState({searching:!1,value:""})};let t=this.parseUrlParameters("q");this.updateState=this.setState,this.state={value:t?decodeURIComponent(t).replace(/\+/g," "):"",values:[],searching:!1}}static renderInline(e,t){let a={};for(var s=0,n=e.attributes,l=n.length;s<l;s++)a[n[s].nodeName]=n[s].nodeValue;r.render(i.renderComponent(a,t),e)}static renderComponent(e,t){return s.createElement(i,Object.assign({},e,{ref:e=>{t&&t(e)}}))}shouldComponentUpdate(e,t){return this.state.searching!=t.searching||this.state.value!=t.value||this.state.values!=t.values||this.state.show!=t.show}componentDidMount(){document.addEventListener("click",(e=>{this.updateState({show:!1})}))}componentWillUnmount(){this.updateState=()=>{}}render(){let e=this.props.alllabel?this.props.alllabel.replace("%s",this.state.value):null,t=[];return this.state.searching?t.push(s.createElement("li",{key:"item-none"},s.createElement("span",{className:"label"},this.props.searchinglabel?this.props.searchinglabel:"Searching..."))):this.state.values&&this.state.values.length?(t=this.state.values.map(((e,t)=>e.label&&""!=e.label||e.image&&""!=e.image?"title"==e.type?s.createElement("li",{key:"item-"+t,className:"group-title"},s.createElement("span",{className:"label"},e.label)):s.createElement("li",{key:"item-"+t,onClick:t=>this.onItemClick(e)},e.image?s.createElement("img",{src:e.image}):null,s.createElement("div",null,s.createElement("span",{className:"label",dangerouslySetInnerHTML:{__html:e.label}}),s.createElement("span",{className:"description",dangerouslySetInnerHTML:{__html:e.description}}))):null)),e&&t.push(s.createElement("li",{key:"item-end",className:"item-end",onClick:()=>{this.form&&this.form.submit()}},s.createElement("span",{className:"label"},e)))):e&&t.push(s.createElement("li",{key:"item-end",className:"item-end",onClick:()=>{this.form&&this.form.submit()}},s.createElement("span",{className:"label"},e))),s.createElement("div",{className:"live-search"},s.createElement("div",{className:"live-search-box"},s.createElement("form",{ref:e=>this.form=e},s.createElement("input",{type:"hidden",value:this.state.value}),s.createElement("div",{className:"search-box"+(this.state.searching?" searching":"")+(this.state.show?" visible":"")},s.createElement("input",{name:"q",value:this.state.value,placeholder:this.props.placeholder?this.props.placeholder:"Search...",type:"search",onClick:e=>e.stopPropagation(),onChange:this.onSearch}),s.createElement("ul",{className:"live-search-values"},t)))))}parseUrlParameters(e,t){t||(t=location.href),e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var a=new RegExp("[\\?&]"+e+"=([^&#]*)").exec(t);return null==a?null:a[1]}}class o{constructor(){let e=document.querySelectorAll("[data-live-search]");[].forEach.call(e,(e=>{i.renderInline(e)}))}}app.ready((()=>{new o}))}(React,ReactDOM);
