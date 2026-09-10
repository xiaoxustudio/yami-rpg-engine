import { describe, expect, it } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import { toLayoutScheme, leavesOf, type LayoutTreeNode } from '../layout-scheme';
import { deserializeGroupElement, deserializePage } from '../layout-deserialize';
import '@app/utils/math';
import {
	buildLayoutFixture,
	clickNavItem,
	DIRECTORY_SCHEME,
	mountScheme,
	NESTED_MERGE_SCHEME,
	registerLayout,
	SCENE_SCHEME,
	switchWorkspace
} from './layout-spec-utils';

// DOM→数据树反序列化契约（docs/layout-vue-plan.md 附录 D）
// saveLayoutScheme 已改为 toLayoutScheme(deserializeGroupElement(root))，
// 本文件独立锁定反序列化字段契约与 active 跟踪。

const loadDirectory = async (): Promise<ReturnType<typeof buildLayoutFixture>> => {
	const fixture = buildLayoutFixture();
	registerLayout(fixture);
	switchWorkspace(fixture, 'directory');
	await mountScheme('directory', DIRECTORY_SCHEME);
	return fixture;
};

describe('deserializeGroupElement / deserializePage 字段契约', () => {
	it('首载 DIRECTORY：反序列化还原 scheme 结构（end/split/tabs）', async () => {
		const fixture = await loadDirectory();
		const root = fixture.directory.firstElementChild as HTMLElement;
		const tree = deserializeGroupElement(root);
		expect(tree.kind).toBe('split');
		expect(toLayoutScheme(tree)).toEqual(DIRECTORY_SCHEME);

		const pageTree = deserializePage(fixture.directory);
		expect(pageTree).not.toBeNull();
		expect(toLayoutScheme(pageTree as LayoutTreeNode)).toEqual(DIRECTORY_SCHEME);
	});

	it('active 读取 manager.index：首载首 tab 激活，点击后迁移', async () => {
		const fixture = await loadDirectory();
		const root = fixture.directory.firstElementChild as HTMLElement;

		let tree = deserializeGroupElement(root);
		let leaves = leavesOf(tree);
		expect(leaves[0]?.active).toBe('project');
		expect(leaves[1]?.active).toBe('scene');

		const nav = fixture.items.project.parentNode as HTMLElement;
		clickNavItem(nav, 'inspector');

		tree = deserializeGroupElement(root);
		leaves = leavesOf(tree);
		expect(leaves[0]?.active).toBe('inspector');
	});

	it('saveNavStates 清空激活后 index 为 undefined → active 归一为 null', async () => {
		const fixture = await loadDirectory();
		Layout.saveNavStates!();
		const leaves = leavesOf(
			deserializeGroupElement(fixture.directory.firstElementChild as HTMLElement)
		);
		expect(leaves[0]?.active).toBeNull();
		expect(leaves[1]?.active).toBeNull();
	});

	it('空/未物化宿主页（scene 未加载、home 无 group 树）返回 null', async () => {
		const fixture = await loadDirectory();
		expect(deserializePage(fixture.scene)).toBeNull();
		const home = document.createElement('div');
		home.className = 'page-frame';
		home.setAttribute('value', 'home');
		home.innerHTML = '<div class="box" id="home-content"></div>';
		expect(deserializePage(home)).toBeNull();
		expect(fixture.scene.children.length).toBe(0);
	});
});

describe('deserialize 与布局结构同步', () => {
	it('mergeGroups 平铺后反序列化反映新结构与新 end', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', NESTED_MERGE_SCHEME);
		Layout.mergeGroups!();

		const tree = deserializePage(fixture.directory) as LayoutTreeNode;
		expect(tree.kind).toBe('split');
		if (tree.kind !== 'split') return;
		expect(tree.split).toBe('horizontal');
		expect(tree.children).toHaveLength(3);
		const leaves = leavesOf(tree);
		expect(leaves.map((leaf) => leaf.tabs)).toEqual([['project'], ['scene'], ['inspector']]);
		const ends = tree.children.map((child) => child.end);
		expect(ends[0]).toBeCloseTo(0.3, 6);
		expect(ends[1]).toBeCloseTo(0.6, 6);
		expect(ends[2]).toBeCloseTo(1, 6);
	});

	it('跨工作区 SCENE 加载后 directory 树仍保持原样（DOM 事实源可重复读）', async () => {
		const fixture = await loadDirectory();
		const before = toLayoutScheme(deserializePage(fixture.directory) as LayoutTreeNode);

		switchWorkspace(fixture, 'scene');
		await mountScheme('scene', SCENE_SCHEME);
		const sceneRoot = fixture.scene.firstElementChild as HTMLElement;
		expect(toLayoutScheme(deserializeGroupElement(sceneRoot))).toEqual(SCENE_SCHEME);

		switchWorkspace(fixture, 'directory');
		const after = toLayoutScheme(deserializePage(fixture.directory) as LayoutTreeNode);
		expect(after).toEqual(before);
	});
});
