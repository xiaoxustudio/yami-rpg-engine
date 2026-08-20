import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getFocus, hasClass, hide, show } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { commit } from '@app/composables/useCommandSchema';
import { Editor } from '@app/services/project/editor.ts';
import { loadDtsFolder } from '@app/legacy/module/global.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { createGetter } from '@app/i18n';
import { Path } from '@app/utils/config';
import { getMonaco } from '@app/utils/monaco';
import { h, reactive, render } from 'vue';
import { getWindowStore } from '@app/stores/window';
import { CommandSchema } from '@app/commands/schema.ts';

Command.cases.script = new CommandSchema({
	name: 'script',
	fields: [{ key: 'script', default: '' }],
	colorOptions: {
		mimeType: 'javascript',
		tabSize: 2,
		theme: ''
	},
	customParse({ script }: { script: string }) {
		const contents: Record<string, unknown>[] = [{ script: script }];
		if (script.includes('\n')) {
			contents.unshift({ fold: true });
		}
		return contents;
	},
	async colorizeCodeLines(items: HTMLElement[], code: string) {
		const monaco = await getMonaco();
		const holder = document.createElement('div');
		holder.style.display = 'none';
		render(h('div', { class: 'text' }, code), holder);
		const text = holder.firstElementChild as HTMLElement;
		const options = this.colorOptions;
		options.theme = Title.theme;
		await this.createTheme!(Title.theme);
		monaco.editor.colorizeElement(text, options);
		let index = setInterval(() => {
			if (text.children.length !== 0) {
				clearInterval(index);
				const nodes = text.childNodes;
				const nLength = nodes.length;
				const sLength = nLength >> 1;
				const spans = new Array(sLength);
				for (let i = 0; i < nLength; i += 2) {
					spans[i >> 1] = nodes[i];
				}
				for (let i = 0; i < sLength; i++) {
					items[i].appendChild(spans[i]);
				}
			}
		});
	},
	createTheme: (function IIFE() {
		interface EditorThemeData {
			base: 'vs' | 'vs-dark';
			inherit: boolean;
			rules: Array<{ token: string; foreground: string }>;
			colors: Record<string, string>;
		}
		const themeData: Record<string, EditorThemeData | null> = {
			light: {
				base: 'vs',
				inherit: true,
				rules: [
					{ token: '', foreground: '#000000' },
					{ token: 'comment', foreground: '#008e00' },
					{ token: 'string', foreground: '#d01515' },
					{ token: 'string-bracket', foreground: '#0000c0' },
					{ token: 'string-escape', foreground: '#a000e6' },
					{ token: 'string-invalid', foreground: '#ff0000' },
					{ token: 'number', foreground: '#f06000' },
					{ token: 'property', foreground: '#000000' },
					{ token: 'function', foreground: '#ff0080' },
					{ token: 'class', foreground: '#000000' },
					{ token: 'regexp', foreground: '#d01515' },
					{ token: 'regexp-bracket', foreground: '#0000c0' },
					{ token: 'regexp-escape', foreground: '#a000e6' },
					{ token: 'regexp-escape-control', foreground: '#585cf6' },
					{ token: 'regexp-escape-end', foreground: '#ff8000' },
					{ token: 'regexp-range', foreground: '#0060a0' },
					{ token: 'regexp-invalid', foreground: '#ff0000' },
					{ token: 'regexp-flag', foreground: '#40a0ff' },
					{ token: 'keyword', foreground: '#c800a4' },
					{ token: 'keyword-declaration', foreground: '#c800a4' },
					{ token: 'keyword-operation', foreground: '#c800a4' },
					{ token: 'keyword-constant', foreground: '#0020e0' },
					{ token: 'keyword-builtin', foreground: '#0020e0' },
					{ token: 'keyword-highlight', foreground: '#000000' },
					{ token: 'identifier', foreground: '#1818c0' },
					{ token: 'identifier-global', foreground: '#000000' },
					{ token: 'flag', foreground: '#585cf6' },
					{ token: 'operator', foreground: '#c800a4' },
					{ token: 'delimiter', foreground: '#000000' },
					{ token: 'delimiter-bracket', foreground: '#000000' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#ff0000'
					}
				],
				colors: {
					'editor.background': '#ffffff',
					'editorWidget.background': '#f0f0f0',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#f0f0f0',
					'editorHoverWidget.border': '#c0c0c0',
					'editorCursor.foreground': '#000000',
					'editor.wordHighlightStrongBackground': '#c0ffe080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#add6ff',
					'editor.inactiveSelectionBackground': '#e5ebf1',
					'editor.findMatchBackground': '#80ff80',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#f0f0f0',
					'editorSuggestWidget.border': '#c0c0c0',
					'editorIndentGuide.background': '#f0f0f0',
					'editorIndentGuide.activeBackground': '#e0e0e0',
					'editorLineNumber.foreground': '#a0a0a0',
					'editorLineNumber.activeForeground': '#404040',
					'dropdown.background': '#ffffff',
					'menu.border': '#c0c0c0',
					'input.background': '#ffffff',
					'input.foreground': '#000000',
					'input.border': '#c0c0c0',
					'widget.shadow': '#00000000',
					focusBorder: '#0050a0',
					contrastBorder: '#c0c0c0',
					'list.activeSelectionBackground': '#e6f3ff',
					'list.activeSelectionForeground': '#000000',
					'list.highlightForeground': '#b00080',
					'list.focusHighlightForeground': '#b00080'
				}
			},
			dark: {
				base: 'vs-dark',
				inherit: true,
				rules: [
					{ token: '', foreground: '#dad6cd' },
					{ token: 'comment', foreground: '#608b4e' },
					{ token: 'string', foreground: '#a9d157' },
					{ token: 'string-bracket', foreground: '#e882b2' },
					{ token: 'string-escape', foreground: '#797be6' },
					{ token: 'string-invalid', foreground: '#f44747' },
					{ token: 'number', foreground: '#99cc66' },
					{ token: 'property', foreground: '#dad6cd' },
					{ token: 'function', foreground: '#e8dcaa' },
					{ token: 'class', foreground: '#4ec9b0' },
					{ token: 'regexp', foreground: '#a9d157' },
					{ token: 'regexp-bracket', foreground: '#e882b2' },
					{ token: 'regexp-escape', foreground: '#797be6' },
					{ token: 'regexp-escape-control', foreground: '#5bdbb1' },
					{ token: 'regexp-escape-end', foreground: '#cb6a27' },
					{ token: 'regexp-range', foreground: '#37aae4' },
					{ token: 'regexp-invalid', foreground: '#f44747' },
					{ token: 'regexp-flag', foreground: '#00d2e5' },
					{ token: 'keyword', foreground: '#569cd6' },
					{ token: 'keyword-declaration', foreground: '#569cd6' },
					{ token: 'keyword-operation', foreground: '#3e8f9a' },
					{ token: 'keyword-constant', foreground: '#3299cc' },
					{ token: 'keyword-builtin', foreground: '#6d9cbe' },
					{ token: 'keyword-highlight', foreground: '#7aca3c' },
					{ token: 'identifier', foreground: '#b0e0e6' },
					{ token: 'identifier-global', foreground: '#9ed34e' },
					{ token: 'flag', foreground: '#00d2e5' },
					{ token: 'operator', foreground: '#3e8f9a' },
					{ token: 'delimiter', foreground: '#dad6cd' },
					{ token: 'delimiter-bracket', foreground: '#dad6cd' },
					{
						token: 'delimiter-bracket-invalid',
						foreground: '#f44747'
					}
				],
				colors: {
					'editor.background': '#18191a',
					'editorWidget.background': '#242628',
					'editorWidget.border': '#00000000',
					'editorHoverWidget.background': '#1c1e20',
					'editorHoverWidget.border': '#101010',
					'editorCursor.foreground': '#ffffff',
					'editor.wordHighlightBackground': '#0060a080',
					'editor.lineHighlightBorder': '#00000000',
					'editor.selectionBackground': '#5a286f',
					'editor.inactiveSelectionBackground': '#7e668a',
					'editor.findMatchBackground': '#4030c0',
					'editor.findMatchHighlightBackground': '#00000000',
					'editorSuggestWidget.background': '#1c1e20',
					'editorSuggestWidget.border': '#101010',
					'editorIndentGuide.background': '#2c2c2c',
					'editorIndentGuide.activeBackground': '#3c3c3c',
					'editorLineNumber.foreground': '#7d7b77',
					'editorLineNumber.activeForeground': '#bebcb8',
					'dropdown.background': '#1c1e20',
					'dropdown.foreground': '#d8d8d8',
					'menu.border': '#101010',
					'input.background': '#161718',
					'input.foreground': '#d8d8d8',
					'input.border': '#000000',
					'widget.shadow': '#00000000',
					focusBorder: '#0080ff',
					contrastBorder: '#101010',
					'list.activeSelectionBackground': '#303234',
					'list.activeSelectionForeground': '#d4d4d4',
					'list.highlightForeground': '#80e0e0',
					'list.focusHighlightForeground': '#80e0e0'
				}
			}
		};
		return async function (theme: string) {
			const monaco = await getMonaco();
			const options = themeData[theme];
			if (options instanceof Object && monaco instanceof Object) {
				monaco.editor.defineTheme(theme, options);
				themeData[theme] = null;
			}
		};
	})()
});

