import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Animation } from '@app/animation/animation-window.ts';
import '@app/animation/register.ts';

// 时间轴头部/内容列版式的生效动作金标准（jsdom 无像素，锁的是**写法与口径**）。
//
// 契约（实机「刻度尺被播放按钮组挡到」那次的三处联动）：
// ① head.left = 分组最后一个页签右缘（`timelineHeadLeft`）；
// ② 内容列（= 图层列宽 / 帧网格左缘 / 指针区左缘 / 刻度尺左缘）必须**同一口径**，且不低于
//    页面 18%；有播放栏时还要越过它 —— 只动刻度尺会让刻度与帧格错开，只动网格会让刻度被挡；
// ③ 刻度尺写绝对定位的 `left`（内容列 − head 左缘），**不写 `margin-left`**。

interface HeadHost extends HTMLElement {
	updateHead: () => void;
}

const sizeIt = (el: HTMLElement, width: number): void => {
	Object.defineProperty(el, 'clientWidth', { value: width, configurable: true });
	Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
};

const buildTimeline = (pageWidth: number) => {
	const timeline = document.createElement('div') as unknown as HeadHost;
	timeline.updateHead = Animation.timeline.updateHead!;
	const head = document.createElement('div');
	const ruler = document.createElement('div');
	const list = document.createElement('div');
	const pointerArea = document.createElement('div');
	const layerList = document.createElement('div');
	const toolbar = document.createElement('div');
	timeline.append(head, toolbar, ruler, list, pointerArea, layerList);
	document.body.append(timeline);
	sizeIt(timeline, pageWidth);
	sizeIt(layerList, 144);

	elementDataOf<{ head?: HTMLElement }>(timeline).head = head;
	Animation.outerRuler = ruler as never;
	Animation.outerTimelineList = list as never;
	Animation.outerPointerArea = pointerArea as never;
	Animation.layerList = layerList as never;
	Animation.toolbar = toolbar as never;
	return { timeline, head, ruler, list, pointerArea, layerList, toolbar };
};

describe('Animation.timeline.updateHead 版式收口', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('内容列三处联动 + 刻度尺写 left（不写 margin-left）', () => {
		const { timeline, head, ruler, list, pointerArea, layerList } = buildTimeline(800);
		// 上一版实现留下的内联 margin-left 必须被清掉（否则刻度整条偏移）
		ruler.style.marginLeft = '77px';

		timeline.updateHead();

		// jsdom 里 rect 全 0 ⇒ 默认列 = 页面 18% = 144px
		expect(head.style.left).toBe('0px');
		expect(layerList.style.width).toBe('144px');
		expect(list.style.left).toBe('144px');
		expect(pointerArea.style.left).toBe('144px');
		expect(ruler.style.left).toBe('144px');
		expect(ruler.style.marginLeft).toBe('');
		expect(ruler.style.width).toBe('');
	});

	it('面板很窄时内容列不越界（页面 50 ⇒ 默认列 9px）', () => {
		const { timeline, ruler, list, layerList } = buildTimeline(50);

		timeline.updateHead();

		expect(layerList.style.width).toBe('9px');
		expect(list.style.left).toBe('9px');
		expect(ruler.style.left).toBe('9px');
	});

	it('head 取不到分组页签时退回页面框左缘（不写 undefined）', () => {
		const { timeline, head } = buildTimeline(800);

		timeline.updateHead();

		expect(head.style.left).toBe('0px');
	});
});
