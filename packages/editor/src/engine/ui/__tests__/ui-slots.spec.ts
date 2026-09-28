import { describe, expect, it } from 'vitest';

import { UI, uiWindowReady } from '@app/engine/ui/ui-singleton.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';

/**
 *
 * ## 这条用例守的是什么
 *
 * `hasPrefab` / `clearInvalidPrefabs` 的**实现**已搬出 `engine/ui/legacy/`，落到目录外的
 * `engine/ui/ui-slots.ts`，由 `uiWindowReady` 动态 import 后在模块顶层绑定回 `UI`。
 *
 * 这里**故意不 import `ui-slots.ts`** —— 如果直接 import，用例会把待验证的那条链路自己短路掉，
 * 变成「证明了它被 import 过」而不是「证明了 `uiWindowReady` 会把它拉起来」。
 * 这正是本仓「仪器要自证」的要求：用例必须能失败在真实的坏改动上
 * （删掉 `ui-window.ts` 里那行动态 import，本文件必须红）。
 *
 * ## 为什么盯 `uiWindowReady` 而不是 `loadUI`
 *
 * 原文此处写的是「真机上 UI 对象**不是**由 `loadUI` 到达的：`primeWindows` 直接塞缓存，
 * 遍历的是该模块的命名空间，没有 `UI` 就没有 `'ui'` 键，真机与 vitest 一样走 `loadUI`。
 * 该不变式由同目录的 `ui-window-arrival-path.spec.ts` 钉住（加回那行导出即变红）。
 *
 * 仍然盯 `uiWindowReady` 的理由不变：它是「`UI` 已建好」的**汇合点**（`clusterReady` 里含它），
 * 绑定挂在这里就不必假设调用方是谁，也不必赌 loader 有没有真的被调用过。
 */
describe('1c ③：目录外的 UI 槽位绑定', () => {
	it('uiWindowReady 解析之后，两个槽位已被绑定（而不是对象字面量里的 null）', async () => {
		await uiWindowReady;
		expect(typeof UI.hasPrefab, 'UI.hasPrefab 应已被 ui-slots.ts 绑定').toBe('function');
		expect(
			typeof UI.clearInvalidPrefabs,
			'UI.clearInvalidPrefabs 应已被 ui-slots.ts 绑定'
		).toBe('function');
	});

	it('hasPrefab 语义与搬走前一致：按 Editor.project.uiPrefabs 成员判定', async () => {
		await uiWindowReady;
		const previous = Editor.project;
		try {
			Editor.project = { uiPrefabs: ['guid-a'] } as unknown as typeof Editor.project;

			expect(UI.hasPrefab!({ presetId: 'guid-a' } as never)).toBe(true);
			expect(UI.hasPrefab!({ presetId: 'guid-b' } as never)).toBe(false);
		} finally {
			Editor.project = previous;
		}
	});

	it('clearInvalidPrefabs 语义与搬走前一致：就地剔除 uiPresets 里不存在的 guid', async () => {
		await uiWindowReady;
		const previous = Data.uiPresets;
		try {
			Data.uiPresets = {
				'guid-keep': { uiId: 'x', data: {} }
			} as unknown as typeof Data.uiPresets;

			const list = ['guid-keep', 'guid-gone', 'guid-also-gone'];
			UI.clearInvalidPrefabs!(list);

			// 既删对了、又是**就地**改（调用方 `ui-events.ts` 依赖传引用）
			expect(list).toEqual(['guid-keep']);
		} finally {
			Data.uiPresets = previous;
		}
	});

	it('registerPreset / unregisterPreset 语义与搬走前一致（递归 + id 为空时重生成）', async () => {
		await uiWindowReady;
		const previousPresets = Data.uiPresets;
		const previousMeta = UI.meta;
		try {
			Data.uiPresets = {} as typeof Data.uiPresets;
			UI.meta = { guid: 'ui-guid' } as unknown as typeof UI.meta;

			const child = { presetId: '', class: 'image', children: [] };
			const root = { presetId: '', class: 'window', children: [child] };

			UI.registerPreset!(root as never);

			// 空 id ⇒ 生成新 id（不是保持空串）
			expect(root.presetId).not.toBe('');
			expect(child.presetId).not.toBe('');
			// **递归**：子节点也登记了，且 uiId 取自 UI.meta
			expect(Object.keys(Data.uiPresets).sort()).toEqual(
				[root.presetId, child.presetId].sort()
			);
			expect(Data.uiPresets[root.presetId]!.uiId).toBe('ui-guid');

			UI.unregisterPreset!(root as never);
			// **递归**注销：父子都清干净
			expect(Object.keys(Data.uiPresets)).toEqual([]);
		} finally {
			Data.uiPresets = previousPresets;
			UI.meta = previousMeta;
		}
	});

	it('setAsPrefab / unsetAsPrefab 语义与搬走前一致（并各刷新一次列表）', async () => {
		await uiWindowReady;
		const previousProject = Editor.project;
		const previousList = UI.list;
		try {
			Editor.project = { uiPrefabs: [] } as unknown as typeof Editor.project;
			let updates = 0;
			UI.list = {
				update: () => {
					updates += 1;
				}
			} as unknown as typeof UI.list;

			UI.setAsPrefab!({ presetId: 'p1' } as never);
			expect(Editor.project!.uiPrefabs).toEqual(['p1']);
			expect(updates).toBe(1);

			UI.unsetAsPrefab!({ presetId: 'p1' } as never);
			expect(Editor.project!.uiPrefabs).toEqual([]);
			expect(updates).toBe(2);
		} finally {
			Editor.project = previousProject;
			UI.list = previousList;
		}
	});
});
