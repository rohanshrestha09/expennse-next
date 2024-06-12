"use client";

import { Suspense } from "react";
import Delete from ".";

export default function Page() {
  return (
    <Suspense>
      <Delete />
    </Suspense>
  );
}
