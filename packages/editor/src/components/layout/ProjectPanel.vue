<template>
	<div class="page-frame" id="project" :ref="registryRef(storesEls, 'project')" value="project">
		<div
			class="file-browser"
			id="project-browser"
			:ref="registryRef(storesEls, 'project-browser')"
		></div>
	</div>
</template>

<script setup lang="ts">
import { storesEls } from '@app/stores/element-registry';
import { registryRef } from '@app/utils/element-registry';
</script>
