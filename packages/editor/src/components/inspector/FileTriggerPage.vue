<template>
	<FileTriggerPropertiesSection />
	<FileTriggerAnimationSection />
	<FileTriggerMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { useFileTriggerPage } from '@app/composables/useFileTriggerPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import { fileTriggerContextKey } from './file-trigger/context.ts';
import FileTriggerPropertiesSection from './file-trigger/FileTriggerPropertiesSection.vue';
import FileTriggerAnimationSection from './file-trigger/FileTriggerAnimationSection.vue';
import FileTriggerMetaSection from './file-trigger/FileTriggerMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileTriggerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileTriggerContextKey, { form, onParamInput });

onMounted(() => {
	const editor = Inspector.fileTrigger;
	if (!editor) return;
	const el = inspectorEls.get('fileTrigger-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	sync();
});
</script>
