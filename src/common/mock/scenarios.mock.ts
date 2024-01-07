type MethodNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export class ScenariosMock {
  static getMethodNames<T>(cls: {
    new (...args: any[]): T;
  }): Record<MethodNames<T>, string> {
    const prototype = cls.prototype as ThisType<T>;
    const resultEnum: Record<MethodNames<T>, string> = {} as Record<
      MethodNames<T>,
      string
    >;

    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (prop) => typeof prototype[prop] === 'function' && prop !== 'constructor',
    );

    for (const methodName of methodNames) {
      resultEnum[methodName as MethodNames<T>] = methodName;
    }

    return resultEnum;
  }
}
