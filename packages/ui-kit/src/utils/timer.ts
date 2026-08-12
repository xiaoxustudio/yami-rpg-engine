export class Timer {
	target: EventTarget | null = null;
	running = false;
	elapsed = 0;
	playbackRate = 1;
	private timeoutId: ReturnType<typeof setTimeout> | null = null;
	private duration: number;
	private callback: (timer: Timer) => void;

	constructor({ duration, callback }: { duration: number; callback: (timer: Timer) => void }) {
		this.duration = duration;
		this.callback = callback;
	}

	add(): Timer {
		this.timeoutId = setTimeout(() => {
			this.timeoutId = null;
			this.elapsed = this.duration;
			this.callback(this);
		}, this.duration);
		return this;
	}

	finish(): void {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
			this.elapsed = this.duration;
			this.callback(this);
		}
	}

	remove(): Timer {
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
		return this;
	}
}
