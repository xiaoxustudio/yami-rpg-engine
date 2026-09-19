import { Window } from '@app/tools/window-object.ts';
import { useVariableGetterWindow } from '@app/composables/useVariableGetterWindow';

interface VariableGetterTarget {
	filter: string;
	dataValue: {
		type: string;
		key: string;
		actor?: { type: string };
		skill?: { type: string };
		state?: { type: string };
		equipment?: { type: string };
		item?: { type: string };
		element?: { type: string };
	};
	// oxlint-disable-next-line no-explicit-any
	read?: () => any;
	input: (getter: Record<string, unknown>) => void;
	isPluginInput?: boolean;
}

type VarTypeItem = { name: string; value: string };
type VarTypeSet = {
	all: VarTypeItem[];
	object: VarTypeItem[];
	object2: VarTypeItem[];
	writable: VarTypeItem[];
	deletable: VarTypeItem[];
};

interface VarListEntry {
	name: string;
	type: string;
	command?: { id: string } | null;
}

interface VarGetterState {
	target: VariableGetterTarget;
	filter: string;
}

interface VariableGetterShape {
	keyBox: HTMLElement & {
		loadItems(items: VarTypeItem[]): void;
		selectBox: HTMLElement & {
			textContent: string;
			write(v: unknown): void;
			read(): unknown;
			invalid: boolean;
			dataItems: VarTypeItem[];
		};
	};
	target: VariableGetterTarget | null;
	filter: string | null;
	types: VarTypeSet | null;
	_state: Record<string, VarGetterState | null>;
	initialize: () => void;
	open: (target: VariableGetterTarget) => void;
	_openCore: (target: VariableGetterTarget, filter: string, prefix: string) => void;
	isNone: (variable: { key: string }) => boolean;
	loadPresetKeys: (group: string) => void;
	checkDataForPlugin: (data: { getter?: string }) => boolean;
	createDefaultForPlugin: () => { getter: string; type: string; key: string };
	createVarListGenerator: (filterObject: VariableGetterShape) => () => VarListEntry[];
	typeWrite: (event: Event & { value: string }) => void;
	typeInput: (event: Event & { value: string }) => void;
	confirm: (event: Event) => void;
	confirm2: (event: Event) => void;
	_confirmCore: (prefix: string) => void;
}

export const VariableGetter = {
	target: null,
	filter: null,
	types: null
} satisfies Partial<VariableGetterShape> as VariableGetterShape;

VariableGetter.initialize = function (this: VariableGetterShape): void {
	useVariableGetterWindow().initialize();
};

VariableGetter.open = function (this: VariableGetterShape, target: VariableGetterTarget): void {
	const filter = target.filter ?? 'all';
	const prefix = Window.isWindowOpen!('variableGetter') ? 'variableGetter2' : 'variableGetter';
	useVariableGetterWindow().open(target, { filter, prefix });
};

VariableGetter._openCore = function (
	this: VariableGetterShape,
	target: VariableGetterTarget,
	filter: string,
	prefix: string
): void {
	useVariableGetterWindow().open(target, { filter, prefix });
};

VariableGetter.isNone = function (this: typeof VariableGetter, variable: { key: string }): boolean {
	return useVariableGetterWindow().isNone(variable);
};

VariableGetter.loadPresetKeys = function (this: VariableGetterShape, group: string): void {
	useVariableGetterWindow().loadPresetKeys(group);
};

VariableGetter.checkDataForPlugin = function (
	this: typeof VariableGetter,
	data: { getter?: string }
): boolean {
	return useVariableGetterWindow().checkDataForPlugin(data);
};

VariableGetter.createDefaultForPlugin = function (this: typeof VariableGetter): {
	getter: string;
	type: string;
	key: string;
} {
	return useVariableGetterWindow().createDefaultForPlugin();
};

VariableGetter.createVarListGenerator = function (
	this: typeof VariableGetter,
	filterObject: VariableGetterShape
): () => VarListEntry[] {
	return useVariableGetterWindow().createVarListGenerator(filterObject);
};

VariableGetter.typeWrite = function (
	this: typeof VariableGetter,
	event: Event & { value: string }
): void {
	useVariableGetterWindow().typeWrite(event);
};

VariableGetter.typeInput = function (
	this: typeof VariableGetter,
	event: Event & { value: string }
): void {
	useVariableGetterWindow().typeInput(event);
};

VariableGetter.confirm = function (this: VariableGetterShape, _event: Event): void {
	useVariableGetterWindow().confirm();
};

VariableGetter.confirm2 = function (this: VariableGetterShape, _event: Event): void {
	useVariableGetterWindow().confirm2();
};

VariableGetter._confirmCore = function (this: VariableGetterShape, prefix: string): void {
	const composable = useVariableGetterWindow();
	if (prefix === 'variableGetter2') {
		composable.confirm2();
	} else {
		composable.confirm();
	}
};