interface ScriptEditor {
	layout(options: { width: number; height: number }): void;
	setPosition(position: unknown): void;
	setScrollTop(top: number): void;
	revealLine(line: number): void;
	focus(): void;
	getFocus?(): void;
	getModel(): { getLanguageId(): string } | null;
	onKeyDown(handler: (event: { browserEvent: KeyboardEvent }) => void): void;
	onDidChangeModelContent(
		handler: (event: { isFlush: boolean; isUndoing: boolean; isRedoing: boolean }) => void
	): void;
}

interface ScriptModel {
	setValue(value: string): void;
	getValue(): string;
	getAlternativeVersionId(): number;
}

let editor: ScriptEditor | null = null;
let model: ScriptModel | null = null;
let versionId = 0;
let changed = false;
let created = false;
let bound = false;
let typesDispose: unknown[] = [];

const form = reactive<{ script: string }>({ script: '' });

const setChangeState = (value: boolean): void => {
	if (changed !== value) {
		changed = value;
		if (value) {
			show(document.getElementById('script-mark'));
		} else {
			hide(document.getElementById('script-mark'));
		}
	}
};

const isMaximized = (): boolean => hasClass(document.getElementById('script'), 'maximized');

const resize = (): void => {
	if (!editor) return;
	const content = document.getElementById('script-script')!;
	const parent = content.parentElement!;
	if (!isMaximized()) {
		content.style.width = '';
		content.style.height = '';
		const boundingRect = content.getBoundingClientRect();
		editor.layout({
			width: boundingRect.width,
			height: parent.clientHeight - 60
		});
	} else {
		const boundingRect = content.getBoundingClientRect();
		content.style.width = parent.clientWidth - boundingRect.left * 2 + 'px';
		content.style.height = parent.clientHeight - 60 + 'px';
		editor.layout({
			width: parseFloat(content.style.width),
			height: parseFloat(content.style.height)
		});
	}
};

