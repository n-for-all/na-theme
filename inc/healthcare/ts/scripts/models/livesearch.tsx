import { Ajax } from '../common/ajax';

class LivesearchModel extends Ajax {
	static find(endpoint, q) {
		return this.ajaxCall('GET', endpoint, { q }, 'livesearchFind');
	}
}
export { LivesearchModel };