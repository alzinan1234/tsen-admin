"use client";

import React from "react";

// 1. Define types for the table data
interface Submission {
  id: string;
  articleTitle: string;
  writer: string;
  type: "Podcast" | "Live News" | "Story";
  status: "Pending" | "Needs Revision";
  submitted: string;
}

const submissions: Submission[] = [
  {
    id: "1",
    articleTitle: "Why Subscription-Based Con...",
    writer: "John Doe",
    type: "Podcast",
    status: "Pending",
    submitted: "March 15, 2024",
  },
  {
    id: "2",
    articleTitle: "Why Subscription-Based Con...",
    writer: "Alex Carter",
    type: "Live News",
    status: "Pending",
    submitted: "March 15, 2024",
  },
  {
    id: "3",
    articleTitle: "Why Subscription-Based Con...",
    writer: "Mia Johnson",
    type: "Story",
    status: "Needs Revision",
    submitted: "March 15, 2024",
  },
];

const ContentSubmissions = () => {
  return (
    <div className="w-full bg-white rounded-[24px] shadow-[0_10px_60px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center justify-between p-8 border-b border-gray-100">
        <h2 className="font-serif text-[24px] font-semibold text-black tracking-tight">
          Content Submissions
        </h2>
        <button className="px-6 py-2 border border-gray-200 rounded-[12px] font-serif text-sm text-gray-700 hover:bg-gray-50 transition-all">
          See more
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black">Article Title</th>
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black">Writer</th>
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black">Type</th>
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black">Status</th>
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black">Submitted</th>
              <th className="px-8 py-6 font-serif text-[15px] font-medium text-black text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="font-serif">
            {submissions.map((item) => (
              <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 text-[14px] text-gray-600 font-light">{item.articleTitle}</td>
                <td className="px-8 py-6 text-[14px] text-gray-600 font-light">{item.writer}</td>
                <td className="px-8 py-6 text-[14px] text-gray-600 font-light">{item.type}</td>
                <td className="px-8 py-6">
                  <span
                    className={`px-6 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      item.status === "Pending"
                        ? "bg-black text-white"
                        : "bg-[#F2F2F2] text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-[14px] text-gray-600 font-light">{item.submitted}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button className="px-4 py-1.5 bg-[#E2E4F0] text-[#3448D6] rounded-[6px] text-[12px] font-medium hover:bg-[#D4D8EA] transition-all">
                      Edit
                    </button>
                    <button className="px-4 py-1.5 bg-[#FDE2E2] text-[#EE264F] rounded-[6px] text-[12px] font-medium hover:bg-[#FCD4D4] transition-all">
                      Rejected
                    </button>
                    <button className="px-4 py-1.5 bg-[#E2F0E5] text-[#4CAF50] rounded-[6px] text-[12px] font-medium hover:bg-[#D4EAD9] transition-all">
                      Publish
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentSubmissions;