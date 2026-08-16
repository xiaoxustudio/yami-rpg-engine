const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LEGACY_DIR = path.join(ROOT, 'src', 'legacy');
const MODULE_INIT = path.join(LEGACY_DIR, 'main', 'module-init.ts');

// 白名单：调用方直接 import 的功能模块，无需在 module-init 中副作用全量加载。
// 新增 legacy 模块必须加入 module-init.ts；确属此类模块时在此声明理由。
const EXCLUDE = [
	// types/：纯类型声明，仅被 import type 引用
	'types/animation-player.ts',
	'types/editor-event.ts',
	'types/file-browser-links.ts',
	'types/history.ts',
	'types/list-interface.ts',
	'types/marquee-area.ts',
	'types/tree-data.ts',
	'types/legacy-shapes.ts',
	'types/global-clipboard.ts',
	// util/：工具函数/惰性单例，Vue 组件与 store 直接 import
	'util/element-utils.ts',
	'util/doubleclick.ts',
	'util/monaco.ts',
	'util/icon-clip.ts',
	// utils/：attachElementApi 桥接工具，被 Vue 组件直接 import
	'utils/attach-element-api.ts',
	// components/：Wave2 迁移工厂（attachXxxApi），被对应 Vue SFC import
	'components/check-box.ts',
	'components/color-box.ts',
	'components/command-list.ts',
	'components/common-list.ts',
	'components/custom-box.ts',
	'components/custom-box-opts.ts',
	'components/var-factories.ts',
	'components/drag-and-drop-hint.ts',
	'components/file-var.ts',
	'components/keyboard-box.ts',
	'components/menu-list.ts',
	'components/number-box.ts',
	'components/number-var.ts',
	'components/radio-box.ts',
	'components/radio-proxy.ts',
	'components/select-box.ts',
	'components/select-list.ts',
	'components/select-var.ts',
	'components/slider-box.ts',
	'components/string-var.ts',
	'components/text-area.ts',
	'components/text-box.ts',
	'components/textarea-var.ts',
	'components/tree-list.ts',
	// command/：被 CustomBox.vue import
	'command/preset-accessor-factory.ts',
	// tools/：被 local-window/variable/enum-window/attribute-window import
	'tools/list-clipboard-methods.ts',
	// tools/：工具实例注册表，被 initialize.ts 与 stores/tool.ts 直接 import
	'tools/tool-registry.ts',
	// module/settingconfig/：barrel + 内部实现，被 global/resource/open/home-page 等 import
	'module/settingconfig/index.ts',
	'module/settingconfig/renderer.ts',
	'module/settingconfig/schema.ts',
	'module/settingconfig/types.ts',
	// module/command/：P6 前置（module-init 收口）——命令注册由 composables/commands/*.ts 副作用 import 覆盖，
	// AppShell 渲染全部命令组件后（lazyComponentsReady）才执行 initAll，注册时机安全
	'module/command/activateScene.ts',
	'module/command/addAnimationComponent.ts',
	'module/command/appendTarget.ts',
	'module/command/block.ts',
	'module/command/callEvent.ts',
	'module/command/castSkill.ts',
	'module/command/changeActorAnimation.ts',
	'module/command/changeActorEquipment.ts',
	'module/command/changeActorMotion.ts',
	'module/command/changeActorPortrait.ts',
	'module/command/changeActorSkill.ts',
	'module/command/changeActorSprite.ts',
	'module/command/changeActorState.ts',
	'module/command/changeActorTeam.ts',
	'module/command/changePassableTerrain.ts',
	'module/command/changeThreat.ts',
	'module/command/clampCamera.ts',
	'module/command/commandLine.ts',
	'module/command/comment.ts',
	'module/command/controlButton.ts',
	'module/command/controlDialog.ts',
	'module/command/createActor.ts',
	'module/command/createElement.ts',
	'module/command/createGlobalActor.ts',
	'module/command/createObject.ts',
	'module/command/createTrigger.ts',
	'module/command/deleteActor.ts',
	'module/command/deleteElement.ts',
	'module/command/deleteGlobalActor.ts',
	'module/command/deleteObject.ts',
	'module/command/deleteTile.ts',
	'module/command/deleteVariable.ts',
	'module/command/detectTargets.ts',
	'module/command/discardTargets.ts',
	'module/command/downloadFile.ts',
	'module/command/fixAngle.ts',
	'module/command/followActor.ts',
	'module/command/forEach.ts',
	'module/command/gameData.ts',
	'module/command/getActor.ts',
	'module/command/getMultipleActors.ts',
	'module/command/getObjectProperty.ts',
	'module/command/getTarget.ts',
	'module/command/httpRequest.ts',
	'module/command/if.ts',
	'module/command/jumpTo.ts',
	'module/command/label.ts',
	'module/command/loadImage.ts',
	'module/command/loadScene.ts',
	'module/command/loadSubscene.ts',
	'module/command/loop.ts',
	'module/command/moveActor.ts',
	'module/command/moveCamera.ts',
	'module/command/moveElement.ts',
	'module/command/moveLight.ts',
	'module/command/nestElement.ts',
	'module/command/playActorAnimation.ts',
	'module/command/playAnimation.ts',
	'module/command/playAudio.ts',
	'module/command/registerEvent.ts',
	'module/command/removeAnimationComponent.ts',
	'module/command/removeTarget.ts',
	'module/command/renderOutline.ts',
	'module/command/requestURL.ts',
	'module/command/resetTargets.ts',
	'module/command/restoreAudio.ts',
	'module/command/return.ts',
	'module/command/saveAudio.ts',
	'module/command/script.ts',
	'module/command/setActive.ts',
	'module/command/setAmbientLight.ts',
	'module/command/setAngle.ts',
	'module/command/setAnimation.ts',
	'module/command/setAnimationComponent.ts',
	'module/command/setBoolean.ts',
	'module/command/setButton.ts',
	'module/command/setCooldown.ts',
	'module/command/setCursor.ts',
	'module/command/setDialogBox.ts',
	'module/command/setElement.ts',
	'module/command/setEvent.ts',
	'module/command/setFocus.ts',
	'module/command/setGameSpeed.ts',
	'module/command/setImage.ts',
	'module/command/setInventory.ts',
	'module/command/setItem.ts',
	'module/command/setLanguage.ts',
	'module/command/setList.ts',
	'module/command/setLoop.ts',
	'module/command/setMovementSpeed.ts',
	'module/command/setNumber.ts',
	'module/command/setObject.ts',
	'module/command/setObjectAnimation.ts',
	'module/command/setPan.ts',
	'module/command/setPartyMember.ts',
	'module/command/setPlayerActor.ts',
	'module/command/setPointerEventRoot.ts',
	'module/command/setProgressBar.ts',
	'module/command/setResolution.ts',
	'module/command/setReverb.ts',
	'module/command/setShortcut.ts',
	'module/command/setSkill.ts',
	'module/command/setState.ts',
	'module/command/setString.ts',
	'module/command/setTarget.ts',
	'module/command/setTeamRelation.ts',
	'module/command/setTerrain.ts',
	'module/command/setText.ts',
	'module/command/setTextBox.ts',
	'module/command/setTile.ts',
	'module/command/setTriggerAngle.ts',
	'module/command/setTriggerDuration.ts',
	'module/command/setTriggerMotion.ts',
	'module/command/setTriggerSpeed.ts',
	'module/command/setVideo.ts',
	'module/command/setVolume.ts',
	'module/command/setWeight.ts',
	'module/command/setWindow.ts',
	'module/command/setZoomFactor.ts',
	'module/command/shakeScreen.ts',
	'module/command/showChoices.ts',
	'module/command/showText.ts',
	'module/command/simulateKey.ts',
	'module/command/stopActorAnimation.ts',
	'module/command/stopAudio.ts',
	'module/command/stopEvent.ts',
	'module/command/switch.ts',
	'module/command/switchCollisionSystem.ts',
	'module/command/tintImage.ts',
	'module/command/tintScreen.ts',
	'module/command/transferGlobalActor.ts',
	'module/command/transition.ts',
	'module/command/translateActor.ts',
	'module/command/unloadSubscene.ts',
	'module/command/uploadFile.ts',
	'module/command/useItem.ts',
	'module/command/wait.ts',
	'module/command/waitForVideo.ts',
	'module/command/webSocketClose.ts',
	'module/command/webSocketConnect.ts',
	'module/command/webSocketSend.ts'
];

