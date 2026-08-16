import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.setTeamRelation = new CommandSchema({
	name: 'setTeamRelation',
	fields: [
		{ key: 'teamId1', default: () => Data.teams.list[0].id },
		{ key: 'teamId2', default: () => Data.teams.list[0].id },
		{ key: 'relation', default: 0 }
	],
	parseRelation(relation: number) {
		return Local.get!('command.setTeamRelation.relation.' + relation);
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
			{ text: Local.get!('command.setTeamRelation') + Token(': ') },
			{ text: words.join() }
		];
	}
});
