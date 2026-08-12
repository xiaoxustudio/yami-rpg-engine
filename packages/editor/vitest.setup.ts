// 编辑器 legacy 模块顶层副作用依赖的通用 DOM 元素（jsdom 默认不存在）
for (const id of ['tooltip', 'window-ambient']) {
	if (!document.getElementById(id)) {
		const el = document.createElement('div');
		el.id = id;
		document.body.appendChild(el);
	}
}

// WebGL mock（jsdom 无 canvas 实现——GL 初始化需要 getContext/getExtension）
const mockContext = {
	getExtension: () => null,
	getParameter: () => null,
	getContextAttributes: () => null,
	getShaderPrecisionFormat: () => ({ rangeMin: 0, rangeMax: 0, precision: 0 })
};
HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement): typeof mockContext {
	return mockContext;
} as any;

// legacy 原型扩展（RadioBox 等包装层依赖——regexp.ts 未随测试加载）
(RegExp as any).number = /^-?\d+(?:\.\d+)?$/;
