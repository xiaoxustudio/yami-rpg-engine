<template>
	<WindowFrame id="setObject">
		<TitleBar>Set Object<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><CustomBox id="setObject-variable" type="variable" filter="object" />
				<text>Type</text><SelectBox id="setObject-operand-type" /> <text>Actor</text
				><CustomBox id="setObject-operand-actor" type="actor" /> <text>Skill</text
				><CustomBox id="setObject-operand-skill" type="skill" /> <text>State</text
				><CustomBox id="setObject-operand-state" type="state" />
				<text>Equipment</text
				><CustomBox id="setObject-operand-equipment" type="equipment" />
				<text>Item</text><CustomBox id="setObject-operand-item" type="item" />
				<text>Trigger</text
				><CustomBox id="setObject-operand-trigger" type="trigger" />
				<text>Light</text><CustomBox id="setObject-operand-light" type="light" />
				<text>Object</text><CustomBox id="setObject-operand-object" type="object" />
				<text>Element</text
				><CustomBox id="setObject-operand-element" type="element" />
				<text>Variable</text
				><CustomBox
					id="setObject-operand-variable"
					type="variable"
					filter="object"
				/>
				<text>Index</text
				><NumberVar id="setObject-operand-list-index" min="0" max="1000000000" />
			</grid-box>
			<button id="setObject-confirm" name="confirm">Confirm</button>
			<button id="setObject-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
