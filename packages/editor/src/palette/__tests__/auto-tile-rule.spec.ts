import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.setConfig({ testTimeout: 30000 });
import { mount } from '@vue/test-utils';
import { initYamiI18n } from '@app/i18n';
import AutoTileWindow from '@app/components/tools/AutoTile.vue';
import { AutoTile } from '@app/palette/auto-tile.ts';
import { getAutoTileStore } from '@app/stores/auto-tile';

describe('AutoTile 规则位 store 化（rule grid v-model 迁移回归保护）', () => {
	beforeEach(() => {
		getAutoTileStore().changed = false;
	});

	it('nodesWrite 将 node.rule 拆为 ruleBits 写入 store', () => {
		AutoTile.createFrameItems = vi.fn();
		AutoTile.nodes = [{ rule: 0b11100100, frames: [0] }];
		AutoTile.nodesWrite({ value: 0 });
		const store = getAutoTileStore();
		expect(store.nodeIndex).toBe(0);
		expect(store.ruleBits).toEqual([0, 1, 2, 3, 0, 0, 0, 0]);
		expect(AutoTile.node).toBe(AutoTile.nodes[0]);
		expect(AutoTile.frames).toEqual([0]);
		expect(AutoTile.createFrameItems).toHaveBeenCalled();
	});

	it('ruleNeighborInput 由 store.ruleBits 汇总为 node.rule', () => {
		const store = getAutoTileStore();
		AutoTile.node = { rule: 0, frames: [0] };
		store.ruleBits = [1, 2, 3, 0, 1, 2, 3, 0];
		AutoTile.ruleNeighborInput();
		const expected = 1 | (2 << 2) | (3 << 4) | (0 << 6) | (1 << 8) | (2 << 10) | (3 << 12);
		expect(AutoTile.node.rule).toBe(expected);
		expect(store.changed).toBe(true);
	});

	it('AutoTile.vue 规则开关经 v-model 绑定 store.ruleBits', async () => {
		const wrapper = mount(AutoTileWindow, {
			attachTo: document.body,
			global: { plugins: [initYamiI18n()] }
		});
		await wrapper.vm.$nextTick();
		const store = getAutoTileStore();
		store.ruleBits = [1, 2, 0, 0, 0, 0, 0, 0];
		await wrapper.vm.$nextTick();
		const rule0 = document.getElementById('autoTile-rule-0') as HTMLElement & {
			read?: () => unknown;
		};
		const rule1 = document.getElementById('autoTile-rule-1') as HTMLElement & {
			read?: () => unknown;
		};
		expect(rule0?.read?.()).toBe(1);
		expect(rule1?.read?.()).toBe(2);
		AutoTile.node = { rule: 0, frames: [0] };
		document
			.getElementById('autoTile-rule-2')
			?.dispatchEvent(new MouseEvent('pointerdown', { button: 0, bubbles: true }));
		await wrapper.vm.$nextTick();
		expect(store.ruleBits[2]).toBe(1);
		expect(AutoTile.node.rule).toBe(1 | (2 << 2) | (1 << 4));
		expect(store.changed).toBe(true);
		wrapper.unmount();
	});
});
