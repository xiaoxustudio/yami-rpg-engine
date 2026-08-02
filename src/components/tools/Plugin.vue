<template>
		<WindowFrame id="plugin">
		<TitleBar>Plugin<close></close></TitleBar>
		<content-frame>
			<field-set id="plugin-list-fieldset" class="input pad">
				<legend>List</legend>
				<TreeList id="plugin-list" padded />
			</field-set>
			<box id="plugin-inspector">
				<DetailBox id="plugin-overview-detail" open>
					<DetailSummary>Overview</DetailSummary>
					<box id="plugin-overview" />
				</DetailBox>
				<parameter-pane id="plugin-parameter-pane">
					<DetailBox id="plugin-parameter-detail" open>
						<DetailSummary>Parameters</DetailSummary>
						<detail-grid id="plugin-parameter-grid" />
					</DetailBox>
				</parameter-pane>
			</box>
			<button id="plugin-confirm" name="confirm">Confirm</button>
			<button id="plugin-cancel" name="cancel">Cancel</button>
			<button id="plugin-apply" name="apply">Apply</button>
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
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
