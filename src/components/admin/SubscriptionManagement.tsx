// components/SubscriptionManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  getPlans,
  updateMonthlyPlan,
  updateYearlyPlan,
  getSubscriptionStats,
  Plan,
  SubscriptionStats,
} from "@/components/subscriptionApiClient";

// ─── Types ─────────────────────────────────────────────────────────────────

interface FeatureInput {
  id: string;
  value: string;
}

// ─── Stat Card Component ───────────────────────────────────────────────────

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ElementType;
  prefix?: string;
  trend?: number;
}> = ({ title, value, icon: Icon, prefix = "", trend }) => (
  <div className="bg-white rounded-[20px] border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px] text-[#8C8C8C] font-medium">{title}</p>
        <p className="font-serif text-[32px] font-bold text-black mt-2">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            {trend >= 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={`text-[12px] ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-[#E9ECFF] to-[#F5F7FF] rounded-[14px] flex items-center justify-center">
        <Icon className="text-[#3448D6] w-6 h-6" />
      </div>
    </div>
  </div>
);

// ─── Plan Card Component ───────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: Plan;
  onUpdate: (plan: Plan) => void;
}> = ({ plan, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(plan.price);
  const [features, setFeatures] = useState<string[]>(plan.features);
  const [newFeature, setNewFeature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateFn = plan.planType === "monthly" ? updateMonthlyPlan : updateYearlyPlan;
      await updateFn({ price, features });
      setIsEditing(false);
      onUpdate({ ...plan, price, features });
    } catch (error) {
      console.error("Failed to update plan:", error);
      alert("Failed to update plan");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPrice(plan.price);
    setFeatures(plan.features);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`p-6 ${plan.planType === "monthly" ? "bg-gradient-to-r from-[#343E87] to-[#3448D6]" : "bg-gray-800"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-[24px] font-bold text-white capitalize">
              {plan.planType} Plan
            </h2>
            <p className="text-white/80 text-[14px] mt-1">
              {plan.planType === "monthly" ? "Billed monthly" : "Billed annually"}
            </p>
          </div>
          {plan.isActive && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-white text-[12px] font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Price */}
        <div className="mb-6">
          <label className="block text-[13px] font-medium text-[#8C8C8C] mb-2">Price</label>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-medium text-black">$</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                step="0.01"
                className="w-32 px-3 py-2 border border-gray-200 rounded-[10px] text-[16px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6]"
              />
              <span className="text-[14px] text-[#8C8C8C]">USD</span>
            </div>
          ) : (
            <p className="font-serif text-[36px] font-bold text-black">
              ${plan.price}
              <span className="text-[16px] text-[#8C8C8C] font-normal ml-1">
                /{plan.planType === "monthly" ? "month" : "year"}
              </span>
            </p>
          )}
        </div>

        {/* Features */}
        <div className="mb-6">
          <label className="block text-[13px] font-medium text-[#8C8C8C] mb-2">Features</label>
          {isEditing ? (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="flex-1 text-[14px] text-gray-700">{feature}</span>
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1 hover:bg-red-50 rounded text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add new feature..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-[10px] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3448D6]/20 focus:border-[#3448D6]"
                  onKeyPress={(e) => e.key === "Enter" && handleAddFeature()}
                />
                <button
                  onClick={handleAddFeature}
                  className="p-2 bg-[#E9ECFF] rounded-[10px] text-[#3448D6] hover:bg-[#3448D6] hover:text-white transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-[14px] text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#3448D6] text-white rounded-[10px] text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-[10px] text-[14px] font-medium hover:bg-gray-50 transition-all"
              >
                <X size={16} />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E9ECFF] text-[#3448D6] rounded-[10px] text-[14px] font-medium hover:bg-[#3448D6] hover:text-white transition-all"
            >
              <Edit2 size={16} />
              Edit Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const SubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [plansResponse, statsResponse] = await Promise.all([
        getPlans(),
        getSubscriptionStats(),
      ]);
      
      setPlans(plansResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
      setError(err instanceof Error ? err.message : "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePlanUpdate = (updatedPlan: Plan) => {
    setPlans(plans.map(plan => plan._id === updatedPlan._id ? updatedPlan : plan));
    fetchData(); // Refresh stats
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 size={36} className="animate-spin text-[#3448D6]" />
        <p className="text-[#8C8C8C] text-sm">Loading subscription data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[16px] p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-[#3448D6] text-white rounded-[8px] text-sm hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  const monthlyPlan = plans.find(p => p.planType === "monthly");
  const yearlyPlan = plans.find(p => p.planType === "yearly");

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-[28px] font-bold text-black">Subscription Management</h1>
            <p className="font-sans text-[14px] text-[#8C8C8C] mt-1">
              Manage subscription plans, pricing, and features
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-[12px] text-[14px] text-gray-600 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Active Subscribers"
              value={stats.totalActive}
              icon={Users}
            />
            <StatCard
              title="Monthly Subscribers"
              value={stats.monthlySubscribers}
              icon={Calendar}
            />
            <StatCard
              title="Yearly Subscribers"
              value={stats.yearlySubscribers}
              icon={Calendar}
            />
            <StatCard
              title="Estimated MRR"
              value={stats.estimatedMRR}
              icon={DollarSign}
              prefix="$"
            />
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monthlyPlan && (
            <PlanCard
              plan={monthlyPlan}
              onUpdate={handlePlanUpdate}
            />
          )}
          {yearlyPlan && (
            <PlanCard
              plan={yearlyPlan}
              onUpdate={handlePlanUpdate}
            />
          )}
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-[16px]">
          <div className="flex items-start gap-3">
            <CreditCard size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Stripe Integration</h3>
              <p className="text-[13px] text-blue-700">
                Monthly plan uses Stripe for payment processing. The Stripe Price ID will be automatically generated when you update the plan price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManagement;