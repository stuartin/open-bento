<script lang="ts">
  import { resolve } from "$app/paths";
  import { client } from "$lib/api-client";
  import { createQuery } from "@tanstack/svelte-query";

  const query = createQuery(() =>
    client.organizations.projects.list.queryOptions({
      input: {
        organizationId: "123456",
      },
    }),
  );
</script>

<a href={resolve("/demo/better-auth")}>better-auth</a>

<div>
  {#if query.isPending}
    Loading...
  {/if}
  {#if query.error}
    An error has occurred:
    {query.error.message}
  {/if}
  {#if query.isSuccess}
    <div>
      <pre>{JSON.stringify(query.data, null, 2)}</pre>
    </div>
  {/if}
</div>
