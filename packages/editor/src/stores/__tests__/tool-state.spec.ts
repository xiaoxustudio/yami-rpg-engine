import { describe, expect, it } from 'vitest';
import { getToolStore } from '@app/stores/tool';
import { registerTool, getToolInstance } from '@/tools/tool-registry';
import { ShortcutRegistry } from '@/tools/shortcut-registry';

describe('useToolStore（工具/快捷键注册表）', () => {
	it('注册后可读取', () => {
		const store = getToolStore();
		const tool = { open: () => undefined };
		store.registerTool('StoreTool', tool);
		expect(store.getToolInstance('StoreTool')).toBe(tool);
	});

	it('未注册返回 undefined', () => {
		const store = getToolStore();
		expect(store.getToolInstance('NoSuchStoreTool')).toBeUndefined();
	});

	it('重复注册覆盖旧实例', () => {
		const store = getToolStore();
		const first = { open: () => undefined };
		const second = { open: () => undefined };
		store.registerTool('StoreOverwriteTool', first);
		store.registerTool('StoreOverwriteTool', second);
		expect(store.getToolInstance('StoreOverwriteTool')).toBe(second);
	});

	it('legacy 转发层与 store 同源', () => {
		const store = getToolStore();
		const tool = { close: () => undefined };
		registerTool('BridgeTool', tool);
		expect(getToolInstance('BridgeTool')).toBe(tool);
		expect(store.getToolInstance('BridgeTool')).toBe(tool);
	});

	it('快捷键注册后读取', () => {
		const store = getToolStore();
		const handler = () => true;
		store.registerShortcut('test-shortcut', handler);
		expect(store.getShortcut('test-shortcut')).toBe(handler);
	});

	it('legacy ShortcutRegistry 与 store 同源', () => {
		const store = getToolStore();
		const handler = () => false;
		ShortcutRegistry.register('bridge-shortcut', handler);
		expect(ShortcutRegistry.get('bridge-shortcut')).toBe(handler);
		expect(store.getShortcut('bridge-shortcut')).toBe(handler);
	});

	it('openTool 记录 activeTool', () => {
		const store = getToolStore();
		const tool = { open: () => undefined, close: () => undefined };
		store.registerTool('ActiveTestTool', tool);
		store.openTool('ActiveTestTool');
		expect(store.activeTool).toBe('ActiveTestTool');
		store.closeTool('ActiveTestTool');
		expect(store.activeTool).toBe(null);
	});
});
