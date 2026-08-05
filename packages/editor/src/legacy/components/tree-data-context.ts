import { TreeDataContext as YMTreeDataContext } from '@ui-kit';
import { Local } from '@/tools/localization.ts';

export class TreeDataContext extends YMTreeDataContext {
	constructor(data: any, keysField: any) {
		super(data, keysField, Local);
	}
}
