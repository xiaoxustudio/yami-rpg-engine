<template>
	<!-- 变量访问器窗口2 -->
	<WindowFrame id="variableGetter2">
		<TitleBar>Variable<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><SelectBox id="variableGetter2-type" /> <text>Element</text
				><CustomBox id="variableGetter2-element" type="element" /> <text>Key</text
				><TextBox id="variableGetter2-common-key" /> <text>Key</text
				><SelectBox id="variableGetter2-preset-key" /> <text>Key</text
				><CustomBox id="variableGetter2-global-key" type="global-variable" />
			</grid-box>
			<button id="variableGetter2-confirm" name="confirm">Confirm</button>
			<button id="variableGetter2-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
