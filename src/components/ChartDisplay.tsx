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
        navamsaAscendant?: string; // Legacy
    };
    isMoonChart?: boolean;
    width?: number | string;
    height?: number | string;
    language?: 'en' | 'hi';
}

const PLANET_HINDI: Record<string, string> = {
    'Sun': 'सू',
    'Moon': 'चं',
    'Mars': 'मं',
    'Mercury': 'बु',
    'Jupiter': 'गु',
    'Venus': 'शु',
    'Saturn': 'श',
    'Rahu': 'रा',
    'Ketu': 'के',
    'Ascendant': 'ल'
};

const HOUSE_THEMES: Record<number, { title: string, theme: string, awareness: string }> = {
    1: {
        title: '1st House: Self & Vitality',
        theme: 'This house represents your core identity, physical appearance, vitality, and the initial impression you make on the world. It is the lens through which you view all of life and how others first perceive you. The first house governs your body, temperament, and the natural energy you carry into every situation. A strong first house indicates robust health, confidence, and a clear sense of purpose, while challenges here may manifest as identity confusion or low vitality.',
        awareness: 'Are you truly expressing your authentic self, or are you wearing masks to please others? Consider whether your outer presentation aligns with your inner truth and values.'
    },
    2: {
        title: '2nd House: Values & Resource',
        theme: 'This house governs your relationship with material resources, personal values, speech, family wealth, and what you consider truly valuable in life. It reflects how you earn, save, and spend money, as well as the quality of your communication. The second house also indicates your self-worth and the childhood conditioning around abundance. It reveals whether you feel inherently deserving of prosperity or carry limiting beliefs about money and security.',
        awareness: 'What truly nourishes your sense of stability and security? Reflect on whether your pursuit of wealth is aligned with your deeper values or driven by fear and external expectations.'
    },
    3: {
        title: '3rd House: Skill & Courage',
        theme: 'This house represents your courage, communication skills, short journeys, siblings, neighbors, and all forms of self-initiated effort. It is the domain of your hands—your ability to create, write, perform, and take action. The third house reveals your mental curiosity, adaptability, and willingness to step outside your comfort zone. It also indicates the nature of your relationship with brothers, sisters, and your immediate community.',
        awareness: 'Are your actions driven by genuine curiosity and passion, or are you competing and comparing yourself with others? Consider whether you are taking risks from a place of courage or reacting from insecurity.'
    },
    4: {
        title: '4th House: Inner Peace',
        theme: 'This house governs your emotional foundation, relationship with your mother, your home environment, private life, and inner sense of security. It represents your roots, ancestry, land, property, and the place you retreat to for comfort. The fourth house is the deepest part of your chart, reflecting your subconscious mind and emotional well-being. A strong fourth house provides psychological stability, while challenges here can manifest as homelessness—external or internal.',
        awareness: 'Where do you find true refuge within yourself when the outer world becomes chaotic? Reflect on whether you are seeking peace externally or cultivating it from within your own heart.'
    },
    5: {
        title: '5th House: Creative Flow',
        theme: 'This house represents intelligence, creativity, children, romance, speculation, and all pursuits that bring spontaneous joy. It is the domain of your inner child, revealing how you play, create, and express your unique talents. The fifth house also governs progeny—both biological children and creative projects. It indicates whether you approach life with optimism and delight or whether duty has overshadowed your natural playfulness and inventive spirit.',
        awareness: 'Is your joy conditional on external outcomes, or is it a natural, unconditional state of being? Consider whether you are allowing yourself to create freely without judgment or attachment to results.'
    },
    6: {
        title: '6th House: Service & Health',
        theme: 'This house governs daily routines, health, work, service, employees, debts, enemies, and obstacles. It reveals how you manage challenges, serve others, and maintain your physical well-being. The sixth house is where we confront our limitations and learn the discipline required to overcome adversity. It shows your relationship with illness, conflict, and competition, as well as your capacity to turn obstacles into opportunities for growth through dedicated effort.',
        awareness: 'Are you consciously managing your difficulties and transmuting them into wisdom, or are you avoiding and suppressing them? Reflect on whether your daily habits support your health or undermine it.'
    },
    7: {
        title: '7th House: Partnership',
        theme: 'This house represents marriage, business partnerships, contracts, open enemies, and your relationship with the "Other." It is the mirror that reflects back the qualities you project onto others. The seventh house reveals the characteristics you seek in a life partner and the dynamics of all one-on-one relationships. It also governs legal agreements and public interactions. A balanced seventh house fosters mutual respect, while imbalances can lead to codependency or conflict.',
        awareness: 'Do you see others as they truly are, or are you projecting your own desires and fears onto them? Consider whether you are seeking completion in another person or honoring their independent existence.'
    },
    8: {
        title: '8th House: Transformation',
        theme: 'This house governs longevity, transformation, sudden events, inheritance, shared resources, occult knowledge, and the mysteries of life and death. It is the realm of deep psychological change, where we confront our shadows and emerge reborn. The eighth house reveals your capacity for intimacy, trust, and surrender. It also indicates financial gains through others—such as insurance, loans, or inheritances—and your relationship with the unknown and the unseen dimensions of reality.',
        awareness: 'What are you resisting letting go of that is preventing your transformation and growth? Reflect on whether you are controlling outcomes out of fear or surrendering to the natural flow of life.'
    },
    9: {
        title: '9th House: Higher Wisdom',
        theme: 'This house represents dharma, higher education, philosophy, religion, long-distance travel, teachers, and your father. It is the domain of your belief systems and your search for ultimate truth. The ninth house reveals how you expand your worldview, connect with the divine, and seek meaning beyond the material. It indicates your moral compass, spiritual practices, and the wisdom traditions that resonate with your soul. A strong ninth house brings grace, optimism, and the guidance of mentors.',
        awareness: 'Whose truths are you living by—your own or those inherited from family and culture? Consider whether your beliefs serve your evolution or limit your perception of reality.'
    },
    10: {
        title: '10th House: Action & Impact',
        theme: 'This house governs career, public reputation, authority, status, and your contributions to society. It represents the zenith of your chart—your highest potential achievement in the external world. The tenth house reveals how you are seen by the public, your relationship with power, and the legacy you leave behind. It also indicates your karma through action (Karma Yoga) and the quality of your professional reputation. A strong tenth house brings recognition and respect.',
        awareness: 'Does your work in the world reflect your deepest integrity and values, or are you pursuing status for external validation? Reflect on whether your career serves your soul\'s purpose or merely your ego.'
    },
    11: {
        title: '11th House: Social Gains',
        theme: 'This house represents friendships, social networks, aspirations, gains, income from career, elder siblings, and the fulfillment of desires. It is the domain of your hopes, dreams, and your contribution to collective causes. The eleventh house reveals the quality of your friendships and your capacity to work within groups for shared goals. It also indicates financial windfalls and the realization of long-term ambitions. A strong eleventh house brings abundance and supportive community.',
        awareness: 'Are you genuinely contributing to the collective well-being, or are you merely consuming from the network without giving back? Consider whether your desires are aligned with the greater good.'
    },
    12: {
        title: '12th House: Release',
        theme: 'This house governs loss, liberation, isolation, foreign lands, spirituality, the subconscious mind, hidden enemies, expenses, and moksha (spiritual liberation). It is the realm of surrender, where we release attachments and dissolve the ego. The twelfth house reveals your capacity for meditation, solitude, and transcendence. It also indicates expenses, confinement, and the need for retreat from worldly life. A balanced twelfth house brings spiritual wisdom and compassionate service.',
        awareness: 'What is asking to be surrendered for your ultimate peace and liberation? Reflect on whether you are clinging to the material world or allowing yourself to merge with the infinite mystery.'
    },
};

