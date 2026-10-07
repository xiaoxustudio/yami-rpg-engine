import { describe, expect, it } from 'vitest';

import { uiEventsMembers } from '@app/engine/ui/ui-events.ts';
import { getUIStore } from '@app/stores/ui';
import type { UIShape } from '@app/engine/ui/ui-singleton.ts';

describe('UI 配色落盘：遗留影子副本缺失时以 store 为准', () => {
	it('saveToConfig 不抛 undefined.hex，并按 store 的颜色写回 config', () => {
		const store = getUIStore();
		try {
			store.loadFromConfig({
				colors: { uiBackground: '1e1e1eff', uiForeground: 'ffffffff' }
			});

			const legacyWithoutColors = {} as UIShape;
			const config: { colors: Record<string, string> } = { colors: {} };

			expect(
				() => uiEventsMembers.saveToConfig!.call(legacyWithoutColors, config),
				'遗留影子副本缺失时不得抛 Cannot read properties of undefined (reading hex)'
			).not.toThrow();

			expect(config.colors.uiBackground, '应落盘 store 的背景色').toBe('1e1e1eff');
			expect(config.colors.uiForeground, '应落盘 store 的前景色').toBe('ffffffff');
		} finally {
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		}
	});

	it('store 副本与遗留副本都在时，以 store 为准（用户改色只写 store）', () => {
		const store = getUIStore();
		try {
			store.loadFromConfig({
				colors: { uiBackground: '112233ff', uiForeground: '445566ff' }
			});

			const staleLegacy = {
				background: { hex: '00000000' },
				foreground: { hex: '000000ff' }
			} as unknown as UIShape;
			const config: { colors: Record<string, string> } = { colors: {} };

			uiEventsMembers.saveToConfig!.call(staleLegacy, config);

			expect(config.colors.uiBackground, 'store 才是真源').toBe('112233ff');
			expect(config.colors.uiForeground, 'store 才是真源').toBe('445566ff');
		} finally {
			store.loadFromConfig({
				colors: { uiBackground: '00000000', uiForeground: '000000ff' }
			});
		}
	});
});

describe('UI 配色读取：遗留副本按 safeHex 归一化（与 store 同一份规则）', () => {
	it('6 位 hex 补成不透明，不留 NaN alpha', () => {
		const legacy = {} as UIShape;

		uiEventsMembers.loadFromConfig!.call(legacy, {
			colors: { uiBackground: '1e1e1e', uiForeground: 'ffffffff' }
		});

		expect(legacy.background.hex, '6 位应补成 8 位').toBe('1e1e1eff');
		expect(
			Number.isNaN(legacy.background.alpha),
			`alpha 不能是 NaN（6 位 hex 曾让 slice(6,8) 解析失败），实得 ${legacy.background.alpha}`
		).toBe(false);
		expect(legacy.background.alpha, '6 位应视为完全不透明').toBe(1);
		expect(legacy.foreground.hex, '8 位原样').toBe('ffffffff');
	});

	it('畸形/非字符串值退回 fallback，而不是把 NaN 交给 WebGL', () => {
		const legacy = {} as UIShape;

		uiEventsMembers.loadFromConfig!.call(legacy, {
			colors: { uiBackground: 'not-a-color', uiForeground: 12345 }
		});

		expect(legacy.background.hex, '非 hex 应回退').toBe('00000000');
		expect(legacy.foreground.hex, '非字符串应回退').toBe('000000ff');
		expect(Number.isNaN(legacy.background.alpha)).toBe(false);
		expect(Number.isNaN(legacy.foreground.alpha)).toBe(false);
	});
});
