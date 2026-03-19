import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import DataPortal from "./pages/DataPortal";
import MGCPage from "./pages/MGCPage";

const queryClient = new QueryClient();

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "mgc">("home");

  return (
    <QueryClientProvider client={queryClient}>
      {currentPage === "home" ? (
        <DataPortal onNavigateMGC={() => setCurrentPage("mgc")} />
      ) : (
        <MGCPage onBack={() => setCurrentPage("home")} />
      )}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
