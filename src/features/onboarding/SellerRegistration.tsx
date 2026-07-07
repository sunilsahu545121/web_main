// @ts-nocheck
import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import {
  Check, Info, AlertTriangle, UploadCloud, CheckCircle2, X,
  CreditCard, Landmark, ShieldAlert, ArrowLeft, ArrowRight, Send, Loader2
} from 'lucide-react';

declare global { interface Window { Razorpay: any; } }

const STEPS = [
  { title: 'Personal' },
  { title: 'Business' },
  { title: 'Address' },
  { title: 'Bank' },
  { title: 'KYC' },
  { title: 'Payment' },
  { title: 'Review' }
];

const PLANS = [
  { id: 'basic', name: 'Basic', price: 1499, features: ['Up to 50 products', 'Standard support', 'Basic analytics'] },
  { id: 'standard', name: 'Standard', price: 2999, features: ['Up to 500 products', 'Priority support', 'Advanced analytics', 'Promotions'] },
  { id: 'premium', name: 'Premium', price: 4999, features: ['Unlimited products', '24/7 support', 'Premium analytics', 'Featured listings', 'Dedicated manager'] }
];

type FileState = {
  pan_card?: File;
  gst_certificate?: File;
  aadhar_front?: File;
  aadhar_back?: File;
  cancelled_cheque?: File;
  storefront_photo?: File;
  owner_photo?: File;
};

