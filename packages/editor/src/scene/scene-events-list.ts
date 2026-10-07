import { Scene } from './scene-window.ts';
import type { SceneItem } from './scene-events.ts';
import { read, write } from '@app/utils/element-utils.ts';
import { ctrl } from '@app/utils/event-accessors';
import { Inspector } from '@app/inspector/inspector.ts';
import { Menu } from '@app/components/menu-list.ts';
import { Reference } from '@app/log/related-references.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import { Palette } from '@app/palette/palette.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { GlobalClipboard } from '@app/utils/clipboard';
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { SceneShift } from './move-scene.ts';
import { ObjectFolder } from './default-object-folder.ts';
import type { MenuItem } from '@ui-kit';
import type { YamiMouseEvent } from '@app/types/editor-event';

Scene.searcherInput = function (
	this: HTMLElement & { input?: HTMLInputElement | null },
	event: InputEvent
) {
	if (event.inputType !== 'insertCompositionText') {
		const text = this.input!.value;
		Scene.list.searchNodesDebounced(text);
	}
};

Scene.listKeydown = function (this: typeof Scene, event: KeyboardEvent) {
	if (!this.data) {
		return;
	}
	const item = read(this);
	const isFile = item && item.class !== 'folder';
	if (event.ctrlKey || event.metaKey) {
		switch (event.code) {
			case 'KeyX':
				if (isFile) {
					this.copy!(item);
					this.delete(item);
				}
				break;
			case 'KeyC':
				if (isFile) {
					this.copy!(item);
				}
				break;
			case 'KeyV':
				this.paste!('auto' as never);
				break;
			case 'KeyD':
				this.duplicate!(item);
				break;
		}
	} else {
		switch (event.code) {
			case 'Slash':
				this.toggle!(item);
				break;
			case 'Delete':
				this.delete(item);
				break;
			case 'Backspace':
				this.cancelSearch();
				break;
			case 'Escape':
				Scene.setTarget!(null);
				break;
		}
	}
};

Scene.listPointerdown = function (this: typeof Scene, event: PointerEvent) {
	switch (event.button) {
		case 3:
			this.cancelSearch();
			break;
	}
};

Scene.listSelect = function (this: typeof Scene, event: Event & { value: SceneItem }) {
	const item = event.value;
	switch (item.class) {
		case 'folder':
			Scene.setTarget!(null);
			break;
		case 'tilemap':
			if (Scene.tilemap) {
				if (Palette.state === 'closed') {
					Scene.setTarget!(item);
				}
				Scene.openTilemap!(item);
			} else {
				Scene.setTarget!(item);
			}
			break;
		default:
			Scene.setTarget!(item);
			break;
	}
};

Scene.listRecord = function (
	this: typeof Scene,
	event: Event & {
		value: {
			type: string;
			dItem: SceneItem;
			item: SceneItem;
			source: SceneItem;
			destination: SceneItem;
		};
	}
) {
	const list = Scene.list;
	const response = event.value;
	switch (response.type) {
		case 'rename':
			Scene.listRename!(response);
			break;
		case 'create': {
			let parent = response.dItem;
			if (parent.class !== 'folder') {
				parent = parent.parent ?? parent;
			}
			list.updateFolderState(parent, 'hidden');
			list.updateFolderState(parent, 'locked');
			Scene.history.save({
				type: 'scene-object-create',
				response: response,
				parent: parent
			});
			break;
		}
		case 'delete': {
			const parent = response.item.parent!;
			list.updateFolderState(parent, 'hidden');
			list.updateFolderState(parent, 'locked');
			Scene.history.save({
				type: 'scene-object-delete',
				response: response
			});
			break;
		}
		case 'remove': {
			const sParent = response.source.parent!;
			const dParent = response.destination.parent!;
			list.updateFolderState(sParent, 'hidden');
			list.updateFolderState(sParent, 'locked');
			if (sParent !== dParent) {
				list.updateFolderState(dParent, 'hidden');
				list.updateFolderState(dParent, 'locked');
			}
			Scene.history.save({
				type: 'scene-object-remove',
				response: response
			});
			break;
		}
	}
};

