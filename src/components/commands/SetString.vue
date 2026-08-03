<template>
	<WindowFrame id="setString">
		<TitleBar>Set String<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Variable</text
				><CustomBox
					id="setString-variable"
					type="variable"
					filter="writable-string"
				/>
				<text>Operation</text><SelectBox id="setString-operation" />
				<text>Type</text><SelectBox id="setString-operand-type" />
				<text>String</text
				><TextArea
					id="setString-operand-common-value"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<text>String Method</text><SelectBox id="setString-operand-string-method" />
				<text>Variable</text
				><CustomBox
					id="setString-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<text>Index</text
				><NumberVar
					id="setString-operand-string-char-index"
					min="0"
					max="1000000000"
				/>
				<text>Begin Index</text
				><NumberVar
					id="setString-operand-string-slice-begin"
					min="-1000000000"
					max="1000000000"
				/>
				<text>End Index</text
				><NumberVar
					id="setString-operand-string-slice-end"
					min="-1000000000"
					max="1000000000"
				/>
				<text>Target Length</text
				><NumberBox
					id="setString-operand-string-pad-start-length"
					min="2"
					max="10"
				/>
				<text>Pad String</text><TextBox id="setString-operand-string-pad-start-pad" />
				<text>Substring</text
				><StringVar id="setString-operand-string-replace-pattern" />
				<text>Replacement</text
				><StringVar id="setString-operand-string-replace-replacement" />
				<text>Attribute Key</text
				><CustomBox id="setString-operand-attribute-attributeId" type="attribute" />
				<text>Enum String</text
				><CustomBox id="setString-operand-enum-stringId" type="enum-string" />
				<text>Property</text><SelectBox id="setString-operand-object-property" />
				<text>Property</text><SelectBox id="setString-operand-element-property" />
				<text>Element</text
				><CustomBox id="setString-operand-element-element" type="element" />
				<text>Actor</text
				><CustomBox id="setString-operand-common-actor" type="actor" />
				<text>Skill</text
				><CustomBox id="setString-operand-common-skill" type="skill" />
				<text>Trigger</text
				><CustomBox id="setString-operand-common-trigger" type="trigger" />
				<text>State</text
				><CustomBox id="setString-operand-common-state" type="state" />
				<text>Equipment</text
				><CustomBox id="setString-operand-common-equipment" type="equipment" />
				<text>Item</text
				><CustomBox id="setString-operand-common-item" type="item" />
				<text>File</text
				><CustomBox id="setString-operand-object-fileId" type="file" />
				<text>Index</text
				><NumberVar id="setString-operand-list-index" min="0" max="1000000000" />
				<text>Param Name</text><StringVar id="setString-operand-parameter-key" />
				<text>Script</text><TextBox id="setString-operand-script" /> <text>Data</text
				><SelectBox id="setString-operand-other-data" /> <text>Choice Index</text
				><NumberVar
					id="setString-operand-showChoices-content-choiceIndex"
					min="0"
					max="255"
				/>
				<text>Timestamp</text
				><CustomBox
					id="setString-operand-parse-timestamp-variable"
					type="variable"
					filter="number"
				/>
				<text>Date Format</text
				><TextBox id="setString-operand-parse-timestamp-format" />
				<text>Image Width</text
				><NumberBox
					id="setString-operand-screenshot-width"
					min="64"
					max="7680"
					unit="px"
				/>
				<text>Image Height</text
				><NumberBox
					id="setString-operand-screenshot-height"
					min="64"
					max="7680"
					unit="px"
				/>
			</div>
			<button id="setString-confirm" name="confirm">Confirm</button>
			<button id="setString-cancel" name="cancel">Cancel</button>
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
import NumberBox from '@app/components/common/NumberBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import StringVar from '@app/components/common/StringVar.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
