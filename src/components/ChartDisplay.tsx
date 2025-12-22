import React from 'react';

type PlanetPosition = {
    sign: number; // 1-12
    house: number; // 1-12, but we usually draw based on House 1 at top
    name: string;
};

// Mock data to demonstrate
const MOCK_PLANETS: PlanetPosition[] = [
    { name: 'Asc', sign: 5, house: 1 },
    { name: 'Sun', sign: 5, house: 1 },
    { name: 'Mon', sign: 8, house: 4 },
    { name: 'Jup', sign: 2, house: 10 },
    { name: 'Mar', sign: 6, house: 2 },
];

export default function ChartDisplay() {
    // SVG Logic for North Indian Chart (Diamond Style)
    // ViewBox 0 0 400 400

    // House Centers (approximate for placement)
    const houseCenters = [
        { x: 200, y: 80 },  // H1
        { x: 100, y: 40 },  // H2
        { x: 40, y: 100 },  // H3
        { x: 80, y: 200 },  // H4
        { x: 40, y: 300 },  // H5
        { x: 100, y: 360 }, // H6
        { x: 200, y: 320 }, // H7
        { x: 300, y: 360 }, // H8
        { x: 360, y: 300 }, // H9
        { x: 320, y: 200 }, // H10
        { x: 360, y: 100 }, // H11
        { x: 300, y: 40 },  // H12
    ];

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', background: 'white', borderRadius: '4px' }}>
                {/* Outer Frame */}
                <rect x="2" y="2" width="396" height="396" fill="none" stroke="var(--primary)" strokeWidth="2" opacity="0.8" />

                {/* Cross */}
                <line x1="0" y1="0" x2="400" y2="400" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />
                <line x1="400" y1="0" x2="0" y2="400" stroke="var(--primary)" strokeWidth="1" opacity="0.3" />

                {/* Diamond */}
                <line x1="200" y1="0" x2="0" y2="200" stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
                <line x1="0" y1="200" x2="200" y2="400" stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
                <line x1="200" y1="400" x2="400" y2="200" stroke="var(--primary)" strokeWidth="1" opacity="0.5" />
                <line x1="400" y1="200" x2="200" y2="0" stroke="var(--primary)" strokeWidth="1" opacity="0.5" />

                {/* Planets Display */}
                {MOCK_PLANETS.map((planet, i) => {
                    const center = houseCenters[planet.house - 1];
                    return (
                        <text
                            key={i}
                            x={center.x}
                            y={center.y + (i * 14)}
                            textAnchor="middle"
                            fontSize="14"
                            fill="var(--primary)"
                            fontWeight="600"
                            style={{ fontFamily: 'var(--font-heading)' }}
                        >
                            {planet.name}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
