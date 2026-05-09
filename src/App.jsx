import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { supabase } from './supabaseClient';
import './App.css';

// ==========================================
// 🔊 SOUND ASSETS
// ==========================================
const sounds = {
    move: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Move.mp3',
    capture: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Capture.mp3',
    check: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Check.mp3',
    castle: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Move.mp3',
    // ⚡ Using a direct web URL so it works immediately without local files
    thunder: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7845f4fae2.mp3',
};

// --- Helper for Text-to-Speech ---
const speak = (text) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
};

// ==========================================
// ✈️ 50 TRAVEL ADS DATA
// ==========================================
const cities = [
    "Paris", "London", "Tokyo", "Bali", "NYC", "Dubai", "Rome", "Swiss Alps", "Maldives", "Sydney",
    "Barcelona", "Santorini", "Bangkok", "Iceland", "Cairo", "Venice", "Rio", "Kyoto", "Amsterdam", "Prague",
    "Cape Town", "Machu Picchu", "Lisbon", "Seoul", "Bora Bora", "Hawaii", "Fiji", "Phuket", "Maui", "Florence",
    "Vienna", "Berlin", "Dublin", "Istanbul", "Marrakech", "Mexico City", "Toronto", "Vancouver", "Singapore", "Hong Kong",
    "Las Vegas", "LA", "Miami", "Orlando", "New Orleans", "SF", "Austin", "Chicago", "Boston", "Seattle"
];

const travelAds = cities.map((city, i) => ({
    id: i,
    name: `${i % 2 === 0 ? 'Grand Hotel' : 'Luxury Flight'} ${city}`,
    url: i % 2 === 0 ? "https://www.booking.com" : "https://www.skyscanner.com",
    img: `https://picsum.photos/seed/${city}/300/200`,
    tag: i % 2 === 0 ? "HOTEL" : "FLIGHT"
}));

// ==========================================
// 🧠 AI ENGINE
// ==========================================
// AI Engine moved to src/workers/aiWorker.js

// ==========================================
// 🔐 AUTH SCREEN
// ==========================================
function AuthScreen({ onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        const cleanEmail = email.trim().toLowerCase();

        // Sign out any existing session first to prevent duplicate sessions
        await supabase.auth.signOut();

        let { data, error } = isLogin
            ? await supabase.auth.signInWithPassword({ email: cleanEmail, password })
            : await supabase.auth.signUp({ email: cleanEmail, password });

        setLoading(false);
        if (error) {
            if (error.message.includes('Email not confirmed') || error.message.includes('invalid_grant')) {
                setErrorMsg('Your email is not confirmed yet. Please check your inbox and click the confirmation link.');
            } else if (error.message.includes('User already registered')) {
                setErrorMsg('This email is already registered. Please log in instead.');
                setIsLogin(true);
            } else if (error.message.includes('Invalid login credentials')) {
                setErrorMsg('Incorrect email or password. Please try again.');
            } else {
                setErrorMsg(error.message);
            }
        } else if (data?.user) {
            if (!isLogin && !data.session) {
                setSuccessMsg('Account created! ✉️ Check your email for the confirmation link, then log in below.');
                setIsLogin(true);
            } else {
                onAuthSuccess(data.user);
            }
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'Segoe UI' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '8px', width: '320px', border: '1px solid #333' }}>
                <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '15px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                {/* --- NOTICES --- */}
                {errorMsg && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '13px', marginBottom: '15px', lineHeight: '1.4', textAlign: 'center' }}>
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '13px', marginBottom: '15px', lineHeight: '1.4', textAlign: 'center' }}>
                        {successMsg}
                    </div>
                )}
                


                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '10px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px', outline: 'none' }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ padding: '10px', paddingRight: '44px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px', width: '100%', boxSizing: 'border-box', outline: 'none' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '16px', padding: '0', lineHeight: 1 }}
                            title={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '4px', color: '#000' }}>
                        {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>{isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}</span>
                </div>
            </div>
        </div>
    );
}

// ==========================================

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

