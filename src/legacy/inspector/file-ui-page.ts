import { $, getElementWriter } from '@/util/dom.ts';
import { addClass, read, removeClass } from '@/util/element-utils';
import { Data } from '@/data/data-object.ts';
import { Inspector } from './inspector.ts';
import { UI } from '@/ui/ui-window.ts';

{
	const FileUI = {
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

	FileUI.initialize = function () {
		if (!$('#ui-switch-settings')) return;
		this.button = $('#ui-switch-settings');
		this.owner = {
			setTarget: (target) => {
				if (this.target !== target) {
					Inspector.open('fileUI', target);
				}
			},
			planToSave: () => {
				UI.planToSave();
			},
			get history() {
				return UI.history;
			}
		};

		const elements = $('#fileUI-width, #fileUI-height');
		elements.on('input', this.paramInput);
		elements.on('focus', Inspector.inputFocus);
		elements.on('blur', Inspector.inputBlur(this, this.owner));
	};

	FileUI.create = function () {
		const { resolution } = Data.config;
		return {
			width: resolution.width,
			height: resolution.height,
			nodes: []
		};
	};

	FileUI.open = function (ui) {
		if (this.target !== ui) {
			this.target = ui;

			addClass(this.button, 'selected');

			const write = getElementWriter('fileUI', ui);
			write('width');
			write('height');
		}
	};

	FileUI.close = function () {
		if (this.target) {
			this.target = null;

			removeClass(this.button, 'selected');
		}
	};

	FileUI.update = function (ui, key, value) {
		UI.planToSave();
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

	FileUI.paramInput = function (event) {
		FileUI.update(FileUI.target, Inspector.getKey(this), read(this));
	};

	Inspector.fileUI = FileUI;
}
