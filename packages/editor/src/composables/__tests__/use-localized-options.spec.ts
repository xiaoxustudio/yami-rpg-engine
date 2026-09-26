import { describe, expect, it } from 'vitest';
import { nextTick, ref } from 'vue';
import { applyLocaleData } from '@app/i18n';
import type { LocaleData } from '@app/i18n/convert';
import { useLocalizedOptions, type LocalizedOption } from '../useLocalizedOptions';

/**
 * 回归：`useLocalizedOptions` **脱离 setup 也要能用**。
 *
 * 背景（运行期真实报错）：`useI18n()` + `watchEffect` 的写法不可行 —— `useI18n()` 要求调用点处在
 * 组件 setup/生命周期里。偏偏调用点既可能在 `onMounted`、也可能在 **`localize` 事件回调**
 * （`SceneParallaxPage.vue` 等页面就是"监听 localize → 再调一次"）——后者没有组件实例，
 * 于是启动重放语言时直接抛
 * `SyntaxError: Must be called at the top of a setup function`，把 `Editor.initialize` 的后续步骤
 * （`initEditors` / `initTools`）一起打断。
 *
 * 实现走**全局 Composer**（`getYamiI18n().global`），本文件用三条用例把它钉住：
 *   ① 组件外调用不抛，且给出当前语言的选项名；
 *   ② 语言/语言表变化后**自动重建**（不需要 `localize` 事件、也不需要调用方手工刷新）；
 *   ③ `:ref` 挂载后补一次 `apply`（这正是"setup 顶层调用也能装上选项"的原因）。
 */
const localeData = (name: string): LocaleData =>
	({
		properties: {},
		components: { probe: { options: { a: { name, tip: `${name} tip` } } } }
	}) as unknown as LocaleData;

describe('useLocalizedOptions（脱离 setup 也能用）', () => {
	it('组件外调用不抛，并按当前语言给出选项名', () => {
		applyLocaleData('en-US', localeData('Alpha'));
		let items: Array<LocalizedOption<string>> = [];
		let stop: (() => void) | undefined;
		expect(() => {
			stop = useLocalizedOptions('probe', ['a'], (next) => (items = next));
		}).not.toThrow();
		expect(items).toEqual([{ name: 'Alpha', tip: 'Alpha tip', value: 'a' }]);
		stop?.();
	});

	it('语言表变化后自动重建（无需 localize 事件或调用方手工刷新）', async () => {
		applyLocaleData('en-US', localeData('Alpha'));
		let items: Array<LocalizedOption<string>> = [];
		const stop = useLocalizedOptions('probe', ['a'], (next) => (items = next));
		expect(items[0]?.name).toBe('Alpha');

		applyLocaleData('zh-CN', localeData('甲'));
		await nextTick();
		expect(items[0]?.name).toBe('甲');
		stop();
	});

	it('目标 ref 挂载后补一次 apply（setup 顶层调用同样能装上选项）', async () => {
		applyLocaleData('en-US', localeData('Alpha'));
		const target = ref<{ loadItems?: (items: unknown[]) => void } | null>(null);
		const loaded: unknown[][] = [];
		const stop = useLocalizedOptions('probe', ['a'], (items) =>
			target.value?.loadItems?.(items)
		);
		expect(loaded).toHaveLength(0);

		target.value = { loadItems: (items) => loaded.push(items) };
		await nextTick();
		expect(loaded).toHaveLength(1);
		stop();
	});
});
