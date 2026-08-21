import { beforeEach, describe, expect, it } from 'vitest';
import { usePointerObjectWindow } from '@app/composables/usePointerObjectWindow';

const getRegion = (): HTMLElement => document.getElementById('cursor-region') as HTMLElement;

describe('usePointerObjectWindow（指针样式控制器 composable：region + open/close）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		const region = document.createElement('div');
		region.id = 'cursor-region';
		document.body.appendChild(region);
	});

	it('open 为指针区域添加 className', () => {
		usePointerObjectWindow().open('cursor-grab');
		expect(getRegion().classList.contains('cursor-grab')).toBe(true);
	});

	it('close 移除 className', () => {
		const cursor = usePointerObjectWindow();
		cursor.open('cursor-grab');
		cursor.close('cursor-grab');
		expect(getRegion().classList.contains('cursor-grab')).toBe(false);
	});

	it('region getter 指向 #cursor-region 元素', () => {
		expect(usePointerObjectWindow().region).toBe(getRegion());
	});

	it('Cursor 单例 open/close 与 composable 一致', async () => {
		const { Cursor } = await import('@app/composables/usePointerObjectWindow');
		Cursor.open('cursor-wait');
		expect(getRegion().classList.contains('cursor-wait')).toBe(true);
		Cursor.close('cursor-wait');
		expect(getRegion().classList.contains('cursor-wait')).toBe(false);
	});
});
