import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { supabase } from './supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './App.css';

// ==========================================
// 🛡️ BULLETPROOF STRIPE INITIALIZATION
// ==========================================
let STRIPE_KEY = 'pk_test_YOUR_STRIPE_PUBLIC_KEY'; // Fallback

try {
    if (typeof process !== 'undefined' && process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
        STRIPE_KEY = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    } else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    }
} catch (e) {
    console.warn("Could not read environment variables, using fallback Stripe key.");
}

let stripePromise = null;
if (STRIPE_KEY && STRIPE_KEY.startsWith('pk_')) {
    try {
        stripePromise = loadStripe(STRIPE_KEY);
    } catch (error) {
        console.error("Stripe initialization failed:", error);
    }
} else {
    console.error("🛑 STRIPE ERROR: Invalid Public Key. It must start with 'pk_test_' or 'pk_live_'. Check your .env file!");
}

// ==========================================
// 🌍 TRANSLATIONS DICTIONARY
// ==========================================
const translations = {
    EN: {
        balance: "Balance", addFunds: "Add Funds", withdraw: "Withdraw", insufficientFunds: "Insufficient funds.", loggedIn: "Logged in", logout: "Logout",
        communityChat: "COMMUNITY CHAT", saySomething: "Say something...", send: "Send",
        actionDraw: "🤝 Draw", actionResign: "🏳️ Resign", playComputer: "Play Computer",
        turnOffGunshot: "Turn off gunshot", turnOnGunshot: "Turn on gunshot",
        turnOffChatSpeak: "Turn off Chat Speak", turnOnChatSpeak: "Turn on Chat Speak",
        score: "SCORE", won: "WON", loss: "LOSS", statDraw: "DRAW", history: "HISTORY",
        gameChat: "GAME CHAT", chatLocked: "Chat locked", typeMessage: "Type message...",
        travelDeals: "✈️ TRAVEL DEALS", menu: "MENU", coach: "Coach", watch: "Watch",
        news: "News", community: "Community", online: "Online", members: "Members",
        gamesPlayed: "Games Played", replayMode: "REPLAY MODE",
        time: "TIME", wager: "WAGER", challengeBtn: "Challenge", acceptBtn: "Accept", declineBtn: "Decline", emailChallenge: "Email Challenge (10m)",
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
        balance: "Saldo", addFunds: "Añadir Fondos", withdraw: "Retirar", insufficientFunds: "Fondos insuficientes.", loggedIn: "Conectado", logout: "Salir",
        communityChat: "CHAT COMUNIDAD", saySomething: "Di algo...", send: "Enviar",
        actionDraw: "🤝 Empate", actionResign: "🏳️ Rendirse", playComputer: "Jugar contra PC",
        turnOffGunshot: "Apagar disparos", turnOnGunshot: "Activar disparos",
        turnOffChatSpeak: "Apagar voz de chat", turnOnChatSpeak: "Activar voz de chat",
        score: "PUNTOS", won: "VICTORIAS", loss: "DERROTAS", statDraw: "EMPATE", history: "HISTORIAL",
        gameChat: "CHAT DE JUEGO", chatLocked: "Chat bloqueado", typeMessage: "Escribe un mensaje...",
        travelDeals: "✈️ OFERTAS DE VIAJE", menu: "MENÚ", coach: "Entrenador", watch: "Ver",
        news: "Noticias", community: "Comunidad", online: "En línea", members: "Miembros",
        gamesPlayed: "Partidas Jugadas", replayMode: "MODO REPETICIÓN",
        time: "TIEMPO", wager: "APUESTA", challengeBtn: "Desafiar", acceptBtn: "Aceptar", declineBtn: "Rechazar", emailChallenge: "Retar por Email (10m)",
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
        balance: "Saldo", addFunds: "Aggiungi Fondi", withdraw: "Ritira", insufficientFunds: "Fondi insufficienti.", loggedIn: "Connesso", logout: "Esci",
        communityChat: "CHAT COMUNITÀ", saySomething: "Dì qualcosa...", send: "Invia",
        actionDraw: "🤝 Patta", actionResign: "🏳️ Abbandona", playComputer: "Gioca contro PC",
        turnOffGunshot: "Spegni spari", turnOnGunshot: "Attiva spari",
        turnOffChatSpeak: "Spegni voce chat", turnOnChatSpeak: "Attiva voce chat",
        score: "PUNTI", won: "VINTE", loss: "PERSE", statDraw: "PATTE", history: "CRONOLOGIA",
        gameChat: "CHAT DI GIOCO", chatLocked: "Chat bloccata", typeMessage: "Scrivi messaggio...",
        travelDeals: "✈️ OFFERTE VIAGGIO", menu: "MENU", coach: "Allenatore", watch: "Guarda",
        news: "Notizie", community: "Comunità", online: "Online", members: "Membri",
        gamesPlayed: "Partite Giocate", replayMode: "MODALITÀ REPLAY",
        time: "TEMPO", wager: "PUNTATA", challengeBtn: "Sfida", acceptBtn: "Accetta", declineBtn: "Rifiuta", emailChallenge: "Sfida via Email (10m)",
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
    move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
    capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
    check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
    thunder: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7845f4fae2.mp3',
};

const speak = (text, langCode = 'EN') => {
    if ('speechSynthesis' in window) {
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            if (langCode === 'ES') utterance.lang = 'es-ES';
            else if (langCode === 'IT') utterance.lang = 'it-IT';
            else utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        } catch (e) { console.warn("TTS Error:", e); }
    }
};

