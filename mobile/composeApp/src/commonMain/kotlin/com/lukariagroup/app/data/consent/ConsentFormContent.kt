package com.lukariagroup.app.data.consent

import com.lukariagroup.app.data.models.ConsentType

/** Full consent copy mirrored from the web consent-forms page. */
object ConsentFormContent {
    fun textFor(type: ConsentType): String = when (type) {
        ConsentType.PHOTOGRAPH -> """
Before and after photographs are important proofs of the success of your program. Many patients who are contemplating whether a weight loss program might be right for them find photographs useful. Images, including before and after photos, may be used for patient education and for advertising.

Svelte by LuKaria will only use your photographs if you have given permission to do so. Names are not used, and identifying factors are masked when requested. These photos are stored in a secure server in compliance with Jamaica's Data Protection Act. They will be accessed by clinic staff and will not be sold or transferred to any other entity for purposes that have not been agreed to.
        """.trimIndent()

        ConsentType.MOUNJARO -> """
Purpose of Treatment:
Tirzepatide is a human-based glucagon-like peptide-1 receptor agonist and Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.

Tirzepatide is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. It works by increasing insulin production and lowers glucagon secretion as well as targets areas in the brain that regulate appetite and food intake. Tirzepatide also assists the body to store fat more efficiently.

Do not take Tirzepatide if:
• You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)
• Multiple Endocrine Neoplasia syndrome type 2
• You are pregnant or plan to become pregnant while taking this medicine
• You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist. Specifically, if you are prescribed Insulin because the combination may increase your risk of hypoglycemia (low blood sugar) and dosage adjustments by your provider may be necessary
• You have a history of Pancreatitis
• You are allergic to BPC-157, Tirzepatide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®, Trulicity®, Victoza®, Wegovy®

Possible Drug Interactions:
Anti-diabetic agents, specifically: Insulin and Sulfonylureas (e.g., glyburide, glipizide, glimepiride, tolbutamide) due to the increased risk of hypoglycemia (low blood sugar). Do not take with other GLP-1 agonist medicines such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®,Trulicity®, Victoza®, Wegovy® (THIS IS NOT AN ALL-INCLUSIVE LIST). Please tell your provider about any medications that may lower your blood sugar.

Side Effects:
I understand that, like all medications, Tirzepatide may cause side effects. These may include but are not limited to:
• Nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
• Subcutaneous Injections: common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin(welting)
• Serious side effects: Pancreatitis, Cholecystitis, kidney problems, changes in vision (Diabetic retinopathy and NAION), low blood sugar (hypoglycemia), gastroparesis

A very serious allergic reaction to this drug is rare. However, get medical help right away if you notice any symptoms of a serious allergic reaction, including rash, itching/swelling (especially of the face/tongue/throat), severe dizziness, trouble breathing. Report adverse side effects to your doctor.

Precautions:
• In rodents, another GLP1 receptor agonist causes dose-dependent and treatment-duration dependent thyroid C-cell tumors at clinically relevant exposures. It is unknown whether Tirzepatide causes thyroid C-cell tumors, including medullary thyroid carcinoma (MTC), in humans.
• Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists, including Tirzepatide.
• Acute Gallbladder Disease: Treatment with Tirzepatide is associated with an increased occurrence of cholelithiasis and cholecystitis.
• Acute Kidney Injury: There have been reports of acute kidney injury and worsening of chronic renal failure, which in some cases required hemodialysis, in patients treated with Tirzepatide.
• Heart Rate Increase: Mean increases in resting heart rate of 1 to 4 beats per minute (bpm) were observed in Tirzepatide adult patients compared to placebo in clinical trials.

Monitoring and Follow-up:
I agree to undergo regular monitoring as recommended by my healthcare provider, which may include:
• Blood sugar levels and HbA1c testing
• Kidney function tests
• Liver function tests
• Thyroid function tests
• Pregnancy testing
• Follow-up visits to evaluate the effectiveness and adjust the treatment plan if necessary

Alternatives to Tirzepatide:
I have been informed of alternative treatment options, which may include lifestyle changes (such as diet and exercise), other medications for type 2 diabetes or weight management, and surgical options for weight loss.

Consent:
By signing below, I certify that I have read and understand the contents of this form. I acknowledge that:
• I consent to initiating/continuing treatment with Tirzepatide
• I have had the opportunity to ask questions about Tirzepatide and its potential risks and benefits.
• I have a proper laboratory testing done prior to starting treatment
• I am aware of the possible side effects and drug interactions and give my consent for treatment
• I have informed the medical staff of any known allergies to drugs or other substances, and any past adverse reactions I've experienced. I have informed the medical staff of all medications and supplements I'm currently taking
• I understand there are other ways and programs that can assist me in my desire to decrease my body weight and acknowledge that no guarantees have been made to me concerning my results.
        """.trimIndent()

        ConsentType.SEMAGLUTIDE -> """
Purpose of Treatment:
Semaglutide is a human-based glucagon-like peptide-1 receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
Semaglutide is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. These medicines work by slowing gastric emptying time and stimulating the satiety center in the brain to reduce hunger and appetite.

Do not take Semaglutide if:
• You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)
• Multiple Endocrine Neoplasia syndrome type 2
• You are pregnant or plan to become pregnant while taking this medicine
• You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist. Specifically, if you are prescribed Insulin because the combination may increase your risk of hypoglycemia (low blood sugar) and dosage adjustments by your provider may be necessary
• You have a history of Pancreatitis
• You are allergic to Semaglutide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Tirzepatide, Ozempic®, Rybelsus®, Trulicity®, Victoza®, Wegovy®

Possible Drug Interactions:
Anti-diabetic agents, specifically: Insulin and Sulfonylureas (e.g., glyburide, glipizide, glimepiride, tolbutamide) due to the increased risk of hypoglycemia (low blood sugar). Do not take with other GLP-1 agonist medicines such as: Adlyxin®, Byeta®, Bydureon®, Rybelsus®,Trulicity®, Victoza®, or Wegovy® (THIS IS NOT AN ALL-INCLUSIVE LIST). Please tell your provider about any medications that may lower your blood sugar.

Side Effects:
I understand that, like all medications, Semaglutide may cause side effects. These may include but are not limited to:
• Nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
• Subcutaneous Injections: common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin (welting)
• Serious side effects: Pancreatitis, Cholecystitis, kidney problems, changes in vision (Diabetic retinopathy and NAION), low blood sugar (hypoglycemia), gastroparesis

A very serious allergic reaction to this drug is rare. However, get medical help right away if you notice any symptoms of a serious allergic reaction, including rash, itching/swelling (especially of the face/tongue/throat), severe dizziness, trouble breathing. Report adverse side effects to your doctor.

Precautions:
• In rodents, GLP-1 receptor agonists cause dose-dependent and treatment-duration dependent thyroid C-cell tumors at clinically relevant exposures. It is unknown whether Semaglutide causes thyroid C-cell tumors, including medullary thyroid carcinoma (MTC), in humans.
• Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists, including Semaglutide.
• Acute Gallbladder Disease: Treatment with Semaglutide is associated with an increased occurrence of cholelithiasis and cholecystitis.
• Acute Kidney Injury: There have been reports of acute kidney injury and worsening of chronic renal failure, which in some cases required hemodialysis, in patients treated with Semaglutide.
• Heart Rate Increase: Mean increases in resting heart rate have been observed in Semaglutide patients compared to placebo in clinical trials.

Monitoring and Follow-up:
I agree to undergo regular monitoring as recommended by my healthcare provider, which may include:
• Blood sugar levels and HbA1c testing
• Kidney function tests
• Liver function tests
• Thyroid function tests
• Pregnancy testing
• Follow-up visits to evaluate the effectiveness and adjust the treatment plan if necessary

Alternatives to Semaglutide:
I have been informed of alternative treatment options, which may include lifestyle changes (such as diet and exercise), other medications for type 2 diabetes or weight management, and surgical options for weight loss.

Consent:
By signing below, I certify that I have read and understand the contents of this form. I acknowledge that:
• I consent to initiating/continuing treatment with Semaglutide
• I have had the opportunity to ask questions about Semaglutide and its potential risks and benefits.
• I have a proper laboratory testing done prior to starting treatment
• I am aware of the possible side effects and drug interactions and give my consent for treatment
• I have informed the medical staff of any known allergies to drugs or other substances, and any past adverse reactions I've experienced. I have informed the medical staff of all medications and supplements I'm currently taking
• I understand there are other ways and programs that can assist me in my desire to decrease my body weight and acknowledge that no guarantees have been made to me concerning my results.
        """.trimIndent()

        ConsentType.RETATRUTIDE -> """
Purpose of Treatment:
Retatrutide is a human-based Glucagon-like peptide-1 (GLP-1) receptor agonist, Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist, and Glucagon receptor (GCGR) agonist. It is an experimental drug developed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
Retatrutide is still in clinical trials and has not yet been FDA approved. Medicines like Retatrutide work by slowing gastric emptying time and stimulating the satiety center in the brain to reduce hunger and appetite. They also improve fat storage and fat burning.

Do not take Retatrutide if:
• You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)
• Multiple Endocrine Neoplasia syndrome type 2
• You are pregnant or plan to become pregnant while taking this medicine
• You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist. Specifically, if you are prescribed Insulin because the combination may increase your risk of hypoglycemia (low blood sugar) and dosage adjustments by your provider may be necessary
• You have a history of Pancreatitis
• You are allergic to BPC-157, Retatrutide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®, Trulicity®, Victoza®, Wegovy®

Possible Drug Interactions:
Anti-diabetic agents, specifically: Insulin and Sulfonylureas (e.g., glyburide, glipizide, glimepiride, tolbutamide) due to the increased risk of hypoglycemia (low blood sugar). Do not take with other GLP-1 agonist medicines such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®,Trulicity®, Victoza®, Wegovy® (THIS IS NOT AN ALL-INCLUSIVE LIST). Please tell your provider about any medications that may lower your blood sugar.

Side Effects:
I understand that, like all medications, Retatrutide may cause side effects. These may include but are not limited to:
• Nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
• Altered skin sensation
• Subcutaneous Injections: common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin (welting)
• Serious side effects: Pancreatitis, Cholecystitis, kidney problems, changes in vision (Diabetic retinopathy/NAION), low blood sugar (hypoglycemia), gastroparesis

A very serious allergic reaction to this drug is rare. However, get medical help right away if you notice any symptoms of a serious allergic reaction, including rash, itching/swelling (especially of the face/tongue/throat), severe dizziness, trouble breathing. Report adverse side effects to your doctor.

Precautions:
• Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists, including Retatrutide.
• Acute Gallbladder Disease: Treatment with Retatrutide is associated with an increased occurrence of cholelithiasis and cholecystitis.
• Acute Kidney Injury: There is the possibility of acute kidney injury and worsening of chronic renal failure, which in some cases required hemodialysis, in patients treated with Retatrutide.
• Heart Rate Increase: There may be increases in resting heart rate of 5 to 10 beats per minute (bpm) with the use of Retatrutide.

Monitoring and Follow-up:
I agree to undergo regular monitoring as recommended by my healthcare provider, which may include:
• Blood sugar levels and HbA1c testing
• Kidney function tests
• Liver function tests
• Thyroid function tests
• Pregnancy testing
• Follow-up visits to evaluate the effectiveness and adjust the treatment plan if necessary

Alternatives to Retatrutide:
I have been informed of alternative treatment options, which may include lifestyle changes (such as diet and exercise), other medications for weight management, and surgical options for weight loss.

Consent:
By signing below, I certify that I have read and understand the contents of this form. I acknowledge that:
• I consent to initiating/continuing treatment with Retatrutide
• I have had the opportunity to ask questions about Retatrutide and its potential risks and benefits.
• I have had proper laboratory testing done prior to starting treatment if deemed necessary
• I am aware of the possible side effects and drug interactions and give my consent for treatment
• I am aware that Retatrutide is still in clinical trials and that all potential benefits and risks may not be known at this time; and that Dr. Kadria Fairclough and Svelte by LuKaria may not be held liable for any adverse side effects and outcomes that I develop that are not yet known
• I have informed the medical staff of any known allergies to drugs or other substances, and any past adverse reactions I've experienced. I have informed the medical staff of all medications and supplements I'm currently taking
• I understand there are other ways and programs that can assist me in my desire to decrease my body weight and acknowledge that no guarantees have been made to me concerning my results.
        """.trimIndent()

        ConsentType.TELEHEALTH -> """
I understand that my healthcare provider wishes me to engage in a telehealth appointment.

I understand that the video conferencing technology that will be used to affect such an appointment will not be the same as a direct client/health care provider visit due to the fact that I will not be in the same room as my provider.

I understand that a telehealth consultation has potential benefits including easier access to care and the convenience of meeting from a location of my choosing.

I understand there are potential risks to this technology, including interruptions, unauthorized access, and technical difficulties. I understand that my health care provider or I can discontinue the telehealth consult/visit if it is felt that the videoconferencing connections are not adequate for the situation.

Consent to Use Telehealth Services by Carepatron:
Telehealth by Carepatron is the technology service we will use to conduct telehealth videoconferencing appointments. It is simple to use and there are no passwords required to log in. By signing this document, I acknowledge:

• Telehealth by Carepatron is NOT an Emergency Service and in the event of an emergency, I will use a phone to call your local emergency telephone number.

• Though my provider and I may be in direct, virtual contact through the Telehealth Service, neither Carepatron nor the Telehealth Service provides any medical or healthcare services or advice including, but not limited to, emergency or urgent medical services.

• The Telehealth Services by Carepatron facilitates videoconferencing and is not responsible for the delivery of any healthcare, medical advice or care.

• I do not assume that my provider has access to any or all of the technical information in the Telehealth by Carepatron – or that such information is current, accurate or up-to-date. I will not rely on my health care provider to have any of this information in the Telehealth by Carepatron.

• To maintain confidentiality, I will not share my telehealth appointment link with anyone unauthorized to attend the appointment.
        """.trimIndent()

    }
}
