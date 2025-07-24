import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

export default function Sorter({sort, setSort, timeframe, setTimeframe}) {
  const [showSort, setShowSort] = useState(false);
  const [showTimeframe, setShowTimeframe] = useState(false);
  
  useEffect(() => {
    setShowSort(false);
  }, [sort])
  useEffect(() => {
    setShowTimeframe(false);
  }, [timeframe])
  
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
          <button onClick={() => setShowSort(val => !val)} className="flex items-center">{sort == SortType.newest ? "newest" : "popular"}<MdKeyboardArrowDown /></button>
          {showSort && (
            <div className="w-0 h-0 overflow-visible">
              <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
                <button onClick={() => setSort(SortType.newest)}>newest</button>
                <button onClick={() => setSort(SortType.popular)}>popular</button>
              </div>
            </div>
          )}
        </div>
        {sort == SortType.popular && (
        <div>
          <button onClick={() => setShowTimeframe(val => !val)} className="flex items-center">{getTimeframe()}<MdKeyboardArrowDown /></button>
          {showTimeframe && (
            <div className="w-0 h-0 overflow-visible">
              <div className="bg-gray-300 w-fit p-2 relative flex flex-col whitespace-nowrap">
                <button onClick={() => setTimeframe(TimeUnit.day)}>{getTimeframe(TimeUnit.day)}</button>
                <button onClick={() => setTimeframe(TimeUnit.week)}>{getTimeframe(TimeUnit.week)}</button>
                <button onClick={() => setTimeframe(TimeUnit.month)}>{getTimeframe(TimeUnit.month)}</button>
                <button onClick={() => setTimeframe(TimeUnit.year)}>{getTimeframe(TimeUnit.year)}</button>
                <button onClick={() => setTimeframe(TimeUnit.all)}>{getTimeframe(TimeUnit.all)}</button>
              </div>
            </div>
          )}
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