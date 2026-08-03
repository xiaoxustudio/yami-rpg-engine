<template>
	<!-- 变量访问器窗口 -->
	<WindowFrame id="variableGetter">
		<TitleBar>Variable<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Type</div><SelectBox id="variableGetter-type" /> <div class="text">Actor</div
				><CustomBox id="variableGetter-actor" type="actor" /> <div class="text">Skill</div
				><CustomBox id="variableGetter-skill" type="skill" /> <div class="text">State</div
				><CustomBox id="variableGetter-state" type="state" /> <div class="text">Equipment</div
				><CustomBox id="variableGetter-equipment" type="equipment" />
				<div class="text">Item</div><CustomBox id="variableGetter-item" type="item" />
				<div class="text">Element</div><CustomBox id="variableGetter-element" type="element" />
				<div class="text">Key</div><TextBox id="variableGetter-common-key" /> <div class="text">Key</div
				><SelectVar id="variableGetter-preset-key" /> <div class="text">Key</div
				><CustomBox id="variableGetter-global-key" type="global-variable" />
			</div>
			<button id="variableGetter-confirm" name="confirm">Confirm</button>
			<button id="variableGetter-cancel" name="cancel">Cancel</button>
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
import SelectVar from '@app/components/common/SelectVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
