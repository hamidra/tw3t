import { SigSpec, ClaimInfo } from './types.d';
import {
  TW3TContent,
  TW3TSigner,
  TW3TVerifier,
  PolkaJsSigner,
  PolkaJsVerifier,
} from './index';
import { Keyring } from '@polkadot/keyring';
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto';
import { decode } from 'punycode';

describe('test tw3t token verification', () => {
  beforeAll(async () => {
    await cryptoWaitReady();
  });
  test('test a valid tw3t using polkadot signer', async () => {
    let keyring = new Keyring({ type: 'sr25519' });
    let mnemonic = mnemonicGenerate();
    let account = keyring.createFromUri(mnemonic);
    let signingAccount = { account };
    let address = account.address;

    let sigSpec = <SigSpec>{
      algorithm: 'sr25519',
      token_type: 'TW3T',
      address_type: 'ss58',
    };
    let claimInfo = <ClaimInfo>{
      address: address,
    };
    let exp = new Date();
    exp.setHours(exp.getHours() + 24); // expire in 24 hours
    let content = new TW3TContent(claimInfo, sigSpec, 'Welcome!')
      .setAudience('uri:test')
      .setExpiration(exp);

    let polkaJsSigner = new PolkaJsSigner(signingAccount);
    let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
    let { base64Content, base64Sig } = await tw3tSigner.getSignature();
    let tw3t = `${base64Content}.${base64Sig}`;

    let polkaJsVerifier = new PolkaJsVerifier();
    let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
    let { statement, specification, information } = await tw3tVerifier.verify(
      tw3t
    );

    expect(JSON.stringify(content?.sigSpec)).toEqual(
      JSON.stringify(specification)
    );
    expect(JSON.stringify(content?.claimInfo)).toEqual(
      JSON.stringify(information)
    );
  });

  test('test an invalid tw3t using polkadot signer (wrong address in the payload)', async () => {
    let keyring = new Keyring({ type: 'sr25519' });
    let mnemonic = mnemonicGenerate();
    let account = keyring.createFromUri(mnemonic);
    let signingAccount = { account };
    let address = account.address;

    let sigSpec = <SigSpec>{
      algorithm: 'sr25519',
      token_type: 'TW3T',
      address_type: 'ss58',
    };
    let claimInfo = <ClaimInfo>{
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // wrong address in the token
    };
    let exp = new Date();
    exp.setHours(exp.getHours() + 24); // expire in 24 hours
    let content = new TW3TContent(claimInfo, sigSpec, 'Welcome!')
      .setAudience('uri:test')
      .setExpiration(exp);

    let polkaJsSigner = new PolkaJsSigner(signingAccount);
    let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
    let { base64Content, base64Sig } = await tw3tSigner.getSignature();
    let tw3t = `${base64Content}.${base64Sig}`;

    let polkaJsVerifier = new PolkaJsVerifier();
    let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
    await expect(tw3tVerifier.verify(tw3t)).rejects.toThrow(
      'invalid token, signiture is not valid'
    );
  });

  test('test an invalid tw3t using polkadot signer (wrong alg)', async () => {
    let keyring = new Keyring({ type: 'sr25519' });
    let mnemonic = mnemonicGenerate();
    let account = keyring.createFromUri(mnemonic);
    let signingAccount = { account };
    let address = account.address;

    let sigSpec = <SigSpec>{
      algorithm: 'ed25519',
      token_type: 'TW3T',
      address_type: 'ss58',
    };
    let claimInfo = <ClaimInfo>{
      address: address,
    };
    let exp = new Date();
    exp.setHours(exp.getHours() + 24); // expire in 24 hours
    let content = new TW3TContent(claimInfo, sigSpec, 'Welcome!')
      .setAudience('uri:test')
      .setExpiration(exp);

    let polkaJsSigner = new PolkaJsSigner(signingAccount);
    let tw3tSigner = new TW3TSigner(polkaJsSigner, content);
    let { base64Content, base64Sig } = await tw3tSigner.getSignature();
    let tw3t = `${base64Content}.${base64Sig}`;

    let polkaJsVerifier = new PolkaJsVerifier();
    let tw3tVerifier = new TW3TVerifier(polkaJsVerifier);
    await expect(tw3tVerifier.verify(tw3t)).rejects.toThrow();
  });
});

describe('test tw3t token serialization', () => {
  test('token content base46URI serialization/deserialization success', () => {
    let sigSpec = <SigSpec>{
      algorithm: 'sr25519',
      token_type: 'TW3T',
      address_type: 'ss58',
    };
    let claimInfo = <ClaimInfo>{
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    };
    let statement = 'Welcome!';
    let exp = new Date();
    exp.setHours(exp.getHours() + 24); // expire in 24 hours
    let content = new TW3TContent(claimInfo, sigSpec, statement)
      .setAudience('uri:test')
      .setExpiration(exp);

    let b64 = content.toBase64Url();
    const decoded = TW3TContent.fromBase64Url(b64);
    expect(JSON.stringify(content?.sigSpec)).toEqual(
      JSON.stringify(decoded?.sigSpec)
    );
    expect(JSON.stringify(content?.claimInfo)).toEqual(
      JSON.stringify(decoded?.claimInfo)
    );
    expect(statement).toEqual(decoded?.statement);
  });
});
