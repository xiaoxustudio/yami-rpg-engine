import '@/module/command/setAngle.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAngleCommandSchema() {
	return useCommandSchema('setAngle', {
		onLoad() {
			getFocus($('#setAngle-actor'));
		}
	});
}
