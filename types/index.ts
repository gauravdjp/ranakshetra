// basic information that can be reused in types
export type Basic_Info = {
    name : string,
    email : string,
    username : string,
    password : string,
    phone? : number,
    date_of_birth? : Date,
    city : string,
    state : string,
    country : string,
    created_at : Date,
    updated_at : Date,
    access_role : Access_Level,          // FIX: was hardcoded to Access_Level.USER
}
/*--------------------------------------------------------*/


//access levels types and enums

export enum Access_Level{
    USER = "user",
    ADMIN = "admin",
}

export enum Access_Level_USER_Role{
    PLAYER = "player",
    ORGANISER = "organiser",
    CLUB = "club_leader",
}

export enum Access_Level_ADMIN_Role{
    DEVELOPER = "developer",
}
/*--------------------------------------------------------*/


export type User = {
    username : string,
    email : string,
    password : string,
    role : Access_Level_USER_Role,
}
/*--------------------------------------------------------*/


//organisers types and enums

export type Organiser = Basic_Info & {
    _id? : string,
    role : Access_Level_USER_Role.ORGANISER,
    arena_name : string,
    arena_location : string,
    arena_description? : string,
    arena_image? : string,
    is_verified : boolean,
}
/*--------------------------------------------------------*/


//players types and enums

export type Player = Basic_Info & {
    _id? : string,
    role : Access_Level_USER_Role.PLAYER,
    games : Games[],
    player_tag : string,
    skill_level : string,
    tourney_games : string[],
    device : string,
    profile_image? : string,
    description? : string,
    region? : string,                   // FIX: added — used in UI and in-game API
    fav_game? : Games,                  // FIX: added — used in player profile page
    is_verified : boolean,
}
/*--------------------------------------------------------*/


//clubs types and enums

export type Club = Basic_Info & {
    _id? : string,
    role : Access_Level_USER_Role.CLUB,
    club_name : string,
    club_tag : string,                  // short identifier e.g. #SHDW
    club_description? : string,
    club_image? : string,
    supported_games : Games[],
    members? : string[],                // array of player _id references
    is_verified : boolean,
}

// FIX: was a broken type object — converted to proper enum
export enum Club_Roles {
    LEADER     = "leader",
    CO_LEADER  = "co_leader",
    ELDER      = "elder",
    MEMBER     = "member",
}
/*--------------------------------------------------------*/


//tournament types and enums

export enum Tournament_Types{
    SOLO = "solo",
    TEAM = "team",
    SQUAD = "squad",
    DUO = "duo",
    SINGLE_ELIMINATION = "single_elimination",
    DOUBLE_ELIMINATION = "double_elimination",
    ROUND_ROBIN = "round_robin",
    SWISS_SYSTEM = "swiss_system",

}
export type Tournament = {
   
    _id?: string;
    title: string;
    organizer_id: string;
 
    start_date: Date;
    end_date: Date;
    registration_start_date?: Date;    // when registration opens
    registration_deadline: Date;       // when registration closes
    created_at: Date;
    updated_at: Date;

    prize_pool: number;
    entry_fee: number;
    participants_limit: number;
    registered_teams?: number;
    registered_players?: number;

    single_player: boolean;
    team_based: boolean;
    tournament_type: Tournament_Types;
    region: string;
    game_id: string;

    status: 'draft' | 'upcoming' | 'registration_open' | 'ongoing' | 'completed' | 'cancelled';
    visibility: 'public' | 'private';
    brackets_generated: boolean;
    results_declared: boolean;
    progress: number; 

    description?: string;
    banner_url?: string;
    sponsors?: string[];
    participants_profile?: In_Game_Details[];
    
    format_rules: string;
};

export type Tournament_Registration = {
    _id?: string;
    tournament_id: string;
    player_tag: string;
    username : string;
    joinedAt: Date;
}

// FIX: Match was completely empty — added minimal structure
export type Match = {
    _id?: string;
    tournament_id: string;
    bracket_match_id: string;          // references BracketMatch.matchId
    player1_tag: string;
    player2_tag: string;
    winner_tag?: string;
    score?: string;
    played_at?: Date;
    status: "pending" | "live" | "completed";
}

export type BracketPlayer = {
  tag: string;
  name: string;
};

export type BracketMatch = {
  matchId: string;           // "r0m0"
  round: number;
  index: number;
  player1: { tag: string; name: string };
  player2: { tag: string; name: string } | null;  // null = bye
  winner_tag: string | null;
  status: "pending" | "live" | "completed";
  isBye: boolean;
  started_at: string | null;
}

export type BracketDocument = {
  tournament_id: string;
  type: "standard" | "bye";
  total_rounds: number;
  matches: BracketMatch[];
  created_at: string;
  updated_at: string;
}
/*--------------------------------------------------------*/


//arena types and enums

export type Arena = {
    _id?: string;
    arena_name: string;
    arena_location: string;
    arena_city: string;
    arena_state: string;
    arena_description?: string;
    arena_image?: string;
    organizer_id: string;
    organizer_name?: string;
    supported_games?: string[];
    capacity?: number;
    is_verified: boolean;
    created_at?: Date;
    updated_at?: Date;
}

// FIX: was completely empty — added basic arena role enum
export enum Arena_Roles {
    OWNER    = "owner",
    MANAGER  = "manager",
    STAFF    = "staff",
}
/*--------------------------------------------------------*/


//games types and enums
export enum Games{
    CLASH_ROYALE = "CLASH ROYALE",
}

// FIX: game was Games[] (array) — changed to Games (single game per detail record)
export type In_Game_Details = {
    game : Games,
    username : string,
    rank? : number,
    trophies? : number,
    level? : number,
}

// ClashRoyaleDetails: DB-side representation (snake_case, stored in player record)
export type ClashRoyaleDetails = In_Game_Details & {
    player_tag: string;
    player_name: string;
    exp_level: number;

    best_trophies: number;
    current_trophies: number;
    arena: string;

    wins: number;
    losses: number;
    draws: number;
    three_crown_wins: number;
    challenge_max_wins?: number;
    war_day_wins?: number;

    clan_name?: string;
    clan_tag?: string;
    clan_role?: Club_Roles;           // FIX: now uses the Club_Roles enum
    total_donations: number;
    
    favorite_card?: string;
    current_deck?: string[]; 
};

// CRApiData: Raw Clash Royale external API response (camelCase)
// Used when calling the CR API endpoint directly
export type CRApiData = {
    tag: string;
    name: string;
    expLevel: number;
    trophies: number;
    bestTrophies: number;
    wins: number;
    losses: number;
    threeCrownWins: number;
    challengeMaxWins?: number;
    warDayWins?: number;
    donations: number;
    donationsReceived: number;
    arena?: { name: string };
    clan?: { name: string; tag: string; badgeId: number };
    role?: string;
    leagueStatistics?: {
        currentSeason?: { trophies?: number; bestTrophies?: number };
        previousSeason?: { trophies?: number; bestTrophies?: number };
    };
    currentFavouriteCard?: { name: string };
};

/*--------------------------------------------------------*/