import { WAECQuestion } from "../types";

export const INITIAL_WAEC_QUESTION_BANK: WAECQuestion[] = [
  // --- CORE MATHEMATICS (WASSCE / BECE) ---
  {
    question_id: "WASSCE_MATH_2023_Q01",
    exam_type: "WASSCE",
    subject: "Core Mathematics",
    topic: "Quadratic Equations",
    year: 2023,
    question_text: "Solve for x in the equation 2x² + 5x - 3 = 0.",
    options: {
      A: "x = 1/2 or x = -3",
      B: "x = -1/2 or x = 3",
      C: "x = 1/3 or x = -2",
      D: "x = 3/2 or x = -1"
    },
    correct_option: "A",
    explanation: "Factorizing 2x² + 5x - 3 = 0 gives (2x - 1)(x + 3) = 0. Therefore, 2x - 1 = 0 => x = 1/2, or x + 3 = 0 => x = -3.",
    verified: true
  },
  {
    question_id: "WASSCE_MATH_2023_Q02",
    exam_type: "WASSCE",
    subject: "Core Mathematics",
    topic: "Set Theory",
    year: 2023,
    question_text: "If set P = {1, 2, 3, 4, 5} and Q = {3, 4, 5, 6, 7}, find n(P ∩ Q).",
    options: {
      A: "2",
      B: "3",
      C: "5",
      D: "7"
    },
    correct_option: "B",
    explanation: "P ∩ Q contains common elements {3, 4, 5}. The number of elements n(P ∩ Q) = 3.",
    verified: true
  },
  {
    question_id: "BECE_MATH_2022_Q01",
    exam_type: "BECE",
    subject: "Core Mathematics",
    topic: "Percentages & Commercial Math",
    year: 2022,
    question_text: "A trader bought a book for GHS 40.00 and sold it for GHS 50.00. Calculate her percentage profit.",
    options: {
      A: "15%",
      B: "20%",
      C: "25%",
      D: "30%"
    },
    correct_option: "C",
    explanation: "Profit = GHS 50.00 - GHS 40.00 = GHS 10.00. Percentage profit = (10 / 40) × 100% = 25%.",
    verified: true
  },
  {
    question_id: "BECE_MATH_2022_Q02",
    exam_type: "BECE",
    subject: "Core Mathematics",
    topic: "Algebraic Expressions",
    year: 2022,
    question_text: "Simplify the algebraic expression: 3(2a + 4b) - 2(a - 3b).",
    options: {
      A: "4a + 18b",
      B: "4a + 6b",
      C: "5a + 12b",
      D: "4a - 18b"
    },
    correct_option: "A",
    explanation: "Expand terms: 6a + 12b - 2a + 6b = (6a - 2a) + (12b + 6b) = 4a + 18b.",
    verified: true
  },

  // --- INTEGRATED SCIENCE (WASSCE / BECE) ---
  {
    question_id: "WASSCE_SC_2022_Q04",
    exam_type: "WASSCE",
    subject: "Integrated Science",
    topic: "Cell Structure and Function",
    year: 2022,
    question_text: "Which of the following organelles is responsible for aerobic cellular respiration in plant and animal cells?",
    options: {
      A: "Ribosome",
      B: "Mitochondrion",
      C: "Golgi body",
      D: "Endoplasmic reticulum"
    },
    correct_option: "B",
    explanation: "Mitochondria produce cellular adenosine triphosphate (ATP) energy through aerobic respiration.",
    verified: true
  },
  {
    question_id: "WASSCE_SC_2023_Q08",
    exam_type: "WASSCE",
    subject: "Integrated Science",
    topic: "Acids, Bases & Salts",
    year: 2023,
    question_text: "What color change occurs when blue litmus paper is dipped into an aqueous solution of lemon juice?",
    options: {
      A: "Turns red",
      B: "Turns yellow",
      C: "Remains blue",
      D: "Turns colorless"
    },
    correct_option: "A",
    explanation: "Lemon juice contains citric acid. Acidic solutions turn blue litmus paper red.",
    verified: true
  },
  {
    question_id: "BECE_SC_2022_Q03",
    exam_type: "BECE",
    subject: "Integrated Science",
    topic: "Matter & Energy",
    year: 2022,
    question_text: "The process by which liquid water turns into gas (water vapor) at temperature below its boiling point is known as:",
    options: {
      A: "Condensation",
      B: "Evaporation",
      C: "Sublimation",
      D: "Melting"
    },
    correct_option: "B",
    explanation: "Evaporation occurs at surface level at temperatures below boiling point.",
    verified: true
  },

  // --- ENGLISH LANGUAGE (WASSCE / BECE) ---
  {
    question_id: "WASSCE_ENG_2023_Q12",
    exam_type: "WASSCE",
    subject: "English Language",
    topic: "Grammatical Structures",
    year: 2023,
    question_text: "Choose the option that best completes the sentence: Neither the headteacher nor the teachers ____ present at the emergency briefing.",
    options: {
      A: "was",
      B: "were",
      C: "is",
      D: "has been"
    },
    correct_option: "B",
    explanation: "When subjects are joined by 'neither... nor', the verb agrees with the closer subject ('teachers', which is plural, so 'were').",
    verified: true
  },
  {
    question_id: "BECE_ENG_2022_Q05",
    exam_type: "BECE",
    subject: "English Language",
    topic: "Antonyms",
    year: 2022,
    question_text: "Select the word nearly OPPOSITE in meaning to the underlined word: The students gave a VERY PERMISSIVE response to the proposed school rules.",
    options: {
      A: "Strict",
      B: "Lenient",
      C: "Generous",
      D: "Tolerant"
    },
    correct_option: "A",
    explanation: "'Permissive' means allowing freedom or lenient. The opposite is 'Strict'.",
    verified: true
  },

  // --- SOCIAL STUDIES (WASSCE / BECE) ---
  {
    question_id: "BECE_SOC_2022_Q10",
    exam_type: "BECE",
    subject: "Social Studies",
    topic: "Governance & Citizenship",
    year: 2022,
    question_text: "In Ghana, the organ of government responsible for making laws is the:",
    options: {
      A: "Executive",
      B: "Judiciary",
      C: "Parliament (Legislature)",
      D: "Council of State"
    },
    correct_option: "C",
    explanation: "The Parliament of Ghana (Legislature) is empowered by the 1992 Constitution to enact national laws.",
    verified: true
  },
  {
    question_id: "WASSCE_SOC_2023_Q15",
    exam_type: "WASSCE",
    subject: "Social Studies",
    topic: "Environmental Issues",
    year: 2023,
    question_text: "Which of the following human activities is the primary cause of soil erosion along coastal towns in Ghana?",
    options: {
      A: "Beach sand winning and mangrove destruction",
      B: "Overgrazing by livestock",
      C: "Crop rotation",
      D: "Afforestation programs"
    },
    correct_option: "A",
    explanation: "Illegal sand winning destroys natural beach barriers, exposing coastal soils to ocean wave erosion.",
    verified: true
  },

  // --- ICT / COMPUTING (WASSCE / BECE) ---
  {
    question_id: "BECE_ICT_2023_Q01",
    exam_type: "BECE",
    subject: "ICT / Computing",
    topic: "Computer Hardware & Input Devices",
    year: 2023,
    question_text: "Which of the following computer components is classified as a primary input device?",
    options: {
      A: "Monitor",
      B: "Keyboard",
      C: "Printer",
      D: "Hard Disk Drive"
    },
    correct_option: "B",
    explanation: "Keyboards and mice are primary input devices used to enter data and instructions into a computer system.",
    verified: true
  },
  {
    question_id: "BECE_ICT_2022_Q02",
    exam_type: "BECE",
    subject: "ICT / Computing",
    topic: "Data Storage & Memory",
    year: 2022,
    question_text: "In computer memory measurement, 1 Kilobyte (KB) is equal to how many Bytes?",
    options: {
      A: "100 Bytes",
      B: "512 Bytes",
      C: "1,000 Bytes",
      D: "1,024 Bytes"
    },
    correct_option: "D",
    explanation: "In binary computing systems, 1 Kilobyte (KB) equals 2^10 Bytes = 1,024 Bytes.",
    verified: true
  },
  {
    question_id: "WASSCE_ICT_2023_Q05",
    exam_type: "WASSCE",
    subject: "ICT / Computing",
    topic: "Networking & Internet Protocols",
    year: 2023,
    question_text: "Which protocol is responsible for securely transmitting encrypted web pages between a server and a web browser?",
    options: {
      A: "HTTP",
      B: "HTTPS",
      C: "FTP",
      D: "SMTP"
    },
    correct_option: "B",
    explanation: "HTTPS (Hypertext Transfer Protocol Secure) encrypts data transmitted between a web browser and a website server using SSL/TLS.",
    verified: true
  }
];

export const WAEC_DISCLAIMER_TEXT = 
  "DISCLAIMER: Questions in this repository are compiled independently for educational prep and practice. This software is not affiliated with, endorsed by, or sponsored by the West African Examinations Council (WAEC). Answer explanations are original IP created for learning purposes.";
