import { Window } from '@app/tools/window-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Codec } from '@app/engine/codec/codec.ts';
import { CommandList } from '@app/components/command-list.ts';
import { Data } from '@app/data/data-object.ts';
import { Project } from '@app/data/project-settings-window.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { Localization } from '@app/local/local-window.ts';
import { Editor } from '@app/services/project/editor.ts';
import { EditDataInstance } from './editdata.ts';
import { EventBus } from '@app/utils/event-bus.ts';
import { AutoTile } from '@app/palette/auto-tile.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { getUIStore } from '@app/stores/ui';
import { Variable } from '@app/variable/variable.ts';
import { GlobalClipboard } from '@app/utils/clipboard';
import { find_dItem } from './tree-utils.ts';

const Clipboard = GlobalClipboard;

const checkForProjectUpdatesOrigin = Editor.checkForProjectUpdates;
if (checkForProjectUpdatesOrigin) {
	Editor.checkForProjectUpdates = function (this: typeof Editor, verNum: unknown) {
		checkForProjectUpdatesOrigin.call(this, verNum);
		if (!Data.config.deadzone) {
			Data.config.deadzone = 0.4;
			Project.changed = true;
		}
	};
}

EventBus.once('editor_loaded', () => {
	CommandList.prototype.openEdit = function (this: HTMLElement) {
		Window.open!('edit-data');
		void EditDataInstance.open(this);
	};
});

EventBus.once('editor_loaded', () => {
	if (Scene.list)
		Scene.list.paste = function (
			this: HTMLElement & {
				data?: unknown;
				addNodeTo: (copy: unknown, dItem: unknown, insertBefore?: boolean) => void;
			},
			dItem: unknown,
			callback: ((copy: unknown) => void) | undefined
		) {
			const copy = Clipboard.read('yami.scene.object');
			if (copy && this.data) {
				switch (copy.class) {
					case 'tilemap':
						Codec.decodeTilemap!(copy);
						copy.shortcut = 0;
						break;
				}

				let insertBefore = false;
				if (dItem === 'auto') {
					find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
						dItem = a;
						insertBefore = b as boolean;
					});
				}
				callback?.(copy);
				this.addNodeTo(copy, dItem, insertBefore);
				Scene.requestRendering!();
			}
		};

	if (Enum.list)
		Enum.list.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.enumeration');
			if (copy) {
				if (Enum.idMap![copy.id]) {
					copy.id = Enum.createId!();
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Variable.list)
		Variable.list.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.variable');
			if (copy) {
				if (Variable.idMap[copy.id]) {
					copy.id = Variable.createId();
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Attribute.list)
		Attribute.list!.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.attribute');
			if (copy) {
				if (Attribute.idMap![copy.id]) {
					copy.id = Attribute.createId!();
					copy.name += ' - Copy';
				}

				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	if (Localization.list)
		Localization.list!.paste = function (
			this: HTMLElement & {
				addNodeTo: (copy: unknown, dItem?: unknown, insertBefore?: boolean) => void;
			}
		) {
			const copy = Clipboard.read('yami.data.localization');
			if (copy) {
				if (Localization.idMap![copy.id]) {
					copy.id = Localization.createId();
					copy.name += ' - Copy';
				}
				find_dItem.call(this, (a: unknown, b: boolean | undefined) => {
					this.addNodeTo(copy, a, b);
				});
			}
		};

	const uiList = getUIStore().elements.list;
	if (uiList)
		uiList.paste = function (
			this: HTMLElement & {
				data?: unknown;
				addNodeTo: (copy: unknown, dItem?: unknown) => void;
			},
			_: unknown,
			callback: ((copy: unknown) => void) | undefined
		) {
			const copy = Clipboard.read('yami.ui.object');
			if (copy && this.data) {
				callback?.(copy);
				this.addNodeTo(copy, getUIStore().target);
				getUIStore().requestRendering();
			}
		};
});

EventBus.once('editor_loaded', () => {
	if (!AutoTile.templateList) return;
	// oxlint-disable-next-line unbound-method
	const originAutoTileTemplateUpdate = AutoTile.templateList.update;
	AutoTile.templateList.update = function (this: HTMLElement) {
		const autoList = Object.keys(Data.tilesets)
			.map((v) => Data.tilesets[v])
			.filter((v) => v.type === 'auto');
		const countMap: Record<string, number> = {};
		for (let i = 0; i < autoList.length; i++) {
			const tiles = autoList[i].tiles;
			for (let j = 0; j < tiles.length; j++) {
				const tile = tiles[j];

				if (typeof tile !== 'object') continue;
				const template = tile.template;
				if (!countMap[template]) countMap[template] = 0;
				countMap[template]++;
				break;
			}
		}
		AutoTile.templateCounts = countMap;
		originAutoTileTemplateUpdate.call(this);
	};
});