const createEditor = async (): Promise<void> => {
	const monaco = await getMonaco();
	const { theme } = Title;
	await Command.cases.script.createTheme(theme);
	editor = monaco.editor.create(document.getElementById('script-script')!, {
		language: 'javascript',
		theme: theme ?? '',
		tabSize: 2,
		fontSize: 14,
		lineHeight: 14,
		mouseWheelScrollSensitivity: (14 * 3) / 50,
		fastScrollSensitivity: 5,
		wordWrap: 'on',
		matchBrackets: 'never',
		folding: true,
		formatOnType: false,
		showDeprecated: false,
		selectionHighlight: true,
		detectIndentation: false,
		insertSpaces: true,
		roundedSelection: false,
		overviewRulerBorder: false,
		hideCursorInOverviewRuler: true,
		automaticLayout: false,
		hover: { enabled: true },
		lightbulb: {
			enabled: false as never
		},
		minimap: {
			enabled: false
		},
		scrollbar: {
			useShadows: false,
			horizontalScrollbarSize: 12,
			verticalScrollbarSize: 12
		}
	} as unknown as Parameters<typeof monaco.editor.create>[1]);
	model = editor!.getModel() as unknown as ScriptModel;

	document.getElementById('script-change')?.on?.('click', async () => {
		const currentLanguage = editor!.getModel()!.getLanguageId();
		let languageId = currentLanguage === 'javascript' ? 'typescript' : 'javascript';
		const get = createGetter('confirmation');
		const scriptChange = document.getElementById('script-change');
		if (scriptChange) {
			scriptChange.name =
				currentLanguage === 'javascript' ? 'script-change-ts' : 'script-change-js';
			scriptChange.textContent = get(
				currentLanguage === 'javascript' ? 'script-change-js' : 'script-change-ts'
			);
		}
		const monaco = await getMonaco();
		monaco.editor.setModelLanguage(
			model! as unknown as Parameters<typeof monaco.editor.setModelLanguage>[0],
			languageId
		);
	});

	editor!.getFocus = function (this: { focus: () => void }) {
		setTimeout(() => this.focus!());
	};

	editor!.onKeyDown((event: { browserEvent: KeyboardEvent }) => {
		const browserEvent = event.browserEvent;
		if (browserEvent.ctrlKey) {
			switch (browserEvent.code) {
				case 'Enter':
					browserEvent.preventDefault();
					browserEvent.stopPropagation();
					save();
					break;
			}
		}
	});

	editor!.onDidChangeModelContent(
		(event: { isFlush: boolean; isUndoing: boolean; isRedoing: boolean }) => {
			if (event.isFlush) return;
			form.script = model!.getValue();
			if (event.isUndoing || event.isRedoing) {
				const currentVersionId = model!.getAlternativeVersionId();
				const isChanged = versionId !== currentVersionId;
				if (changed !== isChanged) {
					setChangeState(isChanged);
				}
			} else if (!changed) {
				setChangeState(true);
			}
		}
	);
	created = true;
};

