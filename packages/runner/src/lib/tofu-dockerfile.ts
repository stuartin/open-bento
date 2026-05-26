export const tofuDockerfile = (version: string) => `
FROM ghcr.io/opentofu/opentofu:${version}-minimal AS tofu

FROM alpine:3

# Copy the tofu binary from the minimal image
COPY --from=tofu /usr/local/bin/tofu /usr/local/bin/tofu

# Add any other tools or dependencies you need
RUN apk add --no-cache git curl

ENTRYPOINT [ "tofu" ]
`