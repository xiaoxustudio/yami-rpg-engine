import '@app/legacy/module/command/setCooldown.ts';
import { getFocus } from '@app/utils/element-utils';
import { Enum } from '@app/legacy/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetCooldownCommandSchema() {
	return useCommandSchema('setCooldown', {
		onLoad() {
			const el = document.getElementById('setCooldown-key')!;
			el.loadItems(Enum.getStringItems!('cooldown-key'));
			getFocus(document.getElementById('setCooldown-actor')!);
		}
	});
}
