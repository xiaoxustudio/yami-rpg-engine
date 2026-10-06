import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import '@app/utils/array';
import { getConfirmationStore } from '@app/stores/confirmation';
import { Window, windowShellEls } from '@app/tools/window-object';
import { registerElement } from '@app/utils/element-registry';
import { primeWindows } from '@app/tools/window-registry';

const { layoutMock, titleMock } = vi.hoisted(() => ({
	layoutMock: {
		disableFocusableElements: vi.fn(),
		enableFocusableElements: vi.fn()
	},
	titleMock: {
		target: null as HTMLElement | null,
		pointerenter: vi.fn(),
		pointermove: vi.fn()
	}
}));
vi.mock('@app/tools/window-cluster', () => ({
	Layout: layoutMock,
	Title: titleMock
}));

interface TestFrame extends HTMLElement {
	open: () => void;
	close: () => boolean;
	closeEventEnabled: boolean;
	enableAmbient: boolean;
}

let createdFrames: TestFrame[] = [];

function makeFrame(id: string, closeResult = true): TestFrame {
	const el = document.createElement('div');
	el.id = id;
	el.tabIndex = -1;
	const frame = el as unknown as TestFrame;
	frame.open = vi.fn(() => {
		if (Window.frames.append(frame)) {
			frame.classList.add('open');
			return true;
		}
		return false;
	});
	frame.close = vi.fn(() => {
		if (!closeResult) {
			return false;
		}
		if (Window.frames.remove(frame)) {
			frame.classList.remove('open');
			return true;
		}
		return false;
	});
	frame.closeEventEnabled = true;
	frame.enableAmbient = false;
	document.body.appendChild(el);
	// `Window.open(id)` 现在从 windowShellEls 取帧
	registerElement(windowShellEls, id, frame);
	createdFrames.push(frame);
	return frame;
}

