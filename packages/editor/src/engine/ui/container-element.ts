import { uiElClasses } from './element-classes.ts';

uiElClasses.Container = class ContainerElement extends uiElClasses.Element! {
	draw() {
		this.drawChildren();
	}

	resize() {
		if (this.parent instanceof uiElClasses.Window!) {
			return this.parent.requestResizing();
		}
		this.calculatePosition();
		this.resizeChildren();
	}

	destroy() {
		super.destroy();
		this.destroyChildren();
	}
};
