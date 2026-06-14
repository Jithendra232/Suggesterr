import { AlertCircle } from "lucide-react";
import Button from "./Button.jsx";
import React from 'react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1 text-sm">{message}</p>
          {onRetry ? (
            <Button variant="danger" className="mt-4" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
