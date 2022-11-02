import { redirect } from "@remix-run/node";

// TODO
export function loader() {
    return redirect("/setup");
}
