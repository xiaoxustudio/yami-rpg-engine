import '@app/legacy/module/command/setReverb.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetReverbCommandSchema() {
	return useCommandSchema('setReverb', {
		onLoad() {
			getFocus(document.getElementById('setReverb-type'));
		}
	});
}
