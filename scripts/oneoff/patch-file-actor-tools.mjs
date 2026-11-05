import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = 'packages/editor/src/components/tools';

/** 三个单控件窗口：`registryRef` → 模板 ref + 交出 `loadXxx(items)`。 */
const singles = [
	{
		file: 'FileActorSprite.vue',
		id: 'fileActor-sprite-id',
		refName: 'spriteIdRef',
		api: 'FileActorSpriteApi',
		provide: 'provideFileActorSprite',
		reset: 'resetFileActorSprite',
		method: 'loadIds',
		call: 'spriteIdRef.value?.loadItems(items)'
	},
	{
		file: 'FileActorSkill.vue',
		id: 'fileActor-skill-key',
		refName: 'skillKeyRef',
		api: 'FileActorSkillApi',
		provide: 'provideFileActorSkill',
		reset: 'resetFileActorSkill',
		method: 'loadKeys',
		call: 'skillKeyRef.value?.loadItems(items)'
	},
	{
		file: 'FileActorEquipment.vue',
		id: 'fileActor-equipment-slot',
		refName: 'equipmentSlotRef',
		api: 'FileActorEquipmentApi',
		provide: 'provideFileActorEquipment',
		reset: 'resetFileActorEquipment',
		method: 'loadSlots',
		call: 'equipmentSlotRef.value?.loadItems(items)'
	}
];

for (const single of singles) {
	const path = `${ROOT}/${single.file}`;
	let text = readFileSync(path, 'utf8');
	text = text.replace(
		`:ref="registryRef(inspectorEls, '${single.id}')"`,
		`ref="${single.refName}"`
	);
	text = text.replace("import { inspectorEls } from '@app/inspector/element-registry.ts';\n", '');
	text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
	text = text.replace(
		"import { onMounted } from 'vue';",
		"import { onMounted, onUnmounted, ref } from 'vue';"
	);
	if (!text.includes('file-actor-tool-bridges')) {
		text = text.replace(
			"import { useI18n } from 'vue-i18n';",
			`import { useI18n } from 'vue-i18n';\nimport {\n\t${single.provide},\n\t${single.reset},\n\ttype ${single.api}\n} from '@app/composables/file-actor-tool-bridges';`
		);
	}
	const wiring = `
/** 这个窗口只负责一件事：给单例把候选项灌进控件。 */
const ${single.refName} = ref<InstanceType<typeof SelectBox> | null>(null);

const bridgeApi: ${single.api} = {
	${single.method}: (items) => {
		${single.call};
	}
};

onMounted(() => {
	${single.provide}(bridgeApi);
	onUnmounted(() => ${single.reset}(bridgeApi));
});
`;
	text = text.replace(/onMounted\(\(\) => \{\}\);\n/, wiring);
	writeFileSync(path, text);
	console.log(`✎ ${single.file}`);
}

/** 库存窗口：类型候选项 + 「类型 → 显示哪几行」一次性交出。 */
{
	const path = `${ROOT}/FileActorInventoryGoods.vue`;
	let text = readFileSync(path, 'utf8');
	for (const [id, refName] of [
		['fileActor-inventory-type', 'typeRef'],
		['fileActor-inventory-item-id', 'itemIdRef'],
		['fileActor-inventory-item-quantity', 'itemQuantityRef'],
		['fileActor-inventory-equipment-id', 'equipmentIdRef'],
		['fileActor-inventory-money', 'moneyRef']
	]) {
		text = text.replace(`:ref="registryRef(inspectorEls, '${id}')"`, `ref="${refName}"`);
	}
	text = text.replace("import { inspectorEls } from '@app/inspector/element-registry.ts';\n", '');
	text = text.replace("import { registryRef } from '@app/utils/element-registry';\n", '');
	text = text.replace(
		"import { onMounted } from 'vue';",
		"import { onMounted, onUnmounted, ref } from 'vue';"
	);
	if (!text.includes('file-actor-tool-bridges')) {
		text = text.replace(
			"import { useI18n } from 'vue-i18n';",
			"import { useI18n } from 'vue-i18n';\nimport {\n\tprovideFileActorInventory,\n\tresetFileActorInventory,\n\ttype FileActorInventoryApi\n} from '@app/composables/file-actor-tool-bridges';"
		);
	}
	if (!text.includes('controlRoot')) {
		text = text.replace(
			"import { useI18n } from 'vue-i18n';",
			"import { useI18n } from 'vue-i18n';\nimport { controlRoot } from '@app/composables/control-refs';"
		);
	}
	const wiring = `
/**
 * 库存窗口的两件事一次交出：类型候选项 + 按类型开关后面几行。
 * \`relate()\` 的目标是 DOM 语义，用 \`controlRoot(...)\` 取根元素。
 */
const typeRef = ref<InstanceType<typeof SelectBox> | null>(null);
const itemIdRef = ref<InstanceType<typeof SelectBox> | null>(null);
const itemQuantityRef = ref<InstanceType<typeof NumberBox> | null>(null);
const equipmentIdRef = ref<InstanceType<typeof SelectBox> | null>(null);
const moneyRef = ref<InstanceType<typeof NumberBox> | null>(null);

const bridgeApi: FileActorInventoryApi = {
	setupTypeRows: () => {
		const type = typeRef.value;
		type?.loadItems([
			{ name: 'Item', value: 'item' },
			{ name: 'Equipment', value: 'equipment' },
			{ name: 'Money', value: 'money' }
		]);
		type?.enableHiddenMode?.().relate?.([
			{
				case: 'item',
				targets: [controlRoot(itemIdRef.value), controlRoot(itemQuantityRef.value)]
			},
			{ case: 'equipment', targets: [controlRoot(equipmentIdRef.value)] },
			{ case: 'money', targets: [controlRoot(moneyRef.value)] }
		]);
	}
};

onMounted(() => {
	provideFileActorInventory(bridgeApi);
	onUnmounted(() => resetFileActorInventory(bridgeApi));
});
`;
	text = text.replace(/onMounted\(\(\) => \{\}\);\n/, wiring);
	writeFileSync(path, text);
	console.log('✎ FileActorInventoryGoods.vue');
}
