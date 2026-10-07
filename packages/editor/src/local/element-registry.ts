import { composableEls } from '@app/composables/element-registry';
import { createElementRegistry } from '@app/utils/element-registry';

export const localEls = createElementRegistry(composableEls);
