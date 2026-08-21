import { createTypeRegistry } from '@ui-kit';
import { Data } from '@app/data/data-object.ts';
import { Attribute } from '@app/attribute/attribute-window.ts';
import { Enum } from '@app/enum/enum-window.ts';

export const TypeRegistry = createTypeRegistry({
	createEasingItems: () => Data.createEasingItems(),
	createTeamItems: () => Data.createTeamItems(),
	getAttributeItems: (filter: string, flag: string, unlinked: boolean) =>
		Attribute.getAttributeItems(filter, flag, unlinked),
	getStringItems: (filter: string, flag: boolean) => Enum.getStringItems(filter, flag)
});
