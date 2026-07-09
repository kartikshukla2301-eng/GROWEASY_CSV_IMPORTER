export interface SplitPhone {
  countryCode: string;
  mobile: string;
}

// Splits a phone number string into country code and local number.
// Handles: +91 9876543210, +919876543210, 91-9876543210, (91)9876543210
// If no country code prefix is found, returns the cleaned number as mobile with empty countryCode.
export function splitPhone(raw: string | null | undefined): SplitPhone {
  if (!raw || isNilLiteral(raw)) return { countryCode: "", mobile: "" };

  // Strip spaces/dashes/parens but keep the leading + if present
  const stripped = raw.trim().replace(/[\s\-()]/g, "");

  if (!stripped) return { countryCode: "", mobile: "" };

  if (stripped.startsWith("+")) {
    const digits = stripped.slice(1);
    return splitByKnownCountryCode(digits);
  }

  const digitsOnly = stripped.replace(/\D/g, "");
  return { countryCode: "", mobile: digitsOnly };
}

// Common 2 and 3-digit country codes (ITU-T E.164).
// Checked before the single-digit codes to avoid misidentifying e.g. +91 as +9.
const KNOWN_2_DIGIT_CODES = new Set([
  "20", "27", "30", "31", "32", "33", "34", "36", "39", "40",
  "41", "43", "44", "45", "46", "47", "48", "49", "51", "52",
  "53", "54", "55", "56", "57", "58", "60", "61", "62", "63",
  "64", "65", "66", "81", "82", "84", "86", "90", "91", "92",
  "93", "94", "95", "98",
]);

const KNOWN_3_DIGIT_CODES = new Set([
  "211", "212", "213", "216", "218", "220", "221", "222", "223",
  "224", "225", "226", "227", "228", "229", "230", "231", "232",
  "233", "234", "235", "236", "237", "238", "239", "240", "241",
  "242", "243", "244", "245", "246", "247", "248", "249", "250",
  "251", "252", "253", "254", "255", "256", "257", "258", "260",
  "261", "262", "263", "264", "265", "266", "267", "268", "269",
  "297", "350", "352", "353", "354", "355", "356", "357", "358",
  "359", "370", "371", "372", "373", "374", "375", "376", "377",
  "380", "381", "382", "385", "386", "387", "389", "420", "421",
  "423", "500", "501", "502", "503", "504", "505", "506", "507",
  "508", "509", "590", "591", "592", "593", "594", "595", "596",
  "597", "598", "599", "670", "672", "673", "674", "675", "676",
  "677", "678", "679", "680", "681", "682", "683", "685", "686",
  "687", "688", "689", "690", "691", "692", "850", "852", "853",
  "855", "856", "880", "886", "960", "961", "962", "963", "964",
  "965", "966", "967", "968", "970", "971", "972", "973", "974",
  "975", "976", "977", "992", "993", "994", "995", "996", "998",
]);

function splitByKnownCountryCode(digits: string): SplitPhone {
  // Check 3-digit codes first, then 2-digit, then 1-digit (only valid single-digit is 1)
  for (const ccLen of [3, 2, 1]) {
    const candidate = digits.slice(0, ccLen);
    const local = digits.slice(ccLen);
    const isKnown =
      ccLen === 3
        ? KNOWN_3_DIGIT_CODES.has(candidate)
        : ccLen === 2
        ? KNOWN_2_DIGIT_CODES.has(candidate)
        : candidate === "1"; // ITU-T zone 1: North America
    if (isKnown && /^\d{7,12}$/.test(local)) {
      return { countryCode: candidate, mobile: local };
    }
  }
  // Unknown code — return all digits as mobile
  return { countryCode: "", mobile: digits };

}

// Extracts all phone-like tokens from a string that may contain multiple numbers
// separated by commas, slashes, semicolons, or whitespace.
export function extractAllPhones(raw: string | null | undefined): string[] {
  if (!raw || isNilLiteral(raw)) return [];
  // Split on common delimiters between multiple phone numbers
  return raw
    .split(/[,;\/|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isNilLiteral(value: string): boolean {
  const lower = value.toLowerCase().trim();
  return lower === "n/a" || lower === "-" || lower === "null" || lower === "none" || lower === "na";
}
