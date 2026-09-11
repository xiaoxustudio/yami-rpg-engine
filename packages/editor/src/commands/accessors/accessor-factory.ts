import type { AccessorBaseShape, AccessorFields, AccessorTarget } from '@app/types/shapes.ts';

/**
 * 访问器窗口的控件注册表工厂（P5b 批次 2）。
 * 用法：SFC 里 `const { fields, fieldRef } = createAccessorFields()`，模板控件挂
 * `:ref="fieldRef('actorGetter-type')"`，并在 setup 期把 `fields` 赋给对应访问器
 * （`ActorGetter.fields = fields`）；模块的 `initialize()` / `open()` 便可用 `this.fields`
 * 取控件，不再按 id 查 DOM。赋值必须早于 `Schema.initAll()`（AppShell 在所有弹窗挂载后触发）。
 */
export const createAccessorFields = (): {
	fields: AccessorFields;
	fieldRef: (id: string) => (el: unknown) => void;
} => {
	const fields: AccessorFields = new Map();
	const fieldRef = (id: string) => (el: unknown) => {
		fields.set(id, el as AccessorFields extends Map<string, infer V> ? V : never);
	};
	return { fields, fieldRef };
};

export interface AccessorConfig<TTarget extends AccessorTarget = AccessorTarget> {
	initialize?: (this: AccessorBaseShape) => void;
	open: (this: AccessorBaseShape, target: TTarget) => void;
	confirm?: (this: AccessorBaseShape, event: Event) => void;
	checkDataForPlugin?: (data: unknown) => boolean;
	createDefaultForPlugin?: () => { getter: string; type: string };
}

// 收敛访问器窗口的通用样板（target 持有 / open / confirm / 插件契约），
// 各访问器自定义的 initialize（选项加载 + relate）仍留在各自文件内
export function createAccessor<
	TTarget extends AccessorTarget = AccessorTarget,
	TExtra extends object = object
>(config: AccessorConfig<TTarget>, extras?: TExtra): AccessorBaseShape & TExtra {
	const accessor = {
		target: null,
		initialize: null,
		open: null,
		confirm: null
	} as AccessorBaseShape;
	accessor.initialize = function () {
		config.initialize?.call(this);
	};
	accessor.open = function (target: AccessorTarget) {
		this.target = target;
		config.open.call(this, target as TTarget);
	};
	accessor.confirm = function (event: Event) {
		config.confirm?.call(this, event);
	};
	if (config.checkDataForPlugin) accessor.checkDataForPlugin = config.checkDataForPlugin;
	if (config.createDefaultForPlugin)
		accessor.createDefaultForPlugin = config.createDefaultForPlugin;
	return Object.assign(accessor, extras ?? {}) as AccessorBaseShape & TExtra;
}
