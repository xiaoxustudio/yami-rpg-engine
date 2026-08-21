import { describe, expect, it, vi, beforeAll, beforeEach } from 'vitest';
vi.mock('@app/module/resource.ts', () => ({}));
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PluginOverview from '@app/components/tools/PluginOverview.vue';
import { applyLocaleData } from '@app/i18n';
import type { PluginMetaShape } from '@app/plugin/plugin.ts';

const helper = vi.hoisted(() => ({
	guidMap: {} as Record<string, { overview?: { plugin?: string } }>,
	openURL: vi.fn()
}));

vi.mock('@app/data/data-object.ts', () => ({
	Data: { manifest: { guidMap: helper.guidMap } }
}));

vi.mock('@app/file/file-system-core.ts', () => ({
	File: { openURL: helper.openURL }
}));

const langMap = {
	update: () => ({
		get: (key: string | undefined): string | undefined => key
	})
} as PluginMetaShape['langMap'];

const makeMeta = (): PluginMetaShape => ({
	overview: {
		requires: [],
		plugin: 'Test Plugin',
		author: 'Author Name',
		link: 'https://example.com',
		version: '1.0.0',
		deprecated: 'old',
		desc: 'A test plugin'
	},
	parameters: [
		{ key: 'hp', type: 'attribute', group: null, value: 0, filter: 'number' },
		{
			key: 'mode',
			type: 'enum-value',
			group: null,
			value: '',
			filter: 'any',
			alias: 'Mode Alias'
		},
		{ key: 'img', type: 'file', group: null, value: '', filter: 'image audio' },
		{ key: 'target', type: 'element-id', group: null, value: '' },
		{ key: 'grp', type: 'attribute-group', group: null, value: '' },
		{ key: 'enumGrp', type: 'enum-group', group: null, value: '' },
		{ key: 'num', type: 'number', group: null, value: 0 },
		{ key: 'cond', type: 'boolean', group: null, value: false, desc: 'A condition param' }
	],
	manager: {
		states: { cond: true },
		update: () => {}
	},
	langMap
});

const mountPanel = (meta: PluginMetaShape | null, detailed: boolean) => {
	setActivePinia(createPinia());
	return mount(PluginOverview, {
		props: { meta, detailed },
		attachTo: document.body
	});
};

beforeAll(() => {
	applyLocaleData('en-US', {
		properties: {
			plugin: {
				author: 'Author',
				deprecated: 'Deprecated',
				requireMissing: 'Missing: ',
				attribute: 'Attribute',
				'attribute.number': 'Attribute Number',
				key: 'Key',
				enum: 'Enum',
				value: 'Value',
				'attribute.group': 'Attribute Group',
				'enum.group': 'Enum Group',
				element: 'Element',
				id: 'ID',
				'file.image': 'Image',
				'file.audio': 'Audio',
				number: 'Number'
			}
		},
		components: {}
	});
});

beforeEach(() => {
	for (const key in helper.guidMap) {
		delete helper.guidMap[key];
	}
	helper.openURL.mockClear();
});

describe('PluginOverview（插件详情面板 Vue 渲染回归）', () => {
	it('渲染标题/版本/弃用/作者/链接/描述', () => {
		const wrapper = mountPanel(makeMeta(), false);
		expect(wrapper.find('.plugin-name').text()).toBe('Test Plugin');
		expect(wrapper.find('.plugin-version').text()).toBe('ver1.0.0');
		expect(wrapper.find('.plugin-deprecated').text()).toBe('Deprecated: old');
		expect(wrapper.find('.plugin-label').text()).toBe('Author:');
		expect(wrapper.find('.plugin-link').text()).toBe('Author Name');
		expect(wrapper.text()).toContain('A test plugin');
		expect(wrapper.find('.plugin-wrap').exists()).toBe(false);
		wrapper.unmount();
	});

	it('弃用标记为布尔值时只显示本地化前缀', () => {
		const meta = makeMeta();
		meta.overview.deprecated = true;
		const wrapper = mountPanel(meta, false);
		expect(wrapper.find('.plugin-deprecated').text()).toBe('Deprecated');
		wrapper.unmount();
	});

	it('点击作者链接调用 File.openURL', async () => {
		const wrapper = mountPanel(makeMeta(), false);
		await wrapper.find('.plugin-link').trigger('click');
		expect(helper.openURL).toHaveBeenCalledWith('https://example.com');
		wrapper.unmount();
	});

	it('详细模式渲染参数（key/别名/类型/分隔线/条件/描述）', () => {
		const wrapper = mountPanel(makeMeta(), true);
		const wraps = wrapper.findAll('.plugin-wrap');
		expect(wraps).toHaveLength(8);
		expect(wraps.map((wrap) => wrap.find('.plugin-key').text())).toEqual([
			'hp',
			'Mode Alias',
			'img',
			'target',
			'grp',
			'enumGrp',
			'num',
			'cond'
		]);
		expect(wraps[0].findAll('.plugin-type').map((el) => el.text())).toEqual([
			'Attribute Number'
		]);
		expect(wraps[1].findAll('.plugin-type').map((el) => el.text())).toEqual(['Enum(Value)']);
		expect(wraps[2].findAll('.plugin-type').map((el) => el.text())).toEqual(['Image', 'Audio']);
		expect(wraps[2].findAll('.plugin-label').map((el) => el.text())).toContain('|');
		expect(wraps[3].findAll('.plugin-type').map((el) => el.text())).toEqual(['Element(ID)']);
		expect(wraps[4].findAll('.plugin-type').map((el) => el.text())).toEqual([
			'Attribute Group'
		]);
		expect(wraps[5].findAll('.plugin-type').map((el) => el.text())).toEqual(['Enum Group']);
		expect(wraps[6].findAll('.plugin-type').map((el) => el.text())).toEqual(['Number']);
		expect(wraps[7].findAll('.plugin-label').map((el) => el.text())).toContain('?');
		expect(wraps[7].find('.plugin-param-desc').text()).toBe('A condition param');
		wrapper.unmount();
	});

	it('缺失依赖渲染告警（已加载的依赖不告警）', () => {
		helper.guidMap.g1 = { overview: { plugin: 'Loaded' } };
		helper.guidMap.g2 = { overview: { plugin: 'Other' } };
		const meta = makeMeta();
		meta.overview.requires = [
			{ plugin: 'Loaded', version: '1.0' },
			{ plugin: 'MissingA', version: '' },
			{ plugin: 'MissingB', version: '' }
		];
		const wrapper = mountPanel(meta, false);
		const warn = wrapper.find('.plugin-require-warn');
		expect(warn.exists()).toBe(true);
		expect(warn.text()).toBe('Missing: MissingA, MissingB');
		wrapper.unmount();
	});

	it('无任何信息时显示 No Description', () => {
		const meta = makeMeta();
		meta.overview = { requires: [] };
		meta.parameters = [];
		const wrapper = mountPanel(meta, true);
		expect(wrapper.text()).toContain('No Description');
		wrapper.unmount();
	});

	it('meta 为 null 时渲染为空', () => {
		const wrapper = mountPanel(null, true);
		expect(wrapper.text()).toBe('');
		wrapper.unmount();
	});
});
