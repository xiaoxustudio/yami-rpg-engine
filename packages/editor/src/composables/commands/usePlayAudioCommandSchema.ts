/* oxlint-disable eslint/no-restricted-properties */
import { getFocus, read } from '@app/utils/element-utils';
import { Command } from '@app/commands/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';
import { Token } from '@app/commands/token.ts';
import { CommandSchema } from '@app/commands/schema.ts';
import { getYamiI18n } from '@app/i18n';

const t = (key: string) => getYamiI18n().global.t(key);

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

export function usePlayAudioCommandSchema() {
	const { form, load, commit } = useCommandSchema('playAudio', {
		onLoad() {
			getFocus(document.getElementById('playAudio-type'));
		}
	});
	const onSave = (): void => {
		const type = read(document.getElementById('playAudio-type')) ?? form.type;
		const audio = read(document.getElementById('playAudio-audio')) ?? form.audio;
		const volume = read(document.getElementById('playAudio-volume')) ?? form.volume;
		if (audio === '') {
			getFocus(document.getElementById('playAudio-audio'));
			return;
		}
		switch (type) {
			case 'bgm':
			case 'bgs':
			case 'cv':
			case 'se':
				commit({ type, audio, volume });
				break;
			case 'se-attenuated': {
				const location =
					read(document.getElementById('playAudio-location')) ?? form.location;
				commit({ type, audio, volume, location });
				break;
			}
		}
	};
	Command.cases.playAudio.customSave = onSave;
	return { form, save: onSave, load };
}
