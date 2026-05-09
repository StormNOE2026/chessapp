import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Strip the left-sidebar and app-wrapper
jsx_start_old = """    return (
        <div className="app-wrapper">
            <div className="left-sidebar">
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
            </div>
            <div className="app-root">

            {/* --- TOP HEADER --- */}
            <header className="top-header">
                <div className="header-brand">♟️ ChessApp</div>"""

jsx_start_new = """    return (
        <div className="app-root">

            {/* --- TOP HEADER --- */}
            <header className="top-header">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                    <div className="header-brand" style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '18px' }}>♟️ ChessApp</div>
                    <div className="header-nav" style={{ display: 'flex', gap: '15px' }}>
                        {sideMenuItems.map((item, index) => (
                            <a key={index} href={item.link} style={{ color: '#ccc', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 'bold' }} className="nav-link-hover">
                                <span>{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </a>
                        ))}
                    </div>
                </div>"""

content = content.replace(jsx_start_old, jsx_start_new)

# 2. Fix the closing div
jsx_end_old = """        </div>
        </div>
        </div>
    );
}

export default function App() {"""

jsx_end_new = """        </div>
        </div>
    );
}

export default function App() {"""
content = content.replace(jsx_end_old, jsx_end_new)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('App.jsx Updated successfully.')
