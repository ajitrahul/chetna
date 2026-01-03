'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BirthDataForm, { UserProfile } from '@/components/BirthDataForm';
import ChartDisplay from '@/components/ChartDisplay';
import DashaDisplay from '@/components/DashaDisplay';
import { ChartData } from '@/lib/astrology/calculator';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ArrowLeft, Lock, Info, CheckCircle, Sparkles, Zap, Loader2, Download, Clock, Compass } from 'lucide-react';
import html2canvas from 'html2canvas';

const VARGA_DEFINITIONS: Record<string, { title: string, definition: string, tips: string }> = {
    'D1': {
        title: 'D1 (Rashi Chart)',
        definition: 'The D1 chart, or Rashi chart, is the foundational birth chart in Vedic astrology, representing the physical blueprint of your life. It acts as the "root" or the main tree from which all other divisional charts grow. This chart maps the exact positions of the planets across the twelve zodiac signs at the moment you took your first breath. It governs your overall personality, physical appearance, health, and the general trajectory of your destiny. Think of it as the overview of your life\'s mission. While other charts look at specific departments like career or marriage, the D1 tells us about your core existence and your natural orientation toward the world. A strong D1 indicates a person who has the vitality and basic opportunities to navigate life successfully, regardless of the challenges presented in other areas.',
        tips: 'USE THIS CHART WHEN: You need to understand your overall life direction, physical health, or basic personality structure. HOW TO USE: Start here before analyzing any other divisional chart. Look at the strength of your Ascendant lord and the overall planetary balance to assess your general vitality and life opportunities. This is your foundation—strengthen it through aligned daily habits, physical exercise, and authentic self-expression.'
    },
    'Moon': {
        title: 'Moon Chart (Chandra)',
        definition: 'In Vedic astrology, the Moon represents the mind, your emotional landscape, and how you perceive reality. The Moon Chart (Chandra Lagna) is created by treating the sign where your Moon is placed as the first house. This chart is often considered more important than the Sun sign because it reveals your internal world—your subconscious needs, comforts, and mental peace. While the D1 chart (Rashi) tells us what will happen in your physical life, the Moon Chart tells us how you will FEEL about it. It describes your psychological resilience, your relationship with your mother, and your instinctive reactions to stress. If the Moon is well-placed, you will find emotional stability and satisfaction, even during difficult external circumstances. It is the filter through which you experience joy and pain.',
        tips: 'USE THIS CHART WHEN: You are experiencing emotional turbulence, mental confusion, or seeking to understand your subconscious patterns. HOW TO USE: Compare this chart with your D1 to see how your inner emotional world differs from your outer persona. Consult this chart when making decisions that affect your peace of mind, choosing a living environment, or understanding maternal relationships. Strengthen your Moon through meditation, nurturing routines, and emotional self-awareness.'
    },
    'D2': {
        title: 'D2 (Hora Chart)',
        definition: 'The D2 chart, known as the Hora, is the microscopic lens used to examine your relationship with wealth, resources, and family values. It divides each sign into two halves (Horas): one ruled by the Sun (Solar) and the other by the Moon (Lunar). This chart reveals whether your wealth comes from self-effort, leadership, and "hard" activities (Sun) or through family support, inheritance, social connections, and "soft" nurturance (Moon). Beyond just money, the D2 represents your speech, your upbringing, and your capacity to manage what you have earned. It shows if you are naturally inclined toward accumulation or if you are a provider for others. Understanding your D2 helps you align your financial goals with your innate capacity for abundance and stability.',
        tips: 'USE THIS CHART WHEN: You are planning financial strategies, assessing wealth potential, or understanding your family\'s financial legacy. HOW TO USE: Check if your ascendant lord here is in a Solar (Sun) or Lunar (Moon) hora to determine if your wealth comes from independent effort or collaborative/family support. Use this insight to choose career paths and investment strategies that align with your natural wealth-building tendencies.'
    },
    'D3': {
        title: 'D3 (Drekkana Chart)',
        definition: 'The D3 chart, or Drekkana, focuses on your inherent courage, willpower, and your relationship with your siblings. It divides each zodiac sign into three equal parts. In astrology, the third house represents the "arms" of the individual—your capacity to take action and initiate new projects. The D3 chart provides a deeper look into this sector, revealing if you have the mental and physical stamina to follow through on your ambitions. It also indicates the support or challenges you might face from brothers and sisters. If you are an entrepreneur or someone who relies on self-effort, the D3 is crucial for seeing if your "seed" of an idea will actually grow into a successful venture. It is the chart of the warrior within you.',
        tips: 'USE THIS CHART WHEN: Starting new ventures, evaluating your capacity for independent action, or assessing sibling dynamics. HOW TO USE: Before launching a business or creative project, check the strength of the 3rd house lord and Mars in this chart to gauge your courage and stamina. Use this chart to understand whether you should pursue solo ventures or partnerships. Strengthen areas of weakness through skill development, communication training, and building your self-confidence.'
    },
    'D4': {
        title: 'D4 (Chaturamsa Chart)',
        definition: 'The D4 chart represents your "fixed destiny" regarding property, home, and permanent happiness. While many charts look at dynamic events, the D4 looks at your roots—where you feel settled and safe. It governs real estate, vehicles, and the sense of security you derive from your mother and your homeland. This chart shows if you are destined to own your own home, if your life will involve moving frequently, or if you will find great comfort in settled physical assets. It is also the chart of "Bhagya" or general luck in the material world. A strong D4 suggests that no matter what happens in the outside world, you will always have a roof over your head and a foundation of comfort and peace to return to.',
        tips: 'USE THIS CHART WHEN: Making real estate decisions, seeking emotional security, or trying to understand your relationship with your mother and homeland. HOW TO USE: Before buying property or relocating, examine the 4th house and its lord in this chart. A strong D4 suggests favorable outcomes for property investments and domestic happiness. Use this chart to determine the best location for your home base and to cultivate inner peace through grounding practices and ancestral healing.'
    },
    'D7': {
        title: 'D7 (Saptamsa Chart)',
        definition: 'The D7 chart, or Saptamsa, is the chart of creativity, legacy, and progeny. It is primarily used to understand one\'s relationship with their children and the legacy they leave behind. This isn\'t limited to just biological children; it encompasses anything you "give birth to" in the world, such as creative projects, students, or lasting businesses. The D7 reveals the happiness, challenges, and growth you will experience through the next generation. It shows your capacity for nurturing and the specific traits of those who will follow in your footsteps. Whether you are looking for insights into fertility or the potential success of a life-long creative endeavor, the D7 provides the fine detail needed to understand your contribution to the future.',
        tips: 'USE THIS CHART WHEN: Planning to have children, launching creative projects, or seeking to understand your legacy. HOW TO USE: Examine the 5th house, Jupiter, and the ascendant lord to assess timing for parenthood or creative ventures. If considering fertility treatments or adoption, consult this chart for insights. Use it to nurture your creative intelligence and understand what lasting impact you will have on future generations through your creations or children.'
    },
    'D9': {
        title: 'D9 (Navamsa Chart)',
        definition: 'The Navamsa (D9) is considered the "fruit" of the life-tree (D1). It is arguably the most important chart after the main birth chart because it reveals your inner strength and the true disposition of your planets. While D1 shows the initial strength of your planets, D9 shows their final outcome. It is the chart of marriage and partnerships, revealing the quality of your spouse and your internal harmony. The D9 describes your "Dharma"—your true life purpose and moral fiber. Many times, a person may have a weak D1 but a very strong D9, meaning they may start life with struggles but will finish with great success and internal peace. It represents the maturity of your soul and the ultimate resolution of your karmic debts through partnership and spiritual discipline.',
        tips: 'USE THIS CHART WHEN: Assessing marriage potential, evaluating partnership quality, or seeking to understand your spiritual maturity. HOW TO USE: This is the MOST IMPORTANT chart after D1. Check the placement and strength of Venus (for women) or Jupiter (for men) here to assess spouse quality. Before marriage decisions, examine the 7th house and its lord. Use this chart to cultivate inner strength, dharma, and integrity—qualities that will sustain you through life\'s second half and in intimate relationships.'
    },
    'D10': {
        title: 'D10 (Dasamsa Chart)',
        definition: 'The D10, or Dasamsa, is the high-definition chart of your career, profession, and status in society. It provides a detailed view of how you manifest your power in the world. While the 10th house of your Rashi chart shows your general vocation, the D10 breaks it down into your specific career path, your relationship with authority figures, and the level of recognition you will achieve. It reveals if you are better suited for government work, independent business, or a service-oriented role. The D10 also indicates your public reputation—what the world thinks of you and the legacy of work you leave behind. If you are facing a career crossroads or seeking a promotion, the D10 reveals the underlying currents that are shaping your professional success and societal impact.',
        tips: 'USE THIS CHART WHEN: Making career decisions, seeking promotions, changing professions, or building your public reputation. HOW TO USE: Examine the 10th house, its lord, and the Sun to understand your career potential and ideal profession. Before accepting a job offer or starting a business, check if your D10 supports that path. Use this chart to align your professional choices with your natural talents and to build a legacy that reflects your values and brings lasting recognition.'
    },
    'D12': {
        title: 'D12 (Dwadashamsa Chart)',
        definition: 'The D12 chart provides a window into your lineage, including your parents and grandparents. It represents your genetic heritage and the deep-seated psychological patterns you have inherited from your family line. This chart is essential for understanding the quality of nurture you received in childhood and the overall well-being of your parents. It also touches upon past life influences that have shaped your current family dynamics. In Vedic astrology, we say that the sins or merits of the ancestors can manifest in our own lives; the D12 is where we see those "inherited seeds." By understanding your D12, you can begin to heal ancestral wounds and leverage the wisdom that has been passed down through generations, finding peace with your origin story.',
        tips: 'USE THIS CHART WHEN: Seeking to understand parental influences, healing family trauma, or exploring inherited patterns. HOW TO USE: Look at the condition of the Sun (father) and Moon (mother) to understand your parents\' well-being and their influence on you. Use this chart for ancestral healing work, understanding genetic predispositions to illness, and recognizing which family patterns to honor versus which to transform. This is powerful for therapy and genealogical exploration.'
    },
    'D16': {
        title: 'D16 (Shodashamsa Chart)',
        definition: 'The D16 chart focuses on "higher happiness"—the luxuries, conveyances, and material comforts that make life easy. It specifically governs vehicles (anything that carries you) and the sense of enjoyment you get from worldly pleasures. While the D4 looks at your home, the D16 looks at the quality of life you lead within that home and when you travel. It reveals if you are destined to enjoy the refinements of life, like fine art, beautiful cars, and sophisticated atmospheres. However, the D16 also has a deeper psychological layer: it shows your capacity for gratitude and contentment. A person with a strong D16 can find joy in the smallest material things, whereas a weak D16 might lead to constant dissatisfaction regardless of how much one owns.',
        tips: 'USE THIS CHART WHEN: Purchasing vehicles, evaluating your capacity for material enjoyment, or assessing your gratitude levels. HOW TO USE: Before major purchases related to comfort or travel, check the 4th house (vehicles/comforts) in this chart. A strong D16 indicates you will derive great joy from material refinements. Use this chart to cultivate gratitude practices and to understand the quality of happiness you experience from worldly pleasures. Strengthen it by appreciating what you already have.'
    },
    'D20': {
        title: 'D20 (Vimsamsa Chart)',
        definition: 'The D20, or Vimsamsa, is the chart of deep spirituality, religious devotion, and meditation. It is used to see your progress on the path of inner realization. This chart goes beyond religious rituals and looks at your personal connection with the Divine. It reveals your "Ista Devata"—your preferred form of the Divine that resonates with your soul. The D20 shows if you have the patience for long-term spiritual practices, the capacity for true devotion, and the likelihood of attaining enlightenment or higher states of consciousness. If you are someone who feels a deep inner calling for something beyond the material world, the D20 chart will reveal the obstacles and blessings you will encounter on your journey into the vast landscape of the spirit.',
        tips: 'USE THIS CHART WHEN: Beginning a spiritual path, choosing a meditation practice, or seeking your personal deity (Ista Devata). HOW TO USE: Examine the 9th house, 12th house, Jupiter, and Ketu to understand your spiritual inclinations. Use this chart to determine which spiritual practices will be most effective for you—devotional (Bhakti), knowledge-based (Jnana), or meditative (Dhyana). Consult this when selecting a guru, choosing mantras, or deepening your connection with the Divine.'
    },
    'D24': {
        title: 'D24 (Chaturvimsamsa Chart)',
        definition: 'The D24 chart is the chart of learning, specialized knowledge, and intellectual prowess. It is primarily analyzed to see one\'s academic achievements and the depth of their technical or philosophical understanding. While the 5th house of a birth chart shows intelligence, the D24 shows the application of that search for knowledge. It reveals if you will attain higher degrees, if you are inclined toward science, arts, or occult studies, and the level of mastery you will achieve in your chosen field. For students, researchers, or anyone in a knowledge-based profession, the D24 is the map of their intellectual journey. It tells us how effectively you can translate your curiosity into a structured and respected body of knowledge that serves your career and personal growth.',
        tips: 'USE THIS CHART WHEN: Choosing educational paths, pursuing higher degrees, or specializing in a field of knowledge. HOW TO USE: Before committing to advanced studies or research, check the 5th house (education), Mercury (learning), and Jupiter (wisdom) in this chart. This will reveal your natural aptitude for different subjects and the level of mastery you can achieve. Use this chart to choose your specialization wisely and to understand how effectively you can apply knowledge in service to others.'
    },
    'D27': {
        title: 'D27 (Saptavimsamsa Chart)',
        definition: 'The D27 chart represents your inherent "nature" (Bhamsha) and your general physical and mental strength. It divides each sign into twenty-seven parts, correlating with the 27 lunar mansions (Nakshatras). This chart is crucial for seeing your resilience—how much "vibration" or stress you can handle before your health or mind begins to suffer. It provides a microscopic view of your physical stamina and your instinctive temperament. While the D1 shows your overall health, the D27 shows your vitality—the life-force or "Prana" that flows through you. A strong D27 indicates a person with a robust constitution who can bounce back quickly from illness or emotional trauma. It is the chart of your inner energy dynamics and your capacity for sustained effort.',
        tips: 'USE THIS CHART WHEN: Assessing your energy levels, understanding health vulnerabilities, or evaluating your resilience to stress. HOW TO USE: Examine the overall strength of planets and houses to gauge your vitality and stamina. Use this chart before undertaking demanding physical or mental projects to see if you have the constitution to sustain the effort. Strengthen your D27 through pranayama (breathwork), proper rest, regular exercise, and energy management practices like Yoga or Qigong.'
    },
    'D30': {
        title: 'D30 (Trimsamsa Chart)',
        definition: 'The D30, or Trimsamsa, is often called the "chart of misfortunes," but it is better understood as the chart of your inner shadows and inherited vulnerabilities. It reveals the psychological weaknesses and "hidden enemies" within your own personality that might lead to external difficulties. Historically, it was used to see diseases, scandals, or calamities. In modern psychological astrology, the D30 shows the areas where we need to apply the most self-discipline and awareness. It highlights the karmic obstacles we have brought into this life to overcome. By understanding your D30, you can identify the self-sabotaging patterns that lead to trouble and proactively transform them through ethical living and conscious awareness. It is the chart of ultimate redemption through facing one\'s own darkness.',
        tips: 'USE THIS CHART WHEN: Facing repeated obstacles, experiencing self-sabotage, or seeking to understand hidden psychological weaknesses. HOW TO USE: This is a chart for shadow work and deep self-awareness. Examine the 6th, 8th, and 12th houses to identify areas of vulnerability. Use this chart in conjunction with therapy, spiritual practices, or when recovering from addiction or trauma. Do not fear what you find here—use it as a map for conscious transformation and ethical living to transcend karmic patterns.'
    }
};