export default function ChartDisplay({ data, isMoonChart, width = '100%', height = 'auto', language: propLanguage = 'en' }: ChartDisplayProps) {
    const [activeHouse, setActiveHouse] = useState<number | null>(null);
    const [language, setLanguage] = useState<'en' | 'hi'>(propLanguage);

    const getPlanetLabel = (name: string) => {
        if (language === 'hi') return PLANET_HINDI[name] || name.substring(0, 2);
        return name.substring(0, 2);
    };

    const planets = data?.planets || {};
    const ascendant = data?.ascendant || 0;

    // Fixed Whole Sign logic: First house starts at 0 degree of the sign containing Ascendant
    const ascSignIdx = Math.floor(ascendant / 30);

    // Distribute Planets into houses
    const planetsInHouses: Record<number, { name: string, isTransit: boolean }[]> = {};
    const houseDignities: Record<number, string[]> = {};

    Object.values(planets).forEach((p) => {
        const pSignIdx = Math.floor(p.longitude / 30);
        const houseIdx = (pSignIdx - ascSignIdx + 12) % 12;
        const houseNum = houseIdx + 1;

        if (!planetsInHouses[houseNum]) planetsInHouses[houseNum] = [];
        planetsInHouses[houseNum].push({ name: p.name.substring(0, 2), isTransit: false });

        if (p.dignity) {
            if (!houseDignities[houseNum]) houseDignities[houseNum] = [];
            houseDignities[houseNum].push(`${p.name}: ${p.dignity}`);
        }
    });

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
        <div style={{ width: typeof width === 'number' ? `${width}px` : width, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
                <button
                    onClick={() => setLanguage('en')}
                    style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: language === 'en' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                        color: language === 'en' ? '#000' : 'var(--secondary)',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >EN</button>
                <button
                    onClick={() => setLanguage('hi')}
                    style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: language === 'hi' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                        color: language === 'hi' ? '#000' : 'var(--secondary)',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >हिंदी</button>
            </div>

            <svg viewBox="-50 -50 500 500" style={{ width: '100%', height: typeof height === 'number' ? `${height}px` : height, background: 'transparent', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(212, 175, 55, 0.05)" />
                        <stop offset="100%" stopColor="rgba(212, 175, 55, 0.15)" />
                    </linearGradient>
                    <linearGradient id="activeHouseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(212, 175, 55, 0.2)" />
                        <stop offset="100%" stopColor="rgba(212, 175, 55, 0.4)" />
                    </linearGradient>
                </defs>

                {/* 1. Draw Background Polygons */}
                {houses.map((house) => {
                    const isActive = activeHouse === house.num;
                    return (
                        <path
                            key={`bg-${house.num}`}
                            d={house.path}
                            fill={isActive ? 'url(#activeHouseGradient)' : 'rgba(255,255,255,0.02)'}
                            stroke="rgba(212, 175, 55, 0.1)"
                            strokeWidth="1"
                            onClick={() => setActiveHouse(house.num)}
                            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                        />
                    );
                })}

                <g pointerEvents="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8">
                    <rect x="1" y="1" width="398" height="398" />
                    <line x1="0" y1="0" x2="400" y2="400" />
                    <line x1="400" y1="0" x2="0" y2="400" />
                    <path d="M 200,0 L 400,200 L 200,400 L 0,200 Z" />
                </g>

                {/* Center Symbol */}
                <g opacity="0.15" pointerEvents="none">
                    <circle cx="200" cy="200" r="40" fill="none" stroke="var(--accent-gold)" strokeWidth="1" strokeDasharray="4 4" />
                    <text x="200" y="205" textAnchor="middle" fontSize="12" fill="var(--accent-gold)" fontWeight="bold" letterSpacing="2">CHETNA</text>
                </g>

                {/* 3. Text Content */}
                {houses.map((house) => {
                    const signNum = ((ascSignIdx + house.num - 1) % 12) + 1;
                    const housePlanets = planetsInHouses[house.num] || [];
                    const isActive = activeHouse === house.num;

                    return (
                        <g key={`text-${house.num}`} onClick={() => setActiveHouse(house.num)} style={{ cursor: 'pointer' }}>
                            <path d={house.path} fill="transparent" stroke="none" />

                            <text
                                x={house.textX + (house.num === 1 ? 0 : (house.num >= 8 && house.num <= 12 ? 30 : -30))}
                                y={house.textY + (house.num === 1 ? -40 : (house.num >= 4 && house.num <= 9 ? 30 : -20))}
                                textAnchor="middle"
                                fontSize="10"
                                fill="var(--secondary)"
                                opacity="0.6"
                                fontWeight="600"
                                style={{ pointerEvents: 'none' }}
                            >
                                H{house.num}
                            </text>

                            <text
                                x={house.textX}
                                y={house.textY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="18"
                                fill="var(--accent-gold)"
                                fontWeight="900"
                                style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 2px rgba(212, 175, 55, 0.3))' }}
                            >
                                {signNum}
                            </text>

                            {housePlanets.map((planetObj, idx) => {
                                // Calculate offset based on house shape and planet index
                                let xIdx = idx % 2;
                                let yIdx = Math.floor(idx / 2);

                                // Standard offsets for Kendra houses (1, 4, 7, 10 - Diamonds)
                                // and Non-Kendra (Triangles)
                                let posX = house.textX;
                                let posY = house.textY;

                                const isKendra = [1, 4, 7, 10].includes(house.num);

                                if (isKendra) {
                                    // Stagger around the center number
                                    const offsetX = (xIdx - 0.5) * 50;
                                    const offsetY = 25 + (yIdx * 20);
                                    posX = house.textX + offsetX;
                                    posY = house.textY + (house.num === 1 || house.num === 10 ? offsetY : (house.num === 4 || house.num === 7 ? -offsetY : offsetY));

                                    // Adjust for specific Kendra houses to keep inside boundaries
                                    if (house.num === 1) posY = house.textY + 35 + (yIdx * 18);
                                    if (house.num === 7) posY = house.textY - 35 - (yIdx * 18);
                                    if (house.num === 4) posX = house.textX - 45 - (xIdx * 10);
                                    if (house.num === 10) posX = house.textX + 45 + (xIdx * 10);
                                } else {
                                    // Triangles: Stack vertically but adjust based on triangle orientation
                                    const baseOffset = 30;
                                    const spacing = 18;

                                    if ([2, 12, 6, 8].includes(house.num)) {
                                        // Horizon triangles
                                        posY = house.textY + (house.num <= 2 || house.num === 12 ? 25 : -25) + (idx * spacing * (house.num <= 2 || house.num === 12 ? 1 : -1));
                                    } else {
                                        // Side triangles
                                        posX = house.textX + (house.num === 3 || house.num === 5 ? 40 : -40);
                                        posY = house.textY - 20 + (idx * spacing);
                                    }
                                }

                                return (
                                    <text
                                        key={idx}
                                        x={posX}
                                        y={posY}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fontSize="13"
                                        fill={isActive ? "var(--background)" : "var(--primary)"}
                                        fontWeight="700"
                                        style={{ pointerEvents: 'none', transition: 'all 0.3s ease' }}
                                    >
                                        {getPlanetLabel(planetObj.name === 'Asc' ? 'Ascendant' : Object.keys(planets).find(k => planets[k].name === planetObj.name) || planetObj.name)}
                                    </text>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>

            {activeHouse && (
                <div style={{
                    marginTop: '24px',
                    padding: '28px 32px',
                    background: 'var(--card-bg)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    animation: 'fadeIn 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(12px)'
                }}>
                    {/* Close Button */}
                    <button
                        onClick={() => setActiveHouse(null)}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(212, 175, 55, 0.3)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            color: 'var(--secondary)',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            padding: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                            e.currentTarget.style.borderColor = 'var(--accent-gold)';
                            e.currentTarget.style.color = 'var(--accent-gold)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                            e.currentTarget.style.color = 'var(--secondary)';
                        }}
                        aria-label="Close"
                    >
                        ×
                    </button>

                    {/* Educational Note */}
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        border: '1px solid rgba(212, 175, 55, 0.25)'
                    }}>
                        <p style={{
                            fontSize: '0.88rem',
                            color: 'var(--accent-gold)',
                            margin: 0,
                            lineHeight: '1.7',
                            fontStyle: 'italic'
                        }}>
                            📍 <strong>Note:</strong> House numbers (1-12) remain consistent across all divisional charts, but the zodiac signs and planets within each house change based on the chart type. Each divisional chart has a different ascendant, revealing unique insights for specific life areas.
                        </p>
                    </div>

                    <div className="house-detail-container">
                        <div style={{ flex: 1 }}>
                            <h4 style={{
                                color: 'var(--accent-gold)',
                                marginBottom: '16px',
                                fontSize: '1.4rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px'
                            }}>
                                {HOUSE_THEMES[activeHouse].title}
                            </h4>
                            <p style={{
                                fontSize: '1.05rem',
                                color: 'var(--primary)',
                                lineHeight: '1.9',
                                marginBottom: '20px',
                                textAlign: 'justify',
                                textJustify: 'inter-word'
                            }}>
                                {HOUSE_THEMES[activeHouse].theme}
                            </p>
                        </div>
                        {/* Dignity Badge */}
                        {houseDignities[activeHouse] && houseDignities[activeHouse].length > 0 && (
                            <div className="dignity-badge-group">
                                {houseDignities[activeHouse].map((dig, i) => (
                                    <span key={i} className="dignity-badge-item">
                                        {dig}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{
                        marginTop: '24px',
                        fontSize: '1rem',
                        fontStyle: 'italic',
                        color: 'var(--foreground)',
                        padding: '16px 20px',
                        borderLeft: '4px solid var(--accent-gold)',
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderRadius: '0 12px 12px 0',
                        lineHeight: '1.8',
                        textAlign: 'justify',
                        textJustify: 'inter-word'
                    }}>
                        <strong style={{ color: 'var(--accent-gold)', fontSize: '1.05rem' }}>Awareness:</strong> {HOUSE_THEMES[activeHouse].awareness}
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
                    background: var(--card-bg);
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

                .house-detail-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 16px;
                }

                .dignity-badge-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    align-items: flex-end;
                }

                .dignity-badge-item {
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: bold;
                    background: var(--accent-gold);
                    color: #000;
                    white-space: nowrap;
                }

                @media (max-width: 480px) {
                    .house-detail-container {
                        flex-direction: column;
                    }
                    .dignity-badge-group {
                        align-items: flex-start;
                        width: 100%;
                    }
                }
            `}</style>
        </div >
    );
}
