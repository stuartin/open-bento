<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";
  import { zSchema } from "@open-bento/types";
  import { onMount } from "svelte";

  const { user, session } = $derived(page.data);

  const generate = async () => {
    const { data } = await authClient.signedUrl.generate();
    console.log(data?.url);
    // await goto(data?.url || "");
  };
</script>

<h1>open-bento</h1>
<div>
  {#if user && session}
    <pre>{JSON.stringify(user, null, 2)}</pre>
    <pre>{JSON.stringify(session, null, 2)}</pre>
    <br />
    <button
      onclick={async () => {
        await authClient.signOut();
        window.location.reload();
      }}
    >
      sign-out
    </button>

    <button onclick={generate}> generate </button>
  {:else}
    <a href="/auth/login">login</a>
  {/if}
</div>
