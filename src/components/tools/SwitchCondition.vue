<template>
	<!-- 匹配 - 条件 -->
	<window-frame id="switch-condition">
		<title-bar>Condition<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Condition Type</text><select-box id="switch-condition-type" />
				<text>Boolean</text><select-box id="switch-condition-boolean-value" />
				<text>Number</text
				><number-box
					id="switch-condition-number-value"
					min="-1000000000"
					max="1000000000"
					decimals="10"
				/>
				<text>String</text><text-area id="switch-condition-string-value" />
				<text>Attribute Key</text
				><custom-box id="switch-condition-attribute-attributeId" type="attribute" />
				<text>Enum String</text
				><custom-box id="switch-condition-enum-stringId" type="enum-string" />
				<text>Key</text><keyboard-box id="switch-condition-keyboard-keycode" />
				<text>Button</text><gamepad-box id="switch-condition-gamepad-button" />
				<text>Button</text><select-box id="switch-condition-mouse-button" />
				<text>Variable</text
				><custom-box
					id="switch-condition-variable-variable"
					type="variable"
					filter="all"
				/>
			</grid-box>
			<button id="switch-condition-confirm" name="confirm">Confirm</button>
			<button id="switch-condition-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
