declare global {
	interface ImportMeta {
		env: {
			HELLO: string;
			PUBLIC_HELLO: string;
		};
	}
}

export {};
