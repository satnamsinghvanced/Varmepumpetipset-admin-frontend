import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <Skeleton height={20} width={180} />
        <div className="flex flex-wrap gap-3 mt-4">
          <Skeleton height={36} width={90} />
          <Skeleton height={36} width={110} />
          <Skeleton height={36} width={120} />
          <Skeleton height={36} width={100} />
        </div>

        <div className="flex gap-4 mt-4">
          <Skeleton height={40} width={160} />
          <Skeleton height={40} width={160} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <Skeleton height={20} width={150} />
        <Skeleton height={250} className="mt-4" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <Skeleton height={18} width={120} />
            <Skeleton height={32} width={80} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton height={20} width={150} />

        <ul className="mt-4 space-y-3">
          {Array(5)
            .fill()
            .map((_, i) => (
              <div key={i} className="flex justify-between py-2">
                <Skeleton height={16} width={160} />
                <Skeleton height={16} width={70} />
              </div>
            ))}
        </ul>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton height={20} width={200} />

        <table className="w-full mt-4">
          <thead>
            <tr>
              <th>
                <Skeleton height={16} />
              </th>
              <th>
                <Skeleton height={16} />
              </th>
              <th>
                <Skeleton height={16} />
              </th>
              <th>
                <Skeleton height={16} />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array(5)
              .fill()
              .map((_, i) => (
                <tr key={i}>
                  <td className="py-3">
                    <Skeleton height={14} />
                  </td>
                  <td>
                    <Skeleton height={14} />
                  </td>
                  <td>
                    <Skeleton height={14} />
                  </td>
                  <td>
                    <Skeleton height={14} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsType, setStatsType] = useState(null);
  const [partnerName, setPartnerName] = useState("");
  const [partners, setPartners] = useState([]);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD")
  );
  const [range, setRange] = useState("");
  const fetchStats = () => {
    axios
      .get(
        `/dashboard/stats?start=${startDate}&end=${endDate}&partnerName=${partnerName}`
      )
      .then((res) => setStats(res.data))
      .catch(() => {});
  };
  useEffect(() => {
    fetchStats();
  }, [startDate, endDate, partnerName]);

  const fetchPartners = (search = "") => {
    axios
      .get(`/partners/all?search=${search}`)
      .then((res) => setPartners(res.data?.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPartners();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartners(partnerSearch);
    }, 400);

    return () => clearTimeout(timer);
  }, [partnerSearch]);
  const fetchStatsOfType = () => {
    axios
      .get(`/dashboard/total-leads`)
      .then((res) => setStatsType(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchStatsOfType();
  }, []);

  if (!stats || !statsType) return <DashboardSkeleton />;

  const { topPartners, growthData, totals, trendlineData } = stats;
  console.log("topPartners", topPartners);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of leads, performance, and partner ranking."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Leads Sent</p>
          <p className="mt-4"> </p>
          <p className="text-3xl font-bold text-slate-900">
            {statsType?.totalLeads || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Reject Leads</p>
          <p className="mt-5"> </p>
          <p className="text-3xl font-bold text-slate-900">
            {totals?.totalRejects || 0}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Total Pending Leads</p>
          <p className="mt-5"> </p>
          <p className="text-3xl font-bold text-slate-900">
            {totals?.totalPending || 0}
          </p>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {Object.entries(statsType.data || {}).map(([label, value], index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <p>Total leads of type {index + 1} </p>
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-3xl font-bold text-slate-900">{value || 0}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-4">
        <div className=" ">
          <h3 className="text-lg font-semibold">Filter by Date Range</h3>
        </div>
        <div className="flex items-center flex-wrap gap-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Start Date</label>
              <input
                type="date"
                className="border border-slate-200 p-2 rounded w-56"
                value={startDate}
                 max={dayjs().format("YYYY-MM-DD")} 
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">End Date</label>
              <input
                type="date"
                className="border border-slate-200 p-2 rounded w-full"
                value={dayjs().format("YYYY-MM-DD")}
               max={dayjs().format("YYYY-MM-DD")} 
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="">
            <label className="text-sm text-slate-600 block mb-1">
              Quick Range
            </label>
            <select
              className="border border-slate-200 p-2 rounded w-56"
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                const today = dayjs();
                let start, end;

                switch (e.target.value) {
                  case "today":
                    start = today.format("YYYY-MM-DD");
                    end = today.format("YYYY-MM-DD");
                    break;
                  case "7days":
                    start = today.subtract(6, "day").format("YYYY-MM-DD");
                    end = today.format("YYYY-MM-DD");
                    break;
                  case "15days":
                    start = today.subtract(14, "day").format("YYYY-MM-DD");
                    end = today.format("YYYY-MM-DD");
                    break;
                  case "30days":
                    start = today.subtract(29, "day").format("YYYY-MM-DD");
                    end = today.format("YYYY-MM-DD");
                    break;
                  case "month":
                    start = today.startOf("month").format("YYYY-MM-DD");
                    end = today.format("YYYY-MM-DD");
                    break;

                  default:
                    return;
                }

                setStartDate(start);
                setEndDate(end);
              }}
            >
              <option value="">Select Range</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="15days">Last 15 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600 block mb-1">
              Filter by Partner
            </label>

            {/* <input
            type="text"
            placeholder="Search partner..."
            className="border border-slate-200 p-2 rounded w-56 mb-2"
            value={partnerSearch}
            onChange={(e) => setPartnerSearch(e.target.value)}
          /> */}

            <select
              className="border border-slate-200 p-2 rounded w-56"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
            >
              <option value="">All Partners</option>
              {partners.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-lg mb-1">Lead Trend</h3>
        <p className="text-xs text-slate-500 mb-4">
          Trend of leads between selected dates
        </p>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                trendlineData?.length === 1
                  ? [
                      ...trendlineData,
                      {
                        ...trendlineData[0],
                        date: trendlineData[0].date + " ",
                      },
                    ]
                  : trendlineData || []
              }
            >
              <defs>
                <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#ddd" />

              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />

              <Line
                type="monotone"
                dataKey="leads"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ fill: "#4F46E5", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#4F46E5", strokeWidth: 2 }}
                fill="url(#colorLead)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white">
        <div className="border-0 border-slate-200 px-6 py-4 rounded-t-xl">
          <h3 className="font-semibold text-lg">Top 5 Partners</h3>
          <p className="text-xs text-slate-500">Based on total leads</p>
        </div>

        <ul className="">
          {topPartners?.map((p, i) => (
            <li key={i} className="px-6 py-4 flex justify-between border-t-1 border-slate-200">
              <span className="font-medium"> {p?.partnerName}</span>
              <span className="font-semibold">{p?.totalLeads} Leads</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-slate-200 rounded-xl bg-white">
        <div className="border border-slate-200 px-6 border-b-0 rounded-t-xl py-4">
          <h3 className="font-semibold text-lg">Growth From Last Month</h3>
          <p className="text-xs text-slate-500">Lead performance comparison</p>
        </div>
        <div className="rounded-b-xl border border-t-1 border-slate-200 overflow-scroll">
          <table className="w-full  border-collapse text-sm">
            <thead>
              <tr className=" text-left">
                <th className="px-6 py-3">Partner Name</th>
                <th className="px-6 py-3">Last Month</th>
                <th className="px-6 py-3">This Month</th>
                <th className="px-6 py-3">Growth</th>
              </tr>
            </thead>
            <tbody>
              {growthData?.map((row, i) => (
                <tr
                  key={i}
                  className="border border-slate-200 border-x-0 border-b-0"
                >
                  <td className="px-6 py-3">{row?.partnerName}</td>
                  <td className="px-6 py-3">{row?.lastMonth || 0}</td>
                  <td className="px-6 py-3">{row?.leadsThisMonth || 0}</td>
                  <td
                    className={`px-6 py-3 font-semibold ${
                      row?.growthPercent >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {row?.growthPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
