/**
 *
 * ## 这个文件为什么存在
 *
 * `1c-store-slot-gaps` 的口径是「遗留目录**之外**出现 `UI.<slot> =` 文本」，所以实现必须搬出
 * `legacy/` —— 本文件存在的理由就是这个，它现在仍然成立。
 *
 *
 * 此前本文件在模块顶层逐个 `UI.hasPrefab = …` 地**自我绑定**（这正是 `ui-singleton-members`
 * 数的 82 处之一，也是伴随判据 `ui-domain-singleton-imports` 要看的那条 `import { UI }`）。
 * 现在本文件只导出 `uiSlotsMembers`，装配点移到 **UI 诞生的那个模块**
 * （`ui-singleton.ts` 的 `uiWindowReady`）：
 *
 * ```ts
 * import('@app/engine/ui/ui-slots.ts').then(({ uiSlotsMembers }) => Object.assign(UI, uiSlotsMembers))
 * ```
 *
 * ⇒ 域模块与单例**解耦**（不再 import 它），而装配仍在原处、仍是**动态** import（理由见下）。
 *
 * ## 为什么体内可以把 `UI.x` 改成 `this.x`
 *
 * 实测全仓这 6 个槽位的调用点**全部**是 `UI.x(…)` 形式：`stores/ui.ts` 6 处转发（`UI?.x?.(…)`）·
 * `ui-pointer.ts` 3 · `ui-list.ts` 5 · `ui-events.ts` 1 · `LayoutPanel.vue` 1 · 本域 spec 6
 * ⇒ `this === UI` **恒成立**，所以 `this.meta.guid` / `this.list.update()` /
 * `this.unregisterPreset!(child)`（自引用解析**当前**绑定，语义与原来一致）都逐字等价。
 * `registerPreset` 里的递归辅助函数是箭头函数（没有自己的 `this`），故改成**显式传接收者**。
 *
 * ## 类型为什么手写一份
 *
 * `UIShape` 带 `[k: string]: any` 索引签名，而这 6 个槽位**只在** `ui-window.ts` 的对象字面量里
 * 以 `null` 占位、没有具名类型 ⇒ `Pick<UIShape, …>` 会解析成 `any`（等于没校验）。
 * 所以按事实手写 `UISlotMembers`，让装配前先过一道检查。
 *
 * ## 为什么不静态 import 进 `ui-window.ts`
 *
 * 本文件（连带 `Data` / `Editor`）若被 `ui-window.ts` **静态** import，就会先于 `UI` 求值、踩 TDZ
 * —— 装配点因此保持**动态** import（挂在 `uiWindowReady` 上，在 `UI` 建好之后求值）。
 */
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';

/** 本域提供的 6 个槽位签名（手写，理由见文件头「类型为什么手写一份」） */
export type UISlotMembers = {
	hasPrefab: (this: UIShape, node: UINodeShape) => boolean;
	clearInvalidPrefabs: (this: UIShape, uiPrefabs: string[]) => void;
	registerPreset: (this: UIShape, node: UINodeShape) => void;
	unregisterPreset: (this: UIShape, node: UINodeShape) => void;
	setAsPrefab: (this: UIShape, node: UINodeShape) => void;
	unsetAsPrefab: (this: UIShape, node: UINodeShape) => void;
};

export const uiSlotsMembers: UISlotMembers = {
	/**
	 * 槽位 `hasPrefab`：该节点是否已被登记为预制体。
	 *
	 * 实现逐字来自 `legacy/ui-prefab.ts`（只改了所在模块）。调用方仍是 `UI.hasPrefab`
	 * （`ui-pointer.ts` / `ui-list.ts` / `LayoutPanel.vue`）与 store 的转发
	 * （`stores/ui.ts` 的 `hasPrefab` → `UI?.hasPrefab?.(node)`）——**行为不变**。
	 */
	hasPrefab(this: UIShape, node: UINodeShape) {
		return Editor.project!.uiPrefabs!.includes(node.presetId);
	},

	/**
	 * 槽位 `clearInvalidPrefabs`：就地剔除已不存在于 `Data.uiPresets` 的 guid。
	 *
	 * 同上，逐字来自 `legacy/ui-prefab.ts`；唯一调用方是 `ui-events.ts` 的
	 * `UI.clearInvalidPrefabs!(uiPrefabs ?? [])`。
	 */
	clearInvalidPrefabs(this: UIShape, uiPrefabs: string[]) {
		let i = uiPrefabs.length;
		while (--i >= 0) {
			const guid = uiPrefabs[i];
			if (!Data.uiPresets[guid]) {
				uiPrefabs.splice(i, 1);
			}
		}
	},

	/**
	 * 槽位 `registerPreset`：递归登记预设（含子节点）。
	 *
	 * 实现逐字来自 `legacy/ui-prefab.ts`。`self.meta.guid` 读的仍是运行时那个单例字段
	 * （`self` 就是调用时的 `this`，也就是 `UI`）—— 没有改变数据来源。`generatePresetId` 保持
	 * 原来的闭包形态（每次调用现读 `Data.uiPresets`）。
	 */
	registerPreset: (function IIFE() {
		const generatePresetId = () => {
			const { uiPresets } = Data;
			let id: string;
			do {
				id = GUID.generate64bit();
			} while (id in uiPresets);
			return id;
		};
		const registerPreset = (self: UIShape, node: UINodeShape) => {
			const { uiPresets } = Data;
			// 新元素或元素ID冲突，生成新ID
			if (node.presetId === '' || node.presetId in uiPresets) {
				node.presetId = generatePresetId();
			}
			uiPresets[node.presetId] = {
				// `this.meta` 由 `ui-file.ts:33` 在打开文档时写；预制体注册只在不变量成立时被调
				// （`registerPreset` 是列表/加载路径上的动作，那时文档已打开）⇒ `!`（同本域其余读点）。
				uiId: self.meta!.guid,
				data: node
			};
			for (const child of node.children) {
				registerPreset(self, child);
			}
		};
		return function (this: UIShape, node: UINodeShape) {
			registerPreset(this, node);
		};
	})(),

	/**
	 * 槽位 `unregisterPreset`：递归注销。递归点写 `this.unregisterPreset`（自引用），
	 * 因此它拿到的仍是**当前**绑定 —— 与搬走前逐字一致。
	 */
	unregisterPreset(this: UIShape, node: UINodeShape) {
		delete Data.uiPresets[node.presetId];
		for (const child of node.children) {
			this.unregisterPreset!(child);
		}
	},

	/** 槽位 `setAsPrefab`：登记进工程的 `uiPrefabs`，成功则刷新列表。 */
	setAsPrefab(this: UIShape, node: UINodeShape) {
		if (Editor.project!.uiPrefabs!.push(node.presetId)) {
			this.list.update();
		}
	},

	/** 槽位 `unsetAsPrefab`：从工程的 `uiPrefabs` 里移除。 */
	unsetAsPrefab(this: UIShape, node: UINodeShape) {
		if (
			Editor.project!.uiPrefabs!.splice(Editor.project!.uiPrefabs!.indexOf(node.presetId), 1)
		) {
			this.list.update();
		}
	}
};
