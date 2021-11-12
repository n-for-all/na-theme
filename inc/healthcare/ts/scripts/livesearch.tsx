import { LivesearchModel } from "models/livesearch";
import * as React from "react";
import * as ReactDOM from "react-dom";

interface ILiveSearchProps {
	endpoint: string;
	placeholder: string;
	alllabel?: string;
	searchinglabel?: string;
}

export class LiveSearch extends React.Component<ILiveSearchProps, any> {
	updateState = (state: any, callback?) => {};
	form: HTMLFormElement;
	constructor(props: ILiveSearchProps) {
		super(props);
		let q = this.parseUrlParameters("q");
		this.updateState = this.setState;
		this.state = {
			value: q ? decodeURIComponent(q).replace(/\+/g, " ") : "",
			values: [],
			searching: false,
		};
	}

	static renderInline(el: HTMLDivElement, callback?: Function) {
		let obj = {};
		for (var i = 0, atts = el.attributes, n = atts.length; i < n; i++) {
			obj[atts[i].nodeName] = atts[i].nodeValue;
		}

		ReactDOM.render(LiveSearch.renderComponent(obj, callback), el);
	}

	static renderComponent(data, callback?: Function) {
		return (
			<LiveSearch
				{...data}
				ref={(item) => {
					if (callback) callback(item);
				}}
			/>
		);
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.searching != nextState.searching || this.state.value != nextState.value || this.state.values != nextState.values || this.state.show != nextState.show;
	}

	componentDidMount() {
		document.addEventListener("click", (e) => {
			this.updateState({ show: false });
		});
	}

	componentWillUnmount() {
		this.updateState = () => {};
	}

	render() {
        let all = this.props.alllabel ? this.props.alllabel.replace("%s", this.state.value) : null;
		let values = [];
		if (this.state.searching) {
			values.push(
				<li key={"item-none"}>
					<span className="label">{this.props.searchinglabel ? this.props.searchinglabel : 'Searching...'}</span>
				</li>
			);
		} else if (this.state.values && this.state.values.length) {
			values = this.state.values.map((value, index) => {
				if ((!value.label || value.label == "") && (!value.image || value.image == "")) {
					return null;
				}
				if (value.type == "title") {
					return (
						<li key={"item-" + index} className="group-title">
							<span className="label">{value.label}</span>
						</li>
					);
				}
				return (
					<li key={"item-" + index} onClick={(e) => this.onItemClick(value)}>
						{value.image ? <img src={value.image} /> : null}
						<div>
							<span className="label">{value.label}</span>
							<span className="description">{value.description}</span>
						</div>
					</li>
				);
			});

			all && values.push(
				<li
					key={"item-end"}
					className="item-end"
					onClick={() => {
						if (this.form) {
							this.form.submit();
						}
					}}>
					<span className="label">{all}</span>
				</li>
			);
		} else {
			all && values.push(
				<li
					key={"item-end"}
					className="item-end"
					onClick={() => {
						if (this.form) {
							this.form.submit();
						}
					}}>
					<span className="label">{all}</span>
				</li>
			);
		}
		return (
			<div className="live-search">
				<div className="live-search-box">
					<form ref={(elm) => (this.form = elm)}>
						<input type="hidden" value={this.state.value} />
						<div className={"search-box" + (this.state.searching ? " searching" : "") + (this.state.show ? " visible" : "")}>
							<input name="q" value={this.state.value} placeholder={this.props.placeholder ? this.props.placeholder : "Search..."} type="search" onClick={(e) => e.stopPropagation()} onChange={this.onSearch} />
							<ul className="live-search-values">{values}</ul>
						</div>
					</form>
				</div>
			</div>
		);
	}

	onItemClick = (item: any) => {
		if (item.url) {
			return (window.location.href = item.url);
		}
		this.updateState({ value: item.label, values: [], searching: true }, () => {
			if (this.form) {
				this.form.submit();
			}
		});
	};

	onSearch = (event) => {
		if (event.target.value && event.target.value.length > 0) {
			this.updateState({ value: event.target.value, searching: true, show: true });
			LivesearchModel.find(this.props.endpoint, event.target.value)
				.then((resp: any) => {
					if (resp.status == "success") {
						this.updateState({ values: resp.data, show: true, searching: false });
					} else {
						this.updateState({ values: [], show: false, searching: false });
					}
				})
				.catch((e) => {
					this.updateState({ searching: false });
				});
		} else {
			this.updateState({ searching: false, value: "" });
		}
	};
	parseUrlParameters(name, url?) {
		if (!url) url = location.href;
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		return results == null ? null : results[1];
	}
}
