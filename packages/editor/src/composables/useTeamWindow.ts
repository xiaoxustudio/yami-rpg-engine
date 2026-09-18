import { getListConfig, isTreeItemRendered, setTreeItemText, treeItemOf } from '@ui-kit';
import { getWindowStore } from '@app/stores/window';
import { composableEls } from '@app/composables/element-registry';
import { getFocus, hasClass, on } from '@app/utils/element-utils.ts';
import { ctrl } from '@app/utils/event-accessors';
import { File } from '@app/file/file-system-core.ts';
import { GL } from '@app/engine/webgl/webgl-init.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { Menu } from '@app/components/menu-list.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { Data } from '@app/data/data-object.ts';
import { GUID } from '@app/services/file-system/guid.ts';
import { Color } from '@app/tools/color-picker-window.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import '@app/utils/number';
import '@app/utils/object';
import { getTeamStore } from '@app/stores/team';
import type { TeamDataShape } from '@app/stores/team';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import { computeIndexDigits } from '@app/utils/number';

const Clipboard = GlobalClipboard;

export type TeamData = {
	id: string;
	name: string;
	color: string;
	relations: Record<string, number>;
	collisions: Record<string, number>;
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
};

export type TeamListElement = YamiElement & {
	data: TeamData[];
	deleteNode(item: TeamData): void;
	update(): void;
};

interface TeamWindow {
	list: TeamListElement | null;
	maximum: number | null;
	changed: boolean;
	initialize: () => void;
	open: (data?: unknown) => void;
	createId: () => string;
	createData: () => TeamData;
	getItemById: (id: string) => TeamData | null;
	unpackTeams: () => void;
	packTeams: () => void;
	windowClose: (event: YamiEvent) => void;
	windowClosed: (event: YamiEvent) => void;
	setChanged: (value: boolean) => void;
	listKeydown: (event: KeyboardEvent) => void;
	listPointerdown: (event: PointerEvent) => void;
	listSelect: (event: YamiEvent) => void;
	listChange: (event?: Event) => void;
	listPopup: (event: PointerEvent & { value?: TeamData | null }) => void;
	confirm: (event?: Event) => void;
	list_insert: (dItem: TeamData | null) => void;
	list_copy: (item: TeamData | null) => void;
	list_paste: (dItem: TeamData | null) => void;
	list_delete: (item: TeamData) => void;
	list_saveSelection: () => void;
	list_restoreSelection: () => void;
	list_updateItemName: (item: TeamData) => void;
}

let list: TeamListElement | null = null;
let maximum: number | null = null;
let changed = false;
let initializedElement: TeamListElement | null = null;

function mountListMethods(listElement: TeamListElement): void {
	listElement.insert = null as unknown as (...args: unknown[]) => void;
	listElement.copy = null as unknown as (...args: unknown[]) => void;
	listElement.paste = null as unknown as (...args: unknown[]) => void;
	listElement.delete = null as unknown as (...args: unknown[]) => void;
	listElement.saveSelection = null as unknown as (...args: unknown[]) => void;
	listElement.restoreSelection = null as unknown as (...args: unknown[]) => void;
	listElement.updateItemName = list_updateItemName as (item: unknown) => unknown;
	listElement.updateTextNode = list_updateTextNode;
	listElement.insert = list_insert;
	listElement.copy = list_copy;
	listElement.paste = list_paste;
	listElement.delete = list_delete;
	listElement.saveSelection = list_saveSelection;
	listElement.restoreSelection = list_restoreSelection;
}

function initialize(): void {
	const current = composableEls.get('team-list') as unknown as TeamListElement | null;
	if (!current) return;
	if (initializedElement === current) return;
	initializedElement = current;
	list = current;
	maximum = 256;

	mountListMethods(current);

	const listElement = current;
	getListConfig(listElement).removable = true;
	getListConfig(listElement).foldable = false;
	getListConfig(listElement).renamable = true;
	listElement.bind(() => getTeamStore().data);
	// oxlint-disable-next-line unbound-method
	getListConfig(listElement).updaters.push(listElement.updateTextNode);

	on(composableEls.get('team'), 'close', windowClose);
	on(composableEls.get('team'), 'closed', windowClosed);
	on(listElement, 'keydown', listKeydown);
	on(listElement, 'pointerdown', listPointerdown);
	// `team-confirm` 由 WindowFrame → YMFormButtons 生成（模板与注册表都取不到）→ 由 Team.vue 的 @confirm 驱动
}

