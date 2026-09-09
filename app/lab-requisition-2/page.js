'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { ArrowBack, PictureAsPdf, Send, MedicalServices } from '@mui/icons-material';
import Header from '../../components/Header';
import { useAdminAccess } from '../../hooks/useAccessControl';
import { clearPdfState } from '../../store/slices/pdfSlice';
import { fetchAdminProfileAction, setSelectedUser } from '../../store/slices/adminSlice';
import {
  LRF01_BACTERIOLOGY,
  LRF01_BLOOD_BANK,
  LRF01_CHEMISTRY,
  LRF01_HAEMATOLOGY,
  LRF01_IMMUNOLOGY,
  LRF01_MYCOLOGY,
  LRF01_PARASITOLOGY,
  LRF01_PHLEB_TUBES,
  LRF01_VIROLOGY,
  LRF01_VIROLOGY_GRID,
  LRF01_VIROLOGY_GRID_COLS,
  applyWeightLossSelections,
  mapFromKeys,
  mapNested,
  parsePatientName,
} from '../../lib/lrf01-tests';

function pickProfile(profileDoc, authUser) {
  const p = profileDoc || {};
  const meta = p.user_metadata || {};
  const authMeta = authUser?.user_metadata || {};
  const fullName =
    p.name || authUser?.name || authUser?.nickname || meta.name || '';
  const names = parsePatientName(fullName);
  const line = p.homeAddress || p.address || meta.address || authMeta.address || '';
  const parish = p.parish || '';
  return {
    ...names,
    sex: p.sex || meta.gender || authUser?.gender || authMeta.gender || '',
    dateOfBirth:
      p.dateOfBirth || meta.birthdate || authUser?.birthdate || authMeta.birthdate || '',
    phone:
      p.preferredPhone ||
      p.phone ||
      meta.phone_number ||
      authUser?.phone_number ||
      authMeta.phone_number ||
      '',
    address: [line, parish].filter(Boolean).join(line && parish ? ', ' : ''),
    age: '',
    regNo: '',
    clinicalHistory: '',
    diagnosis: '',
    dateOfOnset: '',
  };
}

