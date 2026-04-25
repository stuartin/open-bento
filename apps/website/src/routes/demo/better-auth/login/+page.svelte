<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/state";
  import type { ActionData } from "./$types";
  import { SvelteURLSearchParams } from "svelte/reactivity";

  let { form }: { form: ActionData } = $props();

  const params = new SvelteURLSearchParams(page.url.searchParams.toString());
  const redirectTo = $derived(params.get("redirectTo"));
</script>

<h1>Login</h1>
<form method="post" action="?/signInEmail&redirectTo={redirectTo}" use:enhance>
  <label>
    Email
    <input
      type="email"
      name="email"
      class="bg-white shadow-sm mt-1 px-3 py-2 border border-gray-300 focus:border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </label>
  <label>
    Password
    <input
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
  <button
    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
    >Login</button
  >
  <button
    formaction="?/signUpEmail&redirectTo={redirectTo}"
    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white transition"
    >Register</button
  >
</form>
<p class="text-red-500">{form?.message ?? ""}</p>
