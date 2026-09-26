import { beforeEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { Layout } from '@app/engine/layout/layout.ts';
import {
	buildLayoutFixture,
	collectLeaves,
	mountScheme,
	registerLayout,
	switchWorkspace
} from './layout-spec-utils';

// 打开窗口时把其页面切到前台：同叶子若激活了其它页签，目标页是 display:none
// → 画布/内容尺寸为 0（真机表现为场景预览空白 + WebGL 零尺寸帧缓冲刷屏）。

const SCHEME = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project'] },
		{ end: 1, tabs: ['inspector', 'scene'] }
	]
};

describe('Layout.activateLayoutPage（窗口页面置前）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		Layout.heads = [];
	});

	it('把同叶子内非激活页切到前台：nav 选中与 manager 激活同步迁移', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', SCHEME);
		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const leaf = leaves[1];
		const scenePage = fixture.items.scene.page;
		// 初始激活的是叶子首页签 inspector
		expect(leaf.manager.index).toBe('inspector');
		expect(scenePage.isConnected).toBe(true);

		const applied = Layout.activateLayoutPage!(scenePage);
		expect(applied).toBe(true);
		await nextTick();

		expect(leaf.manager.index).toBe('scene');
		expect(leaf.nav.querySelector('.nav-item.selected')?.getAttribute('value')).toBe('scene');
	});

	it('页面已在调用 leaf 内且已是激活页时幂等（不下发多余写入）', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', SCHEME);
		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const leaf = leaves[0];

		Layout.activateLayoutPage!(fixture.items.project.page);
		await nextTick();
		expect(leaf.manager.index).toBe('project');
		expect(leaf.nav.querySelector('.nav-item.selected')?.getAttribute('value')).toBe('project');
	});

	it('未挂载/无 value 的页面返回 false 且不抛错', () => {
		const orphan = document.createElement('div');
		orphan.className = 'page-frame';
		expect(Layout.activateLayoutPage!(orphan)).toBe(false);
		expect(Layout.activateLayoutPage!(null)).toBe(false);
	});
});
