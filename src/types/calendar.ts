import {Student, Timezone} from "@/types/students";

export interface EventData {
    id: string
    title: string
    start: string
    end: string
    extendedProps: {
        price: number
        description: string
        currency_id: number
        student: Student
        timezone: Timezone
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
    currency_id: number;
    student_id?: number | null;
    timezone_id?: number | null;
    student?: Student | null;
    timezone?: Timezone | null;
}

export interface CalendarEvent {
    start: Date;
    end: Date;
    startStr: string;
    endStr: string;
    timeZone: string
}

export interface Dataset {
    label: string;
    data: number[];
}

export interface GraphData {
    labels: string[];
    datasets: Dataset[];
    completed?: number[];
}



