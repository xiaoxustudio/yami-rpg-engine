import { createVNode, render, type AppContext, type Component } from 'vue';
import { createDetachedElement } from '@app/utils/dom';
import { toolWindowLoaders } from './tool-window-loaders';

let appContext: AppContext | null = null;
const components = new Map<string, Component>();
const mounted = new Set<string>();

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
