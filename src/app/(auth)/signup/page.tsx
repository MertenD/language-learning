import RegisterForm from "@/features/auth/register-form";
import {requireUnauth} from "@/lib/auth-utils";

export default async function Register() {
    await requireUnauth()
    
    return <RegisterForm />
}