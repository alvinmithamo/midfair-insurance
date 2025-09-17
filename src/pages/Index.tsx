import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import ClientManagement from "@/components/ClientManagement";
import VehicleManagement from "@/components/VehicleManagement";
import PolicyManagement from "@/components/PolicyManagement";
import ClaimsManagement from "@/components/ClaimsManagement";
import PaymentManagement from "@/components/PaymentManagement";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import SystemSettings from "@/components/SystemSettings";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={setCurrentView}/>;
      case "clients":
        return <ClientManagement />;
      case "vehicles":
        return <VehicleManagement />;
      case "policies":
        return <PolicyManagement />;
      case "claims":
        return <ClaimsManagement />;
      case "payments":
        return <PaymentManagement />;
      case "reports":
        return <ReportsAnalytics />;
      case "settings":
        return <SystemSettings />;
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
