<template>
	<!-- 变量访问器窗口 -->
	<WindowFrame id="variableGetter">
		<TitleBar>Variable<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Type</text><SelectBox id="variableGetter-type" /> <text>Actor</text
				><CustomBox id="variableGetter-actor" type="actor" /> <text>Skill</text
				><CustomBox id="variableGetter-skill" type="skill" /> <text>State</text
				><CustomBox id="variableGetter-state" type="state" /> <text>Equipment</text
				><CustomBox id="variableGetter-equipment" type="equipment" />
				<text>Item</text><CustomBox id="variableGetter-item" type="item" />
				<text>Element</text><CustomBox id="variableGetter-element" type="element" />
				<text>Key</text><TextBox id="variableGetter-common-key" /> <text>Key</text
				><SelectVar id="variableGetter-preset-key" /> <text>Key</text
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
