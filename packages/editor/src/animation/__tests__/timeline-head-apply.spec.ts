import { beforeEach, describe, expect, it } from 'vitest';
import { elementDataOf } from '@ui-kit';
import { Animation } from '@app/animation/animation-window.ts';
import '@app/animation/register.ts';

// 时间轴头部版式的生效动作金标准（jsdom 无像素，锁的是**写法**而不是几何）。
//
// 两条契约：
// ① head 的 left = 分组最后一个页签的右缘（`timelineHeadLeft`）；
// ② 刻度尺只写绝对定位的 `left`（= 内容列左缘 − head 左缘，见 `timelineRulerLeft`），
//    **不写 `margin-left`** —— 刻度对齐靠 `outerRuler.scrollLeft` 镜像帧网格滚动，
//    盒子右移会让整条刻度与下面的帧格错开（实机反馈过）。与播放栏的重叠由「播放栏不透明
//    底板 + head 裁剪」解决，不靠移动刻度尺。

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

	it('只写 head.left 与刻度尺的 left：不移动刻度尺盒子（无 margin-left）', () => {
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

		// 上一版实现留下的内联 margin-left 必须被清掉（否则刻度整条偏移）
		ruler.style.marginLeft = '77px';

		timeline.updateHead();

		expect(head.style.left).not.toBe('');
		expect(ruler.style.left).not.toBe('');
		expect(ruler.style.marginLeft).toBe('');
		// 宽度由 CSS（left/right + overflow）决定，不该有内联 width
		expect(ruler.style.width).toBe('');
	});

	it('刻度尺偏移与播放栏宽度无关（jsdom 里 rect 全 0 ⇒ left 恒为 0px）', () => {
		const timeline = document.createElement('div') as unknown as HeadHost;
		timeline.updateHead = Animation.timeline.updateHead!;
		const head = document.createElement('div');
		const ruler = document.createElement('div');
		const list = document.createElement('div');
		const toolbar = document.createElement('div');
		timeline.append(head, toolbar, ruler, list);
		document.body.append(timeline);
		sizeIt(timeline, 800);
		// 把播放栏报成 120 宽：旧「让过播放栏」写法会算成 (0 − 120) → 0，
		// 而现在无论播放栏多宽，刻度尺 left 都只由空隙决定
		sizeIt(toolbar, 120);
		Animation.toolbar = toolbar as never;

		elementDataOf<{ head?: HTMLElement }>(timeline).head = head;
		Animation.outerRuler = ruler as never;
		Animation.outerTimelineList = list as never;

		timeline.updateHead();

		expect(ruler.style.left).toBe('0px');
		expect(ruler.style.marginLeft).toBe('');
	});
});
