import { uiElClasses } from '@app/engine/ui/element-classes.ts';
import type { UIElementInstance } from '@app/engine/ui/element-classes.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { UIInstanceList } from '@app/engine/ui/element-instance-list.ts';

// `unsetAsPrefab`（以及此前的 `hasPrefab` / `clearInvalidPrefabs`）的**实现**都已搬到目录外的
// `@app/engine/ui/ui-slots.ts`，由 `uiWindowReady` 动态 import 后绑定回单例。
//
// 装配由 `ui-members.ts` 汇总、`ui-window.ts` 在 UI 诞生处挂上 ⇒ 本文件**不再 `import { UI }`**
// —— 这是 ④-3 里第一个走完全程的域（`ui-domain-singleton-imports` 因此 6 → 5）。
//
// 接收者口径（第 175/176 轮核实）：编辑器侧调用点全是 `UI.x(…)` 形式 ⇒ 体内可以用 `this.`；
// 唯一例外是下面那个**非箭头**的 `click`（它的 `this` 是菜单项）⇒ 单例必须在入口捕获。

const createPrefabItem = function (
	this: UIShape,
	parent?: UINodeShape | null,
	x?: number,
	y?: number
) {
	const uiPrefabs = Editor.project!.uiPrefabs!;
	const items: Array<{ label: string; data: UINodeShape; click: () => void }> = [];
	if (uiPrefabs.length !== 0) {
		// `click` 必须是**非箭头**函数（运行时 `this` = 菜单项），而它又要用单例 ⇒
		// 把接收者当**实参**交给一个 IIFE（不写成 `const ui = this` 别名 —— 那会被
		// `typescript(no-this-alias)` 拦下；传参形态既满足规则，也仍让闭包拿到单例）。
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
	// `!` 的理由：上面那段 `defineProperty` **刚刚**保证了该成员存在
	// （`Object.defineProperty` 不参与控制流分析，`tsc` 仍按 `UINodeShape.instances?` 的可选口径看它）。
	node.instances!.push(instance);
	return instance;
};
// 原先是**链式赋值** `uiElClasses.createElement = UI.createElement = function …`：
// `uiElClasses` 是元素类注册表、与 UI 单例是**两个不同的目标** ⇒ 拆成两处（一行只对一个目标）。
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

/** 本域提供的 3 个槽位（第 ④-3 步：域模块只**提供**成员对象，装配见 `ui-members.ts`） */
export const uiPrefabMembers = { createPrefabItem, createElement, loadElement };
