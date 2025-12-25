import React, { useState } from 'react';

interface PlanetPosition {
    name: string;
    longitude: number;
    latitude: number;
    distance: number;
    speed: number;
    isRetrograde: boolean;
    house?: number;
    navamsaSign?: string;
    dignity?: string;
}

interface ChartDisplayProps {
    data?: {
        planets: Record<string, PlanetPosition>;
        houses: number[];
        ascendant: number;
        navamsaAscendant?: string; // Corrected to string (sign name)
        transits?: {
            planets: Record<string, PlanetPosition>;
        };
        dashas?: any[];
    };
}

const HOUSE_THEMES: Record<number, { title: string, theme: string, awareness: string }> = {
    1: { title: '1st House: Self & Vitality', theme: 'Identity, appearance, and how you meet the world.', awareness: 'Are you mask-wearing or being authentic?' },
    2: { title: '2nd House: Values & Resource', theme: 'Personal finances, speech, and family traditions.', awareness: 'What truly nourishes your sense of stability?' },
    3: { title: '3rd House: Skill & Courage', theme: 'Communication, siblings, and self-effort.', awareness: 'Are your actions driven by curiosity or competition?' },
    4: { title: '4th House: Inner Peace', theme: 'Home, mother, emotions, and private life.', awareness: 'Where do you find refuge within yourself?' },
    5: { title: '5th House: Creative Flow', theme: 'Intelligence, children, and creative output.', awareness: 'Is your joy conditional or a natural state?' },
    6: { title: '6th House: Service & Health', theme: 'Discipline, daily work, and overcoming obstacles.', awareness: 'Are you managing difficulties or ignoring them?' },
    7: { title: '7th House: Partnership', theme: 'Marriage, business partners, and the "Other".', awareness: 'Do you see others as they are, or as you wish them to be?' },
    8: { title: '8th House: Transformation', theme: 'Longevity, intuition, and shared resources.', awareness: 'What are you resisting letting go of?' },
    9: { title: '9th House: Higher Wisdom', theme: 'Belief systems, father, and long-distance travel.', awareness: 'Whose truths are you living by?' },
    10: { title: '10th House: Action & Impact', theme: 'Public status, career, and karmic deeds.', awareness: 'Does your work reflect your integrity?' },
    11: { title: '11th House: Social Gains', theme: 'Networks, friendships, and fulfillment of desires.', awareness: 'Are you contributing to the collective or just consuming?' },
    12: { title: '12th House: Release', theme: 'Loss, solitude, subconscious, and liberation.', awareness: 'What is asking to be surrendered for your peace?' },
};

