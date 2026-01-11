import { defineStore } from 'pinia'
import {StudentFormData} from '@/types/students'

import axios from "@/plugins/axios";


export const useStudentStore = defineStore('calendar', {
    state: (): {
        students: StudentFormData[]
    } => ({
        students: [],
    }),
    actions: {
        async getStudents(): Promise<StudentFormData[]> {
            try {
                const response = await axios.get<StudentFormData[]>('/students')
                this.students = response.data
                return response.data
            } catch (error) {
                console.error('Error fetching students:', error)
                return []
            }
        },
        async postStudent(payload: StudentFormData): Promise<StudentFormData[] | null> {
            try {
                const response = await axios.post<StudentFormData[]>('/student', payload)
                await this.getStudents()
                return response.data
            } catch (error) {
                console.error('Error create student:', error)
                return null
            }
        },
        async deleteStudent(student_id: string | number) {
            try {
                const response = await axios.delete(`/student/${student_id}`)
                await this.getStudents()
                return response.data
            } catch (error) {
                console.error('Error create student:', error)
                return null
            }
        },

    }
})
