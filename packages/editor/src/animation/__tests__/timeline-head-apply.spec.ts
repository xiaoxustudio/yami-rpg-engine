import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Animation } from '@app/animation/animation-window.ts';
import '@app/animation/register.ts';

// 时间轴头部版式的生效动作金标准（jsdom 无像素，锁的是**写法**而不是几何）。
//
// 回归（实机「刻度尺/帧格压在播放按钮上，没有自适应」）：head 里的播放栏与刻度尺原来各写各的
// absolute `left`，面板一窄刻度尺就整条滑到按钮底下（旧实现只能给播放栏更高的 z-index 遮丑）。
// 现在 head 是 flex 行：播放栏是不收缩的 flex 项，刻度尺吃剩下宽度，靠 **`margin-left`**
// 让过播放栏。任何人把它改回给刻度尺写内联 `left/width`，这条用例就会红。

interface HeadHost extends HTMLElement {
	updateHead: () => void;
}

const sizeIt = (el: HTMLElement, width: number): void => {
	Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
};

describe('Animation.timeline.updateHead 版式收口', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('只写 head 的 left + 刻度尺的 margin-left；不再给刻度尺写内联 left', () => {
		const timeline = document.createElement('div') as unknown as HeadHost;
		timeline.updateHead = Animation.timeline.updateHead!;
		const head = document.createElement('div');
		const ruler = document.createElement('div');
		const list = document.createElement('div');
		const toolbar = document.createElement('div');
		timeline.append(head, toolbar, ruler, list);
		document.body.append(timeline);
		sizeIt(timeline, 800);
		sizeIt(toolbar, 180);

		elementDataOf<{ head?: HTMLElement }>(timeline).head = head;
		Animation.outerRuler = ruler as never;
		Animation.outerTimelineList = list as never;
		Animation.toolbar = toolbar as never;

		// 旧实现可能留下的内联 left，必须被清掉（`position: relative` 下它会再顶一次）
		ruler.style.left = '123px';

		timeline.updateHead();

		expect(head.style.left).not.toBe('');
		expect(ruler.style.left).toBe('');
		expect(ruler.style.marginLeft).not.toBe('');
		// 刻度尺**不是**绝对定位的那一套：宽度由 flex 决定，不该再有内联 width
		expect(ruler.style.width).toBe('');
	});

	it('播放栏宽度被纳入刻度尺偏移（空隙 − 播放栏宽，负值归零）', () => {
		const timeline = document.createElement('div') as unknown as HeadHost;
		timeline.updateHead = Animation.timeline.updateHead!;
		const head = document.createElement('div');
		const ruler = document.createElement('div');
		const list = document.createElement('div');
		const toolbar = document.createElement('div');
		timeline.append(head, toolbar, ruler, list);
		document.body.append(timeline);
		sizeIt(timeline, 800);
		// jsdom 里 `rect()` 全为 0 ⇒ 空隙恒为 0；把 toolbar 报成 120 宽后，
		// 0 − 120 归零 ⇒ margin-left 为 0px（而不是把刻度尺放到负偏移上）
		sizeIt(toolbar, 120);
		Animation.toolbar = toolbar as never;

		elementDataOf<{ head?: HTMLElement }>(timeline).head = head;
		Animation.outerRuler = ruler as never;
		Animation.outerTimelineList = list as never;

		timeline.updateHead();

		expect(ruler.style.marginLeft).toBe('0px');
	});
});