// ⚛️ CHESS GAME COMPONENT
// ==========================================
function ChessGame({ user, onLogout }) {
    const userEmail = user.email;
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moveFrom, setMoveFrom] = useState('');

    const [status, setStatus] = useState("Waiting to start...");
    const [isPlayingComputer, setIsPlayingComputer] = useState(false);
    const [challengeTime, setChallengeTime] = useState(600);

    const [explosionSquare, setExplosionSquare] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [tvGames, setTvGames] = useState([]);

    const [chessComStreamers, setChessComStreamers] = useState([]);

    const [viewMode, setViewMode] = useState('online');
    const [lobbyChannel, setLobbyChannel] = useState(null);
    const [incomingChallenge, setIncomingChallenge] = useState(null);
    const [incomingDrawOffer, setIncomingDrawOffer] = useState(false);

    // Game Chat
    const [chatMessages, setChatMessages] = useState([]);

    // Community Chat (Database bound & toggleable)
    const [showCommunityChat, setShowCommunityChat] = useState(false);
    const [communityMessages, setCommunityMessages] = useState([]);
    const [communityInput, setCommunityInput] = useState('');
    const communityEndRef = useRef(null);

    const [opponent, setOpponent] = useState(null);
    const [playerColor, setPlayerColor] = useState('w');

    const [whiteTime, setWhiteTime] = useState(300);
    const [blackTime, setBlackTime] = useState(300);

    const timerRef = useRef(null);
    const mySocketId = useRef(Math.random().toString(36).substring(7));
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [isGameOverManually, setIsGameOverManually] = useState(false);

    const [gunshotEnabled, setGunshotEnabled] = useState(true);
    const gunshotEnabledRef = useRef(gunshotEnabled);

    // --- NEW: Chat TTS State & Ref ---
    const [speakChatEnabled, setSpeakChatEnabled] = useState(false);
    const speakChatEnabledRef = useRef(speakChatEnabled);

    // --- SIDEBAR STATE ---
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const [activeTab, setActiveTab] = useState('board');

    useEffect(() => {
        gunshotEnabledRef.current = gunshotEnabled;
        speakChatEnabledRef.current = speakChatEnabled;
    }, [gunshotEnabled, speakChatEnabled]);

    const opponentRef = useRef(null);
    const gameRef = useRef(new Chess());

    useEffect(() => { opponentRef.current = opponent; }, [opponent]);

    const pieceImages = {
        p: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
        r: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
        n: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        b: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
        q: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
        k: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
        P: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
        R: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
        N: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        B: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
        Q: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
        K: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
    };

    const displayGame = useMemo(() => {
        const game = new Chess();
        moveHistory.slice(0, currentMoveIndex).forEach(m => { try { game.move(m); } catch (e) { } });
        return game;
    }, [moveHistory, currentMoveIndex]);

    useEffect(() => {
        fetchUserStats();
        fetchAllMembers();
        fetchTvGames();
        fetchChessComTv();
        fetchCommunityComments();
    }, []);


    // Auto-scroll community chat when it updates or becomes visible
    useEffect(() => {
        if (showCommunityChat) {
            communityEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [communityMessages, showCommunityChat]);

    const fetchUserStats = async () => {
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setStats({ wins: data.wins, losses: data.losses, draws: data.draws });
    };

    const fetchAllMembers = async () => {
        let { data } = await supabase.from('profiles').select('email');
        if (data) {
            const obfuscated = data.map(u => ({ email: u.email.split('@')[0].substring(0, 3) + '***@***.com' }));
            setAllMembers(obfuscated);
        }
    };

    const fetchCommunityComments = async () => {
        let { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) setCommunityMessages(data.reverse()); // Reverse so newest are at the bottom
    };

    const fetchTvGames = async () => {
        try {
            const res = await fetch('https://lichess.org/api/tv/channels');
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            const gamesList = Object.entries(data).map(([channel, game]) => ({
                channel: channel,
                url: `https://lichess.org/${game.gameId}`,
                white: game.user?.name || 'Unknown',
                whiteRating: game.rating || '?',
                black: 'Opponent',
                blackRating: '?'
            }));

            setTvGames(gamesList);
        } catch (e) {
            console.error("Failed to fetch Lichess TV:", e);
        }
    };

    const fetchChessComTv = async () => {
        try {
            const res = await fetch('https://api.chess.com/pub/streamers');
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            const liveStreamers = data.streamers.filter(s => s.is_live);
            setChessComStreamers(liveStreamers);
        } catch (e) {
            console.error("Failed to fetch Chess.com TV:", e);
        }
    };

    const playMoveSound = (move, gameInstance) => {
        let audioUrl = sounds.move;
        if (gameInstance.inCheck()) {
            audioUrl = sounds.check;
            speak("Check");
        }
        else if (move.captured) audioUrl = sounds.capture;
        new Audio(audioUrl).play().catch(() => { });
    };

    const triggerCaptureEffects = (square) => {
        if (gunshotEnabledRef.current) {
            new Audio('/shotgun.mp3').play().catch(() => { });
        }
        setExplosionSquare(square);
        setTimeout(() => setExplosionSquare(null), 600);
    };

    const recordResult = async (type) => {
        // Prevent direct client updates to avoid cheating
        // Supabase RPC is required for secure increments
        try {
            const { data, error } = await supabase.rpc('record_game_result', { result_type: type });
            if (error) {
                console.warn('RPC record_game_result not found or failed, falling back to local state only.', error);
                // Fallback for local state (will not persist securely unless RPC is implemented)
                setStats(prev => {
                    const updates = { ...prev };
                    if (type === 'win') updates.wins += 1;
                    if (type === 'loss') updates.losses += 1;
                    if (type === 'draw') updates.draws += 1;
                    return updates;
                });
            } else {
                // Fetch updated stats
                let { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (profileData) setStats({ wins: profileData.wins, losses: profileData.losses, draws: profileData.draws });
            }
        } catch(e) {
            console.error(e);
        }
    };

    const resetMatch = (timeControl = 300) => {
        gameRef.current = new Chess();
        setMoveHistory([]);
        setCurrentMoveIndex(0);
        setWhiteTime(timeControl);
        setBlackTime(timeControl);
        setMoveFrom('');
        setIsGameOverManually(false);
        setIncomingDrawOffer(false);
        setChatMessages([]);
    };

    // --- 🌐 REALTIME BROADCAST HANDLER ---
    useEffect(() => {
        const channel = supabase.channel('chess-lobby');
        setLobbyChannel(channel);

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const activePresences = [];
                for (const key in state) { state[key].forEach(p => activePresences.push(p)); }
                setOnlineUsers(activePresences);
            })
            .on('broadcast', { event: 'challenge' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) setIncomingChallenge({ email: payload.challengerEmail, timeControl: payload.timeControl });
            })
            .on('broadcast', { event: 'accept' }, ({ payload }) => {
                if (payload.challengerEmail === userEmail) {
                    setOpponent(payload.targetEmail);
                    setIsPlayingComputer(false);
                    setPlayerColor('w');
                    resetMatch(payload.timeControl);

                    setStatus("Game started");
                    speak("Game started");
                }
            })
            .on('broadcast', { event: 'declineChallenge' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) setStatus("Challenge declined.");
            })
            .on('broadcast', { event: 'move' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) {
                    const moveResult = gameRef.current.move(payload.moveSan);
                    if (moveResult) {
                        playMoveSound(moveResult, gameRef.current);
                        if (payload.captured) triggerCaptureEffects(payload.to);
                        setMoveHistory(prev => {
                            const next = [...prev, payload.moveSan];
                            setCurrentMoveIndex(next.length);
                            return next;
                        });
                    }
                }
            })
            .on('broadcast', { event: 'chat' }, ({ payload }) => {
                if (payload.targetEmail === userEmail && payload.senderEmail === opponentRef.current) {
                    setChatMessages(prev => [...prev, { text: payload.text, sender: payload.senderEmail }]);
                    // --- NEW: Speak incoming chat messages if enabled ---
                    if (speakChatEnabledRef.current) {
                        speak(payload.text);
                    }
                }
            })
            .on('broadcast', { event: 'resign' }, ({ payload }) => {
                if (payload.targetEmail === userEmail && !isGameOverManually) {
                    setIsGameOverManually(true);
                    const msg = "Opponent resigned. You Win!";
                    setStatus(msg);
                    speak(msg);
                    recordResult('win');
                }
            })
            .on('broadcast', { event: 'drawOffer' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) setIncomingDrawOffer(true);
            })
            .on('broadcast', { event: 'drawAccepted' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) {
                    setIsGameOverManually(true);
                    setStatus("Draw Accepted!");
                    speak("The game is a draw");
                    recordResult('draw');
                }
            })
            .on('broadcast', { event: 'drawDeclined' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) { setStatus("Draw offer declined."); setIncomingDrawOffer(false); }
            })
            .subscribe(async (s) => {
                if (s === 'SUBSCRIBED') await channel.track({
                    email: userEmail,
                    socketId: mySocketId.current,
                    isPlaying: !!(opponent || isPlayingComputer)
                });
            });

        // Postgres subscription for the 'comments' table
        const commentsSub = supabase.channel('custom-all-comments')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
                setCommunityMessages(prev => {
                    // Prevent duplicates in case the Realtime event fires twice
                    if (prev.find(m => m.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(commentsSub);
        };
    }, [userEmail, isGameOverManually]);

    // --- Update Presence Status dynamically when game starts/ends ---
    useEffect(() => {
        if (lobbyChannel) {
            lobbyChannel.track({
                email: userEmail,
                socketId: mySocketId.current,
                isPlaying: !!(opponent || isPlayingComputer)
            }).catch(() => { });
        }
    }, [opponent, isPlayingComputer, lobbyChannel, userEmail]);

    // --- Timer Logic ---
    useEffect(() => {
        if (displayGame.isGameOver() || isGameOverManually || currentMoveIndex < moveHistory.length || (!opponent && !isPlayingComputer)) {
            clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            if (displayGame.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1));
            else setBlackTime(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [moveHistory, currentMoveIndex, isGameOverManually, opponent, isPlayingComputer]);

    // Check for Timeout
    useEffect(() => {
        if (!isGameOverManually && (whiteTime === 0 || blackTime === 0)) {
            setIsGameOverManually(true);
            const winnerColor = whiteTime === 0 ? "b" : "w";
            const outcome = playerColor === winnerColor ? "You Win!" : "You Lose!";
            const msg = `Time Out! ${outcome}`;
            setStatus(msg);
            speak(msg);
            recordResult(playerColor === winnerColor ? 'win' : 'loss');
        }
    }, [whiteTime, blackTime, isGameOverManually, playerColor]);

    useEffect(() => {
        if (displayGame.isCheckmate()) {
            const loserColor = displayGame.turn();
            const outcome = playerColor === loserColor ? "You Lose!" : "You Win!";
            const msg = `Checkmate! ${outcome}`;
            setStatus(msg);
            if (!isGameOverManually) {
                setIsGameOverManually(true);
                speak(msg);

                // ⚡ THUNDER SOUND EXECUTED HERE ⚡
                new Audio(sounds.thunder).play().catch((err) => console.error("Thunder sound failed to play:", err));

                // 🔫 NEW: FIRE THREE SHOTS 🔫
                if (gunshotEnabledRef.current) {
                    const delayBetweenShots = 400; // Adjust this in milliseconds to change the speed of the shots
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            new Audio('/shotgun.mp3').play().catch(() => { });
                        }, i * delayBetweenShots);
                    }
                }

                recordResult(playerColor === loserColor ? 'loss' : 'win');
            }
        } else if (displayGame.isDraw()) {
            const msg = "The game is a Draw!";
            setStatus(msg);
            if (!isGameOverManually) {
                setIsGameOverManually(true);
                speak(msg);
                recordResult('draw');
            }
        } else if (!isGameOverManually && (opponent || isPlayingComputer)) {
            const isMyTurn = displayGame.turn() === playerColor;
            const newStatus = isMyTurn ? "🟢 Your turn" : "🔴 Waiting...";

            if (moveHistory.length > 0 && status !== newStatus) {
                setStatus(newStatus);
                if (isMyTurn) {
                    speak("Your move");
                }
            }
        }
    }, [moveHistory, playerColor, isGameOverManually, opponent, isPlayingComputer, status]);

    // --- ACTIONS ---


    const sendCommunityMessage = async (e) => {
        e.preventDefault();
        if (!communityInput.trim()) return;

        const newMsg = { text: communityInput, senderEmail: userEmail };

        // ONLY clear the input field locally. 
        // We let the Supabase Realtime Listener (in the useEffect) handle adding it to the screen 
        // so it never renders twice.
        setCommunityInput('');

        const { error } = await supabase.from('comments').insert([newMsg]);

        if (error) console.error("Error sending community message:", error.message);
    };

    const handleSendChallenge = async (targetEmail) => {
        if (!lobbyChannel) return;
        setStatus(`Challenge sent...`);
        await lobbyChannel.send({ type: 'broadcast', event: 'challenge', payload: { challengerEmail: userEmail, targetEmail, timeControl: challengeTime } });
    };

    const handleAcceptChallenge = async () => {
        if (!lobbyChannel || !incomingChallenge) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'accept', payload: { challengerEmail: incomingChallenge.email, targetEmail: userEmail, timeControl: incomingChallenge.timeControl } });
        setOpponent(incomingChallenge.email);
        setIsPlayingComputer(false);
        setPlayerColor('b');
        resetMatch(incomingChallenge.timeControl);

        setStatus("Game started");
        speak("Game started");

        setIncomingChallenge(null);
    };

    const handleDeclineChallenge = () => {
        if (lobbyChannel && incomingChallenge) {
            lobbyChannel.send({ type: 'broadcast', event: 'declineChallenge', payload: { targetEmail: incomingChallenge.email, declinerEmail: userEmail } });
        }
        setIncomingChallenge(null);
    };

    // --- NEW: Resign logic updated to handle computer matches ---
    const handleResign = () => {
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;

        if (window.confirm("Are you sure you want to resign?")) {
            setIsGameOverManually(true);
            const msg = "You resigned. You Lose!";
            setStatus(msg);
            speak(msg);
            recordResult('loss');

            // Only send broadcast if playing a real opponent
            if (opponent) {
                lobbyChannel.send({ type: 'broadcast', event: 'resign', payload: { targetEmail: opponentRef.current } });
            }
        }
    };

    // --- NEW: Draw logic pulled out into function to handle computer matches ---
    const handleDrawOffer = () => {
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;

        if (opponent) {
            lobbyChannel.send({ type: 'broadcast', event: 'drawOffer', payload: { targetEmail: opponent } });
            setStatus("Draw offer sent...");
        } else if (isPlayingComputer) {
            // AI immediately accepts draw
            setIsGameOverManually(true);
            const msg = "Computer accepts the draw!";
            setStatus(msg);
            speak(msg);
            recordResult('draw');
        }
    };

    const handleDeclineDraw = () => {
        if (opponentRef.current) {
            lobbyChannel.send({ type: 'broadcast', event: 'drawDeclined', payload: { targetEmail: opponentRef.current } });
        }
        setIncomingDrawOffer(false);
    };

    const acceptDraw = () => {
        setIsGameOverManually(true);
        const msg = "Draw agreed!";
        setStatus(msg);
        speak(msg);
        recordResult('draw');
        setIncomingDrawOffer(false);
        if (opponent) lobbyChannel.send({ type: 'broadcast', event: 'drawAccepted', payload: { targetEmail: opponentRef.current } });
    };

    function onSquareClick(square) {
        if (displayGame.isGameOver() || isGameOverManually) return;
        if (!opponent && !isPlayingComputer) return;
        if (currentMoveIndex < moveHistory.length) { setCurrentMoveIndex(moveHistory.length); return; }
        if (opponent && displayGame.turn() !== playerColor) return;
        if (!opponent && displayGame.turn() === 'b') return;

        const piece = displayGame.get(square);
        if (!moveFrom) { if (piece?.color === displayGame.turn()) setMoveFrom(square); return; }

        try {
            const piece = displayGame.get(moveFrom);
            const isPawnPromotion = piece && piece.type === 'p' && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));
            
            if (isPawnPromotion) {
                setPendingPromotion({ from: moveFrom, to: square });
                return;
            }
            
            const move = gameRef.current.move({ from: moveFrom, to: square, promotion: 'q' });
            if (move) {
                playMoveSound(move, gameRef.current);
                if (move.captured) triggerCaptureEffects(square);
                const nextHistory = [...moveHistory, move.san];
                setMoveHistory(nextHistory);
                setCurrentMoveIndex(nextHistory.length);
                setMoveFrom('');
                if (opponentRef.current) {
                    lobbyChannel.send({ type: 'broadcast', event: 'move', payload: { targetEmail: opponentRef.current, moveSan: move.san, captured: !!move.captured, to: move.to } });
                }
            } else {
                if (piece?.color === displayGame.turn()) setMoveFrom(square); else setMoveFrom('');
            }
        } catch (e) { setMoveFrom(''); }
    }

    // Pending Promotion State
    const [pendingPromotion, setPendingPromotion] = useState(null);

    // AI Logic with Web Worker
    const aiWorkerRef = useRef(null);
    
    useEffect(() => {
        aiWorkerRef.current = new Worker(new URL('./workers/aiWorker.js', import.meta.url), { type: 'module' });
        
        aiWorkerRef.current.onmessage = (e) => {
            const bestMove = e.data;
            if (bestMove) {
                const moveData = gameRef.current.move(bestMove);
                if (moveData) {
                    playMoveSound(moveData, gameRef.current);
                    if (moveData.captured) triggerCaptureEffects(moveData.to);
                    setMoveHistory(prev => [...prev, bestMove]);
                    setCurrentMoveIndex(prev => prev + 1);
                }
            }
        };

        return () => {
            aiWorkerRef.current.terminate();
        };
    }, []);

    useEffect(() => {
        if (!isPlayingComputer || displayGame.isGameOver() || isGameOverManually || opponent || currentMoveIndex < moveHistory.length) return;
        if (displayGame.turn() === 'b') {
            const timer = setTimeout(() => {
                aiWorkerRef.current.postMessage({ fen: gameRef.current.fen(), depth: 3 });
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually, isPlayingComputer, displayGame]);

    const formatTime = (s) => {
        if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
        if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    };

    const formattedHistory = [];
    for (let i = 0; i < moveHistory.length; i += 2) { formattedHistory.push({ turn: Math.floor(i / 2) + 1, w: moveHistory[i], b: moveHistory[i + 1] || '' }); }

    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rowOrder = playerColor === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    rowOrder.forEach((row) => {
        colOrder.forEach((col) => {
            const square = `${files[col]}${row + 1}`;
            const piece = displayGame.get(square);
            const isSelected = moveFrom === square;
            const isLight = (row + col) % 2 !== 0;
            board.push(
                <div 
                    key={square} 
                    onClick={() => onSquareClick(square)} 
                    className={`square ${isLight ? 'light' : 'dark'} ${isSelected ? 'selected' : ''}`}
                >
                    {piece && <img src={pieceImages[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]} alt="" />}
                    {explosionSquare === square && <div className="star-wars-blast"></div>}
                </div>
            );
        });
    });

    const sideMenuItems = [
        { icon: '👨‍🏫', label: 'Coach', link: '/coach' },
        { icon: '👁️', label: 'Watch', link: '/watch' },
        { icon: '📰', label: 'News', link: '/news' },
        { icon: '👥', label: 'Community', link: '/community' }
    ];

    // ==========================================
    // 🧱 SECURE LAYOUT STRUCTURE
    // ==========================================
    return (
        <div className="app-root">

            {/* --- TOP HEADER --- */}
            <header className="top-header">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <div className="header-brand" style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '18px' }}>♟️ ChessApp</div>
                    <div className="header-nav" style={{ display: 'flex', gap: '15px' }}>
                        {sideMenuItems.map((item, index) => (
                            <a key={index} href={item.link} style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold' }} className="nav-link-hover">
                                <span>{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </a>
                        ))}
                    </div>
                </div>
                <div className="header-timers">
                    <div className="timers-row" style={{ margin: 0 }}>
                        <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                        <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                    </div>
                </div>
                <div className="header-user">
                    <div className="header-user-info">
                        <div className="header-avatar">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span className="header-username">{userEmail.split('@')[0]}</span>
                    </div>
                    <button className="logout-btn" onClick={onLogout} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        Logout
                    </button>
                </div>
            </header>
            {pendingPromotion && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#38bdf8' }}>Promote Pawn</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {['q', 'r', 'b', 'n'].map(p => (
                                <button key={p} onClick={() => {
                                    const move = gameRef.current.move({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: p });
                                    if (move) {
                                        playMoveSound(move, gameRef.current);
                                        if (move.captured) triggerCaptureEffects(move.to);
                                        const nextHistory = [...moveHistory, move.san];
                                        setMoveHistory(nextHistory);
                                        setCurrentMoveIndex(nextHistory.length);
                                        setMoveFrom('');
                                        if (opponentRef.current) {
                                            lobbyChannel.send({ type: 'broadcast', event: 'move', payload: { targetEmail: opponentRef.current, moveSan: move.san, captured: !!move.captured, to: move.to } });
                                        }
                                    }
                                    setPendingPromotion(null);
                                }} style={{ width: '60px', height: '60px', backgroundColor: '#2c2c2c', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer', fontSize: '30px' }}>
                                    <img src={pieceImages[playerColor === 'w' ? p.toUpperCase() : p]} alt={p} style={{ width: '100%', height: '100%' }} />
                                </button>
                            ))}
                        </div>
                        <button onClick={() => { setPendingPromotion(null); setMoveFrom(''); }} style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* --- RESPONSIVE MOBILE TABS --- */}
            <div className="mobile-tab-bar">
                <button className={`mobile-tab ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
                    <span className="tab-icon">♟️</span> Play
                </button>
                <button className={`mobile-tab ${activeTab === 'panels' ? 'active' : ''}`} onClick={() => setActiveTab('panels')}>
                    <span className="tab-icon">💬</span> Chat/Menu
                </button>
                <button className={`mobile-tab ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
                    <span className="tab-icon">✈️</span> Travel
                </button>
            </div>

            <div className="game-layout">

                

                {/* --- SCROLLABLE MAIN AREA --- */}
                

                    {/* Column 1: Community Chat (TOGGLEABLE) */}
                    {/* Community chat moved to a modal or integrated into panels. For now, it is integrated into the panels column via App.css */}

                    {/* Column 2: Menus & Game Chat (Middle on Desktop) */}
                    <div className={`col-panels ${activeTab === 'panels' ? 'tab-active' : ''}`}>
                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', textAlign: 'center' }}>
                                <div><div style={{ color: '#10b981', fontSize: '10px' }}>WON</div><div style={{ fontSize: '18px' }}>{stats.wins}</div></div>
                                <div><div style={{ color: '#ef4444', fontSize: '10px' }}>LOSS</div><div style={{ fontSize: '18px' }}>{stats.losses}</div></div>
                                <div><div style={{ color: '#aaa', fontSize: '10px' }}>DRAW</div><div style={{ fontSize: '18px' }}>{stats.draws}</div></div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: viewMode === 'tv' ? '#fbbf24' : (viewMode === 'chesscom' ? '#10b981' : '#38bdf8'), margin: 0, fontSize: '12px', textTransform: 'uppercase' }}>
                                    {viewMode === 'tv' ? 'Lichess TV' : (viewMode === 'chesscom' ? 'Chess.com' : (viewMode === 'online' ? 'ONLINE' : 'MEMBERS'))}
                                </h4>
                                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '10px', padding: '4px', outline: 'none', cursor: 'pointer' }}>
                                    <option value="online">Online</option>
                                    <option value="all">Members</option>
                                    <option value="tv">Lichess TV</option>
                                    <option value="chesscom">Chess.com</option>
                                </select>
                            </div>

                            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {viewMode === 'online' && (
                                    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>TIME:</span>
                                        <select value={challengeTime} onChange={(e) => setChallengeTime(Number(e.target.value))} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px', outline: 'none', cursor: 'pointer' }}>
                                            <option value={600}>10 Mins</option>
                                            <option value={86400}>1 Day</option>
                                            <option value={259200}>3 Days</option>
                                        </select>
                                    </div>
                                )}

                                {viewMode === 'online' && onlineUsers.map((u, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email.split('@')[0]}</span>
                                        {u.email !== userEmail && <button onClick={() => handleSendChallenge(u.email)} style={{ fontSize: '9px', cursor: 'pointer', backgroundColor: '#38bdf8', color: '#000', border: 'none', borderRadius: '3px', padding: '2px 5px' }}>Challenge</button>}
                                    </div>
                                ))}
                                {viewMode === 'all' && allMembers.map((u, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email.split('@')[0]}</span>
                                    </div>
                                ))}
                                {viewMode === 'tv' && tvGames.map((game, i) => (
                                    <a key={i} href={game.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', padding: '8px', borderRadius: '6px', border: '1px solid #444', color: 'white', display: 'block' }}>
                                        <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>📺 {game.channel}</div>
                                        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>⬜ {game.white}</span> <span style={{ color: '#888' }}>{game.whiteRating}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                            <span>⬛ {game.black}</span> <span style={{ color: '#888' }}>{game.blackRating}</span>
                                        </div>
                                    </a>
                                ))}
                                {viewMode === 'chesscom' && chessComStreamers.map((streamer, i) => (
                                    <a key={i} href={streamer.twitch_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', padding: '8px', borderRadius: '6px', border: '1px solid #444', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={streamer.avatar} alt={streamer.username} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{streamer.username}</div>
                                            <div style={{ fontSize: '10px', color: '#aaa' }}>Live on Twitch 📺</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <GameChat opponent={opponent} userEmail={userEmail} chatMessages={chatMessages} setChatMessages={setChatMessages} lobbyChannel={lobbyChannel} />

                        {/* --- NEW: Draw and Resign Buttons updated for computer play --- */}
                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button onClick={handleDrawOffer} disabled={(!opponent && !isPlayingComputer) || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white' }}>🤝 Draw</button>
                            <button onClick={handleResign} disabled={(!opponent && !isPlayingComputer) || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white' }}>🏳️ Resign</button>
                        </div>

                        <button onClick={() => {
                            setOpponent(null);
                            setIsPlayingComputer(true);
                            resetMatch(300);
                            setStatus("Game started");
                            speak("Game started");
                        }} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>Play Computer</button>

                        <button
                            onClick={() => setGunshotEnabled(!gunshotEnabled)}
                            style={{ width: '100%', padding: '10px', backgroundColor: gunshotEnabled ? '#f97316' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}
                        >
                            {gunshotEnabled ? 'Turn off gunshot' : 'Turn on gunshot'}
                        </button>

                        {/* --- NEW BUTTON: Chat TTS Toggle --- */}
                        <button
                            onClick={() => setSpeakChatEnabled(!speakChatEnabled)}
                            style={{ width: '100%', padding: '10px', backgroundColor: speakChatEnabled ? '#f97316' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}
                        >
                            {speakChatEnabled ? 'Turn off Chat Speak' : 'Turn on Chat Speak'}
                        </button>

                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>HISTORY</h4>
                            <div style={{ overflowY: 'auto', flexGrow: 1, fontSize: '12px' }}>
                                {formattedHistory.map((row, i) => (
                                    <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #222' }}>
                                        <span style={{ color: '#666', marginRight: '8px' }}>{row.turn}.</span>
                                        <b style={{ color: currentMoveIndex === (i * 2) + 1 ? '#38bdf8' : 'white' }}>{row.w}</b> &nbsp;&nbsp;
                                        <b style={{ color: currentMoveIndex === (i * 2) + 2 ? '#38bdf8' : 'white' }}>{row.b}</b>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white' }} onClick={() => setCurrentMoveIndex(0)}>⏪</button>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white' }} onClick={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))}>◀️</button>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white' }} onClick={() => setCurrentMoveIndex(prev => Math.min(moveHistory.length, prev + 1))}>▶️</button>
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white' }} onClick={() => setCurrentMoveIndex(moveHistory.length)}>⏩</button>
                            </div>
                        </div>

                    </div>

                    {/* Column 1: Chess Board (Left on Desktop, Main on Mobile) */}
                    <div className={`col-board ${activeTab === 'board' ? 'tab-active' : ''}`}>
                        {incomingChallenge && (
                            <div style={{ backgroundColor: '#fbbf24', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#121212', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>⚔️ {incomingChallenge.email.split('@')[0]} challenged you! ({formatTime(incomingChallenge.timeControl)})</span>
                                <button onClick={handleAcceptChallenge} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                                <button onClick={handleDeclineChallenge} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Decline</button>
                            </div>
                        )}
                        {incomingDrawOffer && (
                            <div style={{ backgroundColor: '#38bdf8', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>🤝 Opponent offered a Draw!</span>
                                <button onClick={acceptDraw} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                                <button onClick={handleDeclineDraw} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Decline</button>
                            </div>
                        )}

                        <div className="status-label">{status}</div>

                        {/* Board wrapper ensures it always stays 560x560 inside the flexbox */}
                        <div className="chess-board">
                            {board}
                        </div>
                    </div>

                    {/* Column 3: Travel Ads (Right on Desktop) */}
                    <div className={`col-ads ${activeTab === 'ads' ? 'tab-active' : ''}`}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>
                            ✈️ TRAVEL DEALS (50)
                        </div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
                            {travelAds.map(ad => (
                                <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                    <img src={ad.img} alt="Travel Destination" loading="lazy" style={{ width: '100%', height: '110px', objectFit: 'cover', backgroundColor: '#444' }} />
                                    <div style={{ padding: '10px' }}>
                                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>{ad.tag}</div>
                                        <div style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{ad.name}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                                </div>
        </div>
        </div>
    );
}

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => { if (session) setCurrentUser(session.user); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setCurrentUser(s?.user || null));
        return () => subscription.unsubscribe();
    }, []);
    return currentUser ? <ChessGame user={currentUser} onLogout={() => supabase.auth.signOut()} /> : <AuthScreen onAuthSuccess={setCurrentUser} />;
}