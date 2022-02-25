import { Base64 } from "js-base64";
import { Payload, Header, SigVerifier } from "./types.d";
import { TW3TContent } from "./content";
import TOML from "./toml";

let skew = 300; // seconds
export class TW3TVerifier {
  private _sigVerifier: SigVerifier;
  constructor(verifier: SigVerifier) {
    this._sigVerifier = verifier;
  }
  async verify(tw3t: string): Promise<{ header: Header; payload: Payload }> {
    let [b64_header, b64_payload, b64_signature, ...rest] =
      tw3t?.split(".") || [];
    if (rest.length !== 0) {
      throw new Error("invalid token. malformed");
    }
    if (
      !b64_header ||
      !b64_payload ||
      !b64_signature ||
      !Base64.isValid(b64_header) ||
      !Base64.isValid(b64_payload) ||
      !Base64.isValid(b64_signature)
    ) {
      throw new Error("invalid token. header, payload or signature is missing");
    }
    let header = TOML.parse(Base64.decode(b64_header)) as Header;
    let payload = TOML.parse(Base64.decode(b64_payload)) as Payload;
    let signature = Base64.toUint8Array(b64_signature);

    let { alg } = header || {};
    // validate nbf if exists
    let {
      add: address,
      nbf: notBefore,
      aud: audience,
      exp: expiration,
    } = payload;

    if (!expiration) {
      throw new Error("invalid token.  expiration claim is missing");
    }
    let nowEpoch = Math.floor(Date.now() / 1000);
    if (nowEpoch > expiration + skew) {
      throw new Error("invalid token.  token is expired");
    }

    if (notBefore && nowEpoch < notBefore - skew) {
      throw new Error("invalid token.  token is not valid before nbf time");
    }

    // validate address
    if (!address) {
      throw new Error("invalid token.  address claim is missing");
    }

    let content = TW3TContent.fromBase64Url(`${b64_header}.${b64_payload}`);
    let tomlStrContent = content.stringify();
    let sigIsValid = await this._sigVerifier.verify(
      alg,
      tomlStrContent,
      signature,
      address
    );
    if (!sigIsValid) {
      throw new Error("invalid token, signiture is not valid");
    }

    return { header, payload };
  }
}
