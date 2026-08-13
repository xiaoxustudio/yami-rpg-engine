import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { read, write } from '@/util/element-utils.ts';

{
	interface AnimMotionShape {
		target: Record<string, unknown> | null;
		create: ((motionId: string) => Record<string, unknown>) | null;
		createDir: (() => Record<string, unknown>) | null;
		open: ((motion: Record<string, unknown>) => void) | null;
		close: (() => void) | null;
		write: ((options: Record<string, unknown>) => void) | null;
		update: ((motion: Record<string, unknown>, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
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
		update: null,
		paramInput: null
	};

	AnimMotion.initialize = function (this: typeof AnimMotion) {
		if (!$('#animMotion-mode')) return;
		this.owner = {
			setTarget: (motion: Record<string, unknown>) => {
				Animation.setMotion!(motion);
				Inspector.open!('animMotion', motion);
			}
		};

		$('#animMotion-mode').loadItems([
			{ name: '1 Directional', value: '1-dir' },
			{ name: '2 Directional', value: '2-dir' },
			{ name: '4 Directional', value: '4-dir' },
			{ name: '8 Directional', value: '8-dir' },
			{ name: '1 Directional - Mirror', value: '1-dir-mirror' },
			{ name: '2 Directional - Mirror', value: '2-dir-mirror' },
			{ name: '3 Directional - Mirror', value: '3-dir-mirror' },
			{ name: '5 Directional - Mirror', value: '5-dir-mirror' }
		]);

		$('#animMotion-loop').relate([$('#animMotion-loopStart')]);

		const elements = document.querySelectorAll(
			'#animMotion-skip, #animMotion-loop, #animMotion-loopStart'
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Animation))
		);
	};

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

			const write = getElementWriter('animMotion', motion);
			write('mode');
			write('skip');
			write('loop');
			write('loopStart');
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
			write($('#animMotion-mode'), options.mode);
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

	AnimMotion.paramInput = function (this: typeof AnimMotion, event: Event) {
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^animMotion-').test(element.id)) break;
			element = element.parentElement;
		}
		AnimMotion.update!(
			AnimMotion.target as Record<string, unknown>,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.animMotion = AnimMotion;
}
