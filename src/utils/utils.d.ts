declare module "obsigno" {
	/**
	 * Views the package import path.
	 * @returns {string} - Package import path result.
	 */
	export function importPath(): string;

	/**
	 * Formats an input string or Buffer to a Uint8Array.
	 * @param {Uint8Array|Buffer|string} input - Input to format.
	 * @returns {Uint8Array} - Uint8Array result.
	 */
	export function formatUint8Array(
		input: Uint8Array | Buffer | string
	): Uint8Array;

	/**
	 * Formats an input Uint8Array or Buffer to a base58 string.
	 * @param {Uint8Array|Buffer|string} input - Input to format.
	 * @returns {string} - Base58 string result.
	 */
	export function formatBase58(input: Uint8Array | Buffer | string): string;
}
