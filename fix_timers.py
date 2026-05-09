import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The timers row
timers_row = """                        <div className="timers-row">
                            <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                            <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                        </div>"""

# Remove from col-board
content = content.replace(timers_row.replace('\n', '\r\n'), '')
content = content.replace(timers_row, '')

# Add to Header
old_header = """            {/* --- TOP HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', flexShrink: 0 }}>
                <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '18px' }}>♟️ ChessApp</div>"""
new_header = """            {/* --- TOP HEADER --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', flexShrink: 0 }}>
                <div style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '18px' }}>♟️ ChessApp</div>
                <div className="timers-row" style={{ margin: 0 }}>
                    <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                    <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                </div>"""

content = content.replace(old_header.replace('\n', '\r\n'), new_header.replace('\n', '\r\n'))
content = content.replace(old_header, new_header)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)
