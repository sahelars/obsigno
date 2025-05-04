const { expect } = require("chai");
const Keypair = require("../src/keypair/keypair");

describe("Keypair tests", () => {
	it("should expect keypair in Uint8Array", () => {
		Keypair.addNewKeypair();
		const keypair = Keypair.keypair();
		expect(keypair.publicKey).to.have.length(
			32,
			"Public key Uint8Array should be 32 bytes"
		);
		expect(keypair.privateKey).to.have.length(
			32,
			"Private key Uint8Array should be 32 bytes"
		);
		expect(keypair.secretKey).to.have.length(
			64,
			"Secret key Uint8Array should be 64 bytes"
		);
	});

	it("should expect keypair from secret key", () => {
		const keys = Keypair.generateKeypair();
		const keypair = Keypair.keypair(keys.secretKey);
		expect(keypair.publicKey).to.have.length(
			32,
			"Public key Uint8Array should be 32 bytes"
		);
		expect(keypair.privateKey).to.have.length(
			32,
			"Private key Uint8Array should be 32 bytes"
		);
		expect(keypair.secretKey).to.have.length(
			64,
			"Secret key Uint8Array should be 64 bytes"
		);
	});
});
