import { getAppointments } from "./utils";
import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";
import Day from "./Day";
import dayjs from "dayjs";

const useDependenciesLoaded = (dependencies) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(dependencies.every(dep => dep !== undefined));
  }, [dependencies]);

  return loaded;
};

const AppointmentCalendar = ({numOfDays, hours=8, referenceDate=dayjs(),openAppointmentFunc, createAppointmentFunc, rerender}) => {
  const [appointments, setAppointments] = useState([]);
  const cacheRef = useRef({}); // Use a ref for cache
  const startDate = useMemo(() => referenceDate.startOf("week"), [referenceDate]);
  const divRef = useRef(null);

  useLayoutEffect(() => {
    if (divRef.current) {
      const { scrollHeight} = divRef.current;
      const now = referenceDate; // current time
      const firstNBlocksHeight = (now.hour() / 24) * scrollHeight;
      divRef.current.scrollTop = firstNBlocksHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const fetchAppointments = useCallback(async (startDate, day_count) => {
    const result = await getAppointments(startDate, day_count);
    return result;
  }, []);

  const dependenciesLoaded = useDependenciesLoaded([startDate, fetchAppointments]);

  useEffect(() => {
    cacheRef.current = {};
  }, [rerender]);

  useEffect(() => {
    if (!dependenciesLoaded) return;
    //display all dependencies in console log
    console.log(rerender, startDate)
    let isCancelled = false;

    const fetchAndCache = async (start, count) => {
      const result = await fetchAppointments(start, count);
      const appointmentsArray = Array.isArray(result) ? result : [result]; // Always return an array
      if (!isCancelled) {
        const cacheKey = start.format('YYYY-MM-DD');
        cacheRef.current = { ...cacheRef.current, [cacheKey]: appointmentsArray };
      }
      return appointmentsArray;
    };

    const fetchCachedWeeks = async () => {
      const weeks = [-2, -1, 0, 1, 2];
      const fetchedAppointments = [];

      for (const week of weeks) {
        const weekStartDate = startDate.add(week, 'week');
        const cacheKey = weekStartDate.format('YYYY-MM-DD');
        const weekAppointments = cacheRef.current[cacheKey] ? cacheRef.current[cacheKey] : await fetchAndCache(weekStartDate, 7);
        fetchedAppointments.push(...weekAppointments);
      }

      if (!isCancelled) {
        setAppointments(fetchedAppointments);
      }
    };

    fetchCachedWeeks();
    console.log(cacheRef)
    return () => {
      isCancelled = true;
    };
    
  }, [dependenciesLoaded, startDate, fetchAppointments, rerender]);


  const days = Array.from({ length: numOfDays }, (_, i) => startDate.add(i, "day"));

  
  return (
    <div className="flex flex-col w-full max-h-full">
      <div className="top-0 z-50">
      
      <div className={`flex gap-x-1 pl-16`}>
          {days.map((day, index) => (
            <div key={index} className="flex justify-center p-4 w-full">
              <span className="text-center text-on-surface dark:text-on-surface-dark">{day.format("MMM D, ddd")}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={divRef} className="flex flex-row max-h-full w-full h-full inline-block overflow-y-hidden hover:overflow-y-auto scroll-smooth snap-mandatory">
        <div className="flex-shrink-0 snap-start">
          {Array.from({ length: 24 }, (_, i) => i).map((hour, index) => (
            <div key={index} className={`flex items-top border border-surface-70 dark:border-surface-30 w-16 translate-y-px h-[1/${hours}]`} style={{ height: "10em" }}>
              <div className="px-2 text-xs text-on-surface dark:text-on-surface-dark">{dayjs().hour(hour).format("h A")}</div>
            </div>
          ))}
        </div>
        <div className={`flex min-w-64 w-full inline-block`}>
          {days.map((day, index) => (
            <div className="w-full">
              <Day 
                key={index} 
                day={day} 
                createAppointment ={createAppointmentFunc} 
                openAppointment={openAppointmentFunc} 
                appointments={appointments.filter((appointment) => day.isSame(appointment.start_time, "day") || day.isSame(appointment.end_time, "day"))}  
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default AppointmentCalendar;