describe('Window（window-object 模态/焦点/关闭链）', () => {
	beforeEach(() => {
		primeWindows({ Layout: layoutMock, Title: titleMock });
		titleMock.pointerenter = vi.fn();
		titleMock.pointermove = vi.fn();
		layoutMock.disableFocusableElements = vi.fn();
		layoutMock.enableFocusableElements = vi.fn();
		vi.stubGlobal('scrollTo', vi.fn());
		getConfirmationStore().clear();
		if (!document.getElementById('title')) {
			const title = document.createElement('div');
			title.id = 'title';
			document.body.appendChild(title);
		}
		// 外壳元素 #title 由 AppShell.vue 登记进 windowShellEls（Window.open 不再查 DOM）
		titleMock.target = null;
		registerElement(windowShellEls, 'title', document.getElementById('title'));
	});

	afterEach(() => {
		window.removeEventListener('keydown', Window.keydown!);
		Window.frames.length = 0;
		Window.activeElement = null;
		Window.overlapRoot = null;
		Window.positionMode = 'center';
		document.body.style.pointerEvents = '';
		for (const frame of createdFrames) {
			frame.remove();
		}
		createdFrames = [];
		vi.unstubAllGlobals();
	});

	it('open 不存在的 id 无任何效果', () => {
		Window.open!('no-such-window');
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('');
	});

	it('首个窗口打开：入栈 + 模态 + 焦点让渡 + 键盘接管，关闭后恢复', () => {
		const frame = makeFrame('modal-1');
		const pointermove = vi.fn();
		const pointerenter = vi.fn();
		const disableFocusable = vi.fn();
		const enableFocusable = vi.fn();
		titleMock.pointermove = pointermove;
		titleMock.pointerenter = pointerenter;
		layoutMock.disableFocusableElements = disableFocusable;
		layoutMock.enableFocusableElements = enableFocusable;
		const title = document.getElementById('title')!;
		Window.open!('modal-1');
		expect(Window.frames).toEqual([frame]);
		expect(frame.open).toHaveBeenCalledTimes(1);
		expect(document.body.style.pointerEvents).toBe('none');
		expect(pointermove).toHaveBeenCalledWith({ target: null });
		expect(disableFocusable).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(title);
		Window.close!('modal-1');
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		expect(pointerenter).toHaveBeenCalledTimes(1);
		expect(enableFocusable).toHaveBeenCalledTimes(1);
	});

	it('重复 open 同一窗口不重复入栈', () => {
		const frame = makeFrame('dup');
		Window.open!('dup');
		Window.open!('dup');
		expect(Window.frames).toEqual([frame]);
		expect(frame.open).toHaveBeenCalledTimes(1);
	});

	it('isWindowOpen / getTopWindow 与帧栈一致', () => {
		const a = makeFrame('top-a');
		const b = makeFrame('top-b');
		expect(Window.isWindowOpen!('top-a')).toBe(false);
		Window.open!('top-a');
		Window.open!('top-b');
		expect(Window.isWindowOpen!('top-a')).toBe(true);
		expect(Window.isWindowOpen!('top-b')).toBe(true);
		expect(Window.isWindowOpen!('no-such')).toBe(false);
		expect(Window.getTopWindow!()).toBe(b);
		Window.close!('top-b');
		expect(Window.getTopWindow!()).toBe(a);
	});

	it('多层窗口：关闭非栈顶无效，逐层关闭直到最后才恢复模态', () => {
		const a = makeFrame('stack-a');
		const b = makeFrame('stack-b');
		const c = makeFrame('stack-c');
		const pointerenter = vi.fn();
		const enableFocusable = vi.fn();
		titleMock.pointerenter = pointerenter;
		layoutMock.enableFocusableElements = enableFocusable;
		Window.open!('stack-a');
		Window.open!('stack-b');
		Window.open!('stack-c');
		expect(Window.frames).toEqual([a, b, c]);
		Window.close!('stack-a');
		expect(Window.frames).toEqual([a, b, c]);
		expect(document.body.style.pointerEvents).toBe('none');
		expect(pointerenter).not.toHaveBeenCalled();
		expect(enableFocusable).not.toHaveBeenCalled();
		Window.close!('stack-c');
		expect(Window.frames).toEqual([a, b]);
		expect(document.body.style.pointerEvents).toBe('none');
		expect(pointerenter).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(b);
		Window.close!('stack-b');
		expect(Window.frames).toEqual([a]);
		expect(document.body.style.pointerEvents).toBe('none');
		Window.close!('stack-a');
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		expect(pointerenter).toHaveBeenCalledTimes(1);
		expect(enableFocusable).toHaveBeenCalledTimes(1);
	});

	it('窗口 close 事件阻止关闭时保持帧栈与模态', () => {
		const frame = makeFrame('blocked', false);
		Window.open!('blocked');
		Window.close!('blocked');
		expect(frame.close).toHaveBeenCalledTimes(1);
		expect(Window.frames).toEqual([frame]);
		expect(document.body.style.pointerEvents).toBe('none');
	});

	it('空栈关闭与 closeAll 为 no-op', () => {
		Window.close!();
		Window.closeAll!();
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('');
	});

	it('closeAll 自顶向下关闭全部窗口并最终恢复模态', () => {
		const a = makeFrame('closeall-a');
		const b = makeFrame('closeall-b');
		Window.open!('closeall-a');
		Window.open!('closeall-b');
		Window.closeAll!();
		expect(a.close).toHaveBeenCalledTimes(1);
		expect(b.close).toHaveBeenCalledTimes(1);
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
	});

	it('Alt+F4 接管关闭栈顶窗口（refocus + close + preventDefault）', () => {
		const a = makeFrame('alt-a');
		const b = makeFrame('alt-b');
		Window.open!('alt-a');
		Window.open!('alt-b');
		const refocus = vi.fn();
		const originalRefocus = Window.refocus;
		Window.refocus = refocus;
		const event = new KeyboardEvent('keydown', { code: 'F4', altKey: true, cancelable: true });
		window.dispatchEvent(event);
		expect(refocus).toHaveBeenCalledTimes(1);
		expect(b.close).toHaveBeenCalledTimes(1);
		expect(Window.frames).toEqual([a]);
		expect(event.defaultPrevented).toBe(true);
		expect(document.body.style.pointerEvents).toBe('none');
		Window.refocus = originalRefocus;
	});

	it('Escape 触发 refocus + close', () => {
		makeFrame('esc');
		Window.open!('esc');
		const refocus = vi.fn();
		const originalRefocus = Window.refocus;
		Window.refocus = refocus;
		const event = new KeyboardEvent('keydown', { code: 'Escape', cancelable: true });
		window.dispatchEvent(event);
		expect(refocus).toHaveBeenCalledTimes(1);
		expect(Window.frames).toHaveLength(0);
		Window.refocus = originalRefocus;
	});

	it('Enter 触发栈顶 confirm 按钮；关闭后 keydown 监听还原', () => {
		const frame = makeFrame('enter-frame');
		const content = document.createElement('content-frame');
		const button = document.createElement('button');
		button.name = 'confirm';
		content.appendChild(button);
		frame.appendChild(content);
		const click = vi.fn();
		button.addEventListener('click', click);
		Window.open!('enter-frame');
		const openEvent = new KeyboardEvent('keydown', { code: 'Enter', cancelable: true });
		window.dispatchEvent(openEvent);
		expect(openEvent.defaultPrevented).toBe(true);
		expect(click).toHaveBeenCalledTimes(1);
		Window.close!('enter-frame');
		const afterCloseEvent = new KeyboardEvent('keydown', { code: 'Enter', cancelable: true });
		window.dispatchEvent(afterCloseEvent);
		expect(afterCloseEvent.defaultPrevented).toBe(false);
		expect(click).toHaveBeenCalledTimes(1);
	});

	it('confirm 转发到 confirmation store（含 close 回调）', async () => {
		const store = getConfirmationStore();
		const click = vi.fn();
		const closeCallback = vi.fn();
		Window.confirm!({ message: '测试消息', close: closeCallback }, [{ label: '确定', click }]);
		expect(store.open).toBe(true);
		expect(store.message).toBe('测试消息');
		expect(store.items).toEqual([{ label: '确定', click }]);
		expect(store.closeCallback).toBe(closeCallback);
		await nextTick();
		expect(Window.frames).toHaveLength(0);
		store.clear();
		expect(closeCallback).toHaveBeenCalledTimes(1);
		expect(store.open).toBe(false);
	});

	it('confirm 打开 confirmation 模态窗口，按钮确认后关闭并恢复', async () => {
		const store = getConfirmationStore();
		const click = vi.fn();
		makeFrame('confirmation');
		Window.confirm!({ message: '确认删除？' }, [{ label: '确定', click }]);
		await nextTick();
		expect(store.open).toBe(true);
		expect(Window.frames).toHaveLength(1);
		expect(document.body.style.pointerEvents).toBe('none');
		store.confirmButton(0);
		expect(click).toHaveBeenCalledTimes(1);
		await nextTick();
		expect(store.open).toBe(false);
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
	});

	it('saveActiveElement/restoreActiveElement 保存并恢复焦点', () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();
		expect(document.activeElement).toBe(input);
		Window.saveActiveElement!();
		expect(Window.activeElement).toBe(input);
		expect(document.activeElement).not.toBe(input);
		Window.restoreActiveElement!();
		expect(document.activeElement).toBe(input);
		expect(Window.activeElement).toBe(null);
		input.remove();
	});

	it('refocus 对非 body 活动元素重新聚焦', () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();
		Window.refocus!();
		expect(document.activeElement).toBe(input);
		input.remove();
	});

	it('cancel 按 DOM 祖先定位并关闭对应窗口', () => {
		const frame = makeFrame('cancel-window');
		frame.classList.add('window-frame');
		Window.open!('cancel-window');
		const button = document.createElement('button');
		frame.appendChild(button);
		button.addEventListener('click', Window.cancel as EventListener);
		button.click();
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
	});

	it('组件 cancel 事件直接关闭（不经 Window.close）时也能恢复模态', () => {
		const frame = makeFrame('inner-close');
		const pointerenter = vi.fn();
		const enableFocusable = vi.fn();
		titleMock.pointerenter = pointerenter;
		layoutMock.enableFocusableElements = enableFocusable;
		frame.open();
		expect(Window.frames).toEqual([frame]);
		expect(document.body.style.pointerEvents).toBe('none');
		frame.close();
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		expect(pointerenter).toHaveBeenCalledTimes(1);
		expect(enableFocusable).toHaveBeenCalledTimes(1);
	});

	it('隐藏残留帧压在栈底：关闭可见顶层后应清空帧栈并恢复模态', () => {
		// 模拟一个曾打开但随后被外部逻辑直接隐藏、残留于帧栈的幽灵窗口
		const ghost = makeFrame('ghost-hidden');
		const live = makeFrame('ghost-live');
		Window.frames.push(ghost);
		// 幽灵帧把模态挂在打开状态，界面已被锁死
		document.body.style.pointerEvents = 'none';
		live.open();
		expect(Window.frames).toEqual([ghost, live]);
		expect(document.body.style.pointerEvents).toBe('none');

		Window.close!('ghost-live');
		expect(Window.frames).toHaveLength(0);
		expect(document.body.style.pointerEvents).toBe('inherit');
		expect(ghost.classList.contains('open')).toBe(false);
	});

	it('再次打开窗口时驱逐栈顶隐藏残留帧', () => {
		const ghost = makeFrame('hidden-top');
		const live = makeFrame('hidden-top-live');
		Window.frames.push(ghost);
		// 模拟残留帧把界面锁死
		document.body.style.pointerEvents = 'none';

		Window.open!('hidden-top-live');
		expect(Window.frames).toEqual([live]);
		expect(document.body.style.pointerEvents).toBe('none');
	});

	it('已入栈但失去 open 的窗口重新 open 时恢复到可见且置顶', () => {
		const a = makeFrame('reopen-a');
		const b = makeFrame('reopen-b');
		a.open();
		b.open();
		// 模拟 b 被外部直接隐藏但仍留在帧栈
		b.classList.remove('open');
		b.close = vi.fn(() => {
			if (Window.frames.remove(b)) {
				b.classList.remove('open');
				return true;
			}
			return false;
		});

		Window.open!('reopen-b');
		expect(Window.frames).toEqual([a, b]);
		expect(b.classList.contains('open')).toBe(true);
		expect(document.body.style.pointerEvents).toBe('none');
	});

	it('游离于文档外的残留帧在 open 时被清理', () => {
		const ghost = makeFrame('detached-ghost');
		const live = makeFrame('detached-live');
		ghost.open();
		ghost.remove();
		expect(document.body.contains(ghost)).toBe(false);
		document.body.style.pointerEvents = 'none';

		Window.open!('detached-live');
		expect(Window.frames).toEqual([live]);
		expect(document.body.style.pointerEvents).toBe('none');
	});
});
