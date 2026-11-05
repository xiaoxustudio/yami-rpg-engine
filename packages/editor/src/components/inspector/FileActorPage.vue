<template>
	<FileActorPropertiesSection />
	<FileActorMetaSection />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide } from 'vue';
import { Inspector } from '@app/inspector/inspector.ts';
import { useFileActorPage } from '@app/composables/useFileActorPage';
import {
	provideFileActorPage,
	resetFileActorPage,
	type FileActorPageApi
} from '@app/composables/file-actor-page-bridge';
import { fileActorContextKey } from './file-actor/context.ts';
import FileActorPropertiesSection from './file-actor/FileActorPropertiesSection.vue';
import FileActorMetaSection from './file-actor/FileActorMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileActorPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileActorContextKey, { form, onParamInput });

const bridgeApi: FileActorPageApi = { sync };

onMounted(() => {
	const editor = Inspector.fileActor;
	if (!editor) return;
	provideFileActorPage(bridgeApi);
	onUnmounted(() => resetFileActorPage(bridgeApi));
	sync();
});
</script>

<style>
#fileActor-inventory-confirm {
	right: 108px;
	bottom: 10px;
}

#fileActor-inventory-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
