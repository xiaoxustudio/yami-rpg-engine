import { describe, expect, it } from 'vitest';
import { Layout } from '@app/engine/layout/layout.ts';
import { toLayoutScheme, leavesOf, nodesOf, type LayoutTreeNode } from '../layout-scheme';
import { deserializeGroupElement, deserializePage, groupTreeElements } from '../layout-deserialize';
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

// DOM→数据树反序列化契约
// saveLayoutScheme 走 toLayoutScheme(deserializeGroupElement(root))，
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

// 结构性 drop 的落点映射依赖这条不变量：`groupTreeElements(root)` 的第 k 个元素
// ↔ 反序列化（进而 `parseLayoutScheme` 的 `layout-(k+1)`）的第 k 个节点。
// 两边判据不同（元素表按 `split` expando 判容器；叶子宿主按 nav/manager 判定），
// 一旦错位，drop 会把页签搬进错误的组（甚至只删不插）。
describe('groupTreeElements 与反序列化节点先序同序', () => {
	it('嵌套容器 + 叶子：元素表与 nodesOf 序一一对应（容器/叶子判定一致）', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', NESTED_MERGE_SCHEME);
		const root = fixture.directory.firstElementChild as HTMLElement;

		const elements = groupTreeElements(root);
		const nodes = nodesOf(deserializeGroupElement(root));

		expect(elements).toHaveLength(nodes.length);
		expect(nodes.map((node) => node.kind)).toEqual([
			'split',
			'split',
			'group',
			'group',
			'group'
		]);
		expect(
			elements.map((element) =>
				(element as HTMLElement & { split?: string }).split === undefined
					? 'group'
					: 'split'
			)
		).toEqual(nodes.map((node) => node.kind));
		expect(elements[0]).toBe(root);
		expect(nodes.filter((node) => node.kind === 'group').map((node) => node.tabs)).toEqual([
			['project'],
			['scene'],
			['inspector']
		]);
	});

	it('根即单组（无容器）：元素表只有一个叶子节点', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', { end: 1, tabs: ['project', 'inspector'] });
		const root = fixture.directory.firstElementChild as HTMLElement;

		const elements = groupTreeElements(root);
		const nodes = nodesOf(deserializeGroupElement(root));
		expect(elements).toEqual([root]);
		expect(nodes.map((node) => node.kind)).toEqual(['group']);
	});
});
