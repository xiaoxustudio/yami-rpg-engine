import type { AccessorBaseShape, AccessorTarget } from '@app/types/shapes.ts';

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
