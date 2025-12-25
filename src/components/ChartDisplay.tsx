import React, { useState } from 'react';

interface ChartDisplayProps {
    data?: {
        planets: Record<string, any>;
        houses: number[];
        ascendant: number;
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
    const [activeHouse, setActiveHouse] = useState<number | null>(null);

    const planets = data?.planets || {};
    const ascendant = data?.ascendant || 120;
    const lagnaSign = Math.floor(ascendant / 30) + 1;

    const getHouseSign = (houseIndex: number) => {
        const sign = (lagnaSign + houseIndex) % 12;
        return sign === 0 ? 12 : sign;
    };

    const planetsInHouses: Record<number, string[]> = {};
    Object.values(planets).forEach((p: any) => {
        // Whole Sign House Logic:
        // House is based on the Sign of the planet relative to the Sign of the Lagna (Ascendant)
        // 1st House = Same Sign as Lagna
        const planetSign = Math.floor(p.longitude / 30) + 1;
        // lagnaSign is already calculated above as Math.floor(ascendant / 30) + 1

        const houseIndex = (planetSign - lagnaSign + 12) % 12; // 0 for 1st house, 1 for 2nd...
        const house = houseIndex + 1; // 1-12

        if (!planetsInHouses[house]) planetsInHouses[house] = [];
        planetsInHouses[house].push(p.name.substring(0, 3));
    });

    const houses = [
        { num: 1, path: 'M 200,200 L 300,100 L 200,0 L 100,100 Z', textX: 200, textY: 80 },
        { num: 2, path: 'M 100,100 L 200,0 L 0,0 Z', textX: 85, textY: 35 },     // TextX 100->85 (Left)
        { num: 3, path: 'M 100,100 L 0,0 L 0,200 Z', textX: 30, textY: 100 },     // TextX 35->30 (Left)
        { num: 4, path: 'M 200,200 L 100,100 L 0,200 L 100,300 Z', textX: 100, textY: 180 }, // TextY 200->180 (Up)
        { num: 5, path: 'M 100,300 L 0,200 L 0,400 Z', textX: 30, textY: 300 },   // TextX 35->30 (Left)
        { num: 6, path: 'M 100,300 L 0,400 L 200,400 Z', textX: 85, textY: 365 }, // TextX 100->85 (Left)
        { num: 7, path: 'M 200,200 L 100,300 L 200,400 L 300,300 Z', textX: 200, textY: 280 }, // TextY 320->280 (Up)
        { num: 8, path: 'M 300,300 L 200,400 L 400,400 Z', textX: 315, textY: 365 }, // TextX 300->315 (Right)
        { num: 9, path: 'M 300,300 L 400,400 L 400,200 Z', textX: 370, textY: 300 }, // TextX 365->370 (Right)
        { num: 10, path: 'M 200,200 L 300,300 L 400,200 L 300,100 Z', textX: 300, textY: 180 }, // TextY 200->180 (Up)
        { num: 11, path: 'M 300,100 L 400,200 L 400,0 Z', textX: 370, textY: 100 }, // TextX 365->370 (Right)
        { num: 12, path: 'M 300,100 L 400,0 L 200,0 Z', textX: 315, textY: 35 },   // TextX 300->315 (Right)
    ];

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <svg viewBox="-50 -50 500 500" style={{ width: '100%', height: 'auto', background: 'transparent', overflow: 'visible' }}>

                {/* 1. Draw Background Polygons (Fill only) */}
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

                {/* 2. Explicit Grid Lines (Sharp Outlines) */}
                <g pointerEvents="none" stroke="var(--accent-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                    {/* Outer Box */}
                    <rect x="1.5" y="1.5" width="397" height="397" />
                    {/* Cross Diagonals */}
                    <line x1="0" y1="0" x2="400" y2="400" />
                    <line x1="400" y1="0" x2="0" y2="400" />
                    {/* Inner Diamond (Midpoints) */}
                    <path d="M 200,0 L 400,200 L 200,400 L 0,200 Z" />
                </g>

                {/* 3. Text Content */}
                {houses.map((house) => {
                    const signNum = getHouseSign(house.num - 1);
                    const housePlanets = planetsInHouses[house.num] || [];
                    const isActive = activeHouse === house.num;

                    return (
                        <g key={`text-${house.num}`} onClick={() => setActiveHouse(house.num)} style={{ cursor: 'pointer' }}>
                            {/* Invisible hit area for text group to ensure clicks work easily */}
                            <path d={house.path} fill="transparent" stroke="none" />

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

                            {housePlanets.map((planetName, idx) => (
                                <text
                                    key={idx}
                                    x={house.textX}
                                    y={house.textY + 22 + (idx * 16)}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize="14"
                                    fill={isActive ? "var(--accent-gold)" : "var(--primary)"}
                                    fontWeight="700"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {planetName}
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
                    <h4 style={{ color: 'var(--accent-gold)', marginBottom: '8px', fontSize: '1.2rem', fontWeight: '700' }}>
                        {HOUSE_THEMES[activeHouse].title}
                    </h4>
                    <p style={{ fontSize: '1rem', color: 'var(--secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                        {HOUSE_THEMES[activeHouse].theme}
                    </p>
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
            `}</style>
        </div>
    );
}
