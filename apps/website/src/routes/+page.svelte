<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth-client";

  const { user, session } = $derived(page.data);
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
  {:else}
    <a href="/auth/login">login</a>
  {/if}
</div>
