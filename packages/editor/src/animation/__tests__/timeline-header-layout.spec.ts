import { describe, expect, it } from 'vitest';
import {
	timelineContentLeft,
	timelineHeadLeft,
	timelineRulerLeft
} from '@app/animation/timeline-header-layout.ts';

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

describe('timelineContentLeft（内容列自适应）', () => {
	it('页签条+播放栏没超过 18% 时保持默认列（= 图层列宽）', () => {
		expect(timelineContentLeft(198, 150, 1100)).toBe(198);
		expect(timelineContentLeft(198, 197, 1100)).toBe(198);
	});

	it('播放栏越过 18% 时内容列右移到「播放栏右缘 + 1px」', () => {
		expect(timelineContentLeft(198, 270, 1100)).toBe(271);
		expect(timelineContentLeft(198, 380, 1100)).toBe(381);
	});

	it('面板窄到放不下播放栏时贴住页面右缘（不把内容列推出页面）', () => {
		expect(timelineContentLeft(30, 400, 100)).toBe(99);
		expect(timelineContentLeft(40, 10, 50)).toBe(40);
		expect(timelineContentLeft(60, 400, 50)).toBe(60);
	});

	it('拿不到播放栏（null）时等于默认列', () => {
		expect(timelineContentLeft(198, null, 1100)).toBe(198);
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

	it('不吃播放栏宽度：多传参数也不改口径（改口径会让刻度整条偏离帧格）', () => {
		const withExtra = timelineRulerLeft as unknown as (
			gap: number,
			toolbarWidth: number
		) => number;
		expect(withExtra(100, 180)).toBe(100);
		expect(withExtra(400, 180)).toBe(400);
	});
});
