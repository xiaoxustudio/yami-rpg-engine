import { getListConfig } from '@ui-kit';
import { $ } from '@/util/dom.ts';
import { Window } from '@/tools/window-object.ts';
import { addClass, getFocus, hasClass, on } from '@/util/element-utils.ts';
import { ctrl } from '@/util/event-accessors.ts';
import { File } from '@/file/file-system-core.ts';
import { GL } from '@/webgl/webgl-init.ts';
import { Codec } from '@/codec/codec.ts';
import { Menu } from '@/components/menu-list.ts';
import { getGlobalClipboard } from '@/types/global-clipboard.ts';
import { Data } from './data-object.ts';
import { Easing } from './transition-window.ts';

const Clipboard = getGlobalClipboard();
import { GUID } from '@/file/guid.ts';
import { Color } from '@/tools/color-picker-window.ts';
import { Local } from '@/tools/localization.ts';
import type { EditorProjectShape } from '@app/stores/editor';

type TeamData = {
	id: string;
	name: string;
	color: string;
	relations: Record<string, number>;
	collisions: Record<string, number>;
	[k: string]: any;
};

type TeamListElement = HTMLElement & {
	data: TeamData[];
	deleteNode(item: TeamData): void;
	update(): void;
};

export const Team = {
	list: null as HTMLElement | null,
	data: null as Array<TeamData> | null,
	maximum: null as number | null,
	changed: false,
	initialize: null as unknown as () => void,
	open: null as unknown as (data?: unknown) => void,
	createId: null as unknown as () => string,
	createData: null as unknown as () => TeamData,
	getItemById: null as unknown as (id: string) => ReturnType<typeof Easing.getItemById>,
	unpackTeams: null as unknown as () => void,
	packTeams: null as unknown as () => void,
	windowClose: null as unknown as (event: Event) => void,
	windowClosed: null as unknown as (event: Event) => void,
	listKeydown: null as unknown as (event: KeyboardEvent) => void,
	listPointerdown: null as unknown as (event: PointerEvent) => void,
	listSelect: null as unknown as (event: Event) => void,
	listChange: null as unknown as (event: Event) => void,
	listPopup: null as unknown as (event: PointerEvent & { value?: TeamData | null }) => void,
	confirm: null as unknown as (event: Event) => void,
	list_insert: null as unknown as (dItem: TeamData | null) => void,
	list_copy: null as unknown as (item: TeamData | null) => void,
	list_paste: null as unknown as (dItem: TeamData | null) => void,
	list_delete: null as unknown as (item: TeamData) => void,
	list_saveSelection: null as unknown as () => void,
	list_restoreSelection: null as unknown as () => void,
	list_createIcon: null as unknown as (item: TeamData) => void,
	list_updateIcon: null as unknown as (item: TeamData) => void,
	list_updateItemName: null as unknown as (item: TeamData) => void,
	state: null as string | null,
	teams: null as Record<string, TeamData> | null,
	saveToProject: null as ((project: EditorProjectShape) => void) | null,
	loadFromProject: null as ((project: EditorProjectShape) => void) | null,
	close: null as (() => void) | null
};

function ensureDomBound() {
	if (Team.list) return;
	const list = $('#team-list');
	if (!list) return;
	Team.list = list;
	list.insert = null as unknown as (...args: unknown[]) => void;
	list.copy = null as unknown as (...args: unknown[]) => void;
	list.paste = null as unknown as (...args: unknown[]) => void;
	list.delete = null as unknown as (...args: unknown[]) => void;
	list.saveSelection = null as unknown as (...args: unknown[]) => void;
	list.restoreSelection = null as unknown as (...args: unknown[]) => void;
	list.updateNodeElement = Easing.list_updateNodeElement;
	list.createIcon = Team.list_createIcon as (item: unknown) => unknown;
	list.updateIcon = Team.list_updateIcon as (item: unknown) => unknown;
	list.updateItemName = Team.list_updateItemName as (item: unknown) => unknown;
	list.updateTextNode = Easing.list_updateTextNode;
	list.insert = Team.list_insert;
	list.copy = Team.list_copy;
	list.paste = Team.list_paste;
	list.delete = Team.list_delete;
	list.saveSelection = Team.list_saveSelection;
	list.restoreSelection = Team.list_restoreSelection;
}

Team.initialize = function (this: typeof Team) {
	ensureDomBound();
	if (!Team.list) return;
	this.maximum = 256;

	const list = this.list!;
	getListConfig(list).removable = true;
	getListConfig(list).foldable = false;
	getListConfig(list).renamable = true;
	list.bind(() => this.data);
	getListConfig(list).creators.push(list.createIcon);
	getListConfig(list).updaters.push(list.updateTextNode);

	on($('#team'), 'close', this.windowClose);
	on($('#team'), 'closed', this.windowClosed);
	on(list, 'keydown', this.listKeydown);
	on(list, 'pointerdown', this.listPointerdown);
	// list select/popup 经 Vue 模板转发（Team.vue @select/@popup → Team.list*）
	// list change 经 Vue 模板转发（Team.vue @change → Team.listChange）
	on($('#team-confirm'), 'click', this.confirm);
};

