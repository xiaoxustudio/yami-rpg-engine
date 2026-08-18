import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.playAudio = new CommandSchema({
	name: 'playAudio',
	fields: [
		{ key: 'type', default: 'se-attenuated' },
		{ key: 'audio', default: '' },
		{ key: 'volume', default: 1 },
		{ key: 'location', default: { type: 'actor', actor: { type: 'trigger' } } }
	],
	customParse({
		type,
		audio,
		volume,
		location
	}: {
		type: string;
		audio: unknown;
		volume: unknown;
		location: unknown;
	}) {
		const words = Command.words
			.push(Command.parseAudioType!(type))
			.push(Command.parseFileName!(audio))
			.push(Command.setNumberColor!(volume));
		switch (type) {
			case 'se-attenuated':
				words.push(Command.parsePosition!(location));
				break;
		}
		return [
			{ color: 'audio' },
			{ text: t('command.playAudio') + Token(': ') },
			{ text: words.join() }
		];
	}
});
