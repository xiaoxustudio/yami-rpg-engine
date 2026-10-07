export class GUID {
	static regExpForChecking = /[a-f]/;

	static generate32bit() {
		const n = Math.random() * 0x100000000;
		const s = Math.floor(n).toString(16);
		return s.length === 8 ? s : s.padStart(8, '0');
	}

	static generate64bit() {
		let id;
		do {
			id = this.generate32bit() + this.generate32bit();
		} while (!this.regExpForChecking.test(id));
		return id;
	}
}
