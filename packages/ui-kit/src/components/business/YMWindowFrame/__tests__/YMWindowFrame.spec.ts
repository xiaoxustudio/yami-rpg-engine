import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMWindowFrame from '../YMWindowFrame.vue';

const mockWindow = (): {
	frames: {
		append(el: HTMLElement): boolean;
		remove(el: HTMLElement): boolean;
		length: number;
		includes(el: HTMLElement): boolean;
	};
	ambient: { update(): void };
	positionMode: string;
} => {
	const frames: HTMLElement[] = [];
	const W = {
		frames: {
			append: (el: HTMLElement) => {
				if (!frames.includes(el)) {
					frames.push(el);
					return true;
				}
				return false;
			},
			remove: (el: HTMLElement) => {
				const index = frames.indexOf(el);
				if (index !== -1) {
					frames.splice(index, 1);
					return true;
				}
				return false;
			},
			length: 0,
			includes: (el: HTMLElement) => frames.includes(el)
		},
		ambient: { update: () => {} },
		positionMode: 'center'
	};
	Object.defineProperty(W.frames, 'length', { get: () => frames.length });
	(window as unknown as { Window?: unknown }).Window = W;
	return W;
};

interface WindowFrameElement extends HTMLElement {
	[k: string]: unknown;
	open: () => void;
	close: () => boolean;
	maximize: () => void;
	unmaximize: () => void;
	focus: () => void;
	blur: () => void;
	setTitle: (title: string) => void;
	setPosition: () => void;
	on: (name: string, cb: (e: unknown) => void) => void;
}

