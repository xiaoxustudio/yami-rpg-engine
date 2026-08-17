import '@app/legacy/module/command/setReverb.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetReverbCommandSchema() {
	return useCommandSchema('setReverb', {
		onLoad() {
			getFocus($('#setReverb-type'));
		}
	});
}
