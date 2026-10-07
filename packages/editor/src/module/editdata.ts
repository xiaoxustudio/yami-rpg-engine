import { moduleEls } from '@app/module/element-registry';
import { eventEditorEls } from '@app/commands/event-editor-initialize.ts';
import { Window } from '@app/tools/window-object.ts';
import { getFocus, hasClass, hide, on, show } from '@app/utils/element-utils.ts';
import { Command } from '@app/commands/command-object.ts';
import { Title } from '@app/title/title-bar.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { h } from 'vue';
import { renderDetached } from '@app/utils/dom';

import { getMonaco } from '@app/utils/monaco';
import { registryElement } from '@app/utils/element-registry';
import type * as monacoNs from 'monaco-editor';
import type { YamiElement } from '@app/types/element-api';

interface EditDataNodeShape {
	dataItem?: { id: string; params: unknown; commands: unknown };
	dataParent?: unknown;
	mark?: string;
	dataList: Record<string, unknown>[];
	dataIndex: number;
}

interface EditDataContentItem {
	node: EditDataNodeShape;
	value: { id: string; params: unknown; commands: unknown };
}

type EventListCursorDom = YamiElement & { start: unknown; end: unknown };

export const EditDataInstance = new (class {
	editor: (monacoNs.editor.IStandaloneCodeEditor & { getFocus?: () => void }) | null = null;
	model: monacoNs.editor.ITextModel | null = null;
	versionId: number | null = null;
	commandList: unknown = null;
	changed = false;
	fontSize = 14;
	lineHeight = 14;
	colorOptions = {
		mimeType: 'json',
		tabSize: 2,
		theme: ''
	};
	isCreated = false;
	mark = moduleEls.get('edit-data-mark') as YamiElement;
	editorParent: HTMLElement | null = null;
	editorDom: HTMLElement | null = null;
	eventListDom: EventListCursorDom | null = null;
	currentContent: EditDataContentItem[] | EditDataContentItem | null = null;
	createTheme: (() => void) | null = null;
	constructor() {}

	bindDom() {
		if (this.editorParent) return;
		this.mark = moduleEls.get('edit-data-mark') as YamiElement;
		this.editorParent = moduleEls.get('edit-data') as YamiElement;
		this.editorDom = moduleEls.get('edit-data-current') as YamiElement;
		this.eventListDom = registryElement<EventListCursorDom>(eventEditorEls, 'event-commands');
		on(moduleEls.get('edit-data') as YamiElement, 'resize', () => {
			this.resize();
		});

		on(this.editorParent, 'close', (event: Event) => {
			if (this.changed) {
				event.preventDefault();
				const get = (key: string) => t('confirmation.' + key);
				Window.confirm!(
					{
						message: get('closeUnsavedData'),
						close: () => {
							getFocus(this.editor);
						}
					},
					[
						{
							label: get('yes'),
							click: () => {
								this.setChangeState(false);
								Window.close!('edit-data');
							}
						},
						{
							label: get('no')
						}
					]
				);
			}
		});

		on(this.editorParent, 'keydown', (event: KeyboardEvent) => {
			if (hasClass(event.target, 'inputarea')) {
				switch (event.code) {
					case 'Enter':
						event.stopPropagation();
						break;
				}
			}
		});

		on(this.editorParent, 'closed', () => {
			this.model!.setValue('');
		});
	}
	isMaximized() {
		return hasClass(moduleEls.get('edit-data') as YamiElement, 'maximized');
	}
	resize() {
		const content = this.editorDom!;
		const parent = content.parentElement;
		if (!this.isMaximized()) {
			content.style.width = '';
			content.style.height = '';
			const boundingRect = content.getBoundingClientRect();
			this.editor!.layout({
				width: boundingRect.width,
				height: parent!.clientHeight - 60
			});
		} else {
			const boundingRect = content!.getBoundingClientRect();
			content!.style.width = parent!.clientWidth - boundingRect.left * 2 + 'px';
			content!.style.height = parent!.clientHeight - 60 + 'px';
			this.editor!.layout({
				width: parseFloat(content!.style.width),
				height: parseFloat(content!.style.height)
			});
		}
	}
	parseJSON(text: string): unknown {
		try {
			const vaild = JSON.parse(text);
			if (vaild.id && vaild.params) {
				const result = new (class {
					id = vaild.id;
					params = vaild.params;
					commands = vaild.commands;
				})();
				return result;
			}
			if (Array.isArray(vaild) && vaild.every((v) => v.id && v.params)) {
				return vaild.map((v) => {
					const result = new (class {
						id = v.id;
						params = v.params;
						commands = v.commands;
					})();
					return result;
				});
			}
			return null;
		} catch {
			return null;
		}
	}

	save() {
		const modelValue = this.model!.getValue();
		const parse = this.parseJSON(modelValue);
		if (!parse) return;
		const originalStart = this.eventListDom!.start;
		const originalEnd = this.eventListDom!.end;

		let hasChanges = false;

		if (Array.isArray(this.currentContent)) {
			for (const [ind, item] of this.currentContent.entries()) {
				const { node, value } = item;
				if (!(ind in (parse as object))) continue;
				const changeContent = (parse as Record<string | number, unknown>)[ind] as Record<
					string,
					unknown
				>;
				if (JSON.stringify(value) === JSON.stringify(changeContent)) continue;

				const list = node.dataList;
				const dataIndex = node.dataIndex;

				if (list[dataIndex].buffer !== undefined) {
					delete list[dataIndex].buffer;
				}

				list[dataIndex] = changeContent;
				hasChanges = true;
			}
		} else if (JSON.stringify(this.currentContent!.value) !== JSON.stringify(parse)) {
			const node = this.currentContent!.node;

			const list = node.dataList;
			const dataIndex = node.dataIndex;

			if (list[dataIndex].buffer !== undefined) {
				delete list[dataIndex].buffer;
			}

			list[dataIndex] = parse as Record<string, unknown>;
			hasChanges = true;
		}

		if (hasChanges) {
			this.eventListDom!.dispatchEvent(new Event('change', { bubbles: true }));
		}

		this.eventListDom!.update();
		this.eventListDom!.select(originalStart, originalEnd);

		this.currentContent = null;
		this.setChangeState(false);
		Window.close!('edit-data');
	}
	async colorizeCodeLines(items: HTMLElement[], code: string) {
		const monaco = await getMonaco();
		const text = renderDetached(h('div', { class: 'text' }, code));
		const options = this.colorOptions;
		options.theme = Title.theme;
		(this.createTheme as (theme: string) => void)(Title.theme);
		void monaco.editor.colorizeElement(text, options);
		let attempts = 0;
		let index = setInterval(() => {
			if (text.children.length !== 0 || ++attempts >= 200) {
				clearInterval(index);
				const nodes = text.childNodes;
				const nLength = nodes.length;
				const sLength = nLength >> 1;
				const spans = Array.from<Node>({ length: sLength });
				for (let i = 0; i < nLength; i += 2) {
					spans[i >> 1] = nodes[i];
				}
				for (let i = 0; i < sLength; i++) {
					items[i].appendChild(spans[i]);
				}
			}
		});
	}
	async open(current: unknown) {
		const monaco = await getMonaco();
		this.bindDom();
		if (!this.isCreated) {
			this.isCreated = true;
			const { theme } = Title;
			await Command.cases.script.createTheme(theme);
			this.editor = monaco.editor.create(this.editorDom!, {
				language: 'json',
				theme: theme ?? '',
				tabSize: 2,
				fontSize: this.fontSize,
				lineHeight: this.lineHeight,
				mouseWheelScrollSensitivity: (this.lineHeight * 3) / 50,
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
				hover: { enabled: false },
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
			});

			this.model = this.editor.getModel()!;

			this.editor.getFocus = function (this: { focus: () => void }) {
				setTimeout(() => this.focus());
			};

			this.editor.onKeyDown((event: { browserEvent: KeyboardEvent }) => {
				const { browserEvent } = event;
				if (browserEvent.ctrlKey) {
					switch (browserEvent.code) {
						case 'Enter':
							browserEvent.preventDefault();
							browserEvent.stopPropagation();
							break;
					}
				}
			});

			this.editor.onDidChangeModelContent(
				(event: { isFlush: boolean; isUndoing: boolean; isRedoing: boolean }) => {
					if (event.isFlush) return;
					if (event.isUndoing || event.isRedoing) {
						const versionId = this.model!.getAlternativeVersionId();
						const changed = this.versionId !== versionId;
						if (this.changed !== changed) {
							this.setChangeState(changed);
						}
					} else if (!this.changed) {
						this.setChangeState(true);
					}
				}
			);
		}
		this.model!.setValue('');
		this.versionId = this.model!.getAlternativeVersionId();
		this.editor!.setPosition(new monaco.Position(9999, 9999));
		this.editor!.setScrollTop(0);
		this.editor!.revealLine(9999);
		getFocus(this.editor!);
		this.commandList = current;
		this.loadData();
	}
	loadData() {
		this.currentContent = null;
		const { elements, start, end } = this.commandList as {
			elements: EditDataNodeShape[];
			start: number;
			end: number;
		};
		const sElement = elements[start];
		if (start === end) {
			const sData = sElement.dataItem!;
			this.currentContent = {
				node: sElement,
				value: {
					id: sData.id,
					params: sData.params,
					commands: sData.commands
				}
			};
			this.model!.setValue(JSON.stringify(this.currentContent.value, null, 2));
		} else {
			const value: EditDataContentItem[] = [];
			const includeArr: unknown[] = [];
			for (let index = start; index <= end; index++) {
				const elem = elements[index];
				const eData = elem.dataItem;
				if (eData && !includeArr.includes(elem.dataParent) && elem.mark !== 'footer')
					value.push({
						node: elem,
						value: {
							id: eData.id,
							params: eData.params,
							commands: eData.commands
						}
					});
				if (elem.mark === 'header') includeArr.push(eData);
			}
			this.currentContent = value;
			this.model!.setValue(
				JSON.stringify(
					value.map((v: EditDataContentItem) => v.value),
					null,
					2
				)
			);
		}
	}
	setChangeState(changed: boolean) {
		if (this.changed !== changed) {
			this.changed = changed;
			if (changed) {
				show(this.mark);
			} else {
				hide(this.mark);
			}
		}
	}
})();
