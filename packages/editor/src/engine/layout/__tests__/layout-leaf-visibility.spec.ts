import { beforeEach, describe, expect, it } from 'vitest';
import { Layout, awaitVueLayoutLoad } from '@app/engine/layout/layout.ts';
import {
	buildLayoutFixture,
	DIRECTORY_SCHEME,
	mountScheme,
	placePaletteIntoLeaves,
	registerLayout,
	switchWorkspace,
	visibleOf
} from './layout-spec-utils';

// 叶子页框可见性的收口金标准。
//
// 回归（实机「切了页签，另一个面板的头/内容还在」）：页框的 `.visible` 是**旧组**留下的 ——
// Teleport 把整壳页面搬进新 manager 时不会清，而 manager 的 `switch()` 有
// 「index 未变就早退」的短路（`if (last !== value)`）⇒ 同一个叶子会同时留着两个 `.visible`。
// 页框是 `position: absolute; inset: 0`，两页于是完全叠在一起（两个面板的头部同处一条页签带）。
// 装载/激活的收敛点必须把可见性钉到「刚写进去的那个页签」。

describe('叶子页框可见性收口（同组只允许一个 visible）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	const mountDirectory = async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		Layout.heads = [];
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		return fixture;
	};

	it('二次进入（组树不重建）：上一轮残留的 visible 页框被清掉，只剩当前页签', async () => {
		const fixture = await mountDirectory();
		const projectPage = fixture.items.project.page;
		const inspectorPage = fixture.items.inspector.page;
		const manager = projectPage.parentNode as HTMLElement;

		// 初始：只有当前页签可见
		expect(visibleOf(manager)).toEqual(['project']);

		// 模拟 Teleport 换组残留：同组第二个页框也带着 `.visible`
		inspectorPage.classList.add('visible');
		expect(visibleOf(manager)).toEqual(['project', 'inspector']);

		// 二次装载（isFirst=false：组树复用、仅重算归属并激活页签）
		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

		expect(visibleOf(manager)).toEqual(['project']);
	});

	it('落到哪个页签就只有哪个页框可见（激活值跟 nav 选中项一致）', async () => {
		const fixture = await mountDirectory();
		const manager = fixture.items.project.page.parentNode as HTMLElement;
		// 手动把 inspector 页框标成可见，再切到 inspector 页签
		fixture.items.inspector.page.classList.add('visible');
		fixture.items.scene.page.classList.add('visible');

		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

		// 每个叶子各自只剩一个可见页框（project 所在叶子 → project；scene 所在叶子 → scene）
		expect(visibleOf(manager)).toEqual(['project']);
		const sceneManager = fixture.items.scene.page.parentNode as HTMLElement;
		expect(visibleOf(sceneManager)).toEqual(['scene']);
	});
});
