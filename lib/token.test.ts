import { SigSpec, ClaimInfo } from "./types.d";
import {
  TW3TContent,
  TW3TSigner,
  TW3TVerifier,
  PolkaJsSigner,
  PolkaJsVerifier,
} from "./index";
import { Keyring } from "@polkadot/keyring";
import { mnemonicGenerate } from "@polkadot/util-crypto";

test("test a valid tw3t using polkadot signer", async () => {
  let keyring = new Keyring({ type: "ed25519" });
  let mnemonic = mnemonicGenerate();
  let account = keyring.createFromUri(mnemonic);
  let signingAccount = { account };
  let address = account.address;

  let sigSpec = <SigSpec>{
    algorithm: "ed25519",
    token_type: "TW3T",
    address_type: "ss58",
  };
  let claimInfo = <ClaimInfo>{
    address: address,
  };

  let exp = new Date();
  exp.setHours(exp.getHours() + 24); // expire in 24 hours
  let content = new TW3TContent(claimInfo, sigSpec, "Welcome!")
    .setAudience("uri:test")
    .setExpiration(exp);
  console.log(content.stringify());
  let polkaJsSigner = new PolkaJsSigner(signingAccount);
  let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
  let { base64Content, base64Sig } = await tw3tSigner.getSignature();
  let tw3t = `${base64Content}.${base64Sig}`;

  let polkaJsVerifier = new PolkaJsVerifier();
  let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
  let { header: verifiedHeader, payload: verifiedPayload } =
    await tw3tVerifier.verify(tw3t);
  expect(verifiedHeader).toEqual(header);
});

/*test("test an invalid tw3t using polkadot signer (wrong address in the payload)", async () => {
  let keyring = new Keyring({ type: "ed25519" });
  let mnemonic = mnemonicGenerate();
  let account = keyring.createFromUri(mnemonic);
  let signingAccount = { account };
  let address = account.address;
  let header = <Header>{
    alg: "ed25519",
    typ: "TW3T",
    add: "ss58",
  };
  let payload = <Payload>{
    add: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // wrong address in the token
  };

  let exp = Math.floor(Date.now() / 1000) + 24 * 3600; // expire in 24 hours
  let content = new TW3TContent(header, payload)
    .setAudience("uri:test")
    .setExpiration(exp);
  let polkaJsSigner = new PolkaJsSigner(signingAccount);
  let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
  let { base64Content, base64Sig } = await tw3tSigner.getSignature();
  let tw3t = `${base64Content}.${base64Sig}`;

  let polkaJsVerifier = new PolkaJsVerifier();
  let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
  await expect(tw3tVerifier.verify(tw3t)).rejects.toThrow(
    "invalid token, signiture is not valid"
  );
});

test("test an invalid tw3t using polkadot signer (wrong alg)", async () => {
  let keyring = new Keyring({ type: "sr25519" });
  let mnemonic = mnemonicGenerate();
  let account = keyring.createFromUri(mnemonic);
  let signingAccount = { account };
  let address = account.address;
  let header = <Header>{
    alg: "ed25519",
    typ: "TW3T",
    add: "ss58",
  };
  let payload = <Payload>{
    add: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // wrong address in the token
  };

  let exp = Math.floor(Date.now() / 1000) + 24 * 3600; // expire in 24 hours
  let content = new TW3TContent(header, payload)
    .setAudience("uri:test")
    .setExpiration(exp);
  let polkaJsSigner = new PolkaJsSigner(signingAccount);
  let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
  let { base64Content, base64Sig } = await tw3tSigner.getSignature();
  let tw3t = `${base64Content}.${base64Sig}`;

  let polkaJsVerifier = new PolkaJsVerifier();
  let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
  await expect(tw3tVerifier.verify(tw3t)).rejects.toThrow();
});

test("token content base46URI encode/decode success", () => {
  let header = <Header>{
    alg: "ed25519",
    typ: "TW3T",
    add: "ss58",
  };
  let payload = <Payload>{
    // Alice
    add: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
    aud: "test",
  };
  let content = new TW3TContent(header, payload);
  let b64 = content.toBase64Url();
  let decoded = TW3TContent.fromBase64Url(b64);
  expect(decoded.header).toEqual(header);
  expect(decoded.payload).toEqual(payload);
});*/
