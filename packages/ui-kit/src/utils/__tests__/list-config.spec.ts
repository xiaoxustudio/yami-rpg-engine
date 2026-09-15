import { describe, expect, it } from 'vitest';
import { getListConfig } from '../list-config';

/**
 * P4b：配置的存储从"元素上的访问器属性"搬到了元素数据（WeakMap）。
 * 因此本用例的契约也跟着变——**两个方向都必须经过 `getListConfig`**，
 * 元素本身不再留下任何 expando（这正是这次迁移的目的）。
 */
describe('getListConfig 注册表', () => {
	it('首次调用创建配置并共享 creators 数组', () => {
		const el = document.createElement('div');
		const config = getListConfig(el);
		expect(config.creators).toEqual([]);
		config.creators.push(() => undefined);
		expect(getListConfig(el).creators.length).toBe(1);
	});

	it('二次调用返回同一配置对象', () => {
		const el = {};
		const first = getListConfig(el);
		const second = getListConfig(el);
		expect(second).toBe(first);
	});

	it('代理字段双向同步（都经 getListConfig）', () => {
		const el = document.createElement('div');
		const config = getListConfig(el);
		config.removable = true;
		expect(getListConfig(el).removable).toBe(true);
		config.renamable = true;
		expect(getListConfig(el).renamable).toBe(true);
		config.renamable = undefined;
		expect(getListConfig(el).renamable).toBeUndefined();
	});

	it('不再往元素上写 expando（P4b 的目标）', () => {
		const el = document.createElement('div');
		const config = getListConfig(el);
		config.removable = true;
		config.foldable = true;
		config.padded = true;
		config.lockDirectory = true;
		expect((el as HTMLElement & { removable?: boolean }).removable).toBeUndefined();
		expect((el as HTMLElement & { foldable?: boolean }).foldable).toBeUndefined();
		expect((el as HTMLElement & { padded?: boolean }).padded).toBeUndefined();
		expect((el as HTMLElement & { lockDirectory?: boolean }).lockDirectory).toBeUndefined();
		// 反向：直接写元素也不再影响配置
		(el as HTMLElement & { togglable?: boolean }).togglable = true;
		expect(getListConfig(el).togglable).toBeUndefined();
	});

	it('push 生效且二次读取仍可见', () => {
		const el = {};
		const fn = () => {};
		getListConfig(el).creators.push(fn);
		expect(getListConfig(el).creators).toContain(fn);
	});
});
