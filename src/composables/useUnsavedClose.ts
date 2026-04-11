import { useQuasar } from 'quasar'

/**
 * Закрытие диалога: если есть несохранённые изменения — Quasar Dialog, иначе сразу onClose.
 */
export function useUnsavedClose() {
    const $q = useQuasar()

    function confirmCloseIfDirty(isDirty: boolean, onClose: () => void) {
        if (!isDirty) {
            onClose()
            return
        }
        $q.dialog({
            title: 'Закрыть окно?',
            message: 'Есть несохранённые изменения. Закрыть без сохранения?',
            cancel: true,
            persistent: true,
        }).onOk(() => onClose())
    }

    return { confirmCloseIfDirty }
}
