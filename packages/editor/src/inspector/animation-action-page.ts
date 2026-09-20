import { inspectorEls } from './element-registry.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { write } from '@app/utils/element-utils.ts';

{
	interface AnimMotionShape {
		target: Record<string, unknown> | null;
		create: ((motionId: string) => Record<string, unknown>) | null;
		createDir: (() => Record<string, unknown>) | null;
		open: ((motion: Record<string, unknown>) => void) | null;
		close: (() => void) | null;
		write: ((options: Record<string, unknown>) => void) | null;
		update: ((motion: Record<string, unknown>, key: string, value: unknown) => void) | null;
		[k: string]: unknown;
	}
	const AnimMotion: AnimMotionShape = {
		owner: null,
		target: null,
		initialize: null,
		create: null,
		createDir: null,
		open: null,
		close: null,
		write: null,
		update: null
	};

	AnimMotion.initialize = function (this: typeof AnimMotion) {};

	AnimMotion.create = function (this: typeof AnimMotion, motionId: string) {
		return {
			class: 'motion',
			id: motionId,
			mode: '1-dir',
			skip: false,
			loop: false,
			loopStart: 0,
			dirCases: [this.createDir!()]
		};
	};

	AnimMotion.createDir = function (this: typeof AnimMotion) {
		return { layers: [] };
	};

	AnimMotion.open = function (this: typeof AnimMotion, motion: Record<string, unknown>) {
		if (this.target !== motion) {
			this.target = motion;
			(
				inspectorEls.get('animMotion-vue-mount') as HTMLElement & {
					sync?: () => void;
				}
			)?.sync?.();
		}
	};

	AnimMotion.close = function (this: typeof AnimMotion) {
		if (this.target) {
			// 濠殿喗绺块崐鏇⑺囬埡鍌溾枖鐎广儱鐗嗛崢纾歯select濡ょ姷鍋熼～鐖宒ate Animation.list.unselect(this.target) Animation.updateTarget!()
			this.target = null;
		}
	};

	AnimMotion.write = function (this: typeof AnimMotion, options: Record<string, unknown>) {
		if (options.mode !== undefined) {
			write(inspectorEls.get('animMotion-mode'), options.mode);
		}
	};

	AnimMotion.update = function (
		this: typeof AnimMotion,
		motion: Record<string, unknown>,
		key: string,
		value: unknown
	) {
		Animation.planToSave!();
		switch (key) {
			case 'mode':
				if (motion.mode !== value) {
					Animation.setMotionMode!(value);
					Animation.createDirItems!();
				}
				break;
			case 'skip':
			case 'loopStart':
				if (motion[key] !== value) {
					motion[key] = value;
				}
				break;
			case 'loop':
				if (motion.loop !== value) {
					motion.loop = value;
					Animation.list.update();
				}
				break;
		}
	};

	Inspector.animMotion = AnimMotion;
}
