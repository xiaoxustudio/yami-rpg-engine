import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMPageManager from './YMPageManager.vue';

describe('YMPageManager', () => {
	const mountWithPages = () =>
		mount(YMPageManager, {
			slots: {
				default:
					'<div class="page-frame" value="home">Home</div>' +
					'<div class="page-frame" value="scene">Scene</div>' +
					'<div>Junk</div>'
			}
		});

	it('removes non page-frame children on mount', () => {
		const wrapper = mountWithPages();
		const nodes = wrapper.findAll('.page-frame');
		expect(nodes).toHaveLength(2);
		expect(wrapper.text()).not.toContain('Junk');
	});

	it('switches visible page by value', async () => {
		const wrapper = mountWithPages();
		const vm = wrapper.vm as any;
		const frames = wrapper.findAll('.page-frame');
		expect(frames[0].classes()).not.toContain('visible');
		vm.switch('scene');
		await wrapper.vm.$nextTick();
		const after = wrapper.findAll('.page-frame');
		expect(after[1].classes()).toContain('visible');
		expect(after[0].classes()).not.toContain('visible');
	});

	it('emits switch event with last and value', async () => {
		const wrapper = mountWithPages();
		const vm = wrapper.vm as any;
		vm.switch('scene');
		await wrapper.vm.$nextTick();
		vm.switch('home');
		await wrapper.vm.$nextTick();
		const events = wrapper.emitted('switch');
		expect(events).toHaveLength(2);
		expect(events![0]).toEqual([null, 'scene']);
		expect(events![1]).toEqual(['scene', 'home']);
	});

	it('exposes switch/on and state on the root element', () => {
		const wrapper = mountWithPages();
		const el = wrapper.element as any;
		expect(typeof el.switch).toBe('function');
		expect(typeof el.on).toBe('function');
		expect(el.index).toBeNull();
		expect(el.active).toBeNull();
	});
});