function open(_data?: unknown): void {
	getWindowStore().open('team');

	unpackTeams();
	getTeamStore().teams = Data.teams.map as unknown as Record<string, TeamData>;

	getTeamStore().state = 'open';
	list!.restoreSelection();

	getFocus(list);
}

function createId(): string {
	let id;
	do {
		id = GUID.generate64bit();
	} while (getItemById(id));
	return id;
}

function createData(): TeamData {
	const id = createId();
	const relations = {} as Record<string, number>;
	const collisions = {} as Record<string, number>;
	const teams = getTeamStore().data!;
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
}

function getItemById(id: string): TeamData | null {
	const data = getTeamStore().data;
	if (!data) return null;
	const { length } = data;
	for (let i = 0; i < length; i++) {
		if (data[i].id === id) {
			return data[i];
		}
	}
	return null;
}

function unpackTeams(): void {
	const items = Data.teams.list;
	const length = items.length;
	const sRelations = Codec.decodeTeamData!(Data.teams.relations, length);
	const sCollisions = Codec.decodeTeamData!(Data.teams.collisions, length);
	const copies = Array.from<TeamDataShape>({ length: length });
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
	getTeamStore().data = copies;
}

function packTeams(): void {
	const items = getTeamStore().data!;
	const length = items.length;
	const copies = Array.from<Omit<TeamDataShape, 'relations' | 'collisions'>>({
		length: length
	});
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
	Data.teams.list = copies as TeamDataShape[];
	Data.teams.relations = Codec.encodeTeamData!(new Uint8Array(dRelations.buffer, 0, ri));
	Data.teams.collisions = Codec.encodeTeamData!(new Uint8Array(dCollisions.buffer, 0, ri));
	Data.createTeamMap();
}

