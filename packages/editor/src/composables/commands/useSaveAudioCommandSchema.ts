import '@app/legacy/module/command/saveAudio.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSaveAudioCommandSchema() {
	return useCommandSchema('saveAudio', {
		onLoad() {
			getFocus(document.getElementById('saveAudio-type')!);
		}
	});
}
