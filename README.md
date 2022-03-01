# tw3t

TOML Web3 Token (TW3T) is a self-contained web3 authentication token based on [TOML](https://toml.io/en/) format. It is designed as a more human readable alternative to JW3T for Web3 authentication usecases.

# Why TOML?

[TOML](https://toml.io/en/) is a human-friendly serialization format that is designed to be used as a minimal configuration format that is easy to read by humans. It intends to be more human readable than JSON and simpler than YAML. It unambiguously maps to a hash table and Its simplicity and minimal format makes it a good option for Web3 Tokens that are read and signed by humans.

# TW3T

In a tw3t the toml token consists of a **_message_** section, a **_token information_** section, and a **_signing specification_** section. The token is then signed by the user according to the specified signing specification. The base64Url encoded signature is concatenated by the base64Url encoded toml token to build the final signed tw3t.

The final signed token would look like as:
yyyyyy.zzzzzz
base64Url(toml) + “.” + base64Url(signature)

# TW3T Content:

The token content consists of 3 sections:

- Statement message:
  An optional message which can work as a greeting message to the user.
  Since toml supports comments it can also be set as an optional comment.
- Claim information:
  The included claims will be similar to what was describe for JW3T payload
- Signing Specification:
  The signing specification plays a similar role as JW3T header and is used in token signature validation.

# Verification:

In order to verify a token is valid, the following steps should be followed:
The signature should be verified to make sure it is valid.
The claimed address in the payload “payload.address” should be a valid address of an account based on the address type that is specified in the header “header.address-type” and match the address of the account that has signed the token.
The “not-before” and “expires-at” should be verified to make sure the token is not expired or used before it is valid.

# Example TW3T:

Scenario :
A user wants to sign in to a dapp using a proxy account.

The sign-in token can achieve this by including two claims:
on-behalf-of: The on-behalf-of claim specifies the address of the primary account that the sign-in account acts as a proxy for.
proxy-type: The proxy-type claim specifies what type of proxy the proxy account represents.

Example TW3T:

```
message = “””
Welcome to example.dapp.io!
Sign this message and accept the example.dapp.io Terms of Service: example.dapp.io/terms
“””

[information]
issued-at = 2022-02-02 07:32:00Z
not-before =  2022-02-03 07:32:00Z
expires-at =  2022-02-02 07:32:00Z
address = <signed-in account address>,
audience = “example.dapp.io”
on-behalf-of = <primary account address>
proxy-type = “governance”
nonce = “f88b789”

[specification]
algorithm = ”sr25519”,
address-type = ”ss58”,
token-type = ”TW3T”
```

After seeing these claims information in a token the app will know that any call during this sign-in session is a proxy call of type of “governance” by “signed-in account” on behalf of the specified “primary account address”.

As you might have noticed, a tw3t is more human readable and user-friendly than an equivalent jw3t. No curly brackets or commas! Toml also supports comments so a description can be added for each claim to let the users understand what they are signing.

A possible downside might be that the Toml format is still very young and does not have built-in support in programming languages which creates 3rd party dependencies or needs to be implemented by token signing/verification libraries.
