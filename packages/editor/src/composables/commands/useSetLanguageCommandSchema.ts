import '@/module/command/setLanguage.ts';
import { $ } from '@/util/dom.ts';
import { getFocus, write } from '@/util/element-utils';
import { Command } from '@/command/command-object.ts';
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
