import FullScreen from "./FullScreen";

export default function Confirmation({ text, onConfirm }) {
  return (
    <FullScreen onClick={() => onConfirm(false)}>
      <div className="bg-slate-800 p-6">
        <h1 className="text-xl font-semibold pb-4">Confirmation</h1>
        <p>{text}</p>
        <div className="flex gap-4 pt-2">
          <button onClick={() => onConfirm(false)}>Cancel</button>
          <button onClick={() => onConfirm(true)}>Yes</button>
        </div>
      </div>
    </FullScreen>
  )
}