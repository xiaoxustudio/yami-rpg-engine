export interface DynamicShape {
	[k: string]: any;
}

export interface AccessorTarget {
	dataValue: any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

export interface AccessorBaseShape {
	target: AccessorTarget | null;
	initialize: (() => void) | null;
	open: ((target: AccessorTarget) => void) | null;
	confirm: ((event: Event) => void) | null;
	checkDataForPlugin?: ((data: Record<string, unknown>) => boolean) | null;
	createDefaultForPlugin?: (() => { getter: string; type: string }) | null;
}
