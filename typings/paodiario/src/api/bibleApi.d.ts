
/**
 * @typedef {Object} BibleTranslation
 * @property {string} id
 * @property {string} name
 * @property {string} abbreviation
 * @property {string} language
 */

/** @type {Record<string, BibleTranslation>} */
declare interface BIBLE_TRANSLATIONSType {
	static acf: {
	static id: string;

	static name: string;

	static abbreviation: string;

	static language: string;
	};

	static ara: {
	static id: string;

	static name: string;

	static abbreviation: string;

	static language: string;
	};

	static arc: {
	static id: string;

	static name: string;

	static abbreviation: string;

	static language: string;
	};

	static nvi: {
	static id: string;

	static name: string;

	static abbreviation: string;

	static language: string;
	};

	static naa: {
	static id: string;

	static name: string;

	static abbreviation: string;

	static language: string;
	};
}

declare interface BIBLE_BOOKSType {
	static oldTestament: ({	} | any)[];

	static newTestament: ({	} | any)[];
}
