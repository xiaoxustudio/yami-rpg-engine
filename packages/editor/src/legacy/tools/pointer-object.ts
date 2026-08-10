// 使用 #cursor-region 来改变指针样式 可以避免更新所有子元素继承到指针属性, 从而提高性能 同时解决了一些元素无法继承指针样式的问题

import { $ } from '@/util/dom.ts';
import { addClass, removeClass } from '@/util/element-utils';
export const Cursor: {
	readonly region: HTMLElement;
	open: (this: typeof Cursor, className: string) => void;
	close: (this: typeof Cursor, className: string) => void;
} = {
	get region() {
		return $('#cursor-region');
	},
	open: null as unknown as (this: typeof Cursor, className: string) => void,
	close: null as unknown as (this: typeof Cursor, className: string) => void
};

Cursor.open = function (className: string) {
	addClass(this.region, className);
};

Cursor.close = function (className: string) {
	removeClass(this.region, className);
};
