# obsigno

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sahelars/obsigno/blob/master/LICENSE.md)

### Use obsigno to easily sign, verify, and write custom messages

Edit a single javascript file to quickly review and sign large messages. No complex setup needed.

## Requirements

- Node.js (v12 or newer)

## Persistent storage

When `obsigno create --keypair` is run, a keypair is saved to the home directory as ~/.local/share/obsigno/data.json, ~/.config/obsigno/id.bin. The file for obsigno.txt is added in the current terminal directory when `obsigno create --message` is run.

## Install

Install obsigno globally with npm:

```bash
npm install -g obsigno
```

## Setup message

### 1. Add obsigno.js

Setup keypair and add obsigno.js to your preferred working directory:

```bash
obsigno create
```

Install with existing Ed25519 secret key:

```bash
obsigno create YOUR_SECRET_KEY
```

### 2. (Optional) Modify obsigno.js

Create a custom message by modifying obsigno.js:

```js
const message = "Hello, world!";
const review = `${message} (UNCERTIFIED)`;

// REQUIRED: `obsignoMessage` AND `obsignoCertify`
module.exports = {
	obsignoMessage: review,
	obsignoCertify: message
};
```

## Usage

### Review message

Review the obsigno.js message before signing:

```bash
obsigno review
```

### Sign message

Sign the message:

```bash
obsigno sign
```

Sign a custom input message:

```bash
obsigno sign "hello i'm real"
```

### Verify message

Verify a message using the public key and signature:

```bash
obsigno verify "hello i'm real" PUBLIC_KEY SIGNATURE
```

### Ed25519 keypair

View your public key:

```bash
obsigno keypair --public
```

View your private key:

```bash
obsigno keypair --private
```

View your secret key:

```bash
obsigno keypair --secret
```
