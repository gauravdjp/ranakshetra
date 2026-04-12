// basic information that can be resued in types
export type Basic_Info = {
    readonly name : string,
    readonly email : string,
    readonly password : string,
    readonly phone? : number,
    readonly date_of_birth : Date,
    readonly city : string,
    readonly state : string,
    readonly country : string,
    readonly created_at : Date,
    readonly updated_at : Date,
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
    username : string,
    role : Access_Level_USER_Role.ORGANISER,
    arena_name : string,
    arena_location : string,
    arena_description? : string,
    arena_image? : string,
    readonly is_verified : boolean, 
}
/*--------------------------------------------------------*/


//players types and enums

export type Player = Basic_Info & {
    _id? : string,
    username : string,
    role : Access_Level_USER_Role.PLAYER,
    games : Games.CLASH_ROYALE, //for now we are only supporting clash royale api 
    player_tag : string,
    skill_level : string,
    tourney_games : string[],
    device : string,
    profile_image? : string,
    description? : string,
    readonly is_verified : boolean, 
}
/*--------------------------------------------------------*/


//clubs types and enums
export type Club = {

}
export type Club_Roles = {

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
    registration_deadline: Date;
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

export type Match = {

}
/*--------------------------------------------------------*/


//arena types and enums

export type Arena = {

}

export type Arena_Roles = {

}
/*--------------------------------------------------------*/


//games types and enums
export enum Games{
    CLASH_ROYALE = "CLASH ROYALE",
}

export type In_Game_Details = {
    game : Games,
    username : string,
    rank? : number,
    trophies? : number,
    level? : number,
}

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
    clan_role?: 'leader' | 'co_leader' | 'elder' | 'member';
    total_donations: number;
    
    favorite_card?: string;
    current_deck?: string[]; 
};

/*--------------------------------------------------------*/