import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Animation } from '@app/animation/animation-window.ts';
import '@app/animation/register.ts';

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
		ruler.style.marginLeft = '77px';

		timeline.updateHead();

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
