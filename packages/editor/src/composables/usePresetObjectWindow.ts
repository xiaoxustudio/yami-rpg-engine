import { getWindowStore } from '@app/stores/window';
import { getFocus, read, write } from '@app/utils/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import { Scene } from '@app/legacy/scene/scene-window.ts';

export type PresetObjectNode = {
	class: string;
	name: string;
	expanded?: boolean;
	children?: PresetObjectNode[];
	presetId?: string;
	teamId?: string;
	color?: string;
	red?: number;
	green?: number;
	blue?: number;
	image?: string;
};

export interface PresetObjectListItem {
	class: string;
	presetId?: string;
	teamId?: string;
}

export interface PresetObjectListElement extends HTMLElement {
	elements: Array<{ item: PresetObjectListItem }>;
	bind(getter: () => PresetObjectNode[] | null): void;
	clear(): void;
	update(): void;
	unselect(): void;
	select(item: PresetObjectListItem): void;
	selectRelative(direction: string): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToSelection(mode: string): void;
	expandToSelection(): void;
	getItemByProperties(properties: Record<string, unknown>): PresetObjectListItem | undefined;
	searchNodes(text: string): void;
	read(): PresetObjectNode | null;
}

export type PresetObjectTarget = {
	filter: string;
	input?: (presetId: string) => void;
};

interface PresetObjectWindow {
	scene: HTMLElement;
	list: PresetObjectListElement;
	searcher: HTMLElement;
	target: PresetObjectTarget | null;
	nodes: PresetObjectNode[] | null;
	initialize: () => void;
	open: (target: PresetObjectTarget) => void;
	buildNodes: (nodes: PresetObjectNode[], className: string) => PresetObjectNode[];
	getDefaultPresetId: (className?: string) => string;
	windowClosed: (event: Event) => void;
	sceneIdWrite: (event: Event & { value?: string }) => void;
	listOpen: (event: Event) => void;
	searcherKeydown: (event: KeyboardEvent) => void;
	searcherInput: (event: { value?: string }) => void;
	confirm: (event?: Event) => void;
}

let scene: HTMLElement;
let list: PresetObjectListElement;
let searcher: HTMLElement;
let target: PresetObjectTarget | null = null;
let nodes: PresetObjectNode[] | null = null;
let initializedElement: PresetObjectListElement | null = null;

function initialize(): void {
	const current = document.getElementById('presetObject-list') as PresetObjectListElement | null;
	if (!current) return;
	if (initializedElement === current) return;
	initializedElement = current;
	scene = document.getElementById('presetObject-sceneId')!;
	list = current;
	searcher = document.getElementById('presetObject-searcher')!;
	list.bind(() => nodes);
	searcher.addCloseButton();
	searcher.on('keydown', searcherKeydown);
	document.getElementById('presetObject')!.addEventListener('closed', windowClosed);
}

function open(openTarget: PresetObjectTarget): void {
	target = openTarget;
	getWindowStore().open('presetObject');

	const presetId = read(openTarget) || (Scene.target?.presetId ?? '');
	const sceneId = Data.scenePresets[presetId]?.sceneId ?? Scene.meta?.guid ?? '';
	write(scene, sceneId);
	getFocus(scene);
	const item = list.getItemByProperties({ presetId });
	if (item) {
		list.select(item);
		list.expandToSelection();
		list.scrollToSelection('middle');
	}
}

function buildNodes(sourceNodes: PresetObjectNode[], className: string): PresetObjectNode[] {
	const built: PresetObjectNode[] = [];
	for (const node of sourceNodes) {
		if (node.class === 'folder') {
			built.push({
				class: node.class,
				name: node.name,
				expanded: node.expanded,
				children: buildNodes(node.children ?? [], className)
			});
			continue;
		}
		if (className === 'any' || node.class === className) {
			built.push({
				class: node.class,
				name: node.name,
				presetId: node.presetId,
				teamId: node.teamId ?? '',
				color: node.color ?? '',
				red: node.red ?? 0,
				green: node.green ?? 0,
				blue: node.blue ?? 0,
				image: node.image ?? ''
			});
		}
	}
	return built;
}

function getDefaultPresetId(className = 'any'): string {
	if (Scene.target && (className === 'any' || Scene.target.class === className)) {
		return Scene.target.presetId;
	}
	return '';
}

function windowClosed(event: Event): void {
	target = null;
	nodes = null;
	searcher.write!('');
	list.clear();
}

function sceneIdWrite(event: Event & { value?: string }): void {
	if (!event.value) return;
	const scene = Data.scenes[event.value];
	const filter = target!.filter;
	const built = scene ? buildNodes(scene.objects, filter) : Array.empty;
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
	const elements = list.elements as Array<{ item: PresetObjectListItem }> & { count: number };
	for (let i = 0; i < elements.count; i++) {
		const { item } = elements[i];
		if (item.class !== 'folder') {
			list.select(item);
			break;
		}
	}
}

function confirm(event?: Event): void {
	const node = list.read();
	const presetId = node?.presetId;
	if (!presetId) {
		return getFocus(list);
	}
	target?.input?.(presetId);
	getWindowStore().close('presetObject');
}

export function usePresetObjectWindow(): PresetObjectWindow {
	return {
		get scene() {
			return scene;
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
		sceneIdWrite,
		listOpen,
		searcherKeydown,
		searcherInput,
		confirm
	};
}
