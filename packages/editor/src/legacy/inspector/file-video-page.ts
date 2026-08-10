import { $ } from '@/util/dom.ts';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { File } from '@/file/file-system-core.ts';
import { FileItem } from '@/file/file-item.ts';
import type { FileMeta } from '@/data/metadata-manifest.ts';
import { AudioManager } from '@/audio/audio-manager.ts';
import { Inspector } from './inspector.ts';

{
	interface FileVideoShape {
		video: HTMLVideoElement | null;
		windowError: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	const FileVideo: FileVideoShape = {
		target: null,
		meta: null,
		symbol: null,
		video: null,
		initialize: null,
		open: null,
		close: null,
		play: null,
		windowError: null
	};

	FileVideo.initialize = function (this: typeof FileVideo) {
		if (!$('#fileVideo-video')) return;
		this.video = $('#fileVideo-video') as HTMLVideoElement;

		window.addEventListener('error', this.windowError!);
	};

	FileVideo.open = function (this: typeof FileVideo, file: FileItem, meta: FileMeta | null) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const elName = $('#fileVideo-name');
			const elSize = $('#fileVideo-size');
			const elDuration = $('#fileVideo-duration');
			const elResolution = $('#fileVideo-resolution');
			const elBitrate = $('#fileVideo-bitrate');
			const size = Number((file.stats as unknown as { size: number }).size);
			elName.textContent = file.basename + file.extname;
			elSize.textContent = File.parseFileSize!(size);
			elDuration.textContent = '';
			elResolution.textContent = '';
			elBitrate.textContent = '';

			const video = this.video!;
			const path = file.path;
			video.src = File.route!(path);

			const symbol = (this.symbol = Symbol());
			new Promise((resolve: (val: unknown) => void) => {
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

	FileVideo.close = function (this: typeof FileVideo) {
		if (this.target) {
			getBrowserInstance()?.unselect?.(this.meta);
			this.target = null;
			this.meta = null;
			this.symbol = null;
			this.video!.src = '';
		}
	};

	FileVideo.play = function (this: typeof FileVideo) {
		if (this.target !== null) {
			AudioManager.player!.stop();
			const video = this.video!;
			if (video.paused) {
				video.play();
			} else {
				video.currentTime = 0;
			}
		}
	};

	FileVideo.windowError = function (this: typeof FileVideo, event: Event) {
		if ((event as ErrorEvent).message === 'ResizeObserver loop limit exceeded') {
			event.stopImmediatePropagation();
		}
	};

	Inspector.fileVideo = FileVideo;
}
