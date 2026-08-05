<template>
	<WindowFrame id="if-condition">
		<template #title><TitleBar>Condition<div class="close"></div></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Condition Type</div><SelectBox id="if-condition-type" />
				<div class="text">Variable</div
				><CustomBox
					id="if-condition-common-variable"
					type="variable"
					filter="all"
				/>
				<div class="text">Operation</div><SelectBox id="if-condition-boolean-operation" />
				<div class="text">Operand Type</div
				><SelectBox id="if-condition-boolean-operand-type" /> <div class="text">Constant</div
				><SelectBox id="if-condition-boolean-constant-value" />
				<div class="text">Operation</div><SelectBox id="if-condition-number-operation" />
				<div class="text">Operand Type</div><SelectBox id="if-condition-number-operand-type" />
				<div class="text">Constant</div
				><NumberBox
					id="if-condition-number-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">Operation</div><SelectBox id="if-condition-string-operation" />
				<div class="text">Operand Type</div><SelectBox id="if-condition-string-operand-type" />
				<div class="text">Constant</div><TextArea id="if-condition-string-constant-value" />
				<div class="text">Enum String</div
				><CustomBox id="if-condition-string-enum-stringId" type="enum-string" />
				<div class="text">Operation</div><SelectBox id="if-condition-object-operation" />
				<div class="text">Operand Type</div><SelectBox id="if-condition-object-operand-type" />
				<div class="text">Operation</div><SelectBox id="if-condition-list-operation" />
				<div class="text">Variable</div
				><CustomBox
					id="if-condition-operand-variable"
					type="variable"
					filter="all"
				/>
				<div class="text">Operation</div><SelectBox id="if-condition-actor-operation" />
				<div class="text">Actor</div><CustomBox id="if-condition-common-actor" type="actor" />
				<div class="text">Skill</div><CustomBox id="if-condition-common-skill" type="skill" />
				<div class="text">State</div><CustomBox id="if-condition-common-state" type="state" />
				<div class="text">Equipment</div
				><CustomBox id="if-condition-common-equipment" type="equipment" />
				<div class="text">Item</div><CustomBox id="if-condition-common-item" type="item" />
				<div class="text">Trigger</div
				><CustomBox id="if-condition-common-trigger" type="trigger" />
				<div class="text">Light</div><CustomBox id="if-condition-common-light" type="light" />
				<div class="text">Element</div
				><CustomBox id="if-condition-common-element" type="element" />
				<div class="text">Skill</div
				><CustomBox id="if-condition-actor-skillId" type="file" filter="skill" />
				<div class="text">State</div
				><CustomBox id="if-condition-actor-stateId" type="file" filter="state" />
				<div class="text">Item</div
				><CustomBox id="if-condition-actor-itemId" type="file" filter="item" />
				<div class="text">Equipment</div
				><CustomBox
					id="if-condition-actor-equipmentId"
					type="file"
					filter="equipment"
				/>
				<div class="text">Quantity</div
				><NumberBox id="if-condition-actor-quantity" min="1" max="10000" />
				<div class="text">Shortcut Key</div><SelectVar id="if-condition-actor-shortcutKey" />
				<div class="text">Target</div><CustomBox id="if-condition-actor-target" type="actor" />
				<div class="text">Team</div><SelectBox id="if-condition-actor-teamId" />
				<div class="text">Operation</div><SelectBox id="if-condition-element-operation" />
				<div class="text">Key Code</div><KeyboardBox id="if-condition-keyboard-keycode" />
				<div class="text">State</div><SelectBox id="if-condition-keyboard-state" />
				<div class="text">Button</div><GamepadBox id="if-condition-gamepad-button" />
				<div class="text">State</div><SelectBox id="if-condition-gamepad-state" />
				<div class="text">Button</div><SelectBox id="if-condition-mouse-button" />
				<div class="text">State</div><SelectBox id="if-condition-mouse-state" />
				<div class="text">Other</div><SelectBox id="if-condition-other-key" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectVar from '@app/components/common/SelectVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
