interface ListConfig {
	creators: Array<(item: unknown) => void>;
	updaters: Array<(item: unknown) => void>;
	removable?: boolean;
	renamable?: boolean;
	togglable?: boolean;
	foldable?: boolean;
	lockDirectory?: boolean;
	multipleSelect?: boolean;
	padded?: boolean;
	onCreate?: (item: unknown) => void;
	onDelete?: (item: unknown) => void;
	onRemove?: (item: unknown) => void;
	onResume?: (item: unknown) => void;
}

export type { ListConfig };

const configMap = new WeakMap<object, ListConfig>();

export function getListConfig(el: object): ListConfig {
	const existing = configMap.get(el);
	if (existing) return existing;
	const host = el as {
		id?: string;
		creators?: unknown[];
		updaters?: unknown[];
		removable?: boolean;
		renamable?: boolean;
		togglable?: boolean;
		foldable?: boolean;
		lockDirectory?: boolean;
		multipleSelect?: boolean;
		padded?: boolean;
		onCreate?: (item: unknown) => void;
		onDelete?: (item: unknown) => void;
		onRemove?: (item: unknown) => void;
		onResume?: (item: unknown) => void;
	};
	const config: ListConfig = {
		creators: (host.creators ?? []) as ListConfig['creators'],
		get foldable() {
			return host.foldable;
		},
		set foldable(value: boolean | undefined) {
			host.foldable = value;
		},
		get lockDirectory() {
			return host.lockDirectory;
		},
		set lockDirectory(value: boolean | undefined) {
			host.lockDirectory = value;
		},
		get multipleSelect() {
			return host.multipleSelect;
		},
		set multipleSelect(value: boolean | undefined) {
			host.multipleSelect = value;
		},
		get padded() {
			return host.padded;
		},
		set padded(value: boolean | undefined) {
			host.padded = value;
		},
		updaters: (host.updaters ?? []) as ListConfig['updaters'],
		get removable() {
			return host.removable;
		},
		set removable(value: boolean | undefined) {
			host.removable = value;
		},
		get renamable() {
			return host.renamable;
		},
		set renamable(value: boolean | undefined) {
			host.renamable = value;
		},
		get togglable() {
			return host.togglable;
		},
		set togglable(value: boolean | undefined) {
			host.togglable = value;
		},
		get onCreate() {
			return host.onCreate;
		},
		set onCreate(value: ((item: unknown) => void) | undefined) {
			host.onCreate = value;
		},
		get onDelete() {
			return host.onDelete;
		},
		set onDelete(value: ((item: unknown) => void) | undefined) {
			host.onDelete = value;
		},
		get onRemove() {
			return host.onRemove;
		},
		set onRemove(value: ((item: unknown) => void) | undefined) {
			host.onRemove = value;
		},
		get onResume() {
			return host.onResume;
		},
		set onResume(value: ((item: unknown) => void) | undefined) {
			host.onResume = value;
		}
	};
	configMap.set(el, config);
	host.creators = config.creators;
	host.updaters = config.updaters;
	return config;
}