Team.open = function (this: typeof Team, data: unknown) {
	Window.open!('team');

	this.unpackTeams();

	this.list!.restoreSelection();

	getFocus(this.list);
};

Team.createId = function (this: typeof Team) {
	let id;
	do {
		id = GUID.generate64bit();
	} while (this.getItemById(id));
	return id;
};

Team.createData = function (this: typeof Team) {
	const id = this.createId();
	const relations = {} as Record<string, number>;
	const collisions = {} as Record<string, number>;
	const teams = this.data!;
	for (const { id } of teams) {
		relations[id] = 1;
		collisions[id] = 1;
	}
	relations[id] = 1;
	collisions[id] = 1;
	return {
		id: id,
		name: '',
		color: '000000ff',
		relations: relations,
		collisions: collisions
	};
};

Team.getItemById = Easing.getItemById;

Team.unpackTeams = function (this: typeof Team) {
	const items = Data.teams.list;
	const length = items.length;
	const sRelations = Codec.decodeTeamData(Data.teams.relations, length);
	const sCollisions = Codec.decodeTeamData(Data.teams.collisions, length);
	const copies = new Array(length);
	const a = length * 2;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		const dRelations = {} as Record<string, number>;
		const dCollisions = {} as Record<string, number>;
		for (let j = 0; j < i; j++) {
			const ri = ((a - j + 1) / 2) * j - j + i;
			const id = items[j].id;
			dRelations[id] = sRelations[ri];
			dCollisions[id] = sCollisions[ri];
		}
		const b = ((a - i + 1) / 2) * i - i;
		for (let j = i; j < length; j++) {
			const ri = b + j;
			const id = items[j].id;
			dRelations[id] = sRelations[ri];
			dCollisions[id] = sCollisions[ri];
		}
		copies[i] = {
			id: item.id,
			name: item.name,
			color: item.color,
			relations: dRelations,
			collisions: dCollisions
		};
	}
	this.data = copies;
};

Team.packTeams = function (this: typeof Team) {
	const items = this.data!;
	const length = items.length;
	const copies = new Array(length);
	const dRelations = GL.arrays[0].uint8;
	const dCollisions = GL.arrays[1].uint8;
	let ri = 0;
	for (let i = 0; i < length; i++) {
		const item = items[i];
		const sRelations = item.relations;
		const sCollisions = item.collisions;
		for (let j = i; j < length; j++, ri++) {
			const id = items[j].id;
			dRelations[ri] = sRelations[id];
			dCollisions[ri] = sCollisions[id];
		}
		copies[i] = {
			id: item.id,
			name: item.name,
			color: item.color
		};
	}
	Data.teams.list = copies;
	Data.teams.relations = Codec.encodeTeamData(new Uint8Array(dRelations.buffer, 0, ri));
	Data.teams.collisions = Codec.encodeTeamData(new Uint8Array(dCollisions.buffer, 0, ri));
	Data.createTeamMap();
};

