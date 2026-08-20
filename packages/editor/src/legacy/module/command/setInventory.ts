import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.setInventory = new CommandSchema({
	name: 'setInventory',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'increase-money' },
		{ key: 'money', default: 1 },
		{ key: 'itemId', default: '' },
		{ key: 'quantity', default: 1 },
		{ key: 'equipmentId', default: '' },
		{ key: 'equipment', default: { type: 'trigger' } },
		{ key: 'order1', default: 0 },
		{ key: 'order2', default: 1 },
		{ key: 'refActor', default: { type: 'player' } }
	],
	customParse({
		actor,
		operation,
		money,
		itemId,
		quantity,
		equipmentId,
		equipment,
		order1,
		order2,
		refActor
	}: {
		actor: unknown;
		operation: string;
		money: unknown;
		itemId: unknown;
		quantity: unknown;
		equipmentId: unknown;
		equipment: unknown;
		order1: unknown;
		order2: unknown;
		refActor: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(t('command.setInventory.' + operation));
		switch (operation) {
			case 'increase-money':
			case 'decrease-money':
				words.push(Command.parseVariableNumber!(money));
				break;
			case 'increase-items':
			case 'decrease-items':
				words.push(Command.parseVariableFile!(itemId));
				words.push(Command.parseVariableNumber!(quantity));
				break;
			case 'gain-equipment':
			case 'lose-equipment':
				words.push(Command.parseVariableFile!(equipmentId));
				break;
			case 'gain-equipment-instance':
			case 'lose-equipment-instance':
				words.push(Command.parseEquipment!(equipment));
				break;
			case 'swap': {
				const a = Command.parseVariableNumber!(order1);
				const b = Command.parseVariableNumber!(order2);
				words.push(a + Token(' <-> ') + b);
				break;
			}
			case 'reference':
				words.push(Command.parseActor!(refActor));
				break;
		}
		return [
			{ color: 'inventory' },
			{ text: t('command.setInventory') + Token(': ') },
			{ text: words.join() }
		];
	}
});
