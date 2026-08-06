<template>
	<!-- 队伍窗口 -->
	<WindowFrame id="team">
		<template #title><TitleBar>Team<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="team-list-fieldset">
				<TreeList
					id="team-list"
					@select="onListSelect"
					@popup="onListPopup"
				/>
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

const onListSelect = (event: any) => {
	(window as any).Team?.listSelect?.(event);
};
const onListPopup = (event: any) => {
	(window as any).Team?.listPopup?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
