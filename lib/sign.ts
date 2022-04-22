import { Signer } from './types.d';
import { TW3TContent } from './content';
import { Base64 } from 'js-base64';
export class TW3TSigner {
  private _signer: Signer;
  private _content: TW3TContent;
  constructor(signer: Signer, content: TW3TContent) {
    this._signer = signer;
    this._content = content;
  }
  async getSignature(): Promise<{ base64Content: string; base64Sig: string }> {
    if (!this._signer) {
      throw new Error('no signer is set for signing the token');
    }
    if (!this._content) {
      throw new Error('no content is set to be signed.');
    }
    let tomlStrContent = this._content.stringify();

    let base64Content = this._content.toBase64Url();
    let sig = await this._signer.sign(tomlStrContent);
    let base64Sig = Base64.fromUint8Array(sig, true);
    return { base64Content, base64Sig };
  }
}
