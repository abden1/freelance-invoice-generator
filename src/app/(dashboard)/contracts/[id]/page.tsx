import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ContractStatusBadge } from "@/components/contract/contract-status-badge";
import { ContractDetailActions } from "@/components/contract/contract-detail-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, Mail } from "lucide-react";
import type { ContractSigner } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) notFound();

  const contract = await prisma.contract.findFirst({
    where: { id, userId: session.user.id },
    include: {
      client: true,
    },
  });

  if (!contract) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/contracts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{contract.title}</h2>
              <ContractStatusBadge status={contract.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              Created {formatDate(contract.createdAt)}
              {contract.signedAt && ` · Signed ${formatDate(contract.signedAt)}`}
            </p>
          </div>
        </div>
        <ContractDetailActions contract={{
          id: contract.id,
          title: contract.title,
          status: contract.status,
        }} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Contract Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contract.client && (
                <div>
                  <p className="text-muted-foreground text-xs">Client</p>
                  <Link
                    href={`/clients/${contract.client.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {contract.client.name}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-xs">Status</p>
                <ContractStatusBadge status={contract.status} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created</p>
                <p>{formatDate(contract.createdAt)}</p>
              </div>
              {contract.status !== "DRAFT" && (
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p>{contract.status}</p>
                </div>
              )}
              {contract.signedAt && (
                <div>
                  <p className="text-muted-foreground text-xs">Signed</p>
                  <p className="text-green-600 font-medium">{formatDate(contract.signedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Signers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const signers = (contract.signers as unknown as ContractSigner[]) || [];
                if (signers.length === 0) {
                  return <p className="text-sm text-muted-foreground">No signers added</p>;
                }
                return signers.map((signer, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {signer.signedAt ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{signer.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="h-3 w-3 shrink-0" />
                        {signer.email}
                      </p>
                      {signer.signedAt && (
                        <p className="text-xs text-green-600 mt-0.5">
                          Signed {formatDate(signer.signedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Contract Content */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contract Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-950 rounded-lg border p-6 max-h-[600px] overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                  {contract.content}
                </pre>
              </div>

              {(() => {
                const signers2 = (contract.signers as unknown as ContractSigner[]) || [];
                const signedOnes = signers2.filter((s) => s.signedAt && s.signature);
                if (!signedOnes.length) return null;
                return (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Signatures
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {signedOnes.map((signer, i) => (
                        <div key={i} className="border rounded-lg p-3">
                          {signer.signature && (
                            <img
                              src={signer.signature}
                              alt={`Signature of ${signer.name}`}
                              className="max-h-16 w-auto object-contain"
                            />
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {signer.name} {signer.signedAt ? `· ${formatDate(signer.signedAt)}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
