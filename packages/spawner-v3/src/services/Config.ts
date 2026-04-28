import { Config as EffectConfig, Effect } from "effect";

export class Config extends Effect.Service<Config>()("Config", {
  effect: Effect.gen(function* () {
    return {
      maxConcurrentRuns: yield* EffectConfig.number("MAX_CONCURRENT_RUNS").pipe(
        EffectConfig.withDefault(5),
      )
    };
  }),
}) { }
