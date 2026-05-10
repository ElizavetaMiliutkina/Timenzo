import type { AdditionalColumnType } from '@/types/additionalColumns'
import type { ExtraValue } from '@/types/students'

/** Дефолтное «пустое» значение для нового студента под каждый тип. */
export function defaultValueForType(type: AdditionalColumnType): ExtraValue {
    switch (type) {
        case 'number':  return null
        default:        return ''
    }
}

/** Текстовое представление значения для рендера в таблице. */
export function formatExtraValue(
    value: ExtraValue | undefined,
): string {
    if (value === null || value === undefined || value === '') return ''
    return String(value)
}
