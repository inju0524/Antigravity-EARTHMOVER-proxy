export interface TrafficLogItem {
	id: string;
	timestamp: string;
	timeStr: string;
	status: number;
	method: string;
	path: string;
	model: string;
	protocol: "OpenAI" | "sdapi" | "warmup" | "debug" | "responses" | "other";
	account: string;
	durationMs: number;
	tokens: {
		input: number;
		output: number;
		total: number;
	};
	request: {
		headers: Record<string, string>;
		body: any;
	};
	response: {
		headers: Record<string, string>;
		body: any;
		isStream?: boolean;
		reasoning?: string;
	};
}

class TrafficLogStore {
	private logs: TrafficLogItem[] = [];
	private maxLogs = 500;
	private recording = true;

	public isRecording(): boolean {
		return this.recording;
	}

	public setRecording(state: boolean) {
		this.recording = state;
	}

	public addLog(entry: TrafficLogItem) {
		if (!this.recording) return;

		this.logs.unshift(entry);
		if (this.logs.length > this.maxLogs) {
			this.logs.length = this.maxLogs;
		}
	}

	public getLogs(limit = 100, offset = 0, query?: string, accountFilter?: string, statusFilter?: string): {
		items: TrafficLogItem[];
		total: number;
		normalCount: number;
		errorCount: number;
		recording: boolean;
	} {
		let filtered = this.logs;

		if (accountFilter && accountFilter !== "all") {
			filtered = filtered.filter((l) => l.account === accountFilter);
		}

		if (statusFilter === "error") {
			filtered = filtered.filter((l) => l.status >= 400);
		} else if (statusFilter === "normal") {
			filtered = filtered.filter((l) => l.status >= 200 && l.status < 400);
		}

		if (query && query.trim()) {
			const q = query.trim().toLowerCase();
			filtered = filtered.filter(
				(l) =>
					l.model.toLowerCase().includes(q) ||
					l.path.toLowerCase().includes(q) ||
					l.account.toLowerCase().includes(q) ||
					l.protocol.toLowerCase().includes(q) ||
					String(l.status).includes(q) ||
					l.method.toLowerCase().includes(q)
			);
		}

		const normalCount = this.logs.filter((l) => l.status >= 200 && l.status < 400).length;
		const errorCount = this.logs.filter((l) => l.status >= 400).length;

		const items = filtered.slice(offset, offset + limit);

		return {
			items,
			total: filtered.length,
			normalCount,
			errorCount,
			recording: this.recording
		};
	}

	public getLogById(id: string): TrafficLogItem | undefined {
		return this.logs.find((l) => l.id === id);
	}

	public updateLog(id: string, updates: Partial<TrafficLogItem>) {
		const item = this.logs.find((l) => l.id === id);
		if (item) {
			Object.assign(item, updates);
		}
	}

	public clearLogs() {
		this.logs = [];
	}

	public getAccounts(): string[] {
		const set = new Set<string>();
		for (const l of this.logs) {
			if (l.account) set.add(l.account);
		}
		return Array.from(set);
	}
}

export const trafficLogger = new TrafficLogStore();

export function maskEmail(email?: string): string {
	if (!email) return "primary (GCP)";
	const parts = email.split("@");
	if (parts.length !== 2) return email;
	const [user, domain] = parts;
	if (user.length <= 3) return `${user}***@${domain}`;
	return `${user.slice(0, 3)}***@${domain}`;
}
