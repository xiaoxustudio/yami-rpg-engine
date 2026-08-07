import { $, getElementWriter } from '@/util/dom.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Inspector } from './inspector.ts';
import { read, write } from '@/util/element-utils.ts';

{
	const AnimMotion = {
		owner: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		createDir: null as any,
		open: null as any,
		close: null as any,
		write: null as any,
		update: null as any,
		paramInput: null as any
	};

	AnimMotion.initialize = function (this: any) {
		if (!$('#animMotion-mode')) return;
		this.owner = {
			setTarget: (motion: any) => {
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

		const elMode = $('#animMotion-mode');
		const elements = document.querySelectorAll(
			'#animMotion-skip, #animMotion-loop, #animMotion-loopStart'
		);
		elMode.addEventListener('input', this.paramInput);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, Animation))
		);
	};

	AnimMotion.create = function (this: any, motionId: any) {
		return {
			class: 'motion',
			id: motionId,
			mode: '1-dir',
			skip: false,
			loop: false,
			loopStart: 0,
			dirCases: [this.createDir()]
		};
	};

	AnimMotion.createDir = function (this: any) {
		return { layers: [] };
	};

	AnimMotion.open = function (this: any, motion: any) {
		if (this.target !== motion) {
			this.target = motion;

			const write = getElementWriter('animMotion', motion);
			write('mode');
			write('skip');
			write('loop');
			write('loopStart');
		}
	};

	AnimMotion.close = function (this: any) {
		if (this.target) {
			// 此处不能unselect并update Animation.list.unselect(this.target) Animation.updateTarget!()
			this.target = null;
		}
	};

	AnimMotion.write = function (this: any, options: any) {
		if (options.mode !== undefined) {
			write($('#animMotion-mode'), options.mode);
		}
	};

	AnimMotion.update = function (this: any, motion: any, key: any, value: any) {
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
					Animation.list.updateLoopIcon(motion);
				}
				break;
		}
	};

	AnimMotion.paramInput = function (this: any, event: any) {
		AnimMotion.update(AnimMotion.target, Inspector.getKey!(this), read(this));
	};

	Inspector.animMotion = AnimMotion;
}
