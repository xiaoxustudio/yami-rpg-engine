import { uiSlotsMembers } from './ui-slots.ts';
import { uiInitializeMembers } from './ui-initialize.ts';
import { uiListMembers } from './ui-list.ts';
import { uiPrefabMembers } from './ui-prefab.ts';
import { uiTransformMembers } from './ui-transform.ts';
import { uiFileMembers } from './ui-file.ts';
import { uiEventsMembers } from './ui-events.ts';
import { uiPointerMembers } from './ui-pointer.ts';
import type { UIShape } from './ui-singleton.ts';

export const uiMembers = {
	...uiSlotsMembers,
	...uiInitializeMembers,
	...uiListMembers,
	...uiPrefabMembers,
	...uiTransformMembers,
	...uiFileMembers,
	...uiEventsMembers,
	...uiPointerMembers
};

/** 装配入口：`ui-window.ts` 在 UI 诞生处调用它（动态 import 之后）。 */
export function attachUiMembers(target: UIShape): void {
	Object.assign(target, uiMembers);
}
