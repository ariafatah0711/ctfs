const DIALOG_POSITION_CLASS =
  "w-[calc(100vw-32px)] sm:w-full fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"

const DIALOG_CLOSE_BUTTON_LIGHT_CLASS =
  "[&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-white"

const DIALOG_CLOSE_BUTTON_MUTED_CLASS =
  "[&_button.absolute.right-4.top-4]:block md:[&_button.absolute.right-4.top-4]:hidden [&_button.absolute.right-4.top-4]:text-gray-500 dark:[&_button.absolute.right-4.top-4]:text-gray-400"

// Centralized dialog content class for consistent styling
export const DIALOG_CONTENT_CLASS = `${DIALOG_POSITION_CLASS} max-w-lg bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

// Reused by large admin create/edit forms.
export const DIALOG_FORM_CONTENT_CLASS = `${DIALOG_POSITION_CLASS} max-w-3xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl p-4 md:p-8 max-h-[85dvh] overflow-y-auto scroll-hidden ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

// Reused by compact glass dialogs that share the same visual shell.
export const DIALOG_GLASS_CONTENT_MD_CLASS = `${DIALOG_POSITION_CLASS} max-w-md rounded-2xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 backdrop-blur-xl p-6 shadow-2xl ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

// For larger dialogs, you can extend or override as needed:
export const DIALOG_CONTENT_CLASS_XL = `${DIALOG_POSITION_CLASS} max-w-xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl p-4 sm:p-6 ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

export const DIALOG_CONTENT_CLASS_2XL = `${DIALOG_POSITION_CLASS} max-w-2xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl p-0 overflow-hidden ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

export const DIALOG_CONTENT_CLASS_3XL = `${DIALOG_POSITION_CLASS} max-w-3xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl p-0 overflow-hidden ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`

export const DIALOG_CONTENT_CLASS_4XL = `${DIALOG_POSITION_CLASS} max-w-4xl bg-white/70 dark:bg-[#0a0d14]/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl shadow-2xl backdrop-blur-xl p-0 overflow-hidden ${DIALOG_CLOSE_BUTTON_MUTED_CLASS}`
