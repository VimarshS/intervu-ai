"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UpgradeModal } from "@/components/credits/UpgradeModal";

export function UpgradeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      setShowModal(true);
    }
    if (searchParams.get("payment") === "success") {
      const credits = searchParams.get("credits");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  function handleClose() {
    setShowModal(false);
    router.replace("/dashboard");
  }

  return (
    <UpgradeModal isOpen={showModal} onClose={handleClose} />
  );
}