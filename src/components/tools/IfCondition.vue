<template>
	<WindowFrame id="if-condition">
		<TitleBar>Condition<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Condition Type</text><SelectBox id="if-condition-type" />
				<text>Variable</text
				><CustomBox
					id="if-condition-common-variable"
					type="variable"
					filter="all"
				/>
				<text>Operation</text><SelectBox id="if-condition-boolean-operation" />
				<text>Operand Type</text
				><SelectBox id="if-condition-boolean-operand-type" /> <text>Constant</text
				><SelectBox id="if-condition-boolean-constant-value" />
				<text>Operation</text><SelectBox id="if-condition-number-operation" />
				<text>Operand Type</text><SelectBox id="if-condition-number-operand-type" />
				<text>Constant</text
				><NumberBox
					id="if-condition-number-constant-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>Operation</text><SelectBox id="if-condition-string-operation" />
				<text>Operand Type</text><SelectBox id="if-condition-string-operand-type" />
				<text>Constant</text><TextArea id="if-condition-string-constant-value" />
				<text>Enum String</text
				><CustomBox id="if-condition-string-enum-stringId" type="enum-string" />
				<text>Operation</text><SelectBox id="if-condition-object-operation" />
				<text>Operand Type</text><SelectBox id="if-condition-object-operand-type" />
				<text>Operation</text><SelectBox id="if-condition-list-operation" />
				<text>Variable</text
				><CustomBox
					id="if-condition-operand-variable"
					type="variable"
					filter="all"
				/>
				<text>Operation</text><SelectBox id="if-condition-actor-operation" />
				<text>Actor</text><CustomBox id="if-condition-common-actor" type="actor" />
				<text>Skill</text><CustomBox id="if-condition-common-skill" type="skill" />
				<text>State</text><CustomBox id="if-condition-common-state" type="state" />
				<text>Equipment</text
				><CustomBox id="if-condition-common-equipment" type="equipment" />
				<text>Item</text><CustomBox id="if-condition-common-item" type="item" />
				<text>Trigger</text
				><CustomBox id="if-condition-common-trigger" type="trigger" />
				<text>Light</text><CustomBox id="if-condition-common-light" type="light" />
				<text>Element</text
				><CustomBox id="if-condition-common-element" type="element" />
				<text>Skill</text
				><CustomBox id="if-condition-actor-skillId" type="file" filter="skill" />
				<text>State</text
				><CustomBox id="if-condition-actor-stateId" type="file" filter="state" />
				<text>Item</text
				><CustomBox id="if-condition-actor-itemId" type="file" filter="item" />
				<text>Equipment</text
				><CustomBox
					id="if-condition-actor-equipmentId"
					type="file"
					filter="equipment"
				/>
				<text>Quantity</text
				><NumberBox id="if-condition-actor-quantity" min="1" max="10000" />
				<text>Shortcut Key</text><SelectVar id="if-condition-actor-shortcutKey" />
				<text>Target</text><CustomBox id="if-condition-actor-target" type="actor" />
				<text>Team</text><SelectBox id="if-condition-actor-teamId" />
				<text>Operation</text><SelectBox id="if-condition-element-operation" />
				<text>Key Code</text><KeyboardBox id="if-condition-keyboard-keycode" />
				<text>State</text><SelectBox id="if-condition-keyboard-state" />
				<text>Button</text><GamepadBox id="if-condition-gamepad-button" />
				<text>State</text><SelectBox id="if-condition-gamepad-state" />
				<text>Button</text><SelectBox id="if-condition-mouse-button" />
				<text>State</text><SelectBox id="if-condition-mouse-state" />
				<text>Other</text><SelectBox id="if-condition-other-key" />
			</div>
			<button id="if-condition-confirm" name="confirm">Confirm</button>
			<button id="if-condition-cancel" name="cancel">Cancel</button>
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
