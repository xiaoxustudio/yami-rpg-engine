<template>
	<window-frame id="setString">
		<title-bar>Set String<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Variable</text
				><custom-box
					id="setString-variable"
					type="variable"
					filter="writable-string"
				/>
				<text>Operation</text><select-box id="setString-operation" />
				<text>Type</text><select-box id="setString-operand-type" />
				<text>String</text
				><text-area
					id="setString-operand-common-value"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<text>String Method</text><select-box id="setString-operand-string-method" />
				<text>Variable</text
				><custom-box
					id="setString-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<text>Index</text
				><number-var
					id="setString-operand-string-char-index"
					min="0"
					max="1000000000"
				/>
				<text>Begin Index</text
				><number-var
					id="setString-operand-string-slice-begin"
					min="-1000000000"
					max="1000000000"
				/>
				<text>End Index</text
				><number-var
					id="setString-operand-string-slice-end"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Target Length</text
				><number-box
					id="setString-operand-string-pad-start-length"
					min="2"
					max="10"
				/>
				<text>Pad String</text><text-box id="setString-operand-string-pad-start-pad" />
				<text>Substring</text
				><string-var id="setString-operand-string-replace-pattern" />
				<text>Replacement</text
				><string-var id="setString-operand-string-replace-replacement" />
				<text>Attribute Key</text
				><custom-box id="setString-operand-attribute-attributeId" type="attribute" />
				<text>Enum String</text
				><custom-box id="setString-operand-enum-stringId" type="enum-string" />
				<text>Property</text><select-box id="setString-operand-object-property" />
				<text>Property</text><select-box id="setString-operand-element-property" />
				<text>Element</text
				><custom-box id="setString-operand-element-element" type="element" />
				<text>Actor</text
				><custom-box id="setString-operand-common-actor" type="actor" />
				<text>Skill</text
				><custom-box id="setString-operand-common-skill" type="skill" />
				<text>Trigger</text
				><custom-box id="setString-operand-common-trigger" type="trigger" />
				<text>State</text
				><custom-box id="setString-operand-common-state" type="state" />
				<text>Equipment</text
				><custom-box id="setString-operand-common-equipment" type="equipment" />
				<text>Item</text
				><custom-box id="setString-operand-common-item" type="item" />
				<text>File</text
				><custom-box id="setString-operand-object-fileId" type="file" />
				<text>Index</text
				><number-var id="setString-operand-list-index" min="0" max="1000000000" />
				<text>Param Name</text><string-var id="setString-operand-parameter-key" />
				<text>Script</text><text-box id="setString-operand-script" /> <text>Data</text
				><select-box id="setString-operand-other-data" /> <text>Choice Index</text
				><number-var
					id="setString-operand-showChoices-content-choiceIndex"
					min="0"
					max="255"
				/>
				<text>Timestamp</text
				><custom-box
					id="setString-operand-parse-timestamp-variable"
					type="variable"
					filter="number"
				/>
				<text>Date Format</text
				><text-box id="setString-operand-parse-timestamp-format" />
				<text>Image Width</text
				><number-box
					id="setString-operand-screenshot-width"
					min="64"
					max="7680"
					unit="px"
				/>
				<text>Image Height</text
				><number-box
					id="setString-operand-screenshot-height"
					min="64"
					max="7680"
					unit="px"
				/>
			</grid-box>
			<button id="setString-confirm" name="confirm">Confirm</button>
			<button id="setString-cancel" name="cancel">Cancel</button>
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
