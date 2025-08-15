import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import Dropdown from "./Dropdown";

export default function Sorter({url, sortBy, time, defaultSort = SortType.newest, defaultTime = TimeUnit.week}) {
  const [sort, setSort] = useState(sortBy);
  const [timeframe, setTimeframe] = useState(time);
  const location = useLocation();

  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  useEffect(() => {
    navigateQuery();
  }, [sort, timeframe])
  useEffect(() => {
    setSort(sortBy);
    setTimeframe(time);
  }, [sortBy, time])

  const navigateQuery = () => {
    const currSort = queryParams.get('sort') || defaultSort;
    const currTime = queryParams.get('time') || defaultTime;
    const sameTime = currTime == timeframe || sort == SortType.newest;

    if (currSort == sort && sameTime) return;

    const query = [];

    if (sort != defaultSort)  query.push("sort=" + sort);
    if (sort == SortType.popular && timeframe != defaultTime) query.push("time=" + timeframe);

    navigate(query.length ? `${url}?${query.join('&')}` : url);
  }
  
  const getTimeframe = (frame) => {
    switch (frame || timeframe) {
      case TimeUnit.day:
        return "Today";
      case TimeUnit.week:
        return "This week";
      case TimeUnit.month:
        return "This month";
      case TimeUnit.year:
        return "This year";
      case TimeUnit.all:
        return "All time";
    }
  }

  return (
      <div className='flex gap-4 self-end'>
        Sort by:
        <div>
          <Dropdown set={setSort} get={sort == SortType.newest ? "newest" : "popular"} close={[sortBy]}>
            {[
            [SortType.newest, "newest"],
            [SortType.popular, "popular"]
            ]}
          </Dropdown>
        </div>
        {sort == SortType.popular && (
        <div>
          <Dropdown set={setTimeframe} get={getTimeframe()} close={[time]}>
            {[
            [TimeUnit.day, getTimeframe(TimeUnit.day)],
            [TimeUnit.week, getTimeframe(TimeUnit.week)],
            [TimeUnit.month, getTimeframe(TimeUnit.month)],
            [TimeUnit.year, getTimeframe(TimeUnit.year)],
            [TimeUnit.all, getTimeframe(TimeUnit.all)],
            ]}
          </Dropdown>
        </div>
        )}
      </div>
  );
}

const SortType = {
  newest: "newest",
  popular: "popular"
}
const TimeUnit = {
  day: "day",
  week: "week",
  month: "month",
  year: "year",
  all: "all"
}