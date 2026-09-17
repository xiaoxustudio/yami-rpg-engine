import { defineStore } from 'pinia';
import { storesEls } from '@app/stores/element-registry';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import { Window } from '@app/tools/window-object.ts';
import { disable, enable, on, read, write } from '@app/utils/element-utils.ts';
import type { YamiElement } from '@app/types/element-api';

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
		const win = storesEls.get('event-search-string') as YamiElement;
		if (!win) return;
		this._bound = true;
		this.window = win;
		this.log = storesEls.get('event-search-string-log') as YamiElement;
		on(win, 'keydown', (e: KeyboardEvent) => {
			if (e.key == 'Enter' && this.lastArr.length > 0) {
				this.next();
			}
		});
		on(win, 'closed', () => this.close());
		on(storesEls.get('event-search-string-previous') as YamiElement, 'click', () =>
			this.previous()
		);
		on(storesEls.get('event-search-string-next') as YamiElement, 'click', () => this.next());
		on(storesEls.get('event-search-string-search') as YamiElement, 'input', (e: Event) =>
			this.input(e)
		);
	}
	refresh() {
		if (read(storesEls.get('event-search-string-search') as YamiElement))
			this.input({
				target: { value: read(storesEls.get('event-search-string-search') as YamiElement) }
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
		write(storesEls.get('event-search-string-search') as YamiElement, '');
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
			disable(storesEls.get('event-search-string-previous') as YamiElement);
			disable(storesEls.get('event-search-string-next') as YamiElement);
		} else {
			enable(storesEls.get('event-search-string-previous') as YamiElement);
			enable(storesEls.get('event-search-string-next') as YamiElement);
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
		disable(storesEls.get('event-search-string-previous') as YamiElement);
		disable(storesEls.get('event-search-string-next') as YamiElement);
		storesEls.get('event-search-string-search')?.focus?.();
		if (read(storesEls.get('event-search-string-search') as YamiElement))
			this.input({
				target: { value: read(storesEls.get('event-search-string-search') as YamiElement) }
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

	function setMode(mode: keyof SearchModeShape, value: boolean) {
		const next = { ...searchMode.value };
		next[mode] = value;
		if (mode === 'caseInsensitive' && value) next.regex = false;
		if (mode === 'regex' && value) next.caseInsensitive = false;
		searchMode.value = next;
	}

	return {
		index,
		searchMode,
		syncState,
		setMode
	};
});

export function getSearchStringStore() {
	return useSearchStringStore(pinia);
}

const searchStringBridgeKeys = ['index', 'searchMode'] as const;

for (const key of searchStringBridgeKeys) {
	Object.defineProperty(SearchString, key, {
		get: () => getSearchStringStore()[key],
		set: (value: unknown) => {
			(getSearchStringStore() as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
