<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";

  import type { LayoutServerData } from "./$types";

  const { data }: { data: LayoutServerData } = $props();

  const user = $derived(data.user);

  const test = $derived(page.data.user);
</script>

<h1>open-bento</h1>
<div>
  {#if test}
    <pre>{JSON.stringify(test, null, 2)}</pre>
    <br />
    <button
      onclick={async () => {
        await authClient.signOut();
        window.location.reload();
      }}
    >
      sign-out
    </button>
  {:else}
    <a href="/auth/login">login</a>
  {/if}
</div>
