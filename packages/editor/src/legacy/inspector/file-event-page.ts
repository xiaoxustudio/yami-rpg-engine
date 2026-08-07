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
	const FileEvent = {
		target: null as any,
		meta: null as any,
		parameters: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		paramInput: null as any,
		typeWrite: null as any,
		listChange: null as any
	};

	FileEvent.initialize = function (this: any) {
		if (!$('#fileEvent-type')) return;
		if (!EventEditor.types) return;
		$('#fileEvent-type').loadItems(EventEditor.types.global);
		EventEditor.types.relatedElements.push($('#fileEvent-type'));

		$('#fileEvent-returnType').loadItems([
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

		$('#fileEvent-parameters').bind(this.parameters);

		// 6 控件 input + type write 经 Vue 模板转发（FileEventPage.vue @input/@write → FileEvent.*）
		$('#fileEvent-parameters').on('change', this.listChange);
	};

	FileEvent.create = function (this: any, filter: any) {
		const type = EventEditor.types[filter][0].value;
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

	FileEvent.open = function (this: any, event: any, meta: any) {
		if (this.meta !== meta) {
			this.target = event;
			this.meta = meta;

			$('#fileEvent-type').loadItems(
				Enum.getMergedItems!(EventEditor.types.global, 'global-event')
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

	FileEvent.close = function (this: any) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear($('#fileEvent-parameters'));
		}
	};

	FileEvent.write = function (this: any, options: any) {
		if (options.type !== undefined) {
			write($('#fileEvent-type'), options.type);
		}
	};

	FileEvent.update = function (this: any, event: any, key: any, value: any) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'type':
			case 'priority':
			case 'namespace':
			case 'returnType':
			case 'description':
				if (event[key] !== value) {
					event[key] = value;
				}
				break;
			case 'enabled':
				if (event.enabled !== value) {
					event.enabled = value;
					getBrowserInstance()?.body?.updateIcon?.(this.meta.file);
				}
				break;
		}
	};

	FileEvent.paramInput = function (this: any, event: any) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileEvent-').test(element.id)) break;
			element = element.parentElement;
		}
		FileEvent.update(FileEvent.target, Inspector.getKey!(element), read(element));
	};

	FileEvent.typeWrite = function (this: any, event: any) {
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

	FileEvent.listChange = function (this: any, event: any) {
		File.planToSave!(FileEvent.meta);
	};

	FileEvent.parameters = {
		initialize: function (this: any, list: any) {
			$('#fileEvent-parameter-confirm').on('click', () => list.save());

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
		parse: function ({ type, key, note }: any) {
			return [{ content: key }, { content: Local.get!('eventParameterTypes.' + type) }];
		},
		open: function ({ type = 'number', key = '', note = '' } = {}) {
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
