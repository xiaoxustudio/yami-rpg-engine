/**
 * 测试里按 id 取**控件实例**的能力对象（`defineExpose` 的成员）。
 *
 * 元素 API 退场后，元素上不再挂 `read` / `write` / `loadItems`；测试要读控件状态，
 * 只能走组件实例。元素经 Vue 内部的 `__vueParentComponent` 指到渲染它的实例：
 *
 * - 最近一层是 ui-kit 组件（`YM*`），常常只暴露 `{ root }`；再往上一层才是 editor 包装层，
 *   它的 `write` 会 emit 给页面，页面表单状态才会更新 —— 所以跳过只有 root 的层，
 *   取第一个非 `YM*` 且有成员的实例；
 * - 测试之间会残留同 id 的游离节点（`getElementById` 会命中它，`__vueParentComponent`
 *   已经失效），因此按 `isConnected` 过滤，并逐个尝试直到找到有实例链的那个。
 */
import { isRef } from 'vue';

interface ComponentType {
	name?: string;
	__name?: string;
}

interface ComponentInstance {
	exposed?: Record<string, unknown> | null;
	parent?: ComponentInstance | null;
	type?: ComponentType;
}

const instanceName = (instance: ComponentInstance): string =>
	instance.type?.__name ?? instance.type?.name ?? '?';

const isUiKitInstance = (instance: ComponentInstance): boolean =>
	instanceName(instance).startsWith('YM');

const unpack = (exposed: Record<string, unknown>): Record<string, unknown> => {
	const result: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(exposed)) {
		result[key] = isRef(value) ? value.value : value;
	}
	return result;
};

/** 往上找 editor 包装层；找不到就退到最内层的 ui-kit 能力。 */
const readInstance = (proxy: unknown): Record<string, unknown> | null => {
	let instance = proxy as ComponentInstance | null;
	const fallback: Record<string, unknown> = {};
	let depth = 0;
	while (instance && depth < 8) {
		const exposed = instance.exposed;
		if (!exposed) break;
		const members = Object.keys(exposed).filter((key) => key !== 'root');
		if (members.length > 0) {
			const unpacked = unpack(exposed);
			if (!isUiKitInstance(instance)) return unpacked;
			for (const [key, value] of Object.entries(unpacked)) {
				if (!(key in fallback)) fallback[key] = value;
			}
		}
		instance = instance.parent ?? null;
		depth += 1;
	}
	return Object.keys(fallback).filter((key) => key !== 'root').length > 0 ? fallback : null;
};

export function controlApi<T extends object = Record<string, unknown>>(id: string): T {
	const candidates = Array.from(document.querySelectorAll(`#${CSS.escape(id)}`)).filter(
		(el) => el.isConnected
	);
	const trace: string[] = [];
	for (const el of candidates) {
		const proxy = (el as unknown as { __vueParentComponent?: ComponentInstance | null })
			.__vueParentComponent;
		const api = readInstance(proxy);
		if (api) return api as T;
		let witness = proxy;
		const names: string[] = [];
		let depth = 0;
		while (witness && depth < 6) {
			names.push(`${instanceName(witness)}[${Object.keys(witness.exposed ?? {}).join(',')}]`);
			witness = witness.parent ?? null;
			depth += 1;
		}
		trace.push(names.join(' > ') || '(no instance)');
	}
	throw new Error(`controlApi: #${id} 没有可用的组件实例 API；chain=${trace.join(' | ')}`);
}
