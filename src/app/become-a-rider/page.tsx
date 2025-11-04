"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createRiderAsync } from "@/state/riderSlice";
import { AppDispatch } from "@/state/store";
import { IRiders } from "../../../types/types";

const BecomeARiderPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<IRiders>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dateOfBirth: "",
    nin: "",
    bvn: "",
    vehicleType: "",
    previousWorkPlace: "",
    workDuration: "",
    guarantor1Name: "",
    guarantor1Phone: "",
    guarantor1Relationship: "",
    guarantor2Name: "",
    guarantor2Phone: "",
    guarantor2Relationship: "",
    referralCode: "",
    status: "pending",
  });
  const [driversLicensePicture, setDriversLicensePicture] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDriversLicensePicture(e.target.files[0]);
    }
  };

  const validateStep1 = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'gender', 'dateOfBirth', 'nin',];
    for (const field of requiredFields) {
      if (!formData[field as keyof IRiders]) {
        setMessage({ text: `Please fill in ${field}`, type: "error" });
        return false;
      }
    }
    return true;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setMessage({ text: "", type: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await dispatch(
        createRiderAsync({ formData, driversLicensePicture })
      ).unwrap();

      setMessage({
        text: "Application submitted successfully! Check your email for confirmation.",
        type: "success",
      });
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        dateOfBirth: "",
        nin: "",
        bvn: "",
        vehicleType: "",
        previousWorkPlace: "",
        workDuration: "",
        guarantor1Name: "",
        guarantor1Phone: "",
        guarantor1Relationship: "",
        guarantor2Name: "",
        guarantor2Phone: "",
        guarantor2Relationship: "",
        referralCode: "",
        status: "pending",
      });
      setDriversLicensePicture(null);
      setStep(1);
    } catch (error: any) {
      console.error("Error:", error);
      setMessage({
        text: error.message || "An error occurred. Please try again later.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-red-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/15 via-red-400/10 to-pink-400/15 dark:from-orange-500/20 dark:via-red-500/15 dark:to-pink-500/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(251,146,60,0.1)_2px,transparent_0)] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(251,146,60,0.15)_2px,transparent_0)] bg-[length:40px_40px] animate-pulse"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-40 right-16 w-32 h-32 bg-gradient-to-br from-red-400/15 to-orange-400/15 rounded-full blur-xl animate-float-delayed"></div>
      <div className="absolute bottom-32 left-20 w-16 h-16 bg-gradient-to-br from-orange-500/25 to-red-500/25 rounded-full blur-xl animate-float"></div>

      {/* Enhanced Header */}
      <header className="flex items-center justify-between px-6 py-6 border-b border-orange-200/20 dark:border-orange-800/20 backdrop-blur-sm relative z-10">
        <button
          className="group p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-orange-200/30 dark:border-orange-800/30 hover:bg-orange-100/80 dark:hover:bg-orange-900/40 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-orange-500 dark:from-orange-400 dark:via-red-400 dark:to-orange-400 bg-clip-text text-transparent">
            Become a Rider
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-2 animate-pulse"></div>
        </div>
        
        <div className="w-11" />
      </header>

      {/* Enhanced Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-6">
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Join the{" "}
                <span className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                  RideEx
                </span>{" "}
                Team
              </h2>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/20 to-red-600/20 blur-xl opacity-30 rounded-lg"></div>
            </div>
            
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-8 max-w-3xl mx-auto">
              Become a RideEx rider and deliver essential services across Owerri with our efficient motorcycle network. 
              Join thousands of riders earning flexible income while serving their community.
            </p>

            {/* Benefits Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8 mb-8">
              {[
                { icon: "💰", title: "Flexible Earnings", desc: "Earn on your schedule" },
                { icon: "🏍️", title: "Modern Fleet", desc: "Well-maintained motorcycles" },
                { icon: "🤝", title: "Full Support", desc: "24/7 rider assistance" },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-orange-200/30 dark:border-orange-800/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Form */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-orange-200/30 dark:border-orange-800/30 p-8 md:p-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Application Form - Step {step} of 2
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Fill out the details below to start your journey with us
              </p>
            </div>

            <form onSubmit={step === 1 ? handleContinue : handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  {[
                    { name: "fullName", label: "Full Name", type: "text", icon: "👤" },
                    { name: "email", label: "Email Address", type: "email", icon: "📧" },
                    { name: "phone", label: "Phone Number", type: "tel", icon: "📱" },
                    { name: "address", label: "Home Address", type: "text", icon: "🏠" },
                    { name: "gender", label: "Gender", type: "select", icon: "⚧", options: ["Male", "Female", "Other", "Prefer not to say"] },
                    { name: "dateOfBirth", label: "Date of Birth", type: "date", icon: "🎂" },
                    { name: "nin", label: "NIN", type: "text", icon: "🆔" },
                    { name: "bvn", label: "BVN (optional)", type: "text", icon: "🏦", required: false },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <span className="text-lg">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.type === "select" ? (
                          <select
                            id={field.name}
                            name={field.name}
                            value={formData[field.name as keyof IRiders] || ""}
                            onChange={handleChange}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField("")}
                            required={field.required !== false}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                              focusedField === field.name
                                ? "border-orange-500 dark:border-orange-400 shadow-lg transform scale-[1.02]"
                                : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
                            }`}
                          >
                            <option value="" disabled>
                              Select your {field.label.toLowerCase()}
                            </option>
                            {field.options!.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            value={formData[field.name as keyof IRiders] || ""}
                            onChange={handleChange}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField("")}
                            required={field.required !== false}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                              focusedField === field.name
                                ? "border-orange-500 dark:border-orange-400 shadow-lg transform scale-[1.02]"
                                : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
                            }`}
                            placeholder={
                              field.type !== "date" ? `Enter your ${field.label.toLowerCase()}` : ""
                            }
                          />
                        )}
                        <div
                          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ${
                            focusedField === field.name ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <label
                      htmlFor="driversLicensePicture"
                      className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                      <span className="text-lg">📸</span>
                      Upload Driver's License Picture
                    </label>
                    <input
                      type="file"
                      id="driversLicensePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white file:bg-orange-500 file:text-white file:px-4 file:py-2 file:rounded-full file:border-0 file:font-semibold hover:file:bg-orange-600 transition-all duration-300"
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {[
                    { name: "vehicleType", label: "Vehicle Type", type: "select", icon: "🚲", options: ["Bike", "Bicycle"] },
                    { name: "previousWorkPlace", label: "Previous Place of Work", type: "text", icon: "🏢" },
                    { name: "workDuration", label: "How Long Did You Work There?", type: "select", icon: "⏳", options: ["Less than 6 months", "6-12 months", "1-2 years", "2-5 years", "5+ years"] },
                    { name: "guarantor1Name", label: "Guarantor 1 Name", type: "text", icon: "🤝" },
                    { name: "guarantor1Phone", label: "Guarantor 1 Phone", type: "tel", icon: "📞" },
                    { name: "guarantor1Relationship", label: "Guarantor 1 Relationship", type: "select", icon: "👥", options: ["Family", "Friend", "Colleague", "Other"] },
                    { name: "guarantor2Name", label: "Guarantor 2 Name", type: "text", icon: "🤝" },
                    { name: "guarantor2Phone", label: "Guarantor 2 Phone", type: "tel", icon: "📞" },
                    { name: "guarantor2Relationship", label: "Guarantor 2 Relationship", type: "select", icon: "👥", options: ["Family", "Friend", "Colleague", "Other"] },
                    { name: "referralCode", label: "Referral Code (optional)", type: "text", icon: "🔑", required: false },
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <span className="text-lg">{field.icon}</span>
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.type === "select" ? (
                          <select
                            id={field.name}
                            name={field.name}
                            value={formData[field.name as keyof IRiders] || ""}
                            onChange={handleChange}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField("")}
                            required={field.required !== false}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                              focusedField === field.name
                                ? "border-orange-500 dark:border-orange-400 shadow-lg transform scale-[1.02]"
                                : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
                            }`}
                          >
                            <option value="" disabled>
                              Select {field.label.toLowerCase()}
                            </option>
                            {field.options!.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            id={field.name}
                            name={field.name}
                            value={formData[field.name as keyof IRiders] || ""}
                            onChange={handleChange}
                            onFocus={() => setFocusedField(field.name)}
                            onBlur={() => setFocusedField("")}
                            required={field.required !== false}
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 ${
                              focusedField === field.name
                                ? "border-orange-500 dark:border-orange-400 shadow-lg transform scale-[1.02]"
                                : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500"
                            }`}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                          />
                        )}
                        <div
                          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ${
                            focusedField === field.name ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className="pt-4 flex gap-4">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 dark:from-orange-400 dark:via-red-400 dark:to-orange-500 text-white font-bold py-4 px-8 rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-orange-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-orange-500/30"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        {step === 1 ? "Continue" : "Submit Application"}
                      </>
                    )}
                  </span>
                  {!loading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              </div>

              {/* Enhanced Message Display */}
              {message.text && (
                <div
                  className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                    message.type === "success"
                      ? "bg-green-100/80 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300"
                      : "bg-red-100/80 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {message.type === "success" ? "✅" : "❌"}
                    </span>
                    <p className="font-medium">{message.text}</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default BecomeARiderPage;