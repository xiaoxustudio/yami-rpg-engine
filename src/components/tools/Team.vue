<template>
	<!-- 队伍窗口 -->
	<WindowFrame id="team">
		<TitleBar>Team<close /></TitleBar>
		<content-frame>
			<field-set id="team-list-fieldset" class="input pad">
				<TreeList id="team-list" />
			</field-set>
			<button id="team-confirm" name="confirm">Confirm</button>
			<button id="team-cancel" name="cancel">Cancel</button>
		</content-frame>
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
