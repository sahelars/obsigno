declare module "obsigno" {
	/**
	 * Views the keypair.
	 * @param {Uint8Array|Buffer|string} [secretKey] - Optional Ed25519 secret key. If provided, will be included in the returned keypair.
	 * @returns {{ publicKey: Uint8Array, privateKey: Uint8Array, secretKey: Uint8Array }} - Keypair result.
	 */
	export function keypair(secretKey?: Uint8Array | Buffer | string): {
		publicKey: Uint8Array;
		privateKey: Uint8Array;
		secretKey?: Uint8Array;
	};

	/**
	 * Creates a new keypair.
	 * @param {Uint8Array|Buffer|string} [secretKey] - Optional Ed25519 secret key. If not provided, a new random keypair will be created.
	 * @returns {boolean} - Keypair creation result.
	 */
	export function createKeypair(
		secretKey?: Uint8Array | Buffer | string
	): boolean;
}
