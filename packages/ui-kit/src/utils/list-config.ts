import { getElementData } from './element-data';

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

const read = <T>(data: Record<string, unknown>, key: string): T | undefined =>
	data[key] as T | undefined;
const write = (data: Record<string, unknown>, key: string, value: unknown): void => {
	data[key] = value;
};
/** 数组字段（creators/updaters）：首次读时补一个空数组，之后 `.push()` 就是原地改同一个数组 */
const readList = <T>(data: Record<string, unknown>, key: string): T[] => {
	let list = read<T[]>(data, key);
	if (list === undefined) {
		list = [];
		write(data, key, list);
	}
	return list;
};

/**
 * 列表配置注册表。**配置的存储从"元素上的访问器属性"搬到了元素数据（WeakMap）**——
 * 这是 P4b 的逐组件迁移之一：这些字段过去靠 `HTMLElement.prototype` 的全局访问器
 * （`defineDataAccessors()`）落到 WeakMap，现在直接读写 `getElementData(el)`，于是
 * `creators`/`updaters`/`removable`/`renamable`/`togglable`/`foldable`/`onCreate`/`onDelete`/
 * `onRemove`/`onResume` 这 10 个名字可以从 `DATA_FIELDS` 里摘掉（`lockDirectory`/
 * `multipleSelect`/`padded` 本来就不在 `DATA_FIELDS` 里，只是元素上的普通 expando，一并收进
 * WeakMap——`common-list.ts` 里对 `el.padded` 的直接读取已改为走本函数）。
 *
 * 调用方一律走 `getListConfig(list).<字段>`（全仓已确认没有对元素本身的直接读写），
 * 因此这次改动的调用面为零。
 */
export function getListConfig(el: object): ListConfig {
	const existing = configMap.get(el);
	if (existing) return existing;
	const data = getElementData(el as HTMLElement);
	const config: ListConfig = {
		// creators/updaters 也走访问器（原先它们读的是"构造时抓一次"的数组引用，
		// 于是 `list.creators = listConfig.creators = []` 这种重置必须两边都写；
		// 改成访问器后单点写 data 即可，pusher 仍然 push 进同一个数组）
		get creators() {
			return readList<(item: unknown) => void>(data, 'creators');
		},
		set creators(value: Array<(item: unknown) => void>) {
			write(data, 'creators', value);
		},
		get updaters() {
			return readList<(item: unknown) => void>(data, 'updaters');
		},
		set updaters(value: Array<(item: unknown) => void>) {
			write(data, 'updaters', value);
		},
		get foldable() {
			return read<boolean>(data, 'foldable');
		},
		set foldable(value: boolean | undefined) {
			write(data, 'foldable', value);
		},
		get lockDirectory() {
			return read<boolean>(data, 'lockDirectory');
		},
		set lockDirectory(value: boolean | undefined) {
			write(data, 'lockDirectory', value);
		},
		get multipleSelect() {
			return read<boolean>(data, 'multipleSelect');
		},
		set multipleSelect(value: boolean | undefined) {
			write(data, 'multipleSelect', value);
		},
		get padded() {
			return read<boolean>(data, 'padded');
		},
		set padded(value: boolean | undefined) {
			write(data, 'padded', value);
		},
		get removable() {
			return read<boolean>(data, 'removable');
		},
		set removable(value: boolean | undefined) {
			write(data, 'removable', value);
		},
		get renamable() {
			return read<boolean>(data, 'renamable');
		},
		set renamable(value: boolean | undefined) {
			write(data, 'renamable', value);
		},
		get togglable() {
			return read<boolean>(data, 'togglable');
		},
		set togglable(value: boolean | undefined) {
			write(data, 'togglable', value);
		},
		get onCreate() {
			return read<(item: unknown) => void>(data, 'onCreate');
		},
		set onCreate(value: ((item: unknown) => void) | undefined) {
			write(data, 'onCreate', value);
		},
		get onDelete() {
			return read<(item: unknown) => void>(data, 'onDelete');
		},
		set onDelete(value: ((item: unknown) => void) | undefined) {
			write(data, 'onDelete', value);
		},
		get onRemove() {
			return read<(item: unknown) => void>(data, 'onRemove');
		},
		set onRemove(value: ((item: unknown) => void) | undefined) {
			write(data, 'onRemove', value);
		},
		get onResume() {
			return read<(item: unknown) => void>(data, 'onResume');
		},
		set onResume(value: ((item: unknown) => void) | undefined) {
			write(data, 'onResume', value);
		}
	};
	configMap.set(el, config);
	return config;
}
