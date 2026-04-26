# @open-bento/spawner

Spawn jobs using effect ts

# Stack

- Effect - https://github.com/Effect-TS/effect
  - Services -
  - Job Queue -
  - Command - https://effect.website/docs/platform/command/
  - Configuration via environment variables - https://effect.website/docs/configuration/
- Sysbox - https://github.com/nestybox/sysbox

# Overview

- Effect will manage a queue that allows 5 concurrent (configuration) jobs to be running
- Effect will manage the lifecycle of a job using scopes and finalizers
- Effect will build a docker image (if it doesnt exist)
- Effect will run the docker image with some arguments using sysbox (docker inside docker)
- All stdout and stderror will be streamed to the database (outside effect)
- A final exit code will update the job status
