import BroadcastWorkspace from "@/components/BroadcastWorkspace";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getDashboardNews } from "@/lib/rss";
import { getWeather } from "@/lib/weather";

export const revalidate = 600;

export default async function Home() {
  const [{ grouped, categories, chatTopics }, weather] = await Promise.all([getDashboardNews(), getWeather()]);
  const total = Object.values(grouped).reduce((sum, articles) => sum + articles.length, 0);

  return (
    <div className="min-h-screen">
      <Header />
      <BroadcastWorkspace grouped={grouped} categories={categories} chatTopics={chatTopics} total={total} weather={weather} />
      <Footer />
    </div>
  );
}
