import { $ } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { File } from '@app/file/file-system-core.ts';
import { FileItem } from '@app/services/file-system/file-item.ts';
import type { FileMeta } from '@app/data/metadata-manifest.ts';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { Inspector } from '@app/inspector/inspector.ts';

{
	interface FileVideoInfo {
		name: string;
		size: string;
		duration: string;
		resolution: string;
		bitrate: string;
	}
	interface FileVideoShape {
		video: HTMLVideoElement | null;
		info: FileVideoInfo | null;
		update: (() => void) | null;
		[k: string]: unknown;
	}
	const FileVideo: FileVideoShape = {
		target: null,
		meta: null,
		symbol: null,
		info: null,
		video: null,
		initialize: null,
		open: null,
		close: null,
		play: null,
		update: null
	};

	FileVideo.initialize = function (this: typeof FileVideo) {};

	FileVideo.open = function (this: typeof FileVideo, file: FileItem, meta: FileMeta | null) {
		if (this.target !== file) {
			this.target = file;
			this.meta = meta;

			const size = Number((file.stats as unknown as { size: number }).size);
			this.info = {
				name: file.basename + file.extname,
				size: File.parseFileSize!(size),
				duration: '',
				resolution: '',
				bitrate: ''
			};
			this.update!();

			const video = this.video!;
			const path = file.path;
			video.src = File.route!(path);

			const symbol = (this.symbol = Symbol());
			void new Promise((resolve: (val: unknown) => void) => {
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
					this.info!.duration = formatTime(duration);
					this.info!.resolution = `${width} x ${height}`;
					this.info!.bitrate = `${bitrate}Kbps`;
					this.update!();
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
				void video.play();
			} else {
				video.currentTime = 0;
			}
		}
	};

	FileVideo.update = function (this: typeof FileVideo) {
		const el = $('#fileVideo');
		if (!el) return;
		(el as HTMLElement & { update?: () => void }).update?.();
	};

	Inspector.fileVideo = FileVideo;
}
