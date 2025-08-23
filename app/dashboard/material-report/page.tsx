"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

export default function MaterialReportPage() {
  // const searchParams = useSearchParams();
  const router = useRouter();

  // const materialId = searchParams.get("materialId") || "";
  // const supplierId = searchParams.get("supplierId") || "";
  // const name = searchParams.get("name") || "";
  // const specification = searchParams.get("specification") || "";
  // const unit = searchParams.get("unit") || "";
  // Extract query params
  const materialId ="";
  const supplierId ="";
  const name ="";
  const specification ="";
  const unit ="";

  if (!materialId || !supplierId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Invalid material or supplier ID</p>
      </div>
    );
  }

  // Generate dummy data for last 42 weeks
  const weeks = Array.from({ length: 42 }, (_, i) => `Week ${i + 1}`);
  const prices = weeks.map(() => Math.floor(900 + Math.random() * 300)); // random prices between 900-1200 ETB

  // Bar chart data (Price trend over weeks)
  const barData = {
    labels: weeks,
    datasets: [
      {
        label: "Price (ETB)",
        data: prices,
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data (Price distribution over weeks)
  const pieData = {
    labels: weeks,
    datasets: [
      {
        label: "Price Distribution",
        data: prices,
        backgroundColor: weeks.map(
          (_, i) => `hsl(${(i * 360) / weeks.length}, 70%, 60%)`
        ),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Price (ETB)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Week",
        },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => router.push("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-4">
          Price Report for {name || materialId}
        </h1>

        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="font-semibold text-lg mb-2">Material Details</h2>
          <p>
            <strong>Specification:</strong> {specification || "N/A"}
          </p>
          <p>
            <strong>Unit:</strong> {unit || "N/A"}
          </p>
        </div>

        {/* Side-by-side charts container */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Bar Chart */}
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm" style={{ minHeight: 400 }}>
            <h3 className="text-lg font-semibold mb-4">Price Trend (Bar Chart)</h3>
            <div style={{ height: 350 }}>
              <Bar
                data={barData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: "Weekly Price Trend (ETB)",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm" style={{ minHeight: 400 }}>
            <h3 className="text-lg font-semibold mb-4">Price Distribution (Pie Chart)</h3>
            <div style={{ height: 350 }}>
              <Pie
                data={pieData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      display: true,
                      text: `Price Distribution for ${name || "Material"}`,
                    },
                    legend: {
                    position: "right",
                  },
                  },
                  
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
