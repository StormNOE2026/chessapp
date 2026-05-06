import React, { useState, useEffect, useRef } from 'react';
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
const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
function evaluateBoard(gameInstance) {
    let totalEval = 0;
    const board = gameInstance.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = pieceValues[piece.type];
                totalEval += piece.color === 'w' ? val : -val;
            }
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
    let bestMove = null;
    let bestValue = Infinity;
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
// 📐 RESPONSIVE BOARD SIZE HOOK
// ==========================================
function useBoardSize() {
    const getSize = () => {
        const w = window.innerWidth;
        if (w < 480) return Math.max(w - 16, 280);
        if (w < 768) return Math.min(w - 32, 480);
        return 560;
    };
    const [size, setSize] = React.useState(getSize);
    React.useEffect(() => {
        const fn = () => setSize(getSize());
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return size;
}

// ==========================================
// 🔐 AUTH SCREEN
// ==========================================
function AuthScreen({ onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        let { data, error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) setAuthError(error.message);
        else if (data?.user) onAuthSuccess(data.user);
    };

    return (
        <div className="auth-screen">
            <div className="auth-box">
                <div className="auth-logo">♟️</div>
                <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                {authError && <div className="auth-error">{authError}</div>}
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <input 
                        type="email" required placeholder="Email address" 
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        className="auth-input" 
                    />
                    <input 
                        type="password" required placeholder="Password" 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                        className="auth-input" 
                    />
                    <button disabled={loading} type="submit" className="auth-btn">
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
                
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="auth-toggle">
                    {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
                </button>
            </div>
        </div>
    );
}

// ==========================================
// ⚛️ CHESS GAME COMPONENT
// ==========================================
function ChessGame({ user, onLogout }) {
    const userEmail = user.email;
    const boardSize = useBoardSize();
    const squareSize = Math.floor(boardSize / 8);
    const [mobileTab, setMobileTab] = useState('board');
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moveFrom, setMoveFrom] = useState('');
    const [status, setStatus] = useState("White to move");
    const [explosionSquare, setExplosionSquare] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [tvGames, setTvGames] = useState([]);

    // ✨ ADDED: State to hold Chess.com live streamers
    const [chessComStreamers, setChessComStreamers] = useState([]);

    const [viewMode, setViewMode] = useState('online');
    const [lobbyChannel, setLobbyChannel] = useState(null);
    const [incomingChallenge, setIncomingChallenge] = useState(null);
    const [incomingDrawOffer, setIncomingDrawOffer] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);
    const [opponent, setOpponent] = useState(null);
    const [playerColor, setPlayerColor] = useState('w');
    const [whiteTime, setWhiteTime] = useState(60);
    const [blackTime, setBlackTime] = useState(60);
    const timerRef = useRef(null);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [isGameOverManually, setIsGameOverManually] = useState(false);

    const opponentRef = useRef(null);
    const gameRef = useRef(new Chess());
    const lobbyChannelRef = useRef(null);

    useEffect(() => { opponentRef.current = opponent; }, [opponent]);
    useEffect(() => { lobbyChannelRef.current = lobbyChannel; }, [lobbyChannel]);

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

    const displayGame = new Chess();
    moveHistory.slice(0, currentMoveIndex).forEach(m => { try { displayGame.move(m); } catch (e) { } });

    // COMBINED INITIAL FETCH
    useEffect(() => {
        fetchUserStats();
        fetchAllMembers();
        fetchTvGames();
        fetchChessComTv(); // ✨ ADDED: Fetch Chess.com live streamers on load
    }, []);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

    const fetchUserStats = async () => {
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setStats({ wins: data.wins, losses: data.losses, draws: data.draws });
    };

    const fetchAllMembers = async () => {
        let { data } = await supabase.from('profiles').select('email');
        if (data) setAllMembers(data);
    };

    // FETCH LICHESS TV GAMES
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

    // ✨ ADDED: Fetch Live Streamers from Chess.com
    const fetchChessComTv = async () => {
        try {
            const res = await fetch('https://api.chess.com/pub/streamers');
            if (!res.ok) throw new Error("Network response was not ok");
            const data = await res.json();

            // Filter to only include streamers who are currently live
            const liveStreamers = data.streamers.filter(s => s.is_live);
            setChessComStreamers(liveStreamers);
        } catch (e) {
            console.error("Failed to fetch Chess.com TV:", e);
        }
    };

    const playMoveSound = (move, gameInstance) => {
        let audioUrl = sounds.move;
        if (gameInstance.inCheck()) audioUrl = sounds.check;
        else if (move.captured) audioUrl = sounds.capture;
        new Audio(audioUrl).play().catch(() => { });
    };

    const triggerCaptureEffects = (square) => {
        new Audio('/shotgun.mp3').play().catch(() => { });
        setExplosionSquare(square);
        setTimeout(() => setExplosionSquare(null), 600);
    };

    const recordResult = async (type) => {
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const currentStats = data || stats;
        const updates = { ...currentStats };
        if (type === 'win') updates.wins += 1;
        if (type === 'loss') updates.losses += 1;
        if (type === 'draw') updates.draws += 1;
        await supabase.from('profiles').update(updates).eq('id', user.id);
        setStats(updates);
    };

    const resetMatch = () => {
        gameRef.current = new Chess();
        setMoveHistory([]); setCurrentMoveIndex(0); setWhiteTime(60); setBlackTime(60); setMoveFrom(''); setIsGameOverManually(false); setIncomingDrawOffer(false); setChatMessages([]);
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
                if (payload.targetEmail === userEmail) setIncomingChallenge(payload.challengerEmail);
            })
            .on('broadcast', { event: 'accept' }, ({ payload }) => {
                if (payload.challengerEmail === userEmail) {
                    setOpponent(payload.targetEmail);
                    setPlayerColor('w');
                    resetMatch();
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
                }
            })
            .on('broadcast', { event: 'resign' }, ({ payload }) => {
                if (payload.targetEmail === userEmail && !isGameOverManually) {
                    setTimeout(() => {
                        setIsGameOverManually(true);
                        const msg = "Opponent resigned. You Win!";
                        setStatus(msg);
                        speak(msg); // 🟢 SPEAK
                        recordResult('win');
                    }, 0);
                }
            })
            .on('broadcast', { event: 'drawOffer' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) setTimeout(() => setIncomingDrawOffer(true), 0);
            })
            .on('broadcast', { event: 'drawAccepted' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) {
                    setTimeout(() => {
                        setIsGameOverManually(true);
                        setStatus("Draw Accepted!");
                        speak("The game is a draw"); // 🟢 SPEAK
                        recordResult('draw');
                    }, 0);
                }
            })
            .on('broadcast', { event: 'drawDeclined' }, ({ payload }) => {
                if (payload.targetEmail === userEmail) { setTimeout(() => { setStatus("Draw offer declined."); setIncomingDrawOffer(false); }, 0); }
            })
            .subscribe(async (s) => {
                if (s === 'SUBSCRIBED') await channel.track({ email: userEmail, socketId: Math.random().toString(36).substring(7) });
            });

        return () => { supabase.removeChannel(channel); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userEmail, isGameOverManually]);

    // --- Timer Logic ---
    useEffect(() => {
        if (displayGame.isGameOver() || isGameOverManually || currentMoveIndex < moveHistory.length) {
            clearInterval(timerRef.current);
            return;
        }
        timerRef.current = setInterval(() => {
            if (displayGame.turn() === 'w') setWhiteTime(t => Math.max(0, t - 1));
            else setBlackTime(t => Math.max(0, t - 1));
        }, 1000);
        return () => clearInterval(timerRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moveHistory, currentMoveIndex, isGameOverManually]);

    // Check for Timeout
    useEffect(() => {
        if (!isGameOverManually && (whiteTime === 0 || blackTime === 0)) {
            setTimeout(() => {
                setIsGameOverManually(true);
                const winnerColor = whiteTime === 0 ? "b" : "w";
                const outcome = playerColor === winnerColor ? "You Win!" : "You Lose!";
                const msg = `Time Out! ${outcome}`;
                setStatus(msg);
                speak(msg); // 🟢 SPEAK
                recordResult(playerColor === winnerColor ? 'win' : 'loss');
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteTime, blackTime, isGameOverManually, playerColor]);

    // Check for Checkmate/Draw
    useEffect(() => {
        if (displayGame.isCheckmate()) {
            setTimeout(() => {
                const loserColor = displayGame.turn();
                const outcome = playerColor === loserColor ? "You Lose!" : "You Win!";
                const msg = `Checkmate! ${outcome}`;
                setStatus(msg);
                if (!isGameOverManually) {
                    setIsGameOverManually(true);
                    speak(msg); // 🟢 SPEAK
                    recordResult(playerColor === loserColor ? 'loss' : 'win');
                }
            }, 0);
        } else if (displayGame.isDraw()) {
            setTimeout(() => {
                const msg = "The game is a Draw!";
                setStatus(msg);
                if (!isGameOverManually) {
                    setIsGameOverManually(true);
                    speak(msg); // 🟢 SPEAK
                    recordResult('draw');
                }
            }, 0);
        } else if (!isGameOverManually) {
            setTimeout(() => {
                setStatus(displayGame.turn() === playerColor ? "🟢 Your turn" : "🔴 Waiting...");
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moveHistory, playerColor, isGameOverManually]);

    // --- ACTIONS ---
    const sendChatMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !opponent) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'chat', payload: { targetEmail: opponent, senderEmail: userEmail, text: chatInput } });
        setChatMessages(prev => [...prev, { text: chatInput, sender: userEmail }]);
        setChatInput('');
    };

    const handleSendChallenge = async (targetEmail) => {
        if (!lobbyChannel) return;
        setStatus(`Challenge sent...`);
        await lobbyChannel.send({ type: 'broadcast', event: 'challenge', payload: { challengerEmail: userEmail, targetEmail } });
    };

    const handleAcceptChallenge = async () => {
        if (!lobbyChannel || !incomingChallenge) return;
        await lobbyChannel.send({ type: 'broadcast', event: 'accept', payload: { challengerEmail: incomingChallenge, targetEmail: userEmail } });
        setOpponent(incomingChallenge);
        setPlayerColor('b');
        setIncomingChallenge(null);
        resetMatch();
    };

    const handleDeclineChallenge = () => {
        if (lobbyChannel && incomingChallenge) {
            lobbyChannel.send({ type: 'broadcast', event: 'declineChallenge', payload: { targetEmail: incomingChallenge, declinerEmail: userEmail } });
        }
        setIncomingChallenge(null);
    };

    const handleResign = () => {
        if (isGameOverManually || !opponent) return;
        if (window.confirm("Are you sure you want to resign?")) {
            setIsGameOverManually(true);
            const msg = "You resigned. You Lose!";
            setStatus(msg);
            speak(msg); // 🟢 SPEAK
            recordResult('loss');
            lobbyChannel.send({ type: 'broadcast', event: 'resign', payload: { targetEmail: opponentRef.current } });
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
        speak(msg); // 🟢 SPEAK
        recordResult('draw');
        setIncomingDrawOffer(false);
        if (opponent) lobbyChannel.send({ type: 'broadcast', event: 'drawAccepted', payload: { targetEmail: opponentRef.current } });
    };

    function onSquareClick(square) {
        if (displayGame.isGameOver() || isGameOverManually) return;
        if (currentMoveIndex < moveHistory.length) { setCurrentMoveIndex(moveHistory.length); return; }
        if (opponent && displayGame.turn() !== playerColor) return;
        if (!opponent && displayGame.turn() === 'b') return;

        const piece = displayGame.get(square);
        if (!moveFrom) { if (piece?.color === displayGame.turn()) setMoveFrom(square); return; }

        try {
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
        } catch { setMoveFrom(''); }
    }

    // AI Logic
    useEffect(() => {
        if (displayGame.isGameOver() || isGameOverManually || opponent || currentMoveIndex < moveHistory.length) return;
        if (displayGame.turn() === 'b') {
            const timer = setTimeout(() => {
                const bestMove = getBestMove(gameRef.current, 2);
                const moveData = gameRef.current.move(bestMove);
                if (moveData) {
                    playMoveSound(moveData, gameRef.current);
                    if (moveData.captured) triggerCaptureEffects(moveData.to);
                    setMoveHistory(prev => [...prev, bestMove]);
                    setCurrentMoveIndex(prev => prev + 1);
                }
            }, 600);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually]);

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const formattedHistory = [];
    for (let i = 0; i < moveHistory.length; i += 2) { formattedHistory.push({ turn: Math.floor(i / 2) + 1, w: moveHistory[i], b: moveHistory[i + 1] || '' }); }

    const boardItems = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rowOrder = playerColor === 'w' ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const colOrder = playerColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    rowOrder.forEach((row) => {
        colOrder.forEach((col) => {
            const square = `${files[col]}${row + 1}`;
            const piece = displayGame.get(square);
            boardItems.push({ key: square, piece });
        });
    });

    return (
        <div className="app-root">
            <header className="app-header">
                <h1 className="app-header-logo">♟️ ChessApp</h1>
                <div className="app-header-user">
                    <span className="app-header-email-label">Logged in:</span>
                    <span className="app-header-email">{userEmail}</span>
                    <button onClick={onLogout} className="logout-btn">Logout</button>
                </div>
            </header>

            <div className="notification-bar">
                {incomingChallenge && (
                    <div className="challenge-banner">
                        <span>⚔️ {incomingChallenge.split('@')[0]} challenged you!</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button onClick={handleAcceptChallenge} className="banner-btn btn-accept">Accept</button>
                            <button onClick={handleDeclineChallenge} className="banner-btn btn-decline">Decline</button>
                        </div>
                    </div>
                )}
                {incomingDrawOffer && (
                    <div className="draw-banner">
                        <span>🤝 Opponent offered a Draw!</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                            <button onClick={acceptDraw} className="banner-btn btn-accept">Accept</button>
                            <button onClick={handleDeclineDraw} className="banner-btn btn-decline">Decline</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="game-layout">
                {/* 1. LEFT: CHESS BOARD & TIMERS */}
                <div className={`col-board ${mobileTab === 'board' ? 'tab-active' : ''}`}>
                    <div className="timers-row" style={{ maxWidth: `${boardSize + 8}px` }}>
                        <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                        <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                    </div>
                    <div className="status-label">{status}</div>
                    
                    <div className="chess-board" style={{ width: `${boardSize}px`, height: `${boardSize}px`, gridTemplateColumns: `repeat(8, ${squareSize}px)`, gridTemplateRows: `repeat(8, ${squareSize}px)` }}>
                        {boardItems.map((sq, i) => {
                            const isSelected = moveFrom === sq.key;
                            const r = Math.floor(i / 8);
                            const c = i % 8;
                            const isDark = (r + c) % 2 === 1; // Correct checkerboard
                            return (
                                <div 
                                    key={sq.key} 
                                    onClick={() => onSquareClick(sq.key)} 
                                    className={`square ${isDark ? 'dark' : 'light'} ${isSelected ? 'selected' : ''}`}
                                    style={{ width: `${squareSize}px`, height: `${squareSize}px` }}
                                >
                                    {sq.piece && <img src={pieceImages[sq.piece.color === 'w' ? sq.piece.type.toUpperCase() : sq.piece.type.toLowerCase()]} alt="" />}
                                    {explosionSquare === sq.key && <div className="star-wars-blast"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. MIDDLE: STATS, CHAT, HISTORY */}
                <aside className={`col-panels ${mobileTab === 'panels' ? 'tab-active' : ''}`}>
                    <div className="panel-card">
                        <div className="panel-card-body stats-row">
                            <div className="stat-item"><span className="stat-key win">WON</span><span className="stat-value">{stats.wins}</span></div>
                            <div className="stat-item"><span className="stat-key loss">LOSS</span><span className="stat-value">{stats.losses}</span></div>
                            <div className="stat-item"><span className="stat-key draw">DRAW</span><span className="stat-value">{stats.draws}</span></div>
                        </div>
                    </div>

                    <div className="panel-card">
                        <div className="panel-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                {viewMode === 'tv' ? 'Lichess TV (LIVE)' : (viewMode === 'chesscom' ? 'Chess.com Streamers' : (viewMode === 'online' ? 'ONLINE' : 'ALL MEMBERS'))}
                            </span>
                            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="view-select">
                                <option value="online">Online</option>
                                <option value="all">All Members</option>
                                <option value="tv">Lichess TV</option>
                                <option value="chesscom">Chess.com TV</option>
                            </select>
                        </div>
                        <div className="panel-card-body players-list">
                            {viewMode === 'online' && onlineUsers.map((u, i) => (
                                <div key={i} className="player-row">
                                    <span>{u.email.split('@')[0]}</span>
                                    {u.email !== userEmail && <button onClick={() => handleSendChallenge(u.email)} className="challenge-btn">Challenge</button>}
                                </div>
                            ))}
                            {viewMode === 'all' && allMembers.map((u, i) => (
                                <div key={i} className="player-row">
                                    <span>{u.email.split('@')[0]}</span>
                                </div>
                            ))}
                            {viewMode === 'tv' && tvGames.map((game, i) => (
                                <a key={i} href={game.url} target="_blank" rel="noreferrer" className="tv-card">
                                    <div className="tv-card-ch">📺 {game.channel}</div>
                                    <div className="tv-card-row"><span>⬜ {game.white}</span> <span style={{ color: '#888' }}>{game.whiteRating}</span></div>
                                    <div className="tv-card-row" style={{ marginTop: '2px' }}><span>⬛ {game.black}</span> <span style={{ color: '#888' }}>{game.blackRating}</span></div>
                                </a>
                            ))}
                            {viewMode === 'chesscom' && chessComStreamers.map((streamer, i) => (
                                <a key={i} href={streamer.twitch_url} target="_blank" rel="noreferrer" className="streamer-card">
                                    <img src={streamer.avatar} alt={streamer.username} className="streamer-avatar" />
                                    <div>
                                        <div className="streamer-name">{streamer.username}</div>
                                        <div className="streamer-sub">Live on Twitch 📺</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="panel-card chat-box">
                        <div className="panel-card-header">GAME CHAT</div>
                        <div className="chat-messages">
                            {chatMessages.map((m, i) => (
                                <div key={i} className={`chat-msg ${m.sender === userEmail ? 'mine' : 'theirs'}`}>
                                    <div className={`chat-bubble ${m.sender === userEmail ? 'mine' : 'theirs'}`}>{m.text}</div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={sendChatMessage} className="chat-form">
                            <input disabled={!opponent} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={opponent ? "Type message..." : "Chat locked"} className="chat-input" />
                            <button type="submit" className="chat-send">Send</button>
                        </form>
                    </div>

                    <div className="controls-row">
                        <button onClick={() => lobbyChannel.send({ type: 'broadcast', event: 'drawOffer', payload: { targetEmail: opponent } })} disabled={!opponent || isGameOverManually} className="ctrl-btn">🤝 Draw</button>
                        <button onClick={handleResign} disabled={!opponent || isGameOverManually} className="ctrl-btn">🏳️ Resign</button>
                    </div>

                    <button onClick={() => { setOpponent(null); resetMatch(); setStatus("Playing Computer"); }} className="play-computer-btn">Play Computer</button>

                    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '140px' }}>
                        <div className="panel-card-header">HISTORY</div>
                        <div className="panel-card-body history-list">
                            {formattedHistory.map((row, i) => (
                                <div key={i} className="history-row">
                                    <span className="history-num">{row.turn}.</span>
                                    <span className={`history-move ${currentMoveIndex === (i * 2) + 1 ? 'current' : ''}`}>{row.w}</span>
                                    <span className={`history-move ${currentMoveIndex === (i * 2) + 2 ? 'current' : ''}`}>{row.b}</span>
                                </div>
                            ))}
                        </div>
                        <div className="history-nav">
                            <button onClick={() => setCurrentMoveIndex(0)} className="nav-btn">⏪</button>
                            <button onClick={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))} className="nav-btn">◀️</button>
                            <button onClick={() => setCurrentMoveIndex(prev => Math.min(moveHistory.length, prev + 1))} className="nav-btn">▶️</button>
                            <button onClick={() => setCurrentMoveIndex(moveHistory.length)} className="nav-btn">⏩</button>
                        </div>
                    </div>
                </aside>

                {/* 3. RIGHT: 50 TRAVEL ADS COLUMN */}
                <aside className={`col-ads ${mobileTab === 'ads' ? 'tab-active' : ''}`}>
                    <div className="ads-header">✈️ TRAVEL DEALS (50)</div>
                    <div className="ads-scroll">
                        {travelAds.map(ad => (
                            <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" className="ad-card">
                                <img src={ad.img} alt="Travel Destination" loading="lazy" className="ad-img" />
                                <div className="ad-body">
                                    <div className="ad-tag">{ad.tag}</div>
                                    <div className="ad-name">{ad.name}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </aside>
            </div>

            {/* MOBILE TAB BAR */}
            <div className="mobile-tab-bar">
                <button onClick={() => setMobileTab('board')} className={`mobile-tab ${mobileTab === 'board' ? 'active' : ''}`}>
                    <span className="tab-icon">♟️</span> Board
                </button>
                <button onClick={() => setMobileTab('panels')} className={`mobile-tab ${mobileTab === 'panels' ? 'active' : ''}`}>
                    <span className="tab-icon">💬</span> Chat/Stats
                </button>
                <button onClick={() => setMobileTab('ads')} className={`mobile-tab ${mobileTab === 'ads' ? 'active' : ''}`}>
                    <span className="tab-icon">✈️</span> Travel
                </button>
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