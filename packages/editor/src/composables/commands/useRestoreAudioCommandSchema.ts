import '@/module/command/restoreAudio.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useRestoreAudioCommandSchema() {
	return useCommandSchema('restoreAudio', {
		onLoad() {
			getFocus($('#restoreAudio-type'));
		}
	});
}
