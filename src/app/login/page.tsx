import { Button } from "@/components/ui/button";
import { signIn } from "../api/auth/[...nextAuth]/auth";

export default function Page() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <Button type="submit">Signin with Google</Button>
    </form>
  );
}
