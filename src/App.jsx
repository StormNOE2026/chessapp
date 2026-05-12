import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { supabase } from './supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './App.css';

// Initialize Stripe (Replace 'pk_test_...' with your actual public key)
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');

// ==========================================
// 🌍 TRANSLATIONS DICTIONARY
// ==========================================
const translations = {
    EN: {
        balance: "Balance", addFunds: "Add Funds", loggedIn: "Logged in", logout: "Logout",
        communityChat: "COMMUNITY CHAT", saySomething: "Say something...", send: "Send",
        actionDraw: "🤝 Draw", actionResign: "🏳️ Resign", playComputer: "Play Computer",
        turnOffGunshot: "Turn off gunshot", turnOnGunshot: "Turn on gunshot",
        turnOffChatSpeak: "Turn off Chat Speak", turnOnChatSpeak: "Turn on Chat Speak",
        score: "SCORE", won: "WON", loss: "LOSS", statDraw: "DRAW", history: "HISTORY",
        gameChat: "GAME CHAT", chatLocked: "Chat locked", typeMessage: "Type message...",
        travelDeals: "✈️ TRAVEL DEALS (50)", menu: "MENU", coach: "Coach", watch: "Watch",
        news: "News", community: "Community", online: "Online", members: "Members",
        time: "TIME", wager: "WAGER", challengeBtn: "Challenge", acceptBtn: "Accept", declineBtn: "Decline",
        welcomeBack: "Welcome Back", createAccount: "Create Account", signupFree: "Signup for free and play chess for free.",
        email: "Email", password: "Password", login: "Log In", signup: "Sign Up",
        needAccount: "Need an account? Sign up", haveAccount: "Have an account? Log in",
        waitingToStart: "Waiting to start...", gameStarted: "Game started!", yourTurn: "🟢 Your turn",
        waiting: "🔴 Waiting...", timeOut: "Time Out!", checkmate: "Checkmate!",
        gameIsDraw: "The game is a Draw!", youWin: "You Win!", youLose: "You Lose!",
        opponentResigned: "Opponent resigned. You Win!", youResigned: "You resigned. You Lose!",
        drawOfferSent: "Draw offer sent...", drawAccepted: "Draw Accepted!", drawDeclined: "Draw offer declined.",
        opponentDisconnected: "Opponent disconnected. You Win!"
    },
    ES: {
        balance: "Saldo", addFunds: "Añadir Fondos", loggedIn: "Conectado", logout: "Salir",
        communityChat: "CHAT COMUNIDAD", saySomething: "Di algo...", send: "Enviar",
        actionDraw: "🤝 Empate", actionResign: "🏳️ Rendirse", playComputer: "Jugar contra PC",
        turnOffGunshot: "Apagar disparos", turnOnGunshot: "Activar disparos",
        turnOffChatSpeak: "Apagar voz de chat", turnOnChatSpeak: "Activar voz de chat",
        score: "PUNTOS", won: "VICTORIAS", loss: "DERROTAS", statDraw: "EMPATE", history: "HISTORIAL",
        gameChat: "CHAT DE JUEGO", chatLocked: "Chat bloqueado", typeMessage: "Escribe un mensaje...",
        travelDeals: "✈️ OFERTAS DE VIAJE", menu: "MENÚ", coach: "Entrenador", watch: "Ver",
        news: "Noticias", community: "Comunidad", online: "En línea", members: "Miembros",
        time: "TIEMPO", wager: "APUESTA", challengeBtn: "Desafiar", acceptBtn: "Aceptar", declineBtn: "Rechazar",
        welcomeBack: "Bienvenido", createAccount: "Crear Cuenta", signupFree: "Regístrate gratis, juega gratis.",
        email: "Correo", password: "Contraseña", login: "Iniciar Sesión", signup: "Registrarse",
        needAccount: "¿Necesitas cuenta? Regístrate", haveAccount: "¿Tienes cuenta? Inicia sesión",
        waitingToStart: "Esperando para empezar...", gameStarted: "¡Juego iniciado!", yourTurn: "🟢 Tu turno",
        waiting: "🔴 Esperando...", timeOut: "¡Tiempo agotado!", checkmate: "¡Jaque mate!",
        gameIsDraw: "¡El juego es un empate!", youWin: "¡Tú ganas!", youLose: "¡Pierdes!",
        opponentResigned: "El oponente se rindió. ¡Tú ganas!", youResigned: "Te rendiste. ¡Pierdes!",
        drawOfferSent: "Oferta de empate enviada...", drawAccepted: "¡Empate aceptado!", drawDeclined: "Oferta de empate rechazada.",
        opponentDisconnected: "El oponente se desconectó. ¡Tú ganas!"
    },
    IT: {
        balance: "Saldo", addFunds: "Aggiungi Fondi", loggedIn: "Connesso", logout: "Esci",
        communityChat: "CHAT COMUNITÀ", saySomething: "Dì qualcosa...", send: "Invia",
        actionDraw: "🤝 Patta", actionResign: "🏳️ Abbandona", playComputer: "Gioca contro PC",
        turnOffGunshot: "Spegni spari", turnOnGunshot: "Attiva spari",
        turnOffChatSpeak: "Spegni voce chat", turnOnChatSpeak: "Attiva voce chat",
        score: "PUNTI", won: "VINTE", loss: "PERSE", statDraw: "PATTE", history: "CRONOLOGIA",
        gameChat: "CHAT DI GIOCO", chatLocked: "Chat bloccata", typeMessage: "Scrivi messaggio...",
        travelDeals: "✈️ OFFERTE VIAGGIO", menu: "MENU", coach: "Allenatore", watch: "Guarda",
        news: "Notizie", community: "Comunità", online: "Online", members: "Membri",
        time: "TEMPO", wager: "PUNTATA", challengeBtn: "Sfida", acceptBtn: "Accetta", declineBtn: "Rifiuta",
        welcomeBack: "Bentornato", createAccount: "Crea Account", signupFree: "Iscriviti e gioca gratis.",
        email: "Email", password: "Password", login: "Accedi", signup: "Iscriviti",
        needAccount: "Serve un account? Iscriviti", haveAccount: "Hai un account? Accedi",
        waitingToStart: "In attesa di iniziare...", gameStarted: "Gioco iniziato!", yourTurn: "🟢 Il tuo turno",
        waiting: "🔴 In attesa...", timeOut: "Tempo scaduto!", checkmate: "Scacco matto!",
        gameIsDraw: "Il gioco è patta!", youWin: "Hai Vinto!", youLose: "Hai Perso!",
        opponentResigned: "L'avversario ha abbandonato. Hai Vinto!", youResigned: "Hai abbandonato. Hai Perso!",
        drawOfferSent: "Offerta di patta inviata...", drawAccepted: "Patta accettata!", drawDeclined: "Offerta di patta rifiutata.",
        opponentDisconnected: "Avversario disconnesso. Hai Vinto!"
    }
};

