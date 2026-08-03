import { css } from '@/util/element-utils.ts';

Object.defineProperty(HTMLElement.prototype, 'name', {
	get: function (this: HTMLElement): string | null {
		return this.getAttribute('name');
	},
	set: function (this: HTMLElement, value: string): void {
		this.setAttribute('name', value);
	}
});

Object.defineProperty(HTMLElement.prototype, 'innerHeight', {
	get: function (this: HTMLElement): number {
		let padding = this._paddingTop;
		if (padding === undefined) {
			const style = css(this);
			const pt = parseInt(style.paddingTop);
			const pb = parseInt(style.paddingBottom);
			padding = this._paddingTop = pt + pb;
		}
		const outerHeight = this.clientHeight;
		const innerHeight = outerHeight - padding;
		return Math.max(innerHeight, 0);
	}
});
