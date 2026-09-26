import { describe, expect, it } from 'vitest';
import { localizeDomComponents, parseLocalTip } from '../dom-localizer';
import { templateLocalizedKeys } from '../template-localized';

/**
 * `#<save 别名>` 的解析链路（静默回归）。
 *
 * 背景：语言表里 19 条 tip 写的是 `"#deviation"`——它不是文案，而是指向
 * **另一个条目的 `save` 别名**（唯一持有者是 `particleLayer-anchor-x-1`，
 * `save: "deviation"`）。解析由 `parseLocalTip` 经模块级 `saveItems` 完成。
 *
 * tip 的承载者是模板 `v-tip="t('…tip')"`，`parseLocalTip` 的调用点因此
 * **位于扫描循环之外**（指令 `mounted` / `updated`）。若 `saveItems` 仍
 * 在循环末尾被清空 ⇒ 这 19 条 tooltip **静默丢掉正文**，只剩一行加粗标题。
 * 测试套件全绿，界面却坏了。
 *
 * 不变量：**`#别名` 的解析不得依赖 `parseLocalTip` 的调用时机，也不得依赖
 * 别名持有者是否仍在扫描面内。**
 */
const DEVIATION_TIP = '$Deviation\nGenerates a random value';

/** 生产形态：本地化器每次都拿到**整张**语言表 */
const fullTable = {
	'particleLayer-anchor-x-1': { tip: DEVIATION_TIP, save: 'deviation' },
	'particleLayer-anchor-y-1': { tip: '#deviation' }
};

describe('本地化的 save 别名（#name）', () => {
	it('扫描结束后仍能解析 #别名（v-tip 在扫描之外调用 parseLocalTip）', () => {
		localizeDomComponents(fullTable);

		// 真实调用形态：title 取前一个兄弟元素文本（各表单里那一格标签）
		expect(parseLocalTip('#deviation', 'Dev')).toBe(
			'<b>Dev</b>\n<b>Deviation</b>\nGenerates a random value'
		);
	});

	it('别名持有者已被模板承担（不在扫描面内）时，索引仍按全表建立', () => {
		// 取一个确实会被跳过的键，让它带 `save` —— 模拟"别名持有者已迁到模板"
		const skippedKey = [...templateLocalizedKeys][0];
		localizeDomComponents({ [skippedKey]: { tip: '$Shared note', save: 'shared-note' } });

		expect(parseLocalTip('#shared-note', 'T')).toBe('<b>T</b>\n<b>Shared note</b>');
	});

	it('未知别名退化为"只有标题"，不抛错（保持既有容错语义）', () => {
		localizeDomComponents({});
		expect(parseLocalTip('#no-such-alias', 'Title')).toBe('<b>Title</b>\n');
	});

	it('$ 开头的正文不前置标题（title 只服务于 save 展开）', () => {
		localizeDomComponents(fullTable);
		expect(parseLocalTip(DEVIATION_TIP, 'Dev')).toBe(
			'<b>Deviation</b>\nGenerates a random value'
		);
	});
});
