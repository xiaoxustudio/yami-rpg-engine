import { useTextCaptureWindow } from '@app/composables/useTextCaptureWindow';
import { $ } from '@app/utils/dom';
import { collect } from '@app/utils/event-scope';
import type { TextSuggestionTarget } from '@app/commands/text-tip.ts';
import { getFocus } from '@app/utils/element-utils';
import { ctrl } from '@app/utils/event-accessors';
import { TextSuggestion } from '@app/commands/text-tip.ts';
import { VariableGetter } from '@app/commands/accessors/variable-accessor-window.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Localization } from '@app/local/local-window.ts';
import { Printer } from '@app/printer/printer.ts';
import { Color } from './color-picker-window.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { Variable } from '@app/variable/variable.ts';

export type {
	FontForm,
	FontSizeForm,
	TextPositionForm,
	TextEffectForm,
	InsertImageForm,
	LocalVariableForm
} from '@app/composables/useTextCaptureWindow';

interface TagController {
	// oxlint-disable-next-line no-explicit-any
	open: (params?: any) => void;
	confirm?: (event: Event) => void;
	initialize?: () => void;
	filter?: string;
	proxy?: unknown;
}

type TagName =
	| 'color'
	| 'font'
	| 'italic'
	| 'bold'
	| 'fontSize'
	| 'textPosition'
	| 'textEffect'
	| 'image'
	| 'localVariable'
	| 'globalVariable'
	| 'dynamicGlobalVariable'
	| 'localization';

type EventTargetElement = HTMLInputElement | HTMLTextAreaElement;

