import '@app/legacy/module/command/changeActorMotion.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useChangeActorMotionCommandSchema() {
	return useCommandSchema('changeActorMotion', {
		onLoad() {
			getFocus(document.getElementById('changeActorMotion-actor')!);
		}
	});
}
