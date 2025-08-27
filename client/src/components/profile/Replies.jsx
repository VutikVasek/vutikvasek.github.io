import { useState } from "react"
import Sorter from "../basic/Sorter";
import CommentThread from "../comment/CommentThread";
import { useLocation } from "react-router-dom";

export default function Replies({userData, search, query, reloadState, defaultTime = "all", defaultSort = "newest", sorter = true, setParams}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sort = queryParams.get('sort') || defaultSort
  const timeframe = queryParams.get('time') || defaultTime

  const [comments, setComments] = useState([]);

  return (
    <>
      <div className="w-[80%] mx-auto">
        {sorter &&
        <div className="flex justify-end">
          <Sorter url={location.pathname} sortBy={sort} time={timeframe} defaultTime={defaultTime} defaultSort={defaultSort} />
        </div>}
        <CommentThread userId={userData?.pfp} query={search ? query : null} comments={comments} setComments={setComments} infiniteScroll={true} reload={userData?.pfp || reloadState} sort={sort} timeframe={timeframe} />
        {setParams && <button onClick={e => setParams("s", "replies")}>Show more</button>}
      </div>
    </>
  )
}