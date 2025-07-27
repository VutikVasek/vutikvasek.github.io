export default function Confirmation({ text, onConfirm }) {
  return (
    <div className="fixed left-0 top-0 w-screen h-screen bg-black bg-opacity-20 flex items-center justify-center" onClick={() => onConfirm(false)}>
      <div className="bg-gray-200 p-10">
        <h1 className="text-xl font-semibold">Confirmation</h1>
        <p>{text}</p>
        <div className="flex gap-4">
          <button onClick={() => onConfirm(false)}>Cancel</button>
          <button onClick={() => onConfirm(true)}>Yes</button>
        </div>
      </div>
    </div>
  )
}