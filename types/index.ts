export type Basic_Info = {
    readonly name : string,
    readonly email : string,
    readonly phone? : number,
    readonly created_at : Date,
    readonly updated_at : Date,
}

export enum Access_Level{
    USER = "user",
    ADMIN = "admin",
}

export enum Access_Level_USER_Role{
    PLAYER = "player",
    ORGANISER = "organiser",
}

export enum Access_Level_ADMIN_Role{
    DEVELOPER = "developer",
}

export type Organiser = Basic_Info & {
    _id? : string,
    username : string,
    password : string,
    arena_name : string,
    arena_location : string,
    arena_description? : string,
    arena_image? : string,
    readonly is_verified : boolean, 
}

export type Player = Basic_Info & {

}

export type Club = {

}

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

export type Arena = {

}

export type Arena_Roles = {

}

export type Club_Roles = {

}

export type Match = {

}