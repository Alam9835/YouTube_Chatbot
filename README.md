# 🎥 VidQA: Chat with Any YouTube Video using AI


**VidQA** is an AI-powered web application that lets you interact with YouTube videos using **natural language questions**. Powered by **LangChain**, **OpenAI**, and **RAG (Retrieval-Augmented Generation)**, this tool transforms long videos into conversational knowledge bases.

🔗 Try it out: Paste a YouTube link and start asking questions like:
- “Does this video mention Artificial Intelligence?”
- “Summarize this lecture in bullet points.”
- “What were the key takeaways from this interview?”

---

## 🚀 Features

- 🎯 Ask questions about **any YouTube video**
- 🧠 Built with **LangChain + OpenAI GPT-4o**
- 📝 Generates **bullet-point summaries** of video content
- 🧩 Uses **YouTube transcripts + embeddings** for contextual search
- ⚡ Fast and responsive UI built with **React & TailwindCSS**
- 🔍 No need to watch — just chat to extract insights

---

## 🖼️ Demo

<img width="1860" height="790" alt="y1" src="https://github.com/user-attachments/assets/e17cf52c-5e6d-4548-b359-4a44834b4c4e" />

---

## 🧱 Tech Stack

| Layer        | Technologies |
|--------------|--------------|
| 💻 Frontend  | React, TailwindCSS |
| 🔧 Backend   | LangChain, OpenAI API |
| 📹 Video     | YouTubeTranscriptAPI |
| 🤖 LLM       | OpenAI GPT-4o-mini |
| 📚 Embedding | OpenAI `text-embedding-3-small` |

---

## 🛠️ How It Works

1. **User pastes a YouTube link**
2. **Transcript is fetched and chunked**
3. **Embeddings are generated using OpenAI**
4. **GPT-4o-mini answers your question from transcript chunks**
5. **Frontend displays response and bullet summaries**

---

