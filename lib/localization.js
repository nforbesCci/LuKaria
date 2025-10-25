import enConsentForms from '../locales/en/consent-forms.json';
import esConsentForms from '../locales/es/consent-forms.json';

// Available locales
export const LOCALES = {
  EN: 'en',
  ES: 'es'
};

// Default locale
export const DEFAULT_LOCALE = LOCALES.EN;

// Locale data mapping
const localeData = {
  [LOCALES.EN]: enConsentForms,
  [LOCALES.ES]: esConsentForms
};

/**
 * Get localized text for a given key path
 * @param {string} keyPath - Dot-separated path to the text (e.g., 'common.save')
 * @param {string} locale - Locale code (default: 'en')
 * @param {object} params - Parameters for string interpolation
 * @returns {string} Localized text
 */
export function getLocalizedText(keyPath, locale = DEFAULT_LOCALE, params = {}) {
  try {
    const localeContent = localeData[locale] || localeData[DEFAULT_LOCALE];
    
    // Navigate through the nested object using the key path
    const keys = keyPath.split('.');
    let value = localeContent;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        console.warn(`Localization key not found: ${keyPath} in locale ${locale}`);
        return keyPath; // Return the key path as fallback
      }
    }
    
    // If the final value is a string, apply parameter interpolation
    if (typeof value === 'string') {
      return interpolateString(value, params);
    }
    
    return value;
  } catch (error) {
    console.error('Error getting localized text:', error);
    return keyPath; // Return the key path as fallback
  }
}

/**
 * Interpolate parameters into a string
 * @param {string} str - String with placeholders like {param}
 * @param {object} params - Parameters to interpolate
 * @returns {string} Interpolated string
 */
function interpolateString(str, params) {
  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

/**
 * Get all forms for a given locale
 * @param {string} locale - Locale code
 * @returns {Array} Array of form objects
 */
export function getLocalizedForms(locale = DEFAULT_LOCALE) {
  try {
    const localeContent = localeData[locale] || localeData[DEFAULT_LOCALE];
    const forms = [];
    
    // Convert forms object to array
    Object.keys(localeContent.forms).forEach(formId => {
      const form = localeContent.forms[formId];
      forms.push({
        id: formId,
        title: form.title,
        description: form.description,
        hasCustomFields: form.hasCustomFields,
        content: form.content
      });
    });
    
    return forms;
  } catch (error) {
    console.error('Error getting localized forms:', error);
    return [];
  }
}

/**
 * Get common localized text
 * @param {string} key - Key for common text
 * @param {string} locale - Locale code
 * @param {object} params - Parameters for interpolation
 * @returns {string} Localized text
 */
export function getCommonText(key, locale = DEFAULT_LOCALE, params = {}) {
  return getLocalizedText(`common.${key}`, locale, params);
}

/**
 * Get instructions localized text
 * @param {string} key - Key for instructions text
 * @param {string} locale - Locale code
 * @param {object} params - Parameters for interpolation
 * @returns {string} Localized text
 */
export function getInstructionsText(key, locale = DEFAULT_LOCALE, params = {}) {
  return getLocalizedText(`instructions.${key}`, locale, params);
}

/**
 * Get form-specific localized text
 * @param {string} formId - Form ID
 * @param {string} key - Key for form text
 * @param {string} locale - Locale code
 * @param {object} params - Parameters for interpolation
 * @returns {string} Localized text
 */
export function getFormText(formId, key, locale = DEFAULT_LOCALE, params = {}) {
  return getLocalizedText(`forms.${formId}.${key}`, locale, params);
}

/**
 * Get form field localized text
 * @param {string} formId - Form ID
 * @param {string} fieldKey - Field key
 * @param {string} locale - Locale code
 * @param {object} params - Parameters for interpolation
 * @returns {string} Localized text
 */
export function getFormFieldText(formId, fieldKey, locale = DEFAULT_LOCALE, params = {}) {
  return getLocalizedText(`forms.${formId}.fields.${fieldKey}`, locale, params);
}

/**
 * Hook for using localization in React components
 * @param {string} locale - Current locale
 * @returns {object} Localization utilities
 */
export function useLocalization(locale = DEFAULT_LOCALE) {
  return {
    t: (keyPath, params = {}) => getLocalizedText(keyPath, locale, params),
    getCommonText: (key, params = {}) => getCommonText(key, locale, params),
    getInstructionsText: (key, params = {}) => getInstructionsText(key, locale, params),
    getFormText: (formId, key, params = {}) => getFormText(formId, key, locale, params),
    getFormFieldText: (formId, fieldKey, params = {}) => getFormFieldText(formId, fieldKey, locale, params),
    getLocalizedForms: () => getLocalizedForms(locale),
    locale
  };
}
