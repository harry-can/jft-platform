import { Suspense } from "react";
import TestEngineClient from "./TestEngineClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading test engine...</div>}>
      <TestEngineClient />
    </Suspense>
  );
}