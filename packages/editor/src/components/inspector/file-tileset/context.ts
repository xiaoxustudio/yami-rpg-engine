import type { InjectionKey } from 'vue';
import type { useFileTilesetPage } from '@app/composables/useFileTilesetPage';

type FileTilesetForm = ReturnType<typeof useFileTilesetPage>['form'];

export interface FileTilesetContext {
	form: FileTilesetForm;
	onParamInput: (value: unknown) => void;
}

export const fileTilesetContextKey: InjectionKey<FileTilesetContext> =
	Symbol('file-tileset-context');
