<template>
	<!-- 变量窗口 -->
	<WindowFrame id="variable" show-apply mode="center">
		<template #title><TitleBar>Variable<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="variable-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="variable-list"
					padded
					@select="onListSelect"
					@record="onListRecord"
					@popup="onListPopup"
					@open="onListOpen"
				/>
			</div>
			<div class="field-set" id="variable-properties-fieldset">
				<div class="legend">Properties</div>
				<div class="flex-box" id="variable-properties-flex">
					<div class="flex-item"><div class="text">Name</div><TextBox id="variable-name" /></div>
					<div class="flex-item"
						><div class="text">Sort</div>
						<RadioBox
							id="variable-sort-normal"
							name="variable-sort"
							class="standard"
							value="0"
							><div class="text" id="variable-sort-normal-label">Normal</div></RadioBox
						>
						<RadioBox
							id="variable-sort-shared"
							name="variable-sort"
							class="standard"
							value="1"
							><div class="text" id="variable-sort-shared-label">Shared</div></RadioBox
						>
						<RadioBox
							id="variable-sort-temporary"
							name="variable-sort"
							class="standard"
							value="2"
							><div class="text" id="variable-sort-temporary-label">Temporary</div></RadioBox
						>
					</div>
					<div class="flex-item"
						><div class="text">Type</div>
						<RadioBox
							id="variable-type-boolean"
							name="variable-type"
							class="standard"
							value="boolean"
							><div class="text" id="variable-type-boolean-label">Boolean</div></RadioBox
						>
						<RadioBox
							id="variable-type-number"
							name="variable-type"
							class="standard"
							value="number"
							><div class="text" id="variable-type-number-label">Number</div></RadioBox
						>
						<RadioBox
							id="variable-type-string"
							name="variable-type"
							class="standard"
							value="string"
							><div class="text" id="variable-type-string-label">String</div></RadioBox
						>
						<RadioBox
							id="variable-type-object"
							name="variable-type"
							class="standard"
							value="object"
							><div class="text" id="variable-type-object-label">Object</div></RadioBox
						>
					</div>
					<div class="flex-item" id="variable-value-box"
						><div class="text">Value</div>
						<PageManager id="variable-value-manager">
							<div class="page-frame" value="boolean">
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
							</div>
							<div class="page-frame" value="number">
								<NumberBox
									id="variable-value-number"
									min="-1000000000"
									max="1000000000"
									decimals="10"
								/>
							</div>
							<div class="page-frame" value="string">
								<TextArea id="variable-value-string" />
							</div>
						</PageManager>
					</div>
					<div class="flex-item"><div class="text">Note</div><TextArea id="variable-note" /></div>
				</div>
			</div>
			<TextBox id="variable-searcher" name="search" />
		
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

const onListSelect = (event: any) => {
	(window as any).Variable?.listSelect?.(event);
};
const onListRecord = (event: any) => {
	(window as any).Variable?.listRecord?.(event);
};
const onListPopup = (event: any) => {
	(window as any).Variable?.listPopup?.(event);
};
const onListOpen = (event: any) => {
	(window as any).Variable?.listOpen?.(event);
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
