import React from 'react';

interface DashaPeriod {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
}

interface DashaDisplayProps {
    dashas?: DashaPeriod[];
}

export default function DashaDisplay({ dashas }: DashaDisplayProps) {
    if (!dashas || dashas.length === 0) return null;

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dasha-container">
            <h3 className="section-title">Vimsottari Dasha Timeline</h3>
            <p className="subtitle">Your soul&apos;s planetary schedule</p>

            <div className="timeline">
                {dashas.map((dasha, idx) => (
                    <div
                        key={idx}
                        className={`dasha-card ${dasha.isCurrent ? 'current' : ''}`}
                    >
                        <div className="dasha-header">
                            <span className="planet-name">{dasha.lord}</span>
                            {dasha.isCurrent && <span className="current-badge">Running Now</span>}
                        </div>
                        <div className="dasha-dates">
                            {formatDate(dasha.start)} — {formatDate(dasha.end)}
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .dasha-container {
                    margin-top: 40px;
                    padding: 24px;
                    background: var(--card-bg); /* Keeping it subtle */
                    border-radius: 16px;
                    border: 1px solid var(--card-border);
                }

                .section-title {
                    color: var(--primary);
                    font-family: var(--font-heading);
                    font-size: 1.5rem;
                    text-align: center;
                    margin-bottom: 8px;
                }

                .subtitle {
                    text-align: center;
                    color: var(--secondary);
                    font-size: 0.95rem;
                    margin-bottom: 24px;
                }

                .timeline {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 16px;
                }

                .dasha-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--card-border);
                    padding: 16px;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .dasha-card:hover {
                    background: rgba(212, 175, 55, 0.05); /* Gold tint on hover */
                    border-color: var(--accent-gold);
                }

                .dasha-card.current {
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid var(--accent-gold);
                    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
                }

                .dasha-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .planet-name {
                    font-weight: 700;
                    font-size: 1.1rem;
                    color: var(--accent-gold);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .current-badge {
                    background: var(--accent-gold);
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 50px;
                }

                .dasha-dates {
                    font-size: 0.9rem;
                    color: var(--foreground);
                    opacity: 0.9;
                    font-family: monospace; /* Gives a technical chart feel */
                }
            `}</style>
        </div>
    );
}
