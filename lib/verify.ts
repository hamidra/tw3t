import { Base64 } from 'js-base64';
import { SigSpec, ClaimInfo, SigVerifier } from './types.d';
import { TW3TContent } from './content';
import TOML from './toml';

let skew = 300; // seconds
export class TW3TVerifier {
  private _sigVerifier: SigVerifier;
  constructor(verifier: SigVerifier) {
    this._sigVerifier = verifier;
  }
  async verify(tw3t: string): Promise<{
    information: ClaimInfo;
    specification: SigSpec;
    statement: string;
  }> {
    let [b64_statement, b64_content, b64_signature, ...rest] =
      tw3t?.split('.') || [];
    if (rest.length !== 0) {
      throw new Error('invalid token. malformed');
    }
    if (
      !b64_content ||
      !b64_signature ||
      (b64_statement && !Base64.isValid(b64_statement)) ||
      !Base64.isValid(b64_content) ||
      !Base64.isValid(b64_signature)
    ) {
      throw new Error(
        'invalid token.  content or signature is missing or is invalid'
      );
    }
    let statement = b64_statement && Base64.decode(b64_statement);
    let { information: claimInfo, specification: sigSpec } = TOML.parse(
      Base64.decode(b64_content)
    );
    let signature = Base64.toUint8Array(b64_signature);

    let { algorithm } = sigSpec || {};
    // validate not_before if exists
    let { address, not_before, audience, expires_at } = claimInfo || {};

    if (!expires_at) {
      throw new Error('invalid token.  expiration claim is missing');
    }
    let nowEpoch = Math.floor(Date.now() / 1000);
    let expirationEpoc = Math.floor(expires_at?.getTime() / 1000);
    if (nowEpoch > expirationEpoc + skew) {
      throw new Error('invalid token.  token is expired');
    }

    if (not_before) {
      let notBeforeEpoch = Math.floor(not_before?.getTime() / 1000);
      if (nowEpoch < notBeforeEpoch - skew) {
        throw new Error('invalid token.  token is not valid before nbf time');
      }
    }

    // validate address
    if (!address) {
      throw new Error('invalid token.  address claim is missing');
    }

    let content = TW3TContent.fromBase64Url(`${b64_statement}.${b64_content}`);
    let tomlStrContent = content.stringify();
    let sigIsValid = await this._sigVerifier.verify(
      algorithm,
      tomlStrContent,
      signature,
      address
    );
    if (!sigIsValid) {
      throw new Error('invalid token, signiture is not valid');
    }

    return { statement, specification: sigSpec, information: claimInfo };
  }
}
