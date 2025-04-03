import Head from 'next/head';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';

export default function ChatPage() {
  return (
    <>
      <Head>
        <title>Chat with AI</title>
      </Head>
      <Navbar />
      <ChatWidget />
    </>
  );
}
