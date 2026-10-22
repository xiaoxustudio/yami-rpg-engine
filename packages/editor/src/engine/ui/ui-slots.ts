import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import type { UIShape, UINodeShape } from './ui-singleton.ts';

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
	 * 调用方仍是 `UI.hasPrefab`
	 * （`ui-pointer.ts` / `ui-list.ts` / `LayoutPanel.vue`）与 store 的转发
	 * （`stores/ui.ts` 的 `hasPrefab` → `UI?.hasPrefab?.(node)`）——**行为不变**。
	 */
	hasPrefab(this: UIShape, node: UINodeShape) {
		return Editor.project!.uiPrefabs!.includes(node.presetId);
	},

	/**
	 * 槽位 `clearInvalidPrefabs`：就地剔除已不存在于 `Data.uiPresets` 的 guid。
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
			if (node.presetId === '' || node.presetId in uiPresets) {
				node.presetId = generatePresetId();
			}
			uiPresets[node.presetId] = {
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
