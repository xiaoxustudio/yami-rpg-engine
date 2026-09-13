import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import { Window } from '@app/tools/window-object';
import { primeWindows } from '@app/tools/window-registry';

const { layoutMock, titleMock } = vi.hoisted(() => ({
	layoutMock: {
		disableFocusableElements: vi.fn(),
		enableFocusableElements: vi.fn()
	},
	titleMock: {
		pointerenter: vi.fn(),
		pointermove: vi.fn()
	}
}));
vi.mock('@app/tools/window-cluster', () => ({
	Layout: layoutMock,
	Title: titleMock
}));

describe('指令窗口关闭后模态恢复（事件编辑器回归保护）', () => {
	beforeEach(() => {
		primeWindows({ Layout: layoutMock, Title: titleMock });
		titleMock.pointerenter = vi.fn();
		titleMock.pointermove = vi.fn();
		layoutMock.disableFocusableElements = vi.fn();
		layoutMock.enableFocusableElements = vi.fn();
		vi.stubGlobal('scrollTo', vi.fn());
		if (!document.getElementById('title')) {
			const title = document.createElement('div');
			title.id = 'title';
			document.body.appendChild(title);
		}
	});

	afterEach(() => {
		Window.frames.length = 0;
		Window.activeElement = null;
		Window.overlapRoot = null;
		Window.positionMode = 'center';
		document.body.style.pointerEvents = '';
		window.removeEventListener('keydown', Window.keydown!);
		vi.unstubAllGlobals();
	});

	it('单窗口：打开指令窗口 → 点击取消按钮 → 帧栈清空且模态恢复', async () => {
		const wrapper = mount(WindowFrame, {
			props: { id: 'showText' },
			slots: { default: '<div class="content">X</div>' },
			attachTo: document.body
		});
		Window.open!('showText');
		expect(document.body.style.pointerEvents).toBe('none');
		expect(Window.frames).toHaveLength(1);

		const cancel = document
			.getElementById('showText')!
			.querySelector('button[name="cancel"]') as HTMLButtonElement;
		cancel.click();
		await nextTick();

		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		wrapper.unmount();
	});

	it('单窗口：打开指令窗口 → 确认（模拟指令 onConfirm → Window.close）→ 模态恢复', async () => {
		const wrapper = mount(WindowFrame, {
			props: { id: 'showText2' },
			slots: { default: '<div class="content">X</div>' },
			attachTo: document.body
		});
		const el = document.getElementById('showText2')!;
		el.addEventListener('confirm', () => Window.close!('showText2'));
		Window.open!('showText2');
		expect(document.body.style.pointerEvents).toBe('none');

		const confirm = el.querySelector('button[name="confirm"]') as HTMLButtonElement;
		confirm.click();
		await nextTick();

		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		wrapper.unmount();
	});

	it('双窗口：事件窗口 + 指令窗口，关闭指令后事件窗口恢复可点击（focus/blur）', async () => {
		const eventWrapper = mount(WindowFrame, {
			props: { id: 'event' },
			slots: { default: '<div class="content">EVENT</div>' },
			attachTo: document.body
		});
		const cmdWrapper = mount(WindowFrame, {
			props: { id: 'showText3' },
			slots: { default: '<div class="content">CMD</div>' },
			attachTo: document.body
		});
		Window.open!('event');
		expect(document.body.style.pointerEvents).toBe('none');
		Window.open!('showText3');
		expect(Window.frames).toHaveLength(2);

		const eventEl = document.getElementById('event')!;
		const cmdEl = document.getElementById('showText3')!;
		expect(eventEl.classList.contains('blur')).toBe(true);

		const cancel = cmdEl.querySelector('button[name="cancel"]') as HTMLButtonElement;
		cancel.click();
		await nextTick();

		expect(Window.frames).toHaveLength(1);
		expect(cmdEl.classList.contains('open')).toBe(false);
		expect(eventEl.classList.contains('blur')).toBe(false);
		expect(eventEl.classList.contains('open')).toBe(true);

		const eventCancel = eventEl.querySelector('button[name="cancel"]') as HTMLButtonElement;
		eventCancel.click();
		await nextTick();
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');

		eventWrapper.unmount();
		cmdWrapper.unmount();
	});

	it('重复循环：指令窗口打开/取消 2 次后模态状态保持正确', async () => {
		const wrapper = mount(WindowFrame, {
			props: { id: 'loopCmd' },
			slots: { default: '<div class="content">X</div>' },
			attachTo: document.body
		});
		const el = document.getElementById('loopCmd')!;
		for (let i = 0; i < 2; i++) {
			Window.open!('loopCmd');
			expect(document.body.style.pointerEvents).toBe('none');
			expect(Window.frames).toHaveLength(1);
			const cancel = el.querySelector('button[name="cancel"]') as HTMLButtonElement;
			cancel.click();
			// oxlint-disable-next-line no-await-in-loop
			await nextTick();
			expect(Window.frames).toHaveLength(0);
			expect(document.body.style.pointerEvents).toBe('inherit');
		}
		wrapper.unmount();
	});
});
