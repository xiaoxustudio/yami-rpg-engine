<template>
	<FileActorPropertiesSection />
	<FileActorMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import { fileActorContextKey } from './file-actor/context.ts';
import FileActorPropertiesSection from './file-actor/FileActorPropertiesSection.vue';
import FileActorMetaSection from './file-actor/FileActorMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileActorPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileActorContextKey, { form, onParamInput });

onMounted(() => {
	const editor = Inspector.fileActor;
	if (!editor) return;
	const el = inspectorEls.get('fileActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
#fileActor-inventory-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-inventory-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
