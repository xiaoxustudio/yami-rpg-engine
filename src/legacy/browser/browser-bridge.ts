import { $ } from '@/util/dom.ts';

Object.defineProperty(window, 'Browser', {
	get() {
		return $('#project-browser');
	},
	configurable: true
});

Object.defineProperty(window, 'Selector', {
	get() {
		return $('#selector-browser');
	},
	configurable: true
});
