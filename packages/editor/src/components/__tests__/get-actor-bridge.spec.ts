import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import GetActor from '@app/components/commands/GetActor.vue';
import { Command } from '@/command/command-object.ts';
import { VariableGetter } from '@/command/variable-accessor-window.ts';
import { Attribute } from '@/attribute/attribute-window.ts';
import { Data } from '@/data/data-object.ts';
import '@/module/command/getActor.ts';

interface GetActorFrame extends HTMLElement {
	setForm(data: Record<string, unknown>): void;
	getForm(): Record<string, unknown>;
}

const getFrame = (): GetActorFrame =>
	document.getElementById('getActor') as unknown as GetActorFrame;

describe('getActor 窗口表单桥接（Vue 双向绑定迁移回归）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		VariableGetter.isNone = (variable: { key: string }) => variable.key === '';
		Attribute.getAttributeItems = vi.fn(() => []) as never;
		Attribute.getDefAttributeId = vi.fn(() => 'id0') as never;
		Data.teams = { list: [{ id: 'team0' }] } as never;
		Data.createTeamItems = vi.fn(() => []) as never;
	});

	it('窗口根元素暴露 setForm/getForm 桥接，setForm 写入控件 DOM', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		expect(typeof frame.setForm).toBe('function');
		expect(typeof frame.getForm).toBe('function');
		frame.setForm({
			area: 'circle',
			radius: 2.5,
			selector: 'team',
			teamId: 'team0',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: 'maxhp',
			exclusion: 'team',
			exclusionTeamId: 'team1'
		});
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.area).toBe('circle');
		expect(form.radius).toBe(2.5);
		expect(form.selector).toBe('team');
		expect(form.teamId).toBe('team0');
		expect(form.condition).toBe('min-attribute-ratio');
		expect(form.attribute).toBe('hp');
		expect(form.divisor).toBe('maxhp');
		expect(form.exclusion).toBe('team');
		expect(form.exclusionTeamId).toBe('team1');
		const radius = document.getElementById('getActor-radius') as unknown as HTMLElement & {
			read(): unknown;
		};
		expect(radius.read()).toBe(2.5);
		wrapper.unmount();
	});

	it('控件值变更在 getForm 时读回（CustomBox/SelectBox/SelectVar/NumberVar）', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const frame = getFrame();
		const variable = document.getElementById('getActor-variable') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		variable.input({ type: 'local', key: 'targets' });
		const area = document.getElementById('getActor-area') as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		area.input('square');
		const size = document.getElementById('getActor-size') as unknown as HTMLElement & {
			write(value: number): void;
		};
		size.write(3);
		const activation = document.getElementById(
			'getActor-activation'
		) as unknown as HTMLElement & {
			input(value: unknown): void;
		};
		activation.input('inactive');
		await wrapper.vm.$nextTick();
		const form = frame.getForm();
		expect(form.variable).toEqual({ type: 'local', key: 'targets' });
		expect(form.area).toBe('square');
		expect(form.size).toBe(3);
		expect(form.activation).toBe('inactive');
		wrapper.unmount();
	});

	it('customLoad 经 setForm 填充表单（含 selector/activation remap 与属性项加载）', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.getActor.customLoad!({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'square',
			size: 4,
			selector: 'team-member',
			teamId: 'team0',
			condition: 'max-attribute-value',
			attribute: 'hp',
			activation: 'either',
			exclusion: 'actor',
			exclusionActor: { type: 'actor', key: 'a1' },
			active: false
		});
		await wrapper.vm.$nextTick();
		expect(Attribute.getAttributeItems).toHaveBeenCalledWith('actor', 'number');
		const form = getFrame().getForm();
		expect(form.variable).toEqual({ type: 'local', key: 'foo' });
		expect(form.area).toBe('square');
		expect(form.size).toBe(4);
		expect(form.selector).toBe('team');
		expect(form.teamId).toBe('team0');
		expect(form.condition).toBe('max-attribute-value');
		expect(form.attribute).toBe('hp');
		expect(form.activation).toBe('either');
		expect(form.exclusion).toBe('actor');
		expect(form.exclusionActor).toEqual({ type: 'actor', key: 'a1' });
		wrapper.unmount();
	});

	it('customSave 经 getForm 保存（circle/any/ratio/team 组合）', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getActor.customLoad!({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'circle',
			radius: 1.5,
			selector: 'any',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: 'maxhp',
			activation: 'active',
			exclusion: 'team',
			exclusionTeamId: 'team1'
		});
		await wrapper.vm.$nextTick();
		Command.cases.getActor.customSave!();
		expect(saved).toHaveBeenCalledWith({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'circle',
			radius: 1.5,
			selector: 'any',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: 'maxhp',
			activation: 'active',
			exclusion: 'team',
			exclusionTeamId: 'team1'
		});
		wrapper.unmount();
	});

	it('customSave 校验失败时聚焦对应控件且不保存（divisor 未选）', async () => {
		const wrapper = mount(GetActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.getActor.customLoad!({
			variable: { type: 'local', key: 'foo' },
			position: { type: 'absolute', x: 1, y: 2 },
			area: 'square',
			size: 1,
			selector: 'enemy',
			condition: 'min-attribute-ratio',
			attribute: 'hp',
			divisor: '',
			activation: 'active',
			exclusion: 'none'
		});
		await wrapper.vm.$nextTick();
		Command.cases.getActor.customSave!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
