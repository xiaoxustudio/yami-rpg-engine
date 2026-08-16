import '@/module/command/setCooldown.ts';
import { $ } from '@/util/dom.ts';
import { getFocus } from '@/util/element-utils';
import { Enum } from '@/enum/enum-window.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetCooldownCommandSchema() {
	return useCommandSchema('setCooldown', {
		onLoad() {
			const el = $('#setCooldown-key');
			el.loadItems(Enum.getStringItems!('cooldown-key'));
			getFocus($('#setCooldown-actor'));
		}
	});
}
