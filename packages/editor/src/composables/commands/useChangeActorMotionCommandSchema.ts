import '@/module/command/changeActorMotion.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorMotionCommandSchema() {
	return useCommandSchema('changeActorMotion', {
		onLoad() {
			getFocus($('#changeActorMotion-actor'));
		}
	});
}
