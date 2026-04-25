import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

function ConversationList({ conversations, onSelect }) {
  const { t } = useLanguage();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <span className="text-5xl mb-4">💬</span>
        <p className="font-semibold text-slate-700">{t('noConversations')}</p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map(conv => {
        const other = conv.other_user;
        const last = conv.last_message;
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className="list-row w-full text-left"
          >
            <div className="avatar w-11 h-11 text-base flex-shrink-0">
              {other?.name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-sm truncate">{other?.name}</span>
                {last && <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">{new Date(last.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {last?.text || '...'}
              </p>
            </div>
            {conv.unread_count > 0 && (
              <span className="flex-shrink-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {conv.unread_count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MessageView({ convId, onBack }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      const r = await axios.get(`/api/chat/conversations/${convId}/messages`);
      setData(r.data);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    return () => clearInterval(iv);
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages?.length]);

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await axios.post(`/api/chat/conversations/${convId}/messages`, { text });
      setText('');
      await load();
    } catch { /* ignore */ } finally { setSending(false); }
  };

  if (!data) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const other = data.conversation.other_user;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - var(--top-bar-h) - var(--safe-top) - var(--bottom-nav-h) - var(--safe-bottom))' }}>
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="avatar w-9 h-9 text-sm">{other?.name?.[0] || '?'}</div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{other?.name}</p>
          <p className="text-[11px] text-green-500 font-medium">● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-slate-50">
        {data.messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm py-8">Say hello! 👋</div>
        )}
        {data.messages.map(msg => {
          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={isMe ? 'bubble-me' : 'bubble-other'}>
                <p className="leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-blue-200' : 'text-slate-400'} text-right`}>
                  {new Date(msg.created_at).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMsg} className="flex gap-2 px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={t('typeMessage')}
          className="flex-1 bg-slate-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:bg-slate-50 focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:bg-blue-700 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(id ? Number(id) : null);

  const loadConvs = async () => {
    try {
      const r = await axios.get('/api/chat/conversations');
      setConversations(r.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { loadConvs(); }, []);
  useEffect(() => { if (id) setActiveId(Number(id)); }, [id]);

  const selectConv = (conv) => {
    setActiveId(conv.id);
    navigate(`/chat/${conv.id}`, { replace: true });
  };

  if (activeId) {
    return (
      <div className="fade-in">
        <MessageView convId={activeId} onBack={() => { setActiveId(null); navigate('/chat'); }} />
      </div>
    );
  }

  return (
    <div className="fade-in">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ConversationList conversations={conversations} onSelect={selectConv} />
      )}
    </div>
  );
}