export function SellerRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [files, setFiles] = useState<FileState>({});
  const [dragOver, setDragOver] = useState<keyof FileState | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      owner_name: '', email: '', phone: '', dob: '', gender: '', password: '',
      business_name: '', business_type: '', category: '', gst_number: '', pan_number: '', fssai_number: '',
      years_in_business: '0', employees: '1', monthly_revenue: '1', description: '',
      address_line1: '', address_line2: '', landmark: '', pincode: '', city: '', state: '',
      account_holder: '', account_number: '', confirm_account: '', ifsc: '', bank_name: '', branch: '', account_type: '',
      plan: 'basic', payment_method: 'razorpay', agreed_terms: false
    }
  });

  const formValues = watch();
  const selectedPlan = PLANS.find(p => p.id === formValues.plan);

  const nextStep = async () => {
    // Basic step validation could be added here via `trigger(['fields'])`
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleDrop = (e: React.DragEvent, key: keyof FileState) => {
    e.preventDefault();
    setDragOver(null);
    if (e.dataTransfer.files?.[0]) {
      setFiles(prev => ({ ...prev, [key]: e.dataTransfer.files[0] }));
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileState) => {
    if (e.target.files?.[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const removeFile = (key: keyof FileState) => {
    setFiles(prev => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const fetchLocation = async (pincode: string) => {
    if (pincode.length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === 'Success') {
        const po = data[0].PostOffice[0];
        setValue('city', po.District);
        setValue('state', po.State);
      }
    } catch { }
  };

  const onSubmit = async (data: typeof formValues) => {
    if (!data.agreed_terms) return toast.error('You must agree to the terms');
    if (!files.pan_card || !files.aadhar_front || !files.aadhar_back || !files.cancelled_cheque || !files.storefront_photo || !files.owner_photo) {
      toast.error('Please upload all mandatory documents');
      setCurrentStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { full_name: data.owner_name, role: 'seller', dob: data.dob, gender: data.gender } },
      });
      if (authError) throw authError;
      const userId = auth.user!.id;

      const upload = async (file: File, path: string) => {
        const { error } = await supabase.storage.from('seller-docs').upload(`${userId}/${path}`, file);
        if (error) throw error;
        return supabase.storage.from('seller-docs').getPublicUrl(`${userId}/${path}`).data.publicUrl;
      };

      const [pan, gst, aadhaarF, aadhaarB, cheque, store, owner] = await Promise.all([
        upload(files.pan_card, 'pan'),
        files.gst_certificate ? upload(files.gst_certificate, 'gst') : Promise.resolve(null),
        upload(files.aadhar_front, 'aadhar_front'),
        upload(files.aadhar_back, 'aadhar_back'),
        upload(files.cancelled_cheque, 'cheque'),
        upload(files.storefront_photo, 'storefront'),
        upload(files.owner_photo, 'owner'),
      ]);

      const { error: kycError, data: kycData } = await supabase.from('seller_kyc').insert({
        seller_id: userId,
        business_name: data.business_name,
        business_type: data.business_type,
        category: data.category,
        gst_number: data.gst_number,
        pan_number: data.pan_number,
        fssai_number: data.fssai_number,
        years_in_business: data.years_in_business,
        employees: data.employees,
        monthly_revenue: data.monthly_revenue,
        description: data.description,
        address_line1: data.address_line1,
        address_line2: data.address_line2,
        landmark: data.landmark,
        pincode: data.pincode,
        city: data.city,
        state: data.state,
        account_holder: data.account_holder,
        account_number_masked: `XXXX${data.account_number.slice(-4)}`,
        ifsc: data.ifsc,
        bank_name: data.bank_name,
        branch: data.branch,
        account_type: data.account_type,
        pan_document_url: pan,
        gst_document_url: gst,
        aadhar_front_url: aadhaarF,
        aadhar_back_url: aadhaarB,
        cancelled_cheque_url: cheque,
        storefront_photo_url: store,
        owner_photo_url: owner,
        plan_selected: data.plan,
        payment_method: data.payment_method,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }).select().single();

      if (kycError) throw kycError;

      if (data.payment_method === 'razorpay') {
        const subRes = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/create-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.session!.access_token}`,
          },
          body: JSON.stringify({ plan: data.plan }),
        });
        const sub = await subRes.json();
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          subscription_id: sub.subscription_id,
          name: 'Krixify',
          description: 'Seller Subscription',
          handler: (response: any) => {
            setAppId(kycData.id);
            setSubmitted(true);
            toast.success('Payment successful!');
          },
          prefill: { name: data.owner_name, email: data.email, contact: data.phone },
          theme: { color: '#f97316' }, // Orange-500
        });
        rzp.open();
      } else {
        setAppId(kycData.id);
        setSubmitted(true);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="mb-2 text-3xl font-bold">Application Submitted! 🎉</h2>
          <p className="mb-6 text-gray-500">Your seller application has been received.</p>
          <div className="mx-auto mb-6 max-w-md rounded-xl bg-orange-50 p-6">
            <p className="mb-2 text-sm text-gray-700"><strong>Application ID:</strong></p>
            <p className="font-mono text-2xl font-bold text-orange-500">{appId.split('-')[0].toUpperCase()}</p>
          </div>
          <div className="mx-auto max-w-md space-y-2 text-left text-sm text-gray-600">
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Documents received</p>
            <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Under review by verification team</p>
            <p className="flex items-center gap-2"><Info className="h-4 w-4 text-yellow-500" /> Verification takes 24-48 hours</p>
          </div>
          <button onClick={() => navigate('/login')} className="mt-8 rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white hover:bg-orange-600">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-6 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white">
                <span className="text-2xl font-bold text-orange-500">K</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Become a Krixify Seller</h1>
                <p className="text-sm text-orange-100">Complete your registration to start selling</p>
              </div>
            </div>
            <div className="hidden text-right md:block">
              <p className="text-sm text-orange-100">Subscription Fee</p>
              <p className="text-2xl font-bold">₹{selectedPlan?.price || 1499}<span className="text-sm font-normal">/year</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS STEPS */}
      <div className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-center justify-between overflow-x-auto">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  className={clsx(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    currentStep === idx ? 'bg-orange-500 text-white' :
                      currentStep > idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {currentStep > idx ? <Check className="h-5 w-5" /> : idx + 1}
                </button>
                <div className="ml-2 mr-4 hidden sm:block">
                  <p className={clsx('whitespace-nowrap text-xs', currentStep === idx ? 'font-semibold text-orange-600' : 'text-gray-500')}>
                    {step.title}
                  </p>
                </div>
                {idx < STEPS.length - 1 && <div className="mr-2 h-0.5 w-8 bg-gray-300 md:w-16"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM CONTAINER */}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1: BASIC INFO */}
          {currentStep === 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">👤 Basic Information</h2>
              <p className="mb-6 text-sm text-gray-500">Tell us about yourself</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Full Name (as per PAN) *</label>
                  <input {...register('owner_name')} required className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Email *</label>
                  <input type="email" {...register('email')} required className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Mobile Number *</label>
                  <input type="tel" {...register('phone')} required pattern="[6-9][0-9]{9}" maxLength={10} className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Date of Birth *</label>
                  <input type="date" {...register('dob')} required className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Gender</label>
                  <select {...register('gender')} className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none bg-transparent">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Password *</label>
                  <input type="password" {...register('password')} required minLength={8} className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Min 8 characters" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS INFO */}
          {currentStep === 1 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">🏢 Business Details</h2>
              <p className="mb-6 text-sm text-gray-500">Information about your business</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Business/Shop Name *</label>
                  <input {...register('business_name')} required className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="ABC Traders" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Business Type *</label>
                  <select {...register('business_type')} required className="w-full rounded-lg border px-4 py-2.5 bg-transparent outline-none">
                    <option value="">Select type</option>
                    <option value="proprietorship">Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="private_limited">Private Limited</option>
                    <option value="individual">Individual/Sole Trader</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Business Category *</label>
                  <select {...register('category')} required className="w-full rounded-lg border px-4 py-2.5 bg-transparent outline-none">
                    <option value="">Select category</option>
                    <option value="grocery">Grocery & Essentials</option>
                    <option value="electronics">Electronics & Mobiles</option>
                    <option value="fashion">Fashion & Apparel</option>
                    <option value="home_kitchen">Home & Kitchen</option>
                    <option value="health_beauty">Health & Beauty</option>
                    <option value="books_stationery">Books & Stationery</option>
                    <option value="sports_fitness">Sports & Fitness</option>
                    <option value="toys_baby">Toys & Baby Products</option>
                    <option value="automotive">Automotive Accessories</option>
                    <option value="pet_supplies">Pet Supplies</option>
                    <option value="hardware_tools">Hardware & Tools</option>
                    <option value="pharmacy">Pharmacy & Medicines</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">GST Number</label>
                  <input {...register('gst_number')} maxLength={15} className="w-full uppercase rounded-lg border px-4 py-2.5 outline-none" placeholder="22AAAAA0000A1Z5" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">PAN Number *</label>
                  <input {...register('pan_number')} required maxLength={10} className="w-full uppercase rounded-lg border px-4 py-2.5 outline-none" placeholder="ABCDE1234F" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Business Description</label>
                  <textarea {...register('description')} rows={3} className="w-full rounded-lg border px-4 py-2.5 outline-none" placeholder="Tell us about your business..."></textarea>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PICKUP ADDRESS */}
          {currentStep === 2 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">📍 Pickup Address</h2>
              <p className="mb-6 text-sm text-gray-500">Where should we pick up orders from?</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Shop/Building Number *</label>
                  <input {...register('address_line1')} required className="w-full rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Street/Area *</label>
                  <input {...register('address_line2')} required className="w-full rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Pincode *</label>
                  <input {...register('pincode')} required maxLength={6} onBlur={(e) => fetchLocation(e.target.value)} className="w-full rounded-lg border px-4 py-2.5 outline-none" placeholder="110001" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">City *</label>
                  <input {...register('city')} required readOnly className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">State *</label>
                  <input {...register('state')} required readOnly className="w-full rounded-lg border bg-gray-50 px-4 py-2.5 outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BANK DETAILS */}
          {currentStep === 3 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">🏦 Bank Account Details</h2>
              <p className="mb-6 text-sm text-gray-500">For receiving payments</p>
              <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <div className="flex">
                  <AlertTriangle className="mr-3 mt-1 h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important:</p>
                    <p className="text-sm text-yellow-700">Penny drop verification will be done.</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">Account Holder Name *</label>
                  <input {...register('account_holder')} required className="w-full rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Account Number *</label>
                  <input {...register('account_number')} required className="w-full rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Confirm Account Number *</label>
                  <input {...register('confirm_account')} required className="w-full rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">IFSC Code *</label>
                  <input {...register('ifsc')} required className="w-full uppercase rounded-lg border px-4 py-2.5 outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Account Type *</label>
                  <select {...register('account_type')} required className="w-full rounded-lg border px-4 py-2.5 bg-transparent outline-none">
                    <option value="">Select</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KYC DOCUMENTS */}
          {currentStep === 4 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">📄 KYC Documents</h2>
              <p className="mb-6 text-sm text-gray-500">Upload required documents for verification</p>
              
              <div className="space-y-4">
                {(['pan_card', 'gst_certificate', 'aadhar_front', 'aadhar_back', 'cancelled_cheque', 'storefront_photo', 'owner_photo'] as const).map(key => (
                  <div key={key} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{key.replace('_', ' ')} {key !== 'gst_certificate' && '*'}</p>
                      </div>
                      {files[key] && <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">✓ Uploaded</span>}
                    </div>
                    <label
                      onDragOver={(e) => { e.preventDefault(); setDragOver(key); }}
                      onDragLeave={() => setDragOver(null)}
                      onDrop={(e) => handleDrop(e, key)}
                      className={clsx(
                        'block cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all',
                        dragOver === key ? 'border-orange-500 bg-orange-50' : files[key] ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      )}
                    >
                      <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFile(e, key)} />
                      {!files[key] ? (
                        <>
                          <UploadCloud className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-600">Click or drag {key.replace('_', ' ')} here</p>
                        </>
                      ) : (
                        <div className="flex items-center justify-center text-sm text-green-700">
                          <CheckCircle2 className="mr-2 h-4 w-4" /> {files[key]?.name}
                          <button type="button" onClick={(e) => { e.preventDefault(); removeFile(key); }} className="ml-2 text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: SUBSCRIPTION */}
          {currentStep === 5 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">💳 Subscription & Payment</h2>
              <p className="mb-6 text-sm text-gray-500">Choose your plan and complete payment</p>
              
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {PLANS.map(plan => (
                  <label key={plan.id} className={clsx('cursor-pointer rounded-xl border-2 p-4 transition', formValues.plan === plan.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200')}>
                    <input type="radio" value={plan.id} {...register('plan')} className="hidden" />
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-bold">{plan.name}</h3>
                      {formValues.plan === plan.id && <CheckCircle2 className="text-orange-500" />}
                    </div>
                    <p className="mb-2 text-2xl font-bold">₹{plan.price}<span className="text-sm font-normal text-gray-500">/year</span></p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      {plan.features.map(f => (
                        <li key={f} className="flex"><Check className="mr-1 h-3 w-3 text-green-500" /> {f}</li>
                      ))}
                    </ul>
                  </label>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-3 font-bold">Payment Method</h3>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                    <input type="radio" value="razorpay" {...register('payment_method')} className="mr-3" />
                    <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Online Payment</p>
                      <p className="text-xs text-gray-500">UPI, Cards, NetBanking</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center rounded-lg border p-3 hover:bg-gray-50">
                    <input type="radio" value="bank_transfer" {...register('payment_method')} className="mr-3" />
                    <Landmark className="mr-2 h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-xs text-gray-500">NEFT/IMPS</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 6 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-1 text-2xl font-bold">✅ Review & Submit</h2>
              <p className="mb-6 text-sm text-gray-500">Please verify all information</p>

              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 p-4 text-sm">
                  <div className="mb-2 flex justify-between"><h3 className="font-bold">Personal</h3><button type="button" onClick={() => setCurrentStep(0)} className="text-orange-500">Edit</button></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Name:</strong> {formValues.owner_name}</div>
                    <div><strong>Email:</strong> {formValues.email}</div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-4 text-sm">
                  <div className="mb-2 flex justify-between"><h3 className="font-bold">Business</h3><button type="button" onClick={() => setCurrentStep(1)} className="text-orange-500">Edit</button></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Business:</strong> {formValues.business_name}</div>
                    <div><strong>PAN:</strong> {formValues.pan_number}</div>
                  </div>
                </div>

                <label className="mt-4 flex items-start gap-2">
                  <input type="checkbox" {...register('agreed_terms')} required className="mt-1" />
                  <span className="text-sm text-gray-600">I agree to the Terms of Service and confirm that all information is accurate.</span>
                </label>
              </div>
            </div>
          )}

          {/* NAV BUTTONS */}
          <div className="mt-6 flex justify-between">
            {currentStep > 0 && (
              <button type="button" onClick={prevStep} className="flex items-center rounded-lg border px-6 py-2.5 font-medium hover:bg-gray-50">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </button>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} className="ml-auto flex items-center rounded-lg bg-orange-500 px-6 py-2.5 font-medium text-white hover:bg-orange-600">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting || !formValues.agreed_terms} className="ml-auto flex items-center rounded-lg bg-green-500 px-6 py-2.5 font-medium text-white hover:bg-green-600 disabled:opacity-50">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
