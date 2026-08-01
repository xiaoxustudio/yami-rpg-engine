import { $, getElementReader, getElementWriter } from '@/util/dom.ts';
import { clear, getFocus } from '@/util/element-utils.ts';
import { Command } from '@/command/command-object.ts';
import { Token } from '@/command/mark-string-manager.ts';
import { Data } from '@/data/data-object.ts';
import { CommandSchema } from './schema.ts';
import { Local } from '@/tools/localization.ts';

Command.cases.createActor = new CommandSchema({
	name: 'createActor',
	onInitialize() {
		$('#createActor-confirm').on('click', () => this.save());
		$('#createActor').on('open', function (event: any) {
			$('#createActor-teamId').loadItems(Data.createTeamItems());
		});
		$('#createActor').on('closed', function (event: any) {
			clear($('#createActor-teamId'));
		});
	},
	customParse({ actorId, teamId, position, angle }: any) {
		const words = Command.words
			.push(Command.parseFileName(actorId))
			.push(Command.parseTeam(teamId))
			.push(Command.parsePosition(position))
			.push(Command.parseVariableNumber(angle, '°'));
		return [
			{ color: 'actor' },
			{ text: Local.get('command.createActor') + Token(': ') },
			{ text: words.join() }
		];
	},
	customLoad({
		actorId = '',
		teamId = Data.teams.list[0].id,
		position = { type: 'absolute', x: 0, y: 0 },
		angle = 0
	}) {
		const write = getElementWriter('createActor');
		write('actorId', actorId);
		write('teamId', teamId);
		write('position', position);
		write('angle', angle);
		getFocus($('#createActor-actorId'), 'all');
	},
	customSave() {
		const read = getElementReader('createActor');
		const actorId = read('actorId');
		if (actorId === '') {
			return getFocus($('#createActor-actorId'));
		}
		Command.save({
			actorId,
			teamId: read('teamId'),
			position: read('position'),
			angle: read('angle')
		});
	}
});
