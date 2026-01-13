export interface EventData {
    id: string
    title: string
    start: string
    end: string
    extendedProps: {
        price: number
        description: string
        currency_id: number
        completed: boolean
    }
}

export interface EventDataCreate {
    id?: string
    date_start: string;
    date_end: string;
    description: string;
    title: string;
    price: number;
    time_end: string;
    time_start: string;
    datetime?: string;
    duration?: string;
    currency_id: number
}

export interface CalendarEvent {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
    timeZone: string
}

export interface GraphData {
    labels: string[];
    data: number[];
    completed: number[];
}



