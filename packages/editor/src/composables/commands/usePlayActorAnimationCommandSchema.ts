import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.playActorAnimation = new CommandSchema({
	name: 'playActorAnimation',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'motion', default: '', required: true },
		{ key: 'speed', default: 1 },
		{ key: 'wait', default: false }
	],
	parseSpeed(speed: number) {
		if (speed === 1) return '';
		return Command.parseVariableNumber!(speed);
	},
	customParse({
		actor,
		motion,
		speed,
		wait
	}: {
		actor: unknown;
		motion: unknown;
		speed: number;
		wait: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseEnumString!(motion))
			.push(this.parseSpeed!(speed))
			.push(Command.parseWait!(wait));
		return [
			{ color: 'actor' },
			{ text: t('command.playActorAnimation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function usePlayActorAnimationCommandSchema() {
	return useCommandSchema('playActorAnimation', {
		skipWrite: true,
		onLoad() {
			requestFocus('playActorAnimation-actor');
		}
	});
}
