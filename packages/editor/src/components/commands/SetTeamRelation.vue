<template>
	<WindowFrame id="setTeamRelation" @confirm="onConfirm">
		<template #title><TitleBar>Change Team Relation<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Team A</div><SelectBox id="setTeamRelation-teamId1" />
				<div class="text">Team B</div><SelectBox id="setTeamRelation-teamId2" />
				<div class="text">Relation</div><SelectBox id="setTeamRelation-relation" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setTeamRelation?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
