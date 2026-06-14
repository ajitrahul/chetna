'use client';

import { useState } from 'react';
import styles from './Term.module.css';

// Plain-English glossary used by the inline tooltip and the /glossary page (5.1, 8.1)
export const GLOSSARY: Record<string, { label: string; plain: string; example: string }> = {
    ascendant: {
        label: 'Ascendant (Lagna)',
        plain: 'How the world sees you at first glance — your social energy and default behaviour in a room.',
        example: 'An Aries Ascendant walks into meetings and takes charge, even if internally uncertain.',
    },
    moonsign: {
        label: 'Moon Sign (Rashi)',
        plain: 'Your emotional core — how you feel, what you need to feel safe, and how you react when hurt.',
        example: 'A Cancer Moon goes very quiet when hurt; it needs time and safety before opening up again.',
    },
    dasha: {
        label: 'Dasha',
        plain: 'The current life chapter you are in — each planet governs a multi-year period with its own theme.',
        example: 'Jupiter Dasha often brings growth or expansion — a new city, a new role, a shift in beliefs.',
    },
    mahadasha: {
        label: 'Mahadasha',
        plain: 'The major planetary period, lasting roughly 6–20 years.',
        example: 'Saturn Mahadasha asks for discipline, patience, and maturity — a slow-building chapter.',
    },
    antardasha: {
        label: 'Antardasha',
        plain: 'A sub-period within the major period — lasting months to a few years — adding a secondary theme.',
        example: 'Venus Antardasha within a Saturn Mahadasha can soften the heaviness with creative or relational openings.',
    },
    rahu: {
        label: 'Rahu',
        plain: 'The point of obsession, ambition, and the unfamiliar — what we chase but are not naturally comfortable with.',
        example: 'Strong Rahu in the career house often shows someone ambitious in unconventional ways.',
    },
    ketu: {
        label: 'Ketu',
        plain: 'The point of detachment, past tendencies, and inner wisdom — what comes naturally but must be released.',
        example: 'Ketu in the relationship house can show someone who emotionally withdraws without knowing why.',
    },
    transit: {
        label: 'Transit',
        plain: 'The current movement of planets through your chart — causing ripples in specific life areas.',
        example: 'When Saturn transits your 7th house, close relationships either deepen significantly or end.',
    },
    synastry: {
        label: 'Synastry',
        plain: 'How two people’s charts interact — what the relationship dynamic naturally produces.',
        example: 'Two people with conflicting Mars placements may find small disagreements escalate fast.',
    },
    nakshatra: {
        label: 'Nakshatra',
        plain: 'The specific lunar constellation your Moon or planet falls in — adds nuance beyond the basic sign.',
        example: 'Two people can both have a Scorpio Moon yet behave differently based on their Nakshatra.',
    },
    navamsa: {
        label: 'Navamsa (D9)',
        plain: 'A divisional chart that reveals the inner strength of your planets and your closest partnerships.',
        example: 'A strong Navamsa can mean someone who starts life with struggle but finishes with depth and stability.',
    },
    house: {
        label: 'House',
        plain: 'One of twelve life areas in your chart — self, money, communication, home, and so on.',
        example: 'Planets in the 10th house tend to shape your career and public reputation.',
    },
};

export default function Term({ termKey, children }: { termKey: string; children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const entry = GLOSSARY[termKey.toLowerCase()];
    if (!entry) return <>{children}</>;

    const tooltipId = `term-${termKey.toLowerCase()}`;

    return (
        <span
            className={styles.term}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen((o) => !o);
                } else if (e.key === 'Escape') {
                    setOpen(false);
                }
            }}
            tabIndex={0}
            role="button"
            aria-expanded={open}
            aria-describedby={open ? tooltipId : undefined}
        >
            {children || entry.label}
            {open && (
                <span className={styles.tooltip} role="tooltip" id={tooltipId}>
                    <strong>{entry.label}</strong>
                    <span className={styles.plain}>{entry.plain}</span>
                    <span className={styles.example}>{entry.example}</span>
                </span>
            )}
        </span>
    );
}
