/**
 * store 拥有的 UI 单例槽位 —— 阶段 1c 第 ③ 步的第一个切片（2026-09-21 第 96 轮）。
 *
 * ## 这个文件为什么存在
 *
 * `1c-store-slot-gaps` 的口径是「遗留目录**之外**出现 `UI.<slot> =` 文本」，所以实现必须搬出
 * `legacy/` —— 本文件存在的理由就是这个，它现在仍然成立。
 *
 * ⚠️ **但原始理由（第 95/96 轮）已在第 110 轮被证伪，必须写下来免得上一个人按它做判断。**
 * 原文写的是「把绑定写进 `loadUI` 在真机上是**死的**：`main/initialize.ts:91` 的
 * `primeWindows(clusterRef)` 会按小写键直接 `windows.set('ui', …)`，绕过 loader，而 vitest
 * 走的正是 loader 路径 ⇒ **套件会绿着骗你**」。这条短路**在第 ① 步（提交 `00729b15`）删掉
 * `window-cluster.ts` 的 `export { UI }` 之后就已经断了**：`primeWindows` 遍历的是那个模块的
 * **命名空间对象**，键集就是它的导出名，没有 `UI` 就没有小写 `'ui'` 这一项
 * ⇒ 真机的 UI 槽位同样由 `loadUI` 填充，与 vitest 同一条路。
 * 该不变式现由 `__tests__/ui-window-arrival-path.spec.ts` 钉住（把 `export { UI }` 加回去即变红）。
 *
 * ## 为什么挂在 `uiWindowReady` 上，而不是静态 import 进 `ui-window.ts`
 *
 * 1. **在 `UI` 建好之后求值，且不赌调用方**：`loadUI` 要先 `await clusterReady`，而
 *    `clusterReady` 里含 `uiWindowReady` ⇒ 它是「UI 窗口就绪」的**汇合点**：绑定挂在这里，
 *    既不必假设 UI 到底由哪条路取到，也不用把绑定塞进某一个调用方的函数体
 *    （原始理由写的「`primeWindows` 也会经由它」在本轮已更正，见上）。
 * 2. **不踩 TDZ**：这里的 import 是**动态**的，求值发生在 `ui-window.ts` 模块体跑完之后，
 *    那时 `UI` 已经建好。若改成 `ui-window.ts` 顶部的静态 import，本文件（连带 Data/Editor）
 *    会先于 `UI` 求值。
 *
 * ## 范围
 *
 * 本文件只放**无 `this` 依赖**的槽位（纯函数：只读入参 + `Data`/`Editor`）。带 `this` 的域方法
 * 要等各自域的 `this` 口径定下来再搬 —— 见 `xr.md` 第 95 轮里对 ③ 机制的测量。
 */
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { UI } from './legacy/ui-window.ts';
import type { UIShape, UINodeShape } from './legacy/ui-window.ts';

/**
 * 槽位 `hasPrefab`：该节点是否已被登记为预制体。
 *
 * 实现逐字来自 `legacy/ui-prefab.ts`（只改了所在模块）。调用方仍是 `UI.hasPrefab`
 * （`ui-pointer.ts` / `ui-list.ts` / `LayoutPanel.vue`）与 store 的转发
 * （`stores/ui.ts` 的 `hasPrefab` → `UI?.hasPrefab?.(node)`）——**行为不变**。
 */
UI.hasPrefab = function (this: UIShape, node: UINodeShape) {
	return Editor.project!.uiPrefabs!.includes(node.presetId);
};

/**
 * 槽位 `clearInvalidPrefabs`：就地剔除已不存在于 `Data.uiPresets` 的 guid。
 *
 * 同上，逐字来自 `legacy/ui-prefab.ts`；唯一调用方是 `ui-events.ts` 的
 * `UI.clearInvalidPrefabs!(uiPrefabs ?? [])`。
 */
UI.clearInvalidPrefabs = function (this: UIShape, uiPrefabs: string[]) {
	let i = uiPrefabs.length;
	while (--i >= 0) {
		const guid = uiPrefabs[i];
		if (!Data.uiPresets[guid]) {
			uiPrefabs.splice(i, 1);
		}
	}
};

/**
 * 槽位 `registerPreset`：递归登记预设（含子节点）。
 *
 * 实现逐字来自 `legacy/ui-prefab.ts`。`UI.meta.guid` 读的仍是运行时那个单例字段 ——
 * 本模块本来就是往单例上赋值，没有改变数据来源。`generatePresetId` 保持原来的闭包形态
 * （每次调用现读 `Data.uiPresets`）。
 */
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

/**
 * 槽位 `unregisterPreset`：递归注销。递归点仍写 `UI.unregisterPreset`（自引用），
 * 因此它拿到的一定是**当前**绑定 —— 与搬走前逐字一致。
 */
UI.unregisterPreset = function (this: UIShape, node: UINodeShape) {
	delete Data.uiPresets[node.presetId];
	for (const child of node.children) {
		UI.unregisterPreset!(child);
	}
};

/** 槽位 `setAsPrefab`：登记进工程的 `uiPrefabs`，成功则刷新列表。 */
UI.setAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.push(node.presetId)) {
		UI.list.update();
	}
};

/** 槽位 `unsetAsPrefab`：从工程的 `uiPrefabs` 里移除。 */
UI.unsetAsPrefab = function (this: UIShape, node: UINodeShape) {
	if (Editor.project!.uiPrefabs!.splice(Editor.project!.uiPrefabs!.indexOf(node.presetId), 1)) {
		UI.list.update();
	}
};
