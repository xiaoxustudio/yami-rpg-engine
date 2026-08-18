import { File } from '@app/legacy/file/file-system-core.ts';
import { AudioPlayer } from './audio-player.ts';
import { MultipleAudioPlayer } from './multiple-audio-player.ts';

interface WaveformPromise extends Promise<string | undefined> {
	canceled?: boolean;
}

interface AudioManagerShape {
	context: AudioContext | null;
	player: AudioPlayer | null;
	se:
		| (MultipleAudioPlayer & {
				play: (sound: string, volume: number) => void;
		  })
		| null;
	analyser: AnalyserNode | null;
	waveforms: Record<string, string | WaveformPromise>;
	initialize: (() => void) | null;
	getWaveform: ((guid: string) => Promise<string | undefined>) | null;
	close: (() => void) | null;
	playMusic: ((name: string) => void) | null;
	stopMusic: (() => void) | null;
	playSound: ((name: string) => void) | null;
	[k: string]: any;
}

export const AudioManager: AudioManagerShape = {
	context: null as AudioContext | null,
	player: null as AudioPlayer | null,
	se: null as
		| (MultipleAudioPlayer & {
				play: (sound: string, volume: number) => void;
		  })
		| null,
	analyser: null as AnalyserNode | null,
	waveforms: {} as Record<string, string | WaveformPromise>,
	initialize: null as (() => void) | null,
	getWaveform: null as ((guid: string) => Promise<string | undefined>) | null,
	close: null as (() => void) | null,
	playMusic: null as ((name: string) => void) | null,
	stopMusic: null as (() => void) | null,
	playSound: null as ((name: string) => void) | null
};

AudioManager.initialize = function () {
	getAudioStore().state = 'open';

	this.context = new AudioContext();

	this.analyser = this.context.createAnalyser();
	this.analyser.connect(this.context.destination);

	this.player = new AudioPlayer();

	this.se = new MultipleAudioPlayer() as MultipleAudioPlayer & {
		play: (sound: string, volume: number) => void;
	};
};

AudioManager.getWaveform = function (guid: string) {
	const waveforms = this.waveforms;
	const waveform = waveforms[guid];
	switch (typeof waveform) {
		case 'string':
			return Promise.resolve().then(() => waveform);
		case 'object':
			return waveform;
	}
	const promise = (waveforms[guid] = File.get!({
		guid: guid,
		type: 'arraybuffer'
	}).then((response: ArrayBuffer) => {
		if (waveforms[guid] !== promise) {
			return;
		}
		// 解码音频数据会阻塞线程 可以通过取消操作来避免
		if (promise.canceled) {
			delete waveforms[guid];
			return;
		}
		return this.context!.decodeAudioData(response).then((buffer: AudioBuffer) => {
			const canvas = document.createElement('canvas');
			canvas.width = 512;
			canvas.height = 160;
			const context = canvas.getContext('2d')!;
			const channels = buffer.numberOfChannels;
			const maxNodes = canvas.width * 8;
			const amplitude = canvas.height / channels / 2;
			let baseline = amplitude;
			for (let i = 0; i < channels; i++) {
				const data = buffer.getChannelData(i);
				const nodes = Math.min(data.length, maxNodes);
				const step1 = data.length / nodes;
				const step2 = canvas.width / nodes;
				const floor = Math.floor;
				context.beginPath();
				context.moveTo(0, baseline);
				for (let i = 0; i < nodes; i++) {
					const di = floor(i * step1);
					const wave = baseline + amplitude * data[di];
					context.lineTo(i * step2, wave);
				}
				context.strokeStyle = 'white';
				context.stroke();
				baseline += amplitude * 2;
			}
			return (waveforms[guid] = `url(${canvas.toDataURL()})`);
		});
	}) as WaveformPromise);
	return promise;
};

AudioManager.close = function () {
	getAudioStore().state = 'closed';
	getAudioStore().music = null;
	this.player?.stop();
	this.waveforms = {};
};

AudioManager.playMusic = function (name: string) {
	getAudioStore().music = { name };
};

AudioManager.stopMusic = function () {
	getAudioStore().music = null;
};

import { getAudioStore } from '@app/stores/audio';

const audioBridgeKeys = ['state', 'music'] as const;

for (const key of audioBridgeKeys) {
	Object.defineProperty(AudioManager, key, {
		get: () => getAudioStore()[key],
		set: (value: unknown) => {
			(getAudioStore() as unknown as Record<(typeof audioBridgeKeys)[number], any>)[key] =
				value;
		},
		configurable: true
	});
}
