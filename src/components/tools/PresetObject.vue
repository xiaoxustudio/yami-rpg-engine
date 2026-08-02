<template>
		<WindowFrame id="presetObject" mode="center">
		<TitleBar>Object<div class="close"></div></TitleBar>
		<content-frame>
			<CustomBox id="presetObject-sceneId" type="file" filter="scene" />
			<TreeList id="presetObject-list" />
			<TextBox id="presetObject-searcher" name="search" />
			<button id="presetObject-confirm" name="confirm">Confirm</button>
			<button id="presetObject-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
