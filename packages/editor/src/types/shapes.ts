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

export interface AccessorFieldControl {
	read?: () => unknown;
	write?: (value: unknown) => void;
	loadItems?: (items: unknown[]) => unknown;
	enableHiddenMode?: () => { relate?: (entries: unknown) => unknown } | undefined;
	root?: (HTMLElement & { dataItems?: unknown[] }) | null;
	[k: string]: unknown;
}

export type AccessorFields = Map<string, AccessorFieldControl | null | undefined>;

export interface AccessorBaseShape {
	target: AccessorTarget | null;
	initialize: (() => void) | null;
	open: ((target: AccessorTarget) => void) | null;
	confirm: ((event: Event) => void) | null;
	fields?: AccessorFields | null;
	checkDataForPlugin?: ((data: unknown) => boolean) | null;
	createDefaultForPlugin?: (() => { getter: string; type: string }) | null;
}
