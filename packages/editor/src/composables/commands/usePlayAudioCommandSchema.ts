import '@app/legacy/module/command/playAudio.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, read } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function usePlayAudioCommandSchema() {
	const { form, save, load } = useCommandSchema('playAudio', {
		onLoad() {
			getFocus($('#playAudio-type'));
		}
	});
	const onSave = (): void => {
		const type = read($('#playAudio-type')) ?? form.type;
		const audio = read($('#playAudio-audio')) ?? form.audio;
		const volume = read($('#playAudio-volume')) ?? form.volume;
		if (audio === '') {
			getFocus($('#playAudio-audio'));
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
				const location = read($('#playAudio-location')) ?? form.location;
				Command.save!({ type, audio, volume, location });
				break;
			}
		}
	};
	Command.cases.playAudio.customSave = onSave;
	return { form, save: onSave, load };
}
