import '@/module/command/fixAngle.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useFixAngleCommandSchema() {
	return useCommandSchema('fixAngle', {
		onLoad() {
			getFocus($('#fixAngle-actor'));
		}
	});
}
