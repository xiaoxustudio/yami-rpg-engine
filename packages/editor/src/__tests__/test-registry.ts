/**
 * 测试专用的「元素表」夹具。
 *
 * 生产侧的 `ElementRegistry`（`@app/utils/element-registry`）已经在元素契约收尾里删除：
 * 控件改由组件表 / 桥交出，窗口根按 DOM id 查，没有任何生产代码再按 id 摸注册表。
 *
 * 但一批「页面桥 / 页挂载」测试需要一个**可注入的元素表**来模拟页管理器渲染出来的宿主容器
 * （`#<page>-vue-mount`）。这里保留最小实现：只提供 `get/set/has/clear`，不参与生产构建。
 */
import type { YamiElement } from '@app/types/element-api';

export type TestElementRegistry = Map<string, YamiElement | null>;

export const createTestElementRegistry = (mirror?: TestElementRegistry): TestElementRegistry => {
	const registry: TestElementRegistry = new Map();
	if (!mirror) return registry;
	const set = registry.set.bind(registry);
	registry.set = (id: string, el: YamiElement | null): TestElementRegistry => {
		mirror.set(id, el);
		return set(id, el);
	};
	return registry;
};

const registryRefCallbacks = new WeakMap<TestElementRegistry, Map<string, (el: unknown) => void>>();

export const testRegistryRef = (
	registry: TestElementRegistry,
	id: string
): ((el: unknown) => void) => {
	let callbacks = registryRefCallbacks.get(registry);
	if (!callbacks) {
		callbacks = new Map();
		registryRefCallbacks.set(registry, callbacks);
	}
	let callback = callbacks.get(id);
	if (!callback) {
		callback = (el: unknown): void => {
			if (el === null || el === undefined) {
				registry.set(id, null);
				return;
			}
			const element =
				el instanceof HTMLElement
					? (el as YamiElement)
					: ((el as { $el?: HTMLElement }).$el ?? null);
			registry.set(id, element as YamiElement | null);
		};
		callbacks.set(id, callback);
	}
	return callback;
};

export const testRegisterElement = (
	registry: TestElementRegistry,
	id: string,
	el: unknown
): void => {
	testRegistryRef(registry, id)(el);
};

export const testRegistryElements = (registry: TestElementRegistry, ids: string[]): YamiElement[] =>
	ids.map((id) => registry.get(id)).filter((el): el is YamiElement => el instanceof HTMLElement);
