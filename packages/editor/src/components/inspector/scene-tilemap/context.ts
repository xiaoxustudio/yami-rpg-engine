import type { InjectionKey } from 'vue';
import type { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';

type SceneTilemapForm = ReturnType<typeof useSceneTilemapPage>['form'];

export interface SceneTilemapContext {
	form: SceneTilemapForm;
	onParamInput: (value: unknown) => void;
}

export const sceneTilemapContextKey: InjectionKey<SceneTilemapContext> =
	Symbol('scene-tilemap-context');
