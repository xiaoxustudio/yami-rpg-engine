<template>
	<WindowFrame id="setTeamRelation">
		<TitleBar>Change Team Relation<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Team A</text><SelectBox id="setTeamRelation-teamId1" />
				<text>Team B</text><SelectBox id="setTeamRelation-teamId2" />
				<text>Relation</text><SelectBox id="setTeamRelation-relation" />
			</grid-box>
			<button id="setTeamRelation-confirm" name="confirm">Confirm</button>
			<button id="setTeamRelation-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
