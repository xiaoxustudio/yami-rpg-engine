import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YMFilterBox from '../YMFilterBox.vue';

const createFakeContext = () => {
	const gradient = { addColorStop: () => {} };
	const ctx: {
		gradient: null;
		globalCompositeOperation: string;
		globalAlpha: number;
		fillStyle: string;
		createLinearGradient: () => { addColorStop: () => void };
		fillRect: () => void;
	} = {
		gradient: null,
		globalCompositeOperation: 'source-over',
		globalAlpha: 1,
		fillStyle: '',
		createLinearGradient: () => gradient,
		fillRect: () => {}
	};
	return ctx;
};

beforeEach(() => {
	HTMLCanvasElement.prototype.getContext = (() =>
		createFakeContext()) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

describe('YMFilterBox', () => {
	it('renders width/height attributes', () => {
		const wrapper = mount(YMFilterBox, { props: { width: 64, height: 32 } });
		expect(wrapper.attributes('width')).toBe('64');
		expect(wrapper.attributes('height')).toBe('32');
	});

	it('write creates canvas and draws', async () => {
		const wrapper = mount(YMFilterBox, { props: { width: 64, height: 32 } });
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.write([0, 0, 0, 0]);
		await wrapper.vm.$nextTick();
		const canvas = wrapper.find('canvas');
		expect(canvas.exists()).toBe(true);
		expect(canvas.attributes('width')).toBe('64');
	});

	it('read returns last written value', () => {
		const wrapper = mount(YMFilterBox, { props: { width: 64, height: 32 } });
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.write([10, -20, 30, 128]);
		expect(vm.read()).toEqual([10, -20, 30, 128]);
	});

	it('clear removes canvas', async () => {
		const wrapper = mount(YMFilterBox, { props: { width: 64, height: 32 } });
		const vm = wrapper.vm as unknown as Record<string, any>;
		vm.write([0, 0, 0, 0]);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('canvas').exists()).toBe(true);
		vm.clear();
		await wrapper.vm.$nextTick();
		expect(wrapper.find('canvas').exists()).toBe(false);
	});
});
