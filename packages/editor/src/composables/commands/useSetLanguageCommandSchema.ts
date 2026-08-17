import '@app/legacy/module/command/setLanguage.ts';
import { $ } from '@app/legacy/util/dom.ts';
import { getFocus, write } from '@app/legacy/util/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetLanguageCommandSchema() {
	return useCommandSchema('setLanguage', {
		onLoad(params) {
			const el = $('#setLanguage-language');
			el.loadItems(Command.cases.setLanguage.createLanguageItems!());
			write(el, params.language ?? 'auto');
			getFocus(el);
		}
	});
}
