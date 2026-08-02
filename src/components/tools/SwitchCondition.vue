<template>
	<!-- 匹配 - 条件 -->
	<WindowFrame id="switch-condition">
		<TitleBar>Condition<div class="close" /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Condition Type</text><SelectBox id="switch-condition-type" />
				<text>Boolean</text><SelectBox id="switch-condition-boolean-value" />
				<text>Number</text
				><NumberBox
					id="switch-condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>String</text><TextArea id="switch-condition-string-value" />
				<text>Attribute Key</text
				><CustomBox id="switch-condition-attribute-attributeId" type="attribute" />
				<text>Enum String</text
				><CustomBox id="switch-condition-enum-stringId" type="enum-string" />
				<text>Key</text><KeyboardBox id="switch-condition-keyboard-keycode" />
				<text>Button</text><GamepadBox id="switch-condition-gamepad-button" />
				<text>Button</text><SelectBox id="switch-condition-mouse-button" />
				<text>Variable</text
				><CustomBox
					id="switch-condition-variable-variable"
					type="variable"
					filter="all"
				/>
			</grid-box>
			<button id="switch-condition-confirm" name="confirm">Confirm</button>
			<button id="switch-condition-cancel" name="cancel">Cancel</button>
		</content-frame>
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
