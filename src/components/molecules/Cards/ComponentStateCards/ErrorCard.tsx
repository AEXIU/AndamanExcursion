import { Button } from "@/components/atoms";
import { memo } from "react";

const ErrorCard = memo(
  ({
    error,
    onRetry,
    text,
    className,
  }: {
    error: Error;
    onRetry: () => void;
    text: string;
    className?: string;
  }) => (
    <div className={className}>
      <p>
        {text}: {error.message}
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  )
);

export default ErrorCard;
