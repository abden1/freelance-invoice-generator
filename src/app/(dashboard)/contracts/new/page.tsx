"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractEditor } from "@/components/contract/contract-editor";

export default function NewContractPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Contract</h2>
          <p className="text-muted-foreground">Create a new client contract</p>
        </div>
      </div>
      <ContractEditor />
    </div>
  );
}
