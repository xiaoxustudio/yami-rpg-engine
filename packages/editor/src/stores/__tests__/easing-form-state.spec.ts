import { beforeEach, describe, expect, it } from 'vitest';
import { isReactive } from 'vue';
import { getEasingFormStore } from '@app/stores/easing-form';
import {
	useEasingWindow,
	clampEasingPointX,
	clampEasingPointY
} from '@app/composables/useEasingWindow.ts';

// 回归：缓动编辑器表单从 `composables/useEasingWindow.ts:31` 的模块级 `reactive` 升进
// `stores/easing-form.ts`。门面 `useEasingWindow()` 必须返回**同一个** reactive 对象，
// 否则 `Easing.vue:103` / `EasingPointsSection.vue:238` 与单例 6 处就地改值会失去响应性。

const resetForm = (): void => {
	const { form } = getEasingFormStore();
	form.points = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
	form.mode = 2;
	form.preview = { reverse: true, duration: 400, delay: 400 };
	form.scale = 1;
};

describe('useEasingWindow().form → stores/easingForm', () => {
	beforeEach(() => {
		resetForm();
	});

	it('返回的是 store 里那个 form（同一引用，不是副本）', () => {
		expect(useEasingWindow().form).toBe(getEasingFormStore().form);
		expect(isReactive(useEasingWindow().form)).toBe(true);
	});

	it('经门面就地改值能被 store 看见（单例 6 处改值靠这条）', () => {
		const { form } = useEasingWindow();
		form.points[2].x = 0.75;
		form.preview.duration = 250;
		form.scale = 2;

		const stored = getEasingFormStore().form;
		expect(stored.points[2].x).toBe(0.75);
		expect(stored.preview.duration).toBe(250);
		expect(stored.scale).toBe(2);
	});

	it('初始形状与迁移前一致（8 个点 / mode 2 / preview / scale）', () => {
		const { form } = getEasingFormStore();
		expect(form.points).toHaveLength(8);
		expect(form.mode).toBe(2);
		expect(form.preview).toEqual({ reverse: true, duration: 400, delay: 400 });
		expect(form.scale).toBe(1);
	});

	it('clamp 工具仍在本文件导出（调用方 import 不变）', () => {
		expect(clampEasingPointX(2)).toBe(1);
		expect(clampEasingPointX(-1)).toBe(0);
		expect(clampEasingPointY(9)).toBe(5);
	});
});
