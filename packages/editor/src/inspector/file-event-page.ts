import { reactive } from 'vue';
import { $, getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@app/tools/window-object.ts';
import { clear, getFocus, hide, show, write } from '@app/utils/element-utils';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { t } from '@app/i18n';

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
		// oxlint-disable-next-line no-explicit-any
		[k: string]: any;
	}

	interface FileEventList {
		save(): void;
		on?(type: string, listener: (event: Event) => void): void;
		loadTypeItems?(): void;
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
		typeWrite: null,
		listChange: null
	} as unknown as FileEventPage;

	FileEvent.initialize = function () {};

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

			($('#fileEvent-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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

	FileEvent.listChange = function (this: FileEventPage, _event: Event) {
		File.planToSave!(FileEvent.meta);
	};

	FileEvent.parameters = {
		initialize: function (this: FileEventList, _list: FileEventList) {
			FileEvent.parameters.loadTypeItems?.();
		},
		loadTypeItems: function () {
			const el = $('#fileEvent-parameter-type');
			if (!el) return;
			el.loadItems([
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
		parse: function ({ type, key }: { type: string; key: string; note: string }) {
			return [{ content: key }, { content: t('eventParameterTypes.' + type) }];
		},
		open: function ({
			type = 'number',
			key = '',
			note = ''
		}: { type?: string; key?: string; note?: string } = {}) {
			Window.open!('fileEvent-parameter');
			FileEvent.parameters.loadTypeItems?.();
			Object.assign(fileEventParameterForm, { type, key, note });
			getFocus($('#fileEvent-parameter-type'));
		},
		save: function () {
			const type = fileEventParameterForm.type;
			const key = fileEventParameterForm.key.trim();
			if (!key) {
				return getFocus($('#fileEvent-parameter-key'));
			}
			const note = fileEventParameterForm.note.trim();
			Window.close!('fileEvent-parameter');
			return { type, key, note };
		}
	};

	Inspector.fileEvent = FileEvent;
}

export interface FileEventParameterForm {
	type: string;
	key: string;
	note: string;
}
export const fileEventParameterForm = reactive<FileEventParameterForm>({
	type: 'number',
	key: '',
	note: ''
});
