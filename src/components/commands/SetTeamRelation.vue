<template>
	<window-frame id="setTeamRelation">
		<title-bar>Change Team Relation<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Team A</text><select-box id="setTeamRelation-teamId1" />
				<text>Team B</text><select-box id="setTeamRelation-teamId2" />
				<text>Relation</text><select-box id="setTeamRelation-relation" />
			</grid-box>
			<button id="setTeamRelation-confirm" name="confirm">Confirm</button>
			<button id="setTeamRelation-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
