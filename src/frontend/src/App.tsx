import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DataPortal from "./pages/DataPortal";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataPortal />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
