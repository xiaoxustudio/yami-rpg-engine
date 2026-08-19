import '@app/legacy/module/command/script.ts';
import { ipcRenderer } from 'electron';
import { CHANNELS } from '@app/services/ipc/channels.ts';
import { getFocus, hasClass, hide, show } from '@app/utils/element-utils.ts';
import { Command } from '@app/legacy/command/command-object.ts';
import { Editor } from '@app/services/project/editor.ts';
import { loadDtsFolder } from '@app/legacy/module/global.ts';
import { Title } from '@app/legacy/title/title-bar.ts';
import { createGetter } from '@app/i18n';
import { Path } from '@app/utils/config';
import { getMonaco } from '@app/utils/monaco';
import { reactive } from 'vue';
import { Window } from '@app/legacy/tools/window-object.ts';

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
		return Window.confirm!(
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
						Command.save({ script });
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
	setChangeState(false);
	Command.save({ script });
};

const initialize = (): void => {
	if (bound) return;
	bound = true;
	document.getElementById('script')?.on('close', (event: Event) => {
		if (changed) {
			event.preventDefault();
			const get = createGetter('confirmation');
			Window.confirm!(
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
							Window.close!('script');
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
