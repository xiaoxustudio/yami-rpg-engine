import '@app/legacy/module/command/changeThreat.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeThreatCommandSchema() {
	return useCommandSchema('changeThreat', {
		onLoad() {
			getFocus($('#changeThreat-actor'));
		}
	});
}