const load = async (params: Record<string, unknown> = {}): Promise<void> => {
	const monaco = await getMonaco();
	const script = (params.script ?? '') as string;
	await createEditor();
	model!.setValue(script);
	form.script = script;
	versionId = model!.getAlternativeVersionId();
	editor!.setPosition(new monaco.Position(9999, 9999));
	editor!.setScrollTop(0);
	editor!.revealLine(9999);
	getFocus(editor);
	if (typesDispose.length) {
		typesDispose.forEach((item: unknown) => (item as () => void)());
	}
	const projectDir = Path.dirname(Editor.config!.project!);
	typesDispose = loadDtsFolder(Path.join(projectDir, 'Script'), monaco, true);
};

const save = async (): Promise<void> => {
	if (!editor || !model) return;
	let script = model.getValue();
	if (script === '') {
		return getFocus(editor);
	}
	try {
		const currentLanguage = editor.getModel()!.getLanguageId();
		if (currentLanguage === 'javascript') {
			new Function(script);
		} else {
			const result = (await ipcRenderer.invoke(CHANNELS.invoke.tscFile, script)) as {
				error?: unknown;
				res?: string;
			};
			if (result.error) {
				throw result.error;
			}
			script = result.res!;
		}
	} catch (error: unknown) {
		const get = createGetter('confirmation');
		let continued = false;
		return getWindowStore().confirm(
			{
				message: `${(error as Error).message}\n${get('compileError')}`,
				close: () => {
					if (!continued) {
						getFocus(editor);
					}
				}
			},
			[
				{
					label: get('yes'),
					click: () => {
						continued = true;
						setChangeState(false);
						commit({ script });
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
	setChangeState(false);
	commit({ script });
};

const initialize = (): void => {
	if (bound) return;
	bound = true;
	document.getElementById('script')?.on('close', (event: Event) => {
		if (changed) {
			event.preventDefault();
			const get = createGetter('confirmation');
			getWindowStore().confirm(
				{
					message: get('closeUnsavedScript'),
					close: () => {
						getFocus(editor);
					}
				},
				[
					{
						label: get('yes'),
						click: () => {
							setChangeState(false);
							getWindowStore().close('script');
						}
					},
					{
						label: get('no')
					}
				]
			);
		}
	});

	document.getElementById('script')?.on('resize', () => {
		resize();
	});

	document.getElementById('script')?.on('closed', () => {
		model?.setValue('');
	});

	document.getElementById('script')?.on('keydown', (event: KeyboardEvent) => {
		if (hasClass(event.target, 'inputarea')) {
			switch (event.code) {
				case 'Enter':
					event.stopPropagation();
					break;
			}
		}
	});
};

Command.cases.script.customLoad = load;
Command.cases.script.customSave = save;
Command.cases.script.onInitialize = (): void => {};

export function useScriptCommandSchema() {
	return { form, save, load, initialize };
}
