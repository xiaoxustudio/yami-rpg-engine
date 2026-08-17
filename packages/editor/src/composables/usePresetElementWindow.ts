import { $ } from '@app/legacy/util/dom.ts';
import { Window } from '@app/legacy/tools/window-object.ts';
import { getFocus, read, write } from '@app/legacy/util/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import { UI } from '@app/legacy/ui/ui-window.ts';

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

export interface PresetElementList extends HTMLElement {
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
	const current = $('#presetElement-list') as PresetElementList | null;
	if (!current) return;
	if (initializedElement === current) return;
	initializedElement = current;
	ui = $('#presetElement-uiId');
	list = current;
	searcher = $('#presetElement-searcher');
	list.bind(() => nodes);
	searcher.on('keydown', searcherKeydown);
	$('#presetElement').addEventListener('closed', windowClosed);
}

function open(openTarget: PresetElementTarget): void {
	target = openTarget;
	Window.open!('presetElement');

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
	const built = new Array<PresetElementNode>(length);
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

function windowClosed(event: Event): void {
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

function listOpen(event: Event): void {
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
	const elements = list.elements as Array<{ item: PresetElementListItem }> & {
		count: number;
	};
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
}

function confirm(event?: Event): void {
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
	Window.close!('presetElement');
}

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
