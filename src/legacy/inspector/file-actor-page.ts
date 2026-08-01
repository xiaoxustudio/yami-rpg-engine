import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus, read, write } from '@/util/element-utils';
import { Animation } from '@/animation/animation-window.ts';
import { Command } from '@/command/command-object.ts';
import { Data } from '@/data/data-object.ts';
import { Enum } from '@/enum/enum-window.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { Scene } from '@/scene/scene-window.ts';
import { EventListInterface } from '@/tools/event-list.ts';
import { Local } from '@/tools/localization.ts';
import { AttributeListInterface } from '@/tools/property-list.ts';
import { ScriptListInterface } from '@/tools/script-list.ts';
function getWindow() {
	return (window as any).Window;
}

{
	const FileActor = {
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

	FileActor.initialize = function () {
		if (!$('#fileActor-rotatable')) return;
		$('#fileActor-rotatable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);

		$('#fileActor-passage').loadItems([
			{ name: 'Land', value: 'land' },
			{ name: 'Water', value: 'water' },
			{ name: 'Unrestricted', value: 'unrestricted' }
		]);

		$('#fileActor-shape').loadItems([
			{ name: 'Square', value: 'square' },
			{ name: 'Circle', value: 'circle' }
		]);

		$('#fileActor-immovable').loadItems([
			{ name: 'Yes', value: true },
			{ name: 'No', value: false }
		]);

		$('#fileActor-attributes').bind(new AttributeListInterface());

		$('#fileActor-sprites').bind(this.sprites);

		$('#fileActor-skills').bind(this.skills);

		$('#fileActor-equipments').bind(this.equipments);

		$('#fileActor-inventory').bind(this.inventory);

		$('#fileActor-events').bind(new EventListInterface(this));

		$('#fileActor-scripts').bind(new ScriptListInterface());

		$('#fileActor-parameter-pane').bind($('#fileActor-scripts'));

		$('#fileActor-animationId').on('write', this.animationIdWrite);
		$(`#fileActor-portrait, #fileActor-clip, #fileActor-animationId, #fileActor-idleMotion,
    #fileActor-moveMotion, #fileActor-rotatable, #fileActor-passage, #fileActor-speed,
    #fileActor-shape, #fileActor-size, #fileActor-weight, #fileActor-immovable, #fileActor-scale,
    #fileActor-priority, #fileActor-inherit`).on('input', this.paramInput);
		$(`#fileActor-sprites, #fileActor-attributes, #fileActor-skills, #fileActor-equipments,
    #fileActor-inventory, #fileActor-events, #fileActor-scripts
  `).on('change', this.listChange);
	};

	FileActor.create = function () {
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

	FileActor.open = function (actor, meta) {
		if (this.meta !== meta) {
			this.target = actor;
			this.meta = meta;

			const write = getElementWriter('fileActor', actor);
			write('portrait');
			write('clip');
			write('animationId');
			write('idleMotion');
			write('moveMotion');
			write('sprites');
			write('rotatable');
			write('passage');
			write('speed');
			write('shape');
			write('size');
			write('weight');
			write('immovable');
			write('scale');
			write('priority');
			write('inherit');
			write('attributes');
			write('skills');
			write('equipments');
			write('inventory');
			write('events');
			write('scripts');
		}
	};

	FileActor.close = function () {
		if (this.target) {
			(window as any).Browser?.unselect?.(this.meta);
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

	FileActor.update = function (actor, key, value) {
		File.planToSave(this.meta);
		switch (key) {
			case 'portrait':
			case 'clip':
				if (actor[key] !== value) {
					actor[key] = value;
					(window as any).Browser?.body?.updateIcon?.(this.meta.file);
				}
				break;
			case 'animationId':
				if (actor.animationId !== value) {
					const id = actor.animationId;
					actor.animationId = value;
					if (Scene.actors instanceof Array) {
						const animation = Data.animations[id];
						for (const actor of Scene.actors) {
							if (actor.player?.data === animation) {
								Scene.destroyObjectContext(actor);
								Scene.loadActorContext(actor);
							}
						}
						Scene.requestRendering();
					}
				}
				break;
			case 'idleMotion':
				if (actor[key] !== value) {
					actor[key] = value;
					if (Scene.actors instanceof Array) {
						const id = actor.animationId;
						const animation = Data.animations[id];
						for (const { player } of Scene.actors) {
							if (player?.data === animation) {
								player.reset();
								player.setMotion(value);
							}
						}
						Scene.requestRendering();
					}
				}
				break;
			case 'rotatable':
				if (actor.rotatable !== value) {
					actor.rotatable = value;
					if (Scene.actors instanceof Array) {
						for (const node of Scene.actors) {
							if (node.data === actor) {
								const { player } = node;
								player.rotatable = value;
								player.rotation = 0;
								player.setAngle(player.angle);
							}
						}
						Scene.requestRendering();
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
					actor[key] = value;
				}
				break;
			case 'scale':
				if (actor.scale !== value) {
					actor.scale = value;
					if (Scene.actors instanceof Array) {
						for (const node of Scene.actors) {
							if (node.data === actor) {
								node.player.setScale(value * node.scale);
							}
						}
						Scene.requestRendering();
					}
				}
				break;
			case 'priority':
				if (actor.priority !== value) {
					actor.priority = value;
					if (Scene.actors instanceof Array) {
						Scene.requestRendering();
					}
				}
				break;
		}
	};

	FileActor.animationIdWrite = function (event) {
		const elIdleMotion = $('#fileActor-idleMotion');
		const elMoveMotion = $('#fileActor-moveMotion');
		const items = Animation.getMotionListItems(event.value);
		elIdleMotion.loadItems(items);
		elMoveMotion.loadItems(items);
		elIdleMotion.write2(read(elIdleMotion));
		elMoveMotion.write2(read(elMoveMotion));
	};

	FileActor.paramInput = function (event) {
		FileActor.update(FileActor.target, Inspector.getKey(this), read(this));
	};

	FileActor.listChange = function (event) {
		File.planToSave(FileActor.meta);
	};

	FileActor.sprites = {
		initialize: function (list) {
			$('#fileActor-sprite-confirm')?.on('click', () => list.save());

			// 重载场景角色动画 - 改变事件
			list.on('change', (event) => {
				const guid = FileActor.meta.guid;
				if (Scene.actors instanceof Array) {
					for (const actor of Scene.actors) {
						if (actor.actorId === guid) {
							Scene.destroyObjectContext(actor);
							Scene.loadActorContext(actor);
						}
					}
				}
			});
		},
		parse: function ({ id, image }) {
			Command.invalid = false;
			const animationId = FileActor.target.animationId;
			const spriteName = Command.parseSpriteName(animationId, id);
			const spriteClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const fileName = Command.parseFileName(image);
			const fileClass = Command.invalid ? 'invalid' : '';
			return [
				{ content: spriteName, class: spriteClass },
				{ content: Command.removeTextTags(fileName), class: fileClass }
			];
		},
		open: function ({ id = '', image = '' } = {}) {
			getWindow().open('fileActor-sprite');
			const animationId = FileActor.target.animationId;
			const items = Animation.getSpriteListItems(animationId);
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
			getWindow().close('fileActor-sprite');
			return { id, image };
		}
	};

	FileActor.skills = {
		initialize: function (list) {
			$('#fileActor-skill-confirm')?.on('click', () => list.save());
		},
		parse: function ({ id, key }) {
			Command.invalid = false;
			const skillName = Command.parseFileName(id);
			const skillClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const shortcutKey = key ? Command.parseGroupEnumString('shortcut-key', key) : '';
			const shortcutClass = Command.invalid ? 'invalid' : 'weak';
			return [
				{
					content: Command.removeTextTags(skillName),
					class: skillClass
				},
				{
					content: Command.removeTextTags(shortcutKey),
					class: shortcutClass
				}
			];
		},
		open: function ({ id = '', key = '' } = {}) {
			getWindow().open('fileActor-skill');
			const elSkillId = $('#fileActor-skill-id');
			const elSkillKey = $('#fileActor-skill-key');
			const items = Enum.getStringItems('shortcut-key', true);
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
			getWindow().close('fileActor-skill');
			return { id, key };
		}
	};

	FileActor.equipments = {
		initialize: function (list) {
			$('#fileActor-equipment-confirm')?.on('click', () => list.save());
		},
		parse: function ({ id, slot }) {
			Command.invalid = false;
			const equipmentName = Command.parseFileName(id);
			const equipmentClass = Command.invalid ? 'invalid' : '';
			Command.invalid = false;
			const shortcutKey = slot ? Command.parseGroupEnumString('equipment-slot', slot) : '';
			const shortcutClass = Command.invalid ? 'invalid' : 'weak';
			return [
				{
					content: Command.removeTextTags(equipmentName),
					class: equipmentClass
				},
				{
					content: Command.removeTextTags(shortcutKey),
					class: shortcutClass
				}
			];
		},
		open: function ({ id = '', slot = Enum.getDefStringId('equipment-slot') } = {}) {
			getWindow().open('fileActor-equipment');
			const elEquipmentId = $('#fileActor-equipment-id');
			const elEquipmentKey = $('#fileActor-equipment-slot');
			const items = Enum.getStringItems('equipment-slot');
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
			getWindow().close('fileActor-equipment');
			return { id, slot };
		}
	};

	FileActor.inventory = {
		initialize: function (list) {
			$('#fileActor-inventory-confirm')?.on('click', () => list.save());

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
		parse: function ({ type, id, quantity, money }) {
			switch (type) {
				case 'item': {
					Command.invalid = false;
					const goodsName = Command.parseFileName(id);
					const goodsClass = Command.invalid ? 'invalid' : '';
					return [
						{
							content: Command.removeTextTags(goodsName),
							class: goodsClass
						},
						{ content: quantity.toString(), class: 'weak' }
					];
				}
				case 'equipment': {
					Command.invalid = false;
					const goodsName = Command.parseFileName(id);
					const goodsClass = Command.invalid ? 'invalid' : '';
					return [
						{
							content: Command.removeTextTags(goodsName),
							class: goodsClass
						},
						{ content: '1', class: 'weak' }
					];
				}
				case 'money':
					return [
						{ content: Local.get('common.money') },
						{ content: money.toString(), class: 'weak' }
					];
			}
		},
		open: function ({ type = 'item', id = '', quantity = 1, money = 1 } = {}) {
			getWindow().open('fileActor-inventory-goods');
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
			getWindow().close('fileActor-inventory-goods');
			return goods;
		}
	};

	Inspector.fileActor = FileActor;
}
