<template>
	<!-- 变量窗口 -->
	<WindowFrame id="variable" mode="center">
		<TitleBar>Variable<close /></TitleBar>
		<content-frame>
			<field-set id="variable-list-fieldset" class="input pad">
				<legend>List</legend>
				<TreeList id="variable-list" padded />
			</field-set>
			<field-set id="variable-properties-fieldset">
				<legend>Properties</legend>
				<flex-box id="variable-properties-flex">
					<flex-item><text>Name</text><TextBox id="variable-name" /></flex-item>
					<flex-item
						><text>Sort</text>
						<RadioBox
							id="variable-sort-normal"
							name="variable-sort"
							class="standard"
							value="0"
							><text id="variable-sort-normal-label">Normal</text></RadioBox
						>
						<RadioBox
							id="variable-sort-shared"
							name="variable-sort"
							class="standard"
							value="1"
							><text id="variable-sort-shared-label">Shared</text></RadioBox
						>
						<RadioBox
							id="variable-sort-temporary"
							name="variable-sort"
							class="standard"
							value="2"
							><text id="variable-sort-temporary-label">Temporary</text></RadioBox
						>
					</flex-item>
					<flex-item
						><text>Type</text>
						<RadioBox
							id="variable-type-boolean"
							name="variable-type"
							class="standard"
							value="boolean"
							><text id="variable-type-boolean-label">Boolean</text></RadioBox
						>
						<RadioBox
							id="variable-type-number"
							name="variable-type"
							class="standard"
							value="number"
							><text id="variable-type-number-label">Number</text></RadioBox
						>
						<RadioBox
							id="variable-type-string"
							name="variable-type"
							class="standard"
							value="string"
							><text id="variable-type-string-label">String</text></RadioBox
						>
						<RadioBox
							id="variable-type-object"
							name="variable-type"
							class="standard"
							value="object"
							><text id="variable-type-object-label">Object</text></RadioBox
						>
					</flex-item>
					<flex-item id="variable-value-box"
						><text>Value</text>
						<PageManager id="variable-value-manager">
							<page-frame value="boolean">
								<RadioBox
									id="variable-value-boolean-false"
									name="variable-value-boolean"
									class="standard"
									value="false"
									>False</RadioBox
								>
								<RadioBox
									id="variable-value-boolean-true"
									name="variable-value-boolean"
									class="standard"
									value="true"
									>True</RadioBox
								>
							</page-frame>
							<page-frame value="number">
								<NumberBox
									id="variable-value-number"
									min="-1000000000"
									max="1000000000"
									decimals="10"
								/>
							</page-frame>
							<page-frame value="string">
								<TextArea id="variable-value-string" />
							</page-frame>
						</PageManager>
					</flex-item>
					<flex-item><text>Note</text><TextArea id="variable-note" /></flex-item>
				</flex-box>
			</field-set>
			<TextBox id="variable-searcher" name="search" />
			<button id="variable-confirm" name="confirm">Confirm</button>
			<button id="variable-cancel" name="cancel">Cancel</button>
			<button id="variable-apply" name="apply">Apply</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import PageManager from '@app/components/common/PageManager.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
