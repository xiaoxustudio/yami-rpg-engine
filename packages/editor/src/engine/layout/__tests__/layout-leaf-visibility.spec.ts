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

		expect(visibleOf(manager)).toEqual(['project']);

		inspectorPage.classList.add('visible');
		expect(visibleOf(manager)).toEqual(['project', 'inspector']);

		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

		expect(visibleOf(manager)).toEqual(['project']);
	});

	it('落到哪个页签就只有哪个页框可见（激活值跟 nav 选中项一致）', async () => {
		const fixture = await mountDirectory();
		const manager = fixture.items.project.page.parentNode as HTMLElement;
		fixture.items.inspector.page.classList.add('visible');
		fixture.items.scene.page.classList.add('visible');

		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();
		placePaletteIntoLeaves(fixture);

		expect(visibleOf(manager)).toEqual(['project']);
		const sceneManager = fixture.items.scene.page.parentNode as HTMLElement;
		expect(visibleOf(sceneManager)).toEqual(['scene']);
	});
});
