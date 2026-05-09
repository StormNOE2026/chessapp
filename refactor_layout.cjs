const fs = require('fs');

const filePath = 'c:\\Users\\RABONY GLOBALS\\Downloads\\chessapp-main\\chessapp-main\\src\\App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace the outer root flex row and sidebar
content = content.replace(
    /<div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#121212', color: 'white', fontFamily: 'Segoe UI', overflow: 'hidden' }}>([\s\S]*?){\/\* 2\. MAIN CONTENT COLUMN \*\/}\s*<div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh', overflow: 'hidden' }}>/g,
    `<div className="app-root">

            {/* --- ALWAYS VISIBLE HEADER --- */}
            <header className="app-header">
                <div className="app-header-logo">
                    <span style={{ fontSize: '24px' }}>♞</span> ChessOnline
                </div>
                <div className="app-header-user">
                    <span className="app-header-email-label">Logged in:</span>
                    <span className="app-header-email">{userEmail}</span>
                    <button className="logout-btn" onClick={onLogout}>Logout</button>
                </div>
            </header>

            {/* --- RESPONSIVE MOBILE TABS --- */}
            <div className="mobile-tab-bar">
                <button className={\`mobile-tab \${activeTab === 'board' ? 'active' : ''}\`} onClick={() => setActiveTab('board')}>
                    <span className="tab-icon">♟️</span> Play
                </button>
                <button className={\`mobile-tab \${activeTab === 'panels' ? 'active' : ''}\`} onClick={() => setActiveTab('panels')}>
                    <span className="tab-icon">💬</span> Chat/Menu
                </button>
                <button className={\`mobile-tab \${activeTab === 'ads' ? 'active' : ''}\`} onClick={() => setActiveTab('ads')}>
                    <span className="tab-icon">✈️</span> Travel
                </button>
            </div>

            <div className="game-layout">`
);

// Remove the old header
content = content.replace(
    /{\/\* --- ALWAYS VISIBLE HEADER --- \*\/}[\s\S]*?<\/header>/g,
    ''
);

// Replace Scrollable Main Area
content = content.replace(
    /<div style={{ display: 'flex', flexGrow: 1, padding: '20px', gap: '30px', overflowX: 'auto', overflowY: 'hidden', justifyContent: 'center' }}>/g,
    ''
);

// Replace Community Chat
content = content.replace(
    /{showCommunityChat && \([\s\S]*?🌍 COMMUNITY CHAT[\s\S]*?<\/div>\s*\)}/g,
    `{/* Community chat moved to a modal or integrated into panels. For now, it is integrated into the panels column via App.css */}`
);

// Replace Column 2: Chess Board
content = content.replace(
    /{\/\* Column 2: Chess Board \(CENTER\) \*\/}\s*<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, overflowY: 'auto' }}>/g,
    `{/* Column 1: Chess Board (Left on Desktop, Main on Mobile) */}
                    <div className={\`col-board \${activeTab === 'board' ? 'tab-active' : ''}\`}>`
);

// Replace Timers
content = content.replace(
    /<div style={{ display: 'flex', justifyContent: 'space-between', width: '560px', marginBottom: '10px', fontSize: '20px', fontWeight: 'bold' }}>[\s\S]*?<\/div>/,
    `<div className="timers-row">
                            <div className={\`timer-box \${displayGame.turn() === 'w' ? 'active' : ''}\`}>⬜ {formatTime(whiteTime)}</div>
                            <div className={\`timer-box \${displayGame.turn() === 'b' ? 'active' : ''}\`}>⬛ {formatTime(blackTime)}</div>
                        </div>`
);

// Replace Board Grid Wrapper
content = content.replace(
    /{\/\* Board wrapper ensures it always stays 560x560 inside the flexbox \*\/}\s*<div style={{ display: 'grid', gridTemplateColumns: 'repeat\\(8, 70px\\)', border: '6px solid #2c2c2c', borderRadius: '4px', flexShrink: 0, width: '560px', height: '560px' }}>/g,
    `<div className="chess-board" style={{ width: '100%', maxWidth: '560px', aspectRatio: '1 / 1' }}>`
);

// Replace Column 3: Menus
content = content.replace(
    /{\/\* Column 3: Menus & Game Chat \(RIGHT OF BOARD\) \*\/}\s*<aside style={{ width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '5px' }}>/g,
    `{/* Column 2: Menus & Game Chat (Middle on Desktop) */}
                    <div className={\`col-panels \${activeTab === 'panels' ? 'tab-active' : ''}\`}>`
);

content = content.replace(/<\/aside>/g, '</div>');

// Replace Column 4: Ads
content = content.replace(
    /{\/\* Column 4: Travel Ads \(FAR RIGHT\) \*\/}\s*<div style={{ width: '220px', minWidth: '220px', backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>/g,
    `{/* Column 3: Travel Ads (Right on Desktop) */}
                    <div className={\`col-ads \${activeTab === 'ads' ? 'tab-active' : ''}\`}>`
);

// Replace status label
content = content.replace(
    /<div style={{ fontSize: '16px', marginBottom: '10px', color: '#fbbf24', fontWeight: 'bold' }}>{status}<\/div>/g,
    `<div className="status-label">{status}</div>`
);

// Replace the end tags
content = content.replace(
    /<\/div>\s*<\/div>\s*{\/\* --- ALWAYS VISIBLE FOOTER --- \*\/}[\s\S]*?<\/footer>\s*<\/div>\s*<\/div>/g,
    `            </div>
        </div>`
);

// Save
fs.writeFileSync(filePath, content, 'utf8');
console.log('Layout replaced successfully!');
