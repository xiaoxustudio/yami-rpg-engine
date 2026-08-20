import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// 编辑器 legacy 模块顶层副作用依赖的通用 DOM 元素（jsdom 默认不存在）
for (const id of ['tooltip', 'window-ambient']) {
	if (!document.getElementById(id)) {
		const el = document.createElement('div');
		el.id = id;
		document.body.appendChild(el);
	}
}

// i18n（→ dom-localizer → element-utils）顶层副作用依赖 #tooltip，须在注入后导入
const { initYamiI18n } = await import('@app/i18n');

config.global.plugins = [initYamiI18n()];

// legacy inspector 页面由 composable/组件顶层侧效应 import 注册挂载点，
// 测试环境统一 mock 为空模块，避免 IIFE 覆盖各测试文件的 Inspector 挂载点 mock
vi.mock('@app/legacy/inspector/file-scene-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-ui-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-animation-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-particle-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-tileset-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-actor-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-entity-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-trigger-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-event-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-image-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-audio-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-video-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-font-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/file-script-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-actor-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-region-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-light-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-animation-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-particle-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-parallax-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/scene-tilemap-page.ts', () => ({}));
vi.mock('@app/inspector/element-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-image-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-text-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-textbox-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-dialog-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-progress-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-button-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-animation-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-video-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-window-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-container-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/element-reference-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-action-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-bone-layer-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-bone-frame-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-sprite-layer-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-sprite-frame-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-particle-layer-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-particle-frame-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-sound-layer-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/animation-sound-frame-page.ts', () => ({}));
vi.mock('@app/legacy/inspector/particle-layer-page.ts', () => ({}));

// WebGL mock（jsdom 无 canvas 实现——GL 初始化需要 getContext/getExtension）
const mockContext = new Proxy(
	{
		getExtension: () => null,
		getParameter: () => null,
		getContextAttributes: () => null,
		getShaderPrecisionFormat: () => ({ rangeMin: 0, rangeMax: 0, precision: 0 }),
		measureText: () => ({ width: 0 }),
		createLinearGradient: () => ({ addColorStop: () => undefined })
	},
	{
		get(target, prop) {
			if (prop in target) {
				return target[prop as keyof typeof target];
			}
			return () => undefined;
		},
		set(target, prop, value) {
			target[prop as keyof typeof target] = value;
			return true;
		}
	}
);
HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement): typeof mockContext {
	return mockContext;
} as any;

// legacy 原型扩展（RadioBox 等包装层依赖——regexp.ts 未随测试加载）
(RegExp as any).number = /^-?\d+(?:\.\d+)?$/;
