# obsigno

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/sahelars/obsigno/blob/master/LICENSE.md)

### Use obsigno to easily sign, verify, and write custom messages

Edit a single txt file to quickly review and sign large messages. No complex setup needed.

## Requirements

- Node.js (v12 or newer)

## Persistent storage

When `obsigno create --keypair` is run, a keypair is saved to the home directory as ~/.local/share/obsigno/data.json and ~/.config/obsigno/id.bin. The file for obsigno.txt is added in the current terminal directory when `obsigno create --message` is run.

## Install

Install obsigno globally with npm:

```bash
npm install -g obsigno
```

## Setup

### 1. Add Ed25519 keypair

Add new keypair:

```bash
obsigno create --keypair
```

Or add existing secret key:

```bash
obsigno create --keypair YOUR_SECRET_KEY
```

### 2. Add obsigno.txt file

Add obsigno.txt to your preferred working directory:

```bash
obsigno create --message
```

### 3. (Optional) Modify obsigno.txt

Create a custom message by modifying obsigno.txt:

```
I, $PUBLIC_KEY, hereby certify and notarize this message.

Signed: $CURRENT_DATE
Expires: $EXPIRES_IN_0H5M33S

$ACCESS_CODE
```

Returns the pubic key:

```
$PUBLIC_KEY
```

Returns the current date:

```
$CURRENT_DATE
```

Returns the expiration date:

```
$EXPIRES_IN_12H0M0S
```

Returns a URL-safe access code extension:

```
$ACCESS_CODE
```

## Usage

### Review message

Review the obsigno.txt message before signing:

```bash
obsigno review
```

Review a custom message.txt file before signing:

```bash
obsigno review message.txt
```

### Sign message

Sign the message:

```bash
obsigno sign
```

Sign a custom message.txt file:

```bash
obsigno sign message.txt
```

### Verify message

Verify a signed message:

```bash
obsigno verify
```

Verify a signed.txt file:

```bash
obsigno verify signed.txt
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
