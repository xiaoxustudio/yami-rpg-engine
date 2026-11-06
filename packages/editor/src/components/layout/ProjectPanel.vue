<template>
	<div class="page-frame" id="project" :ref="bind('page')" value="project">
		<div class="file-browser" id="project-browser" :ref="bind('browser')"></div>
	</div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { projectNodes as projectNodeTable } from '@app/composables/engine-nodes';
const { bind, dispose } = projectNodeTable.scoped();
onUnmounted(dispose);
</script>