function windowClose(event: YamiEvent): void {
	if (changed) {
		event.preventDefault();
		const get = (key: string) => t('confirmation.' + key);
		getWindowStore().confirm(
			{
				message: get('closeUnsavedTeams')
			},
			[
				{
					label: get('yes'),
					click: () => {
						changed = false;
						getWindowStore().close('team');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}

function windowClosed(_event: YamiEvent): void {
	getTeamStore().state = 'closed';
	getTeamStore().teams = null;
	getTeamStore().data = null;
	list!.clear();
}

function setChanged(value: boolean): void {
	changed = value;
}

function listKeydown(this: TeamListElement, event: KeyboardEvent): void {
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
}

/**
 * 事件目标 → 行 item。
 *
 * 先归一到行元素再取 item：队伍行里的关系/冲突标记渲染在 `.tree-node-extras` 下，
 * 而 `treeItemOf` 按"点击归一"的语义**不**把 extras 当行（那是列按钮的位置）；
 * 这里要的是"这个节点属于哪一行"，所以先 `closest('.node-item')`。
 */
function teamOfTarget(target: EventTarget | null): TeamData | undefined {
	const row = (target as Element | null)?.closest?.('.node-item') ?? null;
	return treeItemOf<TeamData>(row);
}

function listPointerdown(this: TeamListElement, event: PointerEvent): void {
	switch (event.button) {
		case 0:
			if (hasClass(event.target, 'team-icon')) {
				// P4b：行 → item 经行 API 取（`element.item` expando 已退役）
				const team = teamOfTarget(event.target);
				if (team === undefined) return;
				return Color.open({
					read: () => {
						return team.color;
					},
					input: (color: string) => {
						team.color = color;
						this.update();
						changed = true;
					}
				});
			}
			if (hasClass(event.target, 'team-relation-mark')) {
				const teamA = this.read();
				const teamB = teamOfTarget(event.target);
				if (teamB === undefined) return;
				teamA.relations[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.relations[teamA.id] ^= 1;
				}
				this.update();
				changed = true;
			}
			if (hasClass(event.target, 'team-collision-mark')) {
				const teamA = this.read();
				const teamB = teamOfTarget(event.target);
				if (teamB === undefined) return;
				teamA.collisions[teamB.id] ^= 1;
				if (teamA !== teamB) {
					teamB.collisions[teamA.id] ^= 1;
				}
				this.update();
				changed = true;
			}
			break;
	}
}

function listSelect(_event: YamiEvent): void {
	const listElement = list!;
	// 步骤 5b：可见性由派生层判断（`item.element` / `element.changed` 均已退役）；
	// `update()` 自己会重建行，不再需要逐行标 changed
	if (listElement.data.some((team: TeamData) => isTreeItemRendered(team))) {
		listElement.update();
	}
}

function listChange(_event?: Event): void {
	changed = true;
}

function listPopup(event: PointerEvent & { value?: TeamData | null }): void {
	const listElement = list!;
	const item = event.value;
	const length = getTeamStore().data!.length;
	const selected = !!item;
	const insertable = length < maximum!;
	const pastable = insertable && Clipboard.has('yami.data.team');
	const deletable = selected && length > 1;
	const get = (key: string) => t('menuTeamList.' + key);
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
					listElement.insert(item);
				}
			},
			{
				label: get('copy'),
				accelerator: ctrl('C'),
				enabled: selected,
				click: () => {
					listElement.copy(item);
				}
			},
			{
				label: get('paste'),
				accelerator: ctrl('V'),
				enabled: pastable,
				click: () => {
					listElement.paste(item);
				}
			},
			{
				label: get('delete'),
				accelerator: 'Delete',
				enabled: deletable,
				click: () => {
					listElement.delete(item);
				}
			},
			{
				label: get('rename'),
				accelerator: 'F2',
				enabled: selected,
				click: () => {
					listElement.rename(item);
				}
			}
		]
	);
}

function confirm(_event?: Event): void {
	if (changed) {
		changed = false;
		packTeams();
		File.planToSave!(Data.manifest.project.teams);
		const datachange = new Event('datachange') as YamiEvent;
		datachange.key = 'teams';
		window.dispatchEvent(datachange);
	}
	getWindowStore().close('team');
}

function list_insert(this: TeamListElement, dItem: TeamData | null): void {
	if (this.data.length < maximum!) {
		const team = createData();
		const id = team.id;
		for (const item of this.data) {
			item.relations[id] = 1;
			item.collisions[id] = 1;
		}
		this.addNodeTo(team, dItem);
	}
}

function list_copy(item: TeamData | null): void {
	if (item) {
		Clipboard.write('yami.data.team', item);
	}
}

function list_paste(this: TeamListElement, dItem: TeamData | null): void {
	const copy = Clipboard.read('yami.data.team');
	if (copy) {
		const dId = createId();
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
}

function list_delete(this: TeamListElement, item: TeamData): void {
	const items = this.data;
	if (items.length > 1) {
		const get = (key: string) => t('confirmation.' + key);
		getWindowStore().confirm(
			{
				message: t('confirmation.deleteSingleFile', { filename: item.name })
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
}

function list_saveSelection(this: TeamListElement): void {
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
}

function list_restoreSelection(this: TeamListElement): void {
	const id = Data.teams.selection;
	const item = getItemById(id) ?? this.data?.[0];
	this.select(item);
	this.update();
	this.scrollToSelection();
}

function list_updateItemName(this: TeamListElement, item: TeamData): void {
	this.updateTextNode(item);
}

function list_updateTextNode(this: TeamListElement, item: TeamData): void {
	const items = item.parent.children;
	const index = items.indexOf(item);
	const length = items.length;
	const digits = computeIndexDigits(length);
	const sn = index.toString().padStart(digits, '0');
	// 步骤 4：显示文本经派生层覆盖（不再直写 textNode；窗口外行亦生效）
	setTreeItemText(item, `${sn}:${item.name}`);
}

export function useTeamWindow(): TeamWindow {
	return {
		get list() {
			return list;
		},
		get maximum() {
			return maximum;
		},
		get changed() {
			return changed;
		},
		initialize,
		open,
		createId,
		createData,
		getItemById,
		unpackTeams,
		packTeams,
		windowClose,
		windowClosed,
		setChanged,
		listKeydown,
		listPointerdown,
		listSelect,
		listChange,
		listPopup,
		confirm,
		list_insert,
		list_copy,
		list_paste,
		list_delete,
		list_saveSelection,
		list_restoreSelection,
		list_updateItemName
	};
}
