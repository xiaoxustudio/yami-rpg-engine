import { UI } from './legacy/ui-window.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './legacy/ui-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';

// 阶段 1c 第 ③ 步（2026-09-21 第 96 轮）：`registerPreset` / `unregisterPreset` / `setAsPrefab` /
// `unsetAsPrefab`（以及此前的 `hasPrefab` / `clearInvalidPrefabs`）的**实现**都已搬到目录外的
// `@app/engine/ui/ui-slots.ts`，由 `uiWindowReady` 动态 import 后绑定回单例。
// 本文件只剩 `createPrefabItem` / `createElement` / `loadElement` 三个**尚未搬走**的槽位。

UI.createPrefabItem = function (
	this: UIShape,
	parent?: UINodeShape | null,
	x?: number,
	y?: number
) {
	const uiPrefabs = Editor.project!.uiPrefabs!;
	const items: Array<{ label: string; data: UINodeShape; click: () => void }> = [];
	if (uiPrefabs.length !== 0) {
		const click = function (this: { data: UINodeShape }) {
			UI.createPrefab!(this.data, parent, x, y);
		};
		const map = Data.uiPresets;
		for (const guid of uiPrefabs) {
			const preset = map[guid];
			if (preset !== undefined) {
				items.push({
					label: preset.data.name,
					data: preset.data,
					click: click
				});
			}
		}
	}
	return {
		label: t('menuUIList.create.prefab'),
		enabled: items.length !== 0,
		submenu: items.sort((a, b) => a.label.localeCompare(b.label))
	};
};

uiElClasses.createElement = UI.createElement = function (
	this: UIShape,
	node: UINodeShape,
	main?: boolean
) {
	let instance;
	switch (node.class) {
		case 'image':
			instance = new uiElClasses.Image!(node);
			break;
		case 'text':
			instance = new uiElClasses.Text!(node);
			break;
		case 'textbox':
			instance = new uiElClasses.TextBox!(node);
			break;
		case 'dialogbox':
			instance = new uiElClasses.DialogBox!(node);
			break;
		case 'progressbar':
			instance = new uiElClasses.ProgressBar!(node);
			break;
		case 'button':
			instance = new uiElClasses.Button!(node);
			break;
		case 'animation':
			instance = new uiElClasses.Animation!(node);
			break;
		case 'video':
			instance = new uiElClasses.Video!(node);
			break;
		case 'window':
			instance = new uiElClasses.Window!(node);
			break;
		case 'container':
			instance = new uiElClasses.Container!(node);
			break;
		case 'reference':
			instance = new uiElClasses.Reference!(node);
			break;
	}
	instance.node = node;
	if (main) {
		Object.defineProperty(node, 'instance', {
			configurable: true,
			value: instance
		});
	}
	if (!node.instances) {
		Object.defineProperty(node, 'instances', {
			configurable: true,
			value: new UIInstanceList()
		});
	}
	node.instances.push(instance);
	return instance;
};

UI.loadElement = function (this: UIShape, node: UINodeShape, parent?: UINodeShape) {
	const instance = this.createElement!(node, true);
	if (parent !== undefined) {
		parent.appendChild(instance);
	}
	for (const child of node.children) {
		UI.loadElement!(child, instance);
	}
};
