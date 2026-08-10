import { clear, write } from '@/util/element-utils.ts';
import { Window } from '@/tools/window-object.ts';
import { Reference } from '@/log/related-references.ts';
import { Local } from '@/tools/localization.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import type { IArrayHistory } from '@/types/history.ts';
import { Variable } from './variable.ts';

Variable.windowClose = function (this: typeof Variable, event: Event) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = Local.createGetter!('confirmation');
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
	this.target = null;
	this.data = null;
	this.idMap = null as unknown as Record<string, unknown>;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null as unknown as IArrayHistory & Array<{ type: unknown; item: unknown }>;
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown!);
	window.removeEventListener('keydown', Reference.getKeydownListener!(this.list));
}.bind(Variable);
