import { QueryClient } from "@tanstack/react-query";

// Ek hi QueryClient poore app ke liye — isme cache, retry rules,
// stale time waghera configure hote hain
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data ko "fresh" maana jayega 30 seconds tak —
        // isse baar baar refetch nahi hoga jab tak zaroorat na ho
        staleTime: 30 * 1000,

        // Agar request fail ho to 1 baar retry karo, phir chhod do
        retry: 1,

        // Jab tum tab switch karke wapas aao, auto-refetch mat karo
        // (dev mein annoying lagta hai, production mein customize kar sakte ho)
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0, // create/update/delete pe retry mat karo (duplicate submit se bacho)
      },
    },
  });
}
