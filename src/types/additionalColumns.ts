export type AdditionalColumnType =
    | 'text'
    | 'textarea'
    | 'number'

export interface AdditionalColumn {
    label: string
    type: AdditionalColumnType
    /**
     * Опциональные поля — приходят с бэка, когда схема уже сохранена.
     * Сейчас бэк возвращает только { label, type }, поэтому делаем optional
     * и при необходимости вычисляем key на фронте.
     */
    id?: number
    key?: string
    position?: number
}

export type AdditionalColumnFull = Required<AdditionalColumn>

export interface AdditionalColumnTypeOption {
    label: string
    value: AdditionalColumnType
}

/**
 * Минимальный набор типов, которые корректно ложатся
 * на SQLAlchemy / Pydantic на бэкенде (FastAPI + SQLite):
 *   text/textarea/link/email/phone -> String / Text
 *   number                         -> Integer / Float
 *   boolean                        -> Boolean
 *   date                           -> Date
 *   datetime                       -> DateTime
 */
export const ADDITIONAL_COLUMN_TYPE_OPTIONS: AdditionalColumnTypeOption[] = [
    { label: 'Text',      value: 'text' },
    { label: 'Textarea',  value: 'textarea' },
    { label: 'Number',    value: 'number' },
]

/**
 * Транслитерация и slugify русских/латинских лейблов в стабильный технический ключ.
 * Используется как ключ в student.extra, если бэк ещё не отдаёт `key`.
 */
const RU_MAP: Record<string, string> = {
    а:'a', б:'b', в:'v', г:'g', д:'d', е:'e', ё:'e', ж:'zh', з:'z', и:'i',
    й:'i', к:'k', л:'l', м:'m', н:'n', о:'o', п:'p', р:'r', с:'s', т:'t',
    у:'u', ф:'f', х:'h', ц:'c', ч:'ch', ш:'sh', щ:'sch', ъ:'', ы:'y', ь:'',
    э:'e', ю:'yu', я:'ya',
}

export function slugifyLabel(label: string): string {
    const lower = (label ?? '').toLowerCase().trim()
    let out = ''
    for (const ch of lower) {
        if (RU_MAP[ch] !== undefined) out += RU_MAP[ch]
        else if (/[a-z0-9]/.test(ch)) out += ch
        else if (/\s|-|_/.test(ch)) out += '_'
    }
    out = out.replace(/_+/g, '_').replace(/^_|_$/g, '')
    return out || 'col'
}

export function getColumnKey(col: AdditionalColumn, index = 0): string {
    if (col.key) return col.key
    const slug = slugifyLabel(col.label)
    return slug || `col_${index}`
}
