import { useState, useEffect } from "react";
import { Row, Col, Card } from "react-bootstrap";

import {
  FiUsers,
  FiUserCheck,
  FiUser,
  FiCreditCard,
  FiAlertCircle,
  FiMapPin,
  // FiAward,
  FiCheckSquare,
  FiShield,
  // FiCalendar,
  FiTrendingUp,
  // FiDollarSign,
  // FiActivity,
  FiBriefcase,
  // FiHome,
} from "react-icons/fi";

import { MdCurrencyRupee } from "react-icons/md";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useNavigate } from "react-router-dom";

import {
  getAllDashboardStats,
  getDashboardCharts,
  getRevenueActivities,
} from "../../services/dashboardService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import StatCard from "../../components/ui/StatCard/StatCard";

// const EVENTS = [
//   {
//     id: 1,
//     name: "KK Summer Cup 2026",
//     type: "Tournament",
//     date: "25-07-2026",
//     venue: "Ground A",
//     status: "Upcoming",
//   },
//   {
//     id: 2,
//     name: "Junior League",
//     type: "Cricket Camp",
//     date: "30-07-2026",
//     venue: "Ground B",
//     status: "Registration Open",
//   },
// ];

import "./Dashboard.css";

//styles for charts
const chartAxisStyle = {
  fontSize: 12,
  fill: "#64748B",
  fontWeight: 400,
};

const chartTooltipStyle = {
  backgroundColor: "#fff",
  border: "none",
  borderRadius: "12px",
  boxShadow: "0 8px 25px rgba(15,23,42,0.12)",
  padding: "10px 14px",
  fontSize: "12px",
  color: "#0E2B57",
};

const PIE_COLORS = ["#0E2B57", "#057DCD"];

const formatINR = (value) => `₹${(value || 0).toLocaleString("en-IN")}`;

