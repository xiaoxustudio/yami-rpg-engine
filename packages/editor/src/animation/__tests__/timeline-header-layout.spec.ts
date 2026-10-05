import { describe, expect, it } from 'vitest';
import { timelineHeadLeft, timelineRulerLeft } from '@app/animation/timeline-header-layout.ts';

// 时间轴头部布局的生效动作金标准。
// 锁定两条几何：head 的横向位置（页签末端之后 / 无页签时退回页面框左缘），
// 以及刻度尺相对 head 的左偏移（对齐内容列；空隙为负时归零，以免压住页签条）。
// 注意：播放栏已搬出 head（Teleport 进分组页签条），这里**不含**它的宽度公式。

describe('timelineHeadLeft', () => {
	it('有页签时贴在最后一个页签右缘之后', () => {
		expect(timelineHeadLeft(320, 60)).toBe(260);
	});

	it('无页签时退回页面框左缘（不再返回 undefined / 不收窄成 0 宽）', () => {
		expect(timelineHeadLeft(null, 60)).toBe(0);
		expect(timelineHeadLeft(null, 0)).toBe(0);
	});

	it('页签右缘就在页面框左缘时偏移为 0', () => {
		expect(timelineHeadLeft(60, 60)).toBe(0);
	});
});

describe('timelineRulerLeft', () => {
	it('空隙为正时等于空隙（刻度尺落在内容列上）', () => {
		expect(timelineRulerLeft(240)).toBe(240);
		expect(timelineRulerLeft(0.5)).toBe(0.5);
	});

	it('空隙为 0 时为 0', () => {
		expect(timelineRulerLeft(0)).toBe(0);
	});

	it('空隙为负时归零（页签条过宽，刻度尺不向左压到页签上）', () => {
		expect(timelineRulerLeft(-120)).toBe(0);
	});

	// 「没有自适应」那次的回归：刻度尺必须**让过播放栏**，否则面板一窄它整条压在按钮上。
	it('让过播放栏：空隙够时偏移 = 空隙 − 播放栏宽度（刻度仍与帧网格对齐）', () => {
		expect(timelineRulerLeft(400, 180)).toBe(220);
	});

	it('空隙不够放下播放栏时归零（从按钮右缘起画，绝不滑到按钮底下）', () => {
		expect(timelineRulerLeft(100, 180)).toBe(0);
		expect(timelineRulerLeft(180, 180)).toBe(0);
		expect(timelineRulerLeft(-50, 180)).toBe(0);
	});

	it('不传播放栏宽度时等价于旧口径（按空隙对齐）', () => {
		expect(timelineRulerLeft(240, 0)).toBe(timelineRulerLeft(240));
	});
});