describe('YMWindowFrame', () => {
	it('mounts with slot and exposes api', () => {
		const wrapper = mount(YMWindowFrame, {
			slots: { default: '<div class="content">X</div>' }
		});
		expect(wrapper.element.classList.contains('window-frame')).toBe(true);
		expect(wrapper.element.querySelector('.content')).toBeTruthy();
		const el = wrapper.element as unknown as WindowFrameElement;
		for (const name of [
			'open',
			'close',
			'maximize',
			'unmaximize',
			'focus',
			'blur',
			'setTitle',
			'on'
		]) {
			expect(typeof el[name], name).toBe('function');
		}
		expect(typeof el.setPosition).toBe('function');
	});

	it('renders confirm/cancel buttons by default', () => {
		const wrapper = mount(YMWindowFrame, {
			props: { id: 'testWin' },
			slots: { default: '<div>X</div>' }
		});
		const buttons = wrapper.element.querySelectorAll('button');
		expect(buttons.length).toBe(2);
		expect(buttons[0].id).toBe('testWin-confirm');
		expect(buttons[0].getAttribute('name')).toBe('confirm');
		expect(buttons[1].id).toBe('testWin-cancel');
	});

	it('renders apply button when showApply', () => {
		const wrapper = mount(YMWindowFrame, {
			props: { id: 'w', showApply: true }
		});
		const buttons = wrapper.element.querySelectorAll('button');
		expect(buttons.length).toBe(3);
		expect(wrapper.element.querySelector('#w-apply')).toBeTruthy();
	});

	it('supports buttonsIdPrefix override', () => {
		const wrapper = mount(YMWindowFrame, {
			props: { id: 'win', buttonsIdPrefix: 'prefix' }
		});
		expect(wrapper.element.querySelector('#prefix-confirm')).toBeTruthy();
		expect(wrapper.element.querySelector('#win-confirm')).toBeNull();
	});

	it('omits buttons when noButtons', () => {
		const wrapper = mount(YMWindowFrame, {
			props: { id: 'w', noButtons: true }
		});
		expect(wrapper.element.querySelectorAll('button').length).toBe(0);
	});

	it('passes confirmDisabled through to button[name=confirm]', async () => {
		const wrapper = mount(YMWindowFrame, {
			props: { id: 'w' }
		});
		const confirm = wrapper.element.querySelector(
			'button[name="confirm"]'
		) as HTMLButtonElement;
		expect(confirm.disabled).toBe(false);
		await wrapper.setProps({ confirmDisabled: true });
		expect(confirm.disabled).toBe(true);
		expect(
			(wrapper.element.querySelector('button[name="cancel"]') as HTMLButtonElement).disabled
		).toBe(false);
		wrapper.unmount();
	});

	it('open adds open class and dispatches open event', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as unknown as WindowFrameElement;
		let opened = false;
		el.addEventListener('open', () => (opened = true));
		el.open();
		expect(el.classList.contains('open')).toBe(true);
		expect(opened).toBe(true);
		expect(W.frames.includes(el)).toBe(true);
		expect(el.style.zIndex).toBe('1');
		el.close();
	});

	it('close removes open class and dispatches closed when enabled', () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as unknown as WindowFrameElement;
		el.open();
		let closed = false;
		el.on('closed', () => (closed = true));
		const result = el.close();
		expect(result).toBe(true);
		expect(el.classList.contains('open')).toBe(false);
		expect(closed).toBe(true);
	});

	it('把元素上的 confirm 事件桥接成 Vue emit（回归：原先只有 cancel 被桥接）', () => {
		// 背景：`YMFormButtons` 用 `dispatch()` 在按钮上派发**冒泡的原生** `confirm`/`cancel`
		// 事件（见该组件 @click="dispatch('confirm', $event)"）。原先 YMWindowFrame 只把
		// `cancel` 桥接成 emit（`element.addEventListener('cancel', () => close())`），
		// 而 `confirm` 从未桥接 —— 于是所有在**外层包装组件**里写
		// `frame.value.root.addEventListener('confirm', () => emit('confirm'))` 的窗口
		// （YMZoom / YMFont / YMRename / YMSetKey / YMSetQuantity / YMRequestKeyValue /
		// YMArrayListString / YMArrayListNumber 等 12 处）**永远不会触发**，
		// 表现为"点确定没反应"。这条用例把该行为锁死。
		mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const confirm = wrapper.element.querySelector(
			'button[name="confirm"]'
		) as HTMLButtonElement;
		confirm.click();
		expect(wrapper.emitted('confirm')).toHaveLength(1);
	});

	it('close can be cancelled by close event', () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as unknown as WindowFrameElement;
		el.open();
		el.addEventListener('close', (e: Event) => e.preventDefault());
		const result = el.close();
		expect(result).toBe(false);
		expect(el.classList.contains('open')).toBe(true);
	});

	it('maximize and unmaximize toggle class and events', () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as unknown as WindowFrameElement;
		el.open();
		let maximized = 0;
		let unmaximized = 0;
		el.on('maximize', () => maximized++);
		el.on('unmaximize', () => unmaximized++);
		el.maximize();
		expect(el.classList.contains('maximized')).toBe(true);
		expect(maximized).toBe(1);
		el.unmaximize();
		expect(el.classList.contains('maximized')).toBe(false);
		expect(unmaximized).toBe(1);
	});

	/**
	 * `resize` 监听是**状态相关**的：只有 `on('resize')` 订阅过、且窗口被最大化时才挂在 window 上
	 * （原实现在 open / maximize 里挂、close / unmaximize 里摘，四处手工配对）。
	 *
	 * 这条从**行为**上证明整条 `enabled` 通道：最大化后 window 的 resize 能透传成元素上的
	 * resize 事件；取消最大化后不再透传。只断言"卸载时摘了"是不够的 ——
	 * `useEventListener` 卸载时无条件调 `removeEventListener`，那证不了挂载真的发生过。
	 */
	it('resize 监听随最大化挂 / 摘（useEventListener 的 enabled 通道）', async () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as unknown as WindowFrameElement;
		el.open();
		let resized = 0;
		el.on('resize', () => resized++);

		el.maximize();
		await nextTick();
		// maximize 自己会先在元素上派发一次 resize，所以基线是 1（不是 0）
		expect(resized).toBe(1);
		window.dispatchEvent(new Event('resize'));
		// 能涨 ⇒ window 上的监听确实挂上了
		expect(resized).toBe(2);

		el.unmaximize();
		await nextTick();
		// unmaximize 自己同样会派发一次 resize，故记下当时的基线再比
		const afterUnmaximize = resized;
		window.dispatchEvent(new Event('resize'));
		// 不再涨 ⇒ 已摘
		expect(resized).toBe(afterUnmaximize);
	});

	it('blur and focus manage focusable tabindex', () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, {
			attachTo: document.body,
			props: { focusableSelector: 'input' },
			slots: {
				default: '<div class="content"><input class="f1" type="text"></div>'
			}
		});
		const el = wrapper.element as unknown as WindowFrameElement;
		const input = el.querySelector('input') as HTMLInputElement;
		const original = input.tabIndex;
		el.blur();
		expect(el.classList.contains('blur')).toBe(true);
		expect(input.tabIndex).toBe(original - 1);
		el.focus();
		expect(el.classList.contains('blur')).toBe(false);
		expect(input.tabIndex).toBe(original);
	});

	it('setTitle replaces first text node of title bar', () => {
		const _W = mockWindow();
		const wrapper = mount(YMWindowFrame, {
			attachTo: document.body,
			slots: {
				title: '<div class="title-bar">Original<div class="close" /></div>'
			}
		});
		const el = wrapper.element as unknown as WindowFrameElement;
		el.setTitle('New Title');
		expect(wrapper.element.querySelector('.title-bar').textContent).toContain('New Title');
	});

	it('applies localization via localize adapter', () => {
		const _W = mockWindow();
		const applied: [string, unknown][] = [];
		const localize = {
			components: { testWindow: { text: 'Localized' } },
			setElement: (el: Element, item: unknown) => applied.push([el.id, item])
		};
		mount(YMWindowFrame, {
			attachTo: document.body,
			props: { localize },
			attrs: { id: 'testWindow' }
		});
		expect(applied.length).toBe(1);
		expect(applied[0][0]).toBe('testWindow');
	});
});
