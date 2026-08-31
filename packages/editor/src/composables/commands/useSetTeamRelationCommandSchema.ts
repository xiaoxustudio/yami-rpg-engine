/* oxlint-disable eslint/no-restricted-properties */
import { Command } from '@app/commands/command-object.ts';
import { Token } from '@app/commands/token.ts';
import { Data } from '@app/data/data-object.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string, named?: Record<string, unknown>) =>
	getYamiI18n().global.t(key, named ?? {});
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

Command.cases.setTeamRelation = new CommandSchema({
	name: 'setTeamRelation',
	fields: [
		{ key: 'teamId1', default: () => Data.teams.list[0].id },
		{ key: 'teamId2', default: () => Data.teams.list[0].id },
		{ key: 'relation', default: 0 }
	],
	parseRelation(relation: number) {
		return t('command.setTeamRelation.relation.' + relation);
	},
	customParse({
		teamId1,
		teamId2,
		relation
	}: {
		teamId1: unknown;
		teamId2: unknown;
		relation: number;
	}) {
		const words = Command.words
			.push(Command.parseTeam!(teamId1))
			.push(Command.parseTeam!(teamId2))
			.push(this.parseRelation!(relation));
		return [
			{ color: 'system' },
			{ text: t('command.setTeamRelation') + Token(': ') },
			{ text: words.join() }
		];
	}
});

export function useSetTeamRelationCommandSchema() {
	return useCommandSchema('setTeamRelation', {
		onLoad() {
			getFocus(document.getElementById('setTeamRelation-teamId1'));
		}
	});
}
