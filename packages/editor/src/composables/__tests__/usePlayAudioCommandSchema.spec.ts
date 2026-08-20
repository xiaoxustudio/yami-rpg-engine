import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import PlayAudio from '@app/components/commands/PlayAudio.vue';
import { Command } from '@app/legacy/command/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/legacy/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

interface ControlEl extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
}

const getControl = (id: string): ControlEl => document.getElementById(id) as unknown as ControlEl;

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

describe('usePlayAudioCommandSchema（playAudio 命令表单 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form 到控件 DOM', async () => {
		const wrapper = mount(PlayAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'playAudio');
		expect(Window.open).toHaveBeenCalledWith('playAudio');
		expect(getControl('playAudio-type').read()).toBe('se-attenuated');
		expect(getControl('playAudio-audio').read()).toBe('');
		expect(getControl('playAudio-volume').read()).toBe(1);
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到控件 DOM', async () => {
		const wrapper = mount(PlayAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'playAudio',
			params: { type: 'bgm', audio: 'audio1', volume: 0.5 }
		});
		expect(Window.open).toHaveBeenCalledWith('playAudio');
		expect(getControl('playAudio-type').read()).toBe('bgm');
		expect(getControl('playAudio-audio').read()).toBe('audio1');
		expect(getControl('playAudio-volume').read()).toBe(0.5);
		wrapper.unmount();
	});

	it('save 路径：audio 为空时校验失败不保存', async () => {
		const wrapper = mount(PlayAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAudio.customLoad!({ type: 'bgm', audio: '', volume: 1 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAudio.save!();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：type=bgm 时不保存 location', async () => {
		const wrapper = mount(PlayAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAudio.customLoad!({ type: 'bgm', audio: 'audio1', volume: 1 });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAudio.save!();
		expect(saved).toHaveBeenCalledWith({ type: 'bgm', audio: 'audio1', volume: 1 });
		wrapper.unmount();
	});

	it('save 路径：type=se-attenuated 时保存 location', async () => {
		const wrapper = mount(PlayAudio, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		Command.cases.playAudio.customLoad!({
			type: 'se-attenuated',
			audio: 'audio1',
			volume: 1,
			location: { type: 'absolute', x: 1, y: 2 }
		});
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.playAudio.save!();
		expect(saved).toHaveBeenCalledWith({
			type: 'se-attenuated',
			audio: 'audio1',
			volume: 1,
			location: { type: 'absolute', x: 1, y: 2 }
		});
		wrapper.unmount();
	});
});
