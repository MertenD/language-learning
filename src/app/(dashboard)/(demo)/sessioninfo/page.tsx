"use client"

import {authClient} from "@/lib/auth-client";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function SessionInfo() {

  const { data } = authClient.useSession()

  return <div>
    {JSON.stringify(data, null, 2)}
  </div>
}
