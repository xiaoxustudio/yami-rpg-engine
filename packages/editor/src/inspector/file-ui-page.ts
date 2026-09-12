/* oxlint-disable eslint/no-restricted-properties */
import { inspectorEls } from './element-registry.ts';
import { addClass, read, removeClass } from '@app/utils/element-utils';
import { Data } from '@app/data/data-object.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { UI } from '@app/ui/ui-window.ts';

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
		if (!inspectorEls.get('ui-switch-settings')) return;
		this.button = inspectorEls.get('ui-switch-settings') as HTMLElement;
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

			(inspectorEls.get('fileUI-vue-mount') as HTMLElement & { sync?: () => void })?.sync?.();
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
		const target = event?.target ?? document.activeElement;
		let element = target;
		while (element instanceof Element) {
			if (new RegExp('^fileUI-').test(element.id)) break;
			element = element.parentElement;
		}
		FileUI.update!(
			FileUI.target as FileUIData,
			Inspector.getKey!(element as HTMLElement),
			read(element as HTMLElement)
		);
	};

	Inspector.fileUI = FileUI;
}
