import { getUIStore } from '@app/stores/ui';

export interface UIOwnerShape {
	history: unknown;
	setTarget(target: unknown, meta?: unknown): void;
	planToSave(): void;
}

export const UIOwner: UIOwnerShape = {
	setTarget: (target: unknown, meta?: unknown) => {
		void meta;
		getUIStore().setTarget(target as never);
	},
	planToSave: () => {
		getUIStore().planToSave();
	},
	history: undefined
};

Object.defineProperty(UIOwner, 'history', {
	get: () => getUIStore().history,
	configurable: true
});
