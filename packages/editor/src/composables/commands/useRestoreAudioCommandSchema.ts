import '@app/legacy/module/command/restoreAudio.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRestoreAudioCommandSchema() {
	return useCommandSchema('restoreAudio', {
		onLoad() {
			getFocus(document.getElementById('restoreAudio-type')!);
		}
	});
}
