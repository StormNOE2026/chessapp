with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove timers from above board
timers_above_board_old = """                        <div className="timers-row" style={{ margin: '0 0 8px 0', justifyContent: 'center' }}>
                            <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                            <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                        </div>
                        <div className="status-label">{status}</div>"""
timers_above_board_new = """                        <div className="status-label">{status}</div>"""
content = content.replace(timers_above_board_old, timers_above_board_new)

# 2. Add timers back into header — between header-left and header-user
header_user_old = """                <div className="header-user">"""
header_user_new = """                <div className="header-timers">
                    <div className="timers-row" style={{ margin: 0 }}>
                        <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                        <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                    </div>
                </div>
                <div className="header-user">"""
content = content.replace(header_user_old, header_user_new)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('Done.')
