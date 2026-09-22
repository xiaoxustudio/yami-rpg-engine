import { reactive } from 'vue';
import { inspectorEls } from './element-registry.ts';
import { registryElement } from '@app/utils/element-registry';
import { getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@app/tools/window-object.ts';
import { clear, hide, show } from '@app/utils/element-utils';
import { EventEditor } from '@app/commands/event-editor.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { requestFocus } from '@app/directives/focus';
import { Inspector } from '@app/inspector/inspector.ts';
import { getYamiI18n } from '@app/i18n';
import type { YamiElement } from '@app/types/element-api';

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
		/**
		 * 参数列表。**可空**：字面量里先占 `null`，真实实现在 `FileEvent.parameters = {…}`
		 * 那一句才装上（本文件第 194 行起）。
		 *
		 * 之所以要如实写 `| null`：写成非空的 `FileEventList` 时，下面那个对象字面量就
		 * 对不上类型，只能整块 `as unknown as FileEventPage` —— **一处双重断言，
		 * 换来整个单例 9 个成员一起不受检**。改成可空后断言消失，缺口只剩「谁忘了赋值」，
		 * 而那由 `?.` 显式表达。
		 */
		parameters: FileEventList | null;
		update: ((event: FileEventData, key: string, value: unknown) => void) | null;
		listChange: ((event: Event) => void) | null;
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

			inspectorEls
				.get('fileEvent-type')
				?.loadItems?.(Enum.getMergedItems!(EventEditor.types?.global, 'global-event'));

			const write = getElementWriter('fileEvent', event);
			write('parameters');

			registryElement<HTMLElement & { sync?: () => void }>(
				inspectorEls,
				'fileEvent-vue-mount'
			)?.sync?.();
		}
	};

	FileEvent.close = function (this: FileEventPage) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear(inspectorEls.get('fileEvent-parameters'));
		}
	};

	FileEvent.write = function (this: FileEventPage, _options: { type?: string }) {
		registryElement<{ sync?: () => void }>(inspectorEls, 'fileEvent-vue-mount')?.sync?.();
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
		const enabledInput = inspectorEls.get('fileEvent-enabled') as YamiElement;
		const enabledLabel = enabledInput.previousElementSibling;
		const priorityInput = inspectorEls.get('fileEvent-priority') as YamiElement;
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
			FileEvent.parameters?.loadTypeItems?.();
		},
		loadTypeItems: function () {
			const el = inspectorEls.get('fileEvent-parameter-type') as YamiElement;
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
