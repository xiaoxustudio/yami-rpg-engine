import { TreeDataContext as YMTreeDataContext } from '@ui-kit';
import { Local } from '@/tools/localization.ts';

export class TreeDataContext extends YMTreeDataContext {
	constructor(data: Record<string, unknown>, keysField: string) {
		super(
			data,
			keysField,
			Local as unknown as {
				language: string;
				get(key: string): string;
				createGetter(key: string): (key: string) => string;
			}
		);
	}
}
