import '@app/legacy/module/command/setAngle.ts';
import { getFocus } from '@app/utils/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetAngleCommandSchema() {
	return useCommandSchema('setAngle', {
		onLoad() {
			getFocus(document.getElementById('setAngle-actor')!);
		}
	});
}