// ==========================================
// 🔊 SOUND ASSETS & TTS
// ==========================================
const sounds = {
    move: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Move.mp3',
    capture: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Capture.mp3',
    check: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/sound/standard/Check.mp3',
    thunder: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7845f4fae2.mp3',
};

const speak = (text, langCode = 'EN') => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (langCode === 'ES') utterance.lang = 'es-ES';
        else if (langCode === 'IT') utterance.lang = 'it-IT';
        else utterance.lang = 'en-US';

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
};

// ==========================================
// ✈️ TRAVEL ADS DATA & 🧠 AI ENGINE
// ==========================================
const cities = ["Paris", "London", "Tokyo", "Bali", "NYC", "Dubai", "Rome", "Swiss Alps", "Maldives", "Sydney", "Barcelona", "Santorini", "Bangkok", "Iceland", "Cairo", "Venice", "Rio", "Kyoto", "Amsterdam", "Prague", "Cape Town", "Machu Picchu", "Lisbon", "Seoul", "Bora Bora", "Hawaii", "Fiji", "Phuket", "Maui", "Florence", "Vienna", "Berlin", "Dublin", "Istanbul", "Marrakech", "Mexico City", "Toronto", "Vancouver", "Singapore", "Hong Kong", "Las Vegas", "LA", "Miami", "Orlando", "New Orleans", "SF", "Austin", "Chicago", "Boston", "Seattle"];
const travelAds = cities.map((city, i) => ({
    id: i, name: `${i % 2 === 0 ? 'Grand Hotel' : 'Luxury Flight'} ${city}`,
    url: i % 2 === 0 ? "https://www.booking.com" : "https://www.skyscanner.com",
    img: `https://picsum.photos/seed/${city}/300/200`, tag: i % 2 === 0 ? "HOTEL" : "FLIGHT"
}));

const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
function evaluateBoard(gameInstance) {
    let totalEval = 0;
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) { totalEval += piece.color === 'w' ? pieceValues[piece.type] : -pieceValues[piece.type]; }
        }
    }
    return totalEval;
}
function minimax(gameInstance, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || gameInstance.isGameOver()) return evaluateBoard(gameInstance);
    const moves = gameInstance.moves();
    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let move of moves) {
            gameInstance.move(move);
            bestVal = Math.max(bestVal, minimax(gameInstance, depth - 1, alpha, beta, !isMaximizingPlayer));
            gameInstance.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let move of moves) {
            gameInstance.move(move);
            bestVal = Math.min(bestVal, minimax(gameInstance, depth - 1, alpha, beta, !isMaximizingPlayer));
            gameInstance.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}
function getBestMove(gameInstance, depth = 2) {
    const moves = gameInstance.moves();
    let bestMove = null; let bestValue = Infinity;
    for (let move of moves) {
        gameInstance.move(move);
        const boardValue = minimax(gameInstance, depth - 1, -Infinity, Infinity, true);
        gameInstance.undo();
        const randomTieBreaker = Math.random() * 0.1;
        if (boardValue - randomTieBreaker < bestValue) {
            bestValue = boardValue - randomTieBreaker;
            bestMove = move;
        }
    }
    return bestMove || moves[0];
}

// ==========================================
// 💳 STRIPE CHECKOUT COMPONENT
// ==========================================
function CheckoutForm({ amount, userId, onSuccess, onCancel }) {
    const stripe = useStripe(); const elements = useElements();
    const [loading, setLoading] = useState(false); const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault(); if (!stripe || !elements) return;
        setLoading(true); setError(null);
        try {
            const { data, error: backendError } = await supabase.functions.invoke('create-payment', { body: { amount: amount, userId: userId } });
            if (backendError || !data?.clientSecret) throw new Error("Failed to initialize payment. Ensure your Supabase Edge Function is running.");
            const result = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
            if (result.error) { setError(result.error.message); }
            else if (result.paymentIntent.status === 'succeeded') { alert(`Successfully added $${amount.toFixed(2)}!`); onSuccess(amount); }
        } catch (err) { setError(err.message || "An error occurred during payment."); }
        setLoading(false);
    };
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px', border: '1px solid #333' }}>
                <h3 style={{ color: '#38bdf8', marginTop: 0, textAlign: 'center' }}>Deposit ${amount.toFixed(2)}</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '15px', backgroundColor: '#2c2c2c', borderRadius: '4px', marginBottom: '20px' }}><CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff', '::placeholder': { color: '#aab7c4' } } } }} /></div>
                    {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={!stripe || loading} style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 🔐 AUTH MODAL (Converted from AuthScreen)
// ==========================================
function AuthModal({ onAuthSuccess, onClose, language }) {
    const t = translations[language];
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const cleanEmail = email.trim().toLowerCase();
        let { data, error } = isLogin ? await supabase.auth.signInWithPassword({ email: cleanEmail, password }) : await supabase.auth.signUp({ email: cleanEmail, password });
        setLoading(false);
        if (error) alert(error.message);
        else if (data?.user) onAuthSuccess(data.user);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, fontFamily: 'Segoe UI' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '8px', width: '90%', maxWidth: '320px', border: '1px solid #333', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '15px', marginTop: 0 }}>{isLogin ? t.welcomeBack : t.createAccount}</h2>
                <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.4', textAlign: 'center' }}>
                    {t.signupFree}
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" required placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px' }} />
                    <input type="password" required placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px' }} />
                    <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>{loading ? '...' : (isLogin ? t.login : t.signup)}</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>{isLogin ? t.needAccount : t.haveAccount}</span>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// ⚛️ CHESS GAME COMPONENT
