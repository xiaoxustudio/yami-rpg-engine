import { describe, expect, it } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

interface IconsListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface IconsData {
	id: string;
	name: string;
	class: string;
	type?: string;
	value?: unknown;
	expanded?: boolean;
	children: IconsData[];
}

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

const makeData = (): IconsData[] => [
	{
		id: 'f1',
		name: 'Folder',
		class: 'folder',
		expanded: true,
		children: [{ id: 'c1', name: 'Number', class: 'file', type: 'number', children: [] }]
	},
	{ id: 'i1', name: 'String', class: 'file', type: 'string', children: [] }
];

const iconClasses = (el: IconsListEl): string[] =>
	Array.from(el.querySelectorAll('.tree-node-icon node-icon')).map((icon) => {
		const target = icon as HTMLElement;
		return target.className;
	});

describe('TreeList nodeIconRenderer（节点图标 Vue 渲染回归保护）', () => {
	it('attribute 图标按 item.type 渲染（folder/boolean/number/string/enum/object）', async () => {
		const classes = {
			boolean: 'icon-boolean',
			number: 'icon-number',
			string: 'icon-string',
			enum: 'icon-string',
			object: 'icon-object'
		};
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string; type?: string };
			if (node.class === 'folder') {
				return [h('node-icon', { class: 'icon-folder' })];
			}
			return [
				h('node-icon', { class: (classes as Record<string, string>)[node.type ?? ''] })
			];
		};
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(el.querySelectorAll('.tree-node-icon').length).toBe(3);
		expect(iconClasses(el)).toEqual(['icon-folder', 'icon-number', 'icon-string']);
		wrapper.unmount();
	});

	it('attribute type 变更后经 list.update 刷新图标（Vue patch 路径）', async () => {
		const classes = {
			boolean: 'icon-boolean',
			number: 'icon-number',
			string: 'icon-string',
			enum: 'icon-string',
			object: 'icon-object'
		};
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string; type?: string };
			if (node.class === 'folder') {
				return [h('node-icon', { class: 'icon-folder' })];
			}
			return [
				h('node-icon', { class: (classes as Record<string, string>)[node.type ?? ''] })
			];
		};
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list2', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		(data[1] as IconsData & { type?: string }).type = 'boolean';
		el.update();
		expect(iconClasses(el)).toEqual(['icon-folder', 'icon-number', 'icon-boolean']);
		wrapper.unmount();
	});

	it('enum 图标渲染（folder/string）', async () => {
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string };
			return [
				h('node-icon', { class: node.class === 'folder' ? 'icon-folder' : 'icon-string' })
			];
		};
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list3', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(iconClasses(el)).toEqual(['icon-folder', 'icon-string', 'icon-string']);
		wrapper.unmount();
	});

	it('variable 图标按 typeof value 渲染', async () => {
		const classes = {
			boolean: 'icon-boolean',
			number: 'icon-number',
			string: 'icon-string',
			object: 'icon-object'
		};
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string; value?: unknown };
			if (node.class === 'folder') {
				return [h('node-icon', { class: 'icon-folder' })];
			}
			return [
				h('node-icon', { class: (classes as Record<string, string>)[typeof node.value] })
			];
		};
		const data: IconsData[] = [
			{ id: 'f1', name: 'Folder', class: 'folder', children: [] },
			{ id: 'v1', name: 'Bool', class: 'file', value: true, children: [] },
			{ id: 'v2', name: 'Object', class: 'file', value: null, children: [] }
		];
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list4', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		el.bind(() => data);
		el.update();
		expect(iconClasses(el)).toEqual(['icon-folder', 'icon-boolean', 'icon-object']);
		wrapper.unmount();
	});

	it('未提供 nodeIconRenderer 时回退 createIcon 覆写（不创建空容器）', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list6' },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl & {
			createIcon: (item: unknown) => HTMLElement;
		};
		mockHeight(el);
		el.createIcon = () => {
			const icon = document.createElement('node-icon');
			icon.className = 'icon-custom';
			return icon;
		};
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(el.querySelectorAll('.tree-node-icon').length).toBe(0);
		expect(el.querySelectorAll('node-item node-icon').length).toBe(3);
		expect(el.querySelectorAll('node-item node-icon.icon-custom').length).toBe(3);
		wrapper.unmount();
	});

	it('localization 图标渲染（folder/string）', async () => {
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string };
			return [
				h('node-icon', { class: node.class === 'folder' ? 'icon-folder' : 'icon-string' })
			];
		};
		const wrapper = mount(TreeList, {
			props: { id: 'icons-list5', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		expect(el.querySelectorAll('.tree-node-icon').length).toBe(3);
		expect(iconClasses(el)).toEqual(['icon-folder', 'icon-string', 'icon-string']);
		wrapper.unmount();
	});

	it('scene 图标按 item.class 渲染（folder/actor/region/light/animation/particle/parallax/tilemap）', async () => {
		const teams: Record<string, { color?: string }> = {
			t1: { color: 'ff0000ff' }
		};
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as {
				class?: string;
				teamId?: string;
				color?: string;
				red?: number;
				green?: number;
				blue?: number;
				image?: string;
			};
			switch (node.class) {
				case 'folder':
					return [h('node-icon', { class: 'icon-folder' })];
				case 'actor': {
					const team = teams[node.teamId ?? ''];
					const hex = team?.color ?? 'ffffffff';
					const r = parseInt(hex.slice(0, 2), 16);
					const g = parseInt(hex.slice(2, 4), 16);
					const b = parseInt(hex.slice(4, 6), 16);
					const a = parseInt(hex.slice(6, 8), 16) / 255;
					return [
						h(
							'node-icon',
							{ style: { color: `rgba(${r}, ${g}, ${b}, ${a})` } },
							'\uf2c0'
						)
					];
				}
				case 'region': {
					const hex = node.color ?? '';
					const r = parseInt(hex.slice(0, 2), 16);
					const g = parseInt(hex.slice(2, 4), 16);
					const b = parseInt(hex.slice(4, 6), 16);
					const a = parseInt(hex.slice(6, 8), 16) / 255;
					return [
						h('node-icon', {
							class: 'icon-scene-region',
							style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }
						})
					];
				}
				case 'light':
					return [
						h(
							'node-icon',
							{
								style: { color: `rgba(${node.red}, ${node.green}, ${node.blue})` }
							},
							'\uf006'
						)
					];
				case 'animation':
					return [h('node-icon', {}, '\uf110')];
				case 'particle':
					return [h('node-icon', {}, '\uf2dc')];
				case 'parallax':
					return [h('node-icon', {}, '\uf1c5')];
				case 'tilemap':
					return [h('node-icon', {}, '\uf00a')];
				default:
					return [h('node-icon', { class: 'icon-file' })];
			}
		};
		const data = [
			{ id: 'f1', name: 'Folder', class: 'folder', children: [] },
			{ id: 'a1', name: 'Actor', class: 'actor', teamId: 't1', children: [] },
			{ id: 'a2', name: 'Actor2', class: 'actor', teamId: 'missing', children: [] },
			{ id: 'r1', name: 'Region', class: 'region', color: 'ff00ffff', children: [] },
			{
				id: 'l1',
				name: 'Light',
				class: 'light',
				red: 255,
				green: 0,
				blue: 128,
				children: []
			},
			{ id: 'an1', name: 'Animation', class: 'animation', children: [] },
			{ id: 'p1', name: 'Particle', class: 'particle', children: [] },
			{ id: 'pl1', name: 'Parallax', class: 'parallax', image: 'missing', children: [] },
			{ id: 't1', name: 'Tilemap', class: 'tilemap', children: [] }
		];
		const wrapper = mount(TreeList, {
			props: { id: 'icons-scene', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		el.bind(() => data);
		el.update();
		const icons = Array.from(el.querySelectorAll('.tree-node-icon node-icon')) as HTMLElement[];
		expect(icons).toHaveLength(9);
		expect(icons[0].className).toBe('icon-folder');
		expect(icons[1].style.color).toBe('rgb(255, 0, 0)');
		expect(icons[1].textContent).toBe('\uf2c0');
		expect(icons[2].style.color).toBe('rgb(255, 255, 255)');
		expect(icons[3].className).toBe('icon-scene-region');
		expect(icons[3].style.backgroundColor).toBe('rgb(255, 0, 255)');
		expect(icons[4].style.color).toBe('rgb(255, 0, 128)');
		expect(icons[4].textContent).toBe('\uf006');
		expect(icons[5].textContent).toBe('\uf110');
		expect(icons[6].textContent).toBe('\uf2dc');
		expect(icons[7].textContent).toBe('\uf1c5');
		expect(icons[8].textContent).toBe('\uf00a');
		wrapper.unmount();
	});

	it('scene actor 队伍变更后经 list.update 刷新图标（Vue patch 路径）', async () => {
		const teams: Record<string, { color?: string }> = {
			t1: { color: 'ff0000ff' },
			t2: { color: '00ff00ff' }
		};
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { class?: string; teamId?: string };
			const team = teams[node.teamId ?? ''];
			const hex = team?.color ?? 'ffffffff';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [h('node-icon', { style: { color: `rgba(${r}, ${g}, ${b}, ${a})` } }, '\uf2c0')];
		};
		const data = [{ id: 'a1', name: 'Actor', class: 'actor', teamId: 't1', children: [] }];
		const wrapper = mount(TreeList, {
			props: { id: 'icons-scene2', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		el.bind(() => data);
		el.update();
		(data[0] as { teamId: string }).teamId = 't2';
		el.update();
		const icon = el.querySelector('.tree-node-icon node-icon') as HTMLElement;
		expect(icon.style.color).toBe('rgb(0, 255, 0)');
		wrapper.unmount();
	});

	it('team 图标按 item.color 渲染（team-icon + rgba 背景色 + 可点击）', async () => {
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { color?: string };
			const color = node.color ?? '';
			const r = parseInt(color.slice(0, 2), 16);
			const g = parseInt(color.slice(2, 4), 16);
			const b = parseInt(color.slice(4, 6), 16);
			const a = parseInt(color.slice(6, 8), 16) / 255;
			return [
				h('node-icon', {
					class: 'team-icon',
					style: {
						backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
						pointerEvents: 'auto'
					}
				})
			];
		};
		const data = [
			{ id: 't1', name: 'Red', color: 'ff0000ff', children: [] },
			{ id: 't2', name: 'Green', color: '00ff00ff', children: [] }
		];
		const wrapper = mount(TreeList, {
			props: { id: 'icons-team', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		el.bind(() => data);
		el.update();
		const icons = Array.from(el.querySelectorAll('.tree-node-icon node-icon')) as HTMLElement[];
		expect(icons).toHaveLength(2);
		expect(icons[0].className).toBe('team-icon');
		expect(icons[0].style.backgroundColor).toBe('rgb(255, 0, 0)');
		expect(icons[0].style.pointerEvents).toBe('auto');
		expect(icons[1].style.backgroundColor).toBe('rgb(0, 255, 0)');
		wrapper.unmount();
	});

	it('team 颜色变更后经 list.update 刷新图标（Vue patch 路径）', async () => {
		const nodeIconRenderer = (item: unknown): VNode[] => {
			const node = item as { color?: string };
			const color = node.color ?? '';
			const r = parseInt(color.slice(0, 2), 16);
			const g = parseInt(color.slice(2, 4), 16);
			const b = parseInt(color.slice(4, 6), 16);
			const a = parseInt(color.slice(6, 8), 16) / 255;
			return [
				h('node-icon', {
					class: 'team-icon',
					style: {
						backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
						pointerEvents: 'auto'
					}
				})
			];
		};
		const data = [{ id: 't1', name: 'Red', color: 'ff0000ff', children: [] }];
		const wrapper = mount(TreeList, {
			props: { id: 'icons-team2', nodeIconRenderer },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as IconsListEl;
		mockHeight(el);
		el.bind(() => data);
		el.update();
		(data[0] as { color: string }).color = '00ff00ff';
		el.update();
		const icon = el.querySelector('.tree-node-icon node-icon') as HTMLElement;
		expect(icon.style.backgroundColor).toBe('rgb(0, 255, 0)');
		wrapper.unmount();
	});

	it('plugin/command/easing 窗口命令色点图标渲染（custom/flow + folder 分支）', async () => {
		const renderers: Record<string, (item: unknown) => VNode[]> = {
			plugin: (item: unknown): VNode[] => {
				const node = item as { class?: string };
				if (node.class === 'folder') {
					return [h('node-icon', { class: 'icon-folder' })];
				}
				return [h('node-icon', { class: ['icon-command', 'custom'] })];
			},
			command: (item: unknown): VNode[] => {
				const node = item as { class?: string };
				if (node.class === 'folder') {
					return [h('node-icon', { class: 'icon-folder' })];
				}
				return [h('node-icon', { class: ['icon-command', 'custom'] })];
			},
			easing: (item: unknown): VNode[] => {
				const node = item as { class?: string };
				if (node.class === 'folder') {
					return [h('node-icon', { class: 'icon-folder' })];
				}
				return [h('node-icon', { class: ['icon-command', 'flow'] })];
			}
		};
		for (const [key, renderer] of Object.entries(renderers)) {
			const data: IconsData[] = [
				{ id: 'f1', name: 'Folder', class: 'folder', children: [] },
				{ id: 'i1', name: 'Item', class: 'file', children: [] }
			];
			const wrapper = mount(TreeList, {
				props: { id: 'icons-cmd-' + key, nodeIconRenderer: renderer },
				attachTo: document.body
			});
			await wrapper.vm.$nextTick();
			const el = wrapper.element as unknown as IconsListEl;
			mockHeight(el);
			el.bind(() => data);
			el.update();
			const icons = el.querySelectorAll('.tree-node-icon node-icon');
			expect(icons.length).toBe(2);
			expect(icons[0].className).toContain('icon-folder');
			expect(icons[1].className).toContain('icon-command');
			wrapper.unmount();
		}
	});
});
