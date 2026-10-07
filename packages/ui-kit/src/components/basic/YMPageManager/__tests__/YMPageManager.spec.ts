import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import YMPageManager from '../YMPageManager.vue';
import type { PageManagerApi } from '../page-manager-api';

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
		const vm = wrapper.vm as unknown as PageManagerApi;
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
		const vm = wrapper.vm as unknown as PageManagerApi;
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
		const el = wrapper.element as unknown as PageManagerApi;
		expect(typeof el.switch).toBe('function');
		expect(typeof el.on).toBe('function');
		expect(el.index).toBeNull();
		expect(el.active).toBeNull();
	});

	it('switch 清掉全部残留 visible（含 index 未变的早退路径）', async () => {
		const wrapper = mountWithPages();
		const vm = wrapper.vm as unknown as PageManagerApi;
		const frames = wrapper.findAll('.page-frame');
		vm.switch('home');
		await wrapper.vm.$nextTick();
		frames[1].element.classList.add('visible');

		vm.switch('home');
		await wrapper.vm.$nextTick();

		expect(wrapper.element.querySelectorAll('.page-frame.visible')).toHaveLength(1);
		expect(frames[0].classes()).toContain('visible');
	});

	it('页框晚于激活写入到达（Teleport）：按当前 index 重新解析并归一化', async () => {
		const wrapper = mountWithPages();
		const vm = wrapper.vm as unknown as PageManagerApi;
		vm.switch('late');
		const arrived = document.createElement('div');
		arrived.className = 'page-frame visible';
		arrived.setAttribute('value', 'late');
		wrapper.element.appendChild(arrived);
		await Promise.resolve();

		expect(wrapper.element.querySelectorAll('.page-frame.visible')).toHaveLength(1);
		expect(arrived.classList.contains('visible')).toBe(true);
	});
});