const VARGA_CATEGORIES: Record<string, string[]> = {
    'Foundation': ['D1', 'D9', 'Moon'],
    'Abundance': ['D2', 'D4', 'D16'],
    'Progress': ['D3', 'D10', 'D24'],
    'Relationships': ['D7', 'D12'],
    'Spiritual': ['D20', 'D27'],
    'Shadow': ['D30']
};

const getPersonalizedInterpretation = (key: string, vargaData: any, userName: string = 'User') => {
    if (!vargaData) return "Analysis pending...";
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const ascSign = signs[Math.floor(vargaData.ascendant / 30)];
    const firstName = (userName || 'User').split(' ')[0];

    const getTraits = (sign: string) => {
        const traits: Record<string, string> = {
            'Aries': 'Your approach is defined by initiative, a pioneering spirit, and a natural courage that thrives on new beginnings. You have the heart of a leader who isn\'t afraid to take the first step, though you may sometimes act purely on impulse.',
            'Taurus': 'You bring a sense of stability, patience, and a deep appreciation for material security and reliable systems. You are the "anchor" who ensures that ideas aren\'t just started, but are built to last through steady, focused effort.',
            'Gemini': 'Communication, curiosity, and adaptability are your primary tools. You have an agile mind that loves to connect dots and share information with others, though you might find it challenging to focus on just one thing for too long.',
            'Cancer': 'Your nature is deeply nurturing, intuitive, and sensitive to the emotional undercurrents of your environment. You prioritize safety and belonging, often making decisions based on your gut feelings and a desire to protect what you love.',
            'Leo': 'You express yourself with warmth, creativity, and a natural charisma that draws others toward you. You have a strong sense of self and a desire to be recognized for your unique contributions, often shining brightest when you are in a position of authority.',
            'Virgo': 'Precision, discernment, and a strong drive to be of service define your approach. You have a keen eye for detail and a natural ability to organize chaos into order, searching for perfection in everything you touch.',
            'Libra': 'Balance, harmony, and a deep appreciation for partnership are your guiding stars. You have a natural charm and a diplomatic mind that seeks to create win-win situations, though you may struggle with indecision when trying to please everyone.',
            'Scorpio': 'Intensity, depth, and a powerful drive for transformation characterize your energy. You aren\'t satisfied with surface-level explanations and have an innate ability to see through deception, often undergoing significant personal "rebirths" throughout life.',
            'Sagittarius': 'Optimism, a love for freedom, and a search for higher truth fuel your journey. You are a natural philosopher and explorer who seeks to expand your horizons, always looking for the "big picture" and the deeper meaning behind events.',
            'Capricorn': 'Ambitious, disciplined, and deeply practical, you understand the value of hard work and time. You have a natural respect for tradition and structure, often climbing the mountain of success with a steady, unflinching gaze on the long-term goal.',
            'Aquarius': 'Originality, a humanitarian spirit, and a visionary mind define your unique perspective. You are often ahead of your time, valuing intellectual freedom and the collective good over individual ego, though you may sometimes appear detached from others.',
            'Pisces': 'Compassion, imagination, and a deep sense of spiritual connection are your primary gifts. You have a fluid, dream-like nature that can easily tap into the collective consciousness, often finding it easier to "feel" your way through life rather than analyze it.'
        };
        return traits[sign] || 'You possess a unique blend of qualities that help you navigate this specific area of your life with a balanced perspective.';
    };

    const trait = getTraits(ascSign);

    const interpretations: Record<string, string> = {
        'D1': `Hello ${firstName}, your fundamental existence and the way you meet the world are colored by the vibrant energy of ${ascSign}. This suggests that ${trait.toLowerCase()} This isn\'t just a surface-level personality trait; it is the very core of your physical vitality and your natural orientation toward every challenge you face. In this lifetime, ${firstName}, your soul has chosen this specific sign as its primary laboratory, learning how to master its strengths while balancing its inherent impulses. Whether you are starting a new project or simply navigating a daily routine, you bring a unique ${ascSign} flavor that defines your reputation and your personal brand of leadership. By consciously leaning into these qualities, you can unlock a greater sense of purpose and alignment with your true self.`,
        'D9': `At your deepest core, ${firstName}, your soul\'s resilience and your long-term character are rooted in the powerful energy of ${ascSign}. While your outer self might appear different to casual observers, your inner compass always points toward this energy. This means that ${trait.toLowerCase()} In the second half of your life and within your most intimate partnerships, these qualities will become increasingly dominant, acting as the foundation for your psychological stability. Your spouse or life partner will often mirror these ${ascSign} traits back to you, helping you refine your internal values and spiritual strength. This "Navamsa" energy is your true internal power, providing you with the wisdom and endurance needed to navigate life\'s most significant transitions with grace and integrity.`,
        'Moon': `Your emotional landscape and your subconscious mind, ${firstName}, are deeply influenced by the high-fidelity traits of ${ascSign}. This reveals that ${trait.toLowerCase()} You find mental peace and a sense of internal security when your environment and your daily habits reflect these specific sign qualities. Your mother figures and your earliest childhood memories likely emphasized these ${ascSign} themes, shaping the way you nurture yourself and how you instinctively react to stress today. Because the Moon represents your perception of reality, seeing the world through this lens allows you to process emotions with a unique depth and intuition. When you feel ungrounded, ${firstName}, returning to the core strengths of ${ascSign} will help you regain your equilibrium and find lasting contentment.`,
        'D10': `In your professional life and your pursuit of public recognition, ${firstName}, you manifest your power through the distinct qualities of ${ascSign}. This indicates that ${trait.toLowerCase()} In your career, you are seen as someone who brings this specific energy to the table, whether through your leadership style, your technical mastery, or your collaborative approach. Your reputation is built upon your ability to execute your duties with the precision and spirit of ${ascSign}, making you a valuable contributor to your field. Aligning your daily vocation with these innate traits will not only lead to greater financial success but will also ensure that your work feels deeply meaningful and supportive of your overall life mission. You have the potential to leave a lasting legacy by mastering this area.`,
        'D2': `Your relationship with material abundance, family resources, and your personal values is defined by the energy of ${ascSign}. This suggests that ${trait.toLowerCase()} You approach financial security not just as a means to an end, ${firstName}, but as a direct expression of these specific sign qualities, ensuring that your wealth is earned and managed in a way that feels ethically and emotionally authentic. Whether you are building an inheritance or simply managing a household budget, your ${ascSign} nature influences the way you prioritize your needs and how you speak your truth to others. By understanding this internal mechanism, you can create a more stable and prosperous foundation that honors both your material goals and your soul\'s requirement for a specific type of resource management.`,
        'D12': `Your ancestral roots and the deep psychological patterns you have inherited from your parents are defined by the powerful ${ascSign} energy. You carry the legacy of generations within your bloodline, manifesting as: ${trait.toLowerCase()} This divisional chart reveals that your upbringing was heavily influenced by these ${ascSign} themes, shaping your early identity and your sense of belonging. Understanding this connection allows you to see which family patterns are gifts meant to be carried forward and which ones are karmic lessons you are destined to evolve beyond. By honoring your lineage while consciously refining these inherited qualities, ${firstName}, you can find a profound sense of peace with your origins and clear the path for future generations to thrive in their own unique light.`
    };

    return interpretations[key] || `In this specific department of your life, ${firstName}, you navigate your path using the unique energy of ${ascSign}. This suggests that ${trait.toLowerCase()} By consciously leaning into these strengths, you can find greater ease and success as you navigate the particular challenges and opportunities presented by this divisional chart. Whether it is a spiritual search, a creative endeavor, or a matter of health, your ${ascSign} orientation provides you with the specific tools and perspectives needed to achieve mastery. This chart represents a refined layer of your destiny, and by paying attention to its subtle shifts, you can align your actions with the deeper currents of your soul\'s journey, leading to a life that feels both productive and spiritually resonant.`;
};

