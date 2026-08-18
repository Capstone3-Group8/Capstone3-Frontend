import { useEffect, useState } from "react";
import { askFinancialQuestion } from "../api/financialInsights";

const suggestedQuestions = [
  "What is my savings rate?",
  "Where do I spend the most?",
  "How can I improve my finances?",
];

export default function FinanceAssistant({
    userId,
  financialData,
  hasTransactions,
}) {
 const storageKey =
    `financeAssistantMessages:${userId || "guest"}`;

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => {
  try {
    const savedMessages =
      sessionStorage.getItem(storageKey);

    return savedMessages ? JSON.parse(savedMessages) : [];
  } catch {
    return [];
  }
});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
  sessionStorage.setItem(
    storageKey,
    JSON.stringify(messages),
  );
}, [messages, storageKey]);

  async function askQuestion(questionToAsk) {
    const cleanedQuestion = questionToAsk.trim();

    if (!cleanedQuestion || isLoading || !hasTransactions) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        text: cleanedQuestion,
      },
    ]);

    setQuestion("");
    setError(null);
    setIsLoading(true);

    try {
      const result = await askFinancialQuestion(
        cleanedQuestion,
        financialData,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text: result.answer,
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    askQuestion(question);
  }

  return (
    <section className="rounded-lg border border-(--border) p-5 lg:flex lg:h-[560px] lg:flex-col">
      <div>
        <h2 className="text-xl font-semibold text-(--text-h)">
          Finance Assistant
        </h2>

        <p className="mt-1 text-sm">
          Ask questions about your income, expenses, and spending
          categories.
        </p>
      </div>

      <div className="mt-5 min-h-48 space-y-3 overflow-y-auto rounded-md border border-(--border) p-4 lg:min-h-0 lg:flex-1">
        {messages.length === 0 && (
          <p className="text-sm opacity-70">
            Ask a question below to get an answer based on your
            financial data.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto max-w-4/5 rounded-lg bg-(--accent) px-4 py-3 text-white"
                : "mr-auto max-w-4/5 rounded-lg bg-(--accent-bg) px-4 py-3"
            }
          >
            <p className="text-xs font-semibold">
              {message.role === "user" ? "You" : "Finance Assistant"}
            </p>

            <p className="mt-1 text-sm">{message.text}</p>
          </div>
        ))}

        {isLoading && (
          <p className="text-sm opacity-70">
            Finance Assistant is thinking…
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedQuestions.map((suggestedQuestion) => (
          <button
            key={suggestedQuestion}
            type="button"
            onClick={() => askQuestion(suggestedQuestion)}
            disabled={isLoading || !hasTransactions}
            className="rounded-full border border-(--border) px-3 py-1 text-sm hover:bg-(--accent-bg) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suggestedQuestion}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about your finances..."
          maxLength={500}
          disabled={isLoading || !hasTransactions}
          className="min-w-0 flex-1 rounded-md border border-(--border) bg-transparent px-3 py-2"
        />

        <button
          type="submit"
          disabled={
            isLoading ||
            !hasTransactions ||
            !question.trim()
          }
          className="rounded-md bg-(--accent) px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>

      {!hasTransactions && (
        <p className="mt-3 text-sm">
          Add transactions or select a date range containing
          transactions before asking a question.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-500"
        >
          {error}
        </p>
      )}

      <p className="mt-4 text-xs opacity-70">
        AI-generated educational information. Verify important
        financial decisions independently.
      </p>
    </section>
  );
}