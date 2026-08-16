import '@/module/command/transferGlobalActor.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useTransferGlobalActorCommandSchema() {
	return useCommandSchema('transferGlobalActor', {
		onLoad() {
			getFocus($('#transferGlobalActor-actor'), 'all');
		}
	});
}
