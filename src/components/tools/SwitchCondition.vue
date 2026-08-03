<template>
	<!-- 匹配 - 条件 -->
	<WindowFrame id="switch-condition">
		<TitleBar>Condition<div class="close" /></TitleBar>
		<div class="content-frame">
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
			<button id="switch-condition-confirm" name="confirm">Confirm</button>
			<button id="switch-condition-cancel" name="cancel">Cancel</button>
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
import TextArea from '@app/components/common/TextArea.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
