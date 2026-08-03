<template>
		<WindowFrame id="setNumber-operand">
		<TitleBar>Number Operand<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Operation</text><SelectBox id="setNumber-operation" />
				<SelectBox id="setNumber-operand-operation" /> <text>Type</text
				><SelectBox id="setNumber-operand-type" /> <text>Constant</text
				><NumberBox
					id="setNumber-operand-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Math Method</text><SelectBox id="setNumber-operand-math-method" />
				<text>String Method</text><SelectBox id="setNumber-operand-string-method" />
				<text>Property</text><SelectBox id="setNumber-operand-object-property" />
				<text>Property</text><SelectBox id="setNumber-operand-element-property" />
				<text>Element</text
				><CustomBox id="setNumber-operand-element-element" type="element" />
				<text>Variable</text
				><CustomBox
					id="setNumber-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<text>Actor</text
				><CustomBox id="setNumber-operand-common-actor" type="actor" />
				<text>Skill</text
				><CustomBox id="setNumber-operand-common-skill" type="skill" />
				<text>State</text
				><CustomBox id="setNumber-operand-common-state" type="state" />
				<text>Equipment</text
				><CustomBox id="setNumber-operand-common-equipment" type="equipment" />
				<text>Item</text
				><CustomBox id="setNumber-operand-common-item" type="item" />
				<text>Trigger</text
				><CustomBox id="setNumber-operand-common-trigger" type="trigger" />
				<text>Tilemap</text
				><CustomBox id="setNumber-operand-common-tilemap" type="tilemap" />
				<text>Tilemap Position</text
				><CustomBox id="setNumber-operand-tilemapPosition" type="position" />
				<text>Item</text
				><FileVar id="setNumber-operand-object-itemId" type="file" filter="item" />
				<text>Equipment</text
				><FileVar
					id="setNumber-operand-object-equipmentId"
					type="file"
					filter="equipment"
				/>
				<text>Search String</text><StringVar id="setNumber-operand-string-search" />
				<text>Decimal Places</text
				><NumberBox id="setNumber-operand-math-decimals" min="0" max="10" />
				<text>Min</text
				><NumberVar
					id="setNumber-operand-math-min"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Max</text
				><NumberVar
					id="setNumber-operand-math-max"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Start Position</text
				><CustomBox id="setNumber-operand-math-startPosition" type="position" />
				<text>End Position</text
				><CustomBox id="setNumber-operand-math-endPosition" type="position" />
				<text>Cooldown Key</text><SelectVar id="setNumber-operand-cooldown-key" />
				<text>Index</text
				><NumberVar id="setNumber-operand-list-index" min="0" max="1000000000" />
				<text>Param Name</text><StringVar id="setNumber-operand-parameter-key" />
				<text>Script</text><TextBox id="setNumber-operand-script" /> <text>Data</text
				><SelectBox id="setNumber-operand-other-data" /> <text>Touch Id</text
				><NumberVar id="setNumber-operand-other-touchId" min="0" max="10" />
				<text>Team</text><SelectBox id="setNumber-operand-other-teamId" />
			</div>
			<button id="setNumber-operand-confirm" name="confirm">Confirm</button>
			<button id="setNumber-operand-cancel" name="cancel">Cancel</button>
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
