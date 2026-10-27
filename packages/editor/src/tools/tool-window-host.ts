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

/** 宿主是否已注入 appContext：否则 `ensureToolWindow` 无法真正挂载（单测/未初始化阶段）。 */
export function isToolWindowHostActive(): boolean {
	return appContext !== null;
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
