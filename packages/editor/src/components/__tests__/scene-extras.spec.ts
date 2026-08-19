import { describe, expect, it } from 'vitest';
import { h, type VNode } from 'vue';
import { mount } from '@vue/test-utils';
import TreeList from '@app/components/common/TreeList.vue';

interface ExtrasListEl extends HTMLElement {
	bind: (fn: () => unknown[]) => void;
	update: () => void;
}

interface SceneItemLike {
	id: string;
	name: string;
	class: string;
	enabled?: boolean;
	events?: unknown[];
	scripts?: unknown[];
	conditions?: unknown[];
	hidden?: boolean;
	locked?: boolean;
	children: SceneItemLike[];
	element?: HTMLElement;
}

const sceneNodeExtras = (item: unknown): VNode[] => {
	const node = item as SceneItemLike;
	const nodes: VNode[] = [];
	if (node.conditions instanceof Array && node.enabled === false) {
		nodes.push(h('node-icon', { class: 'icon-conditional' }, '!'));
	} else if (
		node.conditions instanceof Array &&
		node.enabled !== false &&
		node.conditions.length !== 0
	) {
		nodes.push(h('node-icon', { class: 'icon-conditional' }, '?'));
	}
	if (node.events instanceof Array && node.events.length !== 0) {
		nodes.push(h('node-icon', { class: 'icon-eventEnabled' }, 'E'));
	}
	if (node.scripts instanceof Array && node.scripts.length !== 0) {
		nodes.push(h('node-icon', { class: 'icon-scriptEnabled' }, '\uf121'));
	}
	nodes.push(
		h(
			'visibility-icon',
			{ class: { 'node-icon-highlight': !!node.hidden } },
			node.hidden ? '\uf070' : '\uf06e'
		)
	);
	nodes.push(
		h(
			'lock-icon',
			{ class: { 'node-icon-highlight': !!node.locked } },
			node.locked ? '\uf023' : '\uf09c'
		)
	);
	return nodes;
};

const makeData = (): SceneItemLike[] => [
	{
		id: 'n1',
		name: 'Node',
		class: 'file',
		enabled: true,
		events: [{ id: 'e1' }],
		scripts: [{ id: 's1' }],
		conditions: [{ id: 'c1' }],
		hidden: true,
		locked: false,
		children: []
	}
];

const mockHeight = (el: HTMLElement): void => {
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'innerHeight', { value: 400, configurable: true });
	Object.defineProperty(el, 'clientWidth', { value: 300, configurable: true });
};

describe('scene 列表图标渲染（事件/脚本/条件/可见性/锁定）', () => {
	it('节点渲染事件/脚本/条件/可见性/锁定图标', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'scene-list-test', nodeExtras: sceneNodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data = makeData();
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		const extrasEls = el.querySelectorAll('.tree-node-extras');
		expect(el.querySelector('.icon-eventEnabled')).toBeTruthy();
		expect(el.querySelector('.icon-scriptEnabled')).toBeTruthy();
		expect(el.querySelector('.icon-conditional')).toBeTruthy();
		expect(el.querySelector('visibility-icon')).toBeTruthy();
		expect(el.querySelector('lock-icon')).toBeTruthy();
		const itemEl = data[0].element as HTMLElement | undefined;
		expect(itemEl?.querySelector('.icon-eventEnabled')?.textContent).toBe('E');
		wrapper.unmount();
	});

	it('events 为空时不渲染事件图标', async () => {
		const wrapper = mount(TreeList, {
			props: { id: 'scene-list-test2', nodeExtras: sceneNodeExtras },
			attachTo: document.body
		});
		await wrapper.vm.$nextTick();
		const el = wrapper.element as unknown as ExtrasListEl;
		mockHeight(el);
		const data = [{ id: 'n2', name: 'Node2', class: 'file', events: [], children: [] }];
		el.bind(() => data);
		el.update();
		await wrapper.vm.$nextTick();
		expect(el.querySelector('.icon-eventEnabled')).toBeNull();
		wrapper.unmount();
	});
});
