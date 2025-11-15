import { nextAuth } from "../api/auth/[...nextAuth]/auth";

export default function Page() {
  return (
    <form
      action={async () => {
        "use server";
        await nextAuth.signIn("google");
      }}
    >
      <button type="submit">Signin with Google</button>
    </form>
  );
}
