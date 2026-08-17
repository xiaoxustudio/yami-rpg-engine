import '@app/legacy/module/command/restoreAudio.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRestoreAudioCommandSchema() {
	return useCommandSchema('restoreAudio', {
		onLoad() {
			getFocus($('#restoreAudio-type'));
		}
	});
}
