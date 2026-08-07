import { $, getElementReader } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { addClass, hasClass, hide, removeClass, show, write } from '@/util/element-utils';
import { AudioManager } from '@/audio/audio-manager.ts';
import { File } from '@/file/file-system-core.ts';
import { Inspector } from './inspector.ts';
import { Timer } from '@/util/timer.ts';

{
	const FileAudio = {
		target: null as any,
		meta: null as any,
		symbol: null as any,
		promise: null as any,
		progress: null as any,
		progressFiller: null as any,
		pointer: null as any,
		currentTimeInfo: null as any,
		pointerTimeInfo: null as any,
		canvas: null as any,
		context: null as any,
		dataArray: null as any,
		intervals: null as any,
		intensities: null as any,
		rotation: null as any,
		lineColor: null as any,
		initialize: null as any,
		open: null as any,
		close: null as any,
		play: null as any,
		writeParams: null as any,
		updateParams: null as any,
		updateParamInfos: null as any,
		updateCanvas: null as any,
		formatTime: null as any,
		requestAnimation: null as any,
		updateAnimation: null as any,
		stopAnimation: null as any,
		themechange: null as any,
		windowResize: null as any,
		paramInput: null as any,
		progressPointerdown: null as any,
		progressPointermove: null as any,
		progressPointerleave: null as any
	};

	FileAudio.initialize = function (this: any) {
		if (!$('#fileAudio-progress')) return;
		this.progress = $('#fileAudio-progress');
		this.progressFiller = $('#fileAudio-progress-filler');
		this.pointer = hide($('#fileAudio-progress-pointer'));
		this.currentTimeInfo = $('#fileAudio-currentTime');
		this.pointerTimeInfo = $('#fileAudio-pointerTime');
		this.canvas = $('#fileAudio-frequency-canvas');
		this.context = this.canvas.getContext('2d', { desynchronized: true });

		const analyser = AudioManager.analyser!;
		analyser.fftSize = 512;
		analyser.smoothingTimeConstant = 0;

		this.dataArray = new Uint8Array(analyser.frequencyBinCount);

		this.intervals = new Float64Array(64);

		this.intensities = new Float64Array(64);
		this.intensities.index = 0;

		window.addEventListener('themechange', this.themechange);
		$('#fileAudio').addEventListener('resize', this.windowResize);
		$('#fileAudio-frequency-detail').addEventListener('toggle', this.windowResize);
		$('#fileAudio-volume').addEventListener('input', this.paramInput);
		$('#fileAudio-pan').addEventListener('input', this.paramInput);
		$('#fileAudio-dry').addEventListener('input', this.paramInput);
		$('#fileAudio-wet').addEventListener('input', this.paramInput);
		this.progress.addEventListener('pointerdown', this.progressPointerdown);
		this.progress.addEventListener('pointermove', this.progressPointermove);
		this.progress.addEventListener('pointerleave', this.progressPointerleave);
	};

	FileAudio.open = function (this: any, file: any, meta: any) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileAudio-name');
			const elSize = $('#fileAudio-size');
			const elDuration = $('#fileAudio-duration');
			const elBitrate = $('#fileAudio-bitrate');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);
			elDuration.textContent = '';
			elBitrate.textContent = '';

			this.writeParams!(AudioManager.player!.getParams());

			const audio = AudioManager.player!.audio;
			const path = file.path;
			if (audio.path !== path) {
				audio.path = path;
				audio.src = File.route!(path);

				removeClass(this.progress, 'visible');
				// 保留对返回的原始promise的引用 以便可以取消解码音频数据的操作
				const promise = (this.promise = AudioManager.getWaveform!(meta.guid));
				promise.then((url: any) => {
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
			new Promise<void>((resolve: any) => {
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
					elDuration.textContent = this.formatTime!(duration);
					elBitrate.textContent = `${bitrate}Kbps`;
				}
			});
		}
	};

	FileAudio.close = function (this: any) {
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

	FileAudio.play = function (this: any) {
		if (this.target !== null) {
			const { audio } = AudioManager.player!;
			if (audio.paused) {
				audio.play();
			} else {
				audio.currentTime = 0;
			}
		}
	};

	FileAudio.writeParams = function (this: any, params: any) {
		write($('#fileAudio-volume'), params.volume);
		write($('#fileAudio-pan'), params.pan);
		write($('#fileAudio-dry'), params.dry);
		write($('#fileAudio-wet'), params.wet);
		this.updateParamInfos!(params);
	};

	FileAudio.updateParams = function (this: any, params: any) {
		AudioManager.player!.setVolume(params.volume);
		AudioManager.player!.setPan(params.pan);
		AudioManager.player!.setReverb(params.dry, params.wet);
	};

	FileAudio.updateParamInfos = function (this: any, params: any) {
		$('#fileAudio-volume-info').textContent = `${params.volume * 100}%`;
		$('#fileAudio-pan-info').textContent = `${params.pan * 100}%`;
		$('#fileAudio-dry-info').textContent = `${params.dry * 100}%`;
		$('#fileAudio-wet-info').textContent = `${params.wet * 100}%`;
	};

	FileAudio.updateCanvas = function (this: any) {
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

	FileAudio.formatTime = function (this: any, time: any) {
		const pad = Number.padZero;
		const length = Math.floor(time);
		const hours = Math.floor(length / 3600);
		const minutes = Math.floor(length / 60) % 60;
		const seconds = length % 60;
		return hours
			? `${hours}:${pad(minutes, 60)}:${pad(seconds, 60)}`
			: `${minutes}:${pad(seconds, 60)}`;
	};

	FileAudio.requestAnimation = function (this: any) {
		if (this.target !== null) {
			Timer.appendUpdater!('sharedAnimation', this.updateAnimation);
		}
	};

	FileAudio.updateAnimation = function (this: any, deltaTime: any) {
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
			// 取最近150ms的强度平均值(平滑过渡)
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

	FileAudio.stopAnimation = function (this: any) {
		Timer.removeUpdater!('sharedAnimation', this.updateAnimation);
	};

	FileAudio.themechange = function (this: any, event: any) {
		switch (event.value) {
			case 'light':
				this.lineColor = '#000000';
				break;
			case 'dark':
				this.lineColor = '#ffffff';
				break;
		}
	}.bind(FileAudio);

	FileAudio.windowResize = function (this: any, event: any) {
		if (FileAudio.target !== null && FileAudio.symbol === null) {
			FileAudio.updateCanvas();
		}
	};

	FileAudio.paramInput = function (this: any, event: any) {
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

	FileAudio.progressPointerdown = function (this: any, event: any) {
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

	FileAudio.progressPointermove = function (this: any, event: any) {
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

	FileAudio.progressPointerleave = function (this: any, event: any) {
		const { pointer, pointerTimeInfo } = FileAudio;
		if (pointer.time !== -1) {
			pointer.time = -1;
			hide(pointer);
			hide(pointerTimeInfo);
		}
	};

	Inspector.fileAudio = FileAudio;
}