function Tick({ label, checked, onChange }) {
  return (
    <label className="lrf-tick">
      <input type="checkbox" checked={!!checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function TickRow({ map, onToggle }) {
  return (
    <div className="lrf-ticks">
      {Object.keys(map).map((key) => (
        <Tick key={key} label={key} checked={map[key]} onChange={() => onToggle(key)} />
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="lrf-section">
      <div className="lrf-section-title">{title}</div>
      {children}
    </div>
  );
}

function Sub({ title, children }) {
  return (
    <div className="lrf-sub">
      <div className="lrf-sub-title">{title}</div>
      {children}
    </div>
  );
}

function Line({ label, value, onChange, wide }) {
  return (
    <label className={`lrf-line ${wide ? 'lrf-line-wide' : ''}`}>
      <span>{label}</span>
      <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function LabRequisition2Page() {
  return (
    <Suspense
      fallback={
        <>
          <Header />
          <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 1 }}>
              Loading...
            </Typography>
          </Container>
        </>
      }
    >
      <LabRequisition2 />
    </Suspense>
  );
}

function LabRequisition2() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const queryUserId = searchParams?.get('userId') || '';

  useAdminAccess();
  const { isGenerating, isSending, error: pdfError, success: pdfSuccess } = useSelector(
    (state) => state.pdf,
  );
  const selectedUser = useSelector((state) => state.admin.selectedUser);
  const profile = useSelector((state) => state.admin.adminProfile);
  const profileLoading = useSelector((state) => state.admin.adminProfileLoading);

  const patientUserId =
    queryUserId || selectedUser?.user_id || selectedUser?.userId || profile?.userId || '';

  const userRoles = user?.['https://lukariagroup.com/roles'] || [];
  const hasLabAccess = userRoles.some((role) => {
    const roleLower = String(role).toLowerCase();
    return (
      roleLower === 'admin' ||
      roleLower === 'doctor' ||
      roleLower === 'doctor group' ||
      roleLower === 'doctors' ||
      roleLower === 'doctor_group' ||
      roleLower === 'admin group' ||
      roleLower === 'admins' ||
      roleLower === 'admin_group'
    );
  });

  const [patient, setPatient] = useState({
    surname: '',
    firstName: '',
    middleName: '',
    sex: '',
    age: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    regNo: '',
    clinicalHistory: '',
    diagnosis: '',
    dateOfOnset: '',
  });

  const [physician, setPhysician] = useState({
    name: 'Dr. Kadria Fairclough',
    address: '',
    tel: '18762903659',
    fax: '',
    registration: '84608',
    date: new Date().toISOString().slice(0, 10),
  });

  const [copy1, setCopy1] = useState({ name: '', address: '' });
  const [copy2, setCopy2] = useState({ name: '', address: '' });
  const [wardClinic, setWardClinic] = useState('');
  const [antibioticTx, setAntibioticTx] = useState('');
  const [mycologyTx, setMycologyTx] = useState('');
  const [otherSpecify, setOtherSpecify] = useState('');
  const [virologyOther, setVirologyOther] = useState('');

  const [haemRoutine, setHaemRoutine] = useState(mapFromKeys(LRF01_HAEMATOLOGY.routine));
  const [haemCoag, setHaemCoag] = useState(mapFromKeys(LRF01_HAEMATOLOGY.coagulation));
  const [haemFactor, setHaemFactor] = useState(mapFromKeys(LRF01_HAEMATOLOGY.factorAssay));
  const [haemSpecial, setHaemSpecial] = useState(mapFromKeys(LRF01_HAEMATOLOGY.special));

  const [chemElectrolytes, setChemElectrolytes] = useState(
    mapFromKeys(LRF01_CHEMISTRY.electrolytes),
  );
  const [chemBloodSugar, setChemBloodSugar] = useState(mapFromKeys(LRF01_CHEMISTRY.bloodSugar));
  const [chemTumor, setChemTumor] = useState(mapFromKeys(LRF01_CHEMISTRY.tumorMarkers));
  const [chemLipids, setChemLipids] = useState(mapFromKeys(LRF01_CHEMISTRY.serumLipids));
  const [chemUrine, setChemUrine] = useState(mapFromKeys(LRF01_CHEMISTRY.urine));
  const [chemHormones, setChemHormones] = useState(mapFromKeys(LRF01_CHEMISTRY.hormones));
  const [chemCardiac, setChemCardiac] = useState(mapFromKeys(LRF01_CHEMISTRY.cardiacLiver));
  const [chemOther, setChemOther] = useState(mapFromKeys(LRF01_CHEMISTRY.other));

  const [bloodBank, setBloodBank] = useState(mapFromKeys(LRF01_BLOOD_BANK));
  const [immuno, setImmuno] = useState(mapNested(LRF01_IMMUNOLOGY));
  const [virology, setVirology] = useState(mapNested(LRF01_VIROLOGY));
  const [viroGrid, setViroGrid] = useState(() => {
    const grid = {};
    LRF01_VIROLOGY_GRID.forEach((row) => {
      grid[row] = mapFromKeys(LRF01_VIROLOGY_GRID_COLS);
    });
    return grid;
  });
  const [bactMicro, setBactMicro] = useState(mapFromKeys(LRF01_BACTERIOLOGY.microscopy));
  const [bactToxin, setBactToxin] = useState(mapFromKeys(LRF01_BACTERIOLOGY.toxin));
  const [bactCulture, setBactCulture] = useState(mapFromKeys(LRF01_BACTERIOLOGY.culture));
  const [parasites, setParasites] = useState(mapFromKeys(LRF01_PARASITOLOGY));
  const [mycology, setMycology] = useState(mapFromKeys(LRF01_MYCOLOGY));
  const [phleb, setPhleb] = useState(mapFromKeys(LRF01_PHLEB_TUBES));
  const [phlebInitials, setPhlebInitials] = useState('');
  const [phlebDateTime, setPhlebDateTime] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (pdfSuccess || pdfError) {
      const timer = setTimeout(() => dispatch(clearPdfState()), 5000);
      return () => clearTimeout(timer);
    }
  }, [pdfSuccess, pdfError, dispatch]);

  useEffect(() => {
    if (!patientUserId) return;
    const currentId = selectedUser?.user_id || selectedUser?.userId;
    if (currentId === patientUserId) return;
    dispatch(
      setSelectedUser({
        ...(selectedUser || {}),
        user_id: patientUserId,
        userId: patientUserId,
      }),
    );
  }, [patientUserId, selectedUser, dispatch]);

  useEffect(() => {
    if (!mounted || !patientUserId) return;
    if (profile?.userId === patientUserId) return;
    dispatch(fetchAdminProfileAction({ userId: patientUserId }));
  }, [mounted, patientUserId, profile?.userId, dispatch]);

  useEffect(() => {
    if (!patientUserId) return;
    if (profile?.userId && profile.userId !== patientUserId) return;
    if (profileLoading) return;
    if (profile == null && !selectedUser) return;
    setPatient((prev) => ({
      ...prev,
      ...pickProfile(profile?.profile, selectedUser),
    }));
  }, [profile, selectedUser, patientUserId, profileLoading]);

  const toggleMap = (setter) => (key) =>
    setter((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleNested = (setter, section) => (key) =>
    setter((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: !prev[section][key] },
    }));

  const applyWeightLoss = () => {
    const applied = applyWeightLossSelections({
      chemistryElectrolytes: chemElectrolytes,
      chemistryBloodSugar: chemBloodSugar,
      chemistrySerumLipids: chemLipids,
      chemistryCardiacLiver: chemCardiac,
    });
    setChemElectrolytes(applied.chemistryElectrolytes);
    setChemBloodSugar(applied.chemistryBloodSugar);
    setChemLipids(applied.chemistrySerumLipids);
    setChemCardiac(applied.chemistryCardiacLiver);
  };

  const displayName = useMemo(() => {
    return [patient.firstName, patient.middleName, patient.surname].filter(Boolean).join(' ') ||
      'Patient';
  }, [patient]);

  const generatePDF = async () => {
    try {
      const element = document.getElementById('lab-requisition-content');
      if (!element) return;
      const { captureLabRequisitionPdf } = await import('../../lib/lab-requisition-pdf');
      const pdf = await captureLabRequisitionPdf(element, { mode: 'letterFit' });
      pdf.save('lab-requisition.pdf');
    } catch (err) {
      console.error(err);
      alert('Error generating PDF. Please try again.');
    }
  };

  const sendPDF = () => {
    const fileName = `Lab-Requisition-${displayName.replace(/\s+/g, '-')}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    dispatch({
      type: 'pdf/generateAndSendPdf',
      payload: {
        elementId: 'lab-requisition-content',
        fileName,
        userInfo: {
          sub: profile?.userId,
          name: displayName,
          email: profile?.profile?.userEmail,
        },
        captureOptions: { mode: 'letterFit' },
      },
    });
  };

  if (isLoading || !mounted || (patientUserId && profileLoading && !profile)) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 1 }}>
            {profileLoading ? 'Loading patient profile…' : 'Loading…'}
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Alert severity="error">Error loading user: {error.message}</Alert>
        </Container>
      </>
    );
  }

  if (user && !hasLabAccess) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">Only Admin and Doctor roles can access Lab Requisition 2.</Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Please log in to access Lab Requisition 2.
          </Typography>
          <Button href="/api/auth/login" variant="contained">
            Log In
          </Button>
        </Container>
      </>
    );
  }

  const sex = String(patient.sex || '').toLowerCase();

  return (
    <>
      <Header />
      <Container maxWidth={false} sx={{ maxWidth: 900, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
            sx={{ textTransform: 'none' }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<MedicalServices />}
            onClick={applyWeightLoss}
            sx={{ textTransform: 'none' }}
          >
            Weight Loss Tests
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<PictureAsPdf />}
            onClick={generatePDF}
            sx={{ textTransform: 'none' }}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Send />}
            onClick={sendPDF}
            disabled={isGenerating || isSending}
            sx={{ textTransform: 'none' }}
          >
            {isGenerating || isSending ? <CircularProgress size={18} color="inherit" /> : 'Send'}
          </Button>
        </Box>

        {pdfSuccess && (
          <Alert severity="success" sx={{ mb: 1 }}>
            PDF sent successfully.
          </Alert>
        )}
        {pdfError && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Error sending PDF: {pdfError}
          </Alert>
        )}

        <div id="lab-requisition-content" className="lrf01-page">
          <style>{LRF01_CSS}</style>

          <header className="lrf-header pdf-header">
            <img
              src="/images/Lukaria_logo_background_removed_small.webp"
              alt="LuKaria Logo"
              className="lrf-logo"
            />
            <div className="lrf-brand">
              Svelte <span className="lrf-brand-sub">by LuKaria</span>
            </div>
          </header>
          <div className="lrf-note">
            Please complete sections A, B and C then select tests from section D.
          </div>

          <div className="lrf-ab">
            <Section title="SECTION A – Requesting Physician">
              <Line
                label="Doctor"
                value={physician.name}
                onChange={(v) => setPhysician((p) => ({ ...p, name: v }))}
                wide
              />
              <Line
                label="Address"
                value={physician.address}
                onChange={(v) => setPhysician((p) => ({ ...p, address: v }))}
                wide
              />
              <div className="lrf-row">
                <Line
                  label="Tel."
                  value={physician.tel}
                  onChange={(v) => setPhysician((p) => ({ ...p, tel: v }))}
                />
                <Line
                  label="Fax"
                  value={physician.fax}
                  onChange={(v) => setPhysician((p) => ({ ...p, fax: v }))}
                />
                <Line
                  label="Registration #"
                  value={physician.registration}
                  onChange={(v) => setPhysician((p) => ({ ...p, registration: v }))}
                />
                <Line
                  label="Date"
                  value={physician.date}
                  onChange={(v) => setPhysician((p) => ({ ...p, date: v }))}
                />
              </div>
              <div className="lrf-sig">
                <span>Signature</span>
                <img
                  className="lab-signature-img"
                  src="/images/signature.webp"
                  alt="Doctor signature"
                />
              </div>
            </Section>

            <Section title="SECTION B – Copies of results to:">
              <Line label="Doctor" value={copy1.name} onChange={(v) => setCopy1((p) => ({ ...p, name: v }))} wide />
              <Line
                label="Address"
                value={copy1.address}
                onChange={(v) => setCopy1((p) => ({ ...p, address: v }))}
                wide
              />
              <Line label="Doctor" value={copy2.name} onChange={(v) => setCopy2((p) => ({ ...p, name: v }))} wide />
              <Line
                label="Address"
                value={copy2.address}
                onChange={(v) => setCopy2((p) => ({ ...p, address: v }))}
                wide
              />
              <Line label="WARD/CLINIC" value={wardClinic} onChange={setWardClinic} wide />
            </Section>
          </div>

          <Section title="SECTION C – Patient Information">
            <div className="lrf-row">
              <Line label="SURNAME" value={patient.surname} onChange={(v) => setPatient((p) => ({ ...p, surname: v }))} />
              <Line label="FIRST NAME" value={patient.firstName} onChange={(v) => setPatient((p) => ({ ...p, firstName: v }))} />
              <Line label="MIDDLE NAME" value={patient.middleName} onChange={(v) => setPatient((p) => ({ ...p, middleName: v }))} />
            </div>
            <div className="lrf-row">
              <div className="lrf-sex">
                <span>SEX</span>
                <Tick
                  label="M"
                  checked={sex === 'm' || sex === 'male'}
                  onChange={() => setPatient((p) => ({ ...p, sex: 'Male' }))}
                />
                <Tick
                  label="F"
                  checked={sex === 'f' || sex === 'female'}
                  onChange={() => setPatient((p) => ({ ...p, sex: 'Female' }))}
                />
              </div>
              <Line label="AGE" value={patient.age} onChange={(v) => setPatient((p) => ({ ...p, age: v }))} />
              <Line
                label="DOB"
                value={patient.dateOfBirth}
                onChange={(v) => setPatient((p) => ({ ...p, dateOfBirth: v }))}
              />
              <Line label="REG No." value={patient.regNo} onChange={(v) => setPatient((p) => ({ ...p, regNo: v }))} />
            </div>
            <div className="lrf-row">
              <Line
                label="Clinical History"
                value={patient.clinicalHistory}
                onChange={(v) => setPatient((p) => ({ ...p, clinicalHistory: v }))}
                wide
              />
            </div>
            <div className="lrf-row">
              <Line
                label="Diagnosis"
                value={patient.diagnosis}
                onChange={(v) => setPatient((p) => ({ ...p, diagnosis: v }))}
              />
              <Line
                label="Date of Onset"
                value={patient.dateOfOnset}
                onChange={(v) => setPatient((p) => ({ ...p, dateOfOnset: v }))}
              />
              <Line label="Phone" value={patient.phone} onChange={(v) => setPatient((p) => ({ ...p, phone: v }))} />
            </div>
            <Line
              label="Address"
              value={patient.address}
              onChange={(v) => setPatient((p) => ({ ...p, address: v }))}
              wide
            />
          </Section>

          <Section title="SECTION D – Test(s) Requested Please Tick">
            <div className="lrf-d-grid">
              <div>
                <div className="lrf-col-head">HAEMATOLOGY</div>
                <Sub title="Routine">
                  <TickRow map={haemRoutine} onToggle={toggleMap(setHaemRoutine)} />
                </Sub>
                <Sub title="Coagulation">
                  <TickRow map={haemCoag} onToggle={toggleMap(setHaemCoag)} />
                </Sub>
                <Sub title="Factor Assay">
                  <TickRow map={haemFactor} onToggle={toggleMap(setHaemFactor)} />
                </Sub>
                <Sub title="Special Tests">
                  <TickRow map={haemSpecial} onToggle={toggleMap(setHaemSpecial)} />
                </Sub>

                <div className="lrf-col-head">BLOOD BANK</div>
                <TickRow map={bloodBank} onToggle={toggleMap(setBloodBank)} />
                <div className="lrf-note-small">Supplemental forms available for Cross Match and DNA</div>

                <div className="lrf-col-head">IMMUNOLOGY</div>
                <Sub title="Serology">
                  <TickRow map={immuno.serology} onToggle={toggleNested(setImmuno, 'serology')} />
                </Sub>
                <Sub title="Autoantibodies">
                  <TickRow
                    map={immuno.autoantibodies}
                    onToggle={toggleNested(setImmuno, 'autoantibodies')}
                  />
                </Sub>
                <Sub title="Serum Protein Concentrate">
                  <TickRow
                    map={immuno.serumProtein}
                    onToggle={toggleNested(setImmuno, 'serumProtein')}
                  />
                </Sub>
                <Sub title="Lymphocyte Enumeration">
                  <TickRow map={immuno.lymphocyte} onToggle={toggleNested(setImmuno, 'lymphocyte')} />
                </Sub>
                <Sub title="Other Tests">
                  <TickRow map={immuno.other} onToggle={toggleNested(setImmuno, 'other')} />
                </Sub>

                <div className="lrf-col-head">BACTERIOLOGY</div>
                <Line label="Current antibiotic treatment" value={antibioticTx} onChange={setAntibioticTx} wide />
                <Sub title="Microscopy">
                  <TickRow map={bactMicro} onToggle={toggleMap(setBactMicro)} />
                </Sub>
                <Sub title="Toxin detection">
                  <TickRow map={bactToxin} onToggle={toggleMap(setBactToxin)} />
                </Sub>
                <Sub title="Culture">
                  <TickRow map={bactCulture} onToggle={toggleMap(setBactCulture)} />
                </Sub>

                <div className="lrf-col-head">PARASITOLOGY</div>
                <TickRow map={parasites} onToggle={toggleMap(setParasites)} />

                <div className="lrf-col-head">MYCOLOGY</div>
                <Line label="Current treatment" value={mycologyTx} onChange={setMycologyTx} wide />
                <TickRow map={mycology} onToggle={toggleMap(setMycology)} />
              </div>

              <div>
                <div className="lrf-col-head">CLINICAL CHEMISTRY</div>
                <Sub title="Electrolytes and Renal Function Tests">
                  <TickRow map={chemElectrolytes} onToggle={toggleMap(setChemElectrolytes)} />
                </Sub>
                <Sub title="Blood Sugar Tests">
                  <TickRow map={chemBloodSugar} onToggle={toggleMap(setChemBloodSugar)} />
                </Sub>
                <Sub title="Tumor Markers">
                  <TickRow map={chemTumor} onToggle={toggleMap(setChemTumor)} />
                </Sub>
                <Sub title="Serum Protein and Lipids">
                  <TickRow map={chemLipids} onToggle={toggleMap(setChemLipids)} />
                </Sub>
                <Sub title="Urine">
                  <TickRow map={chemUrine} onToggle={toggleMap(setChemUrine)} />
                </Sub>
                <Sub title="Hormones">
                  <TickRow map={chemHormones} onToggle={toggleMap(setChemHormones)} />
                </Sub>
                <Sub title="Cardiac and Liver Function Tests">
                  <TickRow map={chemCardiac} onToggle={toggleMap(setChemCardiac)} />
                </Sub>
                <Sub title="Other">
                  <TickRow map={chemOther} onToggle={toggleMap(setChemOther)} />
                  <Line label="Other specify" value={otherSpecify} onChange={setOtherSpecify} wide />
                </Sub>

                <div className="lrf-col-head">VIROLOGY</div>
                <Sub title="Fever & Rash">
                  <TickRow map={virology.feverRash} onToggle={toggleNested(setVirology, 'feverRash')} />
                </Sub>
                <Sub title="Hepatitis Screening">
                  <TickRow map={virology.hepatitis} onToggle={toggleNested(setVirology, 'hepatitis')} />
                </Sub>
                <Sub title="Other Tests">
                  <TickRow map={virology.otherTests} onToggle={toggleNested(setVirology, 'otherTests')} />
                </Sub>
                <Sub title="Vaccine Status">
                  <TickRow map={virology.vaccine} onToggle={toggleNested(setVirology, 'vaccine')} />
                </Sub>
                <Sub title="STI Screening">
                  <TickRow map={virology.sti} onToggle={toggleNested(setVirology, 'sti')} />
                  <Line label="Other specify" value={virologyOther} onChange={setVirologyOther} wide />
                </Sub>

                <Sub title="Advanced (Genotyping / Resistance / Viral Load / PCR)">
                  <table className="lrf-grid-table">
                    <thead>
                      <tr>
                        <th>Specimen</th>
                        {LRF01_VIROLOGY_GRID_COLS.map((c) => (
                          <th key={c}>{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {LRF01_VIROLOGY_GRID.map((row) => (
                        <tr key={row}>
                          <td>{row}</td>
                          {LRF01_VIROLOGY_GRID_COLS.map((col) => (
                            <td key={col}>
                              <input
                                type="checkbox"
                                checked={!!viroGrid[row][col]}
                                onChange={() =>
                                  setViroGrid((prev) => ({
                                    ...prev,
                                    [row]: { ...prev[row], [col]: !prev[row][col] },
                                  }))
                                }
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Sub>
              </div>
            </div>
          </Section>

          <Section title="TO BE COMPLETED BY THE PHLEBOTOMIST">
            <div className="lrf-note-small">Please indicate the type and quantity of samples</div>
            <TickRow map={phleb} onToggle={toggleMap(setPhleb)} />
            <div className="lrf-row">
              <Line label="PHLEB. INITIALS" value={phlebInitials} onChange={setPhlebInitials} />
              <Line label="DATE & TIME COLLECTED" value={phlebDateTime} onChange={setPhlebDateTime} />
            </div>
          </Section>
        </div>
      </Container>

      <Backdrop open={isGenerating || isSending} sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 1 }}>Please wait while we process your request</Typography>
        </Box>
      </Backdrop>
    </>
  );
}

const LRF01_CSS = `
.lrf01-page {
  width: 8.5in;
  max-width: 100%;
  margin: 0 auto;
  padding: 0.22in 0.28in;
  background: #fff;
  color: #000;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 7.5pt;
  line-height: 1.15;
  border: 1px solid #333;
  box-sizing: border-box;
}
.lrf-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 2px solid #000;
  padding: 4px 0 6px;
  margin-bottom: 2px;
}
.lrf-logo {
  height: 42px;
  width: auto;
  display: block;
}
.lrf-brand {
  font-family: "Alex Brush", cursive;
  font-size: 22pt;
  font-weight: 700;
  color: #877449;
  line-height: 1;
}
.lrf-brand-sub {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 0.45em;
  font-weight: 400;
  vertical-align: sub;
  color: #877449;
}
.lrf-note {
  font-size: 6.5pt;
  text-align: center;
  margin-bottom: 4px;
}
.lrf-note-small { font-size: 6pt; font-style: italic; margin: 1px 0 2px; }
.lrf-ab { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.lrf-section { border: 1px solid #000; padding: 3px 4px; margin-bottom: 3px; }
.lrf-section-title { font-weight: 700; font-size: 7.5pt; margin-bottom: 2px; background: #eee; padding: 1px 3px; }
.lrf-col-head { font-weight: 700; font-size: 8pt; margin: 4px 0 2px; border-bottom: 1px solid #000; padding-bottom: 1px; }
.lrf-sub { margin-bottom: 3px; }
.lrf-sub-title {
  font-weight: 700;
  font-size: 7.5pt;
  margin: 3px 0 2px;
  padding: 1px 3px;
  background: #f3f3f3;
  border-left: 3px solid #877449;
  text-decoration: none;
}
.lrf-d-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.lrf-ticks { display: flex; flex-wrap: wrap; gap: 1px 6px; }
.lrf-tick {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 6.5pt;
  white-space: nowrap;
  margin: 0;
}
.lrf-tick input { width: 9px; height: 9px; margin: 0; }
.lrf-line {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin: 1px 0;
  flex: 1;
  min-width: 0;
}
.lrf-line span { white-space: nowrap; font-size: 6.5pt; }
.lrf-line input {
  flex: 1;
  border: none;
  border-bottom: 1px solid #000;
  font-size: 7pt;
  padding: 0 2px;
  min-width: 0;
  background: transparent;
}
.lrf-line-wide { width: 100%; }
.lrf-row { display: flex; gap: 6px; flex-wrap: wrap; }
.lrf-sex { display: inline-flex; align-items: center; gap: 6px; font-size: 6.5pt; }
.lrf-sig {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  min-height: 42px;
}
.lrf-sig img {
  max-height: 40px;
  width: auto;
  display: block;
}
.lrf-grid-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 6.5pt;
}
.lrf-grid-table th, .lrf-grid-table td {
  border: 1px solid #000;
  padding: 1px 2px;
  text-align: center;
}
.lrf-grid-table th:first-child, .lrf-grid-table td:first-child { text-align: left; }
@media print {
  .lrf01-page { border: none; width: 8.5in; }
}
`;
