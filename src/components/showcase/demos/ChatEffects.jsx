import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function ChatBubbles() {
  const messages = [
    { role: 'user', text: 'Hey! How does this work?' },
    { role: 'bot', text: 'Great question! Just type your message and I\'ll respond.' },
    { role: 'user', text: 'That\'s simple enough!' },
  ];
  return (
    <div className="space-y-2 w-56">
      {messages.map((m, i) => (
        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`text-xs px-3 py-2 rounded-2xl max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
            {m.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 w-20">
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: `pulse 1s ${d}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
    </div>
  );
}

function LiveChat() {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! How can I help?' }]);
  const [input, setInput] = useState('');
  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setTimeout(() => setMessages(m => [...m, { role: 'bot', text: 'Thanks for your message! 👋' }]), 1000);
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl w-56 overflow-hidden">
      <div className="bg-blue-600 text-white text-xs font-bold px-3 py-2">Support Chat</div>
      <div className="p-3 space-y-2 h-24 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`text-xs px-2.5 py-1.5 rounded-xl max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-100 flex">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type..." className="flex-1 px-3 py-2 text-xs focus:outline-none" />
        <button onClick={send} className="bg-blue-600 text-white text-xs font-bold px-3">Send</button>
      </div>
    </div>
  );
}

function ChatBot() {
  const [step, setStep] = useState(0);
  const questions = [
    { bot: 'What\'s your name?', key: 'name' },
    { bot: 'Nice to meet you! What can I help with?', key: 'question' },
  ];
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const current = questions[step];
  const answer = () => {
    if (!input.trim()) return;
    setAnswers(a => ({ ...a, [current.key]: input }));
    setInput('');
    setStep(s => Math.min(s + 1, questions.length));
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl w-52 text-xs">
      <div className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-t-xl">🤖 ChatBot</div>
      <div className="p-3 space-y-2">
        {step < questions.length ? (
          <>
            <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2 text-gray-800">{questions[step].bot}</div>
            <div className="flex gap-1 mt-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && answer()}
                placeholder="Reply..." className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none" />
              <button onClick={answer} className="bg-gray-900 text-white px-2 py-1 rounded-lg font-bold">→</button>
            </div>
          </>
        ) : (
          <div className="text-center py-2">
            <div className="text-lg mb-1">✅</div>
            <div className="font-bold text-gray-900">Thanks, {answers.name}!</div>
            <button onClick={() => { setStep(0); setAnswers({}); }} className="mt-2 text-blue-500 hover:underline text-[10px]">Restart</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Chat Bubbles" desc="User and bot message bubbles" whenToUse="Chat interfaces, messaging apps, support UIs." prompt="Create chat bubbles where user messages are right-aligned with blue background and bot messages are left-aligned with gray-100 background. Use rounded-br-sm and rounded-bl-sm for the 'tail'." code={`{messages.map((m, i) => (\n  <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>\n    <div className={\`text-xs px-3 py-2 rounded-2xl max-w-[80%] \${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}\`}>\n      {m.text}\n    </div>\n  </div>\n))}`}><ChatBubbles /></EffectCard>

      <EffectCard title="Typing Indicator" desc="Three animated pulsing dots" whenToUse="Chat apps, AI responses, message processing." prompt="Create a typing indicator with 3 dots inside a chat bubble that pulse with staggered animation delays of 0, 0.2s, 0.4s." code={`<div className="flex items-center gap-1 bg-gray-100 rounded-2xl px-4 py-3">\n  {[0, 0.2, 0.4].map((d, i) => (\n    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"\n      style={{ animation: \`pulse 1s \${d}s ease-in-out infinite\` }} />\n  ))}\n</div>`}><TypingIndicator /></EffectCard>

      <EffectCard title="Live Chat Widget" desc="Working send/receive chat UI" whenToUse="Customer support, help widgets, contact forms." prompt="Create a mini live chat widget with a colored header, scrollable message history, and an input+send button at the bottom. Bot auto-replies after 1 second." code={`function LiveChat() {\n  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! How can I help?' }]);\n  const [input, setInput] = useState('');\n  const send = () => {\n    setMessages(m => [...m, { role: 'user', text: input }]);\n    setInput('');\n    setTimeout(() => setMessages(m => [...m, { role: 'bot', text: 'Thanks! 👋' }]), 1000);\n  };\n  // return chat UI JSX\n}`}><LiveChat /></EffectCard>

      <EffectCard title="Conversational Bot" desc="Step-by-step question flow" whenToUse="Onboarding flows, surveys, lead capture." prompt="Create a conversational chatbot that asks questions one at a time and collects answers. Shows a success state when complete with a restart option." code={`function ChatBot() {\n  const [step, setStep] = useState(0);\n  const questions = [\n    { bot: 'What\\'s your name?', key: 'name' },\n    { bot: 'What can I help with?', key: 'question' },\n  ];\n  // render current question, collect answers, show completion state\n}`}><ChatBot /></EffectCard>
    </div>
  );
}