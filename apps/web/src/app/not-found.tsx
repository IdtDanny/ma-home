import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4 text-center">
      <h1 className="text-7xl font-bold text-primary-600 dark:text-primary-400 mb-4">
        404
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
        Page not found
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button size="lg" className="text-base px-8">
          Back to Home
        </Button>
      </Link>
    </div>
  );
}