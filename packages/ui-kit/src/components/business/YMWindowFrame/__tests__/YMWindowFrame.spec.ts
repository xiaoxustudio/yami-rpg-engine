import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMWindowFrame from '../YMWindowFrame.vue';

const mockWindow = (): any => {
	const frames: any[] = [];
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
	(window as any).Window = W;
	return W;
};

describe('YMWindowFrame', () => {
	it('mounts with slot and exposes api', () => {
		const wrapper = mount(YMWindowFrame, {
			slots: { default: '<div class="content">X</div>' }
		});
		expect(wrapper.element.classList.contains('window-frame')).toBe(true);
		expect(wrapper.element.querySelector('.content')).toBeTruthy();
		const el = wrapper.element as any;
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

	it('open adds open class and dispatches open event', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as any;
		let opened = false;
		el.addEventListener('open', () => (opened = true));
		el.open();
		expect(el.classList.contains('open')).toBe(true);
		expect(opened).toBe(true);
		expect(W.frames.includes(el)).toBe(true);
		expect(el.style.zIndex).toBe('1');
		el.close();
		W;
	});

	it('close removes open class and dispatches closed when enabled', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as any;
		el.open();
		let closed = false;
		el.on('closed', () => (closed = true));
		const result = el.close();
		expect(result).toBe(true);
		expect(el.classList.contains('open')).toBe(false);
		expect(closed).toBe(true);
		W;
	});

	it('close can be cancelled by close event', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as any;
		el.open();
		el.addEventListener('close', (e: Event) => e.preventDefault());
		const result = el.close();
		expect(result).toBe(false);
		expect(el.classList.contains('open')).toBe(true);
		W;
	});

	it('maximize and unmaximize toggle class and events', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, { attachTo: document.body });
		const el = wrapper.element as any;
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
		W;
	});

	it('blur and focus manage focusable tabindex', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, {
			attachTo: document.body,
			props: { focusableSelector: 'input' },
			slots: {
				default: '<div class="content"><input class="f1" type="text"></div>'
			}
		});
		const el = wrapper.element as any;
		const input = el.querySelector('input') as HTMLInputElement;
		const original = input.tabIndex;
		el.blur();
		expect(el.classList.contains('blur')).toBe(true);
		expect(input.tabIndex).toBe(original - 1);
		el.focus();
		expect(el.classList.contains('blur')).toBe(false);
		expect(input.tabIndex).toBe(original);
		W;
	});

	it('setTitle replaces first text node of title bar', () => {
		const W = mockWindow();
		const wrapper = mount(YMWindowFrame, {
			attachTo: document.body,
			slots: {
				default: '<div class="title-bar">Original<div class="close" /></div>'
			}
		});
		const el = wrapper.element as any;
		el.setTitle('New Title');
		expect(wrapper.element.querySelector('.title-bar').textContent).toContain('New Title');
		W;
	});

	it('applies localization via localize adapter', () => {
		const W = mockWindow();
		const applied: any[] = [];
		const localize = {
			components: { testWindow: { text: 'Localized' } },
			setElement: (el: any, item: any) => applied.push([el.id, item])
		};
		mount(YMWindowFrame, {
			attachTo: document.body,
			props: { localize },
			attrs: { id: 'testWindow' }
		});
		expect(applied.length).toBe(1);
		expect(applied[0][0]).toBe('testWindow');
		W;
	});
});
