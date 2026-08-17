<template>
	<!-- 匹配 - 条件 -->
	<WindowFrame id="switch-condition" @confirm="onConfirm">
		<template #title><TitleBar>Condition<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Condition Type</div><SelectBox id="switch-condition-type" />
				<div class="text">Boolean</div><SelectBox id="switch-condition-boolean-value" />
				<div class="text">Number</div
				><NumberBox
					id="switch-condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<div class="text">String</div><TextArea id="switch-condition-string-value" />
				<div class="text">Attribute Key</div
				><CustomBox id="switch-condition-attribute-attributeId" type="attribute" />
				<div class="text">Enum String</div
				><CustomBox id="switch-condition-enum-stringId" type="enum-string" />
				<div class="text">Key</div><KeyboardBox id="switch-condition-keyboard-keycode" />
				<div class="text">Button</div><GamepadBox id="switch-condition-gamepad-button" />
				<div class="text">Button</div><SelectBox id="switch-condition-mouse-button" />
				<div class="text">Variable</div
				><CustomBox
					id="switch-condition-variable-variable"
					type="variable"
					filter="all"
				/>
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { $ } from '@app/legacy/util/dom.ts';
import { SwitchCondition } from '@app/legacy/command/match-condition-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import GamepadBox from '@app/components/common/GamepadBox.vue';
import KeyboardBox from '@app/components/common/KeyboardBox.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	SwitchCondition?.confirm?.();
};

onMounted(() => {
	const typeEl = $('#switch-condition-type');
	if (!typeEl) return;
	typeEl.loadItems([
		{ name: 'None', value: 'none' },
		{ name: 'Boolean', value: 'boolean' },
		{ name: 'Number', value: 'number' },
		{ name: 'String', value: 'string' },
		{ name: 'Attribute Key', value: 'attribute' },
		{ name: 'Enum String', value: 'enum' },
		{ name: 'Keyboard', value: 'keyboard' },
		{ name: 'Gamepad', value: 'gamepad' },
		{ name: 'Mouse', value: 'mouse' },
		{ name: 'Variable', value: 'variable' }
	]);

	typeEl.enableHiddenMode().relate([
		{
			case: 'boolean',
			targets: [$('#switch-condition-boolean-value')]
		},
		{ case: 'number', targets: [$('#switch-condition-number-value')] },
		{ case: 'string', targets: [$('#switch-condition-string-value')] },
		{
			case: 'attribute',
			targets: [$('#switch-condition-attribute-attributeId')]
		},
		{ case: 'enum', targets: [$('#switch-condition-enum-stringId')] },
		{
			case: 'keyboard',
			targets: [$('#switch-condition-keyboard-keycode')]
		},
		{
			case: 'gamepad',
			targets: [$('#switch-condition-gamepad-button')]
		},
		{ case: 'mouse', targets: [$('#switch-condition-mouse-button')] },
		{
			case: 'variable',
			targets: [$('#switch-condition-variable-variable')]
		}
	]);

	$('#switch-condition-boolean-value').loadItems([
		{ name: 'False', value: false },
		{ name: 'True', value: true }
	]);

	$('#switch-condition-mouse-button').loadItems([
		{ name: 'Left Button', value: 0 },
		{ name: 'Middle Button', value: 1 },
		{ name: 'Right Button', value: 2 },
		{ name: 'Back Button', value: 3 },
		{ name: 'Forward Button', value: 4 }
	]);
});
</script>
