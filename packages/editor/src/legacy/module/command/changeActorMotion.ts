import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.changeActorMotion = new CommandSchema({
	name: 'changeActorMotion',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'type', default: 'move' },
		{ key: 'motion', default: '', required: true }
	],
	parseMapping(type: string, motion: unknown) {
		const motionType = t('command.changeActorMotion.type.' + type);
		const motionName = Command.parseEnumString!(motion);
		return motionType + Token(' -> ') + motionName;
	},
	customParse({ actor, type, motion }: { actor: unknown; type: string; motion: unknown }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(this.parseMapping!(type, motion));
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorMotion') + Token(': ') },
			{ text: words.join() }
		];
	}
});
