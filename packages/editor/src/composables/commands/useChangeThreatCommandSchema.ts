import '@/module/command/changeThreat.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeThreatCommandSchema() {
	return useCommandSchema('changeThreat', {
		onLoad() {
			getFocus($('#changeThreat-actor'));
		}
	});
}
