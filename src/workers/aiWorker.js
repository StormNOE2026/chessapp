import { Chess } from 'chess.js';

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

self.onmessage = function(e) {
    const { fen, depth } = e.data;
    const game = new Chess(fen);
    
    const moves = game.moves();
    if (moves.length === 0) {
        self.postMessage(null);
        return;
    }

    let bestMove = null;
    let bestValue = Infinity; // We are minimizing since AI plays Black

    for (let move of moves) {
        game.move(move);
        // We just played a move for black, so now it's white's turn (maximizing)
        const boardValue = minimax(game, depth - 1, -Infinity, Infinity, true);
        game.undo();
        
        const randomTieBreaker = Math.random() * 0.1;
        if (boardValue - randomTieBreaker < bestValue) {
            bestValue = boardValue - randomTieBreaker;
            bestMove = move;
        }
    }

    self.postMessage(bestMove || moves[0]);
};
