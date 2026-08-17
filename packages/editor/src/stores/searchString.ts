import { defineStore } from 'pinia';
import { SearchString } from '@app/legacy/module/searchstring.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

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
