export interface EventData {
    id?:number;
    date: string;
    description: string;
    title: string;
    price: number;
    time_end: string;
    time_start: string;
    datetime?: string;
    completed: boolean;
}

