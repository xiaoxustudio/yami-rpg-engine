import { treeRowCount, treeRowItemAt, type TreeListRowApi } from '@ui-kit';
/* oxlint-disable eslint/no-restricted-properties */
import { getWindowStore } from '@app/stores/window';
import { getFocus, on, read, write } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import { UI } from '@app/ui/ui-window.ts';

export type PresetElementNode = {
	class: string;
	name: string;
	expanded?: boolean;
	presetId?: string;
	children?: PresetElementNode[];
};

export interface PresetElementListItem {
	class: string;
	presetId?: string;
}

export interface PresetElementList extends HTMLElement, TreeListRowApi<PresetElementListItem> {
	elements: Array<{ item: PresetElementListItem }>;
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

export type PresetElementTarget = {
	input?: (presetId: string) => void;
};

interface PresetElementWindow {
	ui: HTMLElement;
	list: PresetElementList;
	searcher: HTMLElement;
	target: PresetElementTarget | null;
	nodes: PresetElementNode[] | null;
	initialize: () => void;
	open: (target: PresetElementTarget) => void;
	buildNodes: (nodes: PresetElementNode[]) => PresetElementNode[];
	getDefaultPresetId: () => string;
	windowClosed: (event: Event) => void;
	uiIdWrite: (event: Event & { value?: string }) => void;
	listOpen: (event: Event) => void;
	searcherKeydown: (event: KeyboardEvent) => void;
	searcherInput: (event: { value?: string }) => void;
	confirm: (event?: Event) => void;
}

let ui: HTMLElement;
let list: PresetElementList;
let searcher: HTMLElement;
let target: PresetElementTarget | null = null;
let nodes: PresetElementNode[] | null = null;
let initializedElement: PresetElementList | null = null;

function initialize(): void {
	const current = document.getElementById('presetElement-list') as PresetElementList | null;
	if (!current) return;
	if (initializedElement === current) return;
	initializedElement = current;
	ui = document.getElementById('presetElement-uiId')!;
	list = current;
	searcher = document.getElementById('presetElement-searcher')!;
	list.bind(() => nodes);
	on(searcher, 'keydown', searcherKeydown);
	document.getElementById('presetElement')!.addEventListener('closed', windowClosed);
}

function open(openTarget: PresetElementTarget): void {
	target = openTarget;
	getWindowStore().open('presetElement');

	const presetId = read(openTarget) || (UI.target?.presetId ?? '');
	const uiId = Data.uiPresets[presetId]?.uiId ?? UI.meta?.guid ?? '';
	write(ui, uiId);
	getFocus(ui);
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
}

function buildNodes(sourceNodes: PresetElementNode[]): PresetElementNode[] {
	const length = sourceNodes.length;
	const built = Array.from<PresetElementNode>({ length: length });
	for (let i = 0; i < length; i++) {
		const node = sourceNodes[i];
		built[i] = {
			class: node.class,
			name: node.name,
			expanded: node.expanded,
			presetId: node.presetId,
			children: buildNodes(node.children ?? [])
		};
	}
	return built;
}

function getDefaultPresetId(): string {
	return UI.target?.presetId ?? '';
}

function windowClosed(_event: Event): void {
	target = null;
	nodes = null;
	list.clear();
}

function uiIdWrite(event: Event & { value?: string }): void {
	if (!event.value) return;
	const ui = Data.ui[event.value];
	const built = ui ? buildNodes(ui.nodes ?? []) : Array.empty;
	nodes = built;
	list.update();
	if (built.length !== 0) {
		list.select(built[0]);
		list.scrollTop = 0;
	} else {
		list.unselect();
	}
}

function listOpen(_event: Event): void {
	confirm();
}

function searcherKeydown(event: KeyboardEvent): void {
	switch (event.code) {
		case 'ArrowUp':
		case 'ArrowDown':
			event.preventDefault();
			list.selectRelative(event.code.slice(5).toLowerCase());
			break;
		case 'PageUp':
			list.pageUp(true);
			break;
		case 'PageDown':
			list.pageDown(true);
			break;
	}
}

function searcherInput(event: { value?: string }): void {
	const text = event.value ?? '';
	list.searchNodes(text);
	// 步骤 4：按行 API 遍历（渲染模式无关；窗口外行亦可取）
	const count = treeRowCount(list);
	for (let i = 0; i < count; i++) {
		const item = treeRowItemAt<PresetElementListItem>(list, i);
		if (item !== undefined && item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
}

function confirm(_event?: Event): void {
	const uiId = ui.read();
	if (!uiId) {
		return getFocus(ui);
	}
	const node = list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return getFocus(list);
	}
	target?.input?.(presetId);
	getWindowStore().close('presetElement');
}

export const PresetElement: PresetElementWindow = {
	get ui() {
		return ui;
	},
	get list() {
		return list;
	},
	get searcher() {
		return searcher;
	},
	get target() {
		return target;
	},
	get nodes() {
		return nodes;
	},
	initialize,
	open,
	buildNodes,
	getDefaultPresetId,
	windowClosed,
	uiIdWrite,
	listOpen,
	searcherKeydown,
	searcherInput,
	confirm
};

export function usePresetElementWindow(): PresetElementWindow {
	return {
		get ui() {
			return ui;
		},
		get list() {
			return list;
		},
		get searcher() {
			return searcher;
		},
		get target() {
			return target;
		},
		get nodes() {
			return nodes;
		},
		initialize,
		open,
		buildNodes,
		getDefaultPresetId,
		windowClosed,
		uiIdWrite,
		listOpen,
		searcherKeydown,
		searcherInput,
		confirm
	};
}
