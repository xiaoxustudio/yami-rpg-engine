import { describe, expect, it } from 'vitest';
import { getListConfig } from '../list-config';

describe('getListConfig 注册表', () => {
	it('首次调用创建配置并共享 el 上的 creators 数组', () => {
		const el = { creators: [] as unknown[] };
		const config = getListConfig(el);
		expect(config.creators).toBe(el.creators);
	});

	it('二次调用返回同一配置对象', () => {
		const el = {};
		const first = getListConfig(el);
		const second = getListConfig(el);
		expect(second).toBe(first);
	});

	it('代理字段双向同步', () => {
		const el = {};
		const config = getListConfig(el);
		config.removable = true;
		expect((el as { removable?: boolean }).removable).toBe(true);
		(el as { renamable?: boolean }).renamable = true;
		expect(getListConfig(el).renamable).toBe(true);
	});

	it('push 生效且二次读取仍可见', () => {
		const el = {};
		const fn = () => {};
		getListConfig(el).creators.push(fn);
		expect((el as { creators?: unknown[] }).creators).toContain(fn);
		expect(getListConfig(el).creators).toContain(fn);
	});
});
