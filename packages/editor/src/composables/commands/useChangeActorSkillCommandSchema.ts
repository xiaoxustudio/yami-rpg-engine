/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';
import { requestFocus } from '@app/directives/focus';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});

Command.cases.changeActorSkill = new CommandSchema({
	name: 'changeActorSkill',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'operation', default: 'add' },
		{ key: 'skillId', default: '' },
		{ key: 'skill', default: { type: 'trigger' } }
	],
	parseOperation(operation: string) {
		return t('command.changeActorSkill.' + operation);
	},
	customParse({
		actor,
		operation,
		skill,
		skillId
	}: {
		actor: unknown;
		operation: string;
		skill: unknown;
		skillId: unknown;
	}) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(this.parseOperation!(operation));
		switch (operation) {
			case 'add':
			case 'remove':
				words.push(Command.parseVariableFile!(skillId));
				break;
			case 'remove-instance':
				words.push(Command.parseSkill!(skill));
				break;
		}
		return [
			{ color: 'actor' },
			{ text: t('command.changeActorSkill') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useChangeActorSkillCommandSchema() {
	const { form, load, commit } = useCommandSchema('changeActorSkill', {
		skipWrite: true,
		onLoad() {
			requestFocus('changeActorSkill-actor');
		}
	});
	const onSave = (): void => {
		const actor = form.actor;
		const operation = form.operation as string;
		switch (operation) {
			case 'add':
			case 'remove': {
				const skillId = form.skillId as string;
				if (skillId === '') {
					requestFocus('changeActorSkill-skillId');
					return;
				}
				commit({ actor, operation, skillId });
				break;
			}
			case 'remove-instance':
				commit({
					actor,
					operation,
					skill: form.skill
				});
				break;
			case 'sort-by-order':
				commit({ actor, operation });
				break;
		}
	};
	Command.cases.changeActorSkill.customSave = onSave;
	return { form, save: onSave, load };
}
