function getWindow() {
	return (window as any).Window;
}
import { clear, write } from '@/util/element-utils.ts';
import { Reference } from '@/log/related-references.ts';
import { Local } from '@/tools/localization.ts';
import { UndoManager } from '@/tools/undo-manager.ts';
import { Variable } from './variable.ts';

Variable.windowClose = function (this: any, event: any) {
	this.list.saveScroll();
	if (this.changed) {
		event.preventDefault();
		const get = (Local.createGetter as any)('confirmation');
		getWindow().confirm(
			{
				message: get('closeUnsavedVariables')
			},
			[
				{
					label: get('yes'),
					click: () => {
						this.changed = false;
						getWindow().close('variable');
					}
				},
				{
					label: get('no')
				}
			]
		);
	}
}.bind(Variable);

Variable.windowClosed = function (this: any, event: any) {
	this.target = null;
	this.data = null;
	this.idMap = null;
	UndoManager.setActive(this._previousActive);
	this._previousActive = null;
	this.history = null;
	write(this.searcher, '');
	clear(this.list);
	this.closePropertyPanel();
	window.removeEventListener('keydown', this.keydown);
	window.removeEventListener('keydown', (Reference.getKeydownListener as any)(this.list));
}.bind(Variable);
