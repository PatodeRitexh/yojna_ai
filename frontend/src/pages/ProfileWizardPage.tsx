import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { UserProfile, ProfileCompletion } from '../types';
import {
  User, MapPin, GraduationCap, IndianRupee,
  Shield, Check, ArrowRight, ArrowLeft, Sparkles, AlertCircle
} from 'lucide-react';

export const ProfileWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    dob: '',
    age: undefined,
    gender: 'prefer_not_to_say',
    state: 'Maharashtra',
    district: '',
    pin_code: '',
    residence_type: 'urban',
    education_level: 'undergraduate',
    education_status: 'studying',
    course_stream: 'Engineering',
    occupation: 'student',
    annual_family_income: 150000,
    family_size: 4,
    marital_status: 'single',
    is_disabled: false,
    disability_percentage: undefined,
    is_farmer: false,
    landholding_acres: undefined,
    category: 'general',
    is_minority: false,
    minority_community: '',
    has_domicile_certificate: true,
  });

  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, compData] = await Promise.all([
          api.getProfile(),
          api.getProfileCompletion()
        ]);
        setProfile((prev) => ({ ...prev, ...profData }));
        setCompletion(compData);
      } catch (err: any) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobStr = e.target.value;
    let computedAge = profile.age;
    if (dobStr) {
      const birth = new Date(dobStr);
      const now = new Date();
      computedAge = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        computedAge--;
      }
    }
    setProfile({ ...profile, dob: dobStr, age: computedAge });
  };

  const handleSaveAndGenerate = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.updateProfile(profile);
      await api.refreshRecommendations();
      setSuccessMsg('Profile updated! Redirecting to your personalized recommendations...');
      setTimeout(() => navigate('/recommendations'), 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Location', icon: MapPin },
    { num: 3, label: 'Education & Career', icon: GraduationCap },
    { num: 4, label: 'Financial & Family', icon: IndianRupee },
    { num: 5, label: 'Category & Special', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading citizen profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Citizen Eligibility Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete your information to allow the deterministic rules engine to find matching schemes.
          </p>
        </div>

        {completion && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 min-w-[180px] shadow-sm">
            <div className="flex justify-between items-center text-xs font-semibold mb-1">
              <span className="text-slate-600">Completeness:</span>
              <span className="text-indiaGreen-700 font-bold">{completion.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indiaGreen-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completion.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 border-b border-slate-200">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = s.num < step;
          const isCurrent = s.num === step;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
                isCurrent
                  ? 'bg-navy-900 text-white'
                  : isDone
                  ? 'bg-indiaGreen-50 text-indiaGreen-800'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isCurrent ? 'bg-saffron-500 text-white' : isDone ? 'bg-indiaGreen-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : s.num}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-indiaGreen-50 text-indiaGreen-800 text-xs rounded-lg flex items-center gap-2 border border-indiaGreen-200">
          <Check className="w-4 h-4 text-indiaGreen-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <User className="w-5 h-5 text-navy-700" /> Personal Identity Details
            </h3>
            <p className="text-xs text-slate-500">
              Basic identification information used to verify individual age limits and personal quotas.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  placeholder="As written on Aadhaar or Birth Certificate"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profile.dob || ''}
                    onChange={handleDobChange}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Calculated Age (Years)</label>
                  <input
                    type="number"
                    value={profile.age ?? ''}
                    readOnly
                    placeholder="Auto-calculated from DOB"
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-slate-50 rounded-lg text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={profile.gender || 'prefer_not_to_say'}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Required for schemes like Maharashtra 100% Free Education for Girls.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residence Type</label>
                  <select
                    value={profile.residence_type || 'urban'}
                    onChange={(e) => setProfile({ ...profile, residence_type: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="urban">Urban (City / Municipal)</option>
                    <option value="rural">Rural (Gram Panchayat / Village)</option>
                    <option value="semi_urban">Semi-Urban</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-navy-700" /> Residential & State Location
            </h3>
            <p className="text-xs text-slate-500">
              Schemes are often restricted by State Domicile (e.g. MahaDBT schemes require Maharashtra residence).
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State / Union Territory</label>
                <select
                  value={profile.state || 'Maharashtra'}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Other">Other Indian State</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    value={profile.district || ''}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    placeholder="e.g. Pune, Nagpur, Nashik, Mumbai Suburban"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code (Optional)</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={profile.pin_code || ''}
                    onChange={(e) => setProfile({ ...profile, pin_code: e.target.value })}
                    placeholder="e.g. 411001"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.has_domicile_certificate ?? false}
                    onChange={(e) => setProfile({ ...profile, has_domicile_certificate: e.target.checked })}
                    className="rounded text-navy-900 focus:ring-navy-800 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    I hold a valid State Domicile Certificate issued by the competent authority
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION & OCCUPATION */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-navy-700" /> Education & Employment
            </h3>
            <p className="text-xs text-slate-500">
              Crucial for scholarship matching (e.g. engineering, medical, post-matric diploma assistance).
            </p>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
                  <select
                    value={profile.education_level || 'undergraduate'}
                    onChange={(e) => setProfile({ ...profile, education_level: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="below_10th">Below 10th Standard</option>
                    <option value="10th_pass">10th Pass (SSC)</option>
                    <option value="12th_pass">12th Pass (HSC)</option>
                    <option value="diploma">Polytechnic / Diploma</option>
                    <option value="undergraduate">Undergraduate (B.E., B.Tech, B.Sc, B.Com, B.A., MBBS)</option>
                    <option value="postgraduate">Postgraduate (M.E., M.Tech, M.Sc, M.A., MBA)</option>
                    <option value="doctorate">Doctorate / Ph.D.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Education Status</label>
                  <select
                    value={profile.education_status || 'studying'}
                    onChange={(e) => setProfile({ ...profile, education_status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="studying">Currently Studying / Enrolled</option>
                    <option value="completed">Completed Studies</option>
                    <option value="dropout">Dropout / Discontinued</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Stream / Discipline</label>
                  <input
                    type="text"
                    value={profile.course_stream || ''}
                    onChange={(e) => setProfile({ ...profile, course_stream: e.target.value })}
                    placeholder="e.g. Engineering, Medicine, Science, Arts, Commerce"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Occupation</label>
                  <select
                    value={profile.occupation || 'student'}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="farmer">Farmer / Cultivator</option>
                    <option value="agricultural_laborer">Agricultural Laborer</option>
                    <option value="salaried">Salaried (Private / Public)</option>
                    <option value="self_employed">Self Employed / Small Business</option>
                    <option value="daily_wage">Daily Wage Worker</option>
                    <option value="unemployed">Unemployed / Jobseeker</option>
                    <option value="homemaker">Homemaker</option>
                    <option value="retired">Retired / Senior Citizen</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIAL & FAMILY */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-navy-700" /> Income & Household Details
            </h3>
            <p className="text-xs text-slate-500">
              Government welfare schemes establish hard annual income caps (e.g. ₹1.5 Lakhs for OBC scholarships, ₹8 Lakhs for EBC).
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Family Income (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={profile.annual_family_income ?? ''}
                    onChange={(e) => setProfile({ ...profile, annual_family_income: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 150000"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Gross annual income of parents/family as certified by Revenue Authority (Tahsildar).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Family Members Count</label>
                  <input
                    type="number"
                    min={1}
                    value={profile.family_size ?? 1}
                    onChange={(e) => setProfile({ ...profile, family_size: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
                  <select
                    value={profile.marital_status || 'single'}
                    onChange={(e) => setProfile({ ...profile, marital_status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                  >
                    <option value="single">Single / Unmarried</option>
                    <option value="married">Married</option>
                    <option value="widowed">Widowed</option>
                    <option value="divorced">Divorced / Separated</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Farmer Status */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.is_farmer ?? false}
                    onChange={(e) => setProfile({ ...profile, is_farmer: e.target.checked })}
                    className="rounded text-navy-900 focus:ring-navy-800 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    Applicant / Family owns agricultural land (Farmer Household)
                  </span>
                </label>

                {profile.is_farmer && (
                  <div className="pl-6 pt-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Total Agricultural Landholding (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.landholding_acres ?? ''}
                      onChange={(e) => setProfile({ ...profile, landholding_acres: Number(e.target.value) })}
                      placeholder="e.g. 2.5"
                      className="w-48 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CATEGORY & SPECIAL CRITERIA */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-navy-950 flex items-center gap-2">
              <Shield className="w-5 h-5 text-navy-700" /> Social Category & Special Criteria
            </h3>
            <p className="text-xs text-slate-500">
              Only collected for affirmative action and targeted welfare matching as prescribed by Central and State Acts.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Social Welfare Category
                </label>
                <select
                  value={profile.category || 'general'}
                  onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none bg-white"
                >
                  <option value="general">General / Open (General Category)</option>
                  <option value="obc">OBC (Other Backward Class)</option>
                  <option value="sc">SC (Scheduled Caste)</option>
                  <option value="st">ST (Scheduled Tribe)</option>
                  <option value="ews">EWS (Economically Weaker Section)</option>
                  <option value="vjnt">VJNT (Vimukta Jati & Nomadic Tribes - Maharashtra)</option>
                  <option value="sbc">SBC (Special Backward Class - Maharashtra)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Used exclusively for official affirmative action schemes (e.g. MahaDBT Post-Matric OBC/SC/ST scholarships).
                </p>
              </div>

              {/* Disability */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.is_disabled ?? false}
                    onChange={(e) => setProfile({ ...profile, is_disabled: e.target.checked })}
                    className="rounded text-navy-900 focus:ring-navy-800 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    Person with Benchmark Disability (PwD / Divyangjan)
                  </span>
                </label>

                {profile.is_disabled && (
                  <div className="pl-6 pt-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Disability Percentage (as per UDID Card / Certificate)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={profile.disability_percentage ?? ''}
                      onChange={(e) => setProfile({ ...profile, disability_percentage: Number(e.target.value) })}
                      placeholder="e.g. 40 or 80"
                      className="w-48 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-navy-800 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">National disability pensions require benchmark 80%+.</p>
                  </div>
                )}
              </div>

              {/* Religious Minority */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.is_minority ?? false}
                    onChange={(e) => setProfile({ ...profile, is_minority: e.target.checked })}
                    className="rounded text-navy-900 focus:ring-navy-800 w-4 h-4"
                  />
                  <span className="text-xs text-slate-700 font-semibold">
                    Belongs to Notified Minority Community (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-navy-900 hover:bg-navy-800 rounded-xl shadow-sm transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndGenerate}
                disabled={saving}
                className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indiaGreen-600 to-indiaGreen-700 hover:from-indiaGreen-700 hover:to-indiaGreen-800 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-saffron-300" />
                <span>{saving ? 'Evaluating Rules...' : 'Save Profile & Match Schemes'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
