import { Command } from '@app/commands/command-object.ts';
import { composableEls } from '@app/composables/element-registry';
import { commit } from '@app/composables/useCommandSchema';
import { Enum } from '@app/enum/enum-window.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { reactive } from 'vue';

Command.cases.changeActorEquipment = new CommandSchema({
	name: 'changeActorEquipment',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'slot', default: () => Enum.getDefStringId!('equipment-slot') },
		{ key: 'equipmentId', default: '' },
		{ key: 'equipment', default: { type: 'trigger' } }
	],
	customParse({
		actor,
		operation,
		slot,
		equipmentId,
		equipment
	}: {
		actor: unknown;
		operation: string;
		slot: unknown;
		equipmentId: unknown;
		equipment: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.changeActorEquipment.' + operation));
		switch (operation) {
			case 'add': {
				const equipSlot = Command.parseVariableEnum!('equipment-slot', slot);
				const equipName = Command.parseFileName!(equipmentId);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove':
				words.push(Command.parseFileName!(equipmentId));
				break;
			case 'add-instance': {
				const equipSlot = Command.parseVariableEnum!('equipment-slot', slot);
				const equipName = Command.parseEquipment!(equipment);
				words.push(equipSlot + Token(' = ') + equipName);
				break;
			}
			case 'remove-instance':
				words.push(Command.parseEquipment!(equipment));
				break;
			case 'remove-slot':
				words.push(Command.parseVariableEnum!('equipment-slot', slot));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorEquipment') + Token(': ') },
			{ text: words.join() }
		];
	}
});

const form = reactive<Record<string, unknown>>({});

const createDefault = (): Record<string, unknown> => {
	const data: Record<string, unknown> = {};
	for (const field of Command.cases.changeActorEquipment.fields) {
		const value = typeof field.default === 'function' ? field.default() : field.default;
		if (value !== undefined) {
			data[field.key] = value;
		}
	}
	return data;
};

const load = (params: Record<string, unknown> = {}): void => {
	composableEls.get('changeActorEquipment-slot')
		?.loadItems?.(Enum.getStringItems!('equipment-slot'));
	Object.assign(form, createDefault(), params);
	requestFocus('changeActorEquipment-actor');
};

const save = (): void => {
	const actor = form.actor;
	const operation = form.operation;
	switch (operation) {
		case 'add': {
			const slot = form.slot;
			if (slot === '') {
				requestFocus('changeActorEquipment-slot');
				return;
			}
			const equipmentId = form.equipmentId;
			if (equipmentId === '') {
				requestFocus('changeActorEquipment-equipmentId');
				return;
			}
			commit({ actor, operation, slot, equipmentId });
			break;
		}
		case 'remove': {
			const equipmentId = form.equipmentId;
			if (equipmentId === '') {
				requestFocus('changeActorEquipment-equipmentId');
				return;
			}
			commit({ actor, operation, equipmentId });
			break;
		}
		case 'add-instance': {
			const slot = form.slot;
			if (slot === '') {
				requestFocus('changeActorEquipment-slot');
				return;
			}
			commit({ actor, operation, slot, equipment: form.equipment });
			break;
		}
		case 'remove-instance':
			commit({ actor, operation, equipment: form.equipment });
			break;
		case 'remove-slot': {
			const slot = form.slot;
			if (slot === '') {
				requestFocus('changeActorEquipment-slot');
				return;
			}
			commit({ actor, operation, slot });
			break;
		}
	}
};

const schema = Command.cases.changeActorEquipment;
schema.customLoad = load;
schema.customSave = save;
schema.onInitialize = (): void => {};

export function useChangeActorEquipmentCommandSchema() {
	return { form, load, save };
}
