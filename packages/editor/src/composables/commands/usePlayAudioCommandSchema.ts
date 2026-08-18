import '@app/legacy/module/command/playAudio.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayAudioCommandSchema() {
	const { form, save, load } = useCommandSchema('playAudio', {
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
				Command.save!({ type, audio, volume });
				break;
			case 'se-attenuated': {
				const location =
					read(document.getElementById('playAudio-location')) ?? form.location;
				Command.save!({ type, audio, volume, location });
				break;
			}
		}
	};
	Command.cases.playAudio.customSave = onSave;
	return { form, save: onSave, load };
}
