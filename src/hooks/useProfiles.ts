"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProfiles } from "@/lib/api/profiles";

export function useProfiles() {
    return useQuery({
        queryKey: ["profiles"],
        queryFn: fetchProfiles,
        staleTime: 5 * 60 * 1000, // 5 minutes — profiles bahut kam change hote hain, zyada der cache rakho
    });
}