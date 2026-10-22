import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import YMTitleBar from '../YMTitleBar.vue';

type FrameElement = HTMLElement & { maximize: () => void; unmaximize: () => void };

const makeFrame = (): FrameElement => {
	const frame = document.createElement('div') as unknown as FrameElement;
	frame.maximize = () => {};
	frame.unmaximize = () => {};
	frame.id = 'test-window';
	frame.classList.add('window-frame');
	Object.defineProperty(frame, 'getBoundingClientRect', {
		value: () => ({ left: 100, top: 50, width: 400, height: 300 }),
		configurable: true
	});
	return frame;
};

const makePointerEvent = (
	type: string,
	clientX: number,
	clientY: number,
	pointerId = 1,
	button = 0
): PointerEvent => {
	const event = new PointerEvent(type, {
		bubbles: true,
		clientX,
		clientY,
		pointerId,
		button
	});
	return event;
};

interface TitleBarElement extends HTMLElement {
	[k: string]: unknown;
	pointerdown: () => void;
	mouseclick: () => void;
	doubleclick: () => void;
	on: (name: string, cb: (e: unknown) => void) => void;
	dragging: unknown;
}

describe('YMTitleBar', () => {
	it('mounts with slot content and exposes api', () => {
		const wrapper = mount(YMTitleBar, {
			slots: { default: '<div class="close" />Title' }
		});
		expect(wrapper.element.classList.contains('title-bar')).toBe(true);
		expect(wrapper.element.querySelector('.close')).toBeTruthy();
		expect(wrapper.text()).toContain('Title');
		const el = wrapper.element as unknown as TitleBarElement;
		expect(typeof el.pointerdown).toBe('function');
		expect(typeof el.mouseclick).toBe('function');
		expect(typeof el.doubleclick).toBe('function');
		expect(typeof el.on).toBe('function');
		expect('dragging' in el).toBe(true);
	});

	it('pointerdown on empty area starts dragging and moves frame', async () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		el.dispatchEvent(makePointerEvent('pointerdown', 200, 100));
		expect(el.dragging).toBeTruthy();
		await nextTick();
		window.dispatchEvent(makePointerEvent('pointermove', 250, 130));
		expect(frame.style.left).toBe('150px');
		expect(frame.style.top).toBe('80px');
		window.dispatchEvent(makePointerEvent('pointerup', 250, 130));
		expect(el.dragging).toBe(null);
		frame.remove();
	});

	it('pointerdown ignores non-left button', () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		const event = makePointerEvent('pointerdown', 100, 100, 1, 2);
		el.dispatchEvent(event);
		expect(el.dragging).toBe(null);
		frame.remove();
	});

	it('click on close calls Window.close', () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		const closeBtn = document.createElement('div');
		closeBtn.classList.add('close');
		el.appendChild(closeBtn);
		let closed = null;
		const host: Window = window;
		host.Window = {
			close: (id: string) => (closed = id)
		};
		closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(closed).toBe('test-window');
		closeBtn.remove();
		frame.remove();
		delete host.Window;
	});

	it('click on maximize toggles frame maximized', () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		let maximized = 0;
		frame.maximize = () => maximized++;
		frame.unmaximize = () => maximized--;
		const maxBtn = document.createElement('div');
		maxBtn.classList.add('maximize');
		el.appendChild(maxBtn);
		maxBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(maximized).toBe(1);
		frame.classList.add('maximized');
		maxBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(maximized).toBe(0);
		maxBtn.remove();
		frame.remove();
	});

	it('拖拽中 window 失焦即取消，之后不再跟随移动', async () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		el.dispatchEvent(makePointerEvent('pointerdown', 200, 100));
		await nextTick();
		window.dispatchEvent(makePointerEvent('pointermove', 250, 130));
		expect(frame.style.left).toBe('150px');

		window.dispatchEvent(new Event('blur'));
		expect(el.dragging).toBe(null);
		await nextTick();
		const after = frame.style.left;
		window.dispatchEvent(makePointerEvent('pointermove', 400, 300));
		expect(frame.style.left).toBe(after);
		frame.remove();
	});

	it('doubleclick on empty area toggles maximize', () => {
		const wrapper = mount(YMTitleBar, { attachTo: document.body });
		const el = wrapper.element as unknown as TitleBarElement;
		const frame = makeFrame();
		frame.appendChild(el);
		document.body.appendChild(frame);
		let maximized = 0;
		frame.maximize = () => maximized++;
		const maxBtn = document.createElement('div');
		maxBtn.classList.add('maximize');
		el.appendChild(maxBtn);
		el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		expect(maximized).toBe(1);
		maxBtn.remove();
		frame.remove();
	});
});