export default function ChartDisplay({ data }: ChartDisplayProps) {
    const [viewMode, setViewMode] = useState<'D1' | 'D9'>('D1');
    const [showTransits, setShowTransits] = useState(false);
    const [activeHouse, setActiveHouse] = useState<number | null>(null);

    const planets = data?.planets || {};
    const transits = data?.transits?.planets || {};

    const D1_Ascendant = data?.ascendant || 0;
    // const D9_AscendantSign = data?.navamsaAscendant || 1;

    // Calculate Signs for D1 Houses
    const D1_AscSign = Math.floor(D1_Ascendant / 30) + 1;
    const getD1HouseSign = (houseIdx: number) => {
        const sign = (D1_AscSign + houseIdx) % 12;
        return sign === 0 ? 12 : sign;
    };

    // Calculate Signs for D9 Houses
    const SIGN_MAP: Record<string, number> = {
        'Aries': 1, 'Taurus': 2, 'Gemini': 3, 'Cancer': 4,
        'Leo': 5, 'Virgo': 6, 'Libra': 7, 'Scorpio': 8,
        'Sagittarius': 9, 'Capricorn': 10, 'Aquarius': 11, 'Pisces': 12
    };

    const getSignIndex = (name: string) => SIGN_MAP[name] || 1;

    // D9 Logic
    const calcD9Sign = (deg: number) => {
        const signIdx = Math.floor(deg / 30);
        const navInSign = Math.floor((deg % 30) / 3.333333);
        const element = signIdx % 4; // 0=Fire(Aries), 1=Earth(Cap), 2=Air(Lib), 3=Water(Can)
        let start = 0;
        if (element === 0) start = 0;
        if (element === 1) start = 9;
        if (element === 2) start = 6;
        if (element === 3) start = 3;
        const final = (start + navInSign) % 12;
        return final + 1; // 1-12
    };

    const D9_AscSign = data?.navamsaAscendant
        ? getSignIndex(data.navamsaAscendant)
        : calcD9Sign(D1_Ascendant);

    const getD9HouseSign = (houseIdx: number) => {
        const sign = (D9_AscSign + houseIdx) % 12;
        return sign === 0 ? 12 : sign;
    };

    // Distribute Planets
    const planetsInHouses: Record<number, { name: string, isTransit: boolean }[]> = {};
    const houseDignities: Record<number, string[]> = {};

    // 1. Birth Planets
    Object.values(planets).forEach((p) => {
        let houseNum = 1;

        if (viewMode === 'D1') {
            const pSign = Math.floor(p.longitude / 30) + 1;
            const hIdx = (pSign - D1_AscSign + 12) % 12;
            houseNum = hIdx + 1;
        } else {
            // D9 Mode
            const pD9SignName = p.navamsaSign || 'Aries';
            const pD9SignIdx = getSignIndex(pD9SignName);
            const hIdx = (pD9SignIdx - D9_AscSign + 12) % 12;
            houseNum = hIdx + 1;
        }

        if (!planetsInHouses[houseNum]) planetsInHouses[houseNum] = [];
        planetsInHouses[houseNum].push({ name: p.name.substring(0, 2), isTransit: false });

        if (p.dignity) {
            if (!houseDignities[houseNum]) houseDignities[houseNum] = [];
            houseDignities[houseNum].push(`${p.name}: ${p.dignity}`);
        }
    });

    // 2. Transit Planets (Only if enabled and in D1 mode usually, but can work in D9 too)
    if (showTransits && viewMode === 'D1') {
        Object.values(transits).forEach((p) => {
            const pSign = Math.floor(p.longitude / 30) + 1;
            // Transit House is relative to BIRTH Ascendant (Gochar from Lagna)
            // Some traditions use Gochar from Moon (Chandra Lagna), but default is Lagna for chart overlay.
            const hIdx = (pSign - D1_AscSign + 12) % 12;
            const houseNum = hIdx + 1;

            if (!planetsInHouses[houseNum]) planetsInHouses[houseNum] = [];
            // Check if already exists to avoid clutter? No, show all.
            planetsInHouses[houseNum].push({ name: p.name.substring(0, 2), isTransit: true });
        });
    }

    const houses = [
        { num: 1, path: 'M 200,200 L 300,100 L 200,0 L 100,100 Z', textX: 200, textY: 80 },
        { num: 2, path: 'M 100,100 L 200,0 L 0,0 Z', textX: 85, textY: 35 },
        { num: 3, path: 'M 100,100 L 0,0 L 0,200 Z', textX: 30, textY: 100 },
        { num: 4, path: 'M 200,200 L 100,100 L 0,200 L 100,300 Z', textX: 100, textY: 180 },
        { num: 5, path: 'M 100,300 L 0,200 L 0,400 Z', textX: 30, textY: 300 },
        { num: 6, path: 'M 100,300 L 0,400 L 200,400 Z', textX: 85, textY: 365 },
        { num: 7, path: 'M 200,200 L 100,300 L 200,400 L 300,300 Z', textX: 200, textY: 280 },
        { num: 8, path: 'M 300,300 L 200,400 L 400,400 Z', textX: 315, textY: 365 },
        { num: 9, path: 'M 300,300 L 400,400 L 400,200 Z', textX: 370, textY: 300 },
        { num: 10, path: 'M 200,200 L 300,300 L 400,200 L 300,100 Z', textX: 300, textY: 180 },
        { num: 11, path: 'M 300,100 L 400,200 L 400,0 Z', textX: 370, textY: 100 },
        { num: 12, path: 'M 300,100 L 400,0 L 200,0 Z', textX: 315, textY: 35 },
    ];

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>

            {/* View Toggle */}
            <div className="toggle-container">
                <button
                    onClick={() => { setViewMode('D1'); setShowTransits(false); }}
                    className={`toggle-btn ${viewMode === 'D1' && !showTransits ? 'active' : ''}`}
                >
                    Rasi (D1)
                </button>
                <button
                    onClick={() => { setViewMode('D9'); setShowTransits(false); }}
                    className={`toggle-btn ${viewMode === 'D9' ? 'active' : ''}`}
                >
                    Navamsa (D9)
                </button>
                <button
                    onClick={() => { setViewMode('D1'); setShowTransits(true); }}
                    className={`toggle-btn ${showTransits ? 'active' : ''}`}
                    style={showTransits ? { background: 'var(--cyan)', color: '#000' } : {}}
                >
                    Gochar (Transits)
                </button>
            </div>

            <svg viewBox="-50 -50 500 500" style={{ width: '100%', height: 'auto', background: 'transparent', overflow: 'visible' }}>

                {/* 1. Draw Background Polygons */}
                {houses.map((house) => {
                    const isActive = activeHouse === house.num;
                    return (
                        <path
                            key={`bg-${house.num}`}
                            d={house.path}
                            fill={isActive ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.03)'}
                            stroke="none"
                            onClick={() => setActiveHouse(house.num)}
                            style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                        />
                    );
                })}

                {/* 2. Grid Lines */}
                <g pointerEvents="none" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    <rect x="1.5" y="1.5" width="397" height="397" />
                    <line x1="0" y1="0" x2="400" y2="400" />
                    <line x1="400" y1="0" x2="0" y2="400" />
                    <path d="M 200,0 L 400,200 L 200,400 L 0,200 Z" />
                </g>

                {/* 3. Text Content */}
                {houses.map((house) => {
                    // Sign depends on View Mode
                    const signNum = viewMode === 'D1' ? getD1HouseSign(house.num - 1) : getD9HouseSign(house.num - 1);

                    const housePlanets = planetsInHouses[house.num] || [];
                    const isActive = activeHouse === house.num;

                    return (
                        <g key={`text-${house.num}`} onClick={() => setActiveHouse(house.num)} style={{ cursor: 'pointer' }}>
                            <path d={house.path} fill="transparent" stroke="none" />

                            {/* House Label (Fixed) */}
                            <text
                                x={house.textX + (house.num === 1 ? 0 : (house.num >= 8 && house.num <= 12 ? 30 : -30))}
                                y={house.textY + (house.num === 1 ? -40 : (house.num >= 4 && house.num <= 9 ? 30 : -20))}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--secondary)"
                                opacity="0.7"
                                style={{ pointerEvents: 'none' }}
                            >
                                H{house.num}
                            </text>

                            {/* Sign Number */}
                            <text
                                x={house.textX}
                                y={house.textY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="20"
                                fill="var(--accent-gold)"
                                fontWeight="800"
                                style={{ pointerEvents: 'none' }}
                            >
                                {signNum}
                            </text>

                            {housePlanets.map((planetObj, idx) => (
                                <text
                                    key={idx}
                                    x={house.textX}
                                    y={house.textY + 22 + (idx * 16)}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="14"
                                    fill={planetObj.isTransit ? "var(--cyan)" : (isActive ? "var(--accent-gold)" : "var(--primary)")}
                                    fontWeight="700"
                                    style={{
                                        pointerEvents: 'none',
                                        filter: planetObj.isTransit ? 'drop-shadow(0 0 2px rgba(0,255,255,0.5))' : 'none'
                                    }}
                                >
                                    {planetObj.name}{planetObj.isTransit ? '*' : ''}
                                </text>
                            ))}
                        </g>
                    );
                })}
            </svg>

            {activeHouse && (
                <div style={{
                    marginTop: '24px',
                    padding: '24px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '16px',
                    boxShadow: 'var(--glass-shadow)',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h4 style={{ color: 'var(--accent-gold)', marginBottom: '8px', fontSize: '1.2rem', fontWeight: '700' }}>
                                {HOUSE_THEMES[activeHouse].title}
                            </h4>
                            <p style={{ fontSize: '1rem', color: 'var(--secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                                {HOUSE_THEMES[activeHouse].theme}
                            </p>
                        </div>
                        {/* Dignity Badge */}
                        {houseDignities[activeHouse] && houseDignities[activeHouse].length > 0 && (
                            <div className="flex flex-col gap-1 items-end">
                                {houseDignities[activeHouse].map((dig, i) => (
                                    <span key={i} className="px-2 py-1 rounded text-xs font-bold bg-[var(--accent-gold)] text-white">
                                        {dig}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{
                        fontSize: '0.95rem',
                        fontStyle: 'italic',
                        color: 'var(--foreground)',
                        padding: '12px 16px',
                        borderLeft: '3px solid var(--accent-gold)',
                        background: 'rgba(212, 175, 55, 0.05)',
                        borderRadius: '0 8px 8px 0'
                    }}>
                        <strong>Awareness:</strong> {HOUSE_THEMES[activeHouse].awareness}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .toggle-container {
                    display: flex;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 24px;
                    background: rgba(0,0,0,0.2);
                    padding: 4px;
                    border-radius: 50px;
                    width: max-content;
                    max-width: 100%;
                    margin-left: auto;
                    margin-right: auto;
                    border: 1px solid rgba(255,255,255,0.05);
                    flex-wrap: wrap;
                }
                
                .toggle-btn {
                    padding: 8px 24px;
                    border-radius: 40px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    background: transparent;
                    color: var(--secondary);
                    border: none;
                    transition: all 0.3s ease;
                }

                @media (max-width: 480px) {
                    .toggle-btn {
                        padding: 6px 16px;
                        font-size: 0.8rem;
                    }
                    .toggle-container {
                        border-radius: 20px;
                    }
                }
                
                .toggle-btn {
                    transition: all 0.3s ease;
                }
                
                .toggle-btn:hover {
                    color: var(--foreground);
                    background: rgba(255,255,255,0.05);
                }
                
                .toggle-btn.active {
                    background: var(--primary);
                    color: var(--background);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }
            `}</style>
        </div >
    );
}
