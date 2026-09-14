import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * R2b 模块侧选项名：`localizedItems` / `applyLocalizedItems`。
 * 关键行为——**语言切换（`localizationchange` 事件）时要重新应用**，否则名字会停在旧语言。
 */
const t = vi.fn((key: string) => `T:${key}`);
const language = { value: 'zh-CN' };

vi.mock('@app/i18n', () => ({
	getYamiI18n: () => ({
		global: {
			get t() {
				return t;
			},
			get locale() {
				return language.value;
			}
		}
	})
}));

const { applyLocalizedItems, localizedItems } = await import('../localized-items');

describe('localized-items（R2b 模块侧选项名）', () => {
	beforeEach(() => {
		t.mockClear();
		t.mockImplementation((key: string) => `T:${key}`);
	});

	it('localizedItems：按约定取 name/tip，值与顺序保持传入顺序', () => {
		const items = localizedItems('easing-mode', [2, 5]);
		expect(items).toEqual([
			{ name: 'T:components.easing-mode.options.2.name', tip: 'T:components.easing-mode.options.2.tip', value: 2 },
			{ name: 'T:components.easing-mode.options.5.name', tip: 'T:components.easing-mode.options.5.tip', value: 5 }
		]);
	});

	it('applyLocalizedItems：立即应用一次', () => {
		const apply = vi.fn();
		applyLocalizedItems('easing-mode', [2], apply);
		expect(apply).toHaveBeenCalledTimes(1);
	});

	it('applyLocalizedItems：语言切换（localizationchange）后重新应用', () => {
		const apply = vi.fn();
		applyLocalizedItems('easing-mode', [2], apply);
		window.dispatchEvent(new Event('localizationchange'));
		window.dispatchEvent(new Event('localizationchange'));
		expect(apply).toHaveBeenCalledTimes(3);
	});

	it('applyLocalizedItems：切换语言后取到的名字随之变化（同一值拿到新文案）', () => {
		const seen: string[] = [];
		applyLocalizedItems('easing-mode', [2], (items) => seen.push(items[0].name));
		language.value = 'en-US';
		t.mockImplementation((key: string) => `EN:${key}`);
		window.dispatchEvent(new Event('localizationchange'));
		expect(seen[0].startsWith('T:')).toBe(true);
		expect(seen[1].startsWith('EN:')).toBe(true);
	});

	it('applyLocalizedItems：返回的取消订阅函数能摘掉监听', () => {
		const apply = vi.fn();
		const dispose = applyLocalizedItems('easing-mode', [2], apply);
		dispose();
		window.dispatchEvent(new Event('localizationchange'));
		expect(apply).toHaveBeenCalledTimes(1);
	});
});
