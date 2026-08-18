import { createTypeRegistry } from '@ui-kit';
import { Data } from '@app/legacy/data/data-object.ts';
import { Attribute } from '@app/legacy/attribute/attribute-window.ts';
import { Enum } from '@app/legacy/enum/enum-window.ts';

export const TypeRegistry = createTypeRegistry({
	createEasingItems: () => Data.createEasingItems(),
	createTeamItems: () => Data.createTeamItems(),
	getAttributeItems: (filter: string, flag: string, unlinked: boolean) =>
		Attribute.getAttributeItems(filter, flag, unlinked),
	getStringItems: (filter: string, flag: boolean) => Enum.getStringItems(filter, flag)
});
