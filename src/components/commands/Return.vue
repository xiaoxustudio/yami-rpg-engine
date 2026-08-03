<template>
<WindowFrame id="return">
	<TitleBar>Return<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="return-type" /> <div class="text">Boolean</div
			><SelectBox id="return-boolean" /> <div class="text">Number</div
			><NumberVar
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<div class="text">String</div><StringVar id="return-string" /> <div class="text">Object</div
			><CustomBox id="return-object" type="variable" filter="object" />
			<div class="text">Actor</div><CustomBox id="return-actor" type="actor" />
			<div class="text">Skill</div><CustomBox id="return-skill" type="skill" />
			<div class="text">State</div><CustomBox id="return-state" type="state" />
			<div class="text">Equipment</div><CustomBox id="return-equipment" type="equipment" />
			<div class="text">Item</div><CustomBox id="return-item" type="item" />
			<div class="text">Trigger</div><CustomBox id="return-trigger" type="trigger" />
			<div class="text">Light</div><CustomBox id="return-light" type="light" />
			<div class="text">Element</div><CustomBox id="return-element" type="element" />
		</div>
		<button id="return-confirm" name="confirm">Confirm</button>
		<button id="return-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
