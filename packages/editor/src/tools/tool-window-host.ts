import { createVNode, nextTick, render, type AppContext, type Component } from 'vue';
import { $, createDetachedElement } from '@app/utils/dom';
import { toolWindowLoaders } from './tool-window-loaders';

let appContext: AppContext | null = null;
const components = new Map<string, Component>();
const mounted = new Set<string>();
/** 控件 API（onMounted 里接线）已可用的窗口。 */
const ready = new Set<string>();
const mountListeners = new Map<string, (() => void)[]>();

export function setToolWindowHostContext(context: AppContext): void {
	appContext = context;
}

export function preloadToolWindows(ids: string[]): Promise<void> {
	return Promise.allSettled(
		ids.map(async (id) => {
			const loader = toolWindowLoaders[id];
			if (!loader || components.has(id)) return;
			const module = await loader();
			components.set(id, module.default);
		})
	).then(() => undefined);
}

export function hasToolWindowLoader(id: string): boolean {
	return toolWindowLoaders[id] !== undefined;
}

export function isToolWindowMounted(id: string): boolean {
	return mounted.has(id);
}

/**
 * 工具窗口的控件 API 是否已经可调用。
 *
 * 宿主挂载的窗口要等 `onMounted` 接完线（`ready`）；模板里常驻的窗口早已挂载过，看 DOM 即可。
 */
export function isToolWindowReady(id: string): boolean {
	if (mounted.has(id)) return ready.has(id);
	return Boolean($(`#${id}`));
}

/**
 * 在「窗口控件可用」时执行一次：已就绪就立即执行，否则等该窗口挂载完成后再执行。
 *
 * 窗口是懒挂载的，控制器常在 `open()` 里顺手写控件（填下拉项、写表单、装隐藏行关系），
 * 首次打开时控件还不存在，这些写入会静默丢失（下拉空、行不隐藏，甚至取到 undefined 崩溃）。
 */
export function runWhenToolWindowReady(id: string, listener: () => void): void {
	if (isToolWindowReady(id)) {
		listener();
		return;
	}
	if (!toolWindowLoaders[id]) {
		// 不是宿主窗口：等不到挂载回调，直接执行交给调用方自己的兜底
		listener();
		return;
	}
	onToolWindowMounted(id, listener);
}

/**
 * 登记「工具窗口挂载完成后」执行一次的回调。
 *
 * 工具窗口是按需挂载的，`Command.initAll()` 那类启动期初始化往往早于挂载，
 * 此时窗口里的控件还在注册表之外，初始化会静默失效（下拉项不填、隐藏行关系不装）。
 * 这类初始化应当在挂载后再跑一次。窗口已挂载或没有装载器时直接忽略。
 */
export function onToolWindowMounted(id: string, listener: () => void): void {
	if (mounted.has(id) || !toolWindowLoaders[id]) return;
	const listeners = mountListeners.get(id);
	if (listeners) listeners.push(listener);
	else mountListeners.set(id, [listener]);
}

const flushMountListeners = (id: string): void => {
	const listeners = mountListeners.get(id);
	if (!listeners) return;
	mountListeners.delete(id);
	for (const listener of listeners) {
		try {
			listener();
		} catch (error) {
			console.error('[tool-window] mounted listener failed:', id, error);
		}
	}
};

export function mountToolWindow(id: string): boolean {
	if (mounted.has(id)) return true;
	const component = components.get(id);
	if (!component || appContext === null) return false;
	const host = createDetachedElement();
	host.dataset.toolWindowHost = id;
	document.body.appendChild(host);
	const vnode = createVNode(component);
	vnode.appContext = appContext;
	render(vnode, host);
	mounted.add(id);
	// 等 onMounted 里的控件 API 接线完成，挂载回调才能拿到可调用的控件
	void nextTick().then(() => {
		ready.add(id);
		flushMountListeners(id);
	});
	return true;
}

export function ensureToolWindow(id: string): Promise<boolean> {
	if (mountToolWindow(id)) return Promise.resolve(true);
	const loader = toolWindowLoaders[id];
	if (!loader) return Promise.resolve(false);
	return loader().then((module) => {
		components.set(id, module.default);
		return mountToolWindow(id);
	});
}
