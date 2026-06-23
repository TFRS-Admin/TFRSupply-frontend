import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function ChatBubbleStyles() {
  const [style, setStyle] = useState('modern');
  const bubbles = {
    modern: (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="self-start bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-sm text-sm max-w-[80%]">Hello! How can I help?</div>
        <div className="self-end bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm max-w-[80%]">Hi there! I'm your assistant.</div>
        <div className="self-start bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-sm text-sm max-w-[80%]">Great, thanks!</div>
      </div>
    ),
    minimal: (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="self-start border border-gray-200 text-gray-700 px-4 py-2 rounded text-sm max-w-[80%]">Hello! How can I help?</div>
        <div className="self-end bg-black text-white px-4 py-2 rounded text-sm max-w-[80%]">Hi there! I'm your assistant.</div>
        <div className="self-start border border-gray-200 text-gray-700 px-4 py-2 rounded text-sm max-w-[80%]">Great, thanks!</div>
      </div>
    ),
    gradient: (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="self-start text-white px-4 py-2 rounded-2xl text-sm max-w-[80%]" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>Hello! How can I help?</div>
        <div className="self-end text-white px-4 py-2 rounded-2xl text-sm max-w-[80%]" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>Hi there!</div>
        <div className="self-start text-white px-4 py-2 rounded-2xl text-sm max-w-[80%]" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>Great, thanks!</div>
      </div>
    ),
    bubble: (
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <div className="self-start relative bg-gray-200 text-gray-900 px-4 py-2 rounded-xl text-sm max-w-[80%]">
          Hello! How can I help?
          <div className="absolute -bottom-1.5 left-3 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #e5e7eb' }} />
        </div>
        <div className="self-end relative bg-blue-500 text-white px-4 py-2 rounded-xl text-sm max-w-[80%]">
          Hi there!
          <div className="absolute -bottom-1.5 right-3 w-0 h-0" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #3b82f6' }} />
        </div>
      </div>
    ),
  };
  return (
    <EffectCard title="Chat Bubble Styles" desc="Different message bubble designs" whenToUse="Essential for any messaging interface or chat application."
      prompt="Create chat bubbles with different styles: modern rounded, minimal border, gradient, and tail-style bubble"
      code={`// Modern: rounded-2xl with rounded-tl-sm for sent, rounded-tr-sm for received\n// Gradient: background: 'linear-gradient(135deg, #667eea, #764ba2)'\n// Tail: CSS borders trick to create a triangle pointer`}>
      <div className="flex flex-col gap-2 w-full">
        {bubbles[style]}
        <div className="flex gap-1.5 flex-wrap mt-1">
          {Object.keys(bubbles).map(s => (
            <button key={s} onClick={() => setStyle(s)} className={`text-[10px] font-bold px-2 py-1 rounded border ${style===s?'bg-gray-900 text-white border-gray-900':'border-gray-200 text-gray-600'}`}>{s}</button>
          ))}
        </div>
      </div>
    </EffectCard>
  );
}

