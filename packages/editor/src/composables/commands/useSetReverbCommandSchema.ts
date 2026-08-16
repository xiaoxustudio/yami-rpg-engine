import '@/module/command/setReverb.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetReverbCommandSchema() {
	return useCommandSchema('setReverb', {
		onLoad() {
			getFocus($('#setReverb-type'));
		}
	});
}
