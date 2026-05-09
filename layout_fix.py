import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove timers from header
header_timers_old = """                <div className="header-timers">
                    <div className="timers-row" style={{ margin: 0 }}>
                        <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                        <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                    </div>
                </div>
                """
content = content.replace(header_timers_old, "                ")

# 2. Add timers above board in col-board
status_label_old = '                        <div className="status-label">{status}</div>'
status_label_new = """                        <div className="timers-row" style={{ margin: '0 0 8px 0', justifyContent: 'center' }}>
                            <div className={`timer-box ${displayGame.turn() === 'w' ? 'active' : ''}`}>⬜ {formatTime(whiteTime)}</div>
                            <div className={`timer-box ${displayGame.turn() === 'b' ? 'active' : ''}`}>⬛ {formatTime(blackTime)}</div>
                        </div>
                        <div className="status-label">{status}</div>"""
content = content.replace(status_label_old, status_label_new)

# 3. Move col-ads into col-panels (merge right column)
# Find the col-ads block and move its content into col-panels before closing tag
col_ads_old = """
                    {/* Column 3: Travel Ads (Right on Desktop) */}
                    <div className={`col-ads ${activeTab === 'ads' ? 'tab-active' : ''}`}>
                        <div style={{ padding: '15px', borderBottom: '1px solid #333', fontSize: '13px', color: '#10b981', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1e1e1e', borderRadius: '8px 8px 0 0', flexShrink: 0 }}>
                            ✈️ TRAVEL DEALS (50)
                        </div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
                            {travelAds.map(ad => (
                                <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                    <img src={ad.img} alt="Travel Destination" loading="lazy" style={{ width: '100%', height: '110px', objectFit: 'cover', backgroundColor: '#444' }} />
                                    <div style={{ padding: '10px' }}>
                                        <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '4px' }}>{ad.tag}</div>
                                        <div style={{ fontSize: '14px', color: 'white', fontWeight: '600' }}>{ad.name}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                            </div>"""

col_ads_new = """
                    {/* Travel Ads merged into right sidebar */}"""

content = content.replace(col_ads_old, col_ads_new)

# 4. Insert travel ads into col-panels before closing </div> of col-panels
panels_close_old = """                    </div>

                    {/* Column 1: Chess Board (Left on Desktop, Main on Mobile) */}"""
panels_close_new = """                        {/* --- TRAVEL DEALS --- */}
                        <div style={{ backgroundColor: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden', flexShrink: 0 }}>
                            <div style={{ padding: '10px 15px', fontSize: '12px', color: '#10b981', fontWeight: 'bold', borderBottom: '1px solid #333' }}>✈️ TRAVEL DEALS</div>
                            <div style={{ overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px' }}>
                                {travelAds.map(ad => (
                                    <a key={ad.id} href={ad.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#2c2c2c', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                                        <img src={ad.img} alt="Travel Destination" loading="lazy" style={{ width: '100%', height: '90px', objectFit: 'cover', backgroundColor: '#444' }} />
                                        <div style={{ padding: '8px' }}>
                                            <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '2px' }}>{ad.tag}</div>
                                            <div style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>{ad.name}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 1: Chess Board (Left on Desktop, Main on Mobile) */}"""
content = content.replace(panels_close_old, panels_close_new)

with open('src/App.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('Done.')
