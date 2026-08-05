<template>
		<WindowFrame id="setNumber-operand">
		<template #title><TitleBar>Number Operand<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Operation</div><SelectBox id="setNumber-operation" />
				<SelectBox id="setNumber-operand-operation" /> <div class="text">Type</div
				><SelectBox id="setNumber-operand-type" /> <div class="text">Constant</div
				><NumberBox
					id="setNumber-operand-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Math Method</div><SelectBox id="setNumber-operand-math-method" />
				<div class="text">String Method</div><SelectBox id="setNumber-operand-string-method" />
				<div class="text">Property</div><SelectBox id="setNumber-operand-object-property" />
				<div class="text">Property</div><SelectBox id="setNumber-operand-element-property" />
				<div class="text">Element</div
				><CustomBox id="setNumber-operand-element-element" type="element" />
				<div class="text">Variable</div
				><CustomBox
					id="setNumber-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<div class="text">Actor</div
				><CustomBox id="setNumber-operand-common-actor" type="actor" />
				<div class="text">Skill</div
				><CustomBox id="setNumber-operand-common-skill" type="skill" />
				<div class="text">State</div
				><CustomBox id="setNumber-operand-common-state" type="state" />
				<div class="text">Equipment</div
				><CustomBox id="setNumber-operand-common-equipment" type="equipment" />
				<div class="text">Item</div
				><CustomBox id="setNumber-operand-common-item" type="item" />
				<div class="text">Trigger</div
				><CustomBox id="setNumber-operand-common-trigger" type="trigger" />
				<div class="text">Tilemap</div
				><CustomBox id="setNumber-operand-common-tilemap" type="tilemap" />
				<div class="text">Tilemap Position</div
				><CustomBox id="setNumber-operand-tilemapPosition" type="position" />
				<div class="text">Item</div
				><FileVar id="setNumber-operand-object-itemId" type="file" filter="item" />
				<div class="text">Equipment</div
				><FileVar
					id="setNumber-operand-object-equipmentId"
					type="file"
					filter="equipment"
				/>
				<div class="text">Search String</div><StringVar id="setNumber-operand-string-search" />
				<div class="text">Decimal Places</div
				><NumberBox id="setNumber-operand-math-decimals" min="0" max="10" />
				<div class="text">Min</div
				><NumberVar
					id="setNumber-operand-math-min"
					min="-1000000000"
					max="1000000000"
				/>
				<div class="text">Max</div
				><NumberVar
					id="setNumber-operand-math-max"
					min="-1000000000"
					max="1000000000"
				/>
				<div class="text">Start Position</div
				><CustomBox id="setNumber-operand-math-startPosition" type="position" />
				<div class="text">End Position</div
				><CustomBox id="setNumber-operand-math-endPosition" type="position" />
				<div class="text">Cooldown Key</div><SelectVar id="setNumber-operand-cooldown-key" />
				<div class="text">Index</div
				><NumberVar id="setNumber-operand-list-index" min="0" max="1000000000" />
				<div class="text">Param Name</div><StringVar id="setNumber-operand-parameter-key" />
				<div class="text">Script</div><TextBox id="setNumber-operand-script" /> <div class="text">Data</div
				><SelectBox id="setNumber-operand-other-data" /> <div class="text">Touch Id</div
				><NumberVar id="setNumber-operand-other-touchId" min="0" max="10" />
				<div class="text">Team</div><SelectBox id="setNumber-operand-other-teamId" />
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
import FileVar from '@app/components/common/FileVar.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
