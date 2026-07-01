# PatientPrep SL

## Privacy-First Doctor Visit Preparation MVP

Patients consulting AI powered mobile app guide by Virtusa Pvt Ltd.

PatientPrep SL is a mobile MVP that helps patients prepare for doctor consultations before they enter the clinic. The app guides users to organize doctor appointment details, symptoms, medications, questions, and consultation summaries in one simple flow.

The product is designed as **preparation support**, not medical diagnosis. It helps patients remember important details and communicate clearly with healthcare professionals.

---

## Executive Summary

Many patients forget important health details during a doctor visit. They may not remember when symptoms started, how intense they were, what medicines they take, or what questions they wanted to ask. PatientPrep SL solves this by giving patients a guided preparation workflow before the appointment.

The MVP includes:

- Doctor consultation preparation
- Symptom logging
- Medication tracking
- Question building
- AI Coach guidance
- Guided consultation summary
- Local-first privacy storage
- Dark mode
- Delete controls for patient-owned data

Final product status: **Good MVP and presentation-ready prototype.**

---

## Problem Statement

Patients often attend consultations without properly organized information. This can cause:

- Forgotten symptoms
- Missing medication details
- Unasked questions
- Poor communication with doctors
- Reduced patient confidence
- Less efficient consultation time

PatientPrep SL focuses on helping patients prepare before the visit, so the doctor receives clearer and more complete information.

---

## Proposed Solution

PatientPrep SL provides a guided mobile experience where users can:

1. Add doctor and appointment details.
2. Log symptoms with intensity, duration, and notes.
3. Save medication details.
4. Prepare questions for the doctor.
5. Ask the floating AI Coach for preparation help.
6. Generate a doctor-ready consultation summary.
7. Keep sensitive health preparation data stored locally on the device.

---

## Core Features

### 1. Doctor Consult Preparation

Users can save:

- Doctor name
- Speciality
- Consultation date
- Consultation time

The app includes a calendar and clock-style selector instead of requiring users to type the appointment time manually.

Users can also delete saved appointments when they want to start again.

### 2. Symptom Log

Users can record:

- Symptom name
- Intensity from 1 to 10
- Duration
- Notes

Saved symptoms can be deleted permanently from local storage.

### 3. Medication Manager

Users can save:

- Medication name
- Dosage
- Frequency
- Instructions

Saved medications can be deleted when no longer needed.

### 4. Question Builder

Users can prepare questions before meeting the doctor.

The screen supports:

- Manual question entry
- Safe suggested questions
- AI Coach question support
- Mark question as asked
- Delete prepared questions

### 5. Guided Consultation Summary

The Consultation Summary screen gives users a dynamic preparation view.

It includes:

- Preparation readiness score
- Guided preparation checklist
- Doctor-ready preview
- Saved summaries
- Appointment details
- Symptom details
- Medication details
- Prepared questions

Users can save local summaries and delete saved summaries when needed.

### 6. Floating AI Coach

The AI Coach is available as a floating movable widget. Users can drag it around the screen and tap it to open full-screen support.

The AI Coach can help with:

- Symptom preparation
- Doctor selection guidance
- Medication preparation
- Question building
- Consultation summary generation
- Urgent warning sign guidance

The AI Coach does not diagnose, treat, prescribe, or replace medical advice.

### 7. Privacy Vault

The Privacy Vault explains the app's local-first data model and lets users clear local health preparation data from the device.

---

## Privacy and Data Storage

PatientPrep SL uses a privacy-first MVP architecture.

### Firebase Stores

Firebase is used for:

- Authentication
- Basic profile settings

### SecureStore Stores

Sensitive health preparation data is stored locally using Expo SecureStore:

- Symptoms
- Medications
- Questions
- Appointments
- Consultation summaries
- AI Coach conversation memory

### AsyncStorage Stores

AsyncStorage is used only for non-sensitive app preferences:

- Theme mode

Privacy message:

> Your health preparation data is stored locally on this device and is not uploaded to Firebase.

---

## Medical Disclaimer

PatientPrep SL helps users prepare for a doctor visit. It does not diagnose, treat, prescribe, or replace medical advice. For urgent symptoms, users should contact emergency services or seek urgent medical care.

This disclaimer is repeated in key places such as:

- Welcome/onboarding
- AI Coach
- Consultation Summary
- Privacy Vault

---

## Technical Architecture

### Frontend

- Expo
- React Native
- Expo Router
- Zustand
- Lucide React Native icons

### Storage

