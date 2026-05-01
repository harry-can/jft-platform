import { Suspense } from "react";
import AdminQuestionBankClient from "./AdminQuestionBankClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading question bank...</div>}>
      <AdminQuestionBankClient />
    </Suspense>
  );
}