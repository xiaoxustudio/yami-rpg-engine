<template>
		<window-frame id="scriptCommand">
		<title-bar>Custom Command<close></close></title-bar>
		<content-frame>
			<parameter-pane id="scriptCommand-parameter-pane">
				<detail-box id="scriptCommand-parameter-detail" open>
					<detail-grid id="scriptCommand-parameter-grid" />
				</detail-box>
			</parameter-pane>
			<button id="scriptCommand-confirm" name="confirm">Confirm</button>
			<button id="scriptCommand-cancel" name="cancel">Cancel</button>
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
