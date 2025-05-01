const path = require("path");
const { default: bs58 } = require("bs58");

const projectRoot = path.resolve(__dirname, "../..");
const obsignoPath = path.join(projectRoot, "index.js");

function importPath() {
	return obsignoPath;
}

const formatUint8Array = (input) => {
	if (input instanceof Uint8Array) {
		return input;
	} else if (Buffer.isBuffer(input)) {
		return new Uint8Array(input);
	} else if (typeof input === "string") {
		return bs58.decode(input);
	} else {
		console.log("Invalid input");
		return;
	}
};

const formatBase58 = (input) => {
	if (input instanceof Uint8Array) {
		return bs58.encode(input);
	} else if (Buffer.isBuffer(input)) {
		return bs58.encode(input);
	} else {
		console.log("Invalid input");
		return;
	}
};

module.exports = { importPath, formatUint8Array, formatBase58 };
