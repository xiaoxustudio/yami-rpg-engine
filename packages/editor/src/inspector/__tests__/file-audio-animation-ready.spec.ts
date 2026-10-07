import { describe, expect, it, vi } from 'vitest';

vi.unmock('@app/inspector/file-audio-page.ts');

import { AudioManager } from '@app/audio/audio-manager.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import '@app/inspector/file-audio-page.ts';

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
		expect(analyser.fftSize).toBe(512);
		expect(analyser.getByteFrequencyData).toHaveBeenCalledTimes(1);
	});

	it('分析器还没就绪：不抛错，跳过波形，但进度/时间照常更新', () => {
		const { progress, fileAudio } = setup(null);

		expect(() => {
			call(fileAudio);
		}).not.toThrow();

		expect(fileAudio.dataArray).toBe(null);
		expect(progress.percent).toBe(30);
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
