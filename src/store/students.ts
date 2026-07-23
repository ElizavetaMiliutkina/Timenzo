import { defineStore } from 'pinia'
import {StudentFormData, Student} from '@/types/students'

import axios from "@/plugins/axios";

/** Защита от двойного клика на мутациях. */
const mutationInflight = new Set<string>()

async function withMutationLock<T>(
    key: string,
    fn: () => Promise<T>
): Promise<T | null> {
    if (mutationInflight.has(key)) return null
    mutationInflight.add(key)
    try {
        return await fn()
    } finally {
        mutationInflight.delete(key)
    }
}

export const useStudentStore = defineStore('students', {
    state: (): {
        students: Student[]
    } => ({
        students: [],
    }),
    actions: {
        async getStudents(): Promise<Student[]> {
            try {
                const response = await axios.get<Student[]>('/students')
                this.students = response.data
                return response.data
            } catch (error) {
                console.error('Error fetching students:', error)
                return []
            }
        },
        async postStudent(payload: StudentFormData): Promise<StudentFormData[] | null> {
            return withMutationLock('post-student', async () => {
                try {
                    const response = await axios.post<StudentFormData[]>('/student', payload)
                    await this.getStudents()
                    return response.data
                } catch (error) {
                    console.error('Error create student:', error)
                    return null
                }
            })
        },
        async updateStudent(id: number, payload: StudentFormData): Promise<StudentFormData | null> {
            return withMutationLock(`put-student:${id}`, async () => {
                try {
                    const response = await axios.put<StudentFormData>(`/student/${id}`, payload)
                    await this.getStudents()
                    return response.data
                } catch (error) {
                    console.error('Error create student:', error)
                    return null
                }
            })
        },
        async deleteStudent(student_id: string | number) {
            return withMutationLock(`delete-student:${student_id}`, async () => {
                try {
                    const response = await axios.delete(`/student/${student_id}`)
                    this.students = this.students.filter((s) => s.id !== Number(student_id))
                    return response.data
                } catch (error) {
                    console.error('Error create student:', error)
                    return null
                }
            })
        },

    }
})
