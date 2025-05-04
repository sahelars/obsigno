const BASE58_ALPHABET =
	"123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const toUint8Array = (input) => {
	if (input instanceof Uint8Array) {
		return input;
	} else if (Buffer.isBuffer(input)) {
		return new Uint8Array(input);
	} else if (typeof input === "string") {
		return decodeBase58(input);
	} else {
		console.log("Invalid input");
		return null;
	}
};

const encodeBase58 = (input) => {
	if (!(input instanceof Uint8Array) && !Buffer.isBuffer(input)) {
		console.log("Input must be a Uint8Array or Buffer");
		return null;
	}
	let digits = [0];
	for (let i = 0; i < input.length; ++i) {
		let carry = input[i];
		for (let j = 0; j < digits.length; ++j) {
			carry += digits[j] << 8;
			digits[j] = carry % 58;
			carry = (carry / 58) | 0;
		}
		while (carry > 0) {
			digits.push(carry % 58);
			carry = (carry / 58) | 0;
		}
	}
	for (let k = 0; k < input.length && input[k] === 0; ++k) {
		digits.push(0);
	}
	return digits
		.reverse()
		.map((d) => BASE58_ALPHABET[d])
		.join("");
};

const decodeBase58 = (input) => {
	const BASE58_MAP = {};
	for (let i = 0; i < BASE58_ALPHABET.length; i++) {
		BASE58_MAP[BASE58_ALPHABET[i]] = i;
	}
	if (typeof input !== "string") {
		console.log("Input must be a Base58-encoded string");
		return null;
	}
	let bytes = [0];
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		const value = BASE58_MAP[char];
		if (value === undefined) {
			console.log(`Invalid Base58 character '${char}'`);
			return null;
		}

		let carry = value;
		for (let j = 0; j < bytes.length; j++) {
			carry += bytes[j] * 58;
			bytes[j] = carry & 0xff;
			carry >>= 8;
		}

		while (carry > 0) {
			bytes.push(carry & 0xff);
			carry >>= 8;
		}
	}
	for (let k = 0; k < input.length && input[k] === "1"; k++) {
		bytes.push(0);
	}
	return new Uint8Array(bytes.reverse());
};

module.exports = { toUint8Array, encodeBase58, decodeBase58 };
