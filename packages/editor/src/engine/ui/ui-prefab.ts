import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIElementInstance } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';

const createPrefabItem = function (
	this: UIShape,
	parent?: UINodeShape | null,
	x?: number,
	y?: number
) {
	const uiPrefabs = Editor.project!.uiPrefabs!;
	const items: Array<{ label: string; data: UINodeShape; click: () => void }> = [];
	if (uiPrefabs.length !== 0) {
		const click = ((self: UIShape) =>
			function (this: { data: UINodeShape }) {
				self.createPrefab!(this.data, parent, x, y);
			})(this);
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

const createElement = function (this: UIShape, node: UINodeShape, main?: boolean) {
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
	node.instances!.push(instance);
	return instance;
};
uiElClasses.createElement = createElement;

/**
 * 递归装配：给节点建实例、挂到父**实例**下。
 *
 * `parent` 是 `UIElementInstance` 而非 `UINodeShape`：下一句就是 `parent.appendChild(instance)`
 * —— 挂载是**实例**的行为（`element-base.ts:250`），节点数据上根本没有这个方法。
 */
const loadElement = function (this: UIShape, node: UINodeShape, parent?: UIElementInstance) {
	const instance = this.createElement!(node, true);
	if (parent !== undefined) {
		parent.appendChild(instance);
	}
	for (const child of node.children) {
		this.loadElement!(child, instance);
	}
};

export const uiPrefabMembers = { createPrefabItem, createElement, loadElement };
