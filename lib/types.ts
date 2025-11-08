export type PrayerStatus = "pending" | "approved" | "rejected";

export interface Comment {
	_id: string;
	content: string;
	createdAt: string;
	user: {
		_id: string;
		name: string;
	};
	likes?: Array<{
		_id: string;
		name: string;
	}>;
	replies?: Comment[];
	parentComment?: {
		_type: "reference";
		_ref: string;
	};
}

export interface PrayerRequestDoc {
	_id: string;
	_createdAt: string;
	name?: string;
	isAnonymous?: boolean;
	title?: string;
	content: any; // Portable Text blocks
	group?: string;
	status: PrayerStatus;
	prayedCount?: number;
	comments?: Comment[];
	userId?: string;
	userName?: string;
}

export interface DailyReflectionDoc {
	_id: string;
	_createdAt: string;
	title: string;
	date: string;
	content: any; // Portable Text blocks
	author?: string;
	scripture?: string;
	isPublished: boolean;
}

export type TestimonyStatus = "pending" | "approved" | "rejected";

export interface TestimonyDoc {
	_id: string;
	_createdAt: string;
	name?: string;
	isAnonymous?: boolean;
	title?: string;
	content: any; // Portable Text blocks
	group?: string;
	status: TestimonyStatus;
	encouragedCount?: number;
	userId?: string;
	userName?: string;
}


