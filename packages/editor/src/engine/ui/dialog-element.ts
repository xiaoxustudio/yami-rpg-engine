import { UI } from '@app/legacy/ui/ui-window.ts';

UI.DialogBox = class DialogBoxElement extends UI.Text {
	constructor(data: Record<string, unknown>) {
		super({
			...data,
			direction: 'horizontal-tb',
			horizontalAlign: 'left',
			verticalAlign: 'top',
			overflow: 'wrap-truncate'
		});
	}
};
