import { describe, expect, it } from 'vitest';
import { localizeDomComponents, parseLocalTip } from '../dom-localizer';
import { templateLocalizedKeys } from '../template-localized';

const DEVIATION_TIP = '$Deviation\nGenerates a random value';

const fullTable = {
	'particleLayer-anchor-x-1': { tip: DEVIATION_TIP, save: 'deviation' },
	'particleLayer-anchor-y-1': { tip: '#deviation' }
};

describe('本地化的 save 别名（#name）', () => {
	it('扫描结束后仍能解析 #别名（v-tip 在扫描之外调用 parseLocalTip）', () => {
		localizeDomComponents(fullTable);

		expect(parseLocalTip('#deviation', 'Dev')).toBe(
			'<b>Dev</b>\n<b>Deviation</b>\nGenerates a random value'
		);
	});

	it('别名持有者已被模板承担（不在扫描面内）时，索引仍按全表建立', () => {
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
