import { $ } from '@/util/dom.ts';
import { clear, getFocus, on } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.changeActorTeam = new CommandSchema({
	name: 'changeActorTeam',
	fields: [
		{ key: 'actor', default: { type: 'trigger' } },
		{ key: 'teamId', default: () => Data.teams.list[0].id }
	],
	onInitialize() {
		on($('#changeActorTeam-confirm'), 'click', () => this.save!());
		on($('#changeActorTeam'), 'open', function (event: Event) {
			$('#changeActorTeam-teamId')?.loadItems?.(Data.createTeamItems!());
		});
		on($('#changeActorTeam'), 'closed', function (event: Event) {
			clear($('#changeActorTeam-teamId'));
		});
	},
	customParse({ actor, teamId }: { actor: unknown; teamId: unknown }) {
		const words = Command.words
			.push(Command.parseActor!(actor))
			.push(Command.parseTeam!(teamId));
		return [
			{ color: 'actor' },
			{ text: Local.get!('command.changeActorTeam') + Token(': ') },
			{ text: words.join() }
		];
	},
	onLoad() {
		getFocus($('#changeActorTeam-actor'));
	}
});
