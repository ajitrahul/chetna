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
    if (!vargaData) return [];
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    // 1. Get Key Factors
    const ascSign = signs[Math.floor(vargaData.ascendant / 30)] || 'Aries';
    const moon = vargaData.planets['Moon'];
    const moonSign = moon ? signs[Math.floor(moon.longitude / 30)] : ascSign;
    const mars = vargaData.planets['Mars'];
    const saturn = vargaData.planets['Saturn'];
    const rahu = vargaData.planets['Rahu'];

    // 2. Content Libraries
    const orientationLibrary: Record<string, string> = {
        'Aries': 'Your natural way of meeting the world is through direct action and a pioneering spirit. You tend to move toward your goals with a sense of urgency and courage, often being the first to identify new opportunities.',
        'Taurus': 'You approach life with an eye for stability and a deep appreciation for the reliable. You tend to take your time, ensuring that every step you take is on solid ground and serves a practical purpose.',
        'Gemini': 'You navigate the world through curiosity and a desire for connection. You have a versatile mind that enjoys exploring multiple perspectives, often acting as a bridge between information and people.',
        'Cancer': 'Your approach to life is deeply intuitive and protective of what you hold dear. You tend to move with a sense of care, prioritizing emotional safety and the well-tended roots of your environment.',
        'Leo': 'You meet the world with warmth, creativity, and a natural presence that encourages others. You tend to lead from the heart, seeking to express your unique light in everything you do.',
        'Virgo': 'Precision and a desire to be of service define your natural orientation. You have a keen eye for how things can be improved, often finding purpose in refining your skills and environment.',
        'Libra': 'Harmony and balance are your primary guiding stars. You approach every situation with a desire for fairness, often seeking to find common ground and create aesthetic or social equilibrium.',
        'Scorpio': 'Intensity and depth characterize your natural way of moving through life. You aren\'t satisfied with surface-level explanations, preferring to explore the hidden mechanics of any situation.',
        'Sagittarius': 'Optimism and a search for expansion fuel your journey. You tend to look at the "big picture", seeking growth through new experiences, travel, or the exploration of higher truths.',
        'Capricorn': 'Ambition and a deep sense of responsibility define your natural orientation. You tend to look at life through the lens of long-term goals, valuing the hard work and discipline needed to build something lasting.',
        'Aquarius': 'Originality and a visionary perspective characterize your way of meeting the world. You tend to value the collective good and intellectual freedom, often looking for ways to improve society or your community.',
        'Pisces': 'Your approach to life is fluid, compassionate, and deeply attuned to the unseen. You tend to navigate through intuition and a sense of spiritual connection, valuing empathy over rigid logic.'
    };

    const innerWorldLibrary: Record<string, string> = {
        'Aries': 'Internally, there is a constant drive for movement. You may feel a spark of restlessness if things become too stagnant, finding emotional comfort in tasks that require immediate focus and energy.',
        'Taurus': 'Emotionally, you seek a sense of groundedness and sensory comfort. You may find peace in familiar routines and well-maintained environments, valuing the "tried and true" over the trendy.',
        'Gemini': 'Mentally, you thrive on variety and intellectual stimulation. You may notice that your internal landscape is always active, filled with ideas and a need to communicate your thoughts effectively.',
        'Cancer': 'Internally, you are sensitive to the subtle shifts in your surroundings. You find comfort in belonging and nurturing, often making decisions based on how they make you feel at a soul level.',
        'Leo': 'Emotionally, you seek recognition and the freedom to be your authentic self. You find peace when you are able to share your creative sparks and feel valued for your genuine contributions.',
        'Virgo': 'Mentally, you find comfort in order and discernment. You may notice an internal drive to organize chaos into functional systems, valuing the quiet satisfaction of a job well done.',
        'Libra': 'Emotionally, you seek peace and the presence of beauty. You find mental stability when your relationships and environment are in sync, valuing the art of partnership above all.',
        'Scorpio': 'Internally, you possess a powerful emotional resilience. You are drawn to transformational experiences, often finding that your greatest insights come from the periods of your life that required renewal.',
        'Sagittarius': 'Mentally, you thrive on freedom and the quest for meaning. You find comfort in philosophies that offer hope and a sense of adventure, often feeling restless if your horizons become too narrow.',
        'Capricorn': 'Internally, you seek structure and a sense of accomplishment. You find peace when you are making progress toward your objectives, often relying on self-reliance as your primary emotional anchor.',
        'Aquarius': 'Mentally, you thrive on innovation and a sense of detachment from the individual ego. You find emotional comfort in groups and networks that share your ideals, valuing uniqueness over tradition.',
        'Pisces': 'Internally, you possess a dream-like imagination and a deep well of feeling. You find comfort in moments of solitude and artistic expression, often feeling the undercurrents of others\' emotions.'
    };

    // Derived Action Under Pressure logic
    const getPressureLogic = () => {
        if (!mars || !saturn) return 'In times of stress, you rely on your inherent resilience. You tend to process challenges with a blend of initial reaction and long-term endurance, eventually finding a way to restore your internal order.';
        const marsSign = signs[Math.floor(mars.longitude / 30)];
        if (['Aries', 'Leo', 'Sagittarius'].includes(marsSign)) {
            return 'When faced with pressure, your first instinct is to take proactive, often rapid action. You find strength in meeting challenges head-on, though you may need to ensure your pace remains sustainable.';
        }
        if (['Taurus', 'Virgo', 'Capricorn'].includes(marsSign)) {
            return 'Under stress, you become more pragmatic and focused on the bottom line. You have a remarkable ability to endure hardship through practical steps, building your way out of difficulties steadily.';
        }
        return 'In high-pressure situations, you often rely on your ability to adapt or gather more information. You find creative ways around obstacles, preferring a flexible approach over a direct confrontation.';
    };

    // Derived Repeating Patterns logic
    const getPatternLogic = () => {
        if (!rahu) return 'Life often invites you to find value in persistent growth. You may notice recurring themes that encourage you to step outside your comfort zone and explore new ways of being.';
        const rahuSign = signs[Math.floor(rahu.longitude / 30)];
        if (['Gemini', 'Libra', 'Aquarius'].includes(rahuSign)) {
            return 'A repeating theme for you involves the navigation of social or intellectual boundaries. You often find yourself in situations where your ability to synthesize information or bridge groups becomes essential.';
        }
        if (['Cancer', 'Scorpio', 'Pisces'].includes(rahuSign)) {
            return 'Recurring patterns in your life often center on emotional depth and transformation. You may find that your path leads you back to situations that require you to trust your intuition and let go of the old.';
        }
        return 'A common thread in your story involves the pursuit of authenticity. You often find yourself in roles where your unique perspective is tested, inviting you to stand firm in your personal truth.';
    };

    // Core Life Theme logic
    const getThemeLogic = () => {
        const themeMap: Record<string, string> = {
            'Aries': 'Your core journey is about mastering the art of the beginning. You are here to learn how to channel your immense vitality into sustained efforts that reflect your authentic spark.',
            'Taurus': 'Your life theme centers on the cultivation of lasting worth. You are learning how to create a world that is not only secure but also deeply nourishing to your senses and values.',
            'Gemini': 'Your core theme is the mastery of communication. You are here to learn how to anchor your curiosity into a focused expression of truth that resonates with others.',
            'Cancer': 'Your life theme is the exploration of emotional depth. You are learning how to use your sensitivity as a compass, leading you toward a life filled with genuine connection and inner peace.',
            'Leo': 'Your core theme is the celebration of self-expression. You are here to learn how to lead with humility and warmth, allowing your inner sun to shine without overshadowing the light of others.',
            'Virgo': 'Your life theme centers on the mastery of refinement. You are here to learn how to use your discernment as a tool for healing and improvement, rather than a measure of worth.',
            'Libra': 'Your core journey is about the exploration of relatedness. You are learning how to find internal balance so that your outer world can reflect a true and lasting peace.',
            'Scorpio': 'Your life theme is the mastery of transformation. You are here to learn how to use your inner power to heal yourself and others, turning every shadow into a source of light.',
            'Sagittarius': 'Your core theme is the exploration of wisdom. You are here to learn how to ground your expansive visions into practical actions that benefit the collective journey.',
            'Capricorn': 'Your life theme centers on the mastery of integrity. You are here to learn how to build a legacy that is not just successful in the eyes of the world, but deeply aligned with your internal values.',
            'Aquarius': 'Your life theme is the exploration of collective consciousness. You are here to learn how to use your unique voice to benefit the group, bridging the gap between the individual and the whole.',
            'Pisces': 'Your core journey is about the exploration of oneness. You are learning how to use your compassion as a healing force, bringing a sense of peace and unity to everything you touch.'
        };
        return themeMap[ascSign] || themeMap['Aries'];
    };

    return [
        {
            title: 'Natural Orientation',
            question: 'How do you naturally meet the world?',
            text: orientationLibrary[ascSign] || orientationLibrary['Aries']
        },
        {
            title: 'Inner Emotional World',
            question: 'What does your inner landscape feel like?',
            text: innerWorldLibrary[moonSign] || innerWorldLibrary['Aries']
        },
        {
            title: 'Action Under Pressure',
            question: 'How do you respond when the pressure is on?',
            text: getPressureLogic()
        },
        {
            title: 'Repeating Patterns',
            question: 'What recurring themes show up in your life?',
            text: getPatternLogic()
        },
        {
            title: 'Core Life Theme',
            question: 'What is the primary lesson your life is teaching you?',
            text: getThemeLogic()
        }
    ];
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
                                    {['Overview', 'Your Story', 'Planet Strength & Balance'].map((tab, idx) => (
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
                                                <h4><Info size={18} /> Understanding this Chart</h4>
                                                <p>
                                                    Astrology is a map of consciousness, not a set of fixed predictions. Each chart represents a different layer of your internal landscape, offering insights into how you process energy, respond to challenges, and find equilibrium.
                                                    This specific divisional chart helps you bridge the gap between your physical reality and your spiritual potential.
                                                </p>
                                                <div className="mt-6 space-y-4">
                                                    <div className={styles.significanceBox}>
                                                        <h5 className={styles.significanceTitle}>Core Significance</h5>
                                                        <p className={styles.significanceText}>{VARGA_DEFINITIONS[activeChart]?.definition}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Your Story */}
                                        {activeTab === 1 && (
                                            <div className={`${styles.tabSection} ${styles.highlightTab}`}>
                                                {getPersonalizedInterpretation(activeChart, profile.chartData.vargas[activeChart], profile.name).map((section: any) => (
                                                    <div key={section.title} className={styles.storySection}>
                                                        <h5>{section.title}</h5>
                                                        <p className={styles.storyQuestion}>{section.question}</p>
                                                        <p className={styles.storyText}>{section.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Planets */}
                                        {activeTab === 2 && (
                                            <div className={styles.tabSection}>
                                                <h4>Planetary Strength & Alignment</h4>
                                                <p>
                                                    This section reveals the refined state of each planetary energy in this specific department of your life.
                                                    The "Sign" shows where the energy is focused, while the "Dignity" indicates how comfortably that energy is expressed.
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
