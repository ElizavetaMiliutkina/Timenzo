export interface EventData {
    id: string
    title: string
    start: string
    end: string
    extendedProps: {
        price: number
        description: string
        completed: boolean
    }
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