Scene.listPopup = function (
	this: typeof Scene,
	event: YamiMouseEvent & { value?: SceneItem | null }
) {
	const list = Scene.list;
	const item = event.value;
	const menuItems: MenuItem[] = [];
	const get = (key: string) => t('menuSceneList.' + key);
	let copyable;
	let pastable;
	let deletable;
	let renamable;
	if (item) {
		switch (item.class) {
			case 'folder':
				copyable = false;
				break;
			case 'tilemap':
				copyable = true;
				menuItems.push(
					{
						label: get('edit'),
						accelerator: 'Enter',
						click: () => {
							Scene.openTilemap!(item);
						}
					},
					{
						label: get('shift'),
						enabled: (item.tiles?.length ?? 0) !== 0,
						click: () => {
							SceneShift.open!((x: number, y: number) => {
								Scene.history.save({
									type: 'scene-tilemap-shift',
									tilemap: item,
									shiftX: x,
									shiftY: y
								});
								Scene.shiftTilemap!(item, x, y);
								Scene.planToSave!();
							});
						}
					},
					{
						label: get('reveal'),
						click: () => {
							Scene.revealTarget!();
						}
					},
					{
						label: get('shortcut'),
						submenu: list.createTilemapShortcutItems(item)
					}
				);
				break;
			case 'actor':
			case 'region':
			case 'light':
			case 'animation':
			case 'particle':
			case 'parallax':
				copyable = true;
				menuItems.push({
					label: get('reveal'),
					accelerator: 'Enter',
					click: () => {
						Scene.revealTarget!();
					}
				});
				break;
		}
		pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.scene.object');
		deletable = true;
		renamable = true;
	} else {
		copyable = false;
		pastable = (GlobalClipboard as GlobalClipboardHost).has('yami.scene.object');
		deletable = false;
		renamable = false;
	}
	menuItems.push(
		{
			label: get('create'),
			submenu: [
				{
					label: get('create.folder'),
					click: () => {
						list.addNodeTo(list.createFolder(), item);
					}
				},
				{
					label: get('create.actor'),
					click: () => {
						list.addNodeTo(Inspector.sceneActor.create(), item);
					}
				},
				{
					label: get('create.region'),
					click: () => {
						list.addNodeTo(Inspector.sceneRegion.create(), item);
					}
				},
				{
					label: get('create.light'),
					click: () => {
						list.addNodeTo(Inspector.sceneLight.create(), item);
					}
				},
				{
					label: get('create.animation'),
					click: () => {
						list.addNodeTo(Inspector.sceneAnimation.create(), item);
					}
				},
				{
					label: get('create.particle'),
					click: () => {
						list.addNodeTo(Inspector.sceneParticle.create(), item);
					}
				},
				{
					label: get('create.parallax'),
					click: () => {
						list.addNodeTo(Inspector.sceneParallax.create(), item);
					}
				},
				{
					label: get('create.tilemap'),
					click: () => {
						Inspector.fileTileset.close();
						list.addNodeTo(
							Inspector.sceneTilemap.create(Scene.width, Scene.height),
							item
						);
					}
				}
			]
		},
		{
			label: get('toggle'),
			accelerator: '/',
			enabled: copyable,
			click: () => {
				list.toggle!(item as never);
			}
		},
		{
			type: 'separator'
		},
		{
			label: get('cut'),
			accelerator: ctrl('X'),
			enabled: copyable,
			click: () => {
				list.copy!(item as never);
				list.delete!(item as never);
			}
		},
		{
			label: get('copy'),
			accelerator: ctrl('C'),
			enabled: copyable,
			click: () => {
				list.copy!(item as never);
			}
		},
		{
			label: get('paste'),
			accelerator: ctrl('V'),
			enabled: pastable,
			click: () => {
				(list.paste as (item: unknown) => unknown)(item);
			}
		},
		{
			label: get('duplicate'),
			accelerator: ctrl('D'),
			enabled: copyable,
			click: () => {
				list.duplicate(item);
			}
		},
		{
			label: get('delete'),
			accelerator: 'Delete',
			enabled: deletable,
			click: () => {
				list.delete!(item as never);
			}
		},
		{
			label: get('rename'),
			accelerator: 'F2',
			enabled: renamable,
			click: () => {
				list.rename(item);
			}
		},
		{
			label: get('copy-id'),
			enabled: !!item,
			click: () => {
				void navigator.clipboard.writeText(item!.presetId!);
			}
		}
	);
	if (copyable) {
		menuItems.push({
			label: get('find-references'),
			accelerator: 'Alt+LB',
			enabled: copyable,
			click: () => {
				Reference.openRelated!(item!.presetId!);
			}
		});
	}
	const file = Scene.getObjectFile!(item);
	if (file !== undefined) {
		menuItems.push({
			label: t('common.findInProject'),
			enabled: file instanceof FileItem,
			click: () => {
				Scene.openFileLocation!(item);
			}
		});
	}
	if (!item) {
		menuItems.push(
			{
				type: 'separator'
			},
			{
				label: get('shiftAll'),
				click: () => {
					SceneShift.open!((x: number, y: number) => {
						const changes = Scene.computeObjectShifting!(x, y);
						Scene.history.save({
							type: 'scene-shift',
							shiftX: x,
							shiftY: y,
							changes: changes
						});
						Scene.shiftTerrains!(x, y);
						Scene.shiftObjects!(changes);
						Scene.planToSave!();
					});
				}
			},
			{
				label: get('settings'),
				click: () => {
					ObjectFolder.open!();
				}
			}
		);
	}
	Menu.popup(
		{
			x: event.clientX,
			y: event.clientY
		},
		menuItems
	);
};

Scene.listOpen = function (this: typeof Scene, event: Event & { value: SceneItem }) {
	const item = event.value;
	switch (item.class) {
		case 'tilemap':
			Scene.openTilemap!(item);
			break;
		case 'actor':
		case 'region':
		case 'light':
		case 'animation':
		case 'particle':
		case 'parallax':
			Scene.revealTarget!();
			break;
	}
};

Scene.listRename = function (
	this: typeof Scene,
	response: { item: SceneItem; oldValue: unknown; newValue: unknown }
) {
	const target = response.item;
	switch (target.class) {
		case 'folder':
			Scene.history.save({
				type: 'scene-folder-rename',
				response: response
			});
			break;
		default: {
			const map = Scene.inspectorTypeMap;
			const key = map[target.class];
			const editor = Inspector[key];
			const input = editor.nameBox;
			const { oldValue, newValue } = response;
			write(input, newValue);
			Scene.updateTargetInfo!();
			Scene.requestRendering!();
			Scene.history.save({
				type: 'inspector-change',
				editor: editor,
				target: target,
				changes: [
					{
						input,
						oldValue,
						newValue
					}
				]
			});
			break;
		}
	}
};

Scene.listChange = function (this: typeof Scene, _event: Event) {
	Scene.planToSave!();
};

Scene.listPageResize = function (this: typeof Scene, _event: Event) {
	Scene.list.updateHead!();
	Scene.list.resize();
};
