import OpenAI from 'openai'

const {
  OPENAI_API_KEY,
  OPENAI_MODEL = 'gpt-4o-mini',
  OPENAI_SYSTEM_PROMPT = 'You are a helpful assistant.',
  OPENAI_MAX_OUTPUT_TOKENS = '1024',
  OPENAI_TEMPERATURE = '0.7'
} = process.env

// クライアント
const Client = new OpenAI({ apiKey: OPENAI_API_KEY })

const cooldown = new Map()

export const isOpenAIReady = !!Client

export async function Chat(message, args) {
    if (!Client) {
        await message.channel.send('OpenAIのAPIキーが設定されていません')
        return
    }
    
    // 連投しないように 2s
    const now = Date.now()
    const last = cooldown.get(message.author.id) || 0
    if (now - last < 2000) {
        message.channel.send('連投すんじゃねぇ！ぶっ殺すぞ！')
        return;
    }
    cooldown.set(message.author.id, now)

    const userText = args.join(' ')
    if (!userText) {
        await message.channel.send('使い方: `!chat こんにちは`')
        return
    }
    await message.channel.sendTyping();

    const reply = await ChatWithOpenAI(userText, { timeoutMs: 60_000 })

    // 2000文字制限で分割送信
    const MAX = 2000
    for (let i = 0; i < reply.length; i += MAX) {
        await message.channel.send(reply.slice(i, i + MAX))
    }
    return
}

/**
 * OpenAIに問い合わせてテキストを返す最小関数
 * 
 * @param {string} userText - ユーザーからの入力
 * @param {object} options - 任意設定
 * @param {string} [options.model]
 * @param {string} [options.systemPrompt]
 * @param {number} [options.maxOutputTokens]
 * @param {number} [options.temperature]
 * @param {number} [options.timeoutMs] - タイムアウト(ms)
 * @param {AbortSignal} [options.signal] - 外部から中断したい場合
 * @returns {Promise<string>}
 */
export async function ChatWithOpenAI(userText, options = {}) {
    if (!Client) {
        throw new Error('OPENAI_API_KEY is not set')
    }
    if (!userText || !userText.trim()) {
        return '(空の入力です)'
    }

    const {
        model = OPENAI_MODEL,
        systemPrompt = OPENAI_SYSTEM_PROMPT,
        maxOutputTokens = parseInt(OPENAI_MAX_OUTPUT_TOKENS, 10) || 1024,
        temperature = parseFloat(OPENAI_TEMPERATURE),
        timeoutMs = 60_000,
    } = options

    // タイムアウト制御
    const timer = setTimeout(() => ac.abort(new Error('OpenAI request timed out')), timeoutMs)

    try {
        const response = await Client.responses.create({
            model,
            input: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText }
            ],
        })

        return response.output_text
    } finally {
        clearTimeout(timer)
    }
}