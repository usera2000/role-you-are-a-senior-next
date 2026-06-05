import { getOpenAIClient, summaryModel } from "@/lib/openai";
import type { NewsArticle } from "@/lib/rss";

type SummaryResult = {
  id: string;
  aiSummary: string;
  talkingPoint: string;
};

export async function enrichArticlesWithSummaries(articles: NewsArticle[]) {
  if (!articles.length) return articles;

  const generated = await generateAISummaries(articles);
  const byId = new Map(generated.map((item) => [item.id, item]));

  return articles.map((article) => {
    const result = byId.get(article.id);
    return {
      ...article,
      aiSummary: result?.aiSummary || fallbackSummary(article),
      talkingPoint: result?.talkingPoint || fallbackTalkingPoint(article),
    };
  });
}

export function buildDailyChatTopics(articles: NewsArticle[]) {
  const byCategory = new Map<string, NewsArticle[]>();
  for (const article of articles) {
    byCategory.set(article.category, [...(byCategory.get(article.category) || []), article]);
  }

  const topics = [
    topicFromArticle(byCategory.get("신제품 · 신메뉴")?.[0], "이번 신제품 중 가장 먹어보고 싶은 것은 무엇인가요?"),
    topicFromArticle(byCategory.get("게임")?.[0], "오늘 소식 중 가장 기대되는 게임은 무엇인가요?"),
    topicFromArticle(byCategory.get("IT")?.[0], "최근 AI와 IT 기술 변화에 대해 어떻게 생각하시나요?"),
    topicFromArticle(byCategory.get("할인 · 특가")?.[0], "오늘 특가 중 실제로 사고 싶은 물건이 있나요?"),
    "오늘 뉴스 중 방송에서 가장 깊게 이야기해보고 싶은 주제는 무엇인가요?",
  ].filter(Boolean);

  return topics.slice(0, 3);
}

async function generateAISummaries(articles: NewsArticle[]): Promise<SummaryResult[]> {
  const client = getOpenAIClient();
  if (!client) return [];

  try {
    const response = await client.responses.create({
      model: summaryModel,
      instructions:
        "너는 한국어 뉴스 방송 보조 작가다. 정치, 선거, 정당, 종교, 이념 갈등을 다루지 않는다. 각 기사마다 짧은 한국어 AI 요약 2~3문장과 방송용 질문 1문장을 JSON으로 작성한다.",
      input: JSON.stringify(
        articles.slice(0, 40).map((article) => ({
          id: article.id,
          title: article.title,
          source: article.source,
          category: article.category,
          summary: article.summary,
        })),
      ),
      text: {
        format: {
          type: "json_schema",
          name: "newsroom_summaries",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    id: { type: "string" },
                    aiSummary: { type: "string" },
                    talkingPoint: { type: "string" },
                  },
                  required: ["id", "aiSummary", "talkingPoint"],
                },
              },
            },
            required: ["items"],
          },
        },
      },
      max_output_tokens: 2200,
    });

    const parsed = JSON.parse(response.output_text || "{\"items\":[]}") as { items: SummaryResult[] };
    return parsed.items
      .filter((item) => item.id && item.aiSummary && item.talkingPoint)
      .map((item) => ({
        id: item.id,
        aiSummary: limitSentences(item.aiSummary, 3),
        talkingPoint: firstSentence(item.talkingPoint),
      }));
  } catch {
    return [];
  }
}

function fallbackSummary(article: NewsArticle) {
  const base = article.summary || article.title;
  const trimmed = base.length > 120 ? `${base.slice(0, 120)}...` : base;
  return `${trimmed} 원문을 열어 자세한 맥락을 확인해보세요.`;
}

function fallbackTalkingPoint(article: NewsArticle) {
  if (article.category === "할인 · 특가") return "여러분이라면 이 가격에 구매하시겠나요?";
  if (article.category === "게임") return "가장 기대되는 부분은 무엇인가요?";
  if (article.category === "신제품 · 신메뉴") return "채팅창 여러분은 직접 먹어보고 싶으신가요?";
  if (article.category === "IT") return "이 기술 변화가 일상에 어떤 영향을 줄까요?";
  return "채팅창 여러분은 어떻게 생각하시나요?";
}

function limitSentences(text: string, max: number) {
  return text
    .split(/(?<=[.!?。！？]|다\.|요\.)\s+/)
    .filter(Boolean)
    .slice(0, max)
    .join(" ")
    .trim();
}

function firstSentence(text: string) {
  return limitSentences(text, 1) || "채팅창 여러분은 어떻게 생각하시나요?";
}

function topicFromArticle(article: NewsArticle | undefined, fallback: string) {
  if (!article) return "";
  const shortTitle = article.title.replace(/\[[^\]]+\]/g, "").replace(/\s+/g, " ").trim();
  if (!shortTitle) return fallback;

  if (article.category === "게임") return `「${shortTitle}」 소식에서 가장 기대되는 부분은 무엇인가요?`;
  if (article.category === "신제품 · 신메뉴") return `「${shortTitle}」 관련 소식, 직접 체험해보고 싶으신가요?`;
  if (article.category === "할인 · 특가") return `「${shortTitle}」 특가라면 여러분은 구매하시겠나요?`;
  if (article.category === "IT") return `「${shortTitle}」 기술 변화가 일상에 어떤 영향을 줄까요?`;

  return fallback;
}
