<template>
		<window-frame id="plugin">
		<title-bar>Plugin<close></close></title-bar>
		<content-frame>
			<field-set id="plugin-list-fieldset" class="input pad">
				<legend>List</legend>
				<node-list id="plugin-list" padded />
			</field-set>
			<box id="plugin-inspector">
				<detail-box id="plugin-overview-detail" open>
					<detail-summary>Overview</detail-summary>
					<box id="plugin-overview" />
				</detail-box>
				<parameter-pane id="plugin-parameter-pane">
					<detail-box id="plugin-parameter-detail" open>
						<detail-summary>Parameters</detail-summary>
						<detail-grid id="plugin-parameter-grid" />
					</detail-box>
				</parameter-pane>
			</box>
			<button id="plugin-confirm" name="confirm">Confirm</button>
			<button id="plugin-cancel" name="cancel">Cancel</button>
			<button id="plugin-apply" name="apply">Apply</button>
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
