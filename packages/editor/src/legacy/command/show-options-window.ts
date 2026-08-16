import { useChoicesSchema } from '@app/composables/useChoicesSchema';
import type { ChoicesForm, ChoicesData, ChoicesShape } from '@app/composables/useChoicesSchema';

export type { ChoicesForm, ChoicesData, ChoicesShape };
export const Choices = useChoicesSchema();
