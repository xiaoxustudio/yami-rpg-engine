import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';
import ScriptWindow from '@app/components/commands/Script.vue';
import { CommandSchema } from '@app/commands/schema.ts';
import { Window } from '@app/tools/window-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { composableEls } from '@app/composables/element-registry';

const { modelMock, monacoMock } = vi.hoisted(() => {
	const modelMock = {
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
	return { modelMock, monacoMock };
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

describe('Script 语言切换按钮的接线', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		Window.open = vi.fn();
		Window.close = vi.fn();
		Editor.config = { project: 'C:/projects/test.gam' };
		modelMock.value = '';
		vi.mocked(monacoMock.editor.create).mockClear();
	});

	it('createEditor 给 #script-change 挂了 click 监听（不是 no-op），且 monaco 宿主来自注册表', async () => {
		const wrapper = mount(ScriptWindow, { attachTo: document.body });
		await wrapper.vm.$nextTick();

		const button = composableEls.get('script-change');
		expect(button).toBeTruthy();
		expect(button).toBe(document.getElementById('script-change'));
		const addEventListener = vi.spyOn(button as HTMLElement, 'addEventListener');

		CommandSchema.insert(target, 'script');
		await flush();

		const calls = addEventListener.mock.calls as unknown as Array<[string, unknown, unknown]>;
		const clickCall = calls.find((call) => call[0] === 'click');
		expect(clickCall, '没有给 #script-change 挂 click 监听').toBeTruthy();
		expect(typeof clickCall![1]).toBe('function');
		const createCalls = vi.mocked(monacoMock.editor.create).mock.calls as unknown as Array<
			[unknown, unknown]
		>;
		expect(createCalls[0][0]).toBe(composableEls.get('script-script'));

		wrapper.unmount();
	});
});
