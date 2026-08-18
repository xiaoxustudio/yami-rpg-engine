import '@app/legacy/module/command/stopAudio.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useStopAudioCommandSchema() {
	return useCommandSchema('stopAudio', {
		onLoad() {
			getFocus(document.getElementById('stopAudio-type')!);
		}
	});
}
