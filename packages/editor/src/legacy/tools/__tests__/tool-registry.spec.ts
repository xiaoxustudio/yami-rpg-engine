import { describe, expect, it } from 'vitest';
import { getToolInstance, registerTool } from '@app/legacy/tools/tool-registry';

describe('tool-registry（工具实例注册表）', () => {
	it('注册后可读取', () => {
		const tool = { open: () => undefined };
		registerTool('RegistryTestTool', tool);
		expect(getToolInstance('RegistryTestTool')).toBe(tool);
	});

	it('未注册返回 undefined', () => {
		expect(getToolInstance('NoSuchRegistryTool')).toBeUndefined();
	});

	it('重复注册覆盖旧实例', () => {
		const first = { open: () => undefined };
		const second = { open: () => undefined };
		registerTool('RegistryOverwriteTool', first);
		registerTool('RegistryOverwriteTool', second);
		expect(getToolInstance('RegistryOverwriteTool')).toBe(second);
	});
});
