import { beforeEach, describe, expect, it } from 'vitest';
import {
	Layout,
	clearLayoutMirror,
	getPageScheme,
	awaitVueLayoutLoad
} from '@app/engine/layout/layout.ts';
import { toLayoutScheme } from '../layout-scheme';
import { deserializeGroupElement } from '../layout-deserialize';
import '@app/utils/math';
import {
	buildLayoutFixture,
	collectLeaves,
	DIRECTORY_SCHEME,
	placePaletteIntoLeaves,
	movePaletteToHolder,
	SCENE_SCHEME,
	mountScheme,
	registerLayout,
	switchWorkspace,
	type SchemeNode
} from './layout-spec-utils';

// M2b 收尾：布局字典（Layout.layout / Layout.default / config.layout）生命周期金标准。
// 覆盖 saveToConfig 回写、switchLayout 缓存失效重建、loadFromConfig 接管、default 兜底。

type ConfigShape = { layout?: Record<string, SchemeNode> | null };

const load = async (
	fixture: ReturnType<typeof buildLayoutFixture>,
	key: string,
	scheme?: SchemeNode
): Promise<void> => {
	if (scheme !== undefined) {
		Layout.layout = { [key]: scheme } as unknown as typeof Layout.layout;
	}
	movePaletteToHolder(fixture);
	fixture.workspace.switch(key);
	Layout.loadLayoutScheme!(key);
	await awaitVueLayoutLoad();
	placePaletteIntoLeaves(fixture);
};

beforeEach(() => {
	document.body.innerHTML = '';
});

describe('saveToConfig 回写 DOM 变更', () => {
	it('已物化页把 DOM（含重排后的 tabs）反序列化回 layout，未物化页保持原样', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);

		const root = fixture.directory.firstElementChild as HTMLElement;
		const leaf = collectLeaves(root)[0];
		const group = leaf.manager.parentNode as HTMLElement;
		leaf.nav.appendChild(leaf.nav.querySelector('[value="project"]') as HTMLElement);
		Layout.updateGroupTabs!(group as never);

		const config: ConfigShape = {};
		Layout.saveToConfig!(config);

		expect(config.layout?.directory).toEqual({
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['inspector', 'project'] },
				{ end: 1, tabs: ['scene'] }
			]
		});
		expect(Object.keys(config.layout ?? {})).toEqual(['directory']);
	});

	it('M4-2/M5-a：退化（无页签）树不覆盖既有 layout —— 镜像缺失时不写坏 config', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);

		// 模拟半挂载/空树：宿主只剩一个空 group（无 nav/manager 页签）
		const host = fixture.directory;
		host.innerHTML = '';
		const empty = document.createElement('div');
		empty.className = 'group';
		host.append(empty);

		// M5-a：镜像仍在 → saveToConfig 读镜像，不受退化 DOM 影响
		const config: ConfigShape = {};
		Layout.saveToConfig!(config);
		expect(config.layout?.directory).toEqual(DIRECTORY_SCHEME);

		// 镜像缺失（异常态）→ 回退 DOM 快照，hasAnyTabs 守卫拦住退化 scheme
		clearLayoutMirror(fixture.directory);
		const config2: ConfigShape = {};
		Layout.saveToConfig!(config2);
		expect(config2.layout?.directory).toEqual(DIRECTORY_SCHEME);
	});
});

describe('switchLayout 缓存失效与重建', () => {
	it('切换整本字典后删除旧 page.scheme 并按新字典重建当前页', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const oldRoot = fixture.directory.firstElementChild as HTMLElement;

		const singleLeaf: SchemeNode = {
			end: 1,
			tabs: ['project', 'scene', 'inspector']
		};
		Layout.switchLayout!({ directory: singleLeaf, scene: SCENE_SCHEME } as never);
		await awaitVueLayoutLoad();

		const newRoot = fixture.directory.firstElementChild as HTMLElement;
		expect(newRoot).not.toBe(oldRoot);
		placePaletteIntoLeaves(fixture);
		expect(toLayoutScheme(deserializeGroupElement(newRoot))).toEqual(singleLeaf);
		expect(newRoot.querySelector('.nav-bar')).not.toBeNull();
		expect(
			(newRoot as HTMLElement & { manager?: { index?: string | null } }).manager?.index
		).toBe('project');
	});
});

describe('loadFromConfig 接管字典', () => {
	it('以 config.layout 驱动对应工作区加载', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		Layout.loadFromConfig!({ layout: { directory: SCENE_SCHEME } } as never);
		await load(fixture, 'directory');

		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(toLayoutScheme(deserializeGroupElement(root))).toEqual(SCENE_SCHEME);
	});
});

describe('loadLayoutScheme default 兜底', () => {
	it('layout 缺 key 时回落到 Layout.default 建树', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		Layout.layout = {} as unknown as typeof Layout.layout;
		Layout.default = { directory: DIRECTORY_SCHEME } as unknown as typeof Layout.default;
		await load(fixture, 'directory');

		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(root).toBeTruthy();
		expect(toLayoutScheme(deserializeGroupElement(root))).toEqual(DIRECTORY_SCHEME);
		expect(getPageScheme(fixture.directory)).toBe(DIRECTORY_SCHEME);
	});

	it('layout 与 default 都缺 key 时不构建（当前页保持为空）', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		Layout.layout = {} as unknown as typeof Layout.layout;
		Layout.default = null;
		switchWorkspace(fixture, 'directory');

		Layout.loadLayoutScheme!('directory');
		expect(fixture.directory.querySelector('.group')).toBeNull();
	});
});
