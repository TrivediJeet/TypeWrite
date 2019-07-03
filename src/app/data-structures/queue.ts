export class Queue<T> {
	store: T[] = [];
	push(val: T) {
		this.store.push(val);
	}
	pop(): T | undefined {
		return this.store.shift();
	}
	peek(): T | undefined {
		return this.store[0] || undefined;
	}
}
