import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { getFocus, on, read, write } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { UI } from '@/ui/ui-window.ts';

type PresetElementNode = {
	class: string;
	name: string;
	expanded?: boolean;
	presetId?: string;
	children?: PresetElementNode[];
};

interface PresetElementListItem {
	class: string;
	presetId?: string;
}

interface PresetElementList extends HTMLElement {
	elements: Array<{ item: PresetElementListItem }>;
	createIcon: (...args: unknown[]) => unknown;
	bind(getter: () => PresetElementNode[] | null): void;
	clear(): void;
	update(): void;
	unselect(): void;
	select(item: PresetElementListItem): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToSelection(mode: string): void;
	expandToSelection(): void;
	getItemByProperties(properties: Record<string, unknown>): PresetElementListItem | undefined;
	searchNodes(text: string): void;
	read(): PresetElementNode | null;
}

type PresetElementTarget = {
	input?: (presetId: string) => void;
};

type PresetElementShape = {
	ui: HTMLElement;
	list: PresetElementList;
	searcher: HTMLElement;
	target: PresetElementTarget | null;
	nodes: PresetElementNode[] | null;
	initialize: ((this: typeof PresetElement) => void) | null;
	open: ((this: typeof PresetElement, target: PresetElementTarget) => void) | null;
	buildNodes:
		| ((this: typeof PresetElement, nodes: PresetElementNode[]) => PresetElementNode[])
		| null;
	getDefaultPresetId: (() => string) | null;
	windowClosed: (event: Event) => void;
	uiIdWrite: (event: Event & { value?: string }) => void;
	listOpen: (event: Event) => void;
	searcherKeydown: (event: KeyboardEvent) => void;
	searcherInput: (event: InputEvent) => void;
	confirm: (event?: Event) => void;
};

export const PresetElement: PresetElementShape = {
	ui: null as unknown as HTMLElement,
	list: null as unknown as PresetElementList,
	searcher: null as unknown as HTMLElement,
	target: null as unknown as PresetElementTarget | null,
	nodes: null as unknown as PresetElementNode[] | null,
	initialize: null as unknown as ((this: typeof PresetElement) => void) | null,
	open: null as unknown as
		| ((this: typeof PresetElement, target: PresetElementTarget) => void)
		| null,
	buildNodes: null as unknown as
		| ((this: typeof PresetElement, nodes: PresetElementNode[]) => PresetElementNode[])
		| null,
	getDefaultPresetId: null as unknown as (() => string) | null,
	windowClosed: null as unknown as (event: Event) => void,
	uiIdWrite: null as unknown as (event: Event & { value?: string }) => void,
	listOpen: null as unknown as (event: Event) => void,
	searcherKeydown: null as unknown as (event: KeyboardEvent) => void,
	searcherInput: null as unknown as (event: InputEvent) => void,
	confirm: null as unknown as (event?: Event) => void
};

function ensureDomBound() {
	if (PresetElement.list) return;
	const list = $('#presetElement-list');
	if (!list) return;
	PresetElement.ui = $('#presetElement-uiId');
	PresetElement.list = list as PresetElementList;
	PresetElement.searcher = $('#presetElement-searcher');
	PresetElement.list.createIcon = null as unknown as (...args: unknown[]) => unknown;
}

PresetElement.initialize = function (this: typeof PresetElement) {
	ensureDomBound();
	if (!this.list) return;
	this.list.bind(() => this.nodes);

	// 列表 - 重写创建图标方法
	this.list.createIcon = UI.list.createIcon;

	// ui write/list open 经 Vue 模板转发（PresetElement.vue @write/@open → PresetElement.*）
	this.searcher.on('keydown', this.searcherKeydown);
	this.searcher.on('input', this.searcherInput);
	this.searcher.on('compositionend', this.searcherInput);
	$('#presetElement').addEventListener('closed', this.windowClosed);
	on($('#presetElement-confirm'), 'click', this.confirm);
};

PresetElement.open = function (this: typeof PresetElement, target: PresetElementTarget) {
	this.target = target;
	Window.open!('presetElement');

	const { ui, list } = this;
	const presetId = read(target) || (UI.target?.presetId ?? '');
	const uiId = Data.uiPresets[presetId]?.uiId ?? UI.meta?.guid ?? '';
	write(ui, uiId);
	getFocus(ui);
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
};

// 构造简化的元素节点(避免影响元素数据)
PresetElement.buildNodes = (function IIFE() {
	const build = (nodes: PresetElementNode[]) => {
		const length = nodes.length;
		const list = new Array(length);
		for (let i = 0; i < length; i++) {
			const node = nodes[i];
			list[i] = {
				class: node.class,
				name: node.name,
				expanded: node.expanded,
				presetId: node.presetId,
				children: build(node.children ?? [])
			};
		}
		return list;
	};
	return function (this: typeof PresetElement, nodes: PresetElementNode[]) {
		return build(nodes);
	};
})();

PresetElement.getDefaultPresetId = function (this: typeof PresetElement) {
	return UI.target?.presetId ?? '';
};

PresetElement.windowClosed = function (this: typeof PresetElement, event: Event) {
	PresetElement.target = null;
	PresetElement.nodes = null;
	PresetElement.list.clear();
};

PresetElement.uiIdWrite = function (this: typeof PresetElement, event: Event & { value?: string }) {
	if (!event.value) return;
	const ui = Data.ui[event.value];
	const nodes =
		ui && PresetElement.buildNodes ? PresetElement.buildNodes(ui.nodes ?? []) : Array.empty;
	PresetElement.nodes = nodes;
	PresetElement.list.update();
	if (nodes.length !== 0) {
		PresetElement.list.select(nodes[0]);
		PresetElement.list.scrollTop = 0;
	} else {
		PresetElement.list.unselect();
	}
};

PresetElement.listOpen = function (this: typeof PresetElement, event: Event) {
	PresetElement.confirm();
};

PresetElement.searcherKeydown = function (this: typeof PresetElement, event: KeyboardEvent) {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			PresetElement.list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			PresetElement.list.pageUp(true);
			break;
		case 'PageDown':
			PresetElement.list.pageDown(true);
			break;
	}
};

PresetElement.searcherInput = function (this: typeof PresetElement, event: InputEvent) {
	if (event.inputType === 'insertCompositionText') {
		return;
	}
	const text = this.searcher.value;
	const list = PresetElement.list;
	list.searchNodes(text);
	const elements = list.elements as Array<{ item: PresetElementListItem }> & { count: number };
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
};

PresetElement.confirm = function (this: typeof PresetElement, event?: Event) {
	const uiId = this.ui.read();
	if (!uiId) {
		return getFocus(this.ui);
	}
	const node = this.list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return getFocus(this.list);
	}
	this.target?.input?.(presetId);
	Window.close!('presetElement');
}.bind(PresetElement);
