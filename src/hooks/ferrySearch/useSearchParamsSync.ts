import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFerryStore } from "@/store/FerryStore";

export const useSearchParamsSync = () => {
  const searchParams = useSearchParams();
  const { setSearchParams } = useFerryStore();
  const [userPreferredTime, setUserPreferredTime] = useState<string | null>(
    null
  );

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const adults = parseInt(searchParams.get("adults") || "2");
    const children = parseInt(searchParams.get("children") || "0");
    const infants = parseInt(searchParams.get("infants") || "0");
    const preferredTime = searchParams.get("time");

    if (from && to && date) {
      setSearchParams({
        from,
        to,
        date,
        adults,
        children,
        infants,
      });

      setUserPreferredTime(preferredTime);
    }
  }, [searchParams, setSearchParams]);

  return {
    userPreferredTime,
    searchParams: {
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      date: searchParams.get("date") || "",
      adults: parseInt(searchParams.get("adults") || "2"),
      children: parseInt(searchParams.get("children") || "0"),
      infants: parseInt(searchParams.get("infants") || "0"),
    },
  };
};
