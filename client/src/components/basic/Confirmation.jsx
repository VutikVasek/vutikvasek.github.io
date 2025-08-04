import FullScreen from "./FullScreen";

export default function Confirmation({ text, onConfirm }) {
  return (
    <FullScreen onClick={() => onConfirm(false)}>
      <div className="bg-white p-10">
        <h1 className="text-xl font-semibold">Confirmation</h1>
        <p>{text}</p>
        <div className="flex gap-4">
          <button onClick={() => onConfirm(false)}>Cancel</button>
          <button onClick={() => onConfirm(true)}>Yes</button>
        </div>
      </div>
    </FullScreen>
  )
}