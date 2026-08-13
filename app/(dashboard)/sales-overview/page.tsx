"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { BookOpen, Euro, MapPin, Plus, ShoppingCart, Star, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { MetricCard, PageFrame, PeriodTabs, SectionCard } from "@/components/seller/primitives";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getSellerSales } from "@/lib/api";
import { formatCurrency, getAssetUrl } from "@/lib/utils";

type Book = {
  _id: string;
  title?: string;
  author?: string;
  price?: number;
  rating?: number;
  location?: string;
  image?: { url?: string };
  coverImage?: string;
  soldCount?: number;
};

type SalesResp = {
  metrics?: {
    totalRevenue?: number;
    totalAdminCommission?: number;
    netRevenue?: number;
    completedOrders?: number;
    avgOrderValue?: number;
  };
  analysis?: { label: string; value: number }[];
  topBooks?: Book[];
};

export default function SalesOverviewPage() {
  const [period, setPeriod] = useState<"Week" | "Month" | "Year">("Week");
  const [page, setPage] = useState(1);
  const { data } = useQuery<SalesResp | undefined>({
    queryKey: ["seller-sales", period],
    queryFn: () => getSellerSales({ period: period.toLowerCase() as "week" | "month" | "year" }),
  });

  const metrics = data?.metrics || { totalRevenue: 0, completedOrders: 0, avgOrderValue: 0 };
  const sales = data?.analysis || [];
  const max = Math.max(...sales.map((p) => p.value), 1);
  const points = sales.map((p, i) => `${(i / (sales.length - 1)) * 100},${100 - (p.value / max) * 90}`).join(" ");

  const topBooks = data?.topBooks || [];

  return (
    <PageFrame
      title="Sales Overview"
      subtitle="Monitor sales performance and revenue insights"
      action={
        <Button className="bg-[#103670] hover:bg-[#0d2856]">
          <Plus className="size-4" /> Export Summary
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <MetricCard label="Total Revenue" value={formatCurrency(metrics.totalRevenue ?? 0)} icon={<BookOpen className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
        <MetricCard label="Admin Commission" value={formatCurrency(metrics.totalAdminCommission ?? 0)} icon={<Euro className="size-5" />} iconBg="bg-[#fe8a3b]" iconColor="text-white" />
        <MetricCard label="Net Revenue" value={formatCurrency(metrics.netRevenue ?? 0)} icon={<TrendingUp className="size-5" />} iconBg="bg-[#16934b]" iconColor="text-white" />
        <MetricCard label="Total Orders" value={metrics.completedOrders ?? 0} icon={<ShoppingCart className="size-5" />} iconBg="bg-[#3d8ef5]" iconColor="text-white" />
        <MetricCard label="Avg. Order Value" value={formatCurrency(metrics.avgOrderValue ?? 0)} icon={<Users className="size-5" />} iconBg="bg-[#f87171]" iconColor="text-white" />
      </div>

      <SectionCard className="mt-6 pb-8">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-semibold text-[#202124]">Revenue Overview</h2>
            <p className="text-[14px] text-[#5b6371]">Revenue over the last 7 days</p>
          </div>
          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
        {sales.length > 0 ? (
          <div className="relative h-[300px] w-full pb-8">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fe8a3b" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#fe8a3b" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="#fe8a3b" strokeWidth="0.6" points={points} />
              <polygon fill="url(#revFill)" points={`0,100 ${points} 100,100`} />
            </svg>
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-7 text-center text-[12px] text-[#5b6371]">
              {sales.map((p) => (
                <span key={p.label}>{p.label}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-[260px] items-center justify-center rounded-[16px] border border-dashed border-[#e3e6ec] text-[14px] text-[#5b6371]">
            No sales data yet
          </div>
        )}
      </SectionCard>

      <SectionCard className="mt-6">
        <h2 className="text-[20px] font-semibold text-[#202124]">Top Selling Books</h2>
        <p className="text-[14px] text-[#5b6371]">Your most popular and frequently purchased titles</p>
        <div className="mt-4 grid grid-cols-2 px-3 text-[14px] font-medium text-[#5b6371]">
          <span>Book Title</span>
          <span className="text-right">Sold Books</span>
        </div>
        <div className="mt-2 space-y-3">
          {topBooks.map((book) => {
            const cover = getAssetUrl(book.image || book.coverImage);
            return (
              <div key={book._id} className="grid grid-cols-2 items-center gap-4 rounded-[12px] border border-[#e3e6ec] p-3">
                <div className="flex items-center gap-3">
                  <div className="relative size-14 overflow-hidden rounded-[10px] bg-[#e3e6ec]">
                    {cover ? <Image src={cover} alt={book.title || ""} fill sizes="56px" className="object-cover" /> : null}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[15px] font-semibold text-[#202124]">{book.title || "Untitled book"}</p>
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-[#f59e0b]">
                        <Star className="size-3.5 fill-current" /> {(book.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#5b6371]">{book.author || "Unknown author"}</p>
                    <div className="flex items-center justify-between text-[13px]">
                      <p className="flex items-center gap-1 text-[#5b6371]"><MapPin className="size-3.5 text-[#3d8ef5]" /> {book.location || "N/A"}</p>
                      <p className="font-semibold text-[#3d8ef5]">{formatCurrency(book.price ?? 0)}</p>
                    </div>
                  </div>
                </div>
                <p className="text-right text-[14px] text-[#202124]">{book.soldCount ?? 0} Books</p>
              </div>
            );
          })}
          {topBooks.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-[#e3e6ec] p-10 text-center text-[14px] text-[#5b6371]">
              No sold books yet
            </div>
          ) : null}
        </div>
        <div className="mt-4 flex items-center justify-between text-[14px] text-[#5b6371]">
          <span>{topBooks.length > 0 ? `Showing 1 to ${topBooks.length} results` : "Showing 0 results"}</span>
          <Pagination page={page} totalPages={1} onPageChange={setPage} />
        </div>
      </SectionCard>
    </PageFrame>
  );
}
