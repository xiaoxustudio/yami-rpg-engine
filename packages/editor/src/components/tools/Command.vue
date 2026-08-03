<template>
	<WindowFrame id="command">
		<TitleBar>Custom Command<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="field-set input pad" id="command-list-fieldset">
				<div class="legend">List</div>
				<TreeList id="command-list" padded />
			</div>
			<div class="box" id="command-inspector">
				<DetailBox id="command-overview-detail" open>
					<DetailSummary>Overview</DetailSummary>
					<div class="box" id="command-overview" />
				</DetailBox>
				<DetailBox id="command-settings-detail" open>
					<DetailSummary>Settings</DetailSummary>
					<div class="detail-grid" id="command-settings-grid">
						<div class="text">Alias</div><TextBox id="command-alias" /> <div class="text">Keywords</div
					><TextBox id="command-keywords" />
					</div>
				</DetailBox>
			</div>
			<button id="command-confirm" name="confirm">Confirm</button>
			<button id="command-cancel" name="cancel">Cancel</button>
			<button id="command-apply" name="apply">Apply</button>
		</div>
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
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
