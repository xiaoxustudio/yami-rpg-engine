import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import { $ } from '@app/utils/dom';
import { Window } from '@app/tools/window-object.ts';
import { disable, enable, on, read, write } from '@app/utils/element-utils.ts';

interface SearchMode {
	caseInsensitive: boolean;
	regex: boolean;
	matchLine: boolean;
}

interface SearchResult {
	node: HTMLElement;
	index: number;
	sub?: { folded?: boolean } & HTMLElement;
}

interface SearchableList {
	elements: unknown[];
	findString: (val: string, elements: unknown[], mode: SearchMode) => SearchResult[];
	scrollToRow: (index: number) => void;
	fold?: (sub: HTMLElement) => void;
}

export const SearchString = new (class {
	window: HTMLElement | null = null;
	current: SearchableList | null = null;
	log: HTMLElement | null = null;
	lastArr: SearchResult[] = [];
	index = 0;
	searchMode: SearchMode = { caseInsensitive: false, regex: false, matchLine: false };
	private _bound = false;
	private bindButtons() {
		getSearchStringStore().syncState();
		if (this._bound) return;
		const win = $('#event-search-string');
		if (!win) return;
		this._bound = true;
		this.window = win;
		this.log = $('#event-search-string-log');
		on(win, 'keydown', (e: KeyboardEvent) => {
			if (e.key == 'Enter' && this.lastArr.length > 0) {
				this.next();
			}
		});
		on(win, 'closed', () => this.close());
		on($('#event-search-string-previous'), 'click', () => this.previous());
		on($('#event-search-string-next'), 'click', () => this.next());
		on($('#event-search-string-search'), 'input', (e: Event) => this.input(e));
		on($('#event-search-string-case-insensitive'), 'change', (e: Event) =>
			this.change('caseInsensitive', e)
		);
		on($('#event-search-string-regex'), 'change', (e: Event) => this.change('regex', e));
		on($('#event-search-string-match-line'), 'change', (e: Event) =>
			this.change('matchLine', e)
		);
	}
	change(mode: keyof SearchMode, e: Event) {
		this.searchMode = { ...this.searchMode, [mode]: read(e.target as HTMLElement) };
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
		this.current!.scrollToRow(current.index);
		if (current.sub) {
			if (current.sub?.folded) {
				this.current!.fold!(current.sub);
			}
		}
	}
	clear() {
		this.lastArr.forEach((element) => {
			element.node.classList.remove('event-search-string-location-active');
			element.node.classList.remove('event-search-string-active');
		});
	}
	clearHistory() {
		write($('#event-search-string-search'), '');
	}
	input(e: { target?: { value?: unknown } } | Event) {
		const val = (e.target as { value?: unknown })?.value as string;
		if (val.trim() == '') {
			this.clear();
			this.lastArr = [];
			this.log!.textContent = String(this.lastArr.length);
			return;
		}
		this.clear();
		const { elements } = this.current!;
		const findArr = this.current!.findString(val, elements, this.searchMode);
		this.lastArr = findArr;
		findArr.forEach((element) => {
			element.node.classList.add('event-search-string-active');
		});
		this.log!.textContent = String(findArr.length);
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

	open(eventWindow: SearchableList) {
		this.bindButtons();
		Window.open!('event-search-string');
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
		this.log!.textContent = String(this.lastArr.length);
	}
})();

export interface SearchModeShape {
	caseInsensitive: boolean;
	regex: boolean;
	matchLine: boolean;
}

export const searchStringStateKeys = ['index', 'searchMode'] as const;

export const useSearchStringStore = defineStore('searchString', () => {
	const index = shallowRef<number>(0);
	const searchMode = shallowRef<SearchModeShape>({
		caseInsensitive: false,
		regex: false,
		matchLine: false
	});

	function syncState() {
		index.value = SearchString?.index ?? 0;
		searchMode.value = SearchString?.searchMode ?? {
			caseInsensitive: false,
			regex: false,
			matchLine: false
		};
	}

	return {
		index,
		searchMode,
		syncState
	};
});

export function getSearchStringStore() {
	return useSearchStringStore(pinia);
}

const searchStringBridgeKeys = ['index', 'searchMode'] as const;

for (const key of searchStringBridgeKeys) {
	Object.defineProperty(SearchString, key, {
		get: () => getSearchStringStore()[key],
		set: (value: any) => {
			(getSearchStringStore() as unknown as Record<string, any>)[key] = value;
		},
		configurable: true
	});
}
