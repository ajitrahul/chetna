import React from 'react';
import DashaStory from './DashaStory';

interface DashaPeriod {
    lord: string;
    start: string;
    end: string;
    isCurrent: boolean;
    antardashas?: Array<{
        lord: string;
        start: string;
        end: string;
        isCurrent: boolean;
        pratyantarDashas?: Array<{
            lord: string;
            start: string;
            end: string;
            isCurrent: boolean;
            sookshmaDashas?: Array<{
                lord: string;
                start: string;
                end: string;
                isCurrent: boolean;
                pranaDashas?: Array<{
                    lord: string;
                    start: string;
                    end: string;
                    isCurrent: boolean;
                }>;
            }>;
        }>;
    }>;
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
            <DashaStory dashas={dashas} />

            <div style={{ marginTop: '64px', borderTop: '1px dashed var(--card-border)', paddingTop: '64px' }}>
                <h3 className="section-title">Technical Timeline</h3>
                <p className="subtitle">Vimsottari Dasha detail view</p>
            </div>

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

                        {dasha.antardashas && dasha.antardashas.length > 0 && (
                            <div className="antardasha-list">
                                {dasha.isCurrent ? (
                                    dasha.antardashas.map((ad, adIdx) => (
                                        <div key={adIdx} className={`antardasha-item ${ad.isCurrent ? 'ad-current' : ''}`}>
                                            <span className="ad-lord">{ad.lord}</span>
                                            <span className="ad-dates">{formatDate(ad.start)}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="ad-mini">Includes 9 sub-periods</div>
                                )}
                            </div>
                        )}
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
                    margin-bottom: 12px;
                }

                .antardasha-list {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .antardasha-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    padding: 4px 8px;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.02);
                }

                .ad-current {
                    background: rgba(212, 175, 55, 0.2);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: var(--accent-gold);
                    font-weight: 700;
                }

                .ad-dates {
                    opacity: 0.7;
                    font-size: 0.75rem;
                }

                .ad-mini {
                    font-size: 0.75rem;
                    color: var(--secondary);
                    font-style: italic;
                    opacity: 0.6;
                }
            `}</style>
        </div>
    );
}
