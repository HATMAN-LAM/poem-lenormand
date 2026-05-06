import { NextResponse } from "next/server";
import OpenAI from "openai";

type PoemPayload = {
  title: string;
  author: string;
  content: string[];
};

function isPoemPayload(x: unknown): x is PoemPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.author === "string" &&
    Array.isArray(o.content) &&
    o.content.every((l) => typeof l === "string")
  );
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.POE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "未配置 POE_API_KEY。请在 .env.local 中设置。" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      question?: unknown;
      poems?: unknown;
    };

    const question =
      typeof body.question === "string" ? body.question.trim() : "";
    const poemsRaw = body.poems;

    if (!question) {
      return NextResponse.json({ error: "缺少问题内容。" }, { status: 400 });
    }

    if (!Array.isArray(poemsRaw) || poemsRaw.length !== 3) {
      return NextResponse.json({ error: "需要恰好三首诗的数据。" }, { status: 400 });
    }

    const poems = poemsRaw as unknown[];
    if (!poems.every(isPoemPayload)) {
      return NextResponse.json({ error: "诗歌数据格式无效。" }, { status: 400 });
    }

    const [p0, p1, p2] = poems;

    const client = new OpenAI({
      apiKey,
      baseURL: "https://api.poe.com/v1",
    });

    const systemPrompt = `你是一位精通中国现代诗歌与心理学意象解析的“诗歌占卜师”。用户会带着心中的疑问来向你求签。
他们抽取了三张由中国现代诗组成的“诗歌雷诺曼牌”，牌阵从左到右依次代表：
1. 【境】：求签者当下的心境与客观处境。抽到的诗是：${p0.title} - ${p0.author}。诗句：“${p0.content.join("")}”
2. 【变】：事件的核心矛盾、隐藏因素或即将发生的转折。抽到的诗是：${p1.title} - ${p1.author}。诗句：“${p1.content.join("")}”
3. 【悟】：最终的启示、建议或精神出路。抽到的诗是：${p2.title} - ${p2.author}。诗句：“${p2.content.join("")}”

你的任务：
结合用户提出的具体问题，以及这三首诗的意象、作者的情感倾向，为用户进行解签。

要求：
1. 语气要温和、深邃、富有诗意，像一位智者在与用户对话。
2. 不要机械地重复诗句，而是要提炼诗句中的“意象”（如：水银、破镜、大海、黑夜）与用户的问题产生联想。
3. 不要因为诗句的意向消极就强行给予安慰。
4. 回答要结构清晰，直接给出解读，不要说多余的废话。`;

    const response = await client.chat.completions.create({
      model: "DeepSeek-V3.2-FW",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const reply = response.choices[0]?.message?.content ?? "";
    if (!reply) {
      return NextResponse.json({ error: "模型未返回内容。" }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "解签失败，请稍后再试。" },
      { status: 500 },
    );
  }
}
