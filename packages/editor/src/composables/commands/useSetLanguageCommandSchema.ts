import '@app/legacy/module/command/setLanguage.ts';
import { getFocus, write } from '@app/utils/element-utils';
import { Command } from '@app/legacy/command/command-object.ts';
import { useCommandSchema } from '@app/composables/useCommandSchema';

export function useSetLanguageCommandSchema() {
	return useCommandSchema('setLanguage', {
		onLoad(params) {
			const el = document.getElementById('setLanguage-language')!;
			el.loadItems(Command.cases.setLanguage.createLanguageItems!());
			write(el, params.language ?? 'auto');
			getFocus(el);
		}
	});
}
