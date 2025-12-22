import React from 'react';

type PlanetPosition = {
    name: string;
    longitude: number;
    house?: number;
};

interface ChartDisplayProps {
    data?: {
        planets: Record<string, any>;
        houses: number[];
        ascendant: number;
    };
}

export default function ChartDisplay({ data }: ChartDisplayProps) {
    // If no data, use mock for preview or return null
    const planets = data?.planets || {};
    const ascendant = data?.ascendant || 120; // Default Leo for mock
    const lagnaSign = Math.floor(ascendant / 30) + 1;

    // ViewBox 0 0 400 400
    const houseCenters = [
        { x: 200, y: 100 }, // H1 (Top Diamond)
        { x: 100, y: 50 },  // H2
        { x: 50, y: 100 },  // H3
        { x: 100, y: 200 }, // H4 (Left Diamond)
        { x: 50, y: 300 },  // H5
        { x: 100, y: 350 }, // H6
        { x: 200, y: 300 }, // H7 (Bottom Diamond)
        { x: 300, y: 350 }, // H8
        { x: 350, y: 300 }, // H9
        { x: 300, y: 200 }, // H10 (Right Diamond)
        { x: 350, y: 100 }, // H11
        { x: 300, y: 50 },  // H12
    ];

    // Numbering signs for each house starting from Lagna
    const getHouseSign = (houseIndex: number) => {
        const sign = (lagnaSign + houseIndex) % 12;
        return sign === 0 ? 12 : sign;
    };

    // Group planets by house for cleaner display
    const planetsInHouses: Record<number, string[]> = {};
    Object.values(planets).forEach((p: any) => {
        // Simple house calculation if not provided: (Planet Long - Asc Long) / 30
        const diff = (p.longitude - ascendant + 360) % 360;
        const house = Math.floor(diff / 30) + 1;
        if (!planetsInHouses[house]) planetsInHouses[house] = [];
        planetsInHouses[house].push(p.name.substring(0, 3));
    });

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', background: 'transparent' }}>
                {/* Outer Frame */}
                <rect x="2" y="2" width="396" height="396" fill="rgba(255,255,255,0.05)" stroke="var(--gold)" strokeWidth="2" />

                {/* Diagonal Lines */}
                <line x1="0" y1="0" x2="400" y2="400" stroke="var(--gold)" strokeWidth="1" opacity="0.4" />
                <line x1="400" y1="0" x2="0" y2="400" stroke="var(--gold)" strokeWidth="1" opacity="0.4" />

                {/* Inner Diamond */}
                <line x1="200" y1="0" x2="0" y2="200" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />
                <line x1="0" y1="200" x2="200" y2="400" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />
                <line x1="200" y1="400" x2="400" y2="200" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />
                <line x1="400" y1="200" x2="200" y2="0" stroke="var(--gold)" strokeWidth="1" opacity="0.6" />

                {/* Draw House Signs and Planets */}
                {houseCenters.map((center, i) => {
                    const houseNum = i + 1;
                    const signNum = getHouseSign(i);
                    const housePlanets = planetsInHouses[houseNum] || [];

                    return (
                        <g key={i}>
                            {/* Sign Number */}
                            <text x={center.x} y={center.y - 15} textAnchor="middle" fontSize="12" fill="var(--gold)" opacity="0.7">
                                {signNum}
                            </text>

                            {/* Planets list */}
                            {housePlanets.map((name, pIdx) => (
                                <text
                                    key={pIdx}
                                    x={center.x}
                                    y={center.y + (pIdx * 15)}
                                    textAnchor="middle"
                                    fontSize="14"
                                    fill="var(--secondary)"
                                    fontWeight="500"
                                >
                                    {name}
                                </text>
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
