<template>
<WindowFrame id="return">
	<TitleBar>Return<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Type</text><SelectBox id="return-type" /> <text>Boolean</text
			><SelectBox id="return-boolean" /> <text>Number</text
			><NumberVar
				id="return-number"
				min="-1000000000"
				max="1000000000"
				decimals="10"
			 />
			<text>String</text><StringVar id="return-string" /> <text>Object</text
			><CustomBox id="return-object" type="variable" filter="object" />
			<text>Actor</text><CustomBox id="return-actor" type="actor" />
			<text>Skill</text><CustomBox id="return-skill" type="skill" />
			<text>State</text><CustomBox id="return-state" type="state" />
			<text>Equipment</text><CustomBox id="return-equipment" type="equipment" />
			<text>Item</text><CustomBox id="return-item" type="item" />
			<text>Trigger</text><CustomBox id="return-trigger" type="trigger" />
			<text>Light</text><CustomBox id="return-light" type="light" />
			<text>Element</text><CustomBox id="return-element" type="element" />
		</grid-box>
		<button id="return-confirm" name="confirm">Confirm</button>
		<button id="return-cancel" name="cancel">Cancel</button>
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
