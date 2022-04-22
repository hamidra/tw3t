import Toml from '@ltd/j-toml';

export class TOML {
  static parse(text: string): any {
    return Toml.parse(text);
  }
  static stringify(value: any): string {
    const str = Toml.stringify(value, { newline: '\n' });
    return str;
  }
}

export const section = (value: any): any => {
  return Toml.Section(value);
};
