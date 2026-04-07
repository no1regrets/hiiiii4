import { Context as ContextTelegraf } from "telegraf";

export interface Context extends ContextTelegraf{
    session: {
        type?: 'getName' | 'getSecondName' | 'getSurname' | 'getRole' | 'getDay' | 'getMonth' | 'getYear' | 'getGrope' | 'getTel' | 'goEnd' | 'default',
        name?: string,
        lastName?: string,
        surname?: string,
        role?: 'teacher' | 'student' | 'enrollee',
        tel?: string,
        group?: string,
        shortName?: string,
        day?: string,
        month?: string,
        year?: string,
        DOB?: string,
        userId?: string
    }
}