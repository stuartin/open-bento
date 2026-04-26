import { Config as EffectConfig, Effect } from "effect";

export class Config extends Effect.Service<Config>()("Config", {
  effect: Effect.gen(function* () {
    return {
      maxConcurrentJobs: yield* EffectConfig.number("MAX_CONCURRENT_JOBS").pipe(
        EffectConfig.withDefault(5),
      )
    };
  }),
}) { }
