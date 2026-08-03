<template>
<WindowFrame id="switch">
	<TitleBar>Switch<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Variable</text
			><CustomBox id="switch-variable" type="variable" filter="all" />
			<text>Branches</text><ParamList id="switch-branches" />
		</div>
		<CheckBox id="switch-default" class="standard"
			><text id="switch-default-label">Default</text></CheckBox
		>
		<button id="switch-confirm" name="confirm">Confirm</button>
		<button id="switch-cancel" name="cancel">Cancel</button>
	</div>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