const Dashboard = () => {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState({});
  const [chartData, setChartData] = useState({});
  const [revenueData, setRevenueData] = useState({});

  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // const upcomingEvents = EVENTS.filter(
  //   (event) => event.status !== "Completed",
  // ).slice(0, 4);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsDashboardLoading(true);

      try {
        const [statsResponse, chartsResponse, revenueResponse] =
          await Promise.all([
            getAllDashboardStats(),
            getDashboardCharts(),
            getRevenueActivities(),
          ]);

        if (statsResponse?.success) {
          setStatistics(statsResponse.data);
        }

        if (chartsResponse?.success) {
          setChartData(chartsResponse.data);
        }

        if (revenueResponse?.success) {
          setRevenueData(revenueResponse.data);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);

        toast.error(error.response?.data?.message);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isDashboardLoading) {
    return (
      <div className="ui-common-loader">
        <ThreeDots height="20" width="50" color="#057DCD" ariaLabel="loading" />
      </div>
    );
  }

  // Dynamic pie chart split using API data
  const feeCollectionSplit = [
    {
      name: "Collected",
      value: chartData?.fee_collection?.collected || 0,
    },
    {
      name: "Pending",
      value: chartData?.fee_collection?.pending || 0,
    },
  ];

  const hasFeeCollectionData = feeCollectionSplit.some(
    (item) => item.value > 0,
  );

  return (
    <div className="dashboard-main-section">
      {/* HEADER */}

      <div className="dashboard-header-titles-section">
        <div>
          <h2 className="all-dash-page-title">
            Welcome back, Academy Admin 👋
          </h2>

          <p className="all-dash-page-subtitle">
            {/* Here's what's happening at KK Global Cricket Academy today, */}
            Get a quick look at KK Global Cricket Academy’s performance and
            activity for{" "}
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* STAT CARD ROW 1 */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard
            title="Total Player"
            value={statistics?.total_players ?? 0}
            icon={FiUsers}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Active Player"
            value={statistics?.active_players ?? 0}
            icon={FiUserCheck}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Trainers"
            value={statistics?.trainers ?? 0}
            icon={FiUser}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Pending Fees"
            value={statistics?.pending_fees ?? 0}
            icon={FiAlertCircle}
          />
        </Col>
      </Row>

      {/* STAT CARD ROW 2 */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard
            title="Ground Bookings"
            value={statistics?.ground_bookings ?? 0}
            icon={FiMapPin}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Approvals"
            value={statistics?.approvals ?? 0}
            icon={FiShield}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Monthly Revenue"
            value={formatINR(statistics?.monthly_revenue)}
            icon={FiTrendingUp}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Regular Revenue"
            value={formatINR(statistics?.regular_revenue)}
            icon={FiUsers}
          />
        </Col>
      </Row>

      {/* STAT CARD ROW 3 */}
      <Row className="g-3 mb-4">
        <Col md={3} xs={6}>
          <StatCard
            title="1-on-1 Revenue"
            value={formatINR(statistics?.one_on_one_revenue)}
            icon={FiUserCheck}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Hostel Fee"
            value={formatINR(statistics?.hostel_fee_revenue)}
            icon={FiCreditCard}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Ground Revenue"
            value={formatINR(statistics?.ground_revenue)}
            icon={FiMapPin}
          />
        </Col>

        <Col md={3} xs={6}>
          <StatCard
            title="Salary Expense"
            value={formatINR(statistics?.salary_expense)}
            icon={FiBriefcase}
          />
        </Col>
      </Row>

      <Row className="g-3 mb-2">
        <Col md={3} xs={6}>
          <StatCard
            title="Total Expenditure"
            value={formatINR(statistics?.total_expenditure)}
            icon={MdCurrencyRupee}
          />
        </Col>
      </Row>

      {/* CHART ROW 1 */}
      <Row className="g-3 mt-2">
        <Col xl={8}>
          <Card className="dashboard-chart-card">
            <Card.Body>
              <h4 className="dashboard-chart-title">Academic Growth</h4>
              <p className="dashboard-chart-subtitle">
                Total enrolled players, last 6 months
              </p>

              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={chartData?.player_growth || []}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    height={25}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{
                      fill: "rgba(14,43,87,0.05)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="players"
                    stroke="#0E2B57"
                    strokeWidth={2.5}
                    fill="#0E2B57"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="dashboard-chart-card">
            <Card.Body>
              <h4 className="dashboard-chart-title">Fee Collection</h4>

              <p className="dashboard-chart-subtitle">This month</p>

              {hasFeeCollectionData ? (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie
                        data={feeCollectionSplit}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={90}
                      >
                        {feeCollectionSplit.map((item, index) => (
                          <Cell key={item.name} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        formatter={(val) => formatINR(val)}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="dashboard-pie-chart-fee-legend">
                    {feeCollectionSplit.map((item, index) => (
                      <div
                        key={item.name}
                        className="dashboard-pie-chart-fee-legend-item"
                      >
                        <span
                          className="dashboard-pie-chart-fee-legend-dot"
                          style={{ background: PIE_COLORS[index] }}
                        ></span>

                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="dashboard-chart-no-data">
                  <FiAlertCircle size={20} />
                  <span>No fee collection data</span>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHART ROW 2 */}
      <Row className="g-3 mt-2">
        <Col xl={8}>
          <Card className="dashboard-chart-card">
            <Card.Body>
              <h4 className="dashboard-chart-title">Revenue Trend</h4>

              <p className="dashboard-chart-subtitle">
                Monthly collections, last 6 months
              </p>

              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={revenueData?.revenue_trend || []}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 30,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    height={25}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    width={35}
                  />

                  <Tooltip
                    formatter={(value) => formatINR(value)}
                    contentStyle={chartTooltipStyle}
                    cursor={{
                      fill: "rgba(255,104,1,0.08)",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#057DCD"
                    strokeWidth={2.5}
                    dot={{
                      fill: "#057DCD",
                      r: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="dashboard-chart-card">
            <Card.Body>
              <h4 className="dashboard-chart-title">Weekly Attendance</h4>

              <p className="dashboard-chart-subtitle">Present vs Absent %</p>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData?.attendance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    height={25}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={chartAxisStyle}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    cursor={{
                      fill: "rgba(14,43,87,0.05)",
                    }}
                    formatter={(value, name, props) => {
                      const data = props.payload;

                      if (name === "Present") {
                        return [data.present_count, "Present"];
                      }

                      if (name === "Absent") {
                        return [data.absent_count, "Absent"];
                      }

                      return [value, name];
                    }}
                  />
                  <Bar
                    dataKey="present_percentage"
                    name="Present"
                    fill="#0E2B57"
                  />

                  <Bar
                    dataKey="absent_percentage"
                    name="Absent"
                    fill="#FFC094"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ACTIVITY SECTION */}
      <Row className="g-3 mt-2 align-items-stretch">
        <Col xl={12} className="d-flex">
          <Card className="dashboard-content-card w-100">
            <Card.Body>
              <h4 className="dashboard-section-title">Recent Activities</h4>

              <div className="dashboard-activity-list">
                {revenueData?.recent_activities?.length > 0 ? (
                  revenueData.recent_activities.map((activity, index) => (
                    <div key={index} className="dashboard-activity-item">
                      <div className="dashboard-activity-dot"></div>

                      <div className="dashboard-activity-content">
                        <p>{activity.message}</p>

                        <span>
                          {activity.performed_by} •{" "}
                          {new Date(activity.created_at).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="dashboard-activity-no-data">
                    <FiAlertCircle size={17} />
                    <span>No recent activities found</span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* <Col xl={4} className="d-flex">
          <Card className="dashboard-content-card w-100">
            <Card.Body>
              <div className="dashboard-event-header">
                <h4 className="dashboard-section-title">Upcoming Events</h4>

                <FiCalendar size={18} />
              </div>

              <div className="dashboard-event-list">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="dashboard-event-item">
                    <div>
                      <h6>{event.name}</h6>

                      <p>
                        {event.date} · {event.venue}
                      </p>
                    </div>

                    <span className="dashboard-event-badge">{event.type}</span>
                  </div>
                ))}
              </div>

              <Button
                className="dashboard-event-view-btn"
                onClick={() => navigate("/events")}
              >
                View All Events
              </Button>
            </Card.Body>
          </Card>
        </Col> */}
      </Row>

      {/* QUICK ACTION */}
      <Row className="mt-3">
        <Col>
          <Card className="dashboard-content-card">
            <Card.Body>
              <h4 className="dashboard-section-title">Quick Actions</h4>

              <div className="dashboard-quick-action-grid">
                {[
                  {
                    label: "Player Management",
                    path: "/management/player-management",
                    icon: FiUsers,
                  },

                  {
                    label: "Attendance Management",
                    path: "/management/attendance",
                    icon: FiCheckSquare,
                  },

                  {
                    label: "Ground Management",
                    path: "/management/ground-booking",
                    icon: FiMapPin,
                  },

                  {
                    label: "Fee Renewals",
                    path: "/management/fee-renewals",
                    icon: FiCreditCard,
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    className="dashboard-quick-action-btn"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon size={20} />

                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
