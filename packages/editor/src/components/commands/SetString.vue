<template>
	<WindowFrame id="setString">
		<template #title><TitleBar>Set String<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Variable</div
				><CustomBox
					id="setString-variable"
					type="variable"
					filter="writable-string"
				/>
				<div class="text">Operation</div><SelectBox id="setString-operation" />
				<div class="text">Type</div><SelectBox id="setString-operand-type" />
				<div class="text">String</div
				><TextArea
					id="setString-operand-common-value"
					menu="tag-local-var tag-global-var tag-localization"
				/>
				<div class="text">String Method</div><SelectBox id="setString-operand-string-method" />
				<div class="text">Variable</div
				><CustomBox
					id="setString-operand-common-variable"
					type="variable"
					filter="all"
				/>
				<div class="text">Index</div
				><NumberVar
					id="setString-operand-string-char-index"
					min="0"
					max="1000000000"
				/>
				<div class="text">Begin Index</div
				><NumberVar
					id="setString-operand-string-slice-begin"
					min="-1000000000"
					max="1000000000"
				/>
				<div class="text">End Index</div
				><NumberVar
					id="setString-operand-string-slice-end"
					min="-1000000000"
					max="1000000000"
				/>
				<div class="text">Target Length</div
				><NumberBox
					id="setString-operand-string-pad-start-length"
					min="2"
					max="10"
				/>
				<div class="text">Pad String</div><TextBox id="setString-operand-string-pad-start-pad" />
				<div class="text">Substring</div
				><StringVar id="setString-operand-string-replace-pattern" />
				<div class="text">Replacement</div
				><StringVar id="setString-operand-string-replace-replacement" />
				<div class="text">Attribute Key</div
				><CustomBox id="setString-operand-attribute-attributeId" type="attribute" />
				<div class="text">Enum String</div
				><CustomBox id="setString-operand-enum-stringId" type="enum-string" />
				<div class="text">Property</div><SelectBox id="setString-operand-object-property" />
				<div class="text">Property</div><SelectBox id="setString-operand-element-property" />
				<div class="text">Element</div
				><CustomBox id="setString-operand-element-element" type="element" />
				<div class="text">Actor</div
				><CustomBox id="setString-operand-common-actor" type="actor" />
				<div class="text">Skill</div
				><CustomBox id="setString-operand-common-skill" type="skill" />
				<div class="text">Trigger</div
				><CustomBox id="setString-operand-common-trigger" type="trigger" />
				<div class="text">State</div
				><CustomBox id="setString-operand-common-state" type="state" />
				<div class="text">Equipment</div
				><CustomBox id="setString-operand-common-equipment" type="equipment" />
				<div class="text">Item</div
				><CustomBox id="setString-operand-common-item" type="item" />
				<div class="text">File</div
				><CustomBox id="setString-operand-object-fileId" type="file" />
				<div class="text">Index</div
				><NumberVar id="setString-operand-list-index" min="0" max="1000000000" />
				<div class="text">Param Name</div><StringVar id="setString-operand-parameter-key" />
				<div class="text">Script</div><TextBox id="setString-operand-script" /> <div class="text">Data</div
				><SelectBox id="setString-operand-other-data" /> <div class="text">Choice Index</div
				><NumberVar
					id="setString-operand-showChoices-content-choiceIndex"
					min="0"
					max="255"
				/>
				<div class="text">Timestamp</div
				><CustomBox
					id="setString-operand-parse-timestamp-variable"
					type="variable"
					filter="number"
				/>
				<div class="text">Date Format</div
				><TextBox id="setString-operand-parse-timestamp-format" />
				<div class="text">Image Width</div
				><NumberBox
					id="setString-operand-screenshot-width"
					min="64"
					max="7680"
					unit="px"
				/>
				<div class="text">Image Height</div
				><NumberBox
					id="setString-operand-screenshot-height"
					min="64"
					max="7680"
					unit="px"
				/>
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
