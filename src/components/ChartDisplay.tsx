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
    const [activeHouse, setActiveHouse] = useState<number | null>(1);

    // If no data, use mock for preview or return null
    const planets = data?.planets || {};
    const ascendant = data?.ascendant || 120; // Default Leo for mock
    const lagnaSign = Math.floor(ascendant / 30) + 1;

    const houseCenters = [
        { x: 200, y: 100 }, { x: 100, y: 50 }, { x: 50, y: 100 },
        { x: 100, y: 200 }, { x: 50, y: 300 }, { x: 100, y: 350 },
        { x: 200, y: 300 }, { x: 300, y: 350 }, { x: 350, y: 300 },
        { x: 300, y: 200 }, { x: 350, y: 100 }, { x: 300, y: 50 },
    ];

    const getHouseSign = (houseIndex: number) => {
        const sign = (lagnaSign + houseIndex) % 12;
        return sign === 0 ? 12 : sign;
    };

    const planetsInHouses: Record<number, string[]> = {};
    Object.values(planets).forEach((p: any) => {
        const diff = (p.longitude - ascendant + 360) % 360;
        const house = Math.floor(diff / 30) + 1;
        if (!planetsInHouses[house]) planetsInHouses[house] = [];
        planetsInHouses[house].push(p.name.substring(0, 3));
    });

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', background: 'transparent' }}>
                    <rect x="2" y="2" width="396" height="396" fill="rgba(255,255,255,0.02)" stroke="var(--gold)" strokeWidth="1" />
                    <line x1="0" y1="0" x2="400" y2="400" stroke="var(--gold)" strokeWidth="0.5" opacity="0.3" />
                    <line x1="400" y1="0" x2="0" y2="400" stroke="var(--gold)" strokeWidth="0.5" opacity="0.3" />
                    <line x1="200" y1="0" x2="0" y2="200" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
                    <line x1="0" y1="200" x2="200" y2="400" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
                    <line x1="200" y1="400" x2="400" y2="200" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />
                    <line x1="400" y1="200" x2="200" y2="0" stroke="var(--gold)" strokeWidth="0.5" opacity="0.4" />

                    {houseCenters.map((center, i) => {
                        const houseNum = i + 1;
                        const signNum = getHouseSign(i);
                        const housePlanets = planetsInHouses[houseNum] || [];
                        const isActive = activeHouse === houseNum;

                        return (
                            <g
                                key={i}
                                onClick={() => setActiveHouse(houseNum)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Transparent target area for easier clicking */}
                                <circle cx={center.x} cy={center.y} r="40" fill="transparent" />

                                {isActive && (
                                    <circle cx={center.x} cy={center.y} r="45" fill="rgba(212, 175, 55, 0.05)" stroke="var(--gold)" strokeWidth="0.5" strokeDasharray="4 2" />
                                )}

                                <text x={center.x} y={center.y - 15} textAnchor="middle" fontSize="11" fill="var(--gold)" opacity={isActive ? 1 : 0.6}>
                                    {signNum}
                                </text>

                                {housePlanets.map((name, pIdx) => (
                                    <text
                                        key={pIdx}
                                        x={center.x}
                                        y={center.y + (pIdx * 16)}
                                        textAnchor="middle"
                                        fontSize="13"
                                        fill={isActive ? "var(--accent-gold)" : "var(--secondary)"}
                                        fontWeight={isActive ? "600" : "400"}
                                    >
                                        {name}
                                    </text>
                                ))}
                            </g>
                        );
                    })}
                </svg>
            </div>

            {activeHouse && (
                <div style={{
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <h4 style={{ color: 'var(--accent-gold)', marginBottom: '8px', fontSize: '1rem' }}>
                        {HOUSE_THEMES[activeHouse].title}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                        {HOUSE_THEMES[activeHouse].theme}
                    </p>
                    <div style={{
                        fontSize: '0.85rem',
                        fontStyle: 'italic',
                        color: 'var(--foreground)',
                        padding: '10px',
                        borderLeft: '2px solid var(--accent-gold)',
                        background: 'rgba(212, 175, 55, 0.05)'
                    }}>
                        <strong>Awareness:</strong> {HOUSE_THEMES[activeHouse].awareness}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
