<script lang="ts">
  import { dev } from "$app/environment";
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import type { ActionData } from "./$types";
  import { SvelteURLSearchParams } from "svelte/reactivity";

  let { form }: { form: ActionData } = $props();

  const params = new SvelteURLSearchParams(page.url.searchParams.toString());
</script>

<h1>Login</h1>
<form
  id="form"
  method="post"
  action="?/signInEmail&{params.toString()}"
  use:enhance
>
  <label>
    Email
    <input
      id="form-email"
      type="email"
      name="email"
      class="bg-white shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
  <label>
    Password
    <input
      id="form-password"
      type="password"
      name="password"
      class="bg-white shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
  <label>
    Name (for registration)
    <input
      name="name"
      class="bg-white shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
  {#if dev}
    <button
      type="button"
      class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
      onclick={() => {
        const form = document.getElementById("form") as HTMLFormElement;
        const email = document.getElementById("form-email") as HTMLInputElement;
        const password = document.getElementById(
          "form-password",
        ) as HTMLInputElement;

        email.value = "admin@local.com";
        password.value = "Password12#";
        form.requestSubmit();
      }}>Default</button
    >
  {:else}
    <button
      class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
      >Login</button
    >
  {/if}
  <button
    formaction="?/signUpEmail&{params.toString()}"
    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
    >Register</button
  >
</form>
<p class="text-red-500">{form?.message ?? ""}</p>
