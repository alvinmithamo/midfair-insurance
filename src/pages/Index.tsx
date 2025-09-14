import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import ClientManagement from "@/components/ClientManagement";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientManagement />;
      case "vehicles":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Vehicle Management</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Vehicle management interface coming soon...</p>
            </div>
          </div>
        );
      case "policies":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Policy Management</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Policy management interface coming soon...</p>
            </div>
          </div>
        );
      case "claims":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Claims Management</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Claims management interface coming soon...</p>
            </div>
          </div>
        );
      case "payments":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Payment Management</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Payment management interface coming soon...</p>
            </div>
          </div>
        );
      case "reports":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Reports and analytics interface coming soon...</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">System Settings</h1>
            <div className="bg-muted rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Settings interface coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
        <main className="flex-1 lg:pl-0">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
