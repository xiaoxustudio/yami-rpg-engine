import { getListConfig } from '@ui-kit';
import { Command } from '@app/legacy/command/command-object.ts';
import { addClass } from '@app/utils/element-utils';
import { Data } from '@app/legacy/data/data-object.ts';
import { EventEditor } from '@app/legacy/command/event-editor.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { t } from '@app/i18n';

import { IListInterface } from '@app/legacy/types/list-interface.ts';
import { HistoryData, IEditableHistory } from '@app/legacy/types/history.ts';

interface EventListTargetShape {
	guid?: string;
	presetId?: string;
	events?: unknown;
	element?: HTMLElement | null;
}

interface EventListEventShape {
	type: string;
	enabled: boolean;
}

interface EventListDom extends HTMLElement {
	inserting?: boolean;
}

const FILTER_BY_LIST_ID: Record<string, string> = {
	'fileActor-events': 'actor',
	'sceneActor-events': 'actor',
	'fileSkill-events': 'skill',
	'fileState-events': 'state',
	'fileEquipment-events': 'equipment',
	'fileItem-events': 'item',
	'fileTrigger-events': 'trigger',
	'fileScene-events': 'scene',
	'fileAnimation-events': 'animation',
	'sceneAnimation-events': 'animation',
	'sceneLight-events': 'light',
	'sceneParallax-events': 'parallax',
	'sceneParticle-events': 'particle',
	'sceneRegion-events': 'region',
	'sceneTilemap-events': 'tilemap',
	'uiElement-events': 'element'
};

export class EventListInterface implements IListInterface {
	target!: HTMLElement | null;
	type!: string;
	filter!: string;
	editor!: { target?: unknown } | null;
	owner!: { history?: unknown } | null;
	eventItem!: Record<string, unknown> | null;
	editCallback!: (() => void) | null;
	insertCallback!: (() => void) | null;
	history!: IEditableHistory | null;

	constructor(editor?: unknown, owner?: unknown) {
		this.editor = (editor as { target?: unknown } | null) ?? null;
		this.owner = (owner as { history?: unknown } | null) ?? null;
	}

	initialize(list: EventListDom): void {
		getListConfig(list).togglable = true;
		this.filter = list.getAttribute('filter') ?? FILTER_BY_LIST_ID[list.id] ?? 'global';
		this.type = `${this.filter}.event`;
		this.editCallback = () => list.save();
		this.insertCallback = () => {
			if (list.inserting) {
				list.save();
				list.inserting = false;
			} else {
				list.start!--;
				list.save();
				list.select(list.start! + 1);
			}
		};

		const { editor, owner } = this;
		if (editor && owner) {
			this.history = new Inspector.ParamHistory!(editor, owner, list);
			this.history!.save = EventListInterface.historySave;
		}

		window.addEventListener('localize', (event: Event) => {
			if (list.data) list.update();
		});
	}

	parse(event: EventListEventShape) {
		const { type } = event;
		if (EventListInterface.guidRegExp.test(type)) {
			Command.invalid = false;
			const groupKey = this.filter + '-event';
			const eventType = Command.parseGroupEnumString!(groupKey, type);
			const eventClass = Command.invalid ? 'invalid' : event.enabled ? '' : 'weak';
			return {
				content: Command.removeTextTags!(eventType),
				class: eventClass
			};
		}
		return {
			content: t('eventTypes.' + type),
			class: event.enabled ? '' : 'weak'
		};
	}

	update(list: HTMLElement) {
		const elements = list.elements;
		const items = list.read();
		const length = items.length;
		if (length !== 0) {
			const flags = {} as Record<string, boolean>;
			for (let i = length - 1; i >= 0; i--) {
				const { type } = items[i];
				if (flags[type]) {
					addClass(elements[i], 'weak');
				} else {
					flags[type] = true;
				}
			}
		}

		const item = this.editor?.target as EventListTargetShape | undefined;
		if (item?.events === list.read()) {
			const element = item!.element;
			const list = element?.parentNode;
			if (list instanceof HTMLElement && list.classList.contains('tree-list')) {
				(list as unknown as { update: () => void }).update();
			}
		}
	}

	open(event?: EventListEventShape) {
		const filter = this.filter;
		let callback = this.editCallback;
		let inserting = false;
		if (event === undefined) {
			event = Inspector.fileEvent.create(filter);
			callback = this.insertCallback;
			inserting = true;
		}
		const target = this.editor!.target as EventListTargetShape;
		if (target.guid) {
			const id = target.guid;
			const fileName = Data.manifest.guidMap[id]?.file.basename;
			this.eventItem = EventEditor.openLocalEvent!(
				inserting,
				filter,
				fileName,
				event,
				callback
			);
		} else if (target.presetId) {
			const id = target.presetId;
			const preset = Data.scenePresets[id] ?? Data.uiPresets[id];
			if (preset) {
				const rootId = preset.sceneId ?? preset.uiId;
				const rootName = Data.manifest.guidMap[rootId]?.file.basename;
				const eventName = `${rootName}.${preset.data.name}`;
				this.eventItem = EventEditor.openLocalEvent!(
					inserting,
					filter,
					eventName,
					event,
					callback
				);
			}
		}
	}

	save() {
		return EventEditor.save!(this.eventItem);
	}

	static guidRegExp = /^[0-9a-f]{16}$/;

	static historySave(data: HistoryData) {
		Inspector.ParamHistory.prototype.save.call(this, data);
		if (data.type === 'inspector-param-replace') {
			delete data.swap.commands.symbol;
		}
	}
}