export default function ChartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('Abundance');
    const [initializing, setInitializing] = useState(false);
    const [activeChart, setActiveChart] = useState<string | null>(null); // Which chart is expanded
    const [activeTab, setActiveTab] = useState(0); // Which tab is active in expanded view
    const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        async function fetchCosts() {
            try {
                const res = await fetch('/api/admin/services');
                if (res.ok) {
                    const data = await res.json();
                    const costs: Record<string, number> = {};
                    data.forEach((s: any) => costs[s.key] = s.credits);
                    setServiceCosts(costs);
                }
            } catch (e) { }
        }
        fetchCosts();
    }, []);

    const toggleChartDetails = (key: string) => {
        if (activeChart === key) {
            setActiveChart(null); // Close if clicking the same chart
        } else {
            setActiveChart(key); // Open new chart, closing any others
            setActiveTab(0); // Reset to first tab
        }
    };

    // Auto-sync for legacy profiles
    useEffect(() => {
        if (profile && !profile.chartData?.vargas && !initializing && !loading) {
            handleInitializeVargas();
        }
    }, [profile, initializing, loading]);

    // Initial Profile Fetch
    useEffect(() => {
        async function fetchProfile() {
            if (status === 'loading') return;
            if (status === 'unauthenticated') {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile({
                        ...data,
                        dateOfBirth: new Date(data.dateOfBirth),
                        chartData: data.chartData as ChartData
                    });
                }
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [status]);

    const [confirmModal, setConfirmModal] = useState<{ show: boolean, chartKey: string, cost: number } | null>(null);
    const [noCreditsModal, setNoCreditsModal] = useState(false);

    const handleUnlockChart = (chartKey: string) => {
        if (!profile) return;
        const cost = serviceCosts[`CHART_${chartKey}`] || 5;
        // Check if user has enough credits (assuming we have credit balance in profile)
        // For now, we'll let the server decide 402, but we show the confirmation first
        setConfirmModal({ show: true, chartKey, cost });
    };

    const confirmUnlock = async () => {
        if (!confirmModal || !profile) return;
        const { chartKey } = confirmModal;
        setConfirmModal(null);
        setUnlocking(chartKey);

        try {
            const res = await fetch(`/api/profiles/${profile.id}/charts/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chartKey })
            });

            if (res.ok) {
                const data = await res.json();
                setProfile({ ...profile, unlockedCharts: data.unlockedCharts });
                // Automatically open the chart details after unlock
                setActiveChart(chartKey);
            } else {
                const err = await res.json();
                if (res.status === 402) {
                    setNoCreditsModal(true);
                } else {
                    alert('Unlock failed: ' + (err.error || 'Unknown error'));
                }
            }
        } catch (error) {
            alert('Error unlocking chart');
        } finally {
            setUnlocking(null);
        }
    };

    const handleInitializeVargas = async () => {
        if (!profile) return;
        setInitializing(true);
        try {
            const dob = new Date(profile.dateOfBirth);
            const body = {
                year: dob.getFullYear(),
                month: dob.getMonth() + 1,
                day: dob.getDate(),
                hour: parseInt(profile.timeOfBirth.split(':')[0]),
                minute: parseInt(profile.timeOfBirth.split(':')[1]),
                lat: profile.latitude,
                lng: profile.longitude
            };

            const calcRes = await fetch('/api/astrology/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!calcRes.ok) throw new Error('Calculation failed');
            const fullData = await calcRes.json();

            const saveRes = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...profile,
                    dateOfBirth: profile.dateOfBirth,
                    chartData: fullData,
                    isActive: true
                })
            });

            if (saveRes.ok) {
                setProfile({ ...profile, chartData: fullData });
            }
        } catch (error) {
            console.error('Initialization failed:', error);
            alert('Could not synchronize your advanced charts. Please try updating your birth details manually.');
        } finally {
            setInitializing(false);
        }
    };

    const handleChartGenerated = async (data: ChartData) => {
        try {
            setLoading(true);
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const updatedProfile = await res.json();
                setProfile({
                    ...updatedProfile,
                    dateOfBirth: new Date(updatedProfile.dateOfBirth),
                    chartData: updatedProfile.chartData as ChartData
                });
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Failed to refresh profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (!profile && !loading) {
        return (
            <div className={`container ${styles.pageContainer}`}>
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h1 className={styles.title}>Welcome to Chetna</h1>
                    <p className={styles.subtitle}>
                        To verify the stars, we first need to know where you stand. <br />
                        Please enter your birth details to begin your journey.
                    </p>
                </div>
                <div className={styles.formWrapper}>
                    <BirthDataForm onChartGenerated={handleChartGenerated} />
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className={`container ${styles.pageContainer}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="text-left">
                        <h1 className={styles.title}>Update Profile</h1>
                        <p className={styles.subtitle}>Modify your birth details to update your charts.</p>
                    </div>
                    <button onClick={() => setIsEditing(false)} className={styles.backLinkBtn}>
                        <ArrowLeft size={16} />
                        Back to Chart
                    </button>
                </div>
                <div className={styles.formWrapper}>
                    <BirthDataForm onChartGenerated={handleChartGenerated} initialData={profile!} />
                </div>
            </div>
        );
    }

    const freeCharts = ['D1', 'D9', 'Moon'];
    const unlockedCharts = (profile?.unlockedCharts as string[]) || [];
    const hasVargas = !!profile?.chartData?.vargas;

    const renderVargaCard = (key: string, isTrinity = false) => {
        const info = VARGA_DEFINITIONS[key] || { title: key, definition: 'Advanced divisional analysis', tips: 'Refining cosmic insights' };
        const isUnlocked = VARGA_CATEGORIES['Foundation'].includes(key) ||
            unlockedCharts.includes(key) ||
            (session?.user as any)?.isAdmin;
        const vargaData = profile?.chartData?.vargas?.[key];
        const isExpanded = activeChart === key;
        const creditCost = serviceCosts[`CHART_${key}`] || 5;

        return (
            <div key={key} className={styles.cardContainer}>
                <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: isTrinity ? -12 : -4 }}
                    className={isTrinity ? styles.trinityCard : styles.vargaCard}
                >
                    {isTrinity && <span className={styles.trinityBadge}>Foundational</span>}

                    {!isUnlocked && (
                        <div className={styles.lockOverlay}>
                            <div className={styles.mysticLock}>
                                <Lock size={40} className={styles.lockIcon} />
                                <div className={styles.lockGlow}></div>
                            </div>
                            <h3 className={styles.unlockTitle}>{info.title}</h3>
                            <p className={styles.unlockDescription}>Unlock deep celestial insights into this specific area of your life.</p>
                            <button
                                className={styles.unlockBtn}
                                onClick={() => handleUnlockChart(key)}
                                disabled={unlocking === key}
                            >
                                {unlocking === key ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    `Unlock for ${creditCost} Credits`
                                )}
                            </button>
                        </div>
                    )}

                    <div className={styles.vargaHeader}>
                        <h3 className={styles.vargaTitle}>{info.title}</h3>
                        {isUnlocked ? <CheckCircle size={16} color="var(--accent-gold)" /> : <span className={styles.vargaTag}>Premium</span>}
                    </div>

                    {isUnlocked && vargaData && (
                        <>
                            <div className="flex justify-center mb-4">
                                <ChartDisplay data={vargaData} width={220} height={220} />
                            </div>

                            <button
                                className={`${styles.analysisBtn} ${isExpanded ? styles.active : ''}`}
                                onClick={() => toggleChartDetails(key)}
                            >
                                {isExpanded ? 'Hide Details' : 'View Detailed Insights'}
                                {isExpanded ? <PlusCircle className="rotate-45" size={16} /> : <Zap size={16} />}
                            </button>
                        </>
                    )}

                    {!isUnlocked && (
                        <div className="p-8 text-center opacity-40">
                            <p className="italic leading-relaxed">{info.definition.substring(0, 100)}...</p>
                            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[var(--accent-gold)]">
                                Unlock to read the full analysis
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    };

    return (
        <div className={`container ${styles.pageContainer}`}>
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div className="text-left">
                    <h1 className={styles.title}>Varga Portfolio</h1>
                    <div className={styles.subtitle}>
                        <p>Cosmic blueprint for <span className="text-[var(--primary)] font-semibold">{profile?.name}</span> • {new Date(profile!.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                </div>
                <button onClick={() => setIsEditing(true)} className={styles.addProfileBtn}>
                    <PlusCircle size={18} />
                    Refine Birth Details
                </button>
            </div>

            {!hasVargas && (
                <div className={styles.initializeSection}>
                    <Sparkles size={32} className="mx-auto text-[var(--accent-gold)] mb-4" />
                    <h2>Advanced Insights Available</h2>
                    <p>Your profile needs one-time synchronization to unlock 16 additional divisional charts.</p>
                    <button
                        className={styles.initializeBtn}
                        onClick={handleInitializeVargas}
                        disabled={initializing}
                    >
                        {initializing ? 'Synchronizing...' : 'Sync Evolutionary Charts'}
                    </button>
                </div>
            )}

            {hasVargas && (
                <div className="space-y-12">
                    {/* Trinity Section (Always Visible) */}
                    <div className={styles.trinitySection}>
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className={styles.trinityGrid}
                        >
                            {VARGA_CATEGORIES['Foundation'].map(key => renderVargaCard(key, true))}
                        </motion.div>
                    </div>

                    {/* Varga Categories Section */}
                    <div className={styles.categoryNav}>
                        {Object.keys(VARGA_CATEGORIES).filter(c => c !== 'Foundation').map(cat => (
                            <button
                                key={cat}
                                className={`${styles.categoryBtn} ${activeCategory === cat ? styles.active : ''}`}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className={styles.vargaGrid}
                        >
                            {VARGA_CATEGORIES[activeCategory].map(key => renderVargaCard(key))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* Unlock Confirmation Modal */}
            <AnimatePresence>
                {confirmModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={styles.dialogBox}
                        >
                            <h3 className={styles.dialogTitle}>Unlock {VARGA_DEFINITIONS[confirmModal.chartKey]?.title}?</h3>
                            <p className={styles.dialogText}>
                                This detailed analysis will reveal deep insights into your life path.
                                <br />
                                <strong>Cost: {confirmModal.cost} Credits</strong>
                            </p>
                            <div className={styles.dialogActions}>
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    className={styles.btnCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmUnlock}
                                    className={styles.btnConfirm}
                                >
                                    Confirm Unlock
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Insufficient Credits Modal */}
            <AnimatePresence>
                {noCreditsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className={styles.dialogBox}
                        >
                            <h3 className={styles.dialogTitle} style={{ color: '#ff4747' }}>Insufficient Credits</h3>
                            <p className={styles.dialogText}>
                                You need more credits to unlock this premium chart analysis.
                            </p>
                            <div className={styles.dialogActions}>
                                <button
                                    onClick={() => setNoCreditsModal(false)}
                                    className={styles.btnCancel}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className={styles.btnPremium}
                                >
                                    Get Credits
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fixed Analysis Bottom Drawer */}
            <AnimatePresence>
                {activeChart && profile?.chartData?.vargas?.[activeChart] && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={styles.analysisDrawer}
                    >
                        {/* Drawer Header */}
                        <div className={styles.drawerHeader}>
                            <div className={styles.drawerHeaderLeft}>
                                <h3>{VARGA_DEFINITIONS[activeChart]?.title}</h3>
                                <span className={styles.drawerSubtitle}>Detailed Analysis</span>
                            </div>
                            <div className={styles.drawerControls}>
                                <button
                                    className={styles.exportBtn}
                                    onClick={async () => {
                                        setIsExporting(true);

                                        try {
                                            // 1. Capture Chart Image (Higher Quality & Print Friendly)
                                            // USING onclone TO AVOID WEB REGRESSION
                                            let chartImageBase64 = null;
                                            try {
                                                const chartElement = document.querySelector(`.${styles.chartWrapper}`) as HTMLElement;
                                                if (chartElement) {
                                                    const canvas = await html2canvas(chartElement, {
                                                        scale: 4,
                                                        backgroundColor: null,
                                                        logging: false,
                                                        useCORS: true,
                                                        onclone: (clonedDoc) => {
                                                            const wrapper = clonedDoc.querySelector(`.${styles.chartWrapper}`) as HTMLElement;
                                                            if (wrapper) {
                                                                // Print Styling (Applied ONLY to clone)
                                                                wrapper.style.background = '#ffffff';
                                                                wrapper.style.color = '#000000';
                                                                wrapper.style.border = 'none';
                                                                wrapper.style.boxShadow = 'none';

                                                                // Force explicit black for all variables
                                                                wrapper.style.setProperty('--primary', '#000000');
                                                                wrapper.style.setProperty('--foreground', '#000000');
                                                                wrapper.style.setProperty('--accent-gold', '#000000');
                                                                wrapper.style.setProperty('--card-bg', '#ffffff');

                                                                // Aggressively target all text and lines
                                                                const allElements = wrapper.querySelectorAll('*');
                                                                allElements.forEach((el: any) => {
                                                                    const style = window.getComputedStyle(el);
                                                                    // Force text to black and bold if it's text
                                                                    if (el.innerText && el.children.length === 0) {
                                                                        el.style.color = '#000000';
                                                                        el.style.fontWeight = '600'; // Bold for clarity
                                                                        el.style.textShadow = 'none';
                                                                    }
                                                                    // Force SVG strokes/fills
                                                                    if (el.tagName === 'path' || el.tagName === 'circle' || el.tagName === 'line') {
                                                                        const stroke = el.getAttribute('stroke');
                                                                        if (stroke && stroke !== 'none') {
                                                                            el.style.stroke = '#000000';
                                                                            el.style.strokeWidth = '1.5px';
                                                                        }
                                                                    }
                                                                    if (el.tagName === 'text') {
                                                                        el.style.fill = '#000000';
                                                                        el.style.fontWeight = 'bold';
                                                                    }
                                                                });
                                                            }
                                                        }
                                                    });
                                                    chartImageBase64 = canvas.toDataURL('image/png', 1.0);
                                                }
                                            } catch (imgErr) {
                                                console.error("Image capture failed", imgErr);
                                            }




                                            // 2. Gather text
                                            const chartDef = VARGA_DEFINITIONS[activeChart];
                                            const story = getPersonalizedInterpretation(activeChart, profile.chartData?.vargas?.[activeChart], profile.name);

                                            // 3. Payload
                                            const payload = {
                                                chartKey: activeChart,
                                                chartTitle: chartDef?.title || `${activeChart} Analysis`, // Send full title
                                                profileId: profile.id,
                                                chartData: profile.chartData?.vargas?.[activeChart],
                                                userDetails: {
                                                    name: profile.name,
                                                    dob: profile.dateOfBirth,
                                                    time: profile.timeOfBirth,
                                                    place: profile.placeOfBirth,
                                                    lat: profile.latitude,
                                                    lng: profile.longitude,
                                                    generatedAt: profile.createdAt // Send creation date for consistency
                                                },
                                                texts: {
                                                    definition: chartDef?.definition,
                                                    tips: chartDef?.tips,
                                                    story: story
                                                },
                                                chartImage: chartImageBase64
                                            };

                                            const res = await fetch('/api/charts/export', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(payload)
                                            });

                                            if (res.ok) {
                                                const blob = await res.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `Chetna_Report_${activeChart}_${profile.name.replace(/\s+/g, '_')}.pdf`;
                                                a.click();
                                            } else {
                                                alert('Failed to generate PDF');
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Error exporting PDF');
                                        } finally {
                                            setIsExporting(false);
                                        }
                                    }}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <><Loader2 className="animate-spin" size={18} /> Generating...</>
                                    ) : (
                                        <><Download size={18} /> Export Full Report</>
                                    )}
                                </button>
                                <button onClick={() => setActiveChart(null)} className={styles.drawerClose}>
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className={styles.drawerContent}>
                            {/* Left: Chart Visualization */}
                            <div className={styles.drawerChart}>
                                <div className={styles.chartWrapper}>
                                    <ChartDisplay data={profile.chartData.vargas[activeChart]} width={280} height={280} />
                                </div>
                            </div>

                            {/* Right: Tabbed Info */}
                            <div className={styles.drawerTabs}>
                                <div className={styles.tabButtons}>
                                    {['Overview', 'Your Story', 'Planets', 'Guidance'].map((tab, idx) => (
                                        <button
                                            key={tab}
                                            className={`${styles.tabButton} ${activeTab === idx ? styles.activeTabButton : ''}`}
                                            onClick={() => setActiveTab(idx)}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={styles.tabPanel}
                                    >
                                        {/* Overview */}
                                        {activeTab === 0 && (
                                            <div className={styles.tabSection}>
                                                <h4><Info size={18} /> Core Meaning</h4>
                                                <p>{VARGA_DEFINITIONS[activeChart]?.definition}</p>
                                            </div>
                                        )}

                                        {/* Your Story */}
                                        {activeTab === 1 && (
                                            <div className={`${styles.tabSection} ${styles.highlightTab}`}>
                                                <h4><Zap size={18} /> Personalized Insight</h4>
                                                <p>{getPersonalizedInterpretation(activeChart, profile.chartData.vargas[activeChart], profile.name)}</p>
                                            </div>
                                        )}

                                        {/* Planets */}
                                        {activeTab === 2 && (
                                            <div className={styles.tabSection}>
                                                <h4>Planetary Dignities</h4>
                                                <p>
                                                    Hello {profile.name.split(' ')[0]}, this table reveals the precise strength and condition of each planet in your chart.
                                                    Here you can see which sign each planet occupies and its "Dignity" status (e.g., Exalted, Debilitated, or Friendly), which determines how effectively it can deliver its results in your life.
                                                </p>
                                                <div className={styles.tableWrapper}>
                                                    <table className={styles.modernTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Planet</th>
                                                                <th>Sign</th>
                                                                <th>Dignity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Object.values(profile.chartData.vargas[activeChart].planets || {}).map((p: any) => {
                                                                const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
                                                                const dignityClass = p.dignity?.toLowerCase().includes('exalt') ? styles.exalted :
                                                                    p.dignity?.toLowerCase().includes('debilit') ? styles.debilitated :
                                                                        p.dignity?.toLowerCase().includes('moola') ? styles.moolatrikona : '';
                                                                return (
                                                                    <tr key={p.name}>
                                                                        <td>{p.name}</td>
                                                                        <td>{signs[Math.floor(p.longitude / 30)]}</td>
                                                                        <td><span className={`${styles.dignityBadge} ${dignityClass}`}>{p.dignity || 'Neutral'}</span></td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Guidance */}
                                        {activeTab === 3 && (
                                            <div className={styles.tabSection}>
                                                <h4><Sparkles size={18} /> Practical Application</h4>
                                                {(() => {
                                                    const tips = VARGA_DEFINITIONS[activeChart]?.tips || "";
                                                    const parts = tips.split(/How to use/i);
                                                    const whenToUse = parts[0]?.trim();
                                                    const howToUse = parts.length > 1 ? parts[1]?.trim() : '';
                                                    return (
                                                        <div className={styles.guidanceContainer}>
                                                            {whenToUse && (
                                                                <div className={styles.guidanceBlock}>
                                                                    <h5><Clock size={16} /> When to use this chart</h5>
                                                                    <p>{whenToUse}</p>
                                                                </div>
                                                            )}
                                                            {howToUse && (
                                                                <div className={styles.guidanceBlock}>
                                                                    <h5><Compass size={16} /> How to use</h5>
                                                                    <p>{howToUse}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
