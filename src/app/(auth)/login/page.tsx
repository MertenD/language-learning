import LoginForm from "@/features/auth/login-form";
import {requireUnauth} from "@/lib/auth-utils";

export default async function Login() {
    await requireUnauth()

    return <LoginForm />
}