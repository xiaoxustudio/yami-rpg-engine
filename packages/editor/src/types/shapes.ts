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

export interface AccessorBaseShape {
	target: AccessorTarget | null;
	initialize: (() => void) | null;
	open: ((target: AccessorTarget) => void) | null;
	confirm: ((event: Event) => void) | null;
	checkDataForPlugin?: ((data: unknown) => boolean) | null;
	createDefaultForPlugin?: (() => { getter: string; type: string }) | null;
}
