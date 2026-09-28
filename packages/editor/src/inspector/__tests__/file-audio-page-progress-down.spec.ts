import { describe, expect, it, vi } from 'vitest';

// `vitest.setup.ts` 把所有 legacy inspector 页面统一 mock 成空模块；本用例要测的**正是**
// file-audio-page 的真实行为，所以先解除 mock（`vi.unmock` 会被提升到 import 之前）。
vi.unmock('@app/inspector/file-audio-page.ts');

import { AudioManager } from '@app/audio/audio-manager.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import '@app/inspector/file-audio-page.ts';

/**
 * （Vue 页只设 element、不设 `time`），而旧判断是 `time !== -1` —— `undefined !== -1` 为真，
 * 于是「还没移动过就点进度条」会把 `undefined` 交给 `audio.currentTime`（按 NaN 处理，
 * 等于把播放头拉到开头）。`-1` 是 `progressPointerleave` 的哨兵，两者都该视为「没有有效位置」。
 */
const makePlayer = () => {
	const audio = { currentTime: 7 };
	AudioManager.player = { audio } as unknown as typeof AudioManager.player;
	return audio;
};

const setPointerTime = (time: number | undefined): void => {
	Inspector.fileAudio.pointer = { time } as unknown as typeof Inspector.fileAudio.pointer;
};

describe('fileAudio.progressPointerdown 与「指针还没移动过」', () => {
	it('time 为 undefined 时不得改写 audio.currentTime（旧代码会写）', () => {
		const audio = makePlayer();
		setPointerTime(undefined);

		Inspector.fileAudio.progressPointerdown!({ button: 0 } as PointerEvent);

		expect(audio.currentTime).toBe(7);
	});

	it('time 为 -1（pointerleave 的哨兵）时同样不得改写', () => {
		const audio = makePlayer();
		setPointerTime(-1);

		Inspector.fileAudio.progressPointerdown!({ button: 0 } as PointerEvent);

		expect(audio.currentTime).toBe(7);
	});

	it('time 是有效位置时才跳转（既有行为不变）', () => {
		const audio = makePlayer();
		setPointerTime(12.5);

		Inspector.fileAudio.progressPointerdown!({ button: 0 } as PointerEvent);

		expect(audio.currentTime).toBe(12.5);
	});
});
