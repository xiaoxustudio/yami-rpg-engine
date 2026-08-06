import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, read, removeClass } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const FileUI = {
		button: null as any,
		owner: null as any,
		target: null as any,
		initialize: null as any,
		create: null as any,
		open: null as any,
		close: null as any,
		update: null as any,
		paramInput: null as any
	};

	FileUI.initialize = function (this: any) {
		if (!$('#ui-switch-settings')) return;
		this.button = $('#ui-switch-settings');
		this.owner = {
			setTarget: (target: any) => {
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

		const elements = $('#fileUI-width, #fileUI-height');
		elements.forEach((el: HTMLElement) => el.addEventListener('input', this.paramInput!));
		elements.forEach((el: HTMLElement) => el.addEventListener('focus', Inspector.inputFocus));
		elements.forEach((el: HTMLElement) =>
			el.addEventListener('blur', Inspector.inputBlur!(this, this.owner))
		);
	};

	FileUI.create = function (this: any) {
		const { resolution } = Data.config;
		return {
			width: resolution.width,
			height: resolution.height,
			nodes: []
		};
	};

	FileUI.open = function (this: any, ui: any) {
		if (this.target !== ui) {
			this.target = ui;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileUI', ui);
			write('width');
			write('height');
		}
	};

	FileUI.close = function (this: any) {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
		}
	};

	FileUI.update = function (this: any, ui: any, key: any, value: any) {
		UI.planToSave!();
		switch (key) {
			case 'width':
				if (ui.width !== value) {
					ui.setSize(value, ui.height);
				}
				break;
			case 'height':
				if (ui.height !== value) {
					ui.setSize(ui.width, value);
				}
				break;
		}
	};

	FileUI.paramInput = function (this: any, event: any) {
		FileUI.update!(FileUI.target, Inspector.getKey!(this), read(this));
	};

	Inspector.fileUI = FileUI;
}
