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

	// 回归（实机「改完和上面的时间轴对不齐了」）：刻度尺的左缘**只按空隙**算，
	// 不能因为播放栏占位而右移 —— 刻度对齐靠 `outerRuler.scrollLeft` 镜像帧网格滚动，
	// 盒子右移会让整条刻度跟着偏移。与之重叠的那一段靠播放栏的不透明底板遮住（CSS 负责）。
	it('与播放栏无关：任何播放栏宽度都不会改变刻度尺偏移', () => {
		expect(timelineRulerLeft(240)).toBe(240);
		expect(timelineRulerLeft(0)).toBe(0);
		expect(timelineRulerLeft(-50)).toBe(0);
		// 多传一个「播放栏宽度」也不能改口径：旧写法（空隙 − 播放栏宽）在这里会返回 0
		const withExtra = timelineRulerLeft as unknown as (
			gap: number,
			toolbarWidth: number
		) => number;
		expect(withExtra(100, 180)).toBe(100);
		expect(withExtra(400, 180)).toBe(400);
	});
});
