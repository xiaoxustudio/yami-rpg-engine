<template>
	<!-- 队伍窗口 -->
	<window-frame id="team">
		<title-bar>Team<close /></title-bar>
		<content-frame>
			<field-set id="team-list-fieldset" class="input pad">
				<node-list id="team-list" />
			</field-set>
			<button id="team-confirm" name="confirm">Confirm</button>
			<button id="team-cancel" name="cancel">Cancel</button>
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
