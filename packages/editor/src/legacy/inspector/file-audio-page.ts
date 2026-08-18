import { $, getElementReader } from '@app/legacy/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { addClass, hasClass, hide, removeClass, show, write } from '@app/legacy/util/element-utils';
import { AudioManager } from '@app/legacy/audio/audio-manager.ts';
import { File } from '@app/legacy/file/file-system-core.ts';
import { FileItem } from '@app/legacy/file/file-item.ts';
import type { FileMeta } from '@app/legacy/data/metadata-manifest.ts';
import { Inspector } from './inspector.ts';
import { Timer } from '@app/legacy/util/timer.ts';

{
	interface FileAudioShape {
		[k: string]: any;
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
		paramInput: null,
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
				promise.then((url) => {
					if (this.promise === promise) {
						this.promise = null;
						this.progress.style.webkitMaskImage = url;
						addClass(this.progress, 'visible');
					}
				});
			}

			this.updateCanvas!();
			this.requestAnimation!();

			const symbol = (this.symbol = Symbol());
			new Promise<void>((resolve: () => void) => {
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
				audio.play();
			} else {
				audio.currentTime = 0;
			}
		}
	};

	FileAudio.writeParams = function (this: typeof FileAudio, params: AudioParams) {
		write($('#fileAudio-volume'), params.volume);
		write($('#fileAudio-pan'), params.pan);
		write($('#fileAudio-dry'), params.dry);
		write($('#fileAudio-wet'), params.wet);
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
		const el = $('#fileAudio');
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	FileAudio.updateCanvas = function (this: typeof FileAudio) {
		const manager = Inspector.manager;
		const canvas = this.canvas;
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
			const height = CSS.getDevicePixelContentBoxSize(canvas).width;
			if (canvas.height !== height) {
				canvas.height = height;
			}
			canvas.style.height = `${height / dpr}px`;
			const width = CSS.getDevicePixelContentBoxSize(canvas).width;
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
		const pad = Number.padZero;
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
			Timer.appendUpdater!('sharedAnimation', this.updateAnimation);
		}
	};

	FileAudio.updateAnimation = function (this: typeof FileAudio, deltaTime: number) {
		const audio = AudioManager.player!.audio;
		const currentTime = audio.currentTime;
		const duration = audio.duration || Infinity;
		const cw = Inspector.manager.clientWidth;
		const pw = Math.round((cw * currentTime) / duration);
		const pp = Math.roundTo((pw / cw) * 100, 6);
		const { progress, progressFiller } = FileAudio;
		if (progress.percent !== pp) {
			progress.percent = pp;
			progressFiller.style.width = `${pp}%`;
		}

		const time = FileAudio.formatTime(currentTime);
		const currentTimeInfo = FileAudio.currentTimeInfo;
		if (currentTimeInfo.textContent !== time) {
			currentTimeInfo.textContent = time;
		}

		const canvas = FileAudio.canvas;
		const context = FileAudio.context;
		const width = canvas.width;
		const height = canvas.height;
		if (width * height === 0) {
			return;
		}
		const analyser = AudioManager.analyser!;
		const array = FileAudio.dataArray;
		const aLength = array.length;
		const start = Math.floor(aLength * 0.1);
		const end = Math.floor(aLength * 0.85);
		const step = (Math.PI * 2) / (end - start);
		const intervals = FileAudio.intervals;
		const intensities = FileAudio.intensities;
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
		const rotation = FileAudio.rotation - start * step;
		const MathCos = Math.cos;
		const MathSin = Math.sin;
		context.clearRect(0, 0, width, height);
		context.lineWidth = lineWidth;
		context.strokeStyle = FileAudio.lineColor;
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

		FileAudio.rotation -= (Math.PI * deltaTime) / 15000;
	};

	FileAudio.stopAnimation = function (this: typeof FileAudio) {
		Timer.removeUpdater!('sharedAnimation', this.updateAnimation);
	};

	FileAudio.themechange = function (this: typeof FileAudio, event: Event) {
		switch (event.value) {
			case 'light':
				this.lineColor = '#000000';
				break;
			case 'dark':
				this.lineColor = '#ffffff';
				break;
		}
	}.bind(FileAudio);

	FileAudio.windowResize = function (this: typeof FileAudio, event: Event) {
		if (FileAudio.target !== null && FileAudio.symbol === null) {
			FileAudio.updateCanvas();
		}
	};

	FileAudio.paramInput = function (this: typeof FileAudio, event: Event) {
		const read = getElementReader('fileAudio');
		const params = {
			volume: read('volume'),
			pan: read('pan'),
			dry: read('dry'),
			wet: read('wet')
		};
		this.updateParams!(params);
		this.updateParamInfos!(params);
	}.bind(FileAudio);

	FileAudio.progressPointerdown = function (this: typeof FileAudio, event: PointerEvent) {
		switch (event.button) {
			case 0: {
				const { audio } = AudioManager.player!;
				const { time } = FileAudio.pointer;
				if (time !== -1) {
					audio.currentTime = time;
				}
				break;
			}
		}
	};

	FileAudio.progressPointermove = function (this: typeof FileAudio, event: PointerEvent) {
		const { pointer, pointerTimeInfo } = FileAudio;
		const { duration } = AudioManager.player!.audio;
		if (!isNaN(duration)) {
			const pointerX = event.offsetX;
			const boxWidth = this.clientWidth;
			const ratio = pointerX / Math.max(boxWidth - 1, 1);
			const time = ratio * duration;
			pointer.time = time;
			pointer.style.left = `${pointerX}px`;
			show(pointer);
			pointerTimeInfo.textContent = FileAudio.formatTime(time);
			show(pointerTimeInfo);
			const infoWidth = pointerTimeInfo.clientWidth + 16;
			const infoX = Math.min(pointerX, boxWidth - infoWidth);
			pointerTimeInfo.style.left = `${infoX}px`;
		}
	};

	FileAudio.progressPointerleave = function (this: typeof FileAudio, event: PointerEvent) {
		const { pointer, pointerTimeInfo } = FileAudio;
		if (pointer.time !== -1) {
			pointer.time = -1;
			hide(pointer);
			hide(pointerTimeInfo);
		}
	};

	Inspector.fileAudio = FileAudio;
}
