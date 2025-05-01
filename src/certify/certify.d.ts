declare module "obsigno" {
	/**
	 * Loads the custom message from the obsigno.js file.
	 * @returns {string} - Message result.
	 */
	export function reviewMessage(): string;

	/**
	 * Signs a message using the Ed25519 private key.
	 * @param {Object} params
	 * @param {string} params.message - The message to sign.
	 * @param {Uint8Array|Buffer|string} [params.privateKey] - Optional Ed25519 private key. If not provided, reads from file.
	 * @returns {Uint8Array} - Signature as Uint8Array.
	 */
	export function signMessage(params: {
		message: string;
		privateKey?: Uint8Array | Buffer | string;
	}): Uint8Array;

	/**
	 * Verifies a signed message using the Ed25519 public key.
	 * @param {Object} params
	 * @param {string} params.message - The original message.
	 * @param {Uint8Array|Buffer|string} [params.publicKey] - Optional Ed25519 public key. If not provided, reads from file.
	 * @param {Uint8Array|Buffer|string} params.signature - The signature to verify (Uint8Array, Buffer, or base58 string).
	 * @returns {boolean} - Verification result.
	 */
	export function verifyMessage(params: {
		message: string;
		publicKey?: Uint8Array | Buffer | string;
		signature: Uint8Array | Buffer | string;
	}): boolean;
}
