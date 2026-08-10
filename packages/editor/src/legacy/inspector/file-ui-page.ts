import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, read, removeClass } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	interface FileUIShape {
		button: HTMLElement | null;
		owner: unknown;
		target: FileUIData | null;
		update: ((ui: FileUIData, key: string, value: unknown) => void) | null;
		paramInput: ((event: Event) => void) | null;
		[k: string]: unknown;
	}
	interface FileUIData {
		width: number;
		height: number;
		setSize(width: number, height: number): void;
		[k: string]: unknown;
	}
	const FileUI: FileUIShape = {
		button: null,
		owner: null,
		target: null,
		initialize: null,
		create: null,
		open: null,
		close: null,
		update: null,
		paramInput: null
	};

	FileUI.initialize = function (this: typeof FileUI) {
		if (!$('#ui-switch-settings')) return;
		this.button = $('#ui-switch-settings');
		this.owner = {
			setTarget: (target: Record<string, unknown>) => {
				if (this.target !== target) {
					Inspector.open!('fileUI', target);
				}
			},
			planToSave: () => {
				UI.planToSave!();
			},
			get history() {
				return UI.history;
			}
		};

		const elements = document.querySelectorAll('#fileUI-width, #fileUI-height');
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('input', this.paramInput!)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.inputFocus)
		);
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, this.owner))
		);
	};

	FileUI.create = function (this: typeof FileUI) {
		const { resolution } = Data.config;
		return {
			width: resolution.width,
			height: resolution.height,
			nodes: []
		};
	};

	FileUI.open = function (this: typeof FileUI, ui: FileUIData) {
		if (this.target !== ui) {
			this.target = ui;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileUI', ui);
			write('width');
			write('height');
		}
	};

	FileUI.close = function (this: typeof FileUI) {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
		}
	};

	FileUI.update = function (this: typeof FileUI, ui: FileUIData, key: string, value: unknown) {
		UI.planToSave!();
		switch (key) {
			case 'width':
				if (ui.width !== value) {
					ui.setSize(value as number, ui.height);
				}
				break;
			case 'height':
				if (ui.height !== value) {
					ui.setSize(ui.width, value as number);
				}
				break;
		}
	};

	FileUI.paramInput = function (this: typeof FileUI, event: Event) {
		FileUI.update!(FileUI.target as FileUIData, Inspector.getKey!(this), read(this));
	};

	Inspector.fileUI = FileUI;
}
