import { Provider } from '@nestjs/common';

export class MockingHelper {
  static mockProviders(providers: Provider[]) {
    return providers.map((provider) => {
      return {
        provide: provider,
        useValue: {},
      };
    }) as Provider[];
  }
}