Team.windowClose = function (event: Event) {
	if (Team.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedTeams')
			},
			[
				{
					label: get('yes'),
					click: () => {
						Team.changed = false;
						Window.close!('team');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Team.windowClosed = function (this: typeof Team, event: Event) {
	this.data = null;
	this.list!.clear();
}.bind(Team);

Team.listKeydown = function (this: TeamListElement, event: KeyboardEvent) {
	const item = this.read();
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				this.copy(item);
				break;
			case 'KeyV':
				this.paste();
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Insert':
				this.insert(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
		}
	}
};

Team.listPointerdown = function (this: TeamListElement, event: PointerEvent) {
	switch (event.button) {
		case 0:
			if (hasClass(event.target, 'team-icon')) {
				const element = (event.target as HTMLElement).parentNode as HTMLElement;
				const team = element.item!;
				return Color.open({
					read: () => {
						return team.color;
					},
					input: (color: string) => {
						team.color = color;
						this.updateIcon(team);
						Team.changed = true;
					}
				});
			}
			if (hasClass(event.target, 'team-relation-mark')) {
				const element = (event.target as HTMLElement).closest('node-item') as HTMLElement;
				const teamA = this.read();
				const teamB = element.item!;
				teamA.relations[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.relations[teamA.id] ^= 1;
				}
				this.update();
				Team.changed = true;
			}
			if (hasClass(event.target, 'team-collision-mark')) {
				const element = (event.target as HTMLElement).closest('node-item') as HTMLElement;
				const teamA = this.read();
				const teamB = element.item!;
				teamA.collisions[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.collisions[teamA.id] ^= 1;
				}
				this.update();
				Team.changed = true;
			}
			break;
	}
};

Team.listSelect = function (event: Event) {
	const list = Team.list!;
	let rendered = false;
	for (const team of list.data) {
		const element = team.element;
		if (element !== undefined) {
			element.changed = true;
			if (element.parentNode) {
				rendered = true;
			}
		}
	}
	if (rendered) {
		list.update();
	}
};

Team.listChange = function () {
	Team.changed = true;
};

Team.listPopup = function (event: PointerEvent & { value?: TeamData | null }) {
	const list = Team.list!;
	const item = event.value;
	const length = Team.data!.length;
	const selected = !!item;
	const insertable = length < Team.maximum!;
	const pastable = insertable && Clipboard.has('yami.data.team');
	const deletable = selected && length > 1;
	const get = Local.createGetter!('menuTeamList');
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		[
			{
				label: get('insert'),
				accelerator: 'Insert',
				enabled: insertable,
				click: () => {
					list.insert(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					list.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					list.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					list.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: selected,
				click: () => {
					list.rename(item);
				}
			}
		]
	);
};

Team.confirm = function (this: typeof Team, event: Event) {
	if (this.changed) {
		this.changed = false;
		this.packTeams();
		File.planToSave!(Data.manifest.project.teams);
		const datachange = new Event('datachange');
		datachange.key = 'teams';
		window.dispatchEvent(datachange);
	}
	Window.close!('team');
}.bind(Team);

Team.list_insert = function (this: TeamListElement, dItem: TeamData | null) {
	if (this.data.length < Team.maximum!) {
		const team = Team.createData();
		const id = team.id;
		for (const item of this.data) {
			item.relations[id] = 1;
			item.collisions[id] = 1;
		}
		this.addNodeTo(team, dItem);
	}
};

Team.list_copy = function (item: TeamData | null) {
	if (item) {
		Clipboard.write('yami.data.team', item);
	}
};

Team.list_paste = function (this: TeamListElement, dItem: TeamData | null) {
	const copy = Clipboard.read('yami.data.team');
	if (copy) {
		const dId = Team.createId();
		const cRelations = copy.relations;
		const cCollisions = copy.collisions;
		const dRelations = {} as Record<string, number>;
		const dCollisions = {} as Record<string, number>;
		for (const item of this.data) {
			const sId = item.id;
			const sRelations = item.relations;
			const sCollisions = item.collisions;
			const r = cRelations[sId] ?? 1;
			const c = cCollisions[sId] ?? 1;
			sRelations[dId] = r;
			sCollisions[dId] = c;
			dRelations[sId] = r;
			dCollisions[sId] = c;
		}
		dRelations[dId] = 1;
		dCollisions[dId] = 1;
		copy.name += ' - Copy';
		copy.id = dId;
		copy.relations = dRelations;
		copy.collisions = dCollisions;
		this.addNodeTo(copy, dItem);
	}
};

Team.list_delete = function (this: TeamListElement, item: TeamData) {
	const items = this.data;
	if (items.length > 1) {
		const get = Local.createGetter!('confirmation');
		Window.confirm!(
			{
				message: get('deleteSingleFile').replace('<filename>', item.name)
			},
			[
				{
					label: get('yes'),
					click: () => {
						const id = item.id;
						for (const item of items) {
							delete item.relations[id];
						}
						const index = items.indexOf(item);
						this.deleteNode(item);
						const last = items.length - 1;
						this.select(items[Math.min(index, last)]);
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
};

Team.list_saveSelection = function (this: TeamListElement) {
	const { teams } = Data;
	if (teams.selection === undefined) {
		Object.defineProperty(teams, 'selection', {
			writable: true,
			value: ''
		});
	}
	const selection = this.read();
	if (selection) {
		teams.selection = selection.id;
	}
};

Team.list_restoreSelection = function (this: TeamListElement) {
	const id = Data.teams.selection;
	const item = Team.getItemById(id) ?? this.data[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
};

Team.list_createIcon = function (item: TeamData) {
	const { element } = item;
	const icon = document.createElement('node-icon');
	addClass(icon, 'team-icon');
	element.nodeIcon = icon;
	element.insertBefore(icon, element.textNode);
	Team.list_updateIcon(item);
};

Team.list_updateIcon = function (item: TeamData) {
	const icon = item.element.nodeIcon;
	const color = item.color;
	if (icon.color !== color) {
		icon.color = color;
		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		icon.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	}
};

Team.list_updateItemName = function (this: TeamListElement, item: TeamData) {
	this.updateTextNode(item);
};
