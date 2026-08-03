<template>
	<!-- 队伍窗口 -->
	<WindowFrame id="team">
		<TitleBar>Team<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="field-set input pad" id="team-list-fieldset">
				<TreeList id="team-list" />
			</div>
			<button id="team-confirm" name="confirm">Confirm</button>
			<button id="team-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