- Expo SecureStore for sensitive local health data
- AsyncStorage for theme preference
- Firebase Auth for login/register
- Firestore for basic profile settings

### AI Layer

AI Coach uses:

- Firebase Functions first
- Cloudflare Worker fallback

This improves availability during demos and API failures.

---

## Main User Flow

1. User registers or logs in.
2. User opens Consults.
3. User selects doctor, speciality, date, and time.
4. User logs symptoms.
5. User adds medications.
6. User builds doctor questions.
7. User opens floating AI Coach.
8. User asks what to tell the doctor.
9. User generates a Consultation Summary.
10. User reviews or saves the summary locally.
11. User can delete data if needed.

---

## Demo Script

Use this flow for presentation:

### Patient Story

A patient is preparing for a cardiology consultation and wants to organize symptoms, medications, and questions before visiting the doctor.

### Demo Steps

1. Log in as a patient.
2. Open Consults.
3. Add doctor details:
   - Dr. Silva
   - Cardiologist
   - Today 4:30 PM
4. Log symptom:
   - Chest tightness
   - Intensity 6
   - Duration 2 days
5. Add medication:
   - Metformin
   - 500mg
   - Twice daily
6. Build questions:
   - What should I monitor before my next visit?
   - When should I seek urgent care?
7. Open floating AI Coach.
8. Ask:
   - What should I tell my doctor?
9. Show AI Coach preparation guidance.
10. Generate Consultation Summary.
11. Explain:
   - This summary is saved locally using SecureStore.
12. Switch dark mode.
13. End with privacy statement:
   - Firebase is used for authentication and profile settings. Sensitive health preparation data stays on the device.

---

## Current Verification Status

The project has passed the following checks:

- TypeScript compilation
- Expo Doctor
- Android bundle export

This means:

- The TypeScript code compiles.
- Expo dependencies are valid.
- The app can be bundled for Android.
- There are no current broken native voice module references.

---

## MVP Strengths

- Clear healthcare preparation problem
- Practical user flow
- Strong privacy-first story
- AI Coach supports the core workflow
- Local SecureStore storage for sensitive data
- Guided summary gives a strong final output
- Dark mode improves accessibility
- Delete controls give users ownership over data
- Floating movable AI Coach improves usability
- Good stakeholder demo value

---

## Known Limitations

This is an MVP, not production medical software.

Current limitations:

- Real Android device testing is still required.
- AI Coach requires internet/API availability.
- SecureStore may have size limits for very long summaries or chat history.
- Existing records can be deleted but not fully edited.
- Native system dark mode is not automatic because `userInterfaceStyle` is still set to light.
- Sinhala and Tamil text should be checked on real devices for font rendering and wrapping.
- AI output must always be treated as preparation support, not medical advice.

---

## Real Android Test Checklist

Before final presentation, test on a real Android device:

- Register new user
- Login
- Logout
- Restart app after login
- Add doctor consult
- Add symptom
- Add medication
- Add question
- Generate summary
- Restart app and confirm SecureStore data remains
- Delete symptom/medication/question/appointment/summary
- Restart app and confirm deleted data stays deleted
- Open AI Coach and send message
- Restart app and confirm AI Coach history persists
- Delete AI Coach conversation
- Test dark mode readability
- Test keyboard scrolling in AI Coach
- Test AI Coach failure message with weak/no internet

---

## Future Improvements

Recommended next features:

- Edit existing symptoms, medications, questions, and appointments
- Export summary as PDF
- Share summary with doctor
- Appointment reminders
- Offline AI fallback guidance
- Better language management
- Larger privacy policy screen
- User consent flow
- Cloud backup option with explicit permission
- More accessibility testing
- Production analytics for non-sensitive usage events

---

## Stakeholder Value

### For Patients

- Better preparation before doctor visits
- Less chance of forgetting important details
- More confidence during consultations
- Easier organization of symptoms, medications, and questions

### For Doctors

- More structured patient information
- Faster understanding of patient concerns
- Better consultation efficiency

### For Healthcare Systems

- Encourages patient preparation
- Supports digital health literacy
- Can become a foundation for larger e-health workflows

---

## Final Evaluation

PatientPrep SL is a strong MVP because it solves a real patient problem with a focused, practical workflow. It is not trying to replace doctors. Instead, it helps patients prepare better and communicate more clearly.

Final verdict:

**PatientPrep SL is a good MVP and presentation-ready prototype.**

It is not yet production-ready, but it is strong enough for stakeholder demonstration, academic presentation, and MVP validation.