interface EventListenerElement {
	addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface ColorProxy {
	color: string;
	read(): string;
	input(color: string): void;
}

interface ColorController {
	proxy: ColorProxy;
	open(params?: { color?: string }): void;
}

interface VariableProxy {
	key: string;
	filter: string;
	element: EventTargetElement;
	read(): string;
	input(key: string): void;
	getFocus(): unknown;
}

interface VariableController {
	proxy: VariableProxy;
	open(params?: { key?: string }): void;
}

interface SelectionShape {
	target: EventTargetElement;
	inserting: boolean;
	context: { target: EventTargetElement; inserting: boolean } | null;
	regexps: {
		local: RegExp;
		global: RegExp;
		dynamicGlobal: RegExp;
		ref: RegExp;
	};
	initialize: (this: SelectionShape) => void;
	saveContext: (this: SelectionShape) => void;
	restoreContext: (this: SelectionShape) => void;
	addEventListeners: (this: SelectionShape, element: EventListenerElement) => void;
	removeEventListeners: (this: SelectionShape, element: EventListenerElement) => void;
	match: (this: SelectionShape) => { tag: TagName; params: Record<string, unknown> } | undefined;
	insert: (this: SelectionShape, tag: TagName) => void;
	edit: (this: SelectionShape) => void;
	wrap: (this: SelectionShape, params: { prefix: string; suffix?: string }) => void;
	inputKeydown: (this: SelectionShape, event: KeyboardEvent) => void;
	inputKeyup: (this: SelectionShape, event: KeyboardEvent) => void;
	inputPointerdown: (this: SelectionShape, event: PointerEvent) => void;
	inputPointerup: (this: SelectionShape, event: PointerEvent) => void;
	color: TagController;
	font: TagController;
	italic: TagController;
	bold: TagController;
	fontSize: TagController;
	textPosition: TagController;
	textEffect: TagController;
	image: TagController;
	localVariable: TagController;
	globalVariable: TagController;
	dynamicGlobalVariable: TagController;
	localization: TagController;
	sizes?: string[];
}

export const Selection: SelectionShape = {
	target: null as unknown as EventTargetElement,
	inserting: false,
	context: null as unknown as {
		target: EventTargetElement;
		inserting: boolean;
	},
	regexps: {
		local: /<local:(.*?)>/,
		global: /<global:([0-9a-f]{16})?>/,
		dynamicGlobal: /<global::([0-9a-f]{16})?>/,
		ref: /<ref:([0-9a-f]{16})?>/
	},
	initialize: null as unknown as SelectionShape['initialize'],
	saveContext: null as unknown as SelectionShape['saveContext'],
	restoreContext: null as unknown as SelectionShape['restoreContext'],
	addEventListeners: null as unknown as SelectionShape['addEventListeners'],
	removeEventListeners: null as unknown as SelectionShape['removeEventListeners'],
	match: null as unknown as SelectionShape['match'],
	insert: null as unknown as SelectionShape['insert'],
	edit: null as unknown as SelectionShape['edit'],
	wrap: null as unknown as SelectionShape['wrap'],
	inputKeydown: null as unknown as SelectionShape['inputKeydown'],
	inputKeyup: null as unknown as SelectionShape['inputKeyup'],
	inputPointerdown: null as unknown as SelectionShape['inputPointerdown'],
	inputPointerup: null as unknown as SelectionShape['inputPointerup'],
	color: null as unknown as TagController,
	font: null as unknown as TagController,
	italic: null as unknown as TagController,
	bold: null as unknown as TagController,
	fontSize: null as unknown as TagController,
	textPosition: null as unknown as TagController,
	textEffect: null as unknown as TagController,
	image: null as unknown as TagController,
	localVariable: null as unknown as TagController,
	globalVariable: null as unknown as TagController,
	dynamicGlobalVariable: null as unknown as TagController,
	localization: null as unknown as TagController
};

const listenerScopes = new WeakMap<EventListenerElement, { off(): void }>();

Selection.initialize = function (this: SelectionShape) {
	if (!$('#font-confirm')) return;

	const exclusions: Record<string, boolean> = {
		'color-hex': true,
		'command-searcher': true
	};

	for (const textbox of $('text-box')) {
		if (!exclusions[textbox.id]) {
			this.addEventListeners!(textbox.input! as unknown as EventListenerElement);
		}
	}

	for (const textbox of $('text-area-var')) {
		this.addEventListeners!(textbox.strBox!);
	}

	for (const textarea of $('textarea')) {
		this.addEventListeners!(textarea);
	}

	this.textPosition.initialize!();
	this.textEffect.initialize!();
	this.image.initialize!();
	this.localVariable.initialize!();
};

Selection.saveContext = function (this: SelectionShape) {
	this.context = {
		target: this.target,
		inserting: this.inserting
	};
};

Selection.restoreContext = function (this: SelectionShape) {
	if (this.context) {
		this.target = this.context.target;
		this.inserting = this.context.inserting;
	}
};

Selection.addEventListeners = function (this: SelectionShape, element: EventListenerElement) {
	const scope = collect(element as EventTarget);
	scope.on('keydown', this.inputKeydown as EventListener);
	scope.on('keyup', this.inputKeyup as EventListener);
	scope.on('pointerdown', this.inputPointerdown as EventListener);
	scope.on('pointerup', this.inputPointerup as EventListener);
	listenerScopes.set(element, scope);
};

Selection.removeEventListeners = function (this: SelectionShape, element: EventListenerElement) {
	listenerScopes.get(element)?.off();
	listenerScopes.delete(element);
};

Selection.match = function (this: SelectionShape) {
	const target = document.activeElement as EventTargetElement;
	if (typeof target.selectionStart !== 'number') {
		return;
	}

	this.target = target;

	const text = target.value;
	const selectionStart = target.selectionStart;
	const selectionEnd = target.selectionEnd;
	if (selectionEnd === 0) {
		return;
	}

	const regexps = Printer.regexps;
	const start = text.lastIndexOf('<', selectionEnd! - 1);
	const end = text.indexOf('>', selectionStart) + 1;
	let tag: TagName | undefined;
	let params: Record<string, unknown> | null | undefined;
	if (start >= 0 && end > 0 && start < end && start <= selectionStart && end >= selectionEnd!) {
		const string = text.slice(start, end);
		let match: RegExpMatchArray | null;
		if ((match = string.match(regexps.colorIndex))) {
			tag = 'color';
			params = {
				color: parseInt(match[1])
			};
		} else if ((match = string.match(regexps.color))) {
			tag = 'color';
			params = {
				color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`
			};
		} else if ((match = string.match(regexps.font))) {
			tag = 'font';
			params = {
				font: match[1]
			};
		} else if ((match = string.match(regexps.italic))) {
			tag = 'italic';
			params = null;
		} else if ((match = string.match(regexps.bold))) {
			tag = 'bold';
			params = null;
		} else if ((match = string.match(regexps.fontSize))) {
			tag = 'fontSize';
			params = {
				size: parseInt(match[1])
			};
		} else if ((match = string.match(regexps.textPosition))) {
			tag = 'textPosition';
			params = {
				axis: match[1],
				operation: match[2] || 'set',
				value: parseInt(match[3])
			};
		} else if ((match = string.match(regexps.textShadow))) {
			tag = 'textEffect';
			params = {
				type: 'shadow',
				shadowOffsetX: parseInt(match[1]),
				shadowOffsetY: parseInt(match[2]),
				color: `${match[3]}${match[4]}${match[5]}${match[6] || 'ff'}`
			};
		} else if ((match = string.match(regexps.textStroke))) {
			tag = 'textEffect';
			params = {
				type: 'stroke',
				strokeWidth: parseInt(match[1]),
				color: `${match[2]}${match[3]}${match[4]}${match[5] || 'ff'}`
			};
		} else if ((match = string.match(regexps.textOutline))) {
			tag = 'textEffect';
			params = {
				type: 'outline',
				color: `${match[1]}${match[2]}${match[3]}${match[4] || 'ff'}`
			};
		} else if ((match = string.match(regexps.image))) {
			const image = match[1];
			let mode: string;
			let clip: number[] | undefined;
			let width: number | undefined;
			let height: number | undefined;
			if (match[7]) {
				mode = 'image-clip-size';
				clip = [
					parseInt(match[2]),
					parseInt(match[3]),
					parseInt(match[4]),
					parseInt(match[5])
				];
				width = parseInt(match[6] ?? this.sizes![0]);
				height = parseInt(match[7] ?? this.sizes![0]);
			} else if (match[5]) {
				mode = 'image-clip';
				clip = [
					parseInt(match[2]),
					parseInt(match[3]),
					parseInt(match[4]),
					parseInt(match[5])
				];
			} else if (match[3]) {
				mode = 'image-size';
				width = parseInt(match[2]);
				height = parseInt(match[3]);
			} else {
				mode = 'image';
			}
			tag = 'image';
			params = { mode, image, clip, width, height };
		} else {
			const wrap = target.parentNode as HTMLElement;
			const menu = wrap.getAttribute('menu');
			if (menu?.includes('tag-local-var')) {
				if ((match = string.match(this.regexps.local))) {
					tag = 'localVariable';
					params = {
						key: match[1]
					};
				}
			}
			if (menu?.includes('tag-global')) {
				if ((match = string.match(this.regexps.global))) {
					tag = 'globalVariable';
					params = {
						key: match[1] ?? ''
					};
				}
			}
			if (menu?.includes('tag-dynamic-global')) {
				if ((match = string.match(this.regexps.dynamicGlobal))) {
					tag = 'dynamicGlobalVariable';
					params = {
						key: match[1] ?? ''
					};
				}
			}
			if (menu?.includes('tag-localization')) {
				if ((match = string.match(this.regexps.ref))) {
					tag = 'localization';
					params = {
						key: match[1] ?? ''
					};
				}
			}
		}
	}
	if (tag) {
		target.selectionStart = start;
		target.selectionEnd = end;
		if (params) {
			return { tag, params };
		}
	}
};

Selection.insert = function (this: SelectionShape, tag: TagName) {
	const target = document.activeElement as EventTargetElement;
	if (typeof target.selectionStart === 'number') {
		this.target = target;
		this.inserting = true;
		this[tag].open!();
	}
};

Selection.edit = function (this: SelectionShape) {
	const match = this.match!();
	if (match) {
		const { tag, params } = match;
		this.inserting = false;
		this[tag as TagName].open!(params);
	}
};

Selection.wrap = function (
	this: SelectionShape,
	{ prefix, suffix }: { prefix: string; suffix?: string }
) {
	const input = this.target;
	const start = input.selectionStart!;
	const end = input.selectionEnd!;
	input.focus();
	if (this.inserting && start !== end) {
		let string;
		if (suffix) {
			const selection = input.value.slice(start, end);
			string = prefix + selection + suffix;
		} else {
			string = prefix;
			input.selectionEnd = input.selectionStart;
		}
		(input.parentNode as HTMLElement).insert(string);
		input.selectionStart = start;
	} else {
		(input.parentNode as HTMLElement).insert(prefix);
		input.selectionStart = start;
	}
};

Selection.inputKeydown = function (this: SelectionShape, event: KeyboardEvent) {
	if (event.altKey) {
		switch (event.code) {
			case 'KeyE':
				this.match!();
				break;
		}
	}
}.bind(Selection);

Selection.inputKeyup = function (this: SelectionShape, event: KeyboardEvent) {
	if (event.altKey) {
		switch (event.code) {
			case 'KeyE':
				this.edit!();
				break;
		}
	}
}.bind(Selection);

Selection.inputPointerdown = function (this: SelectionShape, event: PointerEvent) {
	switch (event.button) {
		case 2:
			setTimeout(() => this.match!());
			break;
	}
}.bind(Selection);

Selection.inputPointerup = function (this: SelectionShape, event: PointerEvent) {
	switch (event.button) {
		case 2:
			void navigator.clipboard.readText().then((clipText: string) => {
				const element = event.target as EventTargetElement;
				if (document.activeElement === element) {
					const start = element.selectionStart;
					const end = element.selectionEnd;
					const editable = !!this.match!();
					const selected = start !== end;
					const pastable = !!clipText;
					const undoable = element.history.canUndo();
					const redoable = element.history.canRedo();
					const get = (key: string) => t('menuTextBox.' + key);
					const wrap = element.parentNode as HTMLElement;
					const menu = wrap.getAttribute('menu') ?? 'tag';
					const tagItems: {
						label?: string;
						accelerator?: string;
						enabled?: boolean;
						click?: () => void;
						type?: string;
					}[] = [];
					tagItems.push(
						{
							label: get('tag.color'),
							click: () => {
								Selection.insert!('color');
							}
						},
						{
							label: get('tag.font'),
							click: () => {
								Selection.insert!('font');
							}
						},
						{
							label: get('tag.italic'),
							click: () => {
								Selection.insert!('italic');
							}
						},
						{
							label: get('tag.bold'),
							click: () => {
								Selection.insert!('bold');
							}
						},
						{
							label: get('tag.size'),
							click: () => {
								Selection.insert!('fontSize');
							}
						},
						{
							label: get('tag.position'),
							click: () => {
								Selection.insert!('textPosition');
							}
						},
						{
							label: get('tag.effect'),
							click: () => {
								Selection.insert!('textEffect');
							}
						},
						{
							label: get('tag.image'),
							click: () => {
								Selection.insert!('image');
							}
						}
					);
					if (menu.includes('tag-local-var')) {
						tagItems.push({
							label: get('tag.localVariable'),
							click: () => {
								Selection.insert!('localVariable');
							}
						});
					}
					if (menu.includes('tag-global')) {
						tagItems.push({
							label: get('tag.globalVariable'),
							click: () => {
								Selection.insert!('globalVariable');
							}
						});
					}
					if (menu.includes('tag-dynamic-global')) {
						tagItems.push({
							label: get('tag.dynamicGlobalVariable'),
							click: () => {
								Selection.insert!('dynamicGlobalVariable');
							}
						});
					}
					if (menu.includes('tag-localization')) {
						tagItems.push({
							label: get('tag.localization'),
							click: () => {
								Selection.insert!('localization');
							}
						});
					}
					Menu.popup!(
						{
							x: event.clientX,
							y: event.clientY
						},
						[
							{
								label: get('edit'),
								accelerator: 'Alt+E',
								enabled: editable,
								click: () => {
									Selection.edit!();
								}
							},
							{
								label: get('tag'),
								submenu: tagItems
							},
							{
								type: 'separator'
							},
							{
								label: get('cut'),
								accelerator: ctrl('X'),
								enabled: selected,
								click: () => {
									element.dispatchEvent(
										new InputEvent('beforeinput', {
											inputType: 'deleteByCut',
											bubbles: true
										})
									);
									document.execCommand('cut');
								}
							},
							{
								label: get('copy'),
								accelerator: ctrl('C'),
								enabled: selected,
								click: () => {
									document.execCommand('copy');
								}
							},
							{
								label: get('paste'),
								accelerator: ctrl('V'),
								enabled: pastable,
								click: () => {
									element.dispatchEvent(
										new InputEvent('beforeinput', {
											inputType: 'insertFromPaste',
											data: clipText,
											bubbles: true
										})
									);
									document.execCommand('paste');
								}
							},
							{
								label: get('delete'),
								accelerator: 'Delete',
								enabled: selected,
								click: () => {
									element.dispatchEvent(
										new InputEvent('beforeinput', {
											inputType: 'deleteContentForward',
											bubbles: true
										})
									);
									document.execCommand('delete');
								}
							},
							{
								label: get('undo'),
								accelerator: ctrl('Z'),
								enabled: undoable,
								click: () => {
									element.history.restore('undo');
								}
							},
							{
								label: get('redo'),
								accelerator: ctrl('Y'),
								enabled: redoable,
								click: () => {
									element.history.restore('redo');
								}
							}
						]
					);
				}
			});
			break;
	}
}.bind(Selection);

Selection.color = {
	open: function (this: ColorController, { color = '000000ff' } = {}) {
		this.proxy.color = color;
		Color.open(this.proxy, true);
	},
	proxy: {
		color: null as unknown as string,
		read: function (this: ColorProxy) {
			return this.color;
		},
		input: function (this: ColorProxy, color: string) {
			if (typeof color === 'string') {
				color = Color.simplifyHexColor(color);
			}
			Selection.wrap!({
				prefix: `<color:${color}>`,
				suffix: '</color>'
			});
		}
	}
};

Selection.font = {
	open: function ({ font = 'sans-serif' } = {}) {
		useTextCaptureWindow().font.open(font, (form) => {
			Selection.wrap!({
				prefix: `<font:${form.font}>`,
				suffix: '</font>'
			});
		});
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().font.confirm();
	}
};

Selection.italic = {
	open: function () {
		Selection.wrap!({
			prefix: '<italic>',
			suffix: '</italic>'
		});
	}
};

Selection.bold = {
	open: function () {
		Selection.wrap!({
			prefix: '<bold>',
			suffix: '</bold>'
		});
	}
};

Selection.fontSize = {
	open: function ({ size = 12 } = {}) {
		useTextCaptureWindow().fontSize.open(size, (form) => {
			Selection.wrap!({
				prefix: `<size:${form.size}>`,
				suffix: '</size>'
			});
		});
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().fontSize.confirm();
	}
};

Selection.textPosition = {
	initialize: function () {
		const axis = $('#textPosition-axis');
		const operation = $('#textPosition-operation');
		if (!axis || !operation) return;
		axis.loadItems([
			{ name: 'X', value: 'x' },
			{ name: 'Y', value: 'y' }
		]);
		operation.loadItems([
			{ name: 'Set', value: 'set' },
			{ name: 'Add', value: 'add' }
		]);
	},
	open: function ({ axis = 'x', operation = 'set', value = 0 } = {}) {
		useTextCaptureWindow().textPosition.open({ axis, operation, value }, (form) => {
			let string;
			switch (form.operation) {
				case 'set':
					string = `${form.value}`;
					break;
				case 'add':
					string = `${form.operation},${form.value}`;
					break;
			}
			Selection.wrap!({
				prefix: `<${form.axis}:${string}>`,
				suffix: ''
			});
		});
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().textPosition.confirm();
	}
};

Selection.textEffect = {
	initialize: function () {
		const type = $('#textEffect-type');
		if (!type) return;
		type.loadItems([
			{ name: 'Shadow', value: 'shadow' },
			{ name: 'Stroke', value: 'stroke' },
			{ name: 'Outline', value: 'outline' }
		]);
		type.enableHiddenMode().relate([
			{
				case: 'shadow',
				targets: [
					$('#textEffect-shadowOffsetX'),
					$('#textEffect-shadowOffsetY'),
					$('#textEffect-color')
				]
			},
			{
				case: 'stroke',
				targets: [$('#textEffect-strokeWidth'), $('#textEffect-color')]
			},
			{ case: 'outline', targets: [$('#textEffect-color')] }
		]);
	},
	open: function ({
		type = 'shadow',
		shadowOffsetX = 1,
		shadowOffsetY = 1,
		strokeWidth = 1,
		color = '000000ff'
	} = {}) {
		useTextCaptureWindow().textEffect.open(
			{ type, shadowOffsetX, shadowOffsetY, strokeWidth, color },
			(form) => {
				const hexColor = Color.simplifyHexColor(form.color);
				let string;
				switch (form.type) {
					case 'shadow': {
						string = `${form.shadowOffsetX},${form.shadowOffsetY},${hexColor}`;
						break;
					}
					case 'stroke': {
						string = `${form.strokeWidth},${hexColor}`;
						break;
					}
					case 'outline':
						string = `${hexColor}`;
						break;
				}
				Selection.wrap!({
					prefix: `<${form.type}:${string}>`,
					suffix: `</${form.type}>`
				});
			}
		);
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().textEffect.confirm();
	}
};

Selection.image = {
	initialize: function () {
		const mode = $('#insertImage-mode');
		if (!mode) return;
		mode.loadItems([
			{ name: 'Image', value: 'image' },
			{ name: 'Image - Size', value: 'image-size' },
			{ name: 'Image - Clip', value: 'image-clip' },
			{ name: 'Image - Clip - Size', value: 'image-clip-size' }
		]);
		mode.enableHiddenMode().relate([
			{ case: 'image', targets: [$('#insertImage-image')] },
			{
				case: 'image-size',
				targets: [
					$('#insertImage-image'),
					$('#insertImage-width'),
					$('#insertImage-height')
				]
			},
			{
				case: 'image-clip',
				targets: [$('#insertImage-image'), $('#insertImage-clip')]
			},
			{
				case: 'image-clip-size',
				targets: [
					$('#insertImage-image'),
					$('#insertImage-clip'),
					$('#insertImage-width'),
					$('#insertImage-height')
				]
			}
		]);
	},
	open: function ({
		mode = 'image',
		image = '',
		clip = [0, 0, 64, 64],
		width = 64,
		height = 64
	} = {}) {
		useTextCaptureWindow().image.open({ mode, image, clip, width, height }, (form) => {
			const { mode, image, width, height } = form;
			const clip = form.clip ?? [0, 0, 64, 64];
			let string;
			switch (mode) {
				case 'image':
					string = image;
					break;
				case 'image-size': {
					string = `${image},${width},${height}`;
					break;
				}
				case 'image-clip': {
					string = `${image},${clip[0]},${clip[1]},${clip[2]},${clip[3]}`;
					break;
				}
				case 'image-clip-size': {
					string = `${image},${clip[0]},${clip[1]},${clip[2]},${clip[3]},${width},${height}`;
					break;
				}
			}
			Selection.wrap!({
				prefix: `<image:${string}>`,
				suffix: ''
			});
		});
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().image.confirm();
	}
};

Selection.localVariable = {
	filter: 'all',
	initialize: function (this: { filter: string }) {
		const key = $('#localVariable-key');
		if (!key) return;
		TextSuggestion.listen!(
			key as unknown as TextSuggestionTarget,
			VariableGetter.createVarListGenerator!(this as never)
		);
	},
	open: function ({ key = '' } = {}) {
		useTextCaptureWindow().localVariable.open(key, (form) => {
			Selection.wrap!({
				prefix: `<local:${form.key}>`,
				suffix: ''
			});
		});
	},
	confirm: function (_event: Event) {
		useTextCaptureWindow().localVariable.confirm();
	}
};

Selection.globalVariable = {
	open: function (this: VariableController, { key = '' } = {}) {
		this.proxy.key = key;
		this.proxy.element = Selection.target;
		Variable.open!(this.proxy);
	},
	proxy: {
		key: '',
		filter: '',
		element: null as unknown as EventTargetElement,
		read: function (this: VariableProxy) {
			return this.key;
		},
		input: function (this: VariableProxy, key: string) {
			Selection.wrap!({
				prefix: `<global:${key}>`,
				suffix: ''
			});
		},
		getFocus: function (this: VariableProxy) {
			return this.element ? getFocus(this.element) : undefined;
		}
	}
};

Selection.dynamicGlobalVariable = {
	open: function (this: VariableController, { key = '' } = {}) {
		this.proxy.key = key;
		this.proxy.element = Selection.target;
		Variable.open!(this.proxy);
	},
	proxy: {
		key: '',
		filter: '',
		element: null as unknown as EventTargetElement,
		read: function (this: VariableProxy) {
			return this.key;
		},
		input: function (this: VariableProxy, key: string) {
			Selection.wrap!({
				prefix: `<global::${key}>`,
				suffix: ''
			});
		},
		getFocus: function (this: VariableProxy) {
			return this.element ? getFocus(this.element) : undefined;
		}
	}
};

Selection.localization = {
	open: function (this: VariableController, { key = '' } = {}) {
		this.proxy.key = key;
		Selection.saveContext!();
		Localization.open(this.proxy);
	},
	proxy: {
		key: '',
		read: function (this: VariableProxy) {
			return this.key;
		},
		input: function (this: VariableProxy, key: string) {
			Selection.wrap!({
				prefix: `<ref:${key}>`,
				suffix: ''
			});
		}
	}
};
