import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update JSX opening structure
jsx_start_old = """    return (
        <div className="app-root">"""

jsx_start_new = """    return (
        <div className="app-wrapper">
            <div className="left-sidebar">
                <div className="sidebar-brand">♞</div>
                {sideMenuItems.map((item, index) => (
                    <div key={index} className="sidebar-item">
                        <div className="sidebar-icon">{item.icon}</div>
                        <div className="sidebar-label">{item.label}</div>
                    </div>
                ))}
            </div>
            <div className="app-root">"""
content = content.replace(jsx_start_old, jsx_start_new)

# 2. Add closing div for app-wrapper
jsx_end_old = """        </div>
        </div>
    );
}

export default function App() {"""

jsx_end_new = """        </div>
        </div>
        </div>
    );
}

export default function App() {"""
content = content.replace(jsx_end_old, jsx_end_new)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('JSX Updated successfully.')
