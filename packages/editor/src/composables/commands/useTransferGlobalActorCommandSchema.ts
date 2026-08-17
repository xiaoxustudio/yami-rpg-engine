import '@app/legacy/module/command/transferGlobalActor.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTransferGlobalActorCommandSchema() {
	return useCommandSchema('transferGlobalActor', {
		onLoad() {
			getFocus($('#transferGlobalActor-actor'), 'all');
		}
	});
}
