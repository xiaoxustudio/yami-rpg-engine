import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { useFileTriggerPage } from '@app/composables/useFileTriggerPage';

interface TriggerShape {
	type: string;
	width?: number;
	height?: number;
	anchor?: number;
	radius?: number;
	centralAngle?: number;
}

interface TriggerData {
	selector: string;
	onHitWalls: string;
	onHitActors: string;
	hitCount: number;
	speed: number;
	hitMode: string;
	hitInterval: number;
	initialDelay: number;
	effectiveTime: number;
	duration: number;
	inherit: string;
	animationId: string;
	motion: string;
	priority: number;
	offsetY: number;
	rotatable: boolean;
	shape: TriggerShape;
}

const fileTrigger = vi.hoisted(() => ({
	target: null as TriggerData | null,
	update: vi.fn()
}));

vi.mock('@/inspector/inspector.ts', () => ({
	Inspector: {
		fileTrigger,
		getKey: (el: HTMLElement) => el.id.slice(el.id.indexOf('-') + 1)
	}
}));

const Host = defineComponent({
	setup() {
		return useFileTriggerPage();
	},
	render: () => null
});

const makeTrigger = (overrides: Partial<TriggerData> = {}): TriggerData => ({
	selector: 'enemy',
	onHitWalls: 'penetrate',
	onHitActors: 'penetrate',
	hitCount: 2,
	speed: 0,
	hitMode: 'once',
	hitInterval: 0,
	initialDelay: 0,
	effectiveTime: 0,
	duration: 0,
	inherit: '',
	animationId: '',
	motion: '',
	priority: 0,
	offsetY: 0,
	rotatable: true,
	shape: { type: 'circle', radius: 0.5 },
	...overrides
});

describe('useFileTriggerPage（fileTrigger inspector 页面 composable）', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		fileTrigger.target = null;
		fileTrigger.update.mockClear();
	});

	const mountPage = () => {
		const wrapper = mount(Host);
		return {
			wrapper,
			page: wrapper.vm as unknown as ReturnType<typeof useFileTriggerPage>
		};
	};

	it('sync 从 Inspector.fileTrigger.target 填充 form（含 shape 默认值）', () => {
		const { wrapper, page } = mountPage();
		fileTrigger.target = makeTrigger({
			shape: { type: 'rectangle', width: 3, height: 2, anchor: 0.5 }
		});
		page.sync();
		expect(page.form.selector).toBe('enemy');
		expect(page.form.onHitWalls).toBe('penetrate');
		expect(page.form.onHitActors).toBe('penetrate');
		expect(page.form.hitCount).toBe(2);
		expect(page.form.speed).toBe(0);
		expect(page.form.hitMode).toBe('once');
		expect(page.form.hitInterval).toBe(0);
		expect(page.form.initialDelay).toBe(0);
		expect(page.form.effectiveTime).toBe(0);
		expect(page.form.duration).toBe(0);
		expect(page.form.inherit).toBe('');
		expect(page.form.animationId).toBe('');
		expect(page.form.motion).toBe('');
		expect(page.form.priority).toBe(0);
		expect(page.form.offsetY).toBe(0);
		expect(page.form.rotatable).toBe(true);
		expect(page.form.shapeType).toBe('rectangle');
		expect(page.form.shapeWidth).toBe(3);
		expect(page.form.shapeHeight).toBe(2);
		expect(page.form.shapeAnchor).toBe(0.5);
		expect(page.form.shapeRadius).toBe(0.5);
		expect(page.form.shapeCentralAngle).toBe(90);
		wrapper.unmount();
	});

	it('target 为 null 时 sync 不覆盖 form', () => {
		const { wrapper, page } = mountPage();
		fileTrigger.target = makeTrigger();
		page.sync();
		fileTrigger.target = null;
		page.sync();
		expect(page.form.selector).toBe('enemy');
		expect(page.form.shapeRadius).toBe(0.5);
		wrapper.unmount();
	});

	it('onParamInput 找不到 fileTrigger 控件时跳过 update', () => {
		const { wrapper, page } = mountPage();
		fileTrigger.target = makeTrigger();
		const el = document.createElement('input');
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileTrigger.update).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('onParamInput 从嵌套元素向上解析控件并调用 update + 重新 sync', () => {
		const { wrapper, page } = mountPage();
		fileTrigger.update.mockImplementation(
			(trigger: TriggerData, key: string, value: unknown) => {
				(trigger as unknown as Record<string, unknown>)[key] = value;
			}
		);
		fileTrigger.target = makeTrigger();
		const el = document.createElement('div') as HTMLElement & { read: () => string };
		el.id = 'fileTrigger-selector';
		el.read = () => 'friend';
		const input = document.createElement('input');
		el.appendChild(input);
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		input.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileTrigger.update).toHaveBeenCalledWith(fileTrigger.target, 'selector', 'friend');
		expect(page.form.selector).toBe('friend');
		wrapper.unmount();
	});

	it('onParamInput 直接落在控件元素上', () => {
		const { wrapper, page } = mountPage();
		fileTrigger.target = makeTrigger();
		const el = document.createElement('div') as HTMLElement & { read: () => number };
		el.id = 'fileTrigger-hitCount';
		el.read = () => 5;
		document.body.appendChild(el);
		el.addEventListener('input', (e) => page.onParamInput(e));
		el.dispatchEvent(new Event('input', { bubbles: true }));
		expect(fileTrigger.update).toHaveBeenCalledWith(fileTrigger.target, 'hitCount', 5);
		wrapper.unmount();
	});
});
