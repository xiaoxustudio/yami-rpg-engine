import { Data } from '@app/legacy/data/data-object.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { Updater } from './updater.ts';
import type { FileMeta } from '@app/legacy/data/metadata-manifest.ts';

interface UiNode {
	class: string;
	children?: UiNode[];
	clip?: { slice(): unknown };
	padding?: unknown;
	[key: string]: unknown;
}

Updater.updateElements = function (verNum: number) {
	const replaceUIElement = (replacer: (node: UiNode) => UiNode | undefined) => {
		const forEachElement = (
			nodes: UiNode[],
			replacer: (node: UiNode) => UiNode | undefined,
			meta: FileMeta
		) => {
			const length = nodes.length;
			for (let i = 0; i < length; i++) {
				const node = nodes[i];
				const replacement = replacer(node);
				if (replacement instanceof Object) {
					nodes[i] = replacement;
					File.planToSave!(meta);
				}
				if (node.children instanceof Array) {
					forEachElement(node.children, replacer, meta);
				}
			}
		};
		for (const [guid, ui] of Object.entries<any>(Data.ui)) {
			const meta = Data.manifest.guidMap[guid];
			if (meta === undefined) {
				throw new Error(`Missing metadata: ${guid}`);
			}
			forEachElement(ui.nodes, replacer, meta);
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
				return dNode;
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
			const dNode = {} as unknown as UiNode;
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
				return dNode;
			}
		});
	}
};
