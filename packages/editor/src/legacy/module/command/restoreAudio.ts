import { Command } from '@app/legacy/command/command-object.ts';
import { Token } from '@app/legacy/command/mark-string-manager.ts';
import { CommandSchema } from './schema.ts';
import { t } from '@app/i18n';

Command.cases.restoreAudio = new CommandSchema({
	name: 'restoreAudio',
	fields: [{ key: 'type', default: 'bgm' }],
	customParse({ type }: { type: unknown }) {
		return [
			{ color: 'audio' },
			{ text: t('command.restoreAudio') + Token(': ') },
			{ text: Command.parseAudioType!(type) }
		];
	}
});
