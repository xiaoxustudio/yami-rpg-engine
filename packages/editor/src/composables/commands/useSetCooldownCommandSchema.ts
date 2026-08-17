import '@app/legacy/module/command/setCooldown.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus } from '@app/legacy/util/element-utils';
import { Enum } from '@app/legacy/enum/enum-window.ts';
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
