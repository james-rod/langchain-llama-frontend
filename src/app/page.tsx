import Chat from "./components/Chat";
import "./style.css";
export default function HomePage() {
  return (
    <section className="section-container">
      <h1 className="title">Langchain-llama-Demo-Chat</h1>
      <p className="description">
        Ask Questions to stay organized, stay productive, and manage everything
      </p>
      <Chat />
    </section>
  );
}
