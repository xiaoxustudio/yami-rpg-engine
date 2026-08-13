<template>
<WindowFrame id="getActor" @confirm="onConfirm">
	<template #title><TitleBar>Get Actor<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Write to Variable</div
			><CustomBox id="getActor-variable" type="variable" filter="object" /><div class="text">Position</div><CustomBox id="getActor-position" type="position" /><div class="text">Area</div><SelectBox id="getActor-area" /><div class="text">Size</div
			><NumberVar id="getActor-size" min="0" max="512" decimals="4" unit="tile" /><div class="text">Radius</div
			><NumberVar
				id="getActor-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><div class="text">Selector</div><SelectBox id="getActor-selector" /><div class="text">Team</div
			><SelectVar id="getActor-teamId" /><div class="text">Condition</div
			><SelectBox id="getActor-condition" /><div class="text">Attribute</div
			><SelectBox id="getActor-attribute" /><div class="text">Attribute 2</div
			><SelectBox id="getActor-divisor" /><div class="text">Activation</div
			><SelectBox id="getActor-activation" /><div class="text">Exclusion</div
			><SelectBox id="getActor-exclusion" /><div class="text">Exclusion Actor</div
			><CustomBox id="getActor-exclusionActor" type="actor" /><div class="text">Exclusion Team</div><SelectVar id="getActor-exclusionTeamId" /></div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.getActor?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
