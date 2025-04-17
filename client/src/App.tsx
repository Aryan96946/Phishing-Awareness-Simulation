import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";
import ErrorBoundary from "./components/error-boundary";
import DebugInfo from "./components/debug-info";
import TestPage from "./pages/test";

// Layouts
import AdminLayout from "./layouts/admin-layout";
import AuthLayout from "./layouts/auth-layout";

// Pages
import Dashboard from "./pages/dashboard";
import Campaigns from "./pages/campaigns";
import Templates from "./pages/templates";
import TargetGroups from "./pages/target-groups";
import Reports from "./pages/reports";
import Settings from "./pages/settings";
import Login from "./pages/login";
import NotFound from "./pages/not-found";

function Router() {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login">
        <AuthLayout>
          <Login />
        </AuthLayout>
      </Route>

      {/* Education page for redirecting after phishing simulation */}
      <Route path="/education">
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <iframe 
            src="/education" 
            className="w-full max-w-4xl h-screen max-h-[800px] border-0 rounded-lg shadow-lg"
            title="Phishing Education"
          />
        </div>
      </Route>

      {/* Admin routes */}
      <Route path="/">
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </Route>
      
      <Route path="/campaigns">
        <AdminLayout>
          <Campaigns />
        </AdminLayout>
      </Route>
      
      <Route path="/templates">
        <AdminLayout>
          <Templates />
        </AdminLayout>
      </Route>
      
      <Route path="/target-groups">
        <AdminLayout>
          <TargetGroups />
        </AdminLayout>
      </Route>
      
      <Route path="/reports">
        <AdminLayout>
          <Reports />
        </AdminLayout>
      </Route>
      
      <Route path="/settings">
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TestPage />
      <DebugInfo />
    </ErrorBoundary>
  );
}

export default App;
