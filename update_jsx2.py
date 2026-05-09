import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update sideMenuItems to include links
side_items_old = """    const sideMenuItems = [
        { icon: '👨‍🏫', label: 'Coach' },
        { icon: '👁️', label: 'Watch' },
        { icon: '📰', label: 'News' },
        { icon: '👥', label: 'Community' }
    ];"""
side_items_new = """    const sideMenuItems = [
        { icon: '👨‍🏫', label: 'Coach', link: '/coach' },
        { icon: '👁️', label: 'Watch', link: '/watch' },
        { icon: '📰', label: 'News', link: '/news' },
        { icon: '👥', label: 'Community', link: '/community' }
    ];"""
content = content.replace(side_items_old, side_items_new)

# 2. Update sidebar-brand and item rendering
sidebar_old = """            <div className="left-sidebar">
                <div className="sidebar-brand">♞</div>
                {sideMenuItems.map((item, index) => (
                    <div key={index} className="sidebar-item">
                        <div className="sidebar-icon">{item.icon}</div>
                        <div className="sidebar-label">{item.label}</div>
                    </div>
                ))}
            </div>"""
sidebar_new = """            <div className="left-sidebar">
                <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="sidebar-icon" style={{ color: '#38bdf8' }}>♟️</div>
                    <div className="sidebar-label" style={{ color: '#38bdf8', fontSize: '18px', marginLeft: '-5px' }}>ChessApp</div>
                </div>
                {sideMenuItems.map((item, index) => (
                    <a key={index} href={item.link} className="sidebar-item">
                        <div className="sidebar-icon">{item.icon}</div>
                        <div className="sidebar-label">{item.label}</div>
                    </a>
                ))}
            </div>"""
content = content.replace(sidebar_old, sidebar_new)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('App.jsx updated.')
