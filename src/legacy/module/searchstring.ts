import { $ } from '@/util/dom.ts';
import { disable, enable, on, read, write } from '@/util/element-utils.ts';
function getWindow() {
	return (window as any).Window;
}
export const SearchString = new (class {
	window = null as any;
	current: any = null;
	log = null as any;
	lastArr: any[] = [];
	index = 0;
	searchMode: { [k: string]: any } = { caseInsensitive: false, regex: false, matchLine: false };
	private _bound = false;
	private bindButtons() {
		if (this._bound) return;
		const win = $('#event-search-string');
		if (!win) return;
		this._bound = true;
		this.window = win;
		this.log = $('#event-search-string-log');
		on(win, 'keydown', (e: any) => {
			if (e.key == 'Enter' && this.lastArr.length > 0) {
				this.next();
			}
		});
		on(win, 'closed', () => this.close());
		on($('#event-search-string-previous'), 'click', () => this.previous());
		on($('#event-search-string-next'), 'click', () => this.next());
		on($('#event-search-string-search'), 'input', (e: any) => this.input(e));
		on($('#event-search-string-case-insensitive'), 'change', (e: any) =>
			this.change('caseInsensitive', e)
		);
		on($('#event-search-string-regex'), 'change', (e: any) => this.change('regex', e));
		on($('#event-search-string-match-line'), 'change', (e: any) => this.change('matchLine', e));
	}
	change(mode: any, e: any) {
		this.searchMode[mode] = read(e.target);
		switch (mode) {
			case 'caseInsensitive':
				if (this.searchMode[mode]) {
					write($('#event-search-string-regex'), false);
					disable($('#event-search-string-regex'));
				} else {
					enable($('#event-search-string-regex'));
				}
				break;
			case 'regex':
				if (this.searchMode[mode]) {
					write($('#event-search-string-case-insensitive'), false);
					disable($('#event-search-string-case-insensitive'));
				} else {
					enable($('#event-search-string-case-insensitive'));
				}
				break;
		}
		if (read($('#event-search-string-search')))
			this.input({
				target: { value: read($('#event-search-string-search')) }
			});
	}
	locationLine() {
		const arr = this.lastArr;
		if (arr.length == 0) return;
		const index = this.index;
		const current = arr[index];
		current.node.classList.add('event-search-string-location-active');
		this.current.scrollToRow(current.index);
		if (current.sub) {
			if (current.sub?.folded) {
				this.current.fold(current.sub);
			}
		}
	}
	clear() {
		this.lastArr.forEach((element: any) => {
			element.node.classList.remove('event-search-string-location-active');
			element.node.classList.remove('event-search-string-active');
		});
	}
	clearHistory() {
		write($('#event-search-string-search'), '');
	}
	input(e: any) {
		const val = e.target.value;
		if (val.trim() == '') {
			this.clear();
			this.lastArr = [];
			this.log.textContent = this.lastArr.length;
			return;
		}
		this.clear();
		const { elements } = this.current;
		const findArr = this.current.findString(val, elements, this.searchMode);
		this.lastArr = findArr;
		findArr.forEach((element: any) => {
			element.node.classList.add('event-search-string-active');
		});
		this.log.textContent = findArr.length;
		if (this.lastArr.length == 0) {
			disable($('#event-search-string-previous'));
			disable($('#event-search-string-next'));
		} else {
			enable($('#event-search-string-previous'));
			enable($('#event-search-string-next'));
		}
	}
	clearCurrentHighlight() {
		const arr = this.lastArr;
		const index = this.index;
		const currentNode = arr[index];
		currentNode.node.classList.remove('event-search-string-location-active');
	}
	previous() {
		if (this.lastArr.length == 0) return;
		this.clearCurrentHighlight();
		this.index--;
		if (this.index < 0) {
			this.index = this.lastArr.length - 1;
		}
		this.locationLine();
	}
	next() {
		if (this.lastArr.length == 0) return;
		this.clearCurrentHighlight();
		this.index++;
		if (this.index >= this.lastArr.length) {
			this.index = 0;
		}
		this.locationLine();
	}

	open(eventWindow: any) {
		this.bindButtons();
		getWindow().open('event-search-string');
		this.index = 0;
		this.current = eventWindow;
		disable($('#event-search-string-previous'));
		disable($('#event-search-string-next'));
		$('#event-search-string-search').focus();
		if (read($('#event-search-string-search')))
			this.input({
				target: { value: read($('#event-search-string-search')) }
			});
	}
	close() {
		this.current = null;
		this.clear();
		this.lastArr = [];
		this.log.textContent = this.lastArr.length;
	}
})();
