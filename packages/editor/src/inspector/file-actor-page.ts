import { $, getElementReader, getElementWriter } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { Window } from '@app/tools/window-object.ts';
import { clear, getFocus, read, write } from '@app/utils/element-utils';
import { Animation } from '@app/animation/animation-window.ts';
import { Command } from '@app/commands/command-object.ts';
import { Data } from '@app/data/data-object.ts';
import { Enum } from '@app/enum/enum-window.ts';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { t } from '@app/i18n';

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
	interface FileActorShape {
		[k: string]: any;
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

			($('#fileActor-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
		}
	};

	FileActor.close = function (this: FileActorShape) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			clear($('#fileActor-sprites'));
			clear($('#fileActor-attributes'));
			clear($('#fileActor-skills'));
			clear($('#fileActor-equipments'));
			clear($('#fileActor-inventory'));
			clear($('#fileActor-events'));
			clear($('#fileActor-scripts'));
			clear($('#fileActor-parameter-pane'));
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
					getBrowserInstance()?.body?.updateIcon?.(this.meta.file);
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
		const elIdleMotion = $('#fileActor-idleMotion');
		const elMoveMotion = $('#fileActor-moveMotion');
		const items = Animation.getMotionListItems!(event.value);
		elIdleMotion.loadItems(items);
		elMoveMotion.loadItems(items);
		elIdleMotion.write2(read(elIdleMotion));
		elMoveMotion.write2(read(elMoveMotion));
	};

	FileActor.listChange = function (this: FileActorShape, event: Event) {
		File.planToSave!(FileActor.meta);
	};

	FileActor.sprites = {
		initialize: function (this, list: ListShape) {
			// 闂備焦褰冪粔宄懊归崶顒€鎹堕柣鎴炆戦悵顖炴偡濞嗘劕绗╅燑帮躬瀹曟繈濡歌閺?- 闂佽　鍋撻柣鐔告緲缂嶄礁霉濠婂喚鍎庢繛?
			list.on('change', (event: Event) => {
				const guid = FileActor.meta.guid;
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
			const animationId = FileActor.target.animationId;
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
			const animationId = FileActor.target.animationId;
			const items = Animation.getSpriteListItems!(animationId);
			$('#fileActor-sprite-id').loadItems(items);
			const write = getElementWriter('fileActor-sprite');
			write('id', id);
			write('image', image);
			if (!id) {
				getFocus($('#fileActor-sprite-id'));
			} else {
				getFocus($('#fileActor-sprite-image'));
			}
		},
		save: function () {
			const read = getElementReader('fileActor-sprite');
			const id = read('id');
			if (!id) {
				return getFocus($('#fileActor-sprite-id'));
			}
			const image = read('image');
			Window.close!('fileActor-sprite');
			return { id, image };
		}
	};

	FileActor.skills = {
		initialize: function (this, list: ListShape) {},
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
			const elSkillId = $('#fileActor-skill-id');
			const elSkillKey = $('#fileActor-skill-key');
			const items = Enum.getStringItems!('shortcut-key', true);
			elSkillKey.loadItems(items);
			write(elSkillId, id);
			write(elSkillKey, key);
			getFocus(elSkillId);
		},
		save: function () {
			const elSkillId = $('#fileActor-skill-id');
			const elSkillKey = $('#fileActor-skill-key');
			const id = read(elSkillId);
			if (!id) {
				return getFocus(elSkillId);
			}
			const key = read(elSkillKey);
			Window.close!('fileActor-skill');
			return { id, key };
		}
	};

	FileActor.equipments = {
		initialize: function (this, list: ListShape) {},
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
			const elEquipmentId = $('#fileActor-equipment-id');
			const elEquipmentKey = $('#fileActor-equipment-slot');
			const items = Enum.getStringItems!('equipment-slot');
			elEquipmentKey.loadItems(items);
			write(elEquipmentId, id);
			write(elEquipmentKey, slot);
			getFocus(elEquipmentId);
		},
		save: function () {
			const elEquipmentId = $('#fileActor-equipment-id');
			const elKey = $('#fileActor-equipment-slot');
			const id = read(elEquipmentId);
			if (!id) {
				return getFocus(elEquipmentId);
			}
			const slot = read(elKey);
			if (!slot) {
				return getFocus(elKey);
			}
			Window.close!('fileActor-equipment');
			return { id, slot };
		}
	};

	FileActor.inventory = {
		initialize: function (this, list: ListShape) {
			const invTypeEl = $('#fileActor-inventory-type');
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
						$('#fileActor-inventory-item-id'),
						$('#fileActor-inventory-item-quantity')
					]
				},
				{
					case: 'equipment',
					targets: [$('#fileActor-inventory-equipment-id')]
				},
				{
					case: 'money',
					targets: [$('#fileActor-inventory-money')]
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
			const write = getElementWriter('fileActor-inventory');
			const itemId = type === 'item' ? id : '';
			const equipmentId = type === 'equipment' ? id : '';
			write('type', type);
			write('item-id', itemId);
			write('item-quantity', quantity);
			write('equipment-id', equipmentId);
			write('money', money);
			getFocus($('#fileActor-inventory-type'));
		},
		save: function () {
			const read = getElementReader('fileActor-inventory');
			const type = read('type');
			let goods;
			switch (type) {
				case 'item':
					goods = {
						type: 'item',
						id: read('item-id'),
						quantity: read('item-quantity')
					};
					if (!goods.id) return getFocus($('#fileActor-inventory-item-id'));
					break;
				case 'equipment':
					goods = { type: 'equipment', id: read('equipment-id') };
					if (!goods.id) return getFocus($('#fileActor-inventory-equipment-id'));
					break;
				case 'money':
					goods = { type: 'money', money: read('money') };
					break;
			}
			Window.close!('fileActor-inventory-goods');
			return goods;
		}
	};

	Inspector.fileActor = FileActor;
}
