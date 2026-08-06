import { $ } from '@/util/dom.ts';
import { File } from '@/file/file-system-core.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Inspector } from './inspector.ts';

{
	const FileVideo = {
		target: null as any,
		meta: null as any,
		symbol: null as any,
		video: null as any,
		initialize: null as any,
		open: null as any,
		close: null as any,
		play: null as any,
		windowError: null as any
	};

	FileVideo.initialize = function (this: any) {
		if (!$('#fileVideo-video')) return;
		this.video = $('#fileVideo-video');

		window.addEventListener('error', this.windowError);
	};

	FileVideo.open = function (this: any, file: any, meta: any) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileVideo-name');
			const elSize = $('#fileVideo-size');
			const elDuration = $('#fileVideo-duration');
			const elResolution = $('#fileVideo-resolution');
			const elBitrate = $('#fileVideo-bitrate');
			const size = Number(file.stats.size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);
			elDuration.textContent = '';
			elResolution.textContent = '';
			elBitrate.textContent = '';

			const video = this.video;
			const path = file.path;
			video.src = File.route!(path);

			const symbol = (this.symbol = Symbol());
			new Promise((resolve: any) => {
				video.addEventListener(
					'loadedmetadata',
					() => {
						resolve(video);
					},
					{ once: true }
				);
			}).then(() => {
				if (this.symbol === symbol) {
					this.symbol = null;
					const duration = video.duration;
					const width = video.videoWidth;
					const height = video.videoHeight;
					const bitrate = Math.round(size / 128 / duration);
					const formatTime = Inspector.fileAudio.formatTime;
					elDuration.textContent = formatTime(duration);
					elResolution.textContent = `${width} x ${height}`;
					elBitrate.textContent = `${bitrate}Kbps`;
				}
			});
		}
	};

	FileVideo.close = function (this: any) {
		if (this.target) {
			(window as any).Browser?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.video.src = '';
		}
	};

	FileVideo.play = function (this: any) {
		if (this.target !== null) {
			AudioManager.player!.stop();
			const { video } = this;
			if (video.paused) {
				video.play();
			} else {
				video.currentTime = 0;
			}
		}
	};

	FileVideo.windowError = function (this: any, event: any) {
		if (event.message === 'ResizeObserver loop limit exceeded') {
			event.stopImmediatePropagation();
		}
	};

	Inspector.fileVideo = FileVideo;
}
