import { clear, write } from '@app/utils/element-utils.ts';
import { Window } from '@app/tools/window-object.ts';
import { Reference } from '@app/log/related-references.ts';
import { createGetter } from '@app/i18n';
import { getVariableStore } from '@app/stores/variable';
import { Variable } from '@app/variable/variable.ts';

Variable.windowClose = function (this: typeof Variable, event: Event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = createGetter('confirmation');
		Window.confirm!(
			{
				message: get('closeUnsavedVariables')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						Window.close!('variable');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Variable);

Variable.windowClosed = function (this: typeof Variable, event: Event) {
	getVariableStore().close();
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown!);
	window.removeEventListener('keydown', Reference.getKeydownListener!(this.list));
}.bind(Variable);
