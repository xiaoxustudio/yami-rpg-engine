import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import TransferGlobalActor from '@app/components/commands/TransferGlobalActor.vue';
import { useTransferGlobalActorCommandSchema } from '@app/composables/commands/useTransferGlobalActorCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';

vi.mock('@app/stores/local', () => ({
	useLocalStore: () => ({ getLabel: () => '', syncState: vi.fn() })
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

const words: string[] = [];
const setWords = (): void => {
	words.length = 0;
	Command.words = {
		push: (value: string) => {
			words.push(value);
			return Command.words;
		},
		join: (separator?: string) => words.join(separator ?? '')
	} as never;
};

describe('useTransferGlobalActorCommandSchema（transferGlobalActor 命令表单 composable：insert/edit/save/parse 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
	});

	it('insert 路径：打开窗口并 load 默认 form', async () => {
		const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useTransferGlobalActorCommandSchema();
		CommandSchema.insert(target, 'transferGlobalActor');
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('transferGlobalActor');
		expect(form.actor).toEqual({ type: 'trigger' });
		expect(form.position).toEqual({ type: 'absolute', x: 0, y: 0 });
		wrapper.unmount();
	});

	it('edit 路径：handler.load 解构 params 到 form', async () => {
		const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useTransferGlobalActorCommandSchema();
		CommandSchema.edit(target, {
			id: 'transferGlobalActor',
			params: { actor: { type: 'player' }, position: { type: 'absolute', x: 5, y: 6 } }
		});
		await wrapper.vm.$nextTick();
		expect(Window.open).toHaveBeenCalledWith('transferGlobalActor');
		expect(form.actor).toEqual({ type: 'player' });
		expect(form.position).toEqual({ type: 'absolute', x: 5, y: 6 });
		wrapper.unmount();
	});

	it('save 路径：form 值经 Command.cases.transferGlobalActor.save 保存', async () => {
		const wrapper = mount(TransferGlobalActor, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const { form } = useTransferGlobalActorCommandSchema();
		Command.cases.transferGlobalActor.customLoad!({
			actor: { type: 'trigger' },
			position: { type: 'absolute', x: 0, y: 0 }
		});
		form.position = { type: 'absolute', x: 10, y: 20 };
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.transferGlobalActor.save!();
		expect(saved).toHaveBeenCalledWith({
			actor: { type: 'trigger' },
			position: { type: 'absolute', x: 10, y: 20 }
		});
		wrapper.unmount();
	});

	it('parse 路径：customParse 渲染 actor + position 文本', () => {
		setWords();
		Command.parseActor = vi.fn((a: { type: string }) => `A:${a.type}`) as never;
		Command.parsePosition = vi.fn(() => 'POS') as never;
		const contents = Command.cases.transferGlobalActor.parse!({
			actor: { type: 'trigger' },
			position: { type: 'absolute', x: 0, y: 0 }
		});
		expect(contents).toContainEqual({ text: 'A:triggerPOS' });
	});
});
