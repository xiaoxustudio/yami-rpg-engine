// 元素数据挂载 WeakMap 化：数据不污染 DOM 元素
// 通过原型访问器透明迁移——el.dragging 等读写自动走 WeakMap（挂载/读取处零改动）
// 仅注册自定义数据字段（无 DOM 标准属性冲突）；方法字段（组件 API）保留元素挂载
const elementDataMap = new WeakMap<HTMLElement, Record<string, unknown>>();

function getElementDataStore(el: HTMLElement): Record<string, unknown> {
	let data = elementDataMap.get(el);
	if (!data) {
		data = {};
		elementDataMap.set(el, data);
	}
	return data;
}

const DATA_FIELDS = [
	'dataValue',
	'dragging',
	'start',
	'number',
	'selection',
	'lastScrollTop',
	'decimals',
	'initialized',
	'filter',
	'page',
	'creators',
	'updaters',
	'dataItems',
	'head',
	'strBox',
	'parameters',
	'key',
	'folders',
	'target',
	'links',
	'count',
	'direction',
	'removable',
	'renamable',
	'togglable',
	'onCreate',
	'onDelete',
	'onRemove',
	'onResume',
	'end',
	'foot',
	'selections',
	'versionId',
	'origin',
	'active',
	'anchor',
	'inserting',
	'focusing',
	'_initialized',
	'keyword',
	'rawScrollLeft',
	'rawScrollTop',
	'expanded',
	'changed',
	'nodeIcon',
	'group',
	'markVisible',
	'folderMark',
	'textNode',
	'item',
	'indent',
	'thumb',
	'timer',
	'visible',
	'proxy',
	'relations',
	'mode',
	'info',
	'invalid',
	'savedValue',
	'lastText',
	'hiddenNodes',
	'varBox',
	'fileBox',
	'numBox',
	'bar',
	'filler',
	'synchronizer',
	'activeWheel',
	'foldable'
] as const;

function defineDataAccessors() {
	for (const field of DATA_FIELDS) {
		Object.defineProperty(HTMLElement.prototype, field, {
			configurable: true,
			get(this: HTMLElement) {
				return getElementDataStore(this)[field];
			},
			set(this: HTMLElement, value: unknown) {
				getElementDataStore(this)[field] = value;
			}
		});
	}
}

defineDataAccessors();

export function getElementData(el: HTMLElement): Record<string, unknown> {
	return getElementDataStore(el);
}