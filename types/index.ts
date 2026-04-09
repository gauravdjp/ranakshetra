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

}

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


/*--------------------------------------------------------*/