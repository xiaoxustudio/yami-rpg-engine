import '@/module/command/changeActorAnimation.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorAnimationCommandSchema() {
	return useCommandSchema('changeActorAnimation', {
		onLoad() {
			getFocus($('#changeActorAnimation-actor'));
		}
	});
}
