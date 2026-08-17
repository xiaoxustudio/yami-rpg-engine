import '@app/legacy/module/command/setAngle.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAngleCommandSchema() {
	return useCommandSchema('setAngle', {
		onLoad() {
			getFocus($('#setAngle-actor'));
		}
	});
}
