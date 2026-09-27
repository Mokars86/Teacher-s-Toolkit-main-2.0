# Privacy Policy for Teacher's ToolKit

**Application Name:** Teacher's ToolKit  
**Package Name / App ID:** `com.teacherstoolkit.app`  
**Developer Organization:** Mokars Tech  
**Contact Email:** `support@mokars.com` / `privacy@mokarstech.com`  
**Effective Date:** September 27, 2026  
**Hosted Policy URL:** `https://your-domain.netlify.app/privacy.html` (or your custom domain)

---

## 1. Overview
Teacher's ToolKit is an offline-first educational grading, assessment management, and classroom productivity tool designed for teachers, educators, and school administrators by **Mokars Tech**. We are committed to safeguarding the privacy of educators and their students. We **never sell personal data, student records, or test results** to advertisers or commercial data brokers.

---

## 2. Information We Collect and Why

### A. Teacher / User Account Data
- **Information Collected:** Full Name, Email address, School Name/Affiliation, Subject/Grade Level, and optional Profile Avatar.
- **Purpose:** To manage your teacher account, authenticate access, attribute lesson plans, and sync data across your devices.
- **Provider:** Supabase Auth & Database (encrypted at rest and in transit).

### B. Classroom and Student Academic Records
- **Information Collected:** Student Names, Student ID numbers, Assessment Scores, OMR Sheet Bubble Marks, Terminal Exam Reports, Attendance Records, and Seating Charts.
- **Purpose:** To compute assessment statistics, produce report cards, generate printable grade slips, and maintain classroom records.
- **Educational Context:** All student data is entered directly and solely by authorized teachers/schools. We do not permit direct registration by children under the age of 13.

### C. Device Hardware and Permission Usage
- **Camera (`android.permission.CAMERA`):** Required to capture and analyze physical OMR answer sheets using the device camera and Speed-Ink computer vision algorithms. Images are processed locally on the device.
- **Storage / Photos (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `READ_MEDIA_IMAGES`):** Required to save and export generated PDF report cards, certificates, and grade slips to your device storage.
- **Internet (`android.permission.INTERNET`):** Used to synchronize data with cloud backup (when enabled by the user), fetch question banks, interact with AI assistant services, and process license voucher redemptions.
- **Vibration (`android.permission.VIBRATE`):** Provides haptic vibration confirmation when an OMR sheet is successfully scanned.

### D. Payments & Subscriptions
- Subscriptions and pass purchases are securely processed through **Paystack** (PCI-DSS Level 1 compliant). We do not collect or store full credit card numbers, CVVs, or bank security PINs on our servers.

---

## 3. Third-Party Services
Teacher's ToolKit utilizes third-party tools that comply with international security and data privacy standards:
- **Supabase:** Cloud database and authentication. ([Supabase Privacy Policy](https://supabase.com/privacy))
- **Google Gemini AI:** Generative AI for lesson plan and exam question generation. ([Google Privacy Policy](https://policies.google.com/privacy))
- **Paystack:** Payment processing. ([Paystack Privacy Policy](https://paystack.com/privacy))
- **Capacitor (Ionic):** Native Android bridge runtime.

---

## 4. Children’s Privacy (COPPA / FERPA / GDPR)
Teacher's ToolKit complies with COPPA (Children's Online Privacy Protection Act), FERPA (Family Educational Rights and Privacy Act), and GDPR:
- The App is designed for use by teachers, educators, and educational institutions.
- We do not knowingly collect personal information directly from children under 13 years of age.
- Any student academic information entered into the App is maintained solely for legitimate educational purposes by the school or teacher.
- We never display third-party advertisements or profile students for commercial marketing.

---

## 5. Offline-First & Data Security
- The App is built with an **offline-first** architecture. You can grade tests, manage attendance, and create answer keys without an internet connection.
- Cloud data transmission is encrypted via TLS 1.3 / HTTPS.

---

## 6. User Rights and Data Deletion
Educators have complete control over their data:
1. **In-App Deletion:** Teachers can delete individual test results, answer keys, or classes directly within the app interface.
2. **Account Deletion:** Teachers can request complete deletion of their account and all associated cloud records by emailing `privacy@mokarstech.com` with the subject *"Account Deletion Request"*. All data will be permanently purged within 30 days.

---

## 7. Contact Us
For any questions, compliance requests, or privacy inquiries:
- **Developer:** Mokars Tech
- **Support Email:** `support@mokars.com`
- **Data Protection Email:** `privacy@mokarstech.com`
