import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { getConfirmationStore } from '@app/stores/confirmation';
import { Window } from '@/tools/window-object';

describe('useConfirmationStore（确认窗口状态桥接）', () => {
	it('初始状态默认值', () => {
		const store = getConfirmationStore();
		expect(store.open).toBe(false);
		expect(store.message).toBe('');
		expect(store.items).toEqual([]);
		expect(store.closeCallback).toBe(null);
	});

	it('confirm 设置状态并打开窗口', async () => {
		const store = getConfirmationStore();
		const open = vi.fn();
		Window.open = open;
		store.confirm({ message: '确认删除？' }, [{ label: '确定', click: () => undefined }]);
		expect(store.open).toBe(true);
		expect(store.message).toBe('确认删除？');
		expect(store.items).toHaveLength(1);
		expect(store.items[0].label).toBe('确定');
		await nextTick();
		expect(open).toHaveBeenCalledWith('confirmation');
		store.clear();
		Window.open = null;
	});

	it('按钮点击触发对应 click 并关闭窗口', () => {
		const store = getConfirmationStore();
		const close = vi.fn();
		const click = vi.fn();
		Window.close = close;
		store.confirm({}, [
			{ label: '确定', click },
			{ label: '取消', click: () => undefined }
		]);
		store.confirmButton(0);
		expect(close).toHaveBeenCalledWith('confirmation');
		expect(click).toHaveBeenCalledTimes(1);
		store.clear();
		Window.close = null;
	});

	it('clear 触发 closeCallback 并清空状态', () => {
		const store = getConfirmationStore();
		const closeCallback = vi.fn();
		store.confirm({ message: '测试', close: closeCallback }, [{ label: '确定' }]);
		store.clear();
		expect(closeCallback).toHaveBeenCalledTimes(1);
		expect(store.open).toBe(false);
		expect(store.message).toBe('');
		expect(store.items).toHaveLength(0);
		expect(store.closeCallback).toBe(null);
	});

	it('无 item 时 items 为空且按钮点击不报错', () => {
		const store = getConfirmationStore();
		store.confirm({ message: '测试' }, []);
		expect(store.items).toHaveLength(0);
		expect(store.confirmButton(0)).toBeUndefined();
		store.clear();
	});
});
