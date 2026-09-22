import { Inspector } from '@app/inspector/inspector.ts';

interface InputEditor {
	target: unknown;
}

/**
 * 历史所有者（Owner）：调用方传的是遗留单例（Animation / Scene / UI）。
 *
 * ## 为什么是 object 而不是 { history: unknown }（2026-09-21 第 89 轮）
 *
 * 这里的 receiver **只用于透传**（真正的读取发生在 inspector.ts 的 owner.history!.save(data)），
 * 所以本接口**不需要**声明 history。而一旦声明，就会踩到 TS 的 **weak type 检测**：
 * { history: unknown } 是「全是可选属性」的弱类型，Animation / Scene 虽然在运行期有 history，
 * 但它们的**形状是索引签名**（[k: string]: any）⇒ 与弱类型**没有已知公共属性** ⇒ TS2559。
 *
 * 于是 18 个调用点只能各写一遍 as unknown as { history: unknown }。
 * 声明成 object（不假设任何键）后，这 18 处断言全部消失 —— 这是「修声明，而不是修 N 个读点」。
 *
 * 代价如实记录：bindInput 的 owner 形参**不再静态约束**「必须有 history」，
 * 而 editor / owner 的实参顺序转置正是 inspector-input-owner.spec.ts 在守的那类缺陷。
 * 该 spec 仍然必需 —— 它挡的是类型系统本来就挡不住的东西（两个形参都是结构类型）。
 */
export type InputOwner = object;

export function useInspectorInput() {
	const inputFocus = Inspector.inputFocus;

	const inputBlur = (
		editor: InputEditor,
		owner: InputOwner,
		callback?: (data: Record<string, unknown>) => void
	) => {
		if (!Inspector.inputBlur) {
			return () => {};
		}
		return Inspector.inputBlur(editor, owner, callback as never);
	};

	const sliderFocus = Inspector.sliderFocus;
	const sliderBlur = Inspector.sliderBlur;

	function bindInput(
		elements: Element[] | NodeListOf<Element>,
		editor: InputEditor,
		owner: InputOwner,
		callback?: (data: Record<string, unknown>) => void
	) {
		const blur = inputBlur(editor, owner, callback);
		(elements as HTMLElement[]).forEach((el) => {
			el.addEventListener('focus', inputFocus);
			el.addEventListener('blur', blur);
		});
	}

	function bindSliders(sliders: Element[] | NodeListOf<Element>) {
		if (!sliderFocus || !sliderBlur) {
			return;
		}
		(sliders as HTMLElement[]).forEach((el) => {
			el.addEventListener('focus', sliderFocus);
			el.addEventListener('blur', sliderBlur);
		});
	}

	return {
		inputFocus,
		inputBlur,
		sliderFocus,
		sliderBlur,
		bindInput,
		bindSliders
	};
}
