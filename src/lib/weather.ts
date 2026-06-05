export type WeatherCity = {
  name: string;
  temperature: number | null;
  condition: string;
};

const cities = [
  { name: "서울", latitude: 37.5665, longitude: 126.978 },
  { name: "부산", latitude: 35.1796, longitude: 129.0756 },
  { name: "대구", latitude: 35.8714, longitude: 128.6014 },
  { name: "광주", latitude: 35.1595, longitude: 126.8526 },
  { name: "제주", latitude: 33.4996, longitude: 126.5312 },
];

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

export async function getWeather() {
  try {
    const results = await Promise.all(cities.map(fetchCityWeather));
    return { cities: results, error: null };
  } catch {
    return { cities: [], error: "날씨 정보를 불러올 수 없습니다." };
  }
}

async function fetchCityWeather(city: (typeof cities)[number]): Promise<WeatherCity> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(city.latitude));
  url.searchParams.set("longitude", String(city.longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("timezone", "Asia/Seoul");

  const response = await fetch(url, {
    next: { revalidate: 600 },
  });

  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const temperature = typeof data.current?.temperature_2m === "number" ? Math.round(data.current.temperature_2m) : null;
  const code = data.current?.weather_code;

  return {
    name: city.name,
    temperature,
    condition: typeof code === "number" ? weatherCodeToKorean(code) : "날씨 확인중",
  };
}

function weatherCodeToKorean(code: number) {
  if (code === 0) return "맑음";
  if ([1, 2].includes(code)) return "구름 조금";
  if (code === 3) return "구름 많음";
  if ([45, 48].includes(code)) return "안개";
  if ([51, 53, 55, 56, 57].includes(code)) return "이슬비";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "비";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "눈";
  if ([95, 96, 99].includes(code)) return "천둥번개";
  return "날씨 확인중";
}
