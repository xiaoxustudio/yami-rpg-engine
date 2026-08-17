import '@app/legacy/module/command/fixAngle.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useFixAngleCommandSchema() {
	return useCommandSchema('fixAngle', {
		onLoad() {
			getFocus($('#fixAngle-actor'));
		}
	});
}
