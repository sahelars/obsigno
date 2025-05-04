declare module "obsigno" {
	/**
	 * Returns the resolved package import path.
	 *
	 * @returns {string} The package import path.
	 */
	export function importPath(): string;

	/**
	 * Converts a Buffer or string into a Uint8Array.
	 *
	 * @param {Buffer|string} input - The input data to convert.
	 * @returns {Uint8Array} A Uint8Array representing the input.
	 */
	export function toUint8Array(input: Buffer | string): Uint8Array;

	/**
	 * Encodes binary data (Uint8Array or Buffer) into a Base58 string.
	 *
	 * @param {Uint8Array|Buffer} input - The binary data to encode.
	 * @returns {string} The encoded Base58 string.
	 */
	export function encodeBase58(input: Uint8Array | Buffer): string;

	/**
	 * Decodes a Base58-encoded string into a Uint8Array.
	 *
	 * @param {string} input - The Base58 string to decode.
	 * @returns {Uint8Array} The decoded binary data.
	 */
	export function decodeBase58(input: string): Uint8Array;

	/**
	 * Reads a text file and interprets the variables in it
	 *
	 * @param {string} filePath - Path to the file to be read
	 * @returns {Object} Object with interpreted variables and the template content
	 */
	export function readAndInterpretMessageFile(
		filePath: string,
		publicKeyPath: string
	): {
		content: string;
		variables: Record<string, string>;
		template: string;
	};
}
