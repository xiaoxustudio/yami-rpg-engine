<template>
	<WindowFrame id="command">
		<TitleBar>Custom Command<close /></TitleBar>
		<content-frame>
			<field-set id="command-list-fieldset" class="input pad">
				<legend>List</legend>
				<node-list id="command-list" padded />
			</field-set>
			<box id="command-inspector">
				<DetailBox id="command-overview-detail" open>
					<DetailSummary>Overview</DetailSummary>
					<box id="command-overview" />
				</DetailBox>
				<DetailBox id="command-settings-detail" open>
					<DetailSummary>Settings</DetailSummary>
					<detail-grid id="command-settings-grid">
						<text>Alias</text><text-box id="command-alias" /> <text>Keywords</text
						><text-box id="command-keywords" />
					</detail-grid>
				</DetailBox>
			</box>
			<button id="command-confirm" name="confirm">Confirm</button>
			<button id="command-cancel" name="cancel">Cancel</button>
			<button id="command-apply" name="apply">Apply</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
