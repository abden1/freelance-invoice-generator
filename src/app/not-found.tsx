import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
        </div>

        {/* 404 */}
        <div className="mb-6">
          <p className="text-8xl font-black text-muted-foreground/20 leading-none select-none">
            404
          </p>
          <h1 className="text-2xl font-bold mt-2">Page not found</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