const EXCLUDE_SET = new Set(EXCLUDE);

function walk(dir, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			// __tests__/ 为 vitest 测试目录，非运行时模块（不经 module-init 加载）
			if (entry.name === '__tests__') continue;
			walk(full, out);
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			out.push(full);
		}
	}
	return out;
}

const rel = (p) => path.relative(LEGACY_DIR, p).replace(/\\/g, '/');
const SRC_DIR = path.resolve(ROOT, 'src');
const resolveImport = (fromDir, spec) => {
	let target;
	if (spec.startsWith('@app/')) {
		target = path.resolve(SRC_DIR, spec.slice(5));
	} else if (spec.startsWith('@/')) {
		target = path.resolve(LEGACY_DIR, spec.slice(2));
	} else {
		target = path.resolve(fromDir, spec);
	}
	if (!target.endsWith('.ts')) target += '.ts';
	return target;
};

function main() {
	if (!fs.existsSync(MODULE_INIT)) {
		console.error(`check-module-init: 未找到 ${MODULE_INIT}`);
		process.exit(1);
	}

	const content = fs.readFileSync(MODULE_INIT, 'utf8');
	const mainDir = path.dirname(MODULE_INIT);
	const imported = new Set();
	const importErrors = [];
	for (const m of content.matchAll(/^import\s+['"]([^'"]+)['"]/gm)) {
		const spec = m[1];
		const target = resolveImport(mainDir, spec);
		if (!fs.existsSync(target)) {
			importErrors.push(`${rel(target)}（import '${spec}' 指向的文件不存在）`);
			continue;
		}
		imported.add(rel(target));
	}

	const onDisk = new Set(walk(LEGACY_DIR).map((p) => rel(p)));
	onDisk.delete('main/module-init.ts');

	const missing = [];
	for (const file of [...onDisk].sort()) {
		if (!imported.has(file) && !EXCLUDE_SET.has(file)) {
			missing.push(file);
		}
	}

	const stale = EXCLUDE.filter((f) => !onDisk.has(f));

	const errors = [...importErrors, ...missing];
	if (errors.length > 0) {
		console.error('check-module-init: FAILED');
		for (const e of errors) console.error(`  MISSING import: ${e}`);
		for (const s of stale)
			console.warn(`  WARN EXCLUDE 过期（文件已删除，建议清理白名单）: ${s}`);
		process.exit(1);
	}

	console.log(`check-module-init: OK（${imported.size} 个模块，白名单 ${EXCLUDE.length} 个）`);
	if (stale.length > 0) {
		for (const s of stale)
			console.warn(`  WARN EXCLUDE 过期（文件已删除，建议清理白名单）: ${s}`);
	}
}

main();
