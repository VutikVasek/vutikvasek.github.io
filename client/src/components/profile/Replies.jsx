import { useState } from "react"
import Sorter from "../basic/Sorter";
import CommentThread from "../comment/CommentThread";
import { useLocation } from "react-router-dom";

export default function Replies({userData}) {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const sort = queryParams.get('sort') || "newest"
  const timeframe = queryParams.get('time') || "all"

  const [comments, setComments] = useState([]);

  return (
    <>
      <div style={{width: '80%'}}>
        <div className="flex justify-end">
          <Sorter url={location.pathname} sortBy={sort} time={timeframe} />
        </div>
        <CommentThread userId={userData.pfp} comments={comments} setComments={setComments} infiniteScroll={true} reload={userData.pfp} sort={sort} timeframe={timeframe} />
      </div>
    </>
  )
}