// 使用 #cursor-region 来改变指针样式 可以避免更新所有子元素继承到指针属性, 从而提高性能 同时解决了一些元素无法继承指针样式的问题

import { $ } from '@/util/dom.ts';
import { addClass, removeClass } from '@/util/element-utils';
export const Cursor = {
	get region() {
		return $('#cursor-region');
	},
	open: null as any,
	close: null as any
};

Cursor.open = function (className: string) {
	addClass(this.region, className);
};

Cursor.close = function (className: string) {
	removeClass(this.region, className);
};
