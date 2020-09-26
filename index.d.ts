export interface ValidatorExtensionContext {
  name: string
  value: any
  type: string
  length: number
  parent: {
    name: string
    type: string
  },
}

export interface ValidatorExtension {
  (ctx: ValidatorExtensionContext, ...args: any): {
    message: string,
    pass: boolean,
    value: any,
  };
}
export interface ValidatorExtensionCollection {
  [name: string]: ValidatorExtension
}

// Placeholder for now.
export interface PropertyValidator {
  [name: string]: Function
}

export interface ArgumentCollection {
  assert: (argName: string, argValue?: any) => PropertyValidator;
  expect: (argName: string, argValue?: any) => PropertyValidator;

  update: (newArgs: object) => this;
  extend: (extensions: ValidatorExtensionCollection) => this;
}

export declare function isRequired(pointer: string, override: boolean): void;

export declare function assert(argName: string, argValue: any, parentName?: string, parentType?: string): PropertyValidator;

export default function validate(args: object): ArgumentCollection;
