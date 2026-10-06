import { describe, expect, it, vi } from 'vitest';

// `vitest.setup.ts` 把所有 legacy inspector 页面统一 mock 成空模块；本用例要测的**正是**
// file-audio-page 的真实行为，所以先解除 mock（`vi.unmock` 会被提升到 import 之前）。
vi.unmock('@app/inspector/file-audio-page.ts');

import { AudioManager } from '@app/audio/audio-manager.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import '@app/inspector/file-audio-page.ts';

/**
 * **计时器回调不许读"还没建好"的资源**。
 *
 * `open()` 早早就把 `updateAnimation` 登记进 `Timer`（rAF），而它要的进度条元素 / 画布 /
 * 分析器缓冲区由 SFC 的 `onMounted` 建；`AudioManager.analyser` 又可能**晚于挂载**才就绪。
 * 旧实现用一串 `!` 蒙过去 ⇒ 那种时序下每帧在 `array.length` 上抛
 * 「Cannot read properties of null (reading 'length')」（2026-10-01 实机，栈里就是 timer.update）。
 *
 * 本用例是那件事的仪器：把 `ensureWaveformBuffers`/局部收窄撤掉，第 1 条会当场抛同样的错。
 */
type FileAudioType = typeof Inspector.fileAudio;

const makeContext = (): CanvasRenderingContext2D =>
	new Proxy(
		{},
		{
			get: () => () => {},
			set: () => true
		}
	) as unknown as CanvasRenderingContext2D;

const makeAnalyser = (
	binCount = 256
): AnalyserNode & { getByteFrequencyData: ReturnType<typeof vi.fn> } => {
	const analyser = {
		fftSize: 32,
		smoothingTimeConstant: 1,
		frequencyBinCount: binCount,
		getByteFrequencyData: vi.fn((array: Uint8Array) => array.fill(0))
	};
	return analyser as unknown as AnalyserNode & {
		getByteFrequencyData: ReturnType<typeof vi.fn>;
	};
};

const setup = (analyser: AnalyserNode | null) => {
	const audio = { currentTime: 3, duration: 10 };
	AudioManager.player = { audio } as unknown as typeof AudioManager.player;
	AudioManager.analyser = analyser;
	Inspector.manager = { clientWidth: 100 } as unknown as typeof Inspector.manager;

	const progress = Object.assign(document.createElement('div'), { percent: 0 });
	const fileAudio = Inspector.fileAudio;
	fileAudio.progress = progress;
	fileAudio.progressFiller = document.createElement('div');
	fileAudio.currentTimeInfo = document.createElement('div');
	fileAudio.pointerTimeInfo = document.createElement('div');
	fileAudio.canvas = Object.assign(document.createElement('canvas'), {
		width: 200,
		height: 100
	}) as HTMLCanvasElement;
	fileAudio.context = makeContext();
	// 关键前置：缓冲区**还没建**（分析器晚于页面就绪时就是这样）
	fileAudio.dataArray = null;
	fileAudio.intervals = null;
	fileAudio.intensities = null;
	return { audio, progress, fileAudio };
};

const call = (fileAudio: FileAudioType, deltaTime = 16): void => {
	fileAudio.updateAnimation!(deltaTime);
};

describe('fileAudio.updateAnimation 与「资源还没就绪」', () => {
	it('分析器晚到：缓冲区按需建起来，波形这一帧照画（旧代码在 array.length 抛错）', () => {
		const analyser = makeAnalyser(256);
		const { fileAudio } = setup(analyser);

		expect(() => {
			call(fileAudio);
		}).not.toThrow();

		expect(fileAudio.dataArray).toBeInstanceOf(Uint8Array);
		expect(fileAudio.dataArray!.length).toBe(256);
		expect(fileAudio.intervals).toBeInstanceOf(Float64Array);
		expect(fileAudio.intensities!.index).toBe(1);
		// 参数由同一处设定（此前散在 SFC 的 onMounted 里）
		expect(analyser.fftSize).toBe(512);
		expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
	});

	it('分析器还没就绪：不抛错，跳过波形，但进度/时间照常更新', () => {
		const { progress, fileAudio } = setup(null);

		expect(() => {
			call(fileAudio);
		}).not.toThrow();

		expect(fileAudio.dataArray).toBe(null);
		expect(progress.percent).toBe(30); // 3s / 10s
		expect(fileAudio.currentTimeInfo!.textContent).toBe('0:03');
	});

	it('分析器被换掉（bin 数变了）：缓冲区重建到新尺寸', () => {
		const { fileAudio } = setup(makeAnalyser(256));
		call(fileAudio);
		expect(fileAudio.dataArray!.length).toBe(256);

		const wider = makeAnalyser(512);
		AudioManager.analyser = wider;
		call(fileAudio);
		expect(fileAudio.dataArray!.length).toBe(512);
	});

	it('页面元素还没挂上（progress 为空）：不抛错，且不建缓冲区', () => {
		const { fileAudio } = setup(makeAnalyser(256));
		fileAudio.progress = null;

		expect(() => {
			call(fileAudio);
		}).not.toThrow();
		expect(fileAudio.dataArray).toBe(null);
	});
});
