import { inspectorEls } from './element-registry.ts';
import { padZero } from '@app/utils/number';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { addClass, hasClass, hide, removeClass, show } from '@app/utils/element-utils';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { File } from '@app/file/file-system-core.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Timer } from '@app/utils/timer';
import type { YamiElement } from '@app/types/element-api';
import type { YamiEvent } from '@app/types/editor-event';
import { roundTo } from '@app/utils/math';
import { getDevicePixelContentBoxSize } from '@app/utils/css';

{
	/** 波形 Promise：运行时会被挂上 `canceled` 标记（close 时用来作废回调）；url 可能缺（见 getWaveform 声明） */
	type AudioWaveformPromise = Promise<string | undefined> & { canceled?: boolean };
	/** 进度条元素：运行时被挂上 `percent` */
	type AudioProgressElement = HTMLElement & { percent?: number };
	/** 指针元素：运行时被挂上 `time` */
	type AudioPointerElement = HTMLElement & { time?: number };
	interface FileAudioShape {
		target: FileItem | null;
		meta: FileMeta | null;
		symbol: symbol | null;
		promise: AudioWaveformPromise | null;
		progress: AudioProgressElement | null;
		progressFiller: HTMLElement | null;
		pointer: AudioPointerElement | null;
		currentTimeInfo: HTMLElement | null;
		pointerTimeInfo: HTMLElement | null;
		canvas: HTMLCanvasElement | null;
		context: CanvasRenderingContext2D | null;
		dataArray: Uint8Array<ArrayBuffer> | null;
		intervals: Float64Array | null;
		intensities: (Float64Array & { index: number }) | null;
		rotation: number | null;
		lineColor: string | null;
		initialize: (() => void) | null;
		open: ((file: FileItem, meta: FileMeta | null) => void) | null;
		close: (() => void) | null;
		play: (() => void) | null;
		writeParams: ((params: AudioParams) => void) | null;
		updateParams: ((params: AudioParams) => void) | null;
		updateParamInfos: ((params: AudioParams) => void) | null;
		updateCanvas: (() => void) | null;
		formatTime: ((time: number) => string) | null;
		requestAnimation: (() => void) | null;
		updateAnimation: ((deltaTime: number) => void) | null;
		stopAnimation: (() => void) | null;
		themechange: ((event: YamiEvent) => void) | null;
		windowResize: ((event: YamiEvent) => void) | null;
		progressPointerdown: ((event: PointerEvent) => void) | null;
		progressPointermove: ((event: PointerEvent) => void) | null;
		progressPointerleave: ((event: PointerEvent) => void) | null;
		info: { name: string; size: string; duration: string; bitrate: string } | null;
		params: AudioParams | null;
		update: (() => void) | null;
	}
	interface AudioParams {
		volume: number;
		pan: number;
		dry: number;
		wet: number;
	}
	const FileAudio: FileAudioShape = {
		target: null,
		meta: null,
		symbol: null,
		promise: null,
		progress: null,
		progressFiller: null,
		pointer: null,
		currentTimeInfo: null,
		pointerTimeInfo: null,
		canvas: null,
		context: null,
		dataArray: null,
		intervals: null,
		intensities: null,
		rotation: null,
		lineColor: null,
		initialize: null,
		open: null,
		close: null,
		play: null,
		writeParams: null,
		updateParams: null,
		updateParamInfos: null,
		updateCanvas: null,
		formatTime: null,
		requestAnimation: null,
		updateAnimation: null,
		stopAnimation: null,
		themechange: null,
		windowResize: null,
		progressPointerdown: null,
		progressPointermove: null,
		progressPointerleave: null,
		info: null,
		params: null,
		update: null
	};

	FileAudio.initialize = function (this: typeof FileAudio) {};

	FileAudio.open = function (this: typeof FileAudio, file: FileItem, meta: FileMeta | null) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const size = Number((file.stats as unknown as { size: number }).size);
			this.info = {
				name: file.basename + file.extname,
				size: File.parseFileSize!(size),
				duration: '',
				bitrate: ''
			};
			this.update!();

			this.writeParams!(AudioManager.player!.getParams());

			const audio = AudioManager.player!.audio;
			const path = file.path;
			if (audio.path !== path) {
				audio.path = path;
				audio.src = File.route!(path);

				removeClass(this.progress, 'visible');
				// 婵烇絽娲︾换鍕汲閳ь剟鎮楅悽娈挎敯缂佺粯鍨垮畷鍫曟倷閸偆鏆犻梺鍛婎焽閸犲酣锝為幁娓瀘mise闂佹眹鍔岀€氼剛妲愰埡鍛仺?婵炲濮伴崕鎵矚閸洖鐭楁い鏍ㄧ懁缁ㄤ即鏌涘▎鎰缂佸顥撻幉鎾晲閸モ晛鐏ｉ梻鍌氾攻婵炲﹪銆傞崼鏇炴瀬闁绘鐗嗙粊锕傛煟閵娿儱顏柟濂告敱閹?
				const promise = (this.promise = AudioManager.getWaveform!(meta!.guid));
				void promise.then((url) => {
					if (this.promise === promise) {
						this.promise = null;
						// url 可能是 undefined（getWaveform 的声明如此）：塞给 CSSOM 会被当无效值忽略 —— 断言只为过类型
						this.progress!.style.webkitMaskImage = url as string;
						addClass(this.progress, 'visible');
					}
				});
			}

			this.updateCanvas!();
			this.requestAnimation!();

			const symbol = (this.symbol = Symbol());
			void new Promise<void>((resolve: () => void) => {
				if (isNaN(audio.duration)) {
					audio.addEventListener(
						'loadedmetadata',
						() => {
							resolve();
						},
						{ once: true }
					);
				} else {
					resolve();
				}
			}).then(() => {
				if (this.symbol === symbol) {
					this.symbol = null;
					const duration = audio.duration;
					const bitrate = Math.round(size / 128 / duration);
					this.info!.duration = this.formatTime!(duration);
					this.info!.bitrate = `${bitrate}Kbps`;
					this.update!();
				}
			});
		}
	};

	FileAudio.close = function (this: typeof FileAudio) {
		if (this.target) {
			if (this.promise) {
				this.promise.canceled = true;
				this.promise = null;
			}
			getBrowserInstance()?.unselect?.(this.meta);
			this.stopAnimation!();
			this.target = null;
			this.meta = null;
			this.symbol = null;
		}
	};

	FileAudio.play = function (this: typeof FileAudio) {
		if (this.target !== null) {
			const { audio } = AudioManager.player!;
			if (audio.paused) {
				void audio.play();
			} else {
				audio.currentTime = 0;
			}
		}
	};

	FileAudio.writeParams = function (this: typeof FileAudio, params: AudioParams) {
		this.updateParamInfos!(params);
	};

	FileAudio.updateParams = function (this: typeof FileAudio, params: AudioParams) {
		AudioManager.player!.setVolume(params.volume);
		AudioManager.player!.setPan(params.pan);
		AudioManager.player!.setReverb(params.dry, params.wet);
	};

	FileAudio.updateParamInfos = function (this: typeof FileAudio, params: AudioParams) {
		this.params = params;
		this.update!();
	};

	FileAudio.update = function (this: typeof FileAudio) {
		const el = inspectorEls.get('fileAudio') as YamiElement;
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	FileAudio.updateCanvas = function (this: typeof FileAudio) {
		const manager = Inspector.manager;
		const canvas = this.canvas!;
		const scrollTop = manager.scrollTop;
		if (hasClass(canvas, 'hidden')) {
			if (canvas.width !== 0) {
				canvas.width = 0;
			}
			if (canvas.height !== 0) {
				canvas.height = 0;
			}
		} else {
			canvas.style.width = '100%';
			canvas.style.height = '0';
			const dpr = window.devicePixelRatio;
			const height = getDevicePixelContentBoxSize(canvas).width;
			if (canvas.height !== height) {
				canvas.height = height;
			}
			canvas.style.height = `${height / dpr}px`;
			const width = getDevicePixelContentBoxSize(canvas).width;
			if (canvas.width !== width) {
				canvas.width = width;
			}
			canvas.style.width = `${width / dpr}px`;
		}
		if (manager.scrollTop !== scrollTop) {
			manager.scrollTop = scrollTop;
		}
	};

	FileAudio.formatTime = function (this: typeof FileAudio, time: number) {
		const pad = padZero;
		const length = Math.floor(time);
		const hours = Math.floor(length / 3600);
		const minutes = Math.floor(length / 60) % 60;
		const seconds = length % 60;
		return hours
			? `${hours}:${pad(minutes, 60)}:${pad(seconds, 60)}`
			: `${minutes}:${pad(seconds, 60)}`;
	};

	FileAudio.requestAnimation = function (this: typeof FileAudio) {
		if (this.target !== null) {
			Timer.appendUpdater!('sharedAnimation', this.updateAnimation!);
		}
	};

	FileAudio.updateAnimation = function (this: typeof FileAudio, deltaTime: number) {
		const audio = AudioManager.player!.audio;
		const currentTime = audio.currentTime;
		const duration = audio.duration || Infinity;
		const cw = Inspector.manager.clientWidth;
		const pw = Math.round((cw * currentTime) / duration);
		const pp = roundTo((pw / cw) * 100, 6);
		const { progress, progressFiller } = FileAudio;
		if (progress!.percent !== pp) {
			progress!.percent = pp;
			progressFiller!.style.width = `${pp}%`;
		}

		const time = FileAudio.formatTime!(currentTime);
		const currentTimeInfo = FileAudio.currentTimeInfo!;
		if (currentTimeInfo.textContent !== time) {
			currentTimeInfo.textContent = time;
		}

		const canvas = FileAudio.canvas!;
		const context = FileAudio.context!;
		const width = canvas.width;
		const height = canvas.height;
		if (width * height === 0) {
			return;
		}
		const analyser = AudioManager.analyser!;
		const array = FileAudio.dataArray!;
		const aLength = array.length;
		const start = Math.floor(aLength * 0.1);
		const end = Math.floor(aLength * 0.85);
		const step = (Math.PI * 2) / (end - start);
		const intervals = FileAudio.intervals!;
		const intensities = FileAudio.intensities!;
		const length = intensities.length;
		const index = intensities.index;
		let intensity = 0;
		let samples = 0;
		analyser.getByteFrequencyData(array);
		for (let i = start; i < end; i++) {
			const freq = array[i];
			if (freq !== 0) {
				intensity += freq;
				samples++;
			}
		}
		if (intensity !== 0) {
			intensity = (intensity / samples / 255) * 2;
		}
		intervals[index] = deltaTime;
		intensities[index] = intensity;
		intensities.index = (index + 1) % length;
		let intervalSum = 0;
		let intensityAverage = 0;
		let intensityCount = 0;
		let i = index + length;
		while (i > index) {
			const j = i-- % length;
			intervalSum += intervals[j];
			intensityAverage += intensities[j];
			intensityCount++;
			// 闂佸憡鐟﹂悧妤€銆掗懜鍨氦?50ms闂佹眹鍔岀€氼剙顔忔潏銊﹀劅闁挎洍鍋撻梺瑙ｆ櫊瀹曟悂宕惰閸?濡ょ姷鍋犲▍鏇犲垝閿旇姤浜ら柛銉ｅ妽鐠?
			if (intervalSum >= 150) {
				break;
			}
		}
		intensityAverage /= intensityCount;

		const centerX = height / 2;
		const centerY = height / 2;
		const size = height * (0.8 + intensityAverage * 0.2);
		const padding = height * 0.04;
		const amplitude = height * 0.1;
		const lineWidth = size * 0.005;
		const halfWidth = lineWidth / 2;
		const fRadius = size / 2 - padding - amplitude;
		const rotation = FileAudio.rotation! - start * step;
		const MathCos = Math.cos;
		const MathSin = Math.sin;
		context.clearRect(0, 0, width, height);
		context.lineWidth = lineWidth;
		context.strokeStyle = FileAudio.lineColor!;
		context.beginPath();
		for (let i = start; i < end; i++) {
			const freq = array[i];
			if (freq !== 0) {
				const angle = i * step + rotation;
				const cos = MathCos(angle);
				const sin = MathSin(angle);
				const af = (freq / 255) ** 2.5;
				const am = amplitude * af + halfWidth;
				const br = fRadius - am;
				const er = fRadius + am;
				const bx = centerX + br * cos;
				const by = centerY + br * sin;
				const ex = centerX + er * cos;
				const ey = centerY + er * sin;
				context.moveTo(bx, by);
				context.lineTo(ex, ey);
			}
		}
		context.globalAlpha = 1;
		context.stroke();
		context.beginPath();
		for (let i = start; i < end; i++) {
			const freq = array[i];
			if (freq === 0) {
				const angle = i * step + rotation;
				const cos = MathCos(angle);
				const sin = MathSin(angle);
				const br = fRadius - halfWidth;
				const er = fRadius + halfWidth;
				const bx = centerX + br * cos;
				const by = centerY + br * sin;
				const ex = centerX + er * cos;
				const ey = centerY + er * sin;
				context.moveTo(bx, by);
				context.lineTo(ex, ey);
			}
		}
		context.globalAlpha = 0.25;
		context.stroke();

		FileAudio.rotation! -= (Math.PI * deltaTime) / 15000;
	};

	FileAudio.stopAnimation = function (this: typeof FileAudio) {
		Timer.removeUpdater!('sharedAnimation', this.updateAnimation!);
	};

	FileAudio.themechange = function (this: typeof FileAudio, event: YamiEvent) {
		switch (event.value) {
			case 'light':
				this.lineColor = '#000000';
				break;
			case 'dark':
				this.lineColor = '#ffffff';
				break;
		}
	}.bind(FileAudio);

	FileAudio.windowResize = function (this: typeof FileAudio, _event: YamiEvent) {
		if (FileAudio.target !== null && FileAudio.symbol === null) {
			FileAudio.updateCanvas!();
		}
	};

	FileAudio.progressPointerdown = function (this: typeof FileAudio, event: PointerEvent) {
		switch (event.button) {
			case 0: {
				const { audio } = AudioManager.player!;
				const { time } = FileAudio.pointer!;
				if (time !== -1) {
					// `pointer.time` 在首次 pointermove 之前是 undefined（Vue 页只设 element，不设 time），
					// `undefined !== -1` 为 true ⇒ 这里本来就会把 undefined 交给 currentTime。断言只为过类型。
					audio.currentTime = time as number;
				}
				break;
			}
		}
	};

	FileAudio.progressPointermove = function (this: HTMLElement, event: PointerEvent) {
		const { pointer, pointerTimeInfo } = FileAudio;
		const { duration } = AudioManager.player!.audio;
		if (!isNaN(duration)) {
			const pointerX = event.offsetX;
			const boxWidth = this.clientWidth;
			const ratio = pointerX / Math.max(boxWidth - 1, 1);
			const time = ratio * duration;
			pointer!.time = time;
			pointer!.style.left = `${pointerX}px`;
			show(pointer);
			pointerTimeInfo!.textContent = FileAudio.formatTime!(time);
			show(pointerTimeInfo);
			const infoWidth = pointerTimeInfo!.clientWidth + 16;
			const infoX = Math.min(pointerX, boxWidth - infoWidth);
			pointerTimeInfo!.style.left = `${infoX}px`;
		}
	};

	FileAudio.progressPointerleave = function (this: typeof FileAudio, _event: PointerEvent) {
		const { pointer, pointerTimeInfo } = FileAudio;
		if (pointer!.time !== -1) {
			pointer!.time = -1;
			hide(pointer);
			hide(pointerTimeInfo);
		}
	};

	Inspector.fileAudio = FileAudio;
}
