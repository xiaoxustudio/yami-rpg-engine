import { setTooltip } from '@app/utils/element-utils';
import type { YamiElement } from '@app/types/element-api';
import { templateLocalizedKeys } from './template-localized.ts';

export interface LocalComponentItem {
	save?: string;
	content?: string;
	title?: string;
	label?: string;
	tip?: string;
	placeholder?: string;
	options?: string[];
}

const saveTagExp = /^#(\S+)$/;
const titleTagExp = /\$([\S ]+)(?=\n|$)/g;

let saveItems: Record<string, LocalComponentItem> = {};

export function setLocalElement(element: HTMLElement, item: LocalComponentItem): void {
	const target = element as YamiElement;
	if (item.save !== undefined) {
		saveItems[item.save] = item;
	}
	if (item.content !== undefined) {
		element.textContent = item.content;
	}
	if (item.title !== undefined) {
		if (element.classList.contains('window-frame')) {
			if (typeof target.setTitle === 'function') {
				target.setTitle(item.title);
			}
		}
	}
	if (item.label !== undefined) {
		const prev = element.previousElementSibling;
		if (prev instanceof HTMLElement) {
			prev.textContent = item.label;
		}
	}
	if (item.tip !== undefined) {
		setTooltip(element, parseLocalTip(item.tip, item.label ?? item.content ?? ''));
	}
	if (item.placeholder !== undefined) {
		if (element.classList.contains('text-box')) {
			target.setPlaceholder(item.placeholder);
		}
	}
	if (item.options !== undefined) {
		if (element.classList.contains('select-box')) {
			target.setItemNames(item.options);
		}
	}
}

export function parseLocalTip(tip: string, title: string): string {
	const match = saveTagExp.exec(tip);
	let string: string = match ? (saveItems[match[1]]?.tip ?? '') : tip;
	if (title && tip[0] !== '$') {
		string = `<b>${title}</b>\n${string}`;
	}
	return string.replace(titleTagExp, '<b>$1</b>');
}

export function localizeDomComponents(components: Record<string, LocalComponentItem>): void {
	const entries = Object.entries(components ?? {});

	saveItems = {};
	for (let i = 0; i < entries.length; i++) {
		const item = entries[i][1];
		if (item?.save !== undefined) saveItems[item.save] = item;
	}

	for (let i = 0; i < entries.length; i++) {
		const [key, item] = entries[i];
		if (templateLocalizedKeys.has(key)) continue;
		try {
			if (key[0] === '[') {
				if (key === '[comment]') continue;
				const elements =
					key[1] === '.'
						? document.getElementsByClassName(key.slice(2, -1))
						: document.getElementsByName(key.slice(1, -1));
				if (elements.length !== 0) {
					for (let j = 0; j < elements.length; j++) {
						setLocalElement(elements[j] as HTMLElement, item);
					}
				}
			} else {
				const element = document.getElementById(key);
				if (element !== null) {
					setLocalElement(element, item);
				}
			}
		} catch {}
	}
}
