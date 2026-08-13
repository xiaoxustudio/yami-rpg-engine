import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Home } from '@/title/home-page.ts';
import { Layout } from '@/layout/layout.ts';

describe('Home.initialize（Layout 时序判空回归：11.32/11.32b）', () => {
	const originalWindowResize = Home.windowResize;
	const originalWindowLocalize = Home.windowLocalize;

	beforeEach(() => {
		Layout.manager = null;
		Home.state = null;
		Home.windowResize = vi.fn();
		Home.windowLocalize = vi.fn();
	});

	afterEach(() => {
		Layout.manager = null;
		Home.state = null;
		Home.windowResize = originalWindowResize;
		Home.windowLocalize = originalWindowLocalize;
	});

	it('dependsOn 声明为 Layout，防止误删导致时序回归', () => {
		expect(Home.dependsOn).toEqual(['Layout']);
	});

	it('Layout.manager 为 null 时 initialize 不崩溃（?. 判空），state 为 closed', () => {
		expect(() => Home.initialize!()).not.toThrow();
		expect(Home.state).toBe('closed');
	});

	it('manager.index 为 home 时 state 为 open，否则为 closed', () => {
		Layout.manager = { index: 'home', on: vi.fn() };
		Home.initialize!();
		expect(Home.state).toBe('open');

		Layout.manager = { index: 'scene', on: vi.fn() };
		Home.initialize!();
		expect(Home.state).toBe('closed');
	});

	it('注册 switch 监听，触发后按 value 更新 state', () => {
		const on = vi.fn();
		Layout.manager = { index: 'scene', on };
		Home.initialize!();
		const handler = on.mock.calls[0][1] as (event: { value: string | null }) => void;
		handler({ value: 'home' });
		expect(Home.state).toBe('open');
		handler({ value: 'scene' });
		expect(Home.state).toBe('closed');
		handler({ value: null });
		expect(Home.state).toBe('closed');
	});

	it('注册 window resize/localize 监听并转发到 Home 处理器', () => {
		const windowResize = vi.fn();
		const windowLocalize = vi.fn();
		Home.windowResize = windowResize;
		Home.windowLocalize = windowLocalize;
		Layout.manager = null;
		Home.initialize!();
		window.dispatchEvent(new Event('resize'));
		expect(windowResize).toHaveBeenCalledTimes(1);
		window.dispatchEvent(new Event('localize'));
		expect(windowLocalize).toHaveBeenCalledTimes(1);
	});
});
