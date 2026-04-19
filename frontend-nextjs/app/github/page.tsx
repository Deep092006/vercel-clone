import { redirect } from "next/navigation";

export default function GithubRedirect() {
  redirect("/repos");
}
