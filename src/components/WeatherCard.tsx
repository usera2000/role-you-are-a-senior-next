import { CloudSun } from "lucide-react";
import type { WeatherCity } from "@/lib/weather";

export default function WeatherCard({
  cities,
  error,
}: {
  cities: WeatherCity[];
  error: string | null;
}) {
  return (
    <section id="전국 날씨" className="rounded-md border border-blue-200 bg-white p-7 shadow-newsroom">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-50">
          <CloudSun className="h-9 w-9 text-primary" />
        </div>
        <div>
          <p className="text-base font-black text-primary">전국 날씨</p>
          <h2 className="mt-1 text-3xl font-black text-text">오늘의 날씨</h2>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            Open-Meteo 현재 날씨를 도시명, 기온, 상태만 정리해서 보여줍니다.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/60 p-8 text-center text-xl font-black text-slate-600">
          {error}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {cities.map((city) => (
            <div key={city.name} className="rounded-md border border-border bg-blue-50/60 p-5 text-center">
              <p className="text-2xl font-black text-text">{city.name}</p>
              <p className="mt-2 text-3xl font-black text-accent">
                {city.temperature === null ? "확인중" : `${city.temperature}℃`}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-500">{city.condition}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
