import { SettingConfig } from '@app/services/project/settingconfig';
import { getBrowserInstance } from '@app/stores/browser.ts';

export interface SearchHistoryDropdownApi {
	show(input: HTMLInputElement): void;
	hide(): void;
}

let dropdown: SearchHistoryDropdownApi | null = null;

export function registerSearchHistoryDropdown(api: SearchHistoryDropdownApi | null): void {
	dropdown = api;
}

interface BrowserSearchHistoryShape {
	histories: string[];
	input: Element | null;
	outsideHandler: ((event: Event) => void) | null;
	initialize?: (this: BrowserSearchHistoryShape) => void;
	bind?: (this: BrowserSearchHistoryShape, searcher: HTMLElement) => void;
	getInput?: (this: BrowserSearchHistoryShape, searcher: HTMLElement) => Element | null;
	getLimit?: (this: BrowserSearchHistoryShape) => number;
	add?: (this: BrowserSearchHistoryShape, keyword: string) => void;
	remove?: (this: BrowserSearchHistoryShape, keyword: string) => void;
	focus?: (this: HTMLInputElement) => void;
	blur?: (this: HTMLInputElement) => void;
	show?: (this: BrowserSearchHistoryShape, input: HTMLInputElement) => void;
	hide?: (this: BrowserSearchHistoryShape) => void;
}

export const BrowserSearchHistory: BrowserSearchHistoryShape = {
	histories: [],
	input: null,
	outsideHandler: null
};

BrowserSearchHistory.initialize = function (this: BrowserSearchHistoryShape) {
	const browser = getBrowserInstance();
	if (!browser) return;
	const initialize = browser.initialize;
	browser.initialize = function () {
		initialize?.call(this);
		BrowserSearchHistory.bind!(this.searcher!);
	};
};

BrowserSearchHistory.bind = function (this: BrowserSearchHistoryShape, searcher: HTMLElement) {
	const input = this.getInput!(searcher);
	if (!input || input === this.input) return;
	this.input = input;
	input.addEventListener('focus', this.focus!);
	input.addEventListener('blur', this.blur!);
};

BrowserSearchHistory.getInput = function (this: BrowserSearchHistoryShape, searcher: HTMLElement) {
	if (!searcher) return null;
	return (
		searcher.querySelector?.('.text-box-input') ?? searcher.querySelector?.('input') ?? searcher
	);
};

BrowserSearchHistory.getLimit = function (this: BrowserSearchHistoryShape) {
	const config =
		typeof SettingConfig !== 'undefined'
			? SettingConfig.config?.other?.browserSearchHistoryLimit
			: 9;
	const limit = Math.floor(Number(config));
	return Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 9) : 9;
};

BrowserSearchHistory.add = function (this: BrowserSearchHistoryShape, keyword: string) {
	if (!keyword) return;
	const k = keyword.trim();
	if (!k) return;
	const idx = this.histories.indexOf(k);
	if (idx !== -1) this.histories.splice(idx, 1);
	this.histories.unshift(k);
	if (this.histories.length > 9) this.histories.length = 9;
};

BrowserSearchHistory.remove = function (this: BrowserSearchHistoryShape, keyword: string) {
	const idx = this.histories.indexOf(keyword);
	if (idx !== -1) this.histories.splice(idx, 1);
};

BrowserSearchHistory.focus = function (this: HTMLInputElement) {
	BrowserSearchHistory.show!(this);
};

BrowserSearchHistory.blur = function (this: HTMLInputElement) {
	BrowserSearchHistory.add!(this.value);
	setTimeout(() => {
		BrowserSearchHistory.hide!();
	}, 150);
};

BrowserSearchHistory.show = function (this: BrowserSearchHistoryShape, input: HTMLInputElement) {
	dropdown?.show(input);
};

BrowserSearchHistory.hide = function (this: BrowserSearchHistoryShape) {
	dropdown?.hide();
};

export function initBrowserSearchHistory(): void {
	BrowserSearchHistory.initialize!();
}
