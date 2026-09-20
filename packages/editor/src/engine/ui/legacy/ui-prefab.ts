import { UI } from './ui-window.ts';
import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './ui-window.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';

UI.registerPreset = (function IIFE() {
	const generatePresetId = () => {
		const { uiPresets } = Data;
		let id: string;
		do {
			id = GUID.generate64bit();
		} while (id in uiPresets);
		return id;
	};
	const registerPreset = (node: UINodeShape) => {
		const { uiPresets } = Data;
		// 新元素或元素ID冲突，生成新ID
		if (node.presetId === '' || node.presetId in uiPresets) {
			node.presetId = generatePresetId();
		}
		uiPresets[node.presetId] = {
			uiId: UI.meta.guid,
			data: node
		};
		for (const child of node.children) {
			registerPreset(child);
		}
	};
	return function (this: UIShape, node: UINodeShape) {
		registerPreset(node);
	};
})();

UI.unregisterPreset = function (this: UIShape, node: UINodeShape) {
	delete Data.uiPresets[node.presetId];
	for (const child of node.children) {
		UI.unregisterPreset!(child);
	}
};

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

UI.hasPrefab = function (this: UIShape, node: UINodeShape) {
	return Editor.project!.uiPrefabs!.includes(node.presetId);
};

UI.setAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.push(node.presetId)) {
		UI.list.update();
	}
};

UI.unsetAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.splice(Editor.project!.uiPrefabs!.indexOf(node.presetId), 1)) {
		UI.list.update();
	}
};

UI.clearInvalidPrefabs = function (this: UIShape, uiPrefabs: string[]) {
	let i = uiPrefabs.length;
	while (--i >= 0) {
		const guid = uiPrefabs[i];
		if (!Data.uiPresets[guid]) {
			uiPrefabs.splice(i, 1);
		}
	}
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
