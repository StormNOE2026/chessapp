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
// 🔐 AUTH SCREEN
// ==========================================
function AuthScreen({ onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        let { data, error } = isLogin
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) alert(error.message);
        else if (data?.user) onAuthSuccess(data.user);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'Segoe UI' }}>
            <div style={{ backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '8px', width: '320px', border: '1px solid #333' }}>
                <h2 style={{ textAlign: 'center', color: '#38bdf8' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px' }} />
                    <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px', backgroundColor: '#2c2c2c', color: 'white', border: '1px solid #444', borderRadius: '4px' }} />
                    <button disabled={loading} type="submit" style={{ padding: '12px', backgroundColor: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>{loading ? '...' : (isLogin ? 'Log In' : 'Sign Up')}</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
                    <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#38bdf8', cursor: 'pointer', textDecoration: 'underline' }}>{isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}</span>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// ⚛️ CHESS GAME COMPONENT
// ==========================================
function ChessGame({ user, onLogout }) {
    const userEmail = user.email;
    const [moveHistory, setMoveHistory] = useState([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [moveFrom, setMoveFrom] = useState('');

    const [status, setStatus] = useState("Waiting to start...");
    const [isPlayingComputer, setIsPlayingComputer] = useState(false);
    const [challengeTime, setChallengeTime] = useState(600); // ✨ ADDED: Default 10 mins (600s)

    const [explosionSquare, setExplosionSquare] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [tvGames, setTvGames] = useState([]);

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

    const [whiteTime, setWhiteTime] = useState(300);
    const [blackTime, setBlackTime] = useState(300);

    const timerRef = useRef(null);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [isGameOverManually, setIsGameOverManually] = useState(false);

    const [gunshotEnabled, setGunshotEnabled] = useState(true);
    const gunshotEnabledRef = useRef(gunshotEnabled);

    // Sync the ref with the state so socket events always have the freshest value
    useEffect(() => {
        gunshotEnabledRef.current = gunshotEnabled;
    }, [gunshotEnabled]);

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

    const displayGame = new Chess();
    moveHistory.slice(0, currentMoveIndex).forEach(m => { try { displayGame.move(m); } catch (e) { } });

    // COMBINED INITIAL FETCH
    useEffect(() => {
        fetchUserStats();
        fetchAllMembers();
        fetchTvGames();
        fetchChessComTv();
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

    // FETCH CHESS.COM TV
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
        if (gunshotEnabledRef.current) {
            new Audio('/shotgun.mp3').play().catch(() => { });
        }
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

    // ✨ UPDATED: Accept dynamic timeControl
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
                // ✨ UPDATED: Store object with email and time
                if (payload.targetEmail === userEmail) setIncomingChallenge({ email: payload.challengerEmail, timeControl: payload.timeControl });
            })
            .on('broadcast', { event: 'accept' }, ({ payload }) => {
                if (payload.challengerEmail === userEmail) {
                    setOpponent(payload.targetEmail);
                    setIsPlayingComputer(false);
                    setPlayerColor('w');
                    resetMatch(payload.timeControl); // ✨ UPDATED: Reset match with accepted time
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
                if (s === 'SUBSCRIBED') await channel.track({ email: userEmail, socketId: Math.random().toString(36).substring(7) });
            });

        return () => { supabase.removeChannel(channel); };
    }, [userEmail, isGameOverManually]);

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

    // Check for Checkmate/Draw
    useEffect(() => {
        if (displayGame.isCheckmate()) {
            const loserColor = displayGame.turn();
            const outcome = playerColor === loserColor ? "You Lose!" : "You Win!";
            const msg = `Checkmate! ${outcome}`;
            setStatus(msg);
            if (!isGameOverManually) {
                setIsGameOverManually(true);
                speak(msg);
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
            setStatus(displayGame.turn() === playerColor ? "🟢 Your turn" : "🔴 Waiting...");
        }
    }, [moveHistory, playerColor, isGameOverManually, opponent, isPlayingComputer]);

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
        // ✨ UPDATED: Pass the time control payload
        await lobbyChannel.send({ type: 'broadcast', event: 'challenge', payload: { challengerEmail: userEmail, targetEmail, timeControl: challengeTime } });
    };

    const handleAcceptChallenge = async () => {
        if (!lobbyChannel || !incomingChallenge) return;
        // ✨ UPDATED: Send timeControl back so both clients sync
        await lobbyChannel.send({ type: 'broadcast', event: 'accept', payload: { challengerEmail: incomingChallenge.email, targetEmail: userEmail, timeControl: incomingChallenge.timeControl } });
        setOpponent(incomingChallenge.email);
        setIsPlayingComputer(false);
        setPlayerColor('b');
        resetMatch(incomingChallenge.timeControl); // ✨ UPDATED: Use proposed time
        setIncomingChallenge(null);
    };

    const handleDeclineChallenge = () => {
        if (lobbyChannel && incomingChallenge) {
            // ✨ UPDATED: Read from object .email
            lobbyChannel.send({ type: 'broadcast', event: 'declineChallenge', payload: { targetEmail: incomingChallenge.email, declinerEmail: userEmail } });
        }
        setIncomingChallenge(null);
    };

    const handleResign = () => {
        if (isGameOverManually || !opponent) return;
        if (window.confirm("Are you sure you want to resign?")) {
            setIsGameOverManually(true);
            const msg = "You resigned. You Lose!";
            setStatus(msg);
            speak(msg);
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

    // AI Logic
    useEffect(() => {
        if (!isPlayingComputer || displayGame.isGameOver() || isGameOverManually || opponent || currentMoveIndex < moveHistory.length) return;
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
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually, isPlayingComputer]);

    // ✨ UPDATED: Robust formatTime for longer durations (Days, Hours)
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
            board.push(
                <div key={square} onClick={() => onSquareClick(square)} style={{ position: 'relative', width: '70px', height: '70px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', backgroundColor: isSelected ? '#f6f669' : ((row + col) % 2 === 0 ? '#5c7fb8' : '#ffffff') }}>
                    {piece && <img src={pieceImages[piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()]} alt="" style={{ width: '90%', pointerEvents: 'none' }} />}
                    {explosionSquare === square && <div className="star-wars-blast"></div>}
                </div>
            );
        });
    });

    return (
        <div style={{ backgroundColor: '#121212', color: 'white', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI', overflowX: 'hidden' }}>
            <header style={{ height: '60px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <h2 style={{ color: '#38bdf8', margin: 0, fontSize: '20px' }}>ChessOnline</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '14px' }}>Logged in: <b style={{ color: '#38bdf8' }}>{userEmail}</b></span>
                    <button onClick={onLogout} style={{ fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
                </div>
            </header>

            {/* MAIN LAYOUT WRAPPER */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', gap: '30px', overflowX: 'auto', flexGrow: 1 }}>

                {/* 1. LEFT: CHESS BOARD & TIMERS */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '560px' }}>
                    {incomingChallenge && (
                        <div style={{ backgroundColor: '#fbbf24', padding: '15px', borderRadius: '8px', marginBottom: '10px', color: '#121212', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {/* ✨ UPDATED: Display time block and read email from object */}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', fontSize: '20px', fontWeight: 'bold' }}>
                        <div style={{ padding: '5px 15px', borderRadius: '4px', backgroundColor: displayGame.turn() === 'w' ? '#38bdf8' : '#333' }}>⬜ {formatTime(whiteTime)}</div>
                        <div style={{ padding: '5px 15px', borderRadius: '4px', backgroundColor: displayGame.turn() === 'b' ? '#38bdf8' : '#333' }}>⬛ {formatTime(blackTime)}</div>
                    </div>
                    <div style={{ fontSize: '16px', marginBottom: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{status}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 70px)', border: '6px solid #2c2c2c', borderRadius: '4px' }}>{board}</div>
                </div>

                {/* 2. MIDDLE: STATS, CHAT, HISTORY, & DROPDOWN VIEW */}
                <aside style={{ minWidth: '350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', textAlign: 'center' }}>
                            <div><div style={{ color: '#10b981', fontSize: '10px' }}>WON</div><div style={{ fontSize: '18px' }}>{stats.wins}</div></div>
                            <div><div style={{ color: '#ef4444', fontSize: '10px' }}>LOSS</div><div style={{ fontSize: '18px' }}>{stats.losses}</div></div>
                            <div><div style={{ color: '#aaa', fontSize: '10px' }}>DRAW</div><div style={{ fontSize: '18px' }}>{stats.draws}</div></div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ color: viewMode === 'tv' ? '#fbbf24' : (viewMode === 'chesscom' ? '#10b981' : '#38bdf8'), margin: 0, fontSize: '12px', textTransform: 'uppercase' }}>
                                {viewMode === 'tv' ? 'Lichess TV (LIVE)' : (viewMode === 'chesscom' ? 'Chess.com Streamers' : (viewMode === 'online' ? 'ONLINE' : 'ALL MEMBERS'))}
                            </h4>
                            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '10px', padding: '4px', outline: 'none', cursor: 'pointer' }}>
                                <option value="online">Online</option>
                                <option value="all">All Members</option>
                                <option value="tv">Lichess TV</option>
                                <option value="chesscom">Chess.com TV</option>
                            </select>
                        </div>

                        <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {/* ✨ ADDED: Time Control Selector before online users */}
                            {viewMode === 'online' && (
                                <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '10px', color: '#aaa', fontWeight: 'bold' }}>CHALLENGE TIME:</span>
                                    <select value={challengeTime} onChange={(e) => setChallengeTime(Number(e.target.value))} style={{ backgroundColor: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', fontSize: '11px', padding: '4px', outline: 'none', cursor: 'pointer' }}>
                                        <option value={600}>10 Mins</option>
                                        <option value={86400}>1 Day</option>
                                        <option value={259200}>3 Days</option>
                                    </select>
                                </div>
                            )}

                            {viewMode === 'online' && onlineUsers.map((u, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                    <span>{u.email.split('@')[0]}</span>
                                    {u.email !== userEmail && <button onClick={() => handleSendChallenge(u.email)} style={{ fontSize: '9px', cursor: 'pointer', backgroundColor: '#38bdf8', color: '#000', border: 'none', borderRadius: '3px', padding: '2px 5px' }}>Challenge</button>}
                                </div>
                            ))}
                            {viewMode === 'all' && allMembers.map((u, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                                    <span>{u.email.split('@')[0]}</span>
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
                                    <div>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>{streamer.username}</div>
                                        <div style={{ fontSize: '10px', color: '#aaa' }}>Live on Twitch 📺</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '220px' }}>
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
                            <input disabled={!opponent} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={opponent ? "Type message..." : "Chat locked"} style={{ flexGrow: 1, padding: '10px', backgroundColor: 'transparent', color: 'white', border: 'none', outline: 'none' }} />
                            <button type="submit" style={{ backgroundColor: '#38bdf8', border: 'none', color: 'black', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}>Send</button>
                        </form>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => lobbyChannel.send({ type: 'broadcast', event: 'drawOffer', payload: { targetEmail: opponent } })} disabled={!opponent || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer' }}>🤝 Draw</button>
                        <button onClick={handleResign} disabled={!opponent || isGameOverManually} style={{ flex: 1, padding: '8px', backgroundColor: '#333', cursor: 'pointer' }}>🏳️ Resign</button>
                    </div>

                    {/* ✨ UPDATED: Pass 300 to resetMatch for computer games default */}
                    <button onClick={() => { setOpponent(null); setIsPlayingComputer(true); resetMatch(300); setStatus("Playing Computer"); }} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Play Computer</button>

                    <button
                        onClick={() => setGunshotEnabled(!gunshotEnabled)}
                        style={{ width: '100%', padding: '10px', backgroundColor: gunshotEnabled ? '#f97316' : '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {gunshotEnabled ? 'Turn off gunshot' : 'Turn on gunshot'}
                    </button>

                    <div style={{ backgroundColor: '#1e1e1e', padding: '12px', borderRadius: '8px', border: '1px solid #333', flexGrow: 1, display: 'flex', flexDirection: 'column', maxHeight: '180px' }}>
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
                            <button onClick={() => setCurrentMoveIndex(0)}>⏪</button>
                            <button onClick={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))}>◀️</button>
                            <button onClick={() => setCurrentMoveIndex(prev => Math.min(moveHistory.length, prev + 1))}>▶️</button>
                            <button onClick={() => setCurrentMoveIndex(moveHistory.length)}>⏩</button>
                        </div>
                    </div>
                </aside>

                {/* 3. RIGHT: 50 TRAVEL ADS COLUMN */}
                <div style={{ minWidth: '320px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '14px', color: '#10b981', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', zIndex: 10 }}>
                        ✈️ TRAVEL DEALS (50)
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
                        {travelAds.map(ad => (
                            <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                <img src={ad.img} alt="Travel Destination" loading="lazy" style={{ width: '100%', height: '150px', objectFit: 'cover', backgroundColor: '#444' }} />
                                <div style={{ padding: '12px' }}>
                                    <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>{ad.tag}</div>
                                    <div style={{ fontSize: '16px', color: 'white', fontWeight: '600' }}>{ad.name}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

            </div>

            <footer style={{ textAlign: 'center', padding: '15px', color: '#888', fontSize: '14px', borderTop: '1px solid #333', backgroundColor: '#1e1e1e', marginTop: 'auto' }}>
                NoirSoft Creation {new Date().getFullYear()}
            </footer>

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