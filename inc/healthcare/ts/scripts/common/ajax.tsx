declare let app: any;

class Ajax {
	static timeout = null;
	static loader = document.getElementById('smart-loader');
	static _requests = {};
	static loading(active = true) {
		if (!this.loader) {
			return;
		}
		if (active) {
			if (this.timeout) {
				clearTimeout(this.timeout);
			}
			this.loader.classList.add('active');
		} else {
			this.timeout = setTimeout(() => {
				this.loader.classList.remove('active');
			}, 1000);
		}
	}
	static isArray(obj) {
		return !!obj && obj.constructor === Array;
	}
	static abort(tag) {
		if (this._requests[tag]) {
			this._requests[tag].abort();
		}
	}
	static getHeaders(): Headers {
		let headers = new Headers();
		headers.set('accept', 'application/json');
		return headers;
	}
	static toFormData(params) {
		if (!params) {
			return null;
		}
		let query = this.toQuery(params);
		let formData = new FormData();
		if (query) {
			query.split('&').map((item) => {
				const [key, value] = item.split(/=(.*)/);
				formData.append(key, decodeURIComponent(value));
			});
		}
		return formData;
	}
	static toQuery(params, keys = [], isArray = false) {
		const p = Object.keys(params)
			.map((key, index) => {
				let val = params[key];

				if ('[object Object]' === Object.prototype.toString.call(val) || this.isArray(val)) {
					if (this.isArray(params)) {
						keys.push(index);
					} else {
						keys.push(key);
					}
					return this.toQuery(val, keys, this.isArray(val));
				} else {
					let tKey = key;

					if (keys.length > 0) {
						const tKeys = isArray ? keys : [...keys, key];
						tKey = tKeys.reduce((str, k) => {
							return '' === str ? k : `${str}[${k}]`;
						}, '');
					}
					if (isArray) {
						return `${tKey}[]=${encodeURIComponent(val)}`;
					} else {
						return `${tKey}=${encodeURIComponent(val)}`;
					}
				}
			})
			.join('&');

		keys.pop();
		return p;
	}
	static addParameterToURL(_url, param) {
		_url += (_url.split('?')[1] ? '&' : '?') + param;
		return _url;
	}
	static ajaxCall(method, endpoint, data, tag: string) {
		return new Promise((resolve, reject) => {
			let headers = this.getHeaders();
			let url = endpoint;
			let formData = null;
			if (method.toUpperCase() == 'GET') {
				url = this.addParameterToURL(endpoint, this.prepareParams(data));
			} else {
				formData = this.toFormData(data);
			}

			this._requests[tag] = new AbortController();
			const signal = this._requests[tag].signal;
			fetch(url, {
				method: method.toUpperCase(), // *GET, POST, PUT, DELETE, etc.
				mode: 'cors', // no-cors, *cors, same-origin
				cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				credentials: 'include', // include, *same-origin, omit
				headers: headers,
				redirect: 'follow', // manual, *follow, error
				referrer: 'no-referrer', // no-referrer, *client
				body: formData, // body data type must match "Content-Type" header
				signal,
			})
				.then((response) => {
					response
						.json()
						.then((resp) => {
							resolve(resp);
						})
						.catch((error: Error) => {
							app.showAlert({ type: 'error', value: 'Connection to the server was lost, Please try again' });
							reject(error);
							console.error(error);
						});
				})
				.catch((error: Error) => {
                    if(error.name != 'AbortError' && error['code'] != 20){
                        app.showAlert({ type: 'error', value: 'Connection to the server was lost, Please try again' });
                        console.error(error);
                    }
					reject(error);
				});
		});
	}
	static upload(data, endpoint, callbacks) {
		const xhr = new window.XMLHttpRequest();
		if (callbacks.progress) {
			xhr.upload.addEventListener(
				'progress',
				(evt) => {
					if (evt.lengthComputable) {
						callbacks.progress(evt.loaded / evt.total);
					}
				},
				false
			);

			xhr.addEventListener(
				'progress',
				(evt) => {
					if (evt.lengthComputable) {
						callbacks.progress(evt.loaded / evt.total);
					}
				},
				false
			);
		}
		if (callbacks.start) xhr.addEventListener('loadstart', callbacks.start);
		if (callbacks.done)
			xhr.addEventListener('load', () => {
				if (xhr.status < 400) {
					try {
						const json = JSON.parse(xhr.responseText);
						callbacks.done(json, 'json');
					} catch (e) {
						callbacks.done(xhr.responseText, 'text');
					}
				} else callbacks.error(new Error('Request failed: ' + xhr.statusText));
			});
		if (callbacks.end) xhr.addEventListener('loadend', callbacks.end);
		if (callbacks.error) xhr.addEventListener('error', callbacks.error);
		if (callbacks.abort) xhr.addEventListener('abort', callbacks.abort);
		if (callbacks.timeout) xhr.addEventListener('timeout', callbacks.timeout);

		xhr.open('POST', endpoint, true);

		xhr.setRequestHeader('accept', 'application/json');
		xhr.send(data);

		return xhr;
	}

	static prepareParams(data) {
		if (!data) {
			return '';
		}
		return this.toQuery(data);
	}
}
export { Ajax };
