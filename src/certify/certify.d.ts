declare module "obsigno" {
	/**
	 * Loads the custom message from the obsigno.js file.
	 *
	 * @returns {string} The configured message.
	 */
	export function reviewMessage(): string;

	/**
	 * Signs a message using the Ed25519 private key.
	 * If a private key is not provided, it will be loaded from the filesystem.
	 *
	 * @param {Object} params - Signing options.
	 * @param {string} params.message - The message to sign.
	 * @param {Uint8Array|Buffer|string} [params.privateKey] - Optional private key to use.
	 * @returns {Uint8Array} The message signature.
	 */
	export function signMessage(params: {
		message: string;
		privateKey?: Uint8Array | Buffer | string;
	}): Uint8Array;

	/**
	 * Verifies a signed message using an Ed25519 public key.
	 *
	 * @param {Object} params - Verification options.
	 * @param {string} params.message - The original message.
	 * @param {Uint8Array|Buffer|string} params.publicKey - The public key that should match the signature.
	 * @param {Uint8Array|Buffer|string} params.signature - The signature to verify.
	 * @returns {boolean} Whether the signature is valid.
	 */
	export function verifyMessage(params: {
		message: string;
		publicKey?: Uint8Array | Buffer | string;
		signature: Uint8Array | Buffer | string;
	}): boolean;
}
