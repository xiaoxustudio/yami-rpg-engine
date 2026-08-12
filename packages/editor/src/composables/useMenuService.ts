import { inject, provide, type InjectionKey } from 'vue';

export interface MenuService {
	getState(): string;
}

export const MENU_SERVICE_KEY: InjectionKey<MenuService> = Symbol('menu-service');

export function provideMenuService(service: MenuService): void {
	provide(MENU_SERVICE_KEY, service);
}

export function useMenuService(): MenuService {
	return inject(MENU_SERVICE_KEY, { getState: () => 'closed' });
}
