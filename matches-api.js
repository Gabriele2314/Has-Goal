// ===================================
// Football Matches API Integration
// ===================================

// CONFIGURAZIONE API
// Usa API-Football (gratuita): https://www.api-football.com/
// Registrati e ottieni la tua API key gratuita
const FOOTBALL_API_CONFIG = {
    // 🔴 IMPORTANTE: Sostituisci con la TUA API key da api-football.com
    API_KEY: 'YOUR_API_FOOTBALL_KEY', // Registrati su https://dashboard.api-football.com/register
    BASE_URL: 'https://v3.football.api-sports.io',

    // Configurazione leghe (IDs da API-Football)
    LEAGUES: {
        SERIE_A: 135,
        CHAMPIONS_LEAGUE: 2,
        EUROPA_LEAGUE: 3,
        PREMIER_LEAGUE: 39,
        LA_LIGA: 140,
        BUNDESLIGA: 78,
        LIGUE_1: 61
    },

    // Cache settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minuti
};

// ===================================
// Matches API Manager
// ===================================

class MatchesAPI {
    constructor() {
        this.cache = {
            data: null,
            timestamp: null
        };
    }

    // Controlla se cache è valida
    isCacheValid() {
        if (!this.cache.data || !this.cache.timestamp) return false;
        const now = Date.now();
        return (now - this.cache.timestamp) < FOOTBALL_API_CONFIG.CACHE_DURATION;
    }

    // Fetch partite FUTURE (da giocare)
    async getUpcomingMatches(leagues = [135], days = 7) {
        // Usa cache se valida
        if (this.isCacheValid()) {
            console.log('📦 Using cached matches data');
            return this.cache.data;
        }

        // Controlla se API key è configurata
        if (!FOOTBALL_API_CONFIG.API_KEY || FOOTBALL_API_CONFIG.API_KEY === 'YOUR_API_FOOTBALL_KEY') {
            console.warn('⚠️ API key non configurata. Usando dati mock.');
            return this.getMockUpcomingMatches();
        }

        try {
            console.log('🌐 Fetching upcoming matches from API...');

            // Calcola data fino a (prossimi X giorni)
            const toDate = new Date();
            toDate.setDate(toDate.getDate() + days);
            const dateStr = toDate.toISOString().split('T')[0];

            // Fetch per ogni lega
            const allMatches = [];

            for (const leagueId of leagues) {
                const url = `${FOOTBALL_API_CONFIG.BASE_URL}/fixtures?league=${leagueId}&season=2026&status=NS&next=20`;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': FOOTBALL_API_CONFIG.API_KEY
                    }
                });

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();

