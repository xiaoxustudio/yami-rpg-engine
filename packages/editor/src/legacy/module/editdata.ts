import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { addClass, getFocus, hasClass, hide, on, show } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Title } from '@/title/title-bar.ts';
import { Local } from '@/tools/localization.ts';

import { getMonaco } from '@/util/monaco';

export const EditDataInstance = new (class {
	editor: any = null;
	model: any = null;
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
	mark = $('#edit-data-mark');
	editorParent: HTMLElement | null = null;
	editorDom: HTMLElement | null = null;
	eventListDom: HTMLElement | null = null;
	currentContent: any = null;
	createTheme: (() => void) | null = null;
	constructor() {}

	bindDom() {
		if (this.editorParent) return;
		this.mark = $('#edit-data-mark');
		this.editorParent = $('#edit-data');
		this.editorDom = $('#edit-data-current');
		this.eventListDom = $('#event-commands');
		on($('#edit-data'), 'resize', () => {
			this.resize();
		});
		on($('#edit-data-confirm'), 'click', this.save.bind(this));

		on(this.editorParent, 'close', (event: Event) => {
			if (this.changed) {
				event.preventDefault();
				const get = Local.createGetter!('confirmation');
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
			this.model.setValue('');
		});
	}
	isMaximized() {
		return hasClass($('#edit-data'), 'maximized');
	}
	resize() {
		const content = this.editorDom!;
		const parent = content.parentElement;
		if (!this.isMaximized()) {
			content.style.width = '';
			content.style.height = '';
			const boundingRect = content.getBoundingClientRect();
			this.editor.layout({
				width: boundingRect.width,
				height: parent!.clientHeight - 60
			});
		} else {
			const boundingRect = content!.getBoundingClientRect();
			// 保持content左右间距相同
			content!.style.width = parent!.clientWidth - boundingRect.left * 2 + 'px';
			content!.style.height = parent!.clientHeight - 60 + 'px';
			this.editor.layout({
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
		const modelValue = this.model.getValue();
		const parse = this.parseJSON(modelValue);
		if (!parse) return;
		const originalStart = (this.eventListDom as unknown as { start: unknown }).start;
		const originalEnd = (this.eventListDom as unknown as { end: unknown }).end;

		let hasChanges = false;

		if (Array.isArray(this.currentContent)) {
			for (const ind in this.currentContent) {
				const { node, value }: any = this.currentContent[ind];
				if (!(ind in (parse as object))) continue;
				const changeContent = (parse as Record<string | number, unknown>)[ind];
				if (JSON.stringify(value) === JSON.stringify(changeContent)) continue;

				const list = node.dataList;
				const dataIndex = node.dataIndex;

				if (list[dataIndex].buffer !== undefined) {
					delete list[dataIndex].buffer;
				}

				list[dataIndex] = changeContent;
				hasChanges = true;
			}
		} else if (JSON.stringify(this.currentContent.value) !== JSON.stringify(parse)) {
			const node = this.currentContent.node;

			const list = node.dataList;
			const dataIndex = node.dataIndex;

			if (list[dataIndex].buffer !== undefined) {
				delete list[dataIndex].buffer;
			}

			list[dataIndex] = parse;
			hasChanges = true;
		}

		// 如果有修改，触发 change 事件以标记数据需要保存
		if (hasChanges) {
			this.eventListDom!.dispatchEvent(new Event('change', { bubbles: true }));
		}

		this.eventListDom!.update();
		this.eventListDom!.select(originalStart, originalEnd);

		this.currentContent = null;
		this.setChangeState(false);
		Window.close!('edit-data');
	}
	async colorizeCodeLines(items: any, code: string) {
		const monaco = await getMonaco();
		const text = document.createElement('div');
		addClass(text, 'text');
		const options = this.colorOptions;
		text.textContent = code;
		options.theme = Title.theme;
		(this.createTheme as (theme: string) => void)(Title.theme);
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

			this.model = this.editor.getModel();

			// 编辑器 - 获得焦点
			this.editor.getFocus = function (this: any) {
				setTimeout(() => this.focus());
			};

			this.editor.onKeyDown((event: any) => {
				event = event.browserEvent;
				if (event.ctrlKey) {
					switch (event.code) {
						case 'Enter':
							event.preventDefault();
							event.stopPropagation();
							// this.save()
							break;
					}
				}
			});

			this.editor.onDidChangeModelContent((event: any) => {
				if (event.isFlush) return;
				if (event.isUndoing || event.isRedoing) {
					const versionId = this.model.getAlternativeVersionId();
					const changed = this.versionId !== versionId;
					if (this.changed !== changed) {
						this.setChangeState(changed);
					}
				} else if (!this.changed) {
					this.setChangeState(true);
				}
			});
		}
		this.model.setValue('');
		this.versionId = this.model.getAlternativeVersionId();
		this.editor.setPosition(new monaco.Position(9999, 9999));
		this.editor.setScrollTop(0);
		this.editor.revealLine(9999);
		getFocus(this.editor);
		this.commandList = current;
		this.loadData();
	}
	loadData() {
		this.currentContent = null;
		const { elements, start, end } = this.commandList as any;
		const sElement = elements[start];
		if (start === end) {
			const sData = sElement.dataItem;
			this.currentContent = {
				node: sElement,
				value: {
					id: sData.id,
					params: sData.params,
					commands: sData.commands
				}
			};
			this.model.setValue(JSON.stringify(this.currentContent.value, null, 2));
		} else {
			const value = [];
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
				if (elem.mark === 'header') includeArr.push(eData); // 将buffer也存储，这样能保证有唯一性
			}
			this.currentContent = value;
			this.model.setValue(
				JSON.stringify(
					value.map((v: any) => v.value),
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
