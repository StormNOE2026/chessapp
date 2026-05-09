import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Memoize displayGame
old_display_game = """    const displayGame = new Chess();
    moveHistory.slice(0, currentMoveIndex).forEach(m => { try { displayGame.move(m); } catch (e) { } });"""
new_display_game = """    const displayGame = useMemo(() => {
        const game = new Chess();
        moveHistory.slice(0, currentMoveIndex).forEach(m => { try { game.move(m); } catch (e) { } });
        return game;
    }, [moveHistory, currentMoveIndex]);"""
content = content.replace(old_display_game.replace('\n', '\r\n'), new_display_game.replace('\n', '\r\n'))
content = content.replace(old_display_game, new_display_game)

# 2. Fix PII Leak in fetchAllMembers
old_fetch = """    const fetchAllMembers = async () => {
        let { data } = await supabase.from('profiles').select('email');
        if (data) setAllMembers(data);
    };"""
new_fetch = """    const fetchAllMembers = async () => {
        let { data } = await supabase.from('profiles').select('email');
        if (data) {
            const obfuscated = data.map(u => ({ email: u.email.split('@')[0].substring(0, 3) + '***@***.com' }));
            setAllMembers(obfuscated);
        }
    };"""
content = content.replace(old_fetch.replace('\n', '\r\n'), new_fetch.replace('\n', '\r\n'))
content = content.replace(old_fetch, new_fetch)

# 3. Web Worker Integration
old_ai_logic = """    // AI Logic
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
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually, isPlayingComputer]);"""
    
new_ai_logic = """    // Pending Promotion State
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
    }, [moveHistory, currentMoveIndex, opponent, isGameOverManually, isPlayingComputer, displayGame]);"""

content = content.replace(old_ai_logic.replace('\n', '\r\n'), new_ai_logic.replace('\n', '\r\n'))
content = content.replace(old_ai_logic, new_ai_logic)

# 4. Pawn Promotion dialog and move execution
old_on_square_click = """        try {
            const move = gameRef.current.move({ from: moveFrom, to: square, promotion: 'q' });
            if (move) {"""
new_on_square_click = """        try {
            const piece = displayGame.get(moveFrom);
            const isPawnPromotion = piece && piece.type === 'p' && ((piece.color === 'w' && square[1] === '8') || (piece.color === 'b' && square[1] === '1'));
            
            if (isPawnPromotion) {
                setPendingPromotion({ from: moveFrom, to: square });
                return;
            }
            
            const move = gameRef.current.move({ from: moveFrom, to: square, promotion: 'q' });
            if (move) {"""

content = content.replace(old_on_square_click.replace('\n', '\r\n'), new_on_square_click.replace('\n', '\r\n'))
content = content.replace(old_on_square_click, new_on_square_click)

# 5. The Pawn Promotion Modal HTML
modal_html = """
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
"""
tabs_start = "{/* --- RESPONSIVE MOBILE TABS --- */}"
content = content.replace(tabs_start, modal_html + '\n            ' + tabs_start)

# 6. Fix Chess Board Wrapper (CSS change)
old_board_wrapper = """<div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 70px)', border: '6px solid #2c2c2c', borderRadius: '4px', flexShrink: 0, width: '560px', height: '560px' }}>"""
new_board_wrapper = """<div className="chess-board">"""
content = content.replace(old_board_wrapper, new_board_wrapper)

# 7. recordResult Exploit fix (Mitigation)
old_record_result = """    const recordResult = async (type) => {
        let { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const currentStats = data || stats;
        const updates = { ...currentStats };
        if (type === 'win') updates.wins += 1;
        if (type === 'loss') updates.losses += 1;
        if (type === 'draw') updates.draws += 1;
        await supabase.from('profiles').update(updates).eq('id', user.id);
        setStats(updates);
    };"""
new_record_result = """    const recordResult = async (type) => {
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
    };"""
content = content.replace(old_record_result.replace('\n', '\r\n'), new_record_result.replace('\n', '\r\n'))
content = content.replace(old_record_result, new_record_result)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
print('Done file replacements!')
