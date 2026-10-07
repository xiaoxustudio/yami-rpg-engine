import { getListConfig, elementDataOf } from '@ui-kit';
import { dispatchChangeEvent, rect } from '@app/utils/element-utils.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { headNavOf, lastNavItemOf } from '@app/engine/layout/layout.ts';
import { Editor } from '@app/services/project/editor.ts';
import { Scene } from './scene-window.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import type { GlobalClipboardHost } from '@app/utils/clipboard';
import { GlobalClipboard } from '@app/utils/clipboard';
import type { MenuItem } from '@ui-kit';
import { clone as deepClone } from '@app/utils/object';

export type SceneItem = {
	class: string;
	element: HTMLElement;
	name?: string;
	shortcut?: number;
	parent?: SceneItem | null;
	children?: SceneItem[];
	tiles?: Uint32Array;
	presetId?: string;
};

Scene.list.copy = function (this: typeof Scene, item: SceneItem) {
	if (item) {
		switch (item.class) {
			case 'tilemap':
				Codec.encodeTilemap!(item);
				break;
		}
		(GlobalClipboard as GlobalClipboardHost).write('yami.scene.object', item);
	}
};

Scene.list.paste = function (
	this: typeof Scene,
	dItem: SceneItem | 'auto' | null,
	callback: ((item: SceneItem) => void) | undefined
) {
	const copy = (GlobalClipboard as GlobalClipboardHost).read('yami.scene.object');
	if (copy && this.data) {
		switch (copy.class) {
			case 'tilemap':
				Codec.decodeTilemap!(copy);
				copy.shortcut = 0;
				break;
		}
		if (dItem === 'auto') {
			const folders = (Editor.project!.scene as { defaultFolders: Record<string, unknown> })
				.defaultFolders;
			const name = folders[copy.class];
			dItem = !name
				? null
				: this.getItemByProperties!({
						class: 'folder',
						name: name
					});
		}
		callback?.(copy);
		this.addNodeTo!(copy, dItem);
		Scene.requestRendering!();
	}
};

Scene.list.duplicate = function (this: typeof Scene, item: SceneItem) {
	let copy;
	switch (item.class) {
		case 'tilemap':
			Codec.encodeTilemap!(item);
			copy = deepClone(item);
			Codec.decodeTilemap!(copy);
			copy.shortcut = 0;
			break;
		default:
			copy = deepClone(item);
			break;
	}
	copy.name = this.generateUniqueName!(item);
	const index = item.parent!.children!.indexOf(item);
	const next = item.parent!.children![index + 1];
	if (next) {
		this.addNodeTo!(copy, next, true);
	} else {
		this.addNodeTo!(copy, item.parent!);
	}
};

Scene.list.delete = function (this: typeof Scene, item: SceneItem) {
	if (item) {
		this.deleteNode!(item);
	}
};

Scene.list.toggle = function (this: typeof Scene, item: SceneItem) {
	if (item && 'enabled' in item) {
		Scene.history.save({
			type: 'scene-object-toggle',
			item: item,
			oldValue: item.enabled,
			newValue: !item.enabled
		});
		item.enabled = !item.enabled;
		this.update();
		dispatchChangeEvent(this);
		Scene.requestRendering!();
	}
};

Scene.list.cancelSearch = function (this: typeof Scene) {
	if (this.display === 'search') {
		const active = document.activeElement;
		Scene.searcher.deleteInputContent!();
		this.expandToSelection!();
		this.scrollToSelection!();
		(active as HTMLElement | null)?.focus();
	}
};

Scene.list.createFolder = function (this: typeof Scene) {
	return {
		class: 'folder',
		name: 'New Folder',
		expanded: false,
		hidden: true,
		locked: true,
		children: []
	};
};

Scene.list.createTilemapShortcutItems = function (this: typeof Scene, tilemap: SceneItem) {
	const { shortcuts } = Scene.tilemaps;
	const { shortcut } = tilemap;
	const menuItems: MenuItem[] = [];
	for (let i = 0; i < 7; i++) {
		const target = shortcuts[i];
		const checked = shortcut === i;
		const click = () => {
			if (shortcut !== i) {
				tilemap.shortcut = i;
				shortcuts.update();
				Scene.planToSave!();
				Scene.history.save({
					type: 'scene-tilemap-shortcut',
					tilemap: tilemap,
					shortcut: shortcut
				});
			}
		};
		if (i === 0) {
			menuItems.push({
				label: t('menuSceneList.shortcut.none'),
				checked: checked,
				click: click
			});
		} else {
			menuItems.push({
				label: `${i}: ${target?.name ?? ''}`,
				enabled: !target || checked,
				checked: checked,
				click: click
			});
		}
	}
	return menuItems;
};

Scene.list.restoreRecursiveStates = (function IIFE() {
	const restore = (node: SceneItem, key: string, states: SceneItem[], index: number) => {
		if (Reflect.get(node, key) !== undefined) {
			Reflect.set(node, key, states[index++]);
		}
		const children = node.children;
		if (children !== undefined) {
			const length = children.length;
			for (let i = 0; i < length; i++) {
				index = restore(children[i], key, states, index);
			}
		}
		return index;
	};
	return function (this: typeof Scene, item: SceneItem, key: string, states: SceneItem[]) {
		return restore(item, key, states, 0);
	};
})();

Scene.list.setRecursiveStates = (function IIFE() {
	const set = (node: SceneItem, key: string, state: boolean, backups: unknown[]) => {
		if (Reflect.get(node, key) !== undefined) {
			backups.push(Reflect.get(node, key));
			Reflect.set(node, key, state);
		}
		const children = node.children;
		if (children !== undefined) {
			const length = children.length;
			for (let i = 0; i < length; i++) {
				set(children[i], key, state, backups);
			}
		}
		return backups;
	};
	return function (this: typeof Scene, item: SceneItem, key: string, state: boolean) {
		return set(item, key, state, []);
	};
})();

Scene.list.updateFolderState = (function IIFE() {
	let key: string;
	const list = Scene.list;
	const check = (item: SceneItem) => {
		if (item.class === 'folder') {
			update(item);
		}
	};
	const toggle = (folder: SceneItem) => {
		Reflect.set(folder, key, !Reflect.get(folder, key));
		list.update();
		check(folder.parent!);
	};
	const update = (folder: SceneItem) => {
		const items = folder.children ?? [];
		const state = Reflect.get(folder, key);
		if (state) {
			for (const item of items) {
				if (Reflect.get(item, key) === false) {
					toggle(folder);
					return;
				}
			}
		} else {
			for (const item of items) {
				if (Reflect.get(item, key) === false) {
					return;
				}
			}
			toggle(folder);
		}
	};
	return function (this: typeof Scene, item: SceneItem, iKey: string) {
		key = iKey;
		return check(item);
	};
})();

Scene.list.canSwitchState = (function IIFE() {
	const check = (item: SceneItem) => {
		if (item.class === 'folder') {
			for (const child of item.children ?? []) {
				if (check(child)) return true;
			}
			return false;
		}
		return true;
	};
	return function (this: typeof Scene, item: SceneItem) {
		return check(item);
	};
})();

Scene.list.updateHead = function (this: typeof Scene) {
	const { page, head } = elementDataOf<{ page: HTMLElement; head: HTMLElement }>(this);
	if (page.clientWidth !== 0) {
		const nav = headNavOf(head);
		const item = lastNavItemOf(nav);
		if (!nav || !item) return;
		const nRect = rect(nav);
		const iRect = rect(item);
		const left = iRect.right - nRect.left;
		head.style.left = `${left}px`;
	}
};

getListConfig(Scene.list).onCreate = function (this: typeof Scene, item: SceneItem) {
	if (item.class === 'folder') return;
	Scene.registerPreset!(item);
	Scene.loadObjects!();
	Scene.loadObjectContext!(item);
	Scene.requestRendering!();
} as (item: unknown) => void;

getListConfig(Scene.list).onRemove = function (this: typeof Scene) {
	Scene.loadObjects!();
	Scene.requestRendering!();
};

getListConfig(Scene.list).onDelete = function (this: typeof Scene, item: SceneItem) {
	Scene.unregisterPreset!(item);
	Scene.updateTarget!();
	Scene.loadObjects!();
	Scene.destroyObjectContext!(item);
	Scene.requestRendering!();
} as (item: unknown) => void;

getListConfig(Scene.list).onResume = function (this: typeof Scene, item: SceneItem) {
	Scene.registerPreset!(item);
	Scene.loadObjects!();
	Scene.reloadObjectContext!(item);
	Scene.requestRendering!();
} as (item: unknown) => void;