                if (data.response && data.response.length > 0) {
                    allMatches.push(...data.response);
                }
            }

            // Trasforma in formato app
            const matches = this.transformUpcomingMatches(allMatches);

            // Salva in cache
            this.cache.data = matches;
            this.cache.timestamp = Date.now();

            console.log(`✅ Fetched ${matches.length} upcoming matches`);
            return matches;

        } catch (error) {
            console.error('❌ Error fetching matches:', error);
            // Fallback a dati mock
            return this.getMockUpcomingMatches();
        }
    }

    // Trasforma dati API in formato app
    transformMatches(apiMatches) {
        return apiMatches.map(match => ({
            id: match.fixture.id,
            competition: `${match.league.flag || '⚽'} ${match.league.name} • ${match.league.round}`,
            homeTeam: {
                id: match.teams.home.id,
                name: match.teams.home.name,
                logo: match.teams.home.logo || this.getTeamEmoji(match.teams.home.name)
            },
            awayTeam: {
                id: match.teams.away.id,
                name: match.teams.away.name,
                logo: match.teams.away.logo || this.getTeamEmoji(match.teams.away.name)
            },
            homeScore: match.goals.home,
            awayScore: match.goals.away,
            matchStatus: match.fixture.status.short === 'FT' ? "90' FT" : match.fixture.status.short,
            date: new Date(match.fixture.date),
            stats: {
                goals: match.goals.home + match.goals.away,
                cards: 0 // API-Football richiede endpoint separato per statistiche dettagliate
            },
            venue: match.fixture.venue?.name || 'N/A',
            referee: match.fixture.referee || 'N/A'
        }));
    }

    // Trasforma partite FUTURE (da giocare)
    transformUpcomingMatches(apiMatches) {
        return apiMatches.map(match => ({
            id: match.fixture.id,
            competition: `${match.league.flag || '⚽'} ${match.league.name} • ${match.league.round}`,
            homeTeam: {
                id: match.teams.home.id,
                name: match.teams.home.name,
                logo: match.teams.home.logo || this.getTeamEmoji(match.teams.home.name)
            },
            awayTeam: {
                id: match.teams.away.id,
                name: match.teams.away.name,
                logo: match.teams.away.logo || this.getTeamEmoji(match.teams.away.name)
            },
            matchStatus: 'Scheduled',
            date: new Date(match.fixture.date),
            venue: match.fixture.venue?.name || 'N/A',
            // Per prediction - nessun risultato ancora
            homeScore: null,
            awayScore: null,
            isPrediction: true
        }));
    }

    // Emoji squadra (fallback se logo non disponibile)
    getTeamEmoji(teamName) {
        const emojiMap = {
            'Inter': '⚫🔵',
            'Milan': '🔴⚫',
            'Juventus': '⚪⚫',
            'Napoli': '🔵',
            'Roma': '🟡🔴',
            'Lazio': '⚪🔵',
            'Atalanta': '⚫🔵',
            'Fiorentina': '🟣',
            'Torino': '🟤',
            'Bologna': '🔴🔵'
        };

        return emojiMap[teamName] || '⚽';
    }

    // Dati mock PARTITE FUTURE per testing
    // Partite reali della giornata di Serie A
    getMockUpcomingMatches() {
        const now = new Date();

        // Base URL per loghi da football-logos.cc
        const logoBase = 'https://football-logos.cc/logos/serie-a';

        return [
            {
                id: 'serie-a-inter-pisa',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'inter',
                    name: 'Inter',
                    logo: `${logoBase}/inter-milan.svg`
                },
                awayTeam: {
                    id: 'pisa',
                    name: 'Pisa',
                    logo: `${logoBase}/pisa.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Tra 2 giorni
                venue: 'San Siro',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-como-torino',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'como',
                    name: 'Como',
                    logo: `${logoBase}/como.svg`
                },
                awayTeam: {
                    id: 'torino',
                    name: 'Torino',
                    logo: `${logoBase}/torino.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Giuseppe Sinigaglia',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-fiorentina-cagliari',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'fiorentina',
                    name: 'Fiorentina',
                    logo: `${logoBase}/fiorentina.svg`
                },
                awayTeam: {
                    id: 'cagliari',
                    name: 'Cagliari',
                    logo: `${logoBase}/cagliari.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Artemio Franchi',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-lecce-lazio',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'lecce',
                    name: 'Lecce',
                    logo: `${logoBase}/lecce.svg`
                },
                awayTeam: {
                    id: 'lazio',
                    name: 'Lazio',
                    logo: `${logoBase}/lazio.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Via del Mare',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-sassuolo-cremonese',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'sassuolo',
                    name: 'Sassuolo',
                    logo: `${logoBase}/sassuolo.svg`
                },
                awayTeam: {
                    id: 'cremonese',
                    name: 'Cremonese',
                    logo: `${logoBase}/cremonese.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // Tra 3 giorni
                venue: 'Mapei Stadium',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-atalanta-parma',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'atalanta',
                    name: 'Atalanta',
                    logo: `${logoBase}/atalanta.svg`
                },
                awayTeam: {
                    id: 'parma',
                    name: 'Parma',
                    logo: `${logoBase}/parma.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                venue: 'Gewiss Stadium',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-genoa-bologna',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'genoa',
                    name: 'Genoa',
                    logo: `${logoBase}/genoa.svg`
                },
                awayTeam: {
                    id: 'bologna',
                    name: 'Bologna',
                    logo: `${logoBase}/bologna.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Luigi Ferraris',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-juventus-napoli',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'juventus',
                    name: 'Juventus',
                    logo: `${logoBase}/juventus.svg`
                },
                awayTeam: {
                    id: 'napoli',
                    name: 'Napoli',
                    logo: `${logoBase}/napoli.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // Tra 4 giorni
                venue: 'Allianz Stadium',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-roma-milan',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'roma',
                    name: 'Roma',
                    logo: `${logoBase}/roma.svg`
                },
                awayTeam: {
                    id: 'milan',
                    name: 'Milan',
                    logo: `${logoBase}/milan.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Olimpico',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            },
            {
                id: 'serie-a-verona-udinese',
                competition: '🇮🇹 Serie A • Giornata 22',
                homeTeam: {
                    id: 'verona',
                    name: 'Verona',
                    logo: `${logoBase}/verona.svg`
                },
                awayTeam: {
                    id: 'udinese',
                    name: 'Udinese',
                    logo: `${logoBase}/udinese.svg`
                },
                matchStatus: 'Scheduled',
                date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
                venue: 'Stadio Marcantonio Bentegodi',
                homeScore: null,
                awayScore: null,
                isPrediction: true
            }
        ];
    }

    // Dati mock per testing (quando API non configurata)
    getMockMatches() {
        const now = new Date();

        return [
            {
                id: 'mock-1',
                competition: '🇮🇹 Serie A • Giornata 21',
                homeTeam: { id: 'inter', name: 'Inter', logo: '⚫🔵' },
                awayTeam: { id: 'milan', name: 'Milan', logo: '🔴⚫' },
                homeScore: 3,
                awayScore: 1,
                matchStatus: "90' FT",
                date: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h fa
                stats: { goals: 4, cards: 3 },
                venue: 'San Siro',
                referee: 'Daniele Orsato'
            },
            {
                id: 'mock-2',
                competition: '🇮🇹 Serie A • Giornata 21',
                homeTeam: { id: 'juventus', name: 'Juventus', logo: '⚪⚫' },
                awayTeam: { id: 'napoli', name: 'Napoli', logo: '🔵' },
                homeScore: 2,
                awayScore: 2,
                matchStatus: "90' FT",
                date: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3h fa
                stats: { goals: 4, cards: 5 },
                venue: 'Allianz Stadium',
                referee: 'Maurizio Mariani'
            },
            {
                id: 'mock-3',
                competition: '🇮🇹 Serie A • Giornata 21',
                homeTeam: { id: 'roma', name: 'Roma', logo: '🟡🔴' },
                awayTeam: { id: 'lazio', name: 'Lazio', logo: '⚪🔵' },
                homeScore: 1,
                awayScore: 0,
                matchStatus: "90' FT",
                date: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5h fa
                stats: { goals: 1, cards: 2 },
                venue: 'Stadio Olimpico',
                referee: 'Marco Di Bello'
            },
            {
                id: 'mock-4',
                competition: '⭐ Champions League • Round of 16',
                homeTeam: { id: 'inter', name: 'Inter', logo: '⚫🔵' },
                awayTeam: { id: 'barcelona', name: 'Barcelona', logo: '🔴🔵' },
                homeScore: 2,
                awayScore: 1,
                matchStatus: "90' FT",
                date: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 giorno fa
                stats: { goals: 3, cards: 4 },
                venue: 'San Siro',
                referee: 'Clément Turpin'
            }
        ];
    }

    // Formatta tempo relativo (es. "2h fa")
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m fa`;
        if (hours < 24) return `${hours}h fa`;
        return `${days}g fa`;
    }

    // Formatta tempo futuro (es. "tra 2 giorni")
    getRelativeTimeFuture(date) {
        const now = new Date();
        const diff = date - now;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (diff < 0) return 'In corso';
        if (minutes < 60) return `tra ${minutes}m`;
        if (hours < 24) return `tra ${hours}h`;
        if (days === 1) return 'Domani';
        return `tra ${days}g`;
    }
}

// Istanza globale
const matchesAPI = new MatchesAPI();
window.matchesAPI = matchesAPI;

// ===================================
// Auto-fetch partite all'avvio
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Pre-loading upcoming matches...');

    // Fetch partite FUTURE in background
    const leagues = [
        FOOTBALL_API_CONFIG.LEAGUES.SERIE_A,
        FOOTBALL_API_CONFIG.LEAGUES.CHAMPIONS_LEAGUE
    ];

    await matchesAPI.getUpcomingMatches(leagues, 7); // Prossimi 7 giorni
    console.log('✅ Upcoming matches pre-loaded');
});
