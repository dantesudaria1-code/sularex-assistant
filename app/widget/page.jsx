import SolarAssistant from "@/components/SolarAssistant";

// Bare chat surface intended to be loaded inside an iframe on sularex.com.
export const metadata = { title: "SULAREX Assistant" };

export default function WidgetPage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <SolarAssistant embedded />
    </main>
  );
}
