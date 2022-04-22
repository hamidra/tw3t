import { SigSpec, ClaimInfo } from './types.d';
import { Base64 } from 'js-base64';
import { TOML, section } from './toml';

class TW3TContent {
  statement: string;
  claimInfo: ClaimInfo;
  sigSpec: SigSpec;

  constructor(claimInfo: ClaimInfo, sigSpec: SigSpec, statement: string = '') {
    this.claimInfo = claimInfo;
    this.sigSpec = sigSpec;
    this.statement = statement;
  }

  static fromBase64Url(b64Str: string): TW3TContent {
    let [b64Statement, b64Content] = b64Str.split('.');
    let statement = Base64.decode(b64Statement);

    let { information, specification, ...rest } = TOML.parse(
      Base64.decode(b64Content)
    );
    let tw3t = new TW3TContent(information, specification, statement);
    return tw3t;
  }

  stringify(): string {
    if (!this.claimInfo) {
      throw new Error('information section can not be empty.');
    }
    if (!this.sigSpec) {
      throw new Error('specification section can not be empty.');
    }

    let contentStr = TOML.stringify({
      information: section(this.claimInfo),
      specification: section(this.sigSpec),
    });

    return `${this.statement}\n\n${contentStr}`;
  }

  toBase64Url(): string {
    if (!this.claimInfo) {
      throw new Error('information section can not be empty.');
    }
    if (!this.sigSpec) {
      throw new Error('specification section can not be empty.');
    }

    let contentStr = TOML.stringify({
      information: section(this.claimInfo),
      specification: section(this.sigSpec),
    });
    let statementB64 = Base64.encodeURL(this.statement);
    let contentB64 = Base64.encodeURL(contentStr);
    return `${statementB64}.${contentB64}`;
  }

  /**
   * set the value for "Not Before" claim
   * @param nbf the nbf "not before" value to set for the token. when number is passed it is considered as an epoch (sec) and set as the claim value.
   * When a Date is passed it is resolved to an epoch (sec) before being used as the claim value.
   * @returns
   */
  setNotBefore(nbf: Date): TW3TContent {
    this.claimInfo = { ...this.claimInfo, not_before: nbf };
    return this;
  }

  /**
   * set the value for "Expiration Time" claim
   * @param exp the exp "Expiration Time" value to set for the token. when number is passed it is considered as an epoch (sec) and set as the claim value.
   * When a Date is passed it is resolved to an epoch (sec) before being used as the claim value.
   * @returns
   */
  setExpiration(exp: Date): TW3TContent {
    this.claimInfo = { ...this.claimInfo, expires_at: exp };

    return this;
  }

  /**
   * set the value for the audience claim
   * @param aud audience of the token
   * @returns
   */
  setAudience(aud: string | string[]): TW3TContent {
    this.claimInfo = { ...this.claimInfo, audience: aud };
    return this;
  }

  /**
   *
   */
  setAddress(address: string): TW3TContent {
    this.claimInfo = { ...this.claimInfo, address };
    return this;
  }
}

export { TW3TContent };
