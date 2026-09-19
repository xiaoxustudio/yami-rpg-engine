import { uiElClasses } from './element-classes.ts';

uiElClasses.DialogBox = class DialogBoxElement extends uiElClasses.Text! {
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
