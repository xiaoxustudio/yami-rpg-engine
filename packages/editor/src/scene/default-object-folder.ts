import { reactive } from 'vue';
import { Window } from '@app/tools/window-object.ts';
import { Editor } from '@app/services/project/editor.ts';

export interface ObjectFolderForm {
	tilemap: string;
	actor: string;
	region: string;
	light: string;
	animation: string;
	particle: string;
	parallax: string;
}

const form = reactive<ObjectFolderForm>({
	tilemap: '',
	actor: '',
	region: '',
	light: '',
	animation: '',
	particle: '',
	parallax: ''
});

export const ObjectFolder: {
	form: ObjectFolderForm;
	initialize: (() => void) | null;
	open: (() => void) | null;
	confirm: ((event: Event) => void) | null;
} = {
	form,
	initialize: null,
	open: null,
	confirm: null
};

ObjectFolder.initialize = function (this: typeof ObjectFolder) {};

ObjectFolder.open = function (this: typeof ObjectFolder) {
	Window.open!('object-folder');
	const data = (Editor.project!.scene as { defaultFolders: Record<string, unknown> })
		.defaultFolders;
	Object.assign(form, {
		tilemap: data.tilemap ?? '',
		actor: data.actor ?? '',
		region: data.region ?? '',
		light: data.light ?? '',
		animation: data.animation ?? '',
		particle: data.particle ?? '',
		parallax: data.parallax ?? ''
	} as ObjectFolderForm);
};

ObjectFolder.confirm = function (this: typeof ObjectFolder, _event: Event) {
	(Editor.project!.scene as { defaultFolders: Record<string, unknown> }).defaultFolders = {
		tilemap: form.tilemap,
		actor: form.actor,
		region: form.region,
		light: form.light,
		animation: form.animation,
		particle: form.particle,
		parallax: form.parallax
	};
	Window.close!('object-folder');
};
