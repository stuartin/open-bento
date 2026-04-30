<script lang="ts">
  import { authClient } from "$lib/auth-client";

  const getForm = () => {
    const email = document.getElementById("form-email") as HTMLInputElement;
    const password = document.getElementById(
      "form-password",
    ) as HTMLInputElement;
    const name = document.getElementById("form-name") as HTMLInputElement;

    return { email: email.value, password: password.value, name: name.value };
  };

  const getUser = () => {
    return {
      email: "email@domain.com",
      password: "Password12#",
      name: "stu",
    };
  };

  const login = async () => {
    const { email, password } = getUser();

    let bearerToken = null;

    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });
    console.log({ data, error });
  };

  const register = async () => {
    const { email, password, name } = getUser();

    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    console.log({ data, error });
  };
</script>

<h1>Login</h1>
<form>
  <label>
    Email
    <input id="form-email" type="email" name="email" />
  </label>
  <label>
    Password
    <input id="form-password" type="password" name="password" />
  </label>
  <label>
    Name (for registration)
    <input id="form-name" name="name" />
  </label>
  <button onclick={login}>Login</button>
  <button onclick={register}>Register</button>
</form>
