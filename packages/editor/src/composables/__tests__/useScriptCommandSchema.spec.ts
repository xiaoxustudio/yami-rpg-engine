import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ScriptWindow from '@app/components/commands/Script.vue';
import { Command } from '@app/commands/command-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { composableEls } from '@app/composables/element-registry';
import { loadDtsFolder } from '@app/module/global';

const { modelMock, monacoMock } = vi.hoisted(() => {
	const modelMock: {
		value: string;
		getValue(): string;
		setValue(value: string): void;
		getAlternativeVersionId(): number;
		getLanguageId(): string;
	} = {
		value: '',
		getValue: () => modelMock.value,
		setValue: (value: string) => {
			modelMock.value = value;
		},
		getAlternativeVersionId: () => 0,
		getLanguageId: () => 'javascript'
	};
	const editorMock = {
		focus: vi.fn(),
		layout: vi.fn(),
		setPosition: vi.fn(),
		setScrollTop: vi.fn(),
		revealLine: vi.fn(),
		getModel: () => modelMock,
		onKeyDown: vi.fn(),
		onDidChangeModelContent: vi.fn()
	};
	const monacoMock = {
		Position: class Position {
			line = 0;
			column = 0;
			constructor(line: number, column: number) {
				this.line = line;
				this.column = column;
			}
		},
		editor: {
			create: vi.fn(() => editorMock),
			setModelLanguage: vi.fn(),
			defineTheme: vi.fn()
		}
	};
	return { modelMock, editorMock, monacoMock };
});

vi.mock('@app/utils/monaco', () => ({
	getMonaco: vi.fn(() => Promise.resolve(monacoMock))
}));

vi.mock('@app/module/global', () => ({
	loadDtsFolder: vi.fn(() => [])
}));

const target = {
	scrollAndResize: vi.fn(),
	getSelectionPosition: () => ({ x: 100, y: 100 }),
	save: vi.fn()
};

const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('useScriptCommandSchema（script 命令 Monaco 编辑器 composable：insert/edit/save 路径）', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Window.confirm = vi.fn();
		Editor.config = { project: 'C:/projects/test.gam' };
		modelMock.value = '';
		vi.mocked(loadDtsFolder).mockClear();
		vi.mocked(window.yami!.invoke.tscFile).mockClear();
		vi.mocked(monacoMock.editor.create).mockClear();
		vi.mocked(monacoMock.editor.setModelLanguage).mockClear();
	});

	it('insert 路径：打开窗口并创建 Monaco 编辑器加载默认空脚本', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.insert(target, 'script');
		expect(Window.open).toHaveBeenCalledWith('script');
		await flush();
		expect(monacoMock.editor.create).toHaveBeenCalledTimes(1);
		expect(modelMock.value).toBe('');
		expect(vi.mocked(loadDtsFolder).mock.calls[0][0]).toContain('Script');
		wrapper.unmount();
	});

	it('edit 路径：脚本内容写入 Monaco model 并同步 form', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'script',
			params: { script: 'let x = 1;' }
		});
		expect(Window.open).toHaveBeenCalledWith('script');
		await flush();
		expect(modelMock.value).toBe('let x = 1;');
		wrapper.unmount();
	});

	it('save 路径：从 Monaco model 取值保存', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'script',
			params: { script: 'const a = 1;' }
		});
		await flush();
		modelMock.value = 'const b = 2;';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.script.save!();
		await flush();
		expect(saved).toHaveBeenCalledWith({ script: 'const b = 2;' });
		wrapper.unmount();
	});

	it('save 路径：空脚本校验失败不保存', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'script',
			params: { script: 'const a = 1;' }
		});
		await flush();
		modelMock.value = '';
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.script.save!();
		await flush();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('save 路径：typescript 语言经 tsc-file 编译后保存', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'script',
			params: { script: 'const a: number = 1;' }
		});
		await flush();
		modelMock.getLanguageId = () => 'typescript';
		vi.mocked(window.yami!.invoke.tscFile).mockResolvedValue({ res: 'const a = 1;' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.script.save!();
		await flush();
		expect(window.yami!.invoke.tscFile).toHaveBeenCalledWith('const a: number = 1;');
		expect(saved).toHaveBeenCalledWith({ script: 'const a = 1;' });
		wrapper.unmount();
	});

	it('save 路径：typescript 编译错误弹确认且不直接保存', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		CommandSchema.edit(target, {
			id: 'script',
			params: { script: 'const a: number = 1;' }
		});
		await flush();
		modelMock.getLanguageId = () => 'typescript';
		vi.mocked(window.yami!.invoke.tscFile).mockResolvedValue({ error: 'bad syntax' });
		const saved = vi.fn();
		Command.save = saved;
		Command.cases.script.save!();
		await flush();
		expect(Window.confirm).toHaveBeenCalled();
		expect(saved).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it('窗口事件与 monaco 宿主都从注册表取（`script` / `script-script` 已登记）', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		expect(composableEls.get('script')?.id).toBe('script');
		expect(composableEls.get('script-script')?.id).toBe('script-script');
		expect(composableEls.get('script-mark')?.id).toBe('script-mark');
		expect(composableEls.get('script-text-template')?.id).toBe('script-text-template');

		CommandSchema.insert(target, 'script');
		await flush();
		const createCalls = vi.mocked(monacoMock.editor.create).mock.calls as unknown as Array<
			[unknown, unknown]
		>;
		expect(createCalls[0][0]).toBe(composableEls.get('script-script'));

		wrapper.unmount();
	});
});