// ==========================================
// 🧠 CHESS AI ENGINE
// ==========================================
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
    const isGameOver = typeof gameInstance.isGameOver === 'function' ? gameInstance.isGameOver() : gameInstance.game_over();
    if (depth === 0 || isGameOver) return evaluateBoard(gameInstance);

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

function CheckoutForm({ amount, userId, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            setError("Payment gateway is still loading or failed to connect. Please check your Stripe API Key.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { data, error: backendError } = await supabase.functions.invoke('create-payment', { body: { amount: amount, userId: userId } });
            if (backendError) throw new Error(backendError.message || "Failed to initialize payment.");
            if (!data?.clientSecret) throw new Error("No secure client secret returned from the server.");
            const result = await stripe.confirmCardPayment(data.clientSecret, { payment_method: { card: elements.getElement(CardElement) } });
            if (result.error) {
                setError(result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
                alert(`Successfully added $${amount.toFixed(2)}!`);
                onSuccess(amount);
            }
        } catch (err) {
            setError(err.message || "An error occurred during payment. Check console for details.");
        }
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '400px', border: '1px solid #333' }}>
                <h3 style={{ color: '#38bdf8', marginTop: 0, textAlign: 'center' }}>Deposit ${amount.toFixed(2)}</h3>
                {!stripe && <div style={{ color: '#fbbf24', fontSize: '13px', marginBottom: '15px', textAlign: 'center', backgroundColor: '#333', padding: '10px', borderRadius: '4px' }}>Connecting to secure payment gateway...</div>}
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '15px', backgroundColor: '#2c2c2c', borderRadius: '4px', marginBottom: '20px' }}>
                        <CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff', '::placeholder': { color: '#aab7c4' } } } }} />
                    </div>
                    {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="button" onClick={onCancel} disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" disabled={!stripe || loading} style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: (!stripe || loading) ? 'not-allowed' : 'pointer', opacity: (!stripe || loading) ? 0.5 : 1, fontWeight: 'bold' }}>
                            {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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

function ChessGame({ user, onLogout, onLoginClick, language, setLanguage }) {
    const t = translations[language];
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

    const [showGamesPlayed, setShowGamesPlayed] = useState(false);
    const [gamesHistoryList, setGamesHistoryList] = useState([]);
    const [isLoadingGames, setIsLoadingGames] = useState(false);

    // 🔥 Replay State 🔥
    const [replayInfo, setReplayInfo] = useState(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

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
    const [travelAds, setTravelAds] = useState([]);

    const moveHistoryRef = useRef([]);
    useEffect(() => { moveHistoryRef.current = moveHistory; }, [moveHistory]);

    const playerColorRef = useRef('w');
    useEffect(() => { playerColorRef.current = playerColor; }, [playerColor]);

    const currentStakeRef = useRef(0);
    useEffect(() => { currentStakeRef.current = currentStake; }, [currentStake]);

    const isGameOverManuallyRef = useRef(false);
    useEffect(() => { isGameOverManuallyRef.current = isGameOverManually; }, [isGameOverManually]);

    useEffect(() => { gunshotEnabledRef.current = gunshotEnabled; speakChatEnabledRef.current = speakChatEnabled; }, [gunshotEnabled, speakChatEnabled]);
    useEffect(() => { onlineUsersRef.current = onlineUsers; }, [onlineUsers]);

    const opponentRef = useRef(null);
    const gameRef = useRef(new Chess());
    useEffect(() => { opponentRef.current = opponent; }, [opponent]);

    useEffect(() => {
        if (!userEmail) return;

        const params = new URLSearchParams(window.location.search);
        const urlChallenger = params.get('challenger');
        const urlTime = params.get('time');

        if (urlChallenger && urlTime) {
            setIncomingChallenge({
                email: urlChallenger,
                timeControl: parseInt(urlTime, 10),
                wagerAmount: 0
            });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [userEmail]);

    const pieceImages = {
        p: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg', r: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg', n: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
        b: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg', q: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg', k: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
        P: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg', R: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg', N: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
        B: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg', Q: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg', K: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg'
    };

    // Calculate display board based on history
    const displayGame = new Chess();
    moveHistory.slice(0, currentMoveIndex).forEach(m => { try { displayGame.move(m); } catch (e) { console.error("History replay error", e); } });

    // 🔥 NEW: Auto-play logic for replays 🔥
    useEffect(() => {
        let timer;
        if (replayInfo && isAutoPlaying && currentMoveIndex < moveHistory.length) {
            timer = setTimeout(() => {
                try {
                    // Create a temporary board to accurately simulate the next move and trigger sounds
                    const tempGame = new Chess();
                    moveHistory.slice(0, currentMoveIndex).forEach(m => tempGame.move(m));
                    const nextMove = tempGame.move(moveHistory[currentMoveIndex]);

                    if (nextMove) {
                        playMoveSound(nextMove, tempGame);
                        if (nextMove.captured) {
                            triggerCaptureEffects(nextMove.to, nextMove.color === 'w' ? 'b' : 'w');
                        }
                    }
                } catch (e) {
                    console.error("Auto-play sound error:", e);
                }
                setCurrentMoveIndex(prev => prev + 1);
            }, 1000); // 1-second pause
        } else if (currentMoveIndex >= moveHistory.length) {
            setIsAutoPlaying(false);
        }
        return () => clearTimeout(timer);
    }, [isAutoPlaying, currentMoveIndex, moveHistory, replayInfo]);

    useEffect(() => {
        fetchUserStats(); fetchAllMembers(); fetchTvGames(); fetchChessComTv(); fetchCommunityComments();
    }, [user]);

    useEffect(() => {
        const fetchLocationAndSetAds = async () => {
            const regionalCities = {
                ES: ["Madrid", "Barcelona", "Seville", "Valencia", "Ibiza", "Malaga", "Bilbao"],
                US: ["NYC", "LA", "Miami", "Orlando", "Las Vegas", "Chicago", "Austin"],
                IT: ["Rome", "Venice", "Florence", "Milan", "Naples", "Amalfi", "Sicily"],
                GB: ["London", "Edinburgh", "Manchester", "Birmingham", "Glasgow"],
                DEFAULT: ["Paris", "London", "Tokyo", "Bali", "NYC", "Dubai", "Rome"]
            };

            let countryCode = 'DEFAULT';
            try {
                const res = await fetch('https://ipapi.co/json/');
                if (res.ok) {
                    const data = await res.json();
                    if (regionalCities[data.country_code]) countryCode = data.country_code;
                }
            } catch (error) { }

            const citiesToUse = regionalCities[countryCode] || regionalCities.DEFAULT;
            const generatedAds = citiesToUse.map((city, i) => ({
                id: i,
                name: `${i % 2 === 0 ? 'Grand Hotel' : 'Luxury Flight'} ${city}`,
                url: i % 2 === 0 ? "https://www.booking.com" : "https://www.skyscanner.com",
                img: `https://picsum.photos/seed/${city.replace(/\s+/g, '')}/300/200`,
                tag: i % 2 === 0 ? "HOTEL" : "FLIGHT"
            }));
            setTravelAds(generatedAds);
        };
        fetchLocationAndSetAds();
    }, []);

    useEffect(() => { if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }, [chatMessages]);
    useEffect(() => { if (showCommunityChat && communityContainerRef.current) communityContainerRef.current.scrollTop = communityContainerRef.current.scrollHeight; }, [communityMessages, showCommunityChat]);

    const fetchUserStats = async () => {
        if (!user) return;
        let { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
            setStats({ wins: data.wins || 0, losses: data.losses || 0, draws: data.draws || 0, score: data.score !== undefined ? data.score : 100, balance: parseFloat(data.balance || 0) });
        }
    };

    const fetchGamesHistory = async () => {
        setIsLoadingGames(true);
        const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false }).limit(100);
        if (data) setGamesHistoryList(data);
        setIsLoadingGames(false);
    };

    const saveGameToDb = async (type, reason) => {
        const currentMoves = moveHistoryRef.current;
        const color = playerColorRef.current;
        if (!currentMoves || currentMoves.length === 0) return;

        let resultText = 'Draw';
        if (type === 'win') resultText = `${color === 'w' ? 'White' : 'Black'} won by ${reason}`;
        else if (type === 'loss') resultText = `${color === 'w' ? 'Black' : 'White'} won by ${reason}`;
        else resultText = `Draw by ${reason}`;

        const whiteFailedToFinish = (color === 'b' && (reason === 'Abandonment' || reason === 'Resignation' || reason === 'Timeout'));

        if (color === 'w' || isPlayingComputer || whiteFailedToFinish) {
            const opponentName = isPlayingComputer ? 'Computer' : (opponentRef.current || 'Guest');
            try {
                await supabase.from('games').insert([{
                    white_email: color === 'w' ? (userEmail || 'Guest') : opponentName,
                    black_email: color === 'b' ? (userEmail || 'Guest') : opponentName,
                    moves: currentMoves,
                    result: resultText
                }]);
            } catch (err) { }
        }
    };

    const handleAddFundsClick = () => {
        const amountStr = prompt("Enter amount to deposit ($):", "10.00");
        if (!amountStr) return; const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount < 1) { alert("Please enter a valid amount of $1.00 or more."); return; }
        setDepositAmount(amount); setShowPaymentModal(true);
    };

    const handleWithdrawClick = async () => {
        const amountStr = prompt("Enter amount to withdraw ($):", "10.00");
        if (!amountStr) return;

        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount greater than 0.");
            return;
        }

        if (amount > stats.balance) {
            alert(t.insufficientFunds || "Insufficient funds.");
            return;
        }

        try {
            // 🛑 CALLING THE BACKEND: Tell your server to talk to Stripe
            const { data, error: backendError } = await supabase.functions.invoke('process-withdrawal', {
                body: { amount: amount, userId: user.id }
            });

            if (backendError) throw new Error(backendError.message || "Server error during withdrawal.");

            // ✅ STRIPE SUCCEEDED: Now we can safely deduct the balance in the database
            const newBalance = parseFloat(stats.balance || 0) - amount;
            setStats(prev => ({ ...prev, balance: newBalance }));

            if (user) {
                await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
            }

            alert(`Successfully initiated withdrawal of $${amount.toFixed(2)}! It may take a few days to reach your bank.`);

        } catch (err) {
            console.error("Withdrawal failed:", err);
            alert("Failed to process withdrawal: " + err.message);
        }
    };



    const handlePaymentSuccess = async (amount) => {
        setShowPaymentModal(false);
        const newBalance = parseFloat(stats.balance || 0) + parseFloat(amount);
        setStats(prev => ({ ...prev, balance: newBalance }));
        if (user) {
            await supabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);
        }
    };

    const fetchAllMembers = async () => {
        let { data } = await supabase.from('profiles').select('email');
        if (data) {
            const sortedData = data.sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' }));
            setAllMembers(sortedData);
        }
    };

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
        try {
            let audioUrl = sounds.move;
            let isCheck = false;
            if (typeof gameInstance.isCheck === 'function') isCheck = gameInstance.isCheck();
            else if (typeof gameInstance.inCheck === 'function') isCheck = gameInstance.inCheck();
            else if (typeof gameInstance.in_check === 'function') isCheck = gameInstance.in_check();

            if (isCheck) { audioUrl = sounds.check; speak("Check", language); }
            else if (move.captured) audioUrl = sounds.capture;

            const audio = new Audio(audioUrl);
            audio.play().catch(err => console.warn("Audio playback prevented by browser:", err));
        } catch (e) { console.error("Sound logic error:", e); }
    };

    const triggerCaptureEffects = (square, capturedColor) => {
        try {
            if (gunshotEnabledRef.current) {
                const audio = new Audio('/shotgun.mp3');
                audio.play().catch(() => { });
            }
            setExplosion({ square, color: capturedColor });
            setTimeout(() => setExplosion(null), 1000);
        } catch (e) { console.error("Capture effect error:", e); }
    };

    const recordResult = async (type, reason = 'Unknown') => {
        saveGameToDb(type, reason);
        if (!user) return;
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const updates = { ...data, score: data?.score || 100, balance: parseFloat(data?.balance || 0) };
        const stake = currentStakeRef.current;
        if (type === 'win') { updates.wins += 1; updates.score += 8; updates.balance += stake; }
        if (type === 'loss') { updates.losses += 1; updates.score -= 8; updates.balance -= stake; }
        if (type === 'draw') { updates.draws += 1; }
        await supabase.from('profiles').update({ wins: updates.wins, losses: updates.losses, draws: updates.draws, score: updates.score, balance: updates.balance }).eq('id', user.id);
        setStats(updates); setCurrentStake(0);
    };

    const resetMatch = (timeControl = 300) => {
        gameRef.current = new Chess(); setMoveHistory([]); setCurrentMoveIndex(0);
        setWhiteTime(timeControl); setBlackTime(timeControl); setMoveFrom('');
        setIsGameOverManually(false); setIncomingDrawOffer(false); setChatMessages([]);
        setReplayInfo(null);
        setIsAutoPlaying(false);
    };

    const handleLogoutClick = async () => {
        if (opponent && !isGameOverManually && lobbyChannel) {
            setIsGameOverManually(true);
            await lobbyChannel.send({ type: 'broadcast', event: 'disconnect', payload: { targetEmail: opponentRef.current } }).catch(() => { });
            await recordResult('loss', 'Abandonment');
        }
        onLogout();
    };

    useEffect(() => {
        const handleTabClose = () => {
            if (opponentRef.current && !isGameOverManuallyRef.current && lobbyChannel) {
                lobbyChannel.send({ type: 'broadcast', event: 'disconnect', payload: { targetEmail: opponentRef.current } }).catch(() => { });
            }
        };
        window.addEventListener('beforeunload', handleTabClose);
        return () => window.removeEventListener('beforeunload', handleTabClose);
    }, [lobbyChannel]);

    useEffect(() => {
        const channel = supabase.channel('chess-lobby'); setLobbyChannel(channel);
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const userMap = new Map();
                for (const key in state) {
                    state[key].forEach(p => { if (p.email) { if (!userMap.has(p.email) || p.isPlaying) { userMap.set(p.email, p); } } });
                }
                const sortedOnlineUsers = Array.from(userMap.values()).sort((a, b) => a.email.localeCompare(b.email, undefined, { sensitivity: 'base' }));
                setOnlineUsers(sortedOnlineUsers);
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
                    try {
                        const moveResult = gameRef.current.move(payload.moveSan);
                        if (moveResult) {
                            playMoveSound(moveResult, gameRef.current);
                            if (moveResult.captured) triggerCaptureEffects(payload.to, moveResult.color === 'w' ? 'b' : 'w');
                            setMoveHistory(prev => { const next = [...prev, payload.moveSan]; setCurrentMoveIndex(next.length); return next; });
                        }
                    } catch (e) { console.error("Broadcast Move Error:", e); }
                }
            })
            .on('broadcast', { event: 'chat' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && payload.senderEmail === opponentRef.current) {
                    setChatMessages(prev => [...prev, { text: payload.text, sender: payload.senderEmail }]);
                    if (speakChatEnabledRef.current) speak(payload.text, language);
                }
            })
            .on('broadcast', { event: 'resign' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && !isGameOverManuallyRef.current) {
                    setIsGameOverManually(true); setStatusKey("opponentResigned"); setCustomStatus(""); speak(t.opponentResigned, language); recordResult('win', 'Resignation');
                }
            })
            .on('broadcast', { event: 'drawOffer' }, ({ payload }) => { if (userEmail && payload.targetEmail === userEmail) setIncomingDrawOffer(true); })
            .on('broadcast', { event: 'drawAccepted' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail) { setIsGameOverManually(true); setStatusKey("drawAccepted"); setCustomStatus(""); speak(t.drawAccepted, language); recordResult('draw', 'Agreement'); }
            })
            .on('broadcast', { event: 'drawDeclined' }, ({ payload }) => { if (userEmail && payload.targetEmail === userEmail) { setStatusKey("drawDeclined"); setCustomStatus(""); setIncomingDrawOffer(false); } })
            .on('broadcast', { event: 'disconnect' }, ({ payload }) => {
                if (userEmail && payload.targetEmail === userEmail && !isGameOverManuallyRef.current) {
                    setIsGameOverManually(true); setStatusKey("opponentDisconnected"); setCustomStatus(""); speak(t.opponentDisconnected, language); recordResult('win', 'Abandonment');
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

        return () => { channel.untrack(); supabase.removeChannel(channel); supabase.removeChannel(commentsSub); };
    }, [userEmail, language]);

    useEffect(() => {
        if (opponent && !isGameOverManually) {
            const isOpponentInGame = onlineUsers.some(u => u.email === opponent && u.isPlaying);
            if (!isOpponentInGame) {
                const checkTimeout = setTimeout(() => {
                    const stillOffline = !onlineUsersRef.current.some(u => u.email === opponent && u.isPlaying);
                    if (stillOffline && !isGameOverManuallyRef.current) {
                        setIsGameOverManually(true); setStatusKey("opponentDisconnected"); setCustomStatus(""); speak(t.opponentDisconnected, language); recordResult('win', 'Abandonment');
                    }
                }, 3000);
                return () => clearTimeout(checkTimeout);
            }
        }
    }, [onlineUsers, opponent, isGameOverManually, language, t]);

    useEffect(() => {
        if (lobbyChannel && userEmail) { lobbyChannel.track({ email: userEmail, socketId: mySocketId.current, isPlaying: !!(opponent || isPlayingComputer) }).catch(() => { }); }
    }, [opponent, isPlayingComputer, lobbyChannel, userEmail]);

    useEffect(() => {
        const isGameOver = typeof displayGame.isGameOver === 'function' ? displayGame.isGameOver() : displayGame.game_over();
        if (isGameOver || isGameOverManually || currentMoveIndex < moveHistory.length || (!opponent && !isPlayingComputer)) { clearInterval(timerRef.current); return; }

        timerRef.current = setInterval(() => {
            if (displayGame.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1)); else setBlackTime(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [moveHistory, currentMoveIndex, isGameOverManually, opponent, isPlayingComputer]);

    useEffect(() => {
        if (!isGameOverManually && (whiteTime === 0 || blackTime === 0)) {
            setIsGameOverManually(true); const winnerColor = whiteTime === 0 ? "b" : "w";
            setStatusKey("timeOut"); setCustomStatus(` ${playerColor === winnerColor ? t.youWin : t.youLose}`);
            speak(t.timeOut, language); recordResult(playerColor === winnerColor ? 'win' : 'loss', 'Timeout');
        }
    }, [whiteTime, blackTime, isGameOverManually, playerColor, language, t]);

    useEffect(() => {
        const isCheckmate = typeof displayGame.isCheckmate === 'function' ? displayGame.isCheckmate() : displayGame.in_checkmate();
        const isDraw = typeof displayGame.isDraw === 'function' ? displayGame.isDraw() : displayGame.in_draw();

        if (isCheckmate) {
            const loserColor = displayGame.turn(); const outcome = playerColor === loserColor ? t.youLose : t.youWin;
            setStatusKey("checkmate"); setCustomStatus(` ${outcome}`);
            if (!isGameOverManually) {
                setIsGameOverManually(true); speak(t.checkmate, language);
                new Audio(sounds.thunder).play().catch(() => { });
                if (gunshotEnabledRef.current) { for (let i = 0; i < 3; i++) setTimeout(() => new Audio('/shotgun.mp3').play().catch(() => { }), i * 400); }
                recordResult(playerColor === loserColor ? 'loss' : 'win', 'Checkmate');
            }
        } else if (isDraw) {
            setStatusKey("gameIsDraw"); setCustomStatus("");
            if (!isGameOverManually) { setIsGameOverManually(true); speak(t.gameIsDraw, language); recordResult('draw', 'Stalemate / Rules'); }
        } else if (!isGameOverManually && (opponent || isPlayingComputer)) {
            const isMyTurn = displayGame.turn() === playerColor;
            const newStatusKey = isMyTurn ? "yourTurn" : "waiting";
            if (moveHistory.length > 0 && statusKey !== newStatusKey) { setStatusKey(newStatusKey); setCustomStatus(""); }
        }
    }, [moveHistory, playerColor, isGameOverManually, opponent, isPlayingComputer, statusKey, language, t]);

    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!chatInput.trim() || !opponent) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'chat', payload: { targetEmail: opponent, senderEmail: userEmail, text: chatInput } });
        setChatMessages(prev => [...prev, { text: chatInput, sender: userEmail }]); setChatInput('');
    };

    const sendCommunityMessage = async (e) => {
        e.preventDefault();
        if (!user) { alert("Please login to send messages."); return; }
        if (!communityInput.trim()) return;
        await supabase.from('comments').insert([{ text: communityInput, senderEmail: userEmail }]);
        setCommunityInput('');
    };

    const handleSendChallenge = async (targetEmail) => {
        if (!user) { alert("Please login to challenge players."); return; }
        if (wagerAmount > stats.balance) { alert("Insufficient funds!"); return; }
        if (!lobbyChannel) return;
        setStatusKey(""); setCustomStatus(`Challenge sent for $${wagerAmount}...`);
        await lobbyChannel.send({ type: 'broadcast', event: 'challenge', payload: { challengerEmail: userEmail, targetEmail, timeControl: challengeTime, wagerAmount } });
    };

    const handleEmailChallenge = async (targetEmail) => {
        if (!user) { alert("Please login to challenge players."); return; }
        if (window.confirm(`Send an email challenge for a 10-minute game to ${targetEmail}?`)) {
            try {
                const { error } = await supabase.functions.invoke('send-challenge-email', {
                    body: { targetEmail: targetEmail, challengerEmail: userEmail, timeControl: 600 }
                });
                if (error) throw error;
                alert(`Challenge email sent to ${targetEmail}!`);
            } catch (err) {
                console.error("Error sending email:", err);
                alert("Failed to send challenge email.");
            }
        }
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
        if (!user) return;
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;
        if (window.confirm("Are you sure you want to resign?")) {
            setIsGameOverManually(true); setStatusKey("youResigned"); setCustomStatus(""); speak(t.youResigned, language); recordResult('loss', 'Resignation');
            if (opponent) lobbyChannel.send({ type: 'broadcast', event: 'resign', payload: { targetEmail: opponentRef.current } });
        }
    };

    const handleDrawOffer = () => {
        if (!user) return;
        if (isGameOverManually || (!opponent && !isPlayingComputer)) return;
        if (opponent) { lobbyChannel.send({ type: 'broadcast', event: 'drawOffer', payload: { targetEmail: opponent } }); setStatusKey("drawOfferSent"); setCustomStatus(""); }
        else if (isPlayingComputer) { setIsGameOverManually(true); setStatusKey(""); setCustomStatus("Computer accepts the draw!"); speak("Computer accepts the draw", language); recordResult('draw', 'Agreement'); }
    };

    const handleDeclineDraw = () => {
        if (opponentRef.current && userEmail) lobbyChannel.send({ type: 'broadcast', event: 'drawDeclined', payload: { targetEmail: opponentRef.current } });
        setIncomingDrawOffer(false);
    };

    const acceptDraw = () => {
        setIsGameOverManually(true); setStatusKey("drawAccepted"); setCustomStatus(""); speak(t.drawAccepted, language); recordResult('draw', 'Agreement'); setIncomingDrawOffer(false);
        if (opponent && userEmail) lobbyChannel.send({ type: 'broadcast', event: 'drawAccepted', payload: { targetEmail: opponentRef.current } });
    };

    function onSquareClick(square) {
        const isGameOver = typeof displayGame.isGameOver === 'function' ? displayGame.isGameOver() : displayGame.game_over();
        if (isGameOver || isGameOverManually) return;
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
                const nextHistory = [...moveHistory, move.san];
                setMoveHistory(nextHistory);
                setCurrentMoveIndex(nextHistory.length);
                setMoveFrom('');

                if (opponentRef.current && userEmail) {
                    lobbyChannel.send({ type: 'broadcast', event: 'move', payload: { targetEmail: opponentRef.current, moveSan: move.san, captured: !!move.captured, to: move.to } });
                }
            } else {
                if (piece?.color === displayGame.turn()) setMoveFrom(square);
                else setMoveFrom('');
            }
        } catch (e) {
            console.error("Move processing error:", e);
            setMoveFrom('');
        }
    }

    useEffect(() => {
        const isGameOver = typeof displayGame.isGameOver === 'function' ? displayGame.isGameOver() : displayGame.game_over();
        if (!isPlayingComputer || isGameOver || isGameOverManually || opponent || currentMoveIndex < moveHistory.length) return;
        if (displayGame.turn() === 'b') {
            const timer = setTimeout(() => {
                try {
                    const bestMove = getBestMove(gameRef.current, 2);
                    const moveData = gameRef.current.move(bestMove);
                    if (moveData) {
                        playMoveSound(moveData, gameRef.current);
                        if (moveData.captured) triggerCaptureEffects(moveData.to, moveData.color === 'w' ? 'b' : 'w');
                        setMoveHistory(prev => [...prev, bestMove]);
                        setCurrentMoveIndex(prev => prev + 1);
                    }
                } catch (e) {
                    console.error("Computer logic error:", e);
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
        if (replayInfo) {
            const email = color === 'w' ? replayInfo.white_email : replayInfo.black_email;
            return email ? email.split('@')[0] : (color === 'w' ? 'White' : 'Black');
        }
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
        { icon: '📰', label: t.news }, { icon: '👥', label: t.community },
        { icon: '🕹️', label: t.gamesPlayed }
    ];

    let currentStatusText = statusKey ? t[statusKey] + customStatus : customStatus;
    if (replayInfo) {
        if (currentMoveIndex === moveHistory.length && moveHistory.length > 0) {
            currentStatusText = `🏁 Game Over: ${replayInfo.result?.toUpperCase()} (Move ${currentMoveIndex}/${moveHistory.length})`;
        } else {
            currentStatusText = `▶️ Reviewing Game (Move ${currentMoveIndex}/${moveHistory.length})`;
        }
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#121212', color: 'white', fontFamily: 'Segoe UI', overflow: 'hidden' }}>
            <style>{`@keyframes shatterPiece { 0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; } 70% { opacity: 0.8; } 100% { transform: translate(var(--tx), var(--ty)) scale(0.2) rotate(var(--rot)); opacity: 0; } }`}</style>

            {showPaymentModal && user && <Elements stripe={stripePromise}><CheckoutForm amount={depositAmount} userId={user.id} onSuccess={handlePaymentSuccess} onCancel={() => setShowPaymentModal(false)} /></Elements>}

            {showGamesPlayed && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
                    <div style={{ backgroundColor: '#1e1e1e', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', border: '1px solid #333', position: 'relative', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => setShowGamesPlayed(false)} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                        <h3 style={{ color: '#38bdf8', marginTop: 0, textAlign: 'center' }}>{t.gamesPlayed}</h3>
                        <div style={{ overflowY: 'auto', flexGrow: 1, marginTop: '10px' }}>
                            {isLoadingGames ? (
                                <div style={{ textAlign: 'center', color: '#aaa' }}>Loading...</div>
                            ) : gamesHistoryList.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#aaa' }}>No games found in the database.</div>
                            ) : (
                                gamesHistoryList.map(g => {
                                    const dateStr = g.created_at ? new Date(g.created_at).toLocaleString() : 'Unknown Date';
                                    return (
                                        <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2c2c2c', padding: '15px', marginBottom: '10px', borderRadius: '6px' }}>
                                            <div>
                                                <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white' }}>⬜ {g.white_email?.split('@')[0]} <span style={{ color: '#888' }}>vs</span> ⬛ {g.black_email?.split('@')[0]}</div>
                                                <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                                                    {dateStr} | Result: <b style={{ color: '#f59e0b' }}>{g.result?.toUpperCase()}</b> | Moves: {g.moves?.length || 0}
                                                </div>
                                            </div>
                                            <button onClick={() => {
                                                let parsedMoves = [];
                                                try {
                                                    parsedMoves = typeof g.moves === 'string' ? JSON.parse(g.moves) : (g.moves || []);
                                                } catch (e) { parsedMoves = []; }

                                                setMoveHistory(parsedMoves);
                                                setCurrentMoveIndex(0);
                                                setIsGameOverManually(true);
                                                setOpponent(null);
                                                setIsPlayingComputer(false);
                                                setStatusKey("");
                                                setCustomStatus("");
                                                setReplayInfo(g);
                                                setPlayerColor('w');
                                                setShowGamesPlayed(false);

                                                // 🔥 START THE AUTO-REPLAY AND TTS 🔥
                                                setIsAutoPlaying(true);
                                                speak("Watch the game and see all the moves", language);
                                            }} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{t.watch}</button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            <nav onMouseEnter={() => setIsSidebarHovered(true)} onMouseLeave={() => setIsSidebarHovered(false)} style={{ height: '100vh', width: isSidebarHovered ? '200px' : '60px', backgroundColor: '#262421', borderRight: '1px solid #333', transition: 'width 0.2s ease', display: 'flex', flexDirection: 'column', flexShrink: 0, zIndex: 1000, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '15px 18px', borderBottom: '1px solid #333', marginBottom: '10px', height: '60px', flexShrink: 0 }}>
                    <span style={{ fontSize: '24px', marginRight: '15px' }}>♞</span>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#888', opacity: isSidebarHovered ? 1 : 0, transition: 'opacity 0.2s', whiteSpace: 'nowrap' }}>{t.menu}</span>
                </div>
                {sideMenuItems.map((item) => (
                    <div key={item.label} onClick={() => {
                        if (item.label === t.community) { setShowCommunityChat(prev => !prev); setTimeout(() => document.getElementById('community-input')?.focus(), 100); }
                        else if (item.label === t.coach) { window.open('https://www.chess.com/play/coach', '_blank', 'noopener,noreferrer'); }
                        else if (item.label === t.gamesPlayed) { setShowGamesPlayed(true); fetchGamesHistory(); }
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
                                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{t.balance}: ${parseFloat(stats.balance || 0).toFixed(2)}</span>
                                <button onClick={handleAddFundsClick} style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#f59e0b', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{t.addFunds}</button>
                                <button onClick={handleWithdrawClick} style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>{t.withdraw}</button>
                                <span style={{ fontSize: '14px', whiteSpace: 'nowrap', display: isMobile ? 'none' : 'inline' }}>{t.loggedIn}: <b style={{ color: '#38bdf8' }}>{userEmail.split('@')[0]}</b></span>
                                <button onClick={handleLogoutClick} style={{ fontSize: '13px', padding: '6px 12px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', whiteSpace: 'nowrap' }}>{t.logout}</button>
                            </>
                        ) : (
                            <button onClick={onLoginClick} style={{ fontSize: '13px', padding: '6px 16px', cursor: 'pointer', backgroundColor: '#38bdf8', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{t.login}</button>
                        )}
                    </div>
                </header>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flexGrow: 1, padding: isMobile ? '10px' : '20px', gap: '20px', overflowX: 'hidden', overflowY: 'auto', justifyContent: isMobile ? 'flex-start' : 'center', alignItems: isMobile ? 'stretch' : 'flex-start' }}>

                    {/* 1. COMMUNITY CHAT */}
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

                    {/* 2. CHESS BOARD */}
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
                                <span>{replayInfo ? '--:--' : formatTime(whiteTime)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 10px', borderRadius: '4px', backgroundColor: displayGame.turn() === 'b' ? '#38bdf8' : '#333', color: displayGame.turn() === 'b' ? '#000' : '#fff', flex: 1, overflow: 'hidden' }}>
                                <span style={{ fontSize: isMobile ? '14px' : '18px' }}>⬛</span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1 }}>{blackPlayerName}</span>
                                <span>{replayInfo ? '--:--' : formatTime(blackTime)}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '14px', marginBottom: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{currentStatusText}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', border: '4px solid #2c2c2c', borderRadius: '4px', width: '100%', maxWidth: '100%' }}>{board}</div>
                    </div>

                    {/* 3. MOVE HISTORY (Extracted and Placed Next To Board) */}
                    <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: isMobile ? '100%' : '180px', flexShrink: 0, height: isMobile ? '300px' : 'auto', margin: isMobile ? '0 auto' : '0', boxSizing: 'border-box' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#aaa', textAlign: 'center', textTransform: 'uppercase' }}>{t.history}</h4>
                        <div style={{ overflowY: 'auto', flexGrow: 1, fontSize: '12px' }}>
                            {formattedHistory.map((row, i) => (
                                <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid #222', display: 'flex' }}>
                                    <span style={{ color: '#666', width: '30px' }}>{row.turn}.</span>
                                    <b style={{ color: currentMoveIndex === (i * 2) + 1 ? '#38bdf8' : 'white', flex: 1, textAlign: 'left' }}>{row.w}</b>
                                    <b style={{ color: currentMoveIndex === (i * 2) + 2 ? '#38bdf8' : 'white', flex: 1, textAlign: 'left' }}>{row.b}</b>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', backgroundColor: '#2c2c2c', padding: '5px', borderRadius: '4px' }}>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', fontSize: '18px' }} onClick={() => { setIsAutoPlaying(false); setCurrentMoveIndex(0); }}>⏪</button>
                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', fontSize: '18px' }} onClick={() => { setIsAutoPlaying(false); setCurrentMoveIndex(prev => Math.max(0, prev - 1)); }}>◀️</button>

                            {/* 🔥 NEW: Play/Pause button for replays 🔥 */}
                            {replayInfo ? (
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', fontSize: '18px' }} onClick={() => setIsAutoPlaying(prev => !prev)}>
                                    {isAutoPlaying ? '⏸️' : '▶️'}
                                </button>
                            ) : (
                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', fontSize: '18px' }} onClick={() => setCurrentMoveIndex(prev => Math.min(moveHistory.length, prev + 1))}>▶️</button>
                            )}

                            <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'white', fontSize: '18px' }} onClick={() => { setIsAutoPlaying(false); setCurrentMoveIndex(moveHistory.length); }}>⏩</button>
                        </div>
                    </div>

                    {/* 4. STATS & CONTROLS */}
                    <aside style={{ width: '100%', maxWidth: isMobile ? '100%' : '260px', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: isMobile ? '0' : '5px', boxSizing: 'border-box', flexShrink: 0, margin: isMobile ? '0 auto' : '0' }}>
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
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #333' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email.split('@')[0]}</span>
                                        {u.email !== userEmail && user && (
                                            <button
                                                onClick={() => handleEmailChallenge(u.email)}
                                                style={{ fontSize: '9px', cursor: 'pointer', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: '3px', padding: '2px 5px', whiteSpace: 'nowrap' }}
                                            >
                                                {t.emailChallenge}
                                            </button>
                                        )}
                                    </div>
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
                    </aside>

                    {/* 5. ADS */}
                    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '220px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', flexShrink: 0, height: isMobile ? '400px' : 'auto', margin: isMobile ? '0 auto' : '0' }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>{t.travelDeals} ({travelAds.length})</div>
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
    const [language, setLanguage] = useState('EN');
    const [showAuthModal, setShowAuthModal] = useState(false);

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