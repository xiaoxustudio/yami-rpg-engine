<template>
	<div
		class="page-frame"
		id="inspector"
		:ref="registryRef(inspectorEls, 'inspector')"
		value="inspector"
	>
		<PageManager
			id="inspector-page-manager"
			:ref="registryRef(inspectorEls, 'inspector-page-manager')"
			tabindex="-1"
		>
			<div
				v-for="frame in inspectorMountFrames"
				:key="frame.value"
				class="page-frame"
				:id="frame.id"
				:value="frame.value"
				:ref="frameRef(frame)"
			></div>
		</PageManager>
	</div>
</template>

<script setup lang="ts">
import { composableEls } from '@app/composables/element-registry';
import { inspectorEls } from '@app/inspector/element-registry';
import { registryRef } from '@app/utils/element-registry';
import {
	inspectorMountFrames,
	type InspectorMountFrame
} from '@app/components/inspector/inspector-pages';
import PageManager from '@app/components/common/PageManager.vue';

const frameRef = (frame: InspectorMountFrame): ((el: unknown) => void) | undefined => {
	if (frame.registry === 'composable') return registryRef(composableEls, frame.id);
	if (frame.registry === 'inspector') return registryRef(inspectorEls, frame.id);
	return undefined;
};
</script>
