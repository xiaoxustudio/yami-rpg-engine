import '@app/legacy/module/command/fixAngle.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useFixAngleCommandSchema() {
	return useCommandSchema('fixAngle', {
		onLoad() {
			getFocus(document.getElementById('fixAngle-actor')!);
		}
	});
}
