import { describe, expect, it } from 'vitest';

import { UI, uiWindowReady } from '@app/engine/ui/ui-singleton.ts';
import { Data } from '@app/data/data-object.ts';
import { Editor } from '@app/services/project/editor.ts';

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

			expect(root.presetId).not.toBe('');
			expect(child.presetId).not.toBe('');
			expect(Object.keys(Data.uiPresets).sort()).toEqual(
				[root.presetId, child.presetId].sort()
			);
			expect(Data.uiPresets[root.presetId]!.uiId).toBe('ui-guid');

			UI.unregisterPreset!(root as never);
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
