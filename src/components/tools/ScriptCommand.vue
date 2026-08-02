<template>
		<WindowFrame id="scriptCommand">
		<TitleBar>Custom Command<close></close></TitleBar>
		<content-frame>
			<ParameterPane id="scriptCommand-parameter-pane">
				<DetailBox id="scriptCommand-parameter-detail" open>
					<detail-grid id="scriptCommand-parameter-grid" />
				</DetailBox>
			</ParameterPane>
			<button id="scriptCommand-confirm" name="confirm">Confirm</button>
			<button id="scriptCommand-cancel" name="cancel">Cancel</button>
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
import ParameterPane from '@app/components/common/ParameterPane.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
