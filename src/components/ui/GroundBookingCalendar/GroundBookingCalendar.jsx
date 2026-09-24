import { useCallback, useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { getMonthlyGroundSlots } from "../../../services/groundBookingService";

import toast from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";

import "./GroundBookingCalendar.css";

const SLOT_COLORS = {
  morning: "#F59E0B",
  afternoon: "#057DCD",
  fullDay: "#0E2B57",
};

const normalizeSlot = (timeSlot = "") => {
  const slot = timeSlot.toLowerCase();

  if (slot.includes("08:30 am - 04:00 pm")) {
    return "fullDay";
  }

  if (slot.includes("08:30 am - 12:00 pm")) {
    return "morning";
  }

  if (slot.includes("12:30 pm - 04:00 pm")) {
    return "afternoon";
  }

  return null;
};

const GroundBookingCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [bookings, setBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // API expects 1-12
  const apiMonth = month + 1;

  const monthName = currentDate.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(year, month, 1).getDay();

  // Convert Sunday-first JS index into Monday-first calendar
  const startingDay = firstDay === 0 ? 6 : firstDay - 1;

  const fetchMonthlySlots = useCallback(async () => {
    try {
      const response = await getMonthlyGroundSlots(apiMonth, year);

      if (response.statusCode === 200) {
        setBookings(response.data.bookings || []);
      } else {
        // This will handle any 2xx response that is not 201
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Monthly Ground Slots Error:", error);
      toast.error(error.response?.data?.message);
      setBookings([]);
    }
  }, [apiMonth, year]);

  useEffect(() => {
    const loadBookings = async () => {
      setIsBookingsLoading(true);

      try {
        await fetchMonthlySlots();
      } finally {
        setIsBookingsLoading(false);
      }
    };
    loadBookings();
  }, [fetchMonthlySlots]);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const bookingsByDate = useMemo(() => {
    const grouped = {};

    bookings.forEach((booking) => {
      if (!booking.booking_date) return;

      const dateKey = booking.booking_date;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(booking);
    });

    return grouped;
  }, [bookings]);

  const calendarDays = [];

  // Empty cells before first day
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }

  // Actual month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDateKey = (day) => {
    const monthValue = String(month + 1).padStart(2, "0");
    const dayValue = String(day).padStart(2, "0");

    return `${year}-${monthValue}-${dayValue}`;
  };

  return (
    <div className="ground-booking-calendar">
      {/* Header */}
      <div className="ground-booking-calendar-header">
        <div>
          <h5>Booking Calendar</h5>
          <p>View ground bookings by date and time slot.</p>
        </div>

        <div className="ground-booking-calendar-controls">
          <button
            type="button"
            className="ground-booking-calendar-nav-btn"
            onClick={previousMonth}
            disabled={isBookingsLoading}
          >
            <FiChevronLeft />
          </button>

          <button
            type="button"
            className="ground-booking-calendar-today-btn"
            onClick={goToToday}
            disabled={isBookingsLoading}
          >
            Today
          </button>

          <button
            type="button"
            className="ground-booking-calendar-nav-btn"
            onClick={nextMonth}
            disabled={isBookingsLoading}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Month */}
      <div className="ground-booking-calendar-month">{monthName}</div>

      {/* Week Days */}
      <div className="ground-booking-calendar-weekdays">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="ground-booking-calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar */}
      {/* Loader */}
      {isBookingsLoading ? (
        <div className="ui-common-loader">
          <ThreeDots
            height="20"
            width="50"
            color="#057DCD"
            ariaLabel="loading"
          />
        </div>
      ) : (
        <div className="ground-booking-calendar-grid">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="ground-booking-calendar-day empty"
                />
              );
            }

            const dateKey = formatDateKey(day);
            const dayBookings = bookingsByDate[dateKey] || [];

            const hasMorning = dayBookings.some(
              (booking) => normalizeSlot(booking.time_slot) === "morning",
            );

            const hasAfternoon = dayBookings.some(
              (booking) => normalizeSlot(booking.time_slot) === "afternoon",
            );

            const hasFullDay = dayBookings.some(
              (booking) => normalizeSlot(booking.time_slot) === "fullDay",
            );

            const today = new Date();

            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;

            return (
              <div
                key={dateKey}
                className={`ground-booking-calendar-day ${
                  isToday ? "today" : ""
                }`}
              >
                <div className="ground-booking-calendar-day-number">{day}</div>

                <div className="ground-booking-calendar-events">
                  {hasMorning && (
                    <span
                      className="ground-booking-calendar-event"
                      style={{
                        backgroundColor: SLOT_COLORS.morning,
                      }}
                      title="Morning Booking"
                    >
                      Morning
                    </span>
                  )}

                  {hasAfternoon && (
                    <span
                      className="ground-booking-calendar-event"
                      style={{
                        backgroundColor: SLOT_COLORS.afternoon,
                      }}
                      title="Afternoon Booking"
                    >
                      Afternoon
                    </span>
                  )}

                  {hasFullDay && (
                    <span
                      className="ground-booking-calendar-event"
                      style={{
                        backgroundColor: SLOT_COLORS.fullDay,
                      }}
                      title="Full Day Booking"
                    >
                      Full Day
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="ground-booking-calendar-legend">
        <div>
          <span
            className="ground-booking-calendar-legend-dot"
            style={{ backgroundColor: SLOT_COLORS.morning }}
          />
          Morning
        </div>

        <div>
          <span
            className="ground-booking-calendar-legend-dot"
            style={{ backgroundColor: SLOT_COLORS.afternoon }}
          />
          Afternoon
        </div>

        <div>
          <span
            className="ground-booking-calendar-legend-dot"
            style={{ backgroundColor: SLOT_COLORS.fullDay }}
          />
          Full Day
        </div>
      </div>
    </div>
  );
};

export default GroundBookingCalendar;
