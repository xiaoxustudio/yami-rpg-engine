import { setTooltip } from '@app/utils/element-utils';
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

/**
 * `save 别名 → 条目` 索引。tip 里写作 `"#deviation"` 时，正文取自这里。
 *
 * 🔴 它**不能**只在扫描循环中途存在：R2b 把 tip 的承载者换成模板 `v-tip` 之后，
 * `parseLocalTip` 的调用点位于扫描循环**之外**（指令 `mounted` / `updated`），
 * 而别名持有者（`particleLayer-anchor-x-1`，`save: "deviation"`）可能已被
 * 模板承担而**不在扫描面内**。若索引只在循环里累积、循环末尾清空，
 * 语言表里 19 条 `"#deviation"` tooltip 会静默丢掉正文，只剩一行加粗标题。
 *
 * ⇒ 由 `localizeDomComponents` 在扫描**之前**按全表（含被跳过的键）建立并保留。
 * 回归用例：`__tests__/save-alias.spec.ts`。
 */
let saveItems: Record<string, LocalComponentItem> = {};

export function setLocalElement(element: HTMLElement, item: LocalComponentItem): void {
	if (item.save !== undefined) {
		saveItems[item.save] = item;
	}
	if (item.content !== undefined) {
		element.textContent = item.content;
	}
	if (item.title !== undefined) {
		if (element.classList.contains('window-frame')) {
			if (typeof element.setTitle === 'function') {
				element.setTitle(item.title);
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
			element.setPlaceholder(item.placeholder);
		}
	}
	if (item.options !== undefined) {
		if (element.classList.contains('select-box')) {
			element.setItemNames(item.options);
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
	// R2b 迁移②：模板已承担的键（t()/v-tip）跳过 DOM 查询，扫描面 2130 → ~200
	const entries = Object.entries(components ?? {});

	// `#别名` 索引按**全表**建立——包括下面会被跳过的键。
	// 原因：`v-tip` 指令在扫描循环之外调用 `parseLocalTip`，
	// 而别名持有者本身可能已被模板承担（`particleLayer-anchor-x-1` 就是这种）。
	// 该表**跨调用保留**（不再在末尾清空），否则指令侧解析不到。
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
	// 注意：**不要**在这里 `saveItems = {}`——见函数开头的注释与 `save-alias.spec.ts`
}
