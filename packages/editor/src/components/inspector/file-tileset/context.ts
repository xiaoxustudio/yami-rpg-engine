import type { InjectionKey } from 'vue';
import type { useFileTilesetPage } from '@app/composables/useFileTilesetPage';

type FileTilesetForm = ReturnType<typeof useFileTilesetPage>['form'];

/** fileTileset 表单拆段后，容器向 General 段注入的共享上下文。 */
export interface FileTilesetContext {
	form: FileTilesetForm;
	onParamInput: (value: unknown) => void;
}

export const fileTilesetContextKey: InjectionKey<FileTilesetContext> =
	Symbol('file-tileset-context');
