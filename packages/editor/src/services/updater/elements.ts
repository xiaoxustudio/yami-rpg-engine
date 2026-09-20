import { getDataStore } from '@app/stores/data';
import type { FileMetaShape } from '@app/stores/data';
import { append } from '@app/utils/array';
import { Updater } from './updater.ts';

interface UiNode {
	class: string;
	children?: UiNode[];
	clip?: { slice(): unknown };
	padding?: unknown;
	[key: string]: unknown;
}

interface UiShape {
	nodes: UiNode[];
	[key: string]: unknown;
}

function updateElements(verNum: number) {
	const replaceUIElement = (replacer: (node: UiNode) => UiNode | undefined) => {
		const { manifest, ui } = getDataStore().data;
		const forEachElement = (
			nodes: UiNode[],
			replacer: (node: UiNode) => UiNode | undefined,
			meta: FileMetaShape
		) => {
			const length = nodes.length;
			for (let i = 0; i < length; i++) {
				const node = nodes[i];
				const replacement = replacer(node);
				if (replacement instanceof Object) {
					nodes[i] = replacement;
					append(getDataStore().data.manifest!.changes as unknown[], meta);
				}
				if (node.children instanceof Array) {
					forEachElement(node.children, replacer, meta);
				}
			}
		};
		for (const [guid, sUi] of Object.entries(ui! as Record<string, UiShape>)) {
			const meta = manifest!.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachElement(sUi.nodes, replacer, meta);
		}
	};
	if (verNum < Updater.getVersionNumber!('1.0.40')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('uiButton'));
		replaceUIElement((sNode: UiNode) => {
			if (sNode.class === 'button') {
				const dNode = Updater.hooks.createInspectorSchema('uiButton');
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key];
						continue;
					}
					switch (key) {
						case 'normalClip':
						case 'hoverClip':
						case 'activeClip':
							dNode[key] = sNode.clip!.slice();
							continue;
						case 'textPadding':
							dNode[key] = sNode.padding;
							continue;
					}
				}
				return dNode as UiNode;
			}
		});
	}
	if (verNum < Updater.getVersionNumber!('1.0.61')) {
		const keysMap: Record<string, string[] | undefined> = {};
		replaceUIElement((sNode: UiNode) => {
			let keys = keysMap[sNode.class];
			if (keys === undefined) {
				const type = Updater.hooks.getUiInspectorType(sNode.class);
				const node = Updater.hooks.createInspectorSchema(type);
				keys = keysMap[sNode.class] = Object.keys(node);
			}
			const dNode = {} as UiNode;
			for (const key of keys) {
				if (key in sNode) {
					dNode[key] = sNode[key];
					continue;
				}
				switch (key) {
					case 'pointerEvents':
						dNode[key] = 'enabled';
						continue;
				}
			}
			return dNode;
		});
	}
	if (verNum < Updater.getVersionNumber!('1.0.118')) {
		const keys = Object.keys(Updater.hooks.createInspectorSchema('uiVideo'));
		replaceUIElement((sNode: UiNode) => {
			if (sNode.class === 'video') {
				const dNode = Updater.hooks.createInspectorSchema('uiVideo');
				for (const key of keys) {
					if (key in sNode) {
						dNode[key] = sNode[key];
					}
				}
				return dNode as UiNode;
			}
		});
	}
}

export function initUpdaterElements(): void {
	Updater.updateElements = updateElements;
}
