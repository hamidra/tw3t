export interface SigSpec {
  /**
   * Algorithm : specifies the signing schema that is used for signing the token.
   */
  algorithm: string;

  /**
   * type : specifies the token type. in this case always TW3T.
   */
  token_type: string;

  /**
   * address type : specifies the address type and is used to extract the address from signature.
   * (e.g. "ss58" specifies the address to be a [substrate address](https://docs.substrate.io/v3/advanced/ss58/))
   */
  address_type: string;
}

export interface ClaimInfo {
  /**
   * Address Claim : The address of the account that has signed the token.
   */
  address: string;

  /**
   * Audience Claim: The recipients that the TW3T is intended for.
   * Similar to [RFC7519#section-4.1.3](https://tools.ietf.org/html/rfc7519#section-4.1.3).
   */
  audiance?: string;

  /**
   * Expiration Time Claim - Identifies the expiration time on or after which the TW3T is not accepted for processing.
   * Similar to [RFC7519#section-4.1.4](https://tools.ietf.org/html/rfc7519#section-4.1.4).
   */
  expires_at?: Date;

  /**
   * Not Before Claim - Identifies the time before which the TW3T is not accepted for processing
   * Similar to :[RFC7519#section-4.1.5](https://tools.ietf.org/html/rfc7519#section-4.1.5).
   */
  not_before?: Date;

  /**
   * nonce - A unique identifier or nonce to prevent the token replay. similar to [RFC7519#section-4.1.7](https://tools.ietf.org/html/rfc7519#section-4.1.7).
   */
  nonce?: string;

  /**
   * Any other optional claim.
   */
  [claimName: string]: unknown;
}

export interface Signer {
  sign(data: string): Promise<Uint8Array>;
}

export interface SigVerifier {
  verify(
    alg: string,
    message: string,
    signature: Uint8Array,
    address: string
  ): Promise<boolean>;
}
