import { useIfBranchSchema } from '@app/composables/useIfBranchSchema';
import type { IfBranchData, IfBranchShape } from '@app/composables/useIfBranchSchema';

export type { IfBranchData, IfBranchShape };
export const IfBranch = useIfBranchSchema();
