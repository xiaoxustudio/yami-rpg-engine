import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { t } from '@app/i18n';

Command.cases.stopAudio = new CommandSchema({
	name: 'stopAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		const words = Command.words.push(Command.parseAudioType!(type));
		return [
			{ color: 'audio' },
			{ text: t('command.stopAudio') + Token(': ') },
			{ text: words.join() }
		];
	}
});
