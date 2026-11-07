/**
 * 变量窗口的骨架节点表。
 *
 * 节点分布在 `Variable.vue`（窗口 / 列表 / 搜索框）与 `variable/VariablePropertiesSection.vue`
 * （名称 / 备注 / 属性面板 / 三种值控件）；`variable/variable.ts` 读表，`pick` 带 id 兜底。
 */
import { createSkeletonTable } from './skeleton-table';

export type VariableNodeKey =
	| 'root'
	| 'list'
	| 'searcher'
	| 'name'
	| 'note'
	| 'properties'
	| 'valueBox'
	| 'valueNumber'
	| 'valueString';

export const variableNodes = createSkeletonTable<VariableNodeKey>({
	root: 'variable',
	list: 'variable-list',
	searcher: 'variable-searcher',
	name: 'variable-name',
	note: 'variable-note',
	properties: 'variable-properties-flex',
	valueBox: 'variable-value-box',
	valueNumber: 'variable-value-number',
	valueString: 'variable-value-string'
});
