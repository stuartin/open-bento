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

  const DUMMY_CONFIGURATION_RES = {
    data: {
      id: "config-version",
      type: "configuration-versions",
      attributes: {
        "auto-queue-runs": true,
        error: null,
        "error-message": null,
        source: "tfe-api",
        speculative: true,
        status: "pending" as const,
        "upload-url":
          "https://archivist.terraform.io/v1/object/9224c6b3-2e14-4cd7-adff-ed484d7294c2",
        provisional: false,
      },
    },
  };

  onMount(() => {
    console.log("hello");

    const test = zSchema.TFE.ConfigurationVersion.parse(
      DUMMY_CONFIGURATION_RES,
    );
    console.log(test);
  });
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