// ==========================================
function ChessGame({ user, onLogout, onLoginClick, language, setLanguage }) {
    const t = translations[language];

    // Safely handle userEmail if guest
    const userEmail = user?.email || '';

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 800);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moveFrom, setMoveFrom] = useState('');

    const [statusKey, setStatusKey] = useState("waitingToStart");
    const [customStatus, setCustomStatus] = useState("");

    const [isPlayingComputer, setIsPlayingComputer] = useState(false);

    const [challengeTime, setChallengeTime] = useState(600);

    const [wagerAmount, setWagerAmount] = useState(0);
    const [currentStake, setCurrentStake] = useState(0);

    const [explosion, setExplosion] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const onlineUsersRef = useRef([]);

    const [allMembers, setAllMembers] = useState([]);
    const [tvGames, setTvGames] = useState([]);
    const [chessComStreamers, setChessComStreamers] = useState([]);

    const [viewMode, setViewMode] = useState('online');
    const [lobbyChannel, setLobbyChannel] = useState(null);
    const [incomingChallenge, setIncomingChallenge] = useState(null);
    const [incomingDrawOffer, setIncomingDrawOffer] = useState(false);

    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatContainerRef = useRef(null);

    const [showCommunityChat, setShowCommunityChat] = useState(false);
    const [communityMessages, setCommunityMessages] = useState([]);
    const [communityInput, setCommunityInput] = useState('');
    const communityContainerRef = useRef(null);

    const [opponent, setOpponent] = useState(null);
    const [playerColor, setPlayerColor] = useState('w');
    const [whiteTime, setWhiteTime] = useState(300);
    const [blackTime, setBlackTime] = useState(300);

    const timerRef = useRef(null);
    const mySocketId = useRef(Math.random().toString(36).substring(7));
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0, score: 100, balance: 0 });

    const [isGameOverManually, setIsGameOverManually] = useState(false);
    const [gunshotEnabled, setGunshotEnabled] = useState(true);
    const gunshotEnabledRef = useRef(gunshotEnabled);
    const [speakChatEnabled, setSpeakChatEnabled] = useState(false);
    const speakChatEnabledRef = useRef(speakChatEnabled);
    const [isSidebarHovered, setIsSidebarHovered] = useState(false);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState(10);

    useEffect(() => { gunshotEnabledRef.current = gunshotEnabled; speakChatEnabledRef.current = speakChatEnabled; }, [gunshotEnabled, speakChatEnabled]);
    useEffect(() => { onlineUsersRef.current = onlineUsers; }, [onlineUsers]);

    const opponentRef = useRef(null);
    const gameRef = useRef(new Chess());
    useEffect(() => { opponentRef.current = opponent; }, [opponent]);

    const pieceImages = {
        p: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg', r: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg', n: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        b: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg', q: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg', k: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
        P: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg', R: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg', N: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        B: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg', Q: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg', K: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
    };

    const displayGame = new Chess();
    moveHistory.slice(0, currentMoveIndex).forEach(m => { try { displayGame.move(m); } catch (e) { } });

    useEffect(() => {
        fetchUserStats();
        fetchAllMembers();
        fetchTvGames();
        fetchChessComTv();
        fetchCommunityComments();
    }, [user]); // Re-fetch when user changes

    useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [chatMessages]);
    useEffect(() => { if (showCommunityChat && communityContainerRef.current) communityContainerRef.current.scrollTop = communityContainerRef.current.scrollHeight; }, [communityMessages, showCommunityChat]);

    const fetchUserStats = async () => {
        if (!user) return; // Guests do not have stats
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setStats({ wins: data.wins || 0, losses: data.losses || 0, draws: data.draws || 0, score: data.score !== undefined ? data.score : 100, balance: data.balance || 0 });
    };

    const handleAddFundsClick = () => {
        const amountStr = prompt("Enter amount to deposit ($):", "10.00");
        if (!amountStr) return; const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 1) { alert("Please enter a valid amount of $1.00 or more."); return; }
        setDepositAmount(amount); setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (amount) => {
        setShowPaymentModal(false);
        setStats(prev => ({ ...prev, balance: (prev.balance || 0) + amount }));
    };

    const fetchAllMembers = async () => { let { data } = await supabase.from('profiles').select('email'); if (data) setAllMembers(data); };
    const fetchCommunityComments = async () => { let { data } = await supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(50); if (data) setCommunityMessages(data.reverse()); };

    const fetchTvGames = async () => {
        try {
            const res = await fetch('https://lichess.org/api/tv/channels');
            const data = await res.json();
            setTvGames(Object.entries(data).map(([channel, game]) => ({ channel, url: `https://lichess.org/${game.gameId}`, white: game.user?.name || 'Unknown', whiteRating: game.rating || '?', black: 'Opponent', blackRating: '?' })));
        } catch (e) { }
    };

    const fetchChessComTv = async () => {
        try {
            const res = await fetch('https://api.chess.com/pub/streamers');
            const data = await res.json();
            setChessComStreamers(data.streamers.filter(s => s.is_live));
        } catch (e) { }
    };

    const playMoveSound = (move, gameInstance) => {
        let audioUrl = sounds.move;
        if (gameInstance.inCheck()) { audioUrl = sounds.check; speak("Check", language); }
        else if (move.captured) audioUrl = sounds.capture;
        new Audio(audioUrl).play().catch(() => { });
    };

    const triggerCaptureEffects = (square, capturedColor) => {
        if (gunshotEnabledRef.current) new Audio('/shotgun.mp3').play().catch(() => { });
        setExplosion({ square, color: capturedColor });
        setTimeout(() => setExplosion(null), 1000);
    };

    const recordResult = async (type) => {
        if (!user) return; // Guests do not record results
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const updates = { ...data, score: data?.score || 100, balance: data?.balance || 0 };
        if (type === 'win') { updates.wins += 1; updates.score += 8; updates.balance += currentStake; }
        if (type === 'loss') { updates.losses += 1; updates.score -= 8; updates.balance -= currentStake; }
        if (type === 'draw') { updates.draws += 1; }
        await supabase.from('profiles').update({ wins: updates.wins, losses: updates.losses, draws: updates.draws, score: updates.score, balance: updates.balance }).eq('id', user.id);
        setStats(updates); setCurrentStake(0);
    };

    const resetMatch = (timeControl = 300) => {
        gameRef.current = new Chess(); setMoveHistory([]); setCurrentMoveIndex(0);
        setWhiteTime(timeControl); setBlackTime(timeControl); setMoveFrom('');
        setIsGameOverManually(false); setIncomingDrawOffer(false); setChatMessages([]);
    };

    // ==========================================
    // 🔌 INSTANT DISCONNECT ON LOGOUT CLICK
    // ==========================================
    const handleLogoutClick = async () => {
        if (opponent && !isGameOverManually && lobbyChannel) {
            setIsGameOverManually(true);
            await lobbyChannel.send({
                type: 'broadcast',
                event: 'disconnect',
                payload: { targetEmail: opponentRef.current }
            }).catch(() => { });
            await recordResult('loss'); // Forfeit the game because you left
        }
        onLogout(); // Execute Supabase SignOut
    };

    // ==========================================
    // 🔌 INSTANT DISCONNECT ON BROWSER TAB CLOSE
    // ==========================================
    useEffect(() => {
        const handleTabClose = () => {
            if (opponentRef.current && !isGameOverManually && lobbyChannel) {
                lobbyChannel.send({
                    type: 'broadcast',
                    event: 'disconnect',
                    payload: { targetEmail: opponentRef.current }
                }).catch(() => { });
            }
        };

        window.addEventListener('beforeunload', handleTabClose);
        return () => window.removeEventListener('beforeunload', handleTabClose);
    }, [lobbyChannel, isGameOverManually]);

    useEffect(() => {
        const channel = supabase.channel('chess-lobby'); setLobbyChannel(channel);
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const userMap = new Map();
                for (const key in state) {
                    state[key].forEach(p => {
                        if (p.email) {
                            if (!userMap.has(p.email) || p.isPlaying) {
                                userMap.set(p.email, p);
                            }
                        }
                    });
                }
                setOnlineUsers(Array.from(userMap.values()));
            })
            .on('broadcast', { event: 'challenge' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail) setIncomingChallenge({ email: payload.challengerEmail, timeControl: payload.timeControl, wagerAmount: payload.wagerAmount || 0 });
            })
            .on('broadcast', { event: 'accept' }, ({ payload }) => {
                if (userEmail && payload.challengerEmail === userEmail) {
                    setOpponent(payload.targetEmail); setIsPlayingComputer(false); setPlayerColor('w'); setCurrentStake(payload.wagerAmount || 0); resetMatch(payload.timeControl);
                    setStatusKey("gameStarted"); setCustomStatus(` $${payload.wagerAmount || 0}`);
                    speak(t.gameStarted, language);
                }
            })
            .on('broadcast', { event: 'declineChallenge' }, ({ payload }) => { if (userEmail && payload.targetEmail === userEmail) { setStatusKey(""); setCustomStatus("Challenge declined."); } })
            .on('broadcast', { event: 'move' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail) {
                    const moveResult = gameRef.current.move(payload.moveSan);
                    if (moveResult) {
                        playMoveSound(moveResult, gameRef.current);
                        if (moveResult.captured) triggerCaptureEffects(payload.to, moveResult.color === 'w' ? 'b' : 'w');
                        setMoveHistory(prev => { const next = [...prev, payload.moveSan]; setCurrentMoveIndex(next.length); return next; });
                    }
                }
            })
            .on('broadcast', { event: 'chat' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && payload.senderEmail === opponentRef.current) {
                    setChatMessages(prev => [...prev, { text: payload.text, sender: payload.senderEmail }]);
                    if (speakChatEnabledRef.current) speak(payload.text, language);
                }
            })
            .on('broadcast', { event: 'resign' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && !isGameOverManually) {
                    setIsGameOverManually(true); setStatusKey("opponentResigned"); setCustomStatus(""); speak(t.opponentResigned, language); recordResult('win');
                }
            })
            .on('broadcast', { event: 'drawOffer' }, ({ payload }) => { if (userEmail && payload.targetEmail === userEmail) setIncomingDrawOffer(true); })
            .on('broadcast', { event: 'drawAccepted' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail) { setIsGameOverManually(true); setStatusKey("drawAccepted"); setCustomStatus(""); speak(t.drawAccepted, language); recordResult('draw'); }
            })
            .on('broadcast', { event: 'drawDeclined' }, ({ payload }) => { if (userEmail && payload.targetEmail === userEmail) { setStatusKey("drawDeclined"); setCustomStatus(""); setIncomingDrawOffer(false); } })

            // Explicit disconnect payload receiver
            .on('broadcast', { event: 'disconnect' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && !isGameOverManually) {
                    setIsGameOverManually(true);
                    setStatusKey("opponentDisconnected");
                    setCustomStatus("");
                    speak(t.opponentDisconnected, language);
                    recordResult('win');
                }
            })
            .subscribe(async (s) => {
                if (s === 'SUBSCRIBED' && userEmail) {
                    await channel.track({ email: userEmail, socketId: mySocketId.current, isPlaying: !!(opponent || isPlayingComputer) });
                }
            });

        const commentsSub = supabase.channel('custom-all-comments').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, payload => {
            setCommunityMessages(prev => prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
        }).subscribe();

        return () => {
            channel.untrack();
            supabase.removeChannel(channel);
            supabase.removeChannel(commentsSub);
        };
    }, [userEmail, isGameOverManually, language, t]);

    // ==========================================
    // 🔌 STRICT OPPONENT DISCONNECT CHECK WITH DELAY
    // ==========================================
    useEffect(() => {
        if (opponent && !isGameOverManually) {
            // First pass: Are they online and actively playing?
            const isOpponentInGame = onlineUsers.some(u => u.email === opponent && u.isPlaying);

            if (!isOpponentInGame) {
                // If they drop out, wait exactly 3 seconds to see if it's a momentary network blip or race condition
                const checkTimeout = setTimeout(() => {
                    // Check the absolute latest data after 3 seconds
                    const stillOffline = !onlineUsersRef.current.some(u => u.email === opponent && u.isPlaying);

                    if (stillOffline && !isGameOverManually) {
                        setIsGameOverManually(true);
                        setStatusKey("opponentDisconnected");
                        setCustomStatus("");
                        speak(t.opponentDisconnected, language);
                        recordResult('win');
                    }
                }, 3000);

                // If onlineUsers updates within those 3 seconds (e.g. they reconnect), cancel the forfeit penalty!
                return () => clearTimeout(checkTimeout);
            }
        }
    }, [onlineUsers, opponent, isGameOverManually, language, t]);

    useEffect(() => {
        if (lobbyChannel && userEmail) {
            lobbyChannel.track({ email: userEmail, socketId: mySocketId.current, isPlaying: !!(opponent || isPlayingComputer) }).catch(() => { });
        }
    }, [opponent, isPlayingComputer, lobbyChannel, userEmail]);

    useEffect(() => {
        if (displayGame.isGameOver() || isGameOverManually || currentMoveIndex < moveHistory.length || (!opponent && !isPlayingComputer)) { clearInterval(timerRef.current); return; }
        timerRef.current = setInterval(() => {
            if (displayGame.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1)); else setBlackTime(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [moveHistory, currentMoveIndex, isGameOverManually, opponent, isPlayingComputer]);

    useEffect(() => {
        if (!isGameOverManually && (whiteTime === 0 || blackTime === 0)) {
            setIsGameOverManually(true); const winnerColor = whiteTime === 0 ? "b" : "w";
            setStatusKey("timeOut"); setCustomStatus(` ${playerColor === winnerColor ? t.youWin : t.youLose}`);
            speak(t.timeOut, language); recordResult(playerColor === winnerColor ? 'win' : 'loss');
        }
    }, [whiteTime, blackTime, isGameOverManually, playerColor, language, t]);

    useEffect(() => {
        if (displayGame.isCheckmate()) {
            const loserColor = displayGame.turn(); const outcome = playerColor === loserColor ? t.youLose : t.youWin;
            setStatusKey("checkmate"); setCustomStatus(` ${outcome}`);
            if (!isGameOverManually) {
                setIsGameOverManually(true); speak(t.checkmate, language);
                new Audio(sounds.thunder).play().catch(() => { });
                if (gunshotEnabledRef.current) { for (let i = 0; i < 3; i++) setTimeout(() => new Audio('/shotgun.mp3').play().catch(() => { }), i * 400); }
                recordResult(playerColor === loserColor ? 'loss' : 'win');
            }
        } else if (displayGame.isDraw()) {
            setStatusKey("gameIsDraw"); setCustomStatus("");
            if (!isGameOverManually) { setIsGameOverManually(true); speak(t.gameIsDraw, language); recordResult('draw'); }
        } else if (!isGameOverManually && (opponent || isPlayingComputer)) {
            const isMyTurn = displayGame.turn() === playerColor;
            const newStatusKey = isMyTurn ? "yourTurn" : "waiting";
            if (moveHistory.length > 0 && statusKey !== newStatusKey) { setStatusKey(newStatusKey); setCustomStatus(""); }
        }
    }, [moveHistory, playerColor, isGameOverManually, opponent, isPlayingComputer, statusKey, language, t]);

    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!user) return; // Prevent guests
        if (!chatInput.trim() || !opponent) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'chat', payload: { targetEmail: opponent, senderEmail: userEmail, text: chatInput } });
        setChatMessages(prev => [...prev, { text: chatInput, sender: userEmail }]); setChatInput('');
    };

    const sendCommunityMessage = async (e) => {
        e.preventDefault();
        if (!user) { alert("Please login to send messages."); return; }
        if (!communityInput.trim()) return;
        const { error } = await supabase.from('comments').insert([{ text: communityInput, senderEmail: userEmail }]);
        setCommunityInput(''); if (error) console.error(error.message);
    };

    const handleSendChallenge = async (targetEmail) => {
        if (!user) { alert("Please login to challenge players."); return; }
        if (wagerAmount > stats.balance) { alert("Insufficient funds!"); return; }
        if (!lobbyChannel) return;
        setStatusKey(""); setCustomStatus(`Challenge sent for $${wagerAmount}...`);
        await lobbyChannel.send({ type: 'broadcast', event: 'challenge', payload: { challengerEmail: userEmail, targetEmail, timeControl: challengeTime, wagerAmount } });
    };

    const handleAcceptChallenge = async () => {
        if (!user || !lobbyChannel || !incomingChallenge) return;
        if (stats.balance < incomingChallenge.wagerAmount) { alert("Insufficient funds!"); return; }
        await lobbyChannel.send({ type: 'broadcast', event: 'accept', payload: { challengerEmail: incomingChallenge.email, targetEmail: userEmail, timeControl: incomingChallenge.timeControl, wagerAmount: incomingChallenge.wagerAmount } });
        setOpponent(incomingChallenge.email); setIsPlayingComputer(false); setPlayerColor('b'); setCurrentStake(incomingChallenge.wagerAmount); resetMatch(incomingChallenge.timeControl);
        setStatusKey("gameStarted"); setCustomStatus(` $${incomingChallenge.wagerAmount}`);
        speak(t.gameStarted, language); setIncomingChallenge(null);
    };

    const handleDeclineChallenge = () => {
        if (lobbyChannel && incomingChallenge && userEmail) lobbyChannel.send({ type: 'broadcast', event: 'declineChallenge', payload: { targetEmail: incomingChallenge.email, declinerEmail: userEmail } });
        setIncomingChallenge(null);
    };

    const handleResign = () => {
        if (!user) return; // Guests can't resign
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;
        if (window.confirm("Are you sure you want to resign?")) {
            setIsGameOverManually(true); setStatusKey("youResigned"); setCustomStatus(""); speak(t.youResigned, language); recordResult('loss');
            if (opponent) lobbyChannel.send({ type: 'broadcast', event: 'resign', payload: { targetEmail: opponentRef.current } });
        }
    };

    const handleDrawOffer = () => {
        if (!user) return;
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;
        if (opponent) { lobbyChannel.send({ type: 'broadcast', event: 'drawOffer', payload: { targetEmail: opponent } }); setStatusKey("drawOfferSent"); setCustomStatus(""); }
        else if (isPlayingComputer) { setIsGameOverManually(true); setStatusKey(""); setCustomStatus("Computer accepts the draw!"); speak("Computer accepts the draw", language); recordResult('draw'); }
    };

    const handleDeclineDraw = () => {
        if (opponentRef.current && userEmail) lobbyChannel.send({ type: 'broadcast', event: 'drawDeclined', payload: { targetEmail: opponentRef.current } });
        setIncomingDrawOffer(false);
    };

    const acceptDraw = () => {
        setIsGameOverManually(true); setStatusKey("drawAccepted"); setCustomStatus(""); speak(t.drawAccepted, language); recordResult('draw'); setIncomingDrawOffer(false);
        if (opponent && userEmail) lobbyChannel.send({ type: 'broadcast', event: 'drawAccepted', payload: { targetEmail: opponentRef.current } });
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
            const move = gameRef.current.move({ from: moveFrom, to: square, promotion: 'q' });
            if (move) {
                playMoveSound(move, gameRef.current);
                if (move.captured) triggerCaptureEffects(square, move.color === 'w' ? 'b' : 'w');
                const nextHistory = [...moveHistory, move.san]; setMoveHistory(nextHistory); setCurrentMoveIndex(nextHistory.length); setMoveFrom('');

                if (opponentRef.current && userEmail) {
                    lobbyChannel.send({ type: 'broadcast', event: 'move', payload: { targetEmail: opponentRef.current, moveSan: move.san, captured: !!move.captured, to: move.to } });
                }
            } else { if (piece?.color === displayGame.turn()) setMoveFrom(square); else setMoveFrom(''); }
        } catch (e) { setMoveFrom(''); }
    }

    useEffect(() => {
        if (!isPlayingComputer || displayGame.isGameOver() || isGameOverManually || opponent || currentMoveIndex < moveHistory.length) return;
        if (displayGame.turn() === 'b') {
            const timer = setTimeout(() => {
                const bestMove = getBestMove(gameRef.current, 2);
                const moveData = gameRef.current.move(bestMove);
                if (moveData) {
                    playMoveSound(moveData, gameRef.current);
                    if (moveData.captured) triggerCaptureEffects(moveData.to, moveData.color === 'w' ? 'b' : 'w');
                    setMoveHistory(prev => [...prev, bestMove]); setCurrentMoveIndex(prev => prev + 1);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually, isPlayingComputer]);

    const formatTime = (s) => {
        if (s >= 86400) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
        if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
        return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    };

    const getPlayerName = (color) => {
        if (!opponent && !isPlayingComputer) return "Waiting...";
        if (playerColor === color) return userEmail ? `${userEmail.split('@')[0]} (You)` : "Guest (You)";
        return isPlayingComputer ? "Computer" : (opponent ? opponent.split('@')[0] : "Opponent");
    };

    const whitePlayerName = getPlayerName('w');
    const blackPlayerName = getPlayerName('b');

    const formattedHistory = [];
    for (let i = 0; i < moveHistory.length; i += 2) { formattedHistory.push({ turn: Math.floor(i / 2) + 1, w: moveHistory[i], b: moveHistory[i + 1] || '' }); }

    const board = []; const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rowOrder = playerColor === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    rowOrder.forEach((row) => {
        colOrder.forEach((col) => {
            const square = `${files[col]}${row + 1}`; const piece = displayGame.get(square); const isSelected = moveFrom === square;
            board.push(
                <div key={square} onClick={() => onSquareClick(square)} style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: isSelected ? '#f6f669' : ((row + col) % 2 === 0 ? '#5c7fb8' : '#ffffff') }}>
                    {piece && <img src={pieceImages[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]} alt="" style={{ width: '90%', pointerEvents: 'none' }} />}
                    {explosion?.square === square && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 999 }}>
                            {[...Array(40)].map((_, idx) => {
                                const angle = Math.random() * Math.PI * 2; const dist = 50 + Math.random() * 350; const size = 10 + Math.random() * 15;
                                return (
                                    <div key={idx} style={{ position: 'absolute', width: `${size}px`, height: `${size}px`, backgroundColor: 'red', border: '1px solid #8b0000', borderRadius: Math.random() > 0.5 ? '50%' : '2px', top: `-${size / 2}px`, left: `-${size / 2}px`, animation: 'shatterPiece 1s cubic-bezier(0.15, 0.9, 0.3, 1) forwards', '--tx': `${Math.cos(angle) * dist}px`, '--ty': `${Math.sin(angle) * dist}px`, '--rot': `${(Math.random() - 0.5) * 720}deg` }} />
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        });
    });

    const sideMenuItems = [
        { icon: '👨‍🏫', label: t.coach }, { icon: '👁️', label: t.watch },
        { icon: '📰', label: t.news }, { icon: '👥', label: t.community }
    ];

    const currentStatusText = statusKey ? t[statusKey] + customStatus : customStatus;

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#121212', color: 'white', fontFamily: 'Segoe UI', overflow: 'hidden' }}>
            <style>{`@keyframes shatterPiece { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 70% { opacity: 0.8; } 100% { transform: translate(var(--tx), var(--ty)) scale(0.2) rotate(var(--rot)); opacity: 0; } }`}</style>

            {/* ONLY show Stripe elements if user exists to prevent crashes */}
            {showPaymentModal && user && <Elements stripe={stripePromise}><CheckoutForm amount={depositAmount} userId={user.id} onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentModal(false)} /></Elements>}

            <nav onMouseEnter={() => setIsSidebarHovered(true)} onMouseLeave={() => setIsSidebarHovered(false)} style={{ height: '100vh', width: isSidebarHovered ? '200px' : '60px', backgroundColor: '#262421', borderRight: '1px solid #333', transition: 'width 0.2s ease', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 1000, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '15px 18px', borderBottom: '1px solid #333', marginBottom: '10px', height: '60px', flexShrink: 0 }}>
                    <span style={{ fontSize: '24px', marginRight: '15px' }}>♞</span>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#888', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>{t.menu}</span>
                </div>
                {sideMenuItems.map((item) => (
                    <div key={item.label} onClick={() => {
                        if (item.label === t.community) { setShowCommunityChat(prev => !prev); setTimeout(() => document.getElementById('community-input')?.focus(), 100); }
                        else if (item.label === t.coach) { window.open('https://www.chess.com/play/coach', '_blank', 'noopener,noreferrer'); }
                    }} style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s', color: '#b0b0b0' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <span style={{ fontSize: '22px', width: '30px', textAlign: 'center' }}>{item.icon}</span>
                        <span style={{ marginLeft: '10px', fontSize: '15px', fontWeight: 'bold', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s' }}>{item.label}</span>
                    </div>
                ))}
            </nav>

            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
                <header style={{ minHeight: '60px', flexShrink: 0, backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', padding: isMobile ? '10px' : '0 20px', justifyContent: 'space-between', gap: isMobile ? '10px' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'center' : 'flex-start' }}><h2 style={{ color: '#38bdf8', margin: 0, fontSize: '20px' }}>ChessOnline</h2></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', padding: '4px 8px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                            <option value="EN">🇬🇧 EN</option><option value="ES">🇪🇸 ES</option><option value="IT">🇮🇹 IT</option>
                        </select>

                        {user ? (
                            <>
                                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{t.balance}: ${stats.balance?.toFixed(2) || '0.00'}</span>
                                <button onClick={handleAddFundsClick} style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{t.addFunds}</button>
                                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', display: isMobile ? 'none' : 'inline' }}>{t.loggedIn}: <b style={{ color: '#38bdf8' }}>{userEmail.split('@')[0]}</b></span>
                                <button onClick={handleLogoutClick} style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', whiteSpace: 'nowrap' }}>{t.logout}</button>
                            </>
                        ) : (
                            <button onClick={onLoginClick} style={{ fontSize: '13px', padding: '6px 16px', cursor: 'pointer', backgroundColor: '#38bdf8', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.login}</button>
                        )}
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexGrow: 1, padding: isMobile ? '10px' : '20px', gap: '20px', overflowX: 'hidden', overflowY: 'auto', justifyContent: isMobile ? 'flex-start' : 'center', alignItems: isMobile ? 'stretch' : 'flex-start' }}>

                    {showCommunityChat && (
                        <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '250px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', flexShrink: 0, height: isMobile ? '300px' : 'auto', margin: isMobile ? '0 auto' : '0' }}>
                            <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '13px', color: '#f97316', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>🌍 {t.communityChat}</div>
                            <div ref={communityContainerRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {communityMessages.map((m, i) => (
                                    <div key={i} style={{ backgroundColor: '#2c2c2c', padding: '8px', borderRadius: '6px', fontSize: '11px', wordWrap: 'break-word' }}>
                                        <strong style={{ color: m.senderEmail === userEmail ? '#38bdf8' : '#10b981' }}>{m.senderEmail?.split('@')[0] || 'Unknown'}:</strong> <span style={{ color: '#ddd' }}>{m.text}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendCommunityMessage} style={{ display: 'flex', borderTop: '1px solid #333', padding: '10px', flexShrink: 0 }}>
                                <input disabled={!user} id="community-input" type="text" value={communityInput} onChange={e => setCommunityInput(e.target.value)} placeholder={user ? t.saySomething : t.chatLocked} style={{ flexGrow: 1, padding: '8px', backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px 0 0 4px', outline: 'none', fontSize: '11px', minWidth: 0 }} />
                                <button disabled={!user} type="submit" style={{ backgroundColor: '#f97316', border: 'none', color: 'white', padding: '0 10px', fontWeight: 'bold', cursor: user ? 'pointer' : 'not-allowed', borderRadius: '0 4px 4px 0', fontSize: '11px' }}>{t.send}</button>
                            </form>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '560px', flexShrink: 0, margin: isMobile ? '0 auto' : '0' }}>
                        {incomingChallenge && (
                            <div style={{ backgroundColor: '#fbbf24', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#121212', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                                <span>⚔️ {incomingChallenge.email.split('@')[0]} challenged you! ({formatTime(incomingChallenge.timeControl)}) for 💰 ${incomingChallenge.wagerAmount}</span>
                                <button onClick={handleAcceptChallenge} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>{t.acceptBtn}</button>
                                <button onClick={handleDeclineChallenge} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>{t.declineBtn}</button>
                            </div>
                        )}
                        {incomingDrawOffer && (
                            <div style={{ backgroundColor: '#38bdf8', padding: '10px', borderRadius: '8px', marginBottom: '10px', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
                                <span>🤝 Opponent offered a Draw!</span>
                                <button onClick={acceptDraw} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>{t.acceptBtn}</button>
                                <button onClick={handleDeclineDraw} style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>{t.declineBtn}</button>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', fontSize: isMobile ? '12px' : '15px', fontWeight: 'bold', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px', borderRadius: '4px', backgroundColor: displayGame.turn() === 'w' ? '#38bdf8' : '#333', color: displayGame.turn() === 'w' ? '#000' : '#fff', flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontSize: isMobile ? '14px' : '18px' }}>⬜</span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>{whitePlayerName}</span>
                                <span>{formatTime(whiteTime)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px', borderRadius: '4px', backgroundColor: displayGame.turn() === 'b' ? '#38bdf8' : '#333', color: displayGame.turn() === 'b' ? '#000' : '#fff', flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontSize: isMobile ? '14px' : '18px' }}>⬛</span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>{blackPlayerName}</span>
                                <span>{formatTime(blackTime)}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '16px', marginBottom: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{currentStatusText}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', border: '4px solid #2c2c2c', borderRadius: '4px', width: '100%', maxWidth: '100%' }}>{board}</div>
                    </div>

                    <aside style={{ width: '100%', maxWidth: isMobile ? '100%' : '300px', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: isMobile ? '0' : '5px', boxSizing: 'border-box', flexShrink: 0, margin: isMobile ? '0 auto' : '0' }}>
                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                                <div style={{ flex: 1 }}><div style={{ color: '#38bdf8', fontSize: '10px' }}>{t.score}</div><div style={{ fontSize: '16px' }}>{stats.score}</div></div>
                                <div style={{ flex: 1 }}><div style={{ color: '#10b981', fontSize: '10px' }}>{t.won}</div><div style={{ fontSize: '16px' }}>{stats.wins}</div></div>
                                <div style={{ flex: 1 }}><div style={{ color: '#ef4444', fontSize: '10px' }}>{t.loss}</div><div style={{ fontSize: '16px' }}>{stats.losses}</div></div>
                                <div style={{ flex: 1 }}><div style={{ color: '#aaa', fontSize: '10px' }}>{t.statDraw}</div><div style={{ fontSize: '16px' }}>{stats.draws}</div></div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexShrink: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <h4 style={{ color: viewMode === 'tv' ? '#fbbf24' : (viewMode === 'chesscom' ? '#10b981' : '#38bdf8'), margin: 0, fontSize: '12px', textTransform: 'uppercase' }}>
                                    {viewMode === 'tv' ? 'Lichess TV' : (viewMode === 'chesscom' ? 'Chess.com' : (viewMode === 'online' ? t.online.toUpperCase() : t.members.toUpperCase()))}
                                </h4>
                                <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '10px', padding: '4px', outline: 'none', cursor: 'pointer' }}>
                                    <option value="online">{t.online}</option><option value="all">{t.members}</option>
                                    <option value="tv">Lichess TV</option><option value="chesscom">Chess.com</option>
                                </select>
                            </div>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {viewMode === 'online' && (
                                    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>{t.time}:</span>
                                            <select disabled={!user} value={challengeTime} onChange={(e) => setChallengeTime(Number(e.target.value))} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px', outline: 'none', cursor: user ? 'pointer' : 'not-allowed' }}>
                                                <option value={600}>10 Mins</option>
                                                <option value={1800}>30 Mins</option>
                                                <option value={3600}>1 Hour</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>{t.wager}:</span>
                                            <input disabled={!user} type="number" min="0" max={stats.balance || 0} value={wagerAmount} onChange={(e) => setWagerAmount(Number(e.target.value))} style={{ width: '60px', backgroundColor: '#333', color: '#10b981', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px', outline: 'none', cursor: user ? 'text' : 'not-allowed' }} />
                                        </div>
                                    </div>
                                )}
                                {viewMode === 'online' && onlineUsers.map((u, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email.split('@')[0]}</span>
                                        {u.email !== userEmail && user && <button onClick={() => handleSendChallenge(u.email)} style={{ fontSize: '9px', cursor: 'pointer', backgroundColor: '#38bdf8', color: '#000', border: 'none', borderRadius: '3px', padding: '2px 5px' }}>{t.challengeBtn}</button>}
                                    </div>
                                ))}
                                {viewMode === 'all' && allMembers.map((u, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email.split('@')[0]}</span></div>
                                ))}
                                {viewMode === 'tv' && tvGames.map((game, i) => (
                                    <a key={i} href={game.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', padding: '8px', borderRadius: '6px', border: '1px solid #444', color: 'white', display: 'block' }}>
                                        <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>📺 {game.channel}</div>
                                        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}><span>⬜ {game.white}</span> <span style={{ color: '#888' }}>{game.whiteRating}</span></div>
                                        <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}><span>⬛ {game.black}</span> <span style={{ color: '#888' }}>{game.blackRating}</span></div>
                                    </a>
                                ))}
                                {viewMode === 'chesscom' && chessComStreamers.map((streamer, i) => (
                                    <a key={i} href={streamer.twitch_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', padding: '8px', borderRadius: '6px', border: '1px solid #444', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img src={streamer.avatar} alt={streamer.username} style={{ width: '30px', height: '30px', borderRadius: '50%' }} />
                                        <div style={{ overflow: 'hidden' }}><div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{streamer.username}</div><div style={{ fontSize: '10px', color: '#aaa' }}>Live on Twitch 📺</div></div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '220px', flexShrink: 0 }}>
                            <div style={{ padding: '8px', borderBottom: '1px solid #333', fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{t.gameChat}</div>
                            <div ref={chatContainerRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', fontSize: '13px' }}>
                                {chatMessages.map((m, i) => (
                                    <div key={i} style={{ marginBottom: '8px', textAlign: m.sender === userEmail ? 'right' : 'left' }}>
                                        <div style={{ display: 'inline-block', padding: '6px 10px', borderRadius: '12px', backgroundColor: m.sender === userEmail ? '#075e54' : '#333', maxWidth: '80%' }}>{m.text}</div>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={sendChatMessage} style={{ display: 'flex', borderTop: '1px solid #333' }}>
                                <input disabled={!user || !opponent} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={!user ? t.chatLocked : (opponent ? t.typeMessage : t.chatLocked)} style={{ flexGrow: 1, padding: '10px', backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none', minWidth: 0 }} />
                                <button disabled={!user || !opponent} type="submit" style={{ backgroundColor: '#38bdf8', border: 'none', color: 'black', padding: '0 15px', fontWeight: 'bold', cursor: (!user || !opponent) ? 'not-allowed' : 'pointer' }}>{t.send}</button>
                            </form>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                            <button onClick={handleDrawOffer} disabled={(!user || !opponent && !isPlayingComputer) || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white' }}>{t.actionDraw}</button>
                            <button onClick={handleResign} disabled={(!user || !opponent && !isPlayingComputer) || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer', borderRadius: '4px', border: 'none', color: 'white' }}>{t.actionResign}</button>
                        </div>

                        <button onClick={() => { setOpponent(null); setIsPlayingComputer(true); resetMatch(300); setStatusKey("gameStarted"); setCustomStatus(""); speak(t.gameStarted, language); }} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>{t.playComputer}</button>
                        <button onClick={() => setGunshotEnabled(!gunshotEnabled)} style={{ width: '100%', padding: '10px', backgroundColor: gunshotEnabled ? '#f97316' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>{gunshotEnabled ? t.turnOffGunshot : t.turnOnGunshot}</button>
                        <button onClick={() => setSpeakChatEnabled(!speakChatEnabled)} style={{ width: '100%', padding: '10px', backgroundColor: speakChatEnabled ? '#f97316' : '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>{speakChatEnabled ? t.turnOffChatSpeak : t.turnOnChatSpeak}</button>

                        <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '150px', flexShrink: 0 }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa' }}>{t.history}</h4>
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
                    </aside>

                    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '220px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', flexShrink: 0, height: isMobile ? '400px' : 'auto', margin: isMobile ? '0 auto' : '0' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>{t.travelDeals}</div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
                            {travelAds.map(ad => (
                                <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                    <img src={ad.img} alt="Travel Destination" loading="lazy" style={{ width: '100%', height: '110px', objectFit: 'cover', backgroundColor: '#444' }} />
                                    <div style={{ padding: '10px' }}><div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>{ad.tag}</div><div style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{ad.name}</div></div>
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

                <footer style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', padding: '15px 30px', gap: isMobile ? '10px' : '0', color: '#888', fontSize: '14px', borderTop: '1px solid #333', backgroundColor: '#1e1e1e', flexShrink: 0 }}>
                    <div>NoirSoft Creation {new Date().getFullYear()}</div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', fontWeight: 'bold', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <span style={{ color: '#aaa' }}>👥 {translations.EN.members}: {allMembers.length}</span>
                        <span style={{ color: '#10b981' }}>🟢 {translations.EN.online}: {onlineUsers.length}</span>
                        <span style={{ color: '#f97316' }}>⚔️ Playing: {onlineUsers.filter(u => u.isPlaying).length}</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [language, setLanguage] = useState('EN'); // Centralized Language State
    const [showAuthModal, setShowAuthModal] = useState(false); // Controls the login dialog

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => { if (session) setCurrentUser(session.user); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setCurrentUser(s?.user || null));
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <ChessGame
                user={currentUser}
                onLogout={() => supabase.auth.signOut()}
                onLoginClick={() => setShowAuthModal(true)}
                language={language}
                setLanguage={setLanguage}
            />
            {showAuthModal && !currentUser && (
                <AuthModal
                    onAuthSuccess={(user) => {
                        setCurrentUser(user);
                        setShowAuthModal(false);
                    }}
                    onClose={() => setShowAuthModal(false)}
                    language={language}
                />
            )}
        </>
    );
}