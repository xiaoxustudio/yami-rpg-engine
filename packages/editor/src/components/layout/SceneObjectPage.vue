<template>
			<div class="page-frame" id="scene-object" value="scene-object">
				<div class="box" id="scene-list-head">
					<TextBox id="scene-searcher" name="search" />
				</div>
				<TreeList id="scene-list" padded />
			</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {


});
</script>
