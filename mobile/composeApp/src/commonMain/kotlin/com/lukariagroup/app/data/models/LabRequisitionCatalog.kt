package com.lukariagroup.app.data.models

data class LabTestSection(val id: String, val title: String, val tests: List<String>)

object LabRequisitionCatalog {
    val sections: List<LabTestSection> = listOf(
        LabTestSection("hematologyTests", "Hematology", listOf("CBC", "RETIC", "ESR", "Info Mono", "CSF/Fluid", "Hb Electrophonesis")),
        LabTestSection("coagulationTests", "Coagulation", listOf("PT", "PTT", "INR", "Fibrinogen", "Thrombin Time", "Bleeding Time", "Ristocetin", "FDP", "Mixing Studies", "Lupus Anticoagulant", "Platelet Aggregation", "Factor Assay XIII", "Factor Assay IX", "Factor Assay XI")),
        LabTestSection("specialTests", "Special Hematology", listOf("HbA2", "Ham's", "LAP Score", "Osmotic Fragility", "Urine Haemosiderin")),
        LabTestSection("electrolytesTests", "Electrolytes / Renal", listOf("Na", "K", "Cl", "HCO3", "Urea", "BUN", "Creatinine", "Phosphorus", "Calcium", "Uric Acid", "Magnesium")),
        LabTestSection("bloodSugarTests", "Blood Sugar", listOf("Random Glucose", "Fasting Glucose", "2h PPG", "OGTT", "HbA1c")),
        LabTestSection("tumorMarkers", "Tumor Markers", listOf("AFP", "CEA", "CA-125", "CA-15-3", "Total PSA")),
        LabTestSection("serumProteinLipids", "Serum Protein / Lipids", listOf("Total Protein", "Albumin", "Globulin", "Total Cholesterol", "LDL", "HDL", "Triglyceride", "Protein Electrophoresis", "Lipoprotein Electrophoresis")),
        LabTestSection("urineTests", "Urine", listOf("Na", "Urinalysis", "K", "Microscopy", "Urea", "VMA", "Creatinine", "Uric Acid", "Creatinine Clearance", "Calcium", "Phosphorus", "Protein", "17-KS", "17-KGS", "Protein Electrophoresis", "Cortisol", "Microalbumin")),
        LabTestSection("hormoneTests", "Hormones", listOf("FSH", "TSH", "FT3", "DHEA-S", "FT4", "Cortisol", "ACTH", "Prolactin", "LH", "Beta-HCG", "Oestradiol", "Progesterone", "Testosterone", "Growth Hormone")),
        LabTestSection("cardiacLiverTests", "Cardiac / Liver", listOf("CPK", "ALT", "Bili D", "Troponin I", "AST", "Bili T", "LDH", "ALP", "GGT")),
        LabTestSection("otherTests", "Other", listOf("Amylase", "Insulin (F)", "CSF glucose", "Vitamin B12/Folic acid", "Serum Iron/TIBC", "PTH", "Ferritin", "Lithium", "CSF Protein", "Beta-Microglubulin", "Salicylate", "Lipase", "Digoxin", "C-peptide", "Dilantin", "Other")),
        LabTestSection("serologyTests", "Serology", listOf("VDRL", "FTA", "Widal", "ASTO", "Brucella")),
        LabTestSection("autoantibodiesTests", "Autoantibodies", listOf("RF", "ANA", "ENA", "Anti-CCP", "Thyroglobulin", "ANCA", "cardiolipin", "Anti-Beta2GPI", "Mitochondrial", "Gastric Parietal Cell", "dsDNA", "Smooth Muscle")),
        LabTestSection("serumProteinConcentrate", "Serum Protein Concentrate", listOf("C3", "C4", "CRP", "IgA", "IgG", "IgM")),
        LabTestSection("lymphocyteEnumeration", "Lymphocyte Enumeration", listOf("Viral load", "CD4", "CD8", "T lymphocytes", "B lymphocytes (CD19/20)", "NK lymphocytes (CD 38/56)")),
        LabTestSection("immunologyOtherTests", "Immunology Other", listOf("H. pylori", "Other")),
        LabTestSection("feverRashTests", "Fever / Rash", listOf("Dengue", "Rubella", "Measles", "Varicella", "Parvovirus")),
        LabTestSection("hepatitisScreeningTests", "Hepatitis Screening", listOf("HBsAg", "HBeAg", "Anti-HAV", "Anti-HCV", "Anti-HB core", "Anti-HBsAg")),
        LabTestSection("vaccineStatusTests", "Vaccine Status", listOf("MMR", "Varicella", "Anti-HBsAg")),
        LabTestSection("stiScreeningTests", "STI Screening", listOf("HSV1", "HSV2", "Chlamydia", "HIV")),
        LabTestSection("virologyOtherTests", "Virology Other", listOf("CMV", "EBV", "TORCH", "Viral Culture", "HTLV", "Western Blot", "Toxoplasma gondii", "Stool Rotavirus", "Mumps", "Influenza", "Other")),
    )

    val weightLossPreset: Map<String, Set<String>> = mapOf(
        "cardiacLiverTests" to setOf("ALT", "AST", "ALP"),
        "electrolytesTests" to setOf("BUN", "Creatinine"),
        "bloodSugarTests" to setOf("HbA1c"),
        "serumProteinLipids" to setOf("Total Cholesterol", "LDL", "HDL", "Triglyceride"),
    )
}
