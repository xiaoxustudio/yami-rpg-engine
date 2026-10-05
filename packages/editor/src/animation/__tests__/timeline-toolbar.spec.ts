import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Animation } from '@app/animation/animation-window.ts';
import '@app/animation/register.ts';

// 时间轴播放栏「命中生效动作」金标准。
//
// 图标是内联 SVG（`svg` / `path` / `rect`），pointerdown 的 `event.target` 常常就是图标自身
// 而不是 `.item` 本身：handler 只按 `event.target` 精确匹配 `.item` 时，会表现为
// 「点图标正中没反应、点按钮留白才有反应」——播放/循环按钮尤其明显（状态也不跟着变）。
// 这里锁定「按最近的 `.item` 归属」的命中语义。

const TOOLBAR_MARKUP = `
	<div class="item toolbar-item" value="previousKey">
		<svg viewBox="0 0 16 16"><rect x="1.5" y="2" width="2" height="12" /></svg>
	</div>
	<div class="item toolbar-item" value="play">
		<svg viewBox="0 0 16 16"><path d="M3.5 1.5 L14.5 8 L3.5 14.5 Z" /></svg>
	</div>
	<div class="item toolbar-item" value="loop">
		<svg viewBox="0 0 16 16">
			<path d="M2.5 8 A5.5 5.5 0 0 1 8 2.5" fill="none" />
		</svg>
	</div>
`;

const toolbarCalls = {
	previousKeyFrame: vi.fn(),
	play: vi.fn(),
	switchLoop: vi.fn()
};

const record = Animation as unknown as Record<string, unknown>;
const originals = new Map<string, unknown>();

let toolbar: HTMLElement;

/** 派发一次与面板模板同形的 pointerdown（监听挂在播放栏容器上，事件从图标冒泡上来） */
const pointerdownOn = (element: Element): void => {
	element.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }));
};

beforeEach(() => {
	document.body.innerHTML = '';
	toolbar = document.createElement('div');
	toolbar.id = 'animation-timeline-toolbar';
	toolbar.innerHTML = TOOLBAR_MARKUP;
	// 与 AnimationTimelinePanel.vue 一致：容器上的一次转发
	toolbar.addEventListener('pointerdown', (event) => {
		Animation.timelineToolbarPointerdown!(event as PointerEvent);
	});
	document.body.append(toolbar);

	for (const [key, spy] of Object.entries(toolbarCalls)) {
		originals.set(key, record[key]);
		record[key] = spy;
		spy.mockClear();
	}
});

afterEach(() => {
	for (const [key, value] of originals) record[key] = value;
	originals.clear();
});

describe('Animation.timelineToolbarPointerdown 命中语义', () => {
	it('点图标（svg 内的 path/rect）等同于点 `.item`：播放 / 上一关键帧都生效', () => {
		pointerdownOn(toolbar.querySelector('div[value="play"] path')!);
		expect(toolbarCalls.play).toHaveBeenCalledTimes(1);

		pointerdownOn(toolbar.querySelector('div[value="previousKey"] rect')!);
		expect(toolbarCalls.previousKeyFrame).toHaveBeenCalledTimes(1);
	});

	it('点 `<svg>` 元素本身（非绘制路径的空白区）同样生效', () => {
		pointerdownOn(toolbar.querySelector('div[value="play"] svg')!);
		expect(toolbarCalls.play).toHaveBeenCalledTimes(1);
	});

	it('循环按钮：图标命中即可切换 loop 状态', () => {
		pointerdownOn(toolbar.querySelector('div[value="loop"] path')!);
		expect(toolbarCalls.switchLoop).toHaveBeenCalledTimes(1);
	});

	it('点 `.item` 自身（按钮留白）保持原有生效路径', () => {
		pointerdownOn(toolbar.querySelector('div[value="play"]')!);
		expect(toolbarCalls.play).toHaveBeenCalledTimes(1);
	});

	it('点到播放栏容器本身（不是任何按钮）不触发任何动作', () => {
		pointerdownOn(toolbar);
		expect(toolbarCalls.play).not.toHaveBeenCalled();
		expect(toolbarCalls.switchLoop).not.toHaveBeenCalled();
		expect(toolbarCalls.previousKeyFrame).not.toHaveBeenCalled();
	});
});
