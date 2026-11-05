import { reactive } from 'vue';
import { getFileEventParameterBridge } from '@app/composables/file-event-parameter-bridge';
import { getFileEventPageBridge } from '@app/composables/file-event-page-bridge';
import { getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@app/tools/window-object.ts';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { requestFocus } from '@app/directives/focus';
import { Inspector } from '@app/inspector/inspector.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

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
		[k: string]: unknown;
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
		parameters: FileEventList | null;
		update: ((event: FileEventData, key: string, value: unknown) => void) | null;
		listChange: ((event?: Event) => void) | null;
		[k: string]: unknown;
	}

	const FileEvent: FileEventPage = {
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
	};

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

			getFileEventPageBridge()?.loadTypeItems(
				Enum.getMergedItems!(EventEditor.types?.global, 'global-event')
			);

			const write = getElementWriter('fileEvent', event);
			write('parameters');

			getFileEventPageBridge()?.sync();
		}
	};

	FileEvent.close = function (this: FileEventPage) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			getFileEventPageBridge()?.clearParameters();
		}
	};

	FileEvent.write = function (this: FileEventPage, _options: { type?: string }) {
		getFileEventPageBridge()?.sync();
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
		const bridge = getFileEventPageBridge();
		const value = event.value;
		switch (value) {
			case 'common':
				bridge?.setEnabledVisible(false);
				break;
			default:
				bridge?.setEnabledVisible(true);
				break;
		}
		const showsPriority = [
			'input',
			'keydown',
			'keyup',
			'mousedown',
			'mouseup',
			'mousemove',
			'doubleclick',
			'wheel',
			'touchstart',
			'touchmove',
			'touchend',
			'gamepadbuttonpress',
			'gamepadbuttonrelease',
			'gamepadleftstickchange',
			'gamepadrightstickchange'
		].includes(value ?? '');
		bridge?.setPriorityVisible(showsPriority);
	};

	FileEvent.listChange = function (this: FileEventPage, _event?: Event) {
		File.planToSave!(FileEvent.meta);
	};

	FileEvent.parameters = {
		initialize: function (this: FileEventList, _list: FileEventList) {
			FileEvent.parameters?.loadTypeItems?.();
		},
		loadTypeItems: function () {
			getFileEventParameterBridge()?.loadTypeItems([
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
			FileEvent.parameters?.loadTypeItems?.();
			Object.assign(fileEventParameterForm, { type, key, note });
			requestFocus('fileEvent-parameter-type');
		},
		save: function () {
			const type = fileEventParameterForm.type;
			const key = fileEventParameterForm.key.trim();
			if (!key) {
				return requestFocus('fileEvent-parameter-key');
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
