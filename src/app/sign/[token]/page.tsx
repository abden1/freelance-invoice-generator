"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, AlertCircle, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignaturePad } from "@/components/contract/signature-pad";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

interface ContractData {
  id: string;
  title: string;
  content: string;
  freelancerName: string;
  clientName?: string;
  signerName: string;
  signerEmail: string;
  status: string;
  createdAt: string;
}

type PageState = "loading" | "ready" | "signing" | "signed" | "error" | "already-signed";

export default function SignContractPage() {
  const params = useParams();
  const token = params.token as string;

  const [state, setState] = useState<PageState>("loading");
  const [contract, setContract] = useState<ContractData | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadContract() {
      try {
        const res = await fetch(`/api/contracts/sign?token=${token}`);
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 409) {
            setState("already-signed");
          } else {
            setErrorMessage(data.error ?? "This signing link is invalid or has expired.");
            setState("error");
          }
          return;
        }
        const data = await res.json();
        setContract(data.contract);
        setSignerName(data.contract?.signerName ?? "");
        setState("ready");
      } catch {
        setErrorMessage("Failed to load contract. Please try again.");
        setState("error");
      }
    }

    loadContract();
  }, [token]);

  const handleSubmit = async () => {
    if (!signature) {
      toast.error("Please provide your signature before submitting.");
      return;
    }
    if (!signerName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/contracts/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          signature,
          signerName: signerName.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit signature");
      }

      setState("signed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading contract...</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
          <p className="text-muted-foreground text-sm">{errorMessage}</p>
        </Card>
      </div>
    );
  }

  if (state === "already-signed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Already Signed</h2>
          <p className="text-muted-foreground text-sm">
            This contract has already been signed. No further action is required.
          </p>
        </Card>
      </div>
    );
  }

  if (state === "signed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-11 w-11 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Contract Signed!</h2>
          <p className="text-muted-foreground">
            You have successfully signed <strong>{contract?.title}</strong>.
            A copy will be sent to your email.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Signed on {formatDate(new Date().toISOString())}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileSignature className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FreelancePro</span>
          </div>
          <h1 className="text-2xl font-bold">{contract?.title}</h1>
          <p className="text-muted-foreground mt-1">
            Prepared by {contract?.freelancerName} · Created {formatDate(contract?.createdAt ?? "")}
          </p>
        </div>

        {/* Contract Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white dark:bg-gray-950 rounded-lg border p-6 max-h-[500px] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {contract?.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Signing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign the Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Your Full Name</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Type your full name"
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                By typing your name and signing, you agree to the terms above.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Your Signature</Label>
              <SignaturePad
                onSignatureChange={setSignature}
                className="max-w-md"
              />
            </div>

            <Separator />

            <div className="flex items-start gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                By clicking &ldquo;Sign and Submit&rdquo;, you agree that your electronic
                signature is legally binding and equivalent to a handwritten signature.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !signature || !signerName.trim()}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Sign and Submit
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by FreelancePro · Secure Electronic Signatures
        </p>
      </div>
    </div>
  );
}
