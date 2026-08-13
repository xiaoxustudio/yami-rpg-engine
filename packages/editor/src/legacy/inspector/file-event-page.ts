import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@/tools/window-object.ts';
import { clear, getFocus, hide, read, show, write } from '@/util/element-utils';
import { EventEditor } from '@/command/event-editor.ts';
import { Enum } from '@/enum/enum-window.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { Local } from '@/tools/localization.ts';

{
	interface FileEventData {
		type: string;
		enabled: boolean;
		priority: boolean;
		namespace: boolean;
		returnType: string;
		description: string;
		parameters: unknown[];
		commands: unknown[];
		[k: string]: any;
	}

	interface FileEventList {
		save(): void;
		on?(type: string, listener: (event: Event) => void): void;
		[k: string]: unknown;
	}

	interface FileEventPage {
		target: FileEventData | null;
		meta: { file: unknown } | null;
		parameters: FileEventList;
		update: ((event: FileEventData, key: string, value: unknown) => void) | null;
		listChange: ((event: Event) => void) | null;
		[k: string]: unknown;
	}

	const FileEvent = {
		target: null,
		meta: null,
		parameters: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		write: null,
		update: null,
		paramInput: null,
		typeWrite: null,
		listChange: null
	} as unknown as FileEventPage;

	FileEvent.initialize = function (this: FileEventPage) {
		if (!$('#fileEvent-type')) return;
		if (!EventEditor.types) return;
		$('#fileEvent-type')?.loadItems?.(EventEditor.types.global);
		EventEditor.types.relatedElements.push($('#fileEvent-type'));

		$('#fileEvent-returnType')?.loadItems?.([
			{ name: 'None', value: 'none' },
			{ name: 'Boolean', value: 'boolean' },
			{ name: 'Number', value: 'number' },
			{ name: 'String', value: 'string' },
			{ name: 'Object', value: 'object' },
			{ name: 'Actor', value: 'actor' },
			{ name: 'Skill', value: 'skill' },
			{ name: 'State', value: 'state' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Item', value: 'item' },
			{ name: 'Trigger', value: 'trigger' },
			{ name: 'Light', value: 'light' },
			{ name: 'Element', value: 'element' }
		]);

		$('#fileEvent-parameters')?.bind?.(this.parameters);

		// 6 闂佺敤鐭囬崒娑卞仺 input + type write 缂?Vue 濠碘槅鍨崜婵嗩熆濡堢粯濮滄い鎺嗗亾鐟滄澘鍊块弫宥夊捶濮掔垐eEventPage.vue @input/@write 闂?FileEvent.*闂?
		$('#fileEvent-parameters')?.on?.('change', this.listChange);
	};

	FileEvent.create = function (this: FileEventPage, filter: string) {
		const type = EventEditor.types?.[filter]?.[0]?.value ?? 'common';
		switch (filter) {
			case 'global':
				return {
					type: type,
					enabled: true,
					priority: false,
					namespace: true,
					returnType: 'none',
					description: '',
					parameters: [],
					commands: []
				};
			default:
				return {
					type: type,
					enabled: true,
					commands: []
				};
		}
	};

	FileEvent.open = function (this: FileEventPage, event: FileEventData, meta: { file: unknown }) {
		if (this.meta !== meta) {
			this.target = event;
			this.meta = meta;

			$('#fileEvent-type').loadItems(
				Enum.getMergedItems!(EventEditor.types?.global, 'global-event')
			);

			const write = getElementWriter('fileEvent', event);
			write('type');
			write('enabled');
			write('priority');
			write('namespace');
			write('returnType');
			write('description');
			write('parameters');
		}
	};

	FileEvent.close = function (this: FileEventPage) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear($('#fileEvent-parameters'));
		}
	};

	FileEvent.write = function (this: FileEventPage, options: { type?: string }) {
		if (options.type !== undefined) {
			write($('#fileEvent-type'), options.type);
		}
	};

	FileEvent.update = function (
		this: FileEventPage,
		event: FileEventData,
		key: string,
		value: unknown
	) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'type':
			case 'priority':
			case 'namespace':
			case 'returnType':
			case 'description':
				if (event[key] !== value) {
					(event as Record<string, unknown>)[key] = value;
				}
				break;
			case 'enabled':
				if (event.enabled !== value) {
					(event as Record<string, unknown>).enabled = value;
					getBrowserInstance()?.body?.updateIcon?.(this.meta!.file);
				}
				break;
		}
	};

	FileEvent.paramInput = function (this: FileEventPage, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileEvent-').test(element.id)) break;
			element = element.parentElement;
		}
		FileEvent.update!(FileEvent.target!, Inspector.getKey!(element), read(element));
	};

	FileEvent.typeWrite = function (this: FileEventPage, event: Event & { value?: string }) {
		const enabledInput = $('#fileEvent-enabled');
		const enabledLabel = enabledInput.previousElementSibling;
		const priorityInput = $('#fileEvent-priority');
		const priorityLabel = priorityInput.previousElementSibling;
		switch (event.value) {
			case 'common':
				hide(enabledLabel);
				hide(enabledInput);
				break;
			default:
				show(enabledLabel);
				show(enabledInput);
				break;
		}
		switch (event.value) {
			case 'input':
			case 'keydown':
			case 'keyup':
			case 'mousedown':
			case 'mouseup':
			case 'mousemove':
			case 'doubleclick':
			case 'wheel':
			case 'touchstart':
			case 'touchmove':
			case 'touchend':
			case 'gamepadbuttonpress':
			case 'gamepadbuttonrelease':
			case 'gamepadleftstickchange':
			case 'gamepadrightstickchange':
				show(priorityLabel);
				show(priorityInput);
				break;
			default:
				hide(priorityLabel);
				hide(priorityInput);
				break;
		}
	};

	FileEvent.listChange = function (this: FileEventPage, event: Event) {
		File.planToSave!(FileEvent.meta);
	};

	FileEvent.parameters = {
		initialize: function (this: FileEventList, list: FileEventList) {
			$('#fileEvent-parameter-type').loadItems([
				{ name: 'Boolean', value: 'boolean' },
				{ name: 'Number', value: 'number' },
				{ name: 'String', value: 'string' },
				{ name: 'Object', value: 'object' },
				{ name: 'Actor', value: 'actor' },
				{ name: 'Skill', value: 'skill' },
				{ name: 'State', value: 'state' },
				{ name: 'Equipment', value: 'equipment' },
				{ name: 'Item', value: 'item' },
				{ name: 'Trigger', value: 'trigger' },
				{ name: 'Light', value: 'light' },
				{ name: 'Element', value: 'element' }
			]);
		},
		parse: function ({ type, key, note }: { type: string; key: string; note: string }) {
			return [{ content: key }, { content: Local.get!('eventParameterTypes.' + type) }];
		},
		open: function ({
			type = 'number',
			key = '',
			note = ''
		}: { type?: string; key?: string; note?: string } = {}) {
			Window.open!('fileEvent-parameter');
			const write = getElementWriter('fileEvent-parameter');
			write('type', type);
			write('key', key);
			write('note', note);
			getFocus($('#fileEvent-parameter-type'));
		},
		save: function () {
			const read = getElementReader('fileEvent-parameter');
			const type = read('type');
			const key = read('key').trim();
			if (!key) {
				return getFocus($('#fileEvent-parameter-key'));
			}
			const note = read('note').trim();
			Window.close!('fileEvent-parameter');
			return { type, key, note };
		}
	};

	Inspector.fileEvent = FileEvent;
}
