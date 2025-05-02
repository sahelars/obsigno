declare module "obsigno" {
	/**
	 * Loads the current Ed25519 keypair.
	 * If a secret key is provided, it will be used instead of the one on the filesystem.
	 *
	 * @param {Uint8Array|Buffer|string} [secretKey] - Optional secret key input.
	 * @returns {{ publicKey: Uint8Array, privateKey: Uint8Array, secretKey: Uint8Array }} The derived keypair.
	 */
	export function keypair(secretKey?: Uint8Array | Buffer | string): {
		publicKey: Uint8Array;
		privateKey: Uint8Array;
		secretKey?: Uint8Array;
	};

	/**
	 * Creates a new Ed25519 keypair and saves it to the filesystem.
	 * If a secret key is provided, it will be used to generate the keypair.
	 *
	 * @param {Uint8Array|Buffer|string} [secretKey] - Optional secret key input.
	 * @returns {boolean} Whether the keypair was successfully created.
	 */
	export function createKeypair(
		secretKey?: Uint8Array | Buffer | string
	): boolean;

	/**
	 * Generates a new random Ed25519 keypair without saving it to the filesystem.
	 *
	 * @returns {{ publicKey: Uint8Array, privateKey: Uint8Array, secretKey: Uint8Array }} The generated keypair.
	 */
	export function generateRandomKeypair(): {
		publicKey: Uint8Array;
		privateKey: Uint8Array;
		secretKey: Uint8Array;
	};
}
