export interface DynamicShape {
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export interface AccessorTarget {
	// oxlint-disable-next-line no-explicit-any
	dataValue: any;
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

/**
 * 访问器窗口的控件接口：SFC 用 `:ref="fieldRef(id)"` 把控件实例登记进
 * `AccessorFields`，模块的 `initialize()` 从这里按 id 取用——不再用 `按 id` 查 DOM。
 */
export interface AccessorFieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
	/** 控件根元素（元素 API 的 expando 字段如 dataItems 也在这里） */
	root?: (HTMLElement & { dataItems?: unknown[] }) | null;
	[k: string]: unknown;
}

export type AccessorFields = Map<string, AccessorFieldControl | null | undefined>;

export interface AccessorBaseShape {
	target: AccessorTarget | null;
	initialize: (() => void) | null;
	open: ((target: AccessorTarget) => void) | null;
	confirm: ((event: Event) => void) | null;
	/** 由对应 SFC 在 setup/mount 时登记的控件注册表 */
	fields?: AccessorFields | null;
	checkDataForPlugin?: ((data: unknown) => boolean) | null;
	createDefaultForPlugin?: (() => { getter: string; type: string }) | null;
}
