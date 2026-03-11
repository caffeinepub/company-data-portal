import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CompanyRecord } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<CompanyRecord[]>({
    queryKey: ["records"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      categoryText: string;
      department: string;
      date: string;
      value: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addRecord(
        params.id,
        params.name,
        params.categoryText,
        params.department,
        params.date,
        params.value,
        params.notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

export function useDeleteRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}
