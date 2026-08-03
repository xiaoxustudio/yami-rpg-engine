<template>
	<WindowFrame id="setAnimation">
		<TitleBar>Set Animation<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Element</div><CustomBox id="setAnimation-element" type="element" />
				<div class="text">Properties</div><ParamList id="setAnimation-properties" />
			</div>
			<button id="setAnimation-confirm" name="confirm">Confirm</button>
			<button id="setAnimation-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
