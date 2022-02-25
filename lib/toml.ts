import Toml from "@iarna/toml";

export default class TOML {
  static parse(text: string): any {
    return Toml.parse(text);
  }
  static stringify(value: any): string {
    return Toml.stringify(value);
  }
}