function TypingIndicator() {
  const [typing, setTyping] = useState(true);
  return (
    <EffectCard title="Typing Indicator" desc="Animated typing dots" whenToUse="Show when someone is composing a message or AI is generating."
      prompt="Create a typing indicator with 3 dots using staggered CSS bounce animations"
      code={`<div className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-2xl">\n  {[0,1,2].map(i => (\n    <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"\n      style={{ animation: \`typingDot 1.4s \${i*0.2}s ease-in-out infinite\` }} />\n  ))}\n</div>\n// @keyframes typingDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}>
      <div className="flex flex-col items-start gap-3 w-full max-w-xs">
        {typing && (
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <span className="text-xs text-gray-500 mr-1">Assistant is typing</span>
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 bg-gray-400 rounded-full" style={{ animation: `typingDot 1.4s ${i * 0.2}s ease-in-out infinite` }} />
            ))}
          </div>
        )}
        <button onClick={() => setTyping(t => !t)} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg">{typing ? 'Hide' : 'Show Typing'}</button>
      </div>
      <style>{`@keyframes typingDot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </EffectCard>
  );
}

function MessageAnimations() {
  const [anim, setAnim] = useState('slide');
  const [messages, setMessages] = useState(['Hello!', 'How are you?']);
  const animClass = { slide: 'slideIn', scale: 'scaleIn', fade: 'fadeIn', bounce: 'bounceIn' };
  return (
    <EffectCard title="Message Animations" desc="Different entry animations" whenToUse="Makes conversations feel alive and responsive."
      prompt="Create message entry animations: slide from left, scale from center, fade in, and bounce in"
      code={`// @keyframes slideIn { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }\n// Apply animation to new message elements as they mount`}>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="flex gap-1.5 mb-1 flex-wrap">
          {Object.keys(animClass).map(a => <button key={a} onClick={() => setAnim(a)} className={`text-[10px] font-bold px-2 py-1 rounded border ${anim===a?'bg-gray-900 text-white border-gray-900':'border-gray-200 text-gray-600'}`}>{a}</button>)}
        </div>
        <div className="max-h-32 overflow-y-auto flex flex-col gap-1.5">
          {messages.map((m, i) => (
            <div key={i} className="self-start bg-gray-100 text-gray-900 px-3 py-1.5 rounded-xl text-xs" style={{ animation: `${animClass[anim]} 0.3s ease-out` }}>{m}</div>
          ))}
        </div>
        <button onClick={() => setMessages(ms => [...ms, `Message ${ms.length + 1}`])} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg mt-1">Add Message</button>
      </div>
      <style>{`
        @keyframes slideIn { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes scaleIn { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(0.3);opacity:0} 60%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </EffectCard>
  );
}

function FloatingChatButton() {
  const [open, setOpen] = useState(false);
  return (
    <EffectCard title="Floating Chat Button" desc="FAB with notification badge" whenToUse="Add customer support or help chat to any website."
      prompt="Create a floating action button with a notification badge that opens a chat widget on click"
      code={`<div className="fixed bottom-6 right-6">\n  <button onClick={() => setOpen(o => !o)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg">\n    💬\n  </button>\n  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">3</span>\n</div>`}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <button onClick={() => setOpen(o => !o)} className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-blue-700 transition-colors">💬</button>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
        </div>
        {open && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-56 text-sm">
            <div className="font-bold mb-2">Chat Support</div>
            <div className="text-gray-500 text-xs">Hi! How can we help you today?</div>
          </div>
        )}
        <div className="text-[10px] text-gray-400">Notification Badge</div>
      </div>
    </EffectCard>
  );
}

function ReadReceipts() {
  const [status, setStatus] = useState('read');
  const icons = { sent: '✓', delivered: '✓✓', read: <span className="text-blue-500">✓✓</span> };
  return (
    <EffectCard title="Read Receipts" desc="Message delivery status" whenToUse="Messaging apps to show delivery confirmation."
      prompt="Create message read receipts with three states: sent (single check), delivered (double check), read (blue double check)"
      code={`const receipts = { sent: '✓', delivered: '✓✓', read: <span className="text-blue-500">✓✓</span> };\n<span className="text-xs text-gray-400">{receipts[status]}</span>`}>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        {['Hey!', 'How\'s it going?', 'Let me know!'].map((msg, i) => (
          <div key={i} className="self-end bg-blue-500 text-white px-3 py-1.5 rounded-xl text-sm flex items-end gap-1.5">
            {msg}
            <span className="text-[10px] opacity-80">{i < 2 ? '✓✓' : (status === 'read' ? <span key="r">✓✓</span> : icons[status])}</span>
          </div>
        ))}
        <div className="flex gap-1.5 mt-1">
          {['sent','delivered','read'].map(s => <button key={s} onClick={() => setStatus(s)} className={`text-[10px] font-bold px-2 py-1 rounded border ${status===s?'bg-gray-900 text-white border-gray-900':'border-gray-200 text-gray-600'}`}>{s}</button>)}
        </div>
      </div>
    </EffectCard>
  );
}

function QuickReplies() {
  const [selected, setSelected] = useState(null);
  const replies = ['Yes, please!', 'No thanks', 'Tell me more', 'Schedule a call', 'Send docs'];
  return (
    <EffectCard title="Quick Replies" desc="Suggested response chips" whenToUse="Speed up conversations in chatbots or customer support."
      prompt="Create quick reply chips below a message that disappear after selection"
      code={`<div className="flex gap-2 flex-wrap mt-2">\n  {replies.map(r => (\n    <button key={r} onClick={() => setSelected(r)} className="px-3 py-1 text-xs border border-blue-300 text-blue-600 rounded-full hover:bg-blue-50">{r}</button>\n  ))}\n</div>`}>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="self-start bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-sm text-sm">Would you like me to help with that?</div>
        {selected ? (
          <div className="self-end bg-blue-500 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm">{selected}</div>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {replies.map(r => <button key={r} onClick={() => setSelected(r)} className="px-2.5 py-1 text-[11px] border border-blue-300 text-blue-600 rounded-full hover:bg-blue-50 transition-colors">{r}</button>)}
          </div>
        )}
        {selected && <button onClick={() => setSelected(null)} className="self-start text-[10px] text-gray-400 hover:text-gray-600">Reset</button>}
      </div>
    </EffectCard>
  );
}

function MessageReactions() {
  const [reactions, setReactions] = useState({ '👍': 3, '❤️': 1 });
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];
  const react = (e) => setReactions(r => ({ ...r, [e]: (r[e] || 0) + 1 }));
  return (
    <EffectCard title="Message Reactions" desc="Emoji reaction buttons" whenToUse="Social messaging, team chat, or any platform where users express appreciation."
      prompt="Create emoji reactions on a message that increment a count on click"
      code={`const [reactions, setReactions] = useState({ '👍': 3, '❤️': 1 });\nconst react = (e) => setReactions(r => ({ ...r, [e]: (r[e] || 0) + 1 }));\n// Show reaction buttons on hover, display counts on active reactions`}>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="self-start bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-tl-sm text-sm">Check out this new feature!</div>
        <div className="flex gap-1 flex-wrap">
          {emojis.map(e => (
            <button key={e} onClick={() => react(e)} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border border-gray-200 hover:bg-gray-50 text-sm transition-colors">
              {e}
              {reactions[e] ? <span className="text-[10px] text-gray-600">{reactions[e]}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </EffectCard>
  );
}

function BotWelcome() {
  return (
    <EffectCard title="Bot Welcome Screen" desc="Initial chatbot greeting" whenToUse="Set the tone and guide users on what the bot can do."
      prompt="Create a bot welcome screen with avatar, greeting message, and quick action buttons"
      code={`<div className="text-center">\n  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">🤖</div>\n  <h3>Hi there! 👋</h3>\n  <p>I'm your AI assistant. How can I help you today?</p>\n  <div className="flex gap-2 flex-wrap justify-center mt-3">\n    {actions.map(a => <button key={a} className="px-3 py-1.5 border rounded-full text-sm">{a}</button>)}\n  </div>\n</div>`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-center w-full max-w-xs">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">🤖</div>
        <div className="font-bold text-gray-900 mb-1">Hi there! 👋</div>
        <div className="text-gray-500 text-xs mb-3">I'm your AI assistant. How can I help you today?</div>
        <div className="flex gap-2 flex-wrap justify-center">
          {['Ask a question', 'Get support', 'Learn more'].map(a => (
            <button key={a} className="px-2.5 py-1 text-[11px] border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50">{a}</button>
          ))}
        </div>
      </div>
    </EffectCard>
  );
}

export default function ChatEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ChatBubbleStyles />
      <TypingIndicator />
      <MessageAnimations />
      <FloatingChatButton />
      <ReadReceipts />
      <QuickReplies />
      <MessageReactions />
      <BotWelcome />
    </div>
  );
}