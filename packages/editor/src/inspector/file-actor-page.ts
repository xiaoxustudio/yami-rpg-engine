import { reactive } from 'vue';
import { inspectorEls } from './element-registry.ts';
import { getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@app/tools/window-object.ts';
import { clear, on, read } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { requestFocus } from '@app/directives/focus';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { getYamiI18n } from '@app/i18n';
import type { YamiElement } from '@app/types/element-api';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

{
	type ActorShape = {
		portrait: string;
		clip: number[];
		animationId: string;
		idleMotion: string;
		moveMotion: string;
		rotatable: boolean;
		passage: string;
		speed: number;
		shape: string;
		size: number;
		weight: number;
		immovable: boolean;
		scale: number;
		priority: number;
		inherit: string;
		[k: string]: unknown;
	};
	type ListShape = {
		save(): unknown;
		on(event: string, listener: (event: Event) => void): void;
	};
	interface ActorListDescriptor {
		initialize(list: ListShape): void;
		parse(item: never): unknown;
		open(item?: unknown): void;
		save(): unknown;
	}
	interface FileActorShape {
		target: ActorShape | null;
		meta: { guid: string; file?: unknown } | null;
		sprites: ActorListDescriptor | null;
		skills: ActorListDescriptor | null;
		equipments: ActorListDescriptor | null;
		inventory: (ActorListDescriptor & { loadTypeItems(): void }) | null;
		initialize: (() => void) | null;
		create: (() => ActorShape) | null;
		open: ((actor: ActorShape, meta: { guid: string }) => void) | null;
		close: (() => void) | null;
		update: ((actor: ActorShape, key: string, value: unknown) => void) | null;
		animationIdWrite: ((event: Event & { value?: string }) => void) | null;
		paramInput: unknown;
		listChange: ((event: Event) => void) | null;
	}
	const FileActor: FileActorShape = {
		target: null,
		meta: null,
		sprites: null,
		skills: null,
		equipments: null,
		inventory: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		animationIdWrite: null,
		paramInput: null,
		listChange: null
	};

	FileActor.initialize = function () {};

	FileActor.create = function (this: FileActorShape) {
		return {
			portrait: '',
			clip: [0, 0, 64, 64],
			animationId: '',
			idleMotion: '',
			moveMotion: '',
			rotatable: false,
			passage: 'land',
			speed: 4,
			shape: 'circle',
			size: 0.8,
			weight: 1,
			immovable: true,
			scale: 1,
			priority: 0,
			inherit: '',
			sprites: [],
			attributes: [],
			skills: [],
			equipments: [],
			inventory: [],
			events: [],
			scripts: []
		};
	};

	FileActor.open = function (this: FileActorShape, actor: ActorShape, meta: { guid: string }) {
		if (this.meta !== meta) {
			this.target = actor;
			this.meta = meta;

			const write = getElementWriter('fileActor', actor);
			write('sprites');
			write('attributes');
			write('skills');
			write('equipments');
			write('inventory');
			write('events');
			write('scripts');

			(
				inspectorEls.get('fileActor-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	FileActor.close = function (this: FileActorShape) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear(inspectorEls.get('fileActor-sprites'));
			clear(inspectorEls.get('fileActor-attributes'));
			clear(inspectorEls.get('fileActor-skills'));
			clear(inspectorEls.get('fileActor-equipments'));
			clear(inspectorEls.get('fileActor-inventory'));
			clear(inspectorEls.get('fileActor-events'));
			clear(inspectorEls.get('fileActor-scripts'));
			clear(inspectorEls.get('fileActor-parameter-pane'));
		}
	};

	FileActor.update = function (
		this: FileActorShape,
		actor: ActorShape,
		key: string,
		value: unknown
	) {
		File.planToSave!(this.meta);
		switch (key) {
			case 'portrait':
			case 'clip':
				if (actor[key] !== value) {
					(actor as Record<string, unknown>)[key] = value;
					getBrowserInstance()?.body?.updateIcon?.(this.meta!.file);
				}
				break;
			case 'animationId':
				if (actor.animationId !== value) {
					const id = actor.animationId;
					actor.animationId = value as string;
					if (Scene.actors instanceof Array) {
						const animation = Data.animations[id];
						for (const actor of Scene.actors) {
							if (actor.player?.data === animation) {
								Scene.destroyObjectContext!(actor);
								Scene.loadActorContext!(actor);
							}
						}
						Scene.requestRendering!();
					}
				}
				break;
			case 'idleMotion':
				if (actor[key] !== value) {
					(actor as Record<string, unknown>)[key] = value;
					if (Scene.actors instanceof Array) {
						const id = actor.animationId;
						const animation = Data.animations[id];
						for (const { player } of Scene.actors) {
							if (player?.data === animation) {
								player.reset();
								player.setMotion(value);
							}
						}
						Scene.requestRendering!();
					}
				}
				break;
			case 'rotatable':
				if (actor.rotatable !== value) {
					actor.rotatable = value as boolean;
					if (Scene.actors instanceof Array) {
						for (const node of Scene.actors) {
							if (node.data === actor) {
								const { player } = node;
								player.rotatable = value;
								player.rotation = 0;
								player.setAngle(player.angle);
							}
						}
						Scene.requestRendering!();
					}
				}
				break;
			case 'passage':
			case 'moveMotion':
			case 'speed':
			case 'shape':
			case 'size':
			case 'weight':
			case 'immovable':
			case 'inherit':
				if (actor[key] !== value) {
					(actor as Record<string, unknown>)[key] = value;
				}
				break;
			case 'scale':
				if (actor.scale !== value) {
					actor.scale = value as number;
					if (Scene.actors instanceof Array) {
						for (const node of Scene.actors) {
							if (node.data === actor) {
								node.player.setScale((value as number) * node.scale);
							}
						}
						Scene.requestRendering!();
					}
				}
				break;
			case 'priority':
				if (actor.priority !== value) {
					actor.priority = value as number;
					if (Scene.actors instanceof Array) {
						Scene.requestRendering!();
					}
				}
				break;
		}
	};

	FileActor.animationIdWrite = function (
		this: FileActorShape,
		event: Event & { value?: string }
	) {
		if (!event.value) return;
		const elIdleMotion = inspectorEls.get('fileActor-idleMotion') as YamiElement;
		const elMoveMotion = inspectorEls.get('fileActor-moveMotion') as YamiElement;
		const items = Animation.getMotionListItems!(event.value);
		elIdleMotion.loadItems(items);
		elMoveMotion.loadItems(items);
		elIdleMotion.write2(read(elIdleMotion));
		elMoveMotion.write2(read(elMoveMotion));
	};

	FileActor.listChange = function (this: FileActorShape, _event: Event) {
		File.planToSave!(FileActor.meta);
	};

	FileActor.sprites = {
		initialize: function (this, list: ListShape) {
			on(list, 'change', (_event: Event) => {
				const guid = FileActor.meta!.guid;
				if (Scene.actors instanceof Array) {
					for (const actor of Scene.actors) {
						if (actor.actorId === guid) {
							Scene.destroyObjectContext!(actor);
							Scene.loadActorContext!(actor);
						}
					}
				}
			});
		},
		parse: function ({ id, image }: { id: string; image: string }) {
			Command.invalid = false;
			const animationId = FileActor.target!.animationId;
			const spriteName = Command.parseSpriteName!(animationId, id);
			const spriteClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const fileName = Command.parseFileName!(image);
			const fileClass = Command.invalid ? 'invalid' : '';
			return [
				{ content: spriteName, class: spriteClass },
				{ content: Command.removeTextTags!(fileName), class: fileClass }
			];
		},
		open: function ({ id = '', image = '' } = {}) {
			Window.open!('fileActor-sprite');
			const animationId = FileActor.target!.animationId;
			const items = Animation.getSpriteListItems!(animationId);
			inspectorEls.get('fileActor-sprite-id')?.loadItems?.(items);
			Object.assign(fileActorSpriteForm, { id, image });
			if (!id) {
				requestFocus('fileActor-sprite-id');
			} else {
				requestFocus('fileActor-sprite-image');
			}
		},
		save: function () {
			const id = fileActorSpriteForm.id;
			if (!id) {
				return requestFocus('fileActor-sprite-id');
			}
			const image = fileActorSpriteForm.image;
			Window.close!('fileActor-sprite');
			return { id, image };
		}
	};

	FileActor.skills = {
		initialize: function (this, _list: ListShape) {},
		parse: function ({ id, key }: { id: string; key: string }) {
			Command.invalid = false;
			const skillName = Command.parseFileName!(id);
			const skillClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const shortcutKey = key ? Command.parseGroupEnumString!('shortcut-key', key) : '';
			const shortcutClass = Command.invalid ? 'invalid' : 'weak';
			return [
				{
					content: Command.removeTextTags!(skillName),
					class: skillClass
				},
				{
					content: Command.removeTextTags!(shortcutKey),
					class: shortcutClass
				}
			];
		},
		open: function ({ id = '', key = '' } = {}) {
			Window.open!('fileActor-skill');
			const elSkillKey = inspectorEls.get('fileActor-skill-key') as YamiElement;
			const items = Enum.getStringItems!('shortcut-key', true);
			elSkillKey.loadItems(items);
			Object.assign(fileActorSkillForm, { id, key });
			requestFocus('fileActor-skill-id');
		},
		save: function () {
			const id = fileActorSkillForm.id;
			if (!id) {
				return requestFocus('fileActor-skill-id');
			}
			const key = fileActorSkillForm.key;
			Window.close!('fileActor-skill');
			return { id, key };
		}
	};

	FileActor.equipments = {
		initialize: function (this, _list: ListShape) {},
		parse: function ({ id, slot }: { id: string; slot: string }) {
			Command.invalid = false;
			const equipmentName = Command.parseFileName!(id);
			const equipmentClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const shortcutKey = slot ? Command.parseGroupEnumString!('equipment-slot', slot) : '';
			const shortcutClass = Command.invalid ? 'invalid' : 'weak';
			return [
				{
					content: Command.removeTextTags!(equipmentName),
					class: equipmentClass
				},
				{
					content: Command.removeTextTags!(shortcutKey),
					class: shortcutClass
				}
			];
		},
		open: function ({ id = '', slot = Enum.getDefStringId!('equipment-slot') } = {}) {
			Window.open!('fileActor-equipment');
			const elEquipmentKey = inspectorEls.get('fileActor-equipment-slot') as YamiElement;
			const items = Enum.getStringItems!('equipment-slot');
			elEquipmentKey.loadItems(items);
			Object.assign(fileActorEquipmentForm, { id, slot });
			requestFocus('fileActor-equipment-id');
		},
		save: function () {
			const id = fileActorEquipmentForm.id;
			if (!id) {
				return requestFocus('fileActor-equipment-id');
			}
			const slot = fileActorEquipmentForm.slot;
			if (!slot) {
				return requestFocus('fileActor-equipment-slot');
			}
			Window.close!('fileActor-equipment');
			return { id, slot };
		}
	};

	FileActor.inventory = {
		initialize: function (this, _list: ListShape) {
			FileActor.inventory!.loadTypeItems();
		},
		loadTypeItems: function () {
			const invTypeEl = inspectorEls.get('fileActor-inventory-type') as YamiElement;
			if (!invTypeEl) return;
			invTypeEl.loadItems([
				{ name: 'Item', value: 'item' },
				{ name: 'Equipment', value: 'equipment' },
				{ name: 'Money', value: 'money' }
			]);

			invTypeEl.enableHiddenMode().relate([
				{
					case: 'item',
					targets: [
						inspectorEls.get('fileActor-inventory-item-id'),
						inspectorEls.get('fileActor-inventory-item-quantity')
					]
				},
				{
					case: 'equipment',
					targets: [inspectorEls.get('fileActor-inventory-equipment-id')]
				},
				{
					case: 'money',
					targets: [inspectorEls.get('fileActor-inventory-money')]
				}
			]);
		},
		parse: function ({
			type,
			id,
			quantity,
			money
		}: {
			type: string;
			id: string;
			quantity: number;
			money: number;
		}) {
			switch (type) {
				case 'item': {
					Command.invalid = false;
					const goodsName = Command.parseFileName!(id);
					const goodsClass = Command.invalid ? 'invalid' : '';
					return [
						{
							content: Command.removeTextTags!(goodsName),
							class: goodsClass
						},
						{ content: quantity.toString(), class: 'weak' }
					];
				}
				case 'equipment': {
					Command.invalid = false;
					const goodsName = Command.parseFileName!(id);
					const goodsClass = Command.invalid ? 'invalid' : '';
					return [
						{
							content: Command.removeTextTags!(goodsName),
							class: goodsClass
						},
						{ content: '1', class: 'weak' }
					];
				}
				case 'money':
					return [
						{ content: t('common.money') },
						{ content: money.toString(), class: 'weak' }
					];
			}
		},
		open: function ({ type = 'item', id = '', quantity = 1, money = 1 } = {}) {
			Window.open!('fileActor-inventory-goods');
			FileActor.inventory!.loadTypeItems();
			const itemId = type === 'item' ? id : '';
			const equipmentId = type === 'equipment' ? id : '';
			Object.assign(fileActorInventoryForm, {
				type,
				itemId,
				itemQuantity: quantity,
				equipmentId,
				money
			});
			requestFocus('fileActor-inventory-type');
		},
		save: function () {
			const type = fileActorInventoryForm.type;
			let goods;
			switch (type) {
				case 'item':
					goods = {
						type: 'item',
						id: fileActorInventoryForm.itemId,
						quantity: fileActorInventoryForm.itemQuantity
					};
					if (!goods.id) return requestFocus('fileActor-inventory-item-id');
					break;
				case 'equipment':
					goods = { type: 'equipment', id: fileActorInventoryForm.equipmentId };
					if (!goods.id) return requestFocus('fileActor-inventory-equipment-id');
					break;
				case 'money':
					goods = { type: 'money', money: fileActorInventoryForm.money };
					break;
			}
			Window.close!('fileActor-inventory-goods');
			return goods;
		}
	};

	Inspector.fileActor = FileActor;
}

export interface FileActorSpriteForm {
	id: string;
	image: string;
}
export const fileActorSpriteForm = reactive<FileActorSpriteForm>({ id: '', image: '' });

export interface FileActorSkillForm {
	id: string;
	key: string;
}
export const fileActorSkillForm = reactive<FileActorSkillForm>({ id: '', key: '' });

export interface FileActorEquipmentForm {
	id: string;
	slot: string;
}
export const fileActorEquipmentForm = reactive<FileActorEquipmentForm>({ id: '', slot: '' });

export interface FileActorInventoryForm {
	type: string;
	itemId: string;
	itemQuantity: number;
	equipmentId: string;
	money: number;
}
export const fileActorInventoryForm = reactive<FileActorInventoryForm>({
	type: 'item',
	itemId: '',
	itemQuantity: 1,
	equipmentId: '',
	money: 1
});
