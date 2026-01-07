'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BirthDataForm, { UserProfile } from '@/components/BirthDataForm';
import ChartDisplay from '@/components/ChartDisplay';
import DashaDisplay from '@/components/DashaDisplay';
import ProfileTabs from '@/components/ProfileTabs';
import ProfileDrawer from '@/components/ProfileDrawer';
import ProfileLimitModal from '@/components/ProfileLimitModal';
import { ChartData, getZodiacSign } from '@/lib/astrology/calculator';
import {
    PLANET_SORT_ORDER,
    SIGN_LORDS,
    getSignIndex,
    getHouseNumber,
    formatDegree,
    getAspects,
    getConjunctions
} from '@/lib/astrology/interpretations';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    'D5': {
        title: 'D5 (Panchamsa Chart)',
        definition: 'The D5 chart, or Panchamsa, reveals your moral fiber, spiritual authority, and potential for fame. It represents the "Purva Punya" or past-life merit that you bring into this life, specifically regarding your character and reputation. This chart shows if you will attain a position of power and influence, and more importantly, if you will wield that power ethically. It is the chart of sovereignty and royal favor. A strong D5 indicates a person who naturally commands respect and may rise to high public standing, often seemingly without effort, due to the good deeds of previous lifetimes.',
        tips: 'USE THIS CHART WHEN: Assessing potential for fame, seeking authority in your field, or analyzing your ethical alignment. HOW TO USE: Examine the 1st, 5th, and 9th houses to gauge your spiritual credit. A strong Sun or Jupiter here indicates natural leadership and moral authority. Use this chart to understand the responsibilities that come with your success and to ensure your path to power remains aligned with dharma.'
    },
    'D6': {
        title: 'D6 (Shashtamsa Chart)',
        definition: 'The D6 chart provides a microscopic view of health, litigation, and enemies. It expands on the 6th house of the Rashi chart, offering detailed insights into the nature of your struggles and your capacity to overcome them. This chart reveals your physiological vulnerabilities and the types of illnesses you may be prone to. It also indicates the outcome of legal battles, competitions, and open conflicts. However, D6 is not just about problems; it is about resilience. A strong D6 shows a warrior spirit—someone who can face illness or opposition and emerge stronger. It is the chart of "Seva" or service, showing how you navigate the difficulties of life through discipline and hard work.',
        tips: 'USE THIS CHART WHEN: Diagnosing health issues, facing legal challenges, or dealing with intense competition. HOW TO USE: Look at the 6th house and its lord to understand the nature of your obstacles. Benefics here can reduce enmity, while Malefics can give the strength to conquer it. Use this chart to adopt proactive health routines and to understand the karmic lessons behind your struggles. It is a powerful tool for developing resilience.'
    },
    'D7': {
        title: 'D7 (Saptamsa Chart)',
        definition: 'The D7 chart, or Saptamsa, is the chart of creativity, legacy, and progeny. It is primarily used to understand one\'s relationship with their children and the legacy they leave behind. This isn\'t limited to just biological children; it encompasses anything you "give birth to" in the world, such as creative projects, students, or lasting businesses. The D7 reveals the happiness, challenges, and growth you will experience through the next generation. It shows your capacity for nurturing and the specific traits of those who will follow in your footsteps. Whether you are looking for insights into fertility or the potential success of a life-long creative endeavor, the D7 provides the fine detail needed to understand your contribution to the future.',
        tips: 'USE THIS CHART WHEN: Planning to have children, launching creative projects, or seeking to understand your legacy. HOW TO USE: Examine the 5th house, Jupiter, and the ascendant lord to assess timing for parenthood or creative ventures. If considering fertility treatments or adoption, consult this chart for insights. Use it to nurture your creative intelligence and understand what lasting impact you will have on future generations through your creations or children.'
    },
    'D8': {
        title: 'D8 (Ashtamsa Chart)',
        definition: 'The D8 chart dives deep into longevity, sudden transformations, and the occult. It is the chart of the unexpected—sudden windfalls, accidents, inheritances, or mystical experiences. While D1 shows the general span of life, D8 reveals the quality of your endurance and the hidden forces that shape your survival. It is often consulted to understand chronic ailments or life-altering events that seem to come from nowhere. On a spiritual level, D8 represents "Kundalini" energy and the capacity for deep, tantric transformation. It shows your ability to die to the old self and be reborn, making it a crucial chart for those on a path of radical self-discovery.',
        tips: 'USE THIS CHART WHEN: You are facing sudden changes, exploring the occult, or concerned about longevity and chronic health. HOW TO USE: This chart requires careful analysis. Look at the 8th house and the lord of the 22nd Drekkana for critical insights. Use D8 to navigate crisis periods with wisdom, viewing sudden upheavals as opportunities for profound transformation. It guides you in managing unearned wealth and deep psychological shifts.'
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
    'Progress': ['D3', 'D5', 'D10', 'D24'],
    'Relationships': ['D7', 'D12'],
    'Spiritual': ['D20', 'D27'],
    'Shadow': ['D6', 'D8', 'D30']
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

    // 2. Content Libraries (Enriched 100+ words)
    const orientationLibrary: Record<string, string> = {
        'Aries': 'Your default nature is one of irrepressible vitality and initiative. You are the spark that ignites the fire, programmed to meet the world head-on with courage and directness. Unlike others who might hesitate or weigh every option, you find your identity in action. "Who am I?" is a question you answer by doing. You possess a raw, unfiltered honesty that can be both refreshing and intimidating. You are not designed to follow the beaten path; you are here to blaze new trails. When you walk into a room, you bring an energy that says, "I am here, and I am ready." Your challenge is not in starting things—you are a master of beginnings—but in understanding that your sheer force of will can sometimes overwhelm those who move at a slower pace. You are the warrior of the zodiac, and your default mode is to conquer, not to retreat.',
        'Taurus': 'By default, you are the anchor of the zodiac, embodying a profound sense of stability, endurance, and sensory appreciation. You meet the world not with a rush of speed, but with the unshakeable presence of a mountain. You are defined by what you can build, sustain, and protect. Your identity is deeply rooted in the physical realm—you trust what you can touch, taste, and hold. Others see you as a rock, someone who remains calm when storms rage, but this calmness is not passivity; it is a deliberate conservation of energy. You move through life with a deliberate, steady rhythm, refusing to be rushed by the chaotic urgency of the modern world. You are here to teach the value of patience and the art of savouring life’s pleasures. Your default mode is preservation, ensuring that whatever you invest in—be it relationships, work, or values—stands the test of time.',
        'Gemini': 'You are, by default, the eternal student and the messenger of the zodiac. Your identity is fluid, multifaceted, and endlessly curious. You meet the world with a mind that is constantly scanning for patterns, connections, and new information. You are not content with a single perspective; you need to see the prism of reality from every conceivable angle. "Who am I?" is a question that might have a different answer for you every day, and that is your strength, not your weakness. You are the bridge between people and ideas, possessed of a mental agility that allows you to adapt to any situation. You thrive on interaction, dialogue, and the exchange of energy. While others may see you as restless, you know that your movement is a search for truth in its most varied forms. Your default mode is connection, weaving the disparate threads of the world into a tapestry of understanding.',
        'Cancer': 'Your default nature is one of profound emotional depth and protective instinct. You meet the world with a sensitive, intuitive antenna that picks up on the unspoken undercurrents of every situation. You are the nurturer, the keeper of the hearth, and the guardian of memory. Your identity is inextricably linked to where you come from and who you consider "family." Unlike those who seek validation from the external world, you find your truth in the safe harbor of your private life. You move through the world with a sideways gait, carefully assessing safety before you open up, but once you do, your loyalty is absolute. You are the container for the feelings of others, often understanding them better than they understand themselves. Your default mode is caretaking, creating spaces where vulnerability is honored and where the roots of the soul can grow deep and strong.',
        'Leo': 'By default, you are the radiant center of your own universe, possessed of a natural magnetism that draws others into your orbit. You meet the world with a warm, generous, and theatrical spirit. You are not here to hide in the shadows; you are designed to shine, to create, and to lead with the heart. Your identity is built on a foundation of self-expression and dignity. You approach life as a grand stage where you are both the protagonist and the director. While some may mistake your confidence for arrogance, it is actually a deep-seated belief in the potential of the human spirit to create joy. You are the king or queen who rules not by force, but by the inspiration of your presence. Your default mode is celebration, reminding the world that life is a gift to be enjoyed, and that every individual carries a divine spark worthy of applause.',
        'Virgo': 'You are, by nature, the perfectionist and the healer of the zodiac. You meet the world with a discriminating eye, instantly seeing the potential for improvement in everything you encounter. You are not satisfied with "good enough"; your default mode is essentially one of refinement. Your identity is forged in the fires of service and competence. You find order in chaos, clarity in confusion, and practical solutions where others see only problems. You approach life with a humble, analytical precision, understanding that the divine is found in the details. While others may overlook the small things, you know that they are the building blocks of the universe. You are the craftsman who tirelessly polishes the rough stone until it becomes a gem. Your default mode is optimization, constantly tweaking the machinery of life to ensure that it runs with the highest possible efficiency and purity.',
        'Libra': 'Your default nature is one of diplomatic grace and an innate striving for equilibrium. You meet the world with a desire to harmonize, to connect, and to beautify. You are the mirror of the zodiac, finding your own identity most clearly reflected in your relationships with others. You are not designed for solitary confinement; you thrive in partnership and dialogue. Your approach to life is artistic—you seek to smooth over rough edges and bridge divides. "Who am I?" is often answered by "Who are we?" You possess a powerful sense of justice, not the harsh justice of the law, but the fairness of the heart. You find it physically painful to witness discord or ugliness. Your default mode is mediation, weaving together opposing forces to create a synthesis that is greater, fairer, and more beautiful than the sum of its parts.',
        'Scorpio': 'By default, you are the investigator and the alchemist of the zodiac. You meet the world with a piercing intensity that looks immediately beneath the surface. You are not interested in the polite masks that people wear; you crave the raw, unvarnished truth of the human soul. Your identity is forged in the depths of emotion and the cycles of transformation. You are the phoenix, constantly dying to your old self and rising from the ashes, stronger and wiser. You approach life with a suspicious but deeply passionate nature, guarding your vulnerability like a treasure. To be known by you is to be examined, tested, and ultimately, deeply understood. You are here to navigate the taboos of life—death, sex, power, and money—with unflinching courage. Your default mode is penetration, cutting through the noise of the superficial world to touch the dangerous, beating heart of reality.',
        'Sagittarius': 'You are, by nature, the explorer and the philosopher. Your default mode is one of expansion—you need to move, to learn, and to grow to feel alive. You meet the world with an infectious optimism and a hunger for meaning. You are not here to be fenced in by routine or small-mindedness; you are the arrow shot toward the horizon. Your identity is wrapped up in your beliefs and your quest for ultimate truth. You approach life as a grand adventure, a university without walls. Whether through physical travel or intellectual pursuit, you are always seeking the "view from above." You are the teacher who inspires others to look beyond their limitations. Your default mode is seeking, forever chasing the wisdom that lies just beyond the next hill, driven by a faith that the universe is ultimately benevolent and full of purpose.',
        'Capricorn': 'Your default nature is one of towering ambition, discipline, and pragmatism. You meet the world with the seriousness of a master architect surveying the land. You are not here for fleeting pleasures; you are here to build something that will outlast you. Your identity is defined by your achievements, your integrity, and your capacity to bear heavy responsibilities. You approach life as a mountain to be climbed, step by careful step. You understand the laws of time and consequence better than anyone. While others may give up when the air gets thin, you find your strength in the struggle. You are the elder of the zodiac, born with an old soul and a clear vision of the summit. Your default mode is construction, laying the bricks of your legacy with patience, strategy, and an unshakeable commitment to excellence.',
        'Aquarius': 'By default, you are the visionary and the rebel. You meet the world with a detached, electric intelligence that breaks through convention. You are not here to maintain the status quo; you are here to reinvent it. Your identity is rooted in your uniqueness and your commitment to the collective future. You approach life with the objectivity of a scientist and the heart of a humanitarian. You see the grid of humanity, the connections that bind us all, yet you often stand slightly apart, observing from a high altitude. You value freedom above all else—the freedom of thought, of expression, and of being. You are the lightning rod for new ideas, channeling the frequency of tomorrow into the reality of today. Your default mode is innovation, constantly disrupting the stagnant waters of tradition to make way for a more evolved and equitable world.',
        'Pisces': 'You are, by nature, the mystic and the dreamer. Your default mode is one of boundary-less empathy and spiritual fluidity. You meet the world not with logic, but with feeling, sensing the interconnectedness of all life. You are the ocean into which all rivers flow. Your identity is elusive, often shifting like the tides, as you easily absorb the emotions and psychic atmosphere around you. You approach life with compassion and a touch of divine madness, understanding that reality is far more than what can be seen or measured. You are the artist, the poet, and the healer who touches the soul\'s deepest wounds. You often live with one foot in this world and one in the invisible realms. Your default mode is transcendence, seeking to dissolve the illusion of separation and return to the blissful unity from which we all emerged.'
    };

    const innerWorldLibrary: Record<string, string> = {
        'Aries': 'Inside, you carry a burning flame of urgency that others rarely see in its full intensity. What feels like "impatience" to the outside world is actually a profound internal pressure to exist, to matter, and to assert your being against the void. You often feel a solitary burden of responsibility—the feeling that if you don\'t make it happen, no one will. There is a vulnerable child within you that fears being ignored or rendered powerless. Your internal monologue is a constant pep talk, battling a secret fear of insignificance. You feel things with a raw immediacy that can be exhausting; your anger, your joy, and your desire burn hot and fast. You crave a safe space where you can lay down your sword and shield without being seen as weak, a place where your softness is not a liability but a resting place.',
        'Taurus': 'Deep within, there is a sanctuary of silence that you guard fiercely. While you project strength and reliability, inside you often grapple with a fear of scarcity and change. You feel a profound connection to the rhythm of things—a slow, sensory processing of emotion that the fast-paced world doesn\'t understand. You ruminate, chewing on feelings for days or weeks, extracting every ounce of meaning. There is a deep, unspoken need for physical reassurance; a hunger to be held and grounded that goes beyond simple affection. You often feel the weight of the material world more heavily than others, worrying about the stability of your foundations. Your internal landscape is a lush, private garden, and you are highly selective about who you let in, fearing that clumsy feet will trample the delicate peace you have cultivated.',
        'Gemini': 'Inside your mind, there is a constant, buzzing dialogue that never truly sleeps. What others see as "fickleness" is actually a high-speed internal processing of contradictory truths. You often feel like two or more people living in one body, debating every decision from multiple angles. There is a deep-seated loneliness in this multiplicity; you crave a "twin soul" who can understand your shorthand and keep up with your mental velocity. You frequently question your own depth, worrying that you might be a fraud because your interests shift so quickly. Yet, your internal world is a library of fascinating connections. You feel a nervous energy, a vibrating curiosity that can border on anxiety. You are constantly trying to verbalize the inexpressible, feeling that if you could just find the right words, the chaos of your feelings would finally make sense.',
        'Cancer': 'Your internal world is an ocean of memory and fluctuating tides. Others see your shell, but inside, you are incredibly porous, absorbing the emotional residue of everyone you meet. You carry the ghosts of the past with you—every hurt, every kindness, every nostalgic moment is alive and present in your psyche. You often feel a profound, aching nostalgia for a home or a safety you can\'t quite name. There is a deep fear of abandonment that drives your protective behaviors. You feel emotions not just in your mind, but in your gut; your intuition is a physical sensation. You often feel misunderstood, as if the depth of your caring is perceived as smothering or moody. Inside, you are building a fortress of love, constantly reinforcing the walls to keep your tender heart safe from a world that feels too sharp and cold.',
        'Leo': 'Behind the curtain of your confidence, there is a tender, beating heart that craves simple validation. You feel a deep, often secret, pressure to be "special," to live a life of significance. What others see as ego is often a protective mechanism for a fragile inner child who just wants to be loved for who they are, not just for what they perform. You feel the weight of the crown—the expectation that you must always be the strong one, the bright one, the generous one. Inside, you sometimes feel lonely in a crowded room, wondering if anyone sees the real you behind the dazzle. You have a massive capacity for loyalty and warmth, and you feel wounded deeply when your generosity is taken for granted. Your internal world is a place of high drama and romance, where you are searching for a love that matches the grandeur of your own spirit.',
        'Virgo': 'Your internal landscape is a hive of activity, constantly analyzing, sorting, and attempting to fix. While you appear calm, your mind is often a whirlwind of "what ifs" and self-critique. You feel a heavy burden of potential—you see exactly how perfect things *could* be, and it pains you to see them fall short. You often feel unappreciated, as your service is invisible and seamless. There is a deep anxiety about chaos and illness, a need to control the small variables to prevent the large disasters. You struggle with a sense of worthiness, often feeling that you have to earn your place on earth through usefulness. Inside, you are incredibly sensitive to the environment; a crooked picture or a harsh word can grate on your nerves like sandpaper. You crave a mental silence that is hard for you to find, a place where nothing needs to be improved.',
        'Libra': 'Inside, you are constantly weighing the scales, a process that can be agonizingly indecisive. What looks like grace to others is often a swan-like effort—gliding on top, paddling furiously underneath. You feel a profound distress when there is disharmony in your environment; it feels like a physical assault on your system. You often suppress your own needs to keep the peace, leading to a reservoir of hidden resentment. You struggle with a fear of being "the bad guy," often saying yes when you mean no. Your internal world is a quest for an ideal—the perfect partner, the perfect justice, the perfect aesthetic. You feel incomplete in isolation, constantly seeking the "other" to balance your equation. You are harder on yourself than anyone knows, constantly judging your own actions against an impossible standard of fairness and nicety.',
        'Scorpio': 'Your inner world is a subterranean cavern of intense feeling and secret power. You feel things with a nuclear intensity—love, hate, loyalty, betrayal—that would burn others out. You are constantly monitoring the distribution of power in your relationships, scanning for threats and hidden agendas. There is a part of you that expects the worst as a survival strategy. You often feel a profound isolation because you know that most people cannot handle the raw truth of your psyche. You struggle with the need to control your environment to prevent being hurt. Inside, you are not dark, but deep; you possess a reservoir of healing energy and emotional courage. You feel the interconnectedness of life and death, sex and spirit. You are secretly waiting for a connection absolute enough to allow you to finally put down your guard and surrender.',
        'Sagittarius': 'Inside, you feel a restless expansion, a call from the wild that makes routine feel like a cage. You often grapple with a "grass is greener" syndrome, feeling that your true life is happening somewhere else, just over the horizon. What others see as commitment issues is actually a terror of stagnation. You feel a deep need to believe that life is meaningful, and you can fall into despair if you lose your philosophical compass. You often use humor and optimism to mask a fear of being trapped in the mundane. Your internal world is a vast library of concepts and future possibilities. You feel a spiritual homesickness, a sense that you are an alien on this planet just passing through. You crave a freedom that is absolute, wanting to belong everywhere and nowhere at the same time.',
        'Capricorn': 'Deep down, you carry an ancient sense of responsibility, often feeling like an adult even when you were a child. You feel a pervasive pressure to achieve, to justify your existence through tangible results. What others see as coldness is a protective wall around a deeply self-critical and sensitive soul. You fear failure more than death; public humiliation is your nightmare. You often feel alone in your struggles, believing that you must carry the mountain by yourself. There is a melancholy streak within you, a realism that borders on pessimism, but also a dry, dark humor that gets you through. Inside, you crave respect more than affection. You are secretly deeply emotional, but you view emotions as inefficient variables that must be managed. You are building a fortress not just for yourself, but to protect everyone you love.',
        'Aquarius': 'Your internal world is a high-altitude observation deck, cool and detached yet buzzing with electricity. You often feel like an outsider looking in at the human experiment, understanding the systems but struggling with the intimacy. You feel a deep, conflicting need: you want to save humanity, yet everyday human emotional demands can feel suffocating. You struggle with a fear of losing your individuality, of being swallowed by the "norm." Inside, you are often lonelier than you let on, because your mind moves at a frequency few can match. You feel a loyalty to truth that overrides social niceties. You are prone to sudden mental "short circuits" or periods of nervous exhaustion. You crave a connection that is intellectual and spiritual, a meeting of minds where you can be completely free to be your eccentric self without judgment.',
        'Pisces': 'Inside, you are floating in a vast ocean of feelings, dreams, and psychic impressions. You often have trouble distinguishing where you end and others begin; you absorb the pain of the world like a sponge. You feel a deep, spiritual longing for a home that is not of this earth. What others see as escapism is your necessary survival mechanism—retreating into your imagination to recharge. You struggle with a sense of being overwhelmed by the harshness of material reality. You often feel like a victim of circumstances, drifting rather than steering. Yet, inside, you possess a boundless compassion and a direct line to the divine. You feel the magic in the mundane. You are secretly waiting for a savior, or realizing that you are called to be the savior, through the power of your sacrificial love and artistic vision.'
    };

    // Derived Action Under Pressure logic (Enriched)
    const getPressureLogic = () => {
        if (!mars || !saturn) return 'In the crucible of stress, you are the rock that refuses to break. Your default response to pressure is one of endurance rather than reaction. You have a unique ability to compartmentalize the chaos, retreating into a fortress of capability where you process the challenge. While others might panic or lash out, you tend to absorb the shock, converting the pressure into a slow-burning fuel for survival. You may not move quickly, but you move inevitably. Your hidden strength is your capacity to suffer without complaining, to bear the unbearable until the storm passes. However, you must be careful not to internalize so much that you become rigid or physically ill. Your lesson is to learn that asking for help is not a crack in your armor, but a strategic opening for reinforcement.';
        const marsSign = signs[Math.floor(mars.longitude / 30)];
        if (['Aries', 'Leo', 'Sagittarius'].includes(marsSign)) {
            return 'When the temperature rises, you do not shrink; you expand. Your response to pressure is visceral and immediate—a surge of adrenaline that screams "Action!" You are the firefighter rushing *into* the burning building. You find clarity in the heat of the moment, often making split-second decisions with uncanny accuracy. Passivity is your enemy; waiting makes you anxious. You tackle obstacles by overpowering them, using your sheer force of will to change the reality of the situation. However, this high-octane response can lead to burnout. You may trample over nuances or people in your rush to solve the problem. Your challenge is to learn the warrior’s pause—the split second of assessment before the strike—ensuring that your immense energy is directed at the root of the problem, not just the symptoms.';
        }
        if (['Taurus', 'Virgo', 'Capricorn'].includes(marsSign)) {
            return 'Under pressure, you become the master of reality. You do not panic; you plan. Your nervous system cools down when things get hot, allowing you to access a pragmatic, almost ruthless efficiency. You immediately look for the structural flaw, the bottom line, the step-by-step solution. You are the one everyone looks to when the system crashes because you treat the crisis as a logistical puzzle to be solved. You can endure incredible hardship if you can see a practical end to it. However, your focus on "fixing" can make you seem cold or dismissive of the emotional fallout. You may work yourself into the ground, ignoring your body’s signals in service of the goal. Your lesson is to remember that sometimes the solution requires heart, not just calculation, and that rest is also a productive action.';
        }
        return 'In the face of pressure, you become water—fluid, adaptable, and elusive. You do not confront the boulder; you flow around it. Your strength lies in your flexibility and your intellect. When cornered, you use your words, your connections, or your intuition to navigate a way out. You are the diplomat in the war room, finding the side door that no one else saw. You may use humor, negotiation, or strategic retreat to diffuse the tension. While others might accuse you of avoidance, you know that survival often means not being where the blow lands. However, you can struggle with indecision or anxiety, paralyzed by seeing too many variables. Your challenge is to stand your ground when necessary, learning that sometimes the only way out is through, and that your emotional truth is a weapon as powerful as any sword.';
    };

    // Derived Repeating Patterns logic (Enriched)
    const getPatternLogic = () => {
        if (!rahu) return 'Your life is marked by a persistent call to move beyond the known. You often find yourself in situations that force you to trade security for growth. There is a recurring theme of "leaving the nest"—whether that is a physical home, a set of beliefs, or a comfortable identity. Destiny seems to push you into the foreign, the strange, and the unmapped. You are here to learn that your true security lies not in walls, but in your ability to adapt to the unknown. Every time you try to settle for a "normal" life, the universe throws a curveball that demands you evolve.';
        const rahuSign = signs[Math.floor(rahu.longitude / 30)];
        if (['Gemini', 'Libra', 'Aquarius'].includes(rahuSign)) {
            return 'A repeating fractal in your life involves the tension between the individual and the collective, the mind and the heart. You constantly find yourself in "boundary" situations—negotiating between warring factions, bridging different cultures, or translating between different ways of thinking. You are the eternal middleman. The pattern often manifests as a struggle with belonging: you are part of the group, yet always slightly apart. You are destined to break intellectual taboos and question societal norms. The universe keeps sending you people who challenge your ideas, forcing you to expand your definition of truth. Your loop is to move from being an observer of life to a true participant, learning that connection requires vulnerability, not just perfect communication.';
        }
        if (['Cancer', 'Scorpio', 'Pisces'].includes(rahuSign)) {
            return 'Your life story is written in the ink of emotional transformation. You find yourself looping through cycles of deep attachment and painful release. The universe repeatedly places you in situations where you must trust your intuition over logic, often in high-stakes environments involving crisis, healing, or intense intimacy. You are a psychological diver, destined to explore the depths of the human condition. The pattern often involves "saving" or "healing" others, only to realize you must save yourself. You combat recurring waves of fear or insecurity, learning each time that you are stronger and more resilient than you believed. Your destiny is to transmute pain into wisdom, moving from emotional dependency to a state of spiritual sovereignty.';
        }
        return 'The recurring motif of your life is the battle for authenticity and tangible worth. You often find yourself stripping away layers of false identity or material dependence to find what is real. The universe tests your self-worth, placing you in arenas where you must fight for your values or build something from scratch against the odds. You may experience cycles of boom and bust, or intense periods of work followed by burnout, teaching you the rhythm of sustainability. You are here to break the pattern of "proving" yourself to others. Your loop leads you away from external validation toward an unshakeable inner solidity. Destiny demands that you stand in your own power, not the power borrowed from titles, bank accounts, or social approval.';
    };

    // Core Life Theme logic (Enriched)
    const getThemeLogic = () => {
        const themeMap: Record<string, string> = {
            'Aries': 'Your soul’s primary curriculum is the paradox of Identity vs. Relationship. You are here to master the "I Am" without negating the "We Are." Your life is a laboratory for courage, teaching you that true strength is not just about conquering the external world, but about mastering your own impulses. You are learning to channel your immense pioneer energy into causes that uplift others, transforming raw aggression into protective leadership. Your destiny is to be a way-shower, proving that one individual, aligned with their truth, can change the course of history.',
            'Taurus': 'Your soul is enrolled in the school of Value and Permanence. You are here to understand the difference between price and worth, between hoarding and stewardship. Your life theme revolves around the spiritualization of matter—understanding that the physical world is a sacred vessel. You are learning to build security that comes from within, so that no external market crash can bankrupt your spirit. Your destiny is to be a guardian of the earth and its pleasures, teaching a hurried world the profound wisdom of slowing down, grounding, and finding the divine in the tangible.',
            'Gemini': 'Your soul’s journey is the mastery of Connection and Duality. You are here to heal the split between the head and the heart, the logic and the intuition. Your life is a quest to synthesize disparate fragments of truth into a cohesive whole. You are learning that while facts are useful, wisdom is essential. Your theme involves the responsible use of language—understanding that words are spells that create reality. Your destiny is to be a messenger who does not just transmit information, but who transmits understanding, bridging the gaps between isolated minds.',
            'Cancer': 'Your soul is learning the profound lesson of Emotional Security and Foundations. You are here to redefine "home" from a physical place to an internal state of being. Your life theme is the alchemy of nurturing—learning how to care for others without losing yourself, and how to receive care without feeling weak. You are healing the mother wound, whether personal or collective. Your destiny is to build a clan, a tribe, or a sanctuary where the heart is honored not as a liability, but as the ultimate source of intelligence and strength.',
            'Leo': 'Your soul’s curriculum is the mastery of Creative Power and Ego. You are here to solve the riddle of how to shine brightly without scorching those around you. Your life theme is the discovery of the "Inner Sovereign"—the part of you that is divine and worthy of love simply because it exists, not because it performs. You are healing the need for applause, replacing it with the joy of expression. Your destiny is to lead by example, radiating a warmth and generosity that empowers others to find their own light, creating a kingdom of equals.',
            'Virgo': 'Your soul is enrolled in the school of Service and Wholeness. You are here to understand that perfection is not a destination, but a process of alignment. Your life theme is the integration of the spirit into the body—walking the talk, and making the sacred practical. You are healing the critic, learning that discernment is a tool for love, not judgment. Your destiny is to be a healer or a craftsman who restores order and health, teaching the world that true holiness is found in the humble, daily dedication to doing things well.',
            'Libra': 'Your soul’s journey is the mastery of Harmony and the Mirror of the Other. You are here to learn that true peace is not the absence of conflict, but the dynamic resolution of opposites. Your life theme involves finding your own center so that you do not lose yourself in relationships. You are healing the fear of displeasing others, learning to wield the sword of truth with a velvet glove. Your destiny is to be a peacemaker and an artist of life, showing the world that justice, beauty, and truth are one and the same.',
            'Scorpio': 'Your soul is learning the intense lessons of Power, Transformation, and Surrender. You are here to dive into the unconscious and retrieve the gold that is hidden in the shadow. Your life theme is the death of the ego and the rebirth of the spirit. You are healing the fear of betrayal and the need for control. Your destiny is to be a psychological surgeon or a shaman, one who can look at the darkness without blinking and transmute pain into power, leading others through their own darkest nights.',
            'Sagittarius': 'Your soul’s curriculum is the Quest for Meaning and Natural Law. You are here to bridge the gap between the mundane and the cosmic. Your life theme is the challenge of freedom—learning that true liberty involves commitment to a higher truth. You are healing the dogmatist, understanding that the map is not the territory. Your destiny is to be a philosopher-adventurer who keeps the human spirit expanding, reminding us that we are not just biological accidents, but pilgrims on a magnificent, purposeful journey.',
            'Capricorn': 'Your soul is enrolled in the master class of Authority and Legacy. You are here to learn the spiritual nature of responsibility. Your life theme is the ascent of the mountain—achieving worldly success without losing your soul. You are healing the father wound and the fear of failure. Your destiny is to be a wise elder or a conscious leader who builds structures that support life rather than stifle it, understanding that the only authority worth having is the authority over oneself.',
            'Aquarius': 'Your soul’s journey is the mastery of Individuality and Collective Evolution. You are here to solve the tension between fitting in and standing out. Your life theme is the liberation of the mind from the conditioning of the past. You are healing the wound of alienation, learning that your difference is your gift. Your destiny is to be a visionary and a friend to humanity, pouring the water of new consciousness onto the parched fields of the old world, showing us that the future is something we create together.',
            'Pisces': 'Your soul is learning the ultimate lesson of Unity and Boundless Love. You are here to dissolve the walls of the ego and experience the oneness of all life. Your life theme is the grounding of the dream—bringing heaven down to earth. You are healing the victim, learning that surrender is an act of spiritual power, not weakness. Your destiny is to be a mystic, an artist, or a compassionate server who reminds the world that love is the only reality, and that beneath our separate waves, we are all the same ocean.'
        };
        return themeMap[ascSign] || themeMap['Aries'];
    };

    // D1 / Birth Chart Logic (Preserving enriched content)
    if (key === 'D1' || key === 'Rashi' || key === 'Birth Chart' || key === 'Main') {
        return [
            {
                title: 'Natural Orientation',
                question: 'Who am i by default?',
                text: orientationLibrary[ascSign] || orientationLibrary['Aries']
            },
            {
                title: 'Inner Emotional World',
                question: 'What do i feel inside that others may not see?',
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
    }

    // Dynamic Logic for Divisional Charts
    let questions = [];

    // Note: In a full production app, each of these would have its own 100+ word library like above.
    // We are implementing the structure to support it.
    if (key === 'D9') {
        questions = [
            {
                title: 'Spiritual Backbone',
                question: 'What is the root of your spiritual strength?',
                text: `In the Navamsa (D9), your ${ascSign} Ascendant reveals the inner fruit of your natal tree. It represents your true, internal nature that develops over time, especially in the second half of life. While your D1 shows how you meet the world, your D9 ${ascSign} shows who you are when you are alone with your spirit. It suggests a path where your spiritual strength comes from cultivating ${ascSign}-like qualities: independence, resilience, or harmony depending on the sign. This is the chart of your "dharmic" destiny.`
            },
            {
                title: 'Relationship Dynamics',
                question: 'How do you relate to your significant others?',
                text: `Your D9 Moon in ${moonSign} (or the general planetary balance) indicates that in your most intimate partnerships, you seek emotional fulfillment through specific channels. Unlike the D1 which shows initial attraction, the D9 reveals what sustains a marriage or long-term union for you. It points to a need for a partner who resonates with the energy of your inner self.`
            },
            {
                title: 'Inner Destiny',
                question: 'Where is your soul evolving towards?',
                text: `The overarching purpose shown in the Navamsa is one of refinement. The planets here show the strength of your natal planets. If a planet is strong here, its results in the physical world will last. Your journey is about aligning your outer actions (D1) with this inner purpose (D9).`
            }
        ];
    } else if (key === 'D10') {
        questions = [
            {
                title: 'Career Impact',
                question: 'How do you naturally influence the world through work?',
                text: `Your Dasamsa (D10) Ascendant in ${ascSign} suggests a professional style defined by this sign's qualities. Whether you are leading, supporting, or innovating, your greatest impact comes when you channel ${ascSign} energy. This chart zooms in on your "Karma" or actions in society.`
            },
            {
                title: 'Professional Stability',
                question: 'What drives your ambition?',
                text: `The D10 chart reveals the fruits of your labor. Placements here indicate the magnitude of success and the nature of your status. Your drive is fueled by a desire to achieve specific outcomes related to your planetary periods.`
            }
        ];
    } else if (['D2', 'D4', 'D16'].includes(key)) { // Abundance Group
        questions = [
            {
                title: 'Material Flow',
                question: 'How does abundance flow into your life?',
                text: `This ${key} chart analyzes your material resources and assets. The placements here suggest that your wealth/assets accumulate through specific channels associated with the ${ascSign} energy. It highlights your capacity to retain and grow what you earn.`
            },
            {
                title: 'Comfort & Security',
                question: 'What brings you a sense of security?',
                text: `Beyond just money, this chart looks at what makes you feel secure and "at home" in the material world. It points to the psychological comfort derived from your tangible achievements.`
            }
        ];
    } else {
        // Generic Fallback for other charts
        questions = [
            {
                title: `${key} Essence`,
                question: `What is the core essence of this ${key} chart?`,
                text: `The ${key} chart acts as a microscopic view of a specific area of your life. With the Ascendant in ${ascSign}, your approach to the matters of this chart (whether health, spirituality, or siblings) starts with an attitude of ${ascSign}.`
            },
            {
                title: 'Hidden Potential',
                question: 'Where lies your untapped potential here?',
                text: `Planetary placements in this divisional chart suggest hidden reserves of strength or specific challenges to be overcome to unlock the full potential of this life area.`
            }
        ];
    }

    return questions;
};

export default function ChartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Profile Management State
    const [activeProfiles, setActiveProfiles] = useState<UserProfile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const [profileLimit, setProfileLimit] = useState(5);
    const [canAddMore, setCanAddMore] = useState(true);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [activeChart, setActiveChart] = useState<string | null>(null);
    const [unlocking, setUnlocking] = useState<string | null>(null);
    const [serviceCosts, setServiceCosts] = useState<Record<string, number>>({});
    const [confirmModal, setConfirmModal] = useState<{ show: boolean; chartKey: string; cost: number } | null>(null);
    const [noCreditsModal, setNoCreditsModal] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Abundance');
    const [isExporting, setIsExporting] = useState(false);

    // Fetch all active profiles on mount
    useEffect(() => {
        if (session?.user) {
            fetchActiveProfiles();
        }
    }, [session]);

    const fetchActiveProfiles = async () => {
        try {
            const res = await fetch('/api/profiles/active');
            const data = await res.json();

            setActiveProfiles(data.profiles || []);
            setProfileLimit(data.limit || 5);
            setCanAddMore(data.canAddMore || false);

            // Select profile from URL or default to first
            const profileIdFromUrl = searchParams.get('profileId');
            let targetProfile = null;

            if (profileIdFromUrl) {
                targetProfile = data.profiles.find((p: UserProfile) => p.id === profileIdFromUrl);
            }

            if (!targetProfile && data.profiles.length > 0) {
                targetProfile = data.profiles[0];
            }

            if (targetProfile) {
                setSelectedProfile(targetProfile);
                setProfile(targetProfile);
                if (targetProfile.chartData) {
                    setChartData(targetProfile.chartData as ChartData);
                }
            }
        } catch (error) {
            console.error('Failed to fetch active profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function fetchCosts() {
            try {
                const res = await fetch('/api/services');
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

    // Profile Management Handlers
    const handleSelectProfile = (profileId: string) => {
        const profile = activeProfiles.find(p => p.id === profileId);
        if (profile) {
            setSelectedProfile(profile);
            setProfile(profile);
            if (profile.chartData) {
                setChartData(profile.chartData as ChartData);
            }
            // Update URL
            router.push(`/chart?profileId=${profileId}`);
        }
    };

    const handleAddProfile = () => {
        if (canAddMore) {
            setShowProfileDrawer(true);
        } else {
            setShowLimitModal(true);
        }
    };

    const handleUpgradeLimit = async () => {
        try {
            const res = await fetch('/api/profiles/expand-limit', {
                method: 'POST',
            });

            if (res.ok) {
                await fetchActiveProfiles();
                setShowLimitModal(false);
                setShowProfileDrawer(true);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to expand limit');
            }
        } catch (error) {
            console.error('Expansion error:', error);
            alert('Failed to expand profile limit');
        }
    };

    const handleManageProfiles = () => {
        setShowLimitModal(false);
        router.push('/dashboard?section=profiles');
    };

    const handleProfileCreated = () => {
        fetchActiveProfiles();
        setShowProfileDrawer(false);
    };

    const handleChartGenerated = async (data: ChartData) => {
        try {
            await fetchActiveProfiles();
        } catch (error) {
            console.error('Failed to refresh profile:', error);
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
            <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
                <div className="text-left w-full">
                    <h1 className={styles.title}>Varga Portfolio</h1>
                    <div className={styles.subtitle}>
                        <p>Cosmic blueprint for <span className="text-[var(--primary)] font-semibold">{profile?.name}</span> • {new Date(profile!.dateOfBirth).toLocaleDateString()}</p>
                        {profile && profile.chartData && (
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1 gap-x-4 text-xs text-[var(--text-muted)] font-medium tracking-wide">
                                <div><span className="text-[var(--primary-dark)]">Birth Time:</span> {(function (t) {
                                    const [h, m] = t.split(':');
                                    const H = parseInt(h);
                                    const ampm = H >= 12 ? 'PM' : 'AM';
                                    const H12 = H % 12 || 12;
                                    return `${H12}:${m} ${ampm}`;
                                })(profile.timeOfBirth)}</div>
                                <div><span className="text-[var(--primary-dark)]">Birth Place:</span> {profile.placeOfBirth}</div>
                                <div><span className="text-[var(--primary-dark)]">Ascendant Sign:</span> {getZodiacSign(profile.chartData.ascendant)}</div>
                                <div><span className="text-[var(--primary-dark)]">Moon Sign:</span> {getZodiacSign(profile.chartData.planets.Moon.longitude)}</div>
                                <div><span className="text-[var(--primary-dark)]">Western Zodiac:</span> {(function (d) {
                                    const m = d.getMonth() + 1, da = d.getDate();
                                    if ((m == 3 && da >= 21) || (m == 4 && da <= 19)) return "Aries";
                                    if ((m == 4 && da >= 20) || (m == 5 && da <= 20)) return "Taurus";
                                    if ((m == 5 && da >= 21) || (m == 6 && da <= 20)) return "Gemini";
                                    if ((m == 6 && da >= 21) || (m == 7 && da <= 22)) return "Cancer";
                                    if ((m == 7 && da >= 23) || (m == 8 && da <= 22)) return "Leo";
                                    if ((m == 8 && da >= 23) || (m == 9 && da <= 22)) return "Virgo";
                                    if ((m == 9 && da >= 23) || (m == 10 && da <= 22)) return "Libra";
                                    if ((m == 10 && da >= 23) || (m == 11 && da <= 21)) return "Scorpio";
                                    if ((m == 11 && da >= 22) || (m == 12 && da <= 21)) return "Sagittarius";
                                    if ((m == 12 && da >= 22) || (m == 1 && da <= 19)) return "Capricorn";
                                    if ((m == 1 && da >= 20) || (m == 2 && da <= 18)) return "Aquarius";
                                    return "Pisces";
                                })(new Date(profile.dateOfBirth))}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Management UI */}
                {activeProfiles.length > 0 && (
                    <ProfileTabs
                        profiles={activeProfiles}
                        activeProfileId={selectedProfile?.id}
                        onSelectProfile={handleSelectProfile}
                        onAddProfile={handleAddProfile}
                        onUpgradeLimit={() => setShowLimitModal(true)}
                        canAddMore={canAddMore}
                        currentCount={activeProfiles.length}
                        maxProfiles={profileLimit}
                    />
                )}

                <ProfileDrawer
                    isOpen={showProfileDrawer}
                    onClose={() => setShowProfileDrawer(false)}
                    onSuccess={handleProfileCreated}
                />

                <ProfileLimitModal
                    isOpen={showLimitModal}
                    onClose={() => setShowLimitModal(false)}
                    onUpgrade={handleUpgradeLimit}
                    onManageProfiles={handleManageProfiles}
                    currentCount={activeProfiles.length}
                    maxProfiles={profileLimit}
                    expansionCost={50}
                />

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
                                    {['Overview', 'Your Story', 'Planet Placement & Expression'].map((tab, idx) => (
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

                                        {activeTab === 2 && (
                                            <div className={styles.tabSection}>
                                                <h4>Planet Placement & Expression</h4>
                                                <p>
                                                    This section reveals the refined state of each planetary energy in this specific department of your life.
                                                    It details the sign, house, and precise degree of each planet, offering a granular view of your karmic map.
                                                </p>
                                                <div className={styles.tableWrapper} style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                                                    <table className={styles.modernTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Planet</th>
                                                                <th>Sign</th>
                                                                <th>Sign Lord</th>
                                                                <th>Degree</th>
                                                                <th>House</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {PLANET_SORT_ORDER.map(pName => {
                                                                const varga = profile.chartData?.vargas?.[activeChart];
                                                                if (!varga) return null;
                                                                let pData = null;
                                                                if (pName === 'Ascendant') {
                                                                    pData = { name: 'Ascendant', longitude: varga.ascendant, isAsc: true };
                                                                } else {
                                                                    pData = varga.planets?.[pName];
                                                                }

                                                                if (!pData) return null;

                                                                const signIndex = Math.floor(pData.longitude / 30);
                                                                const signName = getZodiacSign(pData.longitude);
                                                                const signLord = SIGN_LORDS[signName] || '-';
                                                                const ascIndex = Math.floor((varga.ascendant || 0) / 30);
                                                                const house = getHouseNumber(signIndex, ascIndex);
                                                                const degree = formatDegree(pData.longitude);

                                                                return (
                                                                    <tr key={pName}>
                                                                        <td className="font-medium text-[var(--foreground)]">{pName}</td>
                                                                        <td>{signName}</td>
                                                                        <td>{signLord}</td>
                                                                        <td className="font-mono text-xs opacity-75">{degree}</td>
                                                                        <td>{house}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-serif text-[var(--accent-gold)] border-b border-[var(--border-color)] pb-2 mb-4">Planetary Detailed Analysis</h3>
                                                    {PLANET_SORT_ORDER.filter(p => p !== 'Ascendant').map(pName => {
                                                        const varga = profile.chartData?.vargas?.[activeChart];
                                                        if (!varga) return null;
                                                        const pData = varga.planets?.[pName];
                                                        if (!pData) return null;

                                                        const signIndex = Math.floor(pData.longitude / 30);
                                                        const signName = getZodiacSign(pData.longitude);
                                                        const ascIndex = Math.floor((varga.ascendant || 0) / 30);
                                                        const house = getHouseNumber(signIndex, ascIndex);

                                                        const getOrdinal = (n: number) => {
                                                            const s = ["th", "st", "nd", "rd"];
                                                            const v = n % 100;
                                                            return s[(v - 20) % 10] || s[v] || s[0];
                                                        };

                                                        const aspects = getAspects(pName, signIndex, varga.planets);
                                                        const conjunctions = getConjunctions(pName, signIndex, varga.planets);

                                                        const aspectText = aspects.length > 0 ? `It receives aspects from ${aspects.join(', ')}.` : 'It is not aspected by major planets.';
                                                        const conjunctText = conjunctions.length > 0 ? `It is conjunct with ${conjunctions.join(', ')}.` : 'It stands alone in this sign.';

                                                        const getDetailedInsight = (planet: string, sign: string, house: number, chart: string) => {
                                                            const planetQualities: Record<string, string> = {
                                                                'Sun': 'your core identity, vitality, and life purpose',
                                                                'Moon': 'your emotional nature, instincts, and subconscious mind',
                                                                'Mercury': 'your communication style, thinking patterns, and learning approach',
                                                                'Venus': 'your values, relationships, and sense of beauty',
                                                                'Mars': 'your drive, energy, and how you assert yourself',
                                                                'Jupiter': 'your growth, wisdom, and sense of opportunity',
                                                                'Saturn': 'your discipline, responsibilities, and life lessons',
                                                                'Rahu': 'your worldly desires and areas of intense focus',
                                                                'Ketu': 'your past life skills and areas of spiritual detachment'
                                                            };

                                                            const houseThemes: Record<number, string> = {
                                                                1: 'your personality, physical body, and how you approach life',
                                                                2: 'your wealth, family values, and speech',
                                                                3: 'your courage, siblings, and communication skills',
                                                                4: 'your home life, mother, and emotional foundations',
                                                                5: 'your creativity, children, and intelligence',
                                                                6: 'your health, daily routines, and ability to overcome obstacles',
                                                                7: 'your partnerships, marriage, and business relationships',
                                                                8: 'your transformation, inheritance, and hidden matters',
                                                                9: 'your higher learning, spirituality, and fortune',
                                                                10: 'your career, public reputation, and achievements',
                                                                11: 'your gains, friendships, and long-term goals',
                                                                12: 'your spirituality, losses, and liberation'
                                                            };

                                                            const planetQuality = planetQualities[planet] || 'this area of life';
                                                            const houseTheme = houseThemes[house] || 'this life area';

                                                            return `This placement reveals important information about how ${planetQuality} manifests in your life. When ${planet} is positioned in ${sign}, it takes on the qualities of this zodiac sign - shaping how this planetary energy expresses itself. ${sign} influences the way ${planet} operates, coloring your experiences in the ${house}${getOrdinal(house)} house, which governs ${houseTheme}. This combination creates a unique expression where the natural significations of ${planet} blend with the characteristics of ${sign}, directly impacting how you experience and navigate matters related to the ${house}${getOrdinal(house)} house. In the context of the ${chart} chart, this placement provides deeper insight into ${chart === 'D9' ? 'your marriage, partnerships, and inner spiritual strength' : chart === 'D10' ? 'your professional path, career achievements, and public standing' : chart === 'D1' ? 'your fundamental life experiences and overall personality' : 'this specific dimension of your life'}. Understanding this placement helps you recognize patterns, leverage strengths, and navigate challenges with greater self-awareness and clarity.`;
                                                        };

                                                        return (
                                                            <div key={pName} className="p-6 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]/50 shadow-sm relative overflow-hidden group hover:border-[var(--accent-gold)]/50 transition-all duration-300">
                                                                <h5 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '1.5rem' }} className="text-[var(--primary)] flex items-center flex-wrap gap-3">
                                                                    <span>{pName} in {signName}</span>
                                                                    <span className="text-[var(--foreground)] opacity-70"> - </span>
                                                                    <span className="text-[var(--primary)]" style={{ fontSize: '2.25rem', fontWeight: 700 }}>
                                                                        {house}{getOrdinal(house)} House
                                                                    </span>
                                                                </h5>
                                                                <div style={{ fontSize: '1.125rem', lineHeight: '1.75' }} className="text-[var(--foreground)] opacity-90 space-y-4">
                                                                    <p>
                                                                        <strong>Placement:</strong> {pName} is placed in the <strong>{house}{getOrdinal(house)} House</strong> in the sign of <strong>{signName}</strong>.
                                                                    </p>
                                                                    <p>
                                                                        <strong>Associations:</strong> {conjunctText} {aspectText}
                                                                    </p>
                                                                    <p>
                                                                        <strong>Insight:</strong> <span className="italic">{getDetailedInsight(pName, signName, house, activeChart)}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
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
