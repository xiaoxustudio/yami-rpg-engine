import type { InjectionKey } from 'vue';
import type { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';

type SceneTilemapForm = ReturnType<typeof useSceneTilemapPage>['form'];

/** sceneTilemap 表单拆段后，容器向 Properties 段注入的共享上下文。 */
export interface SceneTilemapContext {
	form: SceneTilemapForm;
	onParamInput: (value: unknown) => void;
}

export const sceneTilemapContextKey: InjectionKey<SceneTilemapContext> =
	Symbol('scene-tilemap-context');
