<template>
		<WindowFrame id="setNumber-operand">
		<TitleBar>Number Operand<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="setNumber-operation" />
				<select-box id="setNumber-operand-operation" /> <text>Type</text
				><select-box id="setNumber-operand-type" /> <text>Constant</text
				><number-box
					id="setNumber-operand-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Math Method</text><select-box id="setNumber-operand-math-method" />
				<text>String Method</text><select-box id="setNumber-operand-string-method" />
				<text>Property</text><select-box id="setNumber-operand-object-property" />
				<text>Property</text><select-box id="setNumber-operand-element-property" />
				<text>Element</text
				><custom-box id="setNumber-operand-element-element" type="element" />
				<text>Variable</text
				><custom-box
					id="setNumber-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<text>Actor</text
				><custom-box id="setNumber-operand-common-actor" type="actor" />
				<text>Skill</text
				><custom-box id="setNumber-operand-common-skill" type="skill" />
				<text>State</text
				><custom-box id="setNumber-operand-common-state" type="state" />
				<text>Equipment</text
				><custom-box id="setNumber-operand-common-equipment" type="equipment" />
				<text>Item</text
				><custom-box id="setNumber-operand-common-item" type="item" />
				<text>Trigger</text
				><custom-box id="setNumber-operand-common-trigger" type="trigger" />
				<text>Tilemap</text
				><custom-box id="setNumber-operand-common-tilemap" type="tilemap" />
				<text>Tilemap Position</text
				><custom-box id="setNumber-operand-tilemapPosition" type="position" />
				<text>Item</text
				><file-var id="setNumber-operand-object-itemId" type="file" filter="item" />
				<text>Equipment</text
				><file-var
					id="setNumber-operand-object-equipmentId"
					type="file"
					filter="equipment"
				/>
				<text>Search String</text><string-var id="setNumber-operand-string-search" />
				<text>Decimal Places</text
				><number-box id="setNumber-operand-math-decimals" min="0" max="10" />
				<text>Min</text
				><number-var
					id="setNumber-operand-math-min"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Max</text
				><number-var
					id="setNumber-operand-math-max"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Start Position</text
				><custom-box id="setNumber-operand-math-startPosition" type="position" />
				<text>End Position</text
				><custom-box id="setNumber-operand-math-endPosition" type="position" />
				<text>Cooldown Key</text><select-var id="setNumber-operand-cooldown-key" />
				<text>Index</text
				><number-var id="setNumber-operand-list-index" min="0" max="1000000000" />
				<text>Param Name</text><string-var id="setNumber-operand-parameter-key" />
				<text>Script</text><text-box id="setNumber-operand-script" /> <text>Data</text
				><select-box id="setNumber-operand-other-data" /> <text>Touch Id</text
				><number-var id="setNumber-operand-other-touchId" min="0" max="10" />
				<text>Team</text><select-box id="setNumber-operand-other-teamId" />
			</grid-box>
			<button id="setNumber-operand-confirm" name="confirm">Confirm</button>
			<button id="setNumber-operand-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
