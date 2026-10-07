import { File } from '@app/file/file-system-core.ts';
import { AudioManager } from './audio-manager.ts';
import { Reverb } from './reverb.ts';
import { clamp, roundTo } from '@app/utils/math';

export class AudioPlayer {
	audio: HTMLAudioElement & { path: string };
	source: MediaElementAudioSourceNode;
	panner: StereoPannerNode;
	reverb: Reverb | null;

	constructor() {
		const context = AudioManager.context!;
		this.audio = new Audio() as HTMLAudioElement & { path: string };
		this.source = context.createMediaElementSource(this.audio);
		this.panner = context.createStereoPanner();
		this.reverb = null;
		this.audio.path = '';

		this.source.connect(this.panner);
		this.panner.connect(AudioManager.analyser!);
	}

	play(path: string): void {
		if (path) {
			const audio = this.audio;
			if (audio.path !== path || audio.readyState !== 4 || audio.ended === true) {
				audio.src = File.route!(path);
				audio.path = path;
				void audio.play();
			}
		} else {
			this.stop();
		}
	}

	stop(): void {
		const audio = this.audio;
		if (audio.path) {
			audio.pause();
			audio.currentTime = 0;
			audio.path = '';
		}
	}

	setVolume(volume: number): void {
		this.audio.volume = clamp(volume, 0, 1);
	}

	setPan(pan: number): void {
		this.panner.pan.value = clamp(pan, -1, 1);
	}

	setReverb(dry: number, wet: number) {
		if (this.reverb === null && !(dry === 1 && wet === 0)) {
			new Reverb(this);
		}
		if (this.reverb !== null) {
			this.reverb.set(dry, wet);
		}
	}

	getParams() {
		return {
			volume: roundTo(this.audio.volume, 2),
			pan: roundTo(this.panner.pan.value, 2),
			dry: this.reverb ? roundTo(this.reverb.dryGain.gain.value, 2) : 1,
			wet: this.reverb ? roundTo(this.reverb.wetGain.gain.value / 2, 2) : 0
		};
	}
}
