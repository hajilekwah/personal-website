import { useState, useEffect, FormEvent } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface GuestbookMessage {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  photoUrl: string;
  text: string;
  createdAt: any; // Firestore Timestamp
}

export default function Guestbook() {
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Track auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((usr) => {
      setUser(usr);
    });
    return unsubscribe;
  }, []);

  // Sync messages in real-time
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: GuestbookMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push(docSnap.data() as GuestbookMessage);
        });
        setMessages(msgs);
        setErrorMessage('');
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    return unsubscribe;
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Please authenticate first using the connect button.');
      return;
    }
    const cleanText = text.trim();
    if (!cleanText) return;
    if (cleanText.length > 280) {
      setErrorMessage('Message exceeds 280 character threshold.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const messagesCollection = collection(db, 'messages');
    const newDocRef = doc(messagesCollection);
    const messageId = newDocRef.id;

    // Use a clean serializable Date which Firestore compiles seamlessly to Timestamp
    const payload = {
      id: messageId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous Guest',
      userEmail: user.email || '',
      photoUrl: user.photoURL || '',
      text: cleanText,
      createdAt: new Date()
    };

    try {
      await setDoc(newDocRef, payload);
      setText('');
    } catch (error) {
      setErrorMessage('Write Rejected by Security Policy.');
      handleFirestoreError(error, OperationType.WRITE, `messages/${messageId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    if (!user) return;
    const targetPath = `messages/${msgId}`;
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (error) {
      setErrorMessage('Delete failed. Verification error.');
      handleFirestoreError(error, OperationType.DELETE, targetPath);
    }
  };

  const formatShortDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    let date = new Date();
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    return date.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) + ' ' + 
           date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div id="guestbook-section" className="bg-[#050505]/60 border border-white/[0.08] rounded-2xl p-5 font-mono text-zinc-400 space-y-3.5 backdrop-blur-xl relative">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={12} className="text-white/30" />
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60">
            Elijah's Guestbook Grid
          </h3>
        </div>
        <span className="text-[9px] text-[#f0f0f0]/30 font-mono uppercase tracking-wider">{messages.length} ACTIVE_RECORDS</span>
      </div>

      {/* Message Feed list */}
      <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 flex flex-col scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="text-zinc-600 text-[11px] font-mono py-8 text-center italic select-none">
            -- No public transmissions recorded --
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors duration-150"
            >
              <div className="flex gap-2 items-start max-w-[88%]">
                {msg.photoUrl ? (
                  <img 
                    src={msg.photoUrl} 
                    alt={msg.userName} 
                    className="w-4 h-4 rounded-full border border-white/10 mt-0.5 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[7px] font-bold text-indigo-300 mt-0.5 shrink-0 font-mono">
                    {msg.userName.substring(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-zinc-300 truncate max-w-[100px]">{msg.userName}</span>
                    <span className="text-[8px] font-mono text-zinc-600 shrink-0">{formatShortDate(msg.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-light leading-relaxed select-text break-all font-sans">{msg.text}</p>
                </div>
              </div>

              {user && msg.userId === user.uid && (
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-1 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 rounded transition-colors duration-150 cursor-pointer shrink-0"
                  title="Remove message transmission"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input submission Form */}
      <div className="border-t border-white/[0.06] pt-2">
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-1.5">
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 focus-within:border-white/20 transition-colors duration-150">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type transmission and hit send..."
                maxLength={280}
                required
                className="w-full bg-transparent border-none text-[11px] text-white focus:outline-none placeholder-zinc-700 font-mono"
              />
              <span className="text-[8px] font-mono text-zinc-600 select-none">
                {280 - text.length}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !text.trim()}
                className="p-1.5 rounded bg-white/5 text-zinc-400 hover:bg-white hover:text-black hover:border-white disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer transition-colors duration-150"
              >
                <Send size={9} />
              </button>
            </div>
            {errorMessage && (
              <p className="text-[9px] text-rose-400 font-mono text-center">
                ● ERROR: {errorMessage}
              </p>
            )}
          </form>
        ) : (
          <div className="p-2 border border-white/5 bg-white/[0.01] rounded-lg text-center select-none">
            <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
              CONNECT SECURE_AUTH TO WRITE MESSAGE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
