import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Define GameChat Component before ChessGame
game_chat_component = """
function GameChat({ opponent, userEmail, chatMessages, setChatMessages, lobbyChannel }) {
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !opponent) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'chat', payload: { targetEmail: opponent, senderEmail: userEmail, text: chatInput } });
        setChatMessages(prev => [...prev, { text: chatInput, sender: userEmail }]);
        setChatInput('');
    };

    return (
        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '220px', flexShrink: 0 }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #333', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>GAME CHAT</div>
            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', fontSize: '13px' }}>
                {chatMessages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '8px', textAlign: m.sender === userEmail ? 'right' : 'left' }}>
                        <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: '12px', backgroundColor: m.sender === userEmail ? '#075e54' : '#333', maxWidth: '80%' }}>{m.text}</div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendChatMessage} style={{ display: 'flex', borderTop: '1px solid #333' }}>
                <input disabled={!opponent} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={opponent ? "Type message..." : "Chat locked"} style={{ flexGrow: 1, padding: '10px', backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', minWidth: 0 }} />
                <button type="submit" style={{ backgroundColor: '#38bdf8', border: 'none', color: 'black', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
            </form>
        </div>
    );
}
"""
content = content.replace('// ⚛️ CHESS GAME COMPONENT', game_chat_component + '\n// ⚛️ CHESS GAME COMPONENT')

# 2. Remove chatInput and sendChatMessage from ChessGame
content = content.replace("    const [chatInput, setChatInput] = useState('');\n", '')
content = content.replace("    const chatEndRef = useRef(null);\n", '')
content = content.replace('    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);\n', '')

send_chat_msg_old = """    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !opponent) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'chat', payload: { targetEmail: opponent, senderEmail: userEmail, text: chatInput } });
        setChatMessages(prev => [...prev, { text: chatInput, sender: userEmail }]);
        setChatInput('');
    };"""
content = content.replace(send_chat_msg_old.replace('\n', '\r\n'), '')
content = content.replace(send_chat_msg_old, '')

# 3. Replace the inline Game Chat with the GameChat component
inline_game_chat = """                        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '220px', flexShrink: 0 }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #333', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>GAME CHAT</div>
                            <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', fontSize: '13px' }}>
                                {chatMessages.map((m, i) => (
                                    <div key={i} style={{ marginBottom: '8px', textAlign: m.sender === userEmail ? 'right' : 'left' }}>
                                        <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: '12px', backgroundColor: m.sender === userEmail ? '#075e54' : '#333', maxWidth: '80%' }}>{m.text}</div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={sendChatMessage} style={{ display: 'flex', borderTop: '1px solid #333' }}>
                                <input disabled={!opponent} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={opponent ? "Type message..." : "Chat locked"} style={{ flexGrow: 1, padding: '10px', backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', minWidth: 0 }} />
                                <button type="submit" style={{ backgroundColor: '#38bdf8', border: 'none', color: 'black', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                            </form>
                        </div>"""
game_chat_comp_usage = """                        <GameChat opponent={opponent} userEmail={userEmail} chatMessages={chatMessages} setChatMessages={setChatMessages} lobbyChannel={lobbyChannel} />"""
content = content.replace(inline_game_chat.replace('\n', '\r\n'), game_chat_comp_usage)
content = content.replace(inline_game_chat, game_chat_comp_usage)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print('Done GameChat extraction!')